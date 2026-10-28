// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';
import { initSkillBars } from './skill-bars.js';
import { initSkillRadar } from './skill-radar.js';
import './confetti.js';

/** IntersectionObserver stand-in that reports every observed element as visible right away. */
class VisibleObserver {
    /** @param {IntersectionObserverCallback} callback */
    constructor(callback) {
        this.callback = callback;
    }
    /** @param {Element} target */
    observe(target) {
        this.callback([/** @type {any} */ ({ isIntersecting: true, target })], /** @type {any} */ (this));
    }
    unobserve() {}
    disconnect() {}
}

let untrack;
/** @type {string[]} */
let filters;
const onFilter = (/** @type {Event} */ e) => filters.push(/** @type {CustomEvent} */ (e).detail);

beforeEach(() => {
    untrack = trackDocumentListeners();
    vi.stubGlobal('IntersectionObserver', VisibleObserver);
    filters = [];
    document.addEventListener('radarfilter', onFilter);
});
afterEach(() => {
    document.removeEventListener('radarfilter', onFilter);
    untrack();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

const bar = (name) =>
    `<div class="skill-bar"><span class="skill-name">${name}</span><div class="skill-fill"></div></div>`;

describe('skill-bars', () => {
    it('does nothing without bars', () => {
        resetDocument('');
        expect(() => initSkillBars()).not.toThrow();
    });

    it('animates the fill once it is visible', () => {
        resetDocument(bar('Git'));
        initSkillBars();
        expect(document.querySelector('.skill-fill').classList.contains('animated')).toBe(true);
    });

    it('is a plain bar outside the portfolio', () => {
        resetDocument(bar('Git'));
        initSkillBars();
        expect(document.querySelector('.skill-bar').getAttribute('role')).toBeNull();
    });

    it('filters the portfolio by click and keyboard, with mapped search terms', () => {
        resetDocument(
            `<input id="portfolio-searchbar">${bar('HTML5 & CSS3')}${bar('JavaScript (ES6+)')}${bar('Python')}`
        );
        initSkillBars();
        const [html, js, python] = document.querySelectorAll('.skill-bar');
        expect(html.getAttribute('role')).toBe('button');
        expect(/** @type {HTMLElement} */ (html).tabIndex).toBe(0);

        /** @type {HTMLElement} */ (html).click();
        js.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        python.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        python.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(filters).toEqual(['HTML', 'JavaScript', 'Python']);

        html.dispatchEvent(new MouseEvent('mouseenter'));
        expect(/** @type {HTMLElement} */ (html).style.transform).toBe('translateX(4px)');
        html.dispatchEvent(new MouseEvent('mouseleave'));
        expect(/** @type {HTMLElement} */ (html).style.transform).toBe('none');
    });
});

describe('skill-radar', () => {
    beforeEach(() => resetDocument('<div id="skill-radar-container"></div>'));

    it('draws one axis label and one dot per skill', () => {
        initSkillRadar();
        const labels = document.querySelectorAll('.radar-label');
        expect(labels.length).toBeGreaterThan(5);
        expect(document.querySelectorAll('.radar-dot')).toHaveLength(labels.length);
        expect(document.querySelector('.radar-polygon').getAttribute('points').split(' ')).toHaveLength(labels.length);
        expect(document.querySelector('.radar-polygon').style.animation).toContain('radarFadeIn');
    });

    it('filters by clicking a label or dot and by keyboard on a label', () => {
        initSkillRadar();
        const label = document.querySelector('.radar-label');
        expect(label.getAttribute('tabindex')).toBe('0');
        expect(label.getAttribute('role')).toBe('button');
        expect(label.getAttribute('aria-label')).toBe(`Projekte filtern: ${label.getAttribute('data-skill')}`);

        label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.querySelector('.radar-dot').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        label.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(filters).toEqual(['HTML/CSS', 'HTML/CSS', 'HTML/CSS']);
    });
});

describe('Confetti', () => {
    const Confetti = () => window.Confetti;
    const fakeContext = () =>
        /** @type {any} */ ({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} });

    beforeEach(() => {
        resetDocument('');
        vi.spyOn(window, 'matchMedia').mockImplementation((q) => /** @type {any} */ ({ matches: false, media: q }));
        vi.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeContext());
    });

    it('stays off with prefers-reduced-motion', () => {
        vi.spyOn(window, 'matchMedia').mockImplementation((q) => /** @type {any} */ ({ matches: true, media: q }));
        Confetti().start();
        expect(Confetti().isActive).toBe(false);
        expect(document.querySelector('canvas')).toBeNull();
    });

    it('runs for the duration and then ends on its own (no endless respawn)', () => {
        /** @type {FrameRequestCallback[]} */
        let frames = [];
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            frames.push(cb);
            return frames.length;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        const now = vi.spyOn(Date, 'now').mockReturnValue(0);

        Confetti().start(1000);
        expect(Confetti().isActive).toBe(true);
        expect(document.querySelectorAll('canvas')).toHaveLength(1);
        Confetti().start(1000); // a second start while running is ignored
        expect(document.querySelectorAll('canvas')).toHaveLength(1);

        // Frames within the duration keep the particles coming back from the top.
        for (let i = 0; i < 50; i++) frames.shift()(0);
        expect(Confetti().isActive).toBe(true);

        // After the duration the particles fall out; the loop must end within a bounded number of frames.
        now.mockReturnValue(5000);
        let steps = 0;
        while (Confetti().isActive && frames.length && steps < 5000) {
            frames.shift()(0);
            steps++;
        }
        expect(Confetti().isActive).toBe(false);
        expect(document.querySelector('canvas')).toBeNull();
        frames = [];
    });

    it('stop() is safe when nothing runs', () => {
        expect(() => Confetti().stop()).not.toThrow();
    });
});
