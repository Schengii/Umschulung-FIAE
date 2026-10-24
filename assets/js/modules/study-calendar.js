/**
 * @file study-calendar.js
 * @description Exports the due dates of the Leitner box as an iCalendar file, so the review days
 * show up in the calendar app of the learner. Runs entirely in the browser; nothing is sent
 * anywhere. The first half is pure logic (no DOM) and covered by unit tests.
 */

/** Days ahead that end up in the file; further out the plan changes with every review anyway. */
export const HORIZON_DAYS = 60;

/** Reminder time on the day of the event, as an offset from midnight. */
const REMINDER_OFFSET = 'PT9H';

/**
 * Escapes a TEXT value (RFC 5545, 3.3.11).
 * @param {string} text
 */
export function escapeIcsText(text) {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/**
 * Folds a content line to at most 75 octets per line (RFC 5545, 3.1) without splitting a
 * multi-byte character.
 * @param {string} line
 * @returns {string} the line, continuation lines joined by CRLF + space
 */
export function foldIcsLine(line) {
    const encoder = new TextEncoder();
    if (encoder.encode(line).length <= 75) return line;
    /** @type {string[]} */
    const parts = [];
    let current = '';
    let bytes = 0;
    // The first line holds 75 octets, continuation lines 74 (the leading space counts).
    let limit = 75;
    for (const char of line) {
        const size = encoder.encode(char).length;
        if (bytes + size > limit) {
            parts.push(current);
            current = '';
            bytes = 0;
            limit = 74;
        }
        current += char;
        bytes += size;
    }
    parts.push(current);
    return parts.join('\r\n ');
}

/** @param {number} value */
const pad = (value) => String(value).padStart(2, '0');

/**
 * `YYYYMMDD` of a local date.
 * @param {Date} date
 */
function formatDate(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * `YYYYMMDDTHHMMSSZ` (UTC) of a point in time.
 * @param {Date} date
 */
function formatUtc(date) {
    return (
        `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
        `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    );
}

/**
 * Number of cards due per day. Cards that are overdue count for today; days beyond the
 * horizon and invalid entries are dropped.
 * @param {Record<string, unknown>} dueDates card id -> due timestamp (as stored by flashcards.js)
 * @param {Date} now
 * @returns {{date: Date, count: number}[]} ascending by date
 */
export function countDueByDay(dueDates, now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last = new Date(today);
    last.setDate(last.getDate() + HORIZON_DAYS);

    /** @type {Map<string, {date: Date, count: number}>} */
    const days = new Map();
    for (const value of Object.values(dueDates || {})) {
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        const due = new Date(value);
        let day = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        if (day < today) day = today;
        if (day > last) continue;
        const key = formatDate(day);
        const entry = days.get(key) || { date: day, count: 0 };
        entry.count++;
        days.set(key, entry);
    }
    return [...days.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Builds the calendar file.
 * @param {Record<string, unknown>} dueDates card id -> due timestamp
 * @param {Date} now
 * @param {'de' | 'en'} lang language of the entries
 * @returns {{ics: string, days: number, cards: number}} `days` is 0 when nothing is scheduled
 */
export function buildStudyCalendar(dueDates, now, lang) {
    const byDay = countDueByDay(dueDates, now);
    const de = lang !== 'en';
    const stamp = formatUtc(now);

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Maximilian Schenk Portfolio//Lernplan//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeIcsText(de ? 'Lernplan Karteikarten' : 'Flashcard study plan')}`,
    ];

    for (const { date, count } of byDay) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        const summary = de
            ? `📚 ${count} ${count === 1 ? 'Lernkarte' : 'Lernkarten'} fällig`
            : `📚 ${count} ${count === 1 ? 'flashcard' : 'flashcards'} due`;
        const description = de
            ? 'Wiederhole die fälligen Karten in der Leitner-Box: https://www.max-schenk.tech/pages/flashcards.html'
            : 'Review the due cards in the Leitner box: https://www.max-schenk.tech/pages/flashcards.html';
        lines.push(
            'BEGIN:VEVENT',
            `UID:lernplan-${formatDate(date)}@max-schenk.tech`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${formatDate(date)}`,
            `DTEND;VALUE=DATE:${formatDate(next)}`,
            `SUMMARY:${escapeIcsText(summary)}`,
            `DESCRIPTION:${escapeIcsText(description)}`,
            'TRANSP:TRANSPARENT',
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            `DESCRIPTION:${escapeIcsText(summary)}`,
            `TRIGGER;RELATED=START:${REMINDER_OFFSET}`,
            'END:VALARM',
            'END:VEVENT'
        );
    }
    lines.push('END:VCALENDAR');

    return {
        ics: lines.map(foldIcsLine).join('\r\n') + '\r\n',
        days: byDay.length,
        cards: byDay.reduce((sum, entry) => sum + entry.count, 0),
    };
}

/* ------------------------------------------------------------------------------------ */
/* Page integration                                                                      */
/* ------------------------------------------------------------------------------------ */

export function initStudyCalendar() {
    const button = document.getElementById('study-calendar-btn');
    if (!button) return;

    button.addEventListener('click', () => {
        const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de';
        /** @type {Record<string, unknown>} */
        let dueDates = {};
        try {
            const stored = JSON.parse(AppStorage.getItem('flashcards_due_dates', '{}'));
            if (stored && typeof stored === 'object' && !Array.isArray(stored)) dueDates = stored;
        } catch (_e) {
            dueDates = {};
        }

        const { ics, days, cards } = buildStudyCalendar(dueDates, new Date(), lang);
        if (days === 0) {
            window.showToast?.(
                {
                    de: 'Noch keine Fälligkeiten geplant. Beantworte erst ein paar Karten richtig.',
                    en: 'Nothing is scheduled yet. Answer a few cards correctly first.',
                },
                'info'
            );
            return;
        }

        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lernplan-karteikarten.ics';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        window.showToast?.(
            {
                de: `Lernplan exportiert: ${cards} Karten an ${days} Tagen.`,
                en: `Study plan exported: ${cards} cards on ${days} days.`,
            },
            'success'
        );
    });

    // Lets the E2E spec wait until the handler exists (this module is loaded lazily).
    button.setAttribute('data-ready', 'true');
}
