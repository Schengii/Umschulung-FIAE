import { describe, it, expect } from 'vitest';
import {
  ELECTRICAL_PROTECTION_CLASSES,
  evaluatePeResistance,
  evaluateIsoResistance,
  evaluateRcdProtection,
  calculateUpsBatteryRuntime
} from './dguvV3ElektronikEngine';

describe('dguvV3ElektronikEngine', () => {
  it('enthält alle 3 VDE-Schutzklassen', () => {
    expect(ELECTRICAL_PROTECTION_CLASSES.class_1).toBeDefined();
    expect(ELECTRICAL_PROTECTION_CLASSES.class_2).toBeDefined();
    expect(ELECTRICAL_PROTECTION_CLASSES.class_3).toBeDefined();
  });

  it('bewertet Schutzleiterwiderstand R_PE bis 5m und mit Überlänge', () => {
    // 0.15 Ohm bei 2m -> Bestanden (Limit 0.3 Ohm)
    const res1 = evaluatePeResistance(0.15, 2);
    expect(res1.isPassed).toBe(true);
    expect(res1.limitOhm).toBe(0.3);

    // 0.35 Ohm bei 2m -> Nicht bestanden
    const res2 = evaluatePeResistance(0.35, 2);
    expect(res2.isPassed).toBe(false);

    // Bei 10m Leitungslänge erhöht sich das Limit um 0.1 auf 0.4 Ohm
    const res3 = evaluatePeResistance(0.35, 10);
    expect(res3.isPassed).toBe(true);
    expect(res3.limitOhm).toBe(0.4);
  });

  it('bewertet Isolationswiderstand R_ISO für SK I und SK II', () => {
    // SK I: min 1.0 MOhm
    expect(evaluateIsoResistance(2.5, 'class_1').isPassed).toBe(true);
    expect(evaluateIsoResistance(0.8, 'class_1').isPassed).toBe(false);

    // SK II: min 2.0 MOhm
    expect(evaluateIsoResistance(2.5, 'class_2').isPassed).toBe(true);
    expect(evaluateIsoResistance(1.5, 'class_2').isPassed).toBe(false);
  });

  it('bewertet RCD Abschaltung nach DIN VDE 0100-410', () => {
    // 30 mA RCD: Auslösung bei 25 mA und 120 ms im TN-Netz -> Bestanden
    const rcdOk = evaluateRcdProtection(25, 120, 30, 'TN');
    expect(rcdOk.isPassed).toBe(true);
    expect(rcdOk.tripCurrentPassed).toBe(true);
    expect(rcdOk.tripTimePassed).toBe(true);

    // Zu lange Abschaltzeit (> 400 ms im TN-Netz)
    const rcdSlow = evaluateRcdProtection(25, 450, 30, 'TN');
    expect(rcdSlow.isPassed).toBe(false);
    expect(rcdSlow.tripTimePassed).toBe(false);

    // Zu niedriger Auslösestrom (< 15 mA)
    const rcdTooSensitive = evaluateRcdProtection(10, 100, 30, 'TN');
    expect(rcdTooSensitive.isPassed).toBe(false);
    expect(rcdTooSensitive.tripCurrentPassed).toBe(false);
  });

  it('berechnet USV Batterieautonomie korrekt', () => {
    // 100 Ah * 48 V = 4800 Wh * 0.85 = 4080 Wh. Bei 1000 W -> 4.08 Std = 244.8 Min
    const ups = calculateUpsBatteryRuntime(100, 48, 1000, 0.85);
    expect(ups.storedEnergyWh).toBe(4800);
    expect(ups.runtimeMinutes).toBe(244.8);
    expect(ups.autonomyEvaluation).toContain('Exzellente Autonomiezeit');
  });
});
