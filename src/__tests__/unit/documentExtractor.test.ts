// @vitest-environment node
import { Buffer } from 'node:buffer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getText: vi.fn(), getScreenshot: vi.fn(), destroy: vi.fn(),
  recognize: vi.fn(), terminate: vi.fn(),
}));

vi.mock('pdf-parse', () => ({ PDFParse: class {
  getText = mocks.getText;
  getScreenshot = mocks.getScreenshot;
  destroy = mocks.destroy;
} }));
vi.mock('tesseract.js', () => ({ default: {
  createWorker: async () => ({ recognize: mocks.recognize, terminate: mocks.terminate }),
} }));

import { extractTextFromPDF } from '@/lib/documents/extractor';

describe('PDF extraction', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns embedded text without OCR', async () => {
    mocks.getText.mockResolvedValue({ text: 'A sufficiently long legal document.', total: 1 });
    expect(await extractTextFromPDF(Buffer.from('pdf'))).toBe('A sufficiently long legal document.');
    expect(mocks.getScreenshot).not.toHaveBeenCalled();
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
  });

  it('returns empty text when the PDF has no pages', async () => {
    mocks.getText.mockResolvedValue({ text: '', total: 0 });
    expect(await extractTextFromPDF(Buffer.from('pdf'))).toBe('');
    expect(mocks.getScreenshot).not.toHaveBeenCalled();
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
  });

  it('renders scanned pages through the public API and cleans up once', async () => {
    mocks.getText.mockResolvedValue({ text: '', total: 1 });
    mocks.getScreenshot.mockResolvedValue({ pages: [{ data: new Uint8Array([1]) }] });
    mocks.recognize.mockResolvedValue({ data: { text: 'Texto reconocido' } });
    expect(await extractTextFromPDF(Buffer.from('pdf'))).toBe('Texto reconocido');
    expect(mocks.terminate).toHaveBeenCalledTimes(1);
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
  });

  it('releases the parser when extraction fails', async () => {
    mocks.getText.mockRejectedValue(new Error('Invalid PDF'));
    await expect(extractTextFromPDF(Buffer.from('pdf'))).rejects.toThrow('Invalid PDF');
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
  });
});
