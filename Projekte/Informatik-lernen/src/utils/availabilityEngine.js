// @ts-check
// Verfügbarkeitsrechnung für Hochverfügbarkeits-Architekturen (IHK-Prüfungsthema).
// Verfügbarkeit wird in Prozent angegeben (z. B. 99.9). Ein Jahr hat 365 Tage = 525.600 Minuten.

export const MINUTES_PER_YEAR = 365 * 24 * 60;

/**
 * Erlaubte Ausfallzeit pro Jahr in Minuten.
 * @param {number} availabilityPercent Verfügbarkeit in Prozent (0 bis 100)
 * @returns {number}
 */
export function downtimeMinutesPerYear(availabilityPercent) {
  const a = Number(availabilityPercent);
  if (!Number.isFinite(a) || a < 0 || a > 100) return NaN;
  return ((100 - a) / 100) * MINUTES_PER_YEAR;
}

/**
 * Erlaubte Ausfallzeit pro Monat (Durchschnitt, 1/12 Jahr) in Minuten.
 * @param {number} availabilityPercent
 * @returns {number}
 */
export function downtimeMinutesPerMonth(availabilityPercent) {
  return downtimeMinutesPerYear(availabilityPercent) / 12;
}

/**
 * Formatiert Minuten als lesbaren Text, z. B. "8 Std. 45 Min." oder "5,3 Min.".
 * @param {number} minutes
 * @returns {string}
 */
export function formatDowntime(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return '–';
  if (minutes < 1) return `${(minutes * 60).toFixed(1).replace('.', ',')} Sek.`;
  if (minutes < 60) return `${minutes.toFixed(1).replace('.', ',')} Min.`;
  if (minutes < 60 * 24) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes - h * 60);
    return m === 60 ? `${h + 1} Std. 0 Min.` : `${h} Std. ${m} Min.`;
  }
  const d = Math.floor(minutes / (60 * 24));
  const h = Math.round((minutes - d * 24 * 60) / 60);
  return h === 24 ? `${d + 1} Tage 0 Std.` : `${d} Tage ${h} Std.`;
}

/**
 * Reihenschaltung: Das System läuft nur, wenn ALLE Komponenten laufen. A = A1 · A2 · ...
 * @param {number[]} availabilitiesPercent
 * @returns {number} Gesamtverfügbarkeit in Prozent
 */
export function serialAvailability(availabilitiesPercent) {
  if (!Array.isArray(availabilitiesPercent) || availabilitiesPercent.length === 0) return NaN;
  let product = 1;
  for (const p of availabilitiesPercent) {
    const a = Number(p);
    if (!Number.isFinite(a) || a < 0 || a > 100) return NaN;
    product *= a / 100;
  }
  return product * 100;
}

/**
 * Parallelschaltung (Redundanz): Das System läuft, wenn MINDESTENS EINE Komponente läuft.
 * A = 1 − (1 − A1) · (1 − A2) · ...
 * @param {number[]} availabilitiesPercent
 * @returns {number} Gesamtverfügbarkeit in Prozent
 */
export function parallelAvailability(availabilitiesPercent) {
  if (!Array.isArray(availabilitiesPercent) || availabilitiesPercent.length === 0) return NaN;
  let failProduct = 1;
  for (const p of availabilitiesPercent) {
    const a = Number(p);
    if (!Number.isFinite(a) || a < 0 || a > 100) return NaN;
    failProduct *= 1 - a / 100;
  }
  return (1 - failProduct) * 100;
}

/**
 * Gängige Verfügbarkeitsklassen ("Neunen") mit Ausfallzeit pro Jahr.
 * @returns {{ percent: number, label: string, minutesPerYear: number }[]}
 */
export function availabilityClasses() {
  return [99, 99.9, 99.95, 99.99, 99.999].map((percent) => ({
    percent,
    label: `${String(percent).replace('.', ',')} %`,
    minutesPerYear: downtimeMinutesPerYear(percent)
  }));
}
