import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'career-companion-472510';
const location = process.env.VERTEX_LOCATION || 'us-central1';
const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);

let vertexAI;
let textEmbeddingModel;

function ensureClient() {
  if (vertexAI) return;
  vertexAI = new VertexAI({
    project,
    location,
    googleAuthOptions: { keyFile: credentialsPath }
  });
  if (typeof vertexAI.getTextEmbeddingModel === 'function') {
    textEmbeddingModel = vertexAI.getTextEmbeddingModel({ model: 'text-embedding-005' });
  } else {
    textEmbeddingModel = null;
  }
}

export async function getEmbedding(text) {
  ensureClient();
  try {
    if (!textEmbeddingModel) return simpleHashEmbedding(text);
    const result = await textEmbeddingModel.embedContent({ content: { parts: [{ text }] } });
    const values = result?.embedding?.values || [];
    if (!values.length) throw new Error('Empty embedding');
    return values;
  } catch {
    return simpleHashEmbedding(text);
  }
}

export function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function simpleHashEmbedding(text) {
  const words = String(text || '').toLowerCase().split(/\s+/);
  const dim = 128;
  const vec = new Array(dim).fill(0);
  for (const w of words) { const h = simpleHash(w); vec[h % dim] += 1; }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v*v, 0)) || 1;
  return vec.map(v => v / mag);
}

function simpleHash(str) {
  let h = 0; const s = String(str);
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}


