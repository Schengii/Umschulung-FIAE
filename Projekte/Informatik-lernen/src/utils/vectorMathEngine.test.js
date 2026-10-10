import { describe, it, expect } from 'vitest';
import {
  calculateVectorMagnitude,
  normalizeVector,
  calculateDotProduct,
  calculateEuclideanDistance,
  calculateManhattanDistance,
  analyzeVectorMetrics
} from './vectorMathEngine';

describe('Vector Math Engine', () => {
  it('calculates magnitude and normalization accurately', () => {
    // 3-4-5 Dreieck
    const vec = [3, 4];
    expect(calculateVectorMagnitude(vec)).toBe(5);

    const norm = normalizeVector(vec);
    expect(norm[0]).toBe(0.6);
    expect(norm[1]).toBe(0.8);
    expect(calculateVectorMagnitude(norm)).toBeCloseTo(1.0, 3);
  });

  it('computes dot product, euclidean and manhattan distance', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];

    // Dot product: 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    expect(calculateDotProduct(a, b)).toBe(32);

    // Euclidean: sqrt(3^2 + 3^2 + 3^2) = sqrt(27) ≈ 5.196
    expect(calculateEuclideanDistance(a, b)).toBeCloseTo(5.196, 2);

    // Manhattan: 3 + 3 + 3 = 9
    expect(calculateManhattanDistance(a, b)).toBe(9);
  });

  it('calculates cosine similarity and angle correctly', () => {
    // Orthogonale Vektoren (90 Grad)
    const orthoA = [1, 0];
    const orthoB = [0, 1];
    const metricsOrtho = analyzeVectorMetrics(orthoA, orthoB);
    expect(metricsOrtho.cosineSimilarity).toBe(0);
    expect(metricsOrtho.angularDegree).toBeCloseTo(90, 0);

    // Identische Richtung (0 Grad)
    const sameA = [2, 4];
    const sameB = [1, 2];
    const metricsSame = analyzeVectorMetrics(sameA, sameB);
    expect(metricsSame.cosineSimilarity).toBeCloseTo(1.0, 3);
    expect(metricsSame.angularDegree).toBeCloseTo(0, 1);
  });
});
