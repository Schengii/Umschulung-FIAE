/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Zahlen zwischen Dezimal-, Dual-, Hexadezimal- und Oktalsystem umrechnen',
    'Dezimal- (kB, MB) und Binärpräfixe (KiB, MiB) sicher unterscheiden',
    'Speicherbedarf von Bildern und Audiodateien sowie Übertragungszeiten berechnen',
    'Die Hauptkomponenten eines PCs und die Von-Neumann-Architektur erklären'
  ],
  content: `
## Das EVA-Prinzip

Jede Datenverarbeitung folgt dem **EVA-Prinzip**: **E**ingabe → **V**erarbeitung → **A**usgabe (englisch *Input – Process – Output*). Eine Tastatur liefert die Eingabe, der Prozessor verarbeitet sie, der Monitor gibt das Ergebnis aus. Die Eingabe muss nicht von einem Menschen kommen: Auch ein Sensor oder eine Netzwerknachricht ist eine Eingabe. Oft kommt als vierter Schritt die **Speicherung** dazu (EVAS).

## Bit und Byte

Ein Computer kennt intern nur zwei Zustände: **0** (keine Spannung) und **1** (Spannung). Eine solche Ziffer heißt **Bit** (*binary digit*), die kleinste Informationseinheit.

- 4 Bit = 1 **Nibble** (Halbbyte) → genau eine Hexadezimalziffer
- 8 Bit = 1 **Byte** → 2⁸ = **256** verschiedene Werte (0 bis 255)
- Mit *n* Bit lassen sich **2ⁿ** Zustände darstellen. 10 Bit → 1.024, 16 Bit → 65.536, 32 Bit → rund 4,29 Milliarden.

> [!tip] Merkhilfe
> Wie viele Bit brauche ich für *x* Zustände? Die kleinste Zweierpotenz suchen, die ≥ *x* ist. Für 200 Mitarbeiter-IDs reichen 8 Bit (256), für 300 braucht man 9 Bit (512).

## Zahlensysteme

Ein Stellenwertsystem hat eine **Basis**. Jede Stelle ist eine Potenz dieser Basis, ganz rechts beginnt es mit Basis⁰ = 1.

| System | Basis | Ziffern | Präfix in Code | Beispiel für 173 |
| :--- | :---: | :--- | :--- | :--- |
| Dezimal | 10 | 0–9 | – | 173 |
| Dual (Binär) | 2 | 0, 1 | \`0b\` | 1010 1101 |
| Oktal | 8 | 0–7 | \`0o\` | 255 |
| Hexadezimal | 16 | 0–9, A–F | \`0x\` | AD |

![Stellenwerttabelle der Dualzahl 1010 1101](zahlensysteme.svg "Stellenwerte einer 8-Bit-Zahl und die Gruppierung in Nibbles für die Hex-Darstellung")

### Dual → Dezimal

Jede 1 mit ihrem Stellenwert multiplizieren und addieren: 1010 1101 = 128 + 32 + 8 + 4 + 1 = **173**.

### Dezimal → Dual (Restwertmethode)

Fortlaufend durch 2 teilen und die Reste **von unten nach oben** lesen:

| Rechnung | Ergebnis | Rest |
| :--- | :---: | :---: |
| 173 : 2 | 86 | 1 |
| 86 : 2 | 43 | 0 |
| 43 : 2 | 21 | 1 |
| 21 : 2 | 10 | 1 |
| 10 : 2 | 5 | 0 |
| 5 : 2 | 2 | 1 |
| 2 : 2 | 1 | 0 |
| 1 : 2 | 0 | 1 |

Von unten gelesen: **1010 1101**. Schneller geht es oft mit der Stellenwerttabelle: Von 173 die größte passende Zweierpotenz abziehen (128, Rest 45), dann 32 (Rest 13), 8 (Rest 5), 4 (Rest 1), 1 (Rest 0).

### Dual ↔ Hexadezimal

Von rechts in Vierergruppen teilen und jede Gruppe einzeln umrechnen: 1010 | 1101 → A | D → **0xAD**. Umgekehrt wird jede Hex-Ziffer zu vier Bit: 0x3F → 0011 1111.

Hexadezimal begegnet dir überall: Farbcodes (\`#FF8800\`), MAC-Adressen (\`00:1A:2B:3C:4D:5E\`), IPv6-Adressen und Speicheradressen.

### Negative Zahlen: Zweierkomplement

Ganzzahlen mit Vorzeichen werden fast immer im **Zweierkomplement** gespeichert. Das höchste Bit ist das Vorzeichen. So bildest du −5 in 8 Bit:

1. +5 dual: 0000 0101
2. Alle Bits invertieren: 1111 1010
3. 1 addieren: **1111 1011**

Ein 8-Bit-Wert mit Vorzeichen reicht damit von −128 bis +127.

## Datenmengen: kB oder KiB?

Hier lauert eine klassische Prüfungsfalle. Es gibt zwei Präfix-Systeme:

| Dezimal (SI) | Wert | Binär (IEC) | Wert |
| :--- | :--- | :--- | :--- |
| 1 kB (Kilobyte) | 1.000 Byte | 1 KiB (Kibibyte) | 1.024 Byte |
| 1 MB | 1.000² Byte | 1 MiB (Mebibyte) | 1.024² = 1.048.576 Byte |
| 1 GB | 1.000³ Byte | 1 GiB | 1.024³ Byte |
| 1 TB | 1.000⁴ Byte | 1 TiB | 1.024⁴ Byte |

Festplattenhersteller rechnen dezimal, Windows zeigt binär an, schreibt aber „GB“. Eine „1-TB-Festplatte“ erscheint deshalb in Windows mit rund **931 „GB“** (1.000.000.000.000 : 1.024³ ≈ 931,3 GiB).

> [!exam] Prüfungstipp
> Lies genau, welches System verlangt ist. Steht nur „MB“ ohne Hinweis, gib deine Annahme an („1 MB = 1.000.000 Byte“). Übertragungsraten (Mbit/s) sind **immer dezimal** und in **Bit**, nicht in Byte.

## Speicherbedarf berechnen

### Rastergrafik (unkomprimiert)

**Speicher = Breite × Höhe × Farbtiefe (Bit) ÷ 8**

Ein Full-HD-Bild (1920 × 1080) mit 24 Bit Farbtiefe (True Color, je 8 Bit für Rot, Grün, Blau):
1920 × 1080 = 2.073.600 Pixel × 3 Byte = **6.220.800 Byte ≈ 6,22 MB** (≈ 5,93 MiB).

Bei 24 Bit kann jedes Pixel 2²⁴ ≈ 16,7 Millionen Farben annehmen.

### Audio (unkomprimiert, PCM)

**Speicher = Abtastrate × Abtasttiefe × Kanäle × Dauer ÷ 8**

Audio-CD-Qualität: 44.100 Hz, 16 Bit, Stereo. Drei Minuten ergeben 44.100 × 16 × 2 × 180 s = 254.016.000 Bit = **31.752.000 Byte ≈ 31,75 MB**. Formate wie MP3 oder AAC komprimieren verlustbehaftet, FLAC verlustfrei.

### Übertragungszeit

**Zeit = Datenmenge in Bit ÷ Übertragungsrate in Bit/s**

4 GB über eine 100-Mbit/s-Leitung: 4 × 10⁹ Byte × 8 = 32 × 10⁹ Bit ÷ 100 × 10⁶ Bit/s = **320 s = 5 min 20 s**. Rechnet man mit 4 GiB, sind es 34.359.738.368 Bit ÷ 10⁸ ≈ 343,6 s. In der Praxis kommen Protokoll-Overhead und Auslastung hinzu.

## Aufbau eines Computers

![Von-Neumann-Architektur](von-neumann.svg "CPU, Speicher und Ein-/Ausgabe teilen sich ein Bussystem")

Fast alle heutigen Rechner folgen der **Von-Neumann-Architektur**: Programme und Daten liegen im **selben Speicher**, und alle Komponenten sind über ein **Bussystem** verbunden (Datenbus, Adressbus, Steuerbus). Weil Befehle und Daten über denselben Bus müssen, entsteht der *Von-Neumann-Flaschenhals*. Caches mildern ihn. Die **Harvard-Architektur** trennt Befehls- und Datenspeicher, man findet sie z. B. in Mikrocontrollern.

| Komponente | Aufgabe | Typische Kennzahl |
| :--- | :--- | :--- |
| CPU | führt Befehle aus (Steuerwerk + Rechenwerk/ALU + Register) | Kerne, Takt in GHz, Cache |
| RAM | flüchtiger Arbeitsspeicher für laufende Programme | Größe in GiB, DDR5-Takt |
| SSD/HDD | nicht flüchtiger Massenspeicher | Kapazität, IOPS, MB/s |
| GPU | parallele Berechnungen (Grafik, KI) | Shader-Einheiten, VRAM |
| Mainboard | verbindet alles, enthält Chipsatz und Steckplätze | Sockel, PCIe-Lanes |
| Netzteil | wandelt Wechsel- in Gleichspannung | Leistung in Watt, Effizienz (80 PLUS) |

### Speicherhierarchie

Je näher am Prozessor, desto schneller, kleiner und teurer: **Register → L1/L2/L3-Cache → RAM → SSD → HDD → Band/Cloud-Archiv**. Ein Zugriff auf den L1-Cache dauert rund eine Nanosekunde, auf eine HDD mehrere Millisekunden, also millionenfach länger.

> [!info] Merke
> Flüchtig (*volatile*) heißt: Ohne Strom sind die Daten weg (RAM). SSD, HDD und USB-Sticks speichern **nicht flüchtig**.
`,
  codeSnippet: `// Umrechnungen in JavaScript
const n = 173;
console.log(n.toString(2));   // "10101101"
console.log(n.toString(16));  // "ad"
console.log(n.toString(8));   // "255"
console.log(parseInt('AD', 16)); // 173
console.log(0b1010_1101 === 0xAD); // true

// Bildgröße in Byte
const bytes = (w, h, bitDepth) => (w * h * bitDepth) / 8;
console.log(bytes(1920, 1080, 24)); // 6220800`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'zahlen-umrechnen',
      title: 'Zahlensysteme umrechnen',
      prompt: 'Rechne um und notiere den Rechenweg:\n\n1. 202 (dezimal) in Dual und Hexadezimal\n2. 0x3F in Dezimal\n3. 0o755 (oktal) in Dezimal',
      hints: ['Für 202: größte Zweierpotenzen abziehen (128, 64, …).', 'Oktal: Stellenwerte 64, 8 und 1.'],
      solution: '1. 202 = 128 + 64 + 8 + 2 → **1100 1010** → Nibbles 1100 = C, 1010 = A → **0xCA**\n2. 0x3F = 3 × 16 + 15 = **63**\n3. 0o755 = 7 × 64 + 5 × 8 + 5 = 448 + 40 + 5 = **493** (das ist übrigens die Linux-Rechtemaske rwxr-xr-x)'
    },
    {
      id: 'bildgroesse',
      title: 'Speicherbedarf einer Bildserie',
      prompt: 'Eine Überwachungskamera speichert pro Sekunde ein unkomprimiertes Bild mit 1280 × 720 Pixeln und 24 Bit Farbtiefe. Wie viel Speicher (in GB, dezimal) fällt pro Stunde an?',
      hints: ['Erst ein Bild berechnen, dann mit 3.600 multiplizieren.'],
      solution: 'Ein Bild: 1280 × 720 × 3 Byte = **2.764.800 Byte**.\nPro Stunde: 2.764.800 × 3.600 = 9.953.280.000 Byte ≈ **9,95 GB**. Genau deshalb komprimieren Kameras (z. B. H.264/H.265).'
    },
    {
      id: 'uebertragungszeit',
      title: 'Backup über das Netzwerk',
      prompt: 'Ein nächtliches Backup von 250 GB (dezimal) soll über eine 1-Gbit/s-Leitung auf ein NAS übertragen werden. Wegen Protokoll-Overhead stehen effektiv nur 80 % der Bandbreite zur Verfügung. Wie lange dauert die Übertragung?',
      hints: ['Effektive Rate: 0,8 × 1 Gbit/s = 800 Mbit/s.', 'Datenmenge in Bit umrechnen: × 8.'],
      solution: '250 × 10⁹ Byte × 8 = 2 × 10¹² Bit.\n2 × 10¹² Bit ÷ 800 × 10⁶ Bit/s = **2.500 s ≈ 41 min 40 s**.'
    },
    {
      id: 'festplatte-anzeige',
      title: 'Warum zeigt Windows weniger an?',
      prompt: 'Ein Kunde beschwert sich: Seine neue 2-TB-SSD zeigt in Windows nur rund 1,81 TB an. Erkläre die Abweichung rechnerisch.',
      solution: 'Der Hersteller rechnet dezimal: 2 TB = 2 × 10¹² Byte. Windows teilt durch 1.024⁴ und schreibt trotzdem „TB“: 2 × 10¹² ÷ 1.099.511.627.776 ≈ **1,82 TiB**. Es fehlt also nichts, nur die Einheiten unterscheiden sich. (Etwas Platz belegt zusätzlich das Dateisystem.)'
    }
  ],
  quiz: [
    {
      question: 'Wie viele verschiedene Werte kann ein Byte darstellen?',
      options: ['128', '255', '256', '512'],
      correct: 2,
      explanation: '8 Bit mit je zwei Zuständen ergeben 2⁸ = 256 Werte, also 0 bis 255.'
    },
    {
      question: 'Welche Hexadezimalzahl entspricht der Dualzahl 1111 0010?',
      options: ['0xF2', '0x2F', '0xE2', '0xF4'],
      correct: 0,
      explanation: '1111 = F und 0010 = 2, also 0xF2 (dezimal 242).'
    },
    {
      question: 'Wie viele Byte sind 1 MiB?',
      options: ['1.000.000', '1.024.000', '1.048.576', '1.000.024'],
      correct: 2,
      explanation: '1 MiB = 1.024 × 1.024 Byte = 1.048.576 Byte. 1 MB (dezimal) wären 1.000.000 Byte.'
    },
    {
      question: 'Wie viele Bit werden mindestens benötigt, um 600 verschiedene Artikelnummern zu kodieren?',
      options: ['9', '10', '11', '600'],
      correct: 1,
      explanation: '2⁹ = 512 reicht nicht, 2¹⁰ = 1.024 reicht. Also 10 Bit.'
    },
    {
      question: 'Welcher Speicher verliert seinen Inhalt, wenn der Strom ausfällt?',
      options: ['SSD', 'RAM', 'HDD', 'USB-Stick'],
      correct: 1,
      explanation: 'RAM ist flüchtig. SSD, HDD und USB-Sticks behalten ihre Daten ohne Strom.'
    },
    {
      question: 'Was kennzeichnet die Von-Neumann-Architektur?',
      options: [
        'Getrennte Speicher für Befehle und Daten',
        'Befehle und Daten liegen im selben Speicher und teilen sich den Bus',
        'Jeder Kern hat einen eigenen Arbeitsspeicher',
        'Sie kommt ohne Steuerwerk aus'
      ],
      correct: 1,
      explanation: 'Gemeinsamer Speicher und gemeinsamer Bus sind das Kennzeichen. Getrennte Speicher beschreiben die Harvard-Architektur.'
    },
    {
      question: 'Wie lange dauert die Übertragung von 1 GB (dezimal) über eine Leitung mit 50 Mbit/s (ohne Overhead)?',
      options: ['20 s', '80 s', '160 s', '8 s'],
      correct: 2,
      explanation: '1 × 10⁹ Byte × 8 = 8 × 10⁹ Bit ÷ 50 × 10⁶ Bit/s = 160 s.'
    }
  ],
  relatedLabs: [
    { id: 'transfer_time_lab', label: 'Übertragungszeit-Rechner' },
    { id: 'ieee754_lab', label: 'Gleitkommazahlen (IEEE 754)' },
    { id: 'cpu_architecture_lab', label: 'CPU-Architektur' }
  ],
  sources: [
    { title: 'IEC 80000-13 / Binärpräfixe – Physikalisch-Technische Bundesanstalt: Einheiten', url: 'https://www.ptb.de/cms/presseaktuelles/journalisten/nachrichten-presseinformationen/die-neuen-si-einheiten.html', note: 'SI-Präfixe sind dezimal' },
    { title: 'Wikipedia: Binärpräfix', url: 'https://de.wikipedia.org/wiki/Bin%C3%A4rpr%C3%A4fix', note: 'Übersicht KiB, MiB, GiB und die Herstellerdifferenz' },
    { title: 'Wikipedia: Zweierkomplement', url: 'https://de.wikipedia.org/wiki/Zweierkomplement' },
    { title: 'Wikipedia: Von-Neumann-Architektur', url: 'https://de.wikipedia.org/wiki/Von-Neumann-Architektur' },
    { title: 'MDN: Number.prototype.toString()', url: 'https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/toString' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: IT-Systemtechnik (Grundlagen, Speichermedien, Bild- und Audiodateien)', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
