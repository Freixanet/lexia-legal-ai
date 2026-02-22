/**
 * Sistema de documentos: extracción de texto y procesamiento.
 */

export {
  extractText,
  extractTextFromDOCX,
  extractTextFromImage,
  extractTextFromPDF,
} from './extractor';
export {
  processDocument,
  DOCUMENTS_TABLE,
  STORAGE_BUCKET,
  type DocumentInput,
} from './processor';
