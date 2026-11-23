// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadClassicScript } from '../../../scripts/test-support/classic-script.js';
import { trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const PAYLOAD = '<img src=x onerror="window.__xss=1">';
let untrack;

function openModalWith(dataset, { projectsData } = {}) {
    const attrs = Object.entries(dataset)
        .map(([name, value]) => `data-${name}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
        .join(' ');
    document.body.innerHTML = `
        <div id="project-modal" class="hidden"><div class="modal-content"><button class="modal-close">x</button><div id="modal-body"></div></div></div>
        <article class="project-card" ${attrs}><span id="card-body">Karte</span><a id="card-link" href="#">Link</a><button id="plain-button">Knopf</button><button class="btn-details" id="details">Details</button></article>
    `;
    window.projectsData = projectsData;
    loadClassicScript('assets/js/modal.js');
    document.getElementById('card-body').click();
    return document.getElementById('modal-body');
}

const modal = () => document.getElementById('project-modal');

beforeEach(() => {
    untrack = trackDocumentListeners();
    delete globalThis.__xss;
    window.history.pushState({}, '', '/pages/portfolio.html');
    document.documentElement.setAttribute('lang', 'de');
});

afterEach(() => {
    untrack();
    delete window.projectsData;
    delete window.openProjectModal;
    delete window.closeProjectModal;
    vi.useRealTimers();
});

describe('modal.js: Escaping', () => {
    it('zeigt Titel und Beschreibung als Text statt als Markup', () => {
        const body = openModalWith({
            'title-de': PAYLOAD,
            'title-en': PAYLOAD,
            'desc-de': PAYLOAD,
            'desc-en': PAYLOAD,
        });
        expect(body.querySelector('img')).toBeNull();
        expect(body.querySelector('h2')?.textContent).toBe(PAYLOAD);
    });

    it('escaped Tags und Bild-Alt-Text', () => {
        const body = openModalWith({
            'title-de': PAYLOAD,
            images: encodeURIComponent(JSON.stringify(['assets/images/x.png'])),
            tags: encodeURIComponent(JSON.stringify([PAYLOAD])),
        });
        expect(body.querySelector('.tech-tag')?.textContent).toBe(PAYLOAD);
        expect(body.querySelectorAll('img')).toHaveLength(1);
        expect(body.querySelector('img')?.getAttribute('alt')).toBe(PAYLOAD);
    });

    it('entschärft javascript:-Links und Attribut-Ausbrüche', () => {
        const body = openModalWith({
            'title-de': 'Projekt',
            link: 'javascript:alert(1)',
            github: 'https://example.com/"><script>1</script>',
        });
        const hrefs = [...body.querySelectorAll('a.btn-project')].map((a) => a.getAttribute('href'));
        expect(hrefs[0]).toBe('#');
        expect(hrefs[1]).toBe('https://example.com/"><script>1</script>');
        expect(body.querySelector('script')).toBeNull();
    });

    it('escaped Key-Learnings und Architektur-Badges aus den Projektdaten', () => {
        const body = openModalWith(
            { 'title-de': 'P', 'repo-name': 'demo' },
            {
                projectsData: [
                    {
                        repoName: 'demo',
                        architectureBadges: [{ name: PAYLOAD, color: '#123456' }],
                        keyLearnings: {
                            challengeDe: PAYLOAD,
                            challengeEn: PAYLOAD,
                            solutionDe: PAYLOAD,
                            solutionEn: PAYLOAD,
                            architectureHighlightsDe: [PAYLOAD, 'Zweiter'],
                            architectureHighlightsEn: ['Second'],
                        },
                    },
                ],
            }
        );
        expect(body.querySelector('img')).toBeNull();
        expect(body.querySelector('.architecture-badges-container .badge').textContent).toContain(PAYLOAD);
        const items = [...body.querySelectorAll('.key-learnings-card li')];
        expect(items).toHaveLength(2);
        expect(items[1].querySelector('[lang="en"]').textContent).toBe('Zweiter');
    });
});

describe('modal.js: Öffnen und Schließen', () => {
    it('öffnet über die Karte, sperrt das Scrollen und setzt den URL-Hash', () => {
        openModalWith({ 'title-de': 'Mein Projekt!', 'title-en': 'My project' });
        expect(modal().classList.contains('show')).toBe(true);
        expect(modal().classList.contains('hidden')).toBe(false);
        expect(document.body.style.overflow).toBe('hidden');
        expect(window.location.hash).toBe('#MeinProjekt');
    });

    it('zeigt Platzhaltertexte, wenn Beschreibungen fehlen', () => {
        const body = openModalWith({ 'title-de': 'Ohne' });
        expect(body.querySelector('p[lang="de"]').textContent).toBe('Keine Beschreibung verfügbar.');
        expect(body.querySelector('p[lang="en"]').textContent).toBe('No description available.');
    });

    it('öffnet nicht bei Klick auf einen Link oder anderen Knopf, wohl aber über „Details“', () => {
        openModalWith({ 'title-de': 'P' });
        modal().classList.remove('show');
        document.getElementById('card-link').click();
        document.getElementById('plain-button').click();
        expect(modal().classList.contains('show')).toBe(false);
        document.getElementById('details').click();
        expect(modal().classList.contains('show')).toBe(true);
    });

    it('schließt per Schließen-Knopf, Overlay, Knopf im Inhalt und Escape und blendet danach aus', () => {
        vi.useFakeTimers();
        openModalWith({ 'title-de': 'P' });
        document.querySelector('.modal-close').click();
        expect(modal().classList.contains('show')).toBe(false);
        expect(document.body.style.overflow).toBe('');
        expect(window.location.hash).toBe('');
        vi.advanceTimersByTime(400);
        expect(modal().classList.contains('hidden')).toBe(true);

        window.openProjectModal(document.querySelector('.project-card'));
        modal().dispatchEvent(new Event('click', { bubbles: true }));
        expect(modal().classList.contains('show')).toBe(false);

        window.openProjectModal(document.querySelector('.project-card'));
        document.getElementById('modal-close-inner').click();
        expect(modal().classList.contains('show')).toBe(false);

        window.openProjectModal(document.querySelector('.project-card'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().classList.contains('show')).toBe(false);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    it('bleibt sichtbar, wenn das Modal vor Ablauf der Wartezeit erneut geöffnet wird', () => {
        vi.useFakeTimers();
        openModalWith({ 'title-de': 'P' });
        window.closeProjectModal();
        window.openProjectModal(document.querySelector('.project-card'));
        vi.advanceTimersByTime(400);
        expect(modal().classList.contains('hidden')).toBe(false);
    });

    it('tut auf Seiten ohne Modal nichts', () => {
        document.body.innerHTML = '<p>ohne Modal</p>';
        loadClassicScript('assets/js/modal.js');
        expect(window.openProjectModal).toBeUndefined();
    });
});

describe('modal.js: Medien', () => {
    const IMAGES = encodeURIComponent(JSON.stringify(['a.png', 'b.png', 'c.png']));

    it('baut ein Karussell mit Pfeilen und Punkten, die im Kreis blättern', () => {
        const body = openModalWith({ 'title-de': 'P', images: IMAGES });
        const track = body.querySelector('#modal-carousel-track');
        expect(body.querySelectorAll('.carousel-slide-img')).toHaveLength(3);
        const dots = () => [...body.querySelectorAll('.carousel-dot')].map((d) => d.classList.contains('active'));
        body.querySelector('#carousel-next').click();
        expect(track.style.transform).toBe('translateX(-100%)');
        expect(dots()).toEqual([false, true, false]);
        body.querySelector('#carousel-prev').click();
        body.querySelector('#carousel-prev').click();
        expect(track.style.transform).toBe('translateX(-200%)');
        body.querySelector('#carousel-next').click();
        expect(dots()).toEqual([true, false, false]);
        body.querySelectorAll('.carousel-dot')[2].click();
        expect(dots()).toEqual([false, false, true]);
    });

    it('fällt bei kaputtem Bild-JSON auf das Einzelbild zurück', () => {
        const body = openModalWith({ 'title-de': 'P', images: '%7Bkaputt', image: 'single.png' });
        expect(body.querySelectorAll('img')).toHaveLength(1);
        expect(body.querySelector('img').getAttribute('src')).toBe('single.png');
    });

    it('ignoriert kaputte Tags und nutzt resolveAssetPath, wenn vorhanden', () => {
        window.resolveAssetPath = (p) => `/aufgeloest/${p}`;
        const body = openModalWith({
            'title-de': 'P',
            tags: '%7Bkaputt',
            images: encodeURIComponent(JSON.stringify(['one.png'])),
            link: 'demo.html',
        });
        delete window.resolveAssetPath;
        expect(body.querySelector('.tech-tags')).toBeNull();
        expect(body.querySelector('img').getAttribute('src')).toBe('/aufgeloest/one.png');
        expect(body.querySelector('a.btn-project').getAttribute('href')).toBe('/aufgeloest/demo.html');
    });

    it('zeigt eine Video-Playlist und wechselt das Video per Schaltfläche', () => {
        const play = vi.fn(() => Promise.resolve());
        window.HTMLVideoElement.prototype.play = play;
        const playlist = [
            { url: 'v1.mp4', titleDe: 'Eins', titleEn: 'One', descDe: 'Beschreibung eins', descEn: 'Description one' },
            { url: 'v2.mp4', titleDe: 'Zwei', titleEn: 'Two', descDe: 'Beschreibung zwei', descEn: 'Description two' },
        ];
        const body = openModalWith(
            { 'title-de': 'P', 'repo-name': 'demo' },
            { projectsData: [{ repoName: 'demo', videoPlaylist: playlist }] }
        );
        const player = body.querySelector('#modal-video-player');
        expect(player.getAttribute('src')).toBe('v1.mp4');
        expect(body.querySelector('#modal-video-description').textContent.trim()).toBe('Beschreibung eins');

        const buttons = body.querySelectorAll('.video-select-btn');
        expect(buttons).toHaveLength(2);
        buttons[1].click();
        expect(player.getAttribute('src')).toBe('v2.mp4');
        expect(play).toHaveBeenCalled();
        expect(body.querySelector('#modal-video-description').textContent).toBe('Beschreibung zwei');
        expect(buttons[1].classList.contains('active')).toBe(true);
        expect(buttons[0].classList.contains('active')).toBe(false);
    });
});
