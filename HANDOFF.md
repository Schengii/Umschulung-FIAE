# Handoff

Stand: 2026-11-23 · `main` auf `4f7a302` (PR #92, #93, #94 gemergt, CI grün)

## Ziel
Portfolio-Site als Bewerbungsvorzeigestück straffen und professionell machen: Aufräumen, Inhalte belegen, Styling, Datenschutz, Barrierefreiheit.

## Erledigt
- Bis #91: tote CSS-Regeln, Skill-Stufen mit Projektbelegen, komprimierte Medien (ADR 0019), ruhiger erster Besuch auf dem Handy, GitHub-Daten lokal (ADR 0020), Hamburger-Menü ab 1100 px, Hover nur bei Hover-Geräten, `prefers-contrast`/`forced-colors`, axe über alle Seiten ohne Verstöße.
- #92: Buttonsystem (Outline in `btn-secondary` vereint), `--transition` und alle `transition: all` mit Eigenschaftslisten, `generate-data` bricht bei GitHub-Rate-Limit ab und nutzt `GITHUB_TOKEN`.
- #93: News-Eintrag „Update November 2026“; je Projektseite ein eigenes 1200×630-JPEG (`assets/images/og/projekt-<slug>.jpg`) als `og:image`, erzeugt von `generate_project_pages.js` (`check-head` verlangt PNG/JPEG).
- #94: 16 `!important` am Profilbild in `lebenslauf.css` entfernt.
- Aufgeräumt: alle alten Branches gelöscht, nur `main` bleibt.

## Entscheidungen
- Medien bleiben selbst gehostet und komprimiert.
- Hamburger-Schwelle 1100 px, `safe-area-inset` entfällt.
- Die übrigen `!important` bleiben bewusst: Nutzer-Overrides in `style.css` (Legasthenie-Schrift, Schriftgröße, Kontrast, Farbenblind-Themes), Reduced-Motion-Reset, Fokusring, Druckregeln.
- CSS/JS-Cache (`max-age=0, must-revalidate`) ist ausreichend, nichts zu tun.

## Offene Punkte (brauchen Max)
- `Max PPT Version3.pptx` in PowerPoint prüfen (eingebettete Videos neu kodiert).
- Fallstudien (1.3), Lebenslauf-PDF (1.5), Java/Spring-Aussage (1.6) liefern.
- Skill-Stufen in `assets/js/skills_matrix.js` und `assets/js/modules/skill-radar.js` bestätigen.

## Optional
- Styling Schritt 3 Rest: Tokens und Breakpoints vereinheitlichen (kein Muss).
- `generate-data` nur mit `GITHUB_TOKEN` ausführen, sonst bricht es bei Rate-Limit ab.

## Nächster Schritt
Auf Inhalte von Max warten; danach Fallstudien/Skill-Stufen einarbeiten, `npm run regen` und `npm run check`.
