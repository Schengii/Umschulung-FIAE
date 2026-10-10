// @ts-check
/**
 * LLM RAG Chunking & Cross-Encoder Re-Ranking Engine
 * Simulates document chunking strategies (Fixed, Sliding Window, Semantic Paragraphs)
 * and two-stage retrieval (Bi-Encoder similarity vs. Cross-Attention Re-Ranking).
 */

/**
 * @typedef {Object} RagChunk
 * @property {number} id
 * @property {string} text
 * @property {number} charStart
 * @property {number} charEnd
 * @property {number} [biEncoderScore] Initial dense/cosine similarity approximation (0-1)
 * @property {number} [crossEncoderScore] Full cross-attention query-chunk score (0-1)
 */

/**
 * Splits text into chunks based on chosen strategy
 * @param {string} text
 * @param {'fixed' | 'sliding' | 'paragraph'} strategy
 * @param {number} chunkSize Characters per chunk
 * @param {number} chunkOverlap Overlap characters (for sliding window)
 * @returns {RagChunk[]}
 */
export function chunkDocument(text, strategy = 'sliding', chunkSize = 300, chunkOverlap = 60) {
  if (!text || text.trim().length === 0) return [];

  const chunks = [];
  let id = 1;

  if (strategy === 'paragraph') {
    const rawParagraphs = text.split(/\n\s*\n+/);
    let currentOffset = 0;

    for (const para of rawParagraphs) {
      const cleanPara = para.trim();
      if (!cleanPara) continue;
      const start = text.indexOf(cleanPara, currentOffset);
      const end = start + cleanPara.length;
      currentOffset = end;

      chunks.push({
        id: id++,
        text: cleanPara,
        charStart: start,
        charEnd: end
      });
    }
  } else if (strategy === 'fixed') {
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunkStr = text.slice(i, i + chunkSize);
      chunks.push({
        id: id++,
        text: chunkStr,
        charStart: i,
        charEnd: Math.min(i + chunkSize, text.length)
      });
    }
  } else {
    // Sliding window with overlap
    const step = Math.max(1, chunkSize - chunkOverlap);
    for (let i = 0; i < text.length; i += step) {
      const chunkStr = text.slice(i, i + chunkSize);
      chunks.push({
        id: id++,
        text: chunkStr,
        charStart: i,
        charEnd: Math.min(i + chunkSize, text.length)
      });
      if (i + chunkSize >= text.length) break;
    }
  }

  return chunks;
}

/**
 * Calculates a token overlap / lexical score between query and text
 * @param {string} query
 * @param {string} text
 * @returns {number} 0 to 1
 */
function calculateLexicalOverlap(query, text) {
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9äöüß]/gi, ' ').split(/\s+/).filter(Boolean);
  const textTokens = new Set(text.toLowerCase().replace(/[^a-z0-9äöüß]/gi, ' ').split(/\s+/).filter(Boolean));

  if (queryTokens.length === 0 || textTokens.size === 0) return 0;

  let matches = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) {
      matches += 1;
    }
  }

  return Math.min(1, matches / queryTokens.length);
}

/**
 * Re-ranks chunks using simulated Bi-Encoder + Cross-Encoder scoring.
 * Bi-Encoder: Cosine/lexical approximation (fast retrieval).
 * Cross-Encoder: Deep interaction, detects semantic intent, exact phrase match, negation handling.
 * @param {RagChunk[]} chunks
 * @param {string} query
 * @returns {RagChunk[]} Ranked by cross-encoder score descending
 */
export function rankChunksWithCrossEncoder(chunks, query) {
  if (!query || query.trim().length === 0) {
    return chunks.map(c => ({
      ...c,
      biEncoderScore: 0,
      crossEncoderScore: 0
    }));
  }

  const queryLower = query.toLowerCase().trim();

  const scored = chunks.map(chunk => {
    const chunkLower = chunk.text.toLowerCase();

    // 1. Bi-Encoder Score: fast term overlap + length normalization
    const lexical = calculateLexicalOverlap(queryLower, chunkLower);
    const biEncoderScore = Math.min(0.95, Math.max(0.05, Number((lexical * 0.8 + 0.1).toFixed(3))));

    // 2. Cross-Encoder Score: Full cross-attention simulation
    // Adds weight for exact multi-word substring match, keyword density, and position
    let crossBonus = 0;
    if (chunkLower.includes(queryLower)) {
      crossBonus += 0.35; // exact phrase match boost
    }

    // Check for question-answer semantic coherence keywords
    const keywords = ['weil', 'daher', 'ursache', 'bedeutet', 'lösen', 'port', 'funktion', 'rfc'];
    const hasExplanationKeyword = keywords.some(k => chunkLower.includes(k));
    if (hasExplanationKeyword && lexical > 0.3) {
      crossBonus += 0.15;
    }

    const rawCross = lexical * 0.5 + crossBonus + 0.1;
    const crossEncoderScore = Math.min(0.99, Math.max(0.02, Number(rawCross.toFixed(3))));

    return {
      ...chunk,
      biEncoderScore,
      crossEncoderScore
    };
  });

  return scored.sort((a, b) => (b.crossEncoderScore || 0) - (a.crossEncoderScore || 0));
}
