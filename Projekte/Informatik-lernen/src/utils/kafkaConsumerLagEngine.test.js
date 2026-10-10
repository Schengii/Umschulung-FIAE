import { describe, it, expect } from 'vitest';
import {
  calculateConsumerLag,
  assignPartitions,
  simulateRebalanceEvent
} from './kafkaConsumerLagEngine';

describe('kafkaConsumerLagEngine', () => {
  it('correctly calculates total and maximum consumer lag per partition', () => {
    const partitions = [
      { partitionId: 0, logEndOffset: 12500, currentOffset: 12500, assignedConsumer: 'pod-1' },
      { partitionId: 1, logEndOffset: 25000, currentOffset: 19500, assignedConsumer: 'pod-2' }, // lag = 5500 -> CRITICAL
      { partitionId: 2, logEndOffset: 8000, currentOffset: 6500, assignedConsumer: 'pod-1' }    // lag = 1500 -> ELEVATED
    ];

    const result = calculateConsumerLag(partitions);
    expect(result.totalLag).toBe(7000);
    expect(result.maxLag).toBe(5500);

    const p0 = result.partitionsWithLag.find(p => p.partitionId === 0);
    const p1 = result.partitionsWithLag.find(p => p.partitionId === 1);
    const p2 = result.partitionsWithLag.find(p => p.partitionId === 2);

    expect(p0?.status).toBe('NORMAL');
    expect(p1?.status).toBe('CRITICAL');
    expect(p2?.status).toBe('ELEVATED');
  });

  it('distributes partitions predictably with RoundRobin assignor', () => {
    const partitionIds = [0, 1, 2, 3, 4, 5];
    const consumerIds = ['c-1', 'c-2'];

    const assignment = assignPartitions(partitionIds, consumerIds, 'ROUND_ROBIN');
    expect(assignment['c-1']).toEqual([0, 2, 4]);
    expect(assignment['c-2']).toEqual([1, 3, 5]);
  });

  it('compares Eager vs. Cooperative Sticky rebalance protocols correctly', () => {
    const eager = simulateRebalanceEvent({
      eventType: 'CONSUMER_JOIN',
      protocol: 'EAGER',
      partitionCount: 12,
      existingConsumers: ['c-1', 'c-2']
    });

    expect(eager.isStopTheWorld).toBe(true);
    expect(eager.revokedPartitionsCount).toBe(12);
    expect(eager.downtimeMs).toBeGreaterThan(1000);

    const cooperative = simulateRebalanceEvent({
      eventType: 'CONSUMER_JOIN',
      protocol: 'COOPERATIVE_STICKY',
      partitionCount: 12,
      existingConsumers: ['c-1', 'c-2']
    });

    expect(cooperative.isStopTheWorld).toBe(false);
    expect(cooperative.revokedPartitionsCount).toBeLessThan(12);
    expect(cooperative.downtimeMs).toBeLessThan(100);
  });
});
