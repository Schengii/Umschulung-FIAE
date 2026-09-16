/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Engine & Ebbinghaus Curve
 */

export function calculateSm2NextReview({
  grade = 4, // Quality of response: 0 - 5 (0: Blackout, 3: Pass, 5: Perfect)
  repetitions = 0,
  easeFactor = 2.5,
  interval = 0
}) {
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEaseFactor = easeFactor;

  if (grade >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Failed recall: reset repetitions
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3; // Hard floor

  // Calculate next due date
  const now = new Date();
  const nextDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000).toISOString();

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextDueDate,
    dueDate: nextDueDate.split('T')[0]
  };
}

/**
 * SuperMemo-2 (SM-2) Alias für Flashcards Kompatibilität
 */
export function calculateSM2({ quality, repetitions = 0, interval = 1, easeFactor = 2.5 }) {
  const res = calculateSm2NextReview({
    grade: quality,
    repetitions,
    interval,
    easeFactor
  });
  return {
    repetitions: res.repetitions,
    interval: res.interval,
    easeFactor: res.easeFactor,
    dueDate: res.dueDate
  };
}

/**
 * Calculates Ebbinghaus Forgetting Curve points over days
 */
export function calculateEbbinghausCurve(stabilityDays = 5, totalDays = 30) {
  const points = [];
  for (let day = 0; day <= totalDays; day++) {
    // Retention R = exp(-day / stability)
    const retention = Math.exp(-day / Math.max(0.5, stabilityDays));
    points.push({
      day: `Tag ${day}`,
      retentionPercent: Number((retention * 100).toFixed(1))
    });
  }
  return points;
}
