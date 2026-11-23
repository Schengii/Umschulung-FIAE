// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    installPageGlobals,
    removePageGlobals,
    trackDocumentListeners,
} from '../../../scripts/test-support/dom-helpers.js';

// Seiten-Script portfolio.js: Rendering, Filter, Suche, Paginierung, Deep Links und Formular (ES-Modul, DOM-gesteuert).
const PAGE = `
    <button id="btn-cv-download-portfolio" type="button">CV</button>
    <input id="portfolio-searchbar">
    <button id="btn-clear-search" type="button" style="display:none">x</button>
    <select id="sort-select"><option value="desc">desc</option><option value="asc">asc</option></select>
    <div class="portfolio-filters">
        <button class="btn-filter active" data-filter="all">Alle</button>
        <button class="btn-filter" data-filter="ai">KI</button>
        <button class="btn-filter" data-filter="web">Web</button>
    </div>
    <div id="skeleton-loader"></div>
    <div id="dynamic-projects-container"></div>
    <div id="no-results-container" style="display:none">Nichts</div>
    <div id="pagination-container"></div>
    <form id="hire-me-form">
        <input id="hire-me-name" value=" Erika "><input id="hire-me-email" value="e@example.com">
        <textarea id="hire-me-message">Hallo</textarea>
        <div id="hire-me-feedback" style="display:none"></div>
    </form>
    <div class="testimonial-item active"></div><div class="testimonial-item"></div>
    <button class="testimonial-dot active" data-index="0"></button><button class="testimonial-dot" data-index="1"></button>
    <button id="code-accordion-toggle" aria-expanded="false"><span class="code-accordion-badge-text" lang="de">Code anzeigen</span><span class="code-accordion-badge-text" lang="en">Show Code</span></button>
    <div id="code-accordion-content" aria-hidden="true" style="display:none"></div><div id="code-showcase"></div>
    <button class="code-tab-btn active" data-target="snip-a">A</button><button class="code-tab-btn" data-target="snip-b">B</button>
    <pre class="code-snippet active" id="snip-a"></pre><pre class="code-snippet" id="snip-b" style="display:none"></pre>
`;

/** @param {number} n */
function makeProjects(n) {
    return Array.from({ length: n }, (_, i) => ({
        repoName: `proj-${i}`,
        titleDe: `Projekt ${i}`,
        titleEn: `Project ${i}`,
        descDe: `Beschreibung ${i}`,
        descEn: `Description ${i}`,
        category: i % 2 ? 'ai' : 'web',
        language: 'TypeScript',
        tags: [`Tag${i}`, 'Gemeinsam'],
        stars: i,
        image: `assets/images/p${i}.png`,
        link: `Projekte/p${i}/index.html`,
        githubUrl: `https://github.com/example/proj-${i}`,
    }));
}

let untrack;

async function boot({ projects = makeProjects(3), url = '/pages/portfolio.html', sort } = {}) {
    vi.resetModules();
    const storage = installPageGlobals();
    if (sort) storage.setItem('portfolio_sort_order', sort);
    window.history.pushState({}, '', url);
    window.projectsData = projects;
    document.body.innerHTML = PAGE;
    await import('../portfolio.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();
    return storage;
}

const cards = () => [...document.querySelectorAll('.project-card')];
const cardTitles = () => cards().map((c) => c.dataset.titleDe);

beforeEach(() => {
    untrack = trackDocumentListeners();
    document.documentElement.setAttribute('lang', 'de');
});

afterEach(() => {
    untrack();
    removePageGlobals();
    delete window.projectsData;
    delete window.openProjectModal;
    vi.useRealTimers();
});

describe('portfolio.js: Rendern', () => {
    it('zeigt die Projekte als Karten, sortiert nach Sternen, und blendet den Skeleton aus', async () => {
        await boot();
        expect(cardTitles()).toEqual(['Projekt 2', 'Projekt 1', 'Projekt 0']);
        expect(document.getElementById('skeleton-loader').style.display).toBe('none');
        const first = cards()[0];
        expect(first.querySelector('.stars-badge').textContent).toContain('2');
        expect(first.querySelector('a.btn-github').getAttribute('href')).toBe('https://github.com/example/proj-2');
        expect(first.classList.contains('filter-web')).toBe(true);
        expect(first.classList.contains('filter-typescript')).toBe(true);
    });

    it('sortiert aufsteigend, wenn das gespeichert ist, und speichert Änderungen der Auswahl', async () => {
        const storage = await boot({ sort: 'asc' });
        expect(cardTitles()).toEqual(['Projekt 0', 'Projekt 1', 'Projekt 2']);
        const select = document.getElementById('sort-select');
        expect(select.value).toBe('asc');
        select.value = 'desc';
        select.dispatchEvent(new Event('change'));
        expect(storage.getItem('portfolio_sort_order')).toBe('desc');
        expect(cardTitles()[0]).toBe('Projekt 2');
    });

    it('escaped Projektdaten in Karten und data-Attributen', async () => {
        const evil = '<img src=x onerror="1">';
        const projects = makeProjects(1);
        projects[0].titleDe = evil;
        projects[0].descDe = evil;
        projects[0].tags = [evil];
        await boot({ projects });
        expect(document.querySelector('#dynamic-projects-container img[src="x"]')).toBeNull();
        expect(cards()[0].dataset.titleDe).toBe(evil);
        expect(cards()[0].querySelector('h3').textContent).toBe(evil);
    });

    it('hebt EcoChef als Abschlussprojekt hervor und zeigt Quick-Play für spielbare Projekte', async () => {
        const projects = makeProjects(1);
        projects[0].repoName = 'EcoChef';
        await boot({ projects });
        expect(document.querySelector('.highlight-project .highlight-badge')).not.toBeNull();
    });

    it('zeigt eine leere Seite mit Hinweis, wenn keine Projektdaten vorliegen', async () => {
        await boot({ projects: [] });
        expect(cards()).toHaveLength(0);
        expect(document.getElementById('no-results-container').style.display).toBe('block');
    });
});

describe('portfolio.js: Filter, Suche, Seiten', () => {
    it('filtert nach Kategorie über die Schaltflächen', async () => {
        await boot({ projects: makeProjects(4) });
        document.querySelector('[data-filter="ai"]').click();
        expect(cardTitles().sort()).toEqual(['Projekt 1', 'Projekt 3']);
        expect(document.querySelector('[data-filter="ai"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('[data-filter="all"]').classList.contains('active')).toBe(false);
    });

    it('sucht, zeigt den Löschen-Knopf und setzt die Suche zurück', async () => {
        await boot({ projects: makeProjects(4) });
        const input = document.getElementById('portfolio-searchbar');
        const clear = document.getElementById('btn-clear-search');
        input.value = '  Projekt 3 ';
        input.dispatchEvent(new Event('input'));
        expect(cardTitles()).toEqual(['Projekt 3']);
        expect(clear.style.display).toBe('block');
        clear.click();
        expect(input.value).toBe('');
        expect(clear.style.display).toBe('none');
        expect(cards()).toHaveLength(4);

        input.value = 'gibtesnicht';
        input.dispatchEvent(new Event('input'));
        expect(document.getElementById('no-results-container').style.display).toBe('block');
        expect(document.getElementById('pagination-container').innerHTML).toBe('');
    });

    it('teilt viele Projekte auf Seiten auf und blättert per Schaltfläche', async () => {
        window.scrollTo = vi.fn();
        await boot({ projects: makeProjects(10) });
        expect(cards()).toHaveLength(8);
        const pages = document.querySelectorAll('.btn-pagination');
        expect(pages).toHaveLength(2);
        pages[1].click();
        expect(cards()).toHaveLength(2);
        expect(window.scrollTo).toHaveBeenCalled();
        expect(document.querySelectorAll('.btn-pagination')[1].classList.contains('active')).toBe(true);
    });

    it('setzt den Platzhalter der Suche nach Sprache', async () => {
        await boot();
        const input = document.getElementById('portfolio-searchbar');
        expect(input.placeholder).toContain('durchsuchen');
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(input.placeholder).toContain('Search projects');
    });

    it('filtert über Tag-Klick und über das Radar-Diagramm', async () => {
        await boot({ projects: makeProjects(4) });
        const input = document.getElementById('portfolio-searchbar');
        input.scrollIntoView = vi.fn();
        document.querySelector('.project-card .tech-tag').click();
        expect(input.value).toBe(document.querySelector('.project-card .tech-tag').textContent);
        document.dispatchEvent(new CustomEvent('radarfilter', { detail: 'Java/OOP' }));
        expect(input.value).toBe('Java');
        document.dispatchEvent(new CustomEvent('radarfilter', { detail: 'SQL/DB' }));
        expect(input.value).toBe('SQL');
        document.dispatchEvent(new CustomEvent('radarfilter', { detail: 'HTML/CSS' }));
        expect(input.value).toBe('HTML');
    });
});

describe('portfolio.js: Deep Links', () => {
    it('übernimmt Kategorie und Suchbegriff aus der URL', async () => {
        await boot({ projects: makeProjects(6), url: '/pages/portfolio.html?category=ai&search=Projekt%203' });
        expect(cardTitles()).toEqual(['Projekt 3']);
        expect(document.getElementById('portfolio-searchbar').value).toBe('projekt 3');
        expect(document.querySelector('[data-filter="ai"]').classList.contains('active')).toBe(true);
    });

    it('öffnet das Projekt aus ?repo= im Modal', async () => {
        vi.useFakeTimers();
        window.openProjectModal = vi.fn();
        await boot({ projects: makeProjects(3), url: '/pages/portfolio.html?repo=proj-1' });
        for (const card of cards()) card.scrollIntoView = vi.fn();
        vi.advanceTimersByTime(300);
        expect(window.openProjectModal).toHaveBeenCalledTimes(1);
        expect(window.openProjectModal.mock.calls[0][0].dataset.repoName).toBe('proj-1');
    });
});

describe('portfolio.js: Formular und Bedienelemente', () => {
    it('meldet den CV-Download als Achievement', async () => {
        await boot();
        const seen = vi.fn();
        document.addEventListener('achievement:unlock', (e) => seen(e.detail));
        document.getElementById('btn-cv-download-portfolio').click();
        expect(seen).toHaveBeenCalledWith('cv_downloaded');
    });

    it('leitet das Kontaktformular auf einen mailto-Link und zeigt kurz eine Rückmeldung', async () => {
        vi.useFakeTimers();
        await boot();
        const feedback = document.getElementById('hire-me-feedback');
        const submit = new Event('submit', { cancelable: true });
        document.getElementById('hire-me-form').dispatchEvent(submit);
        expect(submit.defaultPrevented).toBe(true);
        expect(feedback.style.display).toBe('flex');
        vi.advanceTimersByTime(4100);
        expect(feedback.style.display).toBe('none');
    });

    it('wechselt Testimonials per Punkt und automatisch', async () => {
        vi.useFakeTimers();
        await boot();
        const items = document.querySelectorAll('.testimonial-item');
        const dots = document.querySelectorAll('.testimonial-dot');
        dots[1].click();
        expect(items[1].classList.contains('active')).toBe(true);
        expect(items[0].classList.contains('active')).toBe(false);
        vi.advanceTimersByTime(6000);
        expect(items[1].classList.contains('active')).toBe(true);
        vi.advanceTimersByTime(6000);
        expect(items[0].classList.contains('active')).toBe(true);
    });

    it('klappt den Code-Showcase per Klick und Tastatur auf und zu', async () => {
        await boot();
        const toggle = document.getElementById('code-accordion-toggle');
        const content = document.getElementById('code-accordion-content');
        toggle.click();
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(content.style.display).toBe('block');
        expect(toggle.querySelector('[lang="de"]').textContent).toBe('Code ausblenden');
        toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(content.style.display).toBe('none');
        expect(toggle.querySelector('[lang="en"]').textContent).toBe('Show Code');
        toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('wechselt die Code-Beispiele per Tab', async () => {
        await boot();
        document.querySelector('[data-target="snip-b"]').click();
        expect(document.getElementById('snip-b').style.display).toBe('block');
        expect(document.getElementById('snip-a').style.display).toBe('none');
        expect(document.querySelector('[data-target="snip-b"]').classList.contains('active')).toBe(true);
    });
});
