import { describe, it, expect, vi, afterEach } from 'vitest';
import alasql from 'alasql';
import { runSqlBatch } from './sqlWorkerCore';
import { runSql } from './sqlWorkerClient';

describe('runSqlBatch', () => {
  it('führt Anweisungen der Reihe nach aus und gibt Parameter weiter', () => {
    const results = runSqlBatch(alasql, [
      { sql: 'CREATE DATABASE IF NOT EXISTS core_test' },
      { sql: 'USE core_test' },
      { sql: 'CREATE TABLE IF NOT EXISTS t (id INT, name STRING)' },
      { sql: 'DELETE FROM t' },
      { sql: 'INSERT INTO t VALUES (?, ?)', params: [1, 'Alice'] },
      { sql: 'SELECT * FROM t' }
    ]);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(results[5].result).toEqual([{ id: 1, name: 'Alice' }]);
    expect(results[5].elapsedMs).toBeGreaterThanOrEqual(0);
    runSqlBatch(alasql, [{ sql: 'DROP DATABASE IF EXISTS core_test' }]);
  });

  it('meldet einen Fehler je Anweisung, ohne den Stapel abzubrechen', () => {
    const results = runSqlBatch(alasql, [{ sql: 'SELEKT kaputt' }, { sql: 'SELECT 1 AS eins' }]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error).toMatch(/Parse error/);
    expect(results[1]).toMatchObject({ ok: true, result: [{ eins: 1 }] });
  });
});

describe('runSql', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('läuft ohne Worker (Node/jsdom) direkt im Prozess', async () => {
    const [res] = await runSql([{ sql: 'SELECT 2 AS zwei' }]);
    expect(res).toMatchObject({ ok: true, result: [{ zwei: 2 }] });
  });

  it('schickt den Stapel an den Worker und ordnet die Antwort per id zu', async () => {
    const posted = [];
    class FakeWorker {
      constructor() { this.onmessage = null; this.onerror = null; }
      postMessage(message) {
        posted.push(message);
        queueMicrotask(() => this.onmessage({ data: { id: message.id, results: [{ ok: true, result: 'aus dem Worker', elapsedMs: 0 }] } }));
      }
      terminate() {}
    }
    vi.stubGlobal('Worker', FakeWorker);
    vi.resetModules();
    const { runSql: runSqlWithWorker } = await import('./sqlWorkerClient');
    const [res] = await runSqlWithWorker([{ sql: 'SELECT 1' }]);
    expect(res.result).toBe('aus dem Worker');
    expect(posted[0].statements).toEqual([{ sql: 'SELECT 1' }]);
  });

  it('weist offene Aufträge ab, wenn der Worker nicht lädt', async () => {
    class BrokenWorker {
      constructor() { this.onmessage = null; this.onerror = null; }
      postMessage() { queueMicrotask(() => this.onerror({ message: 'blockiert' })); }
      terminate() {}
    }
    vi.stubGlobal('Worker', BrokenWorker);
    vi.resetModules();
    const { runSql: runSqlWithWorker } = await import('./sqlWorkerClient');
    await expect(runSqlWithWorker([{ sql: 'SELECT 1' }])).rejects.toThrow('blockiert');
  });
});
