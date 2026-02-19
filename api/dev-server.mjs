// Lightweight local dev server for testing the API proxy
// Usage: node api/dev-server.mjs
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
} catch { /* no .env */ }

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.url !== '/api/chat' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Read body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());

  const { messages, systemPrompt, jurisdiction, sourcesEnabled, task } = body;

  // --- TASK: TITLE GENERATION ---
  if (task === 'title') {
    const firstMessage = messages[0]?.content;
    if (!firstMessage) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Message required for title generation' }));
    }

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

    try {
      const titleRes = await fetch(GEMINI_API_URL.replace('streamGenerateContent?alt=sse&', 'generateContent?'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBodyTitle),
      });

      if (!titleRes.ok) {
        throw new Error('Gemini API error');
      }

      const data = await titleRes.json();
      const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '') || 'Nueva consulta';
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ title }));
    } catch (err) {
      console.error('Title generation error:', err);
      // Fallback
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ title: messages[0].content.substring(0, 30) + '...' }));
    }
  }

  // Map jurisdiction codes to full names
  const jurisdictionMap = {
    es: 'España (Nacional)',
    cat: 'Cataluña (Autonómica + Estatal)',
    mad: 'Madrid (Autonómica + Estatal)',
    eu: 'Unión Europea',
  };

  const jurisdictionName = jurisdictionMap[jurisdiction] || 'España';
  const sourcesStatus = sourcesEnabled ? 'ACTIVO' : 'DESACTIVADO';

  // Inject configuration into System Prompt
  const configPrompt = `
    
---
### 🛠️ CONFIGURACIÓN DE USUARIO (PRIORIDAD MÁXIMA)
- **Jurisdicción Activa:** ${jurisdictionName}
- **Fuentes Verificadas:** ${sourcesStatus} (Si está ACTIVO, prioriza BOE/CENDOJ/EUR-Lex sobre tu memoria).
---`;

  const finalSystemPrompt = (systemPrompt || '') + configPrompt;

  const contents = messages.map((m) => {
    const parts = [{ text: m.content }];
    
    if (m.attachments && Array.isArray(m.attachments)) {
      m.attachments.forEach((att) => {
        if (att.data && att.type) {
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

  const geminiBody = {
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  };
  if (finalSystemPrompt) {
    geminiBody.systemInstruction = { parts: [{ text: finalSystemPrompt }] };
  }

  try {
    const geminiRes = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      res.writeHead(geminiRes.status, { 'Content-Type': 'application/json' });
      return res.end(err);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(3000, () => {
  console.log('🔌 API dev proxy running on http://localhost:3000');
  console.log('   Forwarding /api/chat → Gemini API');
  console.log(`   API key: ${GEMINI_API_KEY ? '✅ loaded' : '❌ missing'}`);
});
