// @ts-check
/**
 * Sandbox Runner
 * Führt Nutzercode in einem Web Worker mit Zeitlimit aus, statt per
 * `new Function` im Haupt-Thread. Zwei Gründe:
 *  1. Eine Endlosschleife (`while (true) {}`) friert sonst den ganzen Tab ein.
 *     Ein Worker lässt sich nach dem Zeitlimit hart beenden.
 *  2. Code im Haupt-Thread hat vollen Zugriff auf DOM und localStorage
 *     (Fortschritt, Notizen). Das betrifft vor allem importierte Custom
 *     Challenges, deren Code nicht vom Nutzer selbst stammt.
 */

/**
 * @typedef {import('./sandboxEvaluator').SandboxPayload} SandboxPayload
 * @typedef {import('./sandboxEvaluator').RawSandboxResult} RawSandboxResult
 *
 * @typedef {object} CallResult
 * @property {unknown} value
 * @property {string | undefined} json
 * @property {string | null} error
 * @property {number} elapsedMs
 *
 * @typedef {object} SandboxResult
 * @property {boolean} ok
 * @property {boolean} timedOut
 * @property {string} [error]
 * @property {string[]} logs
 * @property {CallResult[]} results
 *
 * @typedef {object} SandboxWorkerLike
 * @property {((event: { data: any }) => void) | null} onmessage
 * @property {((event: any) => void) | null} onerror
 * @property {(message: any) => void} postMessage
 * @property {() => void} terminate
 *
 * @typedef {object} SandboxOptions
 * @property {number} [timeoutMs] - Zeitlimit für die Ausführung des Codes.
 * @property {number} [startupTimeoutMs] - Zeitlimit für das Laden des Workers.
 * @property {() => SandboxWorkerLike} [createWorker] - Nur für Tests.
 */

export const DEFAULT_SANDBOX_TIMEOUT_MS = 3000;
const DEFAULT_STARTUP_TIMEOUT_MS = 10000;

/** @returns {SandboxWorkerLike} */
const createSandboxWorker = () => /** @type {SandboxWorkerLike} */ (/** @type {unknown} */ (
  new Worker(new URL('./sandbox.worker.js', import.meta.url), { type: 'module' })
));

/**
 * @param {string} error
 * @param {boolean} [timedOut]
 * @returns {SandboxResult}
 */
const failure = (error, timedOut = false) => ({ ok: false, timedOut, error, logs: [], results: [] });

/**
 * @param {RawSandboxResult} raw
 * @returns {SandboxResult}
 */
const decodeResult = (raw) => ({
  ok: raw.ok,
  timedOut: false,
  error: raw.error,
  logs: raw.logs,
  results: raw.results.map((r) => ({ ...r, value: r.json === undefined ? undefined : JSON.parse(r.json) }))
});

/**
 * Führt den Auftrag in einem frischen Worker aus. Das Promise wird immer
 * erfüllt (nie abgelehnt); Fehler und Zeitüberschreitung stehen im Ergebnis.
 * @param {SandboxPayload} payload
 * @param {SandboxOptions} [options]
 * @returns {Promise<SandboxResult>}
 */
export function runInSandbox(payload, options = {}) {
  const {
    timeoutMs = DEFAULT_SANDBOX_TIMEOUT_MS,
    startupTimeoutMs = DEFAULT_STARTUP_TIMEOUT_MS,
    createWorker = createSandboxWorker
  } = options;

  return new Promise((resolve) => {
    /** @type {SandboxWorkerLike} */
    let worker;
    try {
      worker = createWorker();
    } catch {
      // Kein Rückfall auf den Haupt-Thread: lieber gar nicht ausführen.
      resolve(failure('Die Code-Sandbox (Web Worker) ist in diesem Browser nicht verfügbar.'));
      return;
    }

    let settled = false;
    /** @type {ReturnType<typeof setTimeout>} */
    let timer;

    /** @param {SandboxResult} result */
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    timer = setTimeout(
      () => finish(failure('Die Code-Sandbox konnte nicht geladen werden.')),
      startupTimeoutMs
    );

    let started = false;
    worker.onmessage = (event) => {
      const message = event.data;
      if (message?.type === 'ready' && !started) {
        // Das Zeitlimit zählt erst ab hier, damit eine langsame Verbindung
        // beim Laden des Worker-Skripts nicht als Endlosschleife gilt.
        started = true;
        clearTimeout(timer);
        timer = setTimeout(
          () => finish(failure(
            `Zeitlimit von ${timeoutMs / 1000} s überschritten - vermutlich eine Endlosschleife. Die Ausführung wurde abgebrochen.`,
            true
          )),
          timeoutMs
        );
        worker.postMessage(payload);
      } else if (message?.type === 'result' && started) {
        try {
          finish(decodeResult(message.result));
        } catch {
          finish(failure('Die Sandbox hat ein ungültiges Ergebnis geliefert.'));
        }
      }
    };
    worker.onerror = (event) => {
      event?.preventDefault?.();
      finish(failure(event?.message || 'Die Code-Sandbox konnte nicht gestartet werden.'));
    };
  });
}

/**
 * @typedef {object} TestCase
 * @property {unknown[]} input
 * @property {unknown} expected
 *
 * @typedef {object} TestCaseResult
 * @property {number} testCaseIndex
 * @property {unknown[]} input
 * @property {unknown} expected
 * @property {unknown} actual
 * @property {boolean} passed
 * @property {number} elapsedMs
 * @property {string | null} error
 *
 * @typedef {object} TestRunResult
 * @property {boolean} success - `false`, wenn der Code gar nicht lief
 *   (Syntaxfehler, fehlende Hauptfunktion, Zeitlimit).
 * @property {boolean} allPassed
 * @property {boolean} timedOut
 * @property {string} [error]
 * @property {TestCaseResult[]} testResults
 */

/**
 * Ruft die Hauptfunktion des Nutzercodes mit jedem Testfall auf und
 * vergleicht den Rückgabewert (als JSON) mit dem erwarteten Wert.
 * @param {string} code
 * @param {string[]} functionNames
 * @param {TestCase[]} testCases
 * @param {SandboxOptions & { missingFunctionMessage?: string }} [options]
 * @returns {Promise<TestRunResult>}
 */
export async function runTestCasesInSandbox(code, functionNames, testCases, options = {}) {
  const { missingFunctionMessage, ...sandboxOptions } = options;
  const run = await runInSandbox(
    { code, functionNames, calls: testCases.map((tc) => tc.input), missingFunctionMessage },
    sandboxOptions
  );

  if (!run.ok) {
    return { success: false, allPassed: false, timedOut: run.timedOut, error: run.error, testResults: [] };
  }

  const testResults = testCases.map((tc, i) => {
    const call = run.results[i];
    return {
      testCaseIndex: i + 1,
      input: tc.input,
      expected: tc.expected,
      actual: call.value,
      passed: call.error === null && call.json === JSON.stringify(tc.expected),
      elapsedMs: call.elapsedMs,
      error: call.error
    };
  });

  return {
    success: true,
    allPassed: testResults.every((tr) => tr.passed),
    timedOut: false,
    testResults
  };
}
