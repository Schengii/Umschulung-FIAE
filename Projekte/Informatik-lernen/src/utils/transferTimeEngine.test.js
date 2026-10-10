import { describe, it, expect } from 'vitest';
import {
  toBytes,
  toBps,
  calculateTransferTime,
  formatDuration,
  IHK_SCENARIOS
} from './transferTimeEngine';

describe('transferTimeEngine', () => {
  it('konvertiert Einheiten korrekt (Dezimal vs. Binär)', () => {
    expect(toBytes(1, 'MB')).toBe(1_000_000);
    expect(toBytes(1, 'MIB')).toBe(1_048_576);
    expect(toBytes(1, 'GB')).toBe(1_000_000_000);
    expect(toBytes(1, 'GIB')).toBe(1_073_741_824);
  });

  it('konvertiert Bandbreiten korrekt in bps', () => {
    expect(toBps(100, 'MBPS')).toBe(100_000_000);
    expect(toBps(1, 'GBPS')).toBe(1_000_000_000);
    expect(toBps(50, 'KBPS')).toBe(50_000);
  });

  it('berechnet Übertragungszeit ohne Overhead präzise', () => {
    // 100 MB = 100 * 10^6 * 8 Bit = 800 * 10^6 Bit
    // 100 Mbit/s = 100 * 10^6 Bit/s
    // Dauer = 8 Sekunden
    const res = calculateTransferTime({
      dataAmount: 100,
      dataUnit: 'MB',
      speedAmount: 100,
      speedUnit: 'MBPS',
      overheadPercent: 0
    });
    expect(res.seconds).toBe(8);
    expect(res.totalBits).toBe(800_000_000);
  });

  it('berücksichtigt Protokoll-Overhead korrekt', () => {
    // 100 MB bei 100 Mbit/s mit 10% Overhead = 8s * 1.10 = 8.8s
    const res = calculateTransferTime({
      dataAmount: 100,
      dataUnit: 'MB',
      speedAmount: 100,
      speedUnit: 'MBPS',
      overheadPercent: 10
    });
    expect(res.seconds).toBeCloseTo(8.8, 2);
  });

  it('formatiert Zeitspannen menschenlesbar', () => {
    expect(formatDuration(0.5)).toBe('500 ms');
    expect(formatDuration(45)).toBe('45.0 s');
    expect(formatDuration(125)).toBe('2 Min. 5 Sek.');
    expect(formatDuration(3665)).toBe('1 Std. 1 Min. 5 Sek.');
    expect(formatDuration(90000)).toBe('1 Tag 1 Std.');
  });

  it('liefert sinnvolle Schritte für alle IHK-Presets', () => {
    for (const scenario of IHK_SCENARIOS) {
      const result = calculateTransferTime(scenario);
      expect(result.seconds).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(3);
    }
  });

  it('fängt ungültige Werte sicher ab', () => {
    const invalid = calculateTransferTime({
      dataAmount: 0,
      dataUnit: 'MB',
      speedAmount: 100,
      speedUnit: 'MBPS'
    });
    expect(invalid.seconds).toBe(0);
  });
});
