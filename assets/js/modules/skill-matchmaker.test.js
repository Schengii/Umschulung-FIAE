import { describe, it, expect } from 'vitest';
import { computeMatchScore } from './skill-matchmaker.js';

const java = { id: 'java', tags: ['java', 'java se', 'oop'] };
const sql = { id: 'sql', tags: ['sql', 'jdbc', 'database'] };

describe('computeMatchScore', () => {
    it('returns 0 when no skills are selected', () => {
        expect(computeMatchScore([], [{ tags: ['java'] }])).toBe(0);
    });

    it('returns 0 when no project matches any selected skill', () => {
        const projects = [{ tags: ['python'], language: 'Python', descDe: 'Ein Python-Projekt' }];
        expect(computeMatchScore([java], projects)).toBe(0);
    });

    it('boosts a full single-skill match into the 65-100 band', () => {
        const projects = [{ tags: ['java'], language: '', descDe: '' }];
        const score = computeMatchScore([java], projects);
        expect(score).toBeGreaterThanOrEqual(65);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('picks the best-matching project among several candidates', () => {
        const weakMatch = { tags: ['java'], language: '', descDe: '' };
        const strongMatch = { tags: ['java', 'sql'], language: '', descDe: '' };
        const score = computeMatchScore([java, sql], [weakMatch, strongMatch]);
        expect(score).toBe(Math.min(100, Math.max(65, 100 + 15)));
    });

    it('never exceeds 100', () => {
        const projects = [{ tags: ['java', 'sql'], language: '', descDe: '' }];
        expect(computeMatchScore([java, sql], projects)).toBeLessThanOrEqual(100);
    });
});
