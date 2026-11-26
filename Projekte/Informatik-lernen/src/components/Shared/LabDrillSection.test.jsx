// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LabDrillSection from './LabDrillSection';

afterEach(() => cleanup());

const QUESTIONS = [{ id: 'lds_1', frage: 'Frage?', optionen: ['Antwort A', 'Antwort B'], korrektIndex: 0, erklaerung: 'E' }];

describe('LabDrillSection', () => {
  it('rendert die Fragen erst nach dem Aufklappen', () => {
    const { container } = render(<LabDrillSection title="Drill" questions={QUESTIONS} />);
    expect(screen.getByText(/1 Fragen/)).toBeTruthy();
    expect(screen.queryByText(/Antwort A/)).toBeNull();

    const details = container.querySelector('details');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    expect(screen.getByText(/Antwort A/)).toBeTruthy();
  });

  it('entfernt die Fragen wieder, wenn der Bereich geschlossen wird', () => {
    const { container } = render(<LabDrillSection title="Drill" questions={QUESTIONS} />);
    const details = container.querySelector('details');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    details.open = false;
    fireEvent(details, new Event('toggle'));
    expect(screen.queryByText(/Antwort A/)).toBeNull();
  });
});

describe('LabDrillSection mit XP', () => {
  const FOUR = [1, 2, 3, 4].map((n) => ({ id: `xp_${n}`, frage: `Frage ${n}?`, optionen: ['Richtig', 'Falsch'], korrektIndex: 0, erklaerung: 'E' }));

  const openAndAnswer = (container, optionIndex) => {
    const details = container.querySelector('details');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    // Optionen erscheinen als "A) Richtig" bzw. "B) Falsch"
    const label = optionIndex === 0 ? /^A\) Richtig$/ : /^B\) Falsch$/;
    screen.getAllByText(label).forEach((el) => fireEvent.click(el));
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
  };

  it('vergibt die XP genau einmal bei mindestens 3 richtigen Antworten', () => {
    const onRewardXP = vi.fn();
    const { container } = render(<LabDrillSection title="Drill" questions={FOUR} xpReward={55} onRewardXP={onRewardXP} />);
    openAndAnswer(container, 0);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(55);
    expect(screen.getByText(/\+55 XP Erhalten/)).toBeTruthy();
  });

  it('vergibt keine XP bei zu vielen falschen Antworten', () => {
    const onRewardXP = vi.fn();
    const { container } = render(<LabDrillSection title="Drill" questions={FOUR} xpReward={55} onRewardXP={onRewardXP} />);
    openAndAnswer(container, 1);
    expect(onRewardXP).not.toHaveBeenCalled();
  });

  it('zeigt ohne XP-Props keine XP-Hinweise', () => {
    const { container } = render(<LabDrillSection title="Drill" questions={FOUR} />);
    const details = container.querySelector('details');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    expect(screen.queryByText(/XP/)).toBeNull();
  });
});
