// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MistakeReviewWidget from './MistakeReviewWidget';
import { useStore } from '../../store/useStore';
import { EXAM_QUESTIONS } from '../../data/examData';
import { toDateKey } from '../../utils/mistakeJournalEngine';

const Q = EXAM_QUESTIONS[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
};
const setJournal = (journal) =>
  useStore.setState((s) => ({ userState: { ...s.userState, mistakeJournal: journal } }));

beforeEach(() => setJournal({}));
afterEach(() => cleanup());

describe('MistakeReviewWidget', () => {
  it('rendert nichts, solange das Journal leer ist', () => {
    const { container } = render(<MistakeReviewWidget />);
    expect(container.firstChild).toBeNull();
  });

  it('zeigt fällige Fragen und deaktiviert den Button, wenn nichts fällig ist', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    setJournal({ [Q.id]: { wrongCount: 1, streak: 0, interval: 1, dueDate: toDateKey(future), lastSeen: '' } });
    render(<MistakeReviewWidget />);
    expect(screen.getByRole('button', { name: /Nichts fällig/i }).disabled).toBe(true);
  });

  it('führt eine Wiederholung durch und aktualisiert das Journal', () => {
    setJournal({ [Q.id]: { wrongCount: 1, streak: 0, interval: 1, dueDate: yesterday(), lastSeen: '' } });
    render(<MistakeReviewWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Jetzt wiederholen/i }));
    expect(screen.getByText(Q.question)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: Q.options[Q.correct] }));
    const entry = useStore.getState().userState.mistakeJournal[Q.id];
    expect(entry.streak).toBe(1);
    expect(entry.interval).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Fertig' }));
    expect(screen.getByText(/heute fällig/i)).toBeTruthy();
  });

  it('setzt eine falsch wiederholte Frage auf Intervall 1 zurück', () => {
    setJournal({ [Q.id]: { wrongCount: 1, streak: 1, interval: 3, dueDate: yesterday(), lastSeen: '' } });
    render(<MistakeReviewWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Jetzt wiederholen/i }));
    const wrong = Q.options.findIndex((_, i) => i !== Q.correct);
    fireEvent.click(screen.getByRole('button', { name: Q.options[wrong] }));
    const entry = useStore.getState().userState.mistakeJournal[Q.id];
    expect(entry).toMatchObject({ streak: 0, interval: 1, wrongCount: 2 });
  });

  it('Store: recordMistakeResults ignoriert leere Eingaben', () => {
    const before = useStore.getState().userState;
    useStore.getState().recordMistakeResults([]);
    expect(useStore.getState().userState).toBe(before);
  });
});

describe('MistakeReviewWidget mit Lab-Drill-Fragen', () => {
  it('wiederholt eine Drill-Frage inklusive Erklärung', async () => {
    const { DRILL_QUESTIONS } = await import('../../data/drillQuestions');
    const D = DRILL_QUESTIONS[0];
    setJournal({ [D.id]: { wrongCount: 1, streak: 0, interval: 1, dueDate: yesterday(), lastSeen: '' } });
    render(<MistakeReviewWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Jetzt wiederholen/i }));
    expect(screen.getByText(D.question)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: D.options[D.correct] }));
    expect(screen.getByText(D.explanation)).toBeTruthy();
    expect(useStore.getState().userState.mistakeJournal[D.id].streak).toBe(1);
  });

  it('zählt Journal-Einträge ohne auffindbare Frage nicht mit', () => {
    setJournal({ unbekannte_frage_id: { wrongCount: 1, streak: 0, interval: 1, dueDate: yesterday(), lastSeen: '' } });
    const { container } = render(<MistakeReviewWidget />);
    expect(container.firstChild).toBeNull();
  });
});
