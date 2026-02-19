export const config = { runtime: 'edge' };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

// Rate Limiting Configuration
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_SECONDS = 60 * 60; // 1 hour

async function checkRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    // Fail open if KV is not configured (e.g. local dev without env vars)
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn('KV_REST_API_URL or KV_REST_API_TOKEN not found. Rate limiting disabled.');
        return { success: true, limit: RATE_LIMIT, remaining: RATE_LIMIT, reset: 0 };
    }

    const key = `ratelimit:${ip}`;
    try {
        const count = await kv.incr(key);
        if (count === 1) {
            await kv.expire(key, RATE_WINDOW_SECONDS);
        }
        
        const remaining = Math.max(0, RATE_LIMIT - count);
        return {
            success: count <= RATE_LIMIT,
            limit: RATE_LIMIT,
            remaining,
            reset: Date.now() + (RATE_WINDOW_SECONDS * 1000)
        };
    } catch (error) {
        console.error('Rate limit error:', error);
        // Fail open on error to avoid blocking legitimate traffic
        return { success: true, limit: RATE_LIMIT, remaining: RATE_LIMIT, reset: 0 };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  
  const rateLimitResult = await checkRateLimit(clientIp);
  
  res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitResult.reset);

  if (!rateLimitResult.success) {
    return res.status(429).json({ error: 'Demasiadas peticiones. Inténtalo de nuevo en una hora.' });
  }

  try {
    const { messages, systemPrompt, jurisdiction, sourcesEnabled, task } = req.body;

    // --- TASK: TITLE GENERATION ---
    if (task === 'title') {
      const firstMessage = messages[0]?.content;
      if (!firstMessage) return res.status(400).json({ error: 'Message required for title generation' });

      const titlePrompt = `Analiza el siguiente mensaje de usuario y genera un título muy breve, descriptivo y formal (máximo 4 palabras) que resuma la intención legal.
      Ejemplos:
      Input: "Hola, ¿puedo echar a mi inquilino si no paga?" -> "Desahucio por impago"
      Input: "Me han puesto una multa de tráfico y quiero recurrirla" -> "Recurso multa tráfico"
      Input: "Derechos si me despiden estando de baja" -> "Despido durante baja médica"
      
      Mensaje: "${firstMessage.substring(0, 500)}"
      Título:`;

      const geminiBodyTitle = {
        contents: [{ role: 'user', parts: [{ text: titlePrompt }] }],
        generationConfig: {
          temperature: 0.3,
        },
      };

      const titleRes = await fetch(GEMINI_API_URL.replace('streamGenerateContent?alt=sse&', 'generateContent?'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBodyTitle),
      });

      if (!titleRes.ok) {
        return res.status(500).json({ title: messages[0].content.substring(0, 30) + '...' });
      }

      const data = await titleRes.json();
      const title = (data as any).candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '') || 'Nueva consulta';
      return res.status(200).json({ title });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Map jurisdiction codes to full names
    const jurisdictionMap: Record<string, string> = {
      es: 'España (Nacional)',
      cat: 'Cataluña (Autonómica + Estatal)',
      mad: 'Madrid (Autonómica + Estatal)',
      eu: 'Unión Europea',
    };

    const jurisdictionName = jurisdictionMap[jurisdiction as string] || 'España';
    const sourcesStatus = sourcesEnabled ? 'ACTIVO' : 'DESACTIVADO';

    // Inject configuration into System Prompt
    const configPrompt = `
    
---
### 🛠️ CONFIGURACIÓN DE USUARIO (PRIORIDAD MÁXIMA)
- **Jurisdicción Activa:** ${jurisdictionName}
- **Fuentes Verificadas:** ${sourcesStatus} (Si está ACTIVO, prioriza BOE/CENDOJ/EUR-Lex sobre tu memoria).
---`;

    const finalSystemPrompt = (systemPrompt || '') + configPrompt;

    // Limit message length to prevent abuse
    const MAX_MESSAGE_LENGTH = 10000;
    for (const msg of messages) {
      if (typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ error: 'Message content invalid or too long' });
      }
    }

    // Convert to Gemini format
    const contents = messages.map((m: any) => {
      const parts: any[] = [{ text: m.content }];
      
      if (m.attachments && Array.isArray(m.attachments)) {
        m.attachments.forEach((att: any) => {
          if (att.data && att.type) {
             // Basic format check
             const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
             parts.push({
               inlineData: {
                 mimeType: att.type,
                 data: base64Data
               }
             });
          }
        });
      }

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    const geminiBody: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    };

    if (finalSystemPrompt) {
      geminiBody.systemInstruction = {
        parts: [{ text: finalSystemPrompt }],
      };
    }

    // Call Gemini
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, Record<string, string>>)?.error?.message ||
        `Gemini API error: ${geminiResponse.status}`;
      return res.status(geminiResponse.status).json({ error: errorMessage });
    }

    // Stream the SSE response back to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = geminiResponse.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: 'Failed to read Gemini stream' });
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } catch (streamErr) {
      // Client disconnected or stream error
      console.error('Stream error:', streamErr);
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
