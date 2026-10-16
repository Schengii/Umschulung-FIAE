// ============================================================
// Amazon 2.0 – On-Device Semantic Vector Search & NLP Engine
// ============================================================
import type { Product } from '../types';

export interface SemanticSearchResult {
  product: Product;
  similarityScore: number; // 0.0 to 1.0
  matchPercentage: number;  // 0 to 100
  matchQuality: 'perfect' | 'high' | 'medium' | 'low';
  matchedConcepts: string[];
}

// Semantic synonyms and concept expansion dictionary
const CONCEPT_DICTIONARY: Record<string, string[]> = {
  klang: ['sound', 'audio', 'kopfhörer', 'musik', 'lautsprecher', 'bass', 'hifi', 'noise', 'cancelling'],
  sound: ['klang', 'audio', 'kopfhörer', 'musik', 'lautsprecher', 'bass'],
  musik: ['sound', 'klang', 'kopfhörer', 'audio', 'speaker', 'bluetooth'],
  arbeit: ['laptop', 'macbook', 'tastatur', 'office', 'monitor', 'maus', 'productivity', 'desk', 'büro'],
  gaming: ['rtx', 'grafikkarte', 'monitor', 'fps', '240hz', 'tastatur', 'playstation', 'rgb', 'shooter'],
  fotografie: ['kamera', 'foto', 'objektiv', 'sensor', 'dslr', 'video', 'aufnahme', 'creator'],
  unterwegs: ['smartphone', 'powerbank', 'uhr', 'smartwatch', 'tragbar', 'akku', 'kabellos'],
  kaffee: ['espresso', 'vollautomat', 'bohnen', 'cappuccino', 'barista', 'küche'],
  schön: ['design', 'elegant', 'edel', 'premium', 'luxus', 'stilvoll', 'modern'],
  fernsehen: ['tv', 'oled', '4k', 'hdr', 'heimkino', 'film', 'display', 'screen'],
};

const STOP_WORDS = new Set([
  'der', 'die', 'das', 'ein', 'eine', 'einen', 'einer', 'und', 'oder', 'aber', 'für', 'mit', 'auf', 'in', 'von',
  'zu', 'im', 'am', 'den', 'dem', 'des', 'ist', 'sind', 'wie', 'als', 'the', 'a', 'an', 'and', 'or', 'for', 'with',
  'in', 'on', 'of', 'to', 'at', 'is', 'are', 'was', 'etwas', 'sehr', 'mir', 'mich', 'gut', 'guter', 'gutes', 'beste'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function expandTokensWithConcepts(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(CONCEPT_DICTIONARY)) {
      if (token.includes(key) || key.includes(token)) {
        synonyms.forEach(s => expanded.add(s));
      }
    }
  }
  return Array.from(expanded);
}

function buildProductEmbedding(product: Product): Map<string, number> {
  const weights: { text: string; weight: number }[] = [
    { text: product.title, weight: 3.5 },
    { text: product.category, weight: 2.5 },
    { text: product.brand || '', weight: 2.0 },
    { text: product.description, weight: 1.5 },
    { text: (product.tags || []).join(' '), weight: 2.5 },
    { text: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k} ${v}`).join(' ') : '', weight: 1.2 },
  ];

  const vector = new Map<string, number>();

  for (const { text, weight } of weights) {
    const rawTokens = tokenize(text);
    const expanded = expandTokensWithConcepts(rawTokens);
    for (const token of expanded) {
      vector.set(token, (vector.get(token) || 0) + weight);
    }
  }

  // Normalize vector magnitude
  let sumSq = 0;
  for (const val of vector.values()) {
    sumSq += val * val;
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  for (const [key, val] of vector.entries()) {
    vector.set(key, val / magnitude);
  }

  return vector;
}

function computeCosineSimilarity(v1: Map<string, number>, v2: Map<string, number>): { score: number; overlaps: string[] } {
  let dotProduct = 0;
  const overlaps: string[] = [];

  for (const [key, val1] of v1.entries()) {
    if (v2.has(key)) {
      const val2 = v2.get(key)!;
      dotProduct += val1 * val2;
      overlaps.push(key);
    }
  }

  return { score: Math.min(1.0, Math.max(0.0, dotProduct)), overlaps };
}

export function performSemanticSearch(query: string, products: Product[], minThreshold = 0.12): SemanticSearchResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const expandedQuery = expandTokensWithConcepts(queryTokens);
  const queryVector = new Map<string, number>();

  for (const token of expandedQuery) {
    const baseWeight = queryTokens.includes(token) ? 2.0 : 1.0;
    queryVector.set(token, baseWeight);
  }

  // Normalize query vector
  let sumSq = 0;
  for (const val of queryVector.values()) {
    sumSq += val * val;
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  for (const [key, val] of queryVector.entries()) {
    queryVector.set(key, val / magnitude);
  }

  const results: SemanticSearchResult[] = [];

  for (const product of products) {
    const productVector = buildProductEmbedding(product);
    const { score, overlaps } = computeCosineSimilarity(queryVector, productVector);

    if (score >= minThreshold) {
      const matchPercentage = Math.round(score * 100);
      let matchQuality: SemanticSearchResult['matchQuality'] = 'low';
      if (matchPercentage >= 75) matchQuality = 'perfect';
      else if (matchPercentage >= 50) matchQuality = 'high';
      else if (matchPercentage >= 30) matchQuality = 'medium';

      results.push({
        product,
        similarityScore: score,
        matchPercentage,
        matchQuality,
        matchedConcepts: overlaps.slice(0, 4),
      });
    }
  }

  // Sort descending by similarity score
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}
