import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export async function parsePdfToText(filePath) {
  const buf = await fs.readFile(filePath);
  const data = await pdfParse(buf);
  return String(data.text || '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}


