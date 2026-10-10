# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portfolio- und IHK-Prüfungsvorbereitungs-Site (PWA) für die Umschulung zum FIAE. Reines statisches Vanilla HTML/CSS/JS (ES-Module, kein Framework, kein Bundler). Repo-Sprache (Doku, Kommentare, UI) ist überwiegend Deutsch; neue Texte bitte zweisprachig (DE/EN) halten, wie die bestehenden Seiten. Architekturentscheidungen stehen in `docs/adr/` (z. B. 0001 Minify statt Bundler, 0003 CSP, 0004 Head-Konsistenz, 0006 Vanilla JS, 0008 Auslieferung von `dist/`, 0009 Icon-Subset, 0010 Cache-Name, 0011 Git-Engine).

## Befehle

```bash
npm run dev            # http-server auf :8080 (-c-1, kein Cache)
npm test               # Playwright E2E (Chromium, Firefox, WebKit, Pixel 5), startet Server selbst
npm run test:unit      # Vitest (nur assets/js/modules/**/*.test.js, Node-Umgebung)
npm run lint           # ESLint über assets/js, scripts und sw.js (Projekte/ ist ignoriert)
npm run format:check   # Prettier, gleiche Pfade (format:fix zum Beheben)
npm run typecheck      # tsc via jsconfig.json + jsconfig.sw.json (CI-Gate, 0 Fehler; Tests/Specs sind ausgenommen)
npm run build:dist     # Produktions-Build nach dist/ (esbuild-Minify, kein Bundling, Pfade bleiben identisch); bewusst kein `build`-Script (ADR 0005)
npm run regen          # subset-icons + generate-sw-assets, in dieser Reihenfolge (nach Änderungen an Seiten/Assets)
npm run check          # alle statischen CI-Gates am Stück (check-*, lint, format, typecheck, Unit-Tests)
npm run prepare        # aktiviert Git-Hooks (.githooks/) via git config core.hooksPath
```

Einzelne Tests:

```bash
npx playwright test assets/js/modules/git_simulator.spec.js --project=chromium
npx playwright test -g "Testname" --project=chromium
npx vitest run assets/js/modules/leitner-box.test.js
```

Playwright `testDir` ist `assets/js/modules` – Specs (`*.spec.js`) und Vitest-Tests (`*.test.js`) liegen **neben dem Modulcode**, nicht in einem `tests/`-Ordner. Mit `workers: 1` lokal läuft die volle Suite über alle 4 Browser-Projekte langsam; für Iteration `--project=chromium` nutzen. `E2E_ROOT=dist` lässt dieselbe Suite gegen den gebauten Stand laufen (eigener Port 8081, vorher `npm run build:dist`). Die Config pinnt `colorScheme: 'dark'`, weil ein erster Besuch dem System-Farbschema folgt; Specs, die das helle Theme meinen, emulieren es selbst.

Node ≥ 22.12 (`.nvmrc`/`engines`, CI nutzt 24; Vitest 5 läuft nicht auf Node 20).

## CI-Gates (müssen vor Push grün sein)

`.github/workflows/ci.yml` hat drei parallele Jobs: `quality` (`npm audit`, `check-sync`, `check-head`, `check-csp`, `check-icons`, `check-sitemap`, `check-sw-assets`, `lint`, `format:check`, `test:unit`, `build:dist`, `typecheck`), `e2e` (Matrix: ein Job je Playwright-Projekt chromium/firefox/webkit/mobile-chrome, plus ein Chromium-Lauf gegen `dist/`) und `lighthouse` (misst `dist/`; Performance ≥ 0,8, a11y/SEO/Best Practices ≥ 0,9 und CLS ≤ 0,1 sind harte Schwellen). Lokal deckt `npm run check` den `quality`-Job bis auf Audit und Build ab. Typische Auslöser:

- **Jede Änderung an HTML/CSS/JS/Fonts, auch ohne neue Datei** → `npm run generate-sw-assets`. Das Skript schreibt die Precache-Liste **und** `CACHE_NAME` in `sw.js`; der Name enthält einen Hash über den Inhalt aller Precache-Dateien (ADR 0010), wird also nie von Hand gepflegt. `check-sw-assets` schlägt fehl, sobald irgendeine Precache-Datei anders ist als beim letzten Lauf. Immer als **letzten** Schritt ausführen, nach allem, was Dateien verändert. Bilder sind bewusst eine kuratierte Konstante und werden nicht automatisch precached.
- **Neues Font-Awesome-Icon** → `npm run subset-icons` (oder `npm run regen`). Ausgeliefert wird ein generiertes Subset (ADR 0009); ein Icon, das dort fehlt, bleibt leer. Klassennamen müssen wörtlich im Quelltext stehen, zusammengesetzte Namen (`` `fa-${x}` ``) lässt das Skript nicht zu. Nur Font-Awesome-6-Namen verwenden (kein `fa-…-o`).
- **Inline-`<script>` geändert oder CSP geändert** → `npm run check-csp:fix`. Jede Seite hat einen eigenen CSP-`<meta>`-Tag mit `sha256`-Hashes für Inline-Scripts; zusätzlich liefert `vercel.json` eine permissivere Header-CSP als Sicherheitsnetz (ADR 0003). Beide Stellen bei neuen externen Ressourcen anfassen.
- **Neue Seite** → `<head>`-Boilerplate muss `check-head` bestehen (Seiten werden nicht aus Template generiert, sondern von Hand gepflegt und nur auf Vorhandensein geprüft), plus Eintrag in `sitemap.xml`/Navigation. `check-sitemap` verlangt jede indexierbare Seite in der Sitemap; Fehler-/Offline-Seiten tragen `noindex`. `npm run update-sitemap` setzt `<lastmod>` aus dem Git-Datum.
- **Projektdaten** → siehe unten, `generate-data` + `check-sync`.

## Architektur

**Seiten-Bootstrap.** Jede Seite in `pages/*.html` (plus `index.html`, `404.html`) lädt `assets/js/components.js` klassisch im `<head>` und `assets/js/main.js` als `type="module"`. `components.js` setzt vor dem ersten Paint Theme, Akzentfarbe, Sprache und A11y-Attribute auf `<html>` und fügt Header und Breadcrumbs ein, sobald der Parser den Platzhalter erzeugt hat (MutationObserver; nicht erst bei `DOMContentLoaded`, sonst verschiebt sich der Inhalt nach dem ersten Paint). Footer, Cookie-Banner und Event-Bindung folgen in `DOMContentLoaded`, danach feuert `fiae:layout-ready`; `main.js` wartet auf dieses Event (nicht auf DOMContentLoaded), sonst finden Module die Header-Elemente nicht. Drei Lade-Stufen in `main.js`: immer-nötige Module (theme, navigation, translation, accent-color, search-filter …) werden statisch importiert; seitenspezifische über die `LAZY_MODULES`-Tabelle als `[Pfad, Exportname, Selektor]` – das Modul wird nur dynamisch importiert, wenn der Selektor auf der Seite existiert; `IDLE_MODULES` (Copilot-Widget, Konfetti, Easter Egg) erst im Leerlauf. Neues Feature-Modul = Datei in `assets/js/modules/` + Eintrag in `LAZY_MODULES`, mit demselben Guard-Selektor wie im Modul selbst. Pfade immer über `resolveAssetPath` (`constants.js`) bzw. relativ auflösen (Seiten liegen in `pages/`, Root-Seiten nicht).

**CSS.** `style.css` importiert nichts mehr per `@import`. Modul-Stylesheets unter `assets/css/modules/` werden von den Seiten, die sie brauchen, per `<link>` **vor** `style.css` geladen (Reihenfolge der früheren Imports) oder vom Modul selbst über `window.loadStylesheet(pfad)` nachgeladen (Copilot, Command Palette). Auf `<body>` darf keine `transform`-Animation liegen: Sie macht `<body>` zum Bezugsrahmen aller `position: fixed`-Elemente und erzeugt massive Layout-Shifts.

**Klassische Scripts vs. ES-Module.** Nicht alles unter `assets/js/` ist ein Modul: `components.js` und mehrere Seiten-Scripts (`quiz.js`, `snake.js`, `interview.js`, `memory.js`, `portfolio.js`, `playground.js`) sind klassische `<script src>` ohne `import`/`export` und teilen sich den globalen Scope (daher die `score`-Kollision zwischen `quiz.js` und `snake.js`; `export {}` wäre dort ein Syntaxfehler). Modul-Code ist für sie nur sichtbar, wenn er explizit an `window` gehängt wird: `window.Confetti`, `window.Achievements` und `window.GameAudio` sind genau dafür gesetzt, die `typeof X !== 'undefined'`-Guards der klassischen Scripts greifen also. `Confetti` kommt erst im Leerlauf (`IDLE_MODULES`), die Guards sind dort weiterhin nötig. Sound ist standardmäßig aus und hat einen einzigen Schalter (Footer, Schlüssel `sound_enabled`). Ausnahme in `LAZY_MODULES`: `quick-sandbox.js` wird absichtlich nicht dort geladen, sondern per direktem `<script type="module">` auf `portfolio.html`, weil seine Trigger-Buttons erst nach dem einmaligen DOM-Check gerendert werden.

**Projekt-Daten-Pipeline.** `Projekte/` enthält die eigenständigen Einzelprojekte (eigene Repos, eigene `dist`/`index.html`, **nicht** von ESLint/Vitest erfasst) als Teil dieses Monorepos. `scripts/sync_projects.js` zieht sie aus den GitHub-Repos (`REPO_MAPPING` mit `preserve`-Listen; wöchentlich per `.github/workflows/sync.yml`). `scripts/generate_projects_data.js` scannt `Projekte/` plus eine statische Liste (`staticProjects`: externe/Root-Projekte) und erzeugt **zwei** Artefakte: `assets/js/projects_data.js` (generiert, ESLint-ignoriert) und `assets/data/projects.json`. Diese nie von Hand editieren; `check-sync` verifiziert die Konsistenz. Projektzahlen in Doku/Texten driften leicht – nicht hartkodieren, wenn vermeidbar.

**Offline/PWA.** `sw.js` (Precache-`ASSETS` und `CACHE_NAME` generiert, s. o.) arbeitet Network-First für HTML und Stale-While-Revalidate für Assets; `pages/offline.html` ist der Fallback. Übernimmt ein neuer Worker eine offene Seite, bietet `components.js` per Toast ein Neuladen an. `manifest.json` beschreibt die Installierbarkeit.

**Build/Deploy.** Hosting auf Vercel (`vercel.json` mit Security-Headern und Cache-Regeln). Vercel führt `npm run build:dist` aus und liefert **nur `dist/`** aus (ADR 0008). `build:dist` minifiziert `assets/js`/`assets/css` per esbuild und kopiert `pages/`, `assets/`, `Projekte/` und die in `COPY_ENTRIES` genannten Root-Dateien unverändert – es darf keine HTML-/Script-Referenzen umschreiben, sonst werden CSP-Hashes ungültig (ADR 0001/0003). Eine neue Root-Datei, die öffentlich sein soll, gehört in `COPY_ENTRIES`; `.vercelignore` darf `scripts/` nicht ausschließen. Verzeichnisse namens `dist` unter `Projekte/` sind committete Demo-Builds und müssen im Build bleiben.

**Zustand & Daten.** Kein Backend: Persistenz über `localStorage` (Highscores, Lernfortschritt, Leitner-Box mit Fälligkeitsterminen, Prüfungsergebnisse, Achievements), Modul-Kommunikation z. T. über `modules/event-bus.js`. `modules/progress-backup.js` exportiert/importiert diese Daten über eine Schlüssel-Allowlist – ein neuer persistenter Schlüssel muss dort eingetragen werden, sonst fehlt er im Backup (die Demos unter `Projekte/` teilen sich denselben Origin, deshalb keine „alle Schlüssel"-Lösung). Der Git-Simulator hält seinen Zustand rein im Speicher (ADR 0007); seine Logik liegt DOM-frei in `modules/git-engine.js`, `git-simulator.js` rendert nur (ADR 0011). Dasselbe Muster – reine Logik mit Vitest, Seiten-Code dünn – gilt für `leitner-box.js`, `ihk-exam-simulator.js` (+ Fragenpool `exam-questions.js`) und `progress-backup.js`.

## Konventionen

- Keine externen CDNs/Fonts/Skripte (Datenschutz + Offline); Drittbibliotheken lokal unter `assets/vendor/`. Fonts sind lokales WOFF2. `assets/vendor/fontawesome/` ist generiert (`npm run subset-icons`), nicht von Hand ändern.
- Zweisprachigkeit: sichtbarer Text als `<span lang="de">`/`<span lang="en">`-Paar; Attribute (`aria-label`, `title`, `placeholder`) tragen den deutschen Wert plus `data-en-<attribut>`, `modules/translation.js` schaltet sie um (auch für später eingefügtes Markup). Toasts: `showToast({ de, en }, typ)`.
- A11y (WCAG 2.1 AA): Tastaturbedienung, `focus-visible`, ARIA-Attribute/Live-Regions für interaktive Komponenten; Lighthouse/axe prüfen das in CI.
- Prettier-Formatierung gilt für `assets/js/**` und `scripts/**`; `Projekte/**` nicht anfassen, außer die Änderung gehört wirklich in das jeweilige Unterprojekt (wird sonst vom Sync überschrieben).
- Nutzerkontrollierte oder in `localStorage` persistierte Texte nie roh in `innerHTML`/`insertAdjacentHTML` interpolieren: `escapeHtml` aus `assets/js/modules/html-utils.js` verwenden (klassische Scripts ohne `import`, z. B. `interview.js`, haben eine lokale Kopie).
- Der globale Storage-Wrapper aus `components.js` heißt `AppStorage` (nicht `StorageManager`, das kollidiert mit dem DOM-Typ); kein direkter `localStorage`-Zugriff außerhalb von `components.js` und `progress-backup.js`. Gespeichertes JSON immer mit `try/catch` lesen. Von klassischen Scripts geteilte Globals für den Typecheck stehen in `assets/js/globals.d.ts`.
- Überschriften-Ebenen nicht überspringen; Quellen-/Datumszeilen sind `<p class="card-source">`, keine `<h5>`. Statische `<img>` tragen `width`/`height`.
- **Git Hooks & Secrets (`.githooks/`):** Git-Hooks sind über `git config core.hooksPath .githooks` aktiviert (`npm run prepare`). Der Pre-Commit Hook blockiert `.env`-Dateien (außer `.env.example`), private Keys (`*.pem`, `*.key`) sowie echte API-Keys/Tokens (GitHub `ghp_`, OpenAI/Claude `sk-`, AWS, private Keys) vor jedem Commit.
- Relevante Features/Fixes in `CHANGELOG.md` eintragen.
