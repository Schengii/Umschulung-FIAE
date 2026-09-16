/**
 * IHK Abschlussprüfung Teil 2 (AP2) Projekt-Gantt & Meilenstein Engine
 * Ermöglicht die vorschriftsmäßige Zeit- und Phasenplanung für IT-Ausbildungsberufe:
 * - Fachinformatiker/in Anwendungsentwicklung (FIAE): 80 Stunden Richtwert
 * - Fachinformatiker/in Systemintegration (FISI): 40 Stunden Richtwert
 * - IT-Systemelektroniker / Daten- und Prozessanalyse (40h / 80h)
 */

export const IHK_PROFILES = {
  FIAE: {
    id: 'FIAE',
    name: 'Fachinformatiker/in Anwendungsentwicklung',
    targetHours: 80,
    maxImplementationPct: 50, // Realisierung max. ~50%
    minDocumentationPct: 10,  // Doku mind. ~10-15%
    defaultPhases: [
      {
        id: 'phase-1',
        name: '1. Analyse & Projektdefinition',
        hours: 10,
        description: 'Ist-Analyse, Wirtschaftlichkeitsanalyse (Amortisation), Lastenheft / Soll-Konzept',
        milestones: ['Projektantrag genehmigt', 'Soll-Konzept freigegeben']
      },
      {
        id: 'phase-2',
        name: '2. Entwurf & Spezifikation',
        hours: 14,
        description: 'Datenmodellierung (ER-Diagramm), Systemarchitektur, UI/UX Wireframes, Schnittstellendefinition',
        milestones: ['Architektur festgelegt', 'Pflichtenheft finalisiert']
      },
      {
        id: 'phase-3',
        name: '3. Realisierung & Implementierung',
        hours: 34,
        description: 'Frontend- & Backend-Entwicklung, Anbindung der APIs, Datenbankintegration',
        milestones: ['Core-Feature funktional', 'Feature-Complete (Code Freeze)']
      },
      {
        id: 'phase-4',
        name: '4. Qualitätssicherung & Testing',
        hours: 12,
        description: 'Unit-Tests, Integrationstests, End-to-End-Tests, Code Reviews, Lasttests',
        milestones: ['QA-Freigabe erteilt', 'Testbericht erstellt']
      },
      {
        id: 'phase-5',
        name: '5. Dokumentation & Abschluss',
        hours: 10,
        description: 'Projektdokumentation (Entwicklerbericht), Benutzerhandbuch, Kundeneinweisung / Projektabnahme',
        milestones: ['Dokumentation gebunden/PDF exportiert', 'Projektabnahme erfolgt']
      }
    ]
  },
  FISI: {
    id: 'FISI',
    name: 'Fachinformatiker/in Systemintegration',
    targetHours: 40,
    maxImplementationPct: 50,
    minDocumentationPct: 15,
    defaultPhases: [
      {
        id: 'phase-1',
        name: '1. Analyse & Konzeption',
        hours: 8,
        description: 'Ist-Zustand des Firmennetzwerks, Nutzwertanalyse, Hard- & Softwareauswahl',
        milestones: ['Ist-Analyse abgeschlossen', 'Beschaffungsfreigabe']
      },
      {
        id: 'phase-2',
        name: '2. Entwurf & Planung',
        hours: 6,
        description: 'Netzwerkplan, Sicherheitskonzept (Firewall/VLANs), Backup- & Rollbackstrategie',
        milestones: ['Sicherheitskonzept abgenommen']
      },
      {
        id: 'phase-3',
        name: '3. Installation & Konfiguration',
        hours: 14,
        description: 'Serverbereitstellung, Virtualisierung/Container, Routing, Monitoring & Automatisierung',
        milestones: ['Systeme provisioniert', 'Dienste online']
      },
      {
        id: 'phase-4',
        name: '4. Test & Funktionsprüfung',
        hours: 6,
        description: 'Failover-Tests, Performanceprüfung, Abnahmetests nach Prüfprotokoll',
        milestones: ['Prüfprotokoll unterschrieben']
      },
      {
        id: 'phase-5',
        name: '5. Dokumentation & Übergabe',
        hours: 6,
        description: 'Kundendokumentation, Betriebshandbuch, Übergabe an Administration',
        milestones: ['Betriebshandbuch übergeben', 'Projektende']
      }
    ]
  }
};

/**
 * Validiert die Stunden und Einhaltung der typischen IHK-Richtlinien
 */
export function validateIhkProjectPlan(phases, profileId = 'FIAE', customTarget = null) {
  const profile = IHK_PROFILES[profileId] || IHK_PROFILES.FIAE;
  const target = customTarget !== null ? customTarget : profile.targetHours;

  const errors = [];
  const warnings = [];
  const advice = [];

  const totalHours = phases.reduce((acc, p) => acc + (Number(p.hours) || 0), 0);
  const diffHours = totalHours - target;

  if (totalHours !== target) {
    if (diffHours > 0) {
      errors.push(`Die geplante Stundensumme (${totalHours}h) überschreitet den IHK-Vorgabewert von exakt ${target}h um ${diffHours}h.`);
    } else {
      errors.push(`Die geplante Stundensumme (${totalHours}h) liegt unter dem IHK-Vorgabewert von ${target}h (Differenz: ${diffHours}h).`);
    }
  }

  // Suche nach Phase 'Realisierung' / 'Implementierung'
  const implPhase = phases.find(p => 
    /realisierung|implementierung|installation|konfiguration/i.test(p.name)
  );

  if (implPhase) {
    const implPct = (implPhase.hours / (totalHours || 1)) * 100;
    if (implPct > profile.maxImplementationPct) {
      warnings.push(`Realisierungsanteil beträgt ${implPct.toFixed(1)}%. IHK-Prüfungsausschüsse erwarten i. d. R. maximal ${profile.maxImplementationPct}% für reine Durchführung.`);
    }
  } else {
    warnings.push('Keine explizite Realisierungs- oder Installationsphase erkannt.');
  }

  // Suche nach Phase 'Dokumentation'
  const docPhase = phases.find(p => 
    /dokumentation|bericht|abschluss/i.test(p.name)
  );

  if (docPhase) {
    const docPct = (docPhase.hours / (totalHours || 1)) * 100;
    if (docPct < profile.minDocumentationPct) {
      warnings.push(`Dokumentationsphase ist mit ${docPct.toFixed(1)}% knapp kalkuliert (Empfohlen: mind. ${profile.minDocumentationPct}%).`);
    }
  } else {
    errors.push('Eine Projektdokumentationsphase ist für den IHK-Abschluss zwingend vorgeschrieben.');
  }

  // Best Practice Advice
  if (totalHours === target) {
    advice.push(`Exakte Punktlandung auf ${target} Stunden eingehalten.`);
  }
  advice.push('Pufferzeiten nicht als separate Phase ausweisen, sondern in den Phasen einkalkulieren.');
  advice.push('Wirtschaftlichkeitsanalyse (z. B. Amortisationsrechnung / Kostenvergleich) zwingend in Analysephase einplanen.');

  return {
    isValid: errors.length === 0,
    totalHours,
    targetHours: target,
    diffHours,
    errors,
    warnings,
    advice
  };
}

/**
 * Berechnet einen simulierten Kalender-Zeitstrahl (Startdatum -> Enddatum ohne Wochenenden)
 */
export function calculateGanttTimeline(phases, startDateStr = '2026-04-01', workHoursPerDay = 8) {
  let currentDate = new Date(startDateStr);
  
  // Wenn Startdatum auf Wochenende fällt, auf Montag vorrücken
  while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const timeline = [];

  phases.forEach((phase) => {
    const phaseStart = new Date(currentDate);
    const durationDays = Math.max(1, Math.ceil(phase.hours / workHoursPerDay));

    let daysAdded = 0;
    while (daysAdded < durationDays) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        daysAdded++;
      }
      if (daysAdded < durationDays) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const phaseEnd = new Date(currentDate);

    // Nächster Arbeitstag für die Folgephase
    currentDate.setDate(currentDate.getDate() + 1);
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    timeline.push({
      id: phase.id,
      name: phase.name,
      hours: phase.hours,
      startDate: phaseStart.toISOString().split('T')[0],
      endDate: phaseEnd.toISOString().split('T')[0],
      durationDays,
      milestones: phase.milestones || []
    });
  });

  return timeline;
}

/**
 * Exportiert den Projektantrag / Zeitplan in Markdown
 */
export function exportGanttToMarkdown(phases, profileId = 'FIAE', projectName = 'IHK-Abschlussprojekt') {
  const profile = IHK_PROFILES[profileId] || IHK_PROFILES.FIAE;
  const validation = validateIhkProjectPlan(phases, profileId);

  let md = `# Zeit- und Phasenplanung für IHK-Projektantrag\n\n`;
  md += `**Projektbezeichnung:** ${projectName}\n`;
  md += `**Berufsbild:** ${profile.name} (${profileId})\n`;
  md += `**Gesamtzeit:** ${validation.totalHours} Stunden (Vorgabe: ${validation.targetHours}h)\n\n`;

  md += `| Phase / Arbeitspaket | Geplante Zeit (Std.) | Anteil (%) | Meilensteine & Deliverables |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;

  phases.forEach((p) => {
    const pct = ((p.hours / (validation.totalHours || 1)) * 100).toFixed(1);
    const ms = (p.milestones && p.milestones.length > 0) ? p.milestones.join('; ') : '-';
    md += `| **${p.name}** | ${p.hours}h | ${pct}% | ${ms} |\n`;
  });

  md += `| **Gesamt** | **${validation.totalHours}h** | **100%** | **Projektziel erreicht** |\n\n`;

  if (validation.warnings.length > 0) {
    md += `### Hinweise zur Prüfungsordnung:\n`;
    validation.warnings.forEach(w => {
      md += `- ⚠️ ${w}\n`;
    });
  }

  return md;
}
