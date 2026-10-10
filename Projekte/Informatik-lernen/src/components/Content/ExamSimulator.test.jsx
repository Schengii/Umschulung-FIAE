// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ExamSimulator from './ExamSimulator';

describe('ExamSimulator', () => {
  afterEach(() => {
    cleanup();
  });

  it('rendert den Prüfungsmodus und Fragen-Dashboard', () => {
    render(<ExamSimulator />);
    expect(screen.getByText(/IHK AP1: Einrichten eines IT-gestützten Arbeitsplatzes/i)).toBeTruthy();
  });

  it('erlaubt das Setzen von Lesezeichen und Wechseln der Modi', () => {
    render(<ExamSimulator />);
    const bookmarkBtns = screen.getAllByTitle('Frage für Nachprüfung markieren');
    expect(bookmarkBtns.length).toBeGreaterThan(0);

    fireEvent.click(bookmarkBtns[0]);
    // Question is bookmarked now
    expect(screen.getByTitle('Markierung aufheben')).toBeTruthy();
  });

  it('kann eine Prüfung abgeben und zeigt die Auswertung mit Kategorien an', () => {
    const handleRecord = vi.fn();
    render(<ExamSimulator onRecordResults={handleRecord} />);

    const submitBtn = screen.getByRole('button', { name: /Prüfung jetzt abgeben/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Offizielles IHK Prüfungs-Ergebnis/i)).toBeTruthy();
    expect(screen.getByText(/Ergebnis nach Wissensgebieten/i)).toBeTruthy();
    expect(handleRecord).toHaveBeenCalled();
  });
});
