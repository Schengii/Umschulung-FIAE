import { describe, it, expect } from 'vitest';
import {
    FIRST_PAGE_PROJECTS,
    cleanSearchParam,
    filterProjects,
    isHighlightProject,
    matchesCategory,
    matchesDeepLink,
    matchesSearch,
    pageForIndex,
    pageSlice,
    projectTier,
    sortProjects,
    totalPages,
} from './portfolio-logic.js';

const project = (overrides) => ({ titleDe: '', titleEn: '', descDe: '', descEn: '', tags: [], ...overrides });

describe('matchesCategory', () => {
    it('matches all, categories and languages', () => {
        const web = project({ category: 'web ai', language: 'JavaScript' });
        expect(matchesCategory(web, 'all')).toBe(true);
        expect(matchesCategory(web, 'ai')).toBe(true);
        expect(matchesCategory(web, 'javascript')).toBe(true);
        expect(matchesCategory(web, 'games')).toBe(false);
    });

    it('finds C++ and TypeScript also through tags', () => {
        expect(matchesCategory(project({ tags: ['C++17'] }), 'cpp')).toBe(true);
        expect(matchesCategory(project({ language: 'C++' }), 'cpp')).toBe(true);
        expect(matchesCategory(project({ tags: ['TypeScript'] }), 'typescript')).toBe(true);
        expect(matchesCategory(project({ language: 'Java' }), 'cpp')).toBe(false);
    });

    it('treats curated repos and five or more stars as highlights', () => {
        expect(isHighlightProject(project({ repoName: 'EcoChef' }))).toBe(true);
        expect(isHighlightProject(project({ stars: 5 }))).toBe(true);
        expect(isHighlightProject(project({ stars: 4 }))).toBe(false);
        expect(matchesCategory(project({ highlight: true }), 'highlight')).toBe(true);
    });
});

describe('matchesSearch / filterProjects', () => {
    const projects = [
        project({ titleDe: 'EcoChef', descEn: 'Recipe app', tags: ['PWA'], category: 'web' }),
        project({ titleDe: 'Snake', tags: ['Canvas'], category: 'games' }),
    ];

    it('searches titles, descriptions and tags', () => {
        expect(matchesSearch(projects[0], 'recipe')).toBe(true);
        expect(matchesSearch(projects[0], 'pwa')).toBe(true);
        expect(matchesSearch(projects[1], 'recipe')).toBe(false);
        expect(matchesSearch(projects[1], '')).toBe(true);
    });

    it('combines category and search', () => {
        expect(filterProjects(projects, { category: 'games', search: '' })).toEqual([projects[1]]);
        expect(filterProjects(projects, { category: 'all', search: 'eco' })).toEqual([projects[0]]);
        expect(filterProjects(projects, { category: 'games', search: 'eco' })).toEqual([]);
    });
});

describe('sortProjects', () => {
    it('puts EcoChef first, featured repos in curated order, the rest by stars', () => {
        const sorted = sortProjects(
            [
                { repoName: 'Hobby', stars: 9 },
                { repoName: 'Minecraft', stars: 0 },
                { repoName: 'Other', stars: 2 },
                { repoName: 'ElektroCheck-AI', stars: 1 },
                { repoName: 'EcoChef', stars: 0 },
            ],
            'desc'
        );
        expect(sorted.map((p) => p.repoName)).toEqual(['EcoChef', 'ElektroCheck-AI', 'Minecraft', 'Hobby', 'Other']);
    });

    it('sorts the uncurated rest ascending on request and leaves the input alone', () => {
        const input = [
            { repoName: 'A', stars: 3 },
            { repoName: 'B', stars: 1 },
        ];
        expect(sortProjects(input, 'asc').map((p) => p.repoName)).toEqual(['B', 'A']);
        expect(input[0].repoName).toBe('A');
        expect(projectTier('EcoChef')).toBe(0);
        expect(projectTier('unknown')).toBe(2);
    });
});

describe('pagination', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);

    it('counts pages', () => {
        expect(totalPages(0)).toBe(1);
        expect(totalPages(FIRST_PAGE_PROJECTS)).toBe(1);
        expect(totalPages(FIRST_PAGE_PROJECTS + 1)).toBe(2);
        expect(totalPages(20)).toBe(3);
    });

    it('slices pages and finds the page of an index', () => {
        expect(pageSlice(list, 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        expect(pageSlice(list, 2)).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
        expect(pageSlice(list, 3)).toEqual([16, 17, 18, 19]);
        expect(pageForIndex(0)).toBe(1);
        expect(pageForIndex(7)).toBe(1);
        expect(pageForIndex(8)).toBe(2);
        expect(pageForIndex(16)).toBe(3);
    });
});

describe('deep links', () => {
    it('matches titles partially and repo names exactly, ignoring punctuation', () => {
        const amazon = { titleDe: 'Amazon 2.0 Shop', titleEn: 'Amazon 2.0 Shop', repoName: 'Amazon-2.0' };
        expect(matchesDeepLink(amazon, 'Amazon-2.0')).toBe(true);
        expect(matchesDeepLink(amazon, 'shop')).toBe(true);
        expect(matchesDeepLink(amazon, 'eco')).toBe(false);
        expect(matchesDeepLink(amazon, '---')).toBe(false);
    });

    it('cleans search parameters', () => {
        expect(cleanSearchParam('  <b>Java</b> ')).toBe('java');
    });
});
