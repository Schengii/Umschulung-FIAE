// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';

// command_palette.js is a self-starting IIFE: importing it builds one overlay and registers
// one global key handler. It is imported once and every test starts with the palette closed.

const $ = (selector) => document.querySelector(selector);
const overlay = () => $('#command-palette-overlay');
const input = () => $('#command-palette-input');
const items = () => [...document.querySelectorAll('.command-palette-item')];
const titles = () => items().map((li) => li.querySelector('.item-title').textContent);
const isOpen = () => overlay().classList.contains('open');
const pressKey = (key, options = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    document.dispatchEvent(event);
    return event;
};
const openPalette = () => pressKey('k', { ctrlKey: true });
const type = (text) => {
    input().value = text;
    input().dispatchEvent(new Event('input', { bubbles: true }));
};

beforeAll(async () => {
    window.happyDOM.setURL('http://localhost/index.html');
    // The catalogue script cannot be fetched in the test; report it as loaded instead of failing.
    window.happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
    await import('./command_palette.js');
    await Promise.resolve();
});

beforeEach(() => {
    delete window.projectsData;
    delete window._cachedProjectsData;
    document.documentElement.removeAttribute('lang');
});
afterEach(() => {
    if (isOpen()) pressKey('Escape');
    document.querySelectorAll('script').forEach((script) => script.remove());
});

describe('command palette', () => {
    // Must stay the first test: the catalogue is requested on the first opening only.
    it('loads the project catalogue only when the palette is first used', () => {
        expect(document.querySelectorAll('script')).toHaveLength(0);
        openPalette();
        const script = $('script');
        expect(script.getAttribute('src')).toBe('assets/js/projects_data.js');

        // once the script has run, the open palette shows the projects
        window.projectsData = [{ repoName: 'Spaet', titleDe: 'Spät geladen', category: 'web' }];
        script.onload();
        type('spät');
        expect(titles()).toEqual(['Spät geladen']);
    });

    it('builds an accessible modal dialog that is visible after the stylesheet step', () => {
        expect(overlay().getAttribute('role')).toBe('dialog');
        expect(overlay().getAttribute('aria-modal')).toBe('true');
        expect(overlay().hidden).toBe(false);
        expect(isOpen()).toBe(false);
    });

    it('opens with Ctrl+K or Cmd+K and lists the first eight pages', () => {
        const event = openPalette();
        expect(event.defaultPrevented).toBe(true);
        expect(isOpen()).toBe(true);
        expect(items()).toHaveLength(8);
        expect(items()[0].classList.contains('active')).toBe(true);

        pressKey('Escape');
        pressKey('K', { metaKey: true });
        expect(isOpen()).toBe(true);
    });

    it('toggles closed with a second Ctrl+K and with Escape', () => {
        openPalette();
        openPalette();
        expect(isOpen()).toBe(false);

        openPalette();
        pressKey('Escape');
        expect(isOpen()).toBe(false);
    });

    it('closes when the backdrop is clicked but not when the modal is', () => {
        openPalette();
        $('.command-palette-modal').click();
        expect(isOpen()).toBe(true);
        overlay().click();
        expect(isOpen()).toBe(false);
    });

    it('prefixes page links with pages/ when it runs on a root page', () => {
        openPalette();
        items()[0].click();
        expect(window.location.href).toBe('http://localhost/pages/home.html');
        window.happyDOM.setURL('http://localhost/index.html');
    });

    it('filters by title and category, ignoring case', () => {
        openPalette();
        type('git');
        expect(titles()).toEqual(['Git Branching Simulator (CRT Terminal)']);

        type('KARRIERE');
        expect(titles()).toEqual(['Lebenslauf & Zeugnisse', 'Interaktiver Bewerbungs-Trainer']);
    });

    it('searches the English titles when the page is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        openPalette();
        type('flashcards');
        expect(titles()).toEqual(['IHK Flashcards']);
    });

    it('shows the search text as text, never as markup', () => {
        openPalette();
        type('<img src=x onerror=alert(1)>');
        expect(items()).toHaveLength(0);
        expect($('#command-palette-results strong').textContent).toBe('<img src=x onerror=alert(1)>');
        expect($('#command-palette-results img')).toBeNull();
        expect($('#command-palette-results').textContent).toContain('Keine passenden Einträge');
    });

    it('moves the selection with the arrow keys and wraps around', () => {
        openPalette();
        type('o');
        const count = items().length;
        expect(count).toBeGreaterThan(2);
        const active = () => items().findIndex((li) => li.classList.contains('active'));
        document.querySelectorAll('.command-palette-item').forEach((li) => (li.scrollIntoView = () => {}));

        pressKey('ArrowDown');
        expect(active()).toBe(1);
        pressKey('ArrowUp');
        pressKey('ArrowUp');
        expect(active()).toBe(count - 1);
        pressKey('ArrowDown');
        expect(active()).toBe(0);
    });

    it('opens the selected entry with Enter', () => {
        openPalette();
        type('playground');
        pressKey('Enter');
        expect(window.location.href).toBe('http://localhost/pages/playground.html');
        window.happyDOM.setURL('http://localhost/index.html');
    });

    it('adds the projects of the catalogue and finds them by tag', () => {
        window.projectsData = [
            {
                repoName: 'Demo Repo',
                titleDe: 'Demo-Projekt',
                titleEn: 'Demo project',
                category: 'web',
                tags: ['Rust', 'WASM'],
            },
        ];
        openPalette();
        type('wasm');
        expect(titles()).toEqual(['Demo-Projekt']);

        items()[0].click();
        expect(window.location.href).toBe('http://localhost/pages/projekt-detail.html?repo=Demo%20Repo');
        window.happyDOM.setURL('http://localhost/index.html');
    });
});
