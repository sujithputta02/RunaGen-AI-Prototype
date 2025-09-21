import { cosineSimilarity } from './embeddings.js';

let faiss;
try { faiss = await import('faiss-node'); } catch { faiss = null; }

export class VectorStore {
  constructor(dim) {
    this.dim = dim;
    this.vectors = [];
    this.items = [];
    this.index = null;
  }

  async add(item, vector) {
    if (!this.dim) this.dim = vector.length;
    this.items.push(item);
    this.vectors.push(vector);
  }

  async build() {
    if (faiss && this.vectors.length) {
      const { IndexFlatIP, normalize_L2 } = faiss;
      this.index = new IndexFlatIP(this.dim);
      normalize_L2(this.vectors);
      this.index.add(this.vectors);
    }
  }

  async topK(queryVec, k = 6) {
    if (faiss && this.index) {
      const { normalize_L2 } = faiss;
      const q = [queryVec.slice()];
      normalize_L2(q);
      const { distances, labels } = this.index.search(q, k);
      const idxs = labels[0].filter(i => i >= 0);
      return idxs.map(i => ({ item: this.items[i], score: distances[0][i] }));
    }
    const scored = this.vectors.map((v, i) => ({ i, score: cosineSimilarity(queryVec, v) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).map(s => ({ item: this.items[s.i], score: s.score }));
  }
}


