import { describe, it, expect } from 'vitest';
import { runChallengeCode } from './codingChallengesEngine';
import { createInlineSandboxWorker } from './sandboxTestUtils';

// In Node gibt es keinen Web Worker - der Inline-Ersatz führt den Code über
// dasselbe Protokoll direkt im Testprozess aus.
const inline = { createWorker: createInlineSandboxWorker };

describe('codingChallengesEngine', () => {
  it('führt korrekten Palindrome-Code erfolgreich aus', async () => {
    const code = `
      function isPalindrome(str) {
        const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean === clean.split('').reverse().join('');
      }
    `;
    const res = await runChallengeCode(code, 'is_palindrome', inline);
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(true);
    expect(res.testResults.length).toBe(4);
  });

  it('erkennt fehlerhaften Code und markiert Testfälle als nicht bestanden', async () => {
    const buggyCode = `
      function isPalindrome(str) {
        return false; // Falsche Implementierung
      }
    `;
    const res = await runChallengeCode(buggyCode, 'is_palindrome', inline);
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(false);
  });

  it('führt Two Sum mit Map O(n) erfolgreich aus', async () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const diff = target - nums[i];
          if (map.has(diff)) return [map.get(diff), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const res = await runChallengeCode(code, 'two_sum', inline);
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(true);
  });

  it('fängt Syntax- und Laufzeitfehler sauber ab', async () => {
    const brokenCode = `function twoSum() { syntax error {{{ `;
    const res = await runChallengeCode(brokenCode, 'two_sum', inline);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('meldet Exceptions einzelner Testfälle, ohne den Lauf abzubrechen', async () => {
    const code = `function twoSum(nums) { if (nums.length === 2) throw new Error('zu kurz'); return [1, 2]; }`;
    const res = await runChallengeCode(code, 'two_sum', inline);
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(false);
    expect(res.testResults.map((tr) => tr.error)).toEqual([null, null, 'zu kurz']);
    expect(res.testResults[1].passed).toBe(true);
  });

  it('gibt für unbekannte Challenges einen Fehler zurück', async () => {
    const res = await runChallengeCode('function x() {}', 'gibt_es_nicht', inline);
    expect(res).toEqual({ success: false, error: 'Challenge nicht gefunden' });
  });
});
