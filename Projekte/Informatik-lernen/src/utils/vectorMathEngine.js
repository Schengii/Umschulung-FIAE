// @ts-check
/**
 * Vector Mathematics & Embedding Distance Engine
 * Didaktische Engine zur Berechnung und Visualisierung von hochdimensionalen Vektordistanzen:
 * - Cosine Similarity (Kosinus-Ähnlichkeit [-1, 1])
 * - Cosine Distance (1 - Cosine Similarity [0, 2])
 * - Euclidean Distance (Euklidische Distanz L2: sqrt(sum((a_i - b_i)^2)))
 * - Manhattan Distance (L1 City-Block: sum(|a_i - b_i|))
 * - Dot Product (Skalarprodukt / Inner Product)
 * - Vektor-Normalisierung (L2 Unit Vector: v / ||v||)
 * - HNSW (Hierarchical Navigable Small World) / Approximate Nearest Neighbor (ANN) Suche
 */

/**
 * Berechnet die L2-Norm (Länge/Betrag) eines Vektors
 * @param {number[]} vec
 * @returns {number}
 */
export function calculateVectorMagnitude(vec) {
  if (!vec || vec.length === 0) return 0;
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Normalisiert einen Vektor auf Einheitslänge (Unit Vector, L2-Norm = 1.0)
 * @param {number[]} vec
 * @returns {number[]}
 */
export function normalizeVector(vec) {
  const mag = calculateVectorMagnitude(vec);
  if (mag === 0) return vec.map(() => 0);
  return vec.map(val => parseFloat((val / mag).toFixed(4)));
}

/**
 * Skalarprodukt (Dot Product) zweier Vektoren: sum(A_i * B_i)
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function calculateDotProduct(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  return parseFloat(vecA.reduce((sum, val, i) => sum + val * vecB[i], 0).toFixed(4));
}

/**
 * Euklidische Distanz (L2-Abstand): sqrt(sum((A_i - B_i)^2))
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function calculateEuclideanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const sumSquaredDiffs = vecA.reduce((sum, val, i) => {
    const diff = val - vecB[i];
    return sum + diff * diff;
  }, 0);
  return parseFloat(Math.sqrt(sumSquaredDiffs).toFixed(4));
}

/**
 * Manhattan Distanz (L1-Abstand): sum(|A_i - B_i|)
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function calculateManhattanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  return parseFloat(vecA.reduce((sum, val, i) => sum + Math.abs(val - vecB[i]), 0).toFixed(4));
}

/**
 * Cosine Similarity: (A • B) / (||A|| * ||B||)
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function calculateCosineSimilarity(vecA, vecB) {
  const magA = calculateVectorMagnitude(vecA);
  const magB = calculateVectorMagnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  const dot = calculateDotProduct(vecA, vecB);
  return parseFloat((dot / (magA * magB)).toFixed(4));
}

/**
 * Vektor-Metrik-Komplettanalyse zwischen zwei Vektoren
 * @param {number[]} vecA
 * @param {number[]} vecB
 */
export function analyzeVectorMetrics(vecA, vecB) {
  const dot = calculateDotProduct(vecA, vecB);
  const cosineSim = calculateCosineSimilarity(vecA, vecB);
  const cosineDist = parseFloat((1 - cosineSim).toFixed(4));
  const euclideanDist = calculateEuclideanDistance(vecA, vecB);
  const manhattanDist = calculateManhattanDistance(vecA, vecB);
  const magA = calculateVectorMagnitude(vecA);
  const magB = calculateVectorMagnitude(vecB);

  return {
    dotProduct: dot,
    cosineSimilarity: cosineSim,
    cosineDistance: cosineDist,
    euclideanDistance: euclideanDist,
    manhattanDistance: manhattanDist,
    magnitudeA: parseFloat(magA.toFixed(4)),
    magnitudeB: parseFloat(magB.toFixed(4)),
    isNormalizedA: Math.abs(magA - 1.0) < 0.01,
    isNormalizedB: Math.abs(magB - 1.0) < 0.01,
    angularDegree: parseFloat((Math.acos(Math.max(-1, Math.min(1, cosineSim))) * (180 / Math.PI)).toFixed(2))
  };
}
