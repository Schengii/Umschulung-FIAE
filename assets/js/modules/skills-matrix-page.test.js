// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

// Seiten-Script skills_matrix.js: Radar-Diagramm, Karten-Liste, Kategorie-Tabs und Sortierung.
const PAGE = `
    <button class="skills-tab active" data-cat="all">Alle</button>
    <button class="skills-tab" data-cat="frontend">Frontend</button>
    <button class="skills-tab" data-cat="electronics">Elektronik</button>
    <select id="skills-sort-select">
        <option value="default">Standard</option>
        <option value="alpha">A–Z</option>
        <option value="level-desc">Stufe absteigend</option>
    </select>
    <svg id="skills-radar-svg"></svg>
    <div id="skills-list-grid"></div>
`;

let untrack;

async function boot(page = PAGE) {
    vi.resetModules();
    document.body.innerHTML = page;
    await import('../skills_matrix.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

const cardNames = () => [...document.querySelectorAll('.skill-card-name')].map((el) => el.textContent);
const axisLabels = () =>
    [...document.querySelectorAll('#skills-radar-svg text.axis-label')].map((el) => el.textContent);

beforeEach(() => {
    untrack = trackDocumentListeners();
    document.documentElement.setAttribute('lang', 'de');
});

afterEach(() => {
    untrack();
});

describe('skills_matrix.js', () => {
    it('zeichnet das Radar mit sechs Achsen und listet alle Skills als Karten', async () => {
        await boot();
        expect(axisLabels()).toHaveLength(6);
        expect(document.querySelectorAll('#skills-radar-svg polygon.grid-line')).toHaveLength(3);
        expect(document.querySelectorAll('#skills-radar-svg circle.radar-dot')).toHaveLength(6);
        expect(document.querySelector('#skills-radar-svg polygon.radar-poly')).not.toBeNull();
        expect(cardNames().length).toBeGreaterThanOrEqual(16);
    });

    it('zeigt je Karte Stufe und Belege oder den Hinweis auf den Lebenslauf', async () => {
        await boot();
        const cards = [...document.querySelectorAll('.skill-matrix-card')];
        expect(cards.every((c) => c.querySelector('.skill-level[role="img"]'))).toBe(true);
        expect(cards.some((c) => c.querySelector('.skill-card-proof a'))).toBe(true);
        expect(document.body.textContent).toContain('kein eigenes Projekt, siehe Lebenslauf');
    });

    it('wechselt per Tab die Kategorie für Radar und Liste', async () => {
        await boot();
        const all = cardNames().length;
        document.querySelector('[data-cat="electronics"]').click();
        expect(cardNames().length).toBeLessThan(all);
        expect(cardNames().length).toBeGreaterThan(0);
        expect(axisLabels()).toEqual(cardNames());
        expect(document.querySelector('.skills-tab.active').dataset.cat).toBe('electronics');
        expect(document.querySelectorAll('.skills-tab.active')).toHaveLength(1);
    });

    it('sortiert die Liste alphabetisch und nach Stufe', async () => {
        await boot();
        const select = document.getElementById('skills-sort-select');
        select.value = 'alpha';
        select.dispatchEvent(new Event('change'));
        const alpha = cardNames();
        expect(alpha).toEqual([...alpha].sort((a, b) => a.localeCompare(b)));

        select.value = 'level-desc';
        select.dispatchEvent(new Event('change'));
        const steps = [...document.querySelectorAll('.skill-matrix-card')].map(
            (c) => c.querySelectorAll('.skill-level-step.is-on').length
        );
        expect(steps).toEqual([...steps].sort((a, b) => b - a));
    });

    it('zeigt nach einem Sprachwechsel englische Texte', async () => {
        await boot();
        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(document.querySelector('.skill-card-proof-label').textContent).toBe('Evidence:');
        expect(document.querySelector('#skills-radar-svg circle.radar-dot title').textContent).toMatch(/: \w+/);
    });

    it('trägt Achsen und Punkte mit einem Link zum Portfolio-Filter', async () => {
        await boot();
        const label = document.querySelector('#skills-radar-svg text.axis-label');
        expect(label.getAttribute('title')).toContain(label.textContent);
        // Klick navigiert per window.location.href; hier genügt, dass der Handler ohne Fehler läuft.
        expect(() => label.dispatchEvent(new Event('click'))).not.toThrow();
    });

    it('tut auf Seiten ohne Radar und Liste nichts', async () => {
        await boot('<p>leer</p>');
        expect(document.body.innerHTML).toBe('<p>leer</p>');
    });
});
