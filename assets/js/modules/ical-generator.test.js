// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initIcalGenerator } from './ical-generator.js';

const PAGE = `
    <div id="booking-slots-container">
        <button class="btn-slot" data-time="10:00">10:00</button>
        <button class="btn-slot" data-time="14:30">14:30</button>
        <button class="btn-slot">ohne Zeit</button>
    </div>
    <button id="confirm-booking-btn" class="display-none">Bestätigen</button>
    <div id="booking-success" class="display-none"></div>`;

const slot = (index) => document.querySelectorAll('.btn-slot')[index];
const confirm = () => document.getElementById('confirm-booking-btn');
const success = () => document.getElementById('booking-success');

beforeEach(() => {
    // 2026-03-30 + 2 days crosses a month boundary: the generated date must be 2026-04-01.
    vi.useFakeTimers({ now: new Date(2026, 2, 30, 9, 0, 0), toFake: ['Date'] });
    resetDocument(PAGE);
});
afterEach(() => vi.useRealTimers());

describe('ical-generator', () => {
    it('does nothing without button and slot container', () => {
        resetDocument('');
        expect(() => initIcalGenerator()).not.toThrow();
    });

    it('marks the chosen slot and reveals the confirm button', () => {
        initIcalGenerator();
        slot(0).click();
        slot(1).click();

        expect(slot(0).classList.contains('active')).toBe(false);
        expect(slot(1).classList.contains('active')).toBe(true);
        expect(confirm().classList.contains('display-none')).toBe(false);
    });

    it('does nothing on confirm before a slot was chosen', () => {
        initIcalGenerator();
        confirm().click();
        expect(success().innerHTML).toBe('');
    });

    it('proposes a date two days ahead, across the month boundary', () => {
        initIcalGenerator();
        slot(1).click();
        confirm().click();

        expect(success().classList.contains('display-none')).toBe(false);
        expect(success().textContent).toContain('01.04.2026 um 14:30 Uhr');
    });

    it('falls back to 10:00 for a slot without a time', () => {
        initIcalGenerator();
        slot(2).click();
        confirm().click();
        expect(success().textContent).toContain('um 10:00 Uhr');
    });

    it('offers a mail request and a Google Calendar link with encoded details', () => {
        initIcalGenerator();
        slot(1).click();
        confirm().click();

        const links = [...success().querySelectorAll('a')].map((a) => a.getAttribute('href'));
        const mail = links.find((href) => href.startsWith('mailto:'));
        const gcal = links.find((href) => href.startsWith('https://calendar.google.com/'));

        expect(mail).toContain('subject=' + encodeURIComponent('Terminanfrage: Kennenlerngespräch am 01.04.2026'));
        expect(mail).toContain(encodeURIComponent('um 14:30 Uhr'));
        expect(gcal).toContain('dates=20260401T143000/20260401T153000');
        expect(gcal).toContain('text=' + encodeURIComponent('Kennenlerngespräch - Maximilian Schenk (FIAE)'));
        expect(success().querySelector('a[target="_blank"]').getAttribute('rel')).toBe('noopener');
    });

    it('downloads an .ics file with CRLF line endings and matching times', async () => {
        const blobs = [];
        URL.createObjectURL = vi.fn((blob) => {
            blobs.push(blob);
            return 'blob:test';
        });
        const clicked = [];
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const element = realCreate(tag);
            if (tag === 'a') element.click = () => clicked.push(element.download);
            return element;
        });

        initIcalGenerator();
        slot(0).click();
        confirm().click();
        success().querySelector('#btn-download-ics').click();

        expect(clicked).toEqual(['Kennenlerngespraech-Maximilian-Schenk.ics']);
        const ics = await blobs[0].text();
        expect(ics.split('\r\n')).toEqual(
            expect.arrayContaining([
                'BEGIN:VCALENDAR',
                'DTSTART:20260401T100000',
                'DTEND:20260401T110000',
                'END:VCALENDAR',
            ])
        );
        vi.restoreAllMocks();
    });
});
