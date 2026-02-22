/**
 * Extracción de texto desde PDF, DOCX e imágenes.
 * Usa pdf-parse, mammoth y tesseract.js con fallback OCR para PDFs escaneados.
 */

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';

const OCR_MIN_TEXT_LENGTH = 20;
const TESSERACT_LANG = 'spa';

/**
 * Extrae texto de un PDF. Si el texto es mínimo (p. ej. escaneado), usa OCR con tesseract.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    const text = (textResult?.text ?? '').trim();
    if (text.length >= OCR_MIN_TEXT_LENGTH) {
      return text;
    }
    const doc = await parser.load();
    const numPages = doc?.numPages ?? 0;
    if (numPages === 0) return text || '';

    const screenshotResult = await parser.getScreenshot({
      imageBuffer: true,
      scale: 2,
    });
    await parser.destroy();

    const pageImages = screenshotResult?.pages ?? [];
    if (pageImages.length === 0) return text || '';

    const worker = await Tesseract.createWorker(TESSERACT_LANG);
    try {
      const parts: string[] = [];
      for (const page of pageImages) {
        const data = page?.data;
        if (!data?.length) continue;
        const buf = Buffer.from(data);
        const { data: result } = await worker.recognize(buf);
        const pageText = (result?.text ?? '').trim();
        if (pageText) parts.push(pageText);
      }
      const ocrText = parts.join('\n\n');
      return ocrText || text || '';
    } finally {
      await worker.terminate();
    }
  } finally {
    await parser.destroy();
  }
}

/**
 * Extrae texto de un DOCX preservando estructura básica (párrafos, listas).
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = (result?.value ?? '').trim();
  return text;
}

/**
 * Extrae texto de una imagen con tesseract (español).
 * Mejora OCR usando idioma español.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await Tesseract.createWorker(TESSERACT_LANG);
  try {
    const { data } = await worker.recognize(buffer);
    return (data?.text ?? '').trim();
  } finally {
    await worker.terminate();
  }
}

/**
 * Función universal: detecta tipo por mimeType y llama al extractor correcto.
 * Maneja errores de forma controlada y devuelve mensajes claros.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  const type = (mimeType || '').toLowerCase();
  try {
    if (type === 'application/pdf') {
      return await extractTextFromPDF(buffer);
    }
    if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractTextFromDOCX(buffer);
    }
    if (['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      return await extractTextFromImage(buffer);
    }
    throw new Error(`Tipo de documento no soportado: ${mimeType}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('no soportado')) throw err;
    throw new Error(`Error al extraer texto: ${message}`);
  }
}
