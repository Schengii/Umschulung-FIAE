// AP2-Prüfungsfragen (IDs 102-116) zu Projektabschluss, Qualität, Dokumentation und Fachgespräch
// für FIDP, FIDV und ITSE. Die Fachinhalte stehen im Wissensartikel "qualitaet_dokumentation_fachgespraech".
// Optionales Feld `source: { label, url }` verweist auf die Quelle.
const q = (id, examType, category, question, options, correct, explanation, source) => ({
  id,
  examType,
  category,
  difficulty: 'Azubi / IHK',
  question,
  options,
  correct,
  points: 10,
  explanation,
  ...(source ? { source } : {})
});

const IHK_HINWEISE = {
  label: 'IHK Rheinhessen: Hinweise zur Abschlussprüfung in den IT-Berufen (VO 2020)',
  url: 'https://www.ihk.de/rheinhessen/aus-und-weiterbildung/berufe-a-z/pruefungshinweise-it-berufe-6637558'
};
const BGB_640 = { label: '§ 640 BGB (Abnahme)', url: 'https://www.gesetze-im-internet.de/bgb/__640.html' };

export const EXAM_QUESTIONS_PROJEKT = [
  // ---------- FIDP: Daten- und Prozessanalyse ----------
  q(102, 'ap2_fidp', 'Projektarbeit & Fachgespräch',
    'Du hast in deinem Analyseprojekt ein Klassifikationsmodell mit 97 % Genauigkeit entwickelt. Im Fachgespräch fragt der Prüfungsausschuss, ob das Ergebnis aussagekräftig ist. Der positive Anteil in den Daten beträgt 2 %. Was ist die beste Antwort?',
    [
      'Ja, 97 % ist hoch und damit eindeutig gut',
      'Nein, bei nur 2 % positiven Fällen erreicht schon ein Modell, das immer negativ meldet, 98 %. Präzision, Trefferquote und F1 müssen betrachtet werden',
      'Die Genauigkeit ist bei Klassifikation irrelevant',
      'Das lässt sich nur mit einem größeren Datensatz klären'
    ],
    1,
    'Bei unausgewogenen Klassen täuscht die Genauigkeit. Ein Modell, das nie positiv meldet, hätte hier 98 %. Aussagekräftig sind Präzision, Trefferquote und F1 sowie die Konfusionsmatrix.'),
  q(103, 'ap2_fidp', 'Projektdokumentation',
    'Welche Angabe gehört bei einem Datenanalyse-Projekt in die Dokumentation, damit die Auswertung nachvollziehbar und prüfbar ist?',
    [
      'Nur das Endergebnis als Diagramm',
      'Herkunft und Stand der Daten, Bereinigungsschritte, Methode mit Begründung, Kennzahlen und Grenzen der Aussage',
      'Ausschließlich der vollständige Quellcode ohne Erläuterung',
      'Persönliche Daten der betroffenen Personen im Klartext'
    ],
    1,
    'Nachvollziehbarkeit verlangt Datenquelle, Aufbereitung (z. B. fehlende Werte, Ausreißer), Methodenwahl, Bewertung und eine ehrliche Aussage zu Grenzen. Personenbezogene Daten werden pseudonymisiert oder anonymisiert.'),
  q(104, 'ap2_fidp', 'Projektplanung',
    'Für die betriebliche Projektarbeit in der Fachrichtung Daten- und Prozessanalyse gilt nach den IHK-Hinweisen welcher Zeitrahmen für Projektarbeit und Dokumentation?',
    ['Höchstens 40 Stunden', 'Genau 120 Stunden', 'Mindestens 80 Stunden', 'Es gibt keine Zeitvorgabe'],
    0,
    'Nach den IHK-Hinweisen zur Verordnung von 2020 gilt für Daten- und Prozessanalyse ein Rahmen von höchstens 40 Stunden. Nur die Anwendungsentwicklung hat bis zu 80 Stunden. Maßgeblich ist die Handreichung der zuständigen IHK.',
    IHK_HINWEISE),
  q(105, 'ap2_fidp', 'Qualitätssicherung',
    'Welche Aussage zum Training und Testen eines Modells ist richtig, wenn die Qualität belegt werden soll?',
    [
      'Die Testdaten sollen auch zum Einstellen der Parameter verwendet werden',
      'Testdaten bleiben bis zur Endbewertung unberührt, sonst ist das Ergebnis zu optimistisch (Data Leakage)',
      'Je mehr Parameter, desto besser ist das Modell immer',
      'Eine Bewertung auf den Trainingsdaten reicht aus'
    ],
    1,
    'Nur auf ungesehenen Daten zeigt sich, wie gut das Modell verallgemeinert. Fließt Wissen aus den Testdaten in Training oder Tuning ein, misst der Test nicht mehr die tatsächliche Leistung.'),
  q(106, 'ap2_fidp', 'Wirtschaftlichkeit',
    'Ein Analyseprojekt kostet 9.000 Euro. Die dadurch vermiedenen Fehlmengen sparen 750 Euro pro Monat. Nach wie vielen Monaten hat sich das Projekt amortisiert?',
    ['9 Monate', '12 Monate', '15 Monate', '18 Monate'],
    1,
    'Amortisationszeit = Projektkosten : monatliche Einsparung = 9.000 : 750 = 12 Monate. Zusätzlich prüft man nach einiger Zeit, ob der geplante Nutzen tatsächlich eintritt.'),

  // ---------- FIDV: Digitale Vernetzung ----------
  q(107, 'ap2_fidv', 'Projektarbeit & Fachgespräch',
    'Du hast in deinem Projekt MQTT statt Modbus TCP für die Anbindung von Sensoren gewählt. Welche Antwort entspricht dem empfohlenen Antwortmuster im Fachgespräch?',
    [
      'MQTT ist moderner, deshalb habe ich es genommen',
      'Entscheidung: MQTT. Begründung: Publish-Subscribe entkoppelt Sensoren und Cloud und kommt mit instabilen Verbindungen zurecht. Alternative: Modbus TCP, aber ohne Sicherheit und für das lokale Netz gedacht. Ergebnis: Tests bestätigten den stabilen Betrieb mit TLS',
      'Das hat mir mein Ausbilder gesagt',
      'Das weiß ich nicht mehr'
    ],
    1,
    'Eine gute Antwort folgt dem Muster Entscheidung, Begründung, Alternative, Ergebnis und belegt, dass du die Zusammenhänge verstehst.'),
  q(108, 'ap2_fidv', 'Abnahme',
    'Welche Wirkung hat die Abnahme eines Werkes im Werkvertrag?',
    [
      'Die Gewährleistungsfrist endet',
      'Die Gewährleistungsfrist beginnt, die Gefahr geht auf den Auftraggeber über und die Vergütung wird fällig',
      'Der Auftragnehmer muss alle Dokumentationen vernichten',
      'Mängel können danach nie mehr geltend gemacht werden'
    ],
    1,
    'Unwesentliche Mängel hindern die Abnahme nicht, sie werden im Abnahmeprotokoll mit Frist zur Beseitigung festgehalten.',
    BGB_640),
  q(109, 'ap2_fidv', 'Projektdokumentation',
    'Welche Angaben sollte eine Dokumentation für den IT-Betrieb einer neuen vernetzten Anlage enthalten (Betriebshandbuch)?',
    [
      'Nur das Marketingkonzept',
      'Aufbau und Netzplan, Konfigurationen, Sicherung und Wiederherstellung, Wartung, Fehlerbehebung und Ansprechpartner. Zugangsdaten werden gesondert und sicher übergeben',
      'Alle Administratorpasswörter im Klartext im Dokument',
      'Nur eine Rechnung über die Hardware'
    ],
    1,
    'Eine Lösung ohne Betriebsdokumentation ist nicht wartbar und nicht abnahmefähig. Zugangsdaten gehören in einen Passwortspeicher oder eine geschützte Übergabe, nicht in ein Dokument.'),
  q(110, 'ap2_fidv', 'Qualitätsziele',
    'Welches Qualitätsziel für ein neues Sensornetz ist SMART formuliert?',
    [
      'Das Netz soll zuverlässig sein',
      'Bis zum 30.06. erreichen mindestens 99 % der Messwerte die Plattform innerhalb von 5 Sekunden, nachgewiesen durch einen 7-tägigen Testlauf mit Protokoll',
      'Das Netz soll besser sein als vorher',
      'Es soll möglichst wenig Ausfälle geben'
    ],
    1,
    'SMART heißt spezifisch, messbar, attraktiv bzw. akzeptiert, realistisch und terminiert. Nur messbare Ziele lassen sich bei der Abnahme belegen.'),
  q(111, 'ap2_fidv', 'Projektabschluss',
    'Geplant waren 40 Stunden bei 45 Euro Stundensatz. Benötigt wurden 46 Stunden. Wie hoch ist die Kostenabweichung der Personalkosten?',
    ['+270 Euro (+15 %)', '+6 Euro (+15 %)', '+270 Euro (+6 %)', '-270 Euro (-15 %)'],
    0,
    'Soll: 40 · 45 = 1.800 Euro, Ist: 46 · 45 = 2.070 Euro. Abweichung +270 Euro, das sind 270 : 1.800 = 15 %. Ursachen dokumentieren und für künftige Schätzungen einen Puffer einplanen.'),

  // ---------- ITSE: IT-System-Elektroniker ----------
  q(112, 'ap2_itse', 'Abnahme & Übergabe',
    'Du hast eine USV-Anlage für einen Serverraum installiert. Welche Unterlagen und Schritte gehören zur Übergabe an den Betreiber?',
    [
      'Nur die Rechnung',
      'Abnahmeprotokoll mit Messwerten und Funktionstest, Schaltplan und Dokumentation, Einweisung des Betreibers, Prüf- und Wartungsintervalle (z. B. Batterietausch, Prüfung nach DGUV Vorschrift 3)',
      'Nur der Hinweis, dass die Anlage läuft',
      'Eine Liste der Passwörter für alle Geräte im Klartext'
    ],
    1,
    'Die Abnahme belegt die vereinbarten Eigenschaften (Überbrückungszeit, Umschaltverhalten, Alarmierung). Dokumentation, Einweisung und Wartungsplan sorgen dafür, dass der Betreiber die Anlage sicher betreiben kann.'),
  q(113, 'ap2_itse', 'Arbeitssicherheit im Projekt',
    'Vor Arbeiten an einer elektrischen Verteilung im Projekt sind die Fünf Sicherheitsregeln einzuhalten. Welche Reihenfolge ist richtig?',
    [
      'Spannungsfreiheit feststellen, freischalten, erden, abdecken, sichern',
      'Freischalten, gegen Wiedereinschalten sichern, Spannungsfreiheit feststellen, erden und kurzschließen, benachbarte Teile abdecken',
      'Erden, freischalten, sichern, abdecken, messen',
      'Abdecken, messen, freischalten, erden, sichern'
    ],
    1,
    'Die Reihenfolge ist verbindlich. Wer sie ändert, riskiert einen Stromunfall. Die Arbeit darf nur von Elektrofachkräften oder unter deren Aufsicht erfolgen.'),
  q(114, 'ap2_itse', 'Projektdokumentation',
    'Wie sollten Messprotokolle und Prüfergebnisse einer elektrischen Installation dokumentiert werden?',
    [
      'Mündlich weitergeben, schriftlich ist nicht nötig',
      'Schriftlich mit Datum, Prüfer, Messgerät, Messverfahren, Grenzwerten, Messwerten, Ergebnis und Unterschrift, unveränderbar archiviert',
      'Nur als Notiz auf dem Gerät',
      'Nur die bestandenen Prüfungen aufschreiben'
    ],
    1,
    'Nachvollziehbare Protokolle sind Nachweis gegenüber Betreiber, Versicherung und Berufsgenossenschaft. Auch nicht bestandene Prüfungen und die Maßnahmen zur Behebung gehören dazu.'),
  q(115, 'ap2_itse', 'Qualitätssicherung',
    'Was beschreibt der PDCA-Zyklus?',
    [
      'Einen Kreislauf aus Plan, Do, Check, Act zur fortlaufenden Verbesserung',
      'Ein Netzwerkprotokoll für Sensoren',
      'Eine Schutzart nach IEC 60529',
      'Die Reihenfolge der Fünf Sicherheitsregeln'
    ],
    0,
    'Plan: Ziel und Maßnahmen planen. Do: umsetzen. Check: Ergebnis mit dem Ziel vergleichen. Act: Wirksames standardisieren oder nachsteuern. Er steckt in ISO 9001 und im kontinuierlichen Verbesserungsprozess.'),
  q(116, 'ap2_itse', 'Fachgespräch',
    'Im Fachgespräch wirst du zu einer Entscheidung gefragt, die du nicht begründen kannst. Wie verhältst du dich am besten?',
    [
      'Raten und selbstbewusst antworten',
      'Ehrlich sagen, was du nicht weißt, und zeigen, wie du die Antwort herleiten oder nachschlagen würdest',
      'Das Thema wechseln',
      'Schweigen, bis die nächste Frage kommt'
    ],
    1,
    'Offenheit und ein nachvollziehbarer Denkweg wirken überzeugender als Raten. Der Ausschuss bewertet Fachlichkeit und Reflexionsfähigkeit.')
];
