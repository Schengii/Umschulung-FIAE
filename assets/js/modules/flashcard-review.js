/**
 * @file flashcard-review.js
 * @description DOM-free state change when a flashcard is answered: box, due date and the list of
 * mastered ("known") cards. flashcards.js only reads and writes storage and renders; the rules are
 * here and tested (Plan 6.3, pattern of ADR 0011).
 */

import { advanceBoxLevel, resetBoxLevel, nextDueDate, MAX_BOX_LEVEL, MIN_BOX_LEVEL } from './leitner-box.js';

/**
 * @typedef {string | number} CardId
 * @typedef {object} ReviewState
 * @property {Record<string, number>} boxLevels card id -> box
 * @property {Record<string, number>} dueDates card id -> due timestamp (no entry: due now)
 * @property {CardId[]} known ids of the cards in the highest box
 */

/** @param {CardId[]} list @param {CardId} id */
const without = (list, id) => list.filter((entry) => entry !== id);

/**
 * State after the card was answered. Right: one box up, due date by box, mastered only in the
 * highest box. Wrong: back to box 1, due again right away, no longer mastered.
 * @param {ReviewState} state
 * @param {CardId} id
 * @param {boolean} correct
 * @param {number} now
 * @returns {ReviewState} new objects, the input stays untouched
 */
export function reviewCard(state, id, correct, now) {
    const boxLevels = { ...state.boxLevels };
    const dueDates = { ...state.dueDates };
    let known = [...state.known];

    if (correct) {
        const level = advanceBoxLevel(boxLevels[id] || MIN_BOX_LEVEL);
        boxLevels[id] = level;
        dueDates[id] = nextDueDate(level, now);
        known = level === MAX_BOX_LEVEL ? (known.includes(id) ? known : [...known, id]) : without(known, id);
    } else {
        boxLevels[id] = resetBoxLevel();
        delete dueDates[id];
        known = without(known, id);
    }
    return { boxLevels, dueDates, known };
}

/**
 * Are all cards that count for the achievement known? Without any such card, never.
 * @param {CardId[]} masteryIds
 * @param {CardId[]} known
 */
export function allMastered(masteryIds, known) {
    return masteryIds.length > 0 && masteryIds.every((id) => known.includes(id));
}

/**
 * Counts one wrong answer for the category (feeds the dashboard recommendations).
 * @param {Record<string, number>} counts
 * @param {string} category
 * @returns {Record<string, number>}
 */
export function countWrongAnswer(counts, category) {
    return { ...counts, [category]: (counts[category] || 0) + 1 };
}
