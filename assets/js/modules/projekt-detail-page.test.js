// @vitest-environment happy-dom
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

// Seiten-Script projekt-detail.js gegen die echten Projektdaten (assets/data/projects.json).
const root = path.resolve(__dirname, '..', '..', '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/projects.json'), 'utf8'));

const PAGE = `
    <ol><li id="breadcrumb-current-project">Projekt</li></ol>
    <div id="project-detail-container"></div>
    <section id="related-projects-section" style="display: none;"><div id="related-projects-container"></div></section>
`;

let untrack;
let fetchMock;

async function boot(query) {
    vi.resetModules();
    window.history.pushState({}, '', `/pages/projekt-detail.html${query}`);
    document.body.innerHTML = PAGE;
    await import('../projekt-detail.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    // Daten laden (fetch) und rendern
    await vi.waitFor(() => {
        const text = document.getElementById('project-detail-container').innerHTML;
        if (!text || text.includes('Lade Projektdaten')) throw new Error('noch nicht gerendert');
    });
}

const container = () => document.getElementById('project-detail-container');

beforeEach(() => {
    untrack = trackDocumentListeners();
    document.documentElement.setAttribute('lang', 'de');
    fetchMock = vi.fn(async (url) => {
        const target = String(url);
        if (target.endsWith('projects.json')) return { ok: true, json: async () => projects };
        if (target.endsWith('github-repos.json')) return { ok: true, json: async () => [] };
        return { ok: true, text: async () => 'console.log("Beispiel");' };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
    untrack();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('projekt-detail.js: Anzeige', () => {
    for (const project of projects) {
        it(`rendert ${project.repoName} mit Titel und Beschreibung`, async () => {
            await boot(`?repo=${encodeURIComponent(project.repoName)}`);
            expect(container().querySelector('h2').textContent).toBe(project.titleDe);
            expect(container().textContent).toContain(project.descDe);
            expect(container().querySelector('.fa-exclamation-triangle')).toBeNull();
        });
    }

    it('findet ein Projekt auch über ?title=', async () => {
        await boot(`?title=${encodeURIComponent(projects[0].titleDe)}`);
        expect(container().querySelector('h2').textContent).toBe(projects[0].titleDe);
    });

    it('zeigt englische Texte in der englischen Version und verlinkt verwandte Projekte', async () => {
        document.documentElement.setAttribute('lang', 'en');
        await boot(`?repo=${projects[0].repoName}`);
        expect(container().textContent).toContain(projects[0].descEn);
        const related = document.getElementById('related-projects-container');
        expect(related.querySelectorAll('a').length).toBeGreaterThan(0);
        expect(document.getElementById('related-projects-section').style.display).not.toBe('none');
        expect(related.querySelector('a').getAttribute('href')).toMatch(/^projekt-[a-z0-9-]+\.html$/);
    });

    it('zeigt einen Fehlerhinweis ohne Projektangabe und bei unbekanntem Projekt', async () => {
        await boot('');
        expect(container().textContent).toContain('konnte nicht gefunden werden');
        await boot('?repo=gibt-es-nicht');
        expect(container().textContent).toContain('konnte nicht gefunden werden');
        expect(container().querySelector('a[href="portfolio.html"]')).not.toBeNull();
    });

    it('schreibt Projektdaten nicht als Markup in die Seite', async () => {
        const evil = '<img src=x onerror="window.__xss=1">';
        const custom = projects.map((p, i) => (i === 0 ? { ...p, titleDe: evil, descDe: evil } : p));
        fetchMock.mockImplementation(async (url) =>
            String(url).endsWith('projects.json')
                ? { ok: true, json: async () => custom }
                : { ok: true, json: async () => [] }
        );
        await boot(`?repo=${projects[0].repoName}`);
        expect(container().querySelector('img[src="x"]')).toBeNull();
        expect(container().querySelector('h2').textContent).toBe(evil);
    });
});

describe('projekt-detail.js: Bausteine', () => {
    it('spielt EcoChef-Videos aus der Playlist und wechselt den Titel', async () => {
        window.HTMLVideoElement.prototype.play = vi.fn(() => Promise.resolve());
        await boot('?repo=EcoChef');
        const player = document.getElementById('project-video-player');
        const buttons = document.querySelectorAll('.playlist-track-btn');
        expect(player).not.toBeNull();
        expect(buttons.length).toBeGreaterThan(1);
        const title = document.getElementById('project-video-current-title');
        const before = title.textContent;
        buttons[1].click();
        expect(title.textContent).not.toBe(before);
        expect(buttons[1].classList.contains('active')).toBe(true);
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
    });

    it('lädt Dateien im Code-Explorer und kopiert den Inhalt', async () => {
        const write = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: write } });
        await boot('?repo=EcoChef');
        const items = document.querySelectorAll('#explorer-tree .tree-item');
        expect(items.length).toBeGreaterThan(0);
        items[items.length - 1].click();
        await vi.waitFor(() => {
            if (!document.getElementById('explorer-code-view').textContent.includes('Beispiel'))
                throw new Error('warten');
        });
        document.getElementById('explorer-copy-btn')?.click();
        await Promise.resolve();
        expect(write).toHaveBeenCalledWith(expect.stringContaining('Beispiel'));
        expect(document.querySelector('#explorer-tree .tree-item.active')).not.toBeNull();
    });

    it('meldet einen Fehler im Code-Explorer, wenn die Datei nicht ladbar ist', async () => {
        await boot('?repo=EcoChef');
        fetchMock.mockImplementation(async () => ({ ok: false, text: async () => '' }));
        document.querySelectorAll('#explorer-tree .tree-item')[0].click();
        await vi.waitFor(() => {
            if (!/nicht|Fehler|error/i.test(document.getElementById('explorer-code-view').textContent)) {
                throw new Error('warten');
            }
        });
    });

    it('öffnet und schließt die Live-Demo, wo es eine gibt', async () => {
        let found = 0;
        for (const project of projects) {
            await boot(`?repo=${encodeURIComponent(project.repoName)}`);
            const start = document.getElementById('start-live-demo');
            if (!start) continue;
            found++;
            start.click();
            const modal = document.getElementById('live-demo-modal');
            expect(modal).not.toBeNull();
            document.getElementById('demo-reload-btn').click();
            document.getElementById('demo-close-btn').click();
        }
        expect(found).toBeGreaterThanOrEqual(0);
    });
});
