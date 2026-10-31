/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Klasse, Objekt, Attribut, Methode und Konstruktor erklären',
    'Die vier Grundprinzipien Abstraktion, Kapselung, Vererbung und Polymorphie anwenden',
    'Beziehungen im Klassendiagramm (Assoziation, Aggregation, Komposition, Vererbung, Realisierung) samt Multiplizitäten lesen und zeichnen',
    'Anwendungsfall-, Sequenz- und Aktivitätsdiagramme lesen und erstellen'
  ],
  content: `
## Klasse und Objekt

Eine **Klasse** ist ein Bauplan: Sie beschreibt, welche **Attribute** (Eigenschaften, Daten) und **Methoden** (Verhalten, Funktionen) ihre Objekte haben. Ein **Objekt** ist eine konkrete **Instanz** dieser Klasse mit eigenen Attributwerten.

- Klasse \`Kunde\` mit den Attributen \`name\` und \`kundenNr\` und der Methode \`bestellen()\`.
- Objekte: \`k1 = new Kunde("Meyer", 1001)\`, \`k2 = new Kunde("Schulz", 1002)\`.

Der **Konstruktor** ist eine besondere Methode, die beim Erzeugen eines Objekts aufgerufen wird und es initialisiert. **Statische** Attribute und Methoden (im Diagramm unterstrichen) gehören zur Klasse selbst, nicht zu einem einzelnen Objekt – z. B. ein Zähler aller angelegten Kunden.

## Die vier Grundprinzipien

| Prinzip | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| **Abstraktion** | nur die für den Zweck wichtigen Eigenschaften modellieren | Ein Kunde im Shop braucht keine Schuhgröße |
| **Kapselung** | Attribute verbergen (\`private\`), Zugriff nur über Methoden | \`setGehalt()\` prüft, dass das Gehalt nicht negativ ist |
| **Vererbung** | Unterklasse übernimmt Attribute und Methoden der Oberklasse und erweitert sie | \`Kunde\` und \`Mitarbeiter\` erben von \`Person\` („ist ein“) |
| **Polymorphie** | derselbe Methodenaufruf verhält sich je nach Objekt unterschiedlich | \`anrede()\` liefert für Kunden „Sehr geehrte/r …“, für Mitarbeiter „Hallo …“ |

### Sichtbarkeiten

| UML | Java/C# | sichtbar für |
| :---: | :--- | :--- |
| \`+\` | public | alle |
| \`-\` | private | nur die eigene Klasse |
| \`#\` | protected | eigene Klasse und Unterklassen |
| \`~\` | package (Java: ohne Schlüsselwort) / internal (C#) | Klassen im selben Paket bzw. derselben Assembly |

> [!tip] Faustregel zur Kapselung
> Attribute sind **private**, Methoden der öffentlichen Schnittstelle **public**. Getter und Setter nur anlegen, wenn sie wirklich gebraucht werden, und im Setter Werte prüfen.

### Überschreiben vs. Überladen

- **Überschreiben** (*Override*): Die Unterklasse definiert eine geerbte Methode mit **gleicher Signatur** neu. Welche Version läuft, entscheidet sich zur **Laufzeit** am tatsächlichen Objekt (dynamische Bindung) → Polymorphie.
- **Überladen** (*Overload*): Mehrere Methoden **gleichen Namens** mit **unterschiedlichen Parametern** in derselben Klasse, z. B. \`berechne(int)\` und \`berechne(double, double)\`. Der Compiler wählt beim Übersetzen.

### Abstrakte Klassen und Interfaces

- Eine **abstrakte Klasse** kann nicht instanziiert werden. Sie kann fertige und **abstrakte Methoden** (ohne Rumpf) enthalten, die Unterklassen implementieren müssen. Im Diagramm: Name *kursiv* oder \`{abstract}\`.
- Ein **Interface** beschreibt nur einen Vertrag („kann …“), z. B. \`Druckbar\` mit der Methode \`drucken()\`. Eine Klasse kann in Java und C# nur von **einer** Klasse erben, aber **beliebig viele** Interfaces implementieren.

## UML-Klassendiagramm

Die **Unified Modeling Language (UML)** ist die genormte Sprache zur Modellierung von Software (ISO/IEC 19505). Eine Klasse wird als Rechteck mit drei Bereichen gezeichnet: **Name**, **Attribute** (\`- name: String\`), **Methoden** (\`+ anrede(): String\`).

![UML-Klassendiagramm mit Vererbung, Assoziation und Komposition](uml-klassendiagramm.svg "Person ist abstrakt; Kunde und Mitarbeiter erben, eine Bestellung besteht aus Positionen")

### Beziehungen

| Beziehung | Bedeutung | Notation | Beispiel |
| :--- | :--- | :--- | :--- |
| **Assoziation** | Objekte kennen sich | durchgezogene Linie, optional mit Pfeil (Navigierbarkeit) | Kunde – Bestellung |
| **Aggregation** | „hat ein“, Teile können **ohne** das Ganze existieren | Linie mit **leerer Raute** am Ganzen | Mannschaft ◇– Spieler |
| **Komposition** | „besteht aus“, Teile sterben **mit** dem Ganzen | Linie mit **gefüllter Raute** am Ganzen | Bestellung ◆– Position |
| **Vererbung** (Generalisierung) | „ist ein“ | Linie mit **leerem Dreieck** zur Oberklasse | Kunde → Person |
| **Realisierung** | Klasse implementiert Interface | **gestrichelte** Linie mit leerem Dreieck | Rechnung ⇢ Druckbar |
| **Abhängigkeit** | nutzt kurzzeitig | gestrichelter Pfeil | Controller ⇢ Logger |

### Multiplizitäten

| Angabe | Bedeutung |
| :--- | :--- |
| \`1\` | genau eins |
| \`0..1\` | keins oder eins (optional) |
| \`*\` oder \`0..*\` | beliebig viele, auch keins |
| \`1..*\` | mindestens eins |
| \`2..4\` | zwei bis vier |

Gelesen wird immer von der **gegenüberliegenden** Seite: Steht an der Bestellung \`0..*\` und am Kunden \`1\`, heißt das „ein Kunde hat null bis viele Bestellungen, jede Bestellung gehört zu genau einem Kunden“.

## Verhaltensdiagramme

UML unterscheidet **Strukturdiagramme** (Klassen-, Objekt-, Komponenten-, Verteilungsdiagramm) und **Verhaltensdiagramme**. In der Prüfung kommen vor allem vor:

### Anwendungsfalldiagramm (Use Case)

Zeigt aus Sicht der Nutzer, **was** ein System leistet: **Akteure** (Strichmännchen) außerhalb der **Systemgrenze** (Rechteck) und **Anwendungsfälle** (Ellipsen) innerhalb.

- \`<<include>>\`: Ein Anwendungsfall bindet einen anderen **immer** ein (Pfeil zum eingebundenen Fall). „Bestellung aufgeben“ includes „Anmelden“.
- \`<<extend>>\`: Ein Anwendungsfall wird **optional** unter einer Bedingung erweitert (Pfeil zum Basisfall). „Gutschein einlösen“ extends „Bestellung aufgeben“.

### Sequenzdiagramm

Zeigt den **zeitlichen Ablauf** von Nachrichten zwischen Objekten. Die Zeit läuft von oben nach unten.

- **Lebenslinie**: gestrichelte senkrechte Linie unter jedem Objekt
- **Aktivierungsbalken**: schmales Rechteck, solange das Objekt arbeitet
- **synchrone Nachricht**: durchgezogener Pfeil mit **gefüllter** Spitze (Sender wartet)
- **asynchrone Nachricht**: offene Pfeilspitze (Sender wartet nicht)
- **Antwort**: gestrichelter Pfeil zurück
- **Fragmente**: \`alt\` (Verzweigung), \`opt\` (optional), \`loop\` (Schleife)

### Aktivitätsdiagramm

Beschreibt **Abläufe** wie ein moderner Programmablaufplan: **Startknoten** (gefüllter Kreis), **Aktionen** (abgerundete Rechtecke), **Verzweigung/Zusammenführung** (Raute) mit Bedingungen in eckigen Klammern \`[betrag > 100]\`, **Gabelung und Vereinigung** (dicker Balken) für parallele Abläufe, **Endknoten** (Kreis mit Punkt). **Schwimmbahnen** (*Swimlanes*) zeigen, wer eine Aktion ausführt.

### Zustandsdiagramm

Zeigt die **Zustände** eines Objekts und die **Übergänge** durch Ereignisse, z. B. Bestellung: \`angelegt → bezahlt → versendet → zugestellt\`, mit \`storniert\` als möglichem Zweig.

## Entwurfsmuster im Überblick

**Design Patterns** sind bewährte Lösungsschablonen für wiederkehrende Probleme (bekannt durch die „Gang of Four“, 1994):

- **Singleton**: genau eine Instanz einer Klasse (z. B. Konfiguration). Mit Vorsicht einsetzen, weil es globalen Zustand schafft.
- **Factory**: Objekterzeugung wird in eine eigene Methode/Klasse ausgelagert.
- **Observer**: Objekte abonnieren Änderungen eines anderen Objekts (Ereignisse, Newsletter-Prinzip).
- **Strategy**: austauschbare Algorithmen hinter einem gemeinsamen Interface (z. B. Versandkostenberechnung).
- **MVC** (*Model-View-Controller*): Architekturmuster, das Daten, Darstellung und Steuerung trennt.
`,
  codeSnippet: `// Java: Abstraktion, Vererbung und Polymorphie
public abstract class Person {
    protected String name;
    protected Person(String name) { this.name = name; }
    public abstract String anrede();          // muss überschrieben werden
}

public class Kunde extends Person {
    private final int kundenNr;
    public Kunde(String name, int kundenNr) { super(name); this.kundenNr = kundenNr; }
    @Override public String anrede() { return "Sehr geehrte/r " + name; }
}

public class Mitarbeiter extends Person {
    public Mitarbeiter(String name) { super(name); }
    @Override public String anrede() { return "Hallo " + name; }
}

List<Person> personen = List.of(new Kunde("Meyer", 1001), new Mitarbeiter("Schulz"));
for (Person p : personen) System.out.println(p.anrede());  // Polymorphie`,
  codeLanguage: 'Java',
  exercises: [
    {
      id: 'beziehung-erkennen',
      title: 'Beziehungen erkennen',
      prompt: 'Welche UML-Beziehung passt jeweils? Begründe kurz.\n\n1. Ein Haus besteht aus Räumen. Wird das Haus abgerissen, gibt es die Räume nicht mehr.\n2. Ein Verein hat Mitglieder. Löst sich der Verein auf, gibt es die Personen weiterhin.\n3. Ein Girokonto ist ein Konto.\n4. Die Klasse Rechnung implementiert das Interface Exportierbar.\n5. Ein Dozent unterrichtet Kurse.',
      solution: '1. **Komposition** (gefüllte Raute am Haus) – die Teile existieren nicht ohne das Ganze.\n2. **Aggregation** (leere Raute am Verein) – die Teile existieren unabhängig weiter.\n3. **Vererbung/Generalisierung** (leeres Dreieck zur Klasse Konto).\n4. **Realisierung** (gestrichelte Linie, leeres Dreieck zum Interface).\n5. **Assoziation** mit Multiplizitäten, z. B. Dozent 1 – 0..* Kurs.'
    },
    {
      id: 'klassendiagramm-modellieren',
      title: 'Klassendiagramm modellieren',
      prompt: 'Modelliere als Klassendiagramm (Text genügt): Eine **Bibliothek** verwaltet **Medien**. Medien sind entweder **Bücher** (mit ISBN) oder **DVDs** (mit Laufzeit in Minuten). Jedes Medium hat einen Titel und kann von höchstens einem **Leser** ausgeliehen sein. Ein Leser darf bis zu 5 Medien gleichzeitig ausleihen. Gib Attribute mit Sichtbarkeit, Beziehungen und Multiplizitäten an.',
      hints: ['Medium ist eine gute Kandidatin für eine abstrakte Oberklasse.', 'Die Ausleihe ist eine Assoziation zwischen Leser und Medium.'],
      solution: '- **Medium** {abstract}: `- titel: String`, `+ ausleihen(l: Leser): void`\n- **Buch** erbt von Medium: `- isbn: String`\n- **DVD** erbt von Medium: `- laufzeitMin: int`\n- **Leser**: `- name: String`, `- leserNr: int`\n- **Bibliothek**: `- name: String`\n\nBeziehungen:\n- Bibliothek **1** ◆—— **0..\\*** Medium (Komposition oder Aggregation, je nach Begründung)\n- Leser **0..1** —— **0..5** Medium (Assoziation „leiht aus“): ein Medium ist bei höchstens einem Leser, ein Leser hat bis zu 5 Medien.\n- Buch und DVD → Medium (Vererbung)'
    },
    {
      id: 'polymorphie-ausgabe',
      title: 'Was wird ausgegeben?',
      prompt: 'Gegeben ist der Java-Code aus dem Praxis-Beispiel. Was gibt die Schleife aus, und welches Prinzip wird hier genutzt? Was passiert, wenn man `new Person("X")` schreibt?',
      solution: 'Ausgabe:\n\n```text\nSehr geehrte/r Meyer\nHallo Schulz\n```\n\nPrinzip: **Polymorphie** – die Variable hat den Typ Person, aufgerufen wird zur Laufzeit die überschriebene Methode des tatsächlichen Objekts (dynamische Bindung).\n\n`new Person("X")` ist ein **Compilerfehler**, weil Person abstrakt ist und nicht instanziiert werden kann.'
    },
    {
      id: 'use-case',
      title: 'Anwendungsfalldiagramm beschreiben',
      prompt: 'Für einen Onlineshop gibt es die Akteure **Kunde** und **Lagerist**. Kunden können Artikel suchen und eine Bestellung aufgeben; dafür müssen sie angemeldet sein. Optional können sie dabei einen Gutschein einlösen. Lageristen versenden Bestellungen. Beschreibe die Anwendungsfälle und ihre Beziehungen (include/extend).',
      solution: 'Systemgrenze „Onlineshop“ mit den Anwendungsfällen: Artikel suchen, Bestellung aufgeben, Anmelden, Gutschein einlösen, Bestellung versenden.\n\n- Kunde —— Artikel suchen, Bestellung aufgeben\n- Lagerist —— Bestellung versenden\n- Bestellung aufgeben **<<include>>** → Anmelden (immer nötig)\n- Gutschein einlösen **<<extend>>** → Bestellung aufgeben (optional, Erweiterungspunkt „Zahlung“)'
    }
  ],
  quiz: [
    {
      question: 'Welches Zeichen steht im UML-Klassendiagramm für „private“?',
      options: ['+', '-', '#', '~'],
      correct: 1,
      explanation: '+ public, - private, # protected, ~ package.'
    },
    {
      question: 'Was beschreibt eine Komposition?',
      options: [
        'Eine Klasse erbt von einer anderen',
        'Ein Ganzes besteht aus Teilen, die ohne das Ganze nicht existieren',
        'Zwei Klassen kennen sich lose',
        'Eine Klasse implementiert ein Interface'
      ],
      correct: 1,
      explanation: 'Komposition ist die starke „besteht aus“-Beziehung mit gefüllter Raute; die Teile teilen den Lebenszyklus des Ganzen.'
    },
    {
      question: 'Was ist Überladen (Overloading)?',
      options: [
        'Eine Unterklasse definiert eine geerbte Methode neu',
        'Mehrere Methoden mit gleichem Namen, aber unterschiedlichen Parametern',
        'Eine Klasse erbt von zwei Oberklassen',
        'Ein Objekt hat zu viele Attribute'
      ],
      correct: 1,
      explanation: 'Überladen = gleicher Name, andere Parameterliste. Überschreiben = gleiche Signatur in der Unterklasse.'
    },
    {
      question: 'Was bedeutet die Multiplizität 1..* ?',
      options: ['genau eins', 'keins oder eins', 'mindestens eins', 'beliebig viele, auch keins'],
      correct: 2,
      explanation: '1..* heißt eins bis beliebig viele.'
    },
    {
      question: 'Welche Aussage zu abstrakten Klassen ist richtig?',
      options: [
        'Von ihnen kann man beliebig viele Objekte erzeugen',
        'Sie können nicht instanziiert werden und dienen als Oberklasse',
        'Sie dürfen keine Attribute haben',
        'Sie sind dasselbe wie Interfaces'
      ],
      correct: 1,
      explanation: 'Abstrakte Klassen liefern gemeinsame Attribute und Methoden; erst konkrete Unterklassen werden instanziiert.'
    },
    {
      question: 'Welches Diagramm zeigt den zeitlichen Nachrichtenaustausch zwischen Objekten?',
      options: ['Klassendiagramm', 'Anwendungsfalldiagramm', 'Sequenzdiagramm', 'Verteilungsdiagramm'],
      correct: 2,
      explanation: 'Im Sequenzdiagramm läuft die Zeit von oben nach unten entlang der Lebenslinien.'
    },
    {
      question: 'Wann verwendet man <<include>> im Anwendungsfalldiagramm?',
      options: [
        'Wenn ein Anwendungsfall einen anderen immer einbindet',
        'Wenn ein Anwendungsfall optional erweitert wird',
        'Wenn zwei Akteure verbunden werden',
        'Wenn eine Klasse vererbt wird'
      ],
      correct: 0,
      explanation: '<<include>> ist verpflichtend, <<extend>> optional unter einer Bedingung.'
    }
  ],
  relatedLabs: [
    { id: 'uml_diagram_lab', label: 'UML-Diagramm-Lab' },
    { id: 'design_patterns', label: 'Design Patterns' },
    { id: 'clean_arch_lab', label: 'Clean Architecture' },
    { id: 'erd_designer', label: 'ER-Designer' }
  ],
  sources: [
    { title: 'OMG Unified Modeling Language Specification 2.5.1', url: 'https://www.omg.org/spec/UML/2.5.1/About-UML' },
    { title: 'Oracle Java Tutorials: Object-Oriented Programming Concepts', url: 'https://docs.oracle.com/javase/tutorial/java/concepts/index.html' },
    { title: 'Microsoft Learn: Objektorientierte Programmierung (C#)', url: 'https://learn.microsoft.com/de-de/dotnet/csharp/fundamentals/tutorials/oop' },
    { title: 'Gamma, Helm, Johnson, Vlissides: Design Patterns, Addison-Wesley 1994', url: 'https://de.wikipedia.org/wiki/Entwurfsmuster_(Buch)' },
    { title: 'Wikipedia: Klassendiagramm', url: 'https://de.wikipedia.org/wiki/Klassendiagramm' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: UML-Klassendiagramme, OOA/OOM/OOP', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
