export const config = { runtime: 'edge' };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { z } from 'zod';

const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES = 100;
const MAX_SYSTEM_PROMPT_LENGTH = 20000;

const attachmentSchema = z.object({
  type: z.string().max(100),
  data: z.string().max(5_000_000),
});

const chatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'assistant']),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  attachments: z.array(attachmentSchema).optional(),
});

const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_MESSAGES),
  systemPrompt: z.string().max(MAX_SYSTEM_PROMPT_LENGTH).optional(),
  jurisdiction: z.string().max(20).optional(),
  sourcesEnabled: z.boolean().optional(),
  task: z.enum(['title', 'chat']).optional(),
});

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

  // Rate limiting & Security: Robust IP extraction
  // 1. Prioridad: Cabecera inmutable de Vercel (x-real-ip)
  let clientIp = (req.headers['x-real-ip'] as string)?.trim();

  // 2. Fallback: Parseo estricto de x-forwarded-for de derecha a izquierda
  if (!clientIp) {
    const xff = req.headers['x-forwarded-for'] as string;
    if (xff) {
      const ips = xff.split(',').map(ip => ip.trim()).reverse();
      // Eliminar IPs de rango privado o loopback
      const isPrivate = (ip: string) => /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|::1)/.test(ip);
      clientIp = ips.find(ip => !isPrivate(ip)) || ips[0];
    }
  }
  
  clientIp = clientIp || 'unknown';
  
  const rateLimitResult = await checkRateLimit(clientIp);
  
  res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitResult.reset);

  if (!rateLimitResult.success) {
    return res.status(429).json({ error: 'Demasiadas peticiones. Inténtalo de nuevo en una hora.' });
  }

  try {
    const parsed = chatBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstForm = flat.formErrors?.[0];
      const firstField = Object.values(flat.fieldErrors ?? {}).flat()[0];
      const msg = firstForm ?? firstField ?? 'Invalid request body';
      return res.status(400).json({ error: typeof msg === 'string' ? msg : 'Invalid request body' });
    }
    const { messages, systemPrompt, jurisdiction, sourcesEnabled, task } = parsed.data;

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

      const titleUrl = new URL(GEMINI_API_URL);
      titleUrl.pathname = titleUrl.pathname.replace('streamGenerateContent', 'generateContent');
      titleUrl.searchParams.delete('alt');

      const titleRes = await fetch(titleUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBodyTitle),
      });

      if (!titleRes.ok) {
        // 206 Partial Content indicates a fallback/truncated title was generated due to upstream failure
        return res.status(206).json({ title: messages[0].content.substring(0, 30) + '...' });
      }

      const data = await titleRes.json();
      const title = (data as any).candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '') || 'Nueva consulta';
      return res.status(200).json({ title });
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

    // Convert to Gemini format (roles already validated by Zod)
    const contents = messages.map((m) => {
      const parts: { text: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: m.content }];
      if (m.attachments?.length) {
        for (const att of m.attachments) {
          const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
          parts.push({ inlineData: { mimeType: att.type, data: base64Data } });
        }
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

    // Instanciar AbortController para propagar la cancelación de la petición SSE
    const controller = new AbortController();
    req.on('close', () => {
      controller.abort();
    });

    // Call Gemini
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
      signal: controller.signal,
    });

    if (!geminiResponse.ok) {
      const isProd = process.env.NODE_ENV === 'production';
      const errorData = await geminiResponse.json().catch(() => ({}));
      const errorMessage = isProd
        ? 'Error al conectar con el servicio. Inténtalo más tarde.'
        : ((errorData as Record<string, Record<string, string>>)?.error?.message ||
           `Gemini API error: ${geminiResponse.status}`);
      return res.status(geminiResponse.status >= 500 ? 502 : geminiResponse.status).json({ error: errorMessage });
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
      if (process.env.NODE_ENV !== 'production') {
        console.error('Stream error:', streamErr);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Proxy error:', err);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
