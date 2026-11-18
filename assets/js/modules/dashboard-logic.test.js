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
    const byDay = { '2026-10-18': 3, '2026-10-17': 2, '2026-10-16': 1, '2026-10-10': 4, '2024-01-01': 9 };

    it('builds 371 days ending today from the real counts', () => {
        const { cells } = buildContributionData(today, byDay);
        expect(cells).toHaveLength(371);
        expect(cells[370].commits).toBe(3);
        expect(cells[370].date.toDateString()).toBe(today.toDateString());
        expect(cells[369].commits).toBe(2);
        expect(cells[362].commits).toBe(4);
    });

    it('counts only days inside the range and finds the longest streak', () => {
        const { totalCommits, maxStreak } = buildContributionData(today, byDay);
        expect(totalCommits).toBe(10);
        expect(maxStreak).toBe(3);
    });

    it('is empty without commits', () => {
        const { totalCommits, maxStreak } = buildContributionData(today, {});
        expect(totalCommits).toBe(0);
        expect(maxStreak).toBe(0);
    });

    it('supports a shorter range', () => {
        expect(buildContributionData(today, byDay, 7).cells).toHaveLength(7);
    });
});
