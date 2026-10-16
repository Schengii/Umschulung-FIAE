import { describe, it, expect } from 'vitest';
import { calculateSwapOutput } from '../components/cryptoSwap';

describe('DEX Crypto Auto-Swap & Hedging', () => {
  it('calculates swap output and slippage bounds correctly', () => {
    const res = calculateSwapOutput(1000, 'USDC', 'ETH', 0.5);

    expect(res.eurValue).toBe(920);
    expect(res.rawOutput).toBeCloseTo(920 / 3250, 4);
    expect(res.minOutput).toBeLessThan(res.rawOutput);
    expect(res.minOutput).toBeCloseTo(res.rawOutput * 0.995, 4);
    expect(res.gasEur).toBeGreaterThan(0);
  });

  it('calculates swap output for high-speed chain with low gas', () => {
    const res = calculateSwapOutput(100, 'SOL', 'USDC', 1.0);

    expect(res.eurValue).toBe(14550);
    expect(res.gasEur).toBe(0.05); // Low gas on SOL
  });
});
