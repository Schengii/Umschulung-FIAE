// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import BackupModal from './BackupModal';
import { saveUserState, initialProfileState, loadUserState } from '../../utils/storage';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => localStorage.clear());

describe('BackupModal', () => {
  it('rendert nichts, solange es geschlossen ist', () => {
    const { container } = render(<BackupModal isOpen={false} onClose={() => {}} onStateRestored={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('kopiert den aktuellen Stand inklusive noch nicht geschriebener Änderungen', () => {
    saveUserState({ ...initialProfileState, xp: 321 }); // gebündelt
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText, readText: vi.fn() }, configurable: true });
    render(<BackupModal isOpen onClose={() => {}} onStateRestored={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /In Zwischenablage kopieren/i }));
    expect(JSON.parse(writeText.mock.calls[0][0]).xp).toBe(321);
  });

  it('weist eine fremde JSON-Datei ab und behält den Fortschritt', async () => {
    saveUserState({ ...initialProfileState, xp: 500 }, { immediate: true });
    const onStateRestored = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(), readText: vi.fn().mockResolvedValue('{"name":"fremd"}') },
      configurable: true
    });
    render(<BackupModal isOpen onClose={() => {}} onStateRestored={onStateRestored} />);
    fireEvent.click(screen.getByRole('button', { name: /Aus Zwischenablage einfügen/i }));
    await waitFor(() => expect(screen.getByText(/Ungültiger JSON-Inhalt/i)).toBeTruthy());
    expect(onStateRestored).not.toHaveBeenCalled();
    expect(loadUserState().xp).toBe(500);
  });

  it('stellt einen gültigen Spielstand aus der Zwischenablage wieder her', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const onStateRestored = vi.fn();
    const onClose = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(), readText: vi.fn().mockResolvedValue('{"xp": 250}') },
      configurable: true
    });
    render(<BackupModal isOpen onClose={onClose} onStateRestored={onStateRestored} />);
    fireEvent.click(screen.getByRole('button', { name: /Aus Zwischenablage einfügen/i }));
    await vi.waitFor(() => expect(screen.getByText(/aus Zwischenablage importiert/i)).toBeTruthy());
    vi.advanceTimersByTime(1500);
    expect(onStateRestored).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(loadUserState().xp).toBe(250);
    vi.useRealTimers();
  });
});
