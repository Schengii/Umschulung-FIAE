// @ts-check
/**
 * Kern der SQL-Ausführung (alasql). Läuft im Web Worker `sql.worker.js` und,
 * wo es keinen Worker gibt (Node/jsdom in Unit-Tests), direkt im Prozess.
 *
 * alasql übersetzt jede Abfrage per `new Function` in JavaScript. Die
 * Produktions-CSP der Hauptseite verbietet das (`'unsafe-eval'` fehlt
 * bewusst), deshalb darf alasql im Browser nur im Worker laufen, der eine
 * eigene CSP bekommt (siehe `vercel.json`).
 */

/**
 * @typedef {object} SqlStatement
 * @property {string} sql
 * @property {unknown[]} [params]
 *
 * @typedef {object} SqlStatementResult
 * @property {boolean} ok
 * @property {any} [result]
 * @property {string} [error]
 * @property {number} elapsedMs
 */

/**
 * Führt die Anweisungen nacheinander aus. Ein Fehler bricht den Stapel nicht
 * ab, sondern steht im Ergebnis der jeweiligen Anweisung.
 * @param {(sql: string, params?: unknown[]) => any} alasql
 * @param {SqlStatement[]} statements
 * @returns {SqlStatementResult[]}
 */
export function runSqlBatch(alasql, statements) {
  return statements.map(({ sql, params }) => {
    const start = performance.now();
    try {
      const result = alasql(sql, params);
      return { ok: true, result, elapsedMs: performance.now() - start };
    } catch (error) {
      const e = /** @type {Error} */ (error);
      return { ok: false, error: e?.message || String(e), elapsedMs: performance.now() - start };
    }
  });
}
