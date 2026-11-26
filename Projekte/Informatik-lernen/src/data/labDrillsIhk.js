// IHK-Prüfungsdrills (je 5 Fragen) für acht Labs, die bisher keinen Drill hatten.
// Format wie in den Engines: { id, frage, optionen, korrektIndex, erklaerung }.
// IDs sind global eindeutig (Präfix `ld_`). Quellen stehen am Ende der Erklärung.
const d = (id, frage, optionen, korrektIndex, erklaerung) => ({ id, frage, optionen, korrektIndex, erklaerung });

export const DGUV_V3_DRILL_QUESTIONS = [
  d('ld_dguv_1', 'Welchen Schutzleiterwiderstand (R_PE) darf ein Gerät der Schutzklasse I mit einer Anschlussleitung bis 5 m höchstens haben?',
    ['0,03 Ω', '0,3 Ω', '3 Ω', '30 Ω'], 1,
    'Nach DIN VDE 0701-0702 gilt für Leitungen bis 5 m ein Grenzwert von 0,3 Ω; je weitere 7,5 m Länge steigt er um 0,1 Ω (max. 1,0 Ω). Quelle: DIN VDE 0701-0702.'),
  d('ld_dguv_2', 'Welcher Mindest-Isolationswiderstand wird für Geräte der Schutzklasse II gefordert?',
    ['0,25 MΩ', '1,0 MΩ', '2,0 MΩ', '10 MΩ'], 2,
    'Schutzklasse I: mindestens 1 MΩ, Schutzklasse II: mindestens 2 MΩ, Schutzklasse III: mindestens 0,25 MΩ. Quelle: DIN VDE 0701-0702.'),
  d('ld_dguv_3', 'Warum entfällt bei einem Notebook-Netzteil der Schutzklasse II die Messung des Schutzleiterwiderstands?',
    ['Weil Notebooks nie Strom führen', 'Weil das Gerät keinen Schutzleiter besitzt und durch doppelte Isolierung geschützt ist', 'Weil Netzteile nicht prüfpflichtig sind', 'Weil die Messung bei Niederspannung gefährlich wäre'], 1,
    'Schutzklasse II schützt durch doppelte oder verstärkte Isolierung (Symbol: doppeltes Quadrat). Ein Schutzleiter ist nicht vorhanden, daher wird R_ISO und der Berührungsstrom geprüft. Quelle: DIN VDE 0701-0702.'),
  d('ld_dguv_4', 'Ein RCD (FI) mit I_Δn = 30 mA wird im TN-System geprüft. Welche Abschaltzeit ist bei 230 V Steckdosenstromkreisen höchstens zulässig?',
    ['40 ms', '400 ms', '4 s', '40 s'], 1,
    'Im TN-System sind für Steckdosenstromkreise bis 32 A maximal 0,4 s zulässig, im TT-System 0,2 s. Der RCD muss zwischen 0,5 · I_Δn und 1,0 · I_Δn auslösen. Quelle: DIN VDE 0100-410.'),
  d('ld_dguv_5', 'Wer darf die Prüfung ortsveränderlicher elektrischer Betriebsmittel nach DGUV Vorschrift 3 durchführen?',
    ['Jeder Mitarbeiter nach kurzer Einweisung', 'Eine Elektrofachkraft oder eine elektrotechnisch unterwiesene Person unter Leitung und Aufsicht einer Elektrofachkraft', 'Nur der Hersteller des Geräts', 'Der Datenschutzbeauftragte'], 1,
    'Die Prüfung erfordert Fachkunde: Elektrofachkraft, bei einfachen Prüfungen mit geeigneten Messgeräten auch elektrotechnisch unterwiesene Personen unter deren Aufsicht. Der Unternehmer bleibt verantwortlich. Quelle: DGUV Vorschrift 3.')
];

export const BSI_GRUNDSCHUTZ_DRILL_QUESTIONS = [
  d('ld_bsi_1', 'Welche drei Schutzbedarfskategorien verwendet der BSI IT-Grundschutz?',
    ['Niedrig, mittel, hoch', 'Normal, hoch, sehr hoch', 'Öffentlich, intern, geheim', 'Gering, erhöht, kritisch'], 1,
    'Der Schutzbedarf wird als normal, hoch oder sehr hoch festgelegt, getrennt für Vertraulichkeit, Integrität und Verfügbarkeit. Quelle: BSI-Standard 200-2.'),
  d('ld_bsi_2', 'Ein Server hat Vertraulichkeit „normal“, Integrität „hoch“ und Verfügbarkeit „sehr hoch“. Welcher Gesamtschutzbedarf ergibt sich nach dem Maximumprinzip?',
    ['Normal', 'Hoch', 'Sehr hoch', 'Der Durchschnitt: hoch'], 2,
    'Beim Maximumprinzip bestimmt der höchste Einzelwert den Gesamtschutzbedarf. Hier ist das „sehr hoch“. Quelle: BSI-Standard 200-2.'),
  d('ld_bsi_3', 'Welche der folgenden Absicherungsvorgehen kennt der IT-Grundschutz?',
    ['Basis-, Standard- und Kern-Absicherung', 'Server-, Client- und Netz-Absicherung', 'Rot-, Gelb- und Grün-Absicherung', 'Nur eine einheitliche Vollabsicherung'], 0,
    'Basis-Absicherung (schneller Einstieg), Standard-Absicherung (vollständiger Schutz) und Kern-Absicherung (Fokus auf die wichtigsten Werte). Quelle: BSI-Standard 200-2.'),
  d('ld_bsi_4', 'Fünf Anwendungen laufen virtualisiert auf demselben physischen Host. Welchen Effekt beschreibt das beim Schutzbedarf?',
    ['Verteilungseffekt', 'Kumulationseffekt', 'Vererbungseffekt', 'Reduktionseffekt'], 1,
    'Beim Kumulationseffekt erhöht sich der Schutzbedarf eines Systems, weil mehrere Anwendungen darauf konzentriert sind: Fällt der Host aus, sind alle betroffen. Der Verteilungseffekt wirkt dagegen senkend. Quelle: BSI-Standard 200-2.'),
  d('ld_bsi_5', 'Die NIS-2-Richtlinie verlangt bei erheblichen Sicherheitsvorfällen eine Frühwarnung an die zuständige Behörde. Innerhalb welcher Zeit?',
    ['Innerhalb von 24 Stunden', 'Innerhalb von 7 Tagen', 'Innerhalb von 30 Tagen', 'Gar nicht, nur der Abschlussbericht ist Pflicht'], 0,
    'Frühwarnung binnen 24 Stunden, Meldung des Vorfalls binnen 72 Stunden, Abschlussbericht spätestens nach einem Monat. Quelle: Richtlinie (EU) 2022/2555 (NIS-2), Art. 23.')
];

export const DPIA_DRILL_QUESTIONS = [
  d('ld_dpia_1', 'Wann ist nach der DSGVO eine Datenschutz-Folgenabschätzung (DSFA) erforderlich?',
    ['Bei jeder Verarbeitung personenbezogener Daten', 'Wenn die Verarbeitung voraussichtlich ein hohes Risiko für die Rechte und Freiheiten natürlicher Personen hat', 'Nur bei Verarbeitung durch Behörden', 'Nur wenn ein Betriebsrat existiert'], 1,
    'Art. 35 Abs. 1 DSGVO verlangt eine DSFA bei voraussichtlich hohem Risiko, etwa bei Profiling, umfangreicher Verarbeitung besonderer Datenkategorien oder systematischer Überwachung öffentlicher Bereiche. Quelle: DSGVO Art. 35.'),
  d('ld_dpia_2', 'Nach den Leitlinien der Datenschutzbehörden gilt als Faustregel: Ab wie vielen zutreffenden Kriterien ist eine DSFA in der Regel durchzuführen?',
    ['Ab 1 Kriterium', 'Ab 2 Kriterien', 'Erst ab 5 Kriterien', 'Nur wenn alle Kriterien zutreffen'], 1,
    'Die Leitlinien WP 248 (Art.-29-Gruppe, später EDSA) nennen neun Kriterien. Treffen mindestens zwei zu, ist meist eine DSFA nötig. Im Einzelfall kann auch ein Kriterium genügen. Quelle: WP 248 rev.01.'),
  d('ld_dpia_3', 'Wann muss die DSFA durchgeführt werden?',
    ['Vor Beginn der Verarbeitung', 'Spätestens ein Jahr nach Start', 'Erst nach einer Beschwerde', 'Nach dem ersten Datenvorfall'], 0,
    'Die DSFA ist eine Vorabprüfung („vorab eine Abschätzung“). Sie wird vor Beginn der Verarbeitung durchgeführt und bei Änderungen des Risikos überprüft. Quelle: DSGVO Art. 35 Abs. 1 und 11.'),
  d('ld_dpia_4', 'Welcher Bestandteil gehört NICHT zum Mindestinhalt einer DSFA?',
    ['Beschreibung der Verarbeitungsvorgänge und Zwecke', 'Bewertung der Notwendigkeit und Verhältnismäßigkeit', 'Bewertung der Risiken für die Betroffenen', 'Gewinnprognose des Verantwortlichen'], 3,
    'Art. 35 Abs. 7 DSGVO verlangt: systematische Beschreibung, Notwendigkeit/Verhältnismäßigkeit, Risikobewertung und Abhilfemaßnahmen (TOMs). Eine Gewinnprognose gehört nicht dazu. Quelle: DSGVO Art. 35 Abs. 7.'),
  d('ld_dpia_5', 'Die DSFA zeigt ein hohes Restrisiko, das sich durch Maßnahmen nicht senken lässt. Was ist zu tun?',
    ['Die Verarbeitung trotzdem starten und dokumentieren', 'Vor Beginn die Aufsichtsbehörde konsultieren', 'Das Ergebnis löschen', 'Die Betroffenen um Verzicht auf ihre Rechte bitten'], 1,
    'Bleibt nach den Maßnahmen ein hohes Risiko, ist vor der Verarbeitung die Aufsichtsbehörde zu konsultieren. Quelle: DSGVO Art. 36.')
];

export const TOM_DRILL_QUESTIONS = [
  d('ld_tom_1', 'Welche vier Schutzziele nennt Art. 32 Abs. 1 lit. b DSGVO für die Sicherheit der Verarbeitung?',
    ['Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit der Systeme', 'Authentizität, Anonymität, Effizienz und Kosten', 'Zutritt, Zugang, Zugriff und Weitergabe', 'Prävention, Detektion, Reaktion und Recovery'], 0,
    'Verlangt werden die dauerhafte Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit der Systeme und Dienste. Quelle: DSGVO Art. 32.'),
  d('ld_tom_2', 'Was versteht man unter Pseudonymisierung?',
    ['Daten werden unwiderruflich gelöscht', 'Personenbezogene Daten werden so ersetzt, dass sie ohne zusätzliche, getrennt aufbewahrte Informationen keiner Person mehr zugeordnet werden können', 'Daten werden nur auf Papier gespeichert', 'Daten werden an Dritte verkauft'], 1,
    'Pseudonymisierte Daten bleiben personenbezogen, weil eine Re-Identifizierung mit Zusatzinformationen möglich ist. Anonymisierte Daten sind dagegen nicht mehr zuordenbar. Quelle: DSGVO Art. 4 Nr. 5.'),
  d('ld_tom_3', 'Welche Maßnahme dient primär der Verfügbarkeitskontrolle?',
    ['Verschlüsselte Festplatten', 'USV, redundante Server und ein getestetes Backup mit Wiederherstellung', 'Rollenbasierte Rechte im ERP', 'Besucherprotokoll am Empfang'], 1,
    'Verfügbarkeit wird durch Redundanz (USV, RAID, Cluster), Backup und Notfallpläne gesichert. Verschlüsselung betrifft die Vertraulichkeit, Rechtekonzepte die Zugriffskontrolle.'),
  d('ld_tom_4', 'Ein Unternehmen lässt Kundendaten von einem Cloud-Dienstleister verarbeiten. Welcher Vertrag ist erforderlich?',
    ['Ein Auftragsverarbeitungsvertrag (AV-Vertrag)', 'Ein Mietvertrag', 'Ein Arbeitsvertrag mit dem Dienstleister', 'Kein Vertrag, wenn der Dienstleister in der EU sitzt'], 0,
    'Wer personenbezogene Daten im Auftrag verarbeiten lässt, braucht einen Vertrag nach Art. 28 DSGVO mit Weisungsgebundenheit, TOMs und Kontrollrechten. Quelle: DSGVO Art. 28.'),
  d('ld_tom_5', 'Was fordert Art. 32 Abs. 1 lit. d DSGVO zusätzlich zu den technischen Maßnahmen?',
    ['Ein Verfahren zur regelmäßigen Überprüfung, Bewertung und Evaluierung der Wirksamkeit der Maßnahmen', 'Den Verzicht auf Cloud-Dienste', 'Eine jährliche Neuanschaffung der Hardware', 'Die Benennung eines Betriebsrats'], 0,
    'TOMs sind kein Einmalprojekt: Ihre Wirksamkeit muss regelmäßig geprüft und nachgewiesen werden (Rechenschaftspflicht). Quelle: DSGVO Art. 32 Abs. 1 lit. d.')
];

export const CPM_DRILL_QUESTIONS = [
  d('ld_cpm_1', 'Wie berechnet sich der früheste Endzeitpunkt (FEZ) eines Vorgangs in der Vorwärtsrechnung?',
    ['FEZ = FAZ + Dauer', 'FEZ = SAZ − Dauer', 'FEZ = SEZ + Puffer', 'FEZ = Dauer · Anzahl der Nachfolger'], 0,
    'Vorwärtsrechnung: FEZ = FAZ + Dauer, wobei der FAZ des Nachfolgers der größte FEZ aller Vorgänger ist.'),
  d('ld_cpm_2', 'Vorgang A (3 Tage) ist Vorgänger von B (4 Tage) und C (2 Tage); beide sind Vorgänger von D (1 Tag). Wie lang ist die Projektdauer?',
    ['6 Tage', '8 Tage', '10 Tage', '4 Tage'], 1,
    'Weg A-B-D = 3 + 4 + 1 = 8 Tage, Weg A-C-D = 3 + 2 + 1 = 6 Tage. Die Projektdauer entspricht dem längsten Weg: 8 Tage.'),
  d('ld_cpm_3', 'Vorgang A (3 Tage) ist Vorgänger von B (4 Tage) und C (2 Tage); B und C sind Vorgänger von D (1 Tag). Welchen Gesamtpuffer hat Vorgang C?',
    ['0 Tage', '1 Tag', '2 Tage', '4 Tage'], 2,
    'C liegt nicht auf dem kritischen Weg A-B-D (8 Tage). Der Weg A-C-D hat 6 Tage. Gesamtpuffer = 8 − 6 = 2 Tage.'),
  d('ld_cpm_4', 'Woran erkennt man Vorgänge auf dem kritischen Pfad?',
    ['Sie haben den größten Aufwand in Euro', 'Ihr Gesamtpuffer beträgt 0', 'Sie haben die meisten Nachfolger', 'Sie beginnen am Montag'], 1,
    'Auf dem kritischen Pfad ist die Differenz zwischen spätester und frühester Lage 0. Jede Verzögerung verschiebt das Projektende.'),
  d('ld_cpm_5', 'Was beschreibt der freie Puffer (FP) eines Vorgangs?',
    ['Zeit, um die der Vorgang verzögert werden darf, ohne den frühesten Beginn der Nachfolger zu verschieben', 'Zeit, um die das gesamte Projekt später enden darf', 'Die Pause zwischen zwei Arbeitstagen', 'Den Zeitpuffer für Urlaub'], 0,
    'Freier Puffer: FP = min(FAZ der Nachfolger) − FEZ. Er ist höchstens so groß wie der Gesamtpuffer und beeinflusst nur die Nachfolger nicht.')
];

export const NWA_DRILL_QUESTIONS = [
  d('ld_nwa_1', 'Bei einer Nutzwertanalyse betragen die Gewichte 50 %, 30 % und 20 %. Eine Variante erhält die Punkte 8, 6 und 10. Wie hoch ist ihr Nutzwert?',
    ['7,8', '8,0', '24', '6,0'], 0,
    'Nutzwert = Σ (Gewicht · Punkte) = 0,5 · 8 + 0,3 · 6 + 0,2 · 10 = 4,0 + 1,8 + 2,0 = 7,8.'),
  d('ld_nwa_2', 'Was passiert mit einer Variante, die ein K.-o.-Kriterium nicht erfüllt?',
    ['Sie bekommt nur Abzüge im Nutzwert', 'Sie scheidet aus, unabhängig von ihrem Nutzwert', 'Sie wird automatisch Erstplatzierte', 'Das Kriterium wird ignoriert'], 1,
    'K.-o.-Kriterien sind Muss-Anforderungen. Wird eines verfehlt, scheidet die Variante aus, auch wenn die Summe hoch wäre.'),
  d('ld_nwa_3', 'Wie sollten die Kriteriengewichte in einer Nutzwertanalyse gewählt werden?',
    ['Jedes Gewicht beliebig, die Summe ist egal', 'Die Gewichte ergeben zusammen 100 % bzw. 1', 'Alle Kriterien gleich, damit niemand benachteiligt wird', 'Die Gewichte entsprechen den Preisen'], 1,
    'Gewichte spiegeln die Bedeutung der Kriterien wider und werden auf 100 % normiert, damit die Nutzwerte vergleichbar bleiben.'),
  d('ld_nwa_4', 'Wozu dient eine Sensitivitätsanalyse bei der Nutzwertanalyse?',
    ['Sie prüft, ob sich das Ranking bei geänderten Gewichten ändert', 'Sie berechnet die Kosten', 'Sie ersetzt die Kriterienauswahl', 'Sie prüft die Netzwerklatenz'], 0,
    'Die Sensitivitätsanalyse variiert Gewichte oder Bewertungen und zeigt, wie stabil die Rangfolge ist. So wird die Subjektivität der Gewichtung sichtbar.'),
  d('ld_nwa_5', 'Welche Aussage zur Nutzwertanalyse trifft zu?',
    ['Sie liefert objektive, subjektfreie Ergebnisse', 'Sie macht auch nicht-monetäre Kriterien vergleichbar, enthält aber subjektive Gewichtungen und Bewertungen', 'Sie ist nur für Kosten geeignet', 'Sie ersetzt jede Wirtschaftlichkeitsrechnung'], 1,
    'Die NWA bewertet qualitative und quantitative Kriterien in einer Zahl. Die Gewichte und Punkte sind jedoch subjektiv und sollten begründet und dokumentiert werden.')
];

export const TCO_DRILL_QUESTIONS = [
  d('ld_tco_1', 'Welche Kosten gehören zu den Gesamtkosten des Betriebs (TCO) einer Lösung?',
    ['Nur der Anschaffungspreis', 'Anschaffung plus laufende Kosten wie Strom, Lizenzen, Wartung, Administration und Schulung', 'Nur die Lizenzkosten', 'Nur der erwartete Gewinn'], 1,
    'TCO (Total Cost of Ownership) betrachtet alle Kosten über die Nutzungsdauer: einmalige (CAPEX) und laufende (OPEX).'),
  d('ld_tco_2', 'Eine Investition kostet 12.000 € und spart jährlich 4.000 €. Wie lang ist die statische Amortisationsdauer?',
    ['2 Jahre', '3 Jahre', '4 Jahre', '48 Jahre'], 1,
    'Amortisationsdauer = Investition / jährliche Einsparung = 12.000 € / 4.000 € = 3 Jahre.'),
  d('ld_tco_3', 'Eine Lösung kostet 10.000 € Anschaffung und 2.000 € Betrieb pro Jahr. Wie hoch ist die TCO nach 4 Jahren?',
    ['8.000 €', '12.000 €', '18.000 €', '28.000 €'], 2,
    'TCO = 10.000 € + 4 · 2.000 € = 18.000 €.'),
  d('ld_tco_4', 'Wie wird der ROI (Return on Investment) berechnet?',
    ['(Gewinn bzw. Nutzen − Kosten) / Kosten · 100 %', 'Kosten / Gewinn', 'Gewinn · Kosten', 'Nutzen − Abschreibung'], 0,
    'ROI = (Nutzen − Kosten) / Kosten · 100 %. Beispiel: 15.000 € Nutzen bei 10.000 € Kosten ergibt 50 % ROI.'),
  d('ld_tco_5', 'Was bedeuten CAPEX und OPEX?',
    ['Investitionsausgaben (einmalig) und Betriebsausgaben (laufend)', 'Betriebsausgaben und Investitionsausgaben, in dieser Reihenfolge', 'Kosten für Hardware und Kosten für Mitarbeiter', 'Gewinn vor und nach Steuern'], 0,
    'CAPEX (Capital Expenditure) sind einmalige Investitionen, z. B. Server. OPEX (Operational Expenditure) sind laufende Kosten, z. B. Cloud-Gebühren. Cloud verschiebt Kosten tendenziell von CAPEX zu OPEX.')
];

export const ITSM_DRILL_QUESTIONS = [
  d('ld_itsm_1', 'Nach ITIL ergibt sich die Priorität eines Tickets aus welchen beiden Faktoren?',
    ['Auswirkung (Impact) und Dringlichkeit (Urgency)', 'Preis und Dauer', 'Kunde und Mitarbeiter', 'Alter und Größe des Tickets'], 0,
    'Priorität = Auswirkung × Dringlichkeit. Hohe Auswirkung und hohe Dringlichkeit ergeben die höchste Priorität (P1).'),
  d('ld_itsm_2', 'Was ist das Ziel des Incident Managements?',
    ['Die Ursache dauerhaft beseitigen', 'Den normalen Servicebetrieb so schnell wie möglich wiederherstellen', 'Neue Funktionen planen', 'Die Lizenzen verwalten'], 1,
    'Incident Management stellt den Dienst schnell wieder her, auch mit einem Workaround. Die Ursachenbeseitigung ist Aufgabe des Problem Managements.'),
  d('ld_itsm_3', 'Mehrere Tickets zeigen dieselbe Fehlerursache, die noch unbekannt ist. Welcher Prozess ist zuständig?',
    ['Change Management', 'Problem Management', 'Release Management', 'Asset Management'], 1,
    'Ein Problem ist die unbekannte Ursache eines oder mehrerer Incidents. Problem Management sucht die Root Cause und dokumentiert Known Errors.'),
  d('ld_itsm_4', 'Wozu dient das Change Advisory Board (CAB)?',
    ['Es bewertet Risiko und Auswirkungen von Änderungen und berät über die Freigabe', 'Es beantwortet Anrufe von Anwendern', 'Es kauft Hardware ein', 'Es schreibt Rechnungen'], 0,
    'Das CAB prüft Änderungen mit Blick auf Risiko, Rückfallplan und Geschäftsauswirkung. Standard-Changes sind vorab genehmigt und brauchen kein CAB.'),
  d('ld_itsm_5', 'Was bezeichnet ein SLA (Service Level Agreement)?',
    ['Eine Vereinbarung über Leistungsumfang und Servicequalität, z. B. Reaktions- und Lösungszeiten', 'Eine Software für Backups', 'Einen Netzwerkstandard', 'Eine Prüfnorm für Elektrogeräte'], 0,
    'Ein SLA legt zwischen Anbieter und Kunde messbare Servicelevel fest, etwa Verfügbarkeit von 99,9 % oder Reaktionszeit 2 Stunden.')
];
