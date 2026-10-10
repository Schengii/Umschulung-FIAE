import { describe, it, expect } from 'vitest';
import { calculateMaschinenstundensatz } from './wisoMaschinenstundensatzEngine';

describe('calculateMaschinenstundensatz', () => {
  it('correctly calculates default standard values according to IHK formula', () => {
    const res = calculateMaschinenstundensatz({
      wiederbeschaffungswert: 120000,
      restwert: 0,
      nutzungsdauerJahre: 6,
      kalkZinssatzProzent: 8,
      jaehrlicheLaufstunden: 1600,
      raumflaecheQm: 25,
      raumkostensatzProQm: 120,
      leistungKw: 15,
      strompreisKwh: 0.35,
      instandhaltungProJahr: 3500,
      werkzeugkostenProJahr: 2000
    });

    // Abschreibung: 120,000 / 6 = 20,000 €/a -> 20,000 / 1600 = 12.50 €/h
    expect(res.abschreibungProJahr).toBe(20000);
    expect(res.abschreibungProStunde).toBe(12.50);

    // Zinsen: ((120,000 + 0) / 2) * 8% = 4,800 €/a -> 4,800 / 1600 = 3.00 €/h
    expect(res.zinsenProJahr).toBe(4800);
    expect(res.zinsenProStunde).toBe(3.00);

    // Raumkosten: 25 * 120 = 3,000 €/a -> 3,000 / 1600 = 1.875 -> 1.88 €/h
    expect(res.raumkostenProJahr).toBe(3000);
    expect(res.raumkostenProStunde).toBe(1.88);

    // Energiekosten: 15 kW * 0.35 € = 5.25 €/h -> * 1600 = 8,400 €/a
    expect(res.energiekostenProStunde).toBe(5.25);
    expect(res.energiekostenProJahr).toBe(8400);

    // Instandhaltung: 3500 / 1600 = 2.1875 -> 2.19 €/h
    expect(res.instandhaltungProStunde).toBe(2.19);

    // Werkzeugkosten: 2000 / 1600 = 1.25 €/h
    expect(res.werkzeugkostenProStunde).toBe(1.25);

    // Total MSS: 12.50 + 3.00 + 1.875 + 5.25 + 2.1875 + 1.25 = 26.0625 -> 26.06 €/h
    expect(res.maschinenstundensatzGesamt).toBe(26.06);
  });

  it('handles rest value (Restwert) properly in depreciation and interest calculation', () => {
    const res = calculateMaschinenstundensatz({
      wiederbeschaffungswert: 100000,
      restwert: 20000,
      nutzungsdauerJahre: 5,
      kalkZinssatzProzent: 10,
      jaehrlicheLaufstunden: 1000,
      raumflaecheQm: 10,
      raumkostensatzProQm: 100,
      leistungKw: 10,
      strompreisKwh: 0.30,
      instandhaltungProJahr: 1000,
      werkzeugkostenProJahr: 1000
    });

    // AfA: (100,000 - 20,000) / 5 = 16,000 €/a -> 16.00 €/h
    expect(res.abschreibungProJahr).toBe(16000);
    expect(res.abschreibungProStunde).toBe(16);

    // Zinsen: ((100,000 + 20,000) / 2) * 10% = 6,000 €/a -> 6.00 €/h
    expect(res.zinsenProJahr).toBe(6000);
    expect(res.zinsenProStunde).toBe(6);
  });
});
