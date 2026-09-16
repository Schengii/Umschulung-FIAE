import { describe, it, expect } from 'vitest';
import { PostgresWalSimulator } from './postgresWalEngine';

describe('PostgreSQL WAL & LSN Engine', () => {
  it('converts hex LSN to 64-bit byte offset accurately', () => {
    const sim = new PostgresWalSimulator();
    const bytes = sim.lsnToBytes('0/1000');
    expect(bytes).toBe(4096);
  });

  it('calculates byte and megabyte replication lag between Primary and Standby LSNs', () => {
    const sim = new PostgresWalSimulator();
    const res = sim.calculateLag('0/2000000', '0/1000000');

    expect(res.lagBytes).toBe(16777216); // 16 MB
    expect(res.lagMb).toBe(16.0);
    expect(res.isSynchronized).toBe(false);
  });
});
