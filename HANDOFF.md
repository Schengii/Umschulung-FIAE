# Handoff

Stand: 2026-11-22 · `main` auf `a98837c` (PR #91 gemergt, CI grün)

## Ziel
Portfolio-Site als Bewerbungsvorzeigestück straffen und professionell machen: Aufräumen, Inhalte belegen, Styling, Datenschutz, Barrierefreiheit.

## Erledigt
- Gemergt: #86 (tote CSS-Regeln, README), #87 (Skill-Stufen mit Projektbelegen statt Prozenten), #88 (Videos 16,3 auf 3,4 MB, PPTX 7,79 auf 3,68 MB, ADR 0019), #90 (ruhiger erster Besuch auf dem Handy, GitHub-Daten lokal, ADR 0020).
- Gemergt #91: Hamburger-Menü ab 1100 px (Schalter waren zwischen 769 und 1250 px abgeschnitten), 96 Hover-Regeln in `@media (hover: hover)`, `prefers-contrast` und `forced-colors`, `--field-border` (3:1), lesbare Nav-Suche.
- axe über alle 23 Seiten, 2 Themes, 5 Akzente: keine Verstöße. Chromium und Mobile-E2E lokal grün.

## Entscheidungen
- Medien bleiben selbst gehostet und werden komprimiert (kein externes Hosting).
- GitHub-Repos kommen aus `assets/data/github-repos.json` (täglicher Sync), `api.github.com` ist aus der CSP entfernt.
- Hamburger-Schwelle 1100 px, auch für iPad quer.
- `safe-area-inset` entfällt (Viewport ohne `viewport-fit=cover`).

## Offene Punkte
- `Max PPT Version3.pptx` noch nicht in PowerPoint geprüft (eingebettete Videos neu kodiert).
- `generate-data` erzeugt ohne `GITHUB_TOKEN` bei Rate-Limit veraltete Projektdaten (nur mit Token ausführen oder Skript absichern).
- Styling Schritt 3: Buttonsystem (17 Varianten), Tokens und Breakpoints vereinheitlichen, `!important` (207 in `style.css`), `transition: all`, CSS/JS-Cache (`vercel.json`).
- Brauchen Inhalte von Max: Fallstudien (1.3), Lebenslauf-PDF (1.5), Java/Spring-Aussage (1.6); Stufen in `assets/js/skills_matrix.js` und `assets/js/modules/skill-radar.js` prüfen.
- Plan 3.1 (og:image je Projektseite), 3.2 (`assets/js/news_data.js` aktualisieren).

## Nächster Schritt
Styling Schritt 3 in `assets/css/style.css` beginnen (Buttons zuerst), danach `npm run regen` und `npm run check`.
