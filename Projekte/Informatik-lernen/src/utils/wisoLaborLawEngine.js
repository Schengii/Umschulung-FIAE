// @ts-check
/**
 * WISO Arbeitsrecht, Kündigungsfristen & Kündigungsschutz Engine
 * Prüfungsrelevant nach BGB § 622, KSchG, MuSchG, SGB IX & JArbSchG
 * für IHK-Abschlussprüfung Teil 1 & Teil 2 (WISO / Wirtschafts- und Sozialkunde).
 */

/**
 * Berechnet die gesetzliche Kündigungsfrist für Arbeitgeber nach BGB § 622 Abs. 1 & 2.
 * @param {number} yearsInCompany Betriebszugehörigkeit in vollen Jahren
 * @param {boolean} isInProbation Befindet sich der Arbeitnehmer in der Probezeit (max. 6 Monate)?
 * @param {boolean} isInitiatedByEmployee Kündigung geht vom Arbeitnehmer aus?
 * @returns {{
 *   termWeeks: number,
 *   termMonths: number,
 *   targetDateDescription: string,
 *   legalBasis: string,
 *   summary: string
 * }}
 */
export function calculateNoticePeriod(yearsInCompany = 0, isInProbation = false, isInitiatedByEmployee = false) {
  // 1. Probezeit (BGB § 622 Abs. 3): 2 Wochen zu jedem Tag
  if (isInProbation) {
    return {
      termWeeks: 2,
      termMonths: 0,
      targetDateDescription: 'Zu jedem beliebigen Kalendertag (ohne Bindung an Monatsende/15.)',
      legalBasis: 'BGB § 622 Abs. 3 (Probezeit)',
      summary: '2 Wochen Kündigungsfrist zu jedem beliebigen Tag.'
    };
  }

  // 2. Kündigung durch den Arbeitnehmer (BGB § 622 Abs. 1): Grundkündigungsfrist 4 Wochen zum 15. oder Monatsende
  if (isInitiatedByEmployee) {
    return {
      termWeeks: 4,
      termMonths: 0,
      targetDateDescription: 'Zum 15. oder zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 1 (Grundkündigungsfrist Arbeitnehmer)',
      summary: '4 Wochen zum 15. oder zum Ende eines Kalendermonats.'
    };
  }

  // 3. Kündigung durch Arbeitgeber nach Betriebszugehörigkeit (BGB § 622 Abs. 2)
  if (yearsInCompany < 2) {
    return {
      termWeeks: 4,
      termMonths: 0,
      targetDateDescription: 'Zum 15. oder zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 1 (Grundkündigungsfrist)',
      summary: '4 Wochen zum 15. oder zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 5) {
    return {
      termWeeks: 0,
      termMonths: 1,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 1 (2 Jahre Betriebszugehörigkeit)',
      summary: '1 Monat zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 8) {
    return {
      termWeeks: 0,
      termMonths: 2,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 2 (5 Jahre Betriebszugehörigkeit)',
      summary: '2 Monate zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 10) {
    return {
      termWeeks: 0,
      termMonths: 3,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 3 (8 Jahre Betriebszugehörigkeit)',
      summary: '3 Monate zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 12) {
    return {
      termWeeks: 0,
      termMonths: 4,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 4 (10 Jahre Betriebszugehörigkeit)',
      summary: '4 Monate zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 15) {
    return {
      termWeeks: 0,
      termMonths: 5,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 5 (12 Jahre Betriebszugehörigkeit)',
      summary: '5 Monate zum Ende eines Kalendermonats.'
    };
  } else if (yearsInCompany < 20) {
    return {
      termWeeks: 0,
      termMonths: 6,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 6 (15 Jahre Betriebszugehörigkeit)',
      summary: '6 Monate zum Ende eines Kalendermonats.'
    };
  } else {
    return {
      termWeeks: 0,
      termMonths: 7,
      targetDateDescription: 'Zum Ende eines Kalendermonats',
      legalBasis: 'BGB § 622 Abs. 2 Nr. 7 (20 Jahre Betriebszugehörigkeit)',
      summary: '7 Monate zum Ende eines Kalendermonats.'
    };
  }
}

/**
 * Prüft den allgemeinen und besonderen Kündigungsschutz.
 * @param {{
 *   employeeCount: number,
 *   employmentMonths: number,
 *   isPregnant: boolean,
 *   hasDisability: boolean,
 *   isWorksCouncilMember: boolean,
 *   isApprenticeAfterProbation: boolean
 * }} params
 * @returns {{
 *   hasGeneralProtection: boolean,
 *   hasSpecialProtection: boolean,
 *   specialProtectionReasons: string[],
 *   requiresSocialJustification: boolean,
 *   summary: string
 * }}
 */
export function evaluateProtection({
  employeeCount = 12,
  employmentMonths = 10,
  isPregnant = false,
  hasDisability = false,
  isWorksCouncilMember = false,
  isApprenticeAfterProbation = false
}) {
  const reasons = [];

  if (isPregnant) {
    reasons.push('Mutterschutz (§ 17 MuSchG): Absolutes Kündigungsverbot während der Schwangerschaft und bis 4 Monate nach Entbindung.');
  }
  if (hasDisability) {
    reasons.push('Schwerbehinderung (§ 168 SGB IX): Vorherige Zustimmung des Integrationsamtes zwingend erforderlich.');
  }
  if (isWorksCouncilMember) {
    reasons.push('Betriebsratsmitglied (§ 15 KSchG): Ordentliche Kündigung ausgeschlossen, nur außerordentliche Kündigung mit Betriebsratszustimmung möglich.');
  }
  if (isApprenticeAfterProbation) {
    reasons.push('Auszubildender nach der Probezeit (§ 22 BBiG): Ordentliche Kündigung durch den Ausbildenden ausgeschlossen; nur fristlos aus wichtigem Grund.');
  }

  // Allgemeiner Kündigungsschutz nach KSchG:
  // 1. Betrieb hat regelmäßig mehr als 10 Vollzeit-Arbeitnehmer (Kleinbetriebsklausel § 23 KSchG)
  // 2. Arbeitsverhältnis besteht länger als 6 Monate (§ 1 KSchG)
  const hasGeneralProtection = employeeCount > 10 && employmentMonths > 6;
  const hasSpecialProtection = reasons.length > 0;

  let summary = '';
  if (hasSpecialProtection) {
    summary = 'Besonderer Kündigungsschutz greift! Eine Kündigung ist unzulässig oder erfordert behördliche Genehmigungen.';
  } else if (hasGeneralProtection) {
    summary = 'Allgemeiner Kündigungsschutz (KSchG) greift: Kündigung bedarf sozialer Rechtfertigung (personen-, verhaltens- oder betriebsbedingt).';
  } else {
    summary = 'Kein KSchG-Kündigungsschutz (Kleinbetrieb <= 10 MA oder Wartezeit <= 6 Monate nicht erfüllt). Nur Treu und Glauben / Fristen nach BGB § 622 gelten.';
  }

  return {
    hasGeneralProtection,
    hasSpecialProtection,
    specialProtectionReasons: reasons,
    requiresSocialJustification: hasGeneralProtection && !hasSpecialProtection,
    summary
  };
}

/**
 * Berechnet das exakte kalendarische Beendigungsdatum und die 3-Wochen-Klagefrist (§ 4 KSchG)
 * ausgehend vom Datum des Zugangs der Kündigung (§ 130 BGB).
 * @param {string | Date} receiptDateStr - Datum des Zugangs (ISO 'YYYY-MM-DD' oder Date)
 * @param {number} yearsInCompany
 * @param {boolean} isInProbation
 * @param {boolean} isInitiatedByEmployee
 */
export function calculateTerminationCalendarDate(
  receiptDateStr,
  yearsInCompany = 0,
  isInProbation = false,
  isInitiatedByEmployee = false
) {
  const receipt = new Date(receiptDateStr);
  if (isNaN(receipt.getTime())) {
    return {
      isValid: false,
      terminationDateStr: '',
      lawsuitDeadlineStr: '',
      explanation: 'Ungültiges Zugangsdatum'
    };
  }

  const period = calculateNoticePeriod(yearsInCompany, isInProbation, isInitiatedByEmployee);

  // 1. Probezeit: 2 Wochen (14 Tage) ab Zugangstag (§ 187 Abs. 1 BGB Fristbeginn Tag nach Zugang)
  let terminationDate = new Date(receipt);
  if (isInProbation) {
    terminationDate.setDate(terminationDate.getDate() + 14);
  } else if (period.termWeeks === 4) {
    // 4 Wochen zum 15. oder Monatsende
    // Mindestens 28 Tage ab Zugang
    const earliest = new Date(receipt);
    earliest.setDate(earliest.getDate() + 28);

    // Finde den nächsten zulässigen Kündigungstermin (15. oder letzter Tag des Monats)
    let candidate = new Date(earliest.getFullYear(), earliest.getMonth(), 15);
    if (candidate < earliest) {
      // Wenn der 15. des Monats bereits verstrichen ist -> letzter Tag des Monats
      candidate = new Date(earliest.getFullYear(), earliest.getMonth() + 1, 0);
      if (candidate < earliest) {
        // Nächster Monat 15.
        candidate = new Date(earliest.getFullYear(), earliest.getMonth() + 1, 15);
      }
    }
    terminationDate = candidate;
  } else {
    // period.termMonths Monate zum Ende eines Kalendermonats
    // Frist beginnt am Folgetag und läuft X volle Monate zum Monatsletzten
    const months = period.termMonths;
    // Ende des Monats: receipt.getMonth() + months + 1, Tag 0
    terminationDate = new Date(receipt.getFullYear(), receipt.getMonth() + months + 1, 0);
  }

  // 3-Wochen-Klagefrist nach § 4 KSchG (21 Tage ab Zugang)
  const lawsuitDeadline = new Date(receipt);
  lawsuitDeadline.setDate(lawsuitDeadline.getDate() + 21);

  /** @param {Date} d */
  const formatLocalISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    isValid: true,
    receiptDateFormatted: receipt.toLocaleDateString('de-DE'),
    terminationDateFormatted: terminationDate.toLocaleDateString('de-DE'),
    terminationDateISO: formatLocalISO(terminationDate),
    lawsuitDeadlineFormatted: lawsuitDeadline.toLocaleDateString('de-DE'),
    period,
    explanation: `Bei Zugang am ${receipt.toLocaleDateString('de-DE')} endet das Arbeitsverhältnis mit der Frist von ${period.summary} am ${terminationDate.toLocaleDateString('de-DE')}. Eine Kündigungsschutzklage nach § 4 KSchG muss spätestens bis zum ${lawsuitDeadline.toLocaleDateString('de-DE')} beim Arbeitsgericht erhoben werden.`
  };
}
