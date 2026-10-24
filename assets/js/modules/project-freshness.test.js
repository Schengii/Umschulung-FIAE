// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import {
    AGING_AFTER_DAYS,
    STALE_AFTER_DAYS,
    describeFreshness,
    formatAge,
    initProjectFreshness,
    latestUpdate,
} from './project-freshness.js';

const now = new Date('2026-10-24T12:00:00.000Z');
const daysAgo = (days) => new Date(now.getTime() - days * 86_400_000).toISOString();

describe('describeFreshness', () => {
    it.each([undefined, null, '', 'gestern', 42, {}])('reports "unknown" for %j', (value) => {
        expect(describeFreshness(value, now)).toEqual({ level: 'unknown', days: 0, date: null });
    });

    it('counts whole days', () => {
        expect(describeFreshness(daysAgo(0), now).days).toBe(0);
        expect(describeFreshness(daysAgo(5.9), now).days).toBe(5);
    });

    it('is fresh up to the aging threshold, aging up to the stale threshold, stale beyond', () => {
        expect(describeFreshness(daysAgo(AGING_AFTER_DAYS), now).level).toBe('fresh');
        expect(describeFreshness(daysAgo(AGING_AFTER_DAYS + 1), now).level).toBe('aging');
        expect(describeFreshness(daysAgo(STALE_AFTER_DAYS), now).level).toBe('aging');
        expect(describeFreshness(daysAgo(STALE_AFTER_DAYS + 1), now).level).toBe('stale');
    });

    it('treats a date in the future as today', () => {
        expect(describeFreshness(daysAgo(-3), now)).toMatchObject({ level: 'fresh', days: 0 });
    });
});

describe('latestUpdate', () => {
    it('returns the newest valid date', () => {
        const latest = latestUpdate([
            { updatedAt: daysAgo(10) },
            { updatedAt: daysAgo(2) },
            { updatedAt: 'kaputt' },
            {},
        ]);
        expect(latest.toISOString()).toBe(daysAgo(2));
    });

    it.each([[[]], [null], [[{}, { updatedAt: 5 }]]])('returns null without a usable date (%j)', (projects) => {
        expect(latestUpdate(projects)).toBeNull();
    });
});

describe('formatAge', () => {
    it.each([
        [0, 'de', 'heute'],
        [1, 'de', 'gestern'],
        [12, 'de', 'vor 12 Tagen'],
        [0, 'en', 'today'],
        [1, 'en', 'yesterday'],
        [12, 'en', '12 days ago'],
    ])('%i days in %s', (days, lang, expected) => {
        expect(formatAge(days, lang)).toBe(expected);
    });
});

describe('project cards', () => {
    const CARDS = `
        <div id="dynamic-projects-container">
            <article class="project-card" data-repo-name="EcoChef"><div class="project-buttons"></div></article>
            <article class="project-card" data-repo-name="Alt"><div class="project-buttons"></div></article>
            <article class="project-card" data-repo-name="Eigenes"><div class="project-buttons"></div></article>
        </div>`;
    const lines = () => [...document.querySelectorAll('.project-updated')];

    beforeEach(() => {
        resetDocument(CARDS);
        window.projectsData = [
            { repoName: 'EcoChef', updatedAt: new Date().toISOString() },
            { repoName: 'Alt', updatedAt: new Date(Date.now() - 200 * 86_400_000).toISOString() },
        ];
    });

    afterEach(() => {
        delete window.projectsData;
    });

    it('does nothing on pages without the project container', () => {
        resetDocument('');
        expect(() => initProjectFreshness()).not.toThrow();
    });

    it('adds a bilingual "updated" line before the buttons of cards with a date', () => {
        initProjectFreshness();
        expect(lines()).toHaveLength(2);
        const first = lines()[0];
        expect(first.nextElementSibling.classList.contains('project-buttons')).toBe(true);
        expect(first.querySelector('[lang="de"]').textContent).toMatch(/^Stand: \d{1,2}\.\d{1,2}\.\d{4} \(heute\)$/);
        expect(first.querySelector('[lang="en"]').textContent).toContain('Updated: ');
        expect(first.classList.contains('project-updated-fresh')).toBe(true);
    });

    it('marks an old project as possibly outdated', () => {
        initProjectFreshness();
        const old = document.querySelector('[data-repo-name="Alt"] .project-updated');
        expect(old.classList.contains('project-updated-stale')).toBe(true);
        expect(old.textContent).toContain('evtl. veraltet');
        expect(old.textContent).toContain('may be outdated');
    });

    it('skips cards without a matching project or date and never adds a line twice', () => {
        initProjectFreshness();
        expect(document.querySelector('[data-repo-name="Eigenes"] .project-updated')).toBeNull();
        initProjectFreshness();
        expect(document.querySelectorAll('[data-repo-name="EcoChef"] .project-updated')).toHaveLength(1);
    });

    it('decorates cards that are rendered later, e.g. after filtering', async () => {
        initProjectFreshness();
        const container = document.getElementById('dynamic-projects-container');
        container.innerHTML =
            '<article class="project-card" data-repo-name="EcoChef"><div class="project-buttons"></div></article>';
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(container.querySelectorAll('.project-updated')).toHaveLength(1);
    });

    it('shows the newest date above the list, once', () => {
        initProjectFreshness();
        initProjectFreshness();
        const notes = document.querySelectorAll('#projects-data-freshness');
        expect(notes).toHaveLength(1);
        expect(notes[0].nextElementSibling.id).toBe('dynamic-projects-container');
        expect(notes[0].querySelector('[lang="de"]').textContent).toContain('Projektdaten zuletzt aktualisiert: ');
    });

    it('shows no note when no project has a date', () => {
        window.projectsData = [{ repoName: 'EcoChef' }];
        initProjectFreshness();
        expect(document.getElementById('projects-data-freshness')).toBeNull();
        expect(lines()).toHaveLength(0);
    });
});
