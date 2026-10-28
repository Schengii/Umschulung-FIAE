import { describe, it, expect } from 'vitest';
import {
    detailUrl,
    findProject,
    isCacheFresh,
    mergeProjects,
    parseStoredList,
    relatedProjects,
    safeColor,
    safeUrl,
    withSafeLink,
} from './project-detail-logic.js';

describe('safeUrl', () => {
    it('keeps http(s) and relative URLs and escapes them', () => {
        expect(safeUrl('https://example.com/?a=1&b=2')).toBe('https://example.com/?a=1&amp;b=2');
        expect(safeUrl('../Projekte/EcoChef/index.html')).toBe('../Projekte/EcoChef/index.html');
        expect(safeUrl('pages/x.html?title="a"')).toBe('pages/x.html?title=&quot;a&quot;');
    });

    it('rejects other schemes, also when disguised', () => {
        expect(safeUrl('javascript:alert(1)')).toBe('');
        expect(safeUrl(' JavaScript:alert(1)')).toBe('');
        expect(safeUrl('java\tscript:alert(1)')).toBe('');
        expect(safeUrl('data:text/html,<script>')).toBe('');
        expect(safeUrl('')).toBe('');
        expect(safeUrl(null)).toBe('');
    });
});

describe('safeColor', () => {
    it('accepts hex colours only', () => {
        expect(safeColor('#10b981')).toBe('#10b981');
        expect(safeColor('red;background:url(x)')).toBe('var(--primary)');
        expect(safeColor(undefined)).toBe('var(--primary)');
    });
});

describe('parseStoredList / isCacheFresh', () => {
    it('parses a stored list and survives damaged values', () => {
        expect(parseStoredList('[1,2]')).toEqual([1, 2]);
        expect(parseStoredList('{"a":1}')).toEqual([]);
        expect(parseStoredList('{kaputt')).toEqual([]);
        expect(parseStoredList(null)).toEqual([]);
    });

    it('treats a cache as fresh only with data and a recent timestamp', () => {
        expect(isCacheFresh([{}], '1000', 1500, 1000)).toBe(true);
        expect(isCacheFresh([{}], '1000', 2500, 1000)).toBe(false);
        expect(isCacheFresh([], '1000', 1500, 1000)).toBe(false);
        expect(isCacheFresh([{}], null, 1500, 1000)).toBe(false);
    });
});

describe('mergeProjects', () => {
    const projects = [
        { repoName: 'EcoChef', titleDe: 'EcoChef', tags: ['JavaScript'], link: '../Projekte/EcoChef/index.html' },
        { titleDe: 'Ohne Repo', tags: ['Java'] },
    ];

    it('adds stars, URL, date, topics (deduplicated) and the homepage', () => {
        const [eco] = mergeProjects(projects, [
            {
                name: 'ecochef',
                stargazers_count: 4,
                html_url: 'https://github.com/x/EcoChef',
                updated_at: '2026-10-01',
                topics: ['JavaScript', 'pwa'],
                homepage: 'https://eco.example',
            },
        ]);
        expect(eco).toMatchObject({
            stars: 4,
            githubUrl: 'https://github.com/x/EcoChef',
            updatedAt: '2026-10-01',
            tags: ['JavaScript', 'pwa'],
            link: 'https://eco.example',
        });
    });

    it('keeps the local link when the homepage is empty and ignores broken API entries', () => {
        const merged = mergeProjects(projects, [null, { name: 'EcoChef', homepage: '  ' }, { stars: 1 }]);
        expect(merged[0].link).toBe('../Projekte/EcoChef/index.html');
        expect(merged[1]).toEqual(projects[1]);
    });
});

describe('findProject / withSafeLink / detailUrl', () => {
    const projects = [{ repoName: 'A', titleDe: 'Alpha' }, { titleDe: 'Beta & Co' }];

    it('finds by repo or German title', () => {
        expect(findProject(projects, 'A', null)).toBe(projects[0]);
        expect(findProject(projects, null, 'Beta & Co')).toBe(projects[1]);
        expect(findProject(projects, 'X', null)).toBeUndefined();
    });

    it('drops a javascript: link', () => {
        expect(withSafeLink({ link: 'javascript:alert(1)' }).link).toBe('');
        expect(withSafeLink({ link: 'https://x.example' }).link).toBe('https://x.example');
    });

    it('builds the detail URL from repo or encoded title', () => {
        expect(detailUrl(projects[0])).toBe('projekt-detail.html?repo=A');
        expect(detailUrl(projects[1])).toBe('projekt-detail.html?title=Beta%20%26%20Co');
    });
});

describe('relatedProjects', () => {
    const current = { repoName: 'A', tags: ['JavaScript', 'PWA'] };
    const projects = [
        current,
        { repoName: 'B', tags: ['javascript'] },
        { repoName: 'C', tags: ['JavaScript', 'pwa'] },
        { repoName: 'D', tags: ['Java'] },
        { titleDe: 'E', tags: ['PWA'] },
        { titleDe: 'F', tags: ['PWA'] },
    ];

    it('orders by shared tags, excludes itself and unrelated projects, limits to three', () => {
        const related = relatedProjects(current, projects);
        expect(related.map((p) => p.repoName || p.titleDe)).toEqual(['C', 'B', 'E']);
    });

    it('returns nothing for a project without tags', () => {
        expect(relatedProjects({ repoName: 'Z' }, projects)).toEqual([]);
    });
});
