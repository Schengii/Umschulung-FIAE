import { describe, it, expect } from 'vitest';
import { calculateCashbackTokens, AMZ_TOKEN_RATE_EUR } from '../components/defiCashback';

describe('DeFi Cashback & Staking Suite', () => {
  it('calculates 2.5% cashback accurately in AMZ Tokens', () => {
    // 100 EUR order -> 2.5 EUR cashback -> 2.5 / 1.25 = 2.0 AMZ tokens
    const tokens = calculateCashbackTokens(100);
    expect(tokens).toBe(2.0);
  });

  it('defines valid AMZ Token exchange rate', () => {
    expect(AMZ_TOKEN_RATE_EUR).toBeGreaterThan(0);
    expect(AMZ_TOKEN_RATE_EUR).toBe(1.25);
  });
});
