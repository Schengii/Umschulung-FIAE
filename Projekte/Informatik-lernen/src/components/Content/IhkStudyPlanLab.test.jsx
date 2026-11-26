// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkStudyPlanLab from './IhkStudyPlanLab';
import { useStore } from '../../store/useStore';
import { toDateKey } from '../../utils/mistakeJournalEngine';

const inDays = (n) => {
  const d = new Date();
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
const setState = (patch) => useStore.setState((s) => ({ userState: { ...s.userState, ...patch } }));

describe('IhkStudyPlanLab', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    setState({ examTargetDate: '', studyPlanStart: '', studyHoursPerWeek: 6, careerFilter: 'all', labProgress: {}, mixDays: [], placementResult: null });
  });
  afterEach(() => cleanup());

  it('fragt ohne Prüfungstermin nach dem Termin und zeigt keinen Plan', () => {
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getByText(/IHK Prüfungs-Countdown & Adaptiver Lernplaner/i)).toBeDefined();
    expect(screen.getByText(/Ohne Prüfungstermin gibt es noch keinen Plan/i)).toBeDefined();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('zeigt mit Termin einen Plan über vier Wochen mit Zielen je Woche', () => {
    setState({ examTargetDate: inDays(90) });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getByText(/Dein personalisierter Wochenplan/i)).toBeDefined();
    expect(screen.getAllByText(/^Woche \d$/)).toHaveLength(4);
    expect(screen.getAllByText(/Lernmix-Tage: 0 von 5/)).toHaveLength(4);
    expect(screen.getAllByText(/Aktuelle Woche/)).toHaveLength(1);
  });

  it('speichert den wirksamen Planstart im Spielstand', () => {
    setState({ examTargetDate: inDays(90) });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(useStore.getState().userState.studyPlanStart).toBe(inDays(0));
  });

  it('schreibt Termin, Fachrichtung und Lernzeit in den Spielstand', () => {
    setState({ examTargetDate: inDays(90) });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);

    fireEvent.change(screen.getByLabelText('Deine Fachrichtung:'), { target: { value: 'fisi' } });
    expect(useStore.getState().userState.careerFilter).toBe('fisi');

    fireEvent.change(screen.getByLabelText('Lernzeit pro Woche:'), { target: { value: '10' } });
    expect(useStore.getState().userState.studyHoursPerWeek).toBe(10);

    const examSelect = screen.getByLabelText('IHK Prüfungstermin:');
    const other = [...examSelect.options].find((o) => o.value && o.value !== examSelect.value);
    fireEvent.change(examSelect, { target: { value: other.value } });
    expect(useStore.getState().userState.examTargetDate).toBe(other.value);
  });

  it('plant bei 10 Stunden mehr Labs pro Woche als bei 3', () => {
    setState({ examTargetDate: inDays(90), studyHoursPerWeek: 10 });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getAllByText(/Labs abgeschlossen: 0 von 5/)).toHaveLength(4);
    cleanup();
    setState({ studyHoursPerWeek: 3 });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getAllByText(/Labs abgeschlossen: 0 von 2/)).toHaveLength(4);
  });

  it('zeigt kurz vor der Prüfung nur Festigen ohne neue Labs', () => {
    setState({ examTargetDate: inDays(5) });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getByText(/Festigen/)).toBeDefined();
    expect(screen.queryByText(/Labs abgeschlossen:/)).toBeNull();
    expect(screen.getByText(/Fehlerjournal wiederholen/)).toBeDefined();
  });

  it('weist einen vergangenen Termin freundlich ab', () => {
    setState({ examTargetDate: inDays(-3) });
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />);
    expect(screen.getByText(/liegt in der Vergangenheit/i)).toBeDefined();
  });

  it('beansprucht XP über onRewardXP Callback Prop', () => {
    const handleRewardXP = vi.fn();
    render(<IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={handleRewardXP} />);
    fireEvent.click(screen.getByRole('button', { name: /\+60 XP beanspruchen/i }));
    expect(handleRewardXP).toHaveBeenCalledWith(60, 'study_plan_master');
    expect(screen.getByText(/XP gutgeschrieben/i)).toBeDefined();
  });

  it('öffnet empfohlene Labs per Klick', () => {
    setState({ examTargetDate: inDays(90) });
    const handleNavigate = vi.fn();
    render(<IhkStudyPlanLab onNavigateTab={handleNavigate} onRewardXP={() => {}} />);
    const labButtons = screen.getAllByRole('button', { name: /Lab öffnen/i });
    expect(labButtons.length).toBeGreaterThan(0);
    fireEvent.click(labButtons[0]);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
