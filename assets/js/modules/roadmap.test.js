// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initRoadmap } from './roadmap.js';

const PAGE = `
    <ol>
        <li class="roadmap-item" data-phase="1">Phase 1</li>
        <li class="roadmap-item" data-phase="5">Phase 5</li>
        <li class="roadmap-item" data-phase="99">Unbekannt</li>
    </ol>
    <div id="roadmap-overlay"></div>
    <aside id="roadmap-drawer">
        <h3 id="drawer-title"></h3>
        <button id="roadmap-drawer-close" type="button">x</button>
        <div id="roadmap-drawer-content"></div>
    </aside>`;

const item = (phase) => document.querySelector(`.roadmap-item[data-phase="${phase}"]`);
const drawer = () => document.getElementById('roadmap-drawer');
const overlay = () => document.getElementById('roadmap-overlay');
const content = () => document.getElementById('roadmap-drawer-content');
const checkboxes = () => [...document.querySelectorAll('.topic-checkbox')];

let storage;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument(PAGE);
    document.body.style.overflow = '';
});
afterEach(() => {
    removePageGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('roadmap', () => {
    it('does nothing when the drawer markup is missing', () => {
        resetDocument('<li class="roadmap-item" data-phase="1">x</li>');
        expect(() => initRoadmap()).not.toThrow();
    });

    it('opens the drawer with the German title, topics and project links', () => {
        initRoadmap();
        item(1).click();

        expect(drawer().classList.contains('open')).toBe(true);
        expect(overlay().classList.contains('active')).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.getElementById('drawer-title').textContent).toMatch(/^Phase 1/);
        expect(checkboxes().length).toBeGreaterThan(0);
        expect(content().textContent).toContain('Kernkompetenzen');
        expect(content().querySelectorAll('a[href]')).toHaveLength(2);
    });

    it('uses English texts when the page language is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        initRoadmap();
        item(1).click();
        expect(content().textContent).toContain('Core Competencies');
        document.documentElement.removeAttribute('lang');
    });

    it('ignores phases without data', () => {
        initRoadmap();
        item(99).click();
        expect(drawer().classList.contains('open')).toBe(false);
    });

    it('closes through the close button, the overlay and Escape', () => {
        initRoadmap();
        for (const close of [
            () => document.getElementById('roadmap-drawer-close').click(),
            () => overlay().click(),
            () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
        ]) {
            item(1).click();
            close();
            expect(drawer().classList.contains('open')).toBe(false);
            expect(overlay().classList.contains('active')).toBe(false);
            expect(document.body.style.overflow).toBe('');
        }
    });

    it('stores the checklist state per phase and topic', () => {
        initRoadmap();
        item(5).click();
        const [first] = checkboxes();
        first.checked = true;
        first.dispatchEvent(new Event('change', { bubbles: true }));

        expect(storage.getItem('fiae_progress_phase_5_topic_0')).toBe('true');

        first.checked = false;
        first.dispatchEvent(new Event('change', { bubbles: true }));
        expect(storage.getItem('fiae_progress_phase_5_topic_0')).toBe('false');
    });

    it('restores the checked topics when a phase is opened again', () => {
        storage.setItem('fiae_progress_phase_1_topic_1', 'true');
        initRoadmap();
        item(1).click();
        const states = checkboxes().map((cb) => cb.checked);
        expect(states[0]).toBe(false);
        expect(states[1]).toBe(true);
    });

    it('escapes the code example', () => {
        initRoadmap();
        item(5).click();
        const code = content().querySelector('pre code');
        expect(code.querySelector('*')).toBeNull();
        expect(code.textContent).toContain('EcoChefMealPlanner');
    });

    it('copies the code and shows a confirmation for a moment', async () => {
        vi.useFakeTimers();
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
        initRoadmap();
        item(5).click();
        const button = document.getElementById('code-copy-btn');
        button.click();
        await Promise.resolve();
        await Promise.resolve();

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0][0]).toContain('EcoChefMealPlanner');
        expect(button.textContent).toContain('Kopiert!');

        vi.advanceTimersByTime(1500);
        expect(button.textContent).toContain('Kopieren');
    });
});
