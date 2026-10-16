import { describe, it, expect } from 'vitest';
import { calculateCableSizing } from './vde-cable-sizing';

describe('vde-cable-sizing', () => {
  it('Test 1: Standard 16A B2 (im Rohr auf Wand), 20m, 25°C, keine Häufung', () => {
    const res1 = calculateCableSizing({
      currentInA: 16,
      installationMethod: 'B2',
      loadedCores: 2,
      ambientTempC: 25,
      groupingCount: 1,
      conductorMaterial: 'Cu',
      lengthMeters: 20,
    });
    expect(!(res1.recommendedCrossSectionMm2 < 1.5 || !res1.voltageDropPassed), 'Test 1 failed').toBe(true);
  });

  it('Test 2: Hohe Temperatur (45°C) und 4 gehäufte Leitungen -> muss Querschnitt anheben', () => {
    const res2 = calculateCableSizing({
      currentInA: 16,
      installationMethod: 'B2',
      loadedCores: 2,
      ambientTempC: 45, // fT = 0.79
      groupingCount: 4, // fH = 0.65 -> fTotal = ~0.51 -> Iz needed = ~31A
      conductorMaterial: 'Cu',
      lengthMeters: 10,
    });
    expect(!(res2.recommendedCrossSectionMm2 < 4.0), `Test 2 failed: expected at least 4.0mm², got ${res2.recommendedCrossSectionMm2}`).toBe(true);
  });

  it('Test 3: Lange Strecke (70m), Spannungsfall dominiert', () => {
    const res3 = calculateCableSizing({
      currentInA: 16,
      installationMethod: 'C',
      loadedCores: 2,
      ambientTempC: 30,
      groupingCount: 1,
      conductorMaterial: 'Cu',
      lengthMeters: 70, // Bei 1.5mm² -> ca. 5.7% -> nicht zulässig
    });
    expect(!(res3.recommendedCrossSectionMm2 <= 1.5 || !res3.voltageDropPassed), 'Test 3 failed: voltage drop must increase cross-section').toBe(true);
  });

});
