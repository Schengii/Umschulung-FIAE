import { describe, it, expect } from 'vitest';
import { filterRadarSkills, filterListSkills, sortSkills } from './skills-filter.js';

const skills = [
    { name: 'Zebra Skill', category: 'soft', score: 50 },
    { name: 'Alpha Skill', category: 'tech', score: 90 },
    { name: 'Mid Skill', category: 'tech', score: 70 },
];
const repsForAll = ['Alpha Skill', 'Mid Skill'];

describe('filterRadarSkills', () => {
    it('restricts the "all" category to the representative skills, in original order', () => {
        expect(filterRadarSkills(skills, 'all', repsForAll).map(s => s.name)).toEqual(['Alpha Skill', 'Mid Skill']);
    });

    it('filters by category otherwise', () => {
        expect(filterRadarSkills(skills, 'tech', repsForAll).map(s => s.name)).toEqual(['Alpha Skill', 'Mid Skill']);
        expect(filterRadarSkills(skills, 'soft', repsForAll).map(s => s.name)).toEqual(['Zebra Skill']);
    });
});

describe('filterListSkills', () => {
    it('returns every skill for the "all" category', () => {
        expect(filterListSkills(skills, 'all')).toHaveLength(3);
    });

    it('filters by category otherwise', () => {
        expect(filterListSkills(skills, 'tech').map(s => s.name)).toEqual(['Alpha Skill', 'Mid Skill']);
    });
});

describe('sortSkills', () => {
    it('sorts alphabetically for "alpha"', () => {
        expect(sortSkills(skills, 'alpha').map(s => s.name)).toEqual(['Alpha Skill', 'Mid Skill', 'Zebra Skill']);
    });

    it('sorts by descending score for "level-desc"', () => {
        expect(sortSkills(skills, 'level-desc').map(s => s.score)).toEqual([90, 70, 50]);
    });

    it('sorts by ascending score for "level-asc"', () => {
        expect(sortSkills(skills, 'level-asc').map(s => s.score)).toEqual([50, 70, 90]);
    });

    it('leaves order untouched for an unknown/default mode', () => {
        expect(sortSkills(skills, 'default').map(s => s.name)).toEqual(['Zebra Skill', 'Alpha Skill', 'Mid Skill']);
    });

    it('does not mutate the input array', () => {
        const original = [...skills];
        sortSkills(skills, 'alpha');
        expect(skills).toEqual(original);
    });
});
