// @ts-check
/**
 * IHK Nutzwertanalyse (NWA) Sensitivitäts- & Monte-Carlo Stresstest Engine
 * DIN/VDI 2225 Standard for multi-criteria decision making in IHK IT-Projekten.
 */

/**
 * @typedef {Object} NwaCriterion
 * @property {string} id
 * @property {string} name
 * @property {number} weight (Gewichtung in %, Summe = 100)
 * @property {boolean} isKo (K.O.-Kriterium)
 * @property {number} koMinScore (Mindestpunktzahl falls isKo)
 */

/**
 * @typedef {Object} NwaOption
 * @property {string} id
 * @property {string} name
 * @property {Record<string, number>} scores (Punkte 1-10 pro Kriterium)
 */

/**
 * Standard-Kriterien für IHK Projektvergleich (z. B. Cloud vs. On-Prem vs. Hybrid)
 * @type {NwaCriterion[]}
 */
export const DEFAULT_NWA_CRITERIA = [
  { id: 'kosten', name: 'Investitions- & Betriebskosten (TCO)', weight: 30, isKo: false, koMinScore: 0 },
  { id: 'sicherheit', name: 'IT-Sicherheit & DSGVO-Konformität', weight: 25, isKo: true, koMinScore: 6 },
  { id: 'skalierbarkeit', name: 'Skalierbarkeit & Zukunftssicherheit', weight: 20, isKo: false, koMinScore: 0 },
  { id: 'wartbarkeit', name: 'Wartbarkeit & Know-how im Team', weight: 15, isKo: false, koMinScore: 0 },
  { id: 'vendor_lockin', name: 'Unabhängigkeit / Migrationsaufwand', weight: 10, isKo: false, koMinScore: 0 }
];

/**
 * Standard-Optionen
 * @type {NwaOption[]}
 */
export const DEFAULT_NWA_OPTIONS = [
  {
    id: 'saas_cloud',
    name: 'SaaS Cloud-Lösung (Public Cloud)',
    scores: {
      kosten: 8,
      sicherheit: 7,
      skalierbarkeit: 10,
      wartbarkeit: 9,
      vendor_lockin: 4
    }
  },
  {
    id: 'on_prem',
    name: 'On-Premises Dedicated Server',
    scores: {
      kosten: 5,
      sicherheit: 9,
      skalierbarkeit: 4,
      wartbarkeit: 6,
      vendor_lockin: 9
    }
  },
  {
    id: 'hybrid',
    name: 'Hybride Architektur (Edge + Private Cloud)',
    scores: {
      kosten: 6,
      sicherheit: 8,
      skalierbarkeit: 8,
      wartbarkeit: 7,
      vendor_lockin: 7
    }
  }
];

/**
 * Berechnet Standard-Nutzwert für alle Optionen
 * @param {NwaCriterion[]} criteria
 * @param {NwaOption[]} options
 */
export function calculateNwaScores(criteria, options) {
  return options.map(option => {
    let totalWeightedScore = 0;
    let koFailed = false;
    let koReason = '';

    for (const crit of criteria) {
      const score = option.scores[crit.id] ?? 0;
      totalWeightedScore += score * (crit.weight / 100);

      if (crit.isKo && score < crit.koMinScore) {
        koFailed = true;
        koReason = `K.O. Kriterium "${crit.name}" verfehlt (${score} < ${crit.koMinScore})`;
      }
    }

    return {
      id: option.id,
      name: option.name,
      totalWeightedScore: Number(totalWeightedScore.toFixed(2)),
      koFailed,
      koReason
    };
  }).sort((a, b) => {
    if (a.koFailed && !b.koFailed) return 1;
    if (!a.koFailed && b.koFailed) return -1;
    return b.totalWeightedScore - a.totalWeightedScore;
  });
}

/**
 * Führt einen Sensitivitäts- und Monte-Carlo-Stresstest durch
 * Variiert Kriterien-Gewichte mit normalverteiltem Rauschen zur Ermittlung der Robustheit der Gewinner-Option.
 * @param {NwaCriterion[]} criteria
 * @param {NwaOption[]} options
 * @param {number} iterations
 * @param {number} jitterPercent (z.B. 15%)
 */
export function runNwaMonteCarloStressTest(criteria, options, iterations = 500, jitterPercent = 20) {
  const winCounts = /** @type {Record<string, number>} */ ({});
  for (const opt of options) {
    winCounts[opt.id] = 0;
  }

  for (let i = 0; i < iterations; i++) {
    // Generate randomized weights while maintaining sum = 100
    const perturbedCriteria = criteria.map(c => {
      const factor = 1 + (Math.random() * 2 - 1) * (jitterPercent / 100);
      return {
        ...c,
        tempWeight: Math.max(1, c.weight * factor)
      };
    });

    const sumWeights = perturbedCriteria.reduce((acc, c) => acc + c.tempWeight, 0);
    const normalizedCriteria = perturbedCriteria.map(c => ({
      ...c,
      weight: (c.tempWeight / sumWeights) * 100
    }));

    const results = calculateNwaScores(normalizedCriteria, options);
    const validWinners = results.filter(r => !r.koFailed);
    if (validWinners.length > 0) {
      winCounts[validWinners[0].id] = (winCounts[validWinners[0].id] || 0) + 1;
    }
  }

  const baselineResults = calculateNwaScores(criteria, options);
  const baselineWinner = baselineResults.find(r => !r.koFailed);

  const robustnessPercentages = options.map(opt => ({
    id: opt.id,
    name: opt.name,
    winRatePercent: Number(((winCounts[opt.id] / iterations) * 100).toFixed(1))
  })).sort((a, b) => b.winRatePercent - a.winRatePercent);

  return {
    iterations,
    baselineWinner: baselineWinner?.name || 'Keiner (K.O.)',
    robustnessPercentages,
    isDecisionRobust: (robustnessPercentages[0]?.winRatePercent || 0) > 70
  };
}
