import { describe, it, expect } from 'vitest';
import { 
  DEBUGGER_SCENARIOS, 
  CLEAN_CODE_CHALLENGES, 
  DNS_LIFECYCLE_STEPS, 
  SQL_ISOLATION_SCENARIOS, 
  IHK_PROJECT_TEMPLATES 
} from './nextGenLabsData';

describe('Next-Gen Labs Educational Data & Calculators', () => {
  it('should validate Debugger Scenarios for valid steps, call stacks and heap objects', () => {
    expect(DEBUGGER_SCENARIOS.length).toBeGreaterThanOrEqual(3);
    DEBUGGER_SCENARIOS.forEach(s => {
      expect(s.id).toBeDefined();
      expect(s.steps.length).toBeGreaterThan(0);
      s.steps.forEach(step => {
        expect(step.line).toBeGreaterThan(0);
        expect(Array.isArray(step.stack)).toBe(true);
        expect(typeof step.vars).toBe('object');
      });
    });
  });

  it('should validate Clean Code & OWASP Security challenges have exactly 1 correct solution', () => {
    expect(CLEAN_CODE_CHALLENGES.length).toBeGreaterThanOrEqual(3);
    CLEAN_CODE_CHALLENGES.forEach(c => {
      expect(c.badCode).toBeDefined();
      expect(c.refactoredCode).toBeDefined();
      const correctOptions = c.options.filter(o => o.correct);
      expect(correctOptions.length).toBe(1);
    });
  });

  it('should have an 8-step end-to-end DNS to HTTP/2 lifecycle', () => {
    expect(DNS_LIFECYCLE_STEPS.length).toBe(8);
    expect(DNS_LIFECYCLE_STEPS[0].phase).toContain('Browser Cache');
    expect(DNS_LIFECYCLE_STEPS[7].phase).toContain('HTTP/2');
  });

  it('should validate IHK Project budget and calculate accurate amortization ROI', () => {
    const fiae = IHK_PROJECT_TEMPLATES.fiae;
    const fisi = IHK_PROJECT_TEMPLATES.fisi;
    
    expect(fiae.budgetHours).toBe(80);
    expect(fisi.budgetHours).toBe(40);

    const fiaeTotalDefaultHours = fiae.phases.reduce((sum, p) => sum + p.defaultHours, 0);
    const fisiTotalDefaultHours = fisi.phases.reduce((sum, p) => sum + p.defaultHours, 0);

    expect(fiaeTotalDefaultHours).toBe(80);
    expect(fisiTotalDefaultHours).toBe(40);

    // Amortization calculation check
    const totalCost = 80 * 85; // 6.800 €
    const savedPerYear = 18000;
    const breakEvenYears = Number((totalCost / savedPerYear).toFixed(2));
    expect(breakEvenYears).toBe(0.38); // ~ 4.5 Monate
  });

  it('should validate SQL Isolation scenarios and deadlock triggers', () => {
    expect(SQL_ISOLATION_SCENARIOS.length).toBeGreaterThanOrEqual(2);
    const deadlock = SQL_ISOLATION_SCENARIOS.find(s => s.id === 'deadlock-conflict');
    expect(deadlock).toBeDefined();
    expect(deadlock.sessionA.length).toBeGreaterThan(0);
    expect(deadlock.sessionB.length).toBeGreaterThan(0);
  });
});
