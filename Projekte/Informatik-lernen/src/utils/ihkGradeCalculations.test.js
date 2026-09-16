import { describe, it, expect } from 'vitest';
import { calculateIhkFinalScore, calculateMepPossibilities, getIhkGrade } from './ihkGradeCalculations';

describe('ihkGradeCalculations', () => {
  it('converts IHK score to German grade scale correctly', () => {
    expect(getIhkGrade(95).grade).toBe(1);
    expect(getIhkGrade(85).grade).toBe(2);
    expect(getIhkGrade(72).grade).toBe(3);
    expect(getIhkGrade(55).grade).toBe(4);
    expect(getIhkGrade(40).grade).toBe(5);
    expect(getIhkGrade(20).grade).toBe(6);
  });

  it('calculates passing final score correctly with weights', () => {
    const scores = {
      ap1: 75,
      ap2_b1: 80,
      ap2_b2: 85,
      ap2_wiso: 70,
      doku: 90,
      fachgespraech: 92
    };

    const res = calculateIhkFinalScore(scores);
    expect(res.isPassed).toBe(true);
    expect(res.totalPoints).toBeGreaterThan(80);
    expect(res.overallGrade.grade).toBe(2);
  });

  it('computes MEP (Mündliche Ergänzungsprüfung) required points', () => {
    // If written score in WiSo was 40 points
    const currentScores = { ap2_b1: 70, ap2_b2: 70, ap2_wiso: 40 };
    const mepList = calculateMepPossibilities(currentScores);

    expect(mepList.length).toBe(1);
    expect(mepList[0].areaKey).toBe('ap2_wiso');
    // 150 - (2 * 40) = 70 points
    expect(mepList[0].minRequiredMepPoints).toBe(70);
    expect(mepList[0].isFeasible).toBe(true);
  });
});
