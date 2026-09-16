import { describe, it, expect } from 'vitest';
import { calculateRaidStorage } from './raidEngine';

describe('raidEngine (IHK Storage & RAID Rechner)', () => {
  it('berechnet RAID 5 Kapazität und Redundanz korrekt (z. B. 4 x 4 TB)', () => {
    const res = calculateRaidStorage({
      raidLevel: 5,
      diskCount: 4,
      diskSizeTB: 4,
      rebuildSpeedMBs: 150
    });

    expect(res.rawCapacityTB).toBe(16);
    expect(res.usableCapacityTB).toBe(12); // (4-1) * 4TB
    expect(res.parityCapacityTB).toBe(4);
    expect(res.efficiencyPercent).toBe(75);
    expect(res.maxFailedDisks).toBe(1);
    expect(res.writePenalty).toBe(4);
    expect(res.rebuildHours).toBeGreaterThan(0);
  });

  it('berechnet RAID 6 mit 2 tolerierten Plattenausfällen', () => {
    const res = calculateRaidStorage({
      raidLevel: 6,
      diskCount: 5,
      diskSizeTB: 6
    });

    expect(res.usableCapacityTB).toBe(18); // (5-2) * 6TB
    expect(res.parityCapacityTB).toBe(12);
    expect(res.maxFailedDisks).toBe(2);
    expect(res.writePenalty).toBe(6);
  });

  it('berechnet RAID 10 mit 50% Redundanz', () => {
    const res = calculateRaidStorage({
      raidLevel: 10,
      diskCount: 4,
      diskSizeTB: 8
    });

    expect(res.rawCapacityTB).toBe(32);
    expect(res.usableCapacityTB).toBe(16);
    expect(res.efficiencyPercent).toBe(50);
  });

  it('erzeugt visuelle Disk-Matrizen mit rotierender Parität', () => {
    const res = calculateRaidStorage({ raidLevel: 5, diskCount: 3, diskSizeTB: 2 });
    expect(res.diskMatrix.length).toBe(3);
    const hasParityBlock = res.diskMatrix.some(d => d.blocks.some(b => b.isParity));
    expect(hasParityBlock).toBe(true);
  });
});
