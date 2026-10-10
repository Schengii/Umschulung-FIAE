import { describe, it, expect, vi } from 'vitest';
import {
  getEcbReferenceRate,
  convertWithEcbRate,
  updateEcbRateCache,
  fetchAndCacheLiveEcbRates
} from '../fxRatesService';

describe('fxRatesService', () => {
  it('returns 1.0 for EUR', () => {
    expect(getEcbReferenceRate('EUR')).toBe(1.0);
  });

  it('retrieves default and historical rates correctly', () => {
    const usdDefault = getEcbReferenceRate('USD');
    expect(usdDefault).toBeGreaterThan(1.0);

    const usdJan2024 = getEcbReferenceRate('USD', '01.01.2024');
    expect(usdJan2024).toBe(1.100);

    const chfJan2025 = getEcbReferenceRate('CHF', '2025-01-15');
    expect(chfJan2025).toBe(0.975);
  });

  it('converts currencies accurately via ECB rates', () => {
    // 100 EUR to USD at default rate
    const usdRate = getEcbReferenceRate('USD');
    const convertedUsd = convertWithEcbRate(100, 'EUR', 'USD');
    expect(convertedUsd).toBeCloseTo(100 * usdRate, 2);

    // 110 USD to EUR on 01.01.2024 (rate was 1.100) -> 100 EUR
    const convertedEur = convertWithEcbRate(110, 'USD', 'EUR', '01.01.2024');
    expect(convertedEur).toBeCloseTo(100, 2);
  });

  it('updates cache dynamically and respects new rates', () => {
    updateEcbRateCache('2026-10-01', { USD: 1.15, CHF: 0.95, GBP: 0.82 });
    const updatedRate = getEcbReferenceRate('USD', '15.10.2026');
    expect(updatedRate).toBe(1.15);
  });

  it('handles fetch fallback cleanly when network errors occur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));
    const rates = await fetchAndCacheLiveEcbRates();
    expect(rates.EUR).toBe(1.0);
    expect(rates.USD).toBeGreaterThan(1.0);
    vi.unstubAllGlobals();
  });
});
