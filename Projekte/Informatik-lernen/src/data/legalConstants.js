// @ts-check
/**
 * Zentrale Stichtagswerte (Gesetze, Beitragssätze, Zinssätze), die sich regelmäßig ändern.
 * Einmal jährlich (Januar) prüfen: BBG und Zusatzbeitrag bei Bundesregierung/GKV-Spitzenverband,
 * Basiszinssatz halbjährlich bei der Deutschen Bundesbank. `legalConstants.test.js` warnt,
 * wenn `LEGAL_CONSTANTS_STAND` älter als 13 Monate ist.
 */

/** Stand der Werte (ISO-Datum, Monat der letzten Prüfung). */
export const LEGAL_CONSTANTS_STAND = '2026-11-27';

/** Sozialversicherung 2026 (Quellen: Bundesregierung, TK, vdek). */
export const SOCIAL_INSURANCE_2026 = {
  /** Beitragsbemessungsgrenze KV/PV, Euro pro Monat. */
  bbgHealthCareMonthly: 5812.5,
  /** Beitragsbemessungsgrenze RV/AV (bundeseinheitlich), Euro pro Monat. */
  bbgPensionMonthly: 8450,
  /** Durchschnittlicher Zusatzbeitrag KV (Gesamt, je 50 % AN/AG). */
  healthAdditionalAvg: 0.029,
  /** Pflegeversicherung Gesamtsatz (je 50 % AN/AG), seit 01.01.2025. */
  careTotal: 0.036,
  /** Kinderlosenzuschlag Pflegeversicherung (nur Arbeitnehmer). */
  careChildlessSurcharge: 0.006
};

/**
 * Beispiel-Basiszinssatz in Prozent für Lehrbeispiele (§ 247 BGB).
 * Kein aktueller Wert: Der Basiszins ändert sich zum 1.1. und 1.7. jedes Jahres.
 */
export const BASISZINSSATZ_BEISPIEL_PERCENT = 3.62;
