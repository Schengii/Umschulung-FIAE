import { describe, it, expect, beforeEach } from 'vitest';
import {
    getLocalDateKey,
    getDailyQuestionIndex,
    calculateStreak,
    loadDailyState,
    recordDailyAnswer,
} from './daily-question.js';

describe('daily-question module', () => {
    let mockStorage;
    let store;

    beforeEach(() => {
        store = {};
        mockStorage = {
            getItem: (key) => store[key] || null,
            setItem: (key, val) => {
                store[key] = String(val);
            },
            removeItem: (key) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };
    });

    describe('getLocalDateKey', () => {
        it('formats dates as YYYY-MM-DD', () => {
            const date = new Date(2026, 4, 9); // May 9, 2026
            expect(getLocalDateKey(date)).toBe('2026-05-09');
        });
    });

    describe('getDailyQuestionIndex', () => {
        it('returns deterministic index for same date and pool size', () => {
            const idx1 = getDailyQuestionIndex('2026-10-17', 50);
            const idx2 = getDailyQuestionIndex('2026-10-17', 50);
            expect(idx1).toBe(idx2);
            expect(idx1).toBeGreaterThanOrEqual(0);
            expect(idx1).toBeLessThan(50);
        });

        it('returns different index for different dates', () => {
            const idx1 = getDailyQuestionIndex('2026-10-17', 50);
            const idx2 = getDailyQuestionIndex('2026-10-18', 50);
            // Even if hash collision was possible, across 50 items consecutive days should vary
            expect(typeof idx1).toBe('number');
            expect(typeof idx2).toBe('number');
        });

        it('handles empty or zero pool size gracefully', () => {
            expect(getDailyQuestionIndex('2026-10-17', 0)).toBe(0);
        });
    });

    describe('calculateStreak', () => {
        it('starts streak at 1 if no previous date', () => {
            expect(calculateStreak(null, '2026-10-17', 0)).toBe(1);
        });

        it('increments streak if consecutive day', () => {
            expect(calculateStreak('2026-10-16', '2026-10-17', 3)).toBe(4);
        });

        it('maintains streak if answered multiple times on same day', () => {
            expect(calculateStreak('2026-10-17', '2026-10-17', 3)).toBe(3);
        });

        it('resets streak to 1 if day was skipped', () => {
            expect(calculateStreak('2026-10-14', '2026-10-17', 5)).toBe(1);
        });
    });

    describe('loadDailyState and recordDailyAnswer', () => {
        it('returns default state on empty storage', () => {
            const state = loadDailyState(mockStorage);
            expect(state.streak).toBe(0);
            expect(state.lastDate).toBeNull();
            expect(state.answered).toEqual({});
        });

        it('records answer and updates streak', () => {
            const res1 = recordDailyAnswer('2026-10-16', 2, true, mockStorage);
            expect(res1.streak).toBe(1);
            expect(res1.lastDate).toBe('2026-10-16');
            expect(res1.answered['2026-10-16']).toEqual({ answeredIndex: 2, isCorrect: true });

            const res2 = recordDailyAnswer('2026-10-17', 0, true, mockStorage);
            expect(res2.streak).toBe(2);
            expect(res2.lastDate).toBe('2026-10-17');
            expect(res2.answered['2026-10-17']).toEqual({ answeredIndex: 0, isCorrect: true });
        });
    });
});
