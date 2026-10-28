import { describe, it, expect } from 'vitest';
import {
    HIGHSCORE_LIMIT,
    POINTS_PER_FOOD,
    addHighscore,
    isCollision,
    keyToDirection,
    nextHead,
    parseHighscores,
    placeFood,
    step,
    turn,
} from './snake-logic.js';

const board = { cols: 5, rows: 5 };

describe('input', () => {
    it('maps arrows and WASD to directions', () => {
        expect(keyToDirection('ArrowUp')).toBe('UP');
        expect(keyToDirection('a')).toBe('LEFT');
        expect(keyToDirection('D')).toBe('RIGHT');
        expect(keyToDirection('x')).toBeNull();
    });

    it('ignores a turn back onto the snake', () => {
        expect(turn('RIGHT', 'LEFT')).toBe('RIGHT');
        expect(turn('UP', 'DOWN')).toBe('UP');
        expect(turn('RIGHT', 'UP')).toBe('UP');
    });
});

describe('movement and collisions', () => {
    it('moves the head one cell', () => {
        expect(nextHead({ x: 2, y: 2 }, 'LEFT')).toEqual({ x: 1, y: 2 });
        expect(nextHead({ x: 2, y: 2 }, 'DOWN')).toEqual({ x: 2, y: 3 });
    });

    it('detects walls and the own body', () => {
        expect(isCollision({ x: -1, y: 0 }, [], 5, 5)).toBe(true);
        expect(isCollision({ x: 0, y: 5 }, [], 5, 5)).toBe(true);
        expect(isCollision({ x: 1, y: 1 }, [{ x: 1, y: 1 }], 5, 5)).toBe(true);
        expect(isCollision({ x: 1, y: 1 }, [{ x: 2, y: 1 }], 5, 5)).toBe(false);
    });
});

describe('step', () => {
    const snake = [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
    ];

    it('moves without growing', () => {
        const result = step({ snake, food: { x: 0, y: 0 }, direction: 'RIGHT', score: 0 }, board);
        expect(result).toMatchObject({ ate: false, over: false, score: 0 });
        expect(result.snake).toEqual([
            { x: 3, y: 2 },
            { x: 2, y: 2 },
        ]);
    });

    it('grows, scores and places new food on a free cell when eating', () => {
        const result = step(
            { snake, food: { x: 3, y: 2 }, direction: 'RIGHT', score: 10 },
            { ...board, random: () => 0 }
        );
        expect(result).toMatchObject({ ate: true, over: false, score: 10 + POINTS_PER_FOOD });
        expect(result.snake).toHaveLength(3);
        expect(result.food).toEqual({ x: 0, y: 0 });
    });

    it('ends the round at a wall and keeps the state', () => {
        const atWall = [{ x: 4, y: 0 }];
        const result = step({ snake: atWall, food: { x: 0, y: 0 }, direction: 'RIGHT', score: 30 }, board);
        expect(result).toMatchObject({ over: true, score: 30, snake: atWall });
    });
});

describe('placeFood', () => {
    it('never places food on the snake and reports a full board', () => {
        const all = [];
        for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) all.push({ x, y });
        expect(placeFood(all.slice(1), 2, 2, () => 0.99)).toEqual({ x: 0, y: 0 });
        expect(placeFood(all, 2, 2)).toBeNull();
    });
});

describe('highscores', () => {
    it('keeps the best five and reports the rank of the new round', () => {
        const list = [50, 40, 30, 20, 10].map((score) => ({ score, date: '01.10.26' }));
        const result = addHighscore(list, 35, '28.10.26');
        expect(result.rank).toBe(2);
        expect(result.list.map((e) => e.score)).toEqual([50, 40, 35, 30, 20]);
        expect(addHighscore(list, 5, '28.10.26').rank).toBe(-1);
        expect(addHighscore(list, 0, '28.10.26')).toEqual({ list, rank: -1 });
    });

    it('parses the stored list and drops damaged entries', () => {
        expect(parseHighscores('[{"score":20,"date":"x"},{"score":"abc"},null]')).toEqual([{ score: 20, date: 'x' }]);
        expect(parseHighscores('{kaputt')).toEqual([]);
        expect(parseHighscores('{"score":1}')).toEqual([]);
        const many = JSON.stringify(Array.from({ length: 9 }, (_, i) => ({ score: i, date: '' })));
        expect(parseHighscores(many)).toHaveLength(HIGHSCORE_LIMIT);
    });
});
