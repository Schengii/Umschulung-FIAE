# Handoff

Stand: 2026-11-23 · `main` auf `8c236d6` (PR #92–#97 gemergt, CI grün, keine offenen PRs, nur Branch `main`)

## Ziel
Portfolio-Site als Bewerbungsvorzeigestück straffen und professionell machen: Aufräumen, Inhalte belegen, Styling, Datenschutz, Barrierefreiheit.

## Erledigt
- Bis #91: tote CSS entfernt, Skill-Stufen mit Belegen, Medien komprimiert (ADR 0019), Handy-Erstbesuch ruhiger, GitHub-Daten lokal (ADR 0020), Hamburger ab 1100 px, Hover nur bei Hover-Geräten, Kontrast-Modi.
- #92: Buttonsystem, kein `transition: all`, `generate-data` bricht bei Rate-Limit ab (nutzt `GITHUB_TOKEN`).
- #93: News-Eintrag Nov 2026; je Projektseite eigenes `og:image` (`assets/images/og/`, erzeugt von `scripts/generate_project_pages.js`).
- #94: `!important` am Profilbild (`lebenslauf.css`) entfernt.
- #96: `strictNullChecks` 89 → 0 (Baseline `scripts/strict-null-baseline.json` = 0); Breadcrumbs in `components.js` escapen Labels und `href` (CodeQL-Fund).
- #97: Sitemap-`lastmod` aktualisiert.

## Entscheidungen
- Übrige `!important` bleiben: Nutzer-Overrides, Reduced-Motion-Reset, Fokusring, Druckregeln.
- Breakpoints (ca. 18 Werte) nicht angefasst: Layout-Risiko, visuelle Tests laufen nur unter Linux (`visual.yml`).
- CSS/JS-Cache (`must-revalidate`) reicht; Branch-Löschen nach Merge ist auf GitHub aktiv.

## Offene Punkte
- Brauchen Max: Fallstudien (`assets/data/case-studies.json`), Lebenslauf-PDF, Java/Spring-Aussage, Skill-Stufen in `assets/js/skills_matrix.js` und `assets/js/modules/skill-radar.js`, `Max PPT Version3.pptx` in PowerPoint prüfen.
- Coverage-Schwellen in `vitest.config.js` auf Ist-Werte anheben (Auslesen der Gruppenwerte wurde abgelehnt, Freigabe nötig).
- Lighthouse-Reserve aus CI-Lauf prüfen (`lighthouserc.json`); Breakpoints optional in eigenem Branch.

## Nächster Schritt
Inhalte von Max einarbeiten (`assets/data/case-studies.json`, Skill-Dateien), dann `npm run regen` und `npm run check`; `generate-data` nur mit `GITHUB_TOKEN`.
