import { describe, it, expect } from 'vitest';
import { calculateLossPoolCarryForward } from '../lossPoolCarryForwardUtils';
import type { Transaction } from '../../types';

describe('lossPoolCarryForwardUtils (§ 20 Abs. 6 EStG)', () => {
  it('correctly isolates stock losses to only stock gains', () => {
    // 500 € Stock loss carry forward, 300 € Stock gains, 1000 € Dividends
    const result = calculateLossPoolCarryForward([], 500, 0, 2026);
    expect(result.finalStockLossPoolEur).toBe(500);
  });

  it('allows general losses (ETFs, Derivates) to offset both general gains and stock gains', () => {
    // Initial general loss pool: 1000 EUR
    // Transactions with other income: 400 EUR dividends
    const txs: Transaction[] = [
      {
        id: 'tx-1',
        type: 'DIVIDEND',
        ticker: 'EUNL',
        name: 'MSCI World ETF',
        date: '10.05.2026',
        amount: 1,
        price: 400,
        fee: 0,
        tax: 0,
        category: 'ETF',
        currency: 'EUR'
      }
    ];

    const result = calculateLossPoolCarryForward(txs, 0, 1000, 2026);
    expect(result.otherGainsEur).toBe(400);
    expect(result.otherLossesUsedEur).toBe(400);
    expect(result.finalGeneralLossPoolEur).toBe(600);
    expect(result.netTaxableOtherGainsEur).toBe(0);
    expect(result.totalTaxSavedByLossOffsetEur).toBeCloseTo(400 * 0.26375, 2);
  });
});
