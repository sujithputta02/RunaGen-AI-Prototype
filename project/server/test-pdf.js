import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001';

async function main() {
  const pdfPath = path.resolve('./test/data/05-versions-space.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error('Test PDF not found at', pdfPath);
    process.exit(1);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(pdfPath));

  const res = await fetch(`${API_BASE}/test-pdf-parsing`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  try {
    console.log('Body JSON:', JSON.parse(text));
  } catch {
    console.log('Body Text:', text);
  }
}

main().catch(err => {
  console.error('Request failed:', err);
  process.exit(1);
});


