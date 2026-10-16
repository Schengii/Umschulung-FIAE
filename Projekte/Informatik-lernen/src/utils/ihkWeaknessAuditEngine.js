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

    if (wf.id === 'LF1') {
      recommendedLab = 'wiso_company_forms_lab';
      tip = 'Rechtsformen, Organe und Unternehmensstrukturen wiederholen.';
    } else if (wf.id === 'LF2') {
      recommendedLab = 'rack_configurator';
      tip = 'Hardware-Komponenten, USV-Dimensionierung und Arbeitsplatzausstattung üben.';
    } else if (wf.id === 'LF3') {
      recommendedLab = 'dhcp_dora_lab';
      tip = 'DHCP DORA-Handshake, Subnetting und Client-Netzwerk-Konfiguration festigen.';
    } else if (wf.id === 'LF4') {
      recommendedLab = 'bsi_grundschutz_lab';
      tip = 'BSI IT-Grundschutz (BSI 200-2/200-3) und DSGVO TOM-Katalog üben.';
    } else if (wf.id === 'LF5') {
      recommendedLab = 'postgres_index_types_lab';
      tip = 'SQL-Optimierung, Normalformen und Index-Tuning auffrischen.';
    } else if (wf.id === 'LF6') {
      recommendedLab = 'itsm_simulator';
      tip = 'ITIL Incident Management, SLAs und Ticket-Bearbeitung wiederholen.';
    } else if (wf.id === 'LF7') {
      recommendedLab = 'ble_sensor';
      tip = 'Cyber-physische Systeme, Sensorik und IoT-Protokolle trainieren.';
    } else if (wf.id === 'LF8') {
      recommendedLab = 'open_api_contract_lab';
      tip = 'REST API Schnittstellenverträge und Datenflüsse modellieren.';
    } else if (wf.id === 'LF9') {
      recommendedLab = 'ipv6_ndp_lab';
      tip = 'IPv6 SLAAC, EUI-64 und Neighbor Discovery Protocol wiederholen.';
    } else if (wf.id === 'LF10' || wf.id === 'LF11') {
      recommendedLab = 'clean_arch_lab';
      tip = 'Clean Architecture, Hexagonale Architektur & DIP-Linter durchgehen.';
    } else if (wf.id === 'LF12') {
      recommendedLab = 'struktogramm_lab';
      tip = 'Algorithmen-Entwurf, Struktogramme und Schreibtischtests absolvieren.';
    }

    return {
      ...wf,
      recommendedLab,
      tip
    };
  });
}

/**
 * Mappt eine Fragenkategorie bzw. Fragendetails auf ein IHK-Lernfeld (LF 1 - 12)
 * Unterstützt sowohl `question.question` als auch `question.frage` (Drill-Format).
 * @param {any} question
 * @returns {string} lfId (z. B. 'LF4')
 */
export function mapQuestionToLernfeld(question) {
  if (!question) return 'LF1';
  const category = (question.category || question.kategorie || '').toLowerCase();
  const text = (question.question || question.frage || '').toLowerCase();

  if (category.includes('wiso') || category.includes('wirtschaft') || category.includes('unternehmen')) {
    return 'LF1';
  }
  if (category.includes('hardware') || category.includes('usv') || category.includes('arbeitsplatz')) {
    return 'LF2';
  }
  if (category.includes('dhcp') || category.includes('client') || text.includes('dora')) {
    return 'LF3';
  }
  if (category.includes('security') || category.includes('datenschutz') || category.includes('dsgvo') || category.includes('bsi')) {
    return 'LF4';
  }
  if (category.includes('datenbank') || category.includes('sql') || category.includes('normalisierung')) {
    return 'LF5';
  }
  if (category.includes('server') || category.includes('itil') || category.includes('itsm') || category.includes('service')) {
    return 'LF6';
  }
  if (category.includes('iot') || category.includes('sensor') || category.includes('industrie') || category.includes('cyber-physisch')) {
    return 'LF7';
  }
  if (category.includes('api') || category.includes('rest') || category.includes('schnittstelle') || category.includes('datenfluss')) {
    return 'LF8';
  }
  if (category.includes('netzwerk') || category.includes('routing') || category.includes('subnet') || category.includes('vlan') || category.includes('ipv6')) {
    return 'LF9';
  }
  if (category.includes('architektur') || category.includes('clean') || category.includes('ui') || category.includes('pattern')) {
    return 'LF10';
  }
  if (category.includes('programmierung') || category.includes('test') || category.includes('unit') || category.includes('tdd')) {
    return 'LF11';
  }
  if (category.includes('algorithmus') || category.includes('struktogramm') || category.includes('entwicklung')) {
    return 'LF12';
  }

  return 'LF4'; // Fallback
}
