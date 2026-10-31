// @ts-check
/**
 * @module sandboxTestUtils
 * @description Test-Harness für Unit- und Komponenten-Tests in Node/jsdom-Umgebungen.
 * Da Node.js / jsdom keine nativen Browser-Web-Worker unterstützt, stellt dieses
 * Modul einen synchronen In-Memory-Worker-Ersatz bereit.
 * 
 * Der Mock-Worker implementiert das Message-Protokoll von `sandbox.worker.js`
 * (`type: 'ready'` und `type: 'result'`), führt den Code über `evaluateUserCode`
 * direkt aus und wird über die Option `{ createWorker: createInlineSandboxWorker }`
 * an `runInSandbox` übergeben.
 */
import { evaluateUserCode } from './sandboxEvaluator';

/**
 * Erzeugt einen leichtgewichtigen Mock-Worker für isolierte Unit-Tests.
 * @returns {{
 *   onmessage: ((ev: { data: any }) => void) | null,
 *   onerror: ((err: any) => void) | null,
 *   terminated: boolean,
 *   postMessage: (payload: any) => void,
 *   terminate: () => void
 * }}
 */
export const createInlineSandboxWorker = () => {
  const worker = {
    /** @type {((ev: { data: any }) => void) | null} */
    onmessage: null,
    onerror: null,
    terminated: false,
    /** @param {any} payload */
    postMessage(payload) {
      queueMicrotask(() => {
        if (!worker.terminated) {
          worker.onmessage?.({ data: { type: 'result', result: evaluateUserCode(payload) } });
        }
      });
    },
    terminate() {
      worker.terminated = true;
    }
  };
  queueMicrotask(() => worker.onmessage?.({ data: { type: 'ready' } }));
  return worker;
};
