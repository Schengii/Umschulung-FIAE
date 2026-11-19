import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// Plan 2.4: Die Startseite hat genau eine kanonische URL, "/". Dieser Test hält vercel.json,
// Canonical, Sitemap und Manifest zusammen (ADR 0008, Nachtrag).
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ORIGIN = 'https://www.max-schenk.tech/';

describe('Startseite unter "/"', () => {
    it('leitet /index.html dauerhaft auf / um', () => {
        const { redirects } = JSON.parse(read('vercel.json'));
        expect(redirects).toContainEqual({ source: '/index.html', destination: '/', permanent: true });
    });

    it('nennt "/" als Canonical, og:url und in allen Sprachvarianten', () => {
        const html = read('index.html');
        expect(html).toContain(`<link rel="canonical" href="${ORIGIN}">`);
        expect(html).toContain(`<meta property="og:url" content="${ORIGIN}">`);
        expect(html).toContain(`<link rel="alternate" hreflang="en" href="${ORIGIN}?lang=en">`);
        expect(html).not.toContain('max-schenk.tech/index.html');
    });

    it('führt "/" in der Sitemap und nicht index.html', () => {
        const sitemap = read('sitemap.xml');
        expect(sitemap).toContain(`<loc>${ORIGIN}</loc>`);
        expect(sitemap).not.toContain('max-schenk.tech/index.html');
    });

    it('startet die installierte App auf "/"', () => {
        expect(JSON.parse(read('manifest.json')).start_url).toBe('./');
    });
});
