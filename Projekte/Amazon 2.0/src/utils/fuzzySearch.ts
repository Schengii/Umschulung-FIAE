// ============================================================
// Amazon 2.0 – Typo-Tolerant Fuzzy Search & Levenshtein Engine
// ============================================================
import type { Product } from '../types';

/**
 * Computes the Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const str1 = a.toLowerCase().trim();
  const str2 = b.toLowerCase().trim();

  if (str1 === str2) return 0;
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const cost = str2.charAt(i - 1) === str1.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Damerau transposition check
      if (
        i > 1 &&
        j > 1 &&
        str2.charAt(i - 1) === str1.charAt(j - 2) &&
        str2.charAt(i - 2) === str1.charAt(j - 1)
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, (maxLen - distance) / maxLen);
}

export function findBestMatch(term: string, candidates: string[], minScore = 0.50): { match: string; score: number } | null {
  const cleanTerm = term.toLowerCase().trim();
  if (!cleanTerm || cleanTerm.length < 2) return null;

  let bestMatch: string | null = null;
  let highestScore = 0;

  for (const cand of candidates) {
    const cleanCand = cand.toLowerCase().trim();
    if (cleanCand === cleanTerm) return null;

    const score = stringSimilarity(cleanTerm, cleanCand);
    if (score > highestScore && score >= minScore) {
      highestScore = score;
      bestMatch = cand;
    }
  }

  return bestMatch ? { match: bestMatch, score: highestScore } : null;
}

export interface FuzzySearchResult {
  results: Product[];
  didYouMean?: string;
  exactCount: number;
}

/**
 * Performs typo-tolerant fuzzy search across product titles, brands, categories and tags.
 */
export function fuzzySearchProducts(query: string, products: Product[]): FuzzySearchResult {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) {
    return { results: products, exactCount: products.length };
  }

  const terms = cleanQuery.split(/\s+/).filter(t => t.length > 0);

  // 1. Direct / Substring matches
  const exactMatches = products.filter(p => {
    const searchableText = `${p.title} ${p.brand} ${p.category} ${p.subcategory ?? ''} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase();
    return terms.every(term => searchableText.includes(term));
  });

  if (exactMatches.length > 0) {
    return { results: exactMatches, exactCount: exactMatches.length };
  }

  // 2. Fuzzy fallback: collect candidate keywords from all products
  const keywordSet = new Set<string>();
  products.forEach(p => {
    p.brand.split(/\s+/).forEach(w => keywordSet.add(w));
    p.category.split(/[-_]/).forEach(w => keywordSet.add(w));
    (p.tags ?? []).forEach(w => keywordSet.add(w));
    p.title.split(/\s+/).forEach(w => {
      const clean = w.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '');
      if (clean.length >= 3) keywordSet.add(clean);
    });
  });

  const candidates = Array.from(keywordSet);

  // Check best suggestions for query terms
  let bestSuggestion: string | null = null;
  const suggestedTerms = terms.map(term => {
    const match = findBestMatch(term, candidates, 0.50);
    if (match) {
      bestSuggestion = match.match;
      return match.match;
    }
    return term;
  });

  const correctedQuery = suggestedTerms.join(' ');

  // Search with corrected query
  const fuzzyMatches = products.filter(p => {
    const searchableText = `${p.title} ${p.brand} ${p.category} ${(p.tags ?? []).join(' ')}`.toLowerCase();
    
    // Check if any suggested term matches
    if (suggestedTerms.some(term => searchableText.includes(term.toLowerCase()))) return true;
    
    // Word by word similarity
    const words = searchableText.split(/\s+/);
    return terms.some(term => words.some(w => stringSimilarity(term, w) >= 0.65));
  });

  return {
    results: fuzzyMatches,
    didYouMean: bestSuggestion && correctedQuery.toLowerCase() !== cleanQuery ? correctedQuery : undefined,
    exactCount: exactMatches.length,
  };
}
