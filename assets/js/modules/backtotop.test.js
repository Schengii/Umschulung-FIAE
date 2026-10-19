// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initBackToTop } from './backtotop.js';

const setScroll = (y) => Object.defineProperty(window, 'scrollY', { value: y, configurable: true });

beforeEach(() => {
    installPageGlobals();
    resetDocument('<button id="back-to-top" type="button"></button>');
});
afterEach(() => {
    removePageGlobals();
    vi.restoreAllMocks();
});

const button = () => document.getElementById('back-to-top');

describe('backtotop', () => {
    it('does nothing without the button', () => {
        resetDocument('');
        expect(() => initBackToTop()).not.toThrow();
    });

    it('is hidden at the top of the page and shown after the scroll threshold', () => {
        setScroll(0);
        initBackToTop();
        expect(button().classList.contains('visible')).toBe(false);

        setScroll(301);
        window.dispatchEvent(new Event('scroll'));
        expect(button().classList.contains('visible')).toBe(true);

        setScroll(100);
        window.dispatchEvent(new Event('scroll'));
        expect(button().classList.contains('visible')).toBe(false);
    });

    it('is visible right away when the page is restored far down', () => {
        setScroll(900);
        initBackToTop();
        expect(button().classList.contains('visible')).toBe(true);
    });

    it('scrolls smoothly to the top on click', () => {
        window.scrollTo = vi.fn();
        initBackToTop();
        button().click();
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
