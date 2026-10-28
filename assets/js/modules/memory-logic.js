/**
 * @file memory-logic.js
 * @description DOM-free rules of the memory game (memory.html): deck, time format and the
 * top-5 leaderboard (fewest moves first, then fastest time). memory.js renders and handles input.
 */

/** @typedef {{moves: number, time: number}} MemoryScore */

export const LEADERBOARD_LIMIT = 5;

/**
 * Fisher-Yates shuffle; returns a new array.
 * @template T
 * @param {T[]} items
 * @param {() => number} [random]
 * @returns {T[]}
 */
export function shuffle(items, random = Math.random) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Two cards of every symbol, shuffled.
 * @template T
 * @param {T[]} symbols
 * @param {() => number} [random]
 */
export const buildDeck = (symbols, random = Math.random) => shuffle([...symbols, ...symbols], random);

/**
 * `m:ss`
 * @param {number} seconds
 */
export function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * @param {MemoryScore} a
 * @param {MemoryScore} b
 */
const compareScores = (a, b) => (a.moves !== b.moves ? a.moves - b.moves : a.time - b.time);

/**
 * Stored leaderboard; damaged or foreign entries are dropped.
 * @param {string | null | undefined} text
 * @returns {MemoryScore[]}
 */
export function parseLeaderboard(text) {
    try {
        const parsed = JSON.parse(text || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((entry) => entry && Number.isFinite(Number(entry.moves)) && Number.isFinite(Number(entry.time)))
            .map((entry) => ({ moves: Number(entry.moves), time: Number(entry.time) }))
            .sort(compareScores)
            .slice(0, LEADERBOARD_LIMIT);
    } catch (_e) {
        return [];
    }
}

/**
 * Adds a won round.
 * @param {MemoryScore[]} list
 * @param {number} moves
 * @param {number} time seconds
 * @returns {{list: MemoryScore[], rank: number}} rank is the 0-based position, -1 when it did not make the list
 */
export function addScore(list, moves, time) {
    const entry = { moves, time };
    const sorted = [...list, entry].sort(compareScores).slice(0, LEADERBOARD_LIMIT);
    return { list: sorted, rank: sorted.indexOf(entry) };
}

/**
 * Whether a round beats the stored best (fewer moves).
 * @param {string | null | undefined} storedBestMoves
 * @param {number} moves
 */
export function isNewBest(storedBestMoves, moves) {
    const best = parseInt(String(storedBestMoves ?? ''), 10);
    return !Number.isFinite(best) || moves < best;
}
