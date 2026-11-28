# Handoff (Stand 2026-11-26, Basis: Commit 9f918ab + Dropdown-Commit auf main)

## Ziel
IT-DevGame testen und verbessern. UI-Review-Punkte abarbeiten.

## Erledigt
- Commits 92a298e (Labs-Dashboard, einklappbare Dashboard-Bereiche, Resume-Button, Neu-Badge-Grenze, Hub-Filter, Scroll/Fokus bei Routenwechsel), 9f918ab und c7240ee liegen auf main, ungepusht.
- `npm run audit:ui` für Dashboard (`''`), `labs`, `dashboard`: hell und dunkel bei 375 px, 0 Kontrast- und 0 Überlauf-Funde.
- Countdown-Widget: unter 5 bearbeiteten Aufgaben „noch zu wenig Daten“ statt Score/Note (`ExamCountdownWidget.jsx`, `MIN_TASKS_FOR_READINESS`), neuer Test, CHANGELOG ergänzt (Commit 9f918ab).
- Labs-&-Tools-Dropdown: Suchfeld und Gruppen nach Themengebiet (`NavDropdownMenu.jsx`, `navbarMenuItems.js`), Tests in `NavDropdownMenu.test.jsx`. Vollständig geprüft: lint:ci, typecheck, 2592 Tests, build, size, e2e 63/63.
- Geprüft (Countdown): lint:ci, typecheck, 2586 Tests, build grün. e2e und size diesmal nicht gelaufen.

- PWA-Update repariert (6d8600e): Toast schickt `SKIP_WAITING` (`src/utils/pwaUpdate.js`), `ErrorBoundary` heilt veraltete Chunks einmalig per Cache-Leeren + Reload (`src/utils/chunkErrorRecovery.js`). Im echten Browser geprüft (Seite A → Deploy B → Klick → B). Flaky Lernmix-Test repariert (12db65c). Vollständig grün: lint, typecheck, 2605 Tests, build, size, e2e 63/63.

## Entscheidungen
- Badge-Begrenzung zentral in `labModulesData.js`; das Tools-Dropdown (`navbarMenuItems.js`) trägt weiter viele „Neu“-Badges.
- Filter-Chips heißen „Offen/Erledigt“ (ein Test erwartet genau ein „Abgeschlossen“).
- Alias-Bereinigung der Lab-IDs bleibt offen (gefährdet alte Spielstände).
- Export/Import des Spielstands existiert bereits (`BackupModal`, `sanitizeImportedState`) – kein Handlungsbedarf.

## Zuletzt (2026-11-27)
- Dashboard-Kacheln: Themen-Badges, Versionshinweis entfernt (937ffa3).
- WiSo-Stichprobe: Lohn-Engine auf Werte 2026 (BBG, Pflege 3,6 %, Zusatzbeitrag 2,9 %); Hinweise zu Basiszins und Lohnsteuer-Näherung. Kündigungsfristen, Verzug (§ 288), Sachmängel geprüft und korrekt.
- Offen: Basiszins 3,62 % ist fester Beispielwert; weitere Rechtsthemen (DSGVO, Urheberrecht, HGB) nicht geprüft.

## Offene Punkte
- UI-Audit über alle 230 Routen: hell und dunkel bei 375 px, 0 Kontrast- und 0 Überlauf-Funde (erledigt).
- Visuelle Sichtprüfung im Browser steht aus (Filter-Chips, einklappbare Bereiche, Countdown-Text).
- jsdom-Meldung „Not implemented: scrollTo()“ im Testlauf (harmlos, Stub im Test-Setup möglich).
- Dev-Server/Preview der Sitzung läuft evtl. noch.
- Dropdown im Browser geprüft (Suche, 12 Gruppen, 7 ungruppierte Einträge: Hub + Labs, die nicht in `LAB_MODULES` stehen). Mobil-Drawer nutzt das Menü nicht.
- Dashboard-Kacheln „Empfohlene Lernbereiche & Flagship Studios“ (`App.jsx`/Dashboard) tragen fast alle „(IHK) NEU“; Kopfzeile sagt „V3.48.0“, App ist 3.80.0.
- Nicht umgesetzt: Slider `accent-color`, Wissen-Karten ohne Vorschaubild, Skill-Baum-Hinweise, Timer-Tooltip, Texte unter 12 px.
- Fachinhalte und Links nicht gegen Primärquellen geprüft (DIN, BGB, HGB, DSGVO u. a.).

## Nächster Schritt
Dashboard-Kacheln bereinigen (Badges, Versionstext), dann Stichprobe der Fachinhalte (WiSo/Recht).
