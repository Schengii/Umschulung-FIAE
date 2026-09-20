# 0001 — Kein Bundler, stattdessen Minify-Build

**Status:** Akzeptiert
**Datum:** 2026-09-19

## Kontext

Das Portfolio besteht aus 27+ statischen HTML-Seiten, die ihre JavaScript-Logik überwiegend über klassische `<script src="...">`-Tags laden (nicht `type="module"`). `package.json` enthielt keinen Bundler (kein Vite/Webpack/esbuild), wodurch z. B. `pages/portfolio.html` allein 13 einzelne Script-Tags lädt — ohne Minifizierung, Tree-Shaking oder Code-Splitting.

Ein Testlauf mit Vite zeigte: Vite bündelt standardmäßig nur `type="module"`-Scripts. Da die meisten Seiten ihre Hauptlogik (Header, Navigation, Interaktivität) noch klassisch laden, hätte ein echter Bundler-Einsatz eine seitenweite Umstellung auf ES-Module samt Vollverifikation aller Seiten erfordert — mit dem Risiko, die produktive Seite (Header/Nav/Interaktivität) beim Deploy zu brechen.

## Entscheidung

Statt eines vollen Bundlers wurde `scripts/build_minified.js` (esbuild) eingeführt, das `npm run build` bereitstellt:

- Minifiziert alle Dateien unter `assets/js/` (−28 %) und `assets/css/` (−27 %) nach `dist/`.
- Kopiert alles Weitere (HTML, Bilder, Vendor, Fonts, `Projekte/`, `manifest.json`, `sw.js`, …) unverändert.
- Kein Bundling, keine Pfad-Umschreibung, keine HTML-Änderung — dadurch bleiben bestehende CSP-Hashes und `<script src>`-Verweise exakt gültig.

`dist/` ist lokal mit der vollen Playwright-Suite (54/54 grün) gegen einen separaten Port verifiziert, wird aber **nicht** automatisch deployed. Die Produktion (Vercel) liefert weiterhin unbundled direkt aus dem Repo-Root aus.

## Konsequenzen

- Requests pro Seite bleiben zahlreich (kein Code-Splitting) — das eigentliche Payload-Problem ist nur teilweise gelöst.
- Kein Risiko einer seitenweiten Modul-Migration; bestehende CSP-Strategie (siehe ADR 0003) bleibt unangetastet.
- Das Umschalten der Produktions-Auslieferung auf `dist/` ist eine separate, noch offene Entscheidung — sie würde eine eigene Vercel-Build-Konfiguration und erneute CSP-Verifikation erfordern.
- Ein echter Bundler-Umbau (inkl. Umstellung auf ES-Module projektweit) bleibt eine mögliche Folge-Entscheidung, falls Performance-Messungen (Lighthouse, siehe `lighthouserc.json`) das erzwingen.
