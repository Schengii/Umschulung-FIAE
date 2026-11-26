// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LearningPathWidget from './LearningPathWidget';
import { useStore } from '../../store/useStore';

beforeEach(() =>
  useStore.setState((s) => ({
    userState: { ...s.userState, careerFilter: 'all', pathSnoozed: {}, placementResult: null, mistakeJournal: {}, labProgress: {} }
  }))
);
afterEach(() => cleanup());

describe('LearningPathWidget', () => {
  it('zeigt drei Empfehlungen und den Hinweis auf den Einstufungstest', () => {
    render(<LearningPathWidget onSelectLab={() => {}} />);
    expect(screen.getByRole('heading', { name: /Empfohlen für dich/i })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Einstufungstest/i)).toBeTruthy();
  });

  it('öffnet das gewählte Lab', () => {
    const onSelectLab = vi.fn();
    render(<LearningPathWidget onSelectLab={onSelectLab} />);
    const first = screen.getAllByRole('listitem')[0].querySelector('button');
    fireEvent.click(first);
    expect(onSelectLab).toHaveBeenCalledTimes(1);
    expect(typeof onSelectLab.mock.calls[0][0]).toBe('string');
  });

  it('blendet ein Lab bis morgen aus und merkt es im Spielstand', () => {
    render(<LearningPathWidget onSelectLab={() => {}} />);
    const before = screen.getAllByRole('listitem')[0].querySelector('button').textContent;
    fireEvent.click(screen.getAllByRole('button', { name: /bis morgen ausblenden/i })[0]);
    expect(Object.keys(useStore.getState().userState.pathSnoozed)).toHaveLength(1);
    expect(screen.getAllByRole('listitem')[0].querySelector('button').textContent).not.toBe(before);
  });

  it('zeigt mit Prüfungstermin den Wochenfortschritt des Plans und öffnet den Planer', () => {
    const d = new Date();
    const key = (n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    useStore.setState((s) => ({ userState: { ...s.userState, examTargetDate: key(60), studyPlanStart: '', mixDays: [] } }));
    const onSelectLab = vi.fn();
    render(<LearningPathWidget onSelectLab={onSelectLab} />);
    expect(screen.getByText(/Diese Woche:/)).toBeTruthy();
    expect(screen.getByText(/0\/5 Lernmix-Tage/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Prüfungsplan öffnen/i }));
    expect(onSelectLab).toHaveBeenCalledWith('ihk_study_plan_lab');
  });

  it('zeigt ohne Prüfungstermin keine Wochenzeile', () => {
    useStore.setState((s) => ({ userState: { ...s.userState, examTargetDate: '' } }));
    render(<LearningPathWidget onSelectLab={() => {}} />);
    expect(screen.queryByText(/Diese Woche:/)).toBeNull();
  });

  it('speichert den Berufsfilter im Spielstand', () => {
    render(<LearningPathWidget onSelectLab={() => {}} />);
    fireEvent.change(screen.getByLabelText('Beruf'), { target: { value: 'wiso' } });
    expect(useStore.getState().userState.careerFilter).toBe('wiso');
  });
});
