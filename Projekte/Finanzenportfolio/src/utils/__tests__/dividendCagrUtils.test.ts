import { describe, it, expect } from 'vitest';
import { calculateCagr, calculateDividendCagrPerAsset } from '../dividendCagrUtils';

describe('dividendCagrUtils', () => {
  it('calculates correct CAGR for fixed values', () => {
    // 100 to 121 over 2 periods is 10%
    const cagr = calculateCagr(100, 121, 2);
    expect(cagr).toBeCloseTo(0.10, 4);

    // Negative or zero start value returns null
    expect(calculateCagr(0, 100, 2)).toBeNull();
    expect(calculateCagr(100, 0, 2)).toBeNull();
  });

  it('calculates dividend CAGR per asset across multiple years', () => {
    const txs = [
      { type: 'DIVIDEND', ticker: 'MSFT', name: 'Microsoft', date: '15.03.2023', amount: 10, price: 10, tax: 0 },
      { type: 'DIVIDEND', ticker: 'MSFT', name: 'Microsoft', date: '15.03.2024', amount: 10, price: 11, tax: 0 },
      { type: 'DIVIDEND', ticker: 'MSFT', name: 'Microsoft', date: '15.03.2025', amount: 10, price: 12.1, tax: 0 },
      { type: 'BUY', ticker: 'MSFT', name: 'Microsoft', date: '01.01.2023', amount: 10, price: 200 }
    ];

    const results = calculateDividendCagrPerAsset(txs);
    expect(results.length).toBe(1);
    expect(results[0].ticker).toBe('MSFT');
    expect(results[0].yearsCount).toBe(3);
    // 1-year CAGR from 2024 (110) to 2025 (121) = 10%
    expect(results[0].cagr1Year).toBeCloseTo(0.10, 4);
  });
});
