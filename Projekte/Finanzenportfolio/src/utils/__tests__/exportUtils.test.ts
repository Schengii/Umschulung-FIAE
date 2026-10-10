import { describe, it, expect } from 'vitest';
import { buildPortfolioExcelWorkbook } from '../exportUtils';
import type { Portfolio, PortfolioStats, Holding, Transaction } from '../../types';

describe('exportUtils - buildPortfolioExcelWorkbook', () => {
  it('creates workbook with valid sheet structure and correct data', () => {
    const mockPortfolio: Portfolio = {
      id: 'p1',
      name: 'Hauptdepot',
      transactions: [],
      watchlist: []
    };

    const mockStats: PortfolioStats = {
      totalValue: 50000,
      totalCost: 40000,
      totalGains: 10000,
      totalGainsPercent: 25.0,
      dividendsReceived: 1200,
      cashBalance: 5000,
      irr: 0.12,
      ttwrr: 0.14,
      maxDrawdown: 12.5,
      sharpeRatio: 1.85,
      realizedGains: 2000,
      taxExemptionUsed: 1000
    };

    const mockHoldings: Holding[] = [
      {
        ticker: 'MSFT',
        name: 'Microsoft',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 300,
        currentPrice: 400,
        totalCost: 3000,
        currentValue: 4000,
        totalGain: 1000,
        totalGainPercent: 33.3,
        portfolioWeight: 100,
        yieldOnCost: 0.8
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'BUY',
        category: 'Stock',
        date: '01.02.2025',
        ticker: 'MSFT',
        name: 'Microsoft',
        amount: 10,
        price: 300,
        fee: 1.0,
        tax: 0,
        currency: 'EUR'
      },
      {
        id: 'tx-2',
        type: 'DIVIDEND',
        category: 'Stock',
        date: '15.02.2025',
        ticker: 'MSFT',
        name: 'Microsoft',
        amount: 10,
        price: 0.75,
        fee: 0,
        tax: 1.87,
        currency: 'EUR'
      }
    ];

    const wb = buildPortfolioExcelWorkbook({
      portfolio: mockPortfolio,
      stats: mockStats,
      holdings: mockHoldings,
      transactions: mockTransactions,
      baseCurrency: 'EUR'
    });

    expect(wb.SheetNames).toContain('Übersicht');
    expect(wb.SheetNames).toContain('Bestände');
    expect(wb.SheetNames).toContain('Transaktionen');
    expect(wb.SheetNames).toContain('Dividenden');
    expect(wb.Sheets['Übersicht']).toBeDefined();
    expect(wb.Sheets['Bestände']).toBeDefined();
  });
});
