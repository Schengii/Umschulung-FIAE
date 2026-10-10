import { describe, it, expect } from 'vitest';
import { calculateTaxWaterfallLiquidation, type AssetLiquidationBucket } from '../taxWaterfallUtils';

describe('taxWaterfallUtils', () => {
  it('liquidates cash and loss positions first with 0% tax drag', () => {
    const buckets: AssetLiquidationBucket[] = [
      {
        id: 'cash-1',
        name: 'Tagesgeld / Notgroschen',
        category: 'CASH',
        availableBalanceEur: 15000,
        unrealizedGainPercent: 0,
        estimatedTaxDragPercent: 0,
        priorityRank: 1
      },
      {
        id: 'loss-1',
        name: 'Clean Energy ETF (Verlustposition)',
        category: 'LOSS_POSITION',
        availableBalanceEur: 8000,
        unrealizedGainPercent: -20,
        estimatedTaxDragPercent: 0,
        priorityRank: 2
      },
      {
        id: 'gain-1',
        name: 'MSCI World ETF (Gewinnposition)',
        category: 'GAIN_POSITION',
        availableBalanceEur: 80000,
        unrealizedGainPercent: 50,
        estimatedTaxDragPercent: 18.46,
        priorityRank: 4
      }
    ];

    // Requesting 10,000 € net withdrawal (should be 100% fulfilled by cash with 0 tax)
    const result = calculateTaxWaterfallLiquidation(buckets, 10000, 1000);
    expect(result.requestedNetEur).toBe(10000);
    expect(result.totalTaxPaidEur).toBe(0);
    expect(result.effectiveTaxRatePercent).toBe(0);
    expect(result.steps[0].bucketId).toBe('cash-1');
    expect(result.steps[0].withdrawnNetEur).toBe(10000);
    expect(result.steps[0].remainingBalanceEur).toBe(5000);
    expect(result.steps[2].withdrawnGrossEur).toBe(0); // Gain position untouched
  });

  it('cascades to loss positions then gain positions when cash is exhausted', () => {
    const buckets: AssetLiquidationBucket[] = [
      {
        id: 'cash-1',
        name: 'Tagesgeld',
        category: 'CASH',
        availableBalanceEur: 5000,
        unrealizedGainPercent: 0,
        estimatedTaxDragPercent: 0,
        priorityRank: 1
      },
      {
        id: 'loss-1',
        name: 'Tech Stock (Verlust)',
        category: 'LOSS_POSITION',
        availableBalanceEur: 5000,
        unrealizedGainPercent: -15,
        estimatedTaxDragPercent: 0,
        priorityRank: 2
      },
      {
        id: 'gain-1',
        name: 'S&P 500 ETF (Gewinn)',
        category: 'GAIN_POSITION',
        availableBalanceEur: 50000,
        unrealizedGainPercent: 40,
        estimatedTaxDragPercent: 18.46,
        priorityRank: 4
      }
    ];

    // Request 15,000 € net
    const result = calculateTaxWaterfallLiquidation(buckets, 15000, 500);
    expect(result.totalGrossLiquidatedEur).toBeGreaterThan(15000);
    expect(result.steps[0].withdrawnNetEur).toBe(5000); // All cash used
    expect(result.steps[1].withdrawnNetEur).toBe(5000); // All loss used
    expect(result.steps[2].withdrawnGrossEur).toBeGreaterThan(0); // Remainder from gain
  });
});
