// @ts-check
/**
 * IHK ETL & Data-Lineage Schema-Drift Studio Engine
 * Praxis- und prüfungsrelevant für Fachinformatiker Daten- und Prozessanalyse (FIDP),
 * Anwendungsentwicklung (FIAE) & AP2 (Datenintegration, Data Governance & Warehousing).
 */

/**
 * @typedef {object} RawDataRecord
 * @property {string | number} [id]
 * @property {string} [kunde]
 * @property {string | number} [umsatz_brutto]
 * @property {string} [datum]
 * @property {string} [land]
 *
 * @typedef {object} ProcessedRecord
 * @property {number} id
 * @property {string} customer_name
 * @property {number} revenue_netto
 * @property {number} vat_amount
 * @property {string} iso_date
 * @property {string} country_code
 *
 * @typedef {object} SchemaDriftAnomaly
 * @property {number} recordIndex
 * @property {string} field
 * @property {string} errorType
 * @property {string} message
 * @property {unknown} rawValue
 */

/**
 * Beispielhafte Rohdaten aus unbereinigten Quellsystemen (CRM, Web-Shop CSV, Altsystem).
 * Enthält typische IHK-Prüfungsfallen:
 * - Kommazahlen mit Komma statt Punkt ("1299,50 €")
 * - Deutsches Datumsformat ("24.09.2026") statt ISO-8601
 * - Unbereinigte Whitespaces ("  Max Mustermann ")
 * - Fehlende Werte / Typ-Mismatches (Schema-Drift)
 */
export const SAMPLE_RAW_DATA = [
  { id: '1001', kunde: '  Müller GmbH  ', umsatz_brutto: '1190,00 €', datum: '15.01.2026', land: 'DE' },
  { id: '1002', kunde: 'TechCorp SA', umsatz_brutto: '2380.00', datum: '2026-02-18', land: 'AT' },
  { id: '1003', kunde: 'Schmidt & Partner', umsatz_brutto: 'NULL', datum: '10/03/2026', land: 'Deutschland' },
  { id: '1004', kunde: 'Global Logistics', umsatz_brutto: '595.00 €', datum: '04.04.2026', land: 'CH' },
  { id: '1005', kunde: 'Alpha Systems', umsatz_brutto: '-150,00 €', datum: '12.05.2026', land: 'de' }
];

/**
 * Wandelt unbereinigte Währungs-Strings in numerische Netto- und MwSt-Werte um (19% DE / Standard).
 * @param {string | number} val
 * @param {number} vatRate Standard: 0.19
 * @returns {{ brutto: number, netto: number, vat: number } | null}
 */
export function sanitizeCurrency(val, vatRate = 0.19) {
  if (val === null || val === undefined) return null;
  const str = String(val).replace(/€/g, '').replace(/\s+/g, '').replace(/,/g, '.');
  const num = parseFloat(str);
  if (isNaN(num)) return null;

  const brutto = Number(num.toFixed(2));
  const netto = Number((brutto / (1 + vatRate)).toFixed(2));
  const vat = Number((brutto - netto).toFixed(2));

  return { brutto, netto, vat };
}

/**
 * Normalisiert Ländercodes nach ISO 3166-1 alpha-2.
 * @param {string} country
 * @returns {string}
 */
export function normalizeCountryCode(country = '') {
  const c = String(country).trim().toUpperCase();
  if (c === 'DEUTSCHLAND' || c === 'GERMANY' || c === 'DE') return 'DE';
  if (c === 'ÖSTERREICH' || c === 'AUSTRIA' || c === 'AT') return 'AT';
  if (c === 'SCHWEIZ' || c === 'SWITZERLAND' || c === 'CH') return 'CH';
  return c || 'UNKNOWN';
}

/**
 * Validiert und normalisiert diverse Datumsformate ins ISO-8601 Format (YYYY-MM-DD).
 * @param {string} dateStr
 * @returns {string | null}
 */
export function normalizeDateToIso(dateStr = '') {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Bereits ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Deutsch: DD.MM.YYYY
  const deMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (deMatch) {
    const day = deMatch[1].padStart(2, '0');
    const month = deMatch[2].padStart(2, '0');
    const year = deMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Slash: DD/MM/YYYY oder MM/DD/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Vollständiger ETL-Pipeline-Simulator mit Schema-Drift-Erkennung und Lineage-Tracking.
 * @param {RawDataRecord[]} records
 * @returns {{
 *   extractedCount: number,
 *   transformedCount: number,
 *   rejectedCount: number,
 *   validRecords: ProcessedRecord[],
 *   anomalies: SchemaDriftAnomaly[],
 *   lineageGraph: { stage: string, recordCount: number, description: string }[]
 * }}
 */
export function runEtlPipeline(records = SAMPLE_RAW_DATA) {
  const extractedCount = records.length;
  /** @type {ProcessedRecord[]} */
  const validRecords = [];
  /** @type {SchemaDriftAnomaly[]} */
  const anomalies = [];

  records.forEach((rec, idx) => {
    let hasAnomaly = false;

    // 1. ID Prüfung
    const idNum = parseInt(String(rec.id), 10);
    if (isNaN(idNum) || idNum <= 0) {
      anomalies.push({
        recordIndex: idx,
        field: 'id',
        errorType: 'INVALID_PRIMARY_KEY',
        message: 'Datensatz-ID ist ungültig oder keine positive Ganzzahl',
        rawValue: rec.id
      });
      hasAnomaly = true;
    }

    // 2. Währung & Umsatz
    const currency = sanitizeCurrency(rec.umsatz_brutto ?? '');
    if (!currency) {
      anomalies.push({
        recordIndex: idx,
        field: 'umsatz_brutto',
        errorType: 'SCHEMA_DRIFT_INVALID_TYPE',
        message: 'Umsatzwert konnte nicht in Fließkommazahl konvertiert werden (NULL/NaN)',
        rawValue: rec.umsatz_brutto
      });
      hasAnomaly = true;
    } else if (currency.brutto < 0) {
      anomalies.push({
        recordIndex: idx,
        field: 'umsatz_brutto',
        errorType: 'BUSINESS_LOGIC_VIOLATION',
        message: 'Negativer Bruttoumsatz im Buchungsfeed unzulässig (Gutschrift ohne Stornokennzeichen)',
        rawValue: rec.umsatz_brutto
      });
      hasAnomaly = true;
    }

    // 3. Datum
    const isoDate = normalizeDateToIso(rec.datum ?? '');
    if (!isoDate) {
      anomalies.push({
        recordIndex: idx,
        field: 'datum',
        errorType: 'INVALID_DATE_FORMAT',
        message: 'Datum entspricht keinem bekannten Format (ISO / DD.MM.YYYY)',
        rawValue: rec.datum
      });
      hasAnomaly = true;
    }

    // Wenn keine schwerwiegende Anomalie vorliegt: Erfolgreich transformiert
    if (!hasAnomaly && currency && isoDate) {
      validRecords.push({
        id: idNum,
        customer_name: String(rec.kunde || '').trim(),
        revenue_netto: currency.netto,
        vat_amount: currency.vat,
        iso_date: isoDate,
        country_code: normalizeCountryCode(rec.land)
      });
    }
  });

  const lineageGraph = [
    { stage: '1. Extract (Quelle)', recordCount: extractedCount, description: 'Heterogene Rohdaten aus CSV & REST-Endpoint' },
    { stage: '2. Validate (Schema-Check)', recordCount: extractedCount, description: `${anomalies.length} Schema-Drifts / Format-Anomalien erkannt` },
    { stage: '3. Transform (Cleanse & Cast)', recordCount: validRecords.length, description: 'Trim Strings, ISO-8601 Konvertierung, Netto/USt-Berechnung' },
    { stage: '4. Load (Target DWH)', recordCount: validRecords.length, description: 'Star-Schema Faktentabelle fact_sales_dwh geladen' }
  ];

  return {
    extractedCount,
    transformedCount: validRecords.length,
    rejectedCount: extractedCount - validRecords.length,
    validRecords,
    anomalies,
    lineageGraph
  };
}
