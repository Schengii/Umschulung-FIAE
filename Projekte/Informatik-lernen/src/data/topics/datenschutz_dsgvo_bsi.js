/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Datenschutz, Datensicherheit und Datensicherung abgrenzen und die Schutzziele erklären',
    'Die Grundsätze der DSGVO, die Rechtsgrundlagen nach Art. 6 und die Betroffenenrechte nennen',
    'Technische und organisatorische Maßnahmen (TOM) den Kontrollzielen zuordnen',
    'Eine Schutzbedarfsfeststellung nach BSI IT-Grundschutz mit Maximumprinzip durchführen'
  ],
  content: `
## Drei Begriffe, die oft verwechselt werden

| Begriff | Schützt … | Ziel | Beispiel |
| :--- | :--- | :--- | :--- |
| **Datenschutz** | **Menschen** (ihre personenbezogenen Daten) | informationelle Selbstbestimmung, Rechtsrahmen DSGVO/BDSG | Einwilligung vor dem Newsletter |
| **Datensicherheit / Informationssicherheit** | **alle Daten und Informationen** | Vertraulichkeit, Integrität, Verfügbarkeit | Firewall, Verschlüsselung, Zutrittskontrolle |
| **Datensicherung** | Daten vor **Verlust** | Wiederherstellbarkeit | Backup nach dem 3-2-1-Prinzip |

Datensicherung ist ein Teil der Datensicherheit, und Datensicherheit ist eine Voraussetzung für Datenschutz.

## Schutzziele

![Die drei Schutzziele als Dreieck](schutzziele.svg "Vertraulichkeit, Integrität und Verfügbarkeit mit typischen Bedrohungen und Maßnahmen")

Zu den drei Grundwerten kommen oft **Authentizität** (Daten stammen nachweislich vom angegebenen Absender) und **Verbindlichkeit/Nichtabstreitbarkeit** (eine Handlung kann später nicht geleugnet werden, z. B. durch eine digitale Signatur).

## Die DSGVO

Die **Datenschutz-Grundverordnung** gilt seit dem 25. Mai 2018 unmittelbar in allen EU-Staaten. In Deutschland ergänzt sie das **Bundesdatenschutzgesetz (BDSG)**.

**Personenbezogene Daten** sind alle Informationen über eine identifizierte oder identifizierbare natürliche Person (Art. 4 Nr. 1): Name, Adresse, E-Mail, IP-Adresse, Kundennummer, Standortdaten. **Besondere Kategorien** (Art. 9) wie Gesundheit, Religion, politische Meinung, biometrische und genetische Daten sind besonders geschützt.

### Grundsätze (Art. 5)

1. **Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz**
2. **Zweckbindung** – nur für festgelegte, eindeutige Zwecke
3. **Datenminimierung** – nur so viele Daten wie nötig
4. **Richtigkeit** – Daten aktuell halten, falsche berichtigen oder löschen
5. **Speicherbegrenzung** – nur so lange wie nötig
6. **Integrität und Vertraulichkeit** – angemessene Sicherheit
7. **Rechenschaftspflicht** (Abs. 2) – der Verantwortliche muss die Einhaltung **nachweisen** können

### Rechtsgrundlagen (Art. 6 Abs. 1)

Jede Verarbeitung personenbezogener Daten ist verboten, es sei denn, eine Rechtsgrundlage erlaubt sie (**Verbot mit Erlaubnisvorbehalt**):

| Buchstabe | Rechtsgrundlage | Beispiel |
| :---: | :--- | :--- |
| a | Einwilligung | Newsletter-Anmeldung mit Double-Opt-in |
| b | Vertragserfüllung | Lieferadresse für eine Bestellung |
| c | rechtliche Verpflichtung | Aufbewahrung von Rechnungen nach Steuerrecht |
| d | lebenswichtige Interessen | Notfall im Krankenhaus |
| e | öffentliche Aufgabe | Meldewesen der Behörden |
| f | berechtigtes Interesse | Videoüberwachung des Lagers gegen Diebstahl (nach Interessenabwägung) |

Eine Einwilligung muss **freiwillig, informiert, eindeutig** und **jederzeit widerrufbar** sein.

### Rechte der Betroffenen

| Artikel | Recht |
| :---: | :--- |
| 15 | Auskunft (welche Daten, wozu, woher, an wen, wie lange) |
| 16 | Berichtigung |
| 17 | Löschung („Recht auf Vergessenwerden“) |
| 18 | Einschränkung der Verarbeitung |
| 20 | Datenübertragbarkeit (in einem gängigen, maschinenlesbaren Format) |
| 21 | Widerspruch |

Der Verantwortliche muss **innerhalb eines Monats** antworten (Art. 12 Abs. 3), in Ausnahmefällen mit Begründung später.

### Pflichten des Unternehmens

- **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30)
- **Technische und organisatorische Maßnahmen** (Art. 32)
- **Meldung von Datenpannen** an die Aufsichtsbehörde **binnen 72 Stunden** (Art. 33), bei hohem Risiko auch an die Betroffenen (Art. 34)
- **Datenschutz-Folgenabschätzung** bei voraussichtlich hohem Risiko (Art. 35)
- **Datenschutzbeauftragter** (Art. 37, in Deutschland nach § 38 BDSG in der Regel ab **20 Personen**, die ständig mit automatisierter Verarbeitung beschäftigt sind)
- **Auftragsverarbeitungsvertrag** mit Dienstleistern (Art. 28)
- **Privacy by Design und by Default** (Art. 25): datenschutzfreundliche Technik und Voreinstellungen

Verstöße können Bußgelder bis **20 Mio. Euro oder 4 % des weltweiten Jahresumsatzes** nach sich ziehen, je nachdem, welcher Betrag höher ist (Art. 83).

> [!info] Pseudonymisierung vs. Anonymisierung
> **Pseudonymisierte** Daten (z. B. Kundennummer statt Name) lassen sich mit Zusatzwissen wieder einer Person zuordnen – sie bleiben personenbezogen. **Anonymisierte** Daten lassen sich niemandem mehr zuordnen und fallen nicht mehr unter die DSGVO.

## Technische und organisatorische Maßnahmen (TOM)

Art. 32 DSGVO nennt u. a. Pseudonymisierung und Verschlüsselung, die dauerhafte Sicherstellung von Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit, die rasche Wiederherstellbarkeit und regelmäßige Überprüfung. In der Prüfung werden die Maßnahmen oft noch nach den **Kontrollzielen** des alten BDSG gegliedert:

| Kontrolle | Frage | Beispiele |
| :--- | :--- | :--- |
| **Zutritt** | Wer kommt in die **Räume**? | Schlüssel, Chipkarte, Videoüberwachung, Besucherbuch |
| **Zugang** | Wer kann das **System** benutzen? | Passwortrichtlinie, MFA, automatische Bildschirmsperre |
| **Zugriff** | Wer darf welche **Daten** sehen oder ändern? | Rollen- und Berechtigungskonzept, Need-to-know |
| **Weitergabe** | Wie werden Daten sicher **übertragen**? | TLS, VPN, verschlüsselte USB-Sticks |
| **Eingabe** | Wer hat wann was **eingegeben oder geändert**? | Protokollierung, Audit-Log |
| **Auftrag** | Arbeitet der Dienstleister nach **Weisung**? | AVV, Kontrollen beim Auftragsverarbeiter |
| **Verfügbarkeit** | Sind die Daten vor **Verlust** geschützt? | Backup, USV, RAID, Brandschutz |
| **Trennung** | Werden Daten zu verschiedenen **Zwecken getrennt**? | Mandantentrennung, getrennte Test- und Produktivdaten |

> [!tip] Zutritt, Zugang, Zugriff
> Zutritt = mit den **Füßen** (Raum), Zugang = mit den **Fingern** (Login am System), Zugriff = mit den **Augen** (auf die Daten).

## BSI IT-Grundschutz

Das **Bundesamt für Sicherheit in der Informationstechnik (BSI)** beschreibt mit dem IT-Grundschutz eine Methode, Informationssicherheit systematisch aufzubauen. Sie ist mit **ISO/IEC 27001** vereinbar (Zertifizierung „ISO 27001 auf Basis von IT-Grundschutz“).

| Standard | Inhalt |
| :--- | :--- |
| BSI-Standard 200-1 | Managementsysteme für Informationssicherheit (ISMS) |
| BSI-Standard 200-2 | IT-Grundschutz-Methodik (Basis-, Standard-, Kern-Absicherung) |
| BSI-Standard 200-3 | Risikoanalyse auf der Basis von IT-Grundschutz |
| BSI-Standard 200-4 | Business Continuity Management (Notfallmanagement) |

Das **IT-Grundschutz-Kompendium** enthält Bausteine mit Anforderungen, gegliedert in Prozess-Bausteine (z. B. ISMS, ORP Organisation und Personal, CON Konzepte, OPS Betrieb, DER Detektion und Reaktion) und System-Bausteine (APP Anwendungen, SYS IT-Systeme, IND Industrielle IT, NET Netze, INF Infrastruktur).

### Schutzbedarfsfeststellung

Für jedes Objekt (Geschäftsprozess, Anwendung, Server, Raum) wird je Grundwert der Schutzbedarf eingeschätzt: **normal**, **hoch** oder **sehr hoch**. Grundlage sind mögliche Schäden (Verstöße gegen Gesetze, Beeinträchtigung des informationellen Selbstbestimmungsrechts, finanzielle Auswirkungen, Ansehensverlust usw.).

Bei der Vererbung auf IT-Systeme gelten drei Regeln:

- **Maximumprinzip**: Ein Server erbt den **höchsten** Schutzbedarf der Anwendungen, die auf ihm laufen.
- **Kumulationseffekt**: Viele Anwendungen mit „normal“ können zusammen einen **höheren** Schutzbedarf ergeben (z. B. fällt mit einem Host alles gleichzeitig aus).
- **Verteilungseffekt**: Ist eine Anwendung redundant auf mehrere Systeme verteilt, kann der Schutzbedarf einzelner Systeme (meist bei der Verfügbarkeit) **niedriger** sein.
`,
  codeSnippet: `# Beispiel für eine technische Maßnahme: Passwortrichtlinie prüfen (Linux, PAM)
# /etc/security/pwquality.conf
minlen = 12        # mindestens 12 Zeichen
dcredit = -1       # mindestens eine Ziffer
ucredit = -1       # mindestens ein Großbuchstabe
retry = 3

# Zugriffskontrolle: Nur die Gruppe "personal" darf Personalakten lesen
chown -R root:personal /srv/personalakten
chmod -R 750 /srv/personalakten`,
  codeLanguage: 'Bash',
  exercises: [
    {
      id: 'tom-zuordnen',
      title: 'Maßnahmen den Kontrollen zuordnen',
      prompt: 'Ordne jede Maßnahme einer Kontrolle zu (Zutritt, Zugang, Zugriff, Weitergabe, Eingabe, Verfügbarkeit, Trennung):\n\n1. Serverraum mit Chipkartenleser\n2. Zwei-Faktor-Anmeldung am VPN\n3. Lohnbuchhaltung sieht nur die Gehaltsdaten, nicht die Kundendaten\n4. Tägliche Sicherung auf ein Band im Bankschließfach\n5. Änderungen an Kundenadressen werden mit Benutzer und Zeitstempel protokolliert\n6. Testsystem arbeitet nur mit anonymisierten Daten\n7. Lohnabrechnungen werden per verschlüsselter E-Mail an den Steuerberater geschickt',
      solution: '1. Zutritt\n2. Zugang\n3. Zugriff\n4. Verfügbarkeit\n5. Eingabe\n6. Trennung\n7. Weitergabe'
    },
    {
      id: 'schutzbedarf',
      title: 'Schutzbedarf eines Servers bestimmen',
      prompt: 'Auf einem Virtualisierungshost laufen drei Anwendungen. Bestimme den Schutzbedarf des Hosts für alle drei Grundwerte und begründe.\n\n| Anwendung | Vertraulichkeit | Integrität | Verfügbarkeit |\n| :--- | :--- | :--- | :--- |\n| Intranet | normal | normal | normal |\n| Personalverwaltung | sehr hoch | hoch | normal |\n| Webshop | hoch | hoch | hoch |',
      hints: ['Maximumprinzip je Grundwert anwenden.', 'Prüfe zusätzlich, ob ein Kumulationseffekt in Frage kommt.'],
      solution: 'Nach dem **Maximumprinzip**: Vertraulichkeit **sehr hoch** (Personalverwaltung), Integrität **hoch**, Verfügbarkeit **hoch** (Webshop).\n\nZusätzlich prüfen: Fallen alle drei Anwendungen mit dem Host gleichzeitig aus, kann die Verfügbarkeit durch den **Kumulationseffekt** sogar auf „sehr hoch“ steigen. Das ist zu begründen und zu dokumentieren.'
    },
    {
      id: 'datenpanne',
      title: 'Datenpanne richtig behandeln',
      prompt: 'Am Freitag um 16 Uhr stellt ein Mitarbeiter fest, dass ein unverschlüsselter Laptop mit 2.000 Kundendatensätzen (Name, Adresse, Bankverbindung) im Zug gestohlen wurde. Was muss das Unternehmen bis wann tun?',
      solution: '1. **Meldung an die Aufsichtsbehörde** innerhalb von **72 Stunden** nach Bekanntwerden (Art. 33), also bis spätestens Montag 16 Uhr – auch am Wochenende läuft die Frist.\n2. Weil Bankverbindungen betroffen sind und der Laptop unverschlüsselt war, besteht voraussichtlich ein **hohes Risiko** → **Benachrichtigung der betroffenen Kunden** (Art. 34).\n3. Den Vorfall dokumentieren (Art. 33 Abs. 5), Passwörter und Zugänge des Geräts sperren.\n4. Maßnahme für die Zukunft: Festplattenverschlüsselung (z. B. BitLocker) als TOM vorschreiben – wäre der Laptop verschlüsselt gewesen, entfiele die Benachrichtigungspflicht nach Art. 34 Abs. 3 meist.'
    },
    {
      id: 'rechtsgrundlage',
      title: 'Rechtsgrundlagen bestimmen',
      prompt: 'Nenne für jede Verarbeitung die passende Rechtsgrundlage nach Art. 6 Abs. 1 DSGVO: (1) Speicherung der Lieferadresse im Onlineshop, (2) Aufbewahrung der Rechnungen für 8 Jahre, (3) Versand eines Newsletters, (4) Protokollierung von IP-Adressen zur Abwehr von Angriffen.',
      solution: '1. **lit. b** – Vertragserfüllung\n2. **lit. c** – rechtliche Verpflichtung (Abgabenordnung/HGB)\n3. **lit. a** – Einwilligung\n4. **lit. f** – berechtigtes Interesse (IT-Sicherheit), mit begrenzter Speicherdauer'
    }
  ],
  quiz: [
    {
      question: 'Was schützt der Datenschutz in erster Linie?',
      options: ['Server vor Ausfall', 'Personen und ihre personenbezogenen Daten', 'Firmengeheimnisse', 'Backups vor Ransomware'],
      correct: 1,
      explanation: 'Datenschutz schützt das Persönlichkeitsrecht von Menschen. Datensicherheit schützt alle Daten.'
    },
    {
      question: 'Innerhalb welcher Frist muss eine meldepflichtige Datenpanne der Aufsichtsbehörde gemeldet werden?',
      options: ['24 Stunden', '72 Stunden', '7 Tage', '1 Monat'],
      correct: 1,
      explanation: 'Art. 33 DSGVO: unverzüglich und möglichst binnen 72 Stunden, nachdem die Verletzung bekannt wurde.'
    },
    {
      question: 'Welcher Grundsatz verlangt, nur so viele Daten zu erheben wie für den Zweck nötig?',
      options: ['Zweckbindung', 'Datenminimierung', 'Speicherbegrenzung', 'Transparenz'],
      correct: 1,
      explanation: 'Datenminimierung (Art. 5 Abs. 1 lit. c). Speicherbegrenzung betrifft die Dauer, Zweckbindung den Zweck.'
    },
    {
      question: 'Eine Passwortrichtlinie und Zwei-Faktor-Authentifizierung gehören zu welcher Kontrolle?',
      options: ['Zutrittskontrolle', 'Zugangskontrolle', 'Zugriffskontrolle', 'Eingabekontrolle'],
      correct: 1,
      explanation: 'Zugangskontrolle verhindert, dass Unbefugte das System benutzen. Zugriffskontrolle regelt die Rechte auf die Daten.'
    },
    {
      question: 'Ein Server betreibt Anwendungen mit Schutzbedarf „normal“, „hoch“ und „sehr hoch“ (Vertraulichkeit). Welchen Schutzbedarf hat der Server nach dem Maximumprinzip?',
      options: ['normal', 'hoch', 'sehr hoch', 'Durchschnitt der drei'],
      correct: 2,
      explanation: 'Beim Maximumprinzip erbt das System den höchsten Schutzbedarf.'
    },
    {
      question: 'Welcher BSI-Standard beschreibt das Notfallmanagement (Business Continuity)?',
      options: ['200-1', '200-2', '200-3', '200-4'],
      correct: 3,
      explanation: '200-1: ISMS, 200-2: Grundschutz-Methodik, 200-3: Risikoanalyse, 200-4: Business Continuity Management.'
    },
    {
      question: 'Wann fallen Daten nicht mehr unter die DSGVO?',
      options: [
        'Wenn sie pseudonymisiert sind',
        'Wenn sie verschlüsselt sind',
        'Wenn sie anonymisiert sind und keiner Person mehr zugeordnet werden können',
        'Wenn sie älter als 10 Jahre sind'
      ],
      correct: 2,
      explanation: 'Pseudonymisierte und verschlüsselte Daten bleiben personenbezogen. Nur echt anonyme Daten sind ausgenommen.'
    }
  ],
  relatedLabs: [
    { id: 'ihk_tom_catalog_lab', label: 'TOM-Katalog' },
    { id: 'bsi_grundschutz_lab', label: 'BSI IT-Grundschutz' },
    { id: 'ihk_dpia_lab', label: 'Datenschutz-Folgenabschätzung' },
    { id: 'ihk_risk_analysis_lab', label: 'Risikoanalyse' }
  ],
  sources: [
    { title: 'Verordnung (EU) 2016/679 (DSGVO) – Amtsblatt der EU', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
    { title: 'DSGVO-Gesetz.de: Art. 5, 6, 15–21, 32, 33', url: 'https://dsgvo-gesetz.de/' },
    { title: 'Bundesdatenschutzgesetz (BDSG) § 38 – Datenschutzbeauftragte nichtöffentlicher Stellen', url: 'https://www.gesetze-im-internet.de/bdsg_2018/__38.html' },
    { title: 'BSI: IT-Grundschutz-Kompendium', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz-Kompendium/it-grundschutz-kompendium_node.html' },
    { title: 'BSI: BSI-Standards 200-1 bis 200-4', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/BSI-Standards/bsi-standards_node.html' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: DSGVO, TOM/BDSG, BSI-Grundschutz', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
