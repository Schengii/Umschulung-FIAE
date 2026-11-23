// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadClassicScript } from '../../../scripts/test-support/classic-script.js';

beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('lang');
    loadClassicScript('assets/js/toast.js');
});

afterEach(() => {
    vi.useRealTimers();
    delete window.showToast;
});

describe('toast.js', () => {
    it('legt den Container an und zeigt die Nachricht mit Typ und Live-Region', () => {
        const toast = window.showToast('Gespeichert', 'success');
        const container = document.getElementById('toast-container');
        expect(container.classList.contains('toast-container')).toBe(true);
        expect(container.contains(toast)).toBe(true);
        expect(toast.className).toBe('toast toast-success');
        expect(toast.getAttribute('role')).toBe('status');
        expect(toast.getAttribute('aria-live')).toBe('polite');
        expect(toast.textContent).toBe('Gespeichert');
    });

    it('verwendet einen vorhandenen Container weiter und nimmt info als Standardtyp', () => {
        window.showToast('Eins');
        window.showToast('Zwei');
        expect(document.querySelectorAll('#toast-container')).toHaveLength(1);
        expect(document.querySelectorAll('.toast.toast-info')).toHaveLength(2);
    });

    it('wählt den Text nach Seitensprache und fällt auf Deutsch zurück', () => {
        const message = { de: 'Hallo', en: 'Hello' };
        expect(window.showToast(message).textContent).toBe('Hallo');
        document.documentElement.setAttribute('lang', 'en');
        expect(window.showToast(message).textContent).toBe('Hello');
        expect(window.showToast({ de: 'Nur Deutsch' }).textContent).toBe('Nur Deutsch');
        expect(window.showToast({}).textContent).toBe('');
    });

    it('blendet das Toast nach der Dauer aus und entfernt es', () => {
        const toast = window.showToast('Kurz', 'info', 1000);
        vi.advanceTimersByTime(20);
        expect(toast.classList.contains('show')).toBe(true);
        vi.advanceTimersByTime(1000);
        expect(toast.classList.contains('show')).toBe(false);
        vi.advanceTimersByTime(500);
        expect(document.body.contains(toast)).toBe(false);
    });

    it('lässt ein Toast mit Dauer 0 stehen, bis die Aktion benutzt wird', () => {
        const onClick = vi.fn();
        const toast = window.showToast('Neue Version', 'info', 0, {
            label: { de: 'Neu laden', en: 'Reload' },
            onClick,
        });
        vi.advanceTimersByTime(60_000);
        expect(document.body.contains(toast)).toBe(true);

        const button = toast.querySelector('button.toast-action');
        expect(button.textContent).toBe('Neu laden');
        button.click();
        expect(onClick).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(500);
        expect(document.body.contains(toast)).toBe(false);
    });

    it('ignoriert eine Aktion ohne Funktion', () => {
        const toast = window.showToast('Ohne', 'info', 0, { label: 'x' });
        expect(toast.querySelector('button')).toBeNull();
    });
});
