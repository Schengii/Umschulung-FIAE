import { describe, it, expect } from 'vitest';
import { LinuxMemorySimulator } from './linuxMemoryEngine';

describe('Linux Virtual Memory & Page Fault Engine', () => {
  it('translates virtual address via TLB hit with sub-nanosecond latency', () => {
    const mem = new LinuxMemorySimulator(4096, 2048);
    const res = mem.accessMemory('0x7ffd040');

    expect(res.status).toBe('TLB_HIT');
    expect(res.physicalAddress).toBe('0x12a040');
    expect(res.latencyNs).toBeLessThan(10);
  });

  it('triggers minor page fault when TLB misses but RAM has page', () => {
    const mem = new LinuxMemorySimulator(4096, 2048);
    const res = mem.accessMemory('0x7ffa010');

    expect(res.status).toBe('MINOR_PAGE_FAULT');
    expect(mem.pageFaultStats.minorFaults).toBeGreaterThan(1420);
  });

  it('calculates Linux oom_score correctly and flags high risk processes', () => {
    const mem = new LinuxMemorySimulator(4096, 2048);
    const oom = mem.calculateOomScore(3500, 100);

    expect(oom.oomScore).toBeGreaterThanOrEqual(800);
    expect(oom.riskLevel).toContain('CRITICAL');
  });
});
