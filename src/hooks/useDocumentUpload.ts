/**
 * Hook para subida de documentos: drag & drop, progreso, estado y errores amigables.
 */

import { useCallback, useState } from 'react';
import type { ProcessedDocument } from '@/types/documents';

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

export interface UseDocumentUploadOptions {
  /** Base URL del API (p. ej. '' en mismo origen o 'https://api.ejemplo.com'). */
  apiBase?: string;
  /** Obtener ID de usuario para la cabecera X-User-Id. */
  getUserId?: () => string | null;
}

export interface UseDocumentUploadReturn {
  /** Subir un archivo (File). */
  upload: (file: File) => Promise<ProcessedDocument | null>;
  /** Progreso de subida 0–100 (estimado cuando se usa JSON/base64). */
  progress: number;
  /** Estado actual del flujo. */
  status: UploadStatus;
  /** Documento procesado cuando status === 'ready'. */
  document: ProcessedDocument | null;
  /** Mensaje de error amigable cuando status === 'error'. */
  error: string | null;
  /** Limpiar estado para una nueva subida. */
  reset: () => void;
}

const UPLOAD_PATH = '/api/documents/upload';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

function getFriendlyMessage(body: { error?: string; message?: string }): string {
  const msg = body.message || body.error || 'Error desconocido';
  if (msg.includes('No autenticado') || msg.includes('X-User-Id')) return 'Inicia sesión para subir documentos.';
  if (msg.includes('Tipo de archivo no permitido')) return 'Solo se permiten PDF, DOCX, JPEG, PNG y WebP.';
  if (msg.includes('demasiado grande') || msg.includes('25')) return 'El archivo no puede superar 25 MB.';
  if (msg.includes('Contenido no válido') || msg.includes('no coincide')) return 'El archivo parece estar dañado o no coincide con su tipo.';
  if (msg.includes('extraer texto')) return 'No se pudo leer el texto del documento. Prueba con otro archivo.';
  return msg;
}

/**
 * Gestiona la subida de documentos: estado, progreso y errores con mensajes claros.
 */
export function useDocumentUpload(
  options: UseDocumentUploadOptions = {}
): UseDocumentUploadReturn {
  const { apiBase = '', getUserId } = options;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [document, setDocument] = useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setStatus('idle');
    setDocument(null);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<ProcessedDocument | null> => {
      setError(null);
      setDocument(null);
      setProgress(0);
      setStatus('uploading');

      const userId = getUserId?.() ?? null;
      if (!userId) {
        setStatus('error');
        setError('Inicia sesión para subir documentos.');
        return null;
      }

      let base64: string;
      try {
        const buffer = await file.arrayBuffer();
        base64 = arrayBufferToBase64(buffer);
      } catch {
        setStatus('error');
        setError('No se pudo leer el archivo.');
        return null;
      }

      setProgress(30);
      setStatus('processing');

      const url = `${apiBase.replace(/\/$/, '')}${UPLOAD_PATH}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          content: base64,
        }),
      });

      setProgress(100);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setError(getFriendlyMessage(data));
        return null;
      }

      const doc: ProcessedDocument = {
        id: data.id,
        userId,
        name: data.name ?? file.name,
        mimeType: file.type || 'application/octet-stream',
        size: data.size ?? file.size,
        storagePath: '',
        status: data.status ?? 'ready',
        extractedText: data.extractedText ?? null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDocument(doc);
      setStatus('ready');
      return doc;
    },
    [apiBase, getUserId]
  );

  return { upload, progress, status, document, error, reset };
}
