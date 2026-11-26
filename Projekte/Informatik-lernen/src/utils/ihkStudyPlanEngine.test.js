import { describe, it, expect } from 'vitest';
import { calculateExamCountdown, getIhkExamDates, IHK_DISCIPLINES } from './ihkStudyPlanEngine';

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

  it('bietet alle 6 IHK-Fachrichtungen an', () => {
    expect(IHK_DISCIPLINES.map((d) => d.id)).toEqual(['fiae', 'fisi', 'fidp', 'fidv', 'itse', 'itsm']);
  });
});
