// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const PROJECTS = [
    {
        repoName: 'EcoChef',
        titleDe: 'EcoChef DE',
        titleEn: 'EcoChef EN',
        category: 'PWA',
        language: 'TypeScript',
        tags: ['Lit', 'Vite'],
        architectureBadges: [{ name: 'Offline-First', color: '#10b981' }],
        keyLearnings: {
            challengeDe: 'Offline-Sync',
            challengeEn: 'Offline sync',
            solutionDe: 'IndexedDB',
            solutionEn: 'IndexedDB (EN)',
        },
        link: 'https://example.org/ecochef',
    },
    { repoName: 'Minecraft', titleDe: 'Voxel DE', titleEn: 'Voxel EN', tags: ['C++'] },
    { repoName: 'Amazon', titleDe: 'Shop DE', titleEn: 'Shop EN' },
    { repoName: 'Finanz', titleDe: 'Finanz DE', titleEn: 'Finanz EN' },
];

const cards = () =>
    PROJECTS.map((p) => `<button class="btn-compare-select" data-repo="${p.repoName}">${p.repoName}</button>`).join('');

const el = (id) => document.getElementById(id);
const card = (repo) => document.querySelector(`.btn-compare-select[data-repo="${repo}"]`);
const bar = () => el('compare-floating-bar');
const grid = () => el('compare-content-grid');

/** The script is an IIFE that starts itself, so each test imports a fresh copy. */
async function start(path = '/pages/portfolio.html') {
    vi.resetModules();
    window.happyDOM.setURL(`https://example.org${path}`);
    resetDocument(cards());
    window.projectsData = PROJECTS;
    await import('./project_compare.js');
}

describe('project comparison', () => {
    let removeListeners;

    beforeEach(() => {
        removeListeners = trackDocumentListeners();
        document.documentElement.setAttribute('lang', 'de');
    });

    afterEach(() => {
        removeListeners();
        vi.unstubAllGlobals();
        delete window.projectsData;
    });

    it('stays off other pages', async () => {
        await start('/pages/home.html');
        expect(el('project-compare-drawer')).toBeNull();
        expect(bar()).toBeNull();
    });

    it('builds a closed drawer and a hidden floating bar on the portfolio page', async () => {
        await start();
        expect(el('project-compare-drawer').classList.contains('open')).toBe(false);
        expect(bar().classList.contains('hidden')).toBe(true);
    });

    it('counts selected projects in the page language, with singular and plural', async () => {
        await start();
        card('EcoChef').click();
        expect(bar().classList.contains('hidden')).toBe(false);
        expect(el('compare-count-text').textContent).toBe('1 Projekt vergleichen');
        card('Minecraft').click();
        expect(el('compare-count-text').textContent).toBe('2 Projekte vergleichen');

        document.documentElement.setAttribute('lang', 'en');
        card('Amazon').click();
        expect(el('compare-count-text').textContent).toBe('Compare 3 Projects');
    });

    it('toggles a project off again and hides the bar when nothing is selected', async () => {
        await start();
        card('EcoChef').click();
        expect(card('EcoChef').classList.contains('active')).toBe(true);
        card('EcoChef').click();
        expect(card('EcoChef').classList.contains('active')).toBe(false);
        expect(bar().classList.contains('hidden')).toBe(true);
    });

    it('allows at most three projects and warns about the fourth', async () => {
        const showToast = vi.fn();
        vi.stubGlobal('showToast', showToast);
        await start();
        for (const repo of ['EcoChef', 'Minecraft', 'Amazon', 'Finanz']) card(repo).click();
        expect(card('Finanz').classList.contains('active')).toBe(false);
        expect(el('compare-count-text').textContent).toBe('3 Projekte vergleichen');
        expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({ de: expect.any(String), en: expect.any(String) }),
            'warning'
        );
    });

    it('ignores a card whose project is unknown', async () => {
        await start();
        document.body.insertAdjacentHTML('beforeend', '<button class="btn-compare-select" data-repo="Nope">?</button>');
        card('Nope').click();
        expect(bar().classList.contains('hidden')).toBe(true);
    });

    it('opens the drawer from the bar and shows one column per project in the page language', async () => {
        await start();
        card('EcoChef').click();
        card('Minecraft').click();
        bar().click();
        expect(el('project-compare-drawer').classList.contains('open')).toBe(true);

        const columns = grid().querySelectorAll('.compare-column');
        expect(columns).toHaveLength(2);
        expect(columns[0].textContent).toContain('EcoChef DE');
        expect(columns[0].textContent).toContain('TypeScript');
        expect(columns[0].textContent).toContain('Offline-First');
        expect(columns[0].textContent).toContain('Offline-Sync');
        expect(columns[0].querySelector('a[target="_blank"]').getAttribute('href')).toBe('https://example.org/ecochef');
        expect(columns[0].querySelector('a[href^="projekt-detail.html?repo=EcoChef"]')).not.toBeNull();
    });

    it('falls back to defaults for missing fields and omits sections without data', async () => {
        await start();
        card('Amazon').click();
        bar().click();
        const column = grid().querySelector('.compare-column');
        expect(column.textContent).toContain('Web');
        expect(column.textContent).toContain('JavaScript');
        expect(column.textContent).toContain('Modulare Vanilla-Architektur');
        expect(column.textContent).not.toContain('Kern-Herausforderung');
        expect(column.querySelector('a[target="_blank"]')).toBeNull();
    });

    it('shows the other language when the page language is English', async () => {
        await start();
        document.documentElement.setAttribute('lang', 'en');
        card('EcoChef').click();
        bar().click();
        expect(grid().textContent).toContain('EcoChef EN');
        expect(grid().textContent).toContain('IndexedDB (EN)');
    });

    it('updates an open drawer on selection and removes a column with its own close button', async () => {
        await start();
        card('EcoChef').click();
        card('Minecraft').click();
        bar().click();
        card('Amazon').click();
        expect(grid().querySelectorAll('.compare-column')).toHaveLength(3);

        grid().querySelector('.compare-column-close[data-index="0"]').click();
        expect(grid().querySelectorAll('.compare-column')).toHaveLength(2);
        expect(card('EcoChef').classList.contains('active')).toBe(false);
        expect(el('compare-count-text').textContent).toBe('2 Projekte vergleichen');
    });

    it('closes the drawer with its close button', async () => {
        await start();
        card('EcoChef').click();
        bar().click();
        el('compare-drawer-close').click();
        expect(el('project-compare-drawer').classList.contains('open')).toBe(false);
    });
});
