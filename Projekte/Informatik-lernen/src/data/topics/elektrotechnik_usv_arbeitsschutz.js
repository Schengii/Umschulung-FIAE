/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Spannung, Strom, Widerstand, Leistung und Energie berechnen und Schaltungen auswerten',
    'Eine USV nach Leistung (VA, W) und Überbrückungszeit dimensionieren',
    'Schutzmaßnahmen, Schutzklassen und die fünf Sicherheitsregeln anwenden',
    'Prüfwerte nach DGUV Vorschrift 3 bewerten und das Verhalten bei Stromunfällen beschreiben'
  ],
  content: `
## Elektrische Grundgrößen

| Größe | Symbol | Einheit | Bedeutung |
| :--- | :---: | :---: | :--- |
| Spannung | U | Volt (V) | treibt den Strom an |
| Stromstärke | I | Ampere (A) | Ladungsfluss pro Zeit |
| Widerstand | R | Ohm (Ω) | behindert den Strom |
| Leistung | P | Watt (W) | Energieumsatz pro Zeit |
| Energie | W | Wattstunde (Wh), kWh | Leistung über die Zeit |

**Ohmsches Gesetz**: U = R · I. **Leistung**: P = U · I. **Energie**: W = P · t. Aus dem Ohmschen Gesetz folgen weitere Formen, zum Beispiel P = I² · R (Verlustleistung in einer Leitung) und P = U² : R.

### Schaltungen

- **Reihenschaltung**: Gleicher Strom überall, die Widerstände addieren sich: R = R₁ + R₂ + …, die Spannungen teilen sich auf.
- **Parallelschaltung**: Gleiche Spannung überall, die Ströme addieren sich, es gilt 1/R = 1/R₁ + 1/R₂ + … Zwei gleiche Widerstände parallel ergeben die Hälfte.

> [!example] Beispiel
> 230 V liegen an 46 Ω. Strom: I = 230 V : 46 Ω = 5 A. Leistung: P = 230 V · 5 A = 1.150 W. Läuft das Gerät 4 Stunden, sind es 4,6 kWh.

## Wechselstrom, Wirk- und Scheinleistung

Das Stromnetz liefert **Wechselstrom** (in Europa 230 V und 50 Hz, im Drehstromnetz 400 V zwischen den Außenleitern). Bei Wechselstrom unterscheidet man:

- **Wirkleistung P** in Watt: wird tatsächlich in Wärme, Licht oder Arbeit umgesetzt.
- **Blindleistung Q** in var: pendelt zwischen Quelle und Verbraucher (Spulen, Kondensatoren).
- **Scheinleistung S** in Voltampere (VA): S = U · I, die Leitungen und Geräte müssen sie tragen.

Der **Leistungsfaktor** cos φ = P : S beschreibt das Verhältnis. Moderne Netzteile mit Leistungsfaktorkorrektur (PFC) erreichen nahe 1. Für USV-Geräte sind deshalb **zwei Angaben** wichtig: Scheinleistung in VA und Wirkleistung in W. Typisch ist cos φ = 0,9, das heißt 1.000 VA entsprechen etwa 900 W.

## Die USV (unterbrechungsfreie Stromversorgung)

Eine USV überbrückt Netzausfälle, glättet Störungen und gibt Zeit zum geordneten Herunterfahren. Die Norm **IEC 62040-3** unterscheidet drei Bauarten.

![Drei USV-Bauarten im Signalweg vom Netz zur Last](usv-bauarten.svg "Offline (VFD), Line-Interactive (VI) und Online (VFI) im Vergleich")

| Bauart | Verhalten | Typischer Einsatz |
| :--- | :--- | :--- |
| Offline (VFD) | Last am Netz, Wechsel auf Akku bei Ausfall, kurze Umschaltzeit | einzelne PCs |
| Line-Interactive (VI) | zusätzlich Spannungsregelung (AVR) ohne Akku | kleine Server, Netzwerktechnik |
| Online (VFI) | Last dauerhaft über Gleichrichter und Wechselrichter, keine Umschaltzeit | Server, Rechenzentren, sensible Geräte |

Die Online-USV bietet den höchsten Schutz, verbraucht aber mehr Energie (Doppelwandlung) und kostet mehr.

### Dimensionierung in drei Schritten

1. **Last ermitteln**: Summe der Leistungsaufnahme aller angeschlossenen Geräte in W (aus Typenschild, Messung oder Datenblatt).
2. **Reserve einplanen**: etwa 20 bis 30 % für Erweiterungen und Alterung.
3. **In VA umrechnen**: VA = W : cos φ, danach eine Geräteklasse wählen, deren Nennscheinleistung und Wirkleistung beide ausreichen.

> [!example] Beispiel Dimensionierung
> Last 2.400 W, Reserve 25 %: 2.400 W · 1,25 = 3.000 W. Bei cos φ = 0,9 ergeben sich 3.000 W : 0,9 = **3.333 VA**. Gewählt wird eine USV mit mindestens 3.500 VA und 3.150 W oder die nächsthöhere Stufe.

### Überbrückungszeit

Die Batterie hat eine Spannung U_B und eine Kapazität C. Die gespeicherte Energie ist E = U_B · C. Mit dem Wirkungsgrad η des Wechselrichters gilt:

**t = (U_B · C · η) : P**

> [!example] Beispiel Überbrückungszeit
> Vier Batterien mit 12 V und 7 Ah in Reihe: 48 V, 7 Ah, E = 336 Wh. Bei η = 0,85 stehen 285,6 Wh zur Verfügung. Bei einer Last von 600 W: t = 285,6 Wh : 600 W = 0,476 h ≈ **28,6 Minuten**.

In der Praxis ist die nutzbare Kapazität geringer (Alterung, Entladeschlussspannung, Temperatur). Batterien müssen daher regelmäßig getestet und nach etwa drei bis fünf Jahren (Blei-AGM) ersetzt werden. Für längere Ausfälle kommt eine **Netzersatzanlage** (Generator) dazu.

## Netzformen und Schutzmaßnahmen

Die Netzform beschreibt die Erdung. Häufig sind **TN-S** (getrennter Neutral- und Schutzleiter), **TN-C-S** und **TT**. Wichtige Schutzmaßnahmen:

- **Schutzklassen**: Klasse I mit Schutzleiter, Klasse II mit Schutzisolierung (Doppelquadrat-Symbol), Klasse III mit Schutzkleinspannung.
- **Fehlerstromschutzeinrichtung (RCD/FI)**: löst bei Differenzstrom aus. Für den Personenschutz sind 30 mA üblich. Abschaltzeit im TN-System bei Steckdosenstromkreisen höchstens 0,4 s.
- **Schutzkleinspannung**: bis 50 V Wechselspannung bzw. 120 V Gleichspannung gilt als ungefährlich im Sinne der Schutzmaßnahme.
- **IP-Schutzart** (DIN EN 60529): erste Ziffer = Schutz vor Fremdkörpern und Berührung, zweite = Schutz vor Wasser. IP54 ist staubgeschützt und spritzwassergeschützt, IP65 ist staubdicht und strahlwassergeschützt.

## Arbeitssicherheit: die fünf Sicherheitsregeln

Arbeiten an elektrischen Anlagen dürfen nur **Elektrofachkräfte** oder unterwiesene Personen unter Aufsicht durchführen. Die Reihenfolge der Regeln (DIN VDE 0105-100):

1. **Freischalten**
2. **Gegen Wiedereinschalten sichern**
3. **Spannungsfreiheit allpolig feststellen**
4. **Erden und Kurzschließen**
5. **Benachbarte, unter Spannung stehende Teile abdecken oder abschranken**

### Verhalten bei einem Stromunfall

1. **Eigenschutz**: Zuerst den Strom abschalten (Not-Aus, Sicherung), die verunglückte Person nicht berühren, solange sie unter Spannung steht.
2. **Notruf 112** absetzen.
3. Bei Bewusstlosigkeit ohne Atmung **Wiederbelebung** beginnen.
4. Auch bei scheinbar gutem Befinden ärztlich untersuchen lassen, weil Herzrhythmusstörungen verzögert auftreten können.

Bei einem **Brand** an elektrischen Anlagen wird zuerst abgeschaltet. Unter Spannung dürfen nur geeignete Löschmittel (zum Beispiel CO₂ oder Pulver mit Mindestabstand) verwendet werden, kein Wasser.

## Prüfung nach DGUV Vorschrift 3

Elektrische Anlagen und Betriebsmittel müssen **vor der ersten Inbetriebnahme**, **nach Änderung oder Reparatur** und **wiederkehrend** geprüft werden. Der Unternehmer legt die Fristen anhand der Gefährdungsbeurteilung fest. Geprüft wird durch eine Elektrofachkraft, das Ergebnis wird dokumentiert, häufig mit Prüfplakette.

Die typischen Messungen nach DIN VDE 0701-0702:

| Messung | Grenzwert |
| :--- | :--- |
| Schutzleiterwiderstand (Leitung bis 5 m) | höchstens 0,3 Ω |
| Isolationswiderstand Schutzklasse I | mindestens 1 MΩ |
| Isolationswiderstand Schutzklasse II | mindestens 2 MΩ |
| Isolationswiderstand Schutzklasse III | mindestens 0,25 MΩ |

Zusätzlich erfolgen Sichtprüfung, Funktionsprüfung und bei Bedarf Messung von Ableit- und Berührungsstrom.

## Energieeffizienz im Rechenzentrum

Die gesamte elektrische Leistung eines Servers wird zu **Wärme**. 1 kW IT-Leistung erfordert also rund 1 kW Kühlleistung. Die Kennzahl **PUE** (Power Usage Effectiveness) lautet:

**PUE = Gesamtenergie des Rechenzentrums : Energie der IT-Geräte**

Der ideale Wert ist 1,0, übliche Werte liegen höher. Sinkt der PUE von 1,8 auf 1,3, sinkt der Energiebedarf für dieselbe IT-Last um mehr als 27 %. Maßnahmen: Kalt- und Warmgangeinhausung, höhere Betriebstemperaturen, effiziente USV und Free Cooling.

## Schaltungen und Leitungsberechnung

**Reihenschaltung:** Der Strom ist überall gleich, die Teilspannungen addieren sich, die Widerstände addieren sich: R_ges = R1 + R2 + ...

**Parallelschaltung:** Die Spannung ist überall gleich, die Teilströme addieren sich, die Leitwerte addieren sich: 1/R_ges = 1/R1 + 1/R2 + ... Zwei gleiche Widerstände von je 100 Ohm ergeben parallel 50 Ohm. Alle Steckdosen und Verbraucher im Haushalt und im Rack hängen parallel an der Netzspannung. Je mehr Geräte, desto größer der Gesamtstrom.

**Verlustleistung in der Leitung:** P_Verlust = I² * R. Der Strom geht quadratisch ein: Verdoppelt sich der Strom, vervierfacht sich die Wärme in der Leitung. Darum werden Leitungen nach dem Strom dimensioniert und überlastete Mehrfachsteckdosen warm.

**Spannungsfall auf einer Leitung** (Wechselstrom, einphasig, Hin- und Rückleiter): ΔU = 2 * l * I / (κ * A). Für Kupfer gilt κ ≈ 56 m/(Ohm * mm²).

Beispiel: Ein 20 m langes Kabel mit 1,5 mm² führt 10 A.

1. ΔU = 2 * 20 m * 10 A / (56 * 1,5) = 400 / 84 = 4,76 V.
2. Bezogen auf 230 V sind das 4,76 / 230 = 2,07 %.
3. Als Orientierung gilt: DIN VDE 0100-520 empfiehlt zwischen Hausanschluss und Verbraucher höchstens 4 %, DIN 18015-1 nennt für Wohngebäude 3 % zwischen Zähler und Verbrauchsmittel. Der Wert von 2,07 % bleibt unter beiden Grenzen. Bei doppelter Länge wären es 4,1 %, also über beiden Grenzen, und ein größerer Querschnitt wäre nötig. Maßgeblich ist immer die aktuelle Norm.

## Leistungsfaktor und USV-Auslegung

Bei Wechselstrom mit Blindanteil unterscheidet man **Scheinleistung S** (in VA), **Wirkleistung P** (in W) und **Blindleistung Q** (in var). Es gilt P = S * cos φ. Der **Leistungsfaktor** cos φ liegt bei modernen Netzteilen mit Leistungsfaktorkorrektur (PFC) meist bei 0,9 bis 0,99.

Eine USV mit 1000 VA und Leistungsfaktor 0,9 liefert 900 W Wirkleistung. Neuere Online-USVs sind teils mit Leistungsfaktor 1,0 spezifiziert, ältere mit 0,7 bis 0,9. Entscheidend ist immer die Angabe in Watt im Datenblatt.

**Faustformel für die Batterielaufzeit:** Batterieenergie in Wh = Spannung * Kapazität in Ah. Zwei 12-V-Blei-Akkus mit je 9 Ah in Reihe ergeben 24 V * 9 Ah = 216 Wh. Davon sind realistisch nur etwa 80 % nutzbar (Wechselrichterverluste, Entladetiefe). Bei 300 W Last: 216 Wh * 0,8 / 300 W = 0,58 h, also rund 35 Minuten. In der Praxis ist die Laufzeit bei hoher Last kürzer, weil die nutzbare Kapazität mit steigendem Entladestrom sinkt, und sie nimmt über die Jahre mit der Alterung der Batterie ab. Nach Herstellerangabe werden Bleiakkus in USVs oft nach 3 bis 5 Jahren getauscht.

Ein Beispiel für eine vollständige Auslegung:

1. Verbraucher addieren (z. B. Server 350 W, Switch 60 W, Storage 190 W = 600 W).
2. Reserve von 20 bis 30 % für Erweiterungen aufschlagen (600 W * 1,25 = 750 W).
3. Gewünschte Überbrückungszeit festlegen. Sie muss reichen, um Systeme geordnet herunterzufahren (häufig 5 bis 15 Minuten) oder bis ein Generator übernimmt.
4. USV mit mindestens dieser Wirkleistung und passender Batterie auswählen, Bauart nach Schutzbedarf (siehe Abbildung).

## Schutzarten, Schutzklassen und Fehlerstromschutz

**IP-Schutzarten (IEC 60529)** bestehen aus zwei Ziffern: Die erste (0 bis 6) bewertet den Schutz gegen Fremdkörper und Berührung, die zweite (0 bis 9) den Schutz gegen Wasser. IP20 (Finger-, aber kein Wasserschutz) reicht in trockenen Büro- und Serverräumen. IP54 schützt gegen Staubablagerung und Spritzwasser, IP65 ist staubdicht und strahlwassergeschützt.

**Schutzklassen** bezeichnen das Konzept des Berührungsschutzes: Klasse I hat einen Schutzleiteranschluss (Gehäuse geerdet, Schuko-Stecker), Klasse II ist schutzisoliert (Euro-Stecker, kein Schutzleiter), Klasse III arbeitet mit Schutzkleinspannung.

**Fehlerstromschutzeinrichtung (RCD, umgangssprachlich FI):** Sie vergleicht Hin- und Rückstrom. Weicht die Differenz um mehr als den Bemessungsfehlerstrom ab, trennt sie das Netz. Ein 30-mA-RCD dient dem Personenschutz. Wichtig für IT: Netzteile, USVs und Frequenzumrichter können glatte Gleichfehlerströme erzeugen. Dann braucht man je nach Gerät einen RCD Typ A oder Typ B, ein einfacher Typ AC reicht nicht aus. Der Leitungsschutzschalter (Sicherungsautomat) schützt dagegen nur vor Überlast und Kurzschluss, nicht vor Berührung.

Wirkung des Stroms auf den Menschen (Richtwerte): Ab etwa 0,5 mA ist Strom spürbar, ab etwa 10 mA kann man sich von der Elektrode oft nicht mehr lösen, ab etwa 30 mA besteht die Gefahr von Herzkammerflimmern. Als nicht berührungsgefährlich gilt Kleinspannung bis 50 V Wechselspannung oder 120 V Gleichspannung.

## Brandschutz im Serverraum

Brände entstehen im IT-Umfeld oft durch überlastete Steckdosenleisten, defekte Netzteile oder Batterien. Maßnahmen sind **vorbeugend** (Brandlast gering halten, nichts lagern, Leitungen nicht überlasten, Brandabschnitte), **melden** (Rauchmelder mit Frühesterkennung, Aufschaltung auf eine Leitstelle) und **löschen**.

- **Brandklassen (DIN EN 2):** A feste Stoffe (Holz, Papier), B flüssige Stoffe, C Gase, D Metalle, F Speiseöle und -fette.
- **Elektrobrände:** Erst den Strom abschalten, wenn gefahrlos möglich. Wasser und Schaum sind bei Spannung gefährlich. Geeignet sind Kohlendioxid-Löscher (rückstandsfrei, aber Erstickungsgefahr in kleinen Räumen) oder Pulverlöscher (verschmutzt Technik stark).
- **Sicherheitsabstände an Niederspannungsanlagen bis 1000 V** (DIN VDE 0132): beim Löschen mit Sprühstrahl mindestens 1 m, mit Vollstrahl mindestens 5 m (Werte für CM-Strahlrohr bei 5 bar; die Norm gilt nicht für Anlagen bis 50 V Wechsel- bzw. 120 V Gleichspannung).
- **Gaslöschanlagen** (Inertgas oder chemische Löschgase) löschen im Rechenzentrum ohne Wasserschaden, brauchen aber einen dichten Raum und eine Warnung vor dem Fluten.

## Erste Hilfe bei Stromunfällen

1. **Selbstschutz:** Niemals ein Opfer berühren, solange es unter Spannung steht. Stromkreis abschalten, Stecker ziehen oder Sicherung ausschalten.
2. **Notruf 112** absetzen.
3. Bei Bewusstlosigkeit ohne normale Atmung: **Herz-Lungen-Wiederbelebung** (Druckmassage 100 bis 120 pro Minute, Verwendung eines Defibrillators/AED, falls vorhanden).
4. Auch bei scheinbarer Erholung ärztlich untersuchen lassen, denn Herzrhythmusstörungen können mit Verzögerung auftreten.
5. Den Unfall dokumentieren und melden (Verbandbuch, Unfallanzeige an Vorgesetzte und Berufsgenossenschaft).

## Redundanz und Verfügbarkeitsklassen

Die Stromversorgung wird nach dem Schutzbedarf redundant aufgebaut: **N** bedeutet keine Redundanz, **N+1** ein zusätzliches Modul, **2N** zwei vollständig getrennte Versorgungspfade (A- und B-Strang). Ein Server mit zwei Netzteilen hängt mit je einem Netzteil an A und B.

Das Uptime Institute unterscheidet vier **Tier-Klassen** für Rechenzentren. Typische Verfügbarkeiten aus der Literatur (historische Richtwerte des Uptime Institute, nicht Bestandteil des aktuellen Standards): Tier I etwa 99,671 %, Tier II etwa 99,741 %, Tier III etwa 99,982 % und Tier IV etwa 99,995 %. Das entspricht Ausfallzeiten von ca. 28,8 h, 22,7 h, 1,6 h und 0,4 h pro Jahr. Ab Tier III ist Wartung ohne Abschalten möglich (gleichzeitig wartbar), Tier IV ist zusätzlich fehlertolerant.

**ESD-Schutz (elektrostatische Entladung):** Bauteile können durch Entladung unter 100 V zerstört werden, obwohl der Mensch erst ab ca. 3000 V etwas spürt. Deshalb: ESD-Armband mit Schutzwiderstand (üblich 1 MOhm), leitfähige Unterlage und antistatische Verpackung.

> [!exam] Prüfungshinweis
> Typisch sind Aufgaben zur USV-Dimensionierung (W, VA, Autonomiezeit), zur Energiekostenberechnung (kWh mal Preis), zu Schutzklassen und IP-Codes sowie die Bewertung eines Prüfprotokolls nach DGUV V3. Immer Einheiten mitführen und die Rechnung Schritt für Schritt notieren.
`,
  exercises: [
    {
      id: 'usv-dimensionierung',
      title: 'USV für einen Serverschrank auswählen',
      prompt: 'Ein Serverschrank hat eine Last von 1.800 W. Es sollen 30 % Reserve eingeplant werden, der Leistungsfaktor der USV beträgt 0,9. Berechne die erforderliche Wirkleistung und die Scheinleistung in VA.',
      hints: ['Wirkleistung = Last mal 1,3', 'VA = W : cos φ'],
      solution: 'Wirkleistung: 1.800 W · 1,3 = 2.340 W. Scheinleistung: 2.340 W : 0,9 = 2.600 VA. Gewählt wird eine USV mit mindestens 2.600 VA und 2.340 W, in der Praxis die nächste Standardgröße (zum Beispiel 3.000 VA).'
    },
    {
      id: 'usv-autonomie',
      title: 'Überbrückungszeit berechnen',
      prompt: 'Eine USV hat eine Batterie mit 48 V und 9 Ah. Der Wechselrichter arbeitet mit η = 0,85. Die Last beträgt 500 W. Wie lange kann die USV die Last theoretisch versorgen? Gib das Ergebnis in Minuten an.',
      hints: ['E = U · C', 't = (E · η) : P'],
      solution: 'E = 48 V · 9 Ah = 432 Wh. Nutzbar: 432 Wh · 0,85 = 367,2 Wh. t = 367,2 Wh : 500 W = 0,734 h ≈ 44 Minuten. In der Praxis ist die Zeit durch Alterung und Entladegrenzen kürzer.'
    },
    {
      id: 'stromkosten-pue',
      title: 'Energiekosten und PUE',
      prompt: 'Die IT-Geräte eines Serverraums nehmen im Mittel 8 kW auf, der PUE beträgt 1,6. Der Raum läuft 8.760 Stunden im Jahr, der Strompreis beträgt 0,25 € je kWh. Berechne die jährlichen Gesamtkosten und die Kosten, die allein durch den Mehraufwand (Kühlung, Verluste) entstehen.',
      hints: ['Gesamtleistung = IT-Leistung · PUE', 'Mehraufwand = Gesamt minus IT'],
      solution: 'Gesamtleistung: 8 kW · 1,6 = 12,8 kW. Energie: 12,8 kW · 8.760 h = 112.128 kWh. Kosten: 112.128 kWh · 0,25 € = 28.032 €. IT allein: 8 kW · 8.760 h = 70.080 kWh, das sind 17.520 €. Mehraufwand: 28.032 € − 17.520 € = 10.512 € pro Jahr.'
    },
    {
      id: 'dguv-protokoll-bewerten',
      title: 'Prüfprotokoll nach DGUV V3 bewerten',
      prompt: 'Ein Netzteil (Schutzklasse I, Anschlussleitung 3 m) wird geprüft. Messwerte: Schutzleiterwiderstand 0,45 Ω, Isolationswiderstand 0,8 MΩ, RCD-Test der Steckdose besteht. Bewerte jeden Messwert nach den Grenzwerten und entscheide, ob das Gerät weiterverwendet werden darf.',
      hints: ['Grenzwerte: R_PE höchstens 0,3 Ω (bis 5 m), R_ISO bei Klasse I mindestens 1 MΩ'],
      solution: 'R_PE = 0,45 Ω überschreitet den Grenzwert von 0,3 Ω: nicht bestanden. R_ISO = 0,8 MΩ liegt unter 1 MΩ: nicht bestanden. Der RCD-Test der Steckdose betrifft die Anlage und ist in Ordnung. Das Gerät besteht die Prüfung nicht und darf nicht weiterverwendet werden. Es wird gekennzeichnet, aus dem Verkehr gezogen und von einer Elektrofachkraft repariert oder ersetzt. Das Ergebnis ist zu dokumentieren.'
    }
  ],
  quiz: [
    {
      question: 'Zwei Widerstände von je 100 Ω werden parallel geschaltet. Wie groß ist der Gesamtwiderstand?',
      options: ['200 Ω', '100 Ω', '50 Ω', '25 Ω'],
      correct: 2,
      explanation: '1/R = 1/100 + 1/100 = 2/100, also R = 50 Ω. In Reihe wären es 200 Ω.'
    },
    {
      question: 'Welche USV-Bauart versorgt die Last dauerhaft über Gleichrichter und Wechselrichter ohne Umschaltzeit?',
      options: ['Offline (VFD)', 'Line-Interactive (VI)', 'Online (VFI)', 'Standby-Generator'],
      correct: 2,
      explanation: 'Bei der Online-USV (Doppelwandlung) liegt die Last immer am Wechselrichter, deshalb gibt es keine Umschaltzeit.'
    },
    {
      question: 'Eine Last beträgt 1.800 W, der Leistungsfaktor 0,9. Wie viele VA sind mindestens nötig?',
      options: ['1.620 VA', '1.800 VA', '2.000 VA', '2.250 VA'],
      correct: 2,
      explanation: 'VA = W : cos φ = 1.800 : 0,9 = 2.000 VA.'
    },
    {
      question: 'Welcher Schritt steht bei den fünf Sicherheitsregeln an erster Stelle?',
      options: ['Spannungsfreiheit feststellen', 'Erden und Kurzschließen', 'Freischalten', 'Benachbarte Teile abdecken'],
      correct: 2,
      explanation: 'Zuerst wird freigeschaltet. Danach folgen Sichern gegen Wiedereinschalten, Feststellen der Spannungsfreiheit, Erden und Kurzschließen und Abdecken.'
    },
    {
      question: 'Ein Gerät der Schutzklasse II hat einen Isolationswiderstand von 1,5 MΩ. Wie ist das zu bewerten?',
      options: ['Bestanden, Mindestwert ist 1 MΩ', 'Nicht bestanden, Mindestwert ist 2 MΩ', 'Bestanden, Mindestwert ist 0,25 MΩ', 'Nicht bewertbar'],
      correct: 1,
      explanation: 'Für Schutzklasse II gilt ein Mindestwert von 2 MΩ. 1,5 MΩ liegt darunter.'
    },
    {
      question: 'Was bedeutet ein PUE von 1,5?',
      options: [
        'Auf 1 kWh IT-Energie kommen insgesamt 1,5 kWh Rechenzentrumsenergie',
        'Das Rechenzentrum ist zu 150 % ausgelastet',
        'Die USV hat einen Wirkungsgrad von 150 %',
        'Die Kühlung benötigt 1,5-mal so viel Energie wie die IT'
      ],
      correct: 0,
      explanation: 'PUE = Gesamtenergie : IT-Energie. Bei 1,5 entfallen 0,5 kWh auf Kühlung, USV-Verluste und weitere Verbraucher.'
    },
    {
      question: 'Wie verhältst du dich bei einem Stromunfall zuerst?',
      options: [
        'Die Person sofort anfassen und wegziehen',
        'Den Strom abschalten, dann Notruf und Erste Hilfe',
        'Mit Wasser löschen',
        'Abwarten, bis es der Person besser geht'
      ],
      correct: 1,
      explanation: 'Eigenschutz geht vor: Erst die Spannung abschalten, dann Notruf 112 und Erste Hilfe.'
    }
  ],
  relatedLabs: [
    { id: 'usv_calculator_lab', label: 'USV-Rechner' },
    { id: 'dguv_v3_lab', label: 'DGUV V3 Elektro-Prüfung' },
    { id: 'raid_calculator', label: 'RAID-Rechner' }
  ],
  sources: [
    { title: 'DGUV: Vorschrift 3 „Elektrische Anlagen und Betriebsmittel“', url: 'https://www.dguv.de/', note: 'Prüfung und Unternehmerpflichten' },
    { title: 'Wikipedia: Unterbrechungsfreie Stromversorgung', url: 'https://de.wikipedia.org/wiki/Unterbrechungsfreie_Stromversorgung', note: 'Bauarten VFD, VI und VFI' },
    { title: 'Wikipedia: Schutzart (IP-Code)', url: 'https://de.wikipedia.org/wiki/Schutzart' },
    { title: 'Wikipedia (englisch): Power usage effectiveness', url: 'https://en.wikipedia.org/wiki/Power_usage_effectiveness', note: 'Definition des PUE' },
    { title: 'DIN VDE 0105-100 und DIN VDE 0701-0702', note: 'Normtexte sind kostenpflichtig, Grenzwerte siehe Tabelle im Artikel' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
