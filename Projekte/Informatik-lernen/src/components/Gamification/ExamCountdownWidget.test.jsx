// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExamCountdownWidget, { hasEnoughReadinessData } from './ExamCountdownWidget';

describe('ExamCountdownWidget', () => {
  it('meldet zu wenig Daten unter der Mindestzahl', () => {
    expect(hasEnoughReadinessData({ domains: [{ completedTasks: 2 }, { completedTasks: 2 }] })).toBe(false);
    expect(hasEnoughReadinessData({ domains: [{ completedTasks: 3 }, { completedTasks: 2 }] })).toBe(true);
    expect(hasEnoughReadinessData(undefined)).toBe(false);
  });

  it('zeigt ohne Fortschritt keinen Score und keine Note', () => {
    render(<ExamCountdownWidget setActiveTab={() => {}} />);
    expect(screen.getByText(/noch zu wenig Daten/)).toBeTruthy();
    expect(screen.queryByText(/Prognose:/)).toBeNull();
  });
});
