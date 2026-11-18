import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// news_data.js and news.js are classic scripts (no exports), so the test evaluates their source.
const jsDir = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(jsDir, file), 'utf8');

const newsData = new Function(`${read('news_data.js')}; return newsData;`)();
const formatNewsDate = new Function('document', `${read('news.js')}; return formatNewsDate;`)({
    addEventListener() {},
});

describe('newsData', () => {
    it('has entries with unique ids', () => {
        const ids = newsData.map((entry) => entry.id);
        expect(ids.length).toBeGreaterThan(0);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('gives every entry a valid ISO date and no hand-formatted date fields', () => {
        for (const entry of newsData) {
            expect(entry.date, entry.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Number.isNaN(new Date(`${entry.date}T00:00:00Z`).getTime()), entry.id).toBe(false);
            expect(entry, entry.id).not.toHaveProperty('date_de');
            expect(entry, entry.id).not.toHaveProperty('date_en');
        }
    });

    it('has no entry dated in the future', () => {
        const today = new Date().toISOString().slice(0, 10);
        for (const entry of newsData) {
            expect(entry.date <= today, `${entry.id}: ${entry.date}`).toBe(true);
        }
    });

    it('has title and text in both languages and a known category', () => {
        for (const entry of newsData) {
            expect(['milestone', 'bfw', 'dfg'], entry.id).toContain(entry.category);
            for (const lang of ['de', 'en']) {
                expect(entry[`title_${lang}`], `${entry.id} title_${lang}`).toBeTruthy();
                expect(Array.isArray(entry[`content_${lang}`]), `${entry.id} content_${lang}`).toBe(true);
                expect(entry[`content_${lang}`].length, `${entry.id} content_${lang}`).toBeGreaterThan(0);
            }
            expect(entry.content_de.length, entry.id).toBe(entry.content_en.length);
        }
    });
});

describe('formatNewsDate', () => {
    it('formats the German date as before the switch to ISO dates', () => {
        expect(formatNewsDate('2026-07-06', 'de')).toBe('06. Juli 2026');
    });

    it('formats the English date as before the switch to ISO dates', () => {
        expect(formatNewsDate('2026-07-06', 'en')).toBe('July 06, 2026');
    });

    it('does not shift the day in any time zone (the date is read as UTC)', () => {
        expect(formatNewsDate('2024-01-01', 'de')).toBe('01. Januar 2024');
        expect(formatNewsDate('2025-12-31', 'en')).toBe('December 31, 2025');
    });

    it('returns invalid input unchanged instead of "Invalid Date"', () => {
        expect(formatNewsDate('06. Juli 2026', 'de')).toBe('06. Juli 2026');
        expect(formatNewsDate('2026-13-40', 'de')).toBe('2026-13-40');
        expect(formatNewsDate(undefined, 'de')).toBe('');
    });
});
