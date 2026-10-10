import { describe, it, expect } from 'vitest';
import {
  evaluateSachmangelRights
} from './wisoSachmaengelEngine';

describe('wisoSachmaengelEngine', () => {
  it('identifies primary right (Nacherfüllung) before seller attempts fail', () => {
    const result = evaluateSachmangelRights({
      mangelType: 'BESCHAFFENHEIT',
      contractType: 'B2B_HANDELSKAUF',
      isOpenDefect: true,
      inspectionNoticeWithinDays: 1, // Sofort gerügt
      nacherfuellungAttempts: 0,
      sellerRefused: false,
      flawIsMinor: false,
      monthsSincePurchase: 1
    });

    expect(result.goodsDeemedAccepted).toBe(false);
    expect(result.availableRights.find((r) => r.name.includes('Nacherfüllung'))?.allowed).toBe(true);
    expect(result.availableRights.find((r) => r.name.includes('Rücktritt'))?.allowed).toBe(false);
    expect(result.availableRights.find((r) => r.name.includes('Minderung'))?.allowed).toBe(false);
  });

  it('enforces HGB § 377: late notice on open defect leads to loss of all rights', () => {
    const result = evaluateSachmangelRights({
      mangelType: 'ALIUD_FALSCHLIEFERUNG',
      contractType: 'B2B_HANDELSKAUF',
      isOpenDefect: true,
      inspectionNoticeWithinDays: 14, // 14 Tage zu spät gerügt!
      nacherfuellungAttempts: 0,
      sellerRefused: false,
      flawIsMinor: false,
      monthsSincePurchase: 1
    });

    expect(result.goodsDeemedAccepted).toBe(true);
    expect(result.availableRights.every((r) => !r.allowed)).toBe(true);
  });

  it('allows Rücktritt and Minderung after 2 failed attempts for significant flaw', () => {
    const result = evaluateSachmangelRights({
      mangelType: 'BESCHAFFENHEIT',
      contractType: 'B2C_VERBRAUCHER',
      isOpenDefect: false,
      inspectionNoticeWithinDays: 10,
      nacherfuellungAttempts: 2, // 2 Versuche fehlgeschlagen
      sellerRefused: false,
      flawIsMinor: false,
      monthsSincePurchase: 4
    });

    expect(result.goodsDeemedAccepted).toBe(false);
    expect(result.availableRights.find((r) => r.name.includes('Rücktritt'))?.allowed).toBe(true);
    expect(result.availableRights.find((r) => r.name.includes('Minderung'))?.allowed).toBe(true);
    expect(result.burdenOfProof).toBe('SELLER'); // Innerhalb 12 Monate Verbrauchsgüterkauf
  });

  it('blocks Rücktritt if flaw is minor (Bagatellmangel) but allows Minderung', () => {
    const result = evaluateSachmangelRights({
      mangelType: 'BESCHAFFENHEIT',
      contractType: 'B2C_VERBRAUCHER',
      isOpenDefect: false,
      inspectionNoticeWithinDays: 2,
      nacherfuellungAttempts: 2,
      sellerRefused: false,
      flawIsMinor: true, // Bagatellmangel (z.B. kleiner Kratzer)
      monthsSincePurchase: 2
    });

    expect(result.availableRights.find((r) => r.name.includes('Rücktritt'))?.allowed).toBe(false);
    expect(result.availableRights.find((r) => r.name.includes('Minderung'))?.allowed).toBe(true);
  });
});
