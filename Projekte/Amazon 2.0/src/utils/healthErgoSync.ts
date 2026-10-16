// ============================================================
// Amazon 2.0 – Biometric Health & Ergonomics Sync Engine
// ============================================================

export interface HealthErgoMetrics {
  screenTimeHours: number;
  postureScorePercent: number;
  blueLightExposureHours: number;
  heartRateAvgBpm: number;
  sleepDurationHours: number;
  overallErgoScore: number;
  ergoGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

export interface ErgoRecommendation {
  id: string;
  category: 'spine' | 'vision' | 'wrist' | 'sleep';
  title: string;
  reason: string;
  productSuggestion: string;
  priceEur: number;
  discountPercent: number;
}

export function getSimulatedHealthMetrics(): HealthErgoMetrics {
  return {
    screenTimeHours: 8.2,
    postureScorePercent: 62,
    blueLightExposureHours: 6.8,
    heartRateAvgBpm: 72,
    sleepDurationHours: 6.5,
    overallErgoScore: 68,
    ergoGrade: 'C',
  };
}

export const ERGO_RECOMMENDATIONS: ErgoRecommendation[] = [
  {
    id: 'rec-spine-1',
    category: 'spine',
    title: 'Haltungs-Optimierung & Wirbelsäulen-Entlastung',
    reason: '62% Haltungsscore erkannt (hohe Belastung der Lendenwirbel beim Sitzen).',
    productSuggestion: 'Ergonomische Memory-Foam Lumbalstütze & Keilkissen',
    priceEur: 39.99,
    discountPercent: 15,
  },
  {
    id: 'rec-vision-1',
    category: 'vision',
    title: 'Augen-Entlastung & Blaulichtfilter',
    reason: '8,2h tägliche Bildschirmzeit erkannt. Reduziert Augenmüdigkeit um 85%.',
    productSuggestion: 'Anti-Blue-Light Gaming- & Office-Brille mit UV400-Filter',
    priceEur: 29.95,
    discountPercent: 20,
  },
  {
    id: 'rec-wrist-1',
    category: 'wrist',
    title: 'Karpaltunnel-Prävention für Handgelenke',
    reason: 'Repetitive Klick- und Tippbewegungen ohne neutrale 57°-Pronation.',
    productSuggestion: 'Logitech MX Vertical Ergonomische Funkmaus',
    priceEur: 84.90,
    discountPercent: 12,
  },
];
