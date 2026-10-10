// @ts-check
/**
 * IHK Mündliche Ergänzungsprüfung (MEP) Simulation Engine
 * Nach Ausbildungsordnung IT-Berufe (AO 2020) & § 198 BBiG
 * 
 * Regeln der MEP:
 * - Nur in EINEM mangelhaften schriftlichen Prüfungsbereich (30–49 Punkte) zulässig.
 * - Dauer: Typischerweise ca. 15 Minuten.
 * - Gewichtung: Schriftliches Ergebnis : Mündliches Ergebnis = 2 : 1.
 * - Berechnung der Endnote im Prüfungsbereich:
 *     Gesamtergebnis = (2 * Schriftlich + 1 * MEP) / 3
 * - Ziel: Erreichen von mindestens 50 Punkten (Note 4 / Ausreichend) im Gesamtergebnis des Bereichs.
 */

/**
 * Typische IHK-Prüfungsfragen für mündliche Ergänzungsprüfungen nach Fachbereich
 */
export const MEP_QUESTION_CATALOG = {
  wiso: [
    {
      id: 'wiso_1',
      topic: 'Kündigungsfristen & KSchG',
      question: 'Ein Arbeitnehmer ist seit 4 Jahren im Betrieb beschäftigt (25 Mitarbeiter). Welche gesetzliche Kündigungsfrist gilt für den Arbeitgeber und wann greift das KSchG?',
      keywords: ['1 Monat', 'Monatsende', '6 Monate', 'mehr als 10 Mitarbeiter'],
      modelAnswer: 'Nach § 622 Abs. 2 BGB beträgt die Frist bei 4 Jahren Betriebszugehörigkeit 1 Monat zum Monatsende. Das KSchG greift, da das Arbeitsverhältnis länger als 6 Monate besteht und der Betrieb in der Regel mehr als 10 Vollzeit-Arbeitnehmer beschäftigt.'
    },
    {
      id: 'wiso_2',
      topic: 'Handelskalkulation & Skonto',
      question: 'Erläutern Sie den Unterschied zwischen Lieferantenrabatt und Lieferantenskonto. Warum lohnt sich die Inanspruchnahme von Skonto fast immer?',
      keywords: ['Rabatt', 'Menge', 'Skonto', 'Zahlungsanreiz', 'Zinssatz'],
      modelAnswer: 'Rabatt wird sofort vom Listenpreis abgezogen (z. B. Mengen- oder Sonderrabatt). Skonto ist ein Zinsabzug für vorzeitige Zahlung innerhalb einer kurzen Frist (z. B. 2 % bei Zahlung binnen 10 Tagen). Rechnerisch entspricht dies meist einem extrem hohen Jahreszinssatz (> 30 % p.a.).'
    },
    {
      id: 'wiso_3',
      topic: 'Unternehmensformen (GmbH vs. Einzelunternehmen)',
      question: 'Worin unterscheidet sich die Haftung eines Einzelunternehmers von der eines GmbH-Gesellschafters? Welches Mindeststammkapital erfordert eine GmbH?',
      keywords: ['Privatvermögen', 'unbeschränkt', 'Stammkapital', '25.000', 'Gesellschaftsvermögen'],
      modelAnswer: 'Der Einzelunternehmer haftet unbeschränkt mit Betriebs- und Privatvermögen. Bei der GmbH haftet im Regelfall nur das Gesellschaftsvermögen. Das gesetzliche Mindeststammkapital der GmbH beträgt 25.000 € (mind. 12.500 € bei Gründung eingezahlt).'
    }
  ],
  ap2_b1: [
    {
      id: 'b1_1',
      topic: 'Lastenheft vs. Pflichtenheft',
      question: 'Erklären Sie den Unterschied zwischen Lastenheft und Pflichtenheft im IT-Projektmanagement. Wer erstellt welches Dokument?',
      keywords: ['Auftraggeber', 'Auftragnehmer', 'Was', 'Wie', 'Anforderungen', 'Umsetzung'],
      modelAnswer: 'Das Lastenheft beschreibt die Gesamtheit der Forderungen des Auftraggebers ("Was soll gelöst werden und wozu?"). Das Pflichtenheft erstellt der Auftragnehmer zur Beschreibung der konkreten Realisierung ("Wie wird die Anforderung technisch umgesetzt?").'
    },
    {
      id: 'b1_2',
      topic: 'Nutzwertanalyse & K.O.-Kriterien',
      question: 'Wie funktioniert eine Nutzwertanalyse (NWA)? Was passiert, wenn eine Lösungsvariante ein definiertes K.O.-Kriterium nicht erfüllt?',
      keywords: ['Gewichtung', 'Punkte', 'Wichtungssumme', 'K.O.-Kriterium', 'Ausschluss'],
      modelAnswer: 'Kriterien werden gewichtet (Summe 100 %). Jede Option erhält Punkte (z. B. 1–10). Die Summe der Produkte ergibt den Nutzwert. Verfehlt eine Option ein zwingendes K.O.-Kriterium, scheidet sie sofort und unwiderruflich aus.'
    }
  ],
  ap2_b2: [
    {
      id: 'b2_1',
      topic: 'Relationales Datenbank-Design & 3. Normalform',
      question: 'Welche Bedingungen müssen erfüllt sein, damit sich eine Relation in der 3. Normalform (3NF) befindet? Welche Anomalien werden dadurch vermieden?',
      keywords: ['1NF', '2NF', 'transitive Abhängigkeit', 'Update-Anomalie', 'Primärschlüssel'],
      modelAnswer: 'Die Tabelle muss in 2NF sein und kein Nichtschlüsselattribut darf von einem anderen Nichtschlüsselattribut transitiv abhängen (direkte funktionale Abhängigkeit vom Primärschlüssel). Dies verhindert Update-, Insert- und Delete-Anomalien.'
    },
    {
      id: 'b2_2',
      topic: 'Netzwerk-Subnetting & Broadcast',
      question: 'Warum können die erste und die letzte IP-Adresse eines IPv4-Subnetzes (z. B. /28) nicht an Endgeräte vergeben werden?',
      keywords: ['Netz-ID', 'Broadcast', 'Host-Bits', 'Netzwerkadresse', 'Rundruf'],
      modelAnswer: 'Die erste Adresse (alle Host-Bits = 0) repräsentiert die Netz-ID zur Routing-Identifikation. Die letzte Adresse (alle Host-Bits = 1) ist die Broadcast-Adresse für Rundrufe an alle Hosts des Subnetzes.'
    }
  ]
};

/**
 * Berechnet das Gesamtergebnis nach einer MEP
 * @param {number} writtenPoints Schriftliche Punkte (0–100)
 * @param {number} mepPoints In der MEP erreichte Punkte (0–100)
 * @returns {{ combinedPoints: number, isPassed: boolean, gradeLabel: string }}
 */
export function calculateMepCombinedScore(writtenPoints, mepPoints) {
  const w = Math.max(0, Math.min(100, Number(writtenPoints) || 0));
  const m = Math.max(0, Math.min(100, Number(mepPoints) || 0));

  // Formel: (2 * Schriftlich + 1 * Mündlich) / 3
  const combined = Math.round(((2 * w) + (1 * m)) / 3);
  const isPassed = combined >= 50;

  let gradeLabel = 'Ungenügend (6)';
  if (combined >= 92) gradeLabel = 'Sehr gut (1)';
  else if (combined >= 81) gradeLabel = 'Gut (2)';
  else if (combined >= 67) gradeLabel = 'Befriedigend (3)';
  else if (combined >= 50) gradeLabel = 'Ausreichend (4)';
  else if (combined >= 30) gradeLabel = 'Mangelhaft (5)';

  return {
    combinedPoints: combined,
    isPassed,
    gradeLabel
  };
}

/**
 * Ermittelt die Mindestpunktzahl in der MEP für eine Ziel-Gesamtnote
 * @param {number} writtenPoints
 * @param {number} [targetCombined] Standard 50 (Bestehensgrenze)
 * @returns {{ minRequiredMep: number, isAchievable: boolean }}
 */
export function calculateRequiredMepScore(writtenPoints, targetCombined = 50) {
  // 3 * targetCombined <= 2 * written + mep => mep >= 3 * targetCombined - 2 * written
  const needed = (3 * targetCombined) - (2 * writtenPoints);
  const minRequiredMep = Math.max(0, needed);
  const isAchievable = minRequiredMep <= 100;

  return {
    minRequiredMep,
    isAchievable
  };
}
