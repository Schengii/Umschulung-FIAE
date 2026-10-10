import { describe, it, expect } from 'vitest';
import { COMPANY_FORMS, recommendCompanyForms } from './wisoCompanyFormsEngine';

describe('wisoCompanyFormsEngine', () => {
  it('contains all 8 required IHK corporate forms with valid legal attributes', () => {
    expect(COMPANY_FORMS.length).toBe(8);
    const gmbh = COMPANY_FORMS.find(f => f.id === 'gmbh');
    expect(gmbh?.minCapital).toContain('25.000');
    expect(gmbh?.commercialRegister).toContain('Abteilung B');
  });

  it('recommends UG when limited liability is needed with low capital (< 12500 €)', () => {
    const recommended = recommendCompanyForms({
      maxInitialCapital: 2000,
      needLimitedLiability: true,
      singleFounder: true,
      wantExternalInvestorsOnly: false
    });

    expect(recommended.some(f => f.id === 'ug')).toBe(true);
    expect(recommended.some(f => f.id === 'gmbh')).toBe(false);
    expect(recommended.some(f => f.id === 'einzelunternehmen')).toBe(false);
  });

  it('recommends KG when external investors with limited liability are needed', () => {
    const recommended = recommendCompanyForms({
      maxInitialCapital: 10000,
      needLimitedLiability: false,
      singleFounder: false,
      wantExternalInvestorsOnly: true
    });

    expect(recommended.some(f => f.id === 'kg')).toBe(true);
  });
});
