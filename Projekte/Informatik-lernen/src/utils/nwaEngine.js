/**
 * IHK Nutzwertanalyse (NWA / Scoring-Modell) Calculation Engine
 * Offizieller IHK-Standard für Entscheidungsbegründungen in Projektdokumentationen & AP1/AP2
 */

export const DEFAULT_NWA_CRITERIA = [
  { id: 'crit_costs', name: 'TCO & Anschaffungskosten (Budget)', weight: 25, isKo: true, minScore: 4 },
  { id: 'crit_security', name: 'IT-Sicherheit & DSGVO-Konformität', weight: 25, isKo: true, minScore: 6 },
  { id: 'crit_integration', name: 'Schnittstellen & Systemintegration', weight: 20, isKo: false, minScore: 0 },
  { id: 'crit_usability', name: 'Benutzerfreundlichkeit & Ergonomie', weight: 15, isKo: false, minScore: 0 },
  { id: 'crit_maintainability', name: 'Wartbarkeit, SLA & Vendor-Support', weight: 15, isKo: false, minScore: 0 }
];

export const DEFAULT_NWA_OPTIONS = [
  {
    id: 'opt_cloud_saas',
    name: 'Option A: Cloud SaaS Lösung (Managed)',
    description: 'Hochverfügbar, minimaler Wartungsaufwand, monatliche Subskriptionskosten.',
    scores: {
      crit_costs: 6,
      crit_security: 8,
      crit_integration: 9,
      crit_usability: 9,
      crit_maintainability: 9
    }
  },
  {
    id: 'opt_onprem_custom',
    name: 'Option B: On-Premise Eigenentwicklung',
    description: 'Volle Datenhoheit, individuelle Schnittstellen, hohe Initialkosten & Wartung.',
    scores: {
      crit_costs: 5,
      crit_security: 9,
      crit_integration: 8,
      crit_usability: 7,
      crit_maintainability: 6
    }
  },
  {
    id: 'opt_legacy_upgrade',
    name: 'Option C: Legacy System Upgrade',
    description: 'Geringste Anschaffungskosten, jedoch hohe technische Schulden & Sicherheitsrisiken.',
    scores: {
      crit_costs: 8,
      crit_security: 3, // Fällt bei K.O.-Kriterium (minScore 6) durch!
      crit_integration: 4,
      crit_usability: 4,
      crit_maintainability: 4
    }
  }
];

/**
 * Validiert und normalisiert Kriteriengewichte auf 100%
 */
export function normalizeWeights(criteria = []) {
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  if (totalWeight <= 0) return criteria.map(c => ({ ...c, normalizedWeight: 0 }));
  
  return criteria.map(c => ({
    ...c,
    normalizedWeight: Number(((Number(c.weight) / totalWeight) * 100).toFixed(2))
  }));
}

/**
 * Berechnet die Nutzwertanalyse inklusive K.O.-Kriterien Prüfung und Ranking
 */
export function calculateNwa({ criteria = DEFAULT_NWA_CRITERIA, options = DEFAULT_NWA_OPTIONS }) {
  const normalizedCriteria = normalizeWeights(criteria);
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const evaluatedOptions = options.map(opt => {
    let weightedScoreSum = 0;
    let maxPossibleScore = 0;
    const criterionDetails = [];
    const koViolations = [];

    normalizedCriteria.forEach(crit => {
      const rawScore = Number(opt.scores[crit.id] ?? 0);
      const weightFactor = crit.normalizedWeight / 100;
      const weightedScore = rawScore * weightFactor;

      weightedScoreSum += weightedScore;
      maxPossibleScore += 10 * weightFactor;

      // K.O. Prüfungslogik
      if (crit.isKo && rawScore < (crit.minScore || 1)) {
        koViolations.push({
          criterionId: crit.id,
          criterionName: crit.name,
          score: rawScore,
          required: crit.minScore
        });
      }

      criterionDetails.push({
        criterionId: crit.id,
        criterionName: crit.name,
        rawScore,
        weight: crit.weight,
        normalizedWeight: crit.normalizedWeight,
        weightedScore: Number(weightedScore.toFixed(2))
      });
    });

    const isDisqualified = koViolations.length > 0;
    const finalScore = Number(weightedScoreSum.toFixed(2));
    const utilityPercent = maxPossibleScore > 0 ? Math.round((finalScore / maxPossibleScore) * 100) : 0;

    return {
      id: opt.id,
      name: opt.name,
      description: opt.description,
      finalScore,
      utilityPercent,
      isDisqualified,
      koViolations,
      criterionDetails
    };
  });

  // Ranking ermitteln: Qualifizierte zuerst nach Score absteigend, Disqualifizierte ans Ende
  const rankedOptions = [...evaluatedOptions].sort((a, b) => {
    if (a.isDisqualified && !b.isDisqualified) return 1;
    if (!a.isDisqualified && b.isDisqualified) return -1;
    return b.finalScore - a.finalScore;
  });

  const bestOption = rankedOptions.find(o => !o.isDisqualified) || null;

  return {
    totalWeight,
    isWeightValid,
    criteria: normalizedCriteria,
    results: rankedOptions,
    bestOption
  };
}

/**
 * Erzeugt eine formelle IHK-konforme Markdown-Tabelle für den Projektbericht
 */
export function generateNwaMarkdownReport(analysisResult) {
  const { criteria, results, bestOption } = analysisResult;
  let md = `### IHK Entscheidungsmatrix: Nutzwertanalyse (NWA)\n\n`;
  md += `| Bewertungskriterium | Gew. (%) | K.O. Schwelle | ` + results.map(r => r.name).join(' | ') + ` |\n`;
  md += `| :--- | :---: | :---: | ` + results.map(() => ':---:').join(' | ') + ` |\n`;

  criteria.forEach(crit => {
    const koInfo = crit.isKo ? `Mind. ${crit.minScore} Pkt.` : '-';
    const rowValues = results.map(r => {
      const detail = r.criterionDetails.find(d => d.criterionId === crit.id);
      return `${detail?.rawScore ?? 0} Pkt. (${detail?.weightedScore ?? 0})`;
    });
    md += `| ${crit.name} | ${crit.weight}% | ${koInfo} | ` + rowValues.join(' | ') + ` |\n`;
  });

  md += `| **Gesamtergebnis (Nutzwert)** | **100%** | - | ` + results.map(r => `**${r.finalScore} Pkt. (${r.utilityPercent}%)**${r.isDisqualified ? ' *(K.O.)*' : ''}`).join(' | ') + ` |\n`;
  md += `| **Status / Eignung** | - | - | ` + results.map(r => r.isDisqualified ? '❌ Disqualifiziert (K.O.)' : (r.id === bestOption?.id ? '🏆 Empfehlung (Rang 1)' : 'Gerechnet')).join(' | ') + ` |\n\n`;

  if (bestOption) {
    md += `**Entscheidungsbegründung für das IHK-Fachgespräch:**\n`;
    md += `Auf Basis der quantitativen Nutzwertanalyse wurde **${bestOption.name}** mit einem Nutzwert von **${bestOption.finalScore} Punkten (${bestOption.utilityPercent}% Zielerreichung)** als wirtschaftlichste und technisch zukunftssicherste Lösung ausgewählt.\n`;
  }

  return md;
}
