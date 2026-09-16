/**
 * IHK Agile vs. Waterfall & Sprint Burndown Calculation Engine
 * Designed for IHK Abschlussprüfung Teil 2 (AP2 Teil A Projektarbeit & Dokumentation)
 * Calculates Ideal vs. Actual Burndown, Velocity, Scope-Creep, WIP Bottlenecks,
 * and generates official IHK justification texts for hybrid project management.
 */

/**
 * Standard-Parameter für einen 10-Tage IHK-Entwicklungs-Sprint
 */
export const DEFAULT_SPRINT_CONFIG = {
  totalDays: 10,
  initialStoryPoints: 50,
  dailyCompletedPoints: [5, 4, 6, 3, 5, 4, 7, 4, 6, 6], // Tatsächliche Punkte pro Tag
  scopeAdditions: [
    { day: 4, points: 5, reason: 'IHK-Anforderungserweiterung: Zusätzliche Validierung' }
  ]
};

/**
 * Berechnet den täglichen Verlauf des Burndown-Charts
 * @param {Object} config - Sprint-Konfiguration
 * @returns {Object} Burndown-Daten mit Ideal-, Ist- und Scope-Kurve
 */
export function calculateSprintBurndown(config = DEFAULT_SPRINT_CONFIG) {
  const { totalDays = 10, initialStoryPoints = 50, dailyCompletedPoints = [], scopeAdditions = [] } = config;

  const dataPoints = [];
  let currentRemaining = initialStoryPoints;
  let totalScopeAdded = 0;

  // Tag 0 (Sprint-Start)
  dataPoints.push({
    day: 0,
    ideal: initialStoryPoints,
    actual: initialStoryPoints,
    scopeAdded: 0,
    isProjected: false
  });

  for (let day = 1; day <= totalDays; day++) {
    // Ideal-Linie: Gleichmäßiger linearer Abbau bis 0
    const ideal = Math.max(0, Math.round((initialStoryPoints * (1 - day / totalDays)) * 10) / 10);

    // Eventueller Scope-Creep an diesem Tag
    const addition = scopeAdditions.find(s => s.day === day);
    if (addition) {
      currentRemaining += addition.points;
      totalScopeAdded += addition.points;
    }

    // Abgearbeitete Punkte des Tages
    const completedToday = dailyCompletedPoints[day - 1] ?? 0;
    currentRemaining = Math.max(0, currentRemaining - completedToday);

    dataPoints.push({
      day,
      ideal,
      actual: currentRemaining,
      scopeAdded: addition ? addition.points : 0,
      totalScopeAdded,
      isProjected: day > dailyCompletedPoints.length
    });
  }

  // Durchschnittliche Velocity (Punkte pro Tag)
  const actualDaysCount = Math.min(dailyCompletedPoints.length, totalDays);
  const totalCompleted = dailyCompletedPoints.slice(0, actualDaysCount).reduce((acc, p) => acc + p, 0);
  const velocityPerDay = actualDaysCount > 0 ? Math.round((totalCompleted / actualDaysCount) * 10) / 10 : 0;

  // Prognose: Erreichbarkeit des Sprint-Ziels
  const finalDayRemaining = dataPoints[dataPoints.length - 1].actual;
  const isGoalAchieved = finalDayRemaining === 0;
  const daysNeededAtCurrentVelocity = velocityPerDay > 0 ? Math.ceil(currentRemaining / velocityPerDay) : null;

  return {
    initialStoryPoints,
    totalDays,
    totalScopeAdded,
    totalCompleted,
    velocityPerDay,
    finalRemainingPoints: finalDayRemaining,
    isGoalAchieved,
    daysNeededAtCurrentVelocity,
    dataPoints
  };
}

/**
 * Kanban WIP (Work-In-Progress) Bottleneck Analyzer
 */
export function analyzeKanbanWipLimits(columns) {
  const analyzed = columns.map(col => {
    const isOverloaded = col.wipLimit > 0 && col.cardsCount > col.wipLimit;
    const utilization = col.wipLimit > 0 ? Math.round((col.cardsCount / col.wipLimit) * 100) : null;

    let status = 'HEALTHY';
    let recommendation = 'Spalte im optimalen Fluss.';

    if (isOverloaded) {
      status = 'BOTTLENECK';
      recommendation = `Engpass! ${col.cardsCount - col.wipLimit} Karte(n) über WIP-Limit. Pull-Stop für vorgelagerte Spalten empfohlen.`;
    } else if (col.cardsCount === 0 && col.id !== 'backlog') {
      status = 'STARVATION';
      recommendation = 'Leerlauf (Starvation). Ressourcen können zur Beseitigung von Engpässen verlagert werden.';
    }

    return {
      ...col,
      isOverloaded,
      utilization,
      status,
      recommendation
    };
  });

  const hasBottlenecks = analyzed.some(c => c.isOverloaded);
  return {
    columns: analyzed,
    hasBottlenecks,
    bottleneckCount: analyzed.filter(c => c.isOverloaded).length
  };
}

/**
 * Bewertungs-Matrix: Wasserfall vs. Scrum vs. Hybrides Modell für IHK-Projekte
 */
export const IHK_METHOD_COMPARISON = [
  {
    criterion: 'Anforderungsstabilität',
    waterfall: 'Erfordert vollständige, fixe Spezifikation zu Projektbeginn (Lastenheft).',
    scrum: 'Sehr flexibel für sich ändernde Kundenwünsche via Product Backlog.',
    hybrid: 'Fixes Fachkonzept als IHK-Rahmen, iterative Spezifikation der User Stories.'
  },
  {
    criterion: 'IHK-Zeitbudget (z.B. 80h FIAE / 40h FISI)',
    waterfall: 'Exakte Phasenbindung mit starrer Stundenverteilung (Gefahr bei Verzögerungen).',
    scrum: 'Schwierig, da Scope flexibel und Zeit fix ist (Dokumentationsrisiko im IHK-Antrag).',
    hybrid: 'IHK-Ideal: Starre Meilensteine außen (Analyse/Doku), 2 agile Sprints im Entwicklungs-Kern.'
  },
  {
    criterion: 'Risikominimierung',
    waterfall: 'Späte Integration; Fehler und Missverständnisse werden erst im Systemtest sichtbar.',
    scrum: 'Frühe Feedback-Schleifen nach jedem Sprint durch funktionierende Inkremente.',
    hybrid: 'Frühe Machbarkeitsnachweise (Spikes) kombiniert mit strukturierter Abschluss-QS.'
  },
  {
    criterion: 'IHK-Prüfer-Akzeptanz',
    waterfall: 'Klassisch anerkannt, aber oft als veraltet kritisiert.',
    scrum: 'Modern, erfordert aber strikten Nachweis von Burndown, Stories und Artefakten.',
    hybrid: 'Höchste Bewertungsquote: Zeigt methodische Reife und pragmatische Abgrenzung.'
  }
];

/**
 * Generiert die offizielle Begründung für die Methodenwahl im IHK-Projektbericht
 */
export function generateIhkMethodologyJustification(projectType = 'hybrid', options = {}) {
  const { role = 'FIAE', totalHours = 80, projectName = 'Entwicklung des Moduls' } = options;

  if (projectType === 'hybrid') {
    return `### Methodische Vorgehensweise: Hybrides Projektmanagement (IHK-Konform nach AO 2020)

Für das Abschlussprojekt **"${projectName}"** (${totalHours}h Gesamtdauer für ${role}) wurde ein **hybrides Vorgehensmodell** gewählt.

#### Begründung der Methodenwahl:
1. **Klassische Rahmenphasen (Wasserfall-orientiert)**:
   - Die Phasen **Projektinitialisierung & Anforderungsanalyse** (10h) sowie **Qualitätssicherung, Rollout & Projektdokumentation** (20h) erfordern feste Meilensteine und einen definierten Abnahmerahmen zur Erfüllung der IHK-Genehmigungskriterien.
2. **Agile Kernphasen (Scrum/Sprint-basiert)**:
   - Die **Realisierungsphase** (35h) wird in zwei 1-wöchigen Sprints mit Daily Standups und einem Sprint-Burndown-Chart durchgeführt. Dies ermöglicht es, komplexe Schnittstellen und User-Stories inkrementell zu entwickeln und Risiken frühzeitig durch funktionierende Zwischeninkremente zu minimieren.

#### Artefakte & Werkzeuge:
- **Product Backlog & User Stories** mit Story-Point-Schätzung nach Planning Poker.
- **Sprint Burndown Chart** zur täglichen Fortschritts- und Velocity-Kontrolle.
- **Kanban Board** mit definierten Work-in-Progress (WIP) Limits zur Vermeidung von Entwicklungsstaus.`;
  }

  if (projectType === 'scrum') {
    return `### Methodische Vorgehensweise: Agiles Projektmanagement nach Scrum
Für das Projekt **"${projectName}"** wird eine rein agile Vorgehensweise nach Scrum gewählt.
- Rollen: Product Owner, Scrum Master, Developer (Kandidat).
- Sprints: 2-wöchige Zyklen mit Sprint Planning, Review und Retrospektive.
- Vorteil: Schnelle Reaktionsfähigkeit auf dynamische Anforderungen und kontinuierliche Wertschöpfung.`;
  }

  return `### Methodische Vorgehensweise: Klassisches Phasenmodell (Wasserfall)
Für das Projekt **"${projectName}"** wird ein sequentielles Phasenmodell mit sequentiellen Meilensteinen (Analyse -> Entwurf -> Realisierung -> Test -> Einführung) gewählt.
- Vorteil: Klare vertragliche Fixierung und deterministischer Ablaufplan.`;
}
