// @ts-check
/**
 * IHK Prüfungs-Countdown & Adaptiver Lernplan-Generator Engine
 * Berechnet verbleibende Lernwochen bis zum AP1/AP2-Prüfungstermin,
 * analysiert Schwachstellen aus Quiz-Statistiken und generiert strukturierte Wochen-Sprints.
 */

/**
 * Standard IHK Prüfungstermine
 */
export const IHK_EXAM_DATES = [
  { id: 'winter_2026', name: 'Winterprüfung 2026/2027 (AP1 & AP2)', date: '2026-11-25' },
  { id: 'summer_2027', name: 'Sommerprüfung 2027 (AP1 & AP2)', date: '2027-05-05' },
  { id: 'winter_2027', name: 'Winterprüfung 2027/2028 (AP1 & AP2)', date: '2027-11-24' }
];

export const IHK_DISCIPLINES = [
  { id: 'fiae', name: 'Fachinformatiker Anwendungsentwicklung (FIAE)' },
  { id: 'fisi', name: 'Fachinformatiker Systemintegration (FISI)' },
  { id: 'fidp', name: 'Fachinformatiker Daten- und Prozessanalyse (FIDP)' },
  { id: 'itse', name: 'IT-Systemelektroniker (IT-SE)' }
];

/**
 * Kernmodule nach Fachrichtung und Prüfungsrelevanz
 */
/** @type {Record<string, Array<{ title: string, tags: string[], recommendedLab: string }>>} */
export const STUDY_TRACKS = {
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
  itse: [
    { title: 'IPv6 Routing & Subnetting (VLSM/CIDR)', tags: ['#IPv6', '#Subnetting'], recommendedLab: 'ipv6_ndp_lab' },
    { title: 'Rack-Konfiguration & USV Strombedarfsberechnung', tags: ['#Hardware', '#Rack', '#USV'], recommendedLab: 'rack_configurator' },
    { title: 'BSI IT-Grundschutz (Zutritt, USV & Redundanz)', tags: ['#BSI', '#Hardware'], recommendedLab: 'bsi_grundschutz_lab' },
    { title: 'WISO: Kosten- und Leistungsrechnung & Lohn', tags: ['#WISO', '#Kalkulation'], recommendedLab: 'wiso_payroll_lab' }
  ]
};

/**
 * Errechnet verbleibende Tage und Wochen bis zum Prüfungsdatum
 * @param {string} targetDateStr - z. B. '2026-11-25'
 * @param {Date} [currentDate=new Date()]
 */
export function calculateExamCountdown(targetDateStr, currentDate = new Date()) {
  const target = new Date(targetDateStr);
  const diffMs = target.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const remainingWeeks = Math.max(0, Math.ceil(diffDays / 7));

  return {
    daysRemaining: Math.max(0, diffDays),
    weeksRemaining: remainingWeeks,
    isExpired: diffDays <= 0
  };
}

/**
 * Generiert einen adaptiven Wochenplan
 * @param {string} discipline - 'fiae' | 'fisi' | 'fidp' | 'itse'
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
      recommendedLab: isMockExamWeek ? 'exam_simulator' : currentTopic.recommendedLab,
      targetHours: 6,
      completed: false
    });
  }

  return weeklyPlan;
}
