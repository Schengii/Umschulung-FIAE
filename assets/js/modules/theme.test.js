// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initTheme } from './theme.js';

const PAGE = '<button id="theme-toggle" type="button"><i></i></button>';
let storage;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument(PAGE);
});
afterEach(removePageGlobals);

describe('theme', () => {
    it('does nothing on pages without a theme toggle', () => {
        resetDocument('');
        initTheme();
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('keeps the theme components.js already resolved and shows the matching icon', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        initTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(document.querySelector('#theme-toggle i').className).toBe('fa-solid fa-moon');
    });

    it('falls back to the stored theme, then to dark', () => {
        storage.setItem('portfolio_theme', 'light');
        initTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        resetDocument(PAGE);
        storage.removeItem('portfolio_theme');
        initTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.querySelector('#theme-toggle i').className).toBe('fa-solid fa-sun');
    });

    it('toggles, persists the choice and announces it', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        initTheme();
        const events = [];
        window.addEventListener('fiae:theme-change', (e) => events.push(['window', e.detail]));
        document.addEventListener('themechange', (e) => events.push(['document', e.detail]));

        document.getElementById('theme-toggle').click();

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(storage.getItem('portfolio_theme')).toBe('light');
        expect(events).toEqual([
            ['window', { theme: 'light' }],
            ['document', 'light'],
        ]);

        document.getElementById('theme-toggle').click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('translates the icon title when the language changes', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        initTheme();
        const icon = document.querySelector('#theme-toggle i');
        expect(icon.getAttribute('title')).toBe('Zu hellem Design wechseln');

        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange'));
        expect(icon.getAttribute('title')).toBe('Switch to light theme');
    });
});
