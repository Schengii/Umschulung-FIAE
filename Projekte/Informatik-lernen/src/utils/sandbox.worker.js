// Web Worker, in dem Nutzercode läuft (siehe sandboxRunner.js). Protokoll:
//   Worker -> Seite: { type: 'ready' }            sobald das Skript geladen ist
//   Seite -> Worker: SandboxPayload               genau ein Auftrag pro Worker
//   Worker -> Seite: { type: 'result', result }   danach wird der Worker beendet
import { evaluateUserCode, lockDownWorkerScope } from './sandboxEvaluator';

lockDownWorkerScope(self);

self.onmessage = (event) => {
  self.postMessage({ type: 'result', result: evaluateUserCode(event.data) });
};

self.postMessage({ type: 'ready' });
