// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkWeaknessAuditLab from './IhkWeaknessAuditLab';

describe('IhkWeaknessAuditLab', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('rendert Titel, Score-Cards und Empfehlungen korrekt', () => {
    render(<IhkWeaknessAuditLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    expect(screen.getByText(/IHK Schwachstellen-Audit & Adaptiver Lernassistent/i)).toBeDefined();
    expect(screen.getByText(/Gesamt-Erfolgsquote/i)).toBeDefined();
    expect(screen.getByText(/Kritische Wissenslücken/i)).toBeDefined();
    expect(screen.getByText(/Gezielte Wiederholungs-Empfehlungen/i)).toBeDefined();
  });

  it('erlaubt Simulation von Quiz-Ergebnissen (+ LF Richtig / Falsch)', () => {
    render(<IhkWeaknessAuditLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    const correctButtons = screen.getAllByRole('button', { name: /\+ LF.*Richtig/i });
    expect(correctButtons.length).toBeGreaterThan(0);

    fireEvent.click(correctButtons[0]);
    expect(screen.getByText(/Prüfungsantworten ausgewertet/i)).toBeDefined();
  });

  it('setzt Lücken auf geschlossen via Reset-Simulation', () => {
    render(<IhkWeaknessAuditLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    const resetBtn = screen.getByRole('button', { name: /Alle Lücken geschlossen simulieren/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Hervorragend! Keine kritischen Wissenslücken erkannt/i)).toBeDefined();
  });

  it('beansprucht XP über onRewardXP Callback Prop', () => {
    const handleRewardXP = vi.fn();
    render(<IhkWeaknessAuditLab onNavigateTab={() => {}} onRewardXP={handleRewardXP} />);

    const claimButton = screen.getByRole('button', { name: /\+60 XP beanspruchen/i });
    fireEvent.click(claimButton);

    expect(handleRewardXP).toHaveBeenCalledWith(60, 'weakness_audit_master');
    expect(screen.getByText(/XP gutgeschrieben/i)).toBeDefined();
  });

  it('navigiert zu empfohlenen Labs bei Klick auf "Lab öffnen"', () => {
    const handleNavigate = vi.fn();
    render(<IhkWeaknessAuditLab onNavigateTab={handleNavigate} onRewardXP={() => {}} />);

    const labButtons = screen.getAllByRole('button', { name: /Lab öffnen/i });
    expect(labButtons.length).toBeGreaterThan(0);

    fireEvent.click(labButtons[0]);
    expect(handleNavigate).toHaveBeenCalled();
  });
});
