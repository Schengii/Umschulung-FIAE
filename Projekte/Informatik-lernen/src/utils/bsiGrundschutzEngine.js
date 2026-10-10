// @ts-check
/**
 * BSI IT-Grundschutz (BSI-Standards 200-2 / 200-3) & NIS-2 Risiko-Engine
 * Modelliert Schutzbedarfsfeststellung (CIA), Baustein-Zuordnungen,
 * Maßnahmen-Umsetzungsstatus und IHK-Konformitäts-Audits nach BSI/NIS-2.
 */

/**
 * @typedef {'normal' | 'high' | 'very_high'} ProtectionLevel
 * @typedef {'yes' | 'partially' | 'no'} ImplementationStatus
 * 
 * @typedef {Object} ProtectionNeed
 * @typedef {Object} BsiModule
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} category
 * @property {string} description
 * @property {Array<{ id: string, name: string, type: 'basis' | 'standard' | 'high', status: ImplementationStatus }>} measures
 * 
 * @typedef {Object} Nis2Sector
 * @property {string} id
 * @property {string} name
 * @property {'essential' | 'important'} category
 * @property {string} threshold
 */

export const PROTECTION_LEVELS = {
  NORMAL: { id: 'normal', label: 'Normal', desc: 'Schadensauswirkungen sind begrenzt und überschaubar.', score: 1, color: '#10b981' },
  HIGH: { id: 'high', label: 'Hoch', desc: 'Schäden können beträchtlich sein (z. B. finanzielle Verluste, Gesetzesverstöße).', score: 2, color: '#f59e0b' },
  VERY_HIGH: { id: 'very_high', label: 'Sehr hoch', desc: 'Existenzbedrohend oder katastrophale Folgen für Unternehmen / Allgemeinheit.', score: 3, color: '#ef4444' }
};

/** @type {Array<{ id: string, name: string, type: string, confidentiality: ProtectionLevel, integrity: ProtectionLevel, availability: ProtectionLevel, rationale: string }>} */
export const DEFAULT_ASSETS = [
  {
    id: 'asset-1',
    name: 'Produktions-Kundendatenbank (PostgreSQL Cluster)',
    type: 'Anwendung / Daten',
    confidentiality: 'very_high',
    integrity: 'very_high',
    availability: 'high',
    rationale: 'Enthält personenbezogene Kundendaten (DSGVO) und Bestellhistorie.'
  },
  {
    id: 'asset-2',
    name: 'Zentraler Active Directory Domain Controller / IdP',
    type: 'Infrastruktur',
    confidentiality: 'high',
    integrity: 'very_high',
    availability: 'very_high',
    rationale: 'Single Point of Failure für Mitarbeiter-Authentifizierung und Rechtevergabe.'
  },
  {
    id: 'asset-3',
    name: 'Entwicklungs- und Staging-Umgebung',
    type: 'System',
    confidentiality: 'normal',
    integrity: 'normal',
    availability: 'normal',
    rationale: 'Keine echten Produktivdaten, kurze Ausfallzeiten tolerierbar.'
  }
];

export const BSI_MODULES = [
  {
    id: 'mod-isms',
    code: 'ISMS.1',
    name: 'Sicherheitsmanagement (ISMS & Leitlinie)',
    category: 'Management',
    description: 'Etablierung einer ganzheitlichen IT-Sicherheitsleitlinie und Zuweisung von Sicherheitsrollen (CISO/ISB).',
    measures: [
      { id: 'm-isms-1', name: 'Erstellung und Freigabe der IT-Sicherheitsleitlinie durch die Geschäftsführung', type: 'basis', status: 'yes' },
      { id: 'm-isms-2', name: 'Benennung eines qualifizierten IT-Sicherheitsbeauftragten (ISB)', type: 'basis', status: 'yes' },
      { id: 'm-isms-3', name: 'Regelmäßige Sensibilisierungsschulungen der Mitarbeiter (Awareness)', type: 'standard', status: 'partially' }
    ]
  },
  {
    id: 'mod-ops-backup',
    code: 'OPS.1.1.4',
    name: 'Schutz vor Datenverlust (Backup & Recovery)',
    category: 'Betrieb',
    description: 'Konzeption einer 3-2-1 Backup-Strategie, Verschlüsselung von Sicherungen und regelmäßige Desaster-Recovery-Tests.',
    measures: [
      { id: 'm-ops-1', name: 'Realisierung einer 3-2-1 Datensicherungsstrategie (inkl. Offline/Air-Gap)', type: 'basis', status: 'yes' },
      { id: 'm-ops-2', name: 'Verschlüsselung aller Backups im Ruhezustand und bei Übertragung (AES-256)', type: 'standard', status: 'yes' },
      { id: 'm-ops-3', name: 'Halbjährliche Wiederanlauftests (Recovery Drills) mit Soll-Ist-Zeitmessung (RTO/RPO)', type: 'standard', status: 'partially' },
      { id: 'm-ops-4', name: 'Unveränderliche WORM/Immutable-Backups gegen Ransomware', type: 'high', status: 'no' }
    ]
  },
  {
    id: 'mod-net-arch',
    code: 'NET.1.1',
    name: 'Netzwerkarchitektur & Segmentierung',
    category: 'Infrastruktur',
    description: 'Zonierung in DMZ, interne Netze und Management-VLANs mit Next-Gen Firewalls und Zero-Trust.',
    measures: [
      { id: 'm-net-1', name: 'Trennung in Sicherheitszonen (DMZ, App, DB, Management) via 802.1Q VLANs', type: 'basis', status: 'yes' },
      { id: 'm-net-2', name: 'Einsatz von Stateful-Inspection-Firewalls mit Default-Deny-Regelwerk', type: 'basis', status: 'yes' },
      { id: 'm-net-3', name: 'Zwei-Faktor-Authentifizierung (MFA) für alle administrativen Zugänge & VPN', type: 'standard', status: 'yes' },
      { id: 'm-net-4', name: 'Micro-Segmentierung und Zero-Trust Network Access (ZTNA)', type: 'high', status: 'partially' }
    ]
  },
  {
    id: 'mod-der-incident',
    code: 'DER.2.1',
    name: 'Sicherheitsvorfallbehandlung (Incident Management)',
    category: 'Notfall / NIS-2',
    description: 'Prozesse zur Erkennung, Eindämmung und gesetzlichen Meldung von Vorfällen innerhalb der 24h/72h-Fristen.',
    measures: [
      { id: 'm-der-1', name: 'Dokumentierter Incident Response Plan mit Eskalationsmatrix', type: 'basis', status: 'partially' },
      { id: 'm-der-2', name: 'Einhaltung der NIS-2 Meldefristen (24h Frühwarnung, 72h Vollmeldung an BSI)', type: 'standard', status: 'no' },
      { id: 'm-der-3', name: 'Zentrales Log-Management (SIEM) mit unveränderbarem Audit-Trail', type: 'high', status: 'partially' }
    ]
  }
];

export const NIS2_OBLIGATIONS = [
  { id: 'nis-mfa', title: 'Multifaktor-Authentifizierung (MFA)', description: 'Verpflichtend für alle Fernzugriffe, Admins und kritische Portale.' },
  { id: 'nis-crypto', title: 'Kryptografie & Verschlüsselung', description: 'End-to-End Verschlüsselung nach Stand der Technik (TLS 1.3, AES-GCM).' },
  { id: 'nis-supply', title: 'Lieferkettensicherheit (Supply Chain Security)', description: 'Sicherheitsaudit aller IT-Dienstleister, Zulieferer und APIs.' },
  { id: 'nis-report', title: 'Meldepflicht binnen 24 Stunden', description: 'Erste Frühwarnung bei signifikanten Sicherheitsvorfällen an die Behörde.' },
  { id: 'nis-bcm', title: 'Business Continuity & Krisenmanagement', description: 'Notfallbetriebs- und Ausfallpläne für kritische Geschäftsprozesse.' }
];

/**
 * Berechnet den maximalen Schutzbedarf eines Assets nach dem Maximum-Prinzip
 * @param {{ confidentiality: ProtectionLevel, integrity: ProtectionLevel, availability: ProtectionLevel }} asset
 * @returns {ProtectionLevel}
 */
export function calculateOverallNeed(asset) {
  const levels = [asset.confidentiality, asset.integrity, asset.availability];
  if (levels.includes('very_high')) return 'very_high';
  if (levels.includes('high')) return 'high';
  return 'normal';
}

/**
 * Berechnet Compliance-Scores und Statistiken für BSI-Bausteine
 * @param {Array<typeof BSI_MODULES[0]>} modules
 */
export function evaluateBsiCompliance(modules) {
  let totalMeasures = 0;
  let implemented = 0;
  let partial = 0;
  let missing = 0;

  let basisTotal = 0;
  let basisImplemented = 0;

  modules.forEach(mod => {
    mod.measures.forEach(m => {
      totalMeasures++;
      if (m.status === 'yes') implemented++;
      else if (m.status === 'partially') partial++;
      else missing++;

      if (m.type === 'basis') {
        basisTotal++;
        if (m.status === 'yes') basisImplemented++;
      }
    });
  });

  // Gewichtung: yes = 1.0, partially = 0.5, no = 0
  const scoreRaw = totalMeasures > 0 ? ((implemented * 1.0 + partial * 0.5) / totalMeasures) * 100 : 0;
  const complianceScore = Math.round(scoreRaw);

  const basisFulfilled = basisTotal > 0 && basisImplemented === basisTotal;

  /** @type {'excellent' | 'adequate' | 'deficient'} */
  let auditStatus = 'deficient';
  if (basisFulfilled && complianceScore >= 80) auditStatus = 'excellent';
  else if (basisFulfilled && complianceScore >= 50) auditStatus = 'adequate';

  return {
    totalMeasures,
    implemented,
    partial,
    missing,
    basisTotal,
    basisImplemented,
    basisFulfilled,
    complianceScore,
    auditStatus
  };
}

/**
 * Exportiert den BSI IT-Grundschutz Bericht für die IHK-Abschlussdokumentation
 * @param {Object} data
 * @param {Array<typeof DEFAULT_ASSETS[0]>} data.assets
 * @param {Array<typeof BSI_MODULES[0]>} data.modules
 * @param {string} projectName
 * @returns {string}
 */
export function exportBsiReportMarkdown(data, projectName = 'IHK-Abschlussprojekt') {
  const evaluation = evaluateBsiCompliance(data.modules);
  const dateStr = new Date().toLocaleDateString('de-DE');

  let md = `# BSI IT-Grundschutz & NIS-2 Sicherheitsbericht (BSI 200-2 / 200-3)\n\n`;
  md += `**Projekt:** ${projectName}  \n`;
  md += `**Erstellt am:** ${dateStr}  \n`;
  md += `**Compliance-Score:** ${evaluation.complianceScore}% | **Basis-Sicherheitsanforderungen:** ${evaluation.basisFulfilled ? 'Erfüllt' : 'Nicht erfüllt'}  \n\n`;

  md += `### 1. Schutzbedarfsfeststellung (CIA-Klassifizierung)\n`;
  md += `Gemäß BSI-Standard 200-2 wurde für alle projektrelevanten Zielobjekte der Schutzbedarf ermittelt:\n\n`;
  md += `| Zielobjekt / Asset | Typ | Vertraulichkeit (C) | Integrität (I) | Verfügbarkeit (A) | Gesamtschutzbedarf | Begründung |\n`;
  md += `| :----------------- | :-- | :-----------------: | :------------: | :---------------: | :----------------: | :--------- |\n`;

  data.assets.forEach(a => {
    const overall = calculateOverallNeed(a);
    md += `| ${a.name} | ${a.type} | ${a.confidentiality} | ${a.integrity} | ${a.availability} | **${overall.toUpperCase()}** | ${a.rationale} |\n`;
  });

  md += `\n### 2. Umsetzung der BSI IT-Grundschutz Bausteine\n\n`;
  data.modules.forEach(mod => {
    md += `#### Baustein ${mod.code}: ${mod.name}\n`;
    md += `*${mod.description}*\n\n`;
    md += `| ID | Sicherheitsmaßnahme | Typ | Status |\n`;
    md += `| :- | :------------------- | :-- | :----- |\n`;
    mod.measures.forEach(m => {
      const statusLabel = m.status === 'yes' ? 'Erfüllt (Ja)' : m.status === 'partially' ? 'Teilweise' : 'Offen (Nein)';
      md += `| ${m.id} | ${m.name} | ${m.type} | **${statusLabel}** |\n`;
    });
    md += `\n`;
  });

  md += `### 3. IHK-Konformitätsfazit & NIS-2 Einordnung\n`;
  if (evaluation.auditStatus === 'excellent') {
    md += `Das Sicherheitskonzept genügt den Anforderungen an den BSI IT-Grundschutz und deckt alle Basis- sowie Standardmaßnahmen ab. Kritische Assets sind redundant und verschlüsselt abgesichert.\n`;
  } else {
    md += `Es bestehen offene Maßnahmen im Bereich der Basisabsicherung bzw. Vorfallbehandlung. Vor Produktionsfreigabe sind die definierten Restmaßnahmen abzuarbeiten.\n`;
  }

  return md;
}
