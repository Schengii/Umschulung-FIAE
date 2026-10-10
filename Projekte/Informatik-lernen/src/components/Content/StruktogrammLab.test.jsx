// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import StruktogrammLab from './StruktogrammLab';

afterEach(() => cleanup());

describe('StruktogrammLab', () => {
  it('rendert ohne Absturz und zeigt Tabs an', () => {
    render(<StruktogrammLab />);
    expect(screen.getByText(/DIN 66261 Nassi-Shneiderman/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Schreibtischtest/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /DIN 66261 Bausteine/i })).toBeTruthy();
  });

  it('wechselt zum Schreibtischtest-Tab und navigiert Schritte', () => {
    render(<StruktogrammLab />);
    const traceTabBtn = screen.getByRole('button', { name: /Schreibtischtest/i });
    fireEvent.click(traceTabBtn);

    expect(screen.getByText(/Schritt-für-Schritt Ablaufverfolgung/i)).toBeTruthy();
    const nextBtn = screen.getByRole('button', { name: /Schritt weiter/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Schritt 2 von/i)).toBeTruthy();
  });

  it('führt den Prüfungsdrill aus und zeigt Titel an', () => {
    const onRewardXP = vi.fn();
    render(<StruktogrammLab onRewardXP={onRewardXP} />);
    const drillTabBtn = screen.getByRole('button', { name: /IHK-Drill/i });
    fireEvent.click(drillTabBtn);

    expect(screen.getByText(/IHK Prüfungs-Drill: DIN 66261/i)).toBeTruthy();
  });
});
