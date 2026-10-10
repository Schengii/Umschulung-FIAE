import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteWorkerBridge } from './sqliteWorkerBridge';

describe('SqliteWorkerBridge Engine', () => {
  let bridge;

  beforeEach(() => {
    bridge = new SqliteWorkerBridge();
  });

  afterEach(() => {
    bridge.destroy();
  });

  it('initializes with default seed and tables', async () => {
    const initRes = await bridge.init('ecommerce');
    expect(initRes.success).toBe(true);
    expect(initRes.tables.length).toBeGreaterThan(0);
  });

  it('executes an asynchronous query via worker bridge', async () => {
    await bridge.init('ecommerce');
    const res = await bridge.executeQueryAsync('SELECT name, city FROM customers LIMIT 3');
    expect(res.success).toBe(true);
    expect(res.rows.length).toBe(3);
    expect(res.workerThread).toBe(true);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('runs a heavy benchmark insert and aggregation without errors', async () => {
    await bridge.init('ecommerce');
    const bench = await bridge.runHeavyBenchmark(50);
    expect(bench.success).toBe(true);
    expect(bench.rowCount).toBe(50);
    expect(bench.rows.length).toBeGreaterThan(0);
  });
});
