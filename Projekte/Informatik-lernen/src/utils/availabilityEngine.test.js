import { describe, it, expect } from 'vitest';
import {
  MINUTES_PER_YEAR,
  downtimeMinutesPerYear,
  downtimeMinutesPerMonth,
  formatDowntime,
  serialAvailability,
  parallelAvailability,
  availabilityClasses
} from './availabilityEngine';

describe('availabilityEngine', () => {
  it('Ein Jahr hat 525.600 Minuten', () => {
    expect(MINUTES_PER_YEAR).toBe(525600);
  });

  it('Golden: Ausfallzeit pro Jahr für die gängigen Neunen', () => {
    expect(downtimeMinutesPerYear(99)).toBeCloseTo(5256, 6); // 87,6 Std.
    expect(downtimeMinutesPerYear(99.9)).toBeCloseTo(525.6, 6); // 8,76 Std.
    expect(downtimeMinutesPerYear(99.99)).toBeCloseTo(52.56, 6);
    expect(downtimeMinutesPerYear(99.999)).toBeCloseTo(5.256, 6);
    expect(downtimeMinutesPerYear(100)).toBe(0);
    expect(downtimeMinutesPerYear(0)).toBe(MINUTES_PER_YEAR);
  });

  it('Monatswert ist ein Zwölftel des Jahreswerts', () => {
    expect(downtimeMinutesPerMonth(99.9)).toBeCloseTo(43.8, 6);
  });

  it('ungültige Eingaben ergeben NaN', () => {
    expect(downtimeMinutesPerYear(-1)).toBeNaN();
    expect(downtimeMinutesPerYear(101)).toBeNaN();
    expect(downtimeMinutesPerYear(Number.NaN)).toBeNaN();
    expect(serialAvailability([])).toBeNaN();
    expect(serialAvailability([99, 120])).toBeNaN();
    expect(parallelAvailability([])).toBeNaN();
    expect(parallelAvailability([99, -5])).toBeNaN();
  });

  it('Reihenschaltung multipliziert die Verfügbarkeiten', () => {
    expect(serialAvailability([99.9, 99.9])).toBeCloseTo(99.8001, 6);
    // 0,999 · 0,995 · 0,99 = 0,98406495
    expect(serialAvailability([99.9, 99.5, 99])).toBeCloseTo(98.406495, 5);
    expect(serialAvailability([100, 100])).toBe(100);
  });

  it('Parallelschaltung multipliziert die Ausfallwahrscheinlichkeiten', () => {
    expect(parallelAvailability([99, 99])).toBeCloseTo(99.99, 6);
    expect(parallelAvailability([90, 90, 90])).toBeCloseTo(99.9, 6);
    expect(parallelAvailability([99.9])).toBeCloseTo(99.9, 6);
  });

  it('Redundanz verbessert, Reihenschaltung verschlechtert die Verfügbarkeit', () => {
    expect(parallelAvailability([95, 95])).toBeGreaterThan(95);
    expect(serialAvailability([95, 95])).toBeLessThan(95);
  });

  it('formatDowntime formatiert Sekunden, Minuten, Stunden und Tage', () => {
    expect(formatDowntime(0.5)).toBe('30,0 Sek.');
    expect(formatDowntime(5.256)).toBe('5,3 Min.');
    expect(formatDowntime(525.6)).toBe('8 Std. 46 Min.');
    expect(formatDowntime(5256)).toBe('3 Tage 16 Std.');
    expect(formatDowntime(Number.NaN)).toBe('–');
  });

  it('availabilityClasses listet die Neunen aufsteigend mit sinkender Ausfallzeit', () => {
    const classes = availabilityClasses();
    expect(classes).toHaveLength(5);
    for (let i = 1; i < classes.length; i++) {
      expect(classes[i].percent).toBeGreaterThan(classes[i - 1].percent);
      expect(classes[i].minutesPerYear).toBeLessThan(classes[i - 1].minutesPerYear);
    }
    expect(classes[1].label).toBe('99,9 %');
  });
});
