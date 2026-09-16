import { describe, it, expect } from 'vitest';
import { PostgresPoolSimulator, SQL_ISOLATION_LEVELS } from './postgresPoolEngine';

describe('PostgreSQL Connection Pool & Isolation Engine', () => {
  it('demonstrates massive RAM savings with PgBouncer transaction pooling', () => {
    const pool = new PostgresPoolSimulator(20, 500);
    pool.poolMode = 'transaction';

    const metrics = pool.calculatePoolMetrics(300);
    expect(metrics.ramSavedPercent).toBeGreaterThan(90);
    expect(metrics.activeServerBackends).toBeLessThanOrEqual(20);
    expect(metrics.queuedClients).toBe(0);
  });

  it('queues excess clients in session pooling mode', () => {
    const pool = new PostgresPoolSimulator(20, 500);
    pool.poolMode = 'session';

    const metrics = pool.calculatePoolMetrics(50);
    expect(metrics.queuedClients).toBe(30); // 50 - 20
  });

  it('provides complete SQL isolation level anomaly definitions', () => {
    expect(SQL_ISOLATION_LEVELS.length).toBe(4);
    const ssi = SQL_ISOLATION_LEVELS.find(l => l.level === 'SERIALIZABLE');
    expect(ssi.serializationAnomaly).toBe(false);
  });
});
