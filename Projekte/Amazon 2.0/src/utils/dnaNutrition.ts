// ============================================================
// Amazon 2.0 – DNA & Biomarker Nutrition Configurator Engine
// ============================================================

export interface DNABiomarkerReport {
  reportId: string;
  vitaminD3Status: string;
  omega3IndexPercent: number;
  caffeineMetabolism: 'Schneller Abbau' | 'Langsamer Abbau';
  customFormulaTitle: string;
  ingredients: { name: string; dosage: string; purpose: string }[];
  priceEur: number;
}

export function getSimulatedDNAReport(): DNABiomarkerReport {
  return {
    reportId: 'DNA-GENOME-#9918-BIO',
    vitaminD3Status: 'Suboptimal (22 ng/ml - Bedarf: +4.000 I.E.)',
    omega3IndexPercent: 4.8, // Low
    caffeineMetabolism: 'Langsamer Abbau',
    customFormulaTitle: 'Personalisiertes DNA-Longevity & Energy Bundle',
    ingredients: [
      { name: 'Liposomales Vitamin D3 + K2 (MK7)', dosage: '4.000 I.E. / Tag', purpose: 'Optimiert Zellstoffwechsel & Knochendichte' },
      { name: 'Wildfang Omega-3 Triglyceride (EPA/DHA)', dosage: '2.000 mg', purpose: 'Erhöht Omega-3 Index auf Zielwert > 8%' },
      { name: 'L-Theanin + Magnesiumbisglycinat', dosage: '400 mg', purpose: 'Glättet Koffein-Peaks & unterstützt Tiefschlaf' },
    ],
    priceEur: 49.90,
  };
}
