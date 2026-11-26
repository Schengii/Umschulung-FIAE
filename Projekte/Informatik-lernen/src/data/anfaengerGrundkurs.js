// Ausbau des Einsteiger-Kurses Teil 1 (Kapitel 1 bis 12): ausführlicher Theorietext, Grafik, kleine Aufgaben, Quellen.
// Schlüssel = ID des Kapitels in anfaengerGuides.js. Format je Kapitel:
//   readTime: 'N Min', bild: { src (Datei in assets/topics), alt, caption }, theorie: Markdown (MarkdownView),
//   aufgaben: [{ id, frage, hinweis?, loesung }], sources: [{ label, url }].
import { GRUNDKURS_EXTRA_TEIL_2 } from './anfaengerGrundkurs2';

const GRUNDKURS_EXTRA_TEIL_1 = {
  eva_prinzip: {
    readTime: '9 Min',
    bild: {
      src: 'eva-prinzip.svg',
      alt: 'EVA-Prinzip: Eingabe, Verarbeitung und Ausgabe mit Beispielgeräten und Speicher',
      caption: 'Jeder Computer folgt dem EVA-Prinzip. Der Speicher hält Daten dauerhaft bereit.'
    },
    theorie: `
## Was ist ein Computer?

Ein **Computer** (deutsch: Rechner) ist eine Maschine, die Daten nach einer Vorschrift verarbeitet. Die Vorschrift heißt **Programm**. Dieselbe Maschine kann mal Texte schreiben, mal Musik abspielen, mal ein Spiel berechnen, je nachdem, welches Programm läuft. Genau das unterscheidet sie von einem Taschenrechner, der nur rechnen kann, oder einer Kaffeemaschine, die nur Kaffee kocht.

Zwei Wörter solltest du von Anfang an unterscheiden:

- **Daten** sind Zeichen, Zahlen oder Signale ohne Bedeutung, zum Beispiel „37“.
- **Information** entsteht, wenn Daten eine Bedeutung bekommen: „37 Grad Körpertemperatur“.

Ein Computer verarbeitet Daten. Ob daraus eine Information wird, entscheidet der Mensch, der sie liest.

## Hardware und Software

- **Hardware** ist alles, was man anfassen kann: Gehäuse, Prozessor, Speicher, Tastatur, Bildschirm.
- **Software** sind die Programme und Daten, die auf der Hardware laufen. Man kann sie nicht anfassen, nur nutzen.

Beides gehört zusammen wie Musikinstrument und Notenblatt: Ohne Noten klingt nichts, ohne Instrument auch nicht.

## Computer gibt es in vielen Formen

| Art | Beispiele | Besonderheit |
| :--- | :--- | :--- |
| Desktop-PC | Rechner unter dem Schreibtisch | leistungsstark, gut erweiterbar |
| Laptop | Notebook, Ultrabook | Akku, Bildschirm und Tastatur eingebaut |
| Smartphone, Tablet | Handy, iPad | Touchscreen, Mobilfunk, viele Sensoren |
| Server | Rechner im Rechenzentrum | läuft rund um die Uhr, bedient viele Nutzer |
| Eingebettetes System | Waschmaschine, Auto, Router, Smartwatch | kleiner Computer fest in einem Gerät |
| Supercomputer | Wetter- und Klimasimulation | Tausende Prozessoren arbeiten zusammen |

Du nutzt wahrscheinlich ständig Computer, ohne es zu merken: Fast jedes elektronische Gerät enthält einen.

## Das EVA-Prinzip

Alle diese Geräte arbeiten nach demselben Grundmuster, dem **EVA-Prinzip**:

1. **Eingabe**: Daten kommen in den Computer hinein.
2. **Verarbeitung**: Der Prozessor rechnet, vergleicht und entscheidet.
3. **Ausgabe**: Das Ergebnis kommt wieder heraus.

### Eingabe

| Eingabegerät | Was es liefert |
| :--- | :--- |
| Tastatur | Buchstaben, Zahlen, Befehle |
| Maus, Touchpad | Position und Klicks |
| Touchscreen | Berührungen und Wischbewegungen |
| Mikrofon | Sprache und Geräusche |
| Kamera, Scanner | Bilder und Dokumente |
| Sensoren | Temperatur, Lage, Bewegung, Standort |

### Verarbeitung

Hier arbeiten **Prozessor (CPU)** und **Arbeitsspeicher (RAM)** zusammen. Der Arbeitsspeicher hält das Programm und die Daten bereit, mit denen gerade gearbeitet wird. Der Prozessor holt sich Befehle daraus, führt sie aus und legt Ergebnisse wieder ab. Mehr dazu im nächsten Kapitel.

Dass Programme und Daten im selben Speicher liegen, geht auf die **Von-Neumann-Architektur** (1945) zurück. Sie ist bis heute das Grundmodell fast aller Rechner.

### Ausgabe

| Ausgabegerät | Was es ausgibt |
| :--- | :--- |
| Bildschirm, Beamer | Bilder, Text, Video |
| Lautsprecher, Kopfhörer | Ton |
| Drucker | Ausdrucke auf Papier |
| Lämpchen, Vibration | einfache Rückmeldungen |

Ein **Touchscreen** ist Eingabe- und Ausgabegerät zugleich.

### Der Speicher als Gedächtnis

Ergebnisse, die erhalten bleiben sollen, wandern in den **dauerhaften Speicher** (SSD oder Festplatte). Er hält Daten auch ohne Strom. Der Arbeitsspeicher verliert dagegen beim Ausschalten alles, deshalb sind Dokumente, die du nicht gespeichert hast, nach einem Stromausfall weg.

## EVA im Alltag

| Situation | Eingabe | Verarbeitung | Ausgabe |
| :--- | :--- | :--- | :--- |
| Taschenrechner | Tasten 7, +, 5 | Rechenwerk addiert | Anzeige 12 |
| Geldautomat | Karte und PIN | Bank prüft, Betrag wird abgebucht | Geldscheine und Beleg |
| Navi-App | Zielort und GPS-Position | Berechnung der Route | Karte und Sprachansage |
| Sprachassistent | gesprochener Satz | Spracherkennung, Antwort suchen | gesprochene Antwort |

## Vom Tastendruck zum Buchstaben

Was passiert, wenn du die Taste **A** drückst?

1. Die Tastatur meldet dem Computer, welche Taste gedrückt wurde (Eingabe).
2. Das Betriebssystem übergibt die Meldung an das Programm, das gerade im Vordergrund ist.
3. Das Programm wandelt den Tastencode in das Zeichen A um und legt es im Arbeitsspeicher ab (Verarbeitung).
4. Die Grafikkarte zeichnet den Buchstaben auf den Bildschirm (Ausgabe).

Das alles dauert nur Bruchteile einer Sekunde.

## Typische Missverständnisse

- **Der Bildschirm ist nicht der Computer.** Er ist nur ein Ausgabegerät. Der eigentliche Rechner steckt im Gehäuse oder hinter dem Display.
- **Computer denken nicht.** Sie führen genau die Befehle aus, die ihnen ein Mensch (oder ein Programm) gibt, dafür aber sehr schnell und fehlerfrei.
- **Mehr Speicher heißt nicht automatisch schneller.** Viel SSD-Platz sagt nichts über die Rechengeschwindigkeit.

> **Merksatz:** Eingabe, Verarbeitung, Ausgabe: Wenn du bei einem Gerät diese drei Teile findest, hast du seine Funktionsweise verstanden.
`,
    aufgaben: [
      {
        id: 'eva-zuordnen',
        frage: 'Ordne zu, ob es sich um ein Eingabe- oder Ausgabegerät handelt: Scanner, Drucker, Webcam, Kopfhörer, Mikrofon, Beamer. Welches Gerät kann beides?',
        hinweis: 'Frage dich: Kommen Daten in den Computer hinein oder gehen sie heraus?',
        loesung: 'Eingabe: **Scanner, Webcam, Mikrofon** (sie liefern Daten an den Computer). Ausgabe: **Drucker, Kopfhörer, Beamer** (sie geben Ergebnisse aus). Beides kann ein **Touchscreen**: Er zeigt Bilder (Ausgabe) und nimmt Berührungen entgegen (Eingabe).'
      },
      {
        id: 'eva-geldautomat',
        frage: 'Beschreibe die Abhebung am Geldautomaten nach dem EVA-Prinzip. Was ist Eingabe, Verarbeitung, Ausgabe?',
        loesung: '**Eingabe**: Karte, PIN und gewünschter Betrag. **Verarbeitung**: Der Automat prüft die PIN, fragt bei der Bank das Guthaben ab, bucht den Betrag ab und steuert den Geldausgabeschacht. **Ausgabe**: Geldscheine, Kartenrückgabe, Beleg auf Bildschirm oder Papier.'
      },
      {
        id: 'eva-stromausfall',
        frage: 'Du schreibst seit einer Stunde an einem Text und speicherst nie. Dann fällt der Strom aus. Warum ist der Text weg, und was hättest du tun können?',
        hinweis: 'Denke an den Unterschied zwischen Arbeitsspeicher und SSD/Festplatte.',
        loesung: 'Der Text lag nur im **Arbeitsspeicher (RAM)**, der flüchtig ist: Ohne Strom verliert er seinen Inhalt. Durch **Speichern** wird der Text auf die SSD oder Festplatte geschrieben, die Daten auch ohne Strom behält. Tipp: regelmäßig speichern (Strg + S) und die automatische Sicherung des Programms einschalten.'
      }
    ],
    sources: [
      { label: 'Wikipedia: Von-Neumann-Architektur', url: 'https://de.wikipedia.org/wiki/Von-Neumann-Architektur' },
      { label: 'Wikipedia: Arbeitsspeicher', url: 'https://de.wikipedia.org/wiki/Arbeitsspeicher' }
    ]
  },

  cpu_brain: {
    readTime: '9 Min',
    bild: {
      src: 'cpu-aufbau.svg',
      alt: 'Aufbau der CPU mit Steuerwerk, Rechenwerk, Registern und Cache sowie der Befehlszyklus Fetch, Decode, Execute',
      caption: 'In der CPU arbeiten Steuerwerk und Rechenwerk Befehl für Befehl ab. Daten holt sie aus dem Arbeitsspeicher.'
    },
    theorie: `
## Wofür braucht ein Computer einen Prozessor?

Der **Prozessor** oder die **CPU** (*Central Processing Unit*, zentrale Recheneinheit) ist das Bauteil, das Programme tatsächlich ausführt. Ein Programm besteht aus unzähligen winzigen **Befehlen** wie „lade diese Zahl“, „addiere zwei Zahlen“, „vergleiche sie“ oder „springe zu Befehl Nummer 40“. Die CPU arbeitet diese Befehle nacheinander ab.

Jeder Prozessor versteht nur eine feste Menge solcher Befehle, seinen **Befehlssatz**. Gängig sind zwei Familien: **x86-64** (die meisten Windows- und Linux-PCs) und **ARM** (Smartphones, Tablets und viele neuere Laptops). Ein Programm muss für den Befehlssatz seines Prozessors übersetzt sein.

## Die Bausteine der CPU

| Baustein | Aufgabe | Küchen-Vergleich |
| :--- | :--- | :--- |
| **Steuerwerk** | Holt Befehle, entschlüsselt sie und verteilt Aufgaben | Koch, der das Rezept liest |
| **Rechenwerk (ALU)** | Rechnet (plus, minus, mal, geteilt) und vergleicht | Herd und Messer |
| **Register** | Winzige, blitzschnelle Speicherplätze direkt in der CPU | Schneidebrett |
| **Cache** | Schneller Zwischenspeicher für häufig genutzte Daten | Gewürzregal in Griffweite |
| **Arbeitsspeicher (RAM)** | Außerhalb der CPU, hält Programme und Daten | Kühlschrank |

## Der Befehlszyklus

Jeder Befehl durchläuft dieselben drei Schritte:

1. **Fetch (holen)**: Das Steuerwerk holt den nächsten Befehl aus dem Speicher.
2. **Decode (entschlüsseln)**: Es erkennt, was der Befehl bedeutet und welche Daten er braucht.
3. **Execute (ausführen)**: Das Rechenwerk oder eine andere Einheit führt den Befehl aus.

Danach beginnt der Kreislauf mit dem nächsten Befehl. Ein **Befehlszähler** merkt sich, welcher Befehl als Nächstes dran ist.

### Beispiel: 5 + 3

Wie rechnet die CPU diese einfache Aufgabe? In Gedanken sieht ein solches Mini-Programm so aus:

\`\`\`text
1. LADE 5 in Register A
2. LADE 3 in Register B
3. ADDIERE A und B, Ergebnis in Register A
4. SPEICHERE Register A im Arbeitsspeicher
\`\`\`

Vier Befehle, jeder durchläuft Fetch, Decode, Execute. Echte Programme bestehen aus Milliarden solcher Schritte.

## Takt, Kerne und Cache

### Taktfrequenz

Die CPU arbeitet im **Takt** einer Uhr. Die **Taktfrequenz** wird in **Hertz (Hz)** gemessen: 1 GHz bedeutet eine Milliarde Takte pro Sekunde. Bei 3,5 GHz sind das 3,5 Milliarden Takte pro Sekunde. Die Frequenz allein sagt aber nicht, wie schnell ein Prozessor ist, denn manche Prozessoren erledigen in einem Takt mehr als andere.

### Mehrere Kerne

Moderne Prozessoren enthalten mehrere **Kerne**. Jeder Kern ist eine vollständige Recheneinheit. Ein Prozessor mit vier Kernen kann vier Aufgaben gleichzeitig bearbeiten, zum Beispiel Musik abspielen, im Browser surfen, Dateien herunterladen und ein Dokument speichern. Programme profitieren aber nur dann von vielen Kernen, wenn sie ihre Arbeit aufteilen können.

### Cache

Der Arbeitsspeicher ist für die CPU vergleichsweise langsam. Deshalb hat sie kleine, sehr schnelle Zwischenspeicher, die **Caches**, direkt auf dem Chip. Wiederkehrende Daten und Befehle liegen dort bereit und müssen nicht jedes Mal aus dem RAM geholt werden.

## Wärme und Kühlung

Beim Rechnen entsteht Wärme. Deshalb sitzen auf Prozessoren **Kühlkörper** und **Lüfter**. Wird die CPU zu heiß, **drosselt** sie ihren Takt, damit nichts kaputtgeht. Der Computer wird dann spürbar langsamer. Staub in den Lüftern und ein zugestellter Laptop-Lüftungsschlitz sind häufige Ursachen.

## CPU, GPU und Co.

- **CPU**: Allrounder, gut für viele verschiedene Aufgaben nacheinander.
- **GPU** (Grafikprozessor): Hat sehr viele einfache Recheneinheiten und ist gut für Bilder, Spiele und KI-Berechnungen, bei denen viel gleichzeitig zu berechnen ist.
- **Chips in Smartphones** vereinen CPU, GPU und weitere Einheiten auf einem einzigen Chip (*System on a Chip*, SoC).

> **Merksatz:** Die CPU ist wie ein extrem schneller, aber völlig wörtlich arbeitender Koch: Sie führt jeden Befehl exakt aus, ohne mitzudenken.
`,
    aufgaben: [
      {
        id: 'cpu-takte',
        frage: 'Eine CPU läuft mit 2 GHz. Wie viele Takte macht sie in einer Millisekunde (ein Tausendstel einer Sekunde)?',
        hinweis: '1 GHz sind eine Milliarde Takte pro Sekunde.',
        loesung: '2 GHz = 2 Milliarden Takte pro Sekunde. Ein Tausendstel davon: 2.000.000.000 / 1.000 = **2.000.000 Takte** (2 Millionen) pro Millisekunde.'
      },
      {
        id: 'cpu-sieben-plus-fuenf',
        frage: 'Schreibe wie im Beispiel ein Mini-Programm in vier Schritten, mit dem die CPU 7 + 5 rechnet und das Ergebnis speichert.',
        loesung: '1. LADE 7 in Register A\n2. LADE 5 in Register B\n3. ADDIERE A und B, Ergebnis in Register A (A ist jetzt 12)\n4. SPEICHERE Register A im Arbeitsspeicher\n\nJeder dieser Befehle durchläuft Fetch, Decode und Execute.'
      },
      {
        id: 'cpu-laptop-langsam',
        frage: 'Dein Laptop wird nach einer Stunde Spielen spürbar langsamer und der Lüfter dröhnt. Nenne eine mögliche Ursache und zwei Gegenmaßnahmen.',
        loesung: 'Ursache: Die CPU wird zu heiß und **drosselt** ihren Takt. Gegenmaßnahmen: Lüftungsschlitze freihalten (nicht auf Decke oder Kissen stellen), Staub aus den Lüftern entfernen, eine Unterlage mit Luftzirkulation oder einen externen Lüfter nutzen, Grafik- und Leistungseinstellungen im Spiel senken.'
      }
    ],
    sources: [
      { label: 'Wikipedia: Hauptprozessor (CPU)', url: 'https://de.wikipedia.org/wiki/Hauptprozessor' },
      { label: 'Wikipedia: Von-Neumann-Architektur', url: 'https://de.wikipedia.org/wiki/Von-Neumann-Architektur' }
    ]
  },

  binary_system: {
    readTime: '10 Min',
    bild: {
      src: 'binaer-stellenwerte.svg',
      alt: 'Acht Stellenwerte eines Bytes von 128 bis 1, der Binärcode 01000001 ergibt 65, im ASCII-Code der Buchstabe A',
      caption: 'Nur die eingeschalteten Stellen zählen: 64 + 1 = 65, im ASCII-Code ein großes A.'
    },
    theorie: `
## Warum nur Nullen und Einsen?

Im Inneren eines Computers fließt Strom durch winzige Schalter, **Transistoren**. Ein Schalter kennt zwei Zustände: an oder aus. Zwei Zustände lassen sich besonders zuverlässig unterscheiden, selbst wenn die Spannung leicht schwankt. Deshalb rechnet der Computer im **Binärsystem** (Zweiersystem) mit nur zwei Ziffern: **0** und **1**.

- **Bit** (*binary digit*): eine einzige Stelle, 0 oder 1. Kleinste Informationseinheit.
- **Byte**: acht Bit. Ein Byte kann 2 hoch 8 = **256** verschiedene Werte annehmen (0 bis 255).

## Das Dezimalsystem als Vorbild

Unser normales Zahlensystem hat zehn Ziffern. Die Stelle bestimmt den Wert: In **345** stehen 3 Hunderter, 4 Zehner und 5 Einer, also 3 · 100 + 4 · 10 + 5 · 1. Jede Stelle ist **zehnmal** so viel wert wie die rechts davon.

Im Binärsystem funktioniert es genauso, nur ist jede Stelle **doppelt** so viel wert wie die rechts davon: 1, 2, 4, 8, 16, 32, 64, 128 ...

## Binär in Dezimal umrechnen

Addiere die Stellenwerte aller Stellen, an denen eine **1** steht.

| Binär | Rechnung | Dezimal |
| :--- | :--- | :--- |
| 101 | 4 + 0 + 1 | 5 |
| 1101 | 8 + 4 + 0 + 1 | 13 |
| 1111 1111 | 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 | 255 |
| 0100 0001 | 64 + 1 | 65 |

## Dezimal in Binär umrechnen

Teile die Zahl immer wieder durch 2 und schreibe jeweils den **Rest** auf. Die Reste von unten nach oben gelesen ergeben die Binärzahl.

Beispiel **13**:

| Rechnung | Rest |
| :--- | :---: |
| 13 : 2 = 6 | 1 |
| 6 : 2 = 3 | 0 |
| 3 : 2 = 1 | 1 |
| 1 : 2 = 0 | 1 |

Von unten nach oben gelesen: **1101**. Probe: 8 + 4 + 1 = 13.

> **Tipp:** Eine Binärzahl mit angehängter Null verdoppelt ihren Wert, genau wie im Dezimalsystem eine angehängte Null den Wert verzehnfacht: 101 ist 5, 1010 ist 10.

## Das Hexadezimalsystem

Lange Binärzahlen sind schwer zu lesen. Deshalb schreiben Fachleute sie oft **hexadezimal** (Sechzehnersystem). Es hat 16 Ziffern: 0 bis 9 und die Buchstaben **A bis F** für 10 bis 15. Vier Bit ergeben genau eine Hexziffer. So wird aus \`1111 1111\` kurz **FF** (255). Du begegnest Hexzahlen bei Farben in Webseiten (\`#FF0000\` ist Rot) und bei Netzwerkadressen.

## Wie werden Buchstaben gespeichert?

Auch Buchstaben sind für den Computer nur Zahlen. Eine **Zeichentabelle** legt fest, welche Zahl zu welchem Zeichen gehört. Der Klassiker ist der **ASCII-Code** mit 128 Zeichen: das große **A** ist 65, **B** ist 66, das kleine **a** ist 97, die Ziffer **0** ist 48.

ASCII kennt keine Umlaute. Heute verwendet man **Unicode** mit der Kodierung **UTF-8**. Damit lassen sich alle Schriften der Welt und Emojis darstellen. Die ASCII-Zeichen bleiben darin unverändert.

## Wie werden Bilder gespeichert?

Ein Bild besteht aus **Pixeln**, den Bildpunkten. Jeder Pixel hat eine Farbe, meist aus den drei Anteilen **Rot, Grün und Blau (RGB)**. Jeder Anteil bekommt ein Byte (0 bis 255). Ein Pixel braucht also 3 Byte. Ein Foto mit 12 Megapixeln hätte unkomprimiert 12 Millionen mal 3 Byte, das sind **36 Megabyte**. Durch **Komprimierung** (JPG) schrumpft es auf wenige Megabyte.

## Speichergrößen

Mehrere Byte bekommen Vorsilben, die sich an Tausender-Schritten orientieren:

| Einheit | Größe | Faustwert |
| :--- | :--- | :--- |
| 1 Kilobyte (KB) | 1.000 Byte | wenige Zeilen Text |
| 1 Megabyte (MB) | 1.000 KB | ein Foto oder ein Lied |
| 1 Gigabyte (GB) | 1.000 MB | ein Film |
| 1 Terabyte (TB) | 1.000 GB | eine große Festplatte |

Daneben gibt es die **Binärpräfixe** (KiB, MiB, GiB) mit 1.024 statt 1.000 als Schritt. Betriebssysteme zeigen deshalb oft etwas kleinere Zahlen an als die Herstellerangabe auf der Packung: Eine „1-TB-Festplatte“ hat 1.000.000.000.000 Byte, was in Windows als etwa 931 GB erscheint.

> **Merksatz:** Klein b ist Bit, groß B ist Byte. Ein Byte hat 8 Bit. Internetgeschwindigkeit wird in Bit pro Sekunde, Dateigrößen werden in Byte angegeben.
`,
    aufgaben: [
      {
        id: 'binaer-nach-dezimal',
        frage: 'Rechne in Dezimalzahlen um: a) 1010  b) 1100100  c) 0001 0000',
        hinweis: 'Schreibe die Stellenwerte 1, 2, 4, 8, 16, 32, 64 von rechts nach links darüber und addiere dort, wo eine 1 steht.',
        loesung: 'a) 8 + 2 = **10**\nb) 64 + 32 + 4 = **100**\nc) 16 = **16**'
      },
      {
        id: 'dezimal-nach-binaer',
        frage: 'Wandle in Binärzahlen um: a) 9  b) 20  c) 37. Mache jeweils die Probe.',
        hinweis: 'Teile durch 2 und notiere die Reste, oder zerlege die Zahl in Zweierpotenzen.',
        loesung: 'a) 9 = 8 + 1 = **1001**\nb) 20 = 16 + 4 = **10100**\nc) 37 = 32 + 4 + 1 = **100101**\n\nProbe c): 32 + 0 + 0 + 4 + 0 + 1 = 37.'
      },
      {
        id: 'ascii-buchstabe',
        frage: 'Der Buchstabe A hat im ASCII-Code den Wert 65 (01000001). Welchen Wert und welchen Binärcode hat dann B? Und wie viele Byte belegt das Wort „HALLO“ in ASCII?',
        loesung: 'B folgt auf A, also 66 = 64 + 2 = **01000010**. Jeder ASCII-Buchstabe belegt 1 Byte, „HALLO“ hat 5 Buchstaben, also **5 Byte** (40 Bit).'
      },
      {
        id: 'foto-groesse',
        frage: 'Ein Bild hat 1.000 mal 500 Pixel und speichert jeden Pixel mit 3 Byte (RGB). Wie groß ist es unkomprimiert in Kilobyte und in Megabyte?',
        loesung: '1.000 · 500 = 500.000 Pixel. Mal 3 Byte = 1.500.000 Byte = **1.500 KB = 1,5 MB**.'
      }
    ],
    sources: [
      { label: 'Wikipedia: Dualsystem', url: 'https://de.wikipedia.org/wiki/Dualsystem' },
      { label: 'RFC 20: ASCII format for network interchange', url: 'https://www.rfc-editor.org/rfc/rfc20' },
      { label: 'Wikipedia: American Standard Code for Information Interchange', url: 'https://de.wikipedia.org/wiki/American_Standard_Code_for_Information_Interchange' }
    ]
  },

  internet_dns: {
    readTime: '10 Min',
    bild: {
      src: 'dns-hierarchie.svg',
      alt: 'DNS-Auflösung vom Browser über den Resolver, Root-, TLD- und autoritativen Nameserver zurück zur IP-Adresse',
      caption: 'Der DNS-Resolver fragt Stufe für Stufe nach, bis er die IP-Adresse kennt.'
    },
    theorie: `
## Das Internet: ein Netz aus Netzen

Das **Internet** ist kein einzelnes Gerät und keine Firma, sondern ein weltweiter Verbund vieler einzelner Netzwerke: Heimnetze, Firmennetze, Netze von Providern und Universitäten. Alle sprechen dieselbe „Sprache“, die **Internetprotokolle**, und können deshalb Daten austauschen. Die Wurzeln liegen im **ARPANET**, das in den späten 1960er-Jahren in den USA entstand.

**Wichtig:** Internet und Web sind nicht dasselbe.

| Begriff | Bedeutung |
| :--- | :--- |
| **Internet** | die technische Infrastruktur: Kabel, Router, Protokolle |
| **World Wide Web (WWW)** | ein Dienst im Internet: Webseiten, abrufbar per Browser |
| **Weitere Dienste** | E-Mail, Messenger, Online-Spiele, Videotelefonie, Streaming |

## Datenpakete

Daten gehen nicht als ein großer Block durchs Netz. Sie werden in viele kleine **Pakete** zerlegt. Jedes Paket trägt einen Adressaufkleber mit **Absender** und **Empfänger** und nimmt auf dem Weg die jeweils günstigste Route. Am Ziel werden die Pakete wieder in die richtige Reihenfolge gebracht. Geht eines verloren, wird es neu angefordert. Dieses Zusammenspiel regelt das Protokoll **TCP**.

Das ist wie bei einem Umzug, bei dem die Möbel auf mehrere nummerierte Kartons verteilt und mit verschiedenen Fahrzeugen zum neuen Haus gebracht werden. Dort setzt man alles nach den Nummern wieder zusammen.

## IP-Adressen

Damit Pakete ihr Ziel finden, braucht jedes Gerät im Netz eine Adresse, die **IP-Adresse**.

| Version | Aufbau | Beispiel |
| :--- | :--- | :--- |
| **IPv4** | 32 Bit, vier Zahlen von 0 bis 255 durch Punkte getrennt | 192.0.2.17 |
| **IPv6** | 128 Bit, acht Gruppen aus Hexzahlen durch Doppelpunkte getrennt | 2001:db8::1 |

IPv4 bietet rund 4,3 Milliarden Adressen (2 hoch 32). Das reicht für die vielen Geräte der Welt nicht mehr aus. Deshalb wurde **IPv6** entwickelt, mit unvorstellbar vielen Adressen. Beide Versionen laufen heute nebeneinander.

## Router

Ein **Router** verbindet Netzwerke und entscheidet bei jedem Paket, in welche Richtung es als Nächstes geht. Zwischen deinem Gerät und dem Ziel liegen meist viele Router, eine Art Kette von Postämtern. Zu Hause ist der Router das Gerät, das dein Heimnetz mit dem Internet deines **Providers** (Internetanbieters) verbindet.

## DNS: Namen statt Zahlen

Wir merken uns Namen wie *wikipedia.org* leichter als Zahlen. Computer brauchen aber IP-Adressen. Das **Domain Name System (DNS)** übersetzt Namen in Adressen. Es funktioniert als verteiltes Telefonbuch:

1. Dein Browser fragt den **DNS-Resolver** (meist im Router oder beim Provider).
2. Kennt der Resolver die Antwort nicht, fragt er einen **Root-Nameserver**. Der kennt die Server für die Endungen wie .de oder .org.
3. Der **Server der Endung (TLD)** kennt die Server der einzelnen Domains.
4. Der **Nameserver der Domain** liefert die IP-Adresse.
5. Der Resolver gibt sie dem Browser und merkt sie sich eine Zeit lang (Cache).

### Aufbau eines Namens

In **www.beispiel.de** liest man von rechts nach links: **.de** ist die Top-Level-Domain, **beispiel** die Domain, **www** die Subdomain. Eine vollständige Internetadresse (URL) wie \`https://www.beispiel.de/seite.html\` nennt zusätzlich das Protokoll (https) und den Pfad zur Datei.

## Client und Server

Im Internet fragt meist ein **Client** (dein Gerät oder Browser) bei einem **Server** nach Daten. Der Server ist ein Computer, der solche Anfragen rund um die Uhr beantwortet. Beim Abruf einer Webseite ist dein Browser der Client, der Rechner des Betreibers der Server.

## Kleine Werkzeuge zum Ausprobieren

Diese Befehle kannst du in der Eingabeaufforderung (Windows) oder im Terminal ausprobieren:

\`\`\`text
ping beispiel.de          testet, ob ein Rechner antwortet und wie schnell
nslookup beispiel.de      zeigt die IP-Adresse zu einem Namen
tracert beispiel.de       zeigt die Router auf dem Weg (Linux/macOS: traceroute)
\`\`\`

## Geschwindigkeit: Bandbreite und Latenz

- **Bandbreite**: wie viele Daten pro Sekunde durch die Leitung passen (in Mbit/s). Entscheidend für große Downloads und Videos.
- **Latenz** (Ping): wie lange ein einzelnes Paket hin und zurück braucht (in Millisekunden). Entscheidend für Online-Spiele und Videotelefonate.

> **Merksatz:** Name eintippen, DNS liefert die Adresse, die Pakete wandern über Router zum Server, und die Antwort kommt auf demselben Weg zurück.
`,
    aufgaben: [
      {
        id: 'ip-gueltig',
        frage: 'Welche dieser Adressen sind gültige IPv4-Adressen? a) 192.168.1.20  b) 10.0.0.256  c) 172.16.5  d) 8.8.8.8',
        hinweis: 'IPv4 hat genau vier Zahlen, jede liegt zwischen 0 und 255.',
        loesung: '**a) und d)** sind gültig. b) ist ungültig, weil 256 größer als 255 ist. c) ist ungültig, weil nur drei Zahlen vorhanden sind.'
      },
      {
        id: 'dns-reihenfolge',
        frage: 'Bringe die Schritte der Namensauflösung in die richtige Reihenfolge: (A) Nameserver der Domain nennt die IP-Adresse, (B) Browser fragt den Resolver, (C) Root-Server nennt die Server für .de, (D) Resolver gibt die IP an den Browser, (E) TLD-Server nennt die Server der Domain.',
        loesung: 'Richtige Reihenfolge: **B, C, E, A, D**. Zuerst fragt der Browser den Resolver, dieser fragt Root, dann TLD, dann den Nameserver der Domain, und zuletzt reicht er die Antwort an den Browser weiter.'
      },
      {
        id: 'internet-oder-web',
        frage: 'Welche dieser Dinge gehören zum World Wide Web, welche sind andere Internetdienste? Webseite von Wikipedia, E-Mail, Online-Spiel, Videotelefonat, Online-Shop im Browser.',
        loesung: '**Zum Web** gehören die Wikipedia-Seite und der Online-Shop im Browser (Webseiten per HTTP). **Andere Internetdienste** sind E-Mail, Online-Spiel und Videotelefonat. Sie nutzen zwar das Internet, aber nicht den Browser und HTTP.'
      }
    ],
    sources: [
      { label: 'RFC 791: Internet Protocol (IPv4)', url: 'https://www.rfc-editor.org/rfc/rfc791' },
      { label: 'RFC 1034: Domain Names – Concepts and Facilities', url: 'https://www.rfc-editor.org/rfc/rfc1034' },
      { label: 'RFC 9293: Transmission Control Protocol (TCP)', url: 'https://www.rfc-editor.org/rfc/rfc9293' },
      { label: 'Wikipedia: ARPANET', url: 'https://de.wikipedia.org/wiki/ARPANET' },
      { label: 'W3Schools: What is HTTP', url: 'https://www.w3schools.com/whatis/whatis_http.asp' }
    ]
  },

  betriebssystem: {
    readTime: '9 Min',
    bild: {
      src: 'betriebssystem-schichten.svg',
      alt: 'Schichtenmodell mit Nutzer, Anwendungen, Betriebssystem mit vier Verwaltungsaufgaben, Treibern und Hardware',
      caption: 'Programme sprechen nie direkt mit der Hardware, das Betriebssystem vermittelt.'
    },
    theorie: `
## Wozu braucht man ein Betriebssystem?

Stell dir vor, jedes Programm müsste selbst wissen, wie man eine Festplatte ansteuert, den Bildschirm beschreibt und mit der Tastatur spricht. Jeder Programmierer müsste das für tausende Gerätevarianten neu lösen. Das **Betriebssystem** (BS, englisch *operating system*, OS) nimmt ihnen diese Arbeit ab. Es ist die Schicht zwischen **Hardware** und **Anwendungsprogrammen** und stellt allen Programmen die gleichen einfachen Dienste bereit.

## Die vier Hauptaufgaben

| Aufgabe | Was dahintersteckt |
| :--- | :--- |
| **Prozessverwaltung** | Ein laufendes Programm heißt **Prozess**. Das Betriebssystem verteilt die Rechenzeit der CPU in winzigen Zeitscheiben auf alle Prozesse. Dadurch wirkt es, als liefen sie gleichzeitig (**Multitasking**) |
| **Speicherverwaltung** | Es teilt den Arbeitsspeicher zu und sorgt dafür, dass ein Programm nicht in den Speicher eines anderen schreibt |
| **Dateiverwaltung** | Es organisiert Dateien und Ordner auf SSD oder Festplatte (**Dateisystem**) |
| **Geräteverwaltung** | Es spricht über **Treiber** mit Drucker, Maus, Grafikkarte, WLAN und Co. |

Dazu kommen **Benutzerverwaltung** (Konten, Passwörter, Rechte) und die **Benutzeroberfläche**.

## Der Kern: der Kernel

Der zentrale Teil heißt **Kernel** (Kern). Er läuft mit den höchsten Rechten, steuert direkt die Hardware und überwacht, dass Programme sich an die Regeln halten. Alles, was du als Fenster, Menü und Desktop siehst, liegt darüber.

## Benutzeroberflächen

- **GUI** (*Graphical User Interface*): grafisch mit Fenstern, Symbolen, Maus oder Touch. So bedienen die meisten Menschen ihre Geräte.
- **CLI** (*Command Line Interface*): Eingabe von Textbefehlen in einem Terminal. Fachleute nutzen sie, weil sich damit viele Aufgaben schneller und automatisiert erledigen lassen. Beispiel: \`dir\` (Windows) oder \`ls\` (Linux) listet Dateien auf.

## Treiber

Hardware wird von vielen Herstellern gebaut, jede spricht ein wenig anders. Ein **Treiber** ist ein kleines Programm, das dem Betriebssystem beibringt, wie es mit einem bestimmten Gerät reden muss. Schließt du einen neuen Drucker an, erkennt das Betriebssystem ihn meist selbst und installiert den passenden Treiber.

## Benutzerkonten und Rechte

Moderne Betriebssysteme unterscheiden Benutzer:

- **Standardbenutzer** dürfen ihre eigenen Dateien nutzen und Programme ausführen, aber keine systemweiten Einstellungen ändern.
- **Administratoren** dürfen Programme installieren und das System verändern.

Für den Alltag empfiehlt sich ein Standardkonto: Schadsoftware, die darüber läuft, kann weniger anrichten.

## Was beim Starten passiert

1. Du schaltest ein, die Firmware (UEFI) prüft die Hardware.
2. Der **Bootloader** lädt das Betriebssystem in den Arbeitsspeicher.
3. Der Kernel startet, lädt Treiber und Dienste.
4. Die Anmeldung erscheint, danach der Desktop.

## Bekannte Betriebssysteme

| System | Hersteller | Einsatz | Besonderheit |
| :--- | :--- | :--- | :--- |
| **Windows** | Microsoft | PCs, Laptops | am weitesten verbreitet auf dem Desktop, geschlossener Quelltext |
| **macOS** | Apple | Mac-Computer | eng auf Apple-Hardware abgestimmt |
| **Linux** | Gemeinschaft | Server, Embedded, Desktop | offener Quelltext, viele Varianten (Distributionen wie Ubuntu, Debian) |
| **Android** | Google | Smartphones, Tablets | baut auf dem Linux-Kernel auf |
| **iOS** | Apple | iPhone | geschlossen, nur auf Apple-Geräten |

Die meisten Server im Internet laufen unter Linux. Auch Smart-TVs, Router und Autos enthalten Betriebssysteme, meist auf Linux-Basis.

## Programme beenden und Probleme lösen

Reagiert ein Programm nicht mehr, hilft unter Windows der **Task-Manager**: Er zeigt alle Prozesse und erlaubt es, einen hängenden zu beenden. Du öffnest ihn mit der Tastenkombination **Strg + Umschalt + Esc**. Erst warten, dann beenden, denn ungespeicherte Arbeit geht dabei verloren.

## Updates

Betriebssystem-Updates bringen neue Funktionen und schließen **Sicherheitslücken**. Deshalb sollten automatische Updates eingeschaltet bleiben. Mehr dazu im Kapitel „Sicher im Netz“.

> **Merksatz:** Das Betriebssystem ist der Verwalter. Es verteilt Rechenzeit, Speicher und Dateien, spricht mit der Hardware und sorgt dafür, dass Programme sich nicht ins Gehege kommen.
`,
    aufgaben: [
      {
        id: 'bs-aufgaben-zuordnen',
        frage: 'Ordne diese Vorgänge einer der vier Aufgaben des Betriebssystems zu: a) Eine Datei im Ordner „Bilder“ anlegen  b) Dem Browser Platz im Arbeitsspeicher geben  c) Dem Drucker über den Treiber einen Auftrag schicken  d) Mehrere Programme abwechselnd rechnen lassen.',
        loesung: 'a) **Dateiverwaltung**, b) **Speicherverwaltung**, c) **Geräteverwaltung**, d) **Prozessverwaltung** (Multitasking mit Zeitscheiben).'
      },
      {
        id: 'bs-speichern',
        frage: 'Beschreibe in vier Schritten, was passiert, wenn du in einem Textprogramm auf „Speichern“ klickst. Welche Rollen spielen Programm, Betriebssystem und Hardware?',
        loesung: '1. Das Textprogramm fragt das Betriebssystem: „Bitte lege diese Datei im Ordner Dokumente ab.“ 2. Das Betriebssystem prüft Rechte und Speicherplatz im Dateisystem. 3. Über den Treiber schreibt es die Daten auf die SSD oder Festplatte. 4. Es meldet dem Programm „erledigt“. Das Programm spricht nie direkt mit der Hardware.'
      },
      {
        id: 'bs-programm-haengt',
        frage: 'Ein Programm reagiert seit einer Minute nicht mehr. Wie gehst du vor? Welche Tastenkombination öffnet unter Windows den Task-Manager?',
        loesung: 'Zuerst einige Sekunden bis Minuten **warten**, denn manche Programme rechnen nur lange. Hilft das nicht, öffnest du mit **Strg + Umschalt + Esc** den Task-Manager, wählst das Programm aus und beendest die Aufgabe. Ungespeicherte Änderungen können dabei verloren gehen. Hängt oft derselbe Prozess, hilft ein Neustart oder ein Update.'
      }
    ],
    sources: [
      { label: 'Wikipedia: Betriebssystem', url: 'https://de.wikipedia.org/wiki/Betriebssystem' },
      { label: 'Microsoft Support: Tastenkombinationen in Windows (Task-Manager)', url: 'https://support.microsoft.com/de-de/windows/tastenkombinationen-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec' }
    ]
  },

  programme_algorithmen: {
    readTime: '10 Min',
    bild: {
      src: 'algorithmus-ablauf.svg',
      alt: 'Ablaufplan: Punkte dreimal um 10 erhöhen und prüfen, ob mehr als 25 erreicht sind',
      caption: 'Ein Algorithmus als Ablaufplan: Startwert, Schleife, Bedingung, Ausgabe.'
    },
    theorie: `
## Ein Computer braucht genaue Anweisungen

Ein Computer kann nichts „von selbst“ lösen. Er braucht für jede Aufgabe eine **Schritt-für-Schritt-Anleitung**, so genau, dass kein Raum für Interpretation bleibt. Eine solche Anleitung heißt **Algorithmus**. Das Kochrezept ist das bekannteste Alltagsbeispiel: Zutaten (Eingabe), Arbeitsschritte (Verarbeitung), fertiges Gericht (Ausgabe).

Ein Algorithmus muss bestimmte Eigenschaften erfüllen:

- **Eindeutig**: Jeder Schritt ist klar beschrieben.
- **Endlich**: Er besteht aus endlich vielen Schritten und hört irgendwann auf.
- **Ausführbar**: Jeder Schritt lässt sich tatsächlich durchführen.
- **Allgemein**: Er löst eine ganze Klasse von Aufgaben, nicht nur einen Einzelfall.

Ein **Programm** ist ein in einer **Programmiersprache** aufgeschriebener Algorithmus, den der Computer ausführen kann.

## Beispiel aus dem Alltag: Tee kochen

1. Wasser in den Kocher füllen.
2. Kocher einschalten.
3. Solange das Wasser nicht kocht: warten.
4. Teebeutel in die Tasse hängen.
5. Wenn das Wasser kocht: Wasser in die Tasse gießen.
6. Drei Minuten ziehen lassen.
7. Teebeutel entfernen.

Du erkennst drei Muster, die in fast jedem Algorithmus vorkommen.

## Die drei Bausteine

### 1. Reihenfolge (Sequenz)
Schritte laufen nacheinander ab, von oben nach unten.

### 2. Entscheidung (Bedingung)
Je nach Lage wird ein anderer Weg gewählt: „**Wenn** das Wasser kocht, **dann** gieße es in die Tasse.“ In Programmen heißt das \`if\`.

### 3. Wiederholung (Schleife)
Etwas wird mehrfach getan: „**Solange** das Wasser nicht kocht, warte.“ In Programmen gibt es \`while\` (solange) und \`for\` (so oft wie festgelegt).

## Variablen: benannte Speicherplätze

Damit sich ein Programm Zahlen und Texte merken kann, legt es **Variablen** an. Das sind benannte Speicherplätze, deren Inhalt sich ändern darf:

\`\`\`text
punkte = 0
name = "Mia"
\`\`\`

Jede Variable hat einen **Datentyp**, zum Beispiel Ganzzahl, Kommazahl, Text oder Wahrheitswert (wahr oder falsch). Das Gleichheitszeichen heißt hier **Zuweisung**: „Lege den Wert 0 in die Variable punkte.“ Es ist keine mathematische Gleichung. Deshalb ist \`punkte = punkte + 10\` sinnvoll: Der alte Wert wird gelesen, um 10 erhöht und wieder abgelegt.

## Ein erstes Programm in Python

Hier der Algorithmus aus der Grafik in der Programmiersprache **Python**:

\`\`\`python
punkte = 0
for runde in range(3):
    punkte = punkte + 10
if punkte > 25:
    print("Gewonnen!")
else:
    print("Leider nicht")
\`\`\`

So liest du den Code:

1. \`punkte = 0\`: Die Variable beginnt bei 0.
2. \`for runde in range(3):\` wiederholt den eingerückten Block **dreimal**.
3. \`punkte = punkte + 10\` erhöht den Wert jedes Mal um 10. Nach drei Runden sind es 30.
4. \`if punkte > 25:\` prüft die Bedingung. 30 ist größer als 25, also wird "Gewonnen!" ausgegeben.

In Python steht die **Einrückung** für die Zugehörigkeit zu einem Block. Sie ist Pflicht und Teil der Sprache.

## Der Ablaufplan

Grafisch lässt sich ein Algorithmus als **Programmablaufplan** zeichnen. Ein Oval steht für Start und Ende, ein Rechteck für eine Anweisung, eine Raute für eine Entscheidung, Pfeile zeigen die Richtung. Das Zeichnen hilft, bevor man programmiert, den Ablauf zu verstehen.

## Funktionen

Eine **Funktion** ist ein benannter Block von Anweisungen, den man mehrfach verwenden kann. Statt dieselben drei Zeilen zehnmal abzutippen, definiert man sie einmal und ruft sie auf:

\`\`\`python
def begruessung(name):
    print("Hallo", name)

begruessung("Mia")
begruessung("Ben")
\`\`\`

## Programmiersprachen

Es gibt hunderte Programmiersprachen. Für den Einstieg beliebt sind **Python** (gut lesbar, viele Einsatzgebiete) und **JavaScript** (läuft in jedem Browser). Der Computer versteht nur Maschinencode, deshalb werden Programme vor oder während des Ablaufs übersetzt (**Compiler** oder **Interpreter**).

## Fehler gehören dazu

Ein Fehler im Programm heißt **Bug**. Es gibt drei Sorten:

| Fehlerart | Beispiel | Wann merkt man ihn? |
| :--- | :--- | :--- |
| **Syntaxfehler** | Doppelpunkt oder Klammer vergessen | beim Start, das Programm läuft gar nicht |
| **Laufzeitfehler** | Teilen durch 0 | während das Programm läuft |
| **Logikfehler** | Falsches Rechenzeichen | gar nicht, das Ergebnis ist nur falsch |

Fehler zu suchen und zu beheben heißt **Debugging**. Eine gute Methode ist der **Schreibtischtest**: Du spielst das Programm von Hand durch und notierst nach jedem Schritt die Werte aller Variablen.

> **Merksatz:** Erst den Algorithmus denken, dann aufschreiben. Wer die Lösung nicht mit Stift und Papier erklären kann, kann sie auch nicht programmieren.
`,
    aufgaben: [
      {
        id: 'prog-schreibtischtest',
        frage: 'Führe den Schreibtischtest für diesen Code durch und gib die Ausgabe an:\n\n```python\nzahl = 1\nfor i in range(4):\n    zahl = zahl * 2\nprint(zahl)\n```',
        hinweis: 'range(4) wiederholt viermal. Notiere die Werte von zahl nach jeder Runde.',
        loesung: 'Start: zahl = 1. Runde 1: 2. Runde 2: 4. Runde 3: 8. Runde 4: 16. Ausgabe: **16**.'
      },
      {
        id: 'prog-algorithmus-schreiben',
        frage: 'Schreibe einen Algorithmus (in Alltagssprache oder Pseudocode) für „Eine Ampel für Fußgänger überqueren“. Verwende mindestens eine Bedingung und eine Schleife.',
        loesung: 'Beispiel:\n\n1. Gehe zur Ampel.\n2. Drücke den Knopf.\n3. **Solange** die Ampel rot zeigt: warte.\n4. **Wenn** die Ampel grün zeigt **und** kein Auto fährt: überquere die Straße.\n5. **Sonst**: warte und prüfe erneut.\n\nDie Schleife (solange rot) und die Bedingung (grün und kein Auto) sind enthalten. Auch andere Lösungen sind richtig, wichtig sind eindeutige Schritte.'
      },
      {
        id: 'prog-bug-finden',
        frage: 'Dieses Python-Programm soll „Gewonnen“ ausgeben, wenn punkte genau 25 ist. Finde den Fehler und sage, welche Fehlerart es ist:\n\n```python\nif punkte = 25:\n    print("Gewonnen")\n```',
        hinweis: 'Unterscheide Zuweisung und Vergleich.',
        loesung: 'Das einzelne Gleichheitszeichen ist eine **Zuweisung**, für einen **Vergleich** braucht es zwei: `if punkte == 25:`. Python meldet beim Start einen **Syntaxfehler**. Merke: = weist zu, == vergleicht.'
      }
    ],
    sources: [
      { label: 'W3Schools: Introduction to Programming', url: 'https://www.w3schools.com/programming/index.php' },
      { label: 'W3Schools: Python Variables', url: 'https://www.w3schools.com/python/python_variables.asp' },
      { label: 'W3Schools: Python If Statement', url: 'https://www.w3schools.com/python/python_conditions.asp' },
      { label: 'W3Schools: Python For Loops', url: 'https://www.w3schools.com/python/python_for_loops.asp' }
    ]
  },

  ...GRUNDKURS_EXTRA_TEIL_2
};

export const GRUNDKURS_EXTRA = GRUNDKURS_EXTRA_TEIL_1;
