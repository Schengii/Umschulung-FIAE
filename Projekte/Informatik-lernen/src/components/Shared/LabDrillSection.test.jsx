// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
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
