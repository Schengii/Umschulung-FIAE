import { describe, it, expect } from 'vitest';
import { PostgresFlamegraphSimulator } from './postgresFlamegraphEngine';

describe('PostgreSQL FlameGraph & Buffer Cache Engine', () => {
  it('calculates query execution metrics and Shared Buffers cache hit ratio accurately', () => {
    const sim = new PostgresFlamegraphSimulator();
    const metrics = sim.calculateMetrics();

    expect(metrics.totalExecutionTimeMs).toBe(142.5);
    expect(metrics.cacheHitRatioPercent).toBeGreaterThan(95);
    expect(metrics.hasSeqScanBottleneck).toBe(true);
  });
});
