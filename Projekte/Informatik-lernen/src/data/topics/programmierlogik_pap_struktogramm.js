/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Die Eigenschaften eines Algorithmus nennen und Variablen, Datentypen und Operatoren (inkl. Modulo) sicher anwenden',
    'Sequenz, Verzweigung und die drei Schleifenarten unterscheiden und passend einsetzen',
    'Einen Ablauf als Pseudocode, Programmablaufplan (PAP) und Struktogramm darstellen',
    'Einen Algorithmus mit dem Schreibtischtest prüfen und Syntax-, Laufzeit- und Logikfehler unterscheiden'
  ],
  content: `
## Was ist ein Algorithmus?

Ein **Algorithmus** ist eine eindeutige Handlungsvorschrift zur Lösung eines Problems. Ein Kochrezept ist ein Alltagsbeispiel, ein Sortierverfahren ein technisches. Damit eine Vorschrift als Algorithmus gilt, muss sie folgende Eigenschaften erfüllen:

- **Endlich**: Die Beschreibung hat eine begrenzte Länge.
- **Eindeutig** (determiniert): Jeder Schritt ist klar festgelegt, es gibt keinen Interpretationsspielraum.
- **Ausführbar**: Jeder Schritt ist tatsächlich durchführbar.
- **Terminierend**: Er endet nach endlich vielen Schritten.
- **Allgemein**: Er löst eine ganze Problemklasse (z. B. jede Quersumme), nicht nur einen Einzelfall.

Programmieren heißt, einen Algorithmus in einer Programmiersprache aufzuschreiben. Zuerst kommt aber das **Denken in Abläufen**, und das lässt sich sprachunabhängig üben.

## Variablen, Datentypen und Operatoren

Eine **Variable** ist ein benannter Speicherplatz, dessen Inhalt sich während des Programmlaufs ändern kann. Eine **Konstante** behält ihren Wert. Jede Variable hat einen **Datentyp**, der den Wertebereich und die erlaubten Operationen festlegt:

| Datentyp | Beispiel | Typische Verwendung |
| :--- | :--- | :--- |
| Ganzzahl (\`int\`) | 42, −7 | Zähler, Anzahl, Index |
| Kommazahl (\`float\`, \`double\`) | 3,14 | Messwerte, Berechnungen |
| Zeichenkette (\`string\`) | "Hallo" | Namen, Texte |
| Wahrheitswert (\`boolean\`) | true, false | Bedingungen, Schalter |
| Feld (\`array\`, Liste) | [3, 8, 5] | mehrere Werte gleichen Typs |

Wichtige Operatoren:

| Art | Operatoren | Hinweis |
| :--- | :--- | :--- |
| Arithmetisch | \`+ - * /\` | Bei zwei Ganzzahlen ist \`/\` in vielen Sprachen eine Ganzzahldivision (Java, C: 17 / 5 = 3) |
| Rest (Modulo) | \`%\` oder \`MOD\` | 17 MOD 5 = 2, Test auf gerade Zahl: \`n MOD 2 = 0\` |
| Vergleich | \`= == != < <= > >=\` | Ergebnis ist ein Wahrheitswert |
| Logisch | \`AND OR NOT\` | Bedingungen verknüpfen |
| Zuweisung | \`=\` oder \`:=\` oder \`←\` | Wert in Variable schreiben, nicht mathematisch gleichsetzen |

> [!warning] Zuweisung ist keine Gleichung
> \`i = i + 1\` ist mathematisch widersinnig, als Programmanweisung aber normal: Der alte Wert von i wird gelesen, um 1 erhöht und wieder in i gespeichert. Der Vergleich zweier Werte heißt deshalb meist \`==\`.

## Die drei Kontrollstrukturen

Jedes Programm lässt sich aus **drei Bausteinen** zusammensetzen:

1. **Sequenz**: Anweisungen laufen nacheinander ab.
2. **Verzweigung** (Selektion): Je nach Bedingung wird ein Zweig ausgeführt, entweder einseitig (\`wenn … dann\`), zweiseitig (\`wenn … dann … sonst\`) oder mehrfach (\`switch\`/\`case\`).
3. **Wiederholung** (Iteration): Ein Block läuft mehrfach.

![Sequenz, Verzweigung und Schleife als Ablaufplan](kontrollstrukturen.svg "Mit Sequenz, Verzweigung und Schleife lässt sich jeder Algorithmus ausdrücken")

### Die drei Schleifenarten

| Schleife | Prüfung | Läuft mindestens | Einsatz |
| :--- | :--- | :---: | :--- |
| **Kopfgesteuert** (\`while\`) | vor dem Durchlauf | 0-mal | Anzahl der Durchläufe unbekannt, z. B. „solange Eingabe falsch“ |
| **Fußgesteuert** (\`do … while\`, \`repeat … until\`) | nach dem Durchlauf | 1-mal | Eingabe mindestens einmal abfragen |
| **Zählschleife** (\`for\`) | Zähler gegen Grenze | 0-mal | Anzahl der Durchläufe bekannt, z. B. alle Felder eines Arrays |

> [!info] Achtung bei \`repeat … until\`
> Bei \`do … while\` läuft die Schleife, **solange** die Bedingung wahr ist. Bei \`repeat … until\` läuft sie, **bis** die Bedingung wahr wird, also genau umgekehrt. In Prüfungsaufgaben ist das eine beliebte Falle.

## Darstellungsformen

### Pseudocode

Pseudocode ist eine informelle, sprachunabhängige Beschreibung in Anlehnung an eine Programmiersprache. Er gehört in Prüfungen oft zur Aufgabenstellung. Beispiel: größten Wert einer Zahlenliste bestimmen.

\`\`\`text
max ← liste[0]
FÜR i VON 1 BIS länge(liste) − 1
    WENN liste[i] > max DANN
        max ← liste[i]
    ENDE WENN
ENDE FÜR
GIB max AUS
\`\`\`

### Programmablaufplan (PAP)

Der PAP ist eine grafische Darstellung nach **DIN 66001**. Die wichtigsten Symbole:

| Symbol | Bedeutung |
| :--- | :--- |
| Abgerundetes Rechteck (Oval) | Start und Ende |
| Rechteck | Verarbeitung, Zuweisung |
| Raute | Verzweigung mit Bedingung, zwei Ausgänge (ja/nein) |
| Parallelogramm | Ein- und Ausgabe |
| Pfeile | Ablaufrichtung |

### Struktogramm (Nassi-Shneiderman)

Das Struktogramm nach **DIN 66261** besteht aus verschachtelten Kästen ohne Pfeile. Es lässt nur die drei Kontrollstrukturen zu und verhindert dadurch unstrukturierte Sprünge. Eine Verzweigung zeichnet man als Kasten mit geteiltem Dreieck im Kopf und zwei Spalten, eine Schleife als Rahmen, der den Rumpf umschließt. Wer Struktogramme übt, schreibt später übersichtlicheren Code.

## Beispiele für typische Algorithmen

### Quersumme (Schleife und Modulo)

\`\`\`text
summe ← 0
SOLANGE n > 0
    summe ← summe + (n MOD 10)
    n ← n DIV 10
ENDE SOLANGE
\`\`\`

\`n MOD 10\` liefert die letzte Ziffer, \`n DIV 10\` schneidet sie ab.

### Größter gemeinsamer Teiler (Euklid)

\`\`\`text
SOLANGE b ≠ 0
    r ← a MOD b
    a ← b
    b ← r
ENDE SOLANGE
GIB a AUS
\`\`\`

## Schreibtischtest

Beim **Schreibtischtest** simulierst du den Algorithmus von Hand und notierst in einer **Trace-Tabelle** nach jedem Schritt die Werte aller Variablen. So findest du Fehler, ohne ein Programm zu starten. Prüfungsrelevant ist das, weil die IHK gern fragt: „Welche Ausgabe erzeugt der Algorithmus für die Eingabe …?“

Beispiel ggT(48, 18):

| Durchlauf | a | b | r = a MOD b |
| :---: | :---: | :---: | :---: |
| Start | 48 | 18 | – |
| 1 | 18 | 12 | 12 |
| 2 | 12 | 6 | 6 |
| 3 | 6 | 0 | 0 |

Weil b jetzt 0 ist, endet die Schleife. Ausgabe: **6**. Teste zusätzlich **Grenzfälle**: leere Liste, Wert 0, negative Zahl, ein einziges Element.

## Funktionen und Rekursion

Eine **Funktion** (Methode, Prozedur) fasst Anweisungen unter einem Namen zusammen. **Parameter** nehmen Werte entgegen, ein **Rückgabewert** liefert das Ergebnis. Vorteile: Wiederverwendung, Lesbarkeit, getrennt testbar. Eine **rekursive** Funktion ruft sich selbst auf. Sie braucht immer einen **Abbruchfall**, sonst läuft sie endlos, bis der Speicher des Aufrufstapels voll ist (*Stack Overflow*). Beispiel: \`fakultät(n) = 1\` für n ≤ 1, sonst \`n · fakultät(n − 1)\`.

## Fehlerarten

| Fehlerart | Wann sichtbar | Beispiel |
| :--- | :--- | :--- |
| **Syntaxfehler** | beim Übersetzen oder Starten | vergessene Klammer oder Semikolon |
| **Laufzeitfehler** | während des Programmlaufs | Division durch 0, Zugriff auf nicht vorhandenen Index, \`null\` |
| **Logikfehler** | oft gar nicht, nur falsches Ergebnis | \`<=\` statt \`<\`, falsche Reihenfolge der Bedingungen |

Der häufigste Logikfehler heißt **Off-by-one**: Eine Schleife läuft einmal zu oft oder zu selten. Ein Array mit 5 Elementen hat die Indizes 0 bis 4. Eine Schleife \`FÜR i VON 0 BIS 5\` greift auf den nicht vorhandenen Index 5 zu.

> [!exam] Prüfungstipp
> Bei Verzweigungen mit gestaffelten Bedingungen zählt die **Reihenfolge**: Wer „Wert ≥ 100“ vor „Wert ≥ 500“ prüft, wendet für 600 € nie die höhere Stufe an. Prüfe immer die **strengste Bedingung zuerst**.
`,
  codeSnippet: `// Euklidischer Algorithmus mit Schreibtisch-Protokoll
function ggT(a, b) {
  while (b !== 0) {
    const r = a % b;
    console.log('a=' + a + ', b=' + b + ', r=' + r);
    a = b;
    b = r;
  }
  return a;
}
console.log(ggT(48, 18)); // 6

// Quersumme
function quersumme(n) {
  let summe = 0;
  while (n > 0) {
    summe += n % 10;
    n = Math.floor(n / 10);
  }
  return summe;
}
console.log(quersumme(4821)); // 15`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'quersumme-schreibtischtest',
      title: 'Schreibtischtest Quersumme',
      prompt: 'Führe den Algorithmus „Quersumme“ aus dem Artikel für n = 4821 per Schreibtischtest aus. Lege eine Trace-Tabelle mit den Spalten n, n MOD 10 und summe an und gib die Ausgabe an.',
      hints: ['In jedem Durchlauf wird zuerst die letzte Ziffer addiert, danach n durch 10 geteilt (ganzzahlig).'],
      solution: 'Start: n = 4821, summe = 0.\n\n1. Durchlauf: n MOD 10 = 1 → summe = 1, n = 482\n2. Durchlauf: 2 → summe = 3, n = 48\n3. Durchlauf: 8 → summe = 11, n = 4\n4. Durchlauf: 4 → summe = 15, n = 0\n\nn = 0, die Schleife endet. Ausgabe: **15**.'
    },
    {
      id: 'rabatt-reihenfolge',
      title: 'Rabattstaffel richtig verzweigen',
      prompt: 'Ein Shop gewährt ab 100 € Bestellwert 5 % Rabatt und ab 500 € 10 %. Schreibe den Pseudocode für die Rabattberechnung und erkläre, welchen Fehler ein Entwickler macht, der die Bedingung „ab 100 €“ zuerst prüft und die Zweige mit SONST WENN verbindet.',
      solution: 'Richtig (strengste Bedingung zuerst):\n\n```text\nWENN wert >= 500 DANN rabatt <- 0.10\nSONST WENN wert >= 100 DANN rabatt <- 0.05\nSONST rabatt <- 0\nENDE WENN\n```\n\nFehler bei umgekehrter Reihenfolge: Für 600 € ist „wert >= 100“ bereits wahr, der Zweig „ab 500 €“ wird nie erreicht. Der Kunde bekäme nur 5 % statt 10 %. Das ist ein **Logikfehler**, der weder beim Übersetzen noch zur Laufzeit auffällt.'
    },
    {
      id: 'fehlerarten-zuordnen',
      title: 'Fehlerarten zuordnen',
      prompt: 'Ordne zu (Syntax-, Laufzeit- oder Logikfehler) und begründe kurz:\n\n(a) Eine schließende Klammer fehlt.\n(b) Ein Programm teilt durch die eingegebene Anzahl, der Nutzer gibt 0 ein.\n(c) Eine Schleife soll die 5 Elemente eines Arrays summieren, läuft aber mit `i <= 5`.\n(d) Das Ergebnis einer Durchschnittsberechnung ist immer um 1 zu klein, weil durch (anzahl + 1) geteilt wird.',
      solution: '(a) **Syntaxfehler**: Der Code lässt sich nicht übersetzen oder starten.\n\n(b) **Laufzeitfehler**: Das Programm startet, bricht aber bei der Division durch 0 ab. Abhilfe: Eingabe prüfen.\n\n(c) Typischer **Off-by-one-Fehler**. Der Zugriff auf den nicht vorhandenen Index 5 führt je nach Sprache zu einem Laufzeitfehler (Java) oder zu einem undefinierten Wert (JavaScript: `undefined`, die Summe wird `NaN`). Richtig ist `i < 5`.\n\n(d) **Logikfehler**: Das Programm läuft fehlerfrei, liefert aber falsche Ergebnisse. Nur Testfälle mit bekannten Sollwerten decken ihn auf.'
    },
    {
      id: 'endlosschleife-finden',
      title: 'Endlosschleife finden',
      prompt: 'Der Algorithmus soll die Zahlen von 1 bis 10 ausgeben, hängt aber:\n\n```text\ni <- 1\nSOLANGE i <= 10\n    GIB i AUS\nENDE SOLANGE\n```\n\nNenne den Fehler, die verletzte Algorithmus-Eigenschaft und die Korrektur. Welche Schleifenart wäre hier besser geeignet?',
      solution: 'Die Laufvariable i wird in der Schleife nie erhöht, die Bedingung bleibt dauerhaft wahr. Verletzt ist die Eigenschaft **Terminierung**.\n\nKorrektur: Vor `ENDE SOLANGE` die Anweisung `i <- i + 1` ergänzen.\n\nDie Anzahl der Durchläufe steht vorher fest, deshalb ist eine **Zählschleife** (`FÜR i VON 1 BIS 10`) besser geeignet. Sie erhöht den Zähler automatisch und der Fehler kann gar nicht erst entstehen.'
    }
  ],
  quiz: [
    {
      question: 'Welche Eigenschaft gehört NICHT zu einem Algorithmus?',
      options: ['Endlichkeit', 'Eindeutigkeit', 'Terminierung', 'Zufällige Reihenfolge der Schritte'],
      correct: 3,
      explanation: 'Ein Algorithmus ist eindeutig und läuft in festgelegter Reihenfolge ab. Außerdem muss er endlich, ausführbar und terminierend sein.'
    },
    {
      question: 'Welche Schleife wird garantiert mindestens einmal ausgeführt?',
      options: ['Kopfgesteuerte Schleife (while)', 'Fußgesteuerte Schleife (do … while)', 'Zählschleife mit Startwert größer als Endwert', 'Keine von ihnen'],
      correct: 1,
      explanation: 'Die fußgesteuerte Schleife prüft die Bedingung erst nach dem ersten Durchlauf. Eine kopfgesteuerte Schleife kann auch 0-mal laufen.'
    },
    {
      question: 'Was ergibt 17 MOD 5?',
      options: ['3', '2', '3,4', '12'],
      correct: 1,
      explanation: '17 = 3 · 5 + 2. Der Rest der Division ist 2. Der ganzzahlige Quotient (17 DIV 5) ist 3.'
    },
    {
      question: 'Welches Symbol steht im Programmablaufplan (DIN 66001) für eine Verzweigung?',
      options: ['Rechteck', 'Raute', 'Parallelogramm', 'Oval'],
      correct: 1,
      explanation: 'Die Raute enthält die Bedingung und hat zwei Ausgänge (ja/nein). Das Rechteck steht für Verarbeitung, das Parallelogramm für Ein- und Ausgabe, das Oval für Start und Ende.'
    },
    {
      question: 'Ein Array hat 5 Elemente. Wie oft läuft die Schleife „FÜR i VON 0 BIS 5“, wenn die Grenze eingeschlossen ist?',
      options: ['4-mal', '5-mal', '6-mal', 'Unendlich oft'],
      correct: 2,
      explanation: 'Die Werte 0, 1, 2, 3, 4 und 5 ergeben 6 Durchläufe. Der letzte greift auf den nicht vorhandenen Index 5 zu, ein klassischer Off-by-one-Fehler.'
    },
    {
      question: 'Wie nennt man einen Fehler, bei dem das Programm fehlerfrei läuft, aber ein falsches Ergebnis liefert?',
      options: ['Syntaxfehler', 'Laufzeitfehler', 'Logikfehler', 'Compilerfehler'],
      correct: 2,
      explanation: 'Logikfehler sind Fehler im Algorithmus selbst. Sie werden nur durch Tests oder einen Schreibtischtest mit bekannten Sollwerten entdeckt.'
    }
  ],
  relatedLabs: [
    { id: 'struktogramm_lab', label: 'Struktogramm-Lab' },
    { id: 'schreibtischtest_lab', label: 'Schreibtischtest-Lab' }
  ],
  sources: [
    { title: 'DIN 66001: Informationsverarbeitung – Sinnbilder und ihre Anwendung (Programmablaufplan)', note: 'Normsymbole für Programmablaufpläne, kostenpflichtig' },
    { title: 'DIN 66261: Informationsverarbeitung – Sinnbilder für Struktogramme nach Nassi-Shneiderman', note: 'Struktogramm-Normsymbole, kostenpflichtig' },
    { title: 'Wikipedia: Algorithmus', url: 'https://de.wikipedia.org/wiki/Algorithmus', note: 'Eigenschaften und Beispiele' },
    { title: 'Wikipedia: Euklidischer Algorithmus', url: 'https://de.wikipedia.org/wiki/Euklidischer_Algorithmus', note: 'ggT-Berechnung mit Modulo' }
  ],
  sourcesCheckedOn: '26.11.2026'
};
