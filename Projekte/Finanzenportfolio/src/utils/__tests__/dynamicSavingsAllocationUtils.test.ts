import { describe, it, expect } from 'vitest';
import { calculateDynamicSavingsAllocation } from '../dynamicSavingsAllocationUtils';
import type { Holding, TargetAllocation } from '../../types';

describe('calculateDynamicSavingsAllocation', () => {
  const dummyHoldings: Holding[] = [
    {
      ticker: 'VWCE.DE',
      name: 'Vanguard FTSE All-World',
      category: 'ETF',
      shares: 100,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 10000,
      currentValue: 10000, // 80% of portfolio
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 80,
      yieldOnCost: 1.5
    },
    {
      ticker: 'EUNL.DE',
      name: 'iShares Core MSCI World',
      category: 'Stock',
      shares: 25,
      averageBuyPrice: 100,
      currentPrice: 100,
      totalCost: 2500,
      currentValue: 2500, // 20% of portfolio
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 20,
      yieldOnCost: 2.0
    }
  ];

  const targets: TargetAllocation[] = [
    { category: 'ETF', weight: 50 },
    { category: 'Stock', weight: 40 },
    { category: 'Bond', weight: 10 }
  ];

  it('handles empty or zero monthly budget', () => {
    const res = calculateDynamicSavingsAllocation(dummyHoldings, targets, 0);
    expect(res.monthlySavingsBudgetEur).toBe(0);
    expect(res.isPortfolioBalanced).toBe(true);
    expect(res.allocations).toHaveLength(0);
  });

  it('allocates budget to underweight categories (Stock & Bond)', () => {
    // Portfolio total = 12,500 €. ETF is 80% (target 50%), Stock is 20% (target 40%), Bond is 0% (target 10%)
    const res = calculateDynamicSavingsAllocation(dummyHoldings, targets, 500);

    expect(res.monthlySavingsBudgetEur).toBe(500);
    expect(res.isPortfolioBalanced).toBe(false);
    expect(res.allocations.length).toBeGreaterThan(0);

    // Sum of allocated savings should be close to 500
    const sumAllocated = res.allocations.reduce((acc, a) => acc + a.allocatedSavingsEur, 0);
    expect(Math.abs(sumAllocated - 500)).toBeLessThan(1.0);

    // Stock & Bond should receive allocations, not ETF
    const etfAlloc = res.allocations.find(a => a.category === 'ETF');
    expect(etfAlloc).toBeUndefined();

    const stockAlloc = res.allocations.find(a => a.category === 'Stock');
    expect(stockAlloc).toBeDefined();
    expect(stockAlloc?.allocatedSavingsEur).toBeGreaterThan(0);
    expect(stockAlloc?.topCandidate?.ticker).toBe('EUNL.DE');
  });

  it('returns balanced distribution when portfolio already matches target weights', () => {
    const balancedHoldings: Holding[] = [
      {
        ticker: 'ETF1',
        name: 'ETF World',
        category: 'ETF',
        shares: 50,
        averageBuyPrice: 100,
        currentPrice: 100,
        totalCost: 5000,
        currentValue: 5000,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioWeight: 50,
        yieldOnCost: 2
      },
      {
        ticker: 'STK1',
        name: 'Stock World',
        category: 'Stock',
        shares: 50,
        averageBuyPrice: 100,
        currentPrice: 100,
        totalCost: 5000,
        currentValue: 5000,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioWeight: 50,
        yieldOnCost: 2
      }
    ];

    const simpleTargets: TargetAllocation[] = [
      { category: 'ETF', weight: 50 },
      { category: 'Stock', weight: 50 }
    ];

    const res = calculateDynamicSavingsAllocation(balancedHoldings, simpleTargets, 400);
    expect(res.isPortfolioBalanced).toBe(true);
    expect(res.allocations.length).toBe(2);
    expect(res.allocations.find(a => a.category === 'ETF')?.allocatedSavingsEur).toBe(200);
    expect(res.allocations.find(a => a.category === 'Stock')?.allocatedSavingsEur).toBe(200);
  });
});
