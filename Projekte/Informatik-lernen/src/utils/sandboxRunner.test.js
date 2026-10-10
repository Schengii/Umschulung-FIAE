import { describe, it, expect, vi, afterEach } from 'vitest';
import { runInSandbox, runTestCasesInSandbox } from './sandboxRunner';
import { evaluateUserCode, lockDownWorkerScope } from './sandboxEvaluator';
import { createInlineSandboxWorker } from './sandboxTestUtils';

const inline = { createWorker: createInlineSandboxWorker };

// Worker, der sich nie meldet bzw. nach "ready" nie ein Ergebnis liefert -
// so verhält sich ein echter Worker in einer Endlosschleife.
const createSilentWorker = ({ ready }) => () => {
  const worker = { onmessage: null, onerror: null, postMessage: vi.fn(), terminate: vi.fn() };
  if (ready) queueMicrotask(() => worker.onmessage?.({ data: { type: 'ready' } }));
  return worker;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('sandboxEvaluator: evaluateUserCode', () => {
  it('ruft die Hauptfunktion pro Aufruf auf und liefert die Rückgabewerte als JSON', () => {
    const res = evaluateUserCode({
      code: 'function add(a, b) { return a + b; }',
      functionNames: ['add'],
      calls: [[2, 3], [-1, 1]]
    });
    expect(res.ok).toBe(true);
    expect(res.results.map((r) => r.json)).toEqual(['5', '0']);
    expect(res.results.every((r) => r.error === null)).toBe(true);
  });

  it('meldet eine Exception nur für den betroffenen Aufruf', () => {
    const res = evaluateUserCode({
      code: 'function f(x) { if (x === 2) throw new Error("kaputt"); return x; }',
      functionNames: ['f'],
      calls: [[1], [2], [3]]
    });
    expect(res.ok).toBe(true);
    expect(res.results.map((r) => r.error)).toEqual([null, 'kaputt', null]);
  });

  it('meldet Syntaxfehler und eine fehlende Hauptfunktion als ok: false', () => {
    expect(evaluateUserCode({ code: 'function {{{', functionNames: ['f'], calls: [] }).ok).toBe(false);

    const missing = evaluateUserCode({
      code: 'const x = 1;',
      functionNames: ['solve'],
      calls: [],
      missingFunctionMessage: 'Funktion solve() fehlt.'
    });
    expect(missing.ok).toBe(false);
    expect(missing.error).toBe('Funktion solve() fehlt.');
  });

  it('sammelt im Skript-Modus die Konsolenausgabe', () => {
    const res = evaluateUserCode({
      code: 'console.log("a", { b: 1 }); console.warn("w"); console.error("e");'
    });
    expect(res.ok).toBe(true);
    expect(res.logs).toEqual(['a {"b":1}', '[WARN] w', '[ERROR] e']);
  });

  it('behält die bisherige Ausgabe, wenn das Skript mit einer Exception abbricht', () => {
    const res = evaluateUserCode({ code: 'console.log("vorher"); throw new Error("bumm");' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('bumm');
    expect(res.logs).toEqual(['vorher']);
  });

  it('begrenzt die Anzahl der Log-Zeilen', () => {
    const res = evaluateUserCode({ code: 'for (let i = 0; i < 5000; i++) console.log(i);' });
    expect(res.logs.length).toBe(501);
    expect(res.logs[500]).toMatch(/abgeschnitten/);
  });

  it('ignoriert Funktionsnamen, die keine gültigen Bezeichner sind', () => {
    const res = evaluateUserCode({
      code: 'console.log("skript");',
      functionNames: ['x; globalThis.hacked = true; y'],
      calls: [[1]]
    });
    expect(res.ok).toBe(true);
    expect(res.results).toEqual([]);
    expect(globalThis.hacked).toBeUndefined();
  });
});

describe('sandboxEvaluator: lockDownWorkerScope', () => {
  it('sperrt Netzwerk- und Speicher-Schnittstellen auch auf dem Prototyp', () => {
    const proto = { fetch: () => 'netz', indexedDB: {} };
    const scope = Object.create(proto);
    scope.WebSocket = function WebSocket() {};
    scope.performance = { now: () => 0 };

    lockDownWorkerScope(scope);

    expect(scope.fetch).toBeUndefined();
    expect(scope.indexedDB).toBeUndefined();
    expect(scope.WebSocket).toBeUndefined();
    expect(scope.performance).toBeDefined();
    expect(() => { 'use strict'; proto.fetch = () => 'wieder da'; }).toThrow();
  });
});

describe('sandboxRunner: runInSandbox', () => {
  it('liefert das Ergebnis des Workers inklusive dekodierter Rückgabewerte', async () => {
    const res = await runInSandbox(
      { code: 'function twice(x) { return [x, x]; }', functionNames: ['twice'], calls: [[4]] },
      inline
    );
    expect(res.ok).toBe(true);
    expect(res.timedOut).toBe(false);
    expect(res.results[0].value).toEqual([4, 4]);
  });

  it('beendet den Worker nach dem Zeitlimit (Endlosschleife) und meldet timedOut', async () => {
    vi.useFakeTimers();
    let worker;
    const createWorker = () => (worker = createSilentWorker({ ready: true })());

    const pending = runInSandbox({ code: 'while (true) {}' }, { createWorker, timeoutMs: 3000 });
    await vi.advanceTimersByTimeAsync(2999);
    expect(worker.terminate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    const res = await pending;
    expect(res.ok).toBe(false);
    expect(res.timedOut).toBe(true);
    expect(res.error).toMatch(/Zeitlimit von 3 s/);
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('meldet einen Worker, der nie startet, nicht als Endlosschleife', async () => {
    vi.useFakeTimers();
    const pending = runInSandbox(
      { code: '1' },
      { createWorker: createSilentWorker({ ready: false }), startupTimeoutMs: 500 }
    );
    await vi.advanceTimersByTimeAsync(500);

    const res = await pending;
    expect(res.ok).toBe(false);
    expect(res.timedOut).toBe(false);
  });

  it('führt nichts aus, wenn kein Worker erzeugt werden kann', async () => {
    const res = await runInSandbox({ code: '1' }, {
      createWorker: () => { throw new ReferenceError('Worker is not defined'); }
    });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/nicht verfügbar/);
  });

  it('meldet einen Ladefehler des Workers', async () => {
    const createWorker = () => {
      const worker = { onmessage: null, onerror: null, postMessage: vi.fn(), terminate: vi.fn() };
      queueMicrotask(() => worker.onerror?.({ message: 'Skript nicht ladbar' }));
      return worker;
    };
    const res = await runInSandbox({ code: '1' }, { createWorker });
    expect(res).toMatchObject({ ok: false, timedOut: false, error: 'Skript nicht ladbar' });
  });
});

describe('sandboxRunner: runTestCasesInSandbox', () => {
  const testCases = [
    { input: [2, 3], expected: 5 },
    { input: [-1, 1], expected: 0 }
  ];

  it('markiert bestandene und fehlgeschlagene Testfälle', async () => {
    const ok = await runTestCasesInSandbox('function add(a, b) { return a + b; }', ['add'], testCases, inline);
    expect(ok.success).toBe(true);
    expect(ok.allPassed).toBe(true);
    expect(ok.testResults[0]).toMatchObject({ testCaseIndex: 1, actual: 5, expected: 5, passed: true, error: null });

    const wrong = await runTestCasesInSandbox('function add(a, b) { return a - b; }', ['add'], testCases, inline);
    expect(wrong.success).toBe(true);
    expect(wrong.allPassed).toBe(false);
    expect(wrong.testResults.map((tr) => tr.passed)).toEqual([false, false]);
  });

  it('unterscheidet Typen beim Vergleich ("5" ist nicht 5)', async () => {
    const res = await runTestCasesInSandbox('function add(a, b) { return String(a + b); }', ['add'], testCases, inline);
    expect(res.allPassed).toBe(false);
  });

  it('gibt bei Syntaxfehlern success: false und die Fehlermeldung zurück', async () => {
    const res = await runTestCasesInSandbox('function add( {', ['add'], testCases, inline);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.testResults).toEqual([]);
  });
});
