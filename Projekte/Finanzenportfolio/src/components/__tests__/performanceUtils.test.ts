import { describe, it, expect } from 'vitest';
import {
  calculateTTWRR,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateRealizedGains,
  calculateGermanTax,
  calculateCryptoTaxFreeShares,
  calculateVorabpauschale,
  calculateSectorAndRegionBreakdown,
  runMonteCarloSimulation,
  runStressTestScenarios,
  calculateAlphaBeta,
  calculateRebalancingOrders
} from '../performanceUtils';
import { parseUniversalCsv } from '../../services/universalCsvImporter';
import type { Transaction, Holding } from '../../types';

describe('performanceUtils Financial Calculations', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      type: 'DEPOSIT',
      date: '01.01.2024',
      ticker: 'CASH',
      name: 'Deposit',
      amount: 10000,
      price: 1,
      fee: 0,
      tax: 0,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '2',
      type: 'BUY',
      date: '10.01.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 10,
      price: 150,
      fee: 2,
      tax: 0,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '3',
      type: 'BUY',
      date: '15.01.2024',
      ticker: 'EUNL',
      name: 'MSCI World ETF',
      amount: 50,
      price: 80,
      fee: 0,
      tax: 0,
      category: 'ETF',
      currency: 'EUR'
    },
    {
      id: '4',
      type: 'DIVIDEND',
      date: '10.06.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 10,
      price: 1.5,
      fee: 0,
      tax: 2.5,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '5',
      type: 'SELL',
      date: '20.06.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 5,
      price: 200,
      fee: 1,
      tax: 5,
      category: 'Stock',
      currency: 'EUR'
    }
  ];

  it('calculates TTWRR correctly', () => {
    const ttwrr = calculateTTWRR(sampleTransactions, 6000, 4500);
    expect(ttwrr).toBeGreaterThan(0);
  });

  it('calculates Maximum Drawdown', () => {
    const series = [100, 120, 90, 110, 80, 105];
    const maxDd = calculateMaxDrawdown(series);
    expect(maxDd).toBeCloseTo(33.33, 1);
  });

  it('calculates Sharpe Ratio', () => {
    const sharpe = calculateSharpeRatio(12, 15, 2);
    expect(sharpe).toBeCloseTo(0.666, 2);
  });

  it('calculates Realized Gains using FIFO', () => {
    const gains = calculateRealizedGains(sampleTransactions);
    expect(gains).toBeGreaterThan(200);
  });

  it('calculates German Tax with exemption', () => {
    const taxRes = calculateGermanTax(sampleTransactions, 1000);
    expect(taxRes.realizedGainsRaw).toBeGreaterThan(0);
    expect(taxRes.taxExemptionRemaining).toBeLessThanOrEqual(1000);
  });

  it('calculates Crypto Tax-Free status after 365 days', () => {
    const btcTxs: Transaction[] = [
      {
        id: 'btc-1',
        type: 'BUY',
        date: '01.01.2022',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 1.5,
        price: 30000,
        fee: 5,
        tax: 0,
        category: 'Crypto'
      }
    ];

    const freeShares = calculateCryptoTaxFreeShares(btcTxs, 'BTC', new Date('2024-01-01'));
    expect(freeShares).toBe(1.5);
  });

  it('calculates Vorabpauschale for ETFs', () => {
    const holdings: Holding[] = [
      {
        ticker: 'EUNL',
        name: 'MSCI World ETF',
        category: 'ETF',
        shares: 100,
        averageBuyPrice: 80,
        currentPrice: 90,
        totalCost: 8000,
        currentValue: 9000,
        totalGain: 1000,
        totalGainPercent: 12.5,
        portfolioWeight: 100,
        yieldOnCost: 0,
        teilfreistellungRate: 0.30
      }
    ];

    const vorab = calculateVorabpauschale(holdings, 0.0229);
    expect(vorab).toBeCloseTo(89.77, 1);
  });

  it('calculates Sector and Region breakdowns', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 1,
        sector: 'Technology',
        region: 'North America'
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
        totalGainPercent: 25,
        portfolioWeight: 50,
        yieldOnCost: 0,
        sector: 'Financials',
        region: 'Global'
      }
    ];

    const breakdown = calculateSectorAndRegionBreakdown(holdings);
    expect(breakdown.sectors.length).toBe(2);
    expect(breakdown.regions.length).toBe(2);
    expect(breakdown.sectors[0].percentage).toBe(50);
  });

  it('runs Monte Carlo simulation with 1,000 trials', () => {
    const mc = runMonteCarloSimulation(10000, 200, 10, 7.0, 15.0, 100);
    expect(mc.percentile50.length).toBe(11);
    expect(mc.finalMedian).toBeGreaterThan(10000);
    expect(mc.finalHigh).toBeGreaterThan(mc.finalLow);
  });

  it('runs historical crisis stress tests', () => {
    const tests = runStressTestScenarios(50000);
    expect(tests.length).toBe(4);
    expect(tests[0].scenarioName).toContain('2008');
    expect(tests[0].portfolioLossEur).toBeGreaterThan(20000);
  });

  it('auto-detects and parses Universal CSV', () => {
    const sampleCsv = `Datum;Typ;Wertpapiername;ISIN;Stückzahl;Kurs\n01.01.2026;Kauf;Apple Inc.;US0378331002;10;180,00`;
    const res = parseUniversalCsv(sampleCsv);
    expect(res.detectedFormat).toContain('Portfolio Performance');
    expect(res.transactions.length).toBe(1);
    expect(res.transactions[0].name).toBe('Apple Inc.');
  });

  it('calculates Alpha and Beta metrics', () => {
    const pRets = [0.02, 0.03, -0.01, 0.04];
    const mRets = [0.015, 0.02, -0.012, 0.03];
    const metrics = calculateAlphaBeta(pRets, mRets, 2.0);
    expect(metrics.beta).toBeGreaterThan(0);
  });

  it('calculates optimal rebalancing orders for lump sum deposit', () => {
    const holdings: Holding[] = [
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
        portfolioWeight: 100,
        yieldOnCost: 1
      }
    ];

    const orders = calculateRebalancingOrders(holdings, 1000, { Stock: 100 });
    expect(orders.length).toBe(1);
    expect(orders[0].buyAmountEur).toBe(1000);
    expect(orders[0].buyShares).toBe(5);
  });
});
