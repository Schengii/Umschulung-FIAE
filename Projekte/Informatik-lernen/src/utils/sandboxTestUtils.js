// Nur für Unit-Tests: In Node/jsdom gibt es keinen Web Worker. Dieser
// Ersatz spricht dasselbe Protokoll wie `sandbox.worker.js`, führt den Code
// aber direkt im Testprozess aus. Wird über die Option `createWorker` an
// `runInSandbox` übergeben und nie von App-Code importiert.
import { evaluateUserCode } from './sandboxEvaluator';

export const createInlineSandboxWorker = () => {
  const worker = {
    onmessage: null,
    onerror: null,
    terminated: false,
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
