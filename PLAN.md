# Umsetzungsplan Umschulung-FIAE (PLAN.md)

## 1. Ist-Zustand (max. 10 Zeilen)
1. Statische Web-PWA (Vanilla HTML5/CSS3/ES-Module, kein Bundler/Framework, Auslieferung von `dist/` via Vercel, 29 HTML-Seiten, 25 Teilprojekte).
2. Quality-Gates: `npm run check` (Data-Sync, Head, CSP, Icons, Sitemap, SW-Assets, ESLint, Prettier, TypeScript, 170 Unit-Tests) ist grün.
3. Build & E2E: `npm run build:dist` minifiziert stabil; Playwright deckt 1020 Testfälle über Chromium, Firefox, WebKit und Mobile-Chrome ab.
4. Security-Sperre (Produktion): `vercel.json` blockiert mit `X-Frame-Options: DENY` und `frame-ancestors 'none'` interne Live-Sandboxes (`quick-sandbox.js`).
5. CSP-Fehler (Produktion): Dynamischer QR-Code-Download in `qr-generator.js` scheitert an `connect-src`-Restriktion für externe QR-API.
6. Broken Paths: In `quick-sandbox.js` zeigen Pfade für Wohnungssuche KI und Informatik-Lernen auf nicht-existente Build-Ziele (404-Fehler).
7. Usability-Kollision: Globale Hotkeys `Ctrl+K`, `T` und `L` in `keyboard-shortcuts.js` kollidieren mit Command Palette und nativen Browser-Tastenkombinationen.
8. Test-Lücken: `git-simulator.html` fehlt in Axe-Core WCAG 2.1 AA und Stability-Specs; `portfolio-copilot`, `achievements` und `game-audio` ohne Unit-Tests.
9. Redundanz & Magic Strings: `STORAGE_KEYS` in `constants.js` ist unvollständig (13 von 30 Keys); Tests duplizieren Konstanten lokal inline.
10. Domänen-Divergenz: `CNAME` nutzt Apex-Domain (`max-schenk.tech`), während `sitemap.xml` und `robots.txt` `www.max-schenk.tech` kanonisieren.

## 2. Maßnahmen
- [x] M01 | Permissions & Frame-Ancestors in `vercel.json` für gleiche Herkunft freigeben | P1 | S | vercel.json | vercel.json:12 | Fertig wenn: `X-Frame-Options: SAMEORIGIN` und `frame-ancestors 'self'` in `vercel.json` gesetzt sind und `quick-sandbox.js` Projekte im Iframe einbetten darf.
- [ ] M02 | QR-Code Generator Download von externer Fetch-Verbindung entkoppeln oder CSP anpassen | P1 | S | assets/js/modules/qr-generator.js, vercel.json, pages/links.html | assets/js/modules/qr-generator.js:153 | Fertig wenn: Der QR-Code-Download ohne CSP-`connect-src`-Fehler im Browser zuverlässig die PNG-Datei speichert.
- [ ] M03 | Pfade für Wohnungssuche KI und Informatik-Lernen in `quick-sandbox.js` korrigieren | P1 | S | assets/js/modules/quick-sandbox.js | assets/js/modules/quick-sandbox.js:51 | Fertig wenn: Klick auf beide Sandboxes in `portfolio.html` existierende Dateien öffnet und keine 404-Meldungen erzeugt.
- [ ] M04 | Relative Pfadauflösung in `quick-sandbox.js` für Root- und Pages-Ebene vereinheitlichen | P1 | S | assets/js/modules/quick-sandbox.js | assets/js/modules/quick-sandbox.js:189 | Fertig wenn: Sandbox-Trigger sowohl von `index.html` als auch aus `pages/*.html` gültige Iframe-URLs auflösen.
- [ ] M05 | Zweisprachige Beschreibungs-Interpolation in `projekt-detail.js` trennen | P1 | S | assets/js/projekt-detail.js | assets/js/projekt-detail.js:351 | Fertig wenn: `<p lang="de">` `${project.descDe}` und `<p lang="en">` `${project.descEn}` rendert und Sprachwechsel echten Sprachenwechsel zeigt.
- [ ] M06 | Hotkey-Guards in `keyboard-shortcuts.js` gegen Modifier-Tasten absichern | P2 | S | assets/js/modules/keyboard-shortcuts.js | assets/js/modules/keyboard-shortcuts.js:37 | Fertig wenn: `Ctrl+L`, `Alt+T` und andere Browser-Kombinationen nicht versehentlich das Theme oder die Sprache umschalten.
- [ ] M07 | `Ctrl+K`-Handling zwischen `keyboard-shortcuts.js` und `command_palette.js` harmonisieren | P2 | S | assets/js/modules/keyboard-shortcuts.js, assets/js/modules/command_palette.js | assets/js/modules/keyboard-shortcuts.js:24 | Fertig wenn: Bei `Ctrl+K` kein doppelter Fokus auf Command Palette und Hintergrund-Suchleiste entsteht.
- [ ] M08 | PostMessage-Empfänger in `playground.js` auf Iframe-Quelle absichern | P2 | S | assets/js/playground.js | assets/js/playground.js:1120 | Fertig wenn: Der Message-Listener prüft, ob `e.source === this.previewIframe?.contentWindow`.
- [ ] M09 | `check_all_project_links.js` mit Failure-Exit-Code ausstatten und in `npm run check` aufnehmen | P2 | S | scripts/check_all_project_links.js, package.json | scripts/check_all_project_links.js:48 | Fertig wenn: Bei fehlenden Projekt-Links der Prozess mit Exit Code 1 abbricht und das Skript Teil von `npm run check` ist.
- [ ] M10 | `pages/git-simulator.html` in WCAG 2.1 AA E2E-Axe-Core-Testsuite aufnehmen | P2 | S | assets/js/modules/accessibility.spec.js | assets/js/modules/accessibility.spec.js:8 | Fertig wenn: `accessibility.spec.js` `pages/git-simulator.html` in Light- und Dark-Theme ohne Verstöße testet.
- [ ] M11 | `pages/git-simulator.html` in globale Seiten-Stabilitäts-Prüfung integrieren | P2 | S | assets/js/modules/all_pages.spec.js | assets/js/modules/all_pages.spec.js:4 | Fertig wenn: `all_pages.spec.js` `pages/git-simulator.html` auf Console- und Netzwerkfehler überwacht.
- [ ] M12 | `STORAGE_KEYS` in `constants.js` vervollständigen und Magic Strings ablösen | P2 | M | assets/js/constants.js, assets/js/modules/achievements.js, assets/js/playground.js | assets/js/constants.js:5 | Fertig wenn: Alle persistenten Keys in `STORAGE_KEYS` deklariert sind und von Modulen referenziert werden.
- [ ] M13 | Dupliziertes `STORAGE_KEYS`-Objekt in `progress-backup.test.js` durch Import/Abgleich ersetzen | P2 | S | assets/js/modules/progress-backup.test.js | assets/js/modules/progress-backup.test.js:162 | Fertig wenn: Der Test direkt gegen die zentralen Keys validiert und keine statische Kopie pflegt.
- [ ] M14 | `dashboard.js` Achievements-Zugriff auf sauberen ESM-Import umstellen | P2 | S | assets/js/dashboard.js | assets/js/dashboard.js:658 | Fertig wenn: `dashboard.js` `Achievements` via `import { Achievements }` einbindet und ohne globale Fallbacks auskommt.
- [ ] M15 | JSDoc-Typdeklarationen in `quick-sandbox.js` und `qr-generator.js` korrigieren | P2 | S | assets/js/modules/quick-sandbox.js, assets/js/modules/qr-generator.js | assets/js/modules/quick-sandbox.js:129 | Fertig wenn: Iframe als `HTMLIFrameElement` und Select als `HTMLSelectElement` typisiert sind und `npm run typecheck` fehlerfrei bleibt.
- [ ] M16 | `portfolio-copilot.js` Kernlogik mit Vitest Unit-Tests absichern | P2 | M | assets/js/modules/portfolio-copilot.test.js, assets/js/modules/portfolio-copilot.js | assets/js/modules/portfolio-copilot.js:323 | Fertig wenn: Intent-Matching, Keyword-Scoring und Link-Resolution durch Unit-Tests abgedeckt sind.
- [ ] M17 | `achievements.js` Kernfunktionen durch Vitest Unit-Tests verifizieren | P2 | M | assets/js/modules/achievements.test.js, assets/js/modules/achievements.js | assets/js/modules/achievements.js:100 | Fertig wenn: Unlock-Logik, Event-Dispatching und Duplikatsvermeidung automatisiert getestet werden.
- [ ] M18 | Auswertungslogik aus `interview.js` extrahieren und per Unit-Test absichern | P2 | M | assets/js/interview.js, assets/js/modules/interview-evaluator.js, assets/js/modules/interview-evaluator.test.js | assets/js/interview.js:601 | Fertig wenn: Keyword-Matching und Score-Berechnung als reine Funktionen isoliert getestet sind.
- [ ] M19 | Dynamische Style-Injektion in `document-preview.js` in Modul-CSS auslagern | P3 | S | assets/js/modules/document-preview.js, assets/css/modules/document_preview.css, sw.js | assets/js/modules/document-preview.js:23 | Fertig wenn: Die CSS-Klassen in einer Datei liegen, in `sw.js` precached werden und kein Inline-`<style>` injiziert wird.
- [ ] M20 | `portfolio_exporter.js` von IIFE auf ESM-Modulstruktur umstellen | P3 | S | assets/js/modules/portfolio_exporter.js, pages/portfolio.html | assets/js/modules/portfolio_exporter.js:6 | Fertig wenn: `portfolio_exporter.js` per `export function` strukturiert und konsistent importiert wird.
- [ ] M21 | iCal-Zeilenumbrüche in `ical-generator.js` auf RFC-5545 CRLF normieren | P3 | S | assets/js/modules/ical-generator.js | assets/js/modules/ical-generator.js:57 | Fertig wenn: `.ics`-Dateien mit `\r\n` generiert werden und in Outlook/Apple Calendar valide importieren.
- [ ] M22 | JSON-LD Breadcrumb-Struktur auf `pages/games.html` ergänzen | P3 | S | pages/games.html | pages/games.html:27 | Fertig wenn: `games.html` ein standardkonformes `BreadcrumbList`-Schema im `<head>` besitzt.
- [ ] M23 | Fehlendes `data-en-title` Attribut auf Print-Button in `portfolio_exporter.js` nachtragen | P3 | S | assets/js/modules/portfolio_exporter.js | assets/js/modules/portfolio_exporter.js:21 | Fertig wenn: Beim Umschalten auf Englisch der Tooltip des Buttons übersetzt wird.
- [ ] M24 | Fehlenden `onerror`-Fallback bei QR-Code-Ladevorgang in `qr-generator.js` absichern | P3 | S | assets/js/modules/qr-generator.js | assets/js/modules/qr-generator.js:75 | Fertig wenn: Bei Offline-Verbindung oder Ladefehler eine sichtbare Fehlermeldung statt eines Endlos-Loaders erscheint.
- [ ] M25 | Kanonische Domain-Ausrichtung zwischen `CNAME`, `robots.txt` und `sitemap.xml` festlegen | P3 | S | CNAME, robots.txt, sitemap.xml | CNAME:1 | Fertig wenn: Hostname in `CNAME` und Sitemap/Robots einheitlich (bevorzugt `www.max-schenk.tech`) synchronisiert sind.

### Optional (Ideen ohne harten Beleg)
- [ ] OPT-1 | Automatisierte Lighthouse-CI Reports in PR-Kommentaren verlinken | P3 | M | .github/workflows/ci.yml | - | Fertig wenn: Lighthouse-Audit-Scores als GitHub PR-Kommentar gepostet werden.
- [ ] OPT-2 | Pre-Push Git Hook für automatischen Schnellcheck (`npm run check`) einrichten | P3 | S | .githooks/pre-push | - | Fertig wenn: Fehlgeschlagene statische Gates einen Push auf `main` lokal vorab abfangen.
- [ ] OPT-3 | Bilingualisierung (DE/EN) für alle Challenge-Lab Fragen in `challenge-lab.js` | P3 | L | assets/js/modules/challenge-lab.js, pages/challenge-lab.html | - | Fertig wenn: Alle 3 Challenge-Lab-Aufgaben und Optionen vollständig zweisprachig per Sprachumschalter umschalten.

## 3. Vorgehen je Phase
### Phase 1: Produktions-Sicherheit, CSP & Funktions-Blocker (M01 – M05)
- **Reihenfolge**: Zuerst M01 (`vercel.json` Iframe-Permissions), danach M02 (`qr-generator.js` CSP/Download), M03 & M04 (`quick-sandbox.js` Pfade & Root-Auflösung) und M05 (`projekt-detail.js` zweisprachige Beschreibung).
- **Test nach Phase 1**: `npm run check-csp`, `npm run build:dist`, manuelle Verifikation von Quick-Sandbox und Projektdetails im Browser.
- **Rollback**: `git checkout -- vercel.json pages/links.html assets/js/modules/quick-sandbox.js assets/js/modules/qr-generator.js assets/js/projekt-detail.js`.

### Phase 2: Usability, Input-Härtung & CI-Prüfungen (M06 – M11)
- **Reihenfolge**: M06 & M07 (`keyboard-shortcuts.js` Modifier-Guards & Ctrl+K Entflechtung), M08 (`playground.js` Message-Origin), M09 (`check_all_project_links.js` CI-Exit), M10 & M11 (`git-simulator.html` in Axe-Core & Stability-Specs).
- **Test nach Phase 2**: `npm run check`, `npx playwright test assets/js/modules/accessibility.spec.js assets/js/modules/all_pages.spec.js --project=chromium`.
- **Rollback**: `git checkout -- assets/js/modules/keyboard-shortcuts.js assets/js/modules/command_palette.js assets/js/playground.js scripts/check_all_project_links.js package.json assets/js/modules/accessibility.spec.js assets/js/modules/all_pages.spec.js`.

### Phase 3: Architektur, Konstanten & Unit-Testabdeckung (M12 – M18)
- **Reihenfolge**: M12 (`constants.js` Storage-Keys), M13 (`progress-backup.test.js`), M14 (`dashboard.js` ESM-Import), M15 (JSDoc-Typen), M16 (`portfolio-copilot.test.js`), M17 (`achievements.test.js`), M18 (`interview-evaluator.js` Extraktion & Test).
- **Test nach Phase 3**: `npm run typecheck`, `npm run test:unit`, `npm run lint`.
- **Rollback**: `git checkout -- assets/js/constants.js assets/js/dashboard.js assets/js/modules/ assets/js/interview.js`.

### Phase 4: CSS-Bereinigung, SEO & Metadaten-Feinschliff (M19 – M25)
- **Reihenfolge**: M19 (`document-preview.js` CSS-Auslagerung), M20 (`portfolio_exporter.js` ESM), M21 (`ical-generator.js` CRLF), M22 (`games.html` Breadcrumb), M23 (`portfolio_exporter.js` Translation), M24 (`qr-generator.js` Error-Handling), M25 (`CNAME` Harmonisierung).
- **Test nach Phase 4**: `npm run regen`, `npm run check`, `npm run build:dist`.
- **Rollback**: `git checkout -- assets/css/ assets/js/modules/ pages/ CNAME robots.txt sitemap.xml`.

## 4. Risiken und offene Fragen
- **Risiko 1 (Service Worker Cache-Invalidierung)**: Änderungen an CSS/JS-Dateien (z. B. M19 Auslagerung von Modul-CSS) modifizieren die Precache-Liste und den Cache-Hash in `sw.js`. Gegenmaßnahme: Vor jedem Commit stets `npm run regen` ausführen.
- **Risiko 2 (CSP-Hashes bei Inline-Skripten)**: Werden in HTML-Dateien Inline-Skripte oder Attribute verändert, schlägt `check-csp` fehl. Gegenmaßnahme: Skripte extern belassen oder Hashes mit `npm run check-csp:fix` aktualisieren.
- **Risiko 3 (Upstream-Projekt-Synchronisation)**: Korrekturen an Pfaden unter `Projekte/**` können bei Ausführung von `npm run sync-projects` überschrieben werden, falls die Zielordner nicht in `REPO_MAPPING.preserve` geschützt sind. Gegenmaßnahme: Pfad-Fixes bevorzugt in den aufrufenden Portfolio-Modulen durchführen.
- **Offene Frage 1**: Soll die Domain `max-schenk.tech` (Apex) oder `www.max-schenk.tech` als kanonische Hauptdomain im DNS und auf Vercel hinterlegt sein? (Aktuell: CNAME Apex, Sitemap www).
- **Offene Frage 2**: Soll das Challenge-Lab in Phase 4 komplett zweisprachig (DE/EN) ausgebaut werden, oder genügt vorerst die deutsche Fassung für den IHK-Fokus?
