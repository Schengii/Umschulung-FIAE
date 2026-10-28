/**
 * @file snake-logic.js
 * @description DOM-free rules of the Snake game (snake.html): movement, turning, collisions,
 * food placement and the top-5 highscore list. snake.js draws and handles input.
 */

/** @typedef {{x: number, y: number}} Cell */
/** @typedef {'UP' | 'DOWN' | 'LEFT' | 'RIGHT'} Direction */
/** @typedef {{score: number, date: string}} HighscoreEntry */

export const POINTS_PER_FOOD = 10;
export const HIGHSCORE_LIMIT = 5;

/** @type {Record<Direction, Direction>} */
const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

/** @type {Record<string, Direction>} */
const KEY_DIRECTIONS = {
    ArrowUp: 'UP',
    w: 'UP',
    W: 'UP',
    ArrowDown: 'DOWN',
    s: 'DOWN',
    S: 'DOWN',
    ArrowLeft: 'LEFT',
    a: 'LEFT',
    A: 'LEFT',
    ArrowRight: 'RIGHT',
    d: 'RIGHT',
    D: 'RIGHT',
};

/**
 * Direction for a key (arrows and WASD), null for any other key.
 * @param {string} key
 * @returns {Direction | null}
 */
export const keyToDirection = (key) => KEY_DIRECTIONS[key] || null;

/**
 * The direction the snake takes next: a turn back onto itself is ignored.
 * @param {Direction} current direction of the last step
 * @param {Direction} requested
 */
export const turn = (current, requested) => (OPPOSITE[current] === requested ? current : requested);

/**
 * @param {Cell} head
 * @param {Direction} direction
 * @returns {Cell}
 */
export function nextHead(head, direction) {
    switch (direction) {
        case 'LEFT':
            return { x: head.x - 1, y: head.y };
        case 'RIGHT':
            return { x: head.x + 1, y: head.y };
        case 'UP':
            return { x: head.x, y: head.y - 1 };
        default:
            return { x: head.x, y: head.y + 1 };
    }
}

/**
 * @param {Cell} cell
 * @param {Cell[]} cells
 */
export const occupies = (cell, cells) => cells.some((part) => part.x === cell.x && part.y === cell.y);

/**
 * @param {Cell} head
 * @param {Cell[]} snake
 * @param {number} cols
 * @param {number} rows
 */
export const isCollision = (head, snake, cols, rows) =>
    head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || occupies(head, snake);

/**
 * A free cell for the food, chosen with `random` (0 <= value < 1); null when the board is full.
 * @param {Cell[]} snake
 * @param {number} cols
 * @param {number} rows
 * @param {() => number} [random]
 * @returns {Cell | null}
 */
export function placeFood(snake, cols, rows, random = Math.random) {
    /** @type {Cell[]} */
    const free = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!occupies({ x, y }, snake)) free.push({ x, y });
        }
    }
    if (free.length === 0) return null;
    return free[Math.min(free.length - 1, Math.floor(random() * free.length))];
}

/**
 * One game step.
 * @param {{snake: Cell[], food: Cell, direction: Direction, score: number}} state
 * @param {{cols: number, rows: number, random?: () => number}} board
 * @returns {{snake: Cell[], food: Cell | null, score: number, ate: boolean, over: boolean}}
 */
export function step({ snake, food, direction, score }, { cols, rows, random }) {
    const head = nextHead(snake[0], direction);
    if (isCollision(head, snake, cols, rows)) return { snake, food, score, ate: false, over: true };
    const ate = head.x === food.x && head.y === food.y;
    const moved = ate ? [head, ...snake] : [head, ...snake.slice(0, -1)];
    return {
        snake: moved,
        food: ate ? placeFood(moved, cols, rows, random) : food,
        score: ate ? score + POINTS_PER_FOOD : score,
        ate,
        over: false,
    };
}

/**
 * Stored highscore list; damaged or foreign entries are dropped.
 * @param {string | null | undefined} text
 * @returns {HighscoreEntry[]}
 */
export function parseHighscores(text) {
    try {
        const parsed = JSON.parse(text || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((entry) => entry && Number.isFinite(Number(entry.score)))
            .map((entry) => ({ score: Number(entry.score), date: String(entry.date ?? '') }))
            .slice(0, HIGHSCORE_LIMIT);
    } catch (_e) {
        return [];
    }
}

/**
 * Adds a finished round to the list.
 * @param {HighscoreEntry[]} list
 * @param {number} score
 * @param {string} date
 * @returns {{list: HighscoreEntry[], rank: number}} rank is the 0-based position, -1 when it did not make the list
 */
export function addHighscore(list, score, date) {
    if (score <= 0) return { list, rank: -1 };
    const entry = { score, date };
    const sorted = [...list, entry].sort((a, b) => b.score - a.score).slice(0, HIGHSCORE_LIMIT);
    return { list: sorted, rank: sorted.indexOf(entry) };
}
