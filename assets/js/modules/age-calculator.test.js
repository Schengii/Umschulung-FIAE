import { describe, it, expect } from 'vitest';
import { calculateAge } from './age-calculator.js';

describe('calculateAge', () => {
    it('counts a full year once the birthday has passed this year', () => {
        expect(calculateAge(2002, 5, 10, new Date(2026, 5, 1))).toBe(24);
    });

    it('does not count the year yet before the birthday', () => {
        expect(calculateAge(2002, 5, 10, new Date(2026, 3, 1))).toBe(23);
    });

    it('counts the birthday itself as already turned', () => {
        expect(calculateAge(2002, 5, 10, new Date(2026, 4, 10))).toBe(24);
    });

    it('does not count the day before the birthday in the same month', () => {
        expect(calculateAge(2002, 5, 10, new Date(2026, 4, 9))).toBe(23);
    });
});
