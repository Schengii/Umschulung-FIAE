/**
 * IHK Projektantrag & Meilenstein-Gantt Engine (AO 2020)
 * Validiert Stundenplanung, Phasenverteilung und Genehmigungskriterien
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
  }
};

export const DEFAULT_PROPOSAL_PHASES = [
  { id: 'p1', name: '1. Analysephase (Ist-Zustand, Soll-Konzept & NWA)', hours: 12, category: 'analyse' },
  { id: 'p2', name: '2. Entwurfsphase (Datenbank-Design, API & Sicherheitskonzept)', hours: 16, category: 'entwurf' },
  { id: 'p3', name: '3. Implementierungsphase (Entwicklung der Kernmodule)', hours: 32, category: 'umsetzung' },
  { id: 'p4', name: '4. Qualitätssicherung (Unit Tests & Integrationstests)', hours: 10, category: 'qs' },
  { id: 'p5', name: '5. Dokumentation (Entwicklerdoku, Projektdoku & Fazit)', hours: 10, category: 'doku' }
];

export const IHK_PROPOSAL_CHECKLIST = [
  { id: 'chk_scope', label: 'Echte Problemstellung mit betrieblichem/kaufmännischem Nutzen', required: true },
  { id: 'chk_decision', label: 'Eigene Entscheidungsspielräume vorhanden (keine reine Abarbeitung)', required: true },
  { id: 'chk_economic', label: 'Wirtschaftlichkeitsanalyse (Nutzwertanalyse, Amortisation) eingeplant', required: true },
  { id: 'chk_security', label: 'Datenschutz (DSGVO Art. 32) und Sicherheitsaspekte berücksichtigt', required: true },
  { id: 'chk_handover', label: 'Projektabnahme, Einführung oder Kundeneinweisung definiert', required: true }
];

/**
 * Validiert einen IHK-Projektantrag gegen AO 2020 Vorgaben
 */
export function evaluateIhkProjectProposal({
  occupationId = 'fiae',
  phases = DEFAULT_PROPOSAL_PHASES,
  checkedItems = ['chk_scope', 'chk_decision', 'chk_economic', 'chk_security', 'chk_handover']
}) {
  const occ = IHK_PROJECT_OCCUPATIONS[occupationId] || IHK_PROJECT_OCCUPATIONS.fiae;
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
    const limits = occ.idealPhases[p.category];

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
