/**
 * Ergänzende Steuerrechts-Tests: Krypto-Freigrenze (§ 23 EStG), Dividenden, Verlusttöpfe
 * (§ 20 Abs. 6 EStG), DACH-Teilfreistellung und monatsanteilige Vorabpauschale (§ 18 InvStG).
 */
import { describe, it, expect } from 'vitest';
import type { Transaction } from '../../types';
import {
  calculateGermanTax,
  calculateEnhancedGermanTax,
  calculateDachTax
} from '../../components/performanceUtils';
import { calculateDetailedVorabpauschale, monthsHeldFactor } from '../vorabpauschaleUtils';

const RATE = 0.26375;

function tx(p: Partial<Transaction> & Pick<Transaction, 'type' | 'date' | 'ticker' | 'amount' | 'price'>): Transaction {
  return { id: `${p.type}-${p.ticker}-${p.date}`, name: p.ticker, fee: 0, tax: 0, category: 'Stock', ...p };
}

describe('Krypto: § 23 EStG getrennt von der Abgeltungsteuer', () => {
  const crypto = (sellDate: string, price = 30000) => [
    tx({ type: 'BUY', date: '01.01.2023', ticker: 'BTC', amount: 1, price: 20000, category: 'Crypto' }),
    tx({ type: 'SELL', date: sellDate, ticker: 'BTC', amount: 1, price, category: 'Crypto' })
  ];

  it('genau 365 Tage: steuerpflichtig, aber nicht in der Abgeltungsteuer-Basis', () => {
    const r = calculateGermanTax(crypto('01.01.2024'), 0);
    expect(r.cryptoPrivateSaleGains).toBeCloseTo(10000, 6);
    expect(r.cryptoFreigrenzeExceeded).toBe(true);
    expect(r.taxableGains).toBe(0);
  });

  it('366 Tage: steuerfrei', () => {
    const r = calculateGermanTax(crypto('02.01.2024'), 0);
    expect(r.cryptoPrivateSaleGains).toBe(0);
  });

  it('Freigrenze: 999 € Gewinn steuerfrei, 1.000 € voll steuerpflichtig', () => {
    const at = (price: number) => [
      tx({ type: 'BUY', date: '01.03.2025', ticker: 'BTC', amount: 1, price: 10000, category: 'Crypto' }),
      tx({ type: 'SELL', date: '01.06.2025', ticker: 'BTC', amount: 1, price, category: 'Crypto' })
    ];
    expect(calculateGermanTax(at(10999), 0).cryptoFreigrenzeExceeded).toBe(false);
    expect(calculateGermanTax(at(11000), 0).cryptoFreigrenzeExceeded).toBe(true);
  });
});

describe('Dividenden', () => {
  it('Bemessungsgrundlage ist die Brutto-Dividende, Quellensteuer mindert sie nicht', () => {
    const r = calculateGermanTax(
      [tx({ type: 'DIVIDEND', date: '01.06.2025', ticker: 'AAA', amount: 1, price: 100, tax: 26.375 })],
      0
    );
    expect(r.taxableGains).toBeCloseTo(100, 6);
  });

  it('ETF-Ausschüttung: 30 % Teilfreistellung', () => {
    const r = calculateGermanTax(
      [tx({ type: 'DIVIDEND', date: '01.06.2025', ticker: 'ETF1', amount: 1, price: 100, category: 'ETF' })],
      0
    );
    expect(r.taxableGains).toBeCloseTo(70, 6);
  });
});

describe('calculateEnhancedGermanTax – Verlusttöpfe', () => {
  const stockLoss = [
    tx({ type: 'BUY', date: '01.01.2025', ticker: 'S1', amount: 10, price: 100 }),
    tx({ type: 'SELL', date: '01.06.2025', ticker: 'S1', amount: 10, price: 50 }) // -500
  ];
  const etfGain = [
    tx({ type: 'BUY', date: '01.01.2025', ticker: 'E1', amount: 10, price: 100, category: 'ETF' }),
    tx({ type: 'SELL', date: '01.06.2025', ticker: 'E1', amount: 10, price: 200, category: 'ETF' }) // +1000, nach TFS 700
  ];
  const stockGain = [
    tx({ type: 'BUY', date: '01.01.2025', ticker: 'S2', amount: 10, price: 100 }),
    tx({ type: 'SELL', date: '01.06.2025', ticker: 'S2', amount: 10, price: 200 }) // +1000
  ];

  it('Aktienverlust darf NICHT mit ETF-Gewinn verrechnet werden', () => {
    const r = calculateEnhancedGermanTax([...stockLoss, ...etfGain], 0);
    expect(r.realizedStockLossesEur).toBeCloseTo(500, 6);
    expect(r.taxableGainsFinalEur).toBeCloseTo(700, 6);
    expect(r.stockLossPoolRemainingEur).toBeCloseTo(500, 6);
  });

  it('Aktienverlust wird mit Aktiengewinn verrechnet', () => {
    const r = calculateEnhancedGermanTax([...stockLoss, ...stockGain], 0);
    expect(r.taxableGainsFinalEur).toBeCloseTo(500, 6);
    expect(r.stockLossPoolRemainingEur).toBe(0);
  });

  it('Verlustvortrag Aktien mindert den Aktiengewinn', () => {
    const r = calculateEnhancedGermanTax(stockGain, 0, 300, 0);
    expect(r.taxableGainsFinalEur).toBeCloseTo(700, 6);
    expect(r.stockLossPoolRemainingEur).toBe(0);
  });

  it('Allgemeiner Verlusttopf (ETF-Verlust) darf Aktiengewinne mindern', () => {
    const etfLoss = [
      tx({ type: 'BUY', date: '01.01.2025', ticker: 'E2', amount: 10, price: 100, category: 'ETF' }),
      tx({ type: 'SELL', date: '01.06.2025', ticker: 'E2', amount: 10, price: 50, category: 'ETF' }) // -500, nach TFS -350
    ];
    const r = calculateEnhancedGermanTax([...etfLoss, ...stockGain], 0);
    expect(r.realizedOtherLossesEur).toBeCloseTo(350, 6);
    expect(r.taxableGainsFinalEur).toBeCloseTo(650, 6);
    expect(r.generalLossPoolRemainingEur).toBe(0);
  });

  it('Steuer nutzt den Topf-bereinigten Betrag und den Sparerpauschbetrag', () => {
    const r = calculateEnhancedGermanTax(stockGain, 1000, 300, 0);
    expect(r.taxableGainsFinalEur).toBeCloseTo(700, 6);
    expect(r.abgeltungsteuerStandardEur).toBe(0);
  });
});

describe('calculateDachTax', () => {
  it('DE: ETF-Gewinn 1.000 € → 700 € steuerpflichtig (Teilfreistellung)', () => {
    const r = calculateDachTax(
      [
        tx({ type: 'BUY', date: '01.01.2025', ticker: 'E1', amount: 10, price: 100, category: 'ETF' }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'E1', amount: 10, price: 200, category: 'ETF' })
      ],
      'DE',
      0
    );
    expect(r.totalTaxableIncomeEur).toBeCloseTo(700, 6);
    expect(r.totalTaxDueEur).toBeCloseTo(700 * RATE, 1);
  });

  it('CH: Dividenden werden brutto angesetzt', () => {
    const r = calculateDachTax(
      [tx({ type: 'DIVIDEND', date: '01.06.2025', ticker: 'A', amount: 1, price: 100, tax: 35 })],
      'CH'
    );
    expect(r.totalTaxableIncomeEur).toBeCloseTo(100, 6);
  });
});

describe('Vorabpauschale monatsanteilig (§ 18 Abs. 2 InvStG)', () => {
  it('volle Monate vor dem Erwerbsmonat mindern um je 1/12', () => {
    expect(monthsHeldFactor('15.01.2024', 2024)).toBe(1);
    expect(monthsHeldFactor('15.07.2024', 2024)).toBeCloseTo(6 / 12, 10);
    expect(monthsHeldFactor('31.12.2024', 2024)).toBeCloseTo(1 / 12, 10);
    expect(monthsHeldFactor('15.07.2023', 2024)).toBe(1);
    expect(monthsHeldFactor(undefined, 2024)).toBe(1);
  });

  it('Basisertrag wird bei Erwerb im Juli auf 6/12 gekürzt', () => {
    const base = { ticker: 'EUNL', name: 'MSCI World', category: 'ETF', shares: 100, currentPrice: 110, totalCost: 10000 };
    const full = calculateDetailedVorabpauschale([base], {}, 2024, 0.0229);
    const half = calculateDetailedVorabpauschale([{ ...base, purchaseDate: '15.07.2024' }], {}, 2024, 0.0229);
    expect(half.totalTaxableVorabpauschaleEur).toBeCloseTo(full.totalTaxableVorabpauschaleEur / 2, 6);
  });
});
