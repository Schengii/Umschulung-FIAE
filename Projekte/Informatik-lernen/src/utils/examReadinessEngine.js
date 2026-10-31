// @ts-check
/**
 * @file examReadinessEngine.js
 * Adaptiver IHK-Prüfungsbereitschafts- und Countdown-Planer
 */

/**
 * @typedef {object} ExamDomainScore
 * @property {string} domainKey - z.B. 'wiso', 'ap1', 'ap2_1', 'ap2_2', 'project'
 * @property {string} title
 * @property {number} weight - Prozentuale Gewichtung (z.B. 0.10, 0.20, 0.50)
 * @property {number} completedTasks - Anzahl absolvierter Übungen / Fragen
 * @property {number} requiredTasks - Soll-Mindestanzahl (z.B. 10)
 * @property {number} averageScore - Durchschnittlicher Erfolg (0-100%)
 */

/**
 * IHK-Regelbereiche und Gewichtungen nach Ausbildungsordnung 2020
 */
export const IHK_EXAM_DOMAINS = [
  { key: 'ap1', title: 'AP1: Einrichtung IT-gestützter Arbeitsplatz', weight: 0.20, requiredTasks: 15 },
  { key: 'ap2_1', title: 'AP2 Bereich 1: Planen & Konzipieren', weight: 0.10, requiredTasks: 15 },
  { key: 'ap2_2', title: 'AP2 Bereich 2: Fachaufgaben & Entwicklung/Netzwerk', weight: 0.10, requiredTasks: 15 },
  { key: 'wiso', title: 'AP2 WiSo: Wirtschafts- und Sozialkunde', weight: 0.10, requiredTasks: 20 },
  { key: 'project', title: 'Projektarbeit & Fachgespräch / MEP', weight: 0.50, requiredTasks: 10 }
];

/**
 * Berechnet verbleibende Tage bis zum nächsten IHK-Prüfungstermin
 * @param {Date} [currentDate]
 * @returns {{ daysRemaining: number, targetSeason: string, examDateStr: string }}
 */
export function calculateExamCountdown(currentDate = new Date()) {
  const year = currentDate.getFullYear();

  // Prüfungstermine typischerweise: Sommer (Anfang Mai ~ 05.05.) und Winter (Ende November ~ 25.11.)
  const summerExam = new Date(year, 4, 5); // 5. Mai
  const winterExam = new Date(year, 10, 25); // 25. November

  /** @type {Date} */
  let targetExam;
  let targetSeason = 'Sommerprüfung';

  if (currentDate.getTime() <= summerExam.getTime()) {
    targetExam = summerExam;
    targetSeason = `Sommer ${year}`;
  } else if (currentDate.getTime() <= winterExam.getTime()) {
    targetExam = winterExam;
    targetSeason = `Winter ${year}`;
  } else {
    targetExam = new Date(year + 1, 4, 5);
    targetSeason = `Sommer ${year + 1}`;
  }

  const diffMs = targetExam.getTime() - currentDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    daysRemaining,
    targetSeason,
    examDateStr: targetExam.toLocaleDateString('de-DE')
  };
}

/**
 * Berechnet den IHK Readiness Score (0-100%) und empfiehlt Schwachstellen-Module
 * @param {Record<string, { completed: number, scoreSum: number }>} domainStats
 * @returns {{
 *   overallReadinessPercent: number,
 *   gradeEstimate: string,
 *   domains: ExamDomainScore[],
 *   recommendedFocus: string[],
 *   isReady: boolean
 * }}
 */
export function calculateExamReadiness(domainStats = {}) {
  let weightedScoreSum = 0;
  let totalWeight = 0;
  /** @type {ExamDomainScore[]} */
  const domains = [];
  /** @type {string[]} */
  const recommendedFocus = [];

  IHK_EXAM_DOMAINS.forEach(d => {
    const stat = domainStats[d.key] || { completed: 0, scoreSum: 0 };
    const avgScore = stat.completed > 0 ? Math.min(100, stat.scoreSum / stat.completed) : 0;
    const taskProgress = Math.min(1, stat.completed / d.requiredTasks);

    // Domain Readiness = 50% Abdeckung + 50% Testerfolg
    const domainReadiness = (taskProgress * 50) + (avgScore * 0.50);

    weightedScoreSum += domainReadiness * d.weight;
    totalWeight += d.weight;

    domains.push({
      domainKey: d.key,
      title: d.title,
      weight: d.weight,
      completedTasks: stat.completed,
      requiredTasks: d.requiredTasks,
      averageScore: Number(avgScore.toFixed(1))
    });

    if (domainReadiness < 60) {
      recommendedFocus.push(d.title);
    }
  });

  const overallReadinessPercent = Number((weightedScoreSum / (totalWeight || 1)).toFixed(1));

  let gradeEstimate = 'Note 5 (Mangelhaft - MEP erforderlich)';
  if (overallReadinessPercent >= 92) gradeEstimate = 'Note 1 (Sehr Gut)';
  else if (overallReadinessPercent >= 81) gradeEstimate = 'Note 2 (Gut)';
  else if (overallReadinessPercent >= 67) gradeEstimate = 'Note 3 (Befriedigend)';
  else if (overallReadinessPercent >= 50) gradeEstimate = 'Note 4 (Ausreichend / Bestanden)';

  return {
    overallReadinessPercent,
    gradeEstimate,
    domains,
    recommendedFocus,
    isReady: overallReadinessPercent >= 50
  };
}
