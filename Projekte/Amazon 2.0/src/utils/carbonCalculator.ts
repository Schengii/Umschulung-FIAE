// ============================================================
// Amazon 2.0 – Automated Carbon Footprint & Offset Engine
// ============================================================
import type { Product } from '../types';

export interface CarbonBreakdown {
  totalKgCO2: number;
  manufacturingKg: number;
  packagingKg: number;
  logisticsKg: number;
  treesEquivalent: number;
  carKmEquivalent: number;
  offsetCostEur: number;
  ecoScoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

export interface OffsetProject {
  id: string;
  name: string;
  location: string;
  icon: string;
  description: string;
  certifiedStandard: string;
}

export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: 'proj-forest',
    name: 'Aufforstung & Mischwald-Schutz',
    location: 'Schwarzwald & Bayerischer Wald, DE',
    icon: '🌲',
    description: 'Pflanzung standortgerechter Laub- und Nadelbäume zur langfristigen CO₂-Bindung und Biodiversität.',
    certifiedStandard: 'Gold Standard & TÜV Nord',
  },
  {
    id: 'proj-ocean',
    name: 'Ocean Plastic Cleanup & Recycling',
    location: 'Südostasien & Mittelmeer',
    icon: '🌊',
    description: 'Bergung von Geisternetzen und Plastikmüll vor dem Eintritt in marine Ökosysteme.',
    certifiedStandard: 'Plastic Free Oceans Verified',
  },
  {
    id: 'proj-solar',
    name: 'Solar- und Windenergiepark',
    location: 'Andalusien, Spanien',
    icon: '☀️',
    description: 'Ersetzung fossiler Spitzenlastkraftwerke durch 100% saubere regenerative Sonnenenergie.',
    certifiedStandard: 'VCS (Verified Carbon Standard)',
  },
];

export function calculateProductCarbonFootprint(product: Product): CarbonBreakdown {
  let baseManufacturing = 12.5;

  if (product.category === 'computers') baseManufacturing = 38.0;
  else if (product.category === 'electronics') baseManufacturing = 18.2;
  else if (product.category === 'home' || product.category === 'kitchen') baseManufacturing = 14.0;
  else if (product.category === 'fashion') baseManufacturing = 7.5;
  else if (product.category === 'sports') baseManufacturing = 9.8;

  // Weight factor based on price / 50
  const weightFactor = Math.min(2.5, Math.max(0.6, product.price / 150));
  const manufacturingKg = +(baseManufacturing * weightFactor).toFixed(1);
  const packagingKg = 0.6;
  const logisticsKg = 1.2;

  const totalKgCO2 = +(manufacturingKg + packagingKg + logisticsKg).toFixed(1);
  const treesEquivalent = +(totalKgCO2 / 12.5).toFixed(1);
  const carKmEquivalent = Math.round(totalKgCO2 * 6.5);
  const offsetCostEur = Math.max(0.49, +(totalKgCO2 * 0.045).toFixed(2));

  let ecoScoreGrade: CarbonBreakdown['ecoScoreGrade'] = 'B';
  if (totalKgCO2 < 10) ecoScoreGrade = 'A+';
  else if (totalKgCO2 < 20) ecoScoreGrade = 'A';
  else if (totalKgCO2 < 40) ecoScoreGrade = 'B';
  else if (totalKgCO2 < 70) ecoScoreGrade = 'C';
  else ecoScoreGrade = 'D';

  return {
    totalKgCO2,
    manufacturingKg,
    packagingKg,
    logisticsKg,
    treesEquivalent,
    carKmEquivalent,
    offsetCostEur,
    ecoScoreGrade,
  };
}
