/**
 * Custom Challenge Creator & Storage Manager
 * Allows creating, validating, exporting and importing custom code challenges.
 */



export const CUSTOM_CHALLENGES_STORAGE_KEY = 'it_game_custom_challenges';

export function getStoredCustomChallenges() {
  try {
    const raw = localStorage.getItem(CUSTOM_CHALLENGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomChallenge(challenge) {
  const existing = getStoredCustomChallenges();
  const index = existing.findIndex(c => c.id === challenge.id);
  
  if (index >= 0) {
    existing[index] = challenge;
  } else {
    existing.push(challenge);
  }

  try {
    localStorage.setItem(CUSTOM_CHALLENGES_STORAGE_KEY, JSON.stringify(existing));
    return { success: true, all: existing };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

export function deleteCustomChallenge(challengeId) {
  const existing = getStoredCustomChallenges();
  const filtered = existing.filter(c => c.id !== challengeId);
  try {
    localStorage.setItem(CUSTOM_CHALLENGES_STORAGE_KEY, JSON.stringify(filtered));
    return { success: true, all: filtered };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

export function validateChallengeStructure(challenge) {
  const errors = [];
  if (!challenge.title || challenge.title.trim().length < 3) {
    errors.push('Titel muss mindestens 3 Zeichen lang sein.');
  }
  if (!challenge.description || challenge.description.trim().length < 5) {
    errors.push('Beschreibung muss mindestens 5 Zeichen lang sein.');
  }
  if (!challenge.starterCode || challenge.starterCode.trim().length < 5) {
    errors.push('Starter-Code fehlt oder ist ungültig.');
  }
  if (!Array.isArray(challenge.testCases) || challenge.testCases.length === 0) {
    errors.push('Mindestens 1 Testfall ist erforderlich.');
  } else {
    challenge.testCases.forEach((tc, idx) => {
      if (!Array.isArray(tc.input)) {
        errors.push(`Testfall #${idx + 1}: 'input' muss ein Array von Argumenten sein.`);
      }
      if (tc.expected === undefined) {
        errors.push(`Testfall #${idx + 1}: 'expected' fehlt.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function exportChallengesToJson(challenges) {
  return JSON.stringify(challenges, null, 2);
}

export function importChallengesFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const validList = [];
    const invalidList = [];

    list.forEach(item => {
      const validation = validateChallengeStructure(item);
      if (validation.isValid) {
        validList.push({
          ...item,
          id: item.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        });
      } else {
        invalidList.push({ item, errors: validation.errors });
      }
    });

    return {
      success: true,
      validList,
      invalidList
    };
  } catch (err) {
    return {
      success: false,
      error: 'Ungültiges JSON-Format: ' + err.message
    };
  }
}
