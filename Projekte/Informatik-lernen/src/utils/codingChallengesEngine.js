// @ts-check
/**
 * Coding Challenges Engine
 * In-browser test runner for LeetCode/Exercism style code challenges.
 */
import { runTestCasesInSandbox } from './sandboxRunner';

export const CODING_CHALLENGES = [
  {
    id: 'is_palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Strings & Two Pointers',
    description: 'Schreibe eine Funktion `isPalindrome(str)`, die prüft, ob ein gegebener String vorwärts und rückwärts identisch ist (ignoriere Groß-/Kleinschreibung und Nicht-Buchstaben).',
    starterCode: `function isPalindrome(str) {
  // Dein Code hier
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false },
      { input: [' '], expected: true },
      { input: ['Was it a car or a cat I saw?'], expected: true }
    ]
  },
  {
    id: 'two_sum',
    title: 'Two Sum (Zwei-Summen-Problem)',
    difficulty: 'Easy',
    category: 'Arrays & Hash Maps',
    description: 'Gegeben ist ein Array von Zahlen `nums` und ein `target`. Finde die Indizes zweier Zahlen, deren Summe genau das `target` ergibt.',
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ]
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz Classic',
    difficulty: 'Easy',
    category: 'Logik & Schleifen',
    description: 'Erstelle ein Array mit Zahlen von 1 bis n. Vielfache von 3 durch "Fizz", Vielfache von 5 durch "Buzz" und Vielfache von 3 und 5 durch "FizzBuzz" ersetzen.',
    starterCode: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`,
    testCases: [
      { input: [3], expected: ['1', '2', 'Fizz'] },
      { input: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { input: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] }
    ]
  },
  {
    id: 'binary_search',
    title: 'Binary Search (Binäre Suche)',
    difficulty: 'Medium',
    category: 'Algorithmen',
    description: 'Suche in einem aufsteigend sortierten Array `nums` nach dem Wert `target`. Gib den Index zurück, oder -1, falls der Wert nicht existiert.',
    starterCode: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 }
    ]
  }
];

const CHALLENGE_FUNCTION_NAMES = ['isPalindrome', 'twoSum', 'fizzBuzz', 'search'];

/**
 * Führt den Nutzercode gegen die Testfälle der Challenge aus - in einem
 * Web Worker mit Zeitlimit (siehe sandboxRunner.js), nicht im Haupt-Thread.
 * @param {string} codeString
 * @param {string} challengeId
 * @param {import('./sandboxRunner').SandboxOptions} [sandboxOptions]
 */
export async function runChallengeCode(codeString, challengeId, sandboxOptions = {}) {
  const challenge = CODING_CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) {
    return { success: false, error: 'Challenge nicht gefunden' };
  }

  return runTestCasesInSandbox(codeString, CHALLENGE_FUNCTION_NAMES, challenge.testCases, sandboxOptions);
}
