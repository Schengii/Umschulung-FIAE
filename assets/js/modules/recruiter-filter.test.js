// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initRecruiterFilter } from './recruiter-filter.js';

const PAGE = `
    <div class="role-filter-container">
        <button class="btn-filter active" data-role="all">Alle</button>
        <button class="btn-filter" data-role="frontend">Frontend</button>
        <button class="btn-filter" data-role="backend">Backend</button>
    </div>
    <table><tr><td id="steckbrief-position"></td><td id="steckbrief-schwerpunkte"></td></tr></table>
    <ul id="live-git-list"></ul>`;

const button = (role) => document.querySelector(`[data-role="${role}"]`);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('recruiter filter', () => {
    beforeEach(() => {
        resetDocument(PAGE);
        installPageGlobals({
            STORAGE_KEYS: { GITHUB_PROJECTS_CACHE: 'cache', GITHUB_PROJECTS_CACHE_TIME: 'cache_time' },
            APP: { GITHUB_USERNAME: 'someone' },
        });
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        removePageGlobals();
    });

    it('does nothing when the page has no filter markup', () => {
        resetDocument('<p>leer</p>');
        expect(() => initRecruiterFilter()).not.toThrow();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('switches position and focus skills per role and moves the active class', () => {
        initRecruiterFilter();
        button('backend').click();
        expect(document.getElementById('steckbrief-position').textContent).toBe('Backend-Entwickler / Java-Spezialist');
        expect(document.getElementById('steckbrief-schwerpunkte').textContent).toContain('Spring Boot');
        expect(button('backend').classList.contains('active')).toBe(true);
        expect(button('all').classList.contains('active')).toBe(false);

        button('frontend').click();
        expect(document.getElementById('steckbrief-schwerpunkte').textContent).toContain('React');
        expect(document.querySelectorAll('.btn-filter.active')).toHaveLength(1);
    });

    it('uses the English label when the page language is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        initRecruiterFilter();
        button('frontend').click();
        expect(document.getElementById('steckbrief-position').textContent).toBe('Frontend Developer / Web Developer');
    });

    it('falls back to the generic profile for an unknown role', () => {
        initRecruiterFilter();
        button('backend').setAttribute('data-role', 'unbekannt');
        button('unbekannt').click();
        expect(document.getElementById('steckbrief-position').textContent).toBe(
            'Junior Software Developer / Web Developer'
        );
    });

    it('re-renders the active role after a language change', () => {
        initRecruiterFilter();
        button('backend').click();
        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new Event('langchange'));
        expect(document.getElementById('steckbrief-position').textContent).toBe('Backend Developer / Java Specialist');
    });

    it('lists the four most recently pushed non-fork repositories', async () => {
        const repo = (name, pushed_at, fork = false) => ({
            name,
            html_url: `https://github.com/someone/${name}`,
            pushed_at,
            fork,
        });
        fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                repo('alt', '2024-01-01T00:00:00Z'),
                repo('fork', '2026-05-01T00:00:00Z', true),
                repo('neu', '2026-04-01T00:00:00Z'),
                repo('b', '2025-01-01T00:00:00Z'),
                repo('c', '2025-06-01T00:00:00Z'),
                repo('d', '2025-09-01T00:00:00Z'),
            ],
        });
        initRecruiterFilter();
        await flush();
        const names = [...document.querySelectorAll('.git-activity-repo')].map((a) => a.textContent);
        expect(names).toEqual(['neu', 'd', 'c', 'b']);
        expect(globalThis.AppStorage.data.get('cache')).toBeTruthy();
    });

    it('shows repo names as text, never as markup', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                {
                    name: '<img src=x onerror=1>',
                    html_url: 'https://github.com/someone/x',
                    pushed_at: '2026-01-01T00:00:00Z',
                },
            ],
        });
        initRecruiterFilter();
        await flush();
        expect(document.querySelector('#live-git-list img')).toBeNull();
        expect(document.querySelector('.git-activity-repo').textContent).toBe('<img src=x onerror=1>');
    });

    it('says plainly that activity is unavailable when the request fails', async () => {
        initRecruiterFilter();
        await flush();
        expect(document.getElementById('live-git-list').textContent).toContain('nicht geladen werden');
        expect(document.querySelector('#live-git-list a').getAttribute('href')).toBe('https://github.com/someone');
    });
});
