/**
 * @file leitner-box.js
 * @description Pure Leitner-Box spaced-repetition logic used by flashcards.js.
 * Kept dependency-free (no DOM) so it can be unit-tested directly.
 */

export const MAX_BOX_LEVEL = 3;
export const MIN_BOX_LEVEL = 1;

/** Card answered correctly: advance one box, capped at MAX_BOX_LEVEL. */
export function advanceBoxLevel(currentLevel) {
    return Math.min(MAX_BOX_LEVEL, (currentLevel || MIN_BOX_LEVEL) + 1);
}

/** Card answered incorrectly: reset to box 1. */
export function resetBoxLevel() {
    return MIN_BOX_LEVEL;
}

/** Counts how many cards sit in each box (1..MAX_BOX_LEVEL). */
export function computeBoxStats(cards, boxLevels) {
    const counts = { 1: 0, 2: 0, 3: 0 };
    cards.forEach(card => {
        const level = boxLevels[card.id] || MIN_BOX_LEVEL;
        if (counts[level] !== undefined) counts[level]++;
    });
    return counts;
}

/** Filters a full card deck down to one Leitner category ('box1'|'box2'|'box3'). */
export function filterByBox(cards, boxLevels, boxCategory) {
    const targetLevel = { box1: 1, box2: 2, box3: 3 }[boxCategory];
    if (!targetLevel) return [...cards];
    if (targetLevel === MIN_BOX_LEVEL) {
        return cards.filter(c => (boxLevels[c.id] || MIN_BOX_LEVEL) === targetLevel);
    }
    return cards.filter(c => boxLevels[c.id] === targetLevel);
}
