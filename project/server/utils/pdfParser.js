import fs from 'fs/promises';

export async function parsePdfToText(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buf);
    return String(data.text || '')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
  } catch (error) {
    console.warn('PDF parse failed, returning empty text:', error?.message || error);
    return '';
  }
}


