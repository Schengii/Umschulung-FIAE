// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LearningMixWidget from './LearningMixWidget';
import { useStore } from '../../store/useStore';

beforeEach(() =>
  useStore.setState((s) => ({ userState: { ...s.userState, mistakeJournal: {}, placementResult: null, dailyMixLog: null } }))
);
afterEach(() => cleanup());

const answerAll = (max) => {
  for (let i = 0; i < max; i++) {
    const flip = screen.queryByRole('button', { name: /Antwort zeigen/i });
    if (flip) {
      fireEvent.click(flip);
      fireEvent.click(screen.getByRole('button', { name: 'Gut' }));
      continue;
    }
    const group = screen.queryByRole('group', { name: /Antwortmöglichkeiten/i });
    if (!group) break;
    fireEvent.click(group.querySelector('button'));
    fireEvent.click(screen.getByRole('button', { name: /^(Nächste Frage|Auswerten)/i }));
  }
};

describe('LearningMixWidget', () => {
  it('bietet Einstufungstest und Lernmix an', () => {
    render(<LearningMixWidget />);
    expect(screen.getByRole('button', { name: /Einstufungstest/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tages-Lernmix starten/i })).toBeTruthy();
  });

  it('schließt den Lernmix ab und speichert das Ergebnis', () => {
    render(<LearningMixWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Tages-Lernmix starten/i }));
    answerAll(10);
    expect(useStore.getState().userState.dailyMixLog.total).toBe(10);
    expect(screen.getByText(/Tages-Lernmix geschafft/i)).toBeTruthy();
  });

  it('nimmt Karteikarten in den Lernmix auf und aktualisiert deren SM-2-Status', () => {
    useStore.setState((st) => ({ userState: { ...st.userState, srsFlashcards: {} } }));
    render(<LearningMixWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Tages-Lernmix starten/i }));
    answerAll(10);
    expect(Object.keys(useStore.getState().userState.srsFlashcards).length).toBe(3);
  });

  it('speichert das Einstufungsergebnis', () => {
    render(<LearningMixWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Einstufungstest/i }));
    answerAll(12);
    expect(useStore.getState().userState.placementResult).toBeTruthy();
  });
});
