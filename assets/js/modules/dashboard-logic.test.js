import { describe, it, expect } from 'vitest';
import {
    rankLearningRecommendations,
    getRecommendationCategoryName,
    getRecommendationLink,
    getContributionLevel,
    buildContributionData,
} from './dashboard-logic.js';

describe('rankLearningRecommendations', () => {
    it('returns nothing without weak spots', () => {
        expect(rankLearningRecommendations([], {})).toEqual([]);
    });

    it('weights a weak quiz category with 2', () => {
        expect(rankLearningRecommendations(['tech', 'ihk'], { ihk: 1 })).toEqual(['ihk', 'tech']);
    });

    it('sorts by summed weight, highest first', () => {
        expect(rankLearningRecommendations(['tech'], { database: 5, network: 1 })).toEqual([
            'database',
            'tech',
            'network',
        ]);
    });

    it('counts repeated quiz entries each time', () => {
        expect(rankLearningRecommendations(['wiso', 'wiso', 'tech'], {})).toEqual(['wiso', 'tech']);
    });
});

describe('getRecommendationCategoryName', () => {
    it('translates known keys', () => {
        expect(getRecommendationCategoryName('database', 'de')).toBe('Datenbanken');
        expect(getRecommendationCategoryName('database', 'en')).toBe('Databases');
    });

    it('falls back to the key for unknown categories', () => {
        expect(getRecommendationCategoryName('custom', 'de')).toBe('custom');
    });
});

describe('getRecommendationLink', () => {
    it('maps interview categories, study categories and the fallback', () => {
        expect(getRecommendationLink('project')).toBe('interview-trainer.html');
        expect(getRecommendationLink('wiso')).toBe('flashcards.html');
        expect(getRecommendationLink('unknown')).toBe('quiz.html');
    });
});

describe('getContributionLevel', () => {
    it('maps commit counts to levels 0-4', () => {
        expect([0, 1, 2, 3, 4, 5, 6, 7, 20].map(getContributionLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    });
});

describe('buildContributionData', () => {
    const today = new Date(2026, 9, 18, 12);

    it('builds 371 days ending today with the live commits', () => {
        const { cells } = buildContributionData(today, 3);
        expect(cells).toHaveLength(371);
        expect(cells[370].commits).toBe(3);
        expect(cells[370].date.toDateString()).toBe(today.toDateString());
    });

    it('is deterministic for the same day', () => {
        expect(buildContributionData(today, 0)).toEqual(buildContributionData(today, 0));
    });

    it('sums the commits and keeps the streak within the day count', () => {
        const { cells, totalCommits, maxStreak } = buildContributionData(today, 2);
        expect(totalCommits).toBe(cells.reduce((sum, cell) => sum + cell.commits, 0));
        expect(maxStreak).toBeGreaterThan(0);
        expect(maxStreak).toBeLessThanOrEqual(371);
    });

    it('keeps weekends quieter than weekdays', () => {
        const { cells } = buildContributionData(today, 0);
        const sum = (days) => days.reduce((total, cell) => total + cell.commits, 0);
        const weekend = cells.filter((cell) => [0, 6].includes(cell.date.getDay()));
        const weekdays = cells.filter((cell) => ![0, 6].includes(cell.date.getDay()));
        expect(sum(weekend) / weekend.length).toBeLessThan(sum(weekdays) / weekdays.length);
    });

    it('supports a shorter range', () => {
        expect(buildContributionData(today, 1, 7).cells).toHaveLength(7);
    });
});
