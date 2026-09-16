import { describe, it, expect } from 'vitest';
import { calculateNetPresentValue } from './wisoCapitalValueEngine';

describe('IHK WISO Capital Value (NPV) Engine', () => {
  it('calculates discounted cash flows and NPV accurately', () => {
    const res = calculateNetPresentValue({
      anschaffungsauszahlung: 100000,
      kalkulationszinssatzPercent: 10,
      cashflows: [40000, 40000, 40000],
      liquidationserloes: 0
    });

    // 40000/1.1 + 40000/1.21 + 40000/1.331 = 36363.64 + 33057.85 + 30052.59 = 99474.08
    // NPV = 99474.08 - 100000 = -525.92
    expect(res.sumBarwerte).toBeCloseTo(99474, -1);
    expect(res.kapitalwert).toBeLessThan(0);
    expect(res.isProfitable).toBe(false);
  });
});
