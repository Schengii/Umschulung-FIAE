// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BadgesModal from './BadgesModal';

afterEach(cleanup);

describe('BadgesModal', () => {
  it('rendert nichts, wenn isOpen=false', () => {
    const { container } = render(<BadgesModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('ist ein modaler Dialog und fokussiert beim Öffnen ein Element darin', () => {
    render(<BadgesModal isOpen onClose={() => {}} userState={{}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('schließt per Escape und hält Tab im Dialog', () => {
    const onClose = vi.fn();
    render(<BadgesModal isOpen onClose={onClose} userState={{}} />);
    const dialog = screen.getByRole('dialog');
    const buttons = dialog.querySelectorAll('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
