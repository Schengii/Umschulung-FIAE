import { describe, it, expect } from 'vitest';
import { PostgresPartitioningSimulator } from './postgresPartitioningEngine';

describe('PostgreSQL Declarative Partitioning Engine', () => {
  it('generates valid DDL schema for Range, List and Hash partitioning', () => {
    const sim = new PostgresPartitioningSimulator();
    const rangeSchema = sim.getPartitioningSchema('RANGE');
    expect(rangeSchema.parentDdl).toContain('PARTITION BY RANGE');
    expect(rangeSchema.partitions.length).toBe(2);

    const listSchema = sim.getPartitioningSchema('LIST');
    expect(listSchema.parentDdl).toContain('PARTITION BY LIST');
  });

  it('demonstrates partition pruning in EXPLAIN plan to eliminate unneeded partition scans', () => {
    const sim = new PostgresPartitioningSimulator();
    const res = sim.evaluateQueryPruning('RANGE', '2026-06-15');

    expect(res.scannedPartitions).toEqual(['orders_2026']);
    expect(res.prunedPartitions).toEqual(['orders_2025']);
    expect(res.ioReductionPercent).toBe(50.0);
    expect(res.queryExplain).toContain('Partition Pruned');
  });
});
