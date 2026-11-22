// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const { initPremiumEffectsP2 } = await import('./premium-effects-p2.js');

const PAGE = `
    <a id="internal" href="https://example.org/pages/quiz.html">Quiz</a>
    <a id="extensionless" href="https://example.org/pages/quiz">Quiz ohne Endung</a>
    <a id="hash" href="#oben">Nach oben</a>
    <a id="same-page" href="https://example.org/start.html#abschnitt">Gleiche Seite</a>
    <a id="blank" href="https://example.org/pages/quiz.html" target="_blank">Neuer Tab</a>
    <a id="download" href="https://example.org/pages/quiz.html" download>Download</a>
    <a id="pdf" href="https://example.org/assets/cv.pdf">PDF</a>
    <a id="mail" href="mailto:a@example.org">Mail</a>
    <button id="plain">Knopf</button>`;

const overlay = () => document.querySelector('.page-transition-overlay');
const click = (id, init = {}) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    document.getElementById(id).dispatchEvent(event);
    return event;
};

describe('premium effects phase 2', () => {
    let removeListeners;

    beforeEach(() => {
        vi.useFakeTimers();
        removeListeners = trackDocumentListeners();
        window.happyDOM.setURL('https://example.org/start.html');
        resetDocument(PAGE);
        initPremiumEffectsP2();
    });

    afterEach(() => {
        removeListeners();
        vi.useRealTimers();
    });

    describe('page transitions', () => {
        it('creates the overlay once, covering the page, and fades it out after load', () => {
            expect(document.querySelectorAll('.page-transition-overlay')).toHaveLength(1);
            expect(overlay().classList.contains('active')).toBe(true);
            vi.advanceTimersByTime(100);
            expect(overlay().classList.contains('active')).toBe(false);
        });

        it('reuses an overlay that already exists', () => {
            initPremiumEffectsP2();
            expect(document.querySelectorAll('.page-transition-overlay')).toHaveLength(1);
        });

        it('fades out again when a page comes back from the back/forward cache', () => {
            overlay().classList.add('active');
            const event = new Event('pageshow');
            event.persisted = true;
            window.dispatchEvent(event);
            expect(overlay().classList.contains('active')).toBe(false);
        });

        it('takes over a click on an internal page link and covers the page', () => {
            vi.advanceTimersByTime(100);
            const event = click('internal');
            expect(event.defaultPrevented).toBe(true);
            expect(overlay().classList.contains('active')).toBe(true);
        });

        it('also treats an extensionless path as a page', () => {
            expect(click('extensionless').defaultPrevented).toBe(true);
        });

        it.each([
            ['an anchor on the same page', 'hash', {}],
            ['a fragment of the current page', 'same-page', {}],
            ['a new tab', 'blank', {}],
            ['a download', 'download', {}],
            ['a PDF', 'pdf', {}],
            ['a mailto link', 'mail', {}],
            ['a click with Ctrl', 'internal', { ctrlKey: true }],
            ['a click with Cmd', 'internal', { metaKey: true }],
            ['a click with Shift', 'internal', { shiftKey: true }],
            ['a middle click', 'internal', { button: 1 }],
        ])('leaves %s alone', (_label, id, init) => {
            vi.advanceTimersByTime(100);
            const event = click(id, init);
            expect(event.defaultPrevented).toBe(false);
            expect(overlay().classList.contains('active')).toBe(false);
        });

        it('leaves a click that another handler already took alone', () => {
            vi.advanceTimersByTime(100);
            document.getElementById('internal').addEventListener('click', (e) => e.preventDefault());
            click('internal');
            expect(overlay().classList.contains('active')).toBe(false);
        });
    });
});
