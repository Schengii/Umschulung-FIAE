import { describe, it, expect } from 'vitest';
import { performSemanticSearch } from '../utils/vectorSearch';
import { state } from '../store';

describe('On-Device Semantic Vector Search', () => {
  it('finds audio and headphone products with conceptual queries', () => {
    const results = performSemanticSearch('Ich suche guten klang und bass für unterwegs', state.products);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarityScore).toBeGreaterThan(0.15);
    expect(results[0].matchPercentage).toBeGreaterThan(15);
    expect(['electronics', 'smart-home', 'computers']).toContain(results[0].product.category);
  });

  it('returns empty array when query is meaningless stop words', () => {
    const results = performSemanticSearch('der die das und oder', state.products);
    expect(results).toEqual([]);
  });

  it('returns high match percentage for exact category and concept match', () => {
    const results = performSemanticSearch('Sony Noise Cancelling Kopfhörer', state.products);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.title).toContain('Sony');
    expect(['high', 'perfect']).toContain(results[0].matchQuality);
  });
});
