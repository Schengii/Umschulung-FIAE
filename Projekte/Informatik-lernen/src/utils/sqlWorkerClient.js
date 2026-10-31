// @ts-check
/**
 * Schickt SQL-Anweisungen an den alasql-Worker (`sql.worker.js`) und liefert
 * die Ergebnisse als Promise. Alle SQL-Labs teilen sich einen Worker und damit
 * eine alasql-Instanz, wie früher im Haupt-Thread.
 *
 * Ohne `Worker` (Node/jsdom in Unit-Tests) läuft derselbe Kern direkt im
 * Prozess; im Browser nie, weil die CSP dort `new Function` blockiert.
 */

import { runSqlBatch } from './sqlWorkerCore';

/**
 * @typedef {import('./sqlWorkerCore').SqlStatement} SqlStatement
 * @typedef {import('./sqlWorkerCore').SqlStatementResult} SqlStatementResult
 */

/** @type {Worker | null} */
let worker = null;
let nextId = 1;
/** @type {Map<number, { resolve: (r: SqlStatementResult[]) => void, reject: (e: Error) => void }>} */
const pending = new Map();

/** @param {Error} error */
const failAll = (error) => {
  pending.forEach(({ reject }) => reject(error));
  pending.clear();
  worker?.terminate();
  worker = null;
};

const getWorker = () => {
  if (worker) return worker;
  worker = new Worker(new URL('./sql.worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (event) => {
    const { id, results } = event.data;
    pending.get(id)?.resolve(results);
    pending.delete(id);
  };
  worker.onerror = (event) => {
    event.preventDefault?.();
    failAll(new Error(event.message || 'SQL-Worker konnte nicht geladen werden'));
  };
  return worker;
};

/**
 * @param {SqlStatement[]} statements
 * @returns {Promise<SqlStatementResult[]>}
 */
export async function runSql(statements) {
  if (typeof Worker === 'undefined') {
    const { default: alasql } = await import('alasql');
    return runSqlBatch(alasql, statements);
  }
  const target = getWorker();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    target.postMessage({ id, statements });
  });
}
