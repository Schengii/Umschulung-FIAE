// @ts-check
/**
 * IHK DSGVO & TOM-Katalog Studio Engine (Art. 32 DSGVO)
 * Strukturierte technische und organisatorische Maßnahmen zur Sicherung
 * der Verarbeitung personenbezogener Daten (Schutzziele nach Art. 32 Abs. 1 DSGVO).
 * Pflichtbestandteil in IHK-Projektanträgen & Abschlussberichten (FIAE, FISI, FIDP, IT-SE).
 */

/**
 * @typedef {object} TomMeasure
 * @property {string} id
 * @property {string} category 'confidentiality' | 'integrity' | 'availability' | 'evaluation'
 * @property {string} categoryLabel
 * @property {string} title
 * @property {string} description
 * @property {string} example
 * @property {boolean} isImplemented
 */

/**
 * Standard-Katalog der IHK-relevanten TOMs nach den 4 Säulen von Art. 32 DSGVO.
 * @type {TomMeasure[]}
 */
export const DEFAULT_TOM_MEASURES = [
  // 1. Vertraulichkeit (Confidentiality)
  {
    id: 'tom_conf_1',
    category: 'confidentiality',
    categoryLabel: 'Vertraulichkeit (Art. 32 Abs. 1 lit. b)',
    title: 'Zutrittskontrolle (Physischer Schutz)',
    description: 'Verhinderung des unbefugten Betretens von Datenverarbeitungsanlagen.',
    example: 'Elektronische Transponder/Chipkarten, 2-Faktor-Serverraumschloss, Videoüberwachung der Zugänge.',
    isImplemented: true
  },
  {
    id: 'tom_conf_2',
    category: 'confidentiality',
    categoryLabel: 'Vertraulichkeit (Art. 32 Abs. 1 lit. b)',
    title: 'Zugangskontrolle (Authentifizierung)',
    description: 'Verhinderung der unbefugten Nutzung von IT-Systemen.',
    example: 'Passwort-Komplexitätsrichtlinie (>= 12 Zeichen), FIDO2 Passkeys / 2FA, automatischer Screen-Lock.',
    isImplemented: true
  },
  {
    id: 'tom_conf_3',
    category: 'confidentiality',
    categoryLabel: 'Vertraulichkeit (Art. 32 Abs. 1 lit. b)',
    title: 'Zugriffskontrolle & Berechtigungskonzept (RBAC)',
    description: 'Nutzer dürfen nur auf Daten zugreifen, für die sie eine Arbeitserlaubnis haben (Need-to-Know).',
    example: 'Rollenbasiertes Rechtesystem (RBAC), Least-Privilege-Prinzip, vierteljährliche Berechtigungs-Reviews.',
    isImplemented: false
  },
  {
    id: 'tom_conf_4',
    category: 'confidentiality',
    categoryLabel: 'Vertraulichkeit (Art. 32 Abs. 1 lit. a)',
    title: 'Verschlüsselung (Rest & Transit)',
    description: 'Kryptografischer Schutz personenbezogener Daten bei Übertragung und Speicherung.',
    example: 'TLS 1.3 für alle REST/Web-Sockets, AES-256 für Datenbanken (TDE) und Festplatten (LUKS/BitLocker).',
    isImplemented: true
  },

  // 2. Integrität (Integrity)
  {
    id: 'tom_integ_1',
    category: 'integrity',
    categoryLabel: 'Integrität (Art. 32 Abs. 1 lit. b)',
    title: 'Weitergabekontrolle & Transportverschlüsselung',
    description: 'Schutz vor unbefugtem Lesen, Verändern oder Löschen bei Datenübertragung.',
    example: 'VPN-Tunnel (WireGuard/IPSec) zwischen Standorten, signierte E-Mails (S/MIME), SFTP statt FTP.',
    isImplemented: true
  },
  {
    id: 'tom_integ_2',
    category: 'integrity',
    categoryLabel: 'Integrität (Art. 32 Abs. 1 lit. b)',
    title: 'Eingabekontrolle & Audit-Logging',
    description: 'Rückwirkende Nachvollziehbarkeit: Wer hat wann welche personenbezogenen Daten eingegeben/geändert?',
    example: 'Zentralisierte Syslog/SIEM-Protokollierung mit WORM-Storage (Write Once Read Many), Audit-Trail.',
    isImplemented: false
  },

  // 3. Verfügbarkeit & Belastbarkeit (Availability)
  {
    id: 'tom_avail_1',
    category: 'availability',
    categoryLabel: 'Verfügbarkeit & Belastbarkeit (Art. 32 Abs. 1 lit. b/c)',
    title: 'Verfügbarkeitskontrolle & USV/Notstrom',
    description: 'Schutz der Systeme gegen zufällige Zerstörung, Stromausfall oder Hardware-Defekt.',
    example: 'Online-USV (Kompensation von Stromspitzen & 30 Min Puffer), redundante Netzteile, RAID 1/5/6.',
    isImplemented: true
  },
  {
    id: 'tom_avail_2',
    category: 'availability',
    categoryLabel: 'Verfügbarkeit & Belastbarkeit (Art. 32 Abs. 1 lit. c)',
    title: 'Backup-Strategie (3-2-1) & Disaster Recovery',
    description: 'Fähigkeit, die Verfügbarkeit bei physischen oder technischen Zwischenfällen rasch wiederherzustellen.',
    example: '3-2-1 Regel: 3 Kopien, 2 Medien, 1 Offsite-Kopie; monatlich geprüfter Restore-Plan (RTO < 2h, RPO < 1h).',
    isImplemented: true
  },

  // 4. Regelmäßige Überprüfung & Evaluierung
  {
    id: 'tom_eval_1',
    category: 'evaluation',
    categoryLabel: 'Evaluierung & Wirksamkeitsprüfung (Art. 32 Abs. 1 lit. d)',
    title: 'Penetration-Testing & Patch-Management',
    description: 'Verfahren zur regelmäßigen Überprüfung und Bewertung der Wirksamkeit der getroffenen Maßnahmen.',
    example: 'Automatisierte Dependabot/CVE-Scans, CI/CD Linter, jährlicher externer Pentest & Incident-Response-Plan.',
    isImplemented: false
  }
];

/**
 * Berechnet den IHK-DSGVO-Compliance-Score und analysiert Lücken in den TOMs.
 * @param {TomMeasure[]} measures
 * @returns {{
 *   totalCount: number,
 *   implementedCount: number,
 *   scorePercent: number,
 *   gradeLabel: string,
 *   categoryStats: Record<string, { implemented: number, total: number, percent: number }>,
 *   criticalGaps: TomMeasure[]
 * }}
 */
export function evaluateTomAudit(measures = DEFAULT_TOM_MEASURES) {
  const totalCount = measures.length;
  const implementedCount = measures.filter(m => m.isImplemented).length;
  const scorePercent = totalCount > 0 ? Math.round((implementedCount / totalCount) * 100) : 0;

  let gradeLabel = 'Unzureichend (Hohes Haftungsrisiko)';
  if (scorePercent >= 90) {
    gradeLabel = 'Exzellent (IHK-Abschlussarbeits-Standard)';
  } else if (scorePercent >= 75) {
    gradeLabel = 'Gut (Solide Grundsicherung)';
  } else if (scorePercent >= 50) {
    gradeLabel = 'Befriedigend (Maßnahmenlücken vorhanden)';
  }

  /** @type {Record<string, { implemented: number, total: number, percent: number }>} */
  const categoryStats = {};
  ['confidentiality', 'integrity', 'availability', 'evaluation'].forEach(cat => {
    const catMeasures = measures.filter(m => m.category === cat);
    const catImpl = catMeasures.filter(m => m.isImplemented).length;
    const catTot = catMeasures.length;
    categoryStats[cat] = {
      implemented: catImpl,
      total: catTot,
      percent: catTot > 0 ? Math.round((catImpl / catTot) * 100) : 0
    };
  });

  const criticalGaps = measures.filter(m => !m.isImplemented);

  return {
    totalCount,
    implementedCount,
    scorePercent,
    gradeLabel,
    categoryStats,
    criticalGaps
  };
}

/**
 * Erzeugt einen druck- und abgabefertigen Markdown-Text für die IHK-Projektdokumentation.
 * @param {TomMeasure[]} measures
 * @returns {string}
 */
export function generateTomMarkdownDoc(measures = DEFAULT_TOM_MEASURES) {
  const audit = evaluateTomAudit(measures);
  let md = `# Anhang: Technisch-organisatorische Maßnahmen (TOM nach Art. 32 DSGVO)\n\n`;
  md += `**Projekt:** IT-Abschlussprojekt nach Ausbildungsordnung (AO 2020)\n`;
  md += `**DSGVO Compliance Score:** ${audit.scorePercent}% (${audit.gradeLabel})\n`;
  md += `**Umsetzungsgrad:** ${audit.implementedCount} von ${audit.totalCount} Maßnahmen implementiert\n\n`;

  md += `## 1. Übersicht der Schutzmaßnahmen\n\n`;
  md += `| Kategorie | Maßnahme | Status | Technische Umsetzung im Projekt |\n`;
  md += `| :--- | :--- | :---: | :--- |\n`;

  measures.forEach(m => {
    const status = m.isImplemented ? '✅ Umgesetzt' : '⚠️ Geplant / Offen';
    md += `| ${m.categoryLabel} | **${m.title}** | ${status} | ${m.example} |\n`;
  });

  md += `\n## 2. Zusammenfassung für den Datenschutzbeauftragten (DSB)\n`;
  md += `Die technischen und organisatorischen Maßnahmen gewährleisten ein dem Risiko angemessenes Schutzniveau `;
  md += `hinsichtlich Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit der Systeme gemäß Art. 32 Abs. 1 DSGVO.\n`;

  return md;
}
