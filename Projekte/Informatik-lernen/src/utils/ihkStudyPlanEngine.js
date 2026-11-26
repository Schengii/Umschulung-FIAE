// @ts-check
/**
 * IHK Prüfungs-Countdown Engine
 * Prüfungstermine, Fachrichtungen und Countdown. Der Lernplan selbst steht in `studyPlanEngine.js`.
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

export const IHK_DISCIPLINES = [
  { id: 'fiae', name: 'Fachinformatiker Anwendungsentwicklung (FIAE)' },
  { id: 'fisi', name: 'Fachinformatiker Systemintegration (FISI)' },
  { id: 'fidp', name: 'Fachinformatiker Daten- und Prozessanalyse (FIDP)' },
  { id: 'fidv', name: 'Fachinformatiker Digitale Vernetzung (FIDV)' },
  { id: 'itse', name: 'IT-Systemelektroniker (IT-SE)' },
  { id: 'itsm', name: 'Kaufleute für IT-Systemmanagement (ITSM)' }
];

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
