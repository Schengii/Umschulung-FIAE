import { describe, it, expect } from 'vitest';
import { calculateExamCountdown, generateAdaptiveStudyPlan } from './ihkStudyPlanEngine';

describe('ihkStudyPlanEngine', () => {
  it('berechnet Tage und Wochen bis zum Prüfungsdatum korrekt', () => {
    const fixedNow = new Date('2026-10-01T00:00:00Z');
    const countdown = calculateExamCountdown('2026-11-25', fixedNow);

    expect(countdown.daysRemaining).toBe(55);
    expect(countdown.weeksRemaining).toBe(8);
    expect(countdown.isExpired).toBe(false);
  });

  it('generiert für FIAE und FISI maßgeschneiderte Lernpläne', () => {
    const fiaePlan = generateAdaptiveStudyPlan('fiae', 6);
    expect(fiaePlan.length).toBe(6);
    expect(fiaePlan[0].focus).toContain('Software-Architektur');

    const fisiPlan = generateAdaptiveStudyPlan('fisi', 6);
    expect(fisiPlan[0].focus).toContain('IPv6');
  });

  it('integriert Prüfungssimulations-Meilensteine in den Plan', () => {
    const plan = generateAdaptiveStudyPlan('fiae', 10);
    const mockWeeks = plan.filter(w => w.recommendedLab === 'exam_simulator');
    expect(mockWeeks.length).toBeGreaterThanOrEqual(1);
  });
});
