// @vitest-environment happy-dom
// Smoke tests for the pure presentation modules: they load, their guard selectors hold, and
// they respect prefers-reduced-motion. No pixels or animation frames are checked.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initScrollAnimations } from './scroll-animations.js';
import { initPremiumEffects } from './premium-effects.js';
import { initSkillBars } from './skill-bars.js';
import { initSkillRadar } from './skill-radar.js';
import { initTimelineScroll } from './timeline-scroll.js';
import { initConfetti } from './confetti.js';

/** @param {{reduce?: boolean, finePointer?: boolean}} [options] */
function stubMedia({ reduce = false, finePointer = true } = {}) {
    vi.stubGlobal(
        'matchMedia',
        vi.fn((query) => ({
            matches: query.includes('prefers-reduced-motion')
                ? reduce
                : query.includes('hover: hover')
                  ? finePointer
                  : false,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
        }))
    );
    window.matchMedia = globalThis.matchMedia;
}

class FakeObserver {
    static instances = 0;
    constructor() {
        FakeObserver.instances++;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

describe('presentation modules', () => {
    beforeEach(() => {
        resetDocument('');
        installPageGlobals();
        FakeObserver.instances = 0;
        vi.stubGlobal('IntersectionObserver', FakeObserver);
        window.IntersectionObserver = FakeObserver;
        stubMedia();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        removePageGlobals();
    });

    describe('scroll-animations', () => {
        it('adds the progress bar once, however often it is initialised', () => {
            initScrollAnimations();
            initScrollAnimations();
            expect(document.querySelectorAll('#scroll-progress-bar')).toHaveLength(1);
        });

        it('observes reveal elements when motion is allowed', () => {
            document.body.innerHTML = '<div class="card"></div>';
            initScrollAnimations();
            expect(FakeObserver.instances).toBeGreaterThan(0);
            expect(document.querySelector('.card').classList.contains('reveal-visible')).toBe(false);
        });

        it('shows everything at once and starts no observer under reduced motion', () => {
            stubMedia({ reduce: true });
            document.body.innerHTML = '<div class="card"></div><div class="scroll-reveal"></div>';
            initScrollAnimations();
            for (const element of document.querySelectorAll('.card, .scroll-reveal')) {
                expect(element.classList.contains('reveal-visible')).toBe(true);
            }
            expect(document.querySelector('.hero-particles-canvas')).toBeNull();
        });
    });

    describe('premium-effects', () => {
        it('adds the cursor glow only for a fine pointer without reduced motion', () => {
            initPremiumEffects();
            expect(document.querySelector('.cursor-glow')).not.toBeNull();
        });

        it('skips pointer decoration on touch screens', () => {
            stubMedia({ finePointer: false });
            initPremiumEffects();
            expect(document.querySelector('.cursor-glow')).toBeNull();
        });

        it('skips pointer decoration under reduced motion', () => {
            stubMedia({ reduce: true });
            initPremiumEffects();
            expect(document.querySelector('.cursor-glow')).toBeNull();
        });
    });

    describe('confetti', () => {
        it('exposes the global the classic scripts check for', () => {
            initConfetti();
            expect(window.Confetti).toBeDefined();
            expect(typeof window.Confetti.start).toBe('function');
        });

        it('starts no animation and adds no canvas under reduced motion', () => {
            stubMedia({ reduce: true });
            window.Confetti.start();
            expect(window.Confetti.isActive).toBe(false);
            expect(document.querySelector('canvas')).toBeNull();
        });
    });

    describe('guard selectors', () => {
        it.each([
            ['skill-bars', initSkillBars],
            ['skill-radar', initSkillRadar],
            ['timeline-scroll', initTimelineScroll],
        ])('%s does nothing on a page without its markup', (_name, init) => {
            document.body.innerHTML = '<p>leer</p>';
            expect(() => init()).not.toThrow();
            expect(document.body.innerHTML).toBe('<p>leer</p>');
        });
    });
});
