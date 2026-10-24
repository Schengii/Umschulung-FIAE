import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// Guards for what the Service Worker precaches and for the markup conventions that keep the
// first load small and stable (no media in the precache, sized images, lazy video).

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

/** Precache entries of sw.js as repo-relative paths, without query strings. */
function precacheEntries() {
    const match = read('sw.js').match(/const ASSETS = \[([\s\S]*?)\];/);
    expect(match, 'ASSETS array in sw.js').not.toBeNull();
    return [...match[1].matchAll(/['"]([^'"]+)['"]/g)]
        .map((entry) => entry[1].split('?')[0].replace(/^\.?\//, ''))
        .filter((entry) => entry && entry !== '/');
}

/** Pages the site serves (root pages and pages/). */
function htmlPages() {
    const pages = fs.readdirSync(path.join(root, 'pages')).map((name) => `pages/${name}`);
    return [...pages, 'index.html', '404.html'].filter((file) => file.endsWith('.html'));
}

describe('Service Worker precache', () => {
    const entries = precacheEntries();

    it('lists files that exist', () => {
        expect(entries.length).toBeGreaterThan(50);
        const missing = entries.filter((entry) => !fs.existsSync(path.join(root, entry)));
        expect(missing).toEqual([]);
    });

    it('never precaches videos, presentations or archives', () => {
        const media = entries.filter((entry) => /\.(mp4|webm|mov|pptx?|pdf|zip)$/i.test(entry));
        expect(media).toEqual([]);
        expect(entries.filter((entry) => /^assets\/(videos|powerpoint)\//.test(entry))).toEqual([]);
    });

    it('stays within a 3 MB budget, so the first visit does not pull in the whole site', () => {
        const bytes = entries
            .filter((entry) => fs.existsSync(path.join(root, entry)))
            .reduce((sum, entry) => sum + fs.statSync(path.join(root, entry)).size, 0);
        expect(bytes / 1024 / 1024).toBeLessThan(3);
    });
});

describe('markup conventions', () => {
    it('gives every static <img> a width and height (no layout shift)', () => {
        // The gallery image gets its src from praktikumsbetrieb-media.js and is sized by CSS.
        const dynamic = new Set(['pages/praktikumsbetrieb.html#dfg-gallery-img']);
        const unsized = [];
        for (const file of htmlPages()) {
            for (const [tag] of read(file).matchAll(/<img\b[^>]*>/g)) {
                const id = tag.match(/\bid="([^"]+)"/)?.[1];
                if (id && dynamic.has(`${file}#${id}`)) continue;
                if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) unsized.push(`${file}: ${tag.slice(0, 80)}`);
            }
        }
        expect(unsized).toEqual([]);
    });

    it('does not preload video data on page load', () => {
        const eager = [];
        for (const file of htmlPages()) {
            for (const [tag] of read(file).matchAll(/<video\b[^>]*>/g)) {
                if (!/\bpreload="none"/.test(tag)) eager.push(`${file}: ${tag}`);
            }
        }
        expect(eager).toEqual([]);
    });
});
