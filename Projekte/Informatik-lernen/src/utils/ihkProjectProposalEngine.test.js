import { describe, it, expect } from 'vitest';
import { 
  evaluateIhkProjectProposal, 
  DEFAULT_PROPOSAL_PHASES, 
  generateProjectPhasesWizard,
  checkScheduleCollisions 
} from './ihkProjectProposalEngine';

describe('ihkProjectProposalEngine (IHK Projektantrags-Prüfer & Zeitplan-Kollisions-Linter)', () => {
  it('genehmigt einen konformen 80h FIAE Antrag', () => {
    const res = evaluateIhkProjectProposal({
      occupationId: 'fiae',
      phases: DEFAULT_PROPOSAL_PHASES,
      checkedItems: ['chk_scope', 'chk_decision', 'chk_economic', 'chk_security', 'chk_handover']
    });

    expect(res.totalHours).toBe(80);
    expect(res.isHoursExact).toBe(true);
    expect(res.status).toBe('APPROVED');
    expect(res.errors.length).toBe(0);
  });

  it('erkennt unlogische Phasenreihenfolge und Zeitkollisionen', () => {
    const invalidPhases = [
      { id: '1', name: 'Phase A', startDay: 5, endDay: 3, category: 'analyse' }
    ];
    const warnings = checkScheduleCollisions(invalidPhases);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('Starttag');
  });

  it('lehnt Antrag ab wenn Stundenkontingent überschritten ist', () => {
    const phases = [
      { id: 'p1', name: 'Analyse', hours: 20, category: 'analyse' },
      { id: 'p2', name: 'Umsetzung', hours: 70, category: 'umsetzung' }
    ];
    const res = evaluateIhkProjectProposal({
      occupationId: 'fiae',
      phases
    });

    expect(res.totalHours).toBe(90);
    expect(res.status).toBe('REJECTED');
    expect(res.errors.some(e => e.includes('maximal 80'))).toBe(true);
  });

  it('lehnt Antrag ab wenn K.O. Checklistenpunkte fehlen', () => {
    const res = evaluateIhkProjectProposal({
      occupationId: 'fiae',
      phases: DEFAULT_PROPOSAL_PHASES,
      checkedItems: ['chk_scope'] // Wirtschaftlichkeit etc. fehlen!
    });

    expect(res.status).toBe('REJECTED');
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('generiert IHK-konforme Phasen für FIAE, FISI und IT-SE im Wizard', () => {
    const fiaePhases = generateProjectPhasesWizard('fiae', 'web_app');
    const fiaeTotal = fiaePhases.reduce((s, p) => s + p.hours, 0);
    expect(fiaeTotal).toBe(80);

    const fisiPhases = generateProjectPhasesWizard('fisi', 'cloud_migration');
    const fisiTotal = fisiPhases.reduce((s, p) => s + p.hours, 0);
    expect(fisiTotal).toBe(40);

    const itsePhases = generateProjectPhasesWizard('itse', 'custom');
    const itseTotal = itsePhases.reduce((s, p) => s + p.hours, 0);
    expect(itseTotal).toBe(40);
  });
});
