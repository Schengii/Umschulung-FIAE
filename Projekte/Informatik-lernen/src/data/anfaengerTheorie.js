// Teil 2 des Einsteiger-Kurses: „Theorie-Lesebuch“ mit ausführlichen Kapiteln ohne Vorwissen.
// Feld `theorie`: Markdown (Überschriften ##/###, Listen, Tabellen, Code, Zitate), gerendert von Shared/MarkdownView.
// Feld `content`: kurze Einleitung, `example`: Praxis-Beispiel, `quiz`: Selbsttest wie in anfaengerGuides.js.
import { ANFAENGER_THEORIE_TEIL_2 } from './anfaengerTheorie2';

const THEORIE_TEIL_1 = [
  {
    id: 'hardware_bauteile',
    title: '13. Hardware zum Anfassen: Was steckt im Computer?',
    icon: '🖥️',
    category: 'Hardware',
    readTime: '8 Min',
    content: 'Hardware heißt alles, was man anfassen kann. Dieses Kapitel zeigt, welche Bauteile in einem Computer arbeiten, wofür sie da sind und woran du beim Kauf erkennst, was wichtig ist.',
    example: 'Beispiel: Ein alter Laptop startet langsam. Statt einen neuen zu kaufen, tauscht jemand die Festplatte (HDD) gegen eine SSD und rüstet 8 GB RAM auf 16 GB auf. Danach startet das Gerät in Sekunden, weil Daten schneller geladen werden und mehr Programme gleichzeitig in den Arbeitsspeicher passen.',
    theorie: `
## Hardware und Software

**Hardware** sind die greifbaren Bauteile eines Computers: Gehäuse, Platinen, Speicher, Bildschirm, Tastatur. **Software** sind die Programme, die darauf laufen. Beides gehört zusammen: Ohne Software ist die Hardware nutzlos, ohne Hardware läuft keine Software.

## Die Bauteile im Inneren

| Bauteil | Aufgabe | Alltagsvergleich |
| :--- | :--- | :--- |
| **Mainboard** (Hauptplatine) | Verbindet alle Bauteile miteinander | Straßennetz einer Stadt |
| **CPU** (Prozessor) | Führt Befehle aus und rechnet | Gehirn |
| **RAM** (Arbeitsspeicher) | Hält Programme und Daten, mit denen gerade gearbeitet wird | Schreibtisch |
| **SSD / HDD** (Massenspeicher) | Speichert Daten dauerhaft, auch ohne Strom | Aktenschrank |
| **GPU** (Grafikkarte) | Berechnet Bilder, Videos und 3D-Grafik | Zeichner |
| **Netzteil** | Wandelt Netzstrom in passende Spannungen für die Bauteile | Steckdosen-Verteiler |
| **Kühlung** | Führt Wärme ab (Lüfter, Kühlkörper) | Klimaanlage |

### RAM: schnell, aber flüchtig

Der Arbeitsspeicher ist **flüchtig**: Beim Ausschalten oder bei einem Stromausfall ist sein Inhalt weg. Deshalb gehen nicht gespeicherte Dokumente verloren, wenn der Rechner abstürzt. Je mehr RAM, desto mehr Programme und Browser-Tabs laufen gleichzeitig flüssig. Für normale Büroarbeit sind heute meist **8 bis 16 GB** üblich.

### Dauerhafter Speicher: SSD gegen HDD

| Eigenschaft | HDD (Festplatte) | SSD |
| :--- | :--- | :--- |
| Technik | Rotierende Magnetscheiben und ein Schreib-Lese-Kopf | Flash-Speicherchips ohne bewegliche Teile |
| Geschwindigkeit | langsam (Größenordnung 100 bis 200 MB/s) | deutlich schneller (SATA-SSD rund 500 MB/s, NVMe-SSD mehrere GB/s) |
| Empfindlichkeit | Stöße können Daten zerstören | robust, lautlos |
| Preis je GB | günstig | etwas teurer |
| Typischer Einsatz | große Archive, Backups | System und Programme |

Ein Betriebssystem auf einer SSD zu installieren ist die wirksamste einzelne Maßnahme, um einen alten Rechner schneller zu machen.

### Die CPU genauer

Moderne Prozessoren haben mehrere **Kerne**. Jeder Kern kann einen eigenen Strom von Befehlen abarbeiten, ein Vierkernprozessor also vier Aufgaben gleichzeitig. Die **Taktfrequenz** (in GHz) sagt, wie viele Arbeitstakte pro Sekunde möglich sind. Sie ist nur ein Teil der Leistung: Ein neuerer Prozessor mit niedrigerem Takt kann schneller sein als ein alter mit höherem. Direkt auf der CPU liegen kleine, sehr schnelle Zwischenspeicher, die **Caches**.

### Die Grafikkarte

Jeder Rechner braucht eine Grafikeinheit. Bei vielen Prozessoren ist sie eingebaut (**integrierte Grafik**), das reicht für Büro, Video und Internet. Für Spiele, Videoschnitt und KI-Berechnungen kommt eine **dedizierte Grafikkarte** mit eigenem Speicher (VRAM) zum Einsatz.

## Schnittstellen und Anschlüsse

| Anschluss | Wofür | Hinweis |
| :--- | :--- | :--- |
| **USB-A / USB-C** | Maus, Tastatur, Sticks, Laden | USB-C ist die flache, wendbare Steckerform. Die Geschwindigkeit hängt vom Standard ab (USB 2.0: 480 Mbit/s, USB 3.0: 5 Gbit/s) |
| **HDMI / DisplayPort** | Bild und Ton an Monitor oder Fernseher | Digitale Übertragung |
| **Ethernet (RJ45)** | Netzwerkkabel | Stabiler als WLAN |
| **Klinke (3,5 mm)** | Kopfhörer, Mikrofon | Analoger Ton |
| **WLAN / Bluetooth** | Funknetz / kurze Funkverbindung | Eingebaut oder per Stick |

## Eingabe- und Ausgabegeräte

Nach dem EVA-Prinzip gibt es **Eingabegeräte** (Tastatur, Maus, Touchpad, Mikrofon, Webcam, Scanner) und **Ausgabegeräte** (Monitor, Lautsprecher, Drucker). Ein **Touchscreen** ist beides zugleich.

## Was passiert beim Einschalten?

1. Das Netzteil versorgt alle Bauteile mit Strom.
2. Ein kleines Programm auf dem Mainboard, das **UEFI** (früher BIOS), prüft die Hardware und sucht ein Betriebssystem.
3. Der **Bootloader** lädt das Betriebssystem von der SSD oder HDD in den RAM.
4. Das Betriebssystem startet, zeigt die Anmeldung und danach den Desktop.

Dieser Ablauf heißt **Booten**.

## Typische Verwechslungen

- **Speicher gleich Speicher?** Mit „Speicher“ sind zwei verschiedene Dinge gemeint. Der RAM ist der kurzfristige Arbeitsspeicher, die SSD oder HDD der Speicher für Dateien. Bei „16 GB“ und „512 GB“ in einer Anzeige ist das erste meist der RAM, das zweite der Massenspeicher.
- **GB gleich Gbit?** Ein Byte besteht aus 8 Bit. Internetgeschwindigkeit wird meist in **Megabit pro Sekunde** angegeben, Dateigrößen in **Megabyte**. 100 Mbit/s entsprechen höchstens 12,5 MB/s.
- **Mehr GHz heißt schneller?** Nicht allein. Kernzahl, Bauart und Cache sind genauso wichtig.

> **Faustregel beim Kauf:** Für Büro und Internet: moderner Prozessor, 8 bis 16 GB RAM, SSD ab 256 GB. Mehr Geld lohnt sich zuerst für eine SSD und genug RAM, danach für den Prozessor.
`,
    sources: [
      { label: "Wikipedia: Universal Serial Bus (Übertragungsraten USB 2.0 und 3.0)", url: "https://de.wikipedia.org/wiki/Universal_Serial_Bus" },
      { label: "Wikipedia: Solid-State-Drive", url: "https://de.wikipedia.org/wiki/Solid-State-Drive" },
      { label: "USB Implementers Forum (USB-IF)", url: "https://www.usb.org/" }
    ],
    quiz: [
      {
        frage: 'Was passiert mit dem Inhalt des Arbeitsspeichers (RAM), wenn der Strom ausfällt?',
        optionen: ['Er bleibt erhalten', 'Er geht verloren', 'Er wird automatisch in die Cloud gesichert', 'Er wird auf die Grafikkarte kopiert'],
        korrekt: 1,
        erklaerung: 'Der RAM ist flüchtig. Nur Daten auf SSD oder HDD bleiben ohne Strom erhalten. Deshalb gehen nicht gespeicherte Dokumente bei einem Absturz verloren.'
      },
      {
        frage: 'Welche Aussage über SSD und HDD stimmt?',
        optionen: ['Die HDD ist schneller als die SSD', 'Die SSD hat keine beweglichen Teile und ist deutlich schneller', 'Beide sind gleich schnell', 'Eine SSD verliert ihre Daten ohne Strom sofort'],
        korrekt: 1,
        erklaerung: 'Eine SSD speichert in Flash-Chips ohne Mechanik und ist daher schneller, leiser und robuster als eine HDD mit rotierenden Scheiben.'
      },
      {
        frage: 'Wie viele Megabyte pro Sekunde sind bei einer 100-Mbit/s-Leitung höchstens möglich?',
        optionen: ['100 MB/s', '12,5 MB/s', '800 MB/s', '1 MB/s'],
        korrekt: 1,
        erklaerung: '1 Byte hat 8 Bit. 100 Mbit/s geteilt durch 8 ergibt 12,5 MB/s.'
      }
    ]
  },
  {
    id: 'dateien_ordner',
    title: '14. Dateien, Ordner & Dateisysteme: Ordnung im Speicher',
    icon: '🗂️',
    category: 'Grundlagen',
    readTime: '7 Min',
    content: 'Alles, was du am Computer speicherst, ist eine Datei. Dieses Kapitel erklärt, wie Dateien benannt, geordnet, verkleinert und gesichert werden und warum ein gutes Backup so wichtig ist.',
    example: 'Beispiel: Du schickst 40 Urlaubsfotos per E-Mail, aber der Anhang ist zu groß. Du packst sie in ein ZIP-Archiv, das die Daten verlustfrei verkleinert, und teilst stattdessen einen Link aus der Cloud. Zur Sicherheit liegt eine Kopie auf einer externen Festplatte.',
    theorie: `
## Datei, Ordner, Pfad

Eine **Datei** enthält zusammengehörige Daten: einen Text, ein Foto, ein Lied, ein Programm. Ein **Ordner** (Verzeichnis) fasst Dateien und weitere Ordner zusammen. Dadurch entsteht eine **Baumstruktur**.

Der **Pfad** beschreibt den Weg zu einer Datei:

| Betriebssystem | Beispielpfad | Trennzeichen |
| :--- | :--- | :--- |
| Windows | \`C:\\Benutzer\\Anna\\Dokumente\\Brief.docx\` | Rückwärts-Schrägstrich (\`\\\`) |
| Linux und macOS | \`/home/anna/Dokumente/Brief.docx\` | Schrägstrich (\`/\`) |

Ein **absoluter Pfad** beginnt ganz oben (Laufwerk oder Wurzel), ein **relativer Pfad** beginnt im aktuellen Ordner.

## Dateiendungen

Die Endung nach dem letzten Punkt zeigt, welche Art Datei vorliegt und welches Programm sie öffnet:

| Endung | Inhalt |
| :--- | :--- |
| .txt | reiner Text |
| .docx, .odt | Textdokument (Word, LibreOffice) |
| .pdf | Dokument mit fester Darstellung |
| .jpg, .png | Bilder (JPG für Fotos, PNG für Grafiken mit Transparenz) |
| .mp3 | Musik |
| .mp4 | Video |
| .zip | gepacktes Archiv |
| .exe, .msi | Windows-Programm, **nur aus vertrauenswürdiger Quelle starten** |

> **Endungen ausblenden ist riskant:** Windows blendet bekannte Endungen standardmäßig aus. So kann sich eine gefährliche Datei \`Rechnung.pdf.exe\` als \`Rechnung.pdf\` tarnen. Stelle in den Ordneroptionen ein, dass Dateiendungen angezeigt werden.

## Größen von Dateien

| Inhalt | Ungefähre Größe |
| :--- | :--- |
| Textseite | wenige Kilobyte |
| Foto vom Smartphone | 3 bis 6 Megabyte |
| Lied (MP3) | 3 bis 8 Megabyte |
| Film in HD | 1 bis 4 Gigabyte |
| Moderne Spiele | 50 bis 150 Gigabyte |

Eine 1-Terabyte-Festplatte (1000 Gigabyte) fasst demnach rund 200.000 Fotos.

## Dateisysteme

Ein **Dateisystem** regelt, wie Dateien auf einem Datenträger abgelegt und wiedergefunden werden. Beim Formatieren eines Datenträgers wählt man eines aus:

| Dateisystem | Typisch für | Besonderheit |
| :--- | :--- | :--- |
| **NTFS** | Windows | Rechteverwaltung, große Dateien |
| **FAT32** | alte USB-Sticks, Speicherkarten | Einzelne Datei höchstens 4 GiB, sehr kompatibel |
| **exFAT** | Sticks und Karten, Austausch zwischen Windows und Mac | keine 4-GiB-Grenze |
| **ext4** | Linux | stabil, Standard bei vielen Distributionen |
| **APFS** | macOS und iOS | für SSDs optimiert |

**Formatieren** richtet ein Dateisystem ein und löscht dabei meist den Inhalt. Beim normalen Löschen wird nur der Eintrag im Inhaltsverzeichnis entfernt, die Daten bleiben bis zum Überschreiben technisch vorhanden. Wer einen Datenträger weitergibt, sollte ihn deshalb sicher löschen (überschreiben).

## Komprimierung

Komprimieren macht Dateien kleiner.

- **Verlustfrei**: Beim Entpacken kommt exakt das Original zurück. Beispiele: ZIP, PNG, FLAC. Wichtig für Texte, Programme und Dokumente.
- **Verlustbehaftet**: Es werden Details weggelassen, die Menschen kaum bemerken. Beispiele: JPG, MP3, MP4. Dadurch deutlich kleiner, aber nicht umkehrbar. Wer ein JPG oft neu speichert, verliert jedes Mal Qualität.

## Gute Ordnung

- Sprechende Dateinamen mit Datum, z. B. \`2026-03_Mietvertrag.pdf\`. Das Datum im Format Jahr-Monat-Tag sortiert sich automatisch richtig.
- Wenige, klar benannte Hauptordner statt vieler Unterebenen.
- Keine Sonderzeichen und möglichst keine Leerzeichen in Namen, die auch Programme verarbeiten sollen.
- Den **Papierkorb** nicht als Archiv nutzen: Er ist nur ein Zwischenschritt vor dem endgültigen Löschen.

## Datensicherung: die 3-2-1-Regel

Datenträger gehen kaputt, Laptops werden gestohlen, Schadsoftware verschlüsselt Dateien. Ein **Backup** ist eine Kopie der Daten an einem anderen Ort. Bewährt hat sich die **3-2-1-Regel**, die das BSI für Organisationen empfiehlt. Privatpersonen rät das BSI zu mindestens einer externen, räumlich getrennten Kopie. Die Regel lautet:

- **3** Kopien der Daten (das Original und zwei Sicherungen),
- auf **2** verschiedenen Medien (z. B. Rechner und externe Festplatte),
- davon **1** Kopie an einem anderen Ort (z. B. Cloud oder bei Verwandten).

Eine Sicherung zählt erst, wenn du **testest**, dass du Dateien daraus wiederherstellen kannst. Und: Eine Cloud-Synchronisierung ist kein Backup, denn ein gelöschtes oder verschlüsseltes Dokument wird dort oft mit synchronisiert.
`,
    sources: [
      { label: "BSI: Datensicherung – wie geht das?", url: "https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Daten-sichern-verschluesseln-und-loeschen/Datensicherung-und-Datenverlust/Datensicherung-wie-geht-das/datensicherung-wie-geht-das_node.html" },
      { label: "BSI: Vorschläge zu BC-Strategien, 3-2-1-Regel (PDF, für Organisationen)", url: "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Grundschutz/Hilfsmittel/Standard200_4_BCM/Standard_200-4_Vorschlaege_zu_BC_Strategien.pdf?__blob=publicationFile&v=5" },
      { label: "Microsoft Learn: Vergleich der Dateisystemfunktionen (FAT32, NTFS)", url: "https://learn.microsoft.com/de-de/windows/win32/fileio/filesystem-functionality-comparison" }
    ],
    quiz: [
      {
        frage: 'Was beschreibt ein Pfad?',
        optionen: ['Das Passwort einer Datei', 'Den Weg zu einer Datei durch die Ordnerstruktur', 'Die Größe einer Datei', 'Das Programm, das eine Datei erzeugt hat'],
        korrekt: 1,
        erklaerung: 'Ein Pfad nennt Laufwerk und Ordner, in denen eine Datei liegt, zum Beispiel C:\\Benutzer\\Anna\\Dokumente\\Brief.docx.'
      },
      {
        frage: 'Welches Dateiformat nutzt eine verlustbehaftete Komprimierung?',
        optionen: ['ZIP', 'PNG', 'JPG', 'TXT'],
        korrekt: 2,
        erklaerung: 'JPG verwirft Bilddetails zugunsten kleinerer Dateien. ZIP und PNG sind verlustfrei.'
      },
      {
        frage: 'Wofür steht die 3-2-1-Regel?',
        optionen: [
          '3 Passwörter, 2 Geräte, 1 Konto',
          '3 Kopien, auf 2 Medien, davon 1 an einem anderen Ort',
          '3 Ordner, 2 Dateien, 1 Backup pro Jahr',
          '3 Minuten Wartezeit, 2 Neustarts, 1 Update'
        ],
        korrekt: 1,
        erklaerung: 'Die Regel verlangt drei Kopien auf zwei verschiedenen Medien, von denen eine räumlich getrennt aufbewahrt wird.'
      },
      {
        frage: 'Warum ist ein ausgeblendetes Dateiende (z. B. .exe) ein Risiko?',
        optionen: ['Die Datei wird dadurch größer', 'Gefährliche Programme können sich als harmlose Dokumente tarnen', 'Die Datei lässt sich nicht mehr löschen', 'Der Computer wird langsamer'],
        korrekt: 1,
        erklaerung: 'Eine Datei „Rechnung.pdf.exe“ wird ohne sichtbare Endung als „Rechnung.pdf“ angezeigt, ist aber ein ausführbares Programm.'
      }
    ]
  },
  {
    id: 'software_lizenzen',
    title: '15. Software verstehen: Programme, Treiber, Updates & Lizenzen',
    icon: '📦',
    category: 'Software',
    readTime: '7 Min',
    content: 'Software ist die Gesamtheit aller Programme. Hier lernst du die Arten kennen, wozu Updates und Treiber dienen und was hinter Begriffen wie Freeware, Open Source oder Lizenz steckt.',
    example: 'Beispiel: Ein neuer Drucker wird nicht erkannt. Der Hersteller bietet auf der Webseite einen Treiber zum Download an. Nach der Installation weiß das Betriebssystem, wie es mit dem Gerät sprechen muss, und der Ausdruck klappt.',
    theorie: `
## Arten von Software

| Art | Aufgabe | Beispiele |
| :--- | :--- | :--- |
| **Firmware** | Kleines Programm fest im Gerät, steuert die Hardware | UEFI im PC, Software im Router oder Fernseher |
| **Systemsoftware** | Verwaltet Hardware, stellt Dienste bereit | Betriebssystem (Windows, macOS, Linux, Android, iOS), Treiber |
| **Anwendungssoftware** (Apps) | Erledigt Aufgaben für Nutzer | Browser, Textverarbeitung, Spiele, Messenger |
| **Entwicklungssoftware** | Hilft beim Programmieren | Editoren, Compiler |

Ein **Treiber** ist ein kleines Programm, das dem Betriebssystem beibringt, wie es ein bestimmtes Gerät ansteuert (Drucker, Grafikkarte, WLAN-Karte). Die meisten gängigen Geräte bringen Windows, macOS und Linux bereits mit.

## Installation und Programmstart

Ein Programm besteht aus Dateien, die bei der **Installation** an die richtigen Orte kopiert werden. Danach lädt das Betriebssystem das Programm beim Start in den Arbeitsspeicher und führt es aus. Einen laufenden Programmvorgang nennt man **Prozess**.

Installiere Programme nur aus **vertrauenswürdigen Quellen**: dem App-Store des Systems oder der offiziellen Seite des Herstellers. Cracks und Raubkopien enthalten besonders oft Schadsoftware.

## 32 Bit und 64 Bit

Die Angabe sagt, wie breit die „Datenwege“ des Prozessors sind. Ein 32-Bit-System kann höchstens 4 GiB Arbeitsspeicher ansprechen, ein 64-Bit-System sehr viel mehr. Heute sind praktisch alle Rechner und Smartphones 64-Bit-Systeme.

## Updates: warum so wichtig?

Software enthält Fehler. Manche davon sind **Sicherheitslücken**, durch die Angreifer in ein System eindringen können. Hersteller beheben sie mit **Updates**. Wer sie nicht einspielt, lässt bekannte Türen offen. Deshalb gilt:

- Automatische Updates für Betriebssystem, Browser und Apps einschalten.
- Auch Router, Smartphone und Smart-TV aktuell halten.
- Nicht mehr unterstützte Software (ohne Updates) nicht für sensible Aufgaben nutzen, z. B. kein Online-Banking auf einem veralteten Betriebssystem.

Neben Sicherheits- gibt es **Funktionsupdates**, die neue Möglichkeiten bringen, und **Fehlerkorrekturen** (Bugfixes).

## Lizenzen: Wer darf was?

Software ist urheberrechtlich geschützt. Die **Lizenz** legt fest, was Nutzer damit dürfen.

| Lizenzart | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| **Proprietär (kommerziell)** | Quelltext geheim, Nutzung gegen Kauf oder Abo | Microsoft Office, Photoshop |
| **Freeware** | kostenlos nutzbar, Quelltext bleibt geschlossen | viele kleine Hilfsprogramme |
| **Shareware / Testversion** | zeitlich oder im Umfang begrenzt, danach kaufen | Testversionen |
| **Open Source** | Quelltext offen, darf geprüft, verändert und weitergegeben werden | Linux, Firefox, LibreOffice |

> **Open Source heißt nicht automatisch kostenlos:** „Open“ bezieht sich auf den offenen **Quelltext** und die Rechte, ihn zu nutzen und zu ändern. Viele Open-Source-Programme sind gratis, aber Firmen dürfen daran auch Dienstleistungen verkaufen. Bekannte Lizenzen sind **GPL** (Änderungen müssen unter derselben Lizenz weitergegeben werden) und **MIT** (sehr freizügig).

Für Texte, Bilder und Musik gibt es die **Creative-Commons-Lizenzen**. Sie erlauben eine Nutzung unter Bedingungen, z. B. die Namensnennung des Urhebers. Fotos aus dem Internet darf man **nicht** einfach verwenden: Ohne Erlaubnis oder passende Lizenz droht eine Abmahnung.

## Software als Dienst

Immer häufiger läuft Software nicht mehr auf dem eigenen Rechner, sondern im Browser auf Servern des Anbieters. Man nennt das **Software as a Service (SaaS)**, Beispiele sind Online-Textverarbeitung oder E-Mail im Browser. Vorteil: keine Installation, immer aktuell, von überall nutzbar. Nachteil: Man braucht Internet und gibt Daten aus der Hand.

## Virtuelle Maschinen

Mit einer **virtuellen Maschine (VM)** lässt sich ein vollständiger Computer in einem Programm nachbilden. So kann man auf einem Windows-Rechner gefahrlos Linux ausprobieren oder verdächtige Dateien in einer abgeschotteten Umgebung testen.
`,
    sources: [
      { label: "Open Source Initiative: The Open Source Definition", url: "https://opensource.org/osd" },
      { label: "Open Source Initiative: The MIT License", url: "https://opensource.org/license/mit" },
      { label: "Creative Commons: Lizenzen im Überblick", url: "https://creativecommons.org/share-your-work/cclicenses/" }
    ],
    quiz: [
      {
        frage: 'Wozu dient ein Treiber?',
        optionen: ['Er beschleunigt das Internet', 'Er bringt dem Betriebssystem bei, ein bestimmtes Gerät anzusteuern', 'Er schützt vor Viren', 'Er speichert Passwörter'],
        korrekt: 1,
        erklaerung: 'Ein Treiber übersetzt zwischen Betriebssystem und Hardware, z. B. zwischen Windows und einem Drucker.'
      },
      {
        frage: 'Warum sollte man Updates zeitnah installieren?',
        optionen: ['Damit der Bildschirm heller wird', 'Weil sie bekannte Sicherheitslücken schließen', 'Damit der Akku länger hält, immer', 'Nur wegen neuer Farben'],
        korrekt: 1,
        erklaerung: 'Viele Updates beheben Sicherheitslücken, die Angreifer ausnutzen können. Ohne Updates bleiben diese Lücken offen.'
      },
      {
        frage: 'Was bedeutet „Open Source“?',
        optionen: ['Das Programm ist immer gratis', 'Der Quelltext ist offen einsehbar und darf unter den Lizenzbedingungen verändert werden', 'Das Programm läuft nur im Internet', 'Das Programm hat keine Fehler'],
        korrekt: 1,
        erklaerung: 'Open Source bezieht sich auf den offenen Quelltext. Ob ein Programm kostenlos ist, ist eine andere Frage.'
      }
    ]
  },
  {
    id: 'smartphone_mobilfunk',
    title: '16. Smartphone, Apps & Mobilfunk: Der Computer in der Hosentasche',
    icon: '📱',
    category: 'Netzwerke',
    readTime: '7 Min',
    content: 'Ein Smartphone ist ein vollwertiger Computer mit Mobilfunk. Hier erfährst du, wie Mobilfunk funktioniert, was Apps dürfen und wie du dein Gerät schützt.',
    example: 'Beispiel: Du installierst eine Taschenlampen-App, die beim Start nach Zugriff auf Kontakte, Standort und Mikrofon fragt. Eine Taschenlampe braucht nichts davon. Du verweigerst die Berechtigungen oder nutzt die eingebaute Taschenlampe des Systems.',
    theorie: `
## Was steckt in einem Smartphone?

Ein Smartphone enthält alles, was auch ein PC hat: Prozessor, Arbeitsspeicher, Speicher für Daten, Betriebssystem. Dazu kommen Sensoren und Funktechnik:

| Baustein | Aufgabe |
| :--- | :--- |
| **Touchscreen** | Eingabe und Ausgabe in einem |
| **Kamera, Mikrofon, Lautsprecher** | Bilder, Videos, Sprache |
| **Mobilfunk-Modem** | Verbindung zum Handynetz (Telefon, mobile Daten) |
| **WLAN und Bluetooth** | Verbindung zum Heimnetz, zu Kopfhörern, Uhren, Autos |
| **GPS und weitere Satellitennavigation** | Standortbestimmung |
| **Beschleunigungs- und Lagesensoren** | Bildschirm drehen, Schrittzähler |
| **NFC** | Kurzstreckenfunk, z. B. kontaktloses Bezahlen |
| **Akku (Lithium-Ionen)** | Stromversorgung |

Die beiden großen Betriebssysteme sind **Android** (Google, viele Hersteller) und **iOS** (Apple, nur iPhone).

## Wie funktioniert Mobilfunk?

Das Land ist in **Funkzellen** eingeteilt. Jede Zelle wird von einem **Mobilfunkmast** (Basisstation) versorgt. Dein Handy verbindet sich mit der Zelle, in der du dich befindest, und wechselt beim Fahren automatisch zur nächsten (*Handover*). Die Masten sind über Kabel (meist Glasfaser) mit dem Netz des Anbieters verbunden.

| Generation | Bezeichnung | Typisch |
| :--- | :--- | :--- |
| 2G | GSM | Telefonie und SMS, sehr langsame Daten |
| 3G | UMTS | mobiles Internet, in Deutschland seit 2021 abgeschaltet, die Frequenzen gehen an 4G und 5G |
| 4G | LTE | schnelles mobiles Internet, Video-Streaming |
| 5G | 5G | höhere Geschwindigkeit, geringere Verzögerung, viele Geräte pro Zelle |

Die **SIM-Karte** identifiziert dich im Netz. Eine **eSIM** ist eine fest eingebaute SIM, die per Software freigeschaltet wird.

## Mobile Daten oder WLAN?

- **WLAN** funkt nur wenige Meter bis zum eigenen Router und läuft über deinen Festnetz-Internetanschluss. Es verbraucht kein Datenvolumen.
- **Mobile Daten** nutzen das Handynetz und zählen oft gegen ein Datenvolumen im Tarif.

Öffentliche WLANs (Café, Bahnhof) können mitgelesen werden. Gib dort keine Passwörter oder Bankdaten ein, oder nutze ein **VPN**, das den Datenverkehr verschlüsselt durch einen Tunnel schickt.

## Apps und ihre Berechtigungen

**Apps** installierst du aus dem Store deines Systems (Google Play, App Store). Beim ersten Zugriff auf sensible Funktionen fragt das System um Erlaubnis: Standort, Kamera, Mikrofon, Kontakte, Fotos.

Faustregeln:

- Gib nur die Rechte frei, die zum Zweck der App passen. Eine Navigations-App braucht den Standort, eine Taschenlampe nicht.
- Bei Standort lieber „nur während der Nutzung“ statt „immer“ wählen.
- Lösche Apps, die du nicht mehr nutzt.
- Prüfe vor der Installation Anbieter, Bewertungen und Anzahl der Downloads. Gefälschte Apps imitieren bekannte Marken.
- Kostenlose Apps finanzieren sich oft über Werbung und Datensammlung. Frage dich: „Womit bezahle ich?“

## Das Smartphone schützen

1. **Bildschirmsperre** mit PIN (mindestens 6 Stellen), Muster oder biometrischem Merkmal (Fingerabdruck, Gesicht). Wer ein ungesperrtes Handy findet, hat Zugriff auf E-Mail, Bank und Fotos.
2. **Updates** für System und Apps automatisch einspielen.
3. **Gerät orten und sperren** aus der Ferne aktivieren („Mein Gerät finden“).
4. **Backup** der Fotos und Kontakte einrichten.
5. Nur Apps aus offiziellen Stores installieren, keine Links aus unbekannten SMS öffnen. Betrügerische Nachrichten, die zum Klicken verleiten, nennt man bei SMS **Smishing**.

## Akku und Alltag

Lithium-Ionen-Akkus altern mit jedem Ladezyklus. Sie halten länger, wenn sie nicht dauerhaft bei 0 % oder 100 % bleiben und nicht in der Hitze liegen (Auto im Sommer, direkte Sonne). Hohe Display-Helligkeit, GPS und schlechter Empfang verbrauchen am meisten Strom.
`,
    sources: [
      { label: "Bundesnetzagentur: 2G-Abschaltung", url: "https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/Breitband/2GAbschaltung/start.html" },
      { label: "BSI: Spam, Phishing & Co (u. a. Smishing)", url: "https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Cyber-Sicherheitslage/Methoden-der-Cyber-Kriminalitaet/Spam-Phishing-Co/spam-phishing-co_node.html" },
      { label: "Wikipedia: Mobilfunk", url: "https://de.wikipedia.org/wiki/Mobilfunk" }
    ],
    quiz: [
      {
        frage: 'Wie ist das Mobilfunknetz grundsätzlich aufgebaut?',
        optionen: ['Ein einziger großer Sendemast für ein ganzes Land', 'Viele Funkzellen mit je einem Mast, zwischen denen das Handy wechselt', 'Jedes Handy verbindet sich direkt mit jedem anderen', 'Über Satelliten allein'],
        korrekt: 1,
        erklaerung: 'Das Netz besteht aus vielen Funkzellen. Beim Bewegen wechselt das Handy automatisch zur nächsten Zelle (Handover).'
      },
      {
        frage: 'Welche App-Berechtigung ist bei einer Taschenlampen-App auffällig?',
        optionen: ['Zugriff auf die Kamera-LED', 'Zugriff auf Kontakte und Standort', 'Zugriff auf den Akku', 'Anzeige im Vordergrund'],
        korrekt: 1,
        erklaerung: 'Eine Taschenlampe braucht weder Kontakte noch Standort. Solche Anfragen deuten auf Datensammlung hin.'
      },
      {
        frage: 'Wozu dient ein VPN im öffentlichen WLAN?',
        optionen: ['Es macht das Internet schneller', 'Es verschlüsselt den Datenverkehr durch einen Tunnel', 'Es lädt den Akku', 'Es ersetzt die SIM-Karte'],
        korrekt: 1,
        erklaerung: 'Ein VPN verschlüsselt den Datenverkehr zwischen Gerät und VPN-Server und schützt so vor Mitlesen im unsicheren WLAN.'
      }
    ]
  }
];

export const ANFAENGER_THEORIE = [...THEORIE_TEIL_1, ...ANFAENGER_THEORIE_TEIL_2];
