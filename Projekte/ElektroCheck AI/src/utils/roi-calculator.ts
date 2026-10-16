export interface RoiCalculatorInput {
  materialCost: number;       // Ersatzteil-/Materialkosten in Euro
  laborHours: number;         // Arbeitsaufwand in Stunden
  hourlyRate: number;         // Stundensatz der Elektrofachkraft in Euro/h
  replacementPrice: number;   // Neupreis / Wiederbeschaffungswert in Euro
  deviceAgeYears?: number;    // Alter des Geräts in Jahren
}

export type RoiRecommendation = 'DRINGEND_REPARIEREN' | 'WIRTSCHAFTLICH' | 'GRENZFALL' | 'NEUKAUF_EMPFOHLEN';

export interface RoiCalculatorResult {
  totalLaborCost: number;      // Gesamte Arbeitskosten in Euro
  totalRepairCost: number;     // Gesamte Reparaturkosten (Material + Arbeit) in Euro
  repairCostRatioPercent: number; // Reparaturquote in %
  savingsComparedToNew: number; // Ersparnis gegenüber Neukauf in Euro
  recommendation: RoiRecommendation;
  recommendationLabel: string;
  recommendationBadgeColor: string;
  details: string[];
}

export function calculateRoi(input: RoiCalculatorInput): RoiCalculatorResult {
  const totalLaborCost = input.laborHours * input.hourlyRate;
  const totalRepairCost = input.materialCost + totalLaborCost;

  const ratio = input.replacementPrice > 0 ? (totalRepairCost / input.replacementPrice) * 100 : 100;
  const savings = Math.max(0, input.replacementPrice - totalRepairCost);

  let recommendation: RoiRecommendation = 'WIRTSCHAFTLICH';
  let label = 'REPARATUR WIRTSCHAFTLICH';
  let badgeColor = '#0b8a5a'; // Success green

  if (ratio < 30) {
    recommendation = 'DRINGEND_REPARIEREN';
    label = 'REPARATUR DRINGEND EMPFOHLEN (Sehr hohe Ersparnis)';
    badgeColor = '#0b8a5a';
  } else if (ratio <= 50) {
    recommendation = 'WIRTSCHAFTLICH';
    label = 'REPARATUR WIRTSCHAFTLICH (Ersparnis gegeben)';
    badgeColor = '#0284c7';
  } else if (ratio <= 75) {
    recommendation = 'GRENZFALL';
    label = 'GRENZFALL (Abwägung nach Gerätealter & Zustand)';
    badgeColor = '#d97706'; // Warning orange
  } else {
    recommendation = 'NEUKAUF_EMPFOHLEN';
    label = 'NEUKAUF EMPFOHLEN (Reparatur unwirtschaftlich)';
    badgeColor = '#dc2626'; // Danger red
  }

  const details: string[] = [];
  details.push(`Materialkosten: ${input.materialCost.toFixed(2)} €`);
  details.push(`Arbeitslohn (${input.laborHours} h @ ${input.hourlyRate} €/h): ${totalLaborCost.toFixed(2)} €`);
  details.push(`Gesamte Reparaturkosten: ${totalRepairCost.toFixed(2)} €`);
  details.push(`Wiederbeschaffungswert (Neupreis): ${input.replacementPrice.toFixed(2)} €`);
  details.push(`Reparaturquote: ${ratio.toFixed(1)}% des Neupreises`);
  if (savings > 0) {
    details.push(`Ersparnis durch Reparatur: ${savings.toFixed(2)} €`);
  }

  return {
    totalLaborCost: parseFloat(totalLaborCost.toFixed(2)),
    totalRepairCost: parseFloat(totalRepairCost.toFixed(2)),
    repairCostRatioPercent: parseFloat(ratio.toFixed(1)),
    savingsComparedToNew: parseFloat(savings.toFixed(2)),
    recommendation,
    recommendationLabel: label,
    recommendationBadgeColor: badgeColor,
    details,
  };
}
