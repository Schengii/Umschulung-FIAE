// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initBlogEnhancements } from './blog-enhancements.js';
import { initImpressumEnhancements } from './impressum-enhancements.js';
import { initPraktikumsbetriebMedia } from './praktikumsbetrieb-media.js';

const $ = (id) => document.getElementById(id);

beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.lang = 'de';
});

describe('blog-enhancements', () => {
    const article = (n) =>
        `<article class="card"><h2>Titel ${n}</h2><h5>2026-01-0${n}</h5><p>${'wort '.repeat(450)}</p></article>`;

    it('tut ohne Artikel nichts', () => {
        expect(() => initBlogEnhancements()).not.toThrow();
    });

    it('ergänzt Lesezeit und Teilen-Leiste je Artikel, ohne Duplikate bei erneutem Aufruf', () => {
        document.body.innerHTML = article(1) + article(2);
        initBlogEnhancements();
        initBlogEnhancements();

        const articles = document.querySelectorAll('article.card');
        expect(articles).toHaveLength(2);
        for (const a of articles) {
            expect(a.querySelectorAll('.reading-time-badge')).toHaveLength(1);
            expect(a.querySelectorAll('.social-share-buttons')).toHaveLength(1);
            expect(a.querySelector('.reading-time-badge span[lang="de"]').textContent).toMatch(/^\d+ Min\. Lesezeit$/);
            expect(a.querySelector('.reading-time-badge span[lang="en"]').textContent).toMatch(/^\d+ min read$/);
        }
        // Externe Links öffnen sicher.
        for (const link of document.querySelectorAll('.share-btn[target="_blank"]')) {
            expect(link.getAttribute('rel')).toContain('noopener');
        }
    });

    it('kopiert den Link und zeigt kurz ein Häkchen', async () => {
        vi.useFakeTimers();
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true });
        document.body.innerHTML = article(1);
        initBlogEnhancements();

        const copy = document.querySelector('.share-copy');
        copy.click();
        await Promise.resolve();
        await Promise.resolve();
        expect(writeText).toHaveBeenCalledWith(window.location.href);
        expect(copy.innerHTML).toContain('fa-check');
        vi.advanceTimersByTime(2100);
        expect(copy.innerHTML).toContain('fa-link');
        vi.useRealTimers();
    });
});

describe('impressum-enhancements', () => {
    it('lädt die Karte erst nach Klick (2-Klick-Lösung)', () => {
        document.body.innerHTML = `
            <div class="map-2click-container" data-map-src="https://maps.example/embed" data-title="Karte">
                <button class="btn-load-map">Laden</button>
            </div>`;
        // happy-dom meldet echte iframe-Navigation als Fehler im Testlog; ein <div> genügt zur Prüfung.
        const realCreate = document.createElement.bind(document);
        const created = [];
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = realCreate(tag === 'iframe' ? 'div' : tag);
            if (tag === 'iframe') created.push(el);
            return el;
        });
        initImpressumEnhancements();
        expect(created).toHaveLength(0);

        document.querySelector('.btn-load-map').click();
        expect(created).toHaveLength(1);
        expect(created[0].getAttribute('src')).toBe('https://maps.example/embed');
        expect(created[0].getAttribute('title')).toBe('Karte');
        expect(document.querySelector('.btn-load-map')).toBeNull();
        expect(document.querySelector('.map-2click-container').contains(created[0])).toBe(true);
        vi.restoreAllMocks();
    });

    it('ignoriert Karten ohne Quelle', () => {
        document.body.innerHTML = '<div class="map-2click-container"><button class="btn-load-map"></button></div>';
        initImpressumEnhancements();
        document.querySelector('.btn-load-map').click();
        expect(document.querySelector('iframe')).toBeNull();
    });

    it('wählt einen Termin, bestätigt ihn und zeigt die Erfolgsmeldung', () => {
        document.body.innerHTML = `
            <div id="booking-slots-container">
                <button class="btn-slot" data-time="09:00"></button><button class="btn-slot" data-time="10:00"></button>
            </div>
            <button id="confirm-booking-btn" style="display:none"></button>
            <div id="booking-success" style="display:none"></div>`;
        initImpressumEnhancements();

        $('confirm-booking-btn').click();
        expect($('booking-success').style.display).toBe('none');

        const [first, second] = document.querySelectorAll('.btn-slot');
        first.click();
        second.click();
        expect(first.classList.contains('active')).toBe(false);
        expect(second.classList.contains('active')).toBe(true);
        expect($('confirm-booking-btn').style.display).toBe('block');

        $('confirm-booking-btn').click();
        expect($('booking-slots-container').style.display).toBe('none');
        expect($('booking-success').style.display).toBe('block');
    });
});

describe('praktikumsbetrieb-media', () => {
    afterEach(() => vi.useRealTimers());

    it('tut außerhalb der Praktikumsseite nichts', () => {
        document.body.innerHTML = '<div id="dfg-gallery-tabs"></div>';
        initPraktikumsbetriebMedia();
        expect($('dfg-gallery-tabs').children).toHaveLength(0);
    });

    it('baut die DFG-Galerie, wechselt per Tab und folgt der Sprache', () => {
        vi.useFakeTimers();
        document.body.innerHTML = `
            <section id="dfg-gallery-section"></section>
            <div id="dfg-gallery-tabs"></div><img id="dfg-gallery-img" alt="">
            <div id="dfg-gallery-title"></div><div id="dfg-gallery-desc"></div>`;
        initPraktikumsbetriebMedia();

        const tabs = document.querySelectorAll('#dfg-gallery-tabs .gallery-tab-btn');
        expect(tabs.length).toBeGreaterThan(1);
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        const firstTitle = $('dfg-gallery-title').textContent;

        tabs[1].click();
        vi.advanceTimersByTime(200);
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
        expect(tabs[0].getAttribute('aria-selected')).toBe('false');
        expect($('dfg-gallery-title').textContent).not.toBe(firstTitle);
        expect($('dfg-gallery-img').alt).not.toBe('');

        const germanTitle = $('dfg-gallery-title').textContent;
        document.documentElement.lang = 'en';
        document.dispatchEvent(new window.Event('langchange'));
        expect($('dfg-gallery-title').textContent).not.toBe(germanTitle);
    });

    it('baut die EcoChef-Playlist und schaltet das aktive Stück um', () => {
        document.body.innerHTML = `
            <section id="dfg-gallery-section"></section>
            <video id="ecochef-video-player"></video>
            <div id="ecochef-video-tracks"></div>
            <div id="ecochef-video-current-title"></div><div id="ecochef-video-current-desc"></div>`;
        const video = $('ecochef-video-player');
        video.load = vi.fn();
        initPraktikumsbetriebMedia();

        const tracks = document.querySelectorAll('.playlist-track-btn');
        expect(tracks.length).toBeGreaterThan(1);
        expect(tracks[0].getAttribute('aria-current')).toBe('true');

        tracks[1].click();
        expect(tracks[1].getAttribute('aria-current')).toBe('true');
        expect(tracks[0].hasAttribute('aria-current')).toBe(false);
        expect(video.getAttribute('src')).toContain('.mp4');
        expect(video.load).toHaveBeenCalled();
    });

    it('simuliert den ElektroCheck-Scan: Laufzustand, Ergebnisse, Zurücksetzen, Sprachwechsel', () => {
        vi.useFakeTimers();
        window.addLiveCommit = vi.fn();
        document.body.innerHTML = `
            <section id="dfg-gallery-section"></section>
            <button id="run-scanner-btn"></button><button id="clear-scanner-btn" disabled></button>
            <div id="scanner-laser"></div><div id="scanner-status"></div>
            <div id="scanner-results-card" class="collapsed"></div><div id="scanner-results-list"></div>`;
        initPraktikumsbetriebMedia();

        $('run-scanner-btn').click();
        expect($('run-scanner-btn').disabled).toBe(true);
        expect($('scanner-laser').classList.contains('active')).toBe(true);
        expect($('scanner-status').textContent).toContain('analysiert');

        vi.advanceTimersByTime(2300);
        expect($('scanner-laser').classList.contains('active')).toBe(false);
        expect($('scanner-results-card').classList.contains('collapsed')).toBe(false);
        expect($('scanner-results-list').querySelectorAll('.scanner-result-item')).toHaveLength(2);
        expect($('clear-scanner-btn').disabled).toBe(false);
        expect(window.addLiveCommit).toHaveBeenCalledTimes(1);

        document.documentElement.lang = 'en';
        document.dispatchEvent(new window.Event('langchange'));
        expect($('scanner-status').textContent).toContain('Analysis completed');

        $('clear-scanner-btn').click();
        expect($('scanner-results-card').classList.contains('collapsed')).toBe(true);
        expect($('run-scanner-btn').disabled).toBe(false);
        expect($('scanner-status').textContent).toContain('Ready for analysis');
    });
});
