// ============================================================
// Amazon 2.0 – Digital Olfaction & Scent Protocol Engine
// ============================================================

export interface ScentPyramid {
  scentTitle: string;
  fragranceFamily: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  intensityScorePercent: number;
  sillageRating: 'Dezent' | 'Moderat' | 'Intensiv & Langanhaltend';
  diffuserPaired: boolean;
}

export function getScentPyramid(): ScentPyramid {
  return {
    scentTitle: 'Bleu Intense – Eau de Parfum Mystique',
    fragranceFamily: 'Woody Aromatic & Citrus Fresh',
    topNotes: ['Kalabrische Bergamotte', 'Pfefferminze', 'Rosa Pfeffer'],
    heartNotes: ['Zedernholz', 'Muskatnuss', 'Jasminblüte', 'Ingwer'],
    baseNotes: ['Weißer Moschus', 'Sandelholz', 'Ambra', 'Vetiver'],
    intensityScorePercent: 88,
    sillageRating: 'Intensiv & Langanhaltend',
    diffuserPaired: true,
  };
}
