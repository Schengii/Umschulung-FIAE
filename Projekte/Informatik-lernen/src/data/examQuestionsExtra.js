// Zusätzliche IHK-Prüfungsfragen (IDs ab 52) für bisher dünn besetzte Bereiche:
// IT-Sicherheit, WiSo/Vertragsrecht, Projektmanagement, Cloud, Datenbanken, Netzwerkdienste.
// Optionales Feld `source: { label, url }` verweist auf die Primärquelle (Gesetz, Norm, Standard).
// Gesetzestexte: gesetze-im-internet.de (Bundesministerium der Justiz).
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

const BGB = (par, label) => ({ label: `BGB § ${par}`, url: `https://www.gesetze-im-internet.de/bgb/__${par}.html`, ...(label ? { label } : {}) });

export const EXAM_QUESTIONS_EXTRA = [
  // ---------- IT-Sicherheit & Datenschutz ----------
  q(52, 'ap1', 'Datenschutz & Meldepflicht',
    'Ein Verantwortlicher stellt fest, dass durch einen Hackerangriff personenbezogene Daten abgeflossen sind (Risiko für die Betroffenen). Innerhalb welcher Frist ist die Datenschutzverletzung grundsätzlich der Aufsichtsbehörde zu melden?',
    ['Unverzüglich, möglichst binnen 72 Stunden nach Bekanntwerden', 'Innerhalb von 14 Tagen', 'Zum Ende des Quartals im Rahmen des Jahresberichts', 'Nur auf Anfrage der Behörde'],
    0,
    'Art. 33 DSGVO verlangt die Meldung unverzüglich und möglichst binnen 72 Stunden, nachdem die Verletzung bekannt wurde. Eine spätere Meldung muss begründet werden. Entfällt das Risiko für die Betroffenen, ist keine Meldung nötig.',
    { label: 'DSGVO Art. 33', url: 'https://dejure.org/gesetze/DSGVO/33.html' }),
  q(53, 'ap1', 'IT-Grundschutz (BSI)',
    'Das BSI beschreibt im IT-Grundschutz drei Vorgehensweisen zur Absicherung. Welche Aussage trifft zu?',
    [
      'Basis-, Standard- und Kern-Absicherung',
      'Niedrig-, Mittel- und Hoch-Absicherung nach ISO 9001',
      'Server-, Client- und Netz-Absicherung',
      'Prävention, Detektion und Reaktion als feste Zertifizierungsstufen'
    ],
    0,
    'Nach BSI-Standard 200-2 gibt es die Basis-Absicherung (schneller Einstieg), die Standard-Absicherung (vollständiger Schutz nach Kompendium) und die Kern-Absicherung (Fokus auf die „Kronjuwelen“). Das IT-Grundschutz-Kompendium gliedert seine Bausteine in Schichten (z. B. ISMS, ORP, CON, OPS, DER, APP, SYS, IND, NET, INF).',
    { label: 'BSI IT-Grundschutz', url: 'https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html' }),
  q(54, 'ap1', 'Schutzziele',
    'Ein Hashwert (z. B. SHA-256) wird für eine heruntergeladene Datei veröffentlicht. Welches Schutzziel wird damit primär geprüft?',
    ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Anonymität'],
    1,
    'Stimmt der selbst berechnete Hashwert mit dem veröffentlichten überein, wurde die Datei nicht verändert: Das ist Integrität. Vertraulichkeit würde Verschlüsselung erfordern, Verfügbarkeit Redundanz und Backup.'),
  q(55, 'ap2_fisi', 'Kryptografie',
    'Eine digitale Signatur soll die Herkunft eines Dokuments beweisen. Mit welchem Schlüssel wird sie beim asymmetrischen Verfahren erzeugt und womit geprüft?',
    [
      'Erzeugt mit dem öffentlichen Schlüssel des Empfängers, geprüft mit dessen privatem Schlüssel',
      'Erzeugt mit dem privaten Schlüssel des Absenders, geprüft mit dessen öffentlichem Schlüssel',
      'Erzeugt und geprüft mit demselben geheimen Sitzungsschlüssel',
      'Erzeugt mit dem öffentlichen Schlüssel des Absenders, geprüft mit dessen privatem Schlüssel'
    ],
    1,
    'Signiert wird mit dem privaten Schlüssel des Absenders; jeder kann mit dem öffentlichen Schlüssel prüfen, dass nur der Besitzer des privaten Schlüssels signiert haben kann (Authentizität, Nicht-Abstreitbarkeit). Die Verschlüsselung für Vertraulichkeit läuft umgekehrt mit dem öffentlichen Schlüssel des Empfängers.'),
  q(56, 'ap2_fisi', 'Firewall & Netzwerksicherheit',
    'Welches Grundprinzip sollte eine Firewall-Regelbasis für den Verkehr von außen nach innen verfolgen?',
    [
      'Alles erlauben und nur bekannte Angriffe sperren (Blacklist)',
      'Alles verbieten und nur ausdrücklich benötigten Verkehr erlauben (Default Deny)',
      'Nur ICMP erlauben, da es ungefährlich ist',
      'Regeln werden nach Alter sortiert, die neueste zuletzt'
    ],
    1,
    'Das Whitelist-Prinzip „Default Deny“ minimiert die Angriffsfläche: Nur dokumentierter, benötigter Verkehr wird freigegeben, alles andere wird verworfen. Regeln werden von oben nach unten ausgewertet, die erste passende gewinnt.'),
  q(57, 'ap1', 'Passwortspeicherung',
    'Wozu dient ein „Salt“ beim Speichern von Passwort-Hashes?',
    [
      'Er verschlüsselt den Hash reversibel für den Administrator',
      'Er sorgt dafür, dass gleiche Passwörter unterschiedliche Hashes ergeben und Rainbow-Tables unwirksam werden',
      'Er verkürzt die Rechenzeit des Hashverfahrens',
      'Er ersetzt die Notwendigkeit eines starken Passworts'
    ],
    1,
    'Ein zufälliger, pro Konto eindeutiger Salt wird vor dem Hashen angehängt. Dadurch ergeben identische Passwörter verschiedene Hashes, und vorberechnete Tabellen (Rainbow-Tables) funktionieren nicht. Für Passwörter sollten zusätzlich bewusst langsame Verfahren wie bcrypt, scrypt oder Argon2 genutzt werden.'),
  q(58, 'ap1', 'Datensicherung',
    'Was besagt die „3-2-1-Regel“ der Datensicherung?',
    [
      '3 Kopien der Daten, auf 2 verschiedenen Medientypen, davon 1 Kopie extern/offsite',
      '3 Backups pro Tag, 2 pro Woche, 1 pro Monat',
      '3 Administratoren, 2 Rechenzentren, 1 Notfallplan',
      '3 Vollbackups, 2 differenzielle, 1 inkrementelles'
    ],
    0,
    'Gemeint sind drei Kopien (Original plus zwei Backups) auf zwei unterschiedlichen Medien, davon eine an einem anderen Standort (offsite oder offline). So überstehen die Daten Geräteausfall, Brand und Ransomware deutlich besser.'),

  // ---------- WiSo & Vertragsrecht ----------
  q(59, 'ap1', 'Kaufvertrag',
    'Welche Hauptpflichten ergeben sich für den Verkäufer aus einem Kaufvertrag nach BGB?',
    [
      'Zahlung des Kaufpreises und Abnahme der Ware',
      'Übergabe der Sache und Verschaffung des Eigentums, frei von Sach- und Rechtsmängeln',
      'Nur Übergabe der Rechnung',
      'Zahlung der Versandkosten in jedem Fall'
    ],
    1,
    'Nach § 433 Abs. 1 BGB muss der Verkäufer die Sache übergeben und das Eigentum verschaffen, und zwar frei von Sach- und Rechtsmängeln. Der Käufer muss nach Abs. 2 den Kaufpreis zahlen und die Sache abnehmen.',
    BGB('433')),
  q(60, 'ap1', 'Kaufvertrag',
    'Welche Verjährungsfrist gilt für Mängelansprüche beim Kauf einer neuen beweglichen Sache (z. B. Notebook) im Regelfall?',
    ['6 Monate', '1 Jahr', '2 Jahre', '5 Jahre'],
    2,
    'Nach § 438 Abs. 1 Nr. 3 BGB verjähren Mängelansprüche bei beweglichen Sachen in zwei Jahren ab Ablieferung. Bei Bauwerken gelten fünf Jahre. Im Verbrauchsgüterkauf kann die Frist bei neuen Sachen nicht verkürzt werden.',
    BGB('438')),
  q(61, 'ap1', 'Handelskauf',
    'Ein Unternehmen (Kaufmann) erhält von einem anderen Kaufmann Hardware mit offensichtlichem Mangel. Wie muss es nach HGB reagieren, um seine Mängelrechte nicht zu verlieren?',
    [
      'Die Ware unverzüglich untersuchen und den Mangel unverzüglich rügen',
      'Innerhalb von zwei Jahren schriftlich reklamieren',
      'Gar nicht, die Rechte bleiben immer erhalten',
      'Erst nach Bezahlung der Rechnung reklamieren'
    ],
    0,
    'Beim beidseitigen Handelskauf besteht die Untersuchungs- und Rügepflicht (§ 377 HGB): Offene Mängel sind unverzüglich anzuzeigen, verdeckte Mängel unverzüglich nach Entdeckung. Versäumt der Käufer das, gilt die Ware als genehmigt.',
    { label: 'HGB § 377', url: 'https://www.gesetze-im-internet.de/hgb/__377.html' }),
  q(62, 'ap1', 'Sozialversicherung',
    'Welche der folgenden Versicherungen gehört NICHT zu den fünf Zweigen der gesetzlichen Sozialversicherung?',
    ['Krankenversicherung', 'Pflegeversicherung', 'Berufshaftpflichtversicherung', 'Unfallversicherung'],
    2,
    'Die gesetzliche Sozialversicherung besteht aus Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung. Die Berufshaftpflicht ist eine private Versicherung. Die Beiträge zur Unfallversicherung trägt allein der Arbeitgeber.'),

  // ---------- Projektmanagement ----------
  q(63, 'ap1', 'Projektmanagement',
    'In einem Netzplan hat ein Vorgang einen Gesamtpuffer von 0 Tagen. Was bedeutet das?',
    [
      'Der Vorgang liegt auf dem kritischen Pfad, jede Verzögerung verschiebt das Projektende',
      'Der Vorgang kann beliebig verschoben werden',
      'Der Vorgang ist bereits abgeschlossen',
      'Der Vorgang kostet nichts'
    ],
    0,
    'Vorgänge mit Gesamtpuffer 0 bilden den kritischen Pfad. Er ist der längste Weg durch den Netzplan und bestimmt die Mindestprojektdauer. Verzögert sich ein kritischer Vorgang, verschiebt sich das Projektende.'),
  q(64, 'ap1', 'Projektmanagement',
    'Welche drei Zielgrößen bilden das „magische Dreieck“ des Projektmanagements?',
    ['Zeit, Kosten, Qualität/Leistung', 'Risiko, Nutzen, Aufwand', 'Planung, Durchführung, Kontrolle', 'Kunde, Lieferant, Team'],
    0,
    'Zeit, Kosten und Qualität (Leistungsumfang) hängen voneinander ab: Wird eine Größe verändert, wirkt sich das auf mindestens eine andere aus. Beispiel: Kürzere Laufzeit bei gleichem Umfang erhöht meist die Kosten.'),
  q(65, 'ap2_fiae', 'Agile Methoden',
    'Welche Aussage zur Dauer eines Sprints in Scrum trifft nach dem Scrum Guide zu?',
    [
      'Ein Sprint dauert immer genau 4 Wochen',
      'Ein Sprint ist auf höchstens einen Monat begrenzt und hat eine feste Länge',
      'Ein Sprint endet erst, wenn alle Backlog-Einträge fertig sind',
      'Die Dauer wird täglich im Daily Scrum neu festgelegt'
    ],
    1,
    'Sprints sind Ereignisse mit fester Länge von einem Monat oder weniger, um Planbarkeit zu schaffen. Ein neuer Sprint beginnt unmittelbar nach dem Ende des vorherigen. Das Sprint-Ziel bleibt während des Sprints stabil.',
    { label: 'Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html' }),

  // ---------- Cloud & Virtualisierung ----------
  q(66, 'ap2_fisi', 'Cloud Computing',
    'Ein Unternehmen mietet virtuelle Maschinen, installiert und patcht Betriebssystem und Anwendungen selbst, während der Anbieter nur Hardware und Hypervisor betreibt. Um welches Servicemodell handelt es sich?',
    ['SaaS', 'PaaS', 'IaaS', 'DaaS als Software-Lizenz'],
    2,
    'Bei Infrastructure as a Service stellt der Anbieter Rechenleistung, Speicher und Netz bereit; Betriebssystem, Middleware und Anwendungen verantwortet der Kunde. Bei PaaS liefert der Anbieter zusätzlich die Laufzeitumgebung, bei SaaS die fertige Anwendung. Die drei Modelle definiert NIST SP 800-145.',
    { label: 'NIST SP 800-145', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' }),
  q(67, 'ap2_fisi', 'Virtualisierung',
    'Was kennzeichnet einen Typ-1-Hypervisor (Bare-Metal)?',
    [
      'Er läuft als Anwendung innerhalb eines normalen Desktop-Betriebssystems',
      'Er läuft direkt auf der Hardware und verwaltet die virtuellen Maschinen ohne Host-Betriebssystem darunter',
      'Er kann nur Container starten, keine VMs',
      'Er benötigt zwingend einen Cloud-Anbieter'
    ],
    1,
    'Typ-1-Hypervisor (z. B. VMware ESXi, Microsoft Hyper-V, KVM) setzen direkt auf der Hardware auf und sind damit performanter und für Server üblich. Typ-2-Hypervisor (z. B. VirtualBox) laufen als Programm in einem Host-Betriebssystem.'),

  // ---------- Datenbanken ----------
  q(68, 'ap2_fiae', 'SQL',
    'Was ist der Unterschied zwischen WHERE und HAVING in SQL?',
    [
      'WHERE filtert einzelne Zeilen vor der Gruppierung, HAVING filtert Gruppen nach GROUP BY',
      'HAVING filtert Zeilen vor der Gruppierung, WHERE nach der Gruppierung',
      'Beide sind austauschbar und verhalten sich identisch',
      'WHERE funktioniert nur bei UPDATE, HAVING nur bei SELECT'
    ],
    0,
    'Die Reihenfolge der Auswertung lautet FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Bedingungen auf Aggregatfunktionen wie COUNT(*) > 5 gehören daher in HAVING, Bedingungen auf Einzelspalten in WHERE.'),
  q(69, 'ap2_fiae', 'SQL',
    'Tabelle kunde (3 Zeilen) wird per LEFT JOIN mit bestellung verknüpft; ein Kunde hat keine Bestellung. Was liefert das Ergebnis für diesen Kunden?',
    [
      'Der Kunde fehlt im Ergebnis',
      'Eine Zeile mit den Kundendaten und NULL in den Bestellspalten',
      'Eine Fehlermeldung wegen fehlendem Fremdschlüssel',
      'Eine Zeile mit leeren Kundendaten'
    ],
    1,
    'Ein LEFT JOIN behält alle Zeilen der linken Tabelle. Fehlt rechts ein Partner, werden die Spalten der rechten Tabelle mit NULL aufgefüllt. Ein INNER JOIN würde den Kunden dagegen weglassen.'),

  // ---------- Netzwerkdienste ----------
  q(70, 'ap2_fisi', 'DNS',
    'Welcher DNS-Eintragstyp ordnet einem Hostnamen eine IPv6-Adresse zu?',
    ['A', 'AAAA', 'MX', 'PTR'],
    1,
    'Ein A-Record verweist auf eine IPv4-Adresse, ein AAAA-Record auf IPv6. MX bestimmt den Mailserver einer Domain, PTR dient der Rückwärtsauflösung von IP-Adresse zu Name.'),
  q(71, 'ap1', 'Rechnerarchitektur',
    'Welche Reihenfolge der Speicher nach Zugriffsgeschwindigkeit (schnell zu langsam) ist richtig?',
    [
      'Festplatte, Arbeitsspeicher, L1-Cache, Register',
      'Register, L1-Cache, Arbeitsspeicher, SSD/Festplatte',
      'Arbeitsspeicher, Register, Festplatte, L1-Cache',
      'L1-Cache, Festplatte, Register, Arbeitsspeicher'
    ],
    1,
    'Je näher am Prozessorkern, desto schneller, kleiner und teurer ist der Speicher: Register, L1/L2/L3-Cache, Arbeitsspeicher (RAM), danach SSD und Festplatte. Diese Speicherhierarchie nutzt Caching, um die Lücke zwischen CPU- und Massenspeichertempo zu überbrücken.')
];
