# GEMINI.md

This file provides guidance to Gemini / Antigravity when working with code in this repository.

Portfolio- und IHK-Prüfungsvorbereitungs-Site (PWA) für die Umschulung zum FIAE. Reines statisches Vanilla HTML/CSS/JS (ES-Module, kein Framework, kein Bundler). Repo-Sprache (Doku, Kommentare, UI) ist überwiegend Deutsch; neue Texte bitte zweisprachig (DE/EN) halten, wie die bestehenden Seiten. Architekturentscheidungen stehen in `docs/adr/` (z. B. 0001 Minify statt Bundler, 0003 CSP, 0004 Head-Konsistenz, 0006 Vanilla JS, 0008 Auslieferung von `dist/`, 0009 Icon-Subset, 0010 Cache-Name, 0011 Git-Engine, 0012 Sub-Projekt-Sync).

## Befehle

```bash
npm run dev            # http-server auf :8080 (-c-1, kein Cache)
npm test               # Playwright E2E (Chromium, Firefox, WebKit, Pixel 5), startet Server selbst
npm run test:unit      # Vitest (assets/js/modules/**/*.test.js und scripts/**/*.test.js, Node-Umgebung)
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

`.github/workflows/ci.yml` hat drei parallele Jobs: `quality` (`npm audit`, `check-sync`, `check-head`, `check-csp`, `check-icons`, `check-sitemap`, `check-sw-assets`, `check-project-links`, `lint`, `format:check`, `typecheck`, `test:unit`, `build:dist`), `e2e` (Matrix: ein Job je Playwright-Projekt chromium/firefox/webkit/mobile-chrome, plus ein Chromium-Lauf gegen `dist/`) und `lighthouse` (misst `dist/`; Performance ≥ 0,8, a11y/SEO/Best Practices ≥ 0,9 und CLS ≤ 0,1 sind harte Schwellen). Lokal deckt `npm run check` den `quality`-Job bis auf Audit und Build ab. Typische Auslöser:

- **Jede Änderung an HTML/CSS/JS/Fonts, auch ohne neue Datei** → `npm run generate-sw-assets`. Das Skript schreibt die Precache-Liste **und** `CACHE_NAME` in `sw.js`; der Name enthält einen Hash über den Inhalt aller Precache-Dateien (ADR 0010), wird also nie von Hand gepflegt. `check-sw-assets` schlägt fehl, sobald irgendeine Precache-Datei anders ist als beim letzten Lauf. Immer als **letzten** Schritt ausführen, nach allem, was Dateien verändert. Bilder sind bewusst eine kuratierte Konstante und werden nicht automatisch precached.
- **Neues Font-Awesome-Icon** → `npm run subset-icons` (oder `npm run regen`). Ausgeliefert wird ein generiertes Subset (ADR 0009); ein Icon, das dort fehlt, bleibt leer. Klassennamen müssen wörtlich im Quelltext stehen, zusammengesetzte Namen (`` `fa-${x}` ``) lässt das Skript nicht zu. Nur Font-Awesome-6-Namen verwenden (kein `fa-…-o`).
- **Inline-`<script>` geändert oder CSP geändert** → `npm run check-csp:fix`. Jede Seite hat einen eigenen CSP-`<meta>`-Tag mit `sha256`-Hashes für Inline-Scripts; zusätzlich liefert `vercel.json` eine permissivere Header-CSP als Sicherheitsnetz (ADR 0003). Beide Stellen bei neuen externen Ressourcen anfassen.
- **Neue Seite** → `<head>`-Boilerplate muss `check-head` bestehen (Seiten werden nicht aus Template generiert, sondern von Hand gepflegt und nur auf Vorhandensein geprüft), plus Eintrag in `sitemap.xml`/Navigation. `check-sitemap` verlangt jede indexierbare Seite in der Sitemap; Fehler-/Offline-Seiten tragen `noindex`. `npm run update-sitemap` setzt `<lastmod>` aus dem Git-Datum.
- **Projektdaten & Links** → `generate-data` + `check-sync` + `check-project-links`.

## Architektur & Richtlinien

- Reines statisches Vanilla HTML5, CSS3 und modularisiertes JavaScript (ES-Module für Komponenten und Features, klassische Skripte nur für Bootstrap in `components.js` und Seiten-Tools).
- Hohe Barrierefreiheit (WCAG 2.1 AA/AAA) standardmäßig verankert.
- Keine externen CDNs zur Laufzeit; alle Fonts, Icons und Vendor-Bibliotheken werden aus `assets/vendor/` bezogen.
