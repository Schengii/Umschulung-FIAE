import { describe, it, expect } from 'vitest';
import { calculateRebalanceOrders, formatRebalancingOrdersForClipboard } from '../rebalanceUtils';
import type { Holding } from '../../types';

describe('rebalanceUtils - calculateRebalanceOrders', () => {
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
      portfolioWeight: 50,
      yieldOnCost: 1.5
    },
    {
      ticker: 'EUNL',
      name: 'iShares Core MSCI World',
      category: 'ETF',
      shares: 20,
      averageBuyPrice: 80,
      currentPrice: 100,
      totalCost: 1600,
      currentValue: 2000,
      totalGain: 400,
      totalGainPercent: 25.0,
      portfolioWeight: 50,
      yieldOnCost: 2.0
    }
  ];

  it('calculates FULL rebalance orders correctly', () => {
    // Current: 2000 Stock (50%), 2000 ETF (50%). Total = 4000
    // Target: Stock 30% (1200 €), ETF 70% (2800 €)
    const targets = {
      Stock: 30,
      ETF: 70,
      Crypto: 0,
      Bond: 0,
      Cash: 0,
      RealEstate: 0,
      P2P: 0,
      PreciousMetal: 0
    };

    const result = calculateRebalanceOrders(sampleHoldings, targets, { mode: 'FULL' });

    expect(result.mode).toBe('FULL');
    expect(result.totalPortfolioValueEur).toBe(4000);
    expect(result.totalBuyVolumeEur).toBeCloseTo(800, 1);
    expect(result.totalSellVolumeEur).toBeCloseTo(800, 1);

    const stockOrder = result.categoryOrders.find(o => o.category === 'Stock');
    expect(stockOrder).toBeDefined();
    expect(stockOrder!.action).toBe('SELL');
    expect(stockOrder!.orderValueEur).toBeCloseTo(800, 1);
    expect(stockOrder!.suggestedAssets.length).toBe(1);
    expect(stockOrder!.suggestedAssets[0].ticker).toBe('AAPL');

    const etfOrder = result.categoryOrders.find(o => o.category === 'ETF');
    expect(etfOrder).toBeDefined();
    expect(etfOrder!.action).toBe('BUY');
    expect(etfOrder!.orderValueEur).toBeCloseTo(800, 1);
    expect(etfOrder!.suggestedAssets[0].suggestedShares).toBe(8); // 800 € / 100 € per share = 8 shares
  });

  it('calculates CASHFLOW_ONLY rebalancing without generating sell orders', () => {
    // Current: 2000 Stock, 2000 ETF. Total = 4000
    // Target: Stock 40%, ETF 60%
    // In cashflow mode with 1000 € fresh capital:
    // Total post-value = 5000 €
    // Target Stock: 2000 € (already has 2000 €, deficit = 0)
    // Target ETF: 3000 € (has 2000 €, deficit = 1000 €)
    // All 1000 € fresh capital should go to ETF!
    const targets = {
      Stock: 40,
      ETF: 60,
      Crypto: 0,
      Bond: 0,
      Cash: 0,
      RealEstate: 0,
      P2P: 0,
      PreciousMetal: 0
    };

    const result = calculateRebalanceOrders(sampleHoldings, targets, {
      mode: 'CASHFLOW_ONLY',
      freshCapitalEur: 1000
    });

    expect(result.mode).toBe('CASHFLOW_ONLY');
    expect(result.totalSellVolumeEur).toBe(0);
    expect(result.totalBuyVolumeEur).toBeCloseTo(1000, 1);

    const stockOrder = result.categoryOrders.find(o => o.category === 'Stock');
    expect(stockOrder!.action).toBe('HOLD');

    const etfOrder = result.categoryOrders.find(o => o.category === 'ETF');
    expect(etfOrder!.action).toBe('BUY');
    expect(etfOrder!.orderValueEur).toBeCloseTo(1000, 1);
    expect(etfOrder!.suggestedAssets[0].suggestedShares).toBe(10); // 1000 € / 100 € = 10 shares
  });

  it('formats rebalancing orders as readable clipboard text', () => {
    const targets = {
      Stock: 30,
      ETF: 70,
      Crypto: 0,
      Bond: 0,
      Cash: 0,
      RealEstate: 0,
      P2P: 0,
      PreciousMetal: 0
    };
    const result = calculateRebalanceOrders(sampleHoldings, targets, { mode: 'FULL' });
    const text = formatRebalancingOrdersForClipboard(result, 'EUR');

    expect(text).toContain('PORTFOLIO REBALANCING ORDERLISTE');
    expect(text).toContain('KAUF [ETF]');
    expect(text).toContain('VERKAUF [Stock]');
    expect(text).toContain('EUNL');
  });
});
