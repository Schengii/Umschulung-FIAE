// @ts-check
import { jsPDF } from 'jspdf';

/**
 * @typedef {object} ProposalData
 * @property {string} candidateName
 * @property {string} companyName
 * @property {string} occupationName
 * @property {string} projectTitle
 * @property {string} projectGoal
 * @property {number} totalHours
 * @property {Array<{ id: string, name: string, hours: number, category: string }>} phases
 * @property {Array<{ name: string, detail: string }>} securityMeasures
 * @property {string} economicFeasibility
 */

/**
 * Generiert einen formatierten Markdown-Export des IHK-Projektantrags
 * @param {ProposalData} data
 * @returns {string}
 */
export function generateProposalMarkdown(data) {
  const phaseRows = (data.phases || []).map(p =>
    `| ${p.name} | ${p.hours} Std. | ${p.category.toUpperCase()} |`
  ).join('\n');

  const tomRows = (data.securityMeasures || []).map(t =>
    `- **${t.name}**: ${t.detail}`
  ).join('\n');

  return `# IHK PROJEKTANTRAG (AP2 TEIL A)
**Ausbildungsberuf:** ${data.occupationName || 'Fachinformatiker'}  
**Projektleiter / Prüfling:** ${data.candidateName || 'Max Mustermann'}  
**Ausbildungsbetrieb:** ${data.companyName || 'IT-Unternehmen'}  
**Geplante Projektlaufzeit:** ${data.totalHours || 80} Gesamtstunden  

---

## 1. Projektbezeichnung
**${data.projectTitle || 'Entwicklung einer modernen Cloud-Architektur'}**

### 1.1 Ausgangssituation & Problembeschreibung
${data.projectGoal || 'Die bisherige Infrastruktur weist manuelle Prozesse und Latenzengpässe auf.'}

### 1.2 Projektziel & Nutzen
Effiziente Automatisierung, Minimierung manueller Fehlerquellen und wirtschaftliche Amortisation nach IHK-Standard.

---

## 2. Projektphasen & Zeitplanung (Soll-Konzeption)
| Phasenbezeichnung | Geplante Stunden | Kategorie |
| :--- | :--- | :--- |
${phaseRows}
| **Gesamtsumme** | **${data.totalHours} Std.** | **100%** |

---

## 3. Wirtschaftlichkeits- & Amortisationsnachweis
${data.economicFeasibility || 'Gegenüberstellung von Make-or-Buy sowie Nutzwertanalyse zur Auswahl der optimalen Zielarchitektur.'}

---

## 4. Datenschutz & Informationssicherheit (Art. 32 DSGVO TOMs)
${tomRows}

---
*Erstellt mit dem IHK-DevGame Projektantrags-Studio nach Ausbildungsordnung AO 2020.*
`;
}

/**
 * Generiert und lädt ein druckfertiges IHK-Projektantrag PDF herunter
 * @param {ProposalData} data
 * @returns {jsPDF}
 */
export function exportProposalPdf(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Page Border / Framing
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, pageWidth - 20, 277);

  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, pageWidth - 24, 273);

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('IHK ANTRAG AUF ZULASSUNG ZUR PROJEKTARBEIT', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Abschlussprüfung Teil 2 (AP2) nach bundeseinheitlicher Ausbildungsordnung AO 2020', pageWidth / 2, 30, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 34, pageWidth - 20, 34);

  // Candidate Meta Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 38, pageWidth - 40, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 38, pageWidth - 40, 28, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Prüfling:', 24, 45);
  doc.text('Ausbildungsberuf:', 24, 52);
  doc.text('Ausbildungsbetrieb:', 24, 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(data.candidateName || 'Max Mustermann', 65, 45);
  doc.text(data.occupationName || 'Fachinformatiker Anwendungsentwicklung', 65, 52);
  doc.text(data.companyName || 'IT Cloud Solutions GmbH', 65, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Stundenbudget:', 135, 45);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(2, 132, 199);
  doc.text(`${data.totalHours || 80} Stunden`, 165, 45);

  // Section 1: Project Title & Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Projektbezeichnung & Aufgabenstellung', 20, 74);

  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text(data.projectTitle || 'Automatisierte Deployment-Pipeline & Cloud-Migration', 20, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const goalLines = doc.splitTextToSize(data.projectGoal || 'Ziel des Projektes ist die Konzeptionierung und schlüsselfertige Realisierung einer sicheren Microservice-Architektur inklusive Zero-Trust-Richtlinien und automatisierter Qualitätssicherung.', pageWidth - 40);
  doc.text(goalLines, 20, 86);

  // Section 2: Time Schedule Table
  let currentY = 88 + (goalLines.length * 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Projektphasen & detaillierte Zeitplanung', 20, currentY);

  currentY += 5;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(20, currentY, pageWidth - 40, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PHASE / ARBEITSPAKET', 24, currentY + 4.5);
  doc.text('KATEGORIE', 125, currentY + 4.5);
  doc.text('STUNDEN', 160, currentY + 4.5);

  currentY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  const phases = data.phases || [];
  phases.forEach((phase) => {
    doc.text(phase.name, 24, currentY + 4.5);
    doc.text(phase.category.toUpperCase(), 125, currentY + 4.5);
    doc.text(`${phase.hours} h`, 165, currentY + 4.5);
    doc.setDrawColor(241, 245, 249);
    doc.line(20, currentY + 6.5, pageWidth - 20, currentY + 6.5);
    currentY += 6.5;
  });

  // Table Total Line
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(248, 250, 252);
  doc.rect(20, currentY, pageWidth - 40, 7, 'F');
  doc.text('GEPLANTE GESAMTPROJEKTDAUER:', 24, currentY + 4.5);
  doc.setTextColor(2, 132, 199);
  doc.text(`${data.totalHours || 80} h`, 165, currentY + 4.5);

  currentY += 12;

  // Section 3: TOM & DSGVO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Datenschutz & Informationssicherheit (Art. 32 DSGVO)', 20, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const security = data.securityMeasures || [];
  security.slice(0, 3).forEach((sec) => {
    doc.text(`• ${sec.name}: ${sec.detail}`, 24, currentY + 3.5);
    currentY += 4.5;
  });

  // Footer Signature Lines
  currentY = 250;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, currentY, 80, currentY);
  doc.line(110, currentY, 170, currentY);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Datum, Unterschrift Prüfling', 20, currentY + 4);
  doc.text('Datum, Stempel & Unterschrift Betrieb', 110, currentY + 4);

  return doc;
}
