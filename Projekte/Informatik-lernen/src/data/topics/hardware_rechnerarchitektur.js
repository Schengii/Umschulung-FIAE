/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Die Hauptkomponenten eines PCs benennen und ihre Aufgabe und Verbindung erklären',
    'Datenraten von RAM, PCIe, SATA und USB berechnen und vergleichen',
    'Netzteil, Speicher und Schnittstellen nach Anforderungen auswählen',
    'Eine Beschaffung strukturiert vergleichen (Leistung, Kosten, Service, Betriebskosten)'
  ],
  content: `
## Überblick: Wie ein PC aufgebaut ist

Ein PC besteht aus Bauteilen, die über **Busse** und **Steckplätze** auf dem **Mainboard** (Hauptplatine) verbunden sind. Die Kernidee stammt aus der Von-Neumann-Architektur: Prozessor, Speicher und Ein-/Ausgabe tauschen Daten über Leitungen aus.

![Blockschaubild eines PCs mit CPU, RAM, Chipsatz, GPU, NVMe, SATA und USB](pc-komponenten.svg "Die CPU hängt direkt am RAM, an PCIe-Geräten und am Chipsatz, der langsamere Schnittstellen bündelt")

## Prozessor (CPU)

Die CPU führt Befehle aus. Wichtige Kenngrößen:

- **Kerne und Threads**: Mehr Kerne erlauben echte Parallelität. Mit SMT (Intel: Hyper-Threading) arbeiten zwei Threads auf einem Kern.
- **Takt** in GHz: Zahl der Arbeitstakte pro Sekunde. Die tatsächliche Leistung hängt zusätzlich von den **Befehlen pro Takt (IPC)** ab, deshalb sind Taktraten verschiedener Generationen nicht direkt vergleichbar.
- **Cache** (L1, L2, L3): kleine, sehr schnelle Zwischenspeicher, die Wartezeiten auf den RAM verkürzen.
- **TDP** (Thermal Design Power): Richtwert für die abzuführende Wärmeleistung. Kühler und Netzteil müssen dazu passen.
- **Sockel**: Der Sockel des Mainboards muss zur CPU passen (zum Beispiel LGA1700 bei Intel oder AM5 bei AMD). Eine falsche Paarung lässt sich weder einbauen noch betreiben.

Eine **integrierte Grafikeinheit (iGPU)** reicht für Büroarbeitsplätze, für CAD, Videoschnitt oder KI-Aufgaben braucht man meist eine dedizierte Grafikkarte.

## Arbeitsspeicher (RAM)

RAM ist **flüchtig**: Der Inhalt geht beim Ausschalten verloren. Der Speicher hält die Daten und Programme, mit denen die CPU gerade arbeitet.

| Kenngröße | Bedeutung |
| :--- | :--- |
| DDR4 / DDR5 | Speichergeneration, nicht untereinander kompatibel (andere Kerbe im Riegel) |
| Übertragungsrate in MT/s | z. B. DDR4-3200 = 3.200 Millionen Transfers pro Sekunde |
| Kanäle (Single, Dual) | mehrere Riegel parallel erhöhen die Bandbreite |
| CL (CAS-Latenz) | Wartezyklen bis zur Antwort, kleiner ist besser |
| ECC | Fehlerkorrektur, Standard in Servern |

**Bandbreite berechnen**: Ein Kanal überträgt 64 Bit = 8 Byte pro Transfer. DDR4-3200 liefert damit 3.200 · 10⁶ · 8 Byte = **25,6 GB/s** je Kanal, im Dual-Channel-Betrieb **51,2 GB/s**.

> [!tip] Praxis
> Zwei gleiche Riegel in die vom Hersteller vorgesehenen Steckplätze setzen (Dual-Channel). Ein einzelner großer Riegel ist langsamer als zwei kleinere.

## Mainboard und Chipsatz

Das Mainboard trägt Sockel, RAM-Steckplätze, Erweiterungssteckplätze und Anschlüsse. Der **Chipsatz** bündelt langsamere Schnittstellen (SATA, USB, Netzwerk, Audio) und ist per schneller Verbindung an die CPU angebunden. Die **Formfaktoren** bestimmen die Größe und das Gehäuse:

| Formfaktor | Größe | Typische Verwendung |
| :--- | :--- | :--- |
| ATX | 305 × 244 mm | Tower, viele Steckplätze |
| Micro-ATX | 244 × 244 mm | kompakte Büro-PCs |
| Mini-ITX | 170 × 170 mm | Mini-PCs, wenig Erweiterung |

Beim Start prüft die Firmware (**UEFI**, früher BIOS) die Hardware (POST) und startet das Betriebssystem. Im UEFI stellt man Bootreihenfolge, Virtualisierung und Sicherheitsfunktionen wie Secure Boot und TPM ein.

## Massenspeicher und Anbindung

| Typ | Anbindung | Typische Größenordnung |
| :--- | :--- | :--- |
| HDD | SATA | 100–250 MB/s, mechanisch, günstig pro TB |
| SATA-SSD | SATA III (6 Gbit/s) | bis ca. 550 MB/s |
| NVMe-SSD | PCIe (M.2) | 3.000 MB/s und deutlich mehr |

**Warum 6 Gbit/s nur etwa 600 MB/s ergeben**: SATA verwendet die 8b/10b-Kodierung, bei der 10 übertragene Bit nur 8 Bit Nutzdaten ergeben. 6 Gbit/s · 0,8 = 4,8 Gbit/s = 600 MB/s.

**PCIe** arbeitet mit Lanes (Leitungspaaren). Je Lane und Richtung liefert PCIe 3.0 rund 0,98 GB/s, PCIe 4.0 rund 1,97 GB/s, PCIe 5.0 rund 3,94 GB/s. Eine NVMe-SSD nutzt typisch vier Lanes (x4), also bei PCIe 3.0 etwa 3,9 GB/s theoretisch.

> [!warning] Häufige Verwechslung
> Datenraten von Leitungen werden in **Bit** pro Sekunde (Gbit/s) angegeben, Speichergeschwindigkeiten in **Byte** pro Sekunde (MB/s). 1 Byte = 8 Bit.

## Grafik, Schnittstellen und Peripherie

- **Grafikkarte**: Eigene GPU und eigener Speicher. Der benötigte Bildspeicher (Framebuffer) ergibt sich aus Auflösung × Farbtiefe: 1.920 × 1.080 Pixel · 3 Byte = 6.220.800 Byte, also rund 6,2 MB je Bild.
- **USB**: USB 2.0 mit 480 Mbit/s, USB 3.2 Gen 1 mit 5 Gbit/s, Gen 2 mit 10 Gbit/s, Gen 2x2 mit 20 Gbit/s, USB4 mit bis zu 40 Gbit/s. Der Stecker (A, C) sagt nichts über die Geschwindigkeit aus.
- **Anzeigeanschlüsse**: HDMI und DisplayPort. Hohe Auflösungen bei hoher Bildwiederholrate setzen eine ausreichend neue Version voraus (zum Beispiel DisplayPort 1.4 oder HDMI 2.1), Kabel und Gerät müssen sie beide unterstützen.
- **Netzwerk**: Gigabit-Ethernet (1 Gbit/s) ist Standard, 2,5 oder 10 Gbit/s je nach Bedarf.

## Netzteil und Energie

Das Netzteil wandelt Wechselspannung in Gleichspannungen (3,3 V, 5 V, 12 V). Es muss die **Spitzenleistung** aller Komponenten decken, mit **Reserve** (etwa 20 bis 30 %), aber nicht stark überdimensioniert sein, weil der Wirkungsgrad bei sehr niedriger Last sinkt.

Der **Wirkungsgrad** η ist das Verhältnis von abgegebener zu aufgenommener Leistung. Die Klassifizierung **80 PLUS** (Bronze, Silber, Gold, Platin, Titanium) legt Mindestwerte fest.

> [!example] Rechenbeispiel Netzteil und Stromkosten
> Ein PC benötigt 350 W an Gleichspannung. Das Netzteil hat η = 90 %. Aufnahme aus dem Netz: 350 W : 0,9 = **388,9 W**.
> Läuft der PC 8 Stunden an 220 Tagen im Jahr: 0,3889 kW · 8 h · 220 = 684,4 kWh. Bei 0,30 € je kWh sind das **205,32 € pro Jahr**.

## Auswahl und Beschaffung

Bei der Beschaffung eines Arbeitsplatzes geht man strukturiert vor:

1. **Anforderungen** klären (Software, Nutzer, Arbeitsweise, Bildschirmanzahl, Mobilität).
2. **Konfiguration** festlegen und Alternativen einholen.
3. **Angebote vergleichen**: Preis, Leistung, Garantie, Vor-Ort-Service, Lieferzeit, Verfügbarkeit von Ersatzteilen.
4. **Wirtschaftlichkeit** über die Gesamtkosten (TCO) bewerten: Anschaffung plus Strom, Wartung, Support und Entsorgung.
5. **Entscheidung** dokumentieren, zum Beispiel mit einer Nutzwertanalyse.

Gesetzlich gilt die **Gewährleistung** (in der Regel 2 Jahre auf neue Waren). Eine **Herstellergarantie** ist freiwillig und kann darüber hinausgehen.

## Fehlersuche bei Hardware

Gehe nach dem **Ausschlussprinzip** vor: Netz und Kabel prüfen, Komponenten nacheinander tauschen oder entfernen, Fehlermeldung oder Pieptöne (POST-Codes) im Handbuch nachschlagen. Typische Ursachen: lose RAM-Riegel, defektes Netzteil, überhitzte CPU, leere BIOS-Batterie (Zeit springt zurück). Arbeite stets **ohne Spannung** und mit **ESD-Schutz** (Armband oder Erdung), weil statische Entladung Bauteile zerstören kann.

## Speicherhierarchie: warum es mehrere Speicherebenen gibt

Schneller Speicher ist teuer und klein, großer Speicher ist günstig und langsam. Moderne Rechner kombinieren deshalb mehrere Ebenen. Je weiter unten, desto größer, billiger und langsamer.

| Ebene | Typische Größe | Typische Zugriffszeit (Größenordnung) | Flüchtig? |
| :--- | :--- | :--- | :---: |
| Register in der CPU | wenige hundert Byte | unter 1 ns | ja |
| L1-Cache (je Kern) | 32 bis 64 KiB | ca. 1 ns | ja |
| L2- / L3-Cache | 256 KiB bis 1 MiB je Kern / mehrere MiB bis > 100 MiB gemeinsam | wenige ns bis ca. 10 ns | ja |
| Arbeitsspeicher (DRAM) | 8 bis 128 GiB und mehr | ca. 50 bis 100 ns | ja |
| NVMe-SSD | 256 GB bis mehrere TB | ca. 10 bis 100 µs | nein |
| HDD | 1 bis 20 TB und mehr | ca. 5 bis 10 ms | nein |

Der Cache funktioniert, weil Programme meist Daten wiederverwenden (*zeitliche Lokalität*) oder benachbarte Daten nacheinander lesen (*räumliche Lokalität*). Wird ein Wert im Cache gefunden, spricht man von einem **Cache-Hit**, sonst von einem **Cache-Miss**. Die Zahlen oben sind Größenordnungen und unterscheiden sich je nach Modell deutlich. In der Prüfung zählt das Verhältnis: Zwischen RAM und HDD liegen etwa fünf Zehnerpotenzen.

## Rechenbeispiele für die Prüfung

**Datenrate umrechnen.** Netzwerk- und Schnittstellenraten stehen meist in Bit pro Sekunde, Dateigrößen in Byte. Ein Byte hat 8 Bit. Also gilt: 1 Gbit/s = 1000 Mbit/s = 125 MB/s (Brutto, ohne Protokoll-Overhead). Eine 10-GB-Datei braucht bei 1 Gbit/s und 80 % realer Auslastung: 10 GB * 8 = 80 Gbit; 80 Gbit / 0,8 Gbit/s = 100 s.

**Speicherbedarf eines Bildes.** Ein unkomprimiertes Full-HD-Bild mit 24 Bit Farbtiefe hat 1920 * 1080 = 2 073 600 Pixel. Mal 3 Byte ergibt 6 220 800 Byte, also rund 6,2 MB (dezimal) oder 5,9 MiB (binär). Ein Video mit 30 Bildern pro Sekunde braucht unkomprimiert damit ca. 187 MB/s, deshalb gibt es Kompression.

**Arbeitsspeicherbandbreite.** Die Bandbreite eines Moduls ergibt sich aus Übertragungsrate mal Busbreite. DDR4-3200 überträgt 3200 Millionen Transfers pro Sekunde über 64 Bit (8 Byte): 3200 * 8 Byte = 25,6 GB/s. Im Dual-Channel-Betrieb verdoppelt sich der Wert auf 51,2 GB/s, sofern beide Kanäle mit je einem Modul bestückt sind. DDR5-4800 erreicht je Kanal 38,4 GB/s.

**Netzteil, Verlustleistung und Stromkosten.** Ein Rechner braucht 300 W an Gleichstromleistung. Das Netzteil hat 85 % Wirkungsgrad.

1. Aufnahme aus der Steckdose: 300 W / 0,85 = 352,9 W.
2. Verlustleistung (wird zu Wärme): 352,9 W - 300 W = 52,9 W.
3. Bei 8 h an 220 Tagen: 0,3529 kW * 1760 h = 621 kWh.
4. Bei 0,35 Euro/kWh: 621 kWh * 0,35 Euro = 217,40 Euro im Jahr.

Ein effizienteres Netzteil mit 92 % Wirkungsgrad zieht nur 326 W (Ersparnis ca. 27 W) und spart bei diesem Nutzungsprofil rund 17 Euro im Jahr. Wirtschaftlich entscheidet die Amortisationszeit: Mehrpreis geteilt durch jährliche Ersparnis.

## Firmware, Bootvorgang und Sicherheit

Beim Einschalten läuft zuerst die **Firmware** (früher BIOS, heute meist **UEFI**). Der POST (*Power-On Self-Test*) prüft Prozessor, Speicher und Grundkomponenten. Danach startet UEFI das Betriebssystem über den Bootloader auf der EFI-Systempartition.

- **MBR** (Master Boot Record, BIOS-Zeit): maximal 4 primäre Partitionen, Datenträger bis 2 TiB nutzbar.
- **GPT** (GUID Partition Table, UEFI): sehr große Datenträger und viele Partitionen, redundante Partitionstabelle.
- **Secure Boot** startet nur kryptografisch signierte Bootloader und schützt vor manipulierten Startkomponenten (Bootkits).
- **TPM** (Trusted Platform Module) speichert Schlüssel hardwaregeschützt, etwa für die Laufwerksverschlüsselung. Windows 11 verlangt TPM 2.0.
- **Firmware-Updates** schließen Sicherheitslücken, bergen aber ein Risiko: Ein Stromausfall während des Flashens kann das Mainboard unbrauchbar machen. Deshalb nur mit stabiler Stromversorgung und nach Herstelleranleitung aktualisieren.

## Server und Rechenzentrumshardware

Server sind auf Verfügbarkeit und Wartbarkeit ausgelegt, nicht auf Spitzenleistung für Einzelplatz-Software.

- **19-Zoll-Rack:** Die Breite der Geräteeinbauebene beträgt 19 Zoll (482,6 mm). Die Höhe wird in **Höheneinheiten (HE, englisch U)** gemessen, 1 HE = 44,45 mm. Ein Standard-Rack hat meist 42 HE.
- **Redundanz:** zwei Netzteile (N+1 oder 2N), gespiegelte Systemlaufwerke (RAID 1), mehrere Netzwerkkarten (Bonding/Teaming), ECC-Arbeitsspeicher.
- **Hot-Swap:** Netzteile, Lüfter und Laufwerke lassen sich im laufenden Betrieb tauschen.
- **Out-of-Band-Management:** Eigene Verwaltungskarten (iLO, iDRAC, IPMI/BMC) erlauben Zugriff, Neustart und Konsole auch bei abgestürztem Betriebssystem. Sie gehören in ein getrenntes Management-Netz, weil sie sonst ein attraktives Angriffsziel sind.
- **Kühlung:** Warm- und Kaltgang trennen, Blindblenden einsetzen und die Abwärme aller Geräte planen. Elektrische Leistung wird fast vollständig zu Wärme: 1 kW Aufnahme heißt rund 1 kW Kühlleistung.

## Fehlerbilder und erste Prüfschritte

| Symptom | Wahrscheinliche Ursache | Erster Prüfschritt |
| :--- | :--- | :--- |
| Kein Lebenszeichen, keine Lüfter | Netzteil, Netzkabel, Steckdosenleiste | anderes Kabel und Steckdose testen, Netzteilschalter prüfen |
| Lüfter laufen, aber kein Bild | RAM, Grafikkarte, falsch gesteckte Kabel | RAM neu stecken, einzeln testen, Monitorkabel prüfen |
| Piepcodes beim Start | POST meldet Hardwarefehler | Code im Mainboardhandbuch nachschlagen |
| Zufällige Neustarts unter Last | Überhitzung, schwaches Netzteil | Temperaturen auslesen, Lüfter und Kühler reinigen, Wärmeleitpaste prüfen |
| Datum und Uhrzeit springen zurück | leere CMOS-Batterie (CR2032) | Batterie wechseln |
| Datenträger wird nicht erkannt | Kabel, Anschluss, defekter Datenträger | anderen Port und anderes Kabel testen, SMART-Werte prüfen |
| Blue Screen mit wechselnden Fehlern | defekter Arbeitsspeicher oder Treiber | Speichertest (z. B. MemTest86), Treiber zurücksetzen |

Dokumentiere jeden Schritt im Ticket. Bei Servern mit Garantie gilt: Erst Fehlerbild und Seriennummer sichern, dann den Herstellersupport einbeziehen, bevor Komponenten getauscht werden, die zum Garantieverlust führen könnten.

> [!exam] Prüfungshinweis
> In AP1 werden gern Datenraten (Bit/Byte), Netzteilberechnung mit Wirkungsgrad, Speicherbedarf von Bildern, RAID-Kapazität und der Vergleich zweier Angebote verlangt. Rechenweg immer mit Einheiten aufschreiben.
`,
  exercises: [
    {
      id: 'netzteil-dimensionieren',
      title: 'Netzteil und Stromkosten berechnen',
      prompt: 'Ein Büro-PC benötigt im Betrieb 240 W an Gleichspannung. Das Netzteil hat einen Wirkungsgrad von 85 %. Der PC läuft an 230 Tagen im Jahr 9 Stunden täglich, der Strompreis beträgt 0,32 € je kWh. Berechne die Leistungsaufnahme aus dem Netz und die Stromkosten pro Jahr.',
      hints: ['Aufnahme = abgegebene Leistung : η', 'Energie = Leistung · Zeit, danach mal Preis'],
      solution: 'Aufnahme: 240 W : 0,85 = 282,35 W = 0,2824 kW. Energie pro Jahr: 0,2824 kW · 9 h · 230 = 584,5 kWh. Kosten: 584,5 kWh · 0,32 €/kWh = 187,04 € pro Jahr (gerundet).'
    },
    {
      id: 'ram-bandbreite',
      title: 'RAM-Bandbreite bestimmen',
      prompt: 'Ein Server nutzt DDR5-4800-Module. Pro Kanal werden 64 Bit breit übertragen. Berechne die Bandbreite eines Kanals und bei vier Kanälen.',
      hints: ['64 Bit = 8 Byte', 'MT/s mal Byte je Transfer'],
      solution: 'Ein Kanal: 4.800 · 10⁶ Transfers/s · 8 Byte = 38.400 · 10⁶ Byte/s = 38,4 GB/s. Vier Kanäle: 4 · 38,4 GB/s = 153,6 GB/s (theoretischer Höchstwert).'
    },
    {
      id: 'bildspeicher-4k',
      title: 'Bildspeicher einer Auflösung berechnen',
      prompt: 'Wie viel Speicher benötigt ein einzelnes Bild mit 3.840 × 2.160 Pixeln bei einer Farbtiefe von 24 Bit? Gib das Ergebnis in Byte und in MiB an.',
      hints: ['24 Bit = 3 Byte je Pixel', '1 MiB = 1.048.576 Byte'],
      solution: 'Pixel: 3.840 · 2.160 = 8.294.400. Speicher: 8.294.400 · 3 Byte = 24.883.200 Byte. In MiB: 24.883.200 : 1.048.576 ≈ 23,7 MiB.'
    },
    {
      id: 'speicher-auswahl',
      title: 'Speicheranbindung begründet wählen',
      prompt: 'Für einen Videoschnitt-Arbeitsplatz soll ein schneller Speicher für Projektdaten gewählt werden. Zur Auswahl stehen eine HDD (SATA, 160 MB/s), eine SATA-SSD (550 MB/s) und eine NVMe-SSD an PCIe 3.0 x4. Entscheide begründet und berechne, wie lange das Kopieren von 80 GB (dezimal) mit der HDD und der SATA-SSD dauert.',
      hints: ['80 GB = 80.000 MB', 'Zeit = Datenmenge : Rate'],
      solution: 'HDD: 80.000 MB : 160 MB/s = 500 s (rund 8,3 Minuten). SATA-SSD: 80.000 MB : 550 MB/s ≈ 145 s (rund 2,4 Minuten). Die NVMe-SSD erreicht bei PCIe 3.0 x4 theoretisch rund 3.900 MB/s (real meist 3.000 MB/s) und ist für große Videodateien die beste Wahl, solange das Mainboard einen M.2-Steckplatz mit PCIe-Anbindung hat und das Budget es erlaubt.'
    }
  ],
  quiz: [
    {
      question: 'Welche Bandbreite hat ein Speicherkanal mit DDR4-3200 bei 64 Bit Breite?',
      options: ['12,8 GB/s', '25,6 GB/s', '51,2 GB/s', '3,2 GB/s'],
      correct: 1,
      explanation: '3.200 Millionen Transfers pro Sekunde mal 8 Byte ergeben 25,6 GB/s. 51,2 GB/s wären zwei Kanäle.'
    },
    {
      question: 'Warum liefert SATA III mit 6 Gbit/s nur etwa 600 MB/s Nutzdaten?',
      options: [
        'Wegen der 8b/10b-Kodierung gehen 20 % für die Kodierung verloren',
        'Weil SATA nur mit halber Taktfrequenz arbeitet',
        'Weil 1 Byte 10 Bit hat',
        'Weil SSDs immer langsamer sind als die Schnittstelle'
      ],
      correct: 0,
      explanation: 'Bei 8b/10b ergeben 10 übertragene Bit nur 8 Bit Nutzdaten. 6 Gbit/s · 0,8 = 4,8 Gbit/s = 600 MB/s.'
    },
    {
      question: 'Welche Aussage zu RAM ist richtig?',
      options: [
        'RAM behält seinen Inhalt ohne Strom',
        'RAM ist flüchtig und hält die gerade genutzten Daten und Programme',
        'RAM ist langsamer als eine Festplatte',
        'RAM ersetzt den Cache der CPU'
      ],
      correct: 1,
      explanation: 'RAM verliert seinen Inhalt beim Ausschalten und ist deutlich schneller als Massenspeicher. Der CPU-Cache ist noch schneller und kleiner.'
    },
    {
      question: 'Ein Netzteil mit 90 % Wirkungsgrad gibt 360 W ab. Wie viel Leistung nimmt es aus dem Netz auf?',
      options: ['324 W', '360 W', '400 W', '450 W'],
      correct: 2,
      explanation: 'Aufnahme = abgegebene Leistung : Wirkungsgrad = 360 W : 0,9 = 400 W.'
    },
    {
      question: 'Wofür ist der Chipsatz auf dem Mainboard hauptsächlich zuständig?',
      options: [
        'Er ersetzt die CPU bei hoher Last',
        'Er bündelt langsamere Schnittstellen wie SATA, USB und Netzwerk',
        'Er speichert das Betriebssystem',
        'Er erzeugt die Betriebsspannung'
      ],
      correct: 1,
      explanation: 'Der Chipsatz bindet die langsameren Schnittstellen an die CPU an. Schnelle Geräte wie GPU und NVMe-SSD hängen oft direkt an der CPU.'
    },
    {
      question: 'Welche Maßnahme schützt Bauteile beim Einbau vor statischer Entladung?',
      options: ['ESD-Armband bzw. Erdung', 'Bauteile anfeuchten', 'Netzteil eingeschaltet lassen', 'Synthetische Kleidung tragen'],
      correct: 0,
      explanation: 'Ein ESD-Armband oder Erdung leitet Ladungen ab. Der PC muss dabei spannungsfrei sein.'
    },
    {
      question: 'Wie viel Speicher benötigt ein Bild mit 1.920 × 1.080 Pixeln bei 24 Bit Farbtiefe (ohne Kompression)?',
      options: ['ca. 2,1 MB', 'ca. 6,2 MB', 'ca. 16,6 MB', 'ca. 62 MB'],
      correct: 1,
      explanation: '1.920 · 1.080 · 3 Byte = 6.220.800 Byte, also rund 6,2 MB.'
    }
  ],
  relatedLabs: [
    { id: 'cpu_architecture_lab', label: 'CPU-Architektur' },
    { id: 'transfer_time_lab', label: 'Übertragungszeit-Rechner' },
    { id: 'raid_calculator', label: 'RAID-Rechner' }
  ],
  sources: [
    { title: 'Wikipedia: Arbeitsspeicher (DDR-SDRAM)', url: 'https://de.wikipedia.org/wiki/DDR-SDRAM' },
    { title: 'Wikipedia: PCI Express', url: 'https://de.wikipedia.org/wiki/PCI_Express', note: 'Lanes und Datenraten je Generation' },
    { title: 'Wikipedia: Serial ATA', url: 'https://de.wikipedia.org/wiki/Serial_ATA', note: '8b/10b-Kodierung und Nutzdatenrate' },
    { title: 'Wikipedia: Universal Serial Bus', url: 'https://de.wikipedia.org/wiki/Universal_Serial_Bus', note: 'Geschwindigkeitsklassen' },
    { title: 'Wikipedia: Formfaktor (Mainboard)', url: 'https://de.wikipedia.org/wiki/ATX' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
