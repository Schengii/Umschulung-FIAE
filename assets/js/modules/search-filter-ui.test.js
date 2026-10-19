// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initAgeCalculator, calculateAge } from './age-calculator.js';

// DOM half of search-filter.js (the pure matchesCardFilter lives in search-filter.test.js)
// and of age-calculator.js.

const PAGE = `
    <main>
        <input id="searchbar">
        <button class="btn-filter active" data-filter="all">Alle</button>
        <button class="btn-filter" data-filter="java">Java</button>
        <div class="card filter-java" id="c1">Spring Boot REST</div>
        <div class="card filter-web" id="c2">Vanilla JavaScript PWA</div>
        <div class="card2 filter-java filter-web" id="c3">Java und Web</div>
    </main>`;

// search-filter.js keeps the active category and query in module state: every test loads a fresh copy.
async function initSearchAndFilter() {
    vi.resetModules();
    const module = await import('./search-filter.js');
    module.initSearchAndFilter();
}

const $ = (selector) => document.querySelector(selector);
const visible = () =>
    [...document.querySelectorAll('.card, .card2')]
        .filter((card) => card.style.display !== 'none')
        .map((card) => card.id);
const search = (text) => {
    $('#searchbar').value = text;
    $('#searchbar').dispatchEvent(new Event('input'));
};
const noResults = () => $('.no-results');

beforeEach(() => {
    installPageGlobals();
    window.happyDOM.setURL('http://localhost/pages/portfolio.html');
    resetDocument(PAGE);
});
afterEach(removePageGlobals);

describe('search and filter: setup', () => {
    it('stays inactive on pages that are not searchable', async () => {
        window.happyDOM.setURL('http://localhost/pages/impressum.html');
        await initSearchAndFilter();
        search('xyz');
        expect(visible()).toEqual(['c1', 'c2', 'c3']);
        expect(noResults()).toBeNull();
    });

    it('creates the bilingual "no results" block on searchable pages', async () => {
        await initSearchAndFilter();
        expect(noResults()).not.toBeNull();
        expect(noResults().querySelector('h2[lang="de"]')).not.toBeNull();
        expect(noResults().querySelector('h2[lang="en"]')).not.toBeNull();
    });
});

describe('search and filter: filtering', () => {
    it('narrows the cards by search text, ignoring case and surrounding blanks', async () => {
        await initSearchAndFilter();
        search('  JAVA  ');
        expect(visible()).toEqual(['c2', 'c3']);
        search('pwa');
        expect(visible()).toEqual(['c2']);
    });

    it('filters by category button and marks the active button', async () => {
        await initSearchAndFilter();
        document.querySelector('[data-filter="java"]').click();

        expect(visible()).toEqual(['c1', 'c3']);
        expect(document.querySelector('[data-filter="java"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('[data-filter="all"]').classList.contains('active')).toBe(false);
    });

    it('combines category and search text', async () => {
        await initSearchAndFilter();
        document.querySelector('[data-filter="java"]').click();
        search('spring');
        expect(visible()).toEqual(['c1']);
    });

    it('shows the "no results" block only while a filter is active and nothing matches', async () => {
        await initSearchAndFilter();
        expect(noResults().style.display).not.toBe('block');

        search('gibt-es-nicht');
        expect(visible()).toEqual([]);
        expect(noResults().style.display).toBe('block');

        search('');
        expect(visible()).toEqual(['c1', 'c2', 'c3']);
        expect(noResults().style.display).toBe('none');
    });

    it('leaves the cards of the welcome page alone', async () => {
        document.body.insertAdjacentHTML('beforeend', '<button id="mySubmit">Los</button>');
        await initSearchAndFilter();
        search('gibt-es-nicht');
        expect(visible()).toEqual(['c1', 'c2', 'c3']);
    });
});

describe('age calculator', () => {
    it('writes the current age into every age placeholder', () => {
        document.body.innerHTML = '<span id="my-age"></span><span id="my-age-en"></span><span id="my-age-de"></span>';
        initAgeCalculator();
        const expected = String(calculateAge(2002, 5, 10));
        expect(['my-age', 'my-age-en', 'my-age-de'].map((id) => document.getElementById(id).textContent)).toEqual([
            expected,
            expected,
            expected,
        ]);
    });

    it('does nothing on pages without a placeholder', () => {
        document.body.innerHTML = '';
        expect(() => initAgeCalculator()).not.toThrow();
    });
});
