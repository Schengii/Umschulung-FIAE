import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Tastatur-Verhalten für modale Dialoge (WCAG 2.1.2 / 2.4.3):
 * - Fokus wandert beim Öffnen in den Dialog und kehrt beim Schließen zurück,
 * - Tab/Shift+Tab bleibt im Dialog (Focus-Trap),
 * - Escape ruft `onClose` auf (abschaltbar mit `closeOnEscape: false`).
 *
 * Der Dialog-Container bekommt `ref`, `role="dialog"`, `aria-modal="true"`,
 * `aria-labelledby` und `tabIndex={-1}` vom Aufrufer.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {import('react').RefObject<HTMLElement | null>} dialogRef
 * @param {{ closeOnEscape?: boolean }} [options]
 */
export function useDialogA11y(isOpen, onClose, dialogRef, { closeOnEscape = true } = {}) {
  // `onClose` ist oft eine neue Funktion pro Render; per Ref lesen, damit der
  // Effekt nicht bei jedem Render Fokus neu setzt.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () => (dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE)) : []);

    if (dialog && !dialog.contains(document.activeElement)) {
      (focusables()[0] ?? dialog).focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, dialogRef, closeOnEscape]);
}
