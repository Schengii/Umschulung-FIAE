/**
 * Fachliche Tests der DACH-Steuerlogik gegen die gesetzlichen Vorgaben
 * (Abgeltungsteuer 25 % + 5,5 % Soli, Sparerpauschbetrag, Teilfreistellung § 20 InvStG,
 * Krypto-Haltefrist § 23 EStG, Verlustverrechnung § 20 Abs. 6 EStG, Kirchensteuer § 32d EStG).
 */
import { describe, it, expect } from 'vitest';
import type { Transaction } from '../../types';
import {
  calculateGermanTax,
  calculateEnhancedGermanTax,
  calculateDachTax
} from '../../components/performanceUtils';
import { getTeilfreistellungsQuote, calculateDetailedVorabpauschale } from '../vorabpauschaleUtils';

const RATE = 0.26375;

function tx(p: Partial<Transaction> & Pick<Transaction, 'type' | 'date' | 'ticker' | 'amount' | 'price'>): Transaction {
  return { id: `${p.type}-${p.ticker}-${p.date}`, name: p.ticker, fee: 0, tax: 0, category: 'Stock', ...p };
}

describe('calculateGermanTax – Veräußerungsgewinne', () => {
  it('Gewinn unter Sparerpauschbetrag bleibt steuerfrei', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.02.2025', ticker: 'AAA', amount: 10, price: 100 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'AAA', amount: 10, price: 150 })
      ],
      1000
    );
    expect(r.realizedGainsRaw).toBeCloseTo(500, 6);
    expect(r.withholdingTaxEstimate).toBe(0);
    expect(r.taxExemptionRemaining).toBeCloseTo(500, 6);
  });

  it('Gewinn über Freibetrag wird mit 26,375 % besteuert', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.02.2025', ticker: 'AAA', amount: 10, price: 100 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'AAA', amount: 10, price: 400 })
      ],
      1000
    );
    expect(r.taxableGains).toBeCloseTo(3000, 6);
    expect(r.withholdingTaxEstimate).toBeCloseTo(2000 * RATE, 6);
    expect(r.taxExemptionRemaining).toBe(0);
  });

  it('Aktienfonds-ETF: 30 % Teilfreistellung', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.02.2025', ticker: 'ETF1', amount: 10, price: 100, category: 'ETF' }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'ETF1', amount: 10, price: 200, category: 'ETF' })
      ],
      0
    );
    expect(r.realizedGainsRaw).toBeCloseTo(1000, 6);
    expect(r.taxableGains).toBeCloseTo(700, 6);
  });

  it('FIFO über mehrere Lots (Teilverkauf des zweiten Lots)', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.01.2025', ticker: 'AAA', amount: 10, price: 100 }),
        tx({ type: 'BUY', date: '02.01.2025', ticker: 'AAA', amount: 10, price: 200 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'AAA', amount: 15, price: 300 })
      ],
      0
    );
    // 10 Stück aus Lot 1 (+200 je) und 5 Stück aus Lot 2 (+100 je) = 2.500
    expect(r.realizedGainsRaw).toBeCloseTo(2500, 6);
  });

  it('Kauf- und Verkaufsgebühren mindern den Gewinn', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.02.2025', ticker: 'AAA', amount: 10, price: 100, fee: 10 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'AAA', amount: 10, price: 110, fee: 10 })
      ],
      0
    );
    expect(r.realizedGainsRaw).toBeCloseTo(80, 6);
  });

  it('Reihenfolge der Transaktionen im Array spielt keine Rolle (Sortierung nach Datum)', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'AAA', amount: 10, price: 150 }),
        tx({ type: 'BUY', date: '01.02.2025', ticker: 'AAA', amount: 10, price: 100 })
      ],
      0
    );
    expect(r.realizedGainsRaw).toBeCloseTo(500, 6);
  });

  it('Verluste eines Verkaufs werden mit Gewinnen anderer Verkäufe desselben Jahres verrechnet', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.01.2025', ticker: 'WIN', amount: 10, price: 100 }),
        tx({ type: 'BUY', date: '01.01.2025', ticker: 'LOSE', amount: 10, price: 100 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'WIN', amount: 10, price: 200 }), // +1000
        tx({ type: 'SELL', date: '02.06.2025', ticker: 'LOSE', amount: 10, price: 60 }) // -400
      ],
      0
    );
    expect(r.taxableGains).toBeCloseTo(600, 6);
    expect(r.withholdingTaxEstimate).toBeCloseTo(600 * RATE, 6);
  });

  it('ein Netto-Verlustjahr ergibt nie negative Steuer', () => {
    const r = calculateGermanTax(
      [
        tx({ type: 'BUY', date: '01.01.2025', ticker: 'LOSE', amount: 10, price: 100 }),
        tx({ type: 'SELL', date: '01.06.2025', ticker: 'LOSE', amount: 10, price: 50 })
      ],
      1000
    );
    expect(r.taxableGains).toBe(0);
    expect(r.withholdingTaxEstimate).toBe(0);
    expect(r.taxExemptionRemaining).toBe(1000);
  });
});

describe('calculateGermanTax – Krypto-Haltefrist (§ 23 EStG)', () => {
  const crypto = (sellDate: string) => [
    tx({ type: 'BUY', date: '01.01.2023', ticker: 'BTC', amount: 1, price: 20000, category: 'Crypto' }),
    tx({ type: 'SELL', date: sellDate, ticker: 'BTC', amount: 1, price: 30000, category: 'Crypto' })
  ];

  it('genau 365 Tage: noch steuerpflichtig (§ 23, separat von der Abgeltungsteuer)', () => {
    expect(calculateGermanTax(crypto('01.01.2024'), 0).cryptoPrivateSaleGains).toBeCloseTo(10000, 6);
  });

  it('366 Tage (mehr als ein Jahr): steuerfrei', () => {
    expect(calculateGermanTax(crypto('02.01.2024'), 0).cryptoPrivateSaleGains).toBe(0);
  });
});

describe('getTeilfreistellungsQuote (§ 20 InvStG)', () => {
  it('Aktien und Krypto: keine Teilfreistellung', () => {
    expect(getTeilfreistellungsQuote('Stock', 'AAPL', 'Apple')).toBe(0);
    expect(getTeilfreistellungsQuote('Crypto', 'BTC', 'Bitcoin')).toBe(0);
  });
  it('Aktien-ETF 30 %, Mischfonds 15 %, Rentenfonds 0 %', () => {
    expect(getTeilfreistellungsQuote('ETF', 'EUNL', 'iShares Core MSCI World')).toBe(0.3);
    expect(getTeilfreistellungsQuote('ETF', 'XYZ', 'Multi Asset Balanced Fund')).toBe(0.15);
    expect(getTeilfreistellungsQuote('ETF', 'IEGA', 'iShares Euro Government Bond')).toBe(0);
  });
});

describe('calculateDetailedVorabpauschale (§ 18 InvStG)', () => {
  const etf = (currentPrice: number) => [
    { ticker: 'EUNL', name: 'MSCI World', category: 'ETF', shares: 100, currentPrice, totalCost: 10000 }
  ];

  it('Basisertrag = Wert × Basiszins × 70 %, begrenzt durch Wertsteigerung, danach 30 % Teilfreistellung', () => {
    const r = calculateDetailedVorabpauschale(etf(110), {}, 2024, 0.0229);
    const basis = 10000 * 0.0229 * 0.7; // 160,30
    expect(r.totalTaxableVorabpauschaleEur).toBeCloseTo(basis * 0.7, 6);
    expect(r.totalEstimatedTaxEur).toBeCloseTo(basis * 0.7 * RATE, 6);
  });

  it('Wertsteigerung kleiner als Basisertrag deckelt die Vorabpauschale', () => {
    const r = calculateDetailedVorabpauschale(etf(100.5), {}, 2024, 0.0229); // Gewinn 50 €
    expect(r.totalTaxableVorabpauschaleEur).toBeCloseTo(50 * 0.7, 6);
  });

  it('bei Wertverlust ist die Vorabpauschale 0', () => {
    expect(calculateDetailedVorabpauschale(etf(90), {}, 2024, 0.0229).totalTaxableVorabpauschaleEur).toBe(0);
  });

  it('Ausschüttungen mindern die Vorabpauschale; darüber hinaus nie negativ', () => {
    const r = calculateDetailedVorabpauschale(etf(110), { EUNL: 200 }, 2024, 0.0229);
    expect(r.totalTaxableVorabpauschaleEur).toBe(0);
  });
});

describe('calculateEnhancedGermanTax – Kirchensteuer & Günstigerprüfung', () => {
  const gain1000 = [
    tx({ type: 'BUY', date: '01.01.2026', ticker: 'AAPL', amount: 10, price: 100 }),
    tx({ type: 'SELL', date: '10.05.2026', ticker: 'AAPL', amount: 10, price: 200 })
  ];

  it('ohne Kirchensteuer: 26,375 %', () => {
    const r = calculateEnhancedGermanTax(gain1000, 0);
    expect(r.abgeltungsteuerStandardEur).toBeCloseTo(1000 * RATE, 6);
    expect(r.churchTaxEstimateEur).toBe(0);
  });

  it('Kirchensteuer 9 %: Gesamtbelastung 27,99 % (§ 32d Abs. 1 EStG)', () => {
    const r = calculateEnhancedGermanTax(gain1000, 0, 0, 0, undefined, true, 9);
    expect(r.abgeltungsteuerStandardEur + r.churchTaxEstimateEur).toBeCloseTo(279.95, 1);
    expect(r.churchTaxEstimateEur).toBeCloseTo(22.0, 1);
  });

  it('Kirchensteuer 8 %: Gesamtbelastung 27,82 %', () => {
    const r = calculateEnhancedGermanTax(gain1000, 0, 0, 0, undefined, true, 8);
    expect(r.abgeltungsteuerStandardEur + r.churchTaxEstimateEur).toBeCloseTo(278.19, 1);
  });

  it('Günstigerprüfung: persönlicher Satz 18 % + Soli spart Steuer, 30 % nicht', () => {
    const low = calculateEnhancedGermanTax(gain1000, 0, 0, 0, 18);
    expect(low.guenstigerpruefungTaxEur).toBeCloseTo(1000 * 0.18 * 1.055, 6);
    expect(low.taxSavingViaGuenstigerpruefungEur).toBeGreaterThan(0);
    const high = calculateEnhancedGermanTax(gain1000, 0, 0, 0, 30);
    expect(high.guenstigerpruefungTaxEur).toBeUndefined();
    expect(high.taxSavingViaGuenstigerpruefungEur).toBe(0);
  });
});

describe('calculateDachTax', () => {
  const gain1000 = [
    tx({ type: 'BUY', date: '01.01.2026', ticker: 'AAPL', amount: 10, price: 100 }),
    tx({ type: 'SELL', date: '10.05.2026', ticker: 'AAPL', amount: 10, price: 200 })
  ];

  it('DE: Sparerpauschbetrag 1.000 € deckt 1.000 € Gewinn komplett ab', () => {
    const r = calculateDachTax(gain1000, 'DE', 1000);
    expect(r.totalTaxDueEur).toBe(0);
    expect(r.allowanceRemainingEur).toBe(0);
  });

  it('DE: 500 € Freibetrag → 500 € × 26,375 %', () => {
    const r = calculateDachTax(gain1000, 'DE', 500);
    expect(r.totalTaxDueEur).toBeCloseTo(500 * RATE, 1);
  });

  it('AT: 27,5 % KESt ohne Freibetrag', () => {
    expect(calculateDachTax(gain1000, 'AT').totalTaxDueEur).toBeCloseTo(275, 6);
  });

  it('CH: private Kursgewinne steuerfrei', () => {
    const r = calculateDachTax(gain1000, 'CH');
    expect(r.totalTaxableIncomeEur).toBe(0);
    expect(r.totalTaxDueEur).toBe(0);
  });
});
