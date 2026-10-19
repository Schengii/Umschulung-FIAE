// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initCookieBanner } from './consent-notice.js';

let storage;

beforeEach(() => {
    vi.useFakeTimers();
    storage = installPageGlobals();
    resetDocument('<div id="cookie-banner"><button id="cookie-accept" type="button">OK</button></div>');
});
afterEach(() => {
    vi.useRealTimers();
    removePageGlobals();
});

describe('consent-notice', () => {
    it('does nothing when the banner or its button is missing', () => {
        resetDocument('<div id="cookie-banner"></div>');
        expect(() => initCookieBanner()).not.toThrow();
        expect(storage.getItem('cookie_consent')).toBeNull();
    });

    it('stores the consent and removes the banner after its exit animation', () => {
        initCookieBanner();
        document.getElementById('cookie-accept').click();

        expect(storage.getItem('cookie_consent')).toBe('true');
        expect(document.getElementById('cookie-banner')).not.toBeNull();

        vi.advanceTimersByTime(300);
        expect(document.getElementById('cookie-banner')).toBeNull();
    });
});
