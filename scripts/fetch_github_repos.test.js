import { describe, expect, it } from 'vitest';
import fetchRepos from './fetch_github_repos.js';

const { normalizeRepos, pickRepoFields } = fetchRepos;

const repo = (over = {}) => ({
    name: 'Demo',
    html_url: 'https://github.com/Schengii/Demo',
    homepage: 'https://demo.example',
    topics: ['b', 'a'],
    stargazers_count: 3,
    pushed_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-02T10:00:00Z',
    fork: false,
    archived: false,
    private: false,
    owner: { login: 'x' },
    ...over,
});

describe('pickRepoFields', () => {
    it('behält nur die genutzten Felder und sortiert die Topics', () => {
        expect(pickRepoFields(repo())).toEqual({
            name: 'Demo',
            html_url: 'https://github.com/Schengii/Demo',
            homepage: 'https://demo.example',
            topics: ['a', 'b'],
            stargazers_count: 3,
            pushed_at: '2026-11-01T10:00:00Z',
            updated_at: '2026-11-02T10:00:00Z',
            fork: false,
        });
    });

    it('füllt fehlende Felder mit neutralen Werten', () => {
        const picked = pickRepoFields({ name: 'X', html_url: 'https://github.com/Schengii/X', homepage: null });
        expect(picked).toMatchObject({ homepage: '', topics: [], stargazers_count: 0, pushed_at: null, fork: false });
    });
});

describe('normalizeRepos', () => {
    it('sortiert nach Name und lässt archivierte Repositories weg', () => {
        const result = normalizeRepos([
            repo({ name: 'b' }),
            repo({ name: 'a' }),
            repo({ name: 'old', archived: true }),
        ]);
        expect(result.map((r) => r.name)).toEqual(['a', 'b']);
    });

    it('ignoriert ungültige Einträge', () => {
        expect(normalizeRepos([null, {}, repo()])).toHaveLength(1);
    });
});
