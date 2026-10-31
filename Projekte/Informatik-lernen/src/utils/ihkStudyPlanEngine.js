// @ts-check
/**
 * IHK Prüfungs-Countdown & Adaptiver Lernplan-Generator Engine
 * Berechnet verbleibende Lernwochen bis zum AP1/AP2-Prüfungstermin,
 * analysiert Schwachstellen aus Quiz-Statistiken und generiert strukturierte Wochen-Sprints.
 */

/**
 * Standard IHK Prüfungstermine
 */
/**
 * Standard IHK Prüfungstermine generieren
 * @param {number} [baseYear=new Date().getFullYear()]
 * @returns {Array<{ id: string, name: string, date: string }>}
 */
export function getIhkExamDates(baseYear = new Date().getFullYear()) {
  return [
    { id: `winter_${baseYear}`, name: `Winterprüfung ${baseYear}/${baseYear + 1} (AP1 & AP2)`, date: `${baseYear}-11-25` },
    { id: `summer_${baseYear + 1}`, name: `Sommerprüfung ${baseYear + 1} (AP1 & AP2)`, date: `${baseYear + 1}-05-05` },
    { id: `winter_${baseYear + 1}`, name: `Winterprüfung ${baseYear + 1}/${baseYear + 2} (AP1 & AP2)`, date: `${baseYear + 1}-11-24` }
  ];
}

export const IHK_EXAM_DATES = getIhkExamDates();

export const IHK_DISCIPLINES = [
  { id: 'fiae', name: 'Fachinformatiker Anwendungsentwicklung (FIAE)' },
  { id: 'fisi', name: 'Fachinformatiker Systemintegration (FISI)' },
  { id: 'fidp', name: 'Fachinformatiker Daten- und Prozessanalyse (FIDP)' },
  { id: 'fidv', name: 'Fachinformatiker Digitale Vernetzung (FIDV)' },
  { id: 'itse', name: 'IT-Systemelektroniker (IT-SE)' },
  { id: 'itsm', name: 'Kaufleute für IT-Systemmanagement (ITSM)' }
];

/**
 * Kernmodule nach Fachrichtung und Prüfungsrelevanz
 */
/** @type {Record<string, Array<{ title: string, tags: string[], recommendedLab: string }>>} */
const STUDY_TRACKS = {
  fiae: [
    { title: 'Software-Architektur, Clean Code & Entwurfsmuster', tags: ['#CleanCode', '#Architektur', '#Patterns'], recommendedLab: 'clean_code_lab' },
    { title: 'Relationales Datenbankdesign & SQL Optimierung', tags: ['#SQL', '#Postgres', '#ERD'], recommendedLab: 'postgres_index_types_lab' },
    { title: 'Agiles Projektmanagement, Scrum & Burndown (AP2 A)', tags: ['#Scrum', '#Burndown', '#IHK'], recommendedLab: 'ihk_burndown_lab' },
    { title: 'BSI IT-Grundschutz, NIS-2 & DSGVO TOMs', tags: ['#BSI', '#NIS2', '#DSGVO'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Handelskalkulation, Deckungsbeitrag & Lohn', tags: ['#WISO', '#Kalkulation', '#Payroll'], recommendedLab: 'wiso_payroll_lab' }
  ],
  fisi: [
    { title: 'IPv6 SLAAC, DHCPv6 & Neighbor Discovery Protocol', tags: ['#IPv6', '#SLAAC', '#NDP'], recommendedLab: 'ipv6_ndp_lab' },
    { title: 'BSI IT-Grundschutz & NIS-2 Risiko-Studio', tags: ['#BSI', '#Grundschutz', '#NIS2'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'Speicher- & Dateisysteme: Btrfs/ZFS CoW Snapshots & RAID', tags: ['#Btrfs', '#Snapshots', '#RAID'], recommendedLab: 'linux_cow_snapshot_lab' },
    { title: 'Netzwerksicherheit, DNSSEC & TLS 1.3 Handshake', tags: ['#DNSSEC', '#TLS', '#Security'], recommendedLab: 'dnssec_validation_lab' },
    { title: 'WISO & Arbeitsrecht: Kündigungsfristen & Sozialabgaben', tags: ['#WISO', '#Arbeitsrecht', '#Payroll'], recommendedLab: 'wiso_payroll_lab' }
  ],
  fidp: [
    { title: 'ETL-Pipelines, Data Lineage & Datenqualität', tags: ['#ETL', '#DataLineage', '#SQL'], recommendedLab: 'data_lineage_etl_lab' },
    { title: 'PostgreSQL Partitionierung & Index Types (BRIN/GIN)', tags: ['#Postgres', '#BigData'], recommendedLab: 'postgres_index_types_lab' },
    { title: 'Datenschutz-Folgenabschätzung (DSFA) & BSI Schutzbedarf', tags: ['#DSFA', '#BSI', '#Datenschutz'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Deckungsbeitrag, Break-Even & Lohnabrechnung', tags: ['#WISO', '#Lohn', '#Controlling'], recommendedLab: 'wiso_payroll_lab' }
  ],
  fidv: [
    { title: 'Cyber-physische Systeme, Edge Gateway & MQTT/OPC-UA', tags: ['#IoT', '#MQTT', '#OPCUA'], recommendedLab: 'ble_sensor' },
    { title: 'Industrielle Netzwerke, VLAN Trunking & Redundanz', tags: ['#VLAN', '#Trunking', '#RSTP'], recommendedLab: 'vlan_trunking_lab' },
    { title: 'BSI IT-Grundschutz für vernetzte Systeme & ICS', tags: ['#BSI', '#ICS', '#Security'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Kosten- und Leistungsrechnung & Lohn', tags: ['#WISO', '#Kalkulation'], recommendedLab: 'wiso_payroll_lab' }
  ],
  itse: [
    { title: 'IPv6 Routing & Subnetting (VLSM/CIDR)', tags: ['#IPv6', '#Subnetting'], recommendedLab: 'ipv6_ndp_lab' },
    { title: 'Rack-Konfiguration & USV Strombedarfsberechnung', tags: ['#Hardware', '#Rack', '#USV'], recommendedLab: 'rack_configurator' },
    { title: 'BSI IT-Grundschutz (Zutritt, USV & Redundanz)', tags: ['#BSI', '#Hardware'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Kosten- und Leistungsrechnung & Lohn', tags: ['#WISO', '#Kalkulation'], recommendedLab: 'wiso_payroll_lab' }
  ],
  itsm: [
    { title: 'IT-Service-Management (ITIL 4, SLAs & Incident Management)', tags: ['#ITSM', '#ITIL', '#ServiceDesk'], recommendedLab: 'itsm_simulator' },
    { title: 'Beschaffung, Nutzwertanalyse & Angebotsvergleich', tags: ['#NWA', '#Beschaffung', '#WISO'], recommendedLab: 'wiso_kalkulation' },
    { title: 'BSI IT-Grundschutz, DSGVO & Lizenzmanagement', tags: ['#BSI', '#DSGVO', '#Compliance'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Handelskalkulation, Deckungsbeitrag & Finanzierung', tags: ['#WISO', '#Finanzierung', '#Kalkulation'], recommendedLab: 'wiso_payroll_lab' }
  ]
};

/**
 * Errechnet verbleibende Tage und Wochen bis zum Prüfungsdatum über UTC-Mitternacht
 * @param {string} targetDateStr - z. B. '2026-11-25'
 * @param {Date} [currentDate=new Date()]
 */
export function calculateExamCountdown(targetDateStr, currentDate = new Date()) {
  const [tY, tM, tD] = targetDateStr.split('-').map(Number);
  const targetUtc = Date.UTC(tY, tM - 1, tD);
  const currentUtc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const diffMs = targetUtc - currentUtc;
  const diffDays = Math.ceil(diffMs / 86400000);
  const remainingWeeks = Math.max(0, Math.ceil(diffDays / 7));

  return {
    daysRemaining: Math.max(0, diffDays),
    weeksRemaining: remainingWeeks,
    isExpired: diffDays <= 0
  };
}

/**
 * Generiert einen adaptiven Wochenplan
 * @param {string} discipline - 'fiae' | 'fisi' | 'fidp' | 'fidv' | 'itse' | 'itsm'
 * @param {number} totalWeeks - Verfügbare Wochen
 */
export function generateAdaptiveStudyPlan(discipline, totalWeeks = 8) {
  const tracks = STUDY_TRACKS[discipline] || STUDY_TRACKS.fiae;
  const weeksToPlan = Math.max(2, Math.min(totalWeeks, 24));
  
  const weeklyPlan = [];
  for (let w = 1; w <= weeksToPlan; w++) {
    const trackIndex = (w - 1) % tracks.length;
    const currentTopic = tracks[trackIndex];
    const isMockExamWeek = w === weeksToPlan || w === Math.floor(weeksToPlan / 2);

    weeklyPlan.push({
      weekNumber: w,
      title: isMockExamWeek ? `Woche ${w}: Prüfungssimulation & Wissens-Audit` : `Woche ${w}: ${currentTopic.title}`,
      focus: currentTopic.title,
      tags: currentTopic.tags,
      recommendedLab: isMockExamWeek ? 'exam' : currentTopic.recommendedLab,
      targetHours: 6,
      completed: false
    });
  }

  return weeklyPlan;
}
