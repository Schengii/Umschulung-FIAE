import { describe, it, expect } from 'vitest';
import { calculateCryptoTaxLossHarvesting, parseTransactionDate } from '../cryptoTaxUtils';
import type { Transaction } from '../../types';

describe('cryptoTaxUtils - calculateCryptoTaxLossHarvesting', () => {
  const mockCurrentDate = new Date(2026, 8, 15); // 15. September 2026

  it('parses transaction dates in DD.MM.YYYY and YYYY-MM-DD format', () => {
    const d1 = parseTransactionDate('15.09.2026');
    expect(d1.getFullYear()).toBe(2026);
    expect(d1.getMonth()).toBe(8);
    expect(d1.getDate()).toBe(15);

    const d2 = parseTransactionDate('2026-09-15');
    expect(d2.getFullYear()).toBe(2026);
    expect(d2.getMonth()).toBe(8);
    expect(d2.getDate()).toBe(15);
  });

  it('identifies harvestable loss lots held for less than 365 days', () => {
    const transactions: Transaction[] = [
      // Lot 1: Bought 100 days ago (June 2026) at 60,000 €, now at 50,000 € -> Loss 1,000 € (0.1 BTC)
      {
        id: 'c1',
        type: 'BUY',
        category: 'Crypto',
        date: '07.06.2026',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 0.1,
        price: 60000,
        fee: 5,
        tax: 0
      },
      // Lot 2: Bought 400 days ago (August 2025) -> Held > 365 days, already tax-free, cannot harvest loss
      {
        id: 'c2',
        type: 'BUY',
        category: 'Crypto',
        date: '10.08.2025',
        ticker: 'ETH',
        name: 'Ethereum',
        amount: 2.0,
        price: 3500,
        fee: 2,
        tax: 0
      },
      // Lot 3: Bought 20 days ago (August 2026) at 200 €, now at 150 € -> Loss 250 € (5 SOL)
      {
        id: 'c3',
        type: 'BUY',
        category: 'Crypto',
        date: '26.08.2026',
        ticker: 'SOL',
        name: 'Solana',
        amount: 5.0,
        price: 200,
        fee: 1,
        tax: 0
      }
    ];

    const currentPrices = {
      BTC: 50000, // 0.1 * 50,000 = 5,000 vs 6,000 cost = -1,000 € loss
      ETH: 2500,  // 2.0 * 2,500 = 5,000 vs 7,000 cost = -2,000 € loss, BUT > 365 days!
      SOL: 150    // 5.0 * 150 = 750 vs 1,000 cost = -250 € loss
    };

    const summary = calculateCryptoTaxLossHarvesting(transactions, currentPrices, {
      marginalTaxRatePercent: 42.0,
      currentDate: mockCurrentDate
    });

    // Only BTC and SOL should be harvestable losses (total = 1000 + 250 = 1250 €)
    expect(summary.totalHarvestableLossesEur).toBeCloseTo(1250, 1);
    // Estimated tax savings = 1250 * 0.42 = 525 €
    expect(summary.estimatedTaxSavingsEur).toBeCloseTo(525, 1);

    expect(summary.lots.length).toBe(3); // 3 loss lots total
    const actionableLots = summary.lots.filter(l => l.isActionable);
    expect(actionableLots.length).toBe(2);

    const btcLot = summary.lots.find(l => l.ticker === 'BTC');
    expect(btcLot).toBeDefined();
    expect(btcLot!.isActionable).toBe(true);
    expect(btcLot!.unrealizedLossEur).toBe(1000);
    expect(btcLot!.potentialTaxSavingsEur).toBe(420);

    const ethLot = summary.lots.find(l => l.ticker === 'ETH');
    expect(ethLot).toBeDefined();
    expect(ethLot!.isActionable).toBe(false); // Held > 365 days
  });

  it('calculates realized gains in the current tax year to show offset potential', () => {
    const transactions: Transaction[] = [
      // Buy 0.5 BTC on 10.01.2026 at 40,000 €
      {
        id: 'tx1',
        type: 'BUY',
        category: 'Crypto',
        date: '10.01.2026',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        price: 40000,
        fee: 0,
        tax: 0
      },
      // Sell 0.2 BTC on 15.03.2026 at 60,000 € -> Gain: 0.2 * 20,000 = 4,000 €
      {
        id: 'tx2',
        type: 'SELL',
        category: 'Crypto',
        date: '15.03.2026',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 0.2,
        price: 60000,
        fee: 0,
        tax: 0
      }
    ];

    const currentPrices = { BTC: 35000 }; // remaining 0.3 BTC bought at 40k now at 35k -> -1500 loss

    const summary = calculateCryptoTaxLossHarvesting(transactions, currentPrices, {
      currentDate: mockCurrentDate
    });

    expect(summary.realizedGainsThisYearEur).toBeCloseTo(4000, 1);
    expect(summary.totalHarvestableLossesEur).toBeCloseTo(1500, 1);
  });
});
