# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portfolio- und IHK-Prüfungsvorbereitungs-Site (PWA) für die Umschulung zum FIAE. Reines statisches Vanilla HTML/CSS/JS (ES-Module, kein Framework, kein Bundler). Repo-Sprache (Doku, Kommentare, UI) ist überwiegend Deutsch; neue Texte bitte zweisprachig (DE/EN) halten, wie die bestehenden Seiten. Architekturentscheidungen stehen in `docs/adr/` (z. B. 0001 Minify statt Bundler, 0003 CSP, 0004 Head-Konsistenz, 0006 Vanilla JS).

## Befehle

```bash
npm run dev            # http-server auf :8080 (-c-1, kein Cache)
npm test               # Playwright E2E (Chromium, Firefox, WebKit, Pixel 5), startet Server selbst
npm run test:unit      # Vitest (nur assets/js/modules/**/*.test.js, Node-Umgebung)
npm run lint           # ESLint nur über assets/js und scripts (Projekte/ ist ignoriert)
npm run format:check   # Prettier, gleiche Pfade (format:fix zum Beheben)
npm run typecheck      # tsc via jsconfig.json (CI-Gate, 0 Fehler; Tests/Specs sind ausgenommen)
npm run build:dist     # esbuild-Minify nach dist/ (kein Bundling, Pfade bleiben identisch)
```

Einzelne Tests:

```bash
npx playwright test assets/js/modules/git_simulator.spec.js --project=chromium
npx playwright test -g "Testname" --project=chromium
npx vitest run assets/js/modules/leitner-box.test.js
```

Playwright `testDir` ist `assets/js/modules` – Specs (`*.spec.js`) und Vitest-Tests (`*.test.js`) liegen **neben dem Modulcode**, nicht in einem `tests/`-Ordner. Mit `workers: 1` lokal läuft die volle Suite über alle 4 Browser-Projekte langsam; für Iteration `--project=chromium` nutzen.

Node ≥ 22.12 (`.nvmrc`/`engines`, CI nutzt 24; Vitest 5 läuft nicht auf Node 20).

## CI-Gates (müssen vor Push grün sein)

`.github/workflows/ci.yml` hat drei parallele Jobs: `quality` (`check-sync`, `check-head`, `check-csp`, `check-sw-assets`, `lint`, `format:check`, `test:unit`, `build:dist`, `typecheck`), `e2e` (Matrix: ein Job je Playwright-Projekt chromium/firefox/webkit/mobile-chrome) und `lighthouse`. Typische Auslöser:

- **Neue/geänderte Datei in HTML/CSS/JS/Fonts** → `npm run generate-sw-assets` (schreibt die Precache-Liste in `sw.js`; `check-sw-assets` schlägt sonst fehl). Bilder sind bewusst eine kuratierte Konstante und werden nicht automatisch precached. `CACHE_NAME` in `sw.js` bei relevanten Änderungen hochzählen.
- **Inline-`<script>` geändert oder CSP geändert** → `npm run check-csp:fix`. Jede Seite hat einen eigenen CSP-`<meta>`-Tag mit `sha256`-Hashes für Inline-Scripts; zusätzlich liefert `vercel.json` eine permissivere Header-CSP als Sicherheitsnetz (ADR 0003). Beide Stellen bei neuen externen Ressourcen anfassen.
- **Neue Seite** → `<head>`-Boilerplate muss `check-head` bestehen (Seiten werden nicht aus Template generiert, sondern von Hand gepflegt und nur auf Vorhandensein geprüft), plus Eintrag in `sitemap.xml`/Navigation.
- **Projektdaten** → siehe unten, `generate-data` + `check-sync`.

## Architektur

**Seiten-Bootstrap.** Jede Seite in `pages/*.html` (plus `index.html`, `404.html`) lädt `assets/js/main.js` als `type="module"`. `components.js` injiziert Header/Nav/Footer in seinem eigenen `DOMContentLoaded` und feuert danach `fiae:layout-ready`; `main.js` wartet auf dieses Event (nicht auf DOMContentLoaded), sonst finden Module die Header-Elemente nicht. Immer-nötige Module (theme, navigation, translation, accent-color, search-filter …) werden statisch importiert, seitenspezifische über die `LAZY_MODULES`-Tabelle in `main.js` als `[Pfad, Exportname, Selektor]` – das Modul wird nur dynamisch importiert, wenn der Selektor auf der Seite existiert. Neues Feature-Modul = Datei in `assets/js/modules/` + Eintrag dort, mit demselben Guard-Selektor wie im Modul selbst. Pfade immer über `resolveAssetPath` (`constants.js`) bzw. relativ auflösen (Seiten liegen in `pages/`, Root-Seiten nicht).

**Projekt-Daten-Pipeline.** `Projekte/` enthält die eigenständigen Einzelprojekte (eigene Repos, eigene `dist`/`index.html`, **nicht** von ESLint/Vitest erfasst) als Teil dieses Monorepos. `scripts/sync_projects.js` zieht sie aus den GitHub-Repos (`REPO_MAPPING` mit `preserve`-Listen; wöchentlich per `.github/workflows/sync.yml`). `scripts/generate_projects_data.js` scannt `Projekte/` plus eine statische Liste (`staticProjects`: externe/Root-Projekte) und erzeugt **zwei** Artefakte: `assets/js/projects_data.js` (generiert, ESLint-ignoriert) und `assets/data/projects.json`. Diese nie von Hand editieren; `check-sync` verifiziert die Konsistenz. Projektzahlen in Doku/Texten driften leicht – nicht hartkodieren, wenn vermeidbar.

**Offline/PWA.** `sw.js` hat Cache-First für Precache-`ASSETS` (generiert, s. o.) und Network-First-Strategien; `pages/offline.html` ist der Fallback. `manifest.json` beschreibt die Installierbarkeit.

**Build/Deploy.** Hosting auf Vercel (`vercel.json` mit Security-Headern). `build:dist` minifiziert nur `assets/js`/`assets/css` per esbuild und kopiert den Rest unverändert – es darf keine HTML-/Script-Referenzen umschreiben, sonst werden CSP-Hashes ungültig (ADR 0001/0005). Lighthouse-CI (`lighthouserc.json`) erzwingt a11y/SEO/best-practices.

**Zustand & Daten.** Kein Backend: Persistenz über `localStorage` (Highscores, Lernfortschritt, Leitner-Box, Achievements), Modul-Kommunikation z. T. über `modules/event-bus.js`. Der Git-Simulator hält seinen Zustand rein im Speicher (ADR 0007).

## Konventionen

- Keine externen CDNs/Fonts/Skripte (Datenschutz + Offline); Drittbibliotheken lokal unter `assets/vendor/` (`npm run localize-vendor-assets`). Fonts sind lokales WOFF2.
- A11y (WCAG 2.1 AA): Tastaturbedienung, `focus-visible`, ARIA-Attribute/Live-Regions für interaktive Komponenten; Lighthouse/axe prüfen das in CI.
- Prettier-Formatierung gilt für `assets/js/**` und `scripts/**`; `Projekte/**` nicht anfassen, außer die Änderung gehört wirklich in das jeweilige Unterprojekt (wird sonst vom Sync überschrieben).
- Nutzerkontrollierte oder in `localStorage` persistierte Texte nie roh in `innerHTML`/`insertAdjacentHTML` interpolieren: `escapeHtml` aus `assets/js/modules/html-utils.js` verwenden (klassische Scripts ohne `import`, z. B. `interview.js`, haben eine lokale Kopie).
- Der globale Storage-Wrapper aus `components.js` heißt `AppStorage` (nicht `StorageManager`, das kollidiert mit dem DOM-Typ). Von klassischen Scripts geteilte Globals für den Typecheck stehen in `assets/js/globals.d.ts`.
- Relevante Features/Fixes in `CHANGELOG.md` eintragen.
