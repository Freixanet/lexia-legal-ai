/**
 * Procesador de documentos: subida a Storage, extracción de texto y estado en BD.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { extractText } from './extractor';
import type { ProcessedDocument } from '@/types/documents';

export const DOCUMENTS_TABLE = 'documents';
export const STORAGE_BUCKET = 'documents';

export interface DocumentInput {
  buffer: Buffer;
  name: string;
  mimeType: string;
  size: number;
}

/**
 * Sube el archivo a Storage, extrae texto y actualiza estado en BD.
 * Estados: uploading → processing → ready | error.
 */
export async function processDocument(
  supabase: SupabaseClient,
  input: DocumentInput,
  userId: string
): Promise<ProcessedDocument> {
  const id = nanoid();
  const ext = input.name.includes('.') ? input.name.split('.').pop() ?? 'bin' : 'bin';
  const storagePath = `${userId}/${id}.${ext}`;

  const now = new Date().toISOString();
  const row = {
    id,
    user_id: userId,
    name: input.name,
    mime_type: input.mimeType,
    size: input.size,
    storage_path: storagePath,
    status: 'uploading',
    extracted_text: null,
    error_message: null,
    created_at: now,
    updated_at: now,
  };

  const { error: insertError } = await supabase.from(DOCUMENTS_TABLE).insert(row);
  if (insertError) {
    throw new Error(`No se pudo registrar el documento: ${insertError.message}`);
  }

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, input.buffer, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (uploadError) {
    await supabase
      .from(DOCUMENTS_TABLE)
      .update({
        status: 'error',
        error_message: `Subida fallida: ${uploadError.message}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    throw new Error(`Error al subir el archivo: ${uploadError.message}`);
  }

  await supabase
    .from(DOCUMENTS_TABLE)
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  let extractedText: string;
  try {
    extractedText = await extractText(input.buffer, input.mimeType);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from(DOCUMENTS_TABLE)
      .update({
        status: 'error',
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    throw new Error(`Error al extraer texto: ${message}`);
  }

  const { error: updateError } = await supabase
    .from(DOCUMENTS_TABLE)
    .update({
      status: 'ready',
      extracted_text: extractedText,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    await supabase
      .from(DOCUMENTS_TABLE)
      .update({
        status: 'error',
        error_message: `Error al guardar: ${updateError.message}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    throw new Error(updateError.message);
  }

  return {
    id,
    userId,
    name: input.name,
    mimeType: input.mimeType,
    size: input.size,
    storagePath,
    status: 'ready',
    extractedText,
    errorMessage: null,
    createdAt: row.created_at,
    updatedAt: new Date().toISOString(),
  };
}
