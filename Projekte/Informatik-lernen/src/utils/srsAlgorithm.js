/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * Computes repetition interval, repetitions count, and ease factor (EF).
 * 
 * Quality Rating (0 - 5):
 * 5 - Perfekte Antwort ohne Zögern
 * 4 - Richtige Antwort nach kurzem Nachdenken
 * 3 - Richtige Antwort mit spürbarer Anstrengung
 * 2 - Falsche Antwort; richtige Lösung schien aber bekannt
 * 1 - Falsche Antwort; an richtige Lösung erinnert
 * 0 - Kompletter Blackout
 */
export function calculateSM2({ quality, repetitions = 0, interval = 1, easeFactor = 2.5 }) {
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEaseFactor = easeFactor;

  // Correct responses (3, 4, 5)
  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect responses (0, 1, 2)
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update Ease Factor (min 1.3)
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    dueDate: nextDueDate.toISOString().split('T')[0]
  };
}
