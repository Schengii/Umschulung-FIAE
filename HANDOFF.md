# Handoff

Stand: 2026-11-23 · `main` auf `a3897be` (PR #92–#100 gemergt, CI grün). Offen: PR `feat/plan-umsetzung` (Plan-Umsetzung, Version 1.7.0), PR #102 (LinkedIn-Link), PR #101 (automatischer Projekt-Sync). Arbeitsgrundlage ist [`PLAN.md`](PLAN.md).

## Ziel
Portfolio-Site als Bewerbungsvorzeigestück straffen und professionell machen: Aufräumen, Inhalte belegen, Styling, Datenschutz, Barrierefreiheit.

## Erledigt
- Bis #97: tote CSS entfernt, Skill-Stufen mit Belegen, Medien komprimiert (ADR 0019), GitHub-Daten lokal (ADR 0020), Buttonsystem, `strictNullChecks` 0, Breadcrumb-Escaping, Projekt-`og:image`.
- #98–#100: Minecraft und Spielwiese entfernt, Doku-Struktur (`docs/archiv/`, Community-Dateien in `.github/`), ungenutzte CSS-Klassen entfernt.
- `feat/plan-umsetzung` (PLAN.md, Phasen 1 bis 4): `modal.js` escaped Projektdaten, Audit `docs/innerhtml-audit.md` plus Ratsche `npm run check-innerhtml`, Unit-Tests für alle Seiten-Scripts (Seiten-Coverage 1 → 90 %), Coverage- und Lighthouse-Schwellen angehoben, ADR 0021.

## Entscheidungen
- Übrige `!important` bleiben: Nutzer-Overrides, Reduced-Motion-Reset, Fokusring, Druckregeln.
- Klassische Scripts werden nicht in Module ausgelagert (`components.js` muss vor dem ersten Paint ohne `import` laufen); Tests laden sie per `scripts/test-support/classic-script.js`.
- Breakpoints (14 Werte nach Paarung) bleiben vorerst: Umbau nur in eigenem Branch mit Sichtprüfung (PLAN 4.3).

## Offene Punkte
- Brauchen Max: Fallstudien (`assets/data/case-studies.json`, nur EcoChef vorhanden), Skill-Stufen und Java/Spring-Aussage (`assets/js/skills_matrix.js`, `assets/js/modules/skill-radar.js`), Lebenslauf-PDF und `Max PPT Version3.pptx` prüfen (PLAN 5.1–5.3).
- Freigabe zum Mergen: PR #102 (Konflikte in `sw.js`/`vercel.json` erwartet, danach `npm run regen` und `npm run check-csp:fix`) und `feat/plan-umsetzung` (PLAN 1.1).
- Neu gefunden (PLAN N.1–N.3): Endlosschleife bei Sprachwechsel im API-Tab von `architecture.js`, toter `isGame`-Zweig in `portfolio.js`, `dialog.js`/`main.js` ohne Tests.
- Playwright 1.65.1: Test-Branch `test/playwright-1-65` lief in der CI (Ergebnis in PLAN 4.4); danach Branch löschen und `dependabot.yml`-Ignore anpassen.

## Nächster Schritt
Freigabe zum Mergen klären, dann N.1 (Schleife im API-Tab) beheben, danach Inhalte von Max einarbeiten; nach jeder Änderung `npm run regen` und `npm run check`; `generate-data` nur mit `GITHUB_TOKEN`.
