import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import builder from './build_search_index.js';

const { extractPage, buildIndex } = builder;
const page = (body, head = '<title>Testseite | Maximilian Schenk</title>') =>
    `<!doctype html><html lang="de"><head>${head}</head><body><header><h2>Menü</h2></header><main id="main-content">${body}</main><footer><h2>Fuß</h2></footer></body></html>`;

describe('extractPage', () => {
    it('reads h2/h3 headings from main and ignores navigation, header and footer', () => {
        const { headings } = extractPage(page('<h2>Abschnitt A</h2><h3>Unterpunkt</h3>'));
        expect(headings.map((heading) => heading.de)).toEqual(['Abschnitt A', 'Unterpunkt']);
    });

    it('pairs <h2 lang="de"> with its <h2 lang="en"> twin and lists the pair once', () => {
        const { headings } = extractPage(page('<h2 lang="de">Lernkarten</h2><h2 lang="en">Flashcards</h2>'));
        expect(headings).toEqual([{ id: '', de: 'Lernkarten', en: 'Flashcards' }]);
    });

    it('reads language spans inside a heading', () => {
        const { headings } = extractPage(
            page('<h2><i></i><span lang="de">Notenrechner</span><span lang="en">Grade calculator</span></h2>')
        );
        expect(headings[0]).toMatchObject({ de: 'Notenrechner', en: 'Grade calculator' });
    });

    it('uses the same text for both languages when the heading is not translated', () => {
        expect(extractPage(page('<h2>Git &amp; GitHub</h2>')).headings[0]).toMatchObject({
            de: 'Git & GitHub',
            en: 'Git & GitHub',
        });
    });

    it('anchors a heading at its own id, else at the id of the section around it', () => {
        const { headings } = extractPage(
            page('<section id="karten"><h2>Mit Section</h2></section><h2 id="eigene">Eigene</h2><h2>Ohne</h2>')
        );
        expect(headings.map((heading) => heading.id)).toEqual(['karten', 'eigene', '']);
    });

    it('does not use the id that wraps the whole page as an anchor', () => {
        expect(extractPage(page('<h2>Oben</h2>')).headings[0].id).toBe('');
    });

    it('skips headings in dialogs and hidden blocks, and duplicates', () => {
        const { headings } = extractPage(
            page(
                '<div role="dialog"><h2>Dialog</h2></div><div hidden><h2>Versteckt</h2></div><h2>Echt</h2><h2>Echt</h2>'
            )
        );
        expect(headings.map((heading) => heading.de)).toEqual(['Echt']);
    });

    it('takes the page title from the h1, else from the title without the site name', () => {
        expect(extractPage(page('<h1 lang="de">Titel</h1><h1 lang="en">Title</h1><h2>x</h2>')).title).toEqual({
            de: 'Titel',
            en: 'Title',
        });
        expect(extractPage(page('<h2>x</h2>')).title).toEqual({ de: 'Testseite', en: 'Testseite' });
    });

    it('limits the headings of one page', () => {
        const many = Array.from({ length: 60 }, (_v, i) => `<h2>Punkt ${i}</h2>`).join('');
        expect(extractPage(page(many)).headings).toHaveLength(40);
    });
});

describe('buildIndex', () => {
    it('is sorted by file name and leaves out fallback pages and pages without headings', () => {
        const index = buildIndex({
            'b.html': page('<h2>B</h2>'),
            'a.html': page('<h2>A</h2>'),
            'offline.html': page('<h2>Offline</h2>'),
            'leer.html': page('<p>nur Text</p>'),
        });
        expect(index.map((entry) => entry.p)).toEqual(['a.html', 'b.html']);
    });
});

describe('generated index', () => {
    const index = JSON.parse(
        fs.readFileSync(path.resolve(import.meta.dirname, '../assets/data/search-index.json'), 'utf8')
    );

    it('covers the content pages and points only at pages that exist', () => {
        expect(index.length).toBeGreaterThan(10);
        for (const entry of index) {
            expect(fs.existsSync(path.resolve(import.meta.dirname, '../pages', entry.p)), entry.p).toBe(true);
            expect(entry.h.length).toBeGreaterThan(0);
        }
    });

    it('has German and English text for every heading and no fallback pages', () => {
        const names = index.map((entry) => entry.p);
        expect(names).not.toContain('offline.html');
        expect(names).not.toContain('404.html');
        for (const entry of index) {
            for (const heading of entry.h) {
                expect(heading.de.length, `${entry.p}: ${heading.id}`).toBeGreaterThan(0);
                expect(heading.en.length, `${entry.p}: ${heading.id}`).toBeGreaterThan(0);
            }
        }
    });
});
