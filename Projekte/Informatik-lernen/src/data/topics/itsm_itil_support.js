/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Incident, Problem, Change und Service Request unterscheiden und richtig zuordnen',
    'Tickets nach Auswirkung und Dringlichkeit priorisieren und Eskalationswege nutzen',
    'SLA, OLA und Underpinning Contract sowie Kennzahlen wie MTTR, MTBF und Verfügbarkeit berechnen',
    'Support strukturiert und kundenorientiert durchführen und Wissen dokumentieren'
  ],
  content: `
## Warum IT-Service-Management?

IT-Abteilungen liefern **Services** (Dienste), keine einzelnen Geräte: E-Mail, Arbeitsplatz, ERP, Netzwerkzugang. **IT-Service-Management (ITSM)** organisiert, wie diese Services geplant, bereitgestellt, betrieben und verbessert werden. Das bekannteste Rahmenwerk ist **ITIL**, die Norm dazu ist **ISO/IEC 20000**.

ITIL 4 beschreibt ein **Service Value System**. Dessen Wertschöpfungskette hat sechs Aktivitäten: **Planen**, **Verbessern**, **Einbinden** (Engage), **Gestalten und Überführen** (Design & Transition), **Beschaffen/Bauen** (Obtain/Build) und **Liefern und Unterstützen** (Deliver & Support).

Die sieben **Leitprinzipien** von ITIL 4 sind: auf den Wert ausrichten, dort beginnen, wo man steht, iterativ mit Feedback voranschreiten, zusammenarbeiten und Transparenz fördern, ganzheitlich denken und arbeiten, einfach und praktikabel halten, optimieren und automatisieren.

## Die zentralen Prozesse und Begriffe

| Begriff | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| **Incident** | ungeplante Störung oder Qualitätsminderung eines Services | Mailserver nicht erreichbar |
| **Service Request** | Anfrage nach etwas Standardisiertem | neuer Benutzer, Softwareinstallation |
| **Problem** | Ursache eines oder mehrerer Incidents | defekter Treiber, der Abstürze verursacht |
| **Known Error** | Problem mit bekannter Ursache und Workaround | Fehler mit dokumentierter Umgehung |
| **Change** | Hinzufügen, Ändern oder Entfernen von etwas mit Auswirkung auf Services | Firmware-Update der Firewall |

![Zusammenspiel von Incident, Workaround, Problem und Change](incident-problem-change.svg "Incident stellt den Dienst wieder her, Problem sucht die Ursache, Change führt die dauerhafte Lösung ein")

**Wichtig**: Das Ziel des **Incident Managements** ist die **schnelle Wiederherstellung** des Betriebs, auch mit einem **Workaround**. Das **Problem Management** sucht die **Ursache** und verhindert Wiederholungen. Eine Lösung, die das System verändert, läuft als **Change**.

## Incident Management

### Ablauf

1. **Erfassen**: Ticket mit allen relevanten Angaben (Wer? Was? Seit wann? Fehlermeldung? Auswirkung?).
2. **Kategorisieren und priorisieren**.
3. **Erstdiagnose und Lösung** durch den Service Desk (1st Level).
4. Bei Bedarf **Eskalation** (2nd/3rd Level, Hersteller).
5. **Lösen, Rückmeldung einholen, Ticket schließen** und Wissen dokumentieren.

### Priorität: Auswirkung und Dringlichkeit

Die **Priorität** ergibt sich aus der **Auswirkung** (Impact, wie viele Nutzer oder wie kritisch) und der **Dringlichkeit** (Urgency, wie schnell ist eine Lösung nötig).

| Auswirkung \\ Dringlichkeit | Hoch | Mittel | Niedrig |
| :--- | :---: | :---: | :---: |
| **Hoch** | P1 kritisch | P2 hoch | P3 mittel |
| **Mittel** | P2 hoch | P3 mittel | P4 niedrig |
| **Niedrig** | P3 mittel | P4 niedrig | P4 niedrig |

Die Priorität bestimmt Reaktions- und Lösungszeiten laut Servicevereinbarung. Ein einzelner Nutzer ohne Frist (niedrig/niedrig) wartet länger als ein Ausfall des Kassensystems (hoch/hoch).

### Support-Ebenen und Eskalation

- **1st Level (Service Desk)**: Annahme, Standardlösungen, Wissensdatenbank.
- **2nd Level**: Fachgruppen (Netzwerk, Server, Anwendungen), tiefere Analyse.
- **3rd Level**: Spezialisten, Entwickler, Hersteller.
- **Funktionale Eskalation** gibt an eine fachlich zuständige Gruppe weiter, **hierarchische Eskalation** informiert Vorgesetzte, wenn Fristen oder Prioritäten gefährdet sind.

## Problem Management

Das Problem Management geht Ursachen auf den Grund. Typische Werkzeuge:

- **5-Why-Methode**: Mehrfach "Warum?" fragen, bis die Ursache klar ist.
- **Ishikawa-Diagramm** (Ursache-Wirkung): Ursachen nach Kategorien wie Mensch, Methode, Maschine, Material, Umwelt ordnen.

Ist die Ursache bekannt, aber noch nicht behoben, wird ein **Known Error** mit **Workaround** in der **Wissensdatenbank** dokumentiert. So lösen künftige Incidents schneller.

## Change Enablement

Änderungen können Störungen auslösen. Deshalb werden sie geplant, bewertet und genehmigt:

| Typ | Beschreibung | Genehmigung |
| :--- | :--- | :--- |
| **Standard-Change** | wiederkehrend, risikoarm, vorab freigegeben | keine Einzelfreigabe |
| **Normaler Change** | Antrag (RFC) mit Risikobewertung und Plan | Change-Gremium (CAB) bzw. Genehmigungsstelle |
| **Notfall-Change** | dringend, um einen schweren Incident zu beheben | beschleunigte Freigabe, nachträgliche Prüfung |

Ein guter Change-Antrag enthält **Beschreibung, Grund, Risiko, Zeitplan, Test, Rückfallplan (Rollback)** und Verantwortliche. Änderungen werden außerhalb der Hauptnutzungszeit im **Wartungsfenster** durchgeführt.

## Konfigurationsmanagement

Eine **CMDB** (Configuration Management Database) speichert **Configuration Items (CI)**, zum Beispiel Server, Anwendungen, Switches, und ihre **Beziehungen**. Sie zeigt die Auswirkung einer Störung oder eines Changes: Welche Services hängen an diesem Switch?

## Servicevereinbarungen

| Vereinbarung | Partner | Inhalt |
| :--- | :--- | :--- |
| **SLA** (Service Level Agreement) | IT und Kunde | Leistungsumfang, Verfügbarkeit, Reaktions- und Lösungszeiten |
| **OLA** (Operational Level Agreement) | IT-intern | Zusammenarbeit zwischen Teams |
| **UC** (Underpinning Contract) | IT und externer Lieferant | Zusagen des Lieferanten, die das SLA stützen |

> [!example] Beispiel Verfügbarkeit im SLA
> Zugesagt sind 99,5 % pro Monat (30 Tage = 720 Stunden). Erlaubte Ausfallzeit: 0,5 % von 720 h = **3,6 Stunden**.

## Kennzahlen

- **MTTR** (Mean Time To Repair/Restore): mittlere Wiederherstellungszeit.
- **MTBF** (Mean Time Between Failures): mittlere Zeit zwischen Ausfällen.
- **Verfügbarkeit = MTBF : (MTBF + MTTR)**.
- Weitere Kennzahlen: Anteil der im Erstkontakt gelösten Tickets (**First-Level-Fix-Rate**), **Erfüllungsgrad der SLA-Zeiten**, **Kundenzufriedenheit** (zum Beispiel per Umfrage nach Ticketschluss).

> [!example] Beispiel
> MTBF = 720 h, MTTR = 2 h: Verfügbarkeit = 720 : 722 = 0,99723, also **99,72 %**.

## Gute Ticketbearbeitung und Kommunikation

- **Ticketbeschreibung**: sachlich und vollständig (Wer, Was, Wann, Fehlermeldung, Auswirkung, bisherige Schritte). Screenshots helfen.
- **Rückfragen** verständlich und ohne Fachjargon stellen, Erwartungen und nächste Schritte nennen.
- **Datenschutz**: Beim Fernzugriff auf Geräte die Zustimmung einholen und nur das für die Lösung Nötige einsehen.
- **Wissen dokumentieren**: Lösung kurz festhalten, damit der nächste Fall schneller geht.

## Service Desk und Supportorganisation

Der **Service Desk** ist die zentrale Anlaufstelle (*Single Point of Contact*, SPOC) zwischen Nutzern und IT. Er nimmt Meldungen auf, löst, was er kann, und koordiniert den Rest. Üblich sind verschiedene Organisationsformen:

| Modell | Beschreibung | Vorteile | Nachteile |
| :--- | :--- | :--- | :--- |
| Lokaler Service Desk | vor Ort beim Kunden | persönlicher Kontakt, Ortskenntnis | teuer, bei mehreren Standorten doppelt |
| Zentraler Service Desk | ein Standort für alle | einheitliche Qualität, Skaleneffekte | weniger Ortskenntnis |
| Virtueller Service Desk | verteilte Mitarbeiter, gemeinsames Ticketsystem | flexibel, Zugriff auf Know-how | erfordert gute Werkzeuge und Disziplin |
| Follow the Sun | Übergabe an Standorte in anderen Zeitzonen | 24 Stunden Erreichbarkeit ohne Nachtschicht | hoher Abstimmungsaufwand |

**Support-Stufen (Level):** Im **1st Level** werden Anfragen aufgenommen, kategorisiert und einfache Fälle gelöst (Passwort zurücksetzen, bekannte Fehler). Der **2nd Level** bearbeitet fachlich tiefere Störungen (Server, Netzwerk, Anwendung). Im **3rd Level** arbeiten Spezialisten, Entwickler oder Hersteller. Wird ein Ticket in eine höhere Stufe übergeben, spricht man von **funktionaler Eskalation**. Die **hierarchische Eskalation** informiert dagegen Vorgesetzte, etwa wenn eine Frist der Vereinbarung droht verletzt zu werden. Beide Eskalationswege sollten im Prozess mit Zeitgrenzen festgelegt sein.

## Service Request und Servicekatalog

Anfragen nach Standardleistungen (Neuer Benutzer, Softwareinstallation, Zugriff auf ein Laufwerk, Hardware-Ausgabe) sind keine Störungen. Sie laufen im **Request Fulfilment** nach vorab festgelegten Abläufen und mit Genehmigung durch die zuständige Stelle. Der **Servicekatalog** beschreibt die angebotenen Services mit Leistung, Preis, Bearbeitungszeit und Zuständigkeit. Das hat drei Vorteile: Nutzer wissen, was sie bekommen können, die Bearbeitung ist planbar, und Standardfälle lassen sich automatisieren (z. B. Onboarding-Paket für neue Mitarbeiter).

## Lebenszyklus eines Tickets

1. **Erfassen:** Meldung (Telefon, Mail, Portal, Chat, automatisch aus dem Monitoring), eindeutige Ticketnummer, Kontaktdaten.
2. **Kategorisieren und priorisieren:** Incident oder Request? Welcher Service ist betroffen? Priorität aus Auswirkung und Dringlichkeit.
3. **Erstdiagnose:** Wissensdatenbank durchsuchen, Standardlösung anwenden, Rückfragen stellen.
4. **Weiterleiten (Eskalation):** Bei Bedarf in den 2nd oder 3rd Level mit allen bisherigen Informationen übergeben.
5. **Lösen und wiederherstellen:** Lösung oder Workaround umsetzen und testen.
6. **Abschließen:** Nutzer bestätigt die Lösung, Dokumentation, Ursachencode, ggf. Problem-Ticket oder Change anstoßen. Typischerweise wird ein Ticket nicht sofort geschlossen, sondern nach einer Frist ohne Rückmeldung automatisch.

Reagieren Nutzer, dass das Problem wieder auftritt, wird das Ticket **wiedereröffnet**. Eine hohe Wiedereröffnungsrate ist ein Hinweis auf oberflächliche Lösungen.

## Wissensmanagement

Eine gepflegte **Wissensdatenbank** (Knowledge Base) spart Zeit und senkt die Zahl der Eskalationen. Gute Artikel sind kurz, nach Symptom formuliert (nicht nach interner Technik), mit Schritt-für-Schritt-Lösung, Gültigkeit (Version, Datum) und Verantwortlichem. Die Methode **KCS (Knowledge-Centered Service)** empfiehlt, Wissen direkt bei der Ticketbearbeitung festzuhalten, statt später in einem eigenen Projekt. Veraltete Artikel sind schädlich, darum gehören Überprüfung und Löschung zum Prozess. In der Datenbank der **Known Errors** steht zu jedem bekannten Fehler der Workaround.

## Servicezeiten, Verfügbarkeit und SLA-Rechnung

In einem SLA gilt Verfügbarkeit nur innerhalb der **vereinbarten Servicezeit**, und geplante Wartungsfenster zählen meist nicht als Ausfall. Dann gilt:

Verfügbarkeit = (vereinbarte Servicezeit - Ausfallzeit) / vereinbarte Servicezeit

**Beispiel:** Ein Service ist montags bis freitags von 7 bis 19 Uhr vereinbart (12 h * 5 Tage * 4 Wochen = 240 h pro Monat). Es gab einen ungeplanten Ausfall von 3 h. Verfügbarkeit = (240 - 3) / 240 = 98,75 %. Vereinbart waren 99 %, die Vorgabe ist also **nicht** erfüllt, denn erlaubt wären nur 2,4 h Ausfall. Je nach Vertrag fallen **Service Credits** (Gutschriften) oder Vertragsstrafen an.

**Reaktions- und Lösungszeit:** Das SLA nennt für jede Priorität Zeiten, z. B. Priorität 1 (kritisch): Reaktion in 15 Minuten, Wiederherstellung in 4 Stunden. Die Uhr läuft meist nur während der Servicezeit und wird angehalten, wenn man auf eine Antwort des Kunden wartet. Wichtige Begriffe: **SLA** (Vereinbarung mit dem Kunden), **OLA** (interne Vereinbarung zwischen Abteilungen), **UC** (Underpinning Contract, Vertrag mit externem Lieferanten). Das SLA darf nur zugesagt werden, wenn OLA und UC es tragen. Verspricht der Service Desk 4 Stunden, aber der Lieferant liefert Ersatzteile erst nach 8 Stunden, kann das SLA nicht gehalten werden.

## Weitere Kennzahlen und ihre Aussage

| Kennzahl | Berechnung | Aussage |
| :--- | :--- | :--- |
| First-Contact-Resolution (FCR) | im Erstkontakt gelöste Tickets / alle Tickets | Qualität des 1st Level |
| Mittlere Lösungsdauer | Summe der Bearbeitungszeiten / Anzahl | Effizienz, Trend |
| SLA-Erfüllungsgrad | Tickets innerhalb der Zeit / alle Tickets | Einhaltung der Zusagen |
| Wiedereröffnungsquote | wiedereröffnete / geschlossene Tickets | Nachhaltigkeit der Lösungen |
| Backlog | offene Tickets | Auslastung, Engpässe |
| Kundenzufriedenheit (CSAT) | Bewertung nach Ticketschluss | Wahrnehmung des Kunden |
| MTBSI | mittlere Zeit zwischen zwei Störungen = MTBF + MTTR (ITIL-v3-Begriff, in ITIL 4 nicht mehr enthalten) | Stabilität des Services |

Eine einzelne Zahl täuscht leicht: Wer nur die Lösungsdauer drückt, schließt Tickets zu früh. Deshalb werden Kennzahlen kombiniert betrachtet und mit Zielen versehen.

## Ereignisüberwachung und Monitoring

**Event Management** erkennt Zustandsänderungen von Services und Komponenten (Festplatte zu 90 % voll, Dienst gestoppt, Zertifikat läuft in 14 Tagen ab). Ereignisse werden gefiltert und nach Bedeutung geordnet: Information, Warnung, Ausnahme. Aus einer Ausnahme kann automatisch ein Incident entstehen. Gute Überwachung warnt **vor** dem Ausfall (proaktiv), denn jede vermiedene Störung spart Aufwand. Werkzeuge wie Nagios, Icinga, Zabbix oder Prometheus fragen Werte per SNMP, Agent oder Schnittstelle ab. Zu viele Alarme führen zu *Alarmmüdigkeit*, deshalb Schwellwerte sinnvoll wählen.

## Konfigurations- und Asset-Management vertieft

Die **CMDB** (Configuration Management Database) enthält **Konfigurationselemente** (*Configuration Items*, CI): Server, Switches, Software, Verträge, Services und die **Beziehungen** dazwischen. Daraus ergibt sich bei einem Ausfall oder Change sofort: Welche Services hängen an dieser Komponente? Das **Asset-Management** beschreibt den **Lebenszyklus** von Hardware und Software: Planung, Beschaffung, Inbetriebnahme, Betrieb, Wartung, Außerbetriebnahme und Entsorgung (inklusive sicherer Datenlöschung). Inventarnummer, Standort, Verantwortlicher, Garantieende und Lizenzstatus gehören in den Datensatz. Veraltete CMDB-Daten sind schlimmer als keine, deshalb wird der Bestand regelmäßig automatisch abgeglichen.

## Change und Release in der Praxis

- **Changetypen:** *Standard-Change* (vorab genehmigt, geringes Risiko, z. B. Passwort-Reset oder Installation freigegebener Software), *Normaler Change* (Bewertung und Genehmigung, größere Änderungen werden vom Change Advisory Board (CAB) beurteilt) und *Notfall-Change* (dringende Behebung einer schweren Störung, beschleunigte Genehmigung, Nachdokumentation).
- **Bestandteile eines Change-Antrags:** Beschreibung, Begründung, betroffene Services und CIs, Risiko, Test, Zeitplan, **Rückfallplan (Rollback)**, Kommunikation an Betroffene.
- **Release und Deployment:** Mehrere Changes werden zu einem *Release* gebündelt, getestet (Testumgebung, Pilotgruppe) und stufenweise ausgerollt. Nach dem Rollout prüft ein *Post-Implementation-Review*, ob das Ziel erreicht wurde.

> [!example] Beispiel: Firmware-Update der Core-Switches
> Risiko hoch (Netzausfall möglich), daher Normaler Change mit CAB. Wartungsfenster Samstag 22 bis 24 Uhr, Test in der Laborumgebung, Konfigurationsbackup als Rückfallplan, Information an alle Standorte, danach Überprüfung der Verbindungen und Dokumentation in der CMDB.

## Kommunikation am Service Desk

- **Aktiv zuhören**, Namen nennen, Problem in eigenen Worten wiederholen und bestätigen.
- **Geschlossene Fragen** („Funktioniert es mit dem Kabel?“) klären Fakten, **offene Fragen** („Was passiert genau, wenn Sie drucken?“) liefern Details.
- **Verständlich** formulieren, Fachbegriffe erklären, Erwartungen nennen: „Ich melde mich spätestens bis 15 Uhr.“
- **Ruhig bleiben** bei verärgerten Anrufern: Verständnis zeigen, nicht rechtfertigen, Lösungsweg und nächsten Schritt nennen.
- **Fernwartung:** Zustimmung einholen, auf sensible Inhalte auf dem Bildschirm achten, Sitzung dokumentieren und beenden.
- **Schriftlich:** Mails kurz, strukturiert und höflich, mit Ticketnummer im Betreff.

> [!exam] Prüfungshinweis
> Häufig verlangt: Ticket als Incident, Problem, Change oder Service Request klassifizieren, Priorität aus Auswirkung und Dringlichkeit bestimmen, Verfügbarkeit aus MTBF und MTTR berechnen und die Rolle von SLA, OLA und UC erklären.
`,
  exercises: [
    {
      id: 'ticket-klassifizieren',
      title: 'Tickets zuordnen',
      prompt: 'Ordne die Fälle der passenden Kategorie zu (Incident, Service Request, Problem, Change) und begründe kurz: a) Ein Mitarbeiter möchte Zugriff auf ein neues Laufwerk. b) Der Drucker im Vertrieb druckt nicht. c) Zum dritten Mal in zwei Wochen fällt die VPN-Verbindung aus, die Ursache ist unbekannt. d) Die Firmware aller Switches soll aktualisiert werden.',
      hints: ['Incident = Störung, Request = Standardanfrage', 'Problem = Ursache mehrerer Incidents'],
      solution: 'a) Service Request: standardisierte Anfrage. b) Incident: ungeplante Störung. c) Problem: wiederkehrende Incidents mit unbekannter Ursache, Ursachenanalyse nötig (die einzelnen Ausfälle bleiben Incidents). d) Change: geplante Änderung mit möglicher Auswirkung auf den Betrieb, mit Risikobewertung, Test und Rückfallplan.'
    },
    {
      id: 'prioritaet-bestimmen',
      title: 'Priorität bestimmen',
      prompt: 'Bestimme mit der Matrix die Priorität und begründe: a) Das Warenwirtschaftssystem ist für alle 80 Mitarbeiter ausgefallen, die Auslieferung steht still. b) Bei einer Mitarbeiterin funktioniert das Mikrofon im Headset nicht, es gibt eine Ersatzlösung. c) Das Kantinen-Infosystem ist langsam, niemand ist blockiert.',
      hints: ['Auswirkung = wie viele und wie kritisch, Dringlichkeit = wie schnell nötig'],
      solution: 'a) Auswirkung hoch, Dringlichkeit hoch: P1 (kritisch), sofortige Bearbeitung und Eskalation. b) Auswirkung niedrig, Dringlichkeit niedrig: P4, Bearbeitung in regulärer Zeit. c) Auswirkung niedrig bis mittel (alle betroffen, aber nicht kritisch), Dringlichkeit niedrig: P4 (oder P3), geplante Bearbeitung.'
    },
    {
      id: 'verfuegbarkeit-mtbf',
      title: 'Verfügbarkeit berechnen',
      prompt: 'Ein Server fällt im Mittel alle 1.000 Stunden aus (MTBF) und ist im Mittel 4 Stunden nicht verfügbar (MTTR). Berechne die Verfügbarkeit in Prozent. Der SLA verlangt 99,9 %. Wird er erfüllt? Welcher MTTR wäre bei gleicher MTBF höchstens erlaubt?',
      hints: ['A = MTBF : (MTBF + MTTR)', 'A = 0,999 nach MTTR auflösen'],
      solution: 'Verfügbarkeit: 1.000 : 1.004 = 0,99602, also 99,60 %. Der SLA von 99,9 % wird nicht erfüllt. Erlaubter MTTR: 1.000 : (1.000 + x) = 0,999, also 1.000 + x = 1.001,0 und x ≈ 1,0 Stunde. Die Wiederherstellung müsste im Mittel höchstens etwa 1 Stunde dauern (oder die MTBF deutlich steigen).'
    },
    {
      id: 'change-planen',
      title: 'Change-Antrag formulieren',
      prompt: 'Die Firewall soll im Wartungsfenster am Samstag auf eine neue Firmware aktualisiert werden. Welche Angaben gehören in den Change-Antrag, und wie würdest du das Risiko begrenzen?',
      hints: ['Rückfallplan nicht vergessen', 'Test und Kommunikation'],
      solution: 'Inhalt: Beschreibung und Grund (Sicherheitslücke), betroffene Services und CIs, Risikobewertung, Zeitplan im Wartungsfenster mit Dauer, Testplan, Rückfallplan (Konfigurationssicherung und alte Firmware bereithalten), Verantwortliche und Kontakte, Kommunikation an die Nutzer. Risikobegrenzung: vorher in einer Testumgebung prüfen, Konfiguration sichern, Hochverfügbarkeit nutzen (erst Standby-Firewall, dann aktive), nach der Änderung Funktionstest, im Fehlerfall Rollback.'
    }
  ],
  quiz: [
    {
      question: 'Was ist das Hauptziel des Incident Managements?',
      options: [
        'Die Ursache dauerhaft beseitigen',
        'Den normalen Servicebetrieb so schnell wie möglich wiederherstellen',
        'Änderungen genehmigen',
        'Verträge mit Lieferanten verhandeln'
      ],
      correct: 1,
      explanation: 'Incident Management stellt den Betrieb schnell wieder her, auch mit einem Workaround. Ursachen klärt das Problem Management.'
    },
    {
      question: 'Welche Priorität ergibt sich bei hoher Auswirkung und hoher Dringlichkeit?',
      options: ['P4 niedrig', 'P3 mittel', 'P2 hoch', 'P1 kritisch'],
      correct: 3,
      explanation: 'Hohe Auswirkung und hohe Dringlichkeit führen zur höchsten Priorität P1.'
    },
    {
      question: 'Was beschreibt ein Known Error?',
      options: [
        'Ein Problem mit bekannter Ursache und dokumentiertem Workaround',
        'Einen Fehler, der noch nicht gemeldet wurde',
        'Einen genehmigten Change',
        'Eine Störung ohne Auswirkung'
      ],
      correct: 0,
      explanation: 'Beim Known Error ist die Ursache bekannt, der Workaround steht in der Wissensdatenbank.'
    },
    {
      question: 'Welcher Change-Typ ist wiederkehrend, risikoarm und vorab freigegeben?',
      options: ['Normaler Change', 'Notfall-Change', 'Standard-Change', 'Projekt-Change'],
      correct: 2,
      explanation: 'Standard-Changes sind vorab genehmigt und brauchen keine Einzelfreigabe.'
    },
    {
      question: 'Wie lautet die Formel der Verfügbarkeit mit MTBF und MTTR?',
      options: ['MTBF : (MTBF + MTTR)', 'MTTR : MTBF', 'MTBF − MTTR', 'MTBF · MTTR'],
      correct: 0,
      explanation: 'Verfügbarkeit = MTBF : (MTBF + MTTR). Je kleiner MTTR, desto näher an 100 %.'
    },
    {
      question: 'Wie viel Ausfallzeit pro Monat (30 Tage) erlaubt ein SLA mit 99,5 % Verfügbarkeit?',
      options: ['0,36 Stunden', '3,6 Stunden', '36 Stunden', '7,2 Stunden'],
      correct: 1,
      explanation: '0,5 % von 720 Stunden sind 3,6 Stunden.'
    },
    {
      question: 'Was regelt ein OLA?',
      options: [
        'Die Zusammenarbeit zwischen internen Teams der IT',
        'Die Vertragsbeziehung zum Kunden',
        'Die Lizenzbedingungen von Software',
        'Die Zugriffsrechte im Active Directory'
      ],
      correct: 0,
      explanation: 'Ein Operational Level Agreement gilt intern zwischen Teams. Mit dem Kunden wird ein SLA vereinbart, mit externen Lieferanten ein Underpinning Contract.'
    }
  ],
  relatedLabs: [
    { id: 'itsm_simulator', label: 'ITSM-Simulator' },
    { id: 'bsi_grundschutz_lab', label: 'BSI IT-Grundschutz' }
  ],
  sources: [
    { title: 'Wikipedia: IT Infrastructure Library (ITIL)', url: 'https://de.wikipedia.org/wiki/IT_Infrastructure_Library' },
    { title: 'Wikipedia: IT-Service-Management', url: 'https://de.wikipedia.org/wiki/IT-Service-Management' },
    { title: 'Wikipedia: Verfügbarkeit', url: 'https://de.wikipedia.org/wiki/Verf%C3%BCgbarkeit', note: 'MTBF, MTTR und Berechnung' },
    { title: 'ISO/IEC 20000-1', note: 'Norm für Service-Management-Systeme, kostenpflichtig' },
    { title: 'ITIL 4 Foundation (PeopleCert/AXELOS)', note: 'Leitprinzipien und Service Value System, kostenpflichtiges Lehrwerk' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
