import { describe, it, expect } from 'vitest';
import { matchesCardFilter } from './search-filter.js';

describe('matchesCardFilter', () => {
    it('matches when category is all and search query is empty', () => {
        expect(matchesCardFilter(['filter-frontend'], 'React Projekt', 'all', '')).toBe(true);
    });

    it('matches specific category correctly', () => {
        expect(matchesCardFilter(['filter-frontend', 'card'], 'Some content', 'frontend', '')).toBe(true);
        expect(matchesCardFilter(['filter-backend', 'card'], 'Some content', 'frontend', '')).toBe(false);
    });

    it('matches search query case-insensitively', () => {
        expect(matchesCardFilter([], 'Java Spring Boot API', 'all', 'spring')).toBe(true);
        expect(matchesCardFilter([], 'Java Spring Boot API', 'all', 'SPRING')).toBe(true);
        expect(matchesCardFilter([], 'Java Spring Boot API', 'all', 'python')).toBe(false);
    });

    it('requires both category and search query to match', () => {
        const classes = ['filter-backend'];
        const text = 'Spring Boot REST Controller';

        // Matches category & search
        expect(matchesCardFilter(classes, text, 'backend', 'rest')).toBe(true);
        // Matches category but not search
        expect(matchesCardFilter(classes, text, 'backend', 'vue')).toBe(false);
        // Matches search but not category
        expect(matchesCardFilter(classes, text, 'frontend', 'rest')).toBe(false);
    });

    it('handles classList DOM token list or null/undefined gracefully', () => {
        const fakeClassList = {
            contains: (c) => c === 'filter-tools'
        };
        expect(matchesCardFilter(fakeClassList, 'Docker Compose', 'tools', 'docker')).toBe(true);
        expect(matchesCardFilter(null, null, 'all', '')).toBe(true);
        expect(matchesCardFilter(null, null, 'tools', '')).toBe(false);
    });
});
