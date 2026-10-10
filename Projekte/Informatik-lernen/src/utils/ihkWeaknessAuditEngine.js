// @ts-check
/**
 * Adaptiver Lern- & Schwachstellen-Audit Assistent Engine
 * Analysiert Prüfungs- und Testergebnisse, identifiziert Wissenslücken
 * und generiert maßgeschneiderte Wiederholungs-Sitzungen (Targeted Drills).
 */

/**
 * @typedef {Object} LernfeldPerformance
 * @property {string} id - z. B. 'LF7'
 * @property {string} title
 * @property {number} correctCount
 * @property {number} totalCount
 * @property {number} errorRatePercent
 */

/**
 * Standard-Kategorien nach IHK-Lernfeldern
 */
export const IHK_LEARN_FIELDS = [
  { id: 'LF1', title: 'LF 1: Das Unternehmen und die eigene Rolle im Betrieb' },
  { id: 'LF2', title: 'LF 2: Arbeitsplätze nach Kundenwunsch ausstatten' },
  { id: 'LF3', title: 'LF 3: Clients in Netzwerke einbinden' },
  { id: 'LF4', title: 'LF 4: Schutzbedarfsanalyse & Datensicherheit (BSI & DSGVO)' },
  { id: 'LF5', title: 'LF 5: Software zur Verwaltung von Daten anpassen (SQL)' },
  { id: 'LF6', title: 'LF 6: Serviceanfragen bearbeiten (ITIL & ITSM)' },
  { id: 'LF7', title: 'LF 7: Cyber-physische Systeme ergänzen & IoT' },
  { id: 'LF8', title: 'LF 8: Datenflüsse optimieren & Schnittstellen' },
  { id: 'LF9', title: 'LF 9: Netzwerke und Dienste bereitstellen (IPv6, Routing)' },
  { id: 'LF10', title: 'LF 10: Benutzerschnittstellen gestalten & Software-Architektur' },
  { id: 'LF11', title: 'LF 11: Funktionalität in Softwarearchitekturen realisieren' },
  { id: 'LF12', title: 'LF 12: Kundenspezifische Anwendungsentwicklung' }
];

/**
 * Analysiert Roh-Testergebnisse und berechnet Fehlerschwerpunkte
 * @param {Array<{ lfId: string, isCorrect: boolean }>} answerHistory
 * @returns {{ auditedFields: LernfeldPerformance[], weakFields: LernfeldPerformance[], overallScore: number }}
 */
export function auditWeaknesses(answerHistory) {
  if (!answerHistory || answerHistory.length === 0) {
    return {
      auditedFields: [],
      weakFields: [],
      overallScore: 100
    };
  }

  /** @type {Record<string, { correct: number, total: number }>} */
  const stats = {};

  answerHistory.forEach(a => {
    if (!stats[a.lfId]) {
      stats[a.lfId] = { correct: 0, total: 0 };
    }
    stats[a.lfId].total++;
    if (a.isCorrect) {
      stats[a.lfId].correct++;
    }
  });

  const auditedFields = Object.keys(stats).map(lfId => {
    const meta = IHK_LEARN_FIELDS.find(f => f.id === lfId) || { id: lfId, title: `Lernfeld ${lfId}` };
    const total = stats[lfId].total;
    const correct = stats[lfId].correct;
    const errorRatePercent = Math.round(((total - correct) / total) * 100);

    return {
      id: lfId,
      title: meta.title,
      correctCount: correct,
      totalCount: total,
      errorRatePercent
    };
  });

  // Schwachstellen = Fehlerquote > 30% und mindestens 2 Fragen beantwortet
  const weakFields = auditedFields
    .filter(f => f.errorRatePercent >= 30 && f.totalCount >= 2)
    .sort((a, b) => b.errorRatePercent - a.errorRatePercent);

  const totalAnswered = answerHistory.length;
  const totalCorrect = answerHistory.filter(a => a.isCorrect).length;
  const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

  return {
    auditedFields,
    weakFields,
    overallScore
  };
}

/**
 * Generiert gezielten Empfehlungs-Lehrplan basierend auf Schwachstellen
 * @param {LernfeldPerformance[]} weakFields
 */
export function generateWeaknessRecommendations(weakFields) {
  return weakFields.map(wf => {
    let recommendedLab = 'dashboard';
    let tip = 'Theorie im Lernfeld-Modul vertiefen.';

    if (wf.id === 'LF4') {
      recommendedLab = 'bsi_grundschutz_lab';
      tip = 'BSI IT-Grundschutz (BSI 200-2/200-3) und DSGVO TOM-Katalog üben.';
    } else if (wf.id === 'LF9' || wf.id === 'LF3') {
      recommendedLab = 'ipv6_ndp_lab';
      tip = 'IPv6 SLAAC, EUI-64 und Neighbor Discovery Protocol wiederholen.';
    } else if (wf.id === 'LF10' || wf.id === 'LF11') {
      recommendedLab = 'clean_arch_lab';
      tip = 'Clean Architecture & Dependency Inversion Linter durchgehen.';
    } else if (wf.id === 'LF5') {
      recommendedLab = 'postgres_index_types_lab';
      tip = 'SQL-Optimierung, Normalformen und Index-Tuning auffrischen.';
    }

    return {
      ...wf,
      recommendedLab,
      tip
    };
  });
}
