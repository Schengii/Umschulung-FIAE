/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Logische Verknüpfungen (AND, OR, NOT, XOR, NAND, NOR) anwenden und Wahrheitstabellen aufstellen',
    'Mit den Regeln von De Morgan Ausdrücke umformen und einfache Schaltungen wie den Halbaddierer erklären',
    'Negative Zahlen im Zweierkomplement darstellen und Wertebereiche für n Bit berechnen',
    'Bitoperationen (Maske, Schieben, Setzen, Umschalten) lesen und Gleitkomma-Rundungsfehler erklären'
  ],
  content: `
## Warum Logik und Zahlendarstellung zusammengehören

Im Prozessor besteht alles aus Schaltungen, die nur zwei Zustände kennen: 0 und 1. Die **boolesche Algebra** beschreibt, wie sich solche Werte verknüpfen lassen. Aus diesen Verknüpfungen entstehen Rechenwerke, mit denen der Computer addiert. Auch die Art, wie Zahlen als Bitmuster gespeichert werden, folgt daraus. Wer das versteht, erkennt Überläufe, Rundungsfehler und kann Netzmasken und Berechtigungsbits lesen.

## Die logischen Grundverknüpfungen

| Verknüpfung | Schreibweise | Ergebnis ist 1, wenn … |
| :--- | :--- | :--- |
| **AND** (UND) | A ∧ B, in Code \`&&\` oder \`&\` | beide Eingänge 1 sind |
| **OR** (ODER) | A ∨ B, in Code \`\\|\\|\` oder \`\\|\` | mindestens ein Eingang 1 ist |
| **NOT** (Negation) | ¬A, in Code \`!\` oder \`~\` | der Eingang 0 ist |
| **XOR** (exklusives ODER) | A ⊕ B, in Code \`^\` | genau ein Eingang 1 ist |
| **NAND** | ¬(A ∧ B) | nicht beide Eingänge 1 sind |
| **NOR** | ¬(A ∨ B) | beide Eingänge 0 sind |

Die Wahrheitstabelle für zwei Eingänge:

| A | B | AND | OR | XOR | NAND | NOR |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 |

Bei *n* Eingängen hat die Tabelle **2ⁿ Zeilen**. Für drei Eingänge sind das 8 Zeilen. So gehst du vor: Erst alle Kombinationen systematisch aufzählen (binär hochzählen), dann Teilausdrücke spaltenweise ausrechnen.

> [!info] NAND und NOR sind universell
> Jede andere Verknüpfung lässt sich allein aus NAND-Gattern bauen. Zum Beispiel ist \`NOT A = A NAND A\`. Deshalb kommen in der Chipfertigung oft NAND-Gatter als Grundbaustein vor.

## Rechenregeln und De Morgan

Mit wenigen Regeln lassen sich Ausdrücke vereinfachen:

- **Kommutativ**: A ∧ B = B ∧ A, ebenso bei ∨
- **Distributiv**: A ∧ (B ∨ C) = (A ∧ B) ∨ (A ∧ C)
- **Neutrale Elemente**: A ∧ 1 = A, A ∨ 0 = A
- **Absorption**: A ∨ (A ∧ B) = A
- **Doppelte Negation**: ¬¬A = A

Die beiden **De Morganschen Gesetze** vertauschen UND und ODER beim Negieren:

- ¬(A ∧ B) = ¬A ∨ ¬B
- ¬(A ∨ B) = ¬A ∧ ¬B

In der Programmierung begegnet dir das ständig. Die Bedingung \`!(alter >= 18 && hatFuehrerschein)\` ist gleichwertig zu \`alter < 18 || !hatFuehrerschein\`. Beachte, dass sich dabei auch der Vergleichsoperator umdreht.

## Vom Gatter zum Addierer

Zwei Bits addiert ein **Halbaddierer**:

- **Summe** = A XOR B
- **Übertrag** (*Carry*) = A AND B

Rechenbeispiel: 1 + 1 ergibt Summe 0 und Übertrag 1, also binär \`10\`. Ein **Volladdierer** berücksichtigt zusätzlich den Übertrag der Stelle davor und besteht aus zwei Halbaddierern und einem OR-Gatter. Hintereinandergeschaltet addieren *n* Volladdierer zwei *n*-Bit-Zahlen. Das ist der Kern des Rechenwerks (ALU).

## Negative Zahlen: das Zweierkomplement

Mit *n* Bit ohne Vorzeichen lassen sich die Zahlen von **0 bis 2ⁿ − 1** darstellen. Für 8 Bit sind das 0 bis 255. Für negative Zahlen verwenden fast alle Rechner das **Zweierkomplement**. Das höchstwertige Bit zeigt das Vorzeichen (1 bedeutet negativ). Der Vorteil: Addieren und Subtrahieren laufen mit demselben Addierwerk, und es gibt nur **eine** Null.

Wertebereich mit Vorzeichen bei *n* Bit: **−2ⁿ⁻¹ bis 2ⁿ⁻¹ − 1**.

| Bit | ohne Vorzeichen | mit Vorzeichen (Zweierkomplement) |
| :---: | :--- | :--- |
| 4 | 0 bis 15 | −8 bis 7 |
| 8 | 0 bis 255 | −128 bis 127 |
| 16 | 0 bis 65.535 | −32.768 bis 32.767 |
| 32 | 0 bis 4.294.967.295 | −2.147.483.648 bis 2.147.483.647 |

![Alle 16 Bitmuster bei 4 Bit mit vorzeichenloser und vorzeichenbehafteter Deutung](zweierkomplement.svg "Dasselbe Bitmuster, zwei Deutungen: ab 1000 beginnen im Zweierkomplement die negativen Zahlen")

### Eine negative Zahl bilden

1. Betrag als Dualzahl mit der gewünschten Stellenzahl schreiben.
2. Alle Bits **invertieren** (Einerkomplement).
3. **1 addieren**.

Beispiel: −5 in 8 Bit. 5 = \`0000 0101\` → invertiert \`1111 1010\` → plus 1 = \`1111 1011\` (hexadezimal \`FB\`). Probe: 251 − 256 = −5.

Zurück geht es genauso: Zeigt das höchste Bit eine 1, invertierst du, addierst 1 und setzt ein Minuszeichen davor. Alternativ rechnest du Wert ohne Vorzeichen minus 2ⁿ.

> [!warning] Überlauf (Overflow)
> Wird der Wertebereich verlassen, läuft die Zahl über. In 8 Bit mit Vorzeichen ist \`127 + 1\` gleich \`1000 0000\`, also **−128**. Das ist kein Rechenfehler der Hardware, sondern eine Folge des endlichen Wertebereichs. Solche Fehler führen zu Sicherheitslücken (*Integer Overflow*) und zu berühmten Pannen, bei denen ein Zähler plötzlich negativ wird.

## Bitoperationen in der Praxis

Programmiersprachen bieten Operatoren, die auf jedem Bit einzeln arbeiten:

| Operation | Beispiel (8 Bit) | Wirkung |
| :--- | :--- | :--- |
| AND mit Maske | \`1100 1010 & 0000 1111 = 0000 1010\` | untere 4 Bit herausfiltern |
| OR | \`0000 0001 \\| 1000 0000 = 1000 0001\` | Bits setzen |
| XOR | \`1010 ^ 0110 = 1100\` | Bits umschalten, auch für Parität |
| Linksschieben | \`0000 0011 << 2 = 0000 1100\` | Multiplikation mit 2² (hier 3 · 4 = 12) |
| Rechtsschieben | \`0001 1000 >> 3 = 0000 0011\` | ganzzahlige Division durch 2³ (24 / 8 = 3) |

Typische Einsatzfälle sind Berechtigungsbits (Unix: lesen = 4, schreiben = 2, ausführen = 1, also \`rwx\` = 7), Flags in Protokollen und die **Netzmaske** beim Subnetting. Die Netzadresse entsteht durch ein bitweises UND von IP-Adresse und Maske:

\`192.168.10.77\` AND \`255.255.255.192\`: Das letzte Oktett ergibt 77 = \`0100 1101\`, UND \`1100 0000\` = \`0100 0000\` = 64. Die Netzadresse lautet **192.168.10.64**.

## Kommazahlen: Gleitkomma nach IEEE 754

Kommazahlen speichert der Rechner als **Gleitkommazahl** aus drei Teilen: Vorzeichen, Exponent und Mantisse.

| Typ | Gesamt | Vorzeichen | Exponent | Mantisse | Bias |
| :--- | :---: | :---: | :---: | :---: | :---: |
| float (single) | 32 Bit | 1 | 8 | 23 | 127 |
| double | 64 Bit | 1 | 11 | 52 | 1023 |

Weil die Mantisse nur endlich viele Stellen hat, lassen sich viele Dezimalbrüche nicht exakt darstellen. 0,1 ist im Dualsystem ein periodischer Bruch, so wie 1/3 im Dezimalsystem. Deshalb ergibt in JavaScript und Python \`0.1 + 0.2\` den Wert \`0.30000000000000004\`.

> [!tip] Konsequenzen für die Praxis
> Gleitkommazahlen niemals mit \`==\` vergleichen, sondern mit einer Toleranz (\`Math.abs(a - b) < 1e-9\`). Geldbeträge rechnet man in **ganzen Cent** oder mit einem Dezimaltyp (z. B. \`DECIMAL\` in SQL, \`BigDecimal\` in Java), nicht mit \`float\`.

> [!exam] Prüfungstipp
> In der AP1 kommen Aufgaben wie: Dezimalzahl in 8 Bit im Zweierkomplement darstellen, Wertebereich für *n* Bit angeben oder eine Wahrheitstabelle für einen Ausdruck mit drei Variablen ausfüllen. Immer die Stellenzahl beachten: \`-5\` ist in 8 Bit \`1111 1011\`, in 4 Bit dagegen \`1011\`.
`,
  codeSnippet: `// Bitoperationen und Zweierkomplement in JavaScript
const x = 0b11001010;            // 202
console.log((x & 0x0f).toString(2).padStart(8, '0')); // 00001010 (untere 4 Bit)
console.log(3 << 2);             // 12 (3 mal 2²)
console.log(24 >> 3);            // 3  (24 durch 2³)

// -5 als 8-Bit-Zweierkomplement
console.log(((-5) & 0xff).toString(2).padStart(8, '0')); // 11111011

// Überlauf nachstellen: 8-Bit-Zahl mit Vorzeichen
const int8 = new Int8Array(1);
int8[0] = 127;
int8[0] += 1;
console.log(int8[0]);            // -128

// Gleitkomma-Falle
console.log(0.1 + 0.2);          // 0.30000000000000004
console.log(Math.abs(0.1 + 0.2 - 0.3) < 1e-9); // true`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'zweierkomplement-45',
      title: '−45 in 8 Bit darstellen',
      prompt: 'Stelle −45 als 8-Bit-Zahl im Zweierkomplement dar (binär und hexadezimal) und mache die Probe mit der Rechnung „Wert ohne Vorzeichen minus 256“.',
      hints: ['45 = 32 + 8 + 4 + 1. Erst die Dualzahl aufschreiben, dann invertieren und 1 addieren.'],
      solution: '45 = `0010 1101`. Invertiert: `1101 0010`. Plus 1: `1101 0011` = hexadezimal **D3**.\n\nProbe: `1101 0011` ohne Vorzeichen = 128 + 64 + 16 + 2 + 1 = 211. 211 − 256 = **−45**.'
    },
    {
      id: 'zweierkomplement-lesen',
      title: 'Ein Bitmuster deuten',
      prompt: 'Das Register eines 8-Bit-Sensors liefert `1111 0110`. Welche Zahl ist das (a) ohne Vorzeichen und (b) im Zweierkomplement? Welchen Wertebereich hat der Sensor bei Deutung (b)?',
      solution: '(a) Ohne Vorzeichen: 128 + 64 + 32 + 16 + 4 + 2 = **246**.\n\n(b) Das höchste Bit ist 1, also negativ. Invertieren: `0000 1001`, plus 1: `0000 1010` = 10. Ergebnis **−10** (Probe: 246 − 256 = −10).\n\nWertebereich bei 8 Bit mit Vorzeichen: **−128 bis 127**.'
    },
    {
      id: 'wahrheitstabelle-xor',
      title: 'XOR aus Grundgattern bauen',
      prompt: 'Zeige per Wahrheitstabelle, dass `A XOR B = (A AND NOT B) OR (NOT A AND B)` gilt. Wende danach De Morgan auf `NOT (A OR B)` an und übersetze die Bedingung `!(temp > 30 || luft > 80)` in eine äquivalente Bedingung ohne äußere Negation.',
      solution: 'Tabelle (A, B → A AND NOT B | NOT A AND B | OR-Verknüpfung): 0,0 → 0 | 0 → 0; 0,1 → 0 | 1 → 1; 1,0 → 1 | 0 → 1; 1,1 → 0 | 0 → 0. Das ergibt 0, 1, 1, 0 und stimmt mit XOR überein.\n\nDe Morgan: `NOT (A OR B) = NOT A AND NOT B`. Die Bedingung wird zu `temp <= 30 && luft <= 80`. Beim Auflösen dreht sich jeder Vergleich um (aus `>` wird `<=`).'
    },
    {
      id: 'netzadresse-bitweise',
      title: 'Netzadresse mit bitweisem UND',
      prompt: 'Berechne die Netzadresse für den Host `10.20.30.200` mit der Maske `255.255.255.240`. Rechne das letzte Oktett binär.',
      solution: 'Die ersten drei Oktette bleiben (Maske 255): 10.20.30. Letztes Oktett: 200 = `1100 1000`, Maske 240 = `1111 0000`. UND ergibt `1100 0000` = 192.\n\nNetzadresse: **10.20.30.192** (Netz mit 16 Adressen, also 192 bis 207).'
    }
  ],
  quiz: [
    {
      question: 'Wie viele Zeilen hat die Wahrheitstabelle eines Ausdrucks mit drei Eingangsvariablen?',
      options: ['3', '6', '8', '9'],
      correct: 2,
      explanation: 'Bei n Eingängen gibt es 2ⁿ Kombinationen, bei n = 3 also 2³ = 8 Zeilen.'
    },
    {
      question: 'Welche Verknüpfung liefert nur dann 1, wenn genau einer der beiden Eingänge 1 ist?',
      options: ['OR', 'XOR', 'NAND', 'NOR'],
      correct: 1,
      explanation: 'XOR (exklusives ODER) ist 1 bei ungleichen Eingängen. Es bildet die Summenstelle des Halbaddierers.'
    },
    {
      question: 'Welchen Wertebereich hat eine 8-Bit-Ganzzahl im Zweierkomplement?',
      options: ['0 bis 255', '−127 bis 127', '−128 bis 127', '−255 bis 255'],
      correct: 2,
      explanation: 'Von 2⁸ = 256 Mustern sind 128 negativ (−128 bis −1) und 128 nicht negativ (0 bis 127). Die Null gibt es nur einmal.'
    },
    {
      question: 'Wie lautet −1 als 8-Bit-Zahl im Zweierkomplement?',
      options: ['1000 0001', '1111 1110', '1111 1111', '0000 0001'],
      correct: 2,
      explanation: '1 = 0000 0001, invertiert 1111 1110, plus 1 ergibt 1111 1111. Alle Bits auf 1 bedeutet immer −1.'
    },
    {
      question: 'Wie lautet nach De Morgan ein gleichwertiger Ausdruck für ¬(A ∧ B)?',
      options: ['¬A ∧ ¬B', '¬A ∨ ¬B', 'A ∨ B', 'A ⊕ B'],
      correct: 1,
      explanation: 'Beim Negieren wird UND zu ODER (und umgekehrt), und die Eingänge werden einzeln negiert: ¬(A ∧ B) = ¬A ∨ ¬B.'
    },
    {
      question: 'Warum ergibt 0.1 + 0.2 in vielen Programmiersprachen nicht exakt 0.3?',
      options: [
        'Der Prozessor rechnet bei Kommazahlen grundsätzlich falsch',
        '0,1 und 0,2 sind im Dualsystem periodische Brüche und werden gerundet gespeichert',
        'Das Pluszeichen ist für Kommazahlen nicht definiert',
        'Gleitkommazahlen haben keine Mantisse'
      ],
      correct: 1,
      explanation: 'Die Mantisse hat endlich viele Stellen, deshalb sind viele Dezimalbrüche nur angenähert darstellbar. Vergleiche daher mit Toleranz und rechne Geld in Cent.'
    },
    {
      question: 'Was bewirkt ein Linksschieben einer Ganzzahl um 3 Stellen (ohne Überlauf)?',
      options: ['Division durch 3', 'Multiplikation mit 3', 'Multiplikation mit 8', 'Multiplikation mit 6'],
      correct: 2,
      explanation: 'Jede Stelle nach links verdoppelt den Wert. Drei Stellen entsprechen 2³ = 8.'
    }
  ],
  relatedLabs: [
    { id: 'ieee754_lab', label: 'Gleitkommazahlen (IEEE 754)' },
    { id: 'transfer_time_lab', label: 'Übertragungszeit-Rechner' }
  ],
  sources: [
    { title: 'MDN Web Docs: Bitweise Operatoren in JavaScript', url: 'https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators#bitweise_operatoren', note: 'AND, OR, XOR, NOT und Schiebeoperationen' },
    { title: 'Python-Dokumentation: Gleitkomma-Arithmetik, Probleme und Einschränkungen', url: 'https://docs.python.org/3/tutorial/floatingpoint.html', note: 'Warum 0,1 nicht exakt darstellbar ist' },
    { title: 'IEEE 754: Standard for Floating-Point Arithmetic', note: 'Formate float und double, kostenpflichtiger Standard' },
    { title: 'Wikipedia: Zweierkomplement', url: 'https://de.wikipedia.org/wiki/Zweierkomplement', note: 'Herleitung und Wertebereiche' }
  ],
  sourcesCheckedOn: '26.11.2026'
};
