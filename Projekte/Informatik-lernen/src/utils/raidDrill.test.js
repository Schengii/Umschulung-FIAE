import { describe, it, expect } from 'vitest';
import { calculateRaidStorage, RAID_DRILL_QUESTIONS } from './raidEngine';

const correct = (id) => {
  const q = RAID_DRILL_QUESTIONS.find((x) => x.id === id);
  return q.optionen[q.korrektIndex];
};

describe('RAID_DRILL_QUESTIONS gegen die Engine', () => {
  it('raid_1: RAID 5, 4 × 4 TB → 12 TB nutzbar', () => {
    expect(calculateRaidStorage({ raidLevel: 5, diskCount: 4, diskSizeTB: 4 }).usableCapacityTB).toBe(12);
    expect(correct('raid_1')).toBe('12 TB');
  });

  it('raid_2: RAID 6 toleriert zwei Ausfälle', () => {
    expect(calculateRaidStorage({ raidLevel: 6, diskCount: 4, diskSizeTB: 4 }).maxFailedDisks).toBe(2);
    expect(correct('raid_2')).toBe('Zwei');
  });

  it('raid_3: RAID 10, 6 × 2 TB → 6 TB nutzbar', () => {
    expect(calculateRaidStorage({ raidLevel: 10, diskCount: 6, diskSizeTB: 2 }).usableCapacityTB).toBe(6);
    expect(correct('raid_3')).toBe('6 TB');
  });

  it('raid_4: RAID 0 hat keine Redundanz', () => {
    expect(calculateRaidStorage({ raidLevel: 0, diskCount: 2, diskSizeTB: 4 }).maxFailedDisks).toBe(0);
    expect(correct('raid_4')).toBe('RAID 0');
  });

  it('hat 5 Fragen mit eindeutigen IDs', () => {
    expect(new Set(RAID_DRILL_QUESTIONS.map((q) => q.id)).size).toBe(5);
  });
});
