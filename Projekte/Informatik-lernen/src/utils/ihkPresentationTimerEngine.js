/**
 * IHK Präsentations-Stoppuhr & Folien-Gliederungs Engine
 * Bewertungs- und Zeitmanagement-Standard für die 15-minütige IHK-Projektpräsentation (AP2 Teil A)
 */

export const TOTAL_PRESENTATION_SECONDS = 15 * 60; // 900 Sekunden (15 Minuten)

export const DEFAULT_PRESENTATION_PHASES = [
  {
    id: 'intro',
    title: '1. Einleitung & Projektumfeld',
    targetDurationSec: 120, // 2 Minuten
    color: 'var(--accent-indigo)',
    keyPoints: [
      'Ausbildungsbetrieb & Kundenkontext vorstellen',
      'Ausgangssituation & Problemstellung (Ist-Zustand)',
      'Projektziel & Projektumfeld klar definieren'
    ],
    recommendedSlides: 'Folien 1–3'
  },
  {
    id: 'analysis_economy',
    title: '2. Analyse & Wirtschaftlichkeit',
    targetDurationSec: 240, // 4 Minuten
    color: 'var(--accent-amber)',
    keyPoints: [
      'Anforderungsanalyse (Soll-Konzept / Lastenheft)',
      'Wirtschaftlichkeitsanalyse (Make-or-Buy / Nutzwertanalyse)',
      'Amortisationsrechnung & Ressourceneinsatz'
    ],
    recommendedSlides: 'Folien 4–6'
  },
  {
    id: 'realization',
    title: '3. Entwurf & Realisierung',
    targetDurationSec: 360, // 6 Minuten (Hauptteil)
    color: 'var(--accent-emerald)',
    keyPoints: [
      'Systemarchitektur & Datenmodell (ERD / UML)',
      'Kernergebnisse & Programmcode / Konfiguration',
      'Herausforderungen, Abweichungen & Problemlösungen'
    ],
    recommendedSlides: 'Folien 7–11'
  },
  {
    id: 'conclusion',
    title: '4. QS, Fazit & Ausblick',
    targetDurationSec: 180, // 3 Minuten
    color: 'var(--accent-rose)',
    keyPoints: [
      'Testverfahren & Abnahme (Soll-/Ist-Vergleich)',
      'Projektkostenkontrolle (Plan- vs. Ist-Stunden)',
      'Persönliches Fazit & zukünftige Weiterentwicklung'
    ],
    recommendedSlides: 'Folien 12–14'
  }
];

export const PRESENTATION_RUBRICS = [
  {
    id: 'rubric_structure',
    category: 'Struktur & Gliederung',
    description: 'Roter Faden erkennbar, Schwerpunkte passend gewichtet, keine Folienschlacht.',
    weight: 25
  },
  {
    id: 'rubric_technical',
    category: 'Fachliche Tiefe',
    description: 'Fachbegriffe präzise genutzt, Architektur & Entscheidungen fundiert begründet.',
    weight: 30
  },
  {
    id: 'rubric_media',
    category: 'Medieneinsatz & Folien',
    description: 'Diagramme gut lesbar, Folien nicht überladen, professionelles Corporate Design.',
    weight: 20
  },
  {
    id: 'rubric_presentation',
    category: 'Vortrag & Körpersprache',
    description: 'Freies Sprechen, Blickkontakt zum Prüfungsausschuss, ruhiges Sprechtempo.',
    weight: 15
  },
  {
    id: 'rubric_timing',
    category: 'Zeitmanagement',
    description: 'Präzise 15 Minuten eingehalten (+/- 1 Minute Toleranzbereich).',
    weight: 10
  }
];

/**
 * Berechnet die aktuelle Phase und den Fortschritt anhand der verstrichenen Sekunden
 */
export function getCurrentPhaseInfo(elapsedSeconds, phases = DEFAULT_PRESENTATION_PHASES) {
  let accumulated = 0;
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    accumulated += phase.targetDurationSec;
    if (elapsedSeconds < accumulated || i === phases.length - 1) {
      const phaseStart = accumulated - phase.targetDurationSec;
      const phaseElapsed = Math.max(0, elapsedSeconds - phaseStart);
      const phaseProgressPct = Math.min(100, Math.round((phaseElapsed / phase.targetDurationSec) * 100));
      return {
        phaseIndex: i,
        phase,
        phaseElapsed,
        phaseRemaining: Math.max(0, phase.targetDurationSec - phaseElapsed),
        phaseProgressPct,
        isOvertime: elapsedSeconds > TOTAL_PRESENTATION_SECONDS
      };
    }
  }

  return {
    phaseIndex: phases.length - 1,
    phase: phases[phases.length - 1],
    phaseElapsed: 0,
    phaseRemaining: 0,
    phaseProgressPct: 100,
    isOvertime: true
  };
}

/**
 * Ermittelt den Zeit-Status (on_track, warning, overtime)
 */
export function getTimingStatus(elapsedSeconds) {
  if (elapsedSeconds > TOTAL_PRESENTATION_SECONDS + 60) {
    return { status: 'danger', message: 'Überzeit! Zeitlimit von 15 Minuten überschritten (-Punkteabzug droht)' };
  }
  if (elapsedSeconds >= TOTAL_PRESENTATION_SECONDS - 60) {
    return { status: 'warning', message: 'Schlussphase: Noch unter 1 Minute bis zum 15-Minuten-Limit!' };
  }
  return { status: 'ok', message: 'Im Zeitplan (15-Minuten-Zielvorgabe)' };
}

/**
 * Berechnet das Gesamtergebnis der Präsentationsbewertung nach IHK-Schema (1-6)
 */
export function calculatePresentationGrade(checklistRatings = {}) {
  let totalScore = 0;
  let maxScore = 0;

  PRESENTATION_RUBRICS.forEach(rubric => {
    const rating = checklistRatings[rubric.id] || 0; // 0 bis 100
    totalScore += (rating / 100) * rubric.weight;
    maxScore += rubric.weight;
  });

  const percentage = Math.round((totalScore / maxScore) * 100);

  let grade = 5;
  let summary = 'Nicht bestanden';

  if (percentage >= 92) { grade = 1; summary = 'Sehr Gut'; }
  else if (percentage >= 81) { grade = 2; summary = 'Gut'; }
  else if (percentage >= 67) { grade = 3; summary = 'Befriedigend'; }
  else if (percentage >= 50) { grade = 4; summary = 'Ausreichend'; }
  else if (percentage >= 30) { grade = 5; summary = 'Mangelhaft'; }
  else { grade = 6; summary = 'Ungenügend'; }

  return {
    percentage,
    grade,
    summary,
    passed: percentage >= 50,
    totalPoints: totalScore
  };
}

/**
 * Formatiert Sekunden in MM:SS
 */
export function formatTimeMMSS(seconds) {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.floor(Math.abs(seconds) % 60);
  const prefix = seconds < 0 ? '-' : '';
  return `${prefix}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
