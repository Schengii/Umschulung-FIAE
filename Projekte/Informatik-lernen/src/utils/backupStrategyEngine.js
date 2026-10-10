// @ts-check
/**
 * Backup-Strategien & Disaster-Recovery Engine
 * Covers:
 * - Full vs. Differential vs. Incremental Backup storage & restore time
 * - Grandfather-Father-Son (Großvater-Vater-Sohn) rotation tape/disk estimation
 * - RTO (Recovery Time Objective) and RPO (Recovery Point Objective) Financial Loss Calculator
 * - 3-2-1-1-0 Ransomware-Resilience Compliance Audit
 * @module backupStrategyEngine
 */

/**
 * @typedef {{
 *   totalStorageGb: number;
 *   dailyStorages: number[];
 *   restoreStepsCount: number;
 *   restoreDescription: string;
 * }} BackupMethodComparison
 */

/**
 * Calculates storage requirements and restore complexity for 1 week (Full on Sunday + 6 days)
 * @param {number} baseDataGb Base data size in GB
 * @param {number} dailyChangeRate Daily delta percentage (e.g. 0.05 for 5%)
 * @param {number} [compressionFactor=0.7] (e.g. 0.7 = 30% compression saving)
 * @returns {{
 *   full: BackupMethodComparison;
 *   differential: BackupMethodComparison;
 *   incremental: BackupMethodComparison;
 * }}
 */
export function calculateBackupStorage(baseDataGb, dailyChangeRate, compressionFactor = 0.7) {
  const compressedBase = baseDataGb * compressionFactor;
  const dailyDeltaGb = baseDataGb * dailyChangeRate * compressionFactor;

  // 1. Full Backup every day (7 fulls)
  const fullDaily = Array(7).fill(compressedBase);
  const fullTotal = fullDaily.reduce((a, b) => a + b, 0);

  // 2. Differential (Sunday full, Mon-Sat cumulative deltas: 1x, 2x, 3x, 4x, 5x, 6x delta)
  const diffDaily = [
    compressedBase,
    dailyDeltaGb * 1,
    dailyDeltaGb * 2,
    dailyDeltaGb * 3,
    dailyDeltaGb * 4,
    dailyDeltaGb * 5,
    dailyDeltaGb * 6
  ];
  const diffTotal = diffDaily.reduce((a, b) => a + b, 0);

  // 3. Incremental (Sunday full, Mon-Sat 1x delta each)
  const incDaily = [
    compressedBase,
    dailyDeltaGb,
    dailyDeltaGb,
    dailyDeltaGb,
    dailyDeltaGb,
    dailyDeltaGb,
    dailyDeltaGb
  ];
  const incTotal = incDaily.reduce((a, b) => a + b, 0);

  return {
    full: {
      totalStorageGb: Math.round(fullTotal * 100) / 100,
      dailyStorages: fullDaily.map((v) => Math.round(v * 10) / 10),
      restoreStepsCount: 1,
      restoreDescription: 'Schnellster Restore: Nur die letzte Vollsicherung muss eingespielt werden.'
    },
    differential: {
      totalStorageGb: Math.round(diffTotal * 100) / 100,
      dailyStorages: diffDaily.map((v) => Math.round(v * 10) / 10),
      restoreStepsCount: 2,
      restoreDescription: 'Ausgewogener Restore: Letzte Vollsicherung + genau EINE letzte differentielle Sicherung.'
    },
    incremental: {
      totalStorageGb: Math.round(incTotal * 100) / 100,
      dailyStorages: incDaily.map((v) => Math.round(v * 10) / 10),
      restoreStepsCount: 7,
      restoreDescription: 'Komplexester Restore: Vollsicherung + ALLE inkrementellen Zwischensicherungen in exakter Reihenfolge.'
    }
  };
}

/**
 * Calculates tape/media requirement for Grandfather-Father-Son (Großvater-Vater-Sohn) rotation
 * Son: 4 daily tapes (Mon-Thu)
 * Father: 4 weekly tapes (Fri 1-4)
 * Grandfather: 12 monthly tapes (Jan-Dec)
 * @param {number} [_baseDataGb]
 * @param {number} [_mediaCapacityGb=12000] (e.g. LTO-8 = 12000 GB native)
 * @returns {{
 *   totalMediaCount: number;
 *   sonMediaCount: number;
 *   fatherMediaCount: number;
 *   grandfatherMediaCount: number;
 *   annualMediaCostEur: number;
 * }}
 */
export function calculateGfsRotation(_baseDataGb = 1000, _mediaCapacityGb = 12000) {
  const sonCount = 4; // Mo, Di, Mi, Do
  const fatherCount = 4; // 4 Wochen eines Monats
  const grandfatherCount = 12; // 12 Monate des Jahres
  const totalMediaCount = sonCount + fatherCount + grandfatherCount; // Standard: 20 Medien

  const estimatedTapePriceEur = 65; // Richtwert LTO Band
  const annualMediaCostEur = totalMediaCount * estimatedTapePriceEur;

  return {
    totalMediaCount,
    sonMediaCount: sonCount,
    fatherMediaCount: fatherCount,
    grandfatherMediaCount: grandfatherCount,
    annualMediaCostEur
  };
}

/**
 * Calculates Disaster-Recovery Outage Costs based on RTO and RPO
 * @param {number} rtoHours Recovery Time Objective (Dauer bis Systeme wieder laufen)
 * @param {number} rpoHours Recovery Point Objective (Maximaler tolerierter Datenverlust in Stunden)
 * @param {number} revenueLossPerHour Umsatzverlust / Stillstandskosten pro Stunde in €
 * @param {number} dataRecreationCostPerHour Kosten für manuelle Datennacherfassung pro verlorener Stunde in €
 * @returns {{
 *   downtimeCostEur: number;
 *   dataLossCostEur: number;
 *   totalIncidentCostEur: number;
 *   rtoRating: 'EXCELLENT' | 'GOOD' | 'CRITICAL';
 * }}
 */
export function calculateRtoRpoLoss(rtoHours, rpoHours, revenueLossPerHour = 5000, dataRecreationCostPerHour = 2500) {
  const downtimeCostEur = Math.round(rtoHours * revenueLossPerHour);
  const dataLossCostEur = Math.round(rpoHours * dataRecreationCostPerHour);
  const totalIncidentCostEur = downtimeCostEur + dataLossCostEur;

  let rtoRating = 'GOOD';
  if (rtoHours <= 1) {
    rtoRating = 'EXCELLENT';
  } else if (rtoHours > 8) {
    rtoRating = 'CRITICAL';
  }

  return {
    downtimeCostEur,
    dataLossCostEur,
    totalIncidentCostEur,
    rtoRating: /** @type {'EXCELLENT' | 'GOOD' | 'CRITICAL'} */ (rtoRating)
  };
}

/**
 * Audits a company backup plan against the modern 3-2-1-1-0 Ransomware-Resilient rule
 * @param {{
 *   copiesCount: number;
 *   differentMedia: boolean;
 *   offsiteLocation: boolean;
 *   airGappedImmutable: boolean;
 *   automatedVerificationTests: boolean;
 * }} answers
 * @returns {{
 *   scorePercent: number;
 *   isCompliant: boolean;
 *   checklist: Array<{ rule: string; passed: boolean; tip: string }>;
 * }}
 */
export function audit321Rule(answers) {
  const checklist = [
    {
      rule: '3 Kopien aller geschäftskritischen Daten',
      passed: answers.copiesCount >= 3,
      tip: '1 Produktions-Datensatz + mindestens 2 unabhängige Backup-Kopien vorhalten.'
    },
    {
      rule: '2 verschiedene Medientypen (z.B. NAS/NVMe + Tape/Cloud S3)',
      passed: Boolean(answers.differentMedia),
      tip: 'Schützt vor herstellerspezifischen Controller- und Firmware-Fehlern.'
    },
    {
      rule: '1 externe Kopie an geografisch getrenntem Standort (Offsite)',
      passed: Boolean(answers.offsiteLocation),
      tip: 'Schutz vor physischen Elementarschäden (Brandabschnitt, Überschwemmung, Diebstahl).'
    },
    {
      rule: '1 unveränderbare (Immutable / WORM) oder Air-Gapped Offline-Kopie',
      passed: Boolean(answers.airGappedImmutable),
      tip: 'Unabdingbarer Schutz gegen Ransomware, die im LAN Backup-Repositories verschlüsselt.'
    },
    {
      rule: '0 Wiederherstellungsfehler (Automatisierte Desaster-Restore-Tests)',
      passed: Boolean(answers.automatedVerificationTests),
      tip: 'Ein ungetestetes Backup ist kein Backup! Regelmäßige Probe-Wiederherstellung (SureBackup).'
    }
  ];

  const passedCount = checklist.filter((c) => c.passed).length;
  const scorePercent = Math.round((passedCount / checklist.length) * 100);

  return {
    scorePercent,
    isCompliant: scorePercent === 100,
    checklist
  };
}
