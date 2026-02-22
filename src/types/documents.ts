/**
 * Tipos para el sistema de documentos de Lexia.
 */

/** Estado del documento en el pipeline de procesamiento. */
export type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

/** Documento procesado: subido, con texto extraído y estado en BD. */
export interface ProcessedDocument {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  status: DocumentStatus;
  extractedText: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Tipos MIME permitidos para subida. */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

/** Límite de tamaño para subida (25 MB). */
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;
