/**
 * Kabel- und Leitungsdimensionierung nach DIN VDE 0298-4
 * Tabellenwerte für Strombelastbarkeit Iz, Verlegearten und Umrechnungsfaktoren
 */

export type InstallationMethod = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E';

export interface CableSizingInput {
  currentInA: number; // Bemessungsstrom des Schutzorgans (In)
  installationMethod: InstallationMethod;
  loadedCores: 2 | 3; // 2 (Wechselstrom) oder 3 (Drehstrom)
  ambientTempC: number; // Umgebungstemperatur in °C (Referenz: 30°C für Luft)
  groupingCount: number; // Anzahl der gehäuften Kabel/Stromkreise
  conductorMaterial: 'Cu' | 'Al';
  lengthMeters: number;
  cosPhi?: number;
  maxVoltageDropPct?: number; // Standard: 3.0 % nach VDE
}

export interface CableSizingResult {
  minCrossSectionMm2: number;
  izBaseA: number;
  izCorrectedA: number;
  tempCorrectionFactor: number;
  groupingCorrectionFactor: number;
  totalCorrectionFactor: number;
  requiredIzA: number;
  voltageDropV: number;
  voltageDropPct: number;
  voltageDropPassed: boolean;
  recommendedCrossSectionMm2: number;
  reason: string;
}

// Basis-Strombelastbarkeit Iz für PVC-isolierte Kupferleitungen (z.B. NYM) bei 30°C Umgebungstemperatur (DIN VDE 0298-4 Tabelle 3 & 4)
const BASE_AMPACITY_CU: Record<number, Record<InstallationMethod, { two: number; three: number }>> = {
  1.5: {
    A1: { two: 15.5, three: 14.5 },
    A2: { two: 15.0, three: 14.0 },
    B1: { two: 18.5, three: 17.5 },
    B2: { two: 17.5, three: 16.5 },
    C:  { two: 22.0, three: 19.5 },
    E:  { two: 24.0, three: 22.0 },
  },
  2.5: {
    A1: { two: 19.5, three: 18.0 },
    A2: { two: 18.5, three: 17.5 },
    B1: { two: 25.0, three: 23.0 },
    B2: { two: 24.0, three: 21.0 },
    C:  { two: 30.0, three: 27.0 },
    E:  { two: 33.0, three: 30.0 },
  },
  4: {
    A1: { two: 26.0, three: 24.0 },
    A2: { two: 25.0, three: 23.0 },
    B1: { two: 34.0, three: 30.0 },
    B2: { two: 32.0, three: 28.0 },
    C:  { two: 40.0, three: 36.0 },
    E:  { two: 45.0, three: 40.0 },
  },
  6: {
    A1: { two: 33.0, three: 31.0 },
    A2: { two: 32.0, three: 29.0 },
    B1: { two: 43.0, three: 38.0 },
    B2: { two: 41.0, three: 36.0 },
    C:  { two: 51.0, three: 46.0 },
    E:  { two: 58.0, three: 52.0 },
  },
  10: {
    A1: { two: 46.0, three: 42.0 },
    A2: { two: 44.0, three: 39.0 },
    B1: { two: 60.0, three: 54.0 },
    B2: { two: 57.0, three: 50.0 },
    C:  { two: 70.0, three: 63.0 },
    E:  { two: 80.0, three: 71.0 },
  },
  16: {
    A1: { two: 61.0, three: 56.0 },
    A2: { two: 58.0, three: 53.0 },
    B1: { two: 80.0, three: 71.0 },
    B2: { two: 76.0, three: 66.0 },
    C:  { two: 94.0, three: 85.0 },
    E:  { two: 107.0, three: 96.0 },
  },
  25: {
    A1: { two: 80.0, three: 73.0 },
    A2: { two: 77.0, three: 69.0 },
    B1: { two: 101.0, three: 90.0 },
    B2: { two: 96.0, three: 84.0 },
    C:  { two: 119.0, three: 107.0 },
    E:  { two: 138.0, three: 123.0 },
  },
  35: {
    A1: { two: 99.0, three: 89.0 },
    A2: { two: 95.0, three: 85.0 },
    B1: { two: 126.0, three: 110.0 },
    B2: { two: 119.0, three: 104.0 },
    C:  { two: 148.0, three: 131.0 },
    E:  { two: 171.0, three: 153.0 },
  },
  50: {
    A1: { two: 119.0, three: 108.0 },
    A2: { two: 114.0, three: 102.0 },
    B1: { two: 153.0, three: 134.0 },
    B2: { two: 144.0, three: 125.0 },
    C:  { two: 180.0, three: 159.0 },
    E:  { two: 209.0, three: 186.0 },
  },
};

const STANDARD_CROSS_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];

// Umrechnungsfaktor f_T für abweichende Umgebungstemperaturen bei PVC (DIN VDE 0298-4 Tabelle 17)
function getTemperatureCorrectionFactor(tempC: number): number {
  if (tempC <= 10) return 1.22;
  if (tempC <= 15) return 1.17;
  if (tempC <= 20) return 1.12;
  if (tempC <= 25) return 1.06;
  if (tempC <= 30) return 1.00;
  if (tempC <= 35) return 0.94;
  if (tempC <= 40) return 0.87;
  if (tempC <= 45) return 0.79;
  if (tempC <= 50) return 0.71;
  if (tempC <= 55) return 0.61;
  if (tempC <= 60) return 0.50;
  return 0.35;
}

// Umrechnungsfaktor f_H für Häufung nach DIN VDE 0298-4 Tabelle 21 (z.B. gebündelt auf Wand, im Rohr oder Kanal)
function getGroupingCorrectionFactor(count: number): number {
  if (count <= 1) return 1.00;
  if (count === 2) return 0.80;
  if (count === 3) return 0.70;
  if (count === 4) return 0.65;
  if (count === 5) return 0.60;
  if (count === 6) return 0.57;
  if (count === 7) return 0.54;
  if (count === 8) return 0.52;
  if (count <= 11) return 0.50;
  if (count <= 15) return 0.45;
  return 0.40;
}

/**
 * Dimensioniert eine Leitung nach DIN VDE 0298-4 und DIN VDE 0100-520
 */
export function calculateCableSizing(input: CableSizingInput): CableSizingResult {
  const fT = getTemperatureCorrectionFactor(input.ambientTempC);
  const fH = getGroupingCorrectionFactor(input.groupingCount);
  const fTotal = fT * fH;

  // Erforderliche Belastbarkeit nach DIN VDE: Iz >= In / (fT * fH)
  const requiredIz = input.currentInA / fTotal;

  // Suche kleinsten Querschnitt bezüglich Strombelastbarkeit Iz
  let selectedSectionMm2 = STANDARD_CROSS_SECTIONS[STANDARD_CROSS_SECTIONS.length - 1];
  let foundBaseIz = 0;
  let foundCorrectedIz = 0;

  for (const cs of STANDARD_CROSS_SECTIONS) {
    const table = BASE_AMPACITY_CU[cs];
    if (!table) continue;
    const methodData = table[input.installationMethod];
    if (!methodData) continue;

    const baseIz = input.loadedCores === 2 ? methodData.two : methodData.three;
    const correctedIz = baseIz * fTotal;

    if (correctedIz >= input.currentInA) {
      selectedSectionMm2 = cs;
      foundBaseIz = baseIz;
      foundCorrectedIz = correctedIz;
      break;
    }
  }

  // Nun Spannungsfall für diesen und ggf. höhere Querschnitte prüfen
  const kappa = input.conductorMaterial === 'Cu' ? 56 : 34;
  const cosPhi = input.cosPhi || 1.0;
  const maxDeltaPct = input.maxVoltageDropPct || 3.0;
  const nominalVoltage = input.loadedCores === 2 ? 230 : 400;

  let finalSectionMm2 = selectedSectionMm2;
  let deltaU = 0;
  let deltaPct = 0;
  let voltagePassed = false;

  for (let i = STANDARD_CROSS_SECTIONS.indexOf(selectedSectionMm2); i < STANDARD_CROSS_SECTIONS.length; i++) {
    const currentCs = STANDARD_CROSS_SECTIONS[i];
    if (input.loadedCores === 2) {
      deltaU = (2 * input.lengthMeters * input.currentInA * cosPhi) / (kappa * currentCs);
    } else {
      deltaU = (Math.sqrt(3) * input.lengthMeters * input.currentInA * cosPhi) / (kappa * currentCs);
    }
    deltaPct = (deltaU / nominalVoltage) * 100;

    if (deltaPct <= maxDeltaPct) {
      finalSectionMm2 = currentCs;
      voltagePassed = true;
      break;
    }
  }

  const reason = finalSectionMm2 > selectedSectionMm2
    ? `Querschnitt von ${selectedSectionMm2} mm² auf ${finalSectionMm2} mm² erhöht wegen Spannungsfall (${deltaPct.toFixed(2)}% > ${maxDeltaPct}%).`
    : `Querschnitt ${finalSectionMm2} mm² erfüllt Strombelastbarkeit (Iz=${foundCorrectedIz.toFixed(1)}A >= ${input.currentInA}A) und Spannungsfall (${deltaPct.toFixed(2)}% <= ${maxDeltaPct}%).`;

  return {
    minCrossSectionMm2: selectedSectionMm2,
    izBaseA: foundBaseIz,
    izCorrectedA: Math.round(foundCorrectedIz * 10) / 10,
    tempCorrectionFactor: Math.round(fT * 100) / 100,
    groupingCorrectionFactor: Math.round(fH * 100) / 100,
    totalCorrectionFactor: Math.round(fTotal * 100) / 100,
    requiredIzA: Math.round(requiredIz * 10) / 10,
    voltageDropV: Math.round(deltaU * 100) / 100,
    voltageDropPct: Math.round(deltaPct * 100) / 100,
    voltageDropPassed: voltagePassed,
    recommendedCrossSectionMm2: finalSectionMm2,
    reason,
  };
}
