// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initPwaInstaller } from './pwa-installer.js';

let storage;
/** @type {Array<[string, EventListener]>} */
let windowListeners;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument('');
    // The module adds a window listener per init; remove them again after each test.
    windowListeners = [];
    const original = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
        windowListeners.push([type, /** @type {EventListener} */ (listener)]);
        original(type, listener, options);
    });
    vi.useFakeTimers();
});
afterEach(() => {
    for (const [type, listener] of windowListeners) window.removeEventListener(type, listener);
    vi.useRealTimers();
    vi.restoreAllMocks();
    removePageGlobals();
});

/** A beforeinstallprompt event with a recorded prompt() call. */
function installPrompt(outcome = 'accepted') {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt: vi.fn(), userChoice: Promise.resolve({ outcome }) });
    return /** @type {Event & {prompt: ReturnType<typeof vi.fn>}} */ (event);
}

const banner = () => document.getElementById('pwa-install-banner');

describe('pwa-installer', () => {
    it('injects a hidden, labelled bilingual banner', () => {
        initPwaInstaller();
        expect(banner().classList.contains('hidden')).toBe(true);
        expect(banner().getAttribute('role')).toBe('dialog');
        expect(banner().querySelectorAll('[lang="de"]').length).toBe(banner().querySelectorAll('[lang="en"]').length);
    });

    it('shows the banner when the browser offers installation and prevents its own prompt', () => {
        initPwaInstaller();
        const event = installPrompt();
        window.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(banner().classList.contains('show')).toBe(true);
        expect(banner().classList.contains('hidden')).toBe(false);
    });

    it('stays hidden after the visitor dismissed it once', () => {
        storage.setItem('pwa_dismissed', 'true');
        initPwaInstaller();
        window.dispatchEvent(installPrompt());
        expect(banner().classList.contains('show')).toBe(false);
    });

    it('starts the browser prompt on "Installieren" and hides the banner', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        initPwaInstaller();
        const event = installPrompt('accepted');
        window.dispatchEvent(event);
        document.getElementById('pwa-btn-install').click();
        expect(event.prompt).toHaveBeenCalledOnce();
        await Promise.resolve();
        expect(log).toHaveBeenCalledWith('User accepted the PWA install prompt');
        vi.advanceTimersByTime(300);
        expect(banner().classList.contains('hidden')).toBe(true);
    });

    it('remembers "Später" and hides the banner', () => {
        initPwaInstaller();
        window.dispatchEvent(installPrompt());
        document.getElementById('pwa-btn-dismiss').click();
        expect(storage.getItem('pwa_dismissed')).toBe('true');
        expect(banner().classList.contains('show')).toBe(false);
        vi.advanceTimersByTime(300);
        expect(banner().classList.contains('hidden')).toBe(true);
    });
});
