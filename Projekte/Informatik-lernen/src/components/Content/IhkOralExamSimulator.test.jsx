// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkOralExamSimulator from './IhkOralExamSimulator';

afterEach(() => cleanup());

describe('IhkOralExamSimulator Interaktion', () => {
  it('zeigt nach dem Start die Präsentations-Checkliste (Regression: checklist war nicht definiert)', () => {
    render(<IhkOralExamSimulator onRewardXP={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /IHK-Prüfung Starten/i }));
    expect(screen.getByText(/Einleitung & Motivation/)).toBeTruthy();
    expect(screen.getByText(/Fazit, Lessons Learned & Ausblick/)).toBeTruthy();
  });

  it('hakt einen Checklisten-Punkt per Klick ab', () => {
    render(<IhkOralExamSimulator onRewardXP={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /IHK-Prüfung Starten/i }));
    const item = screen.getByText(/Einleitung & Motivation/);
    expect(item.style.fontWeight).toBe('500');
    fireEvent.click(item);
    expect(screen.getByText(/Einleitung & Motivation/).style.fontWeight).toBe('700');
  });
});
