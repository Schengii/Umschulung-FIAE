/**
 * @file study-session.js
 * @description DOM-free logic for the study sessions of flashcards.html: the daily limit for new
 * cards of the IHK-Kartei and the summary shown after a session. Two thousand unseen cards must
 * not land in "Due today" at once; only a few new ones are introduced per day.
 */

import { isExtendedCard } from './flashcard-deck.js';
import { daysUntilDue, isDue } from './leitner-box.js';

export const DEFAULT_NEW_PER_DAY = 10;
export const MAX_NEW_PER_DAY = 100;

/** @typedef {{day: string, ids: string[]}} NewToday */

/**
 * Limit as a whole number between 0 and MAX_NEW_PER_DAY; anything else falls back to the default.
 * @param {unknown} value
 */
export function normalizeNewPerDay(value) {
    if (value === null || value === undefined || value === '') return DEFAULT_NEW_PER_DAY;
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_NEW_PER_DAY;
    return Math.min(MAX_NEW_PER_DAY, Math.max(0, Math.floor(number)));
}

/**
 * Local calendar day as YYYY-MM-DD.
 * @param {number} timestamp
 */
export function dayKey(timestamp) {
    const date = new Date(timestamp);
    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The record of today's new cards; a record from another day or a broken value counts as empty.
 * @param {unknown} stored
 * @param {number} now
 * @returns {NewToday}
 */
export function readNewToday(stored, now) {
    const today = dayKey(now);
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        const record = /** @type {{day?: unknown, ids?: unknown}} */ (stored);
        if (record.day === today && Array.isArray(record.ids)) {
            return { day: today, ids: record.ids.filter((id) => typeof id === 'string') };
        }
    }
    return { day: today, ids: [] };
}

/**
 * Tops today's record up with unseen cards of the IHK-Kartei until the limit is reached. Cards
 * already introduced today count against the limit, whether answered or not.
 * @param {Array<{id: string | number}>} cards combined deck
 * @param {Record<string, number>} boxLevels
 * @param {NewToday} newToday
 * @param {number} limit
 * @returns {NewToday}
 */
export function introduceNewCards(cards, boxLevels, newToday, limit) {
    const remaining = limit - newToday.ids.length;
    if (remaining <= 0) return newToday;
    const known = new Set(newToday.ids);
    const fresh = cards
        .filter((card) => isExtendedCard(card) && boxLevels[card.id] === undefined && !known.has(String(card.id)))
        .slice(0, remaining)
        .map((card) => String(card.id));
    return fresh.length ? { day: newToday.day, ids: [...newToday.ids, ...fresh] } : newToday;
}

/**
 * @typedef {object} SessionTally
 * @property {number} total cards in the session when it started
 * @property {number} correct
 * @property {number} wrong
 */

/**
 * @param {number} total
 * @returns {SessionTally}
 */
export function startSession(total) {
    return { total, correct: 0, wrong: 0 };
}

/**
 * @param {SessionTally} tally
 * @param {boolean} correct
 * @returns {SessionTally}
 */
export function recordAnswer(tally, correct) {
    return correct ? { ...tally, correct: tally.correct + 1 } : { ...tally, wrong: tally.wrong + 1 };
}

/**
 * Share of the session that is done (answered correctly), 0..100. Wrong cards stay in the deck.
 * @param {SessionTally} tally
 */
export function sessionProgress(tally) {
    if (tally.total <= 0) return 100;
    return Math.min(100, Math.round((tally.correct / tally.total) * 100));
}

/**
 * Whole days until the next card is due, over all cards with a future due date; null if none.
 * @param {Record<string, number>} dueDates
 * @param {number} now
 * @returns {number | null}
 */
export function nextDueInDays(dueDates, now) {
    const future = Object.values(dueDates).filter((dueAt) => typeof dueAt === 'number' && !isDue(dueAt, now));
    if (!future.length) return null;
    return daysUntilDue(Math.min(...future), now);
}
