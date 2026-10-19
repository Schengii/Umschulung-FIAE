# 0014 — Seitenspezifische Stylesheets statt einer großen `style.css`

**Status:** Akzeptiert
**Datum:** 2026-10-19

## Kontext

`assets/css/style.css` war auf rund 7 900 Zeilen (177 KB Quelltext) gewachsen und wurde von jeder Seite geladen, auch von `impressum.html` oder `404.html`. Ein großer Teil der Regeln gehört aber zu genau einer Seite: Notenrechner und Commit-Raster (Dashboard), Hero und Timeline (Home), Projektkarten und Suche (Portfolio), Lernroadmap, Lernkarten, Slideshow und so weiter. Die Stylesheets einzelner Seiten (`quiz.css`, `memory.css`, `lebenslauf.css` …) gab es bereits, die Regeln dieser Seiten lagen aber nur teilweise dort.

## Entscheidung

- `style.css` enthält die Basis: Design-Variablen, Reset, Layout, Navigation, Karten, Footer, Komponenten, die mehrere Seiten teilen, sowie alles, was Skripte zur Laufzeit auf beliebigen Seiten erzeugen.
- Regeln, die nur auf **einer** Seite greifen, stehen in `assets/css/<seite>.css` (z. B. `home.css`, `portfolio.css`, `dashboard.css`). Die Seite bindet das Blatt nach `style.css` und Font Awesome per `<link>` ein. Bestehende Seitenblätter (`quiz.css`, `memory.css`, `praktikumsbetrieb.css`, `flashcards.css`, `dashboard.css`) haben die ausgelagerten Regeln an ihrem Anfang bekommen, weil diese in der Kaskade ohnehin vor den eigenen Regeln standen.
- Widgets, die mehrere Seiten teilen, bleiben unter `assets/css/modules/`.

Beim Umbau (einmalig, Werkzeug nicht im Repo) wurden 344 Regeln verschoben, `style.css` schrumpfte um 27 % (177 KB → 130 KB Quelltext). Eine Regel gilt als seitenspezifisch, wenn alle Klassen und IDs ihres Selektors nur auf einer Seite vorkommen (HTML sowie die dort ladbaren Skripte inklusive der Lazy-Module, deren Guard-Selektor zur Seite passt). Nicht verschoben wurden:

- Regeln ohne Klasse oder ID (`body`, `h1`, `:root` …),
- Selektoren mit zur Laufzeit zusammengesetzten Klassennamen (`'filter-' + x`),
- Klassen, die auch `Projekte/Minecraft` aus `style.css` bezieht,
- Regeln, die in der Kaskade gegen eine **spätere** Basisregel gleicher Spezifität verlieren würden. Ein ausgelagertes Blatt kommt nach `style.css`; bei Gleichstand würde sonst die ausgelagerte Regel gewinnen. Betroffen waren 46 Regeln (z. B. `.btn-project` gegen `.btn-github`), sie blieben in der Basis.

**Prüfung:** Vor und nach dem Umbau wurden die berechneten Styles aller Elemente jeder Seite verglichen (28 Seiten, fünf Viewports von 320 bis 1440 px, dunkles und helles Theme), dazu Hover- und Fokus-Zustände und neun Interaktionsszenarien (Quiz, Lernkarten, Roadmap-Drawer, Portfolio-Filter, Command Palette, mobiles Menü, Prüfungssimulation …). Ergebnis: bis auf Zeitrauschen (Tipp-Animation im Hero, Hover während einer Transition) identisch. Der erste Versuch ohne Konfliktprüfung hatte genau an den Portfolio-Buttons abgewichen und zeigte, dass der Vergleich anschlägt.

## Konsequenzen

- Neue seitenspezifische Regeln gehören in das Blatt der Seite, nicht in `style.css`. Eine neue Seite bekommt bei Bedarf ein eigenes `assets/css/<seite>.css` und den `<link>` nach Font Awesome.
- Wird eine Klasse später auf einer zweiten Seite benutzt, muss ihre Regel zurück nach `style.css` (oder in ein Modul unter `assets/css/modules/`). Das fällt nur im Browser auf, nicht in CI.
- Jede Seite lädt eine Datei mehr; Service Worker und Build erfassen die neuen Dateien automatisch (`generate-sw-assets`, `build:dist`). Dafür lädt eine Seite wie `impressum.html` nur noch die Basis.
- `Projekte/Minecraft` hängt weiter an `style.css`. Verschiebt man Regeln, die diese Demo braucht, bricht sie.
