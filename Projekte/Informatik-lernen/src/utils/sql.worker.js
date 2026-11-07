// Web Worker für alasql (siehe sqlWorkerClient.js). Protokoll:
//   Seite -> Worker: { id, statements }   statements: SqlStatement[]
//   Worker -> Seite: { id, results }      results: SqlStatementResult[]
// Der Worker bleibt bestehen, damit Tabellen zwischen Aufträgen erhalten bleiben.
import alasql from 'alasql';
import { runSqlBatch } from './sqlWorkerCore';

self.onmessage = (event) => {
  const { id, statements } = event.data;
  self.postMessage({ id, results: runSqlBatch(alasql, statements) });
};
