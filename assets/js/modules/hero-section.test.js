// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';
import { heroPhrases, initHeroSection } from './hero-section.js';

/** @param {boolean} reduce */
const mockMotion = (reduce) =>
    vi
        .spyOn(window, 'matchMedia')
        .mockImplementation(
            (query) => /** @type {any} */ ({ matches: reduce && query.includes('reduce'), media: query })
        );

let untrack;
beforeEach(() => {
    resetDocument('<section id="hero-section"><span id="hero-typing"></span></section>');
    untrack = trackDocumentListeners();
    vi.useFakeTimers();
});
afterEach(() => {
    untrack();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

const typing = () => document.getElementById('hero-typing');

describe('hero-section', () => {
    it('does nothing without the hero', () => {
        resetDocument('');
        expect(() => initHeroSection()).not.toThrow();
    });

    it('has the same number of phrases in both languages', () => {
        expect(heroPhrases('de')).toHaveLength(heroPhrases('en').length);
        expect(heroPhrases('fr')).toBe(heroPhrases('de'));
    });

    it('shows a static phrase and no particles with prefers-reduced-motion', () => {
        mockMotion(true);
        initHeroSection();
        expect(typing().textContent).toBe(heroPhrases('de')[0]);
        vi.advanceTimersByTime(5000);
        expect(typing().textContent).toBe(heroPhrases('de')[0]);
        expect(document.querySelector('.hero-particles')).toBeNull();

        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(typing().textContent).toBe(heroPhrases('en')[0]);
    });

    it('types the phrase character by character otherwise', () => {
        mockMotion(false);
        vi.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        initHeroSection();
        expect(typing().textContent).toBe('F');
        vi.advanceTimersByTime(75 * 3);
        expect(typing().textContent).toBe('Fach');
        expect(document.querySelector('.hero-particles')).not.toBeNull();
    });

    it('restarts with the English phrases after a language change', () => {
        mockMotion(false);
        vi.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        initHeroSection();
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        vi.advanceTimersByTime(75);
        expect(heroPhrases('en')[0].startsWith(typing().textContent)).toBe(true);
    });
});
