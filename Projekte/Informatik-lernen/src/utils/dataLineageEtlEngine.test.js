import { describe, it, expect } from 'vitest';
import {
  sanitizeCurrency,
  normalizeCountryCode,
  normalizeDateToIso,
  runEtlPipeline,
  SAMPLE_RAW_DATA
} from './dataLineageEtlEngine';

describe('dataLineageEtlEngine', () => {
  it('bereinigt und konvertiert Währungsangaben mit deutscher Notation (Komma)', () => {
    const res = sanitizeCurrency('1190,00 €', 0.19);
    expect(res).not.toBeNull();
    expect(res.brutto).toBe(1190.00);
    expect(res.netto).toBe(1000.00);
    expect(res.vat).toBe(190.00);
  });

  it('normalisiert diverse Ländercodes nach ISO-3166', () => {
    expect(normalizeCountryCode('Deutschland')).toBe('DE');
    expect(normalizeCountryCode('de')).toBe('DE');
    expect(normalizeCountryCode('Österreich')).toBe('AT');
    expect(normalizeCountryCode('CH')).toBe('CH');
  });

  it('normalisiert deutsche und Slash-Datumsformate zu ISO-8601', () => {
    expect(normalizeDateToIso('15.01.2026')).toBe('2026-01-15');
    expect(normalizeDateToIso('10/03/2026')).toBe('2026-03-10');
    expect(normalizeDateToIso('2026-02-18')).toBe('2026-02-18');
    expect(normalizeDateToIso('ungueltiges datum')).toBeNull();
  });

  it('führt vollständige ETL-Pipeline aus und identifiziert Schema-Drifts / Anomalien', () => {
    const etlResult = runEtlPipeline(SAMPLE_RAW_DATA);

    expect(etlResult.extractedCount).toBe(5);
    expect(etlResult.transformedCount).toBe(3); // 3 gültige Datensätze
    expect(etlResult.rejectedCount).toBe(2);    // 2 mit Schema-Drift / Verstoß (NULL-Umsatz, negativer Umsatz)
    expect(etlResult.anomalies.length).toBeGreaterThanOrEqual(2);
    expect(etlResult.lineageGraph.length).toBe(4);

    // Erstes valides Ergebnis prüfen
    const firstValid = etlResult.validRecords[0];
    expect(firstValid.customer_name).toBe('Müller GmbH');
    expect(firstValid.revenue_netto).toBe(1000.00);
    expect(firstValid.iso_date).toBe('2026-01-15');
    expect(firstValid.country_code).toBe('DE');
  });
});
