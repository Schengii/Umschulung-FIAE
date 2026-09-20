import { describe, it, expect } from 'vitest';
import { getIhkGrade, computeQualityScore, getQualityStatus } from './grade-calculator.js';

describe('getIhkGrade', () => {
    it.each([
        [100, 1],
        [92, 1],
        [91, 2],
        [81, 2],
        [80, 3],
        [67, 3],
        [66, 4],
        [50, 4],
        [49, 5],
        [30, 5],
        [29, 6],
        [0, 6],
    ])('maps score %i to IHK grade %i', (score, expected) => {
        expect(getIhkGrade(score)).toBe(expected);
    });
});

describe('computeQualityScore', () => {
    it('weights coverage 40%, clean code 30%, docs 15%, security 15%', () => {
        expect(computeQualityScore({ coverage: 100, cleanCode: 0, docs: 0, security: 0 })).toBeCloseTo(40);
        expect(computeQualityScore({ coverage: 0, cleanCode: 100, docs: 0, security: 0 })).toBeCloseTo(30);
        expect(computeQualityScore({ coverage: 0, cleanCode: 0, docs: 100, security: 0 })).toBeCloseTo(15);
        expect(computeQualityScore({ coverage: 0, cleanCode: 0, docs: 0, security: 100 })).toBeCloseTo(15);
    });

    it('returns 100 when every metric is maxed out', () => {
        expect(computeQualityScore({ coverage: 100, cleanCode: 100, docs: 100, security: 100 })).toBeCloseTo(100);
    });

    it('clamps out-of-range and non-numeric inputs', () => {
        expect(computeQualityScore({ coverage: 150, cleanCode: -20, docs: NaN, security: 100 })).toBeCloseTo(
            40 + 0 + 0 + 15
        );
    });
});

describe('getQualityStatus', () => {
    it('returns success at or above 90', () => {
        expect(getQualityStatus(90)).toBe('success');
        expect(getQualityStatus(100)).toBe('success');
    });

    it('returns warning between 75 and 89.9', () => {
        expect(getQualityStatus(75)).toBe('warning');
        expect(getQualityStatus(89.9)).toBe('warning');
    });

    it('returns danger below 75', () => {
        expect(getQualityStatus(74.9)).toBe('danger');
        expect(getQualityStatus(0)).toBe('danger');
    });
});
