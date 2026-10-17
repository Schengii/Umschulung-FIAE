import { describe, it, expect } from 'vitest';
import { resolvePageLink, findBestMatch, KNOWLEDGE_BASE } from './portfolio-copilot.js';

describe('resolvePageLink', () => {
    it('returns # for empty or missing targets', () => {
        expect(resolvePageLink('')).toBe('#');
        expect(resolvePageLink(null)).toBe('#');
        expect(resolvePageLink(undefined)).toBe('#');
    });

    it('leaves absolute and anchor URLs unchanged', () => {
        expect(resolvePageLink('https://github.com')).toBe('https://github.com');
        expect(resolvePageLink('http://example.org')).toBe('http://example.org');
        expect(resolvePageLink('#skills')).toBe('#skills');
    });

    it('prefixes pages/ when viewed from root page', () => {
        expect(resolvePageLink('portfolio.html', '/index.html')).toBe('pages/portfolio.html');
        expect(resolvePageLink('dashboard.html', '/')).toBe('pages/dashboard.html');
    });

    it('preserves targetPage unchanged when viewed from within pages/ directory', () => {
        expect(resolvePageLink('portfolio.html', '/pages/dashboard.html')).toBe('portfolio.html');
        expect(resolvePageLink('ueber-mich.html', 'C:\\app\\pages\\home.html')).toBe('ueber-mich.html');
    });
});

describe('KNOWLEDGE_BASE integrity', () => {
    it('contains valid and bilingual knowledge entries', () => {
        expect(KNOWLEDGE_BASE.length).toBeGreaterThan(0);
        for (const item of KNOWLEDGE_BASE) {
            expect(Array.isArray(item.keywords)).toBe(true);
            expect(item.keywords.length).toBeGreaterThan(0);
            expect(item.responseDe).toBeTypeOf('string');
            expect(item.responseDe.length).toBeGreaterThan(10);
            expect(item.responseEn).toBeTypeOf('string');
            expect(item.responseEn.length).toBeGreaterThan(10);
            expect(item.link).toBeTypeOf('string');
            expect(item.linkTextDe).toBeTypeOf('string');
            expect(item.linkTextEn).toBeTypeOf('string');
        }
    });
});

describe('findBestMatch', () => {
    it('returns empty match when query is empty or unrelated', () => {
        const emptyResult = findBestMatch('');
        expect(emptyResult.bestMatch).toBeNull();
        expect(emptyResult.maxScore).toBe(0);

        const unrelated = findBestMatch('abcdefxyz123456789 non-existent');
        expect(unrelated.bestMatch).toBeNull();
        expect(unrelated.maxScore).toBe(0);
    });

    it('matches user profile query to "ueber-mich.html"', () => {
        const result = findBestMatch('Wer ist Maximilian Schenk? Kontakt und Profil');
        expect(result.bestMatch).not.toBeNull();
        expect(result.bestMatch?.link).toBe('ueber-mich.html');
        expect(result.maxScore).toBeGreaterThan(0);
    });

    it('matches EcoChef query to "ihk-cockpit.html"', () => {
        const result = findBestMatch('Erzähl mir über das IHK Abschlussprojekt EcoChef');
        expect(result.bestMatch).not.toBeNull();
        expect(result.bestMatch?.link).toBe('ihk-cockpit.html');
        expect(result.maxScore).toBeGreaterThan(0);
    });

    it('scores words > 3 characters with 2 points and shorter with 1 point', () => {
        const customKb = [
            {
                keywords: ['wer', 'react'], // 'wer' is 3 chars (1pt), 'react' is 5 chars (2pts)
                responseDe: 'De',
                responseEn: 'En',
                link: 'test.html',
                linkTextDe: 'T',
                linkTextEn: 'T',
            },
        ];
        const matchShort = findBestMatch('wer', customKb);
        expect(matchShort.maxScore).toBe(1);

        const matchLong = findBestMatch('react', customKb);
        expect(matchLong.maxScore).toBe(2);

        const matchBoth = findBestMatch('wer nutzt react', customKb);
        expect(matchBoth.maxScore).toBe(3);
    });
});
