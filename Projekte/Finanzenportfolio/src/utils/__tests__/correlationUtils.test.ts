import { describe, it, expect } from 'vitest';
import { calculateCorrelationAnalysis, computeHoldingPairCorrelation } from '../correlationUtils';
import type { Holding } from '../../types';

describe('correlationUtils - calculateCorrelationAnalysis', () => {
  const sampleHoldings: Holding[] = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      category: 'Stock',
      sector: 'Technology',
      shares: 10,
      averageBuyPrice: 150,
      currentPrice: 200,
      totalCost: 1500,
      currentValue: 2000,
      totalGain: 500,
      totalGainPercent: 33.3,
      portfolioWeight: 40,
      yieldOnCost: 1.0
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      category: 'Stock',
      sector: 'Technology',
      shares: 5,
      averageBuyPrice: 300,
      currentPrice: 400,
      totalCost: 1500,
      currentValue: 2000,
      totalGain: 500,
      totalGainPercent: 33.3,
      portfolioWeight: 40,
      yieldOnCost: 1.0
    },
    {
      ticker: 'GLD',
      name: 'Physical Gold ETF',
      category: 'PreciousMetal',
      shares: 10,
      averageBuyPrice: 90,
      currentPrice: 100,
      totalCost: 900,
      currentValue: 1000,
      totalGain: 100,
      totalGainPercent: 11.1,
      portfolioWeight: 20,
      yieldOnCost: 0
    }
  ];

  it('computes high correlation between same-sector tech stocks', () => {
    const corrTech = computeHoldingPairCorrelation(sampleHoldings[0], sampleHoldings[1]);
    expect(corrTech).toBeGreaterThanOrEqual(0.80);

    const corrGold = computeHoldingPairCorrelation(sampleHoldings[0], sampleHoldings[2]);
    expect(corrGold).toBeLessThan(0.20);
  });

  it('generates complete correlation matrix and detects clusters', () => {
    const result = calculateCorrelationAnalysis(sampleHoldings);

    expect(result.tickers.length).toBe(3);
    expect(result.matrix['AAPL']['AAPL']).toBe(1.0);
    expect(result.matrix['AAPL']['MSFT']).toBeGreaterThanOrEqual(0.80);
    expect(result.matrix['AAPL']['GLD']).toBeLessThan(0.20);

    // Cluster check
    expect(result.clusters.length).toBeGreaterThan(0);
    expect(result.clusters[0].tickers).toContain('AAPL');
    expect(result.clusters[0].tickers).toContain('MSFT');

    expect(result.diversificationScorePercent).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
