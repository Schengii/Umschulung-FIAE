// @ts-check
/**
 * IHK Datenschutz-Folgenabschätzung (DSFA / DPIA) Engine nach Art. 35 DSGVO
 * Prüfungsrelevant für IHK Abschlussprüfung Teil 1 & Teil 2 (Datenschutz, IT-Sicherheit & Projektdoku)
 */

/**
 * Typische IHK-relevante DSFA-Kriterien (Blacklist der Datenschutzkonferenz / DSK)
 */
export const DPIA_CRITERIA = [
  {
    id: 'crit_eval_scoring',
    title: 'Bewertung oder Einstufung (Scoring / Profiling)',
    desc: 'Erstellung von Nutzerprofilen, Verhaltensanalysen oder Leistungsbeurteilungen am Arbeitsplatz.',
    weight: 2
  },
  {
    id: 'crit_auto_decision',
    title: 'Automatisierte Entscheidungsfindung mit Rechtswirkung',
    desc: 'Entscheidungen ohne menschliches Eingreifen (z. B. vollautomatische Kreditvergabe oder Bewerberfilterung).',
    weight: 2
  },
  {
    id: 'crit_systematic_mon',
    title: 'Systematische Überwachung öffentlich zugänglicher Bereiche',
    desc: 'Videoüberwachung, WLAN-Tracking, sensorbasierte Bewegungsmustererfassung.',
    weight: 2
  },
  {
    id: 'crit_special_categories',
    title: 'Besondere Kategorien von Daten (Art. 9 DSGVO) oder strafrechtliche Daten',
    desc: 'Gesundheitsdaten, Biometrie zur Identifizierung (z. B. Face-Scan/Touch-ID), politische oder religiöse Daten.',
    weight: 2
  },
  {
    id: 'crit_large_scale',
    title: 'Datenverarbeitung in großem Umfang (Large Scale)',
    desc: 'Große Anzahl von Betroffenen (z. B. > 10.000 Personen) oder dauerhafte regionale/landesweite Datenströme.',
    weight: 1
  },
  {
    id: 'crit_vulnerable_subjects',
    title: 'Schutzbedürftige Betroffene (Arbeitnehmer, Patienten, Kinder)',
    desc: 'Macht- oder Abhängigkeitsverhältnis zwischen Verantwortlichem und Betroffenen.',
    weight: 1
  },
  {
    id: 'crit_innovative_tech',
    title: 'Einsatz innovativer Technologien oder Organisationslösungen',
    desc: 'Machine Learning / Generative AI, IoT-Netzwerke, dezentrale Smart Contracts.',
    weight: 1
  },
  {
    id: 'crit_denial_service',
    title: 'Verhinderung der Rechtsausübung oder Dienstnutzung',
    desc: 'Verarbeitung, die Betroffene an der Nutzung einer Dienstleistung oder dem Vertragsabschluss hindert.',
    weight: 1
  }
];

/**
 * Standard-Risiken und Abhilfemaßnahmen für IHK IT-Projekte
 */
export const DEFAULT_DPIA_RISKS = [
  {
    id: 'risk_unauthorized_access',
    category: 'Zugriff & Vertraulichkeit',
    description: 'Unberechtigter Zugriff auf personenbezogene Daten durch Dritte oder Innentäter.',
    impact: 4, // 1-5
    likelihood: 3, // 1-5
    mitigation: '2-Faktor-Authentifizierung (WebAuthn/TOTP), Ende-zu-Ende-Verschlüsselung (AES-256-GCM), Role-Based Access Control (RBAC).',
    residualImpact: 2,
    residualLikelihood: 1
  },
  {
    id: 'risk_data_loss',
    category: 'Verfügbarkeit & Integrität',
    description: 'Verlust oder Beschädigung von Betroffenendaten durch Hardwaredefekt oder Ransomware.',
    impact: 4,
    likelihood: 2,
    mitigation: 'Automatisierte tägliche Backups nach 3-2-1-Prinzip mit unveränderbarem WORM/Immutable-Storage und Notfall-Wiederherstellungstest.',
    residualImpact: 2,
    residualLikelihood: 1
  },
  {
    id: 'risk_transparency',
    category: 'Transparenz & Betroffenenrechte',
    description: 'Betroffene Personen werden nicht transparent über automatisierte Verarbeitungen informiert.',
    impact: 3,
    likelihood: 3,
    mitigation: 'Datenschutzerklärung nach Art. 13/14 DSGVO, Auskunfts- und Lösch-Schnittstellen (Art. 15, 17 DSGVO).',
    residualImpact: 1,
    residualLikelihood: 1
  }
];

/**
 * Typische IHK-Prüfungsszenarien (AP1 & AP2 IT-Sicherheit / Datenschutz)
 */
export const IHK_DPIA_SCENARIOS = [
  {
    id: 'ai_copilot',
    title: 'Einführung eines internen KI-Copilots & LLM-Assistenten',
    description: 'Entwickler und Kundensupport-Mitarbeiter nutzen ein LLM, das auf internen Tickets, Code-Repositories und Kundenchats trainiert wird. Risiko von Datenabfluss und unzulässigem Arbeitnehmer-Profiling.',
    criteria: ['crit_eval_scoring', 'crit_vulnerable_subjects', 'crit_innovative_tech'],
    risks: [
      {
        id: 'risk_ai_leak',
        category: 'Vertraulichkeit & Zweckbindung',
        description: 'Mitarbeiter geben unbemerkt schützenswerte Kundendaten (PII) oder API-Keys in den KI-Prompt ein.',
        impact: 5,
        likelihood: 4,
        mitigation: 'Lokales Self-Hosted LLM (z. B. vLLM im eigenen RZ), strikte PII-Anonymisierungs-Filter (Data Loss Prevention) vor Inferenz.',
        residualImpact: 2,
        residualLikelihood: 1
      },
      {
        id: 'risk_ai_performance_mon',
        category: 'Arbeitnehmerüberwachung',
        description: 'Prompts und Antwortzeiten der Mitarbeiter werden zur verdeckten Leistungsbewertung herangezogen.',
        impact: 4,
        likelihood: 3,
        mitigation: 'Betriebsvereinbarung nach BetrVG § 87, Pseudonymisierung von User-IDs in Telemetriedaten, Verbot von Leistungsschnittstellen.',
        residualImpact: 2,
        residualLikelihood: 1
      }
    ]
  },
  {
    id: 'cctv_server_room',
    title: 'Biometrische Videoüberwachung des Serverraums & Rechenzentrums',
    description: 'Zur Erfüllung von ISO 27001 Zutrittskontroll-Anforderungen soll der Serverraum mit Gesichtserkennung und 24/7-Kameraüberwachung ausgestattet werden.',
    criteria: ['crit_systematic_mon', 'crit_special_categories', 'crit_vulnerable_subjects'],
    risks: [
      {
        id: 'risk_biometric_misuse',
        category: 'Besondere Kategorien (Art. 9)',
        description: 'Biometrische Gesichtsdaten von IT-Mitarbeitern und externen Dienstleistern könnten kompromittiert oder zweckentfremdet werden.',
        impact: 5,
        likelihood: 2,
        mitigation: 'Keine Speicherung von Rohbildern; lediglich irreversible Hash-Templates auf getrennten Hardware-Security-Modules (HSM).',
        residualImpact: 2,
        residualLikelihood: 1
      },
      {
        id: 'risk_permanent_monitoring',
        category: 'Verhältnismäßigkeit & Dauerüberwachung',
        description: 'Mitarbeiter im Arbeitsbereich werden durchgehend optisch erfasst und empfinden Überwachungsdruck.',
        impact: 4,
        likelihood: 4,
        mitigation: 'Kameraerfassung nur an Schleusentüren und Notausgängen, Verpixelung von Arbeitsplätzen, Löschung nach maximal 72 Stunden.',
        residualImpact: 1,
        residualLikelihood: 1
      }
    ]
  },
  {
    id: 'us_cloud_migration',
    title: 'Migration der Kundendatenbank zu einem US-Hyperscaler (AVV & Drittlandstransfer)',
    description: 'Migration von 500.000 europäischen Kundendaten in eine Cloud eines US-Anbieters nach Wegfall des Privacy Shield / unter Berücksichtigung des EU-US DPF.',
    criteria: ['crit_large_scale', 'crit_denial_service'],
    risks: [
      {
        id: 'risk_third_country_access',
        category: 'Drittlandstransfer & CLOUD Act',
        description: 'Zugriff US-amerikanischer Sicherheitsbehörden auf Kundendaten ohne richterlichen Beschluss nach US-Recht.',
        impact: 4,
        likelihood: 3,
        mitigation: 'EU-Only Region Hosting (Frankfurt), Customer-Managed Encryption Keys (CMEK) mit externem Key-Broker außerhalb der Cloud, Standardvertragsklauseln (SCC) + TIA.',
        residualImpact: 2,
        residualLikelihood: 1
      }
    ]
  }
];

/**
 * Bewertet den Schwellenwert für eine DSFA nach Art. 35 Abs. 1 & 3 DSGVO.
 * Faustregel nach den Richtlinien des EDSA (Europäischer Datenschutzausschuss):
 * Erfüllt ein Projekt >= 2 Kriterien, ist eine DSFA zwingend erforderlich!
 * @param {string[]} selectedCriteriaIds Liste ausgewählter Kriterien-IDs
 * @returns {{
 *   isDpiaRequired: boolean,
 *   score: number,
 *   selectedCount: number,
 *   thresholdSummary: string,
 *   recommendation: string
 * }}
 */
export function evaluateDpiaThreshold(selectedCriteriaIds = []) {
  const selectedCount = selectedCriteriaIds.length;
  let score = 0;

  selectedCriteriaIds.forEach(id => {
    const crit = DPIA_CRITERIA.find(c => c.id === id);
    if (crit) {
      score += crit.weight;
    }
  });

  // EDSA Regel: Wenn mindestens 2 Kriterien der Blacklist zutreffen, ist eine DSFA obligatorisch.
  const isDpiaRequired = selectedCount >= 2;

  let thresholdSummary = '';
  let recommendation = '';

  if (isDpiaRequired) {
    thresholdSummary = `DSFA zwingend erforderlich (${selectedCount} Kriterien erfüllt, Risikowert: ${score}).`;
    recommendation = 'Nach Art. 35 Abs. 1 DSGVO muss eine formelle Datenschutz-Folgenabschätzung vor Beginn der Datenverarbeitung durchgeführt und dokumentiert werden. Bei unverändert hohem Restrisiko ist die Aufsichtsbehörde (Art. 36) zu konsultieren.';
  } else if (selectedCount === 1) {
    thresholdSummary = `Grenzfall: 1 Kriterium erfüllt (Risikowert: ${score}).`;
    recommendation = 'Eine formale DSFA ist gesetzlich nicht zwingend vorgeschrieben, wird jedoch zur Nachweisbarkeit (Art. 5 Abs. 2 DSGVO Rechenschaftspflicht) dringend empfohlen.';
  } else {
    thresholdSummary = 'Keine DSFA erforderlich (0 Kriterien erfüllt).';
    recommendation = 'Standard-TOMs (Art. 32 DSGVO) sind ausreichend. Keine erhöhten Risiken für Grundrechte und Grundfreiheiten Betroffener identifiziert.';
  }

  return {
    isDpiaRequired,
    score,
    selectedCount,
    thresholdSummary,
    recommendation
  };
}

/**
 * Berechnet Risikowerte vor und nach Abhilfemaßnahmen
 * @param {Array<{
 *   id: string,
 *   category: string,
 *   description: string,
 *   impact: number,
 *   likelihood: number,
 *   mitigation: string,
 *   residualImpact: number,
 *   residualLikelihood: number
 * }>} risks
 */
export function calculateRiskScores(risks = DEFAULT_DPIA_RISKS) {
  return risks.map(r => {
    const rawScore = r.impact * r.likelihood;
    const residualScore = r.residualImpact * r.residualLikelihood;
    const reductionPercent = rawScore > 0 ? Math.round(((rawScore - residualScore) / rawScore) * 100) : 0;
    
    return {
      ...r,
      rawScore,
      residualScore,
      reductionPercent,
      isAcceptable: residualScore <= 6
    };
  });
}

/**
 * Generiert ein druckfertiges IHK Markdown-Dokument für den Anhang der Projektdokumentation.
 * @param {string} projectTitle
 * @param {string[]} selectedCriteriaIds
 * @param {Array<any>} risks
 * @returns {string}
 */
export function generateDpiaMarkdownDoc(projectTitle = 'IHK-Abschlussprojekt', selectedCriteriaIds = [], risks = DEFAULT_DPIA_RISKS) {
  const threshold = evaluateDpiaThreshold(selectedCriteriaIds);
  const calculated = calculateRiskScores(risks);

  const lines = [
    `# Datenschutz-Folgenabschätzung (DSFA / DPIA) nach Art. 35 DSGVO`,
    `**Projekt:** ${projectTitle}`,
    `**Datum der Erstellung:** ${new Date().toLocaleDateString('de-DE')}`,
    `**Status:** ${threshold.isDpiaRequired ? 'DSFA verpflichtend durchgeführt' : 'Schwellenwertprüfung: Keine DSFA obligatorisch'}`,
    '',
    `## 1. Schwellenwertanalyse (Prüfung nach Art. 35 Abs. 1 & 3 DSGVO)`,
    `- **Erfüllte Kriterien:** ${threshold.selectedCount} von ${DPIA_CRITERIA.length}`,
    `- **Gesamt-Risikogewichtung:** ${threshold.score}`,
    `- **Ergebnis:** ${threshold.thresholdSummary}`,
    `- **Handlungsempfehlung:** ${threshold.recommendation}`,
    '',
    `### Identifizierte Kriterien der DSK-Blacklist:`,
    selectedCriteriaIds.length === 0 ? '- *Keine kritischen Kriterien ausgewählt.*' : ''
  ];

  selectedCriteriaIds.forEach(id => {
    const c = DPIA_CRITERIA.find(item => item.id === id);
    if (c) {
      lines.push(`- **${c.title}** (Gewicht: ${c.weight}): ${c.desc}`);
    }
  });

  lines.push('');
  lines.push('## 2. Risikoanalyse für Betroffene & Abhilfemaßnahmen');
  lines.push('| Kategorie / Risiko | Ursprüngliches Risiko (A × E) | Geplante Abhilfemaßnahmen | Restrisiko (A × E) | Status |');
  lines.push('|---|---|---|---|---|');

  calculated.forEach(r => {
    const raw = `${r.rawScore} (${r.impact} × ${r.likelihood})`;
    const res = `${r.residualScore} (${r.residualImpact} × ${r.residualLikelihood})`;
    const status = r.isAcceptable ? 'Akzeptabel' : 'Überwachung';
    lines.push(`| **${r.category}**<br>${r.description} | ${raw} | ${r.mitigation} | ${res} (-${r.reductionPercent}%) | ${status} |`);
  });

  lines.push('');
  lines.push('## 3. Gesamtfazit & Freigabe');
  lines.push('Die verbleibenden Restrisiken für die Rechte und Freiheiten der betroffenen Personen wurden durch die oben genannten technischen und organisatorischen Maßnahmen auf ein vertretbares Niveau reduziert. Eine vorherige Konsultation der Datenschutzaufsichtsbehörde nach Art. 36 DSGVO ist somit **nicht erforderlich**.');
  lines.push('');
  lines.push('---');
  lines.push('*Erstellt mit dem IHK DSFA Studio (IT-DevGame)*');

  return lines.join('\n');
}
