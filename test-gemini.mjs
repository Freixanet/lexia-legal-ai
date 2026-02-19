import https from 'https';

const url = process.env.GEMINI_API_URL.replace('streamGenerateContent?alt=sse&', 'generateContent?');

const titlePrompt = `Analiza el siguiente mensaje de usuario y genera un título muy breve, descriptivo y formal (máximo 4 palabras) que resuma la intención legal.
Ejemplos:
Input: "Hola, ¿puedo echar a mi inquilino si no paga?" -> "Desahucio por impago"
Input: "Me han puesto una multa de tráfico y quiero recurrirla" -> "Recurso multa tráfico"
Input: "Derechos si me despiden estando de baja" -> "Despido durante baja médica"

Mensaje: "Me gustaría saber si mi casero puede echarme de la vivienda por impago del alquiler"
Título:`;

const body = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: titlePrompt }] }],
  generationConfig: { temperature: 0.3 }
});

fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
