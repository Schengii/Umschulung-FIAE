import { describe, it, expect } from 'vitest';
import { levenshteinDistance, stringSimilarity, findBestMatch, fuzzySearchProducts } from '../utils/fuzzySearch';
import { state } from '../store';

describe('Typo-Tolerant Fuzzy Search Suite', () => {
  it('calculates correct Levenshtein & Damerau distance', () => {
    expect(levenshteinDistance('Sony', 'Sony')).toBe(0);
    expect(levenshteinDistance('Snoy', 'Sony')).toBe(1); // 1 transposition
    expect(levenshteinDistance('Apple', 'Aple')).toBe(1);
    expect(levenshteinDistance('', 'test')).toBe(4);
  });

  it('calculates string similarity ratio accurately', () => {
    expect(stringSimilarity('hello', 'hello')).toBe(1.0);
    expect(stringSimilarity('Apple', 'Aple')).toBeGreaterThan(0.7);
    expect(stringSimilarity('xyz', 'abc')).toBe(0.0);
  });

  it('finds best matching candidate for typos', () => {
    const candidates = ['Sony', 'Apple', 'Samsung', 'Logitech', 'Bose'];
    const match = findBestMatch('Snoy', candidates);
    expect(match).not.toBeNull();
    expect(match?.match).toBe('Sony');
  });

  it('provides did-you-mean suggestion on misspelled product searches', () => {
    const res = fuzzySearchProducts('Snoy', state.products);
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.didYouMean).toBeDefined();
    expect(res.didYouMean?.toLowerCase()).toContain('sony');
  });
});
