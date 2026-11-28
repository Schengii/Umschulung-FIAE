// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoMaschinenstundensatzLab from './WisoMaschinenstundensatzLab';
import { calculateMaschinenstundensatz } from '../../utils/wisoMaschinenstundensatzEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const base = {
  wiederbeschaffungswert: 120000, restwert: 0, nutzungsdauerJahre: 6, kalkZinssatzProzent: 8,
  jaehrlicheLaufstunden: 1600, raumflaecheQm: 25, raumkostensatzProQm: 120, leistungKw: 15,
  strompreisKwh: 0.35, instandhaltungProJahr: 3500, werkzeugkostenProJahr: 2000
};

describe('WisoMaschinenstundensatzLab', () => {
  it('zeigt Maschinenstundensatz und Teilkosten passend zur Engine', () => {
    const { container } = render(<WisoMaschinenstundensatzLab />);
    const c = calculateMaschinenstundensatz(base);
    const t = text(container);
    expect(t).toContain(c.maschinenstundensatzGesamt.toFixed(2));
    expect(t).toContain(`${c.abschreibungProStunde.toFixed(2)} €/h`);
    expect(t).toContain(`${c.zinsenProStunde.toFixed(2)} €/h`);
    expect(t).toContain(`${c.raumkostenProStunde.toFixed(2)} €/h`);
  });

  it('rechnet nach Änderung des Wiederbeschaffungswerts neu', () => {
    const { container } = render(<WisoMaschinenstundensatzLab />);
    const [wbw] = screen.getAllByRole('spinbutton');
    fireEvent.change(wbw, { target: { value: '240000' } });
    const c = calculateMaschinenstundensatz({ ...base, wiederbeschaffungswert: 240000 });
    const t = text(container);
    expect(t).toContain(c.maschinenstundensatzGesamt.toFixed(2));
    expect(t).toContain(`${c.abschreibungProStunde.toFixed(2)} €/h`);
  });

  it('rechnet nach Änderung der Laufstunden neu', () => {
    const { container } = render(<WisoMaschinenstundensatzLab />);
    const hours = screen.getAllByRole('spinbutton')[4];
    fireEvent.change(hours, { target: { value: '800' } });
    const c = calculateMaschinenstundensatz({ ...base, jaehrlicheLaufstunden: 800 });
    expect(text(container)).toContain(c.maschinenstundensatzGesamt.toFixed(2));
  });
});
