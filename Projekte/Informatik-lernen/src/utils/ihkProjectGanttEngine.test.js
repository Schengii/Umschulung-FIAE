import { describe, it, expect } from 'vitest';
import {
  IHK_PROFILES,
  validateIhkProjectPlan,
  calculateGanttTimeline,
  exportGanttToMarkdown
} from './ihkProjectGanttEngine';

describe('ihkProjectGanttEngine', () => {
  it('should validate standard FIAE default plan successfully to 80 hours', () => {
    const fiae = IHK_PROFILES.FIAE;
    const result = validateIhkProjectPlan(fiae.defaultPhases, 'FIAE');

    expect(result.isValid).toBe(true);
    expect(result.totalHours).toBe(80);
    expect(result.diffHours).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  it('should validate standard FISI default plan successfully to 40 hours', () => {
    const fisi = IHK_PROFILES.FISI;
    const result = validateIhkProjectPlan(fisi.defaultPhases, 'FISI');

    expect(result.isValid).toBe(true);
    expect(result.totalHours).toBe(40);
    expect(result.diffHours).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  it('should detect hour overflow and underflow errors', () => {
    const customPhases = [
      { id: '1', name: '1. Analyse', hours: 20 },
      { id: '2', name: '2. Realisierung', hours: 50 },
      { id: '3', name: '3. Dokumentation', hours: 20 }
    ]; // 90h instead of 80h

    const result = validateIhkProjectPlan(customPhases, 'FIAE');
    expect(result.isValid).toBe(false);
    expect(result.diffHours).toBe(10);
    expect(result.errors[0]).toContain('überschreitet');
  });

  it('should warn if implementation percentage exceeds limit', () => {
    const skewedPhases = [
      { id: '1', name: '1. Analyse', hours: 5 },
      { id: '2', name: '2. Realisierung', hours: 65 }, // 65/80 = 81% > 50%
      { id: '3', name: '3. Dokumentation', hours: 10 }
    ];

    const result = validateIhkProjectPlan(skewedPhases, 'FIAE');
    expect(result.warnings.some(w => w.includes('Realisierungsanteil'))).toBe(true);
  });

  it('should calculate calendar timeline without weekends', () => {
    const phases = [
      { id: 'p1', name: 'Analyse', hours: 16 }, // 2 days (8h/day)
      { id: 'p2', name: 'Realisierung', hours: 24 } // 3 days
    ];

    const timeline = calculateGanttTimeline(phases, '2026-04-03'); // Friday
    expect(timeline.length).toBe(2);
    expect(timeline[0].durationDays).toBe(2);
    expect(timeline[1].durationDays).toBe(3);
    // Start date should be valid ISO formatted date
    expect(timeline[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(timeline[1].endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should export formatted Markdown with deliverables and summary', () => {
    const fiae = IHK_PROFILES.FIAE;
    const md = exportGanttToMarkdown(fiae.defaultPhases, 'FIAE', 'Automatisierte CI/CD Pipeline');

    expect(md).toContain('Automatisierte CI/CD Pipeline');
    expect(md).toContain('80 Stunden');
    expect(md).toContain('Realisierung & Implementierung');
    expect(md).toContain('Projektziel erreicht');
  });
});
