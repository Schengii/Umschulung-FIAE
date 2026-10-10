// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkDrillPanel from './IhkDrillPanel';
import { useStore } from '../../store/useStore';
import { initialProfileState } from '../../utils/storage';

const QUESTIONS = [
  { id: 'drilltest_1', frage: 'Frage 1?', optionen: ['a1', 'b1'], korrektIndex: 0, erklaerung: 'E1' },
  { id: 'drilltest_2', frage: 'Frage 2?', optionen: ['a2', 'b2'], korrektIndex: 1, erklaerung: 'E2' }
];

const renderPanel = (onEvaluate = () => {}) =>
  render(
    <IhkDrillPanel
      title="Test-Drill"
      questions={QUESTIONS}
      accentColor="#000"
      selectedBg="#111"
      selectedBorderColor="#222"
      xpClaimed={false}
      onEvaluate={onEvaluate}
    />
  );

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ userState: { ...initialProfileState, mistakeJournal: {} } });
});
afterEach(() => cleanup());

describe('IhkDrillPanel Fehlerjournal', () => {
  it('trägt falsch beantwortete Fragen ins Fehlerjournal ein, richtige nicht', () => {
    const onEvaluate = vi.fn();
    renderPanel(onEvaluate);
    fireEvent.click(screen.getByText(/a1/)); // richtig
    fireEvent.click(screen.getByText(/a2/)); // falsch
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/i }));

    const journal = useStore.getState().userState.mistakeJournal;
    expect(Object.keys(journal)).toEqual(['drilltest_2']);
    expect(journal.drilltest_2.wrongCount).toBe(1);
    expect(onEvaluate).toHaveBeenCalledWith(1);
  });

  it('schreibt nichts ins Journal, wenn alles richtig ist', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/a1/));
    fireEvent.click(screen.getByText(/b2/));
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/i }));
    expect(useStore.getState().userState.mistakeJournal).toEqual({});
  });
});

describe('IhkDrillPanel ohne XP (xpAmount = null)', () => {
  it('zeigt keine XP-Hinweise und beschriftet den Button neutral', () => {
    render(
      <IhkDrillPanel
        title="Neutraler Drill"
        questions={QUESTIONS}
        accentColor="#000"
        selectedBg="#111"
        selectedBorderColor="#222"
        xpClaimed
        xpAmount={null}
        onEvaluate={() => {}}
      />
    );
    expect(screen.queryByText(/XP/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Antworten prüfen' })).toBeTruthy();
  });

  it('zeigt standardmäßig +55 XP', () => {
    renderPanel();
    expect(screen.getByText('+55 XP')).toBeTruthy();
  });
});
