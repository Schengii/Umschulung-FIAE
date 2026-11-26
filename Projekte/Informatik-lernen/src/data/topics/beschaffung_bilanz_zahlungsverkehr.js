/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Den Beschaffungsprozess vom Bedarf bis zur Zahlung beschreiben und rechtliche Folgen von Anfrage, Angebot und Bestellung erklären',
    'Eine Bezugskalkulation durchführen, Skonto bewerten und Angebote mit einer Nutzwertanalyse vergleichen',
    'Mängelrüge, Gewährleistung und Verzug richtig einordnen',
    'Aufbau und Aussage einer Bilanz erklären, einfache Geschäftsfälle buchen und Kennzahlen berechnen',
    'Zahlungsarten, Rechnungsbestandteile, Aufbewahrungsfristen und E-Rechnung kennen'
  ],
  content: `
## Der Beschaffungsprozess im Überblick

IT-Fachkräfte beschaffen Hardware, Software, Lizenzen und Dienstleistungen. Der Ablauf ist meist gleich:

1. **Bedarf ermitteln:** Wer braucht was, wie viel, bis wann, mit welchen Anforderungen? Die Anforderungen werden messbar festgehalten (Lastenheft).
2. **Bezugsquellen suchen:** Hersteller, Fachhandel, Distributor, Rahmenvertragspartner. Bewährt ist ein Vergleich von mindestens drei Anbietern.
3. **Anfrage** stellen. Sie ist **unverbindlich** und bindet weder den Anfragenden noch den Anbieter.
4. **Angebote vergleichen** und entscheiden.
5. **Bestellung** aufgeben (schriftlich oder elektronisch, mit Menge, Preis, Termin, Lieferadresse).
6. **Auftragsbestätigung** des Lieferanten, **Lieferschein**, **Wareneingang** mit Prüfung.
7. **Rechnung** prüfen (sachlich und rechnerisch), **Zahlung** freigeben, Anlage im Bestand erfassen (Inventar, CMDB).

## Rechtliche Grundlagen: Vertrag und Pflichten

Ein **Kaufvertrag** entsteht durch zwei übereinstimmende Willenserklärungen: **Antrag** und **Annahme**. Ein **Angebot** ist nach BGB **bindend** für die genannte Frist, sofern der Anbieter es nicht ausschließt (Klauseln wie „freibleibend“ oder „solange der Vorrat reicht“). Eine **Bestellung** auf ein bindendes Angebot ist die Annahme, der Vertrag kommt zustande. Bestellt man ohne vorheriges Angebot, ist die Bestellung der Antrag, und der Vertrag entsteht erst durch Auftragsbestätigung oder Lieferung.

Der Kaufvertrag verpflichtet den **Verkäufer** zur Übergabe und Eigentumsverschaffung einer mangelfreien Sache und den **Käufer** zur Zahlung und Abnahme. Die Erfüllung (Lieferung, Zahlung) ist ein eigenes **Erfüllungsgeschäft**.

### Mängel und Gewährleistung

- **Wareneingangsprüfung:** Kaufleute müssen die Ware **unverzüglich untersuchen** und offene Mängel **unverzüglich rügen** (§ 377 HGB, beidseitiger Handelskauf). Versteckte Mängel sind unverzüglich nach Entdeckung zu rügen. Wer nicht rügt, verliert seine Rechte aus dem Mangel (Genehmigungsfiktion).
- **Gewährleistung (Sachmängelhaftung):** Bei neuen Sachen beträgt die Verjährungsfrist **zwei Jahre** ab Ablieferung (§ 438 BGB). Rechte des Käufers: zunächst **Nacherfüllung** (Reparatur oder Ersatz), danach Rücktritt oder Minderung, ggf. Schadensersatz.
- **Garantie** ist eine **freiwillige** zusätzliche Zusage des Herstellers oder Händlers und ersetzt die gesetzliche Gewährleistung nicht.
- **Lieferverzug:** Der Lieferant kommt in Verzug, wenn er nach Fälligkeit und **Mahnung** nicht liefert. Ist ein Termin kalendermäßig bestimmt (z. B. „Lieferung bis 15.3.“), ist keine Mahnung nötig. Dann kann man Nachfrist setzen und unter Umständen zurücktreten oder Schadensersatz verlangen.
- **Annahmeverzug** und **Zahlungsverzug** sind die entsprechenden Fälle auf Käuferseite (siehe unten).

## Bezugskalkulation und Angebotsvergleich

Der **Einstandspreis** ist der tatsächliche Preis, zu dem die Ware im Lager ankommt. Die **Bezugskalkulation** rechnet ihn vom Listenpreis aus:

| Schritt | Beispiel |
| :--- | :--- |
| Listeneinkaufspreis | 1.000,00 Euro |
| − Liefererrabatt (10 %) | − 100,00 Euro |
| = Zieleinkaufspreis | 900,00 Euro |
| − Liefererskonto (2 %) | − 18,00 Euro |
| = Bareinkaufspreis | 882,00 Euro |
| + Bezugskosten (Fracht, Verpackung) | + 30,00 Euro |
| = **Einstandspreis (Bezugspreis)** | **912,00 Euro** |

Der **Rabatt** wird vom Listenpreis berechnet, das **Skonto** vom Zielpreis nach Rabatt. Skonto bekommt man nur bei Zahlung innerhalb der Skontofrist.

### Wann lohnt sich Skonto?

Bei „2 % Skonto bei Zahlung in 10 Tagen, sonst netto in 30 Tagen“ finanziert der Lieferant 20 Tage lang (30 − 10). Der **Zinssatz** dieses Lieferantenkredits ist:

p = Skontosatz : (100 − Skontosatz) · 360 : Tage der Kreditfrist = 2 : 98 · 360 : 20 = 0,0204 · 18 = **36,7 % pro Jahr**.

Das liegt weit über typischen Kreditzinsen. Nutzt man den Kontokredit (z. B. 10 %), ist es also günstiger, das Skonto zu ziehen und für die 20 Tage Kredit aufzunehmen.

### Angebote bewerten

Der **billigste Preis** ist nicht automatisch das beste Angebot. Zu vergleichen sind **quantitative** Kriterien (Einstandspreis, Lieferzeit, Zahlungsbedingungen, Garantiedauer, Energieverbrauch, Gesamtbetriebskosten/TCO) und **qualitative** Kriterien (Qualität, Service und Support, Zuverlässigkeit des Lieferanten, Ersatzteilversorgung, Nachhaltigkeit).

**Nutzwertanalyse:** Kriterien werden **gewichtet** (Summe 100 %), jedes Angebot bekommt je Kriterium Punkte (z. B. 1 bis 5), Gewichtung mal Punkte ergibt Teilnutzen, die Summe den **Nutzwert**.

| Kriterium | Gewicht | Angebot A (Punkte / Teilnutzen) | Angebot B (Punkte / Teilnutzen) |
| :--- | :---: | :---: | :---: |
| Preis | 40 % | 5 / 2,0 | 3 / 1,2 |
| Service vor Ort | 30 % | 2 / 0,6 | 5 / 1,5 |
| Lieferzeit | 20 % | 4 / 0,8 | 4 / 0,8 |
| Garantie | 10 % | 3 / 0,3 | 5 / 0,5 |
| **Nutzwert** | 100 % | **3,7** | **4,0** |

Angebot B gewinnt trotz höheren Preises. Die Gewichtung ist eine Wertung und muss **vorab** und begründet festgelegt werden, sonst lässt sich die Entscheidung manipulieren. Eine ergänzende **Sensitivitätsprüfung** testet, ob sich die Reihenfolge bei geänderter Gewichtung ändert. Weitere Verfahren: **ABC-Analyse** (A-Güter: wenige, wertvolle Positionen intensiv steuern), **Make-or-Buy**, **Leasing oder Kauf** (siehe Artikel zur Wirtschaftlichkeit).

## Rechnung und Umsatzsteuer

Eine ordnungsgemäße **Rechnung** enthält nach § 14 UStG unter anderem: vollständigen Namen und Anschrift von Leistendem und Empfänger, **Steuernummer oder USt-IdNr.**, Ausstellungsdatum, **fortlaufende Rechnungsnummer**, Menge und Art der Leistung, **Zeitpunkt der Leistung**, das **Entgelt** (netto), den **Steuersatz** und den **Steuerbetrag** (oder den Hinweis auf Steuerbefreiung). Bis 250 Euro brutto genügen bei **Kleinbetragsrechnungen** weniger Angaben. Nur mit einer ordnungsgemäßen Rechnung kann der Unternehmer die **Vorsteuer** abziehen.

Die **Umsatzsteuer** beträgt 19 % (Regelsatz) oder 7 % (ermäßigt). Brutto = Netto · 1,19. Umgekehrt: Netto = Brutto : 1,19. Beispiel: 1.428,00 Euro brutto ergeben 1.200,00 Euro netto und 228,00 Euro Umsatzsteuer.

**E-Rechnung:** Seit dem **1. Januar 2025** müssen inländische Unternehmen im B2B-Bereich **elektronische Rechnungen empfangen** können. Eine E-Rechnung ist ein strukturierter, maschinenlesbarer Datensatz nach der europäischen Norm EN 16931 (z. B. **XRechnung** oder **ZUGFeRD** ab Profil EN 16931). Ein PDF per E-Mail gilt dagegen nicht als E-Rechnung. Für die Ausstellung gelten Übergangsfristen: Für Leistungen bis zum 31.12.2026 darf noch jede Rechnungsform genutzt werden, bei einem Vorjahresumsatz von höchstens 800.000 Euro sogar bis zum 31.12.2027. Ab 2028 ist die E-Rechnung im inländischen B2B-Verkehr grundsätzlich Pflicht. Den aktuellen Stand sollte man in den FAQ des Bundesfinanzministeriums prüfen, weil sich Auslegungen noch ändern.

**Aufbewahrungsfristen:** **Buchungsbelege** (z. B. Rechnungen) **8 Jahre**, **Handels- und Geschäftsbriefe** **6 Jahre**, **Bücher, Inventare, Jahresabschlüsse und Bilanzen** **10 Jahre** (§ 147 AO, § 257 HGB). Die Frist beginnt mit dem Ende des Kalenderjahres, in dem das Dokument entstanden ist. Elektronische Dokumente müssen **unveränderbar** und **lesbar** archiviert werden (GoBD).

## Zahlungsverkehr

| Zahlungsart | Merkmale |
| :--- | :--- |
| **Barzahlung** | sofort, anonym, Quittung nötig |
| **SEPA-Überweisung** | Zahler veranlasst, einheitlich im SEPA-Raum, mit **IBAN** (deutsche IBAN: 22 Zeichen) |
| **SEPA-Echtzeitüberweisung (Instant Payment)** | Gutschrift in wenigen Sekunden, rund um die Uhr |
| **Dauerauftrag** | regelmäßig, gleicher Betrag (z. B. Miete) |
| **SEPA-Basislastschrift** | Empfänger zieht ein, Mandat nötig, der Zahler kann **8 Wochen** ohne Angabe von Gründen zurückgeben, bei fehlendem Mandat bis zu 13 Monate |
| **SEPA-Firmenlastschrift** | nur zwischen Unternehmen, keine Rückgabe ohne Grund nach Einlösung (bei nicht autorisiertem Einzug bleibt die 13-Monats-Frist) |
| **Kartenzahlung** (Debitkarte, Kreditkarte) | Zahlungsgarantie für den Händler, Gebühren |
| **Zahlungsdienste** (z. B. PayPal) | Käuferschutz, Gebühren für den Verkäufer |

Zahlungsmittel werden nach **Sicherheit, Kosten, Geschwindigkeit und Aufwand** gewählt. Für **Zahlungsfreigaben** gilt im Unternehmen das **Vier-Augen-Prinzip**. Rechnungen sollen vor der Zahlung auf **Betrug** geprüft werden (geänderte Bankverbindung per E-Mail ist ein typischer Betrugsversuch, siehe Social Engineering).

### Zahlungsverzug

Ein Schuldner kommt spätestens **30 Tage nach Fälligkeit und Zugang der Rechnung** in Verzug (§ 286 Abs. 3 BGB), oder früher durch **Mahnung** oder bei kalendermäßig bestimmtem Zahlungstermin. Folgen: **Verzugszinsen** (im Geschäftsverkehr **9 Prozentpunkte über dem Basiszinssatz**, gegenüber Verbrauchern 5 Prozentpunkte, § 288 BGB), im B2B-Verkehr zusätzlich eine **Pauschale von 40 Euro**. Üblicher Ablauf: Zahlungserinnerung, 1. Mahnung, 2. Mahnung mit Fristsetzung, dann **gerichtliches Mahnverfahren** (Mahnbescheid). Die regelmäßige **Verjährung** beträgt **3 Jahre** und beginnt mit dem Ende des Jahres, in dem der Anspruch entstand.

## Die Bilanz

Das **Inventar** ist das ausführliche Verzeichnis aller Vermögensgegenstände und Schulden zum Stichtag (Inventur). Die **Bilanz** ist die **kurzgefasste Gegenüberstellung** von **Vermögen** (Aktiva) und **Kapital** (Passiva). Die Summen sind **immer gleich**: Alles Vermögen muss irgendwoher finanziert sein.

![Bilanz mit Beispielwerten](bilanz.svg "Aktiva und Passiva in Euro mit Eigenkapitalquote und Anlagendeckung")

- **Aktiva (Mittelverwendung):** *Anlagevermögen* (dauerhaft genutzt: Gebäude, Maschinen, Betriebs- und Geschäftsausstattung, Software) und *Umlaufvermögen* (kurzfristig: Vorräte, Forderungen, Wertpapiere, Kasse, Bankguthaben).
- **Passiva (Mittelherkunft):** *Eigenkapital* (Einlagen, Rücklagen, Gewinn) und *Fremdkapital* (Verbindlichkeiten, Darlehen, Rückstellungen).

Die **Gewinn-und-Verlust-Rechnung (GuV)** stellt Erträge und Aufwendungen einer Periode gegenüber: Erträge − Aufwendungen = Gewinn oder Verlust. Er erhöht oder mindert das Eigenkapital.

### Buchen von Geschäftsfällen

Die **doppelte Buchführung** erfasst jeden Vorgang auf **mindestens zwei Konten**. Der Buchungssatz lautet „Soll an Haben“. Vermögenskonten (Aktiva) nehmen Zugänge im Soll auf, Kapitalkonten (Passiva) im Haben. Aufwandskonten stehen im Soll, Ertragskonten im Haben.

Vier Grundtypen von Geschäftsfällen und ihre Wirkung auf die Bilanzsumme:

| Typ | Wirkung | Beispiel |
| :--- | :--- | :--- |
| **Aktivtausch** | eine Aktivposition steigt, eine andere sinkt, Summe gleich | Kauf eines Servers gegen Banküberweisung |
| **Passivtausch** | eine Passivposition steigt, eine andere sinkt | Verbindlichkeit wird in ein Darlehen umgewandelt |
| **Aktiv-Passiv-Mehrung** | beide Seiten steigen, Summe wächst | Kauf auf Rechnung (Ziel): Vermögen und Verbindlichkeiten steigen |
| **Aktiv-Passiv-Minderung** | beide Seiten sinken, Summe sinkt | Rechnung wird per Bank bezahlt |

**Beispiel (Kauf auf Ziel):** Ein Notebook wird für 1.200 Euro netto plus 19 % Umsatzsteuer auf Rechnung gekauft.

- Buchung: **Betriebs- und Geschäftsausstattung 1.200 Euro** und **Vorsteuer 228 Euro** (Soll) **an Verbindlichkeiten aus Lieferungen und Leistungen 1.428 Euro** (Haben).
- Bei Zahlung: **Verbindlichkeiten 1.428 Euro** (Soll) **an Bank 1.428 Euro** (Haben).

### Abschreibung

Anlagegüter verlieren durch Nutzung an Wert. Die **Abschreibung (AfA)** verteilt die Anschaffungskosten auf die Nutzungsdauer. Bei der **linearen Abschreibung** gilt: jährlicher Betrag = (Anschaffungskosten − Restwert) : Nutzungsdauer. Ein Server für 6.000 Euro netto mit 5 Jahren Nutzungsdauer und ohne Restwert wird mit 1.200 Euro pro Jahr abgeschrieben. Für **digitale Wirtschaftsgüter** (Computerhardware, Betriebs- und Anwendersoftware) wird nach einem BMF-Schreiben von 2021 (angepasst 2022) eine Nutzungsdauer von **einem Jahr** als Wahlrecht zugelassen. Eine längere Nutzungsdauer bleibt möglich. In der Handelsbilanz gilt weiterhin die tatsächliche Nutzungsdauer. **Geringwertige Wirtschaftsgüter (GWG)** bis 800 Euro netto können im Anschaffungsjahr sofort voll abgeschrieben werden. Die Abschreibung ist ein **Aufwand ohne Auszahlung** (nicht zahlungswirksam) und mindert den Gewinn.

### Kennzahlen aus der Bilanz

| Kennzahl | Formel | Aussage (Beispiel aus der Abbildung) |
| :--- | :--- | :--- |
| **Eigenkapitalquote** | Eigenkapital : Gesamtkapital | 280.000 : 700.000 = 40 %, Maß für Unabhängigkeit und Stabilität |
| **Verschuldungsgrad** | Fremdkapital : Eigenkapital | 420.000 : 280.000 = 1,5 |
| **Anlagendeckung I** | Eigenkapital : Anlagevermögen | 280.000 : 400.000 = 70 %, Anlagen sollten langfristig finanziert sein |
| **Liquidität 1. Grades** | flüssige Mittel : kurzfristige Verbindlichkeiten | Richtwert ca. 20 % oder mehr |
| **Liquidität 2. Grades** | (flüssige Mittel + Forderungen) : kurzfristige Verbindlichkeiten | Richtwert ca. 100 % oder mehr |
| **Liquidität 3. Grades** | Umlaufvermögen : kurzfristige Verbindlichkeiten | Richtwert ca. 200 % |
| **Eigenkapitalrentabilität** | Gewinn : Eigenkapital | Verzinsung des eingesetzten Eigenkapitals |
| **Umsatzrentabilität** | Gewinn : Umsatz | Gewinn je Euro Umsatz |

Richtwerte sind Orientierungen, die je nach Branche stark abweichen. Entscheidend sind der **Zeitvergleich** und der **Branchenvergleich**.

> [!exam] Prüfungshinweis
> Typisch in WiSo und AP1: Bezugskalkulation mit Rabatt, Skonto und Bezugskosten, Angebotsvergleich mit Nutzwertanalyse, Skonto gegen Kredit abwägen, Zuordnung von Bilanzposten und Geschäftsfällen (Aktivtausch usw.), Abschreibung berechnen, Eigenkapitalquote und Liquidität bestimmen sowie Zahlungsarten und Verzug begründen. Zeige die Rechenschritte mit Einheiten und nenne die Formel.
`,
  exercises: [
    {
      id: 'bezugskalkulation',
      title: 'Einstandspreis berechnen',
      prompt: 'Ein Lieferant bietet 20 Monitore zu je 240,00 Euro netto (Listenpreis) an. Es gibt 12 % Mengenrabatt und 3 % Skonto bei Zahlung innerhalb von 14 Tagen. Die Fracht beträgt insgesamt 45,00 Euro. Berechne den Einstandspreis gesamt und je Monitor.',
      hints: ['Rabatt vom Listenpreis, Skonto vom Zielpreis', 'Bezugskosten kommen nach dem Skonto dazu'],
      solution: 'Listenpreis gesamt = 20 · 240 = 4.800,00 Euro. Rabatt 12 % = 576,00 Euro, Zieleinkaufspreis = 4.224,00 Euro. Skonto 3 % = 126,72 Euro, Bareinkaufspreis = 4.097,28 Euro. Zuzüglich Fracht 45,00 Euro ergibt sich ein Einstandspreis von 4.142,28 Euro gesamt, je Monitor 207,11 Euro.'
    },
    {
      id: 'skonto-zinssatz',
      title: 'Skonto gegen Kredit abwägen',
      prompt: 'Ein Lieferant gewährt 2,5 % Skonto bei Zahlung innerhalb von 8 Tagen, sonst ist die Rechnung in 40 Tagen fällig. Berechne den Jahreszinssatz des Lieferantenkredits. Die Hausbank verlangt für den Kontokorrentkredit 11 %. Wie entscheidest du?',
      hints: ['Kreditfrist = 40 − 8 Tage', 'p = s : (100 − s) · 360 : Tage'],
      solution: 'Kreditfrist = 32 Tage. p = 2,5 : 97,5 · 360 : 32 = 0,02564 · 11,25 = 28,8 % pro Jahr. Der Lieferantenkredit ist mit rund 28,8 % deutlich teurer als der Kontokredit mit 11 %. Es ist also wirtschaftlich, das Skonto auszunutzen und die Zahlung notfalls über den Kontokredit zu finanzieren. Vorausgesetzt, der Kredit steht zur Verfügung und die Liquidität bleibt gesichert.'
    },
    {
      id: 'nutzwert-vergleich',
      title: 'Nutzwertanalyse durchführen',
      prompt: 'Für Laptops liegen zwei Angebote vor. Gewichtung: Preis 35 %, Akkulaufzeit 25 %, Vor-Ort-Service 25 %, Gewicht 15 %. Angebot X erhält Punkte (1 bis 5): Preis 5, Akku 3, Service 2, Gewicht 4. Angebot Y: Preis 3, Akku 4, Service 5, Gewicht 3. Berechne die Nutzwerte und entscheide. Wie würde sich das Ergebnis ändern, wenn der Preis 50 % und der Service 10 % Gewicht hätte (Akku 25 %, Gewicht 15 %)?',
      hints: ['Teilnutzen = Gewicht · Punkte', 'Summe der Teilnutzen ergibt den Nutzwert'],
      solution: 'Nutzwert X = 0,35·5 + 0,25·3 + 0,25·2 + 0,15·4 = 1,75 + 0,75 + 0,50 + 0,60 = 3,60. Nutzwert Y = 0,35·3 + 0,25·4 + 0,25·5 + 0,15·3 = 1,05 + 1,00 + 1,25 + 0,45 = 3,75. Y gewinnt knapp. Mit der alternativen Gewichtung: X = 0,5·5 + 0,25·3 + 0,10·2 + 0,15·4 = 2,50 + 0,75 + 0,20 + 0,60 = 4,05. Y = 0,5·3 + 0,25·4 + 0,10·5 + 0,15·3 = 1,50 + 1,00 + 0,50 + 0,45 = 3,45. Jetzt gewinnt X. Das Ergebnis hängt also stark von der Gewichtung ab. Sie muss vorab und begründet festgelegt werden.'
    },
    {
      id: 'bilanz-buchen',
      title: 'Geschäftsfälle zuordnen',
      prompt: 'Ordne zu (Aktivtausch, Passivtausch, Aktiv-Passiv-Mehrung, Aktiv-Passiv-Minderung): a) Kauf eines Druckers gegen Banküberweisung. b) Kauf von Büromaterial auf Rechnung (zum Anlagevermögen gerechnet). c) Ein Kunde zahlt eine offene Forderung per Überweisung. d) Eine Lieferantenrechnung wird per Bank bezahlt. e) Ein kurzfristiger Lieferantenkredit wird in ein Bankdarlehen umgewandelt.',
      hints: ['Schaue, welche Bilanzseiten betroffen sind und ob die Summe sich ändert'],
      solution: 'a) Aktivtausch: Bank sinkt, Betriebs- und Geschäftsausstattung steigt, Summe gleich. b) Aktiv-Passiv-Mehrung: Vermögen und Verbindlichkeiten steigen. c) Aktivtausch: Bank steigt, Forderungen sinken. d) Aktiv-Passiv-Minderung: Bank und Verbindlichkeiten sinken, Bilanzsumme sinkt. e) Passivtausch: Verbindlichkeiten aus Lieferungen sinken, Darlehen steigt, Summe gleich.'
    },
    {
      id: 'abschreibung-ek-quote',
      title: 'Abschreibung und Kennzahlen',
      prompt: 'Ein Unternehmen kauft einen Server für 9.000 Euro netto und schreibt ihn linear über 5 Jahre ab (Restwert 0). Bilanz: Anlagevermögen 500.000 Euro, Umlaufvermögen 250.000 Euro (davon flüssige Mittel 40.000 und Forderungen 110.000), Eigenkapital 300.000 Euro, kurzfristige Verbindlichkeiten 150.000 Euro. a) Jahresabschreibung? b) Eigenkapitalquote? c) Liquidität 1. und 2. Grades? d) Anlagendeckung I?',
      hints: ['Gesamtkapital = Bilanzsumme = 750.000 Euro'],
      solution: 'a) 9.000 : 5 = 1.800 Euro pro Jahr. b) Eigenkapitalquote = 300.000 : 750.000 = 40 %. c) Liquidität 1. Grades = 40.000 : 150.000 = 26,7 %. Liquidität 2. Grades = (40.000 + 110.000) : 150.000 = 100 %. Beide liegen im Bereich der üblichen Richtwerte (etwa 20 % und etwa 100 %). d) Anlagendeckung I = 300.000 : 500.000 = 60 %. Das Anlagevermögen ist nicht vollständig durch Eigenkapital gedeckt, ein Teil wird langfristig über Fremdkapital finanziert, was üblich ist, solange die Kreditlaufzeiten zur Nutzungsdauer passen.'
    }
  ],
  quiz: [
    {
      question: 'Welche rechtliche Wirkung hat eine Anfrage?',
      options: [
        'Sie ist bindend und verpflichtet zum Kauf',
        'Sie ist unverbindlich und führt noch zu keinem Vertrag',
        'Sie ersetzt das Angebot',
        'Sie verpflichtet den Lieferanten zur Lieferung'
      ],
      correct: 1,
      explanation: 'Die Anfrage dient der Information. Erst Angebot und Bestellung (Antrag und Annahme) führen zum Kaufvertrag.'
    },
    {
      question: 'Was muss ein Kaufmann beim Wareneingang tun?',
      options: [
        'Nichts, Mängel können jederzeit gerügt werden',
        'Die Ware unverzüglich prüfen und offene Mängel unverzüglich rügen',
        'Die Ware nur auf Anzahl prüfen',
        'Erst nach 2 Jahren prüfen'
      ],
      correct: 1,
      explanation: 'Nach § 377 HGB gilt beim Handelskauf die Untersuchungs- und Rügepflicht. Wird nicht gerügt, gilt die Ware als genehmigt.'
    },
    {
      question: 'Wie berechnet sich der Bareinkaufspreis?',
      options: [
        'Listenpreis + Bezugskosten',
        'Zieleinkaufspreis − Liefererskonto',
        'Listenpreis − Rabatt + Skonto',
        'Einstandspreis − Bezugskosten'
      ],
      correct: 1,
      explanation: 'Listenpreis − Rabatt = Zieleinkaufspreis. Davon das Skonto abziehen ergibt den Bareinkaufspreis, dazu Bezugskosten ergibt den Einstandspreis.'
    },
    {
      question: 'Was ist eine Aktiv-Passiv-Mehrung?',
      options: [
        'Ein Posten der Aktivseite steigt, ein anderer sinkt',
        'Aktiv- und Passivseite steigen, die Bilanzsumme wächst',
        'Zwei Passivposten tauschen',
        'Die Bilanzsumme sinkt'
      ],
      correct: 1,
      explanation: 'Beispiel: Kauf auf Ziel. Das Vermögen steigt und gleichzeitig die Verbindlichkeiten, die Bilanzsumme nimmt zu.'
    },
    {
      question: 'Welche Aussage zur Bilanz ist richtig?',
      options: [
        'Die Aktivseite zeigt die Mittelherkunft',
        'Aktiva und Passiva sind immer gleich groß',
        'Das Eigenkapital steht auf der Aktivseite',
        'Das Anlagevermögen gehört zum Fremdkapital'
      ],
      correct: 1,
      explanation: 'Die Aktivseite zeigt die Mittelverwendung, die Passivseite die Herkunft. Beide Summen sind systembedingt gleich.'
    },
    {
      question: 'Wie lange müssen Buchungsbelege wie Rechnungen nach aktuellem Recht aufbewahrt werden?',
      options: ['3 Jahre', '6 Jahre', '8 Jahre', '30 Jahre'],
      correct: 2,
      explanation: 'Buchungsbelege 8 Jahre, Handelsbriefe 6 Jahre, Bücher, Inventare und Jahresabschlüsse 10 Jahre.'
    },
    {
      question: 'Was gilt für eine SEPA-Basislastschrift?',
      options: [
        'Der Zahler kann sie 8 Wochen lang ohne Angabe von Gründen zurückgeben',
        'Sie kann nie zurückgegeben werden',
        'Sie ist nur zwischen Unternehmen möglich',
        'Sie benötigt kein Mandat'
      ],
      correct: 0,
      explanation: 'Bei der Basislastschrift gilt eine Widerspruchsfrist von 8 Wochen. Die Firmenlastschrift ist dagegen nur im B2B-Verkehr möglich und nicht rückgabefähig.'
    }
  ],
  relatedLabs: [
    { id: 'wiso_angebotsvergleich_lab', label: 'Angebotsvergleich' },
    { id: 'wiso_financing_lab', label: 'Finanzierung' },
    { id: 'wiso_kalkulation', label: 'Kalkulation' }
  ],
  sources: [
    { title: 'Gesetze im Internet: § 286 BGB (Verzug des Schuldners)', url: 'https://www.gesetze-im-internet.de/bgb/__286.html' },
    { title: 'Gesetze im Internet: § 377 HGB (Untersuchungs- und Rügepflicht)', url: 'https://www.gesetze-im-internet.de/hgb/__377.html' },
    { title: 'Gesetze im Internet: § 14 UStG (Ausstellung von Rechnungen)', url: 'https://www.gesetze-im-internet.de/ustg_1980/__14.html' },
    { title: 'Wikipedia: Bilanz', url: 'https://de.wikipedia.org/wiki/Bilanz' },
    { title: 'Bundesfinanzministerium: Fragen und Antworten zur obligatorischen E-Rechnung', url: 'https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html', note: 'Stand der gesetzlichen Fristen vor Anwendung prüfen' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
