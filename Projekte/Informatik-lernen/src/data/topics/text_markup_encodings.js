/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Zeichensatz, Codepoint und Kodierung auseinanderhalten',
    'ASCII, ISO-8859-1, UTF-8 und UTF-16 vergleichen und die UTF-8-Bytes eines Zeichens bestimmen',
    'Kaputte Umlaute (Mojibake) erkennen und ihre Ursache benennen',
    'CSV, JSON, XML, YAML und Markdown passend zum Einsatzzweck auswählen'
  ],
  content: `
## Zeichensatz, Codepoint, Kodierung

Ein Computer speichert keine Buchstaben, sondern Zahlen. Damit aus „A“ eine Zahl wird, braucht es zwei Festlegungen:

- Ein **Zeichensatz** (*character set*) ordnet jedem Zeichen eine Nummer zu, den **Codepoint**. In Unicode hat „A“ die Nummer U+0041, „ä“ die Nummer U+00E4.
- Eine **Kodierung** (*encoding*) legt fest, wie dieser Codepoint als Bytefolge gespeichert wird. Derselbe Codepoint U+00E4 wird in ISO-8859-1 als ein Byte (\`E4\`) gespeichert, in UTF-8 als zwei Byte (\`C3 A4\`).

## Die wichtigsten Kodierungen

| Kodierung | Bits/Bytes je Zeichen | Umfang | Typischer Einsatz |
| :--- | :--- | :--- | :--- |
| ASCII | 7 Bit | 128 Zeichen (Steuerzeichen, Ziffern, Buchstaben A–Z/a–z, Satzzeichen) | Protokolle, ältere Systeme |
| ISO-8859-1 (Latin-1) | 8 Bit | 256 Zeichen, inkl. ä, ö, ü, ß – aber **ohne** € | Altdaten westeuropäischer Systeme |
| Windows-1252 | 8 Bit | wie Latin-1, zusätzlich € und typografische Zeichen | ältere Windows-Programme |
| UTF-8 | 1–4 Byte | alle 1.114.112 Unicode-Codepoints | Web, Linux, JSON, Quellcode (Standard) |
| UTF-16 | 2 oder 4 Byte | alle Unicode-Codepoints | intern in Java, JavaScript, Windows-APIs |

Ein paar ASCII-Werte lohnen sich auswendig: \`'0'\` = 48 (0x30), \`'A'\` = 65 (0x41), \`'a'\` = 97 (0x61). Groß- und Kleinbuchstaben liegen genau 32 auseinander, also ein einziges Bit (0x20).

## So funktioniert UTF-8

UTF-8 ist **abwärtskompatibel zu ASCII**: Jedes ASCII-Zeichen bleibt ein einzelnes Byte mit führender 0. Alle anderen Zeichen bekommen 2 bis 4 Byte. Die führenden Bits des ersten Bytes verraten die Länge.

| Codepoint-Bereich | Bytes | Bitmuster |
| :--- | :---: | :--- |
| U+0000 – U+007F | 1 | \`0xxxxxxx\` |
| U+0080 – U+07FF | 2 | \`110xxxxx 10xxxxxx\` |
| U+0800 – U+FFFF | 3 | \`1110xxxx 10xxxxxx 10xxxxxx\` |
| U+10000 – U+10FFFF | 4 | \`11110xxx 10xxxxxx 10xxxxxx 10xxxxxx\` |

![UTF-8-Bytefolgen für A, ä, € und ein Emoji](utf8-kodierung.svg "Ein Zeichen, bis zu vier Byte: die Steuerbits sind rot markiert")

### Beispiel: „ä“ (U+00E4) von Hand kodieren

1. U+00E4 liegt zwischen U+0080 und U+07FF → **2 Byte**.
2. Die 11 Nutzbits: 0xE4 = \`000 1110 0100\`.
3. Aufteilen in 5 + 6 Bit: \`00011\` und \`100100\`.
4. In die Schablone einsetzen: \`110\`**00011** = \`C3\`, \`10\`**100100** = \`A4\`.

> [!info] Byte Order Mark (BOM)
> Am Dateianfang kann eine BOM stehen (bei UTF-8 die Bytes \`EF BB BF\`). Für UTF-16 zeigt sie die Byte-Reihenfolge an. Bei UTF-8 ist sie unnötig und stört manche Werkzeuge, z. B. Shell-Skripte oder CSV-Importe.

## Mojibake: kaputte Umlaute erkennen

Wird Text in einer anderen Kodierung **gelesen**, als er **geschrieben** wurde, entsteht Zeichensalat (japanisch *Mojibake*):

| Gespeichert als | Gelesen als | „Größe“ erscheint als |
| :--- | :--- | :--- |
| UTF-8 | ISO-8859-1 / Windows-1252 | \`GrÃ¶ÃŸe\` |
| ISO-8859-1 | UTF-8 | \`Gr��e\` (ungültige Bytes werden zu U+FFFD) |

> [!tip] Faustregel
> Siehst du \`Ã\` vor einem anderen Zeichen, war der Text UTF-8 und wurde als Latin-1 gelesen. Lösung: Kodierung beim Lesen korrekt angeben – im HTML-Kopf \`<meta charset="utf-8">\`, im HTTP-Header \`Content-Type: text/html; charset=utf-8\`, in der Datenbank z. B. \`utf8mb4\` (MySQL).

MySQLs alter Zeichensatz \`utf8\` speichert nur bis zu 3 Byte je Zeichen. Emojis brauchen 4 Byte und landen nur mit \`utf8mb4\` korrekt in der Tabelle.

## Base64: Binärdaten als Text

Manche Kanäle (E-Mail, JSON, Data-URLs) vertragen nur Text. **Base64** wandelt je **3 Byte in 4 druckbare Zeichen** um (Alphabet A–Z, a–z, 0–9, + und /). Die Datenmenge wächst dadurch um rund **33 %**. Base64 ist **keine Verschlüsselung**, jeder kann es zurückwandeln.

## Datenformate für den Austausch

| Format | Struktur | Stärken | Schwächen | Typisch für |
| :--- | :--- | :--- | :--- | :--- |
| CSV | Tabelle, Trennzeichen | simpel, Excel-tauglich | kein Standard für Datentypen, Trennzeichen \`;\` vs. \`,\` | Datenexporte |
| JSON | Objekte, Arrays, Werte | kompakt, nativ in JavaScript | keine Kommentare, keine Datumstypen | REST-APIs, Konfiguration |
| XML | Baum aus Elementen und Attributen | Schema-Validierung (XSD), Namespaces | ausführlich, aufwendig zu parsen | SOAP, Office-Dateien, E-Rechnung |
| YAML | Einrückung statt Klammern | gut lesbar, Kommentare | Einrückungsfehler, mehrdeutige Typen | Docker Compose, Kubernetes, CI |
| Markdown | Text mit leichter Auszeichnung | lesbar auch ungerendert | kein einheitlicher Standard | README, Doku, diese Artikel |

Derselbe Datensatz in drei Formaten:

\`\`\`json
{ "id": 7, "name": "Müller", "aktiv": true, "skills": ["SQL", "Java"] }
\`\`\`

\`\`\`xml
<mitarbeiter id="7" aktiv="true">
  <name>Müller</name>
  <skills><skill>SQL</skill><skill>Java</skill></skills>
</mitarbeiter>
\`\`\`

\`\`\`yaml
id: 7
name: Müller
aktiv: true
skills:
  - SQL
  - Java
\`\`\`

> [!exam] Prüfungstipp
> XML-Dokumente sind **wohlgeformt**, wenn sie die Syntaxregeln einhalten (genau ein Wurzelelement, jedes Tag geschlossen, korrekt verschachtelt). **Gültig** (*valid*) sind sie erst, wenn sie zusätzlich einem Schema (DTD oder XSD) entsprechen.
`,
  codeSnippet: `// Bytes eines Strings in UTF-8 anzeigen
const bytes = new TextEncoder().encode('Größe €');
console.log([...bytes].map((b) => b.toString(16).padStart(2, '0')).join(' '));
// 47 72 c3 b6 c3 9f 65 20 e2 82 ac

// Mojibake nachstellen: UTF-8-Bytes als Latin-1 lesen
console.log(new TextDecoder('latin1').decode(bytes)); // "GrÃ¶ÃŸe â‚¬"

// Base64
console.log(btoa('Hi!'));   // "SGkh" – 3 Byte → 4 Zeichen`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'utf8-bytes',
      title: 'UTF-8 von Hand',
      prompt: 'Bestimme die UTF-8-Bytefolge (hexadezimal) für „ü“ (U+00FC) und gib an, wie viele Byte das Wort „Tür“ in UTF-8 und in ISO-8859-1 belegt.',
      hints: ['0xFC = 1111 1100. Es braucht 11 Nutzbits, also führende Nullen ergänzen: 000 1111 1100.'],
      solution: 'U+00FC → 2 Byte. Nutzbits `00011 | 111100` → `11000011` = **C3**, `10111100` = **BC**.\n\n„Tür“: T (1) + ü (2) + r (1) = **4 Byte in UTF-8**, in ISO-8859-1 **3 Byte** (jedes Zeichen 1 Byte).'
    },
    {
      id: 'mojibake-diagnose',
      title: 'Fehlerdiagnose im Kundenportal',
      prompt: 'Im Kundenportal erscheint „StraÃŸe“ statt „Straße“. Die Daten kommen aus einer UTF-8-Datenbank. Nenne die wahrscheinliche Ursache und zwei Stellen, an denen du nachsehen würdest.',
      solution: 'Die UTF-8-Bytes von „ß“ (`C3 9F`) werden als Windows-1252/Latin-1 interpretiert → „Ã“ + „Ÿ“. Prüfen: (1) den HTTP-Header `Content-Type` bzw. `<meta charset>` der Seite, (2) die Zeichensatz-Einstellung der Datenbankverbindung (z. B. `charset=utf8mb4` im Connection-String). Ebenfalls möglich: eine Zwischenschicht, die die Daten als Latin-1 einliest.'
    },
    {
      id: 'format-wahl',
      title: 'Das passende Format wählen',
      prompt: 'Welches Format empfiehlst du jeweils, mit kurzer Begründung?\n\n1. Monatlicher Export der Umsätze für die Buchhaltung, die mit Excel arbeitet\n2. Antwort einer Web-API an ein React-Frontend\n3. Konfiguration eines CI-Workflows mit Kommentaren\n4. Austausch von Rechnungen mit Behörden, die ein festes Schema vorgeben',
      solution: '1. **CSV** (mit Semikolon und UTF-8-BOM, damit Excel Umlaute erkennt) – direkt in Excel zu öffnen.\n2. **JSON** – nativ in JavaScript, kompakt.\n3. **YAML** – gut lesbar, erlaubt Kommentare (GitHub Actions, GitLab CI).\n4. **XML** – lässt sich gegen ein XSD-Schema validieren (z. B. XRechnung).'
    }
  ],
  quiz: [
    {
      question: 'Wie viele Zeichen umfasst der ASCII-Zeichensatz?',
      options: ['64', '128', '256', '65.536'],
      correct: 1,
      explanation: 'ASCII ist ein 7-Bit-Code: 2⁷ = 128 Zeichen. Erweiterungen wie ISO-8859-1 nutzen 8 Bit (256 Zeichen).'
    },
    {
      question: 'Wie viele Byte belegt das Euro-Zeichen (U+20AC) in UTF-8?',
      options: ['1', '2', '3', '4'],
      correct: 2,
      explanation: 'U+20AC liegt im Bereich U+0800 bis U+FFFF und braucht daher 3 Byte: E2 82 AC.'
    },
    {
      question: 'Was bedeutet „UTF-8 ist abwärtskompatibel zu ASCII“?',
      options: [
        'UTF-8 kann nur ASCII-Zeichen speichern',
        'Jede gültige ASCII-Datei ist unverändert auch eine gültige UTF-8-Datei',
        'UTF-8 wandelt Umlaute automatisch in ASCII um',
        'ASCII-Programme können jedes UTF-8-Zeichen anzeigen'
      ],
      correct: 1,
      explanation: 'Die Codepoints U+0000 bis U+007F werden in UTF-8 mit genau dem ASCII-Byte gespeichert.'
    },
    {
      question: 'Auf einer Webseite steht „GrÃ¼ÃŸe“. Was ist die wahrscheinlichste Ursache?',
      options: [
        'Latin-1-Text wurde als UTF-8 gelesen',
        'UTF-8-Text wurde als Latin-1/Windows-1252 gelesen',
        'Die Schriftart enthält keine Umlaute',
        'Der Text wurde mit Base64 kodiert'
      ],
      correct: 1,
      explanation: 'Jedes Mehrbyte-Zeichen aus UTF-8 wird als zwei einzelne Latin-1-Zeichen angezeigt, typisch ist das „Ã“.'
    },
    {
      question: 'Welche Aussage zu Base64 ist richtig?',
      options: [
        'Base64 verschlüsselt Daten sicher',
        'Base64 verkleinert Dateien um ein Drittel',
        'Base64 stellt Binärdaten als Text dar und vergrößert sie um rund 33 %',
        'Base64 ist eine Unicode-Kodierung'
      ],
      correct: 2,
      explanation: '3 Byte werden zu 4 Zeichen. Base64 ist eine reine Darstellung, jeder kann sie dekodieren.'
    },
    {
      question: 'Wann ist ein XML-Dokument „gültig“ (valid)?',
      options: [
        'Wenn es mindestens ein Attribut hat',
        'Wenn es wohlgeformt ist und einem Schema (DTD/XSD) entspricht',
        'Wenn es in UTF-8 gespeichert ist',
        'Wenn es kleiner als 1 MB ist'
      ],
      correct: 1,
      explanation: 'Wohlgeformt = Syntaxregeln eingehalten. Gültig = wohlgeformt und schemakonform.'
    }
  ],
  relatedLabs: [
    { id: 'regex_master', label: 'RegEx Master' },
    { id: 'openapi_contract_lab', label: 'OpenAPI-Vertrag (JSON/YAML)' }
  ],
  sources: [
    { title: 'RFC 3629: UTF-8, a transformation format of ISO 10646', url: 'https://www.rfc-editor.org/rfc/rfc3629', note: 'Bitmuster und Bytebereiche' },
    { title: 'The Unicode Standard – FAQ zu UTF-8, UTF-16 und BOM', url: 'https://www.unicode.org/faq/utf_bom.html' },
    { title: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format', url: 'https://www.rfc-editor.org/rfc/rfc8259' },
    { title: 'W3C: Extensible Markup Language (XML) 1.0 – wohlgeformt und gültig', url: 'https://www.w3.org/TR/xml/' },
    { title: 'RFC 4648: The Base16, Base32, and Base64 Data Encodings', url: 'https://www.rfc-editor.org/rfc/rfc4648' },
    { title: 'MySQL Reference Manual: The utf8mb4 Character Set', url: 'https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb4.html' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
