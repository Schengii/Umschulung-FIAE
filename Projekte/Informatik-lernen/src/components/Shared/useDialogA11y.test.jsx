// @vitest-environment jsdom
import React, { useRef, useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useDialogA11y } from './useDialogA11y';

afterEach(cleanup);

function Harness({ onClose = () => {}, closeOnEscape = true, startOpen = true }) {
  const [open, setOpen] = useState(startOpen);
  const ref = useRef(null);
  const close = () => {
    onClose();
    setOpen(false);
  };
  useDialogA11y(open, close, ref, { closeOnEscape });
  return (
    <div>
      <button onClick={() => setOpen(true)}>Öffnen</button>
      {open && (
        <div ref={ref} role="dialog" aria-modal="true" aria-label="Test" tabIndex={-1}>
          <button>Erster</button>
          <button>Letzter</button>
        </div>
      )}
    </div>
  );
}

describe('useDialogA11y', () => {
  it('setzt den Fokus beim Öffnen auf das erste bedienbare Element', () => {
    render(<Harness />);
    expect(document.activeElement).toBe(screen.getByText('Erster'));
  });

  it('hält Tab und Shift+Tab im Dialog', () => {
    render(<Harness />);
    screen.getByText('Letzter').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('Erster'));

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('Letzter'));
  });

  it('schließt mit Escape und gibt den Fokus an den Auslöser zurück', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} startOpen={false} />);
    const opener = screen.getByText('Öffnen');
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('ignoriert Escape mit closeOnEscape=false', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} closeOnEscape={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
