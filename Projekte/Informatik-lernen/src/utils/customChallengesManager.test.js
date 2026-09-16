// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { validateChallengeStructure, exportChallengesToJson, importChallengesFromJson, saveCustomChallenge, getStoredCustomChallenges, deleteCustomChallenge } from './customChallengesManager';

describe('customChallengesManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const validSample = {
    id: 'test_reverse',
    title: 'String Reverse',
    description: 'Kehre den übergebenen String um.',
    starterCode: 'function reverse(str) { return str.split("").reverse().join(""); }',
    testCases: [
      { input: ['hello'], expected: 'olleh' },
      { input: ['world'], expected: 'dlrow' }
    ]
  };

  it('validiert korrekte Challenge-Strukturen fehlerfrei', () => {
    const res = validateChallengeStructure(validSample);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('erkennt unvollständige oder fehlerhafte Challenge-Definitionen', () => {
    const invalidSample = {
      title: 'A', // Zu kurz
      description: '',
      starterCode: '',
      testCases: []
    };
    const res = validateChallengeStructure(invalidSample);
    expect(res.isValid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('exportiert und importiert Challenges im JSON-Format', () => {
    const json = exportChallengesToJson([validSample]);
    expect(json).toContain('String Reverse');

    const importRes = importChallengesFromJson(json);
    expect(importRes.success).toBe(true);
    expect(importRes.validList.length).toBe(1);
    expect(importRes.validList[0].title).toBe('String Reverse');
  });

  it('speichert, liest und löscht Challenges im LocalStorage', () => {
    const saveRes = saveCustomChallenge(validSample);
    expect(saveRes.success).toBe(true);

    const stored = getStoredCustomChallenges();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('test_reverse');

    const delRes = deleteCustomChallenge('test_reverse');
    expect(delRes.success).toBe(true);
    expect(getStoredCustomChallenges().length).toBe(0);
  });
});
