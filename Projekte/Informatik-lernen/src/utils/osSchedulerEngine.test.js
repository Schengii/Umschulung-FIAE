import { describe, it, expect } from 'vitest';
import { simulateScheduler, checkBankersSafety, requestBankersResources } from './osSchedulerEngine';

describe('osSchedulerEngine', () => {
  const sampleProcesses = [
    { id: 1, name: 'P1', arrival: 0, burst: 4, priority: 2, color: '#6366f1' },
    { id: 2, name: 'P2', arrival: 1, burst: 3, priority: 1, color: '#10b981' },
    { id: 3, name: 'P3', arrival: 2, burst: 1, priority: 3, color: '#f59e0b' }
  ];

  it('calculates FCFS scheduling correctly', () => {
    const result = simulateScheduler(sampleProcesses, 'FCFS');
    expect(result.timeline.length).toBe(8);
    expect(result.avgTurnaround).toBeGreaterThan(0);
    expect(result.avgWaiting).toBeGreaterThanOrEqual(0);
    expect(result.cpuUtilization).toBe(100);
  });

  it('calculates Round Robin scheduling with quantum 2', () => {
    const result = simulateScheduler(sampleProcesses, 'RR', 2);
    expect(result.timeline.length).toBe(8);
    expect(result.processStats.length).toBe(3);
    const p1 = result.processStats.find(p => p.id === 1);
    expect(p1.finishTime).toBeDefined();
  });

  it('evaluates Banker\'s Algorithm safe state correctly', () => {
    // 3 Resources (A, B, C), Available: [3, 3, 2]
    const available = [3, 3, 2];
    const max = [
      [7, 5, 3], // P0
      [3, 2, 2], // P1
      [9, 0, 2], // P2
      [2, 2, 2], // P3
      [4, 3, 3]  // P4
    ];
    const alloc = [
      [0, 1, 0], // P0
      [2, 0, 0], // P1
      [3, 0, 2], // P2
      [2, 1, 1], // P3
      [0, 0, 2]  // P4
    ];

    const safety = checkBankersSafety(available, max, alloc);
    expect(safety.isSafe).toBe(true);
    expect(safety.safeSequence.length).toBe(5);
  });

  it('handles Banker\'s Algorithm resource request safely', () => {
    const available = [3, 3, 2];
    const max = [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ];
    const alloc = [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ];

    // P1 requests [1, 0, 2]
    const res = requestBankersResources(1, [1, 0, 2], available, max, alloc);
    expect(res.success).toBe(true);

    // Impossible request: exceeds maximum need
    const badRes = requestBankersResources(1, [5, 5, 5], available, max, alloc);
    expect(badRes.success).toBe(false);
  });
});
