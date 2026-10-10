import { describe, it, expect } from 'vitest';
import {
  calculateBackupStorage,
  calculateGfsRotation,
  calculateRtoRpoLoss,
  audit321Rule
} from './backupStrategyEngine';

describe('backupStrategyEngine', () => {
  it('calculates storage requirements: incremental < differential < full', () => {
    const baseGb = 1000;
    const delta = 0.05; // 5% täglich
    const result = calculateBackupStorage(baseGb, delta, 1.0); // Ohne Kompression

    // Full: 7 * 1000 = 7000 GB
    expect(result.full.totalStorageGb).toBe(7000);
    expect(result.full.restoreStepsCount).toBe(1);

    // Incremental: 1000 + 6 * 50 = 1300 GB
    expect(result.incremental.totalStorageGb).toBe(1300);
    expect(result.incremental.restoreStepsCount).toBe(7);

    // Differential: 1000 + 50*(1+2+3+4+5+6) = 1000 + 50*21 = 2050 GB
    expect(result.differential.totalStorageGb).toBe(2050);
    expect(result.differential.restoreStepsCount).toBe(2);

    expect(result.incremental.totalStorageGb).toBeLessThan(result.differential.totalStorageGb);
    expect(result.differential.totalStorageGb).toBeLessThan(result.full.totalStorageGb);
  });

  it('calculates Grandfather-Father-Son rotation media count (4 son + 4 father + 12 grandfather = 20)', () => {
    const gfs = calculateGfsRotation(1000);
    expect(gfs.totalMediaCount).toBe(20);
    expect(gfs.sonMediaCount).toBe(4);
    expect(gfs.fatherMediaCount).toBe(4);
    expect(gfs.grandfatherMediaCount).toBe(12);
  });

  it('calculates RTO and RPO business downtime and data loss cost', () => {
    const loss = calculateRtoRpoLoss(4, 2, 5000, 2500);
    expect(loss.downtimeCostEur).toBe(20000);
    expect(loss.dataLossCostEur).toBe(5000);
    expect(loss.totalIncidentCostEur).toBe(25000);
    expect(loss.rtoRating).toBe('GOOD');
  });

  it('audits 3-2-1-1-0 rule compliance correctly', () => {
    const auditFull = audit321Rule({
      copiesCount: 3,
      differentMedia: true,
      offsiteLocation: true,
      airGappedImmutable: true,
      automatedVerificationTests: true
    });
    expect(auditFull.isCompliant).toBe(true);
    expect(auditFull.scorePercent).toBe(100);

    const auditWeak = audit321Rule({
      copiesCount: 2,
      differentMedia: false,
      offsiteLocation: false,
      airGappedImmutable: false,
      automatedVerificationTests: false
    });
    expect(auditWeak.isCompliant).toBe(false);
    expect(auditWeak.scorePercent).toBe(0);
  });
});
