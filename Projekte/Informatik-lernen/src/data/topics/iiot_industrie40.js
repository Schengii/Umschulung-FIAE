/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Industrie 4.0, Cyber-physische Systeme und das Industrial Internet of Things (IIoT) erklären',
    'Die Automatisierungspyramide beschreiben und Komponenten wie SPS, SCADA, MES und ERP einordnen',
    'Den Zyklus einer SPS, digitale und analoge Signale sowie einfache Steuerungslogik (Selbsthaltung) erklären',
    'Industrielle Kommunikation (Feldbus, PROFINET, Modbus, OPC UA, MQTT) vergleichen und passend auswählen',
    'IT/OT-Sicherheit, Predictive Maintenance und die Kennzahl OEE begründen und berechnen'
  ],
  content: `
## Von Industrie 1.0 bis 4.0

Der Begriff **Industrie 4.0** wurde 2011 auf der Hannover Messe in Deutschland bekannt. Er beschreibt die **vierte industrielle Revolution**:

1. **Mechanisierung** mit Wasser- und Dampfkraft (Ende des 18. Jahrhunderts).
2. **Massenproduktion** mit Fließband und Elektrizität (um 1900).
3. **Automatisierung** mit Elektronik, SPS und IT (ab den 1970er-Jahren).
4. **Vernetzung** von Maschinen, Produkten und Menschen über das Internet der Dinge und Datenanalyse.

Kernidee: Produktionsanlagen **tauschen Daten aus**, passen sich selbst an und optimieren sich anhand von Messwerten. Stichworte sind **Losgröße 1** (individuelle Produkte zu Preisen der Serienfertigung), **flexible Fertigung** und **datengetriebene Wartung**.

**Cyber-physische Systeme (CPS)** verbinden physische Prozesse (Motor, Förderband, Roboter) mit Software, Sensoren und Netzwerk. Das **Industrial Internet of Things (IIoT)** ist das Internet der Dinge im industriellen Umfeld: vernetzte Sensoren und Maschinen, deren Daten in Edge-Geräten oder der Cloud ausgewertet werden. Gegenüber dem Verbraucher-IoT sind Zuverlässigkeit, Echtzeit und Sicherheit deutlich wichtiger.

Das **Referenzarchitekturmodell RAMI 4.0** ordnet Industrie-4.0-Komponenten in einem dreidimensionalen Würfel: Lebenszyklus, Hierarchieebenen und Schichten (von Asset bis Geschäftsprozess). Die **Verwaltungsschale** (*Asset Administration Shell*) ist die digitale Beschreibung eines Bauteils oder einer Maschine mit allen Daten und Fähigkeiten, die herstellerübergreifend genutzt werden können.

## Die Automatisierungspyramide

![Automatisierungspyramide](automatisierungspyramide.svg "Von Sensoren und Aktoren über SPS, SCADA und MES bis zum ERP-System")

| Ebene | Aufgabe | Typische Technik | Zeitverhalten |
| :--- | :--- | :--- | :--- |
| **Feldebene** | Messen und Schalten | Sensoren, Aktoren, Antriebe, IO-Link | Echtzeit |
| **Steuerungsebene** | Regeln und Steuern | SPS (PLC), Motion Controller | Millisekunden |
| **Prozessleitebene** | Überwachen und Bedienen | SCADA, HMI, Leitstand | Sekunden |
| **Betriebsleitebene** | Fertigung planen und verfolgen | MES (Manufacturing Execution System) | Stunden bis Tage |
| **Unternehmensebene** | Aufträge, Material, Finanzen | ERP-System | Tage bis Wochen |

Klassisch ist die Kommunikation **hierarchisch**: Jede Ebene spricht nur mit der darüber und darunter. Industrie 4.0 löst das auf. Sensoren und Maschinen sollen Daten **direkt** bereitstellen (z. B. über OPC UA oder MQTT), sodass Auswertung und Cloud-Dienste auch ohne Umweg über jede Ebene Zugriff haben. Zeit- und sicherheitskritische Steuerung bleibt dabei lokal.

## Sensoren, Aktoren und Signale

- **Sensoren** erfassen physikalische Größen: Taster, Endschalter, **induktive** (Metall), **kapazitive** (fast alle Stoffe), **optische** (Lichtschranke) Näherungsschalter, Temperatur-, Druck-, Füllstands-, Durchflusssensoren.
- **Aktoren** setzen Befehle um: Schütze, Relais, Motoren, Ventile, Zylinder, Heizungen.

**Digitale Signale** kennen zwei Zustände. In der Industrie üblich ist **24 V Gleichspannung**: Nach IEC 61131-2 gelten für Eingänge ungefähr 15 bis 30 V als logisch 1 und −3 bis 5 V als logisch 0. **Analoge Signale** bilden einen Messbereich kontinuierlich ab, meist als **0 bis 10 V** oder als **4 bis 20 mA**. Die Stromschleife hat Vorteile: Sie ist störunempfindlicher und über lange Leitungen stabil. Der Nullpunkt liegt bei 4 mA (*Live Zero*), deshalb bedeutet 0 mA einen Leitungsbruch und nicht den Messwert 0.

**Skalierung:** Ein Drucksensor misst 0 bis 10 bar und liefert 4 bis 20 mA. Bei 12 mA gilt: (12 − 4) : (20 − 4) = 0,5, also 0,5 · 10 bar = **5 bar**. Ein 12-Bit-Analogeingang unterteilt den Bereich in 4096 Stufen, die Auflösung beträgt bei 10 bar etwa 10 bar : 4096 ≈ 2,4 mbar pro Stufe.

**Sicherheitsprinzip Ruhestromprinzip:** Not-Halt und Stopptaster sind als **Öffner** ausgeführt. Bei Drahtbruch oder Spannungsausfall fällt der Stromkreis ab und die Anlage geht in den sicheren Zustand. Ein Schließer würde einen Fehler nicht bemerken.

## Die speicherprogrammierbare Steuerung (SPS)

Eine **SPS (englisch PLC, Programmable Logic Controller)** ist ein robuster Industrierechner mit Ein- und Ausgängen, der Programme **zyklisch** abarbeitet:

1. **Eingänge einlesen** (Prozessabbild der Eingänge, PAE).
2. **Programm abarbeiten** (Anweisung für Anweisung).
3. **Ausgänge schreiben** (Prozessabbild der Ausgänge, PAA).
4. Von vorn. Die Dauer heißt **Zykluszeit** (typisch wenige Millisekunden).

Während eines Zyklus ändern sich die Eingangswerte im Programm nicht, das sorgt für konsistente Entscheidungen. Eine Anlage reagiert allerdings frühestens im nächsten Zyklus. Die Zykluszeit begrenzt also die Reaktionsgeschwindigkeit. Ein **Watchdog** überwacht die Zykluszeit und setzt bei Überschreitung die Steuerung in einen sicheren Zustand.

**Programmiersprachen nach IEC 61131-3:**

| Sprache | Kürzel | Charakter |
| :--- | :--- | :--- |
| Kontaktplan (Ladder Diagram) | KOP / LD | grafisch, wie ein Stromlaufplan |
| Funktionsbausteinsprache | FBD / FUP | grafisch, Logikbausteine mit Verbindungen |
| Strukturierter Text | ST | textbasiert, ähnlich Pascal, für Berechnungen |
| Ablaufsprache | SFC / AS | Schrittketten für sequenzielle Abläufe |
| Anweisungsliste | IL / AWL | assemblerähnlich, in der Norm als veraltet gekennzeichnet |

### Beispiel: Selbsthaltung

Ein Motor soll mit dem Starttaster S1 (Schließer) einschalten, nach dem Loslassen weiterlaufen und mit dem Stopptaster S2 (Öffner) ausschalten. Die Logik lautet:

**Q = (S1 ODER Q) UND S2**

Dabei ist S2 im Ruhezustand (nicht betätigt) 1, weil der Öffner den Strom führt. Wird S1 gedrückt, wird Q = 1. Danach hält Q sich selbst (der Term „ODER Q“). Betätigt man S2, wird S2 = 0 und damit Q = 0. Bei Drahtbruch am Stopptaster fällt der Motor ebenfalls ab. Das ist die gewünschte Sicherheitseigenschaft.

## Industrielle Kommunikation

| Technik | Einordnung | Merkmale |
| :--- | :--- | :--- |
| **IO-Link** | Punkt-zu-Punkt zu Sensoren und Aktoren | digitale Parametrierung und Diagnose über 3-Draht-Leitung, bis 20 m |
| **PROFIBUS** | klassischer Feldbus (seriell, RS-485) | weit verbreitet, durch PROFINET abgelöst |
| **PROFINET** | Industrial Ethernet | Echtzeit auf Ethernet-Basis, verbreitet in Siemens-Umfeld |
| **EtherCAT** | Industrial Ethernet | sehr schnell (Zykluszeiten unter 1 ms), für Antriebe und Robotik |
| **Modbus RTU / TCP** | einfaches Master-Slave-Protokoll | offen, weit verbreitet, TCP-Port **502**, **keine** Authentifizierung |
| **OPC UA** | plattformunabhängiger Standard für Daten und Modelle | Informationsmodelle, Client-Server und Publish-Subscribe, Zertifikate, Signatur und Verschlüsselung eingebaut, Port **4840** |
| **MQTT** | leichtgewichtiges Publish-Subscribe-Protokoll | Broker verteilt Nachrichten, ideal für Sensoren und Cloud, Port **1883** (**8883** mit TLS) |
| **TSN** | Erweiterung von Ethernet (Time-Sensitive Networking) | deterministische Latenzen im Standard-Ethernet |

### MQTT im Detail

Bei **MQTT** veröffentlichen Geräte (*Publisher*) Nachrichten unter einem **Topic** (z. B. \`werk1/halle2/presse3/temperatur\`) an einen zentralen **Broker**. Interessenten (*Subscriber*) abonnieren Topics, auch mit Platzhaltern (\`+\` für eine Ebene, \`#\` für alle darunter). Sender und Empfänger kennen sich nicht, das entkoppelt sie.

- **QoS 0:** höchstens einmal (Senden ohne Bestätigung, schnell, Verlust möglich).
- **QoS 1:** mindestens einmal (Bestätigung, Duplikate möglich).
- **QoS 2:** genau einmal (aufwendigster Vierwege-Austausch).
- **Retained Message:** Der Broker behält den letzten Wert und liefert ihn neuen Abonnenten sofort.
- **Last Will:** Eine vorab hinterlegte Nachricht wird veröffentlicht, wenn ein Gerät unerwartet die Verbindung verliert.

**Datenmengen abschätzen:** 200 Sensoren senden je 10 Messwerte pro Sekunde mit 8 Byte Nutzlast: 200 · 10 · 8 Byte = 16 000 Byte/s = 16 kB/s. Pro Tag sind das 16 000 · 86 400 ≈ 1,38 GB reine Nutzdaten. Protokoll-Overhead und Topic-Namen kommen hinzu. Deshalb filtert und verdichtet man am Rand (*Edge*), statt alles in die Cloud zu senden.

## Edge, Cloud, digitaler Zwilling

- **Edge Computing:** Daten werden **nahe an der Maschine** vorverarbeitet. Das spart Bandbreite, senkt die Latenz und funktioniert auch bei Verbindungsabbruch.
- **Cloud:** Langzeitspeicherung, aufwendige Analysen, maschinelles Lernen und Auswertungen über mehrere Standorte.
- **Digitaler Zwilling:** ein digitales Abbild einer Maschine oder Anlage, das mit realen Daten gespeist wird. Man kann damit simulieren, optimieren und Fehler vorhersagen, ohne die reale Anlage zu beeinflussen.
- **Predictive Maintenance (vorausschauende Wartung):** Zustandsdaten wie Schwingung, Temperatur oder Stromaufnahme zeigen Verschleiß an, bevor die Maschine ausfällt. Wartung erfolgt nach Zustand statt nach starrem Intervall oder erst nach dem Ausfall. Das senkt ungeplante Stillstände (verbunden mit MTBF und MTTR aus dem ITSM-Artikel).

## OEE: Wie gut läuft die Anlage?

Die **Gesamtanlageneffektivität (OEE, Overall Equipment Effectiveness)** ist das Produkt aus drei Faktoren:

**OEE = Verfügbarkeit · Leistung · Qualität**

- **Verfügbarkeit** = tatsächliche Laufzeit : geplante Produktionszeit.
- **Leistung** = tatsächlich produzierte Menge : mögliche Menge bei idealer Taktzeit während der Laufzeit.
- **Qualität** = Gutteile : produzierte Teile.

**Beispiel:** Geplant sind 480 Minuten, 48 Minuten Stillstand ergeben 432 Minuten Laufzeit (Verfügbarkeit 90 %). Die ideale Taktzeit beträgt 1 Minute pro Teil, es wurden 360 Teile gefertigt (Leistung 360 : 432 = 83,3 %), davon 342 gut (Qualität 342 : 360 = 95 %). OEE = 0,9 · 0,833 · 0,95 = **71,3 %**. Als Richtwert gelten rund 85 % als sehr gut für diskrete Fertigung. Die Zerlegung zeigt, wo der größte Verlust liegt (hier die Leistung).

## IT/OT-Sicherheit

**OT (Operational Technology)** ist die Technik zur Steuerung physischer Prozesse. Sie wächst mit der IT zusammen, und damit kommen IT-Angriffe in die Produktion. Die Schutzziele sind anders gewichtet: In der OT stehen **Verfügbarkeit und Sicherheit von Mensch und Anlage (Safety)** an erster Stelle, in der IT oft die Vertraulichkeit.

Besonderheiten der OT:

- **Lange Lebensdauer** (15 bis 30 Jahre), veraltete Betriebssysteme und Software, Patchen nur in Wartungsfenstern und nach Herstellerfreigabe.
- **Protokolle ohne Sicherheit:** Modbus und viele Feldbusse kennen keine Authentifizierung oder Verschlüsselung.
- **Echtzeit:** Verzögerungen durch Virenscanner oder Scans können den Prozess stören.

Maßnahmen nach dem Normenwerk **IEC 62443** und dem BSI:

1. **Netzwerksegmentierung** in **Zonen** mit kontrollierten Übergängen (**Conduits**), Firewalls und eine **DMZ** zwischen Büro-IT und Produktionsnetz. Kein direkter Zugriff aus dem Internet.
2. **Bestandsaufnahme** aller Geräte und Verbindungen (man schützt nur, was man kennt).
3. **Fernzugriff** nur über gesicherte Zugänge (VPN, Mehr-Faktor, protokolliert und zeitlich begrenzt, Wartungsfirmen eingeschlossen).
4. **Härtung**, Zugriffskontrolle, starke Passwörter statt Herstellerstandard, Rollen und Rechte.
5. **Monitoring** passiver Art (Netzwerkanomalieerkennung), **Backup** der Steuerungsprogramme und Notfallplan.
6. **Sichere Protokolle** wählen, z. B. OPC UA mit Zertifikaten und MQTT mit TLS und Zugriffsrechten am Broker.

> [!exam] Prüfungshinweis
> Typisch für FIDV: Ebenen der Automatisierungspyramide zuordnen, Protokolle (OPC UA, MQTT, Modbus) vergleichen und auswählen, Signalumrechnung 4 bis 20 mA, einfache Steuerlogik, OEE berechnen und Maßnahmen zur Absicherung vernetzter Anlagen nennen. Begründe immer mit den Randbedingungen der Anlage (Echtzeit, Verfügbarkeit, Alter der Geräte).
`,
  exercises: [
    {
      id: 'signal-skalieren',
      title: 'Analogsignal umrechnen',
      prompt: 'Ein Füllstandssensor misst 0 bis 5 m und liefert 4 bis 20 mA. a) Welcher Füllstand gehört zu 8 mA? b) Die SPS meldet 2 mA. Was bedeutet das?',
      hints: ['Anteil = (I − 4 mA) : 16 mA', 'Der Bereich beginnt bei 4 mA'],
      solution: 'a) (8 − 4) : 16 = 0,25, also 0,25 · 5 m = 1,25 m. b) Ein Strom von 2 mA liegt unterhalb des gültigen Bereichs von 4 mA. Das deutet auf einen Fehler hin, typisch Leitungsbruch, Sensorausfall oder fehlende Versorgung (Live-Zero-Prinzip), nicht auf einen Füllstand von 0 m. Die Steuerung sollte eine Störung melden und in einen sicheren Zustand gehen.'
    },
    {
      id: 'oee-berechnen',
      title: 'OEE berechnen',
      prompt: 'Eine Abfüllanlage ist für 8 Stunden (480 min) eingeplant. Es gab 60 Minuten Störungen. Die ideale Taktzeit beträgt 2 Sekunden pro Flasche. Produziert wurden 11 000 Flaschen, davon 10 670 ohne Mangel. Berechne Verfügbarkeit, Leistung, Qualität und OEE. Wo liegt der größte Verlust?',
      hints: ['Laufzeit = 420 min = 25 200 s', 'Mögliche Menge = 25 200 s : 2 s'],
      solution: 'Verfügbarkeit = 420 : 480 = 87,5 %. Mögliche Menge in der Laufzeit = 25 200 s : 2 s = 12 600 Flaschen, Leistung = 11 000 : 12 600 = 87,3 %. Qualität = 10 670 : 11 000 = 97 %. OEE = 0,875 · 0,873 · 0,97 = 74,1 %. Die Verluste verteilen sich auf Stillstand (12,5 %) und Geschwindigkeit (12,7 %) etwa gleich, die Qualität (3 %) ist am besten. Ansatzpunkte: Ursachen der Störungen analysieren (Wartung, Rüstzeiten) und Mikrostopps oder verringerte Geschwindigkeit untersuchen.'
    },
    {
      id: 'protokoll-auswahl',
      title: 'Protokoll auswählen',
      prompt: 'Ein Werk will Temperaturdaten von 500 Sensoren über ein unsicheres Funknetz an eine Cloud-Plattform senden. Die Verbindung bricht gelegentlich ab. Welches Protokoll eignet sich eher: Modbus TCP oder MQTT? Nenne drei Gründe und eine Sicherheitsmaßnahme.',
      hints: ['Publish-Subscribe, Last Will, TLS'],
      solution: 'MQTT ist besser geeignet. Gründe: 1) Publish-Subscribe mit Broker entkoppelt Sensoren und Cloud, viele Geräte lassen sich einfach anbinden. 2) Leichtgewichtig, wenig Overhead, gut für schmale oder instabile Verbindungen. 3) Funktionen wie Last Will, Retained Messages und wählbare Qualitätsstufen (QoS 1 oder 2) gehen mit Verbindungsabbrüchen um. Modbus TCP ist ein Abfrageprotokoll (Master fragt Slave) ohne Sicherheit und für das lokale Netz gedacht. Sicherheitsmaßnahme: MQTT über TLS (Port 8883) mit Client-Zertifikaten oder Benutzerdaten und Zugriffsrechten je Topic am Broker.'
    },
    {
      id: 'segmentierung-planen',
      title: 'Produktionsnetz absichern',
      prompt: 'In einem Betrieb sind Büro-PCs, ein Fernwartungszugang des Maschinenherstellers und die Produktionssteuerungen im selben flachen Netz. Beschreibe eine Zielarchitektur und drei weitere Maßnahmen.',
      hints: ['Zonen, DMZ, VPN'],
      solution: 'Zielarchitektur: Netz in Zonen teilen (Büro-IT, DMZ, Produktion, ggf. weitere Zellen), Übergänge nur über Firewalls mit Regeln nach dem Prinzip „nur das Nötige erlauben“. Daten für ERP und MES laufen über Server in der DMZ, es gibt keine direkten Verbindungen aus dem Büronetz in die Steuerungen. Der Fernwartungszugang endet in der DMZ (VPN mit Mehr-Faktor-Authentifizierung, Sitzungsprotokollierung, nur nach Freigabe und zeitlich begrenzt). Weitere Maßnahmen: Inventarisierung aller Geräte, Herstellerpasswörter ändern und Rollen vergeben, Backups der Steuerungsprogramme, passives Netzwerk-Monitoring, geplantes Patchen im Wartungsfenster und Notfallplan.'
    }
  ],
  quiz: [
    {
      question: 'Welche Ebene der Automatisierungspyramide enthält typischerweise die SPS?',
      options: ['Feldebene', 'Steuerungsebene', 'Betriebsleitebene', 'Unternehmensebene'],
      correct: 1,
      explanation: 'Die SPS regelt und steuert in der Steuerungsebene. Darunter liegen Sensoren und Aktoren, darüber SCADA, MES und ERP.'
    },
    {
      question: 'Wie arbeitet eine SPS ihr Programm ab?',
      options: [
        'Nur bei Ereignissen, ohne feste Reihenfolge',
        'Zyklisch: Eingänge lesen, Programm abarbeiten, Ausgänge schreiben',
        'Einmalig beim Einschalten',
        'Parallel zu jeder Eingangsänderung'
      ],
      correct: 1,
      explanation: 'Der zyklische Ablauf mit Prozessabbild sorgt für konsistente Eingangswerte während eines Programmdurchlaufs.'
    },
    {
      question: 'Warum nutzt man bei der Stromschleife 4 bis 20 mA den Startwert 4 mA statt 0 mA?',
      options: [
        'Um Strom zu sparen',
        'Damit ein Leitungsbruch (0 mA) vom Messwert 0 unterscheidbar ist',
        'Weil Sensoren kein Signal unter 4 mA liefern können',
        'Wegen der besseren Verschlüsselung'
      ],
      correct: 1,
      explanation: 'Bei 4 mA beginnt der Messbereich (Live Zero). Fällt das Signal auf 0 mA, liegt ein Fehler wie Leitungsbruch vor.'
    },
    {
      question: 'Welches Protokoll arbeitet nach dem Publish-Subscribe-Prinzip mit einem Broker?',
      options: ['Modbus RTU', 'PROFIBUS', 'MQTT', 'IO-Link'],
      correct: 2,
      explanation: 'Bei MQTT veröffentlichen Geräte Nachrichten zu Topics am Broker, Abonnenten erhalten sie. Modbus arbeitet im Master-Slave-Verfahren.'
    },
    {
      question: 'Wie berechnet sich die OEE?',
      options: [
        'Verfügbarkeit + Leistung + Qualität',
        'Verfügbarkeit · Leistung · Qualität',
        'Gutteile : Laufzeit',
        'MTBF : MTTR'
      ],
      correct: 1,
      explanation: 'Die OEE ist das Produkt der drei Faktoren, nicht die Summe. Jeder Verlust mindert das Gesamtergebnis.'
    },
    {
      question: 'Welche Eigenschaft unterscheidet die OT-Sicherheit besonders von der klassischen IT-Sicherheit?',
      options: [
        'Vertraulichkeit hat immer Vorrang',
        'Verfügbarkeit und Anlagensicherheit haben Vorrang, Patchen ist oft nur im Wartungsfenster möglich',
        'Es gibt keine Netzwerke',
        'Passwörter sind nicht nötig'
      ],
      correct: 1,
      explanation: 'Ein Ausfall oder eine Fehlfunktion kann Menschen und Anlagen gefährden. Zudem laufen OT-Systeme lange und lassen sich nur eingeschränkt aktualisieren.'
    },
    {
      question: 'Welche Maßnahme gehört nach IEC 62443 zum Kern des Schutzes vernetzter Anlagen?',
      options: [
        'Alle Geräte in ein flaches Netz legen',
        'Aufteilung in Zonen mit kontrollierten Übergängen (Conduits)',
        'Herstellerpasswörter beibehalten',
        'Fernzugriff ohne Protokollierung'
      ],
      correct: 1,
      explanation: 'Zonen und Conduits begrenzen die Ausbreitung von Angriffen und erlauben kontrollierten Datenverkehr.'
    }
  ],
  sources: [
    { title: 'Plattform Industrie 4.0 (Bundesministerium für Wirtschaft und Klimaschutz)', url: 'https://www.plattform-i40.de/' },
    { title: 'MQTT.org: The Standard for IoT Messaging', url: 'https://mqtt.org/' },
    { title: 'Wikipedia: OPC Unified Architecture', url: 'https://de.wikipedia.org/wiki/OPC_Unified_Architecture' },
    { title: 'Wikipedia: Speicherprogrammierbare Steuerung', url: 'https://de.wikipedia.org/wiki/Speicherprogrammierbare_Steuerung' },
    { title: 'Wikipedia: Industrie 4.0', url: 'https://de.wikipedia.org/wiki/Industrie_4.0' },
    { title: 'BSI: ICS-Security-Kompendium', url: 'https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/ICS/ICS-Security_kompendium_pdf.html' },
    { title: 'IEC 62443', note: 'Normenreihe zur Cybersicherheit in der industriellen Automatisierung, kostenpflichtig' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
