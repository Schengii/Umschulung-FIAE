import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TOM_MEASURES,
  evaluateTomAudit,
  generateTomMarkdownDoc
} from './ihkTomCatalogEngine';

describe('ihkTomCatalogEngine', () => {
  it('enthält alle 4 Säulen von Art. 32 DSGVO', () => {
    const categories = new Set(DEFAULT_TOM_MEASURES.map(m => m.category));
    expect(categories.has('confidentiality')).toBe(true);
    expect(categories.has('integrity')).toBe(true);
    expect(categories.has('availability')).toBe(true);
    expect(categories.has('evaluation')).toBe(true);
  });

  it('berechnet den Compliance-Score und identifiziert Lücken', () => {
    const audit = evaluateTomAudit(DEFAULT_TOM_MEASURES);
    expect(audit.totalCount).toBe(DEFAULT_TOM_MEASURES.length);
    expect(audit.scorePercent).toBeGreaterThan(0);
    expect(audit.scorePercent).toBeLessThanOrEqual(100);
    expect(audit.categoryStats.confidentiality).toBeDefined();
    expect(audit.criticalGaps.length).toBe(audit.totalCount - audit.implementedCount);
  });

  it('erzeugt vollständige Markdown-Dokumentation für IHK-Projektbericht', () => {
    const md = generateTomMarkdownDoc(DEFAULT_TOM_MEASURES);
    expect(md).toContain('Technisch-organisatorische Maßnahmen');
    expect(md).toContain('Art. 32 DSGVO');
    expect(md).toContain('| Kategorie | Maßnahme | Status |');
    expect(md).toContain('Zutrittskontrolle');
  });
});
