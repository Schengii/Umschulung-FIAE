// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import {
    HORIZON_DAYS,
    buildStudyCalendar,
    countDueByDay,
    escapeIcsText,
    foldIcsLine,
    initStudyCalendar,
} from './study-calendar.js';

// Local noon, so a day boundary can never move the date in any time zone.
const now = new Date(2026, 9, 24, 12, 0, 0);
const at = (daysFromNow, hour = 0) => new Date(2026, 9, 24 + daysFromNow, hour, 0, 0).getTime();
const unfold = (ics) => ics.replace(/\r\n /g, '');
const lines = (ics) => unfold(ics).split('\r\n');

describe('escapeIcsText', () => {
    it('escapes backslash, semicolon, comma and line breaks', () => {
        expect(escapeIcsText('a\\b;c,d\ne\r\nf')).toBe('a\\\\b\\;c\\,d\\ne\\nf');
    });

    it('leaves plain text alone', () => {
        expect(escapeIcsText('3 Lernkarten fällig')).toBe('3 Lernkarten fällig');
    });
});

describe('foldIcsLine', () => {
    it('keeps a short line as it is', () => {
        expect(foldIcsLine('SUMMARY:kurz')).toBe('SUMMARY:kurz');
    });

    it('folds a long line into pieces of at most 75 octets and loses nothing', () => {
        const long = `DESCRIPTION:${'wort '.repeat(40)}`;
        const folded = foldIcsLine(long);
        const encoder = new TextEncoder();
        for (const piece of folded.split('\r\n')) expect(encoder.encode(piece).length).toBeLessThanOrEqual(75);
        expect(
            folded
                .split('\r\n')
                .slice(1)
                .every((piece) => piece.startsWith(' '))
        ).toBe(true);
        expect(folded.replace(/\r\n /g, '')).toBe(long);
    });

    it('never cuts a multi-byte character in half', () => {
        const long = `SUMMARY:${'📚äö'.repeat(30)}`;
        const folded = foldIcsLine(long);
        expect(folded.replace(/\r\n /g, '')).toBe(long);
        expect(folded).not.toContain('�');
        for (const piece of folded.split('\r\n'))
            expect(new TextEncoder().encode(piece).length).toBeLessThanOrEqual(75);
    });
});

describe('countDueByDay', () => {
    it('counts cards per day in ascending order', () => {
        const days = countDueByDay({ a: at(3, 0), b: at(1, 0), c: at(3, 0), d: at(3, 8) }, now);
        expect(days.map((day) => day.count)).toEqual([1, 3]);
        expect(days[0].date.getDate()).toBe(25);
        expect(days[1].date.getDate()).toBe(27);
    });

    it('moves overdue cards to today', () => {
        const days = countDueByDay({ a: at(-5), b: at(-1), c: at(0) }, now);
        expect(days).toHaveLength(1);
        expect(days[0].count).toBe(3);
        expect(days[0].date.getDate()).toBe(24);
    });

    it('drops days beyond the horizon, invalid values and non-objects', () => {
        const days = countDueByDay(
            { far: at(HORIZON_DAYS + 1), edge: at(HORIZON_DAYS), nan: NaN, text: '2026-10-25', nil: null, ok: at(1) },
            now
        );
        expect(days.map((day) => day.count)).toEqual([1, 1]);
        expect(countDueByDay(null, now)).toEqual([]);
        expect(countDueByDay({}, now)).toEqual([]);
    });
});

describe('buildStudyCalendar', () => {
    const dueDates = { a: at(1), b: at(1), c: at(3) };

    it('is a well-formed calendar with CRLF line ends', () => {
        const { ics } = buildStudyCalendar(dueDates, now, 'de');
        expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
        expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
        expect(ics).not.toMatch(/[^\r]\n/);
        for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    });

    it('writes one all-day event per day with the card count', () => {
        const { ics, days, cards } = buildStudyCalendar(dueDates, now, 'de');
        const text = lines(ics);
        expect(days).toBe(2);
        expect(cards).toBe(3);
        expect(text.filter((line) => line === 'BEGIN:VEVENT')).toHaveLength(2);
        expect(text).toContain('DTSTART;VALUE=DATE:20261025');
        expect(text).toContain('DTEND;VALUE=DATE:20261026');
        expect(text).toContain('SUMMARY:📚 2 Lernkarten fällig');
        expect(text).toContain('SUMMARY:📚 1 Lernkarte fällig');
    });

    it('gives every event a stable unique id and a reminder', () => {
        const first = lines(buildStudyCalendar(dueDates, now, 'de').ics);
        const second = lines(buildStudyCalendar(dueDates, new Date(2026, 9, 24, 18, 30), 'de').ics);
        const uids = first.filter((line) => line.startsWith('UID:'));
        expect(new Set(uids).size).toBe(2);
        expect(uids).toEqual(second.filter((line) => line.startsWith('UID:')));
        expect(first.filter((line) => line === 'BEGIN:VALARM')).toHaveLength(2);
        expect(first).toContain('TRIGGER;RELATED=START:PT9H');
    });

    it('stamps the calendar in UTC', () => {
        const stamp = lines(buildStudyCalendar(dueDates, now, 'de').ics).find((line) => line.startsWith('DTSTAMP:'));
        expect(stamp).toMatch(/^DTSTAMP:\d{8}T\d{6}Z$/);
    });

    it('speaks English on request, with singular and plural', () => {
        const text = lines(buildStudyCalendar(dueDates, now, 'en').ics);
        expect(text).toContain('SUMMARY:📚 2 flashcards due');
        expect(text).toContain('SUMMARY:📚 1 flashcard due');
        expect(text).toContain('X-WR-CALNAME:Flashcard study plan');
    });

    it('reports an empty plan without events', () => {
        const result = buildStudyCalendar({}, now, 'de');
        expect(result.days).toBe(0);
        expect(result.cards).toBe(0);
        expect(result.ics).not.toContain('BEGIN:VEVENT');
    });
});

describe('study calendar button', () => {
    let storage;
    let blobs;
    let downloads;
    let toast;

    beforeEach(() => {
        resetDocument('<button id="study-calendar-btn" type="button">Lernplan</button>');
        storage = installPageGlobals();
        blobs = [];
        downloads = [];
        toast = vi.fn();
        window.showToast = toast;
        URL.createObjectURL = vi.fn((blob) => {
            blobs.push(blob);
            return 'blob:plan';
        });
        URL.revokeObjectURL = vi.fn();
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const element = realCreate(tag);
            if (tag === 'a') element.click = () => downloads.push(element.download);
            return element;
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        removePageGlobals();
        delete window.showToast;
        document.documentElement.removeAttribute('lang');
    });

    it('marks the button as wired for the E2E spec', () => {
        initStudyCalendar();
        expect(document.getElementById('study-calendar-btn').getAttribute('data-ready')).toBe('true');
    });

    it('does nothing on pages without the button', () => {
        resetDocument('');
        expect(() => initStudyCalendar()).not.toThrow();
    });

    it('explains that nothing is scheduled yet instead of downloading an empty file', () => {
        initStudyCalendar();
        document.getElementById('study-calendar-btn').click();
        expect(downloads).toEqual([]);
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({ de: expect.stringContaining('Noch keine') }),
            'info'
        );
    });

    it('downloads the plan for the stored due dates and reports the numbers', async () => {
        storage.setItem(
            'flashcards_due_dates',
            JSON.stringify({ a: Date.now() + 86_400_000, b: Date.now() + 2 * 86_400_000 })
        );
        initStudyCalendar();
        document.getElementById('study-calendar-btn').click();

        expect(downloads).toEqual(['lernplan-karteikarten.ics']);
        expect(blobs[0].type).toBe('text/calendar;charset=utf-8');
        expect(await blobs[0].text()).toContain('BEGIN:VCALENDAR');
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({ de: 'Lernplan exportiert: 2 Karten an 2 Tagen.' }),
            'success'
        );
        vi.advanceTimersByTime(1000);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:plan');
    });

    it('uses the page language for the entries', async () => {
        document.documentElement.setAttribute('lang', 'en');
        storage.setItem('flashcards_due_dates', JSON.stringify({ a: Date.now() + 86_400_000 }));
        initStudyCalendar();
        document.getElementById('study-calendar-btn').click();
        expect(await blobs[0].text()).toContain('flashcard due');
    });

    it.each(['kaputt', '[]', '"text"', 'null'])('survives damaged stored data (%s)', (raw) => {
        storage.setItem('flashcards_due_dates', raw);
        initStudyCalendar();
        expect(() => document.getElementById('study-calendar-btn').click()).not.toThrow();
        expect(downloads).toEqual([]);
    });
});
