import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(__dirname, '..');
const vercel = require('../vercel.json');

const headerValue = (source, key) =>
    vercel.headers.find((rule) => rule.source === source)?.headers.find((h) => h.key === key)?.value;

describe('Sicherheits-Header in vercel.json', () => {
    it('setzt Cross-Origin-Opener-Policy auf allen Seiten', () => {
        expect(headerValue('/(.*)', 'Cross-Origin-Opener-Policy')).toBe('same-origin');
    });

    it('lässt keine Seite ohne Content-Security-Policy-Regel', () => {
        const sources = vercel.headers
            .filter((rule) => rule.headers.some((h) => h.key === 'Content-Security-Policy'))
            .map((rule) => rule.source);
        expect(sources).toHaveLength(2); // Seiten, Demos unter /Projekte/
    });
});

describe('.well-known/security.txt (RFC 9116)', () => {
    const text = fs.readFileSync(path.join(root, '.well-known', 'security.txt'), 'utf8');
    const field = (name) => [...text.matchAll(new RegExp(`^${name}: (.+)$`, 'gm'))].map((m) => m[1].trim());

    it('nennt mindestens einen Kontakt als URL', () => {
        expect(field('Contact').length).toBeGreaterThan(0);
        for (const contact of field('Contact')) expect(contact).toMatch(/^(https:\/\/|mailto:)/);
    });

    it('ist nicht abgelaufen (Erinnerung, die Datei jährlich zu erneuern)', () => {
        const [expires] = field('Expires');
        expect(new Date(expires).getTime()).toBeGreaterThan(Date.now());
    });

    it('hat die kanonische Adresse unter .well-known', () => {
        expect(field('Canonical')).toEqual(['https://www.max-schenk.tech/.well-known/security.txt']);
    });

    it('wird mit dem Build ausgeliefert', () => {
        const build = fs.readFileSync(path.join(root, 'scripts', 'build_minified.js'), 'utf8');
        expect(build).toContain("'.well-known'");
    });
});
