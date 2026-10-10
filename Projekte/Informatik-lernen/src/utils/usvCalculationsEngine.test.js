import { describe, it, expect } from 'vitest';
import {
  USV_TOPOLOGIES,
  calculatePowerMetrics,
  calculateAutonomyTime,
  calculatePue,
  DEFAULT_SERVER_RACK_CONSUMERS,
  USV_DRILL_QUESTIONS
} from './usvCalculationsEngine';

describe('usvCalculationsEngine', () => {
  it('enthält alle Topologien und Drill-Fragen', () => {
    expect(USV_TOPOLOGIES.length).toBe(3);
    expect(USV_DRILL_QUESTIONS.length).toBe(4);
    expect(DEFAULT_SERVER_RACK_CONSUMERS.length).toBe(4);
  });

  describe('calculatePowerMetrics', () => {
    it('berechnet Scheinleistung und Blindleistung für P=1600W und cos(phi)=0.8', () => {
      const res = calculatePowerMetrics(1600, 0.8, 25);
      expect(res.activePowerW).toBe(1600);
      expect(res.apparentPowerVa).toBe(2000);
      expect(res.reactivePowerVar).toBe(1200);
      expect(res.requiredUsvWatt).toBe(2000); // 1600 * 1.25
      expect(res.requiredUsvVa).toBe(2500); // 2000 * 1.25
    });
  });

  describe('calculateAutonomyTime', () => {
    it('berechnet Autonomiezeit für 12V 100Ah Batterie bei 500W Last', () => {
      // 12V * 100Ah = 1200 Wh.
      // Nutzbar mit eta=0.85 & DoD=0.85: 1200 * 0.85 * 0.85 = 867 Wh.
      // 867 Wh / 500 W * 60 min = 104.04 min
      const res = calculateAutonomyTime(500, 12, 100, 0.85, 0.85);
      expect(res.totalEnergyWh).toBe(1200);
      expect(res.usableEnergyWh).toBe(867);
      expect(res.runtimeMinutes).toBeCloseTo(104.0, 1);
    });

    it('gibt 0 zurück bei Nulllast', () => {
      const res = calculateAutonomyTime(0, 12, 100);
      expect(res.runtimeMinutes).toBe(0);
    });
  });

  describe('calculatePue', () => {
    it('berechnet PUE und Overhead für 1250 kWh gesamt vs. 1000 kWh IT', () => {
      const res = calculatePue(1250, 1000);
      expect(res.pue).toBe(1.25);
      expect(res.overheadPercent).toBe(25);
      expect(res.rating).toBe('Sehr gut');
    });

    it('bewertet PUE <= 1.2 als Hervorragend', () => {
      const res = calculatePue(1150, 1000);
      expect(res.pue).toBe(1.15);
      expect(res.rating).toBe('Hervorragend');
    });
  });
});
