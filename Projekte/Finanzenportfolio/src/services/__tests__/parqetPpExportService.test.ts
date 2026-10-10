import { describe, it, expect } from 'vitest';
import {
  generateParqetJsonExport,
  generatePortfolioPerformanceCsv
} from '../parqetPpExportService';
import type { Transaction, Holding } from '../../types';

describe('parqetPpExportService', () => {
  const dummyTxs: Transaction[] = [
    {
      id: 'tx-1',
      date: '15.05.2026',
      type: 'BUY',
      ticker: 'VWCE.DE',
      name: 'Vanguard FTSE All-World',
      amount: 10,
      price: 110.5,
      fee: 1.0,
      tax: 0,
      category: 'ETF',
      currency: 'EUR'
    },
    {
      id: 'tx-2',
      date: '20.06.2026',
      type: 'DIVIDEND',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      amount: 1,
      price: 25.0,
      fee: 0,
      tax: 6.59,
      category: 'Stock',
      currency: 'EUR'
    }
  ];

  const dummyHoldings: Holding[] = [
    {
      ticker: 'VWCE.DE',
      name: 'Vanguard FTSE All-World',
      category: 'ETF',
      shares: 10,
      averageBuyPrice: 110.5,
      currentPrice: 115,
      totalCost: 1105,
      currentValue: 1150,
      totalGain: 45,
      totalGainPercent: 4.07,
      portfolioWeight: 100,
      yieldOnCost: 1.5
    }
  ];

  it('generates a valid Parqet JSON export with activities', () => {
    const json = generateParqetJsonExport(dummyTxs, dummyHoldings);

    expect(json.version).toBe(1);
    expect(json.activities.length).toBe(2);
    expect(json.activities[0].type).toBe('Buy');
    expect(json.activities[0].shares).toBe(10);
    expect(json.activities[0].asset.ticker).toBe('VWCE.DE');
    expect(json.activities[1].type).toBe('Dividend');
    expect(json.activities[1].tax).toBe(6.59);
  });

  it('generates a valid Portfolio Performance CSV file with German formatting', () => {
    const csv = generatePortfolioPerformanceCsv(dummyTxs);

    expect(csv).toContain('Datum;Typ;Wertpapiername;Ticker-Symbol;Währung;Stück;Kurs;Gesamtbetrag;Gebühren;Steuern;Notiz');
    expect(csv).toContain('15.05.2026;Kauf;Vanguard FTSE All-World;VWCE.DE;EUR;10;110,5000;1105,00;1,00;0,00;');
    expect(csv).toContain('20.06.2026;Dividende;Apple Inc.;AAPL;EUR;1;25,0000;25,00;0,00;6,59;');
  });
});
