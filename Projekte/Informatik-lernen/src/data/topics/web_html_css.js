/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Ein HTML5-Dokument mit semantischen Elementen und barrierearmen Formularen aufbauen',
    'CSS-Selektoren, Kaskade und Spezifität verstehen und Konflikte auflösen',
    'Mit dem Box-Modell rechnen und Layouts mit Flexbox und Grid bauen',
    'Seiten responsiv (Mobile First, Media Queries) und für Dark Mode gestalten'
  ],
  content: `
## Aufgabenteilung im Web

| Sprache | Aufgabe | Vergleich |
| :--- | :--- | :--- |
| **HTML** | Struktur und Bedeutung des Inhalts | Rohbau und Räume |
| **CSS** | Darstellung: Farben, Abstände, Layout | Einrichtung und Anstrich |
| **JavaScript** | Verhalten und Interaktion | Elektrik und Haustechnik |

## Grundgerüst

\`\`\`html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lernplattform – Startseite</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>…</header>
  <main>…</main>
  <footer>…</footer>
  <script type="module" src="app.js"></script>
</body>
</html>
\`\`\`

- \`lang="de"\` hilft Screenreadern bei der Aussprache und Suchmaschinen.
- Die **viewport**-Angabe ist Pflicht für Mobilgeräte. Zoomen darf **nicht** gesperrt werden (\`user-scalable=no\` ist eine Barriere).

## Semantisches HTML

Semantische Elemente sagen, **was** ein Inhalt ist – das hilft Screenreadern, Suchmaschinen und der Wartung:

| Element | Bedeutung |
| :--- | :--- |
| \`<header>\`, \`<footer>\` | Kopf- und Fußbereich der Seite oder eines Abschnitts |
| \`<nav>\` | Hauptnavigation |
| \`<main>\` | Hauptinhalt (genau einmal pro Seite) |
| \`<article>\` | in sich abgeschlossener Inhalt (Blogpost, Produktkarte) |
| \`<section>\` | thematischer Abschnitt mit Überschrift |
| \`<aside>\` | ergänzender Inhalt (Seitenleiste, Infokasten) |
| \`<h1>\` … \`<h6>\` | Überschriften in logischer Reihenfolge, keine Ebene überspringen |
| \`<button>\` vs. \`<a>\` | Button für **Aktionen**, Link für **Navigation** |

Ein \`<div onclick>\` statt \`<button>\` ist per Tastatur nicht erreichbar und für Screenreader kein Bedienelement.

### Bilder, Tabellen, Listen

- \`<img src="router.png" alt="Router mit vier LAN-Ports">\` – der **Alternativtext** beschreibt den Inhalt; rein dekorative Bilder bekommen \`alt=""\`.
- Tabellen nur für **tabellarische Daten**, mit \`<th scope="col">\` für Spaltenköpfe – nicht für das Seitenlayout.
- \`<ul>\` (ungeordnet), \`<ol>\` (nummeriert), \`<dl>\` (Begriff und Erklärung).

## Formulare

\`\`\`html
<form action="/anmelden" method="post">
  <label for="email">E-Mail</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="alter">Alter</label>
  <input id="alter" name="alter" type="number" min="16" max="99">

  <fieldset>
    <legend>Fachrichtung</legend>
    <input type="radio" id="ae" name="fr" value="AE"><label for="ae">Anwendungsentwicklung</label>
    <input type="radio" id="si" name="fr" value="SI"><label for="si">Systemintegration</label>
  </fieldset>

  <button type="submit">Anmelden</button>
</form>
\`\`\`

- Jedes Feld braucht ein **\`<label>\`**, verknüpft über \`for\`/\`id\`. Ein Platzhaltertext ersetzt kein Label.
- Passende **Typen** (\`email\`, \`number\`, \`date\`, \`tel\`) liefern die richtige Handytastatur und einfache Prüfung im Browser.
- Browser-Validierung (\`required\`, \`min\`, \`pattern\`) ist Komfort – **geprüft wird immer auch auf dem Server**.
- \`GET\` hängt die Daten an die URL (für Suchen), \`POST\` schickt sie im Body (für Änderungen und vertrauliche Daten).

> [!info] Barrierefreiheit ist Pflicht
> Seit dem 28. Juni 2025 verlangt das **Barrierefreiheitsstärkungsgesetz (BFSG)**, dass viele digitale Produkte und Dienstleistungen für Verbraucher barrierefrei sind, z. B. Onlineshops und Online-Banking. Maßstab sind die **WCAG** (Web Content Accessibility Guidelines) auf Stufe AA: u. a. Kontrast von mindestens 4,5:1 für normalen Text, vollständige Tastaturbedienbarkeit, sichtbarer Fokus und Textalternativen.

## CSS-Grundlagen

\`\`\`css
selektor {
  eigenschaft: wert;
}
\`\`\`

### Selektoren

| Selektor | trifft | Beispiel |
| :--- | :--- | :--- |
| Element | alle Elemente dieses Typs | \`p\` |
| Klasse | Elemente mit \`class="karte"\` | \`.karte\` |
| ID | das Element mit \`id="kopf"\` | \`#kopf\` |
| Nachfahre | \`a\` irgendwo in \`nav\` | \`nav a\` |
| Kind | direkte Kinder | \`ul > li\` |
| Attribut | Felder vom Typ E-Mail | \`input[type="email"]\` |
| Pseudoklasse | Zustand | \`a:hover\`, \`button:focus-visible\`, \`li:nth-child(odd)\` |
| Pseudoelement | Teil eines Elements | \`p::first-line\`, \`.pflicht::after\` |

### Kaskade und Spezifität

Gelten mehrere Regeln für dasselbe Element, entscheidet

1. die **Wichtigkeit** (\`!important\` – sparsam einsetzen),
2. die **Spezifität** des Selektors,
3. die **Reihenfolge** – bei Gleichstand gewinnt die spätere Regel.

Die Spezifität zählt man als Tripel **(IDs, Klassen/Attribute/Pseudoklassen, Elemente/Pseudoelemente)**. Inline-Styles (\`style="…"\`) schlagen alle Selektoren.

| Selektor | Spezifität |
| :--- | :---: |
| \`p\` | (0, 0, 1) |
| \`.karte p\` | (0, 1, 1) |
| \`#nav .link a:hover\` | (1, 2, 1) |
| \`ul li.aktiv\` | (0, 1, 2) |

Manche Eigenschaften wie \`color\` und \`font-family\` werden an Kindelemente **vererbt**, andere wie \`margin\` und \`border\` nicht.

## Das Box-Modell

Jedes Element ist ein Rechteck aus Inhalt, Innenabstand, Rahmen und Außenabstand:

![Das CSS-Box-Modell](box-model.svg "content, padding, border und margin von innen nach außen")

> [!example] Rechenbeispiel
> \`width: 300px; padding: 20px; border: 5px solid;\`
> - mit \`box-sizing: content-box\` (Standard): sichtbare Breite = 300 + 2 × 20 + 2 × 5 = **350 px**
> - mit \`box-sizing: border-box\`: sichtbare Breite = **300 px**, der Inhalt schrumpft auf 300 − 40 − 10 = 250 px

Deshalb setzen fast alle Projekte am Anfang \`*, *::before, *::after { box-sizing: border-box; }\`. Achtung: Vertikale Außenabstände benachbarter Blöcke **fallen zusammen** (*Margin Collapsing*) – zwischen zwei Absätzen mit je 20 px margin liegen 20 px, nicht 40 px.

### Einheiten

\`px\` (fest), \`%\` (relativ zum Elternelement), \`rem\` (relativ zur Schriftgröße des Wurzelelements – gut für Barrierefreiheit, weil es die Nutzereinstellung respektiert), \`em\` (relativ zur eigenen Schriftgröße), \`vw\`/\`vh\` (Prozent des Viewports), \`fr\` (Anteil des freien Platzes im Grid).

## Layout mit Flexbox und Grid

**Flexbox** ordnet Elemente in **einer** Richtung an (Zeile oder Spalte):

\`\`\`css
.leiste {
  display: flex;
  justify-content: space-between; /* Hauptachse: Verteilung */
  align-items: center;            /* Querachse: Ausrichtung */
  gap: 12px;
  flex-wrap: wrap;                /* umbrechen statt überlaufen */
}
\`\`\`

**Grid** ordnet in **zwei** Dimensionen (Zeilen und Spalten):

\`\`\`css
.karten {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 20px;
}
\`\`\`

Diese Zeile erzeugt so viele Spalten von mindestens 260 px, wie hineinpassen – ganz ohne Media Query. Das \`min(…, 100%)\` verhindert, dass eine Karte auf sehr schmalen Handys breiter als der Bildschirm wird.

## Responsive Design

**Mobile First**: Die Grundstile gelten für kleine Bildschirme, größere bekommen Ergänzungen per **Media Query**:

\`\`\`css
.inhalt { padding: 16px; }

@media (min-width: 768px) {
  .inhalt { padding: 32px; display: grid; grid-template-columns: 240px 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
\`\`\`

### Custom Properties und Dark Mode

\`\`\`css
:root {
  --hintergrund: #ffffff;
  --text: #0f172a;
}
@media (prefers-color-scheme: dark) {
  :root { --hintergrund: #0f172a; --text: #e2e8f0; }
}
body { background: var(--hintergrund); color: var(--text); }
\`\`\`

Diese App arbeitet genauso: Alle Farben sind Variablen, das Theme schaltet nur ihre Werte um.
`,
  codeSnippet: `<!-- Responsive Karte mit semantischem HTML -->
<article class="karte">
  <img src="switch.webp" alt="24-Port-Switch im Rack" width="400" height="250">
  <h2>Managed Switch</h2>
  <p>VLAN-fähig, 24 × 1 Gbit/s, 4 × SFP+</p>
  <a href="/produkte/switch-24" class="button">Details ansehen</a>
</article>

<style>
  .karte { display: grid; gap: 8px; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; }
  .karte img { width: 100%; height: auto; border-radius: 8px; }
  .button:focus-visible { outline: 3px solid #4338ca; outline-offset: 2px; }
</style>`,
  codeLanguage: 'HTML/CSS',
  exercises: [
    {
      id: 'semantik',
      title: 'Semantik verbessern',
      prompt: 'Verbessere dieses Markup semantisch und barrierefrei:\n\n```html\n<div class="top"><div class="logo" onclick="home()">Shop</div></div>\n<div class="menu"><a href="/">Start</a> <a href="/produkte">Produkte</a></div>\n<div class="content">\n  <div class="big">Unsere Angebote</div>\n  <img src="sale.jpg">\n  <input placeholder="Ihre E-Mail"> <div onclick="send()">Senden</div>\n</div>\n```',
      solution: '```html\n<header>\n  <a href="/" class="logo">Shop</a>\n</header>\n<nav aria-label="Hauptnavigation">\n  <a href="/">Start</a> <a href="/produkte">Produkte</a>\n</nav>\n<main>\n  <h1>Unsere Angebote</h1>\n  <img src="sale.jpg" alt="Herbstaktion: 20 % auf alle Monitore">\n  <form>\n    <label for="nl-mail">Ihre E-Mail</label>\n    <input id="nl-mail" type="email" autocomplete="email" required>\n    <button type="submit">Senden</button>\n  </form>\n</main>\n```\n\nVerbesserungen: `header`/`nav`/`main`, echte Überschrift, Link statt klickbarem div für die Navigation, Alternativtext, Label statt nur Platzhalter, passender Feldtyp, `<button>` statt div.'
    },
    {
      id: 'spezifitaet',
      title: 'Welche Farbe gewinnt?',
      prompt: 'Welche Farbe hat der Link `<a class="cta" id="kaufen">` in `<nav class="haupt">`?\n\n```css\nnav.haupt a { color: blue; }\n.cta { color: green; }\n#kaufen { color: red; }\na.cta { color: orange; }\n```',
      solution: 'Spezifitäten: `nav.haupt a` (0,1,2), `.cta` (0,1,0), `#kaufen` (1,0,0), `a.cta` (0,1,1).\n\nDie ID hat die höchste Spezifität → **rot**. Ohne die ID-Regel gewänne `nav.haupt a` mit (0,1,2) vor `a.cta` mit (0,1,1) → blau.'
    },
    {
      id: 'box-rechnen',
      title: 'Box-Modell rechnen',
      prompt: 'Drei Karten mit `width: 30%; padding: 0 16px; border: 2px solid; margin-right: 2%;` sollen in einem 1.000 px breiten Container nebeneinanderpassen. Passen sie mit `content-box`? Und mit `border-box`?',
      hints: ['Prozentangaben beziehen sich auf die Breite des Containers.'],
      solution: '**content-box**: je Karte 300 + 32 + 4 = 336 px, dazu 20 px margin → 356 px × 3 = **1.068 px > 1.000 px** → die dritte Karte bricht um.\n\n**border-box**: je Karte 300 px + 20 px margin = 320 px × 3 = **960 px** → passt.\n\nModerner und einfacher: Flexbox oder Grid mit `gap` statt Prozentbreiten und margin.'
    },
    {
      id: 'responsive-layout',
      title: 'Responsives Layout bauen',
      prompt: 'Schreibe CSS für eine Seite mit Kopf, Seitenleiste, Inhalt und Fuß. Auf dem Handy liegen alle Bereiche untereinander, ab 900 px steht die Seitenleiste (250 px breit) links neben dem Inhalt. Nutze CSS Grid mit benannten Bereichen.',
      solution: '```css\n.seite {\n  display: grid;\n  gap: 16px;\n  grid-template-areas:\n    "kopf"\n    "inhalt"\n    "leiste"\n    "fuss";\n}\n.kopf { grid-area: kopf; }\n.leiste { grid-area: leiste; }\n.inhalt { grid-area: inhalt; }\n.fuss { grid-area: fuss; }\n\n@media (min-width: 900px) {\n  .seite {\n    grid-template-columns: 250px 1fr;\n    grid-template-areas:\n      "kopf kopf"\n      "leiste inhalt"\n      "fuss fuss";\n  }\n}\n```\n\nAuf dem Handy steht der Inhalt bewusst vor der Seitenleiste.'
    }
  ],
  quiz: [
    {
      question: 'Welches Element kennzeichnet den Hauptinhalt einer Seite?',
      options: ['<section>', '<main>', '<article>', '<div id="main">'],
      correct: 1,
      explanation: '<main> gibt es genau einmal pro Seite. Screenreader können direkt dorthin springen.'
    },
    {
      question: 'Welche Spezifität hat der Selektor #menu .item a?',
      options: ['(0, 1, 1)', '(1, 1, 1)', '(1, 0, 2)', '(0, 2, 1)'],
      correct: 1,
      explanation: 'Eine ID (#menu), eine Klasse (.item), ein Element (a) → (1, 1, 1).'
    },
    {
      question: 'Wie breit ist ein Element mit width: 200px; padding: 10px; border: 1px solid bei box-sizing: content-box?',
      options: ['200 px', '211 px', '222 px', '220 px'],
      correct: 2,
      explanation: '200 + 2 × 10 + 2 × 1 = 222 px. Mit border-box wären es genau 200 px.'
    },
    {
      question: 'Wofür eignet sich CSS Grid besonders?',
      options: ['Für einzelne Zeilen von Buttons', 'Für zweidimensionale Layouts aus Zeilen und Spalten', 'Für Animationen', 'Für Schriftarten'],
      correct: 1,
      explanation: 'Grid arbeitet in zwei Dimensionen, Flexbox in einer.'
    },
    {
      question: 'Warum sollte jedes Formularfeld ein <label> haben?',
      options: [
        'Weil der Browser sonst das Formular nicht absendet',
        'Damit Screenreader das Feld benennen und ein Klick auf die Beschriftung das Feld fokussiert',
        'Weil Platzhalter in HTML5 verboten sind',
        'Für bessere Ladezeiten'
      ],
      correct: 1,
      explanation: 'Das Label macht den Zweck des Feldes zugänglich und vergrößert die Klickfläche.'
    },
    {
      question: 'Was bedeutet Mobile First?',
      options: [
        'Die Seite funktioniert nur auf Smartphones',
        'Die Grundstile gelten für kleine Bildschirme, größere bekommen per min-width-Media-Query Ergänzungen',
        'Mobile Nutzer werden zuerst bedient',
        'Es gibt eine eigene App statt einer Website'
      ],
      correct: 1,
      explanation: 'Man entwirft zuerst für schmale Bildschirme und erweitert schrittweise.'
    }
  ],
  relatedLabs: [
    { id: 'monaco_studio', label: 'Code-Editor (Monaco)' },
    { id: 'http_caching_lab', label: 'HTTP-Caching' }
  ],
  sources: [
    { title: 'MDN: HTML-Grundlagen', url: 'https://developer.mozilla.org/de/docs/Learn_web_development/Core/Structuring_content' },
    { title: 'MDN: Spezifität', url: 'https://developer.mozilla.org/de/docs/Web/CSS/Guides/Cascade/Specificity' },
    { title: 'MDN: Das Box-Modell', url: 'https://developer.mozilla.org/de/docs/Learn_web_development/Core/Styling_basics/Box_model' },
    { title: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2', url: 'https://www.w3.org/TR/WCAG22/' },
    { title: 'Bundesfachstelle Barrierefreiheit: Barrierefreiheitsstärkungsgesetz (BFSG)', url: 'https://www.bundesfachstelle-barrierefreiheit.de/DE/Fachwissen/Produkte-und-Dienstleistungen/Barrierefreiheitsstaerkungsgesetz/barrierefreiheitsstaerkungsgesetz_node.html' },
    { title: 'web.dev: Learn CSS', url: 'https://web.dev/learn/css' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Grundlagen HTML & CSS', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
