export type RiskSeverity = 1 | 2 | 3 | 4 | 5;    // 1: Gering ... 5: Katastrophal
export type RiskProbability = 1 | 2 | 3 | 4 | 5; // 1: Sehr selten ... 5: Sehr hoch

export type RiskLevel = 'GERING' | 'MITTEL' | 'HOCH' | 'KRITISCH';

export interface SafetyRuleCheck {
  id: string;
  name: string;
  applied: boolean;
}

export interface GbuInputData {
  activityName: string;            // Z.B. "Arbeiten im Freischaltzustand an 400V Schaltschrank"
  initialSeverity: RiskSeverity;
  initialProbability: RiskProbability;
  rules5SafetyApplied: SafetyRuleCheck[];
  personalProtectionEquipment: string[]; // Z.B. ["Isolierte Handschuhe 1000V", "Gesichtsschutzschirm gegen Störlichtbogen"]
}

export interface GbuEvaluationResult {
  initialRiskScore: number;         // 1..25
  initialRiskLevel: RiskLevel;
  initialRiskColor: string;
  residualSeverity: RiskSeverity;
  residualProbability: RiskProbability;
  residualRiskScore: number;        // 1..25
  residualRiskLevel: RiskLevel;
  residualRiskColor: string;
  isAcceptable: boolean;
  recommendations: string[];
}

export const DEFAULT_5_SAFETY_RULES: SafetyRuleCheck[] = [
  { id: '1', name: '1. Freischalten (Spannungsfreiheit herstellen)', applied: true },
  { id: '2', name: '2. Gegen Wiedereinschalten sichern (Schloss/Schild)', applied: true },
  { id: '3', name: '3. Spannungsfreiheit allpolig feststellen (zweipolig messen)', applied: true },
  { id: '4', name: '4. Erden und Kurzschließen (ab 1kV Pflicht)', applied: false },
  { id: '5', name: '5. Benachbarte, unter Spannung stehende Teile abdecken', applied: true },
];

export function getRiskLevel(score: number): { level: RiskLevel; color: string } {
  if (score <= 4) return { level: 'GERING', color: '#0b8a5a' };
  if (score <= 9) return { level: 'MITTEL', color: '#d97706' };
  if (score <= 16) return { level: 'HOCH', color: '#ea580c' };
  return { level: 'KRITISCH', color: '#dc2626' };
}

export function evaluateGbu(input: GbuInputData): GbuEvaluationResult {
  const initialScore = input.initialSeverity * input.initialProbability;
  const initialRes = getRiskLevel(initialScore);

  // Reduktion der Eintrittswahrscheinlichkeit durch Schutzmaßnahmen
  const appliedCount = input.rules5SafetyApplied.filter((r) => r.applied).length;
  const pReduction = Math.min(3, Math.floor(appliedCount / 2));
  
  const residualP = Math.max(1, input.initialProbability - pReduction) as RiskProbability;
  const residualS = Math.max(1, input.initialSeverity - (input.personalProtectionEquipment.length > 0 ? 1 : 0)) as RiskSeverity;

  const residualScore = residualS * residualP;
  const residualRes = getRiskLevel(residualScore);

  const recommendations: string[] = [];
  if (!input.rules5SafetyApplied.find((r) => r.id === '3')?.applied) {
    recommendations.push('Dringend: Spannungsfreiheit vor Arbeitsbeginn zweipolig feststellen!');
  }
  if (input.personalProtectionEquipment.length === 0) {
    recommendations.push('Persönliche Schutzausrüstung (PSA) für Elektrofachkräfte tragen!');
  }

  return {
    initialRiskScore: initialScore,
    initialRiskLevel: initialRes.level,
    initialRiskColor: initialRes.color,
    residualSeverity: residualS,
    residualProbability: residualP,
    residualRiskScore: residualScore,
    residualRiskLevel: residualRes.level,
    residualRiskColor: residualRes.color,
    isAcceptable: residualScore <= 6,
    recommendations,
  };
}
