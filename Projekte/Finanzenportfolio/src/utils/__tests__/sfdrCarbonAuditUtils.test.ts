import { describe, it, expect } from 'vitest';
import { calculatePortfolioEsgSfdrSummary } from '../sfdrCarbonAuditUtils';
import type { Holding } from '../../types';

describe('sfdrCarbonAuditUtils', () => {
  const dummyHoldings: Holding[] = [
    {
      ticker: 'VWCE.DE',
      name: 'Vanguard FTSE All-World',
      category: 'ETF',
      shares: 50,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 5000,
      currentValue: 5000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 50,
      yieldOnCost: 1.5
    },
    {
      ticker: 'INRG.DE',
      name: 'iShares Global Clean Energy',
      category: 'ETF',
      shares: 30,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 3000,
      currentValue: 3000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 30,
      yieldOnCost: 2.0
    },
    {
      ticker: 'XOM',
      name: 'Exxon Mobil Corp.',
      category: 'Stock',
      sector: 'Energy',
      shares: 20,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 2000,
      currentValue: 2000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 20,
      yieldOnCost: 3.5
    }
  ];

  it('correctly classifies holdings into Article 6, 8 and 9', () => {
    const summary = calculatePortfolioEsgSfdrSummary(dummyHoldings);

    expect(summary.totalAnalyzedValueEur).toBe(10000);
    expect(summary.article8WeightPercent).toBe(50); // VWCE
    expect(summary.article9WeightPercent).toBe(30); // INRG Clean Energy
    expect(summary.article6WeightPercent).toBe(20); // Exxon
    expect(summary.weightedCo2IntensityTons).toBeLessThan(200);
    expect(summary.parisAgreementAligned).toBe(true);
    expect(summary.holdingsBreakdown.length).toBe(3);
  });

  it('handles empty portfolio gracefully', () => {
    const summary = calculatePortfolioEsgSfdrSummary([]);
    expect(summary.totalAnalyzedValueEur).toBe(0);
    expect(summary.holdingsBreakdown).toHaveLength(0);
    expect(summary.parisAgreementAligned).toBe(false);
  });
});
