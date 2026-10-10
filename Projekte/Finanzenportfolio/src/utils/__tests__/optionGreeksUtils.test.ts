import { describe, it, expect } from 'vitest';
import {
  calculateBlackScholesGreeks,
  calculatePortfolioDeltaHedging
} from '../optionGreeksUtils';
import type { Transaction, Holding } from '../../types';

describe('optionGreeksUtils', () => {
  it('calculates Black-Scholes Greeks with expected values', () => {
    // At-the-money Call option
    const callGreeks = calculateBlackScholesGreeks({
      spotPrice: 100,
      strikePrice: 100,
      daysToExpiration: 90,
      volatility: 0.25,
      riskFreeRate: 0.03,
      optionType: 'CALL'
    });

    expect(callGreeks.delta).toBeGreaterThan(0.45);
    expect(callGreeks.delta).toBeLessThan(0.65);
    expect(callGreeks.gamma).toBeGreaterThan(0);
    expect(callGreeks.theta).toBeLessThan(0); // Option decay is negative

    // Out-of-the-money Put option
    const putGreeks = calculateBlackScholesGreeks({
      spotPrice: 100,
      strikePrice: 90,
      daysToExpiration: 60,
      volatility: 0.25,
      riskFreeRate: 0.03,
      optionType: 'PUT'
    });

    expect(putGreeks.delta).toBeLessThan(0);
    expect(putGreeks.delta).toBeGreaterThan(-0.5);
  });

  it('aggregates portfolio delta-hedging metrics from positions', () => {
    const dummyTxs: Transaction[] = [
      {
        id: 'opt-1',
        type: 'OPTION_PREMIUM',
        date: '01.09.2026',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        amount: 100,
        price: 3.5,
        fee: 1,
        tax: 0,
        category: 'Stock',
        strikePrice: 200,
        expirationDate: '15.11.2026',
        optionType: 'PUT'
      }
    ];

    const dummyHoldings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        category: 'Stock',
        shares: 100,
        averageBuyPrice: 200,
        currentPrice: 210,
        totalCost: 20000,
        currentValue: 21000,
        totalGain: 1000,
        totalGainPercent: 5,
        portfolioWeight: 100,
        yieldOnCost: 0.5
      }
    ];

    const result = calculatePortfolioDeltaHedging(dummyTxs, dummyHoldings, 21000);

    expect(result.positions.length).toBe(1);
    expect(result.positions[0].isCovered).toBe(true);
    expect(result.portfolioBetaWeightDeltaEur).toBeGreaterThan(15000);
    expect(result.protectivePutRecommendation.recommendedContracts).toBeGreaterThanOrEqual(1);
  });
});
