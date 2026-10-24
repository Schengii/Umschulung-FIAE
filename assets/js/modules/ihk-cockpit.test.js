// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';

const PAGE = `
    <div class="page-ihk-cockpit">
        <button class="tab-btn active btn-primary" data-target="panel-nwa" aria-selected="true">NWA</button>
        <button class="tab-btn btn-secondary" data-target="panel-phasen" aria-selected="false">Phasen</button>
        <section id="panel-nwa" class="cockpit-panel"></section>
        <section id="panel-phasen" class="cockpit-panel display-none" style="display: none"></section>

        <button id="btn-preset-framework">Framework</button>
        <button id="btn-preset-database">Datenbank</button>
        <button id="btn-reset-nwa">Reset</button>
        <span id="th-option-a">Option A</span>
        <span id="th-option-b">Option B</span>
        <table><tbody id="nwa-body"></tbody></table>
        <span id="nwa-sum-weight"></span>
        <span id="nwa-score-a"></span>
        <span id="nwa-score-b"></span>
        <p id="nwa-winner-text"></p>

        <div id="phasen-bars-container"></div>
        <table><tbody id="phasen-detail-body"></tbody></table>

        <button id="btn-fg-start">Start</button>
        <button id="btn-fg-reveal" class="display-none" style="display: none">Antwort</button>
        <button id="btn-fg-grade-good" class="display-none" style="display: none">Gut</button>
        <button id="btn-fg-grade-bad" class="display-none" style="display: none">Schlecht</button>
        <span id="fg-category-badge"></span>
        <p id="fg-question-text"></p>
        <div id="fg-answer-box" style="display: none"><p id="fg-answer-text"></p></div>
        <span id="fg-timer"></span>
        <span id="fg-score-display"></span>
    </div>`;

const el = (id) => document.getElementById(id);
const text = (id) => el(id).textContent;

/** The module keeps its state at module level, so every test gets a fresh copy. */
async function start(html = PAGE) {
    vi.resetModules();
    resetDocument(html);
    const { initIhkCockpit } = await import('./ihk-cockpit.js');
    initIhkCockpit();
}

describe('ihk cockpit', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('does nothing on other pages', async () => {
        await start('<p>leer</p>');
        expect(document.body.innerHTML).toBe('<p>leer</p>');
    });

    describe('tabs', () => {
        it('shows only the panel of the clicked tab and updates aria-selected', async () => {
            await start();
            document.querySelector('[data-target="panel-phasen"]').click();
            expect(el('panel-phasen').style.display).toBe('block');
            expect(el('panel-nwa').style.display).toBe('none');
            const [nwa, phasen] = document.querySelectorAll('.tab-btn');
            expect(phasen.getAttribute('aria-selected')).toBe('true');
            expect(nwa.getAttribute('aria-selected')).toBe('false');
            expect(phasen.classList.contains('btn-primary')).toBe(true);
            expect(nwa.classList.contains('btn-primary')).toBe(false);
        });
    });

    describe('Nutzwertanalyse', () => {
        it('weights the scores of the framework preset and names the winner', async () => {
            await start();
            expect(document.querySelectorAll('#nwa-body tr')).toHaveLength(5);
            expect(text('nwa-sum-weight')).toBe('100%');
            expect(text('nwa-score-a')).toBe('84.5 Pkt');
            expect(text('nwa-score-b')).toBe('78.5 Pkt');
            expect(text('nwa-winner-text')).toContain('Eindeutiger Sieger: Option A');
            expect(text('nwa-winner-text')).toContain('+6.0 Pkt');
        });

        it('switches to the database preset with its own titles', async () => {
            await start();
            el('btn-preset-database').click();
            expect(text('th-option-a')).toContain('PostgreSQL');
            expect(text('th-option-b')).toContain('MongoDB');
            expect(document.querySelectorAll('#nwa-body tr')).toHaveLength(4);
            expect(text('nwa-score-a')).toBe('94.0 Pkt');
            expect(text('nwa-score-b')).toBe('67.0 Pkt');
        });

        it('recalculates when a score changes and hands the lead to the other option', async () => {
            await start();
            const first = document.querySelector('.nwa-range-a[data-index="0"]');
            first.value = '6';
            first.dispatchEvent(new Event('input', { bubbles: true }));
            expect(text('nwa-score-a')).toBe('77.0 Pkt');
            expect(text('nwa-winner-text')).toContain('Eindeutiger Sieger: Option B');
        });

        it('reports a tie when both options score the same', async () => {
            await start();
            el('btn-preset-database').click();
            for (const letter of ['a', 'b']) {
                document.querySelectorAll(`.nwa-range-${letter}`).forEach((input) => {
                    input.value = '5';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
            expect(text('nwa-winner-text')).toContain('Gleichstand');
        });

        it('uses a changed weight and treats invalid input as 0', async () => {
            await start();
            const weight = document.querySelector('.nwa-weight-input[data-index="0"]');
            weight.value = '50';
            weight.dispatchEvent(new Event('change', { bubbles: true }));
            expect(text('nwa-sum-weight')).toBe('125%');

            const again = document.querySelector('.nwa-weight-input[data-index="0"]');
            again.value = 'abc';
            again.dispatchEvent(new Event('change', { bubbles: true }));
            expect(text('nwa-sum-weight')).toBe('75%');
        });

        it('restores the framework preset on reset', async () => {
            await start();
            el('btn-preset-database').click();
            el('btn-reset-nwa').click();
            expect(text('th-option-a')).toContain('Lit');
            expect(text('nwa-score-a')).toBe('84.5 Pkt');
        });
    });

    describe('Phasenplan', () => {
        it('lists five phases that add up to the 80 hours of the IHK project', async () => {
            await start();
            const rows = document.querySelectorAll('#phasen-detail-body tr');
            expect(rows).toHaveLength(5);
            expect(document.querySelectorAll('#phasen-bars-container > div')).toHaveLength(5);
            const planned = [...rows].map((row) => parseFloat(row.children[2].textContent));
            expect(planned.reduce((sum, hours) => sum + hours, 0)).toBe(80);
        });

        it('sizes each bar by its share of the 80 hours', async () => {
            await start();
            const widths = [...document.querySelectorAll('#phasen-bars-container > div > div:last-child > div')].map(
                (bar) => bar.style.width
            );
            expect(widths).toEqual(['12.5%', '20.0%', '40.0%', '12.5%', '15.0%']);
        });
    });

    describe('Fachgespräch', () => {
        it('shows the first question with a 90 second countdown', async () => {
            await start();
            el('btn-fg-start').click();
            expect(text('fg-question-text')).toMatch(/^Frage 1\/8: /);
            expect(text('fg-category-badge')).not.toBe('');
            expect(text('fg-timer')).toContain('01:30');
            expect(el('btn-fg-reveal').style.display).toBe('inline-block');

            vi.advanceTimersByTime(5000);
            expect(text('fg-timer')).toContain('01:25');
        });

        it('stops the timer with a notice when time is up', async () => {
            await start();
            el('btn-fg-start').click();
            vi.advanceTimersByTime(90_000);
            expect(text('fg-timer')).toContain('Zeit abgelaufen');
            vi.advanceTimersByTime(5000);
            expect(text('fg-timer')).toContain('Zeit abgelaufen');
        });

        it('reveals the answer, stops the timer and offers grading', async () => {
            await start();
            el('btn-fg-start').click();
            el('btn-fg-reveal').click();
            expect(el('fg-answer-box').style.display).toBe('block');
            expect(el('btn-fg-reveal').style.display).toBe('none');
            expect(el('btn-fg-grade-good').style.display).toBe('inline-block');
            const shown = text('fg-timer');
            vi.advanceTimersByTime(10_000);
            expect(text('fg-timer')).toBe(shown);
        });

        it('scores 10 points per good answer and moves on to the next question', async () => {
            await start();
            el('btn-fg-start').click();
            el('btn-fg-reveal').click();
            el('btn-fg-grade-good').click();
            expect(text('fg-score-display')).toBe('1 Fragen geübt (10 Punkte)');
            expect(text('fg-question-text')).toMatch(/^Frage 2\/8: /);
            expect(el('fg-answer-box').style.display).toBe('none');

            el('btn-fg-reveal').click();
            el('btn-fg-grade-bad').click();
            expect(text('fg-score-display')).toBe('2 Fragen geübt (10 Punkte)');
        });

        it('wraps around after the last question', async () => {
            await start();
            for (let i = 0; i < 8; i++) el('btn-fg-start').click();
            expect(text('fg-question-text')).toMatch(/^Frage 8\/8: /);
            el('btn-fg-start').click();
            expect(text('fg-question-text')).toMatch(/^Frage 1\/8: /);
        });
    });
});
