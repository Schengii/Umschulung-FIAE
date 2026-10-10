import { describe, it, expect } from 'vitest';
import { calculateTerAnalysis } from '../terUtils';
import type { Holding } from '../../types';

describe('terUtils - calculateTerAnalysis', () => {
  const sampleHoldings: Holding[] = [
    {
      ticker: 'EUNL',
      name: 'iShares Core MSCI World',
      category: 'ETF',
      shares: 100,
      averageBuyPrice: 80,
      currentPrice: 100,
      totalCost: 8000,
      currentValue: 10000,
      totalGain: 2000,
      totalGainPercent: 25.0,
      portfolioWeight: 50,
      yieldOnCost: 1.5,
      terPercent: 0.20 // 0.20%
    },
    {
      ticker: 'IS3N',
      name: 'iShares Core EM IMI',
      category: 'ETF',
      shares: 100,
      averageBuyPrice: 25,
      currentPrice: 30,
      totalCost: 2500,
      currentValue: 3000,
      totalGain: 500,
      totalGainPercent: 20.0,
      portfolioWeight: 15,
      yieldOnCost: 2.0,
      terPercent: 0.18 // 0.18%
    },
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      category: 'Stock',
      shares: 10,
      averageBuyPrice: 150,
      currentPrice: 200,
      totalCost: 1500,
      currentValue: 2000,
      totalGain: 500,
      totalGainPercent: 33.3,
      portfolioWeight: 10,
      yieldOnCost: 1.0
    }
  ];

  it('calculates weighted TER and annual fees accurately for ETFs', () => {
    const analysis = calculateTerAnalysis(sampleHoldings);

    // Total ETF value = 10,000 + 3,000 = 13,000 €
    expect(analysis.totalAnalyzedFundValueEur).toBe(13000);
    expect(analysis.funds.length).toBe(2);

    // Fee: 10,000 * 0.002 = 20 €
    // Fee: 3,000 * 0.0018 = 5.40 €
    // Total annual fee: 25.40 €
    expect(analysis.totalAnnualFeeEur).toBeCloseTo(25.40, 2);

    // Weighted TER: 25.40 / 13000 * 100 = ~0.195%
    expect(analysis.weightedTerPercent).toBeCloseTo(0.20, 2);
  });

  it('projects compound fee drag and active fund comparison over 30 years', () => {
    const analysis = calculateTerAnalysis(sampleHoldings, {
      expectedGrossReturnPercent: 7.0,
      benchmarkActiveFundTerPercent: 1.80,
      projectionYears: 30
    });

    expect(analysis.projection.length).toBe(30);

    const year10 = analysis.projection[9];
    expect(year10.withoutFeesEur).toBeGreaterThan(year10.withCurrentTerEur);
    expect(year10.withCurrentTerEur).toBeGreaterThan(year10.withActiveFundFeeEur);

    expect(analysis.tenYearCompoundLossEur).toBeGreaterThan(0);
    expect(analysis.twentyYearCompoundLossEur).toBeGreaterThan(analysis.tenYearCompoundLossEur);
    expect(analysis.thirtyYearCompoundLossEur).toBeGreaterThan(analysis.twentyYearCompoundLossEur);

    // Saving vs active fund should be significant over 30 years on 13k
    expect(analysis.potentialSavingVsActiveFundEur).toBeGreaterThan(5000);
  });

  it('handles empty holdings gracefully', () => {
    const analysis = calculateTerAnalysis([]);
    expect(analysis.totalAnalyzedFundValueEur).toBe(0);
    expect(analysis.weightedTerPercent).toBe(0);
    expect(analysis.totalAnnualFeeEur).toBe(0);
    expect(analysis.funds.length).toBe(0);
  });
});
