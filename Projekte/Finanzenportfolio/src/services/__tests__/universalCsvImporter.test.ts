import { describe, it, expect } from 'vitest';
import { parseUniversalCsv } from '../universalCsvImporter';

describe('universalCsvImporter extended (Ghostfolio & Parqet)', () => {
  it('detects and parses Ghostfolio CSV export', () => {
    const csvContent = `Date,Type,Symbol,Quantity,UnitPrice,Currency,Fee
2026-01-15,BUY,AAPL,10,180.50,USD,1.50
2026-02-20,DIVIDEND,AAPL,10,0.25,USD,0.00`;

    const result = parseUniversalCsv(csvContent);
    expect(result.detectedFormat).toBe('Ghostfolio CSV Export');
    expect(result.transactions.length).toBe(2);
    expect(result.transactions[0].ticker).toBe('AAPL');
    expect(result.transactions[0].amount).toBe(10);
    expect(result.transactions[0].price).toBe(180.50);
  });

  it('detects and parses Ghostfolio JSON activities', () => {
    const jsonContent = JSON.stringify({
      activities: [
        {
          type: 'BUY',
          date: '2026-03-01T10:00:00.000Z',
          symbol: 'BTC',
          quantity: 0.1,
          unitPrice: 65000,
          currency: 'EUR',
          symbolProfile: {
            name: 'Bitcoin',
            assetClass: 'CRYPTO'
          }
        }
      ]
    });

    const result = parseUniversalCsv(jsonContent);
    expect(result.detectedFormat).toBe('Ghostfolio JSON Export');
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].ticker).toBe('BTC');
    expect(result.transactions[0].category).toBe('Crypto');
    expect(result.transactions[0].amount).toBe(0.1);
  });
});
