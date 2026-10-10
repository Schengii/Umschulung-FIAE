// @ts-check
/**
 * Sandbox Evaluator
 * Führt vom Nutzer geschriebenen (oder als Challenge importierten) Code aus.
 *
 * Diese Datei läuft im Web Worker `sandbox.worker.js` - NICHT im
 * Haupt-Thread. Sie ist bewusst frei von DOM- und Modul-Abhängigkeiten,
 * damit dieselbe Logik in Unit-Tests direkt aufgerufen werden kann.
 */

/**
 * @typedef {object} SandboxPayload
 * @property {string} code - Der auszuführende Quelltext.
 * @property {string[] | null} [functionNames] - Kandidaten für die
 *   Hauptfunktion (die erste definierte gewinnt). Leer/`null` = Skript-Modus:
 *   der Code wird einmal ausgeführt, nur die Konsolenausgabe zählt.
 * @property {unknown[][]} [calls] - Argumentlisten, mit denen die
 *   Hauptfunktion nacheinander aufgerufen wird.
 * @property {string} [missingFunctionMessage]
 *
 * @typedef {object} RawCallResult
 * @property {string | undefined} json - JSON des Rückgabewerts (`undefined`
 *   bei `undefined`/Funktionen, wie bei `JSON.stringify`).
 * @property {string | null} error
 * @property {number} elapsedMs
 *
 * @typedef {object} RawSandboxResult
 * @property {boolean} ok - `false` bei Syntaxfehler, fehlender Hauptfunktion
 *   oder (im Skript-Modus) einer Laufzeit-Exception.
 * @property {string} [error]
 * @property {string[]} logs
 * @property {RawCallResult[]} results
 */

const MAX_LOG_LINES = 500;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;

/**
 * @param {unknown} err
 * @returns {string}
 */
const errorMessage = (err) => (err instanceof Error && err.message ? err.message : String(err));

/**
 * @param {unknown} value
 * @returns {string}
 */
const formatLogArgument = (value) => {
  if (typeof value !== 'object' || value === null) return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * @param {SandboxPayload} payload
 * @returns {RawSandboxResult}
 */
export function evaluateUserCode(payload) {
  /** @type {string[]} */
  const logs = [];
  /** @param {string} prefix */
  const makeLogger = (prefix) => (/** @type {unknown[]} */ ...args) => {
    if (logs.length > MAX_LOG_LINES) return;
    logs.push(logs.length === MAX_LOG_LINES
      ? `… Ausgabe nach ${MAX_LOG_LINES} Zeilen abgeschnitten.`
      : prefix + args.map(formatLogArgument).join(' '));
  };
  const sandboxConsole = {
    log: makeLogger(''),
    info: makeLogger(''),
    debug: makeLogger(''),
    warn: makeLogger('[WARN] '),
    error: makeLogger('[ERROR] ')
  };

  const functionNames = (payload.functionNames || []).filter((name) => IDENTIFIER_PATTERN.test(name));

  try {
    if (functionNames.length === 0) {
      new Function('console', payload.code)(sandboxConsole);
      return { ok: true, logs, results: [] };
    }

    const lookup = functionNames
      .map((name) => `if (typeof ${name} === 'function') return ${name};`)
      .join('\n');
    const missingMessage = payload.missingFunctionMessage || 'Keine gültige Hauptfunktion gefunden.';
    const userFunction = new Function(
      'console',
      `${payload.code};\n${lookup}\nthrow new Error(${JSON.stringify(missingMessage)});`
    )(sandboxConsole);

    const results = (payload.calls || []).map((args) => {
      const startTime = performance.now();
      /** @type {string | undefined} */
      let json;
      /** @type {string | null} */
      let error = null;
      try {
        json = JSON.stringify(userFunction(...args));
      } catch (err) {
        error = errorMessage(err);
      }
      return { json, error, elapsedMs: Number((performance.now() - startTime).toFixed(2)) };
    });

    return { ok: true, logs, results };
  } catch (err) {
    return { ok: false, error: errorMessage(err), logs, results: [] };
  }
}

// Schnittstellen, über die Code aus dem Worker heraus Daten der App lesen
// oder nach außen senden könnte. Ein Worker hat ohnehin weder DOM noch
// localStorage - IndexedDB (dort liegt das Fortschritts-Backup), Netzwerk
// und verschachtelte Worker (mit wieder frischem, ungesperrtem Scope) aber
// schon.
const BLOCKED_WORKER_GLOBALS = [
  'indexedDB', 'caches', 'navigator',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'WebTransport', 'EventSource',
  'importScripts', 'BroadcastChannel', 'Worker', 'SharedWorker'
];

/**
 * Sperrt die oben genannten Schnittstellen im Worker-Scope, bevor fremder
 * Code läuft. Das ist Härtung, keine vollständige Isolation (dynamisches
 * `import()` z. B. lässt sich so nicht unterbinden) - der eigentliche Schutz
 * ist, dass der Code im Worker weder an die Seite noch an localStorage
 * herankommt und nach dem Zeitlimit hart beendet wird.
 * @param {object} scope
 */
export function lockDownWorkerScope(scope) {
  for (const name of BLOCKED_WORKER_GLOBALS) {
    for (let target = scope; target; target = Object.getPrototypeOf(target)) {
      if (!Object.prototype.hasOwnProperty.call(target, name)) continue;
      try {
        Object.defineProperty(target, name, { value: undefined, writable: false, configurable: false });
      } catch {
        // Eigenschaft ist nicht konfigurierbar - dann bleibt sie, wie sie ist.
      }
    }
  }
}
