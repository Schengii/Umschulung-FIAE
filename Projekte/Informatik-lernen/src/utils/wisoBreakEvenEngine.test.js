import { describe, it, expect } from 'vitest';
import { calculateTier2ContributionMargin } from './wisoBreakEvenEngine';

describe('wisoBreakEvenEngine', () => {
  const sampleProducts = [
    {
      id: 'prod-a',
      name: 'Cloud Hosting Enterprise',
      price: 200,
      variableCost: 80,
      quantity: 500,
      productFixedCost: 15000,
      bottleneckTimeMinutes: 30 // db = 120, db_rel = 120 / 30 = 4.0
    },
    {
      id: 'prod-b',
      name: 'Managed Database Small',
      price: 100,
      variableCost: 50,
      quantity: 1000,
      productFixedCost: 10000,
      bottleneckTimeMinutes: 10 // db = 50, db_rel = 50 / 10 = 5.0 -> Rank 1!
    }
  ];

  it('correctly calculates unit db, DB I, and product DB II', () => {
    const res = calculateTier2ContributionMargin(sampleProducts, 20000);

    const prodA = res.products.find(p => p.id === 'prod-a');
    expect(prodA.unitContributionMargin).toBe(120);
    expect(prodA.revenue).toBe(100000);
    expect(prodA.contributionMargin1).toBe(60000);
    expect(prodA.contributionMargin2).toBe(45000); // 60k - 15k
  });

  it('calculates total operating result across company fixed costs', () => {
    const res = calculateTier2ContributionMargin(sampleProducts, 20000);

    // Total DB II: Prod A (45,000) + Prod B (50,000 - 10,000 = 40,000) = 85,000
    // Operating result: 85,000 - 20,000 = 65,000
    expect(res.totalContributionMargin2).toBe(85000);
    expect(res.operatingResult).toBe(65000);
  });

  it('prioritizes products in bottleneck ranking by relative contribution margin', () => {
    const res = calculateTier2ContributionMargin(sampleProducts, 20000);

    // Prod B has db_rel = 5.0 EUR/min, Prod A has 4.0 EUR/min
    expect(res.bottleneckRanking[0].productId).toBe('prod-b');
    expect(res.bottleneckRanking[0].dbRel).toBe(5);
    expect(res.bottleneckRanking[1].productId).toBe('prod-a');
    expect(res.bottleneckRanking[1].dbRel).toBe(4);
  });

  it('calculates single-product break even quantity accurately', () => {
    const res = calculateTier2ContributionMargin(sampleProducts, 20000);

    // Prod A: 15,000 / 120 = 125 units to cover product fixed cost
    const prodA = res.products.find(p => p.id === 'prod-a');
    expect(prodA.breakEvenUnits).toBe(125);
    expect(prodA.breakEvenRevenue).toBe(25000);
  });
});
