// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IhkGradeCalculatorLab from './IhkGradeCalculatorLab';
import { calculateIhkFinalScore, calculateMepPossibilities } from '../../utils/ihkGradeCalculations';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const base = { ap1: 75, ap2_b1: 72, ap2_b2: 80, ap2_wiso: 68, doku: 85, fachgespraech: 88 };
// Reihenfolge der Zahlenfelder im Lab: AP1, AP2 B1, B2, WiSo, Doku, Fachgespräch
const FIELD = { ap1: 0, ap2_b1: 1, ap2_b2: 2, ap2_wiso: 3, doku: 4, fachgespraech: 5 };

describe('IhkGradeCalculatorLab', () => {
  it('zeigt Gesamtpunkte, Note und Bestehensstatus passend zur Engine', () => {
    const { container } = render(<IhkGradeCalculatorLab />);
    const r = calculateIhkFinalScore(base);
    const t = text(container);
    expect(t).toContain(`${r.totalPoints} Punkte`);
    expect(t).toContain(`Note ${r.overallGrade.text}`);
    expect(t).toContain(r.isPassed ? 'BESTANDEN' : 'NICHT BESTANDEN');
    expect(t).not.toContain('Optionen'); // keine MEP-Optionen bei durchweg guten Noten
  });

  it('rechnet nach Änderung eines Bereichs neu', () => {
    const { container } = render(<IhkGradeCalculatorLab />);
    fireEvent.change(screen.getAllByRole('spinbutton')[FIELD.ap1], { target: { value: '40' } });
    const r = calculateIhkFinalScore({ ...base, ap1: 40 });
    expect(text(container)).toContain(`${r.totalPoints} Punkte`);
  });

  it('klemmt Eingaben auf 0 bis 100 Punkte', () => {
    render(<IhkGradeCalculatorLab />);
    const [ap1] = screen.getAllByRole('spinbutton');
    fireEvent.change(ap1, { target: { value: '150' } });
    expect(Number(ap1.value)).toBe(100);
    fireEvent.change(ap1, { target: { value: '-5' } });
    expect(Number(ap1.value)).toBe(0);
  });

  it('bietet eine MEP an, wenn ein AP2-Bereich mangelhaft (30 bis 49) ist', () => {
    const { container } = render(<IhkGradeCalculatorLab />);
    fireEvent.change(screen.getAllByRole('spinbutton')[FIELD.ap2_b2], { target: { value: '40' } });
    const mep = calculateMepPossibilities({ ...base, ap2_b2: 40 });
    expect(mep.length).toBe(1);
    const t = text(container);
    expect(t).toContain('Mündliche Ergänzungsprüfung (MEP) Optionen');
    expect(t).toContain(mep[0].areaName);
    expect(t).toContain(mep[0].explanation);
  });
});
