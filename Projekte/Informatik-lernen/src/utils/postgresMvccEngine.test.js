import { describe, it, expect } from 'vitest';
import { PostgresMvccSimulator } from './postgresMvccEngine';

describe('PostgreSQL MVCC & Autovacuum Engine', () => {
  it('calculates autovacuum threshold formula accurately', () => {
    const sim = new PostgresMvccSimulator(50000);
    // 50 + (0.2 * 50000) = 10050
    expect(sim.getAutovacuumThreshold()).toBe(10050);
  });

  it('triggers autovacuum when dead tuples exceed threshold after updates', () => {
    const sim = new PostgresMvccSimulator(50000);
    const res = sim.executeDml('UPDATE', 8000); // 2500 + 8000 = 10500 > 10050

    expect(res.deadTuples).toBe(10500);
    expect(res.shouldAutovacuum).toBe(true);
  });

  it('distinguishes between standard VACUUM and VACUUM FULL lock types', () => {
    const sim = new PostgresMvccSimulator(50000);
    const standard = sim.runVacuum(false);
    expect(standard.lockType).toContain('ShareUpdateExclusiveLock');

    const full = sim.runVacuum(true);
    expect(full.lockType).toContain('AccessExclusiveLock');
  });
});
