import { describe, it, expect } from 'vitest';
import { calculateLombardCreditMetrics, getAssetLtvPercent } from '../lombardLoanUtils';
import type { Holding } from '../../types';

describe('lombardLoanUtils', () => {
  const dummyHoldings: Holding[] = [
    {
      ticker: 'VWCE.DE',
      name: 'Vanguard FTSE All-World',
      category: 'ETF',
      shares: 100,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 10000,
      currentValue: 10000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 66.6,
      yieldOnCost: 1.5
    },
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      category: 'Stock',
      shares: 25,
      averageBuyPrice: 200,
      currentPrice: 200,
      totalCost: 5000,
      currentValue: 5000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 33.3,
      yieldOnCost: 0.6
    },
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      category: 'Crypto',
      shares: 0.1,
      averageBuyPrice: 50000,
      currentPrice: 50000,
      totalCost: 5000,
      currentValue: 5000,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 25,
      yieldOnCost: 0
    }
  ];

  it('correctly maps asset loan-to-value (LTV) limits', () => {
    expect(getAssetLtvPercent(dummyHoldings[0])).toBe(70); // ETF
    expect(getAssetLtvPercent(dummyHoldings[1])).toBe(50); // Stock
    expect(getAssetLtvPercent(dummyHoldings[2])).toBe(0);  // Crypto
  });

  it('calculates collateral capacity and interest cost accurately', () => {
    // ETF: 10,000 * 0.70 = 7,000
    // Stock: 5,000 * 0.50 = 2,500
    // Crypto: 5,000 * 0.00 = 0
    // Total Collateral = 9,500 €
    const result = calculateLombardCreditMetrics({
      holdings: dummyHoldings,
      requestedLoanEur: 4750,
      interestRatePct: 6.0
    });

    expect(result.totalCollateralValueEur).toBe(9500);
    expect(result.maxLoanAmountEur).toBe(9500);
    expect(result.currentLtvRatioPct).toBe(50); // 4,750 / 9,500 = 50%
    expect(result.annualInterestCostEur).toBe(285); // 4,750 * 0.06
    expect(result.isMarginCallRisk).toBe(false);
    expect(result.isOverleveraged).toBe(false);
    expect(result.bufferUntilMarginCallEur).toBe(4750);
  });

  it('warns when margin call risk is high or credit is overleveraged', () => {
    const highRisk = calculateLombardCreditMetrics({
      holdings: dummyHoldings,
      requestedLoanEur: 8500, // 8500 / 9500 = 89.4%
      interestRatePct: 5.0
    });

    expect(highRisk.isMarginCallRisk).toBe(true);
    expect(highRisk.isOverleveraged).toBe(false);

    const overleveraged = calculateLombardCreditMetrics({
      holdings: dummyHoldings,
      requestedLoanEur: 12000,
      interestRatePct: 5.0
    });

    expect(overleveraged.isOverleveraged).toBe(true);
  });
});
