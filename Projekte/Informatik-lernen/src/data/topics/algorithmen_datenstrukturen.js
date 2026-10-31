/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Algorithmen mit Sequenz, Verzweigung und Schleifen in Pseudocode, Struktogramm und PAP darstellen',
    'Einen Schreibtischtest Schritt für Schritt durchführen',
    'Lineare und binäre Suche sowie Bubble-, Selection- und Insertion-Sort erklären und ihren Aufwand in O-Notation angeben',
    'Rekursion verstehen und Array, Liste, Stack, Queue, Baum und Hashtabelle passend auswählen'
  ],
  content: `
## Was ist ein Algorithmus?

Ein **Algorithmus** ist eine eindeutige, endliche Folge von Anweisungen, die ein Problem löst. Er muss

- **endlich** beschrieben sein und nach endlich vielen Schritten **terminieren**,
- **eindeutig** sein (jeder Schritt ist klar festgelegt),
- **ausführbar** sein,
- und bei gleicher Eingabe das gleiche Ergebnis liefern (**determiniert**).

## Kontrollstrukturen

Jeder Algorithmus lässt sich aus drei Bausteinen zusammensetzen:

| Struktur | Bedeutung | Pseudocode |
| :--- | :--- | :--- |
| **Sequenz** | Anweisungen nacheinander | \`a ← 5\` |
| **Verzweigung** | abhängig von einer Bedingung | \`WENN … DANN … SONST … ENDE WENN\` |
| **Mehrfachauswahl** | mehrere Fälle | \`FALLS note: 1: … 2: … SONST: …\` |
| **kopfgesteuerte Schleife** | Bedingung **vor** jedem Durchlauf, evtl. 0 Durchläufe | \`SOLANGE … TUE … ENDE SOLANGE\` |
| **fußgesteuerte Schleife** | Bedingung **nach** dem Durchlauf, mindestens 1 Durchlauf | \`WIEDERHOLE … BIS …\` |
| **Zählschleife** | feste Anzahl Durchläufe | \`FÜR i ← 1 BIS 10 … ENDE FÜR\` |

> [!exam] Pseudocode in der IHK-Prüfung
> Es gibt keine feste Pflichtsyntax. Wichtig sind **Einrückung**, eindeutige Schlüsselwörter, sauber geschlossene Blöcke und ein Zuweisungszeichen, das sich vom Vergleich unterscheidet (\`←\` oder \`:=\` statt \`=\`). Arrays beginnen meist bei Index 0 – schreib dazu, wenn du bei 1 beginnst.

### Darstellungsformen

- **Pseudocode**: textnah, schnell zu schreiben.
- **Struktogramm** (Nassi-Shneiderman, DIN 66261): Blöcke, die man nur ineinander schachteln kann – erzwingt strukturierte Programmierung ohne Sprünge.
- **Programmablaufplan (PAP)** (DIN 66001): Flussdiagramm mit Oval (Start/Ende), Rechteck (Anweisung), Raute (Verzweigung), Parallelogramm (Ein-/Ausgabe) und Pfeilen.
- **UML-Aktivitätsdiagramm**: modernes Gegenstück zum PAP, siehe Artikel zu UML.

![Struktogramm zur Maximumsuche](struktogramm.svg "Eine Zählschleife mit eingeschachtelter Verzweigung im Nassi-Shneiderman-Diagramm")

Derselbe Algorithmus in Pseudocode:

\`\`\`text
FUNKTION maximum(zahlen)
  max ← zahlen[0]
  FÜR i ← 1 BIS länge(zahlen) − 1
    WENN zahlen[i] > max DANN
      max ← zahlen[i]
    ENDE WENN
  ENDE FÜR
  RÜCKGABE max
ENDE FUNKTION
\`\`\`

## Der Schreibtischtest

Beim **Schreibtischtest** (Trace-Tabelle) führst du den Algorithmus von Hand aus und notierst nach jedem Schritt alle Variablen. So findest du Denkfehler, ohne den Code auszuführen. Für \`maximum([7, 3, 9, 2])\`:

| Schritt | i | zahlen[i] | zahlen[i] > max? | max |
| :---: | :---: | :---: | :---: | :---: |
| Start | – | – | – | 7 |
| 1 | 1 | 3 | nein | 7 |
| 2 | 2 | 9 | ja | 9 |
| 3 | 3 | 2 | nein | 9 |

Ergebnis: **9**.

## Suchen

### Lineare Suche

Die Liste wird von vorne bis hinten durchlaufen. Funktioniert immer, auch unsortiert. Im schlechtesten Fall sind **n** Vergleiche nötig → **O(n)**.

### Binäre Suche

Nur für **sortierte** Listen: Man vergleicht mit dem mittleren Element und sucht dann nur noch in der passenden Hälfte weiter. Jeder Schritt halbiert den Suchbereich → **O(log n)**. Bei einer Million Einträgen genügen höchstens **20** Vergleiche (2²⁰ ≈ 1,05 Millionen).

> [!example] Suche nach 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
> 1. links = 0, rechts = 9 → mitte = 4 → 16 < 23 → links = 5
> 2. links = 5, rechts = 9 → mitte = 7 → 56 > 23 → rechts = 6
> 3. links = 5, rechts = 6 → mitte = 5 → **23 gefunden** nach 3 Vergleichen

## Sortieren

### Bubble Sort

Benachbarte Elemente werden verglichen und getauscht, wenn sie falsch herum stehen. Nach jedem Durchlauf ist das größte verbleibende Element ganz hinten „aufgestiegen“ wie eine Blase.

| Durchlauf | Liste danach | Vertauschungen |
| :---: | :--- | :---: |
| Start | 5, 1, 4, 2, 8 | – |
| 1 | 1, 4, 2, 5, **8** | 3 |
| 2 | 1, 2, 4, **5, 8** | 1 |
| 3 | 1, 2, 4, 5, 8 | 0 → fertig |

Mit dem Abbruch „kein Tausch im Durchlauf“ ist eine bereits sortierte Liste nach einem Durchlauf erledigt (bester Fall O(n)).

### Weitere Verfahren

| Verfahren | Idee | bester Fall | Durchschnitt | schlechtester Fall | stabil? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Bubble Sort | Nachbarn tauschen | O(n) | O(n²) | O(n²) | ja |
| Selection Sort | kleinstes Element suchen und nach vorne tauschen | O(n²) | O(n²) | O(n²) | nein |
| Insertion Sort | jedes Element in den sortierten Teil einfügen (wie Spielkarten) | O(n) | O(n²) | O(n²) | ja |
| Merge Sort | teilen, rekursiv sortieren, zusammenführen | O(n log n) | O(n log n) | O(n log n) | ja |
| Quick Sort | Pivot wählen, in kleiner/größer aufteilen, rekursiv | O(n log n) | O(n log n) | O(n²) | nein |

**Stabil** heißt: Gleich große Elemente behalten ihre ursprüngliche Reihenfolge – wichtig, wenn man z. B. erst nach Name und dann nach Abteilung sortiert.

## O-Notation

Die **O-Notation** beschreibt, wie der Aufwand **wächst**, wenn die Eingabe größer wird. Konstanten und kleinere Terme fallen weg: 3n² + 5n + 2 ist O(n²).

| Klasse | Name | Beispiel | n = 1.000 |
| :--- | :--- | :--- | ---: |
| O(1) | konstant | Array-Zugriff per Index | 1 |
| O(log n) | logarithmisch | binäre Suche | ≈ 10 |
| O(n) | linear | lineare Suche | 1.000 |
| O(n log n) | linearithmisch | Merge Sort | ≈ 10.000 |
| O(n²) | quadratisch | Bubble Sort, zwei verschachtelte Schleifen | 1.000.000 |
| O(2ⁿ) | exponentiell | alle Teilmengen durchprobieren | unvorstellbar groß |

> [!tip] Faustregel
> Eine Schleife über n Elemente → O(n). Zwei **verschachtelte** Schleifen über n → O(n²). Zwei Schleifen **nacheinander** → O(n) + O(n) = O(n).

## Rekursion

Eine Funktion ist **rekursiv**, wenn sie sich selbst aufruft. Sie braucht immer eine **Abbruchbedingung** (Basisfall), sonst läuft sie endlos, bis der Stack überläuft (*Stack Overflow*).

\`\`\`text
FUNKTION fakultaet(n)
  WENN n ≤ 1 DANN RÜCKGABE 1          // Basisfall
  RÜCKGABE n * fakultaet(n − 1)        // rekursiver Aufruf
ENDE FUNKTION
\`\`\`

fakultaet(4) = 4 × fakultaet(3) = 4 × 3 × fakultaet(2) = 4 × 3 × 2 × 1 = **24**. Jede Rekursion lässt sich auch mit einer Schleife (iterativ) schreiben – oft schneller und speichersparender.

## Datenstrukturen

| Struktur | Prinzip | Zugriff | Einfügen/Löschen | Einsatz |
| :--- | :--- | :--- | :--- | :--- |
| Array | feste Größe, Elemente hintereinander im Speicher | O(1) per Index | O(n) in der Mitte | Messwerte, Matrizen |
| Verkettete Liste | Knoten zeigen auf den Nachfolger | O(n) | O(1), wenn Position bekannt | häufiges Einfügen |
| Stack (Stapel) | **LIFO** – last in, first out (\`push\`, \`pop\`) | oben O(1) | O(1) | Rückgängig-Funktion, Aufrufstack |
| Queue (Warteschlange) | **FIFO** – first in, first out | vorne O(1) | O(1) | Druckaufträge, Nachrichten |
| Binärer Suchbaum | links kleiner, rechts größer | O(log n) (ausgeglichen) | O(log n) | sortierte Daten, Datenbankindex (B-Baum) |
| Hashtabelle | Schlüssel → Hashfunktion → Position | O(1) im Mittel | O(1) im Mittel | Dictionary, Cache |
`,
  codeSnippet: `# Binäre Suche in Python (iterativ)
def binaere_suche(liste, ziel):
    links, rechts = 0, len(liste) - 1
    while links <= rechts:
        mitte = (links + rechts) // 2
        if liste[mitte] == ziel:
            return mitte
        if liste[mitte] < ziel:
            links = mitte + 1
        else:
            rechts = mitte - 1
    return -1  # nicht gefunden

print(binaere_suche([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23))  # 5`,
  codeLanguage: 'Python',
  exercises: [
    {
      id: 'schreibtischtest',
      title: 'Schreibtischtest',
      prompt: 'Führe einen Schreibtischtest durch und gib die Ausgabe an:\n\n```text\nsumme ← 0\nzaehler ← 0\nFÜR i ← 1 BIS 10\n  WENN i MOD 3 = 0 DANN\n    summe ← summe + i\n    zaehler ← zaehler + 1\n  ENDE WENN\nENDE FÜR\nAUSGABE summe / zaehler\n```',
      hints: ['MOD liefert den Rest der Division. Welche i zwischen 1 und 10 sind durch 3 teilbar?'],
      solution: '| i | i MOD 3 = 0? | summe | zaehler |\n| :---: | :---: | :---: | :---: |\n| 3 | ja | 3 | 1 |\n| 6 | ja | 9 | 2 |\n| 9 | ja | 18 | 3 |\n\nAlle anderen i ändern nichts. Ausgabe: 18 ÷ 3 = **6** (der Durchschnitt der durch 3 teilbaren Zahlen).'
    },
    {
      id: 'pseudocode-noten',
      title: 'Pseudocode schreiben',
      prompt: 'Schreibe in Pseudocode eine Funktion `auswertung(noten)`, die für ein Array mit Schulnoten (1 bis 6) zurückgibt, wie viele Noten **besser als 4** sind und wie hoch der **Durchschnitt** ist. Ein leeres Array soll den Durchschnitt 0 liefern.',
      solution: '```text\nFUNKTION auswertung(noten)\n  WENN länge(noten) = 0 DANN\n    RÜCKGABE (0, 0)\n  ENDE WENN\n  summe ← 0\n  gut ← 0\n  FÜR i ← 0 BIS länge(noten) − 1\n    summe ← summe + noten[i]\n    WENN noten[i] < 4 DANN\n      gut ← gut + 1\n    ENDE WENN\n  ENDE FÜR\n  RÜCKGABE (gut, summe / länge(noten))\nENDE FUNKTION\n```\n\n„Besser als 4“ heißt bei Schulnoten **kleiner** als 4.'
    },
    {
      id: 'bubble-trace',
      title: 'Bubble Sort von Hand',
      prompt: 'Sortiere die Liste **[9, 4, 7, 1]** aufsteigend mit Bubble Sort. Gib nach jedem Durchlauf die Liste und die Zahl der Vertauschungen an.',
      solution: '| Durchlauf | Liste danach | Vertauschungen |\n| :---: | :--- | :---: |\n| 1 | 4, 7, 1, 9 | 3 |\n| 2 | 4, 1, 7, 9 | 1 |\n| 3 | 1, 4, 7, 9 | 1 |\n| 4 | 1, 4, 7, 9 | 0 → fertig |\n\nIm 1. Durchlauf: (9,4) tauschen, (9,7) tauschen, (9,1) tauschen.'
    },
    {
      id: 'aufwand',
      title: 'Aufwand abschätzen',
      prompt: '1. Wie viele Vergleiche braucht die binäre Suche höchstens bei 4.000 sortierten Einträgen?\n2. Ein Bubble Sort braucht für 1.000 Elemente 0,2 Sekunden. Wie lange etwa für 10.000 Elemente?\n3. Welche Komplexität hat dieser Code? `FÜR i ← 1 BIS n: FÜR j ← 1 BIS n: summe ← summe + i*j`',
      hints: ['2¹² = 4.096.', 'Bei O(n²) bedeutet zehnmal so viele Elemente hundertmal so viel Aufwand.'],
      solution: '1. 2¹¹ = 2.048 < 4.000 ≤ 2¹² = 4.096 → höchstens **12 Vergleiche**.\n2. 10-fache Menge → 10² = 100-facher Aufwand → etwa **20 Sekunden**.\n3. Zwei verschachtelte Schleifen über n → **O(n²)**.'
    }
  ],
  quiz: [
    {
      question: 'Welche Schleife wird mindestens einmal durchlaufen?',
      options: ['kopfgesteuerte Schleife', 'fußgesteuerte Schleife', 'Zählschleife', 'keine'],
      correct: 1,
      explanation: 'Bei der fußgesteuerten Schleife wird die Bedingung erst nach dem Durchlauf geprüft.'
    },
    {
      question: 'Welche Voraussetzung hat die binäre Suche?',
      options: ['Die Liste muss sortiert sein', 'Die Liste darf höchstens 100 Elemente haben', 'Die Elemente müssen Zahlen sein', 'Keine'],
      correct: 0,
      explanation: 'Nur bei sortierten Daten weiß man nach dem Vergleich mit der Mitte, in welcher Hälfte man weitersuchen muss.'
    },
    {
      question: 'Welche Komplexität hat Bubble Sort im Durchschnitt?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correct: 3,
      explanation: 'Zwei verschachtelte Durchläufe über die Liste ergeben quadratischen Aufwand.'
    },
    {
      question: 'Nach welchem Prinzip arbeitet ein Stack?',
      options: ['FIFO', 'LIFO', 'Zufällig', 'Nach Priorität'],
      correct: 1,
      explanation: 'Last in, first out: Das zuletzt abgelegte Element wird zuerst entnommen, wie bei einem Tellerstapel.'
    },
    {
      question: 'Was braucht jede rekursive Funktion zwingend?',
      options: ['Eine Schleife', 'Eine Abbruchbedingung (Basisfall)', 'Einen Rückgabewert vom Typ Integer', 'Eine globale Variable'],
      correct: 1,
      explanation: 'Ohne Basisfall ruft sich die Funktion endlos selbst auf, bis der Stack überläuft.'
    },
    {
      question: 'Welches Symbol steht im Programmablaufplan (DIN 66001) für eine Verzweigung?',
      options: ['Rechteck', 'Raute', 'Oval', 'Parallelogramm'],
      correct: 1,
      explanation: 'Raute = Verzweigung, Rechteck = Anweisung, Oval = Start/Ende, Parallelogramm = Ein-/Ausgabe.'
    },
    {
      question: 'Wie viele Vergleiche braucht die binäre Suche höchstens bei 1.000.000 sortierten Einträgen?',
      options: ['10', '20', '1.000', '500.000'],
      correct: 1,
      explanation: '2²⁰ = 1.048.576 ≥ 1.000.000, also höchstens 20 Halbierungen.'
    }
  ],
  relatedLabs: [
    { id: 'struktogramm_lab', label: 'Struktogramm-Editor' },
    { id: 'algo_lab', label: 'Algorithmen-Visualisierung' },
    { id: 'bigo_benchmark', label: 'Big-O-Benchmark' },
    { id: 'datastructures', label: 'Datenstrukturen' }
  ],
  sources: [
    { title: 'Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms, 4. Aufl., MIT Press 2022', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { title: 'Wikipedia: Nassi-Shneiderman-Diagramm (DIN 66261)', url: 'https://de.wikipedia.org/wiki/Nassi-Shneiderman-Diagramm' },
    { title: 'Wikipedia: Programmablaufplan (DIN 66001)', url: 'https://de.wikipedia.org/wiki/Programmablaufplan' },
    { title: 'Wikipedia: Landau-Symbole (O-Notation)', url: 'https://de.wikipedia.org/wiki/Landau-Symbole' },
    { title: 'Python-Dokumentation: bisect – Algorithmen für sortierte Listen', url: 'https://docs.python.org/3/library/bisect.html' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Pseudocode, PAP, Arrays, Schleifen, Verzweigungen', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
