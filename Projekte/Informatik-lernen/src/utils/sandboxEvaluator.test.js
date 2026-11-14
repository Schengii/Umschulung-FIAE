import { describe, it, expect } from 'vitest';
import { evaluateUserCode, lockDownWorkerScope } from './sandboxEvaluator';

describe('sandboxEvaluator', () => {
  describe('evaluateUserCode - Script Mode', () => {
    it('executes plain script and captures console output', () => {
      const code = `
        console.log('Hello', 'World');
        console.info('Info message');
        console.warn('Warning test');
        console.error('Error test');
        console.debug({ a: 1 });
      `;
      const result = evaluateUserCode({ code });
      expect(result.ok).toBe(true);
      expect(result.results).toEqual([]);
      expect(result.logs).toContain('Hello World');
      expect(result.logs).toContain('Info message');
      expect(result.logs).toContain('[WARN] Warning test');
      expect(result.logs).toContain('[ERROR] Error test');
      expect(result.logs).toContain('{"a":1}');
    });

    it('returns ok: false on script syntax error', () => {
      const result = evaluateUserCode({ code: 'const a = ;' });
      expect(result.ok).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('returns ok: false on script runtime exception', () => {
      const result = evaluateUserCode({ code: 'throw new Error("Kaputt!");' });
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Kaputt!');
    });

    it('truncates console output at 500 log lines', () => {
      const code = `
        for (let i = 0; i < 510; i++) {
          console.log('line ' + i);
        }
      `;
      const result = evaluateUserCode({ code });
      expect(result.ok).toBe(true);
      expect(result.logs.length).toBe(501);
      expect(result.logs[500]).toContain('abgeschnitten');
    });
  });

  describe('evaluateUserCode - Function Mode', () => {
    it('finds and calls the specified function with arguments', () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
      `;
      const result = evaluateUserCode({
        code,
        functionNames: ['add'],
        calls: [
          [2, 3],
          [10, -5]
        ]
      });
      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].json).toBe('5');
      expect(result.results[0].error).toBeNull();
      expect(typeof result.results[0].elapsedMs).toBe('number');
      expect(result.results[1].json).toBe('5');
    });

    it('returns ok: false when function name is not found', () => {
      const code = 'const x = 42;';
      const result = evaluateUserCode({
        code,
        functionNames: ['computeAnswer'],
        missingFunctionMessage: 'Funktion computeAnswer fehlt!'
      });
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Funktion computeAnswer fehlt!');
    });

    it('handles runtime error during function call without breaking the runner', () => {
      const code = `
        function divide(a, b) {
          if (b === 0) throw new Error('Division durch 0!');
          return a / b;
        }
      `;
      const result = evaluateUserCode({
        code,
        functionNames: ['divide'],
        calls: [
          [10, 2],
          [10, 0]
        ]
      });
      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].json).toBe('5');
      expect(result.results[0].error).toBeNull();
      expect(result.results[1].json).toBeUndefined();
      expect(result.results[1].error).toBe('Division durch 0!');
    });
  });

  describe('lockDownWorkerScope', () => {
    it('sets blocked globals to undefined and non-writable on scope object', () => {
      const fakeScope = {
        fetch: () => 'network',
        indexedDB: { open: () => {} },
        WebSocket: class {},
        customProp: 'keep'
      };

      lockDownWorkerScope(fakeScope);

      expect(fakeScope.fetch).toBeUndefined();
      expect(fakeScope.indexedDB).toBeUndefined();
      expect(fakeScope.WebSocket).toBeUndefined();
      expect(fakeScope.customProp).toBe('keep');

      // Check non-writable
      expect(() => {
        fakeScope.fetch = () => 'hacked';
      }).toThrow();
    });

    it('gracefully handles non-configurable properties', () => {
      const fakeScope = {};
      Object.defineProperty(fakeScope, 'fetch', {
        value: () => 'locked',
        configurable: false,
        writable: false
      });

      expect(() => lockDownWorkerScope(fakeScope)).not.toThrow();
    });
  });
});

