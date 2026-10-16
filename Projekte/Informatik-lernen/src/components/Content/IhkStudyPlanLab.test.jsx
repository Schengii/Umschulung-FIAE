// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkStudyPlanLab from './IhkStudyPlanLab';

describe('IhkStudyPlanLab', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('rendert Titel, Countdown-Statistik und Wochenplan korrekt', () => {
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    expect(screen.getByText(/IHK Prüfungs-Countdown & Adaptiver Lernplaner/i)).toBeDefined();
    expect(screen.getByText(/Verbleibende Zeit bis zur IHK-Abschlussprüfung/i)).toBeDefined();
    expect(screen.getByText(/Dein personalisierter Wochenplan/i)).toBeDefined();
    expect(screen.getByRole('list')).toBeDefined();
  });

  it('erlaubt Wechsel von Prüfungstermin und Fachrichtung', () => {
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);

    // Fachrichtung auf FISI wechseln
    fireEvent.change(selects[1], { target: { value: 'fisi' } });
    expect(/** @type {HTMLSelectElement} */ (selects[1]).value).toBe('fisi');
  });

  it('schaltet Wochen-Zustand um (Toggle Week)', () => {
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    const toggleButtons = screen.getAllByText(/Als erledigt markieren/i);
    expect(toggleButtons.length).toBeGreaterThan(0);

    fireEvent.click(toggleButtons[0]);
    expect(screen.getAllByText(/Erledigt/i).length).toBeGreaterThan(0);
  });

  it('beansprucht XP über onRewardXP Callback Prop', () => {
    const handleRewardXP = vi.fn();
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={handleRewardXP} />);

    const claimButton = screen.getByRole('button', { name: /\+60 XP beanspruchen/i });
    fireEvent.click(claimButton);

    expect(handleRewardXP).toHaveBeenCalledWith(60, 'study_plan_master');
    expect(screen.getByText(/XP gutgeschrieben/i)).toBeDefined();
  });

  it('navigiert zu empfohlenen Labs bei Klick auf "Lab öffnen"', () => {
    const handleNavigate = vi.fn();
    render(<IhkStudyPlanLab onNavigateTab={handleNavigate} onRewardXP={() => {}} />);

    const labButtons = screen.getAllByRole('button', { name: /Lab öffnen/i });
    expect(labButtons.length).toBeGreaterThan(0);

    fireEvent.click(labButtons[0]);
    expect(handleNavigate).toHaveBeenCalled();
  });
});
