// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const PAGE = '<button id="opener" data-open-dossier>Dossier</button>';

const el = (id) => document.getElementById(id);
const modal = () => el('executive-dossier-modal');

/** The module registers document-level listeners, so every test gets a fresh copy. */
async function start() {
    vi.resetModules();
    resetDocument(PAGE);
    const module = await import('./executive-dossier.js');
    module.initExecutiveDossier();
    return module;
}

describe('executive dossier', () => {
    let removeListeners;

    beforeEach(() => {
        removeListeners = trackDocumentListeners();
        vi.stubGlobal('print', vi.fn());
    });

    afterEach(() => {
        removeListeners();
        vi.unstubAllGlobals();
    });

    it('injects the hidden modal once, even if initialised twice', async () => {
        const { initExecutiveDossier } = await start();
        initExecutiveDossier();
        expect(document.querySelectorAll('#executive-dossier-modal')).toHaveLength(1);
        expect(modal().style.display).toBe('none');
    });

    it('is a labelled modal dialog with a named close button', async () => {
        await start();
        const dialog = modal().querySelector('[role="dialog"]');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(el(dialog.getAttribute('aria-labelledby'))).not.toBeNull();
        expect(el('btn-close-dossier').getAttribute('aria-label')).toBe('Schließen');
        expect(el('btn-close-dossier').getAttribute('data-en-aria-label')).toBe('Close');
    });

    it('opens from any [data-open-dossier] trigger with the fullstack profile', async () => {
        await start();
        el('opener').click();
        expect(modal().style.display).toBe('flex');
        expect(el('dossier-role-text').textContent).toContain('Frontend & PWA');
        expect(el('dossier-highlights-list').children.length).toBeGreaterThan(0);
        expect(el('dossier-skills-text').textContent).toContain('TypeScript');
    });

    it('moves the focus into the dialog and hands it back when closed', async () => {
        await start();
        el('opener').focus();
        el('opener').click();
        expect(document.activeElement).toBe(el('btn-close-dossier'));
        el('btn-close-dossier').click();
        expect(modal().style.display).toBe('none');
        expect(document.activeElement).toBe(el('opener'));
    });

    it('closes on Escape and on a click on the backdrop, but not on a click inside', async () => {
        await start();
        el('opener').click();
        modal()
            .querySelector('.card')
            .dispatchEvent(new Event('click', { bubbles: true }));
        expect(modal().style.display).toBe('flex');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().style.display).toBe('none');

        el('opener').click();
        modal().dispatchEvent(new Event('click'));
        expect(modal().style.display).toBe('none');
    });

    it('ignores Escape while the dialog is closed', async () => {
        await start();
        el('opener').focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.activeElement).toBe(el('opener'));
    });

    it('switches the profile per button and keeps exactly one button active', async () => {
        await start();
        el('opener').click();
        modal().querySelector('[data-type="ihk"]').click();
        expect(el('dossier-role-text').textContent).toContain('IHK Abschlussprüfung');
        expect(modal().querySelectorAll('.dossier-type-btn.active')).toHaveLength(1);
        expect(modal().querySelector('[data-type="ihk"]').classList.contains('btn-primary')).toBe(true);
        expect(modal().querySelector('[data-type="fullstack"]').classList.contains('btn-primary')).toBe(false);

        modal().querySelector('[data-type="backend"]').click();
        expect(el('dossier-summary-text').textContent).toContain('hardwarenahe');
    });

    it('falls back to the fullstack profile for an unknown type', async () => {
        const { openDossierModal } = await start();
        openDossierModal('gibt-es-nicht');
        expect(el('dossier-role-text').textContent).toContain('Frontend & PWA');
    });

    it('prints the dossier alone: the body is marked while printing and released afterwards', async () => {
        await start();
        let markedDuringPrint = false;
        window.print = vi.fn(() => {
            markedDuringPrint = document.body.classList.contains('printing-dossier');
        });
        el('btn-print-dossier').click();
        expect(window.print).toHaveBeenCalledTimes(1);
        expect(markedDuringPrint).toBe(true);
        // Still marked right after print() returns: Safari renders the pages later.
        expect(document.body.classList.contains('printing-dossier')).toBe(true);
        window.dispatchEvent(new Event('afterprint'));
        expect(document.body.classList.contains('printing-dossier')).toBe(false);
    });

    it('releases the print mode after a minute even if afterprint never fires', async () => {
        vi.useFakeTimers();
        await start();
        el('btn-print-dossier').click();
        expect(document.body.classList.contains('printing-dossier')).toBe(true);
        vi.advanceTimersByTime(60_000);
        expect(document.body.classList.contains('printing-dossier')).toBe(false);
        vi.useRealTimers();
    });
});
