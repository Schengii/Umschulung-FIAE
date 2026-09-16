/**
 * IHK Examination Grading & MEP Calculation Engine (AO 2020)
 */

export const IHK_OCCUPATIONS = {
  fiae: {
    name: 'Fachinformatiker/in für Anwendungsentwicklung (FIAE)',
    ap2_b1_name: 'Planen eines Softwareproduktes',
    ap2_b2_name: 'Entwicklung eines Softwareproduktes'
  },
  fisi: {
    name: 'Fachinformatiker/in für Systemintegration (FISI)',
    ap2_b1_name: 'Planen eines IT-Systems',
    ap2_b2_name: 'Einrichten eines IT-Systems'
  },
  fidp: {
    name: 'Fachinformatiker/in für Daten- und Prozessanalyse (FIDP)',
    ap2_b1_name: 'Analysieren datenbasierter Prozesse',
    ap2_b2_name: 'Entwickeln datenbasierter Lösungen'
  },
  fidv: {
    name: 'Fachinformatiker/in für Digitale Vernetzung (FIDV)',
    ap2_b1_name: 'Planen netzwerkbasierter Systeme',
    ap2_b2_name: 'Errichten netzwerkbasierter Systeme'
  },
  itse: {
    name: 'IT-System-Elektroniker/in (ITSE)',
    ap2_b1_name: 'IT-Systeme und Netzinfrastrukturen',
    ap2_b2_name: 'Elektrische Anlagen und Sicherheit'
  },
  kaufleute: {
    name: 'Kaufleute für IT-Systemmanagement',
    ap2_b1_name: 'Entwicklung von IT-Lösungen',
    ap2_b2_name: 'Marketing und Vertrieb von IT-Lösungen'
  }
};

/**
 * Converts IHK point scale (0 - 100) to standard German grade (1 - 6)
 */
export function getIhkGrade(points) {
  const p = Math.round(points);
  if (p >= 92) return { grade: 1, label: 'Sehr gut', text: '1 (Sehr gut)' };
  if (p >= 81) return { grade: 2, label: 'Gut', text: '2 (Gut)' };
  if (p >= 67) return { grade: 3, label: 'Befriedigend', text: '3 (Befriedigend)' };
  if (p >= 50) return { grade: 4, label: 'Ausreichend', text: '4 (Ausreichend)' };
  if (p >= 30) return { grade: 5, label: 'Mangelhaft', text: '5 (Mangelhaft)' };
  return { grade: 6, label: 'Ungenügend', text: '6 (Ungenügend)' };
}

/**
 * Evaluates comprehensive IHK exam result according to AO 2020
 */
export function calculateIhkFinalScore({
  ap1 = 0,
  ap2_b1 = 0,
  ap2_b2 = 0,
  ap2_wiso = 0,
  doku = 0,
  fachgespraech = 0
}) {
  // Project overall (50% of total) = average of doku (50%) & fachgespraech (50%)
  const projectTotal = Number(((doku * 0.5) + (fachgespraech * 0.5)).toFixed(1));

  // Weightings:
  // AP1: 20%
  // AP2 B1: 10%
  // AP2 B2: 10%
  // AP2 WiSo: 10%
  // Projekt: 50%
  const totalPoints = Number((
    (ap1 * 0.20) +
    (ap2_b1 * 0.10) +
    (ap2_b2 * 0.10) +
    (ap2_wiso * 0.10) +
    (projectTotal * 0.50)
  ).toFixed(1));

  // AP2 Part Sub-score (sum of AP2 written + project normalized to 80% weight / 100 base)
  const ap2TotalPoints = Number((
    ((ap2_b1 * 0.10) + (ap2_b2 * 0.10) + (ap2_wiso * 0.10) + (projectTotal * 0.50)) / 0.80
  ).toFixed(1));

  // Rules verification
  const fails = [];

  // Rule 1: Gesamtpunkte >= 50
  if (totalPoints < 50) {
    fails.push('Gesamtergebnis liegt unter 50 Punkten (mindestens 50,0 Punkte erforderlich).');
  }

  // Rule 2: AP2 Gesamtergebnis >= 50
  if (ap2TotalPoints < 50) {
    fails.push('Gesamtergebnis von Teil 2 der Abschlussprüfung liegt unter 50 Punkten.');
  }

  // Rule 3: Projektarbeit >= 50
  if (projectTotal < 50) {
    fails.push('Die betriebliche Projektarbeit (Doku + Fachgespräch) liegt unter 50 Punkten.');
  }

  // Rule 4: Mindestens 3 von 4 Bereichen in Teil 2 müssen >= 50 sein
  const ap2Areas = [ap2_b1, ap2_b2, ap2_wiso, projectTotal];
  const passedAreas = ap2Areas.filter(p => p >= 50).length;
  if (passedAreas < 3) {
    fails.push(`In Teil 2 wurden nur ${passedAreas} von 4 Prüfungsbereichen mit mindestens 'ausreichend' (>= 50 Punkte) bestanden (mindestens 3 erforderlich).`);
  }

  // Rule 5: Kein Bereich in Teil 2 mit ungenügend (< 30 Punkte)
  if (ap2Areas.some(p => p < 30)) {
    fails.push('Mindestens ein Prüfungsbereich in Teil 2 wurde mit 0-29 Punkten (Ungenügend / Note 6) bewertet (Ausschlusskriterium).');
  }

  const isPassed = fails.length === 0;

  return {
    totalPoints,
    overallGrade: getIhkGrade(totalPoints),
    ap2TotalPoints,
    projectTotal,
    isPassed,
    fails,
    breakdown: {
      ap1: { points: ap1, weight: '20%', weightedPoints: Number((ap1 * 0.2).toFixed(1)), grade: getIhkGrade(ap1) },
      ap2_b1: { points: ap2_b1, weight: '10%', weightedPoints: Number((ap2_b1 * 0.1).toFixed(1)), grade: getIhkGrade(ap2_b1) },
      ap2_b2: { points: ap2_b2, weight: '10%', weightedPoints: Number((ap2_b2 * 0.1).toFixed(1)), grade: getIhkGrade(ap2_b2) },
      ap2_wiso: { points: ap2_wiso, weight: '10%', weightedPoints: Number((ap2_wiso * 0.1).toFixed(1)), grade: getIhkGrade(ap2_wiso) },
      project: { points: projectTotal, weight: '50%', weightedPoints: Number((projectTotal * 0.5).toFixed(1)), grade: getIhkGrade(projectTotal) }
    }
  };
}

/**
 * Calculates Mündliche Ergänzungsprüfung (MEP) possibilities for failing written subjects
 */
export function calculateMepPossibilities(currentScores) {
  const possibleAreas = [
    { key: 'ap2_b1', name: 'AP2 Bereich 1 (Planen & Konzipieren)', written: currentScores.ap2_b1 },
    { key: 'ap2_b2', name: 'AP2 Bereich 2 (Fachaufgabe)', written: currentScores.ap2_b2 },
    { key: 'ap2_wiso', name: 'AP2 Bereich 3 (WiSo)', written: currentScores.ap2_wiso }
  ];

  const recommendations = [];

  possibleAreas.forEach(area => {
    // MEP is only applicable if written score is between 30 and 49 (Mangelhaft)
    if (area.written >= 30 && area.written < 50) {
      // Find required MEP points (0-100) such that (2*written + 1*mep) / 3 >= 50
      // 2*written + mep >= 150 => mep >= 150 - 2*written
      const minRequiredMepPoints = Math.max(0, 150 - (2 * area.written));

      if (minRequiredMepPoints <= 100) {
        recommendations.push({
          areaKey: area.key,
          areaName: area.name,
          writtenPoints: area.written,
          minRequiredMepPoints,
          isFeasible: true,
          explanation: `Benötigt mindestens ${minRequiredMepPoints} Punkte in der 15-minütigen MEP, um den Bereich auf genau 50 Punkte (Note 4) anzuheben.`
        });
      } else {
        recommendations.push({
          areaKey: area.key,
          areaName: area.name,
          writtenPoints: area.written,
          minRequiredMepPoints,
          isFeasible: false,
          explanation: `Mathematisch nicht möglich (benötigt > 100 Punkte).`
        });
      }
    }
  });

  return recommendations;
}
