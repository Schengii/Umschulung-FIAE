import { describe, it, expect } from 'vitest';
import { calculateExamCountdown, generateAdaptiveStudyPlan, getIhkExamDates, IHK_DISCIPLINES } from './ihkStudyPlanEngine';

describe('ihkStudyPlanEngine', () => {
  it('generiert dynamische Prüfungstermine für das angegebene Jahr', () => {
    const dates2026 = getIhkExamDates(2026);
    expect(dates2026.length).toBe(3);
    expect(dates2026[0].id).toBe('winter_2026');
    expect(dates2026[0].date).toBe('2026-11-25');
    expect(dates2026[1].id).toBe('summer_2027');
  });

  it('berechnet Tage und Wochen bis zum Prüfungsdatum korrekt', () => {
    const fixedNow = new Date('2026-10-01T12:00:00Z');
    const countdown = calculateExamCountdown('2026-11-25', fixedNow);

    expect(countdown.daysRemaining).toBe(55);
    expect(countdown.weeksRemaining).toBe(8);
    expect(countdown.isExpired).toBe(false);
  });

  it('erkennt abgelaufene Termine korrekt', () => {
    const fixedNow = new Date('2026-12-01T12:00:00Z');
    const countdown = calculateExamCountdown('2026-11-25', fixedNow);

    expect(countdown.isExpired).toBe(true);
    expect(countdown.daysRemaining).toBe(0);
    expect(countdown.weeksRemaining).toBe(0);
  });

  it('generiert für alle 6 IHK-Fachrichtungen maßgeschneiderte Lernpläne', () => {
    const disciplines = ['fiae', 'fisi', 'fidp', 'fidv', 'itse', 'itsm'];
    expect(IHK_DISCIPLINES.length).toBe(6);

    disciplines.forEach((disc) => {
      const plan = generateAdaptiveStudyPlan(disc, 6);
      expect(plan.length).toBe(6);
      expect(plan[0].focus).toBeTruthy();
      expect(plan[0].tags.length).toBeGreaterThan(0);
    });

    const fiaePlan = generateAdaptiveStudyPlan('fiae', 6);
    expect(fiaePlan[0].focus).toContain('Software-Architektur');

    const fisiPlan = generateAdaptiveStudyPlan('fisi', 6);
    expect(fisiPlan[0].focus).toContain('IPv6');

    const fidvPlan = generateAdaptiveStudyPlan('fidv', 6);
    expect(fidvPlan[0].focus).toContain('Cyber-physische Systeme');
  });

  it('integriert Prüfungssimulations-Meilensteine mit kanonischer Route "exam"', () => {
    const plan = generateAdaptiveStudyPlan('fiae', 10);
    const mockWeeks = plan.filter(w => w.recommendedLab === 'exam');
    expect(mockWeeks.length).toBeGreaterThanOrEqual(1);
    expect(mockWeeks[mockWeeks.length - 1].weekNumber).toBe(10);
  });

  it('begrenzt die Wochenanzahl auf das erlaubte Minimum und Maximum', () => {
    const minPlan = generateAdaptiveStudyPlan('fiae', 1);
    expect(minPlan.length).toBe(2);

    const maxPlan = generateAdaptiveStudyPlan('fiae', 30);
    expect(maxPlan.length).toBe(24);
  });
});
