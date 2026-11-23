// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadClassicScript } from '../../../scripts/test-support/classic-script.js';
import {
    installPageGlobals,
    removePageGlobals,
    trackDocumentListeners,
} from '../../../scripts/test-support/dom-helpers.js';

const PAGE = `
    <input id="news-searchbar">
    <button class="btn-filter active" data-filter="all">Alle</button>
    <button class="btn-filter" data-filter="milestone">Meilensteine</button>
    <div id="news-articles-container"></div>
`;

const NEWS = [
    {
        id: 'alt',
        category: 'tech',
        date: '2026-01-05',
        title_de: 'Alter Artikel',
        title_en: 'Old article',
        content_de: ['Text über Vitest'],
        content_en: ['Text about Vitest'],
    },
    {
        id: 'neu',
        category: 'milestone',
        date: '2026-11-23',
        title_de: 'Neuer Artikel',
        title_en: 'New article',
        content_de: ['Ein Absatz', 'Noch einer'],
        content_en: ['A paragraph', 'Another one'],
    },
];

let untrack;
let storage;

function boot({ lang = 'de' } = {}) {
    storage = installPageGlobals();
    storage.setItem('portfolio_lang', lang);
    globalThis.newsData = NEWS;
    document.body.innerHTML = PAGE;
    const script = loadClassicScript('assets/js/news.js', ['formatNewsDate']);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    return script;
}

const titles = () => [...document.querySelectorAll('#news-articles-container h2')].map((h) => h.textContent);

beforeEach(() => {
    untrack = trackDocumentListeners();
    window.history.pushState({}, '', '/pages/news.html');
});

afterEach(() => {
    untrack();
    removePageGlobals();
    delete globalThis.newsData;
    delete window.showToast;
    delete window.addLiveCommit;
    vi.useRealTimers();
});

describe('news.js: Datum', () => {
    it('formatiert ISO-Daten je Sprache und lässt Ungültiges unverändert', () => {
        const { formatNewsDate } = boot();
        expect(formatNewsDate('2026-07-06', 'de')).toBe('06. Juli 2026');
        expect(formatNewsDate('2026-07-06', 'en')).toBe('July 06, 2026');
        expect(formatNewsDate('gestern', 'de')).toBe('gestern');
        expect(formatNewsDate('2026-13-45', 'de')).toBe('2026-13-45');
        expect(formatNewsDate(undefined, 'de')).toBe('');
    });
});

describe('news.js: Liste', () => {
    it('zeigt die Artikel mit dem neuesten zuerst und setzt den Such-Platzhalter', () => {
        boot();
        expect(titles()).toEqual(['Neuer Artikel', 'Alter Artikel']);
        expect(document.getElementById('news-searchbar').placeholder).toBe('News durchsuchen...');
        expect(document.querySelector('#neu time').getAttribute('datetime')).toBe('2026-11-23');
    });

    it('zeigt englische Texte, wenn die gespeicherte Sprache Englisch ist', () => {
        boot({ lang: 'en' });
        expect(titles()).toEqual(['New article', 'Old article']);
        expect(document.getElementById('news-searchbar').placeholder).toBe('Search news...');
    });

    it('filtert nach Kategorie über die Filter-Schaltflächen', () => {
        boot();
        document.querySelector('[data-filter="milestone"]').click();
        expect(titles()).toEqual(['Neuer Artikel']);
        expect(document.querySelector('[data-filter="milestone"]').classList.contains('active')).toBe(true);
        document.querySelector('[data-filter="all"]').click();
        expect(titles()).toHaveLength(2);
    });

    it('sucht in Titel und Text und hebt Treffer hervor', () => {
        boot();
        const input = document.getElementById('news-searchbar');
        input.value = 'vitest';
        input.dispatchEvent(new Event('input'));
        expect(titles()).toEqual(['Alter Artikel']);
        expect(document.querySelector('#alt mark').textContent).toBe('Vitest');
    });

    it('behandelt Sonderzeichen im Suchbegriff als Text und meldet leere Ergebnisse', () => {
        boot();
        const input = document.getElementById('news-searchbar');
        input.value = '(.*';
        input.dispatchEvent(new Event('input'));
        expect(document.querySelector('.news-no-results')).not.toBeNull();
        expect(titles()).toEqual([]);
    });

    it('rendert bei einem Sprachwechsel neu', () => {
        boot();
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(titles()).toEqual(['New article', 'Old article']);
        expect(document.getElementById('news-searchbar').getAttribute('aria-label')).toBe('Search news');
    });

    it('ruft die Blog-Erweiterungen nach dem Rendern auf, wenn vorhanden', () => {
        globalThis.initBlogEnhancements = vi.fn();
        boot();
        expect(globalThis.initBlogEnhancements).toHaveBeenCalled();
        delete globalThis.initBlogEnhancements;
    });
});

describe('news.js: Gefällt mir und Teilen', () => {
    it('schaltet „Gefällt mir“ um und speichert den Zustand', () => {
        boot();
        const button = document.querySelector('#neu .like-article-btn');
        button.click();
        expect(storage.getItem('news_likes_neu')).toBe('true');
        expect(button.querySelector('.like-count').textContent).toBe('1');
        expect(button.querySelector('i').className).toBe('fa-solid fa-thumbs-up');
        button.click();
        expect(storage.getItem('news_likes_neu')).toBe('false');
        expect(button.querySelector('.like-count').textContent).toBe('0');
    });

    it('zählt ein gespeichertes Like beim Rendern mit', () => {
        storage = installPageGlobals();
        storage.setItem('news_likes_neu', 'true');
        document.body.innerHTML = PAGE;
        globalThis.newsData = NEWS;
        loadClassicScript('assets/js/news.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(document.querySelector('#neu .like-count').textContent).toBe('1');
    });

    it('kopiert den Artikel-Link, zeigt ein Toast und zählt einen Commit', async () => {
        boot();
        const write = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: write } });
        window.showToast = vi.fn();
        window.addLiveCommit = vi.fn();
        document.querySelector('#neu .copy-article-btn').click();
        await Promise.resolve();
        expect(write).toHaveBeenCalledWith(expect.stringMatching(/\/pages\/news\.html#neu$/));
        expect(window.showToast).toHaveBeenCalledWith('Artikel-Link in die Zwischenablage kopiert!', 'success');
        expect(window.addLiveCommit).toHaveBeenCalled();
    });

    it('springt zu einem verlinkten Artikel und hebt ihn kurz hervor', () => {
        vi.useFakeTimers();
        window.history.pushState({}, '', '/pages/news.html#neu');
        boot();
        const article = document.getElementById('neu');
        article.scrollIntoView = vi.fn();
        vi.advanceTimersByTime(700);
        expect(article.scrollIntoView).toHaveBeenCalled();
        expect(article.classList.contains('highlight-flash')).toBe(true);
    });
});
