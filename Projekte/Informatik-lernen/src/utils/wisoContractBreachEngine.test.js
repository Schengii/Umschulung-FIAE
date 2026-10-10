import { describe, it, expect } from 'vitest';
import {
  evaluateDefectNoticeDeadline,
  evaluateBuyerRights
} from './wisoContractBreachEngine';

describe('wisoContractBreachEngine', () => {
  it('correctly applies strict B2B HGB 377 notice periods', () => {
    const res = evaluateDefectNoticeDeadline('b2b', 'offen');
    expect(res.dutyOfInspection).toBe(true);
    expect(res.lossOfWarrantyOnDelay).toBe(true);
    expect(res.legalBasis).toContain('377');
  });

  it('protects B2C consumers from harsh HGB inspection duties', () => {
    const res = evaluateDefectNoticeDeadline('b2c', 'offen');
    expect(res.dutyOfInspection).toBe(false);
    expect(res.lossOfWarrantyOnDelay).toBe(false);
    expect(res.legalBasis).toContain('438');
  });

  it('unlocks secondary rights after 2 failed repair attempts', () => {
    const before = evaluateBuyerRights({ failedRepairAttempts: 1 });
    expect(before.secondaryRights.length).toBe(0);
    expect(before.canWithdraw).toBe(false);

    const after = evaluateBuyerRights({ failedRepairAttempts: 2 });
    expect(after.secondaryRights.length).toBeGreaterThan(0);
    expect(after.canWithdraw).toBe(true);
    expect(after.canReducePrice).toBe(true);
  });

  it('prevents contract withdrawal on immaterial defects', () => {
    const res = evaluateBuyerRights({ failedRepairAttempts: 2, isImmaterialDefect: true });
    expect(res.canWithdraw).toBe(false);
    expect(res.canReducePrice).toBe(true);
  });
});
