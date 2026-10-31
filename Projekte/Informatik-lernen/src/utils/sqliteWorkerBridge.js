// @ts-check
/**
 * SQLite Web Worker Bridge Engine
 * Manages offloading SQL queries and database state to a simulated or real Web Worker,
 * measuring execution time, UI frame stability, and result schemas without jank.
 */

import { SqlSandboxInstance } from './sqlSandboxEngine';

export class SqliteWorkerBridge {
  constructor() {
    /** @type {SqlSandboxInstance|null} */
    this.instance = null;
    this.activePreset = 'ecommerce';
    this.isInitialized = false;
  }

  /**
   * Initializes the engine
   * @param {string} preset
   */
  async init(preset = 'ecommerce') {
    this.activePreset = preset;
    // Lokale Referenz: destroy() kann this.instance während der Wartezeit leeren
    const instance = new SqlSandboxInstance();
    this.instance = instance;
    await instance.loadSeed(preset);
    this.isInitialized = true;
    return {
      success: true,
      tables: Object.keys(await instance.getSchema())
    };
  }

  /**
   * Executes a query asynchronously with simulated or dedicated worker thread offloading
   * @param {string} sql
   * @param {boolean} [simulateWorkerThread]
   */
  async executeQueryAsync(sql, simulateWorkerThread = true) {
    if (!this.instance) {
      await this.init(this.activePreset);
    }

    const startTime = performance.now();

    // alasql läuft ohnehin im Worker (sqlWorkerClient.js); die Verzögerung
    // simuliert für die Lab-Anzeige zusätzlich den Message-Dispatch.
    await new Promise((resolve) => setTimeout(resolve, simulateWorkerThread ? 10 : 0));

    const instance = this.instance;
    if (!instance) {
      return {
        success: false,
        error: 'Database not initialized',
        executionTimeMs: 0,
        rows: [],
        columns: [],
        workerThread: simulateWorkerThread
      };
    }

    const res = await instance.execute(sql);
    const duration = Math.round((performance.now() - startTime) * 100) / 100;
    const rows = res.rows || [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      ...res,
      rows,
      columns,
      executionTimeMs: duration,
      workerThread: simulateWorkerThread,
      schema: await instance.getSchema()
    };
  }

  /**
   * Generates benchmark workload (e.g. 5,000 synthetic rows or heavy joins)
   */
  async runHeavyBenchmark(rowCount = 1000) {
    if (!this.instance) {
      await this.init(this.activePreset);
    }

    const setupSql = `
      CREATE TABLE IF NOT EXISTS benchmark_logs (id INT, tag STRING, val INT, created_at STRING);
    `;
    await this.instance?.execute(setupSql);

    const startTime = performance.now();
    const inserts = Array.from({ length: rowCount }, (_, i) =>
      `INSERT INTO benchmark_logs VALUES (${i}, 'tag_${i % 10}', ${i * 42}, '2026-09-25')`);
    await this.instance?.run(inserts);

    const queryRes = await this.instance?.execute(`
      SELECT tag, COUNT(*) as cnt, AVG(val) as avg_val 
      FROM benchmark_logs 
      GROUP BY tag 
      ORDER BY avg_val DESC
    `);
    const duration = Math.round((performance.now() - startTime) * 100) / 100;

    const rows = queryRes?.rows || [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      success: true,
      rowCount,
      durationMs: duration,
      rows,
      columns
    };
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
    this.isInitialized = false;
  }
}
