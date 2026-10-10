import { describe, it, expect } from 'vitest';
import { calculateBrokerBreakdown } from '../brokerUtils';
import type { Holding, Transaction } from '../../types';

describe('brokerUtils - calculateBrokerBreakdown', () => {
  const sampleHoldings: Holding[] = [
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
      totalGainPercent: 33.33,
      portfolioWeight: 66.67,
      yieldOnCost: 1.5,
      broker: 'Trade Republic'
    },
    {
      ticker: 'EUNL',
      name: 'iShares Core MSCI World',
      category: 'ETF',
      shares: 10,
      averageBuyPrice: 80,
      currentPrice: 100,
      totalCost: 800,
      currentValue: 1000,
      totalGain: 200,
      totalGainPercent: 25.0,
      portfolioWeight: 33.33,
      yieldOnCost: 2.0,
      broker: 'Scalable Capital'
    }
  ];

  const sampleTransactions: Transaction[] = [
    {
      id: 't1',
      type: 'BUY',
      category: 'Stock',
      date: '10.01.2025',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      amount: 10,
      price: 150,
      fee: 1.0,
      tax: 0,
      broker: 'Trade Republic'
    },
    {
      id: 't2',
      type: 'DIVIDEND',
      category: 'Stock',
      date: '15.02.2025',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      amount: 10,
      price: 2.5,
      fee: 0,
      tax: 6.25,
      broker: 'Trade Republic'
    },
    {
      id: 't3',
      type: 'BUY',
      category: 'ETF',
      date: '12.01.2025',
      ticker: 'EUNL',
      name: 'iShares Core MSCI World',
      amount: 10,
      price: 80,
      fee: 0.99,
      tax: 0,
      broker: 'Scalable Capital'
    }
  ];

  it('aggregates multi-broker metrics correctly', () => {
    const stats = calculateBrokerBreakdown(sampleHoldings, sampleTransactions);

    expect(stats.length).toBe(2);

    const tr = stats.find(b => b.brokerName === 'Trade Republic');
    expect(tr).toBeDefined();
    expect(tr!.holdingsCount).toBe(1);
    expect(tr!.totalMarketValueEur).toBe(2000);
    expect(tr!.totalInvestedEur).toBe(1500);
    expect(tr!.totalGainEur).toBe(500);
    expect(tr!.totalGainPercent).toBeCloseTo(33.33, 1);
    expect(tr!.totalDividendsEur).toBe(25);
    expect(tr!.totalFeesEur).toBe(1);
    expect(tr!.transactionsCount).toBe(2);
    expect(tr!.shareOfPortfolioPercent).toBeCloseTo(66.7, 1);

    const sc = stats.find(b => b.brokerName === 'Scalable Capital');
    expect(sc).toBeDefined();
    expect(sc!.totalMarketValueEur).toBe(1000);
    expect(sc!.totalFeesEur).toBe(0.99);
    expect(sc!.shareOfPortfolioPercent).toBeCloseTo(33.3, 1);
  });

  it('handles empty or undefined broker by assigning to Standard', () => {
    const unassignedHoldings: Holding[] = [
      {
        ticker: 'BTC',
        name: 'Bitcoin',
        category: 'Crypto',
        shares: 0.1,
        averageBuyPrice: 50000,
        currentPrice: 80000,
        totalCost: 5000,
        currentValue: 8000,
        totalGain: 3000,
        totalGainPercent: 60.0,
        portfolioWeight: 100,
        yieldOnCost: 0
      }
    ];

    const stats = calculateBrokerBreakdown(unassignedHoldings, []);
    expect(stats.length).toBe(1);
    expect(stats[0].brokerName).toBe('Standard / Nicht zugeordnet');
    expect(stats[0].totalMarketValueEur).toBe(8000);
  });
});
