/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Fixe und variable Kosten trennen, Deckungsbeitrag und Break-even-Menge berechnen',
    'Kostenvergleich (Make-or-Buy, Kauf oder Miete) und statische Amortisationsrechnung durchführen',
    'Angebote mit Rabatt, Skonto und Bezugskosten vergleichen und den Skonto-Jahreszins bestimmen',
    'Eine Nutzwertanalyse aufstellen und die ABC-Analyse anwenden'
  ],
  content: `
## Warum Wirtschaftlichkeit?

IT-Projekte kosten Geld und müssen sich lohnen. In der Abschlussprüfung (und in der Projektdokumentation) wird deshalb erwartet, dass du **Kosten und Nutzen quantifizierst**. Das **ökonomische Prinzip** gibt die Richtung vor:

- **Maximalprinzip**: mit gegebenen Mitteln den größtmöglichen Nutzen erreichen
- **Minimalprinzip**: ein vorgegebenes Ziel mit möglichst geringen Mitteln erreichen

## Kostenarten

| Kostenart | Verhalten bei mehr Menge | Beispiele |
| :--- | :--- | :--- |
| **Fixkosten** (Kf) | bleiben gleich | Miete, Gehälter, Lizenz-Flatrate, Abschreibung |
| **variable Kosten** (Kv = kv · x) | steigen mit der Menge | Material, Cloud-Kosten pro Nutzer, Provision |

**Gesamtkosten K = Kf + kv · x**, **Erlöse E = p · x**, **Gewinn G = E − K**.

## Deckungsbeitrag und Break-even

Der **Deckungsbeitrag pro Stück** ist der Betrag, der nach Abzug der variablen Kosten zur **Deckung der Fixkosten** übrig bleibt:

**db = p − kv**  und  **DB = db · x**,  **Gewinn = DB − Kf**

Die **Gewinnschwelle** (Break-even-Point) ist erreicht, wenn der gesamte Deckungsbeitrag genau die Fixkosten deckt:

**x(BEP) = Kf ÷ db**

> [!example] SaaS-Abo
> Ein Softwarehaus bietet ein Abo für 49 € im Monat an. Je Kunde fallen 9 € variable Kosten an (Hosting, Support). Die monatlichen Fixkosten betragen 24.000 €.
> - db = 49 € − 9 € = **40 €**
> - BEP = 24.000 € ÷ 40 € = **600 Kunden**
> - Bei 750 Kunden: Gewinn = 750 · 40 € − 24.000 € = **6.000 €**

![Break-even-Diagramm](break-even.svg "Ab 600 Stück liegen die Erlöse über den Gesamtkosten")

Die **Preisuntergrenze** liegt **kurzfristig** bei den variablen Stückkosten (jeder Auftrag darüber bringt einen positiven Deckungsbeitrag), **langfristig** müssen auch die Fixkosten gedeckt sein (Selbstkosten).

## Kostenvergleich: Kauf, Miete, Eigenentwicklung

Bei zwei Alternativen mit unterschiedlicher Kostenstruktur sucht man die **kritische Menge** bzw. den **kritischen Zeitpunkt**, an dem beide gleich teuer sind.

> [!example] On-Premises oder SaaS?
> Variante A: Kauflizenz 12.000 € einmalig + 150 € Wartung pro Monat. Variante B: SaaS für 650 € pro Monat.
> 12.000 + 150 · t = 650 · t → 12.000 = 500 · t → **t = 24 Monate**.
> Wird die Software länger als zwei Jahre genutzt, ist der Kauf günstiger.

Bei **Make-or-Buy** fließen neben den Kosten auch qualitative Gründe ein: Know-how im Haus, Abhängigkeit vom Anbieter, Zeit bis zur Einführung, Anpassbarkeit – genau dafür gibt es die Nutzwertanalyse (unten).

## Amortisationsrechnung

Die **statische Amortisationsrechnung** fragt: Nach welcher Zeit hat sich eine Investition durch Einsparungen oder Mehrerlöse bezahlt gemacht?

**Amortisationsdauer = Investition ÷ jährlicher (oder monatlicher) Rückfluss**

> [!example] Automatisierung der Rechnungsprüfung
> Eine Software kostet einschließlich Einführung **36.000 €**. Sie spart monatlich 30 Arbeitsstunden à 45 € (Personalkosten inkl. Nebenkosten) = 1.350 €, verursacht aber 250 € Wartung pro Monat.
> Rückfluss pro Monat: 1.350 € − 250 € = **1.100 €**
> Amortisationsdauer: 36.000 € ÷ 1.100 € ≈ **32,7 Monate** (rund 2 Jahre und 9 Monate)

Vereinfachend wird oft der **Return on Investment** genannt: ROI = Gewinn (bzw. Einsparung) ÷ eingesetztes Kapital × 100 %.

> [!warning] Grenzen der statischen Rechnung
> Sie ignoriert den Zeitwert des Geldes (Zinsen) und alles, was nach der Amortisation passiert. Für große Investitionen nutzt man **dynamische Verfahren** wie die Kapitalwertmethode.

### Personalkosten im Projekt

Im IHK-Projekt rechnet man Projektkosten meist über **Stundensätze**: Personalkosten (Bruttogehalt + Arbeitgeberanteile) ÷ Jahresarbeitsstunden, zuzüglich eines Gemeinkostenanteils für Arbeitsplatz, Hardware und Lizenzen. Beispiel: 80 h Auszubildender à 15 € + 10 h Ausbilder à 60 € + Ressourcen 500 € = 1.200 + 600 + 500 = **2.300 €** Projektkosten.

## Angebotsvergleich

Für die Beschaffung vergleicht man nicht den Listenpreis, sondern den **Bezugspreis (Einstandspreis)**:

| Schritt | Angebot A | Angebot B |
| :--- | ---: | ---: |
| Listeneinkaufspreis | 4.800,00 € | 4.500,00 € |
| − Lieferantenrabatt (A 10 %, B 5 %) | − 480,00 € | − 225,00 € |
| = Zieleinkaufspreis | 4.320,00 € | 4.275,00 € |
| − Lieferantenskonto (A 2 %, B 3 %) | − 86,40 € | − 128,25 € |
| = Bareinkaufspreis | 4.233,60 € | 4.146,75 € |
| + Bezugskosten (Versand) | + 60,00 € | + 120,00 € |
| **= Bezugspreis** | **4.293,60 €** | **4.266,75 €** |

Angebot B ist um 26,85 € günstiger – obwohl es mehr Versand kostet. Daneben zählen **qualitative Kriterien**: Lieferzeit, Garantie, Service, Zuverlässigkeit des Lieferanten.

### Lohnt sich Skonto?

Skonto ist ein Nachlass für schnelle Zahlung. Der Verzicht darauf entspricht einem sehr teuren Kredit:

**Effektiver Jahreszins ≈ Skontosatz ÷ (100 − Skontosatz) × 360 ÷ (Zahlungsziel − Skontofrist) × 100 %**

Bei „2 % Skonto innerhalb 10 Tagen, netto 30 Tage“: 2 ÷ 98 × 360 ÷ 20 ≈ **36,7 %** pro Jahr. Selbst ein Kontokorrentkredit ist billiger – Skonto lohnt sich fast immer.

## Nutzwertanalyse

Die **Nutzwertanalyse** (NWA) bewertet Alternativen anhand **gewichteter, auch qualitativer Kriterien**:

1. Kriterien festlegen (z. B. Preis, Leistung, Service)
2. Kriterien gewichten (Summe **100 %**)
3. Jede Alternative je Kriterium bewerten (z. B. 1 bis 10 Punkte)
4. **Teilnutzen = Gewichtung × Punkte**, Teilnutzen addieren
5. Die Alternative mit dem höchsten **Gesamtnutzwert** empfehlen

| Kriterium | Gewicht | Laptop A | Laptop B | Laptop C |
| :--- | ---: | ---: | ---: | ---: |
| Preis | 30 % | 8 → 2,40 | 5 → 1,50 | 9 → 2,70 |
| Leistung | 25 % | 6 → 1,50 | 9 → 2,25 | 5 → 1,25 |
| Akkulaufzeit | 20 % | 7 → 1,40 | 8 → 1,60 | 5 → 1,00 |
| Service/Garantie | 15 % | 5 → 0,75 | 8 → 1,20 | 6 → 0,90 |
| Gewicht | 10 % | 6 → 0,60 | 7 → 0,70 | 9 → 0,90 |
| **Nutzwert** | **100 %** | **6,65** | **7,25** | **6,75** |

**Laptop B** hat den höchsten Nutzwert, obwohl er am teuersten ist. Die Methode macht die Entscheidung **nachvollziehbar**, bleibt aber subjektiv – deshalb Kriterien und Gewichte vorher festlegen und begründen.

## ABC-Analyse

Die **ABC-Analyse** teilt Güter (oder Kunden, Lieferanten) nach ihrem **Wertanteil** ein, um die Aufmerksamkeit richtig zu verteilen:

| Klasse | Mengenanteil (ca.) | Wertanteil (ca.) | Umgang |
| :--- | ---: | ---: | :--- |
| **A** | 10–20 % | 70–80 % | genau planen, Preise verhandeln, eng überwachen |
| **B** | 20–30 % | 15–20 % | mittlerer Aufwand |
| **C** | 50–70 % | 5–10 % | vereinfachte Beschaffung, größere Mengen |

Vorgehen: Jahresverbrauchswert je Artikel (Menge × Preis) berechnen, absteigend sortieren, Anteile und kumulierte Anteile bilden, Klassengrenzen ziehen.

## Abschreibung

Anschaffungen, die länger als ein Jahr genutzt werden, verteilt man als **Abschreibung (AfA)** über die Nutzungsdauer: **linear = Anschaffungskosten ÷ Nutzungsdauer**. Ein Server für 6.000 € mit 5 Jahren Nutzungsdauer wird mit 1.200 € pro Jahr abgeschrieben. Für Computerhardware und Software lässt die Finanzverwaltung seit 2021 eine Nutzungsdauer von **einem Jahr** zu.
`,
  codeSnippet: `// Nutzwertanalyse berechnen
const gewichte = { preis: 0.30, leistung: 0.25, akku: 0.20, service: 0.15, gewicht: 0.10 };
const bewertungen = {
  'Laptop A': { preis: 8, leistung: 6, akku: 7, service: 5, gewicht: 6 },
  'Laptop B': { preis: 5, leistung: 9, akku: 8, service: 8, gewicht: 7 },
  'Laptop C': { preis: 9, leistung: 5, akku: 5, service: 6, gewicht: 9 }
};

const nutzwerte = Object.entries(bewertungen).map(([name, punkte]) => ({
  name,
  nutzwert: Object.entries(gewichte).reduce((summe, [k, g]) => summe + g * punkte[k], 0)
}));
nutzwerte.sort((a, b) => b.nutzwert - a.nutzwert);
console.table(nutzwerte.map((n) => ({ ...n, nutzwert: n.nutzwert.toFixed(2) })));
// Laptop B 7.25 · Laptop C 6.75 · Laptop A 6.65`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'break-even',
      title: 'Break-even für einen Wartungsvertrag',
      prompt: 'Ein IT-Dienstleister bietet Wartungsverträge für 180 € pro Monat an. Je Vertrag entstehen variable Kosten von 60 € (Fahrten, Ersatzteile). Die Fixkosten der Abteilung betragen 9.600 € pro Monat.\n\n1. Wie hoch ist der Deckungsbeitrag pro Vertrag?\n2. Ab wie vielen Verträgen arbeitet die Abteilung kostendeckend?\n3. Welcher Gewinn entsteht bei 100 Verträgen?',
      solution: '1. db = 180 € − 60 € = **120 €**\n2. BEP = 9.600 € ÷ 120 € = **80 Verträge**\n3. Gewinn = 100 · 120 € − 9.600 € = **2.400 €** pro Monat'
    },
    {
      id: 'angebotsvergleich',
      title: 'Angebote vergleichen',
      prompt: 'Für 20 Monitore liegen zwei Angebote vor:\n\n- **Lieferant X**: 249 € pro Stück, 8 % Mengenrabatt, 2 % Skonto, frei Haus\n- **Lieferant Y**: 235 € pro Stück, kein Rabatt, 3 % Skonto, Versandpauschale 95 €\n\nBerechne die Bezugspreise und empfiehl ein Angebot.',
      hints: ['Listenpreis = 20 × Stückpreis. Erst Rabatt, dann Skonto vom Zieleinkaufspreis, dann Bezugskosten.'],
      solution: '| Schritt | X | Y |\n| :--- | ---: | ---: |\n| Listeneinkaufspreis | 4.980,00 € | 4.700,00 € |\n| − Rabatt | − 398,40 € | – |\n| Zieleinkaufspreis | 4.581,60 € | 4.700,00 € |\n| − Skonto | − 91,63 € | − 141,00 € |\n| Bareinkaufspreis | 4.489,97 € | 4.559,00 € |\n| + Bezugskosten | 0,00 € | 95,00 € |\n| **Bezugspreis** | **4.489,97 €** | **4.654,00 €** |\n\nEmpfehlung: **Lieferant X**, 164,03 € günstiger (vorbehaltlich Lieferzeit und Service).'
    },
    {
      id: 'amortisation',
      title: 'Amortisation eines Self-Service-Portals',
      prompt: 'Ein Self-Service-Portal für Passwort-Resets kostet 18.000 € (Entwicklung und Einführung) und 200 € Betrieb pro Monat. Bisher gibt es 300 Reset-Anfragen im Monat, die je 10 Minuten Support-Zeit kosten (Stundensatz 54 €). Das Portal soll 80 % davon automatisieren. Nach wie vielen Monaten hat es sich amortisiert?',
      solution: 'Automatisierte Anfragen: 300 × 0,8 = 240 pro Monat.\nGesparte Zeit: 240 × 10 min = 2.400 min = **40 h**.\nEinsparung: 40 h × 54 € = **2.160 €** pro Monat.\nRückfluss: 2.160 € − 200 € = **1.960 €** pro Monat.\nAmortisation: 18.000 € ÷ 1.960 € ≈ **9,2 Monate**.'
    },
    {
      id: 'skonto-zins',
      title: 'Skonto oder Kredit?',
      prompt: 'Eine Rechnung über 12.000 € gewährt 3 % Skonto bei Zahlung innerhalb von 14 Tagen, sonst netto in 45 Tagen. Das Konto müsste dafür 31 Tage mit 11 % Zinsen p. a. überzogen werden. Lohnt sich der Skontoabzug? Rechne mit 360 Zinstagen.',
      solution: 'Skontoertrag: 12.000 € × 3 % = **360 €**. Zu zahlen sind 11.640 €.\nKreditzinsen: 11.640 € × 11 % × 31 ÷ 360 ≈ **110,26 €**.\nVorteil: 360 € − 110,26 € = **249,74 €** → Skonto nutzen.\n\nKontrolle über den Jahreszins: 3 ÷ 97 × 360 ÷ 31 ≈ 35,9 % > 11 %.'
    }
  ],
  quiz: [
    {
      question: 'Wie berechnet man den Deckungsbeitrag pro Stück?',
      options: ['Preis − Fixkosten', 'Preis − variable Stückkosten', 'Erlös − Gewinn', 'Fixkosten ÷ Menge'],
      correct: 1,
      explanation: 'db = p − kv. Er steht zur Deckung der Fixkosten zur Verfügung.'
    },
    {
      question: 'Fixkosten 30.000 €, Preis 80 €, variable Stückkosten 30 €. Wo liegt die Gewinnschwelle?',
      options: ['375 Stück', '600 Stück', '1.000 Stück', '300 Stück'],
      correct: 1,
      explanation: 'db = 50 €, BEP = 30.000 € ÷ 50 € = 600 Stück.'
    },
    {
      question: 'Welche Kosten sind typischerweise fix?',
      options: ['Materialkosten', 'Miete für das Büro', 'Cloud-Kosten pro Nutzer', 'Versandkosten pro Paket'],
      correct: 1,
      explanation: 'Die Miete fällt unabhängig von der produzierten Menge an.'
    },
    {
      question: 'Was ist die richtige Reihenfolge im Angebotsvergleich?',
      options: [
        'Listenpreis − Skonto − Rabatt + Bezugskosten',
        'Listenpreis − Rabatt − Skonto + Bezugskosten',
        'Listenpreis + Bezugskosten − Rabatt − Skonto',
        'Listenpreis − Rabatt + Bezugskosten − Skonto'
      ],
      correct: 1,
      explanation: 'Rabatt auf den Listenpreis, Skonto auf den Zieleinkaufspreis, dann Bezugskosten addieren.'
    },
    {
      question: 'Was macht eine Nutzwertanalyse?',
      options: [
        'Sie berechnet den Kapitalwert einer Investition',
        'Sie vergleicht Alternativen anhand gewichteter, auch qualitativer Kriterien',
        'Sie teilt Artikel nach ihrem Wertanteil ein',
        'Sie ermittelt den kritischen Pfad'
      ],
      correct: 1,
      explanation: 'Gewichtung × Punkte je Kriterium, aufsummiert zum Nutzwert.'
    },
    {
      question: 'Eine Investition kostet 24.000 € und bringt 800 € Rückfluss pro Monat. Wie lang ist die Amortisationsdauer?',
      options: ['20 Monate', '30 Monate', '24 Monate', '36 Monate'],
      correct: 1,
      explanation: '24.000 € ÷ 800 € pro Monat = 30 Monate.'
    },
    {
      question: 'Welche Güter gehören in der ABC-Analyse zur Klasse A?',
      options: [
        'Viele Güter mit geringem Wertanteil',
        'Wenige Güter mit hohem Wertanteil',
        'Güter mit hoher Lagerdauer',
        'Güter ohne Lieferanten'
      ],
      correct: 1,
      explanation: 'Rund 10–20 % der Güter machen etwa 70–80 % des Wertes aus – dort lohnt sich der größte Aufwand.'
    }
  ],
  relatedLabs: [
    { id: 'ihk_wirtschaftlichkeit_lab', label: 'Wirtschaftlichkeit & Amortisation' },
    { id: 'nwa_scoring_lab', label: 'Nutzwertanalyse' },
    { id: 'wiso_angebotsvergleich_lab', label: 'Angebotsvergleich' },
    { id: 'wiso_contribution_margin', label: 'Deckungsbeitrag' },
    { id: 'wiso_abc_xyz', label: 'ABC-/XYZ-Analyse' }
  ],
  sources: [
    { title: 'Wöhe, Döring, Brösel: Einführung in die Allgemeine Betriebswirtschaftslehre, Vahlen (Kosten- und Investitionsrechnung)', url: 'https://www.vahlen.de/' },
    { title: 'Gabler Wirtschaftslexikon: Deckungsbeitrag', url: 'https://wirtschaftslexikon.gabler.de/definition/deckungsbeitrag-29846' },
    { title: 'Gabler Wirtschaftslexikon: Nutzwertanalyse', url: 'https://wirtschaftslexikon.gabler.de/definition/nutzwertanalyse-43856' },
    { title: 'Gabler Wirtschaftslexikon: Amortisationsrechnung', url: 'https://wirtschaftslexikon.gabler.de/definition/amortisationsrechnung-31328' },
    { title: 'BMF-Schreiben vom 22.02.2022: Nutzungsdauer von Computerhardware und Software', url: 'https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Einkommensteuer/2022-02-22-nutzungsdauer-von-computerhardware-und-software-zur-dateneingabe-und-verarbeitung.html' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Wirtschafts- und Geschäftsprozesse (Preisbildung, ABC-Analyse)', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
