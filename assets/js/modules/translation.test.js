// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initTranslation, translateAttributes } from './translation.js';

const PAGE = `
    <button id="lang-toggle" type="button"></button>
    <button id="close" aria-label="Schließen" data-en-aria-label="Close" title="Fenster schließen" data-en-title="Close window">x</button>
    <input id="search" placeholder="Suchen" data-en-placeholder="Search">`;
let storage;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument(PAGE);
});
afterEach(removePageGlobals);

const attr = (id, name) => document.getElementById(id).getAttribute(name);
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('translateAttributes', () => {
    it('writes the English value and keeps the German original', () => {
        translateAttributes(document, 'en');
        expect(attr('close', 'aria-label')).toBe('Close');
        expect(attr('close', 'title')).toBe('Close window');
        expect(attr('search', 'placeholder')).toBe('Search');
        expect(attr('close', 'data-de-aria-label')).toBe('Schließen');
    });

    it('switches back to German without losing the original', () => {
        translateAttributes(document, 'en');
        translateAttributes(document, 'de');
        expect(attr('close', 'aria-label')).toBe('Schließen');
        expect(attr('search', 'placeholder')).toBe('Suchen');
    });

    it('also translates the root element itself', () => {
        const button = document.getElementById('close');
        translateAttributes(button, 'en');
        expect(button.getAttribute('aria-label')).toBe('Close');
    });

    it('leaves attributes without an English counterpart alone', () => {
        document.body.insertAdjacentHTML('beforeend', '<a id="plain" title="Nur Deutsch">a</a>');
        translateAttributes(document, 'en');
        expect(attr('plain', 'title')).toBe('Nur Deutsch');
    });
});

describe('initTranslation', () => {
    it('does nothing without a language toggle', () => {
        resetDocument('');
        initTranslation();
        expect(document.documentElement.hasAttribute('lang')).toBe(false);
    });

    it('starts in the default language and labels the toggle for the opposite one', () => {
        initTranslation();
        expect(document.documentElement.getAttribute('lang')).toBe('de');
        expect(attr('lang-toggle', 'aria-label')).toBe('DE | EN: Switch to English');
    });

    it('restores the stored language on load', () => {
        storage.setItem('portfolio_lang', 'en');
        initTranslation();
        expect(document.documentElement.getAttribute('lang')).toBe('en');
        expect(attr('close', 'aria-label')).toBe('Close');
        expect(attr('lang-toggle', 'aria-label')).toBe('DE | EN: Auf Deutsch umstellen');
    });

    it('toggles the language, persists it and announces the change', () => {
        initTranslation();
        const events = [];
        document.addEventListener('langchange', (e) => events.push(['document', e.detail]));
        window.addEventListener('fiae:lang-change', (e) => events.push(['window', e.detail]));

        document.getElementById('lang-toggle').click();

        expect(document.documentElement.getAttribute('lang')).toBe('en');
        expect(storage.getItem('portfolio_lang')).toBe('en');
        expect(attr('search', 'placeholder')).toBe('Search');
        expect(events).toEqual([
            ['document', 'en'],
            ['window', { lang: 'en' }],
        ]);

        document.getElementById('lang-toggle').click();
        expect(document.documentElement.getAttribute('lang')).toBe('de');
        expect(attr('search', 'placeholder')).toBe('Suchen');
    });

    it('translates markup that is inserted after the init', async () => {
        storage.setItem('portfolio_lang', 'en');
        initTranslation();

        document.body.insertAdjacentHTML(
            'beforeend',
            '<button id="late" aria-label="Zurück" data-en-aria-label="Back">b</button>'
        );
        await tick();

        expect(attr('late', 'aria-label')).toBe('Back');
    });
});
