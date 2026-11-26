// Kapitel des Einsteiger-Kurses ohne Vorwissen.
// Feld `content`: Absätze durch Leerzeilen, **fett** wird in der Oberfläche hervorgehoben, "- " beginnt Listenpunkte.
// Feld `quiz`: kurzer Selbsttest { frage, optionen, korrekt (Index), erklaerung }.
// Optionales Feld `source: { label, url }` verweist auf eine Primärquelle.

export const ANFAENGER_GUIDES = [
  {
    id: 'eva_prinzip',
    title: '1. Das EVA-Prinzip: Wie funktioniert ein Computer?',
    icon: '💻',
    category: 'Grundlagen',
    content: `Jeder Computer auf der Welt – egal ob Smartphone, Laptop oder Supercomputer – arbeitet nach demselben Grundprinzip: dem **EVA-Prinzip**:

1. **E**ingabe: Informationen werden in den PC eingegeben (z.B. Tastatur, Maus, Touchscreen, Mikrofon).
2. **V**erarbeitung: Die **CPU (Prozessor)** verarbeitet die Daten im Arbeitsspeicher (RAM) anhand von Befehlen.
3. **A**usgabe: Das Ergebnis wird ausgegeben (z.B. Bildschirm, Lautsprecher, Drucker).`,
    example: 'Beispiel: Du tippst den Buchstaben "A" auf der Tastatur (Eingabe), die CPU wandelt die Taste in den Binärcode 01000001 um (Verarbeitung) und zeigt den Buchstaben "A" auf deinem Monitor an (Ausgabe).',
    quiz: [
      {
        frage: 'Welches Gerät gehört zur Eingabe im EVA-Prinzip?',
        optionen: ['Monitor', 'Tastatur', 'Lautsprecher', 'Drucker'],
        korrekt: 1,
        erklaerung: 'Die Tastatur liefert Eingaben. Monitor, Lautsprecher und Drucker geben Ergebnisse aus.'
      },
      {
        frage: 'Welches Bauteil führt die Verarbeitung der Befehle aus?',
        optionen: ['Die CPU', 'Der Bildschirm', 'Das Netzkabel', 'Die Maus'],
        korrekt: 0,
        erklaerung: 'Die CPU (Prozessor) führt die Befehle aus und verarbeitet die Daten.'
      }
    ]
  },
  {
    id: 'cpu_brain',
    title: '2. Das Gehirn des PCs: Wie denkt die CPU?',
    icon: '🧠',
    category: 'Hardware',
    content: `Die **CPU (Central Processing Unit)** ist das Rechenzentrum des Computers. Sie führt Milliarden von Befehlen pro Sekunde aus!

Sie besteht im Wesentlichen aus:
- **ALU (Arithmetic Logic Unit)**: Das Rechenwerk für mathematische Plus/Minus-Rechnungen und Vergleiche.
- **Steuerwerk (Control Unit)**: Holt Befehle aus dem Arbeitsspeicher und verteilt Aufgaben.
- **Register**: Ultra-schnelle Mikrospeicher direkt in der CPU.
- **Taktfrequenz (GHz)**: Gibt an, wie viele Milliarden Arbeitsschritte pro Sekunde ausgeführt werden (z.B. 3,5 GHz = 3,5 Milliarden Schritte/Sekunde).`,
    example: 'Stell dir die CPU wie den Chefkoch in einer Küche vor: Das Steuerwerk ist der Koch, die Register sind das Schneidebrett und der RAM ist der Kühlschrank!',
    quiz: [
      {
        frage: 'Was ist die Aufgabe der ALU?',
        optionen: ['Bilder anzeigen', 'Rechnen und Vergleichen', 'Daten dauerhaft speichern', 'Das Internet verbinden'],
        korrekt: 1,
        erklaerung: 'Die ALU ist das Rechenwerk der CPU: Sie führt Rechenoperationen und Vergleiche aus.'
      },
      {
        frage: 'Was bedeutet eine Taktfrequenz von 3,5 GHz?',
        optionen: ['3,5 Milliarden Arbeitsschritte pro Sekunde', '3,5 Gigabyte Speicher', '3,5 Gigabit Internet', '3,5 Watt Leistung'],
        korrekt: 0,
        erklaerung: '1 GHz entspricht einer Milliarde Takte pro Sekunde. Die Frequenz sagt nichts über Speicher oder Internet aus.'
      }
    ]
  },
  {
    id: 'binary_system',
    title: '3. Die Sprache der Computer: Bits, Bytes & Binärsystem',
    icon: '🔢',
    category: 'Daten & Logik',
    content: `Computer kennen im Grunde nur zwei Zustände: **Strom an (1)** oder **Strom aus (0)**.

- **Bit**: Die kleinste Informationseinheit (entweder 0 oder 1).
- **Byte**: 8 Bits zusammen ergeben 1 Byte (z.B. 01000001). Ein Byte kann 256 verschiedene Werte darstellen (2^8 = 256).
- **Kilobyte (KB)**: ca. 1.000 Bytes (ein kurzer Text).
- **Megabyte (MB)**: ca. 1.000 KB (ein Foto oder MP3-Song).
- **Gigabyte (GB)**: ca. 1.000 MB (ein Spielfilm).
- **Terabyte (TB)**: ca. 1.000 GB (eine große Festplatte).`,
    example: 'Der Buchstabe "A" ist im Computer die Zahl 65, und als Binärcode geschrieben 01000001!',
    quiz: [
      {
        frage: 'Wie viele Bits hat ein Byte?',
        optionen: ['2', '4', '8', '16'],
        korrekt: 2,
        erklaerung: 'Ein Byte besteht aus 8 Bits und kann 2^8 = 256 verschiedene Werte darstellen.'
      },
      {
        frage: 'Welche Zahl ergibt der Binärcode 101?',
        optionen: ['3', '5', '6', '101'],
        korrekt: 1,
        erklaerung: '101 binär = 1·4 + 0·2 + 1·1 = 5.'
      }
    ]
  },
  {
    id: 'internet_dns',
    title: '4. Wie funktioniert das Internet & DNS?',
    icon: '🌐',
    category: 'Netzwerke',
    content: `Das Internet ist ein riesiges weltweites Netzwerk von zusammenhängenden Computern.

- **IP-Adresse**: Jeder Computer im Internet hat eine eindeutige Hausnummer (z.B. 142.250.185.206).
- **DNS (Domain Name System)**: Weil sich Menschen Zahlen schwer merken können, übersetzt das DNS Namen wie "google.de" in die richtige IP-Adresse.
- **Router**: Das digitale Postamt, das Datenpakete durch das Netzwerk an ihr Ziel leitet.`,
    example: 'DNS ist das Telefonbuch des Internets: Du suchst nach "Peter", und das Telefonbuch gibt dir seine Telefonnummer!',
    quiz: [
      {
        frage: 'Was macht das DNS?',
        optionen: ['Es übersetzt Namen wie "google.de" in IP-Adressen', 'Es schützt vor Viren', 'Es speichert Fotos', 'Es lädt den Akku'],
        korrekt: 0,
        erklaerung: 'Das Domain Name System ist das Telefonbuch des Internets und ordnet Namen IP-Adressen zu.'
      }
    ]
  },
  {
    id: 'betriebssystem',
    title: '5. Das Betriebssystem: Der Chef im Hintergrund',
    icon: '🖥️',
    category: 'Software',
    content: `Das **Betriebssystem (BS)** ist das Programm, das Hardware und Anwendungen verbindet. Ohne Betriebssystem könntest du weder Programme starten noch Dateien speichern.

Seine wichtigsten Aufgaben:
- **Prozessverwaltung**: Es verteilt die CPU-Zeit auf alle laufenden Programme.
- **Speicherverwaltung**: Es teilt den Arbeitsspeicher zu und sorgt dafür, dass sich Programme nicht gegenseitig stören.
- **Dateiverwaltung**: Es organisiert Ordner und Dateien auf Festplatte oder SSD.
- **Geräteverwaltung**: Es spricht über Treiber mit Maus, Drucker, Netzwerkkarte und Co.

Bekannte Betriebssysteme sind **Windows**, **macOS**, **Linux** (auch Grundlage vieler Server) sowie **Android** und **iOS** auf Smartphones.`,
    example: 'Wenn du ein Dokument speicherst, fragt das Textprogramm das Betriebssystem: "Bitte lege diese Datei im Ordner Dokumente ab." Das Betriebssystem übernimmt den Rest.',
    quiz: [
      {
        frage: 'Welche Aufgabe hat das Betriebssystem NICHT?',
        optionen: ['Dateien verwalten', 'Programme mit CPU-Zeit versorgen', 'Webseiten gestalten', 'Treiber für Geräte nutzen'],
        korrekt: 2,
        erklaerung: 'Webseiten gestaltet man mit HTML und CSS. Das Betriebssystem verwaltet Prozesse, Speicher, Dateien und Geräte.'
      },
      {
        frage: 'Welches dieser Systeme ist ein Betriebssystem?',
        optionen: ['Linux', 'Chrome-Browser', 'Excel', 'USB-Stick'],
        korrekt: 0,
        erklaerung: 'Linux ist ein Betriebssystem. Chrome und Excel sind Anwendungen, ein USB-Stick ist Hardware.'
      }
    ]
  },
  {
    id: 'programme_algorithmen',
    title: '6. Programme & Algorithmen: Anleitungen für den Computer',
    icon: '🧩',
    category: 'Programmieren',
    content: `Ein **Algorithmus** ist eine eindeutige Schritt-für-Schritt-Anleitung, mit der ein Problem gelöst wird, zum Beispiel ein Kochrezept. Ein **Programm** setzt einen Algorithmus in einer Programmiersprache um.

Drei Bausteine kommen in fast jedem Programm vor:
- **Variable**: Ein benannter Speicherplatz für einen Wert (z.B. punkte = 10).
- **Bedingung (if)**: Das Programm entscheidet, welcher Weg genommen wird.
- **Schleife**: Das Programm wiederholt Schritte, bis ein Ziel erreicht ist.

Beliebte Programmiersprachen für den Einstieg sind **Python** und **JavaScript**.`,
    example: `Beispiel in Pseudocode:
punkte = 0
wiederhole 3 mal:
    punkte = punkte + 10
wenn punkte größer als 25:
    zeige "Gewonnen!"
Ergebnis: punkte ist 30, also erscheint "Gewonnen!".`,
    quiz: [
      {
        frage: 'Was beschreibt ein Algorithmus?',
        optionen: ['Eine eindeutige Schritt-für-Schritt-Anleitung zur Lösung eines Problems', 'Ein Kabel', 'Eine Internetseite', 'Ein Bildschirm'],
        korrekt: 0,
        erklaerung: 'Ein Algorithmus legt eindeutig fest, welche Schritte in welcher Reihenfolge zum Ziel führen.'
      },
      {
        frage: 'Welcher Baustein wiederholt Anweisungen?',
        optionen: ['Variable', 'Schleife', 'Kommentar', 'Dateiendung'],
        korrekt: 1,
        erklaerung: 'Eine Schleife (z. B. for oder while) wiederholt Anweisungen, bis eine Bedingung erfüllt ist.'
      }
    ]
  },
  {
    id: 'webseiten',
    title: '7. Wie entsteht eine Webseite? HTML, CSS & JavaScript',
    icon: '🕸️',
    category: 'Web',
    content: `Wenn du eine Adresse im Browser eingibst, schickt dein Browser eine **Anfrage** an einen **Server**. Der Server antwortet mit den Dateien der Webseite. Dieses Frage-Antwort-Spiel heißt **HTTP**; die verschlüsselte Variante **HTTPS** erkennst du am Schloss in der Adresszeile.

Eine Webseite besteht aus drei Teilen:
- **HTML**: Der Aufbau und Inhalt (Überschriften, Texte, Bilder, Links).
- **CSS**: Das Aussehen (Farben, Schriften, Abstände, Layout).
- **JavaScript**: Das Verhalten (Buttons reagieren, Inhalte laden, Animationen).`,
    example: `Minimales Beispiel:
<h1>Hallo Welt</h1>      -> HTML: eine große Überschrift
h1 { color: teal; }      -> CSS: macht sie türkis
alert("Hi")              -> JavaScript: zeigt ein Hinweisfenster`,
    quiz: [
      {
        frage: 'Welche Technik legt das Aussehen einer Webseite fest?',
        optionen: ['HTML', 'CSS', 'SQL', 'DNS'],
        korrekt: 1,
        erklaerung: 'CSS steuert Farben, Schriften und Layout. HTML liefert die Struktur, JavaScript das Verhalten.'
      },
      {
        frage: 'Wofür steht das "S" in HTTPS?',
        optionen: ['Schnell', 'Sicher (verschlüsselt)', 'Server', 'Speicher'],
        korrekt: 1,
        erklaerung: 'HTTPS ist HTTP mit Verschlüsselung (TLS). Dritte können die Daten dadurch nicht mitlesen.'
      }
    ]
  },
  {
    id: 'daten_speichern',
    title: '8. Daten speichern: Arbeitsspeicher, Festplatte & Datenbank',
    icon: '🗃️',
    category: 'Daten & Logik',
    content: `Computer haben zwei Arten von Speicher:
- **Arbeitsspeicher (RAM)**: Sehr schnell, aber **flüchtig**. Beim Ausschalten sind die Inhalte weg.
- **Massenspeicher (SSD, Festplatte)**: Langsamer, aber **dauerhaft**. Hier liegen Betriebssystem, Programme und deine Dateien.

Wenn viele zusammengehörige Daten verwaltet werden, nutzt man eine **Datenbank**. Sie ordnet Daten in **Tabellen** mit **Zeilen** (Datensätze) und **Spalten** (Eigenschaften). Jede Zeile hat einen eindeutigen **Primärschlüssel**, zum Beispiel eine Kundennummer. Mit der Sprache **SQL** fragt man Daten ab.`,
    example: `Tabelle "kunde":
nr | name  | stadt
1  | Mia   | Köln
2  | Ben   | Bonn
Abfrage: SELECT name FROM kunde WHERE stadt = 'Köln';  -> Ergebnis: Mia`,
    quiz: [
      {
        frage: 'Was passiert mit den Inhalten des Arbeitsspeichers beim Ausschalten?',
        optionen: ['Sie bleiben erhalten', 'Sie gehen verloren', 'Sie werden automatisch gedruckt', 'Sie werden verschlüsselt gespeichert'],
        korrekt: 1,
        erklaerung: 'RAM ist flüchtig. Daten, die erhalten bleiben sollen, müssen auf SSD oder Festplatte gespeichert werden.'
      },
      {
        frage: 'Wozu dient ein Primärschlüssel?',
        optionen: ['Er verschlüsselt die Tabelle', 'Er identifiziert jede Zeile eindeutig', 'Er sortiert alle Spalten', 'Er löscht doppelte Tabellen'],
        korrekt: 1,
        erklaerung: 'Der Primärschlüssel macht jeden Datensatz eindeutig, z. B. über eine Kundennummer.'
      }
    ]
  },
  {
    id: 'sicher_im_netz',
    title: '9. Sicher im Netz: Passwörter, Phishing & Updates',
    icon: '🛡️',
    category: 'Sicherheit',
    content: `Viele Angriffe zielen nicht auf Technik, sondern auf Menschen. Mit wenigen Gewohnheiten schützt du dich gut:

- **Starke Passwörter**: lang statt kurz (laut BSI mindestens 8 Zeichen mit vier Zeichenarten, besser deutlich länger, ab 25 Zeichen auch ohne Sonderzeichen), für jeden Dienst **einzigartig**. Ein **Passwortmanager** merkt sie sich für dich.
- **Zwei-Faktor-Authentifizierung (2FA)**: Zusätzlich zum Passwort braucht man einen zweiten Nachweis, z. B. einen Code aus einer App.
- **Phishing erkennen**: Falsche Mails oder Nachrichten täuschen vor, von Bank oder Paketdienst zu kommen, und setzen dich unter Zeitdruck. Prüfe den Absender, klicke nicht auf verdächtige Links und gib keine Passwörter weiter.
- **Updates einspielen**: Sie schließen bekannte Sicherheitslücken.
- **Backups**: Sichere wichtige Dateien an einem zweiten Ort.`,
    example: 'Eine Mail "Ihr Konto wird in 24 Stunden gesperrt, klicken Sie hier" ist ein klassischer Phishing-Versuch. Öffne stattdessen die Webseite der Bank selbst per Lesezeichen und prüfe dort.',
    source: { label: 'BSI für Bürgerinnen und Bürger', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/verbraucherinnen-und-verbraucher_node.html' },
    quiz: [
      {
        frage: 'Welches Passwort ist am sichersten?',
        optionen: ['123456', 'passwort', 'Ein langes, einzigartiges Passwort aus einem Passwortmanager', 'Dein Geburtsdatum'],
        korrekt: 2,
        erklaerung: 'Länge und Einzigartigkeit zählen. Ein Passwortmanager erzeugt und speichert solche Passwörter.'
      },
      {
        frage: 'Du bekommst eine Mail "Klicke sofort, sonst wird dein Konto gesperrt". Was tust du?',
        optionen: ['Sofort klicken', 'Den Link ignorieren und den Dienst selbst über die bekannte Adresse aufrufen', 'Die Mail weiterleiten', 'Das Passwort in der Antwort schicken'],
        korrekt: 1,
        erklaerung: 'Zeitdruck ist ein typisches Phishing-Merkmal. Rufe den Dienst immer selbst über die bekannte Adresse auf.'
      }
    ]
  },
  {
    id: 'heimnetz',
    title: '10. Das Heimnetz: Router, WLAN & IP-Adressen',
    icon: '📡',
    category: 'Netzwerke',
    content: `Zu Hause verbindet ein **Router** alle deine Geräte untereinander und mit dem Internet.

- **LAN**: Verbindung per Kabel. **WLAN**: Verbindung per Funk.
- **DHCP**: Der Router verteilt automatisch IP-Adressen an alle Geräte im Heimnetz.
- **Private IP-Adressen** gelten nur im Heimnetz, zum Beispiel 192.168.0.x, 10.x.x.x oder 172.16.x.x bis 172.31.x.x.
- **Öffentliche IP-Adresse**: Mit ihr tritt dein Router im Internet auf. Alle Geräte teilen sie sich per **NAT** (Adressübersetzung).`,
    example: 'Dein Handy hat im WLAN die Adresse 192.168.178.23 (privat). Im Internet erscheinst du aber mit der öffentlichen Adresse deines Routers, genau wie alle anderen Geräte im Haushalt.',
    source: { label: 'RFC 1918: Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
    quiz: [
      {
        frage: 'Welche Adresse ist eine private IP-Adresse?',
        optionen: ['192.168.1.20', '8.8.8.8', '142.250.185.206', '1.1.1.1'],
        korrekt: 0,
        erklaerung: '192.168.0.0 bis 192.168.255.255 ist ein privater Bereich. Die anderen Adressen sind öffentlich.'
      },
      {
        frage: 'Wer verteilt im Heimnetz automatisch IP-Adressen?',
        optionen: ['Der DHCP-Dienst im Router', 'Die Tastatur', 'Der Monitor', 'Der Drucker allein'],
        korrekt: 0,
        erklaerung: 'DHCP vergibt Adressen automatisch. Üblicherweise übernimmt das der Router.'
      }
    ]
  },
  {
    id: 'cloud_und_apps',
    title: '11. Die Cloud: Rechner im Internet mieten',
    icon: '☁️',
    category: 'Cloud',
    content: `**Cloud** bedeutet: Programme und Daten liegen nicht auf deinem eigenen Gerät, sondern auf Servern eines Anbieters, die du über das Internet nutzt. Beispiele sind Online-Speicher, Streaming und Web-Mail.

Vorteile:
- Zugriff von jedem Gerät mit Internet.
- Der Anbieter kümmert sich um Hardware, Wartung und Ausfallsicherheit.
- Du zahlst oft nur, was du nutzt.

Aufgepasst:
- Ohne Internet kein Zugriff (außer bei Offline-Funktionen).
- Du gibst Daten in fremde Hände. Prüfe, **wo** sie gespeichert werden und wer Zugriff hat (Datenschutz, DSGVO).
- Auch in der Cloud gilt: Wichtige Daten zusätzlich sichern.`,
    example: 'Ein Foto, das du in einem Online-Speicher ablegst, liegt auf Servern im Rechenzentrum des Anbieters. Du kannst es auf dem Handy und am Laptop öffnen, ohne es zu kopieren.',
    quiz: [
      {
        frage: 'Wo liegen Daten bei einem Cloud-Dienst?',
        optionen: ['Nur auf deinem Handy', 'Auf Servern des Anbieters', 'Im Router', 'Auf dem Monitor'],
        korrekt: 1,
        erklaerung: 'Die Daten liegen in den Rechenzentren des Anbieters und werden über das Internet abgerufen.'
      },
      {
        frage: 'Was solltest du bei Cloud-Diensten beachten?',
        optionen: ['Nichts', 'Wo die Daten gespeichert werden und wer Zugriff hat', 'Nur die Farbe der App', 'Nur den Preis'],
        korrekt: 1,
        erklaerung: 'Datenschutz ist wichtig: Speicherort, Zugriffsrechte und Datenschutzbedingungen sollten bekannt sein.'
      }
    ]
  },
  {
    id: 'it_berufe',
    title: '12. IT als Beruf: Ausbildung und Karrierewege',
    icon: '🎓',
    category: 'Beruf',
    content: `Wer Informatik zum Beruf machen möchte, kann eine duale Ausbildung (Betrieb und Berufsschule) machen. Sie dauert in der Regel **3 Jahre** und endet mit einer **IHK-Abschlussprüfung**.

Typische Berufe:
- **Fachinformatiker/-in Anwendungsentwicklung (FIAE)**: Software entwickeln.
- **Fachinformatiker/-in Systemintegration (FISI)**: Netzwerke, Server und Arbeitsplätze planen und betreuen.
- **Fachinformatiker/-in Daten- und Prozessanalyse (FIDP)**: Daten auswerten und Prozesse verbessern.
- **Fachinformatiker/-in Digitale Vernetzung (FIDV)**: Vernetzte Geräte und Anlagen (z. B. IoT) einrichten.
- **IT-System-Elektroniker/-in**: IT-Technik und Elektrotechnik verbinden.

Die Prüfung besteht aus zwei Teilen: **Teil 1** findet etwa in der Mitte der Ausbildung statt, **Teil 2** am Ende.`,
    example: 'Beispiel: Eine Anwendungsentwicklerin schreibt Programme für eine Firmen-App, ein Systemintegrator richtet das Netzwerk für ein neues Büro ein, eine Datenanalystin findet in Verkaufszahlen Muster.',
    source: { label: 'IHK Berlin: Prüfung Fachinformatiker/-in', url: 'https://www.ihk.de/berlin/pruefungen-lehrgaenge/ausbildungspruefungen/pruefung-fachinformatiker-in-6132404' },
    quiz: [
      {
        frage: 'Wie lange dauert die Ausbildung zum/zur Fachinformatiker/-in in der Regel?',
        optionen: ['1 Jahr', '2 Jahre', '3 Jahre', '6 Jahre'],
        korrekt: 2,
        erklaerung: 'Die duale Ausbildung dauert in der Regel drei Jahre und endet mit der IHK-Abschlussprüfung.'
      },
      {
        frage: 'Welcher Beruf richtet vor allem Netzwerke, Server und Arbeitsplätze ein?',
        optionen: ['Fachinformatiker/-in Systemintegration', 'Fachinformatiker/-in Anwendungsentwicklung', 'Mediengestalter/-in', 'Kaufmann/Kauffrau'],
        korrekt: 0,
        erklaerung: 'Die Systemintegration plant, installiert und betreut IT-Infrastruktur. Die Anwendungsentwicklung programmiert Software.'
      }
    ]
  }
];
