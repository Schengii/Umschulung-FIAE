import { describe, it, expect } from 'vitest';
import { LEGAL_CONSTANTS_STAND, SOCIAL_INSURANCE_2026, BASISZINSSATZ_BEISPIEL_PERCENT } from './legalConstants';

describe('legalConstants', () => {
  it('Stand ist ein gültiges Datum und nicht älter als 13 Monate', () => {
    const stand = new Date(LEGAL_CONSTANTS_STAND);
    expect(Number.isNaN(stand.getTime())).toBe(false);
    const limit = new Date();
    limit.setMonth(limit.getMonth() - 13);
    expect(stand.getTime()).toBeGreaterThan(limit.getTime());
  });

  it('Werte sind plausibel', () => {
    expect(SOCIAL_INSURANCE_2026.bbgPensionMonthly).toBeGreaterThan(SOCIAL_INSURANCE_2026.bbgHealthCareMonthly);
    expect(SOCIAL_INSURANCE_2026.careTotal).toBeLessThan(0.1);
    expect(BASISZINSSATZ_BEISPIEL_PERCENT).toBeGreaterThanOrEqual(-1);
  });
});
