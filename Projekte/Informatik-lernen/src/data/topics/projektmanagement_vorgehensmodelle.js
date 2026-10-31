/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Merkmale eines Projekts, das magische Dreieck und die Projektphasen erklären',
    'Lastenheft und Pflichtenheft unterscheiden und SMART-Ziele formulieren',
    'Einen Netzplan vorwärts und rückwärts rechnen, Puffer und kritischen Pfad bestimmen',
    'Wasserfall, V-Modell, Scrum und Kanban vergleichen und eine einfache Risikoanalyse erstellen'
  ],
  content: `
## Was ist ein Projekt?

Nach DIN 69901 ist ein Projekt ein Vorhaben, das im Wesentlichen durch die **Einmaligkeit** der Bedingungen gekennzeichnet ist. Typische Merkmale:

- klares **Ziel** und definierter Umfang
- **zeitlich begrenzt** (Start- und Endtermin)
- begrenzte **Ressourcen** (Budget, Personal, Sachmittel)
- **neuartig** und **komplex**, mit Risiken verbunden
- eigene **Projektorganisation**, oft fachübergreifend

Eine regelmäßige Lohnabrechnung ist deshalb kein Projekt, die Einführung einer neuen Lohnsoftware schon.

### Das magische Dreieck

Die drei Zielgrößen **Leistung/Qualität**, **Zeit** und **Kosten** hängen voneinander ab. Will der Kunde mehr Funktionen (Leistung), steigen Kosten oder Dauer – soll es schneller gehen, braucht es mehr Personal oder weniger Umfang. Projektmanagement heißt, dieses Gleichgewicht bewusst zu steuern.

### Phasen nach DIN 69901

1. **Initialisierung**: Idee, Projektauftrag, grobe Wirtschaftlichkeit
2. **Definition**: Ziele, Anforderungen (Lastenheft), Stakeholder, Machbarkeit
3. **Planung**: Projektstrukturplan, Termine, Ressourcen, Kosten, Risiken
4. **Steuerung**: Durchführung, Soll-Ist-Vergleich, Änderungsmanagement
5. **Abschluss**: Abnahme, Dokumentation, Lessons Learned, Projektauflösung

## Anforderungen festhalten

| | Lastenheft | Pflichtenheft |
| :--- | :--- | :--- |
| erstellt von | **Auftraggeber** | **Auftragnehmer** |
| beschreibt | **Was** und **wofür** – Anforderungen aus Sicht des Kunden | **Wie** und **womit** – die geplante Umsetzung |
| Beispiel | „Mitarbeiter sollen Urlaub online beantragen können.“ | „Webanwendung mit React-Frontend, REST-API und PostgreSQL; Freigabe durch den Vorgesetzten per E-Mail-Link.“ |

Das Pflichtenheft wird vom Auftraggeber freigegeben und ist dann Grundlage für die **Abnahme**.

### SMART-Ziele

Ein Ziel sollte **S**pezifisch, **M**essbar, **A**kzeptiert (oder attraktiv/erreichbar), **R**ealistisch und **T**erminiert sein.

- Schlecht: „Die Website soll schneller werden.“
- SMART: „Bis zum 31.03.2027 lädt die Startseite auf einem Mittelklasse-Smartphone über 4G in unter 2 Sekunden (gemessen mit Lighthouse, Median aus 5 Läufen).“

### Stakeholder

**Stakeholder** sind alle, die vom Projekt betroffen sind oder es beeinflussen: Auftraggeber, Nutzer, Geschäftsführung, Betriebsrat, IT-Betrieb, Datenschutzbeauftragter, Lieferanten. In einer **Stakeholderanalyse** bewertet man Einfluss und Einstellung und plant, wie man sie einbindet.

## Planen: PSP, Netzplan, Gantt

Der **Projektstrukturplan (PSP)** zerlegt das Projekt hierarchisch in Teilaufgaben bis zu **Arbeitspaketen** – abgeschlossenen Aufgaben mit Verantwortlichem, Aufwand und Ergebnis. Er kann objekt- (nach Bauteilen), funktions- (nach Tätigkeiten) oder phasenorientiert gegliedert sein.

### Netzplan (Vorgangsknotennetz)

Der Netzplan zeigt die **Abhängigkeiten** zwischen Vorgängen und berechnet Termine und Puffer.

| Nr. | Vorgang | Dauer (Tage) | Vorgänger |
| :---: | :--- | :---: | :--- |
| A | Anforderungsanalyse | 3 | – |
| B | Entwurf | 4 | A |
| C | Hardware beschaffen | 6 | A |
| D | Implementierung | 5 | B |
| E | Installation | 2 | C |
| F | Test und Abnahme | 3 | D, E |

![Netzplan mit Vorwärts- und Rückwärtsrechnung](netzplan.svg "Die rot markierten Vorgänge bilden den kritischen Pfad")

**Vorwärtsrechnung** (frühestmögliche Zeiten): FAZ = größter FEZ aller Vorgänger, FEZ = FAZ + Dauer. Bei F treffen D (FEZ 12) und E (FEZ 11) zusammen – es zählt das **Maximum**, also 12.

**Rückwärtsrechnung** (spätestmögliche Zeiten): SEZ = kleinster SAZ aller Nachfolger, SAZ = SEZ − Dauer. Bei A treffen B (SAZ 3) und C (SAZ 4) zusammen – es zählt das **Minimum**, also 3.

**Puffer**:

- **Gesamtpuffer GP = SAZ − FAZ** (= SEZ − FEZ): So viel darf sich ein Vorgang verzögern, ohne das **Projektende** zu gefährden.
- **Freier Puffer FP = kleinster FAZ der Nachfolger − eigener FEZ**: So viel darf er sich verzögern, ohne den **nächsten Vorgang** zu verschieben.

Vorgang C hat GP = 1, aber FP = 0: Jede Verzögerung von C verschiebt E – das Projektende aber erst ab dem zweiten Tag.

> [!exam] Kritischer Pfad
> Alle Vorgänge mit **Gesamtpuffer 0** bilden den **kritischen Pfad** (hier A → B → D → F). Verzögert sich einer davon, verschiebt sich das Projektende. Will man das Projekt verkürzen, muss man an diesen Vorgängen ansetzen.

### Gantt-Diagramm

Ein **Gantt-** oder **Balkendiagramm** zeigt die Vorgänge als Balken auf einer Zeitachse. Es ist anschaulicher als der Netzplan, zeigt Abhängigkeiten aber weniger deutlich. **Meilensteine** (Ereignisse ohne Dauer, z. B. „Pflichtenheft freigegeben“) werden als Raute dargestellt.

## Vorgehensmodelle

| Modell | Ablauf | Stärken | Schwächen |
| :--- | :--- | :--- | :--- |
| **Wasserfall** | Phasen streng nacheinander (Analyse → Entwurf → Umsetzung → Test → Betrieb) | einfach planbar, klare Dokumente | späte Tests, Änderungen teuer |
| **V-Modell** | wie Wasserfall, aber jeder Entwicklungsphase steht eine **Teststufe** gegenüber | Qualitätssicherung von Anfang an mitgeplant | wenig flexibel, hoher Dokumentationsaufwand |
| **Spiralmodell** | wiederholte Zyklen mit Risikoanalyse | gut bei hohen Risiken | aufwendig |
| **Scrum** | kurze Sprints mit lauffähigem Ergebnis | flexibel, früher Nutzen, Kundenfeedback | Festpreis/-termin schwer, braucht Disziplin |
| **Kanban** | kontinuierlicher Fluss, begrenzte parallele Arbeit (WIP-Limits) | einfach einzuführen, gut für Support | weniger Planbarkeit |

Im V-Modell stehen sich gegenüber: Anforderungsdefinition ↔ Abnahmetest, Systementwurf ↔ Systemtest, Komponentenentwurf ↔ Integrationstest, Modulentwurf ↔ Komponententest. Für Projekte des Bundes gibt es das **V-Modell XT**.

### Scrum (Scrum Guide 2020)

**Werte des agilen Manifests**: Individuen und Interaktionen vor Prozessen und Werkzeugen, funktionierende Software vor umfassender Dokumentation, Zusammenarbeit mit dem Kunden vor Vertragsverhandlung, Reagieren auf Veränderung vor Befolgen eines Plans.

- **Verantwortlichkeiten**: **Product Owner** (maximiert den Wert, pflegt und priorisiert das Product Backlog), **Scrum Master** (sorgt dafür, dass Scrum verstanden und gelebt wird, beseitigt Hindernisse), **Developers** (erstellen das Inkrement, organisieren sich selbst).
- **Ereignisse**: **Sprint** (max. 1 Monat, meist 2 Wochen), **Sprint Planning**, **Daily Scrum** (15 Minuten), **Sprint Review** (Ergebnis mit Stakeholdern ansehen), **Sprint Retrospective** (Zusammenarbeit verbessern).
- **Artefakte**: **Product Backlog** (mit Product Goal), **Sprint Backlog** (mit Sprint Goal), **Increment** (erfüllt die **Definition of Done**).

Anforderungen werden oft als **User Stories** formuliert: „Als *Rolle* möchte ich *Funktion*, damit *Nutzen*.“ Aufwände schätzt das Team relativ in Story Points (z. B. per Planning Poker). Ein **Burndown-Chart** zeigt den verbleibenden Aufwand im Sprint.

## Risiken managen

**Risiko = Eintrittswahrscheinlichkeit × Schadenshöhe** (Tragweite). Für jedes erkannte Risiko plant man eine Strategie: **vermeiden**, **vermindern**, **übertragen** (z. B. Versicherung, Vertrag) oder **bewusst akzeptieren**.

| Risiko | Wahrscheinlichkeit | Schaden | Risikowert | Maßnahme |
| :--- | :---: | ---: | ---: | :--- |
| Lieferverzug der Server | 30 % | 8.000 € | 2.400 € | frühzeitig bestellen, Zweitlieferant |
| Schlüsselentwickler fällt aus | 10 % | 15.000 € | 1.500 € | Wissen dokumentieren, Pair Programming |
| Anforderungen ändern sich | 50 % | 4.000 € | 2.000 € | agiles Vorgehen, Änderungsprozess |

> [!info] Das IHK-Abschlussprojekt
> In der Abschlussprüfung Teil 2 planen und dokumentieren Fachinformatiker ein betriebliches Projekt – Anwendungsentwickler mit höchstens **80 Stunden**, Systemintegratoren mit höchstens **40 Stunden**. Projektantrag, Zeitplanung nach Phasen, Wirtschaftlichkeitsbetrachtung, Soll-Ist-Vergleich und Fazit gehören in jede Dokumentation.
`,
  codeSnippet: `// Netzplan vorwärts und rückwärts rechnen
const vorgaenge = {
  A: { dauer: 3, vor: [] }, B: { dauer: 4, vor: ['A'] }, C: { dauer: 6, vor: ['A'] },
  D: { dauer: 5, vor: ['B'] }, E: { dauer: 2, vor: ['C'] }, F: { dauer: 3, vor: ['D', 'E'] }
};
const ids = Object.keys(vorgaenge); // bereits in Abhängigkeitsreihenfolge

for (const id of ids) {                      // Vorwärtsrechnung
  const v = vorgaenge[id];
  v.faz = Math.max(0, ...v.vor.map((p) => vorgaenge[p].fez));
  v.fez = v.faz + v.dauer;
}
const ende = Math.max(...ids.map((id) => vorgaenge[id].fez));
for (const id of [...ids].reverse()) {       // Rückwärtsrechnung
  const v = vorgaenge[id];
  const nach = ids.filter((n) => vorgaenge[n].vor.includes(id));
  v.sez = nach.length ? Math.min(...nach.map((n) => vorgaenge[n].saz)) : ende;
  v.saz = v.sez - v.dauer;
  v.gp = v.saz - v.faz;
}
console.log(ids.filter((id) => vorgaenge[id].gp === 0).join(' → '), ende); // A → B → D → F 15`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'netzplan-rechnen',
      title: 'Netzplan berechnen',
      prompt: 'Berechne FAZ, FEZ, SAZ, SEZ und Gesamtpuffer und bestimme den kritischen Pfad und die Projektdauer:\n\n| Vorgang | Dauer | Vorgänger |\n| :---: | :---: | :--- |\n| A | 2 | – |\n| B | 5 | A |\n| C | 3 | A |\n| D | 4 | C |\n| E | 2 | B, D |',
      hints: ['Bei E treffen B und D zusammen: FAZ von E ist der größere FEZ.'],
      solution: '| Vorgang | FAZ | FEZ | SAZ | SEZ | GP |\n| :---: | ---: | ---: | ---: | ---: | ---: |\n| A | 0 | 2 | 0 | 2 | 0 |\n| B | 2 | 7 | 4 | 9 | **2** |\n| C | 2 | 5 | 2 | 5 | 0 |\n| D | 5 | 9 | 5 | 9 | 0 |\n| E | 9 | 11 | 9 | 11 | 0 |\n\nKritischer Pfad: **A → C → D → E**, Projektdauer **11 Tage**. B hat 2 Tage Gesamtpuffer (und auch 2 Tage freien Puffer: FAZ E 9 − FEZ B 7).'
    },
    {
      id: 'lasten-pflichten',
      title: 'Lasten- oder Pflichtenheft?',
      prompt: 'Ordne jede Aussage dem Lastenheft oder dem Pflichtenheft zu:\n\n1. „Die Anwendung wird in C# mit ASP.NET Core umgesetzt.“\n2. „Das Lager soll Bestände in Echtzeit sehen können.“\n3. „Der Abgleich erfolgt alle 30 Sekunden über die REST-Schnittstelle des ERP-Systems.“\n4. „Bis zu 50 Mitarbeiter arbeiten gleichzeitig mit dem System.“',
      solution: '1. **Pflichtenheft** – technische Umsetzung (wie, womit)\n2. **Lastenheft** – Anforderung des Kunden (was)\n3. **Pflichtenheft** – Umsetzung\n4. **Lastenheft** – Anforderung (nicht-funktional); das Pflichtenheft beschreibt dann, wie die Last bewältigt wird'
    },
    {
      id: 'scrum-situationen',
      title: 'Scrum in der Praxis',
      prompt: 'Wer ist in Scrum zuständig bzw. welches Ereignis passt?\n\n1. Der Vertrieb möchte mitten im Sprint eine neue Funktion einschieben.\n2. Das Team stellt fest, dass Code-Reviews zu lange dauern, und will das ändern.\n3. Die Stakeholder sollen das Ergebnis des Sprints sehen und Feedback geben.\n4. Ein Entwickler kommt seit drei Tagen nicht weiter, weil ein Testserver fehlt.',
      solution: '1. Der **Product Owner** nimmt die Anforderung ins **Product Backlog** auf und priorisiert sie; das Sprint Goal wird mitten im Sprint nicht gefährdet.\n2. **Sprint Retrospective**.\n3. **Sprint Review**.\n4. Im **Daily Scrum** ansprechen; der **Scrum Master** hilft, das Hindernis zu beseitigen.'
    },
    {
      id: 'smart',
      title: 'SMART formulieren',
      prompt: 'Formuliere das Ziel „Wir wollen weniger Support-Tickets“ als SMART-Ziel und erkläre, welcher Teil welches Kriterium erfüllt.',
      solution: 'Beispiel: „**Bis zum 30.06.2027** (terminiert) sinkt die Zahl der **Tickets zum Thema Passwort-Reset** (spezifisch) **von durchschnittlich 120 auf höchstens 40 pro Monat** (messbar, realistisch durch Self-Service-Portal), **vereinbart mit der Support-Leitung** (akzeptiert).“'
    }
  ],
  quiz: [
    {
      question: 'Wer erstellt das Lastenheft?',
      options: ['Der Auftragnehmer', 'Der Auftraggeber', 'Der Scrum Master', 'Die IHK'],
      correct: 1,
      explanation: 'Das Lastenheft beschreibt die Anforderungen des Auftraggebers. Das Pflichtenheft erstellt der Auftragnehmer.'
    },
    {
      question: 'Was bedeutet ein Gesamtpuffer von 0?',
      options: ['Der Vorgang ist bereits erledigt', 'Der Vorgang liegt auf dem kritischen Pfad', 'Der Vorgang hat keine Vorgänger', 'Der Vorgang dauert 0 Tage'],
      correct: 1,
      explanation: 'Jede Verzögerung eines Vorgangs ohne Puffer verschiebt das Projektende.'
    },
    {
      question: 'Wie wird der FAZ eines Vorgangs mit mehreren Vorgängern bestimmt?',
      options: ['Minimum der FEZ der Vorgänger', 'Maximum der FEZ der Vorgänger', 'Summe der Dauern', 'Durchschnitt der FAZ'],
      correct: 1,
      explanation: 'Ein Vorgang kann erst beginnen, wenn alle Vorgänger fertig sind – also beim spätesten FEZ.'
    },
    {
      question: 'Welche drei Größen bilden das magische Dreieck?',
      options: ['Zeit, Kosten, Leistung/Qualität', 'Zeit, Personal, Risiko', 'Budget, Gewinn, Umsatz', 'Planung, Steuerung, Abschluss'],
      correct: 0,
      explanation: 'Leistung, Zeit und Kosten beeinflussen sich gegenseitig.'
    },
    {
      question: 'Was ist im V-Modell besonders?',
      options: [
        'Es hat keine Testphase',
        'Jeder Entwicklungsphase ist eine passende Teststufe gegenübergestellt',
        'Es arbeitet in zweiwöchigen Sprints',
        'Es wird nur bei Hardwareprojekten eingesetzt'
      ],
      correct: 1,
      explanation: 'Linker Ast: Spezifikation und Entwurf, rechter Ast: die zugehörigen Tests.'
    },
    {
      question: 'Wer ist in Scrum für die Priorisierung des Product Backlogs verantwortlich?',
      options: ['Scrum Master', 'Developers', 'Product Owner', 'Geschäftsführung'],
      correct: 2,
      explanation: 'Der Product Owner verantwortet das Product Backlog und maximiert den Wert des Produkts.'
    },
    {
      question: 'Wie berechnet man den Risikowert?',
      options: ['Schaden + Wahrscheinlichkeit', 'Eintrittswahrscheinlichkeit × Schadenshöhe', 'Schaden ÷ Projektdauer', 'Anzahl der Risiken × Budget'],
      correct: 1,
      explanation: 'Der Erwartungswert des Schadens hilft, Risiken zu vergleichen und zu priorisieren.'
    }
  ],
  relatedLabs: [
    { id: 'cpm_network_lab', label: 'Netzplan-Rechner (CPM)' },
    { id: 'ihk_project_gantt_lab', label: 'Gantt-Diagramm' },
    { id: 'scrum_simulator', label: 'Scrum-Simulator' },
    { id: 'ihk_risk_analysis_lab', label: 'Risikoanalyse' },
    { id: 'ihk_project_proposal_lab', label: 'Projektantrag' }
  ],
  sources: [
    { title: 'Ken Schwaber, Jeff Sutherland: The Scrum Guide (2020, deutsch)', url: 'https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-German.pdf' },
    { title: 'Manifest für Agile Softwareentwicklung', url: 'https://agilemanifesto.org/iso/de/manifesto.html' },
    { title: 'DIN 69901-1 bis -5: Projektmanagement – Projektmanagementsysteme (Beuth/DIN Media)', url: 'https://www.dinmedia.de/de/norm/din-69901-1/113428320' },
    { title: 'Der Beauftragte der Bundesregierung für Informationstechnik: V-Modell XT', url: 'https://www.cio.bund.de/Webs/CIO/DE/digitale-loesungen/it-konsolidierung/v-modell-xt/v-modell-xt-node.html' },
    { title: 'Verordnung über die Berufsausbildung zum Fachinformatiker und zur Fachinformatikerin (FIAusbV) 2020', url: 'https://www.gesetze-im-internet.de/fiausbv/' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Projektmanagement', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
