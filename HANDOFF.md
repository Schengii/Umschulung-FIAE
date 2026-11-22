# Handoff

Stand: 2026-11-22 · `main` auf `868921e` (PR #83 und #84 gemergt)

## Ziel
Portfolio-Site als Bewerbungsvorzeigestück straffen: Navigation neu ordnen, Lern- und Spielbereich entfernen, Verbesserungsplan abarbeiten.

## Erledigt
- PR #83 gemergt: Header neu (Projekte eigener Punkt), Plan 1.1 (statische Projektlinks), Plan 1.2 (`home.html` = „Werdegang & Kontakt“, Home = `index.html`), Lernbereich komplett entfernt.
- PR #84 gemergt (CI grün): Spielwiese entfernt (Games-Hub, Snake, Memory, Code Playground, Challenge Lab), dazu Game-Modal im Portfolio, Ton-System samt Audio-Schalter, Spiel-Achievements, Datenschutz-Einträge, `modal.css`, Playground-Sonderregel in `vercel.json`.
- Navigation hat jetzt sechs Punkte: Home, Profil, Projekte, Umschulung, News, Kontakt.
- Verbesserungsplan im Vault: `01 Projects/Umschulung-FIAE Portfolio/Verbesserungsplan 2026-11-22.md`.

## Entscheidungen
- „Alles Bereichsbezogene löschen“, inkl. Backup, Tagesfrage, Ton, Quiz im Hub.
- Behalten: Achievement-System (Rest-Erfolge), `confetti.js`, Prism (`projekt-detail.html`), `ical-generator.js`, Projektkategorie „Spiele“ (Minecraft).
- Merge nur nach grüner CI, mit Merge-Commit.
- Historie bleibt: `plan.md`, `docs/handoff-2026-11-19.md`, `docs/changelog-archiv.md`, ältere ADRs.

## Offene Punkte
- CI auf `main` nach dem Merge von #84 nicht abgewartet.
- Vault-Plan: Phase 2 (Lernbereich) hinfällig, noch nicht angepasst; `plan.md` führt Lern- und Spielpunkte weiter.
- `assets/css/modules/ihk_cockpit.css` ist gelöscht; auf tote Regeln in `style.css` und CSS-Rest prüfen.
- Plan 1.3 bis 1.6 (Fallstudien, Skill-Matrix ohne Prozente, Belege/PDF, Java/Spring-Aussage) brauchen Inhalte von Max.
- Hero-Texte von `index.html` und `pages/home.html` überschneiden sich weiter.

## Nächster Schritt
CI auf `main` prüfen (`gh run list --branch main`). Danach `Verbesserungsplan 2026-11-22.md` anpassen und Plan 1.4 angehen (`assets/js/skills_matrix.js`).
