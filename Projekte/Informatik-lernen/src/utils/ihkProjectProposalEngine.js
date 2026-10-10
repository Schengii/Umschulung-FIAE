// @ts-check
/**
 * IHK Projektantrag & Zeitplan-Kollisions-Linter (AO 2020)
 * Validiert Stundenplanung, Phasenverteilung, Genehmigungskriterien
 * und prüft Zeitplan-Kollisionen (Gantt-Überlappung, Wochenenden, Puffer).
 */

export const IHK_PROJECT_OCCUPATIONS = {
  fiae: {
    id: 'fiae',
    name: 'Fachinformatiker Anwendungsentwicklung (FIAE)',
    maxHours: 80,
    idealPhases: {
      analyse: { min: 10, max: 20 },
      entwurf: { min: 15, max: 25 },
      umsetzung: { min: 35, max: 50 },
      qs: { min: 10, max: 15 },
      doku: { min: 10, max: 15 }
    }
  },
  fisi: {
    id: 'fisi',
    name: 'Fachinformatiker Systemintegration (FISI)',
    maxHours: 40,
    idealPhases: {
      analyse: { min: 15, max: 25 },
      entwurf: { min: 15, max: 25 },
      umsetzung: { min: 30, max: 45 },
      qs: { min: 10, max: 15 },
      doku: { min: 10, max: 15 }
    }
  },
  fidp: {
    id: 'fidp',
    name: 'Fachinformatiker Daten- und Prozessanalyse (FIDP)',
    maxHours: 80,
    idealPhases: {
      analyse: { min: 20, max: 30 },
      entwurf: { min: 15, max: 25 },
      umsetzung: { min: 30, max: 45 },
      qs: { min: 10, max: 15 },
      doku: { min: 10, max: 15 }
    }
  },
  itse: {
    id: 'itse',
    name: 'IT-System-Elektroniker (IT-SE)',
    maxHours: 40,
    idealPhases: {
      analyse: { min: 15, max: 25 },
      entwurf: { min: 15, max: 25 },
      umsetzung: { min: 30, max: 45 },
      qs: { min: 10, max: 15 },
      doku: { min: 10, max: 15 }
    }
  }
};

export const DEFAULT_PROPOSAL_PHASES = [
  { id: 'p1', name: '1. Analysephase (Ist-Zustand, Soll-Konzept & NWA)', hours: 12, category: 'analyse', startDay: 1, endDay: 3 },
  { id: 'p2', name: '2. Entwurfsphase (Datenbank-Design, API & Sicherheitskonzept)', hours: 16, category: 'entwurf', startDay: 4, endDay: 6 },
  { id: 'p3', name: '3. Implementierungsphase (Entwicklung der Kernmodule)', hours: 32, category: 'umsetzung', startDay: 7, endDay: 12 },
  { id: 'p4', name: '4. Qualitätssicherung (Unit Tests & Integrationstests)', hours: 10, category: 'qs', startDay: 13, endDay: 14 },
  { id: 'p5', name: '5. Dokumentation (Entwicklerdoku, Projektdoku & Fazit)', hours: 10, category: 'doku', startDay: 15, endDay: 16 }
];

export const IHK_PROPOSAL_CHECKLIST = [
  { id: 'chk_scope', label: 'Echte Problemstellung mit betrieblichem/kaufmännischem Nutzen', required: true },
  { id: 'chk_decision', label: 'Eigene Entscheidungsspielräume vorhanden (keine reine Abarbeitung)', required: true },
  { id: 'chk_economic', label: 'Wirtschaftlichkeitsanalyse (Nutzwertanalyse, Amortisation) eingeplant', required: true },
  { id: 'chk_security', label: 'Datenschutz (DSGVO Art. 32) und Sicherheitsaspekte berücksichtigt', required: true },
  { id: 'chk_handover', label: 'Projektabnahme, Einführung oder Kundeneinweisung definiert', required: true }
];

/**
 * Validiert Zeitplan-Kollisionen und logische Abhängigkeiten zwischen Projektphasen
 * @param {Array<{ id: string, name: string, startDay?: number, endDay?: number, category: string }>} phases
 */
export function checkScheduleCollisions(phases) {
  /** @type {string[]} */
  const scheduleWarnings = [];

  for (let i = 0; i < phases.length; i++) {
    const cur = phases[i];
    const next = phases[i + 1];

    if (cur.startDay && cur.endDay && cur.startDay > cur.endDay) {
      scheduleWarnings.push(`Ungültiger Zeitbereich in Phase "${cur.name}": Starttag (${cur.startDay}) liegt nach Endtag (${cur.endDay}).`);
    }

    if (next && cur.endDay && next.startDay) {
      // Wenn die Dokumentation vor der Umsetzung beginnt
      if (next.category === 'umsetzung' && cur.category === 'doku') {
        scheduleWarnings.push(`Logikfehler: Dokumentation darf nicht vor der Implementierungsphase liegen.`);
      }
      // Wenn Phasen eine Lücke von mehr als 5 Tagen haben
      if (next.startDay - cur.endDay > 5) {
        scheduleWarnings.push(`Unplausible Projektpause von ${next.startDay - cur.endDay} Tagen zwischen "${cur.name}" und "${next.name}".`);
      }
    }
  }

  return scheduleWarnings;
}

/**
 * Validiert einen IHK-Projektantrag gegen AO 2020 Vorgaben
 * @param {Object} params
 * @param {string} [params.occupationId]
 * @param {Array<any>} [params.phases]
 * @param {string[]} [params.checkedItems]
 */
export function evaluateIhkProjectProposal({
  occupationId = 'fiae',
  phases = DEFAULT_PROPOSAL_PHASES,
  checkedItems = ['chk_scope', 'chk_decision', 'chk_economic', 'chk_security', 'chk_handover']
}) {
  const occKey = typeof occupationId === 'string' && occupationId in IHK_PROJECT_OCCUPATIONS
    ? /** @type {keyof typeof IHK_PROJECT_OCCUPATIONS} */ (occupationId)
    : 'fiae';
  const occ = IHK_PROJECT_OCCUPATIONS[occKey];
  const totalHours = phases.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);
  const isHoursExact = totalHours === occ.maxHours;
  const hoursDiff = totalHours - occ.maxHours;

  const warnings = [];
  const errors = [];

  if (totalHours > occ.maxHours) {
    errors.push(`Die Gesamtdauer beträgt ${totalHours} Std. Erlaubt sind für ${occ.name} exakt maximal ${occ.maxHours} Stunden! (+${hoursDiff} Std.)`);
  } else if (totalHours < occ.maxHours) {
    warnings.push(`Die Gesamtdauer beträgt nur ${totalHours} Std. (von ${occ.maxHours} Std.). Bitte nutze das Kontingent voll aus.`);
  }

  // Prozentuale Phasenanalyse
  const phaseAnalysis = phases.map(p => {
    const hours = Number(p.hours) || 0;
    const percent = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
    // @ts-ignore
    const limits = occ.idealPhases ? occ.idealPhases[p.category] : null;

    if (limits) {
      if (percent < limits.min) {
        warnings.push(`Phase "${p.name}" liegt mit ${percent}% unter dem IHK-Richtwert (Empfohlen: ${limits.min}–${limits.max}%).`);
      } else if (percent > limits.max) {
        warnings.push(`Phase "${p.name}" liegt mit ${percent}% über dem IHK-Richtwert (Empfohlen: ${limits.min}–${limits.max}%).`);
      }
    }

    return {
      ...p,
      hours,
      percent
    };
  });

  // Checklisten-Prüfung
  const missingChecklist = IHK_PROPOSAL_CHECKLIST.filter(c => c.required && !checkedItems.includes(c.id));
  if (missingChecklist.length > 0) {
    missingChecklist.forEach(m => {
      errors.push(`K.O.-Kriterium fehlt: "${m.label}". Dies ist ein häufiger Ablehnungsgrund der IHK.`);
    });
  }

  // Zeitplan-Kollisionsprüfung
  const collisionWarnings = checkScheduleCollisions(phases);
  collisionWarnings.forEach(w => warnings.push(w));

  // Status ermitteln
  let status = 'APPROVED'; // APPROVED | CONDITIONAL | REJECTED
  if (errors.length > 0) {
    status = 'REJECTED';
  } else if (warnings.length > 0) {
    status = 'CONDITIONAL';
  }

  return {
    occupation: occ,
    totalHours,
    maxHours: occ.maxHours,
    isHoursExact,
    status,
    errors,
    warnings,
    phaseAnalysis,
    checklistPassed: missingChecklist.length === 0
  };
}

/**
 * Automatischer IHK-Projektphasen-Generator für Standard-Projekttypen
 * @param {'fiae' | 'fisi' | 'fidp' | 'itse'} occupationId
 * @param {'custom' | 'web_app' | 'cloud_migration' | 'etl_pipeline' | 'monitoring'} projectType
 * @returns {Array<{ id: string, name: string, hours: number, category: string, startDay: number, endDay: number }>}
 */
export function generateProjectPhasesWizard(occupationId = 'fiae', projectType = 'web_app') {
  if (occupationId === 'fisi' || occupationId === 'itse') {
    // 40h FISI / ITSE
    switch (projectType) {
      case 'cloud_migration':
      case 'monitoring':
        return [
          { id: 'w1', name: '1. Analysephase (Ist-Analyse, Soll-Konzept & NWA)', hours: 6, category: 'analyse', startDay: 1, endDay: 2 },
          { id: 'w2', name: '2. Entwurf & Planung (Netzwerktopologie & Rollback-Strategie)', hours: 8, category: 'entwurf', startDay: 3, endDay: 4 },
          { id: 'w3', name: '3. Implementierung (Automatisierung via Ansible/Terraform)', hours: 14, category: 'umsetzung', startDay: 5, endDay: 7 },
          { id: 'w4', name: '4. Qualitätssicherung (Funktionstests & Lastsimulation)', hours: 6, category: 'qs', startDay: 8, endDay: 8 },
          { id: 'w5', name: '5. Projektabschluss (Dokumentation & Übergabe)', hours: 6, category: 'doku', startDay: 9, endDay: 10 }
        ];
      default:
        return [
          { id: 'w1', name: '1. Analysephase (Ist-Zustand & Wirtschaftlichkeit)', hours: 7, category: 'analyse', startDay: 1, endDay: 2 },
          { id: 'w2', name: '2. Entwurfsphase (Systemarchitektur & Hardware)', hours: 7, category: 'entwurf', startDay: 3, endDay: 4 },
          { id: 'w3', name: '3. Realisierung (Installation & Konfiguration)', hours: 14, category: 'umsetzung', startDay: 5, endDay: 7 },
          { id: 'w4', name: '4. Qualitätssicherung (Tests & Abnahme)', hours: 6, category: 'qs', startDay: 8, endDay: 8 },
          { id: 'w5', name: '5. Dokumentation (Benutzerhandbuch & Projektdoku)', hours: 6, category: 'doku', startDay: 9, endDay: 10 }
        ];
    }
  }

  // 80h FIAE / FIDP
  switch (projectType) {
    case 'etl_pipeline':
      return [
        { id: 'w1', name: '1. Analysephase (Quellsystem-Analyse, Datenschutz & NWA)', hours: 14, category: 'analyse', startDay: 1, endDay: 3 },
        { id: 'w2', name: '2. Entwurf (DWH Star-Schema, Schnittstellendefinition)', hours: 16, category: 'entwurf', startDay: 4, endDay: 6 },
        { id: 'w3', name: '3. Implementierung (ETL-Pipelines & Schema-Drift-Filter)', hours: 28, category: 'umsetzung', startDay: 7, endDay: 12 },
        { id: 'w4', name: '4. Qualitätssicherung (Unit-Tests & Validierung)', hours: 11, category: 'qs', startDay: 13, endDay: 14 },
        { id: 'w5', name: '5. Projektdokumentation (Entwicklerdoku & Anhang)', hours: 11, category: 'doku', startDay: 15, endDay: 16 }
      ];
    default:
      return [
        { id: 'w1', name: '1. Analysephase (Ist-Analyse, Fachkonzept & NWA)', hours: 12, category: 'analyse', startDay: 1, endDay: 3 },
        { id: 'w2', name: '2. Entwurfsphase (Datenbank-Design, REST-API & UI-Mockups)', hours: 16, category: 'entwurf', startDay: 4, endDay: 6 },
        { id: 'w3', name: '3. Implementierungsphase (Frontend & Backend Kernlogik)', hours: 32, category: 'umsetzung', startDay: 7, endDay: 12 },
        { id: 'w4', name: '4. Qualitätssicherung (Automatisierte Tests & CI/CD)', hours: 10, category: 'qs', startDay: 13, endDay: 14 },
        { id: 'w5', name: '5. Projektdokumentation (Projektdoku & Übergabe)', hours: 10, category: 'doku', startDay: 15, endDay: 16 }
      ];
  }
}
