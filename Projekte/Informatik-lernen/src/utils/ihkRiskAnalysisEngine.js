/**
 * IHK Risikoanalyse & Risikomatrix Engine (DIN EN 31010 / FMEA für AP2)
 * Berechnet Risikoprioritätszahlen (RPZ), 5x5 Ampel-Klassifizierung und generiert IHK-Projektdokumentationen.
 */

export const RISK_LEVELS = {
  LOW: { label: 'Gering (Akzeptabel)', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', maxRpz: 6 },
  MEDIUM: { label: 'Mittel (Überwachung & Minderung)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', maxRpz: 14 },
  HIGH: { label: 'Kritisch (Sofortmaßnahmen erforderlich)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', maxRpz: 25 }
};

export const RISK_STRATEGIES = {
  MITIGATE: { id: 'mitigate', name: 'Verminderung (Mitigation)', desc: 'Maßnahmen zur Senkung der Eintrittswahrscheinlichkeit oder Schadenshöhe.' },
  AVOID: { id: 'avoid', name: 'Vermeidung (Avoidance)', desc: 'Umplanung oder Verzicht auf risikobehaftete Komponenten/Abläufe.' },
  TRANSFER: { id: 'transfer', name: 'Übertragung (Transfer)', desc: 'Verlagerung des Risikos auf Dritte (z. B. Cloud-Provider SLA, Versicherungen).' },
  ACCEPT: { id: 'accept', name: 'Akzeptanz (Retention)', desc: 'Bewusstes Tragen des Restrisikos bei unverhältnismäßig hohen Gegenmaßnahmen.' }
};

export const DEFAULT_IHK_RISKS = [
  {
    id: 'risk-1',
    title: 'Ausfall oder Krankheit von Schlüsselpersonal',
    category: 'Personal / Organisation',
    probability: 3, // 1 - 5
    impact: 4,      // 1 - 5
    strategy: 'mitigate',
    preventiveMeasure: 'Pair Programming & Dokumentation in internem Confluence/Wiki',
    contingencyPlan: 'Vertretungsregelung durch Senior Developer aktiviert'
  },
  {
    id: 'risk-2',
    title: 'Verzögerung bei Hardware- / Lizenzlieferung',
    category: 'Beschaffung & Lieferkette',
    probability: 2,
    impact: 4,
    strategy: 'avoid',
    preventiveMeasure: 'Frühzeitige Vorab-Bestellung & Pufferzeit im CPM-Netzplan',
    contingencyPlan: 'Nutzung von Cloud-Staging-Instanzen zur Überbrückung'
  },
  {
    id: 'risk-3',
    title: 'Inkompatibilität der Drittanbieter-API',
    category: 'Technologie & Schnittstellen',
    probability: 3,
    impact: 3,
    strategy: 'mitigate',
    preventiveMeasure: 'Proof of Concept (PoC) in Analysephase & Adapter-Pattern',
    contingencyPlan: 'Mock-Service via WireMock für Frontend-Entwicklung'
  },
  {
    id: 'risk-4',
    title: 'Ungeplante Scope-Erweiterung (Scope Creep)',
    category: 'Projektmanagement',
    probability: 4,
    impact: 3,
    strategy: 'mitigate',
    preventiveMeasure: 'Präzise Lasten-/Pflichtenheft-Abnahme & Change-Request-Verfahren',
    contingencyPlan: 'Verschiebung von Nice-to-have Features in Folge-Release'
  }
];

/**
 * Berechnet die Risikoprioritätszahl (RPZ) und Einstufung eines Risikos
 */
export function calculateRiskItem(risk) {
  const prob = Math.min(5, Math.max(1, Number(risk.probability) || 1));
  const imp = Math.min(5, Math.max(1, Number(risk.impact) || 1));
  const rpz = prob * imp;

  let levelKey = 'LOW';
  if (rpz >= 15) {
    levelKey = 'HIGH';
  } else if (rpz >= 7) {
    levelKey = 'MEDIUM';
  }

  return {
    ...risk,
    probability: prob,
    impact: imp,
    rpz,
    levelKey,
    level: RISK_LEVELS[levelKey]
  };
}

/**
 * Analysiert eine Liste von Projektrisiken
 */
export function analyzeProjectRisks(risks = []) {
  if (!risks.length) {
    return {
      evaluatedRisks: [],
      totalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      averageRpz: 0,
      maxRpz: 0,
      overallRiskScore: 0,
      ihkCompliance: { isCompliant: false, feedback: 'Mindestens 3–4 Projektrisiken erforderlich.' }
    };
  }

  const evaluated = risks.map(calculateRiskItem);
  const totalCount = evaluated.length;
  const highCount = evaluated.filter(r => r.levelKey === 'HIGH').length;
  const mediumCount = evaluated.filter(r => r.levelKey === 'MEDIUM').length;
  const lowCount = evaluated.filter(r => r.levelKey === 'LOW').length;

  const totalRpz = evaluated.reduce((sum, r) => sum + r.rpz, 0);
  const averageRpz = Number((totalRpz / totalCount).toFixed(1));
  const maxRpz = Math.max(...evaluated.map(r => r.rpz));

  // IHK Konformitätsprüfung (DIN EN 31010)
  const hasMitigations = evaluated.every(r => r.preventiveMeasure && r.preventiveMeasure.trim().length > 5);
  const hasContingencies = evaluated.every(r => r.contingencyPlan && r.contingencyPlan.trim().length > 5);
  const countSufficient = totalCount >= 3;

  const isCompliant = countSufficient && hasMitigations && hasContingencies;
  let feedback = 'IHK-konform: Ausreichende Risikobewertung mit Prävention und Notfallmaßnahmen.';
  if (!countSufficient) {
    feedback = 'Warnung: Für eine IHK-Abschlussarbeit sollten mindestens 3–5 Risiken quantifiziert werden.';
  } else if (!hasMitigations || !hasContingencies) {
    feedback = 'Warnung: Zu jedem Risiko müssen konkrete Präventiv- und Notfallmaßnahmen (Contingency Plans) dokumentiert sein.';
  }

  return {
    evaluatedRisks: evaluated,
    totalCount,
    highCount,
    mediumCount,
    lowCount,
    averageRpz,
    maxRpz,
    overallRiskScore: averageRpz,
    ihkCompliance: { isCompliant, feedback }
  };
}

/**
 * Exportiert die Risikoanalyse als druckfertiges Markdown für die IHK-Dokumentation
 */
export function exportRiskAnalysisMarkdown(analysis, projectName = 'Abschlussprojekt') {
  const dateStr = new Date().toLocaleDateString('de-DE');
  let md = `# Risikoanalyse & Risikomanagement (DIN EN 31010)\n\n`;
  md += `**Projekt:** ${projectName}  \n`;
  md += `**Erstellt am:** ${dateStr}  \n`;
  md += `**Durchschnittliche RPZ:** ${analysis.averageRpz} / 25 | **Gesamtrisiko:** ${analysis.highCount > 0 ? 'Kritisch' : analysis.mediumCount > 0 ? 'Mittel' : 'Gering'}\n\n`;
  
  md += `### 1. Risikomatrix & Bewertungsmethode\n`;
  md += `Die Bewertung der identifizierten Projektrisiken erfolgt anhand der FMEA-Methodik (Fehlermöglichkeits- und Einflussanalyse) durch Multiplikation von Eintrittswahrscheinlichkeit ($W \\in [1, 5]$) und Schadensausmaß ($S \\in [1, 5]$) zur **Risikoprioritätszahl** ($RPZ = W \\times S$):\n\n`;
  md += `- **Grün (RPZ 1–6):** Geringes Restrisiko, Akzeptanz möglich.\n`;
  md += `- **Gelb (RPZ 7–14):** Mittleres Risiko, Überwachung und präventive Maßnahmen zwingend erforderlich.\n`;
  md += `- **Rot (RPZ 15–25):** Kritisches Risiko, sofortige Umplanung oder intensive Notfallpläne notwendig.\n\n`;

  md += `### 2. Risikotabelle\n\n`;
  md += `| Nr. | Risiko / Problemstellung | Kategorie | W (1–5) | S (1–5) | RPZ (1–25) | Strategie | Präventivmaßnahme | Notfallmaßnahme |\n`;
  md += `| :-- | :----------------------- | :-------- | :-----: | :-----: | :--------: | :-------- | :---------------- | :-------------- |\n`;

  analysis.evaluatedRisks.forEach((r, idx) => {
    md += `| R${idx + 1} | ${r.title} | ${r.category} | ${r.probability} | ${r.impact} | **${r.rpz}** (${r.levelKey}) | ${r.strategy} | ${r.preventiveMeasure} | ${r.contingencyPlan} |\n`;
  });

  md += `\n### 3. Fazit & Restrisiko-Bewertung\n`;
  md += `Durch die definierten Präventivmaßnahmen und klar zugewiesenen Notfallpläne wird das Gesamtrisiko auf ein beherrschbares Maß gesenkt. Es verbleiben keine ungedeckten kritischen Risiken ohne Handlungsstrategie.\n`;

  return md;
}
