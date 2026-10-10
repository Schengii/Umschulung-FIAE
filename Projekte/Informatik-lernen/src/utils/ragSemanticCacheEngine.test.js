import { describe, it, expect } from 'vitest';
import {
  calculateCosineSimilarity,
  generateDemoEmbedding,
  querySemanticCache,
  DEFAULT_SEMANTIC_CACHE,
} from './ragSemanticCacheEngine';

describe('ragSemanticCacheEngine', () => {
  it('calculates cosine similarity correctly for identical and orthogonal vectors', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];

    expect(calculateCosineSimilarity(v1, v2)).toBeCloseTo(1.0, 4);
    expect(calculateCosineSimilarity(v1, v3)).toBeCloseTo(0.0, 4);
    expect(calculateCosineSimilarity([], [])).toBe(0);
  });

  it('generates normalized embeddings with 8 dimensions', () => {
    const emb = generateDemoEmbedding('Postgres SQL Datenbank Index');
    expect(emb).toHaveLength(8);
    // Magnitude should be ~1
    const mag = Math.sqrt(emb.reduce((acc, val) => acc + val * val, 0));
    expect(mag).toBeCloseTo(1.0, 2);
  });

  it('hits cache when query is semantically aligned above threshold', () => {
    const result = querySemanticCache(
      'Wie richte ich ein VLAN auf Cisco Switch ein?',
      DEFAULT_SEMANTIC_CACHE,
      0.75
    );

    expect(result.isHit).toBe(true);
    expect(result.matchedEntry?.id).toBe('cache-1');
    expect(result.latencyMs).toBe(8);
    expect(result.estimatedCostSavedUsd).toBeGreaterThan(0);
  });

  it('falls back to LLM inference when query does not match cached knowledge', () => {
    const result = querySemanticCache(
      'Backen von veganen Schokoladenmuffins ohne Zucker',
      DEFAULT_SEMANTIC_CACHE,
      0.88
    );

    expect(result.isHit).toBe(false);
    expect(result.latencyMs).toBeGreaterThan(1000);
  });
});
