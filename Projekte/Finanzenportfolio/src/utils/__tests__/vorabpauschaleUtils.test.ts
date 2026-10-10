import { describe, it, expect } from 'vitest';
import { calculateDetailedVorabpauschale, getTeilfreistellungsQuote } from '../vorabpauschaleUtils';

describe('vorabpauschaleUtils (Investmentsteuergesetz § 18 & 20)', () => {
  it('correctly identifies Teilfreistellungs-Quoten', () => {
    expect(getTeilfreistellungsQuote('ETF', 'EUNL', 'iShares Core MSCI World')).toBe(0.30);
    expect(getTeilfreistellungsQuote('ETF', 'DBX0AN', 'Xtrackers EUR Overnight Bond')).toBe(0.0);
    expect(getTeilfreistellungsQuote('Stock', 'AAPL', 'Apple Inc.')).toBe(0.0);
  });

  it('calculates zero Vorabpauschale if ETF performance is negative', () => {
    const etfHoldings = [
      {
        ticker: 'ETF-LOSS',
        name: 'Fictional Loss ETF',
        category: 'ETF',
        shares: 100,
        currentPrice: 80, // Price dropped from 100
        totalCost: 10000, // 100 * 100 = 10000 start
        teilfreistellungRate: 0.30
      }
    ];

    const result = calculateDetailedVorabpauschale(etfHoldings, {}, 2026, 0.024);
    expect(result.breakdown[0].vorabpauschaleRawEur).toBe(0);
    expect(result.totalTaxableVorabpauschaleEur).toBe(0);
    expect(result.totalEstimatedTaxEur).toBe(0);
  });

  it('calculates Vorabpauschale correctly with cap and dividends deduction', () => {
    // 100 shares at 100 EUR start (10.000 EUR), current 110 EUR (gain +1.000 EUR)
    // Basiszins = 2.4% -> Basisertrag gross = 10.000 * 0.024 * 0.70 = 168 EUR
    // Cap: min(168, 1000) = 168 EUR
    // Ausschüttung = 50 EUR -> vorabpauschaleRaw = 168 - 50 = 118 EUR
    // Teilfreistellung 30% -> taxable = 118 * 0.7 = 82.60 EUR
    const etfHoldings = [
      {
        ticker: 'EUNL',
        name: 'MSCI World ETF',
        category: 'ETF',
        shares: 100,
        currentPrice: 110,
        totalCost: 10000,
        teilfreistellungRate: 0.30
      }
    ];

    const result = calculateDetailedVorabpauschale(etfHoldings, { EUNL: 50 }, 2026, 0.024);
    expect(result.breakdown[0].basisErtragGrossEur).toBeCloseTo(168, 2);
    expect(result.breakdown[0].vorabpauschaleRawEur).toBeCloseTo(118, 2);
    expect(result.breakdown[0].vorabpauschaleTaxableEur).toBeCloseTo(82.60, 2);
    expect(result.breakdown[0].estimatedTaxDueEur).toBeCloseTo(82.60 * 0.26375, 2);
  });
});
