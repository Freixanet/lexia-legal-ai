import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../../src/types/documents';
import { processDocument } from '../../src/lib/documents/processor';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Magic bytes para validación básica (PDF, DOCX, JPEG, PNG). */
const SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    0x50, 0x4b, 0x03, 0x04,
  ],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

function checkMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const sig = SIGNATURES[mimeType];
  if (!sig) return true;
  for (let i = 0; i < sig.length; i++) {
    if (buffer[i] !== sig[i]) return false;
  }
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const userId =
    (req.headers['x-user-id'] as string)?.trim() ||
    (req.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '').trim();
  if (!userId) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Envía X-User-Id o Authorization Bearer con el identificador de usuario.',
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: 'Configuración del servidor incompleta',
      message: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  let body: { name?: string; mimeType?: string; content?: string };
  try {
    body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  } catch {
    return res.status(400).json({
      error: 'Cuerpo inválido',
      message: 'El cuerpo debe ser JSON con name, mimeType y content (base64).',
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
  const content = body.content;

  if (!name) {
    return res.status(400).json({
      error: 'Nombre requerido',
      message: 'El campo "name" es obligatorio.',
    });
  }
  if (!mimeType) {
    return res.status(400).json({
      error: 'Tipo de archivo requerido',
      message: 'El campo "mimeType" es obligatorio.',
    });
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as any)) {
    return res.status(400).json({
      error: 'Tipo de archivo no permitido',
      message: `Tipos permitidos: PDF, DOCX, JPEG, PNG, WebP. Recibido: ${mimeType}`,
    });
  }
  if (typeof content !== 'string' || !content) {
    return res.status(400).json({
      error: 'Contenido requerido',
      message: 'El campo "content" (base64) es obligatorio.',
    });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(content, 'base64');
  } catch {
    return res.status(400).json({
      error: 'Contenido inválido',
      message: 'El campo "content" debe ser base64 válido.',
    });
  }

  if (buffer.length > MAX_DOCUMENT_SIZE_BYTES) {
    return res.status(400).json({
      error: 'Archivo demasiado grande',
      message: `Tamaño máximo: ${MAX_DOCUMENT_SIZE_BYTES / 1024 / 1024} MB.`,
    });
  }

  if (!checkMagicBytes(buffer, mimeType)) {
    return res.status(400).json({
      error: 'Contenido no válido',
      message: 'El contenido del archivo no coincide con su tipo declarado.',
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const doc = await processDocument(
      supabase,
      { buffer, name, mimeType, size: buffer.length },
      userId
    );
    return res.status(200).json({
      id: doc.id,
      status: doc.status,
      name: doc.name,
      size: doc.size,
      extractedTextLength: doc.extractedText?.length ?? 0,
    });
  } catch (err) {
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Error al procesar el documento',
      message: isProd ? 'Ha ocurrido un error. Inténtalo más tarde.' : (err instanceof Error ? err.message : String(err)),
    });
  }
}
