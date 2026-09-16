import { describe, it, expect } from 'vitest';
import { runChallengeCode } from './codingChallengesEngine';

describe('codingChallengesEngine', () => {
  it('führt korrekten Palindrome-Code erfolgreich aus', () => {
    const code = `
      function isPalindrome(str) {
        const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean === clean.split('').reverse().join('');
      }
    `;
    const res = runChallengeCode(code, 'is_palindrome');
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(true);
    expect(res.testResults.length).toBe(4);
  });

  it('erkennt fehlerhaften Code und markiert Testfälle als nicht bestanden', () => {
    const buggyCode = `
      function isPalindrome(str) {
        return false; // Falsche Implementierung
      }
    `;
    const res = runChallengeCode(buggyCode, 'is_palindrome');
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(false);
  });

  it('führt Two Sum mit Map O(n) erfolgreich aus', () => {
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
    const res = runChallengeCode(code, 'two_sum');
    expect(res.success).toBe(true);
    expect(res.allPassed).toBe(true);
  });

  it('fängt Syntax- und Laufzeitfehler sauber ab', () => {
    const brokenCode = `function twoSum() { syntax error {{{ `;
    const res = runChallengeCode(brokenCode, 'two_sum');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
