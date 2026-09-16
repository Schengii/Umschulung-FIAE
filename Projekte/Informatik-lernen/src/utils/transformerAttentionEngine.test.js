import { describe, it, expect } from 'vitest';
import { calculateAttentionMatrix, sampleNextTokenDistribution, REACT_AGENT_SAMPLE_RUN } from './transformerAttentionEngine';

describe('transformerAttentionEngine', () => {
  it('computes NxN attention matrix with valid probabilities summing to ~1.0', () => {
    const tokens = ['Der', 'Server', 'läuft', 'stabil'];
    const matrix = calculateAttentionMatrix(tokens, 1);
    expect(matrix.length).toBe(4);
    expect(matrix[0].length).toBe(4);
    const rowSum = matrix[0].reduce((a, b) => a + b, 0);
    expect(Math.abs(rowSum - 1.0)).toBeLessThan(0.05);
  });

  it('samples next-token distribution applying temperature and top-k/top-p', () => {
    const candidates = [
      { token: 'PostgreSQL', logit: 4.2 },
      { token: 'MongoDB', logit: 3.1 },
      { token: 'Redis', logit: 2.8 },
      { token: 'SQLite', logit: 1.5 },
      { token: 'Oracle', logit: 0.2 }
    ];

    const distribution = sampleNextTokenDistribution(candidates, 0.5, 3, 0.9);
    expect(distribution.length).toBeLessThanOrEqual(3);
    expect(distribution[0].token).toBe('PostgreSQL');
    expect(distribution[0].prob).toBeGreaterThan(0.5);
  });

  it('verifies ReAct agent sample run structure', () => {
    expect(REACT_AGENT_SAMPLE_RUN.steps.length).toBe(7);
    expect(REACT_AGENT_SAMPLE_RUN.steps[0].type).toBe('Thought');
    expect(REACT_AGENT_SAMPLE_RUN.steps[6].type).toBe('FinalAnswer');
  });
});
