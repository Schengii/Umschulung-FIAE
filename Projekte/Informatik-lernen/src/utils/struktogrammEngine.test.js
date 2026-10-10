import { describe, it, expect } from 'vitest';
import {
  STRUKTOGRAMM_PRESETS,
  traceRabattStaffel,
  traceMaximumSuche,
  traceKapitalVerdopplung,
  DIN_66261_ELEMENTS,
  STRUKTOGRAMM_DRILL_QUESTIONS
} from './struktogrammEngine';

describe('struktogrammEngine', () => {
  it('enthält alle notwendigen IHK-Presets und DIN-Elemente', () => {
    expect(STRUKTOGRAMM_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(DIN_66261_ELEMENTS.length).toBe(6);
    expect(STRUKTOGRAMM_DRILL_QUESTIONS.length).toBe(4);
  });

  describe('traceRabattStaffel', () => {
    it('berechnet 10% Rabatt für Bestellwert >= 500 €', () => {
      const steps = traceRabattStaffel(600);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables.rabattsatz).toBe(10);
      expect(lastStep.variables.rabattbetrag).toBe(60);
      expect(lastStep.variables.endpreis).toBe(540);
      expect(steps.some(s => s.description.includes('10% Rabattsatz gewährt'))).toBe(true);
    });

    it('berechnet 5% Rabatt für Bestellwert zwischen 200 und 499 €', () => {
      const steps = traceRabattStaffel(300);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables.rabattsatz).toBe(5);
      expect(lastStep.variables.rabattbetrag).toBe(15);
      expect(lastStep.variables.endpreis).toBe(285);
    });

    it('berechnet 0% Rabatt für Bestellwert unter 200 €', () => {
      const steps = traceRabattStaffel(150);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables.rabattsatz).toBe(0);
      expect(lastStep.variables.rabattbetrag).toBe(0);
      expect(lastStep.variables.endpreis).toBe(150);
    });
  });

  describe('traceMaximumSuche', () => {
    it('findet das Maximum in einer Zahlenfolge mit Schleifen-Schritten', () => {
      const steps = traceMaximumSuche([12, 45, 8, 32]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.variables.max).toBe(45);
      expect(steps.length).toBeGreaterThan(4);
      expect(steps.some(s => s.action === 'Update max')).toBe(true);
    });

    it('behandelt leere Arrays sicher', () => {
      const steps = traceMaximumSuche([]);
      expect(steps).toEqual([]);
    });
  });

  describe('traceKapitalVerdopplung', () => {
    it('berechnet die korrekte Laufzeit für Kapitalverdopplung mit 7%', () => {
      const steps = traceKapitalVerdopplung(1000, 7);
      const lastStep = steps[steps.length - 1];
      // 1000 * 1.07^11 = 2104.85
      expect(lastStep.variables.jahre).toBe(11);
      expect(lastStep.variables.kapital).toBeGreaterThanOrEqual(2000);
    });

    it('berechnet korrekte Laufzeit für 10%', () => {
      const steps = traceKapitalVerdopplung(1000, 10);
      const lastStep = steps[steps.length - 1];
      // 1000 * 1.10^8 = 2143.59
      expect(lastStep.variables.jahre).toBe(8);
    });
  });
});
