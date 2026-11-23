// @vitest-environment happy-dom
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';

// modal.js ist ein klassisches Script (IIFE ohne Export): der Test wertet den Quelltext aus.
const source = fs.readFileSync(path.resolve(__dirname, '..', 'modal.js'), 'utf8');

const PAYLOAD = '<img src=x onerror="window.__xss=1">';

function openModalWith(dataset) {
    const attrs = Object.entries(dataset)
        .map(([name, value]) => `data-${name}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
        .join(' ');
    resetDocument(`
        <div id="project-modal"><div class="modal-content"><div id="modal-body"></div></div></div>
        <article class="project-card" ${attrs}><span id="card-body">Karte</span></article>
    `);
    new Function(source)();
    /** @type {HTMLElement} */ (document.getElementById('card-body')).click();
    return /** @type {HTMLElement} */ (document.getElementById('modal-body'));
}

describe('modal.js', () => {
    beforeEach(() => {
        delete globalThis.__xss;
    });

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
});
