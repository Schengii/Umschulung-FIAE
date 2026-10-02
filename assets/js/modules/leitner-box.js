/**
 * @file leitner-box.js
 * @description Pure Leitner-Box spaced-repetition logic used by flashcards.js.
 * Kept dependency-free (no DOM) so it can be unit-tested directly.
 *
 * Two things are tracked per card: the box (how well it is known) and a due date (when it
 * should be seen again). The box decides the interval to the next review; without the due
 * date the boxes were only a label and every card came up every time.
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
    cards.forEach((card) => {
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
        return cards.filter((c) => (boxLevels[c.id] || MIN_BOX_LEVEL) === targetLevel);
    }
    return cards.filter((c) => boxLevels[c.id] === targetLevel);
}

/**
 * Days until a card is due again after a correct answer moved it into the given box. In
 * practice only boxes 2 and 3 get a date: a correct answer always leaves box 1, and a wrong
 * answer puts the card back into box 1 without a date, i.e. due immediately.
 */
export const REVIEW_INTERVAL_DAYS = Object.freeze({ 1: 1, 2: 3, 3: 7 });

/** Local midnight of the day `timestamp` falls on. */
export function startOfDay(timestamp) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

/**
 * When a card that was just answered correctly is due again. Due dates are whole days: a card
 * reviewed in the evening is due "tomorrow" from midnight on, not 24 hours later.
 * @param {number} level box the card is in after the answer
 * @param {number} now timestamp of the review
 * @returns {number} timestamp (local midnight of the due day)
 */
export function nextDueDate(level, now) {
    const days = REVIEW_INTERVAL_DAYS[level] ?? REVIEW_INTERVAL_DAYS[MIN_BOX_LEVEL];
    const date = new Date(startOfDay(now));
    // setDate (instead of adding 24 h blocks) stays on midnight across daylight saving changes.
    date.setDate(date.getDate() + days);
    return date.getTime();
}

/** A card without a due date was never reviewed (or was answered wrongly) and is due. */
export function isDue(dueAt, now) {
    return !dueAt || dueAt <= now;
}

/** The cards of a deck that should be reviewed now. */
export function filterDue(cards, dueDates, now) {
    return cards.filter((card) => isDue(dueDates[card.id], now));
}

/** Whole days from today until the due day; 0 when the card is due. */
export function daysUntilDue(dueAt, now) {
    if (isDue(dueAt, now)) return 0;
    return Math.round((startOfDay(dueAt) - startOfDay(now)) / 86400000);
}
