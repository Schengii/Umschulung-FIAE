# Umsetzungsplan Umschulung-FIAE (PLAN.md)

## 1. Ist-Zustand (max. 10 Zeilen)
1. Statische Web-PWA (Vanilla HTML5/CSS3/ES6-Module, kein Bundler/Framework, Auslieferung von `dist/` via Vercel, 29 HTML-Seiten, 25 Teilprojekte).
2. Codequalität & Linting: ESLint (`eslint assets/js scripts sw.js`) und Prettier (`format:check`) bestehen fehlerfrei mit 0 Warnungen.
3. Typ-Prüfung: TypeScript (`tsc --noEmit`) via `jsconfig.json` und `jsconfig.sw.json` besteht mit 0 Fehlern.
4. Unit-Tests: Vitest meldet 164 bestandene Tests in 13 Testdateien (`test:unit`), weist jedoch auf Optimierungspotenzial ohne Worker-Isolation hin.
5. E2E- & A11y-Tests: Playwright (`chromium`) besteht alle 153 Tests fehlerfrei (inklusive axe-core WCAG 2.1 AA auf allen Seiten).
6. Security-Audit: `npm audit` meldet 0 Schwachstellen; lokaler Pre-Commit-Hook schützt Secrets und `.env`-Dateien zuverlässig.
7. Blocker 1 (CI-Gate): `npm run check-sw-assets` schlägt fehl (`sw.js` Precache-Liste/Hash-Name weicht vom generierten Stand der Dateien ab).
8. Blocker 2 (Build-Skript): `npm run build:dist` stürzt auf Windows mit `EPERM` bei `fs.rmSync(distDir)` wegen Datei-/Verzeichnissperren ab.
9. Funktions-Einschränkung (Produktion): `vercel.json` verbietet per `Permissions-Policy: microphone=()` das Mikrofon, wodurch der Interview-Trainer online scheitert.
10. Pfad-Inkonsistenzen: 6 absolute Pfade in Unterprojekten (`Projekte/`) und Domain-Differenzen (`www.` vs. Apex) in SEO-Dateien vorhanden.

## 2. Maßnahmen
- [x] M01 | PWA Service Worker Precache & Cache-Hash regenerieren | P1 | S | sw.js | sw.js:4 | Fertig wenn: `npm run check-sw-assets` und `npm run check` mit Exit Code 0 durchlaufen.
- [x] M02 | `build_minified.js` dist-Bereinigung mit Windows-Lock-Toleranz und Retry härten | P1 | S | scripts/build_minified.js | scripts/build_minified.js:129 | Fertig wenn: `npm run build:dist` auf Windows bei existierendem `dist/` ohne EPERM-Absturz erfolgreich baut.
- [x] M03 | Permissions-Policy in `vercel.json` für Spracherkennung freigeben (`microphone=(self)`) | P1 | S | vercel.json | vercel.json:24 | Fertig wenn: `Permissions-Policy` in `vercel.json` Mikrofon-Zugriff für `self` erlaubt und `SpeechRecognition` in `assets/js/interview.js:361` online nicht blockiert wird.
- [x] M04 | Absolute Root-Pfade in Unterprojekt-HTMLs zu relativen Pfaden auflösen | P1 | S | Projekte/Finanzenportfolio/index.html, Projekte/Informatik-lernen/index.html | Projekte/Finanzenportfolio/index.html:5 | Fertig wenn: `node scripts/audit_project_html_paths.js` 0 absolute Root-Pfade meldet.
- [x] M05 | Canvas-Context-Initialisierung in `snake.js` absichern und in DOM-Ready kapseln | P2 | S | assets/js/snake.js | assets/js/snake.js:5 | Fertig wenn: `canvas`- und `ctx`-Zuweisung innerhalb des `DOMContentLoaded`-Listeners mit Null-Check erfolgt.
- [x] M06 | Globale Variable `score` in klassischen Scripts kapseln | P2 | S | assets/js/snake.js, assets/js/quiz.js | assets/js/snake.js:21 | Fertig wenn: Globale Scope-Kollision eliminiert ist, `@ts-ignore` in `snake.js` entfernt wird und `npm run typecheck` fehlerfrei bleibt.
- [x] M07 | `SpeechRecognition` um `isSecureContext`-Guard und sauberes Fehler-Feedback ergänzen | P2 | S | assets/js/interview.js | assets/js/interview.js:360 | Fertig wenn: Bei verweigerter Mikrofonberechtigung oder unverschlüsseltem HTTP eine sichtbare Hinweismeldung im UI erscheint.
- [x] M08 | Web3Forms-Integration um Fallback-Prüfung für fehlenden/ungültigen Key absichern | P2 | S | assets/js/modules/contact-form.js | assets/js/modules/contact-form.js:64 | Fertig wenn: Ein fehlschlagender Web3Forms-Aufruf nach Timeout zuverlässig auf die `mailto:`-Generierung zurückgreift.
- [x] M09 | Typdefinitionen in `globals.d.ts` präzisieren und `any`-Deklarationen reduzieren | P2 | M | assets/js/globals.d.ts | assets/js/globals.d.ts:14 | Fertig wenn: Globale Window-Properties (`projectsData`, `AppStorage`, `SpeechRecognition`) typisiert sind und `npm run typecheck` mit 0 Fehlern besteht.
- [x] M10 | Unit-Test zur Synchronisation von `STORAGE_KEYS` und `progress-backup.js` Allowlist ergänzen | P2 | S | assets/js/modules/progress-backup.test.js | assets/js/modules/progress-backup.js:21 | Fertig wenn: Ein Vitest-Test sicherstellt, dass alle persistenten Schlüssel aus `constants.js` in `EXACT_KEYS` enthalten sind.
- [x] M11 | Vitest Worker-Isolation in `vitest.config.js` für schnellere Testläufe konfigurieren | P2 | S | vitest.config.js | vitest.config.js:4 | Fertig wenn: `npm run test:unit` ohne Worker-Spawn-Warnung in unter 700 ms abschließt.
- [x] M12 | Playwright Worker-Anzahl für lokale Entwicklung parametrisieren | P2 | S | playwright.config.js | playwright.config.js:15 | Fertig wenn: Lokale Testläufe mit `npx playwright test --project=chromium` mehrere CPU-Kerne nutzen und die Testzeit halbiert wird.
- [ ] M13 | Domain-Konsistenz zwischen `CNAME`, `robots.txt`, `sitemap.xml` und Skripten harmonisieren | P2 | S | robots.txt, sitemap.xml, scripts/update_sitemap.js | robots.txt:3 | Fertig wenn: Alle URLs konsistent der Apex-Domain `https://max-schenk.tech` folgen und `npm run check-sitemap` erfolgreich validiert.
- [ ] M14 | GitHub Actions CI Quality-Job mit lokalem `npm run check` synchronisieren | P2 | S | .github/workflows/ci.yml | .github/workflows/ci.yml:42 | Fertig wenn: CI `quality`-Job und lokales `npm run check` identische Prüfschritte ausführen.
- [ ] M15 | Unit-Tests für statische Hilfsskripte (`verify_csp_hashes.js`) ergänzen | P3 | M | scripts/verify_csp_hashes.js, vitest.config.js | scripts/verify_csp_hashes.js:48 | Fertig wenn: Unit-Tests für die zeilenendungsunabhängige Hash-Berechnung (CRLF/LF) in `test:unit` integriert sind und bestehen.
- [ ] M16 | Ausschlussregeln für Alt-Artefakte und Gigabyte-Dependencies in Unterprojekten schärfen | P3 | S | .gitignore, scripts/audit_cleanup.js | .gitignore:49 | Fertig wenn: `node scripts/audit_cleanup.js` keine ungetrackten Riesenverzeichnisse in `Projekte/` auflistet.
- [ ] M17 | E2E-A11y-Test für Mobile-Drawer-Fokus und `aria-expanded`-Zustand ergänzen | P3 | S | assets/js/modules/accessibility.spec.js | assets/js/components.js:194 | Fertig wenn: Playwright-Test bestätigt, dass `aria-expanded` und Fokus beim Öffnen/Schließen des mobilen Menüs korrekt verwaltet werden.
- [ ] M18 | ADR 0012 für Sub-Projekt Synchronisations-Strategie anlegen | P3 | S | docs/adr/0012-unterprojekt-sync-strategie.md, docs/adr/README.md | docs/adr/README.md:20 | Fertig wenn: ADR 0012 im ADR-Index dokumentiert ist und `REPO_MAPPING` sowie `preserve`-Listen erläutert.
- [ ] M19 | Node-Versionsanforderungen in `README.md`, `CLAUDE.md` und `package.json` abgleichen | P3 | S | README.md, CLAUDE.md, package.json | package.json:6 | Fertig wenn: Alle 3 Dokumente einheitlich `Node >= 22.12` lokal und `Node 24` in CI beschreiben.
- [ ] M20 | Kontrast-Audit aller 5 Akzentfarben im High-Contrast- und Standard-Theme als Test absichern | P3 | M | assets/css/style.css, assets/js/modules/accessibility.spec.js | assets/css/style.css:120 | Fertig wenn: Playwright-Test alle Akzentfarben (`blue`, `green`, `purple`, `amber`, `rose`) gegen WCAG 2.1 AA (4.5:1) prüft.

### Optional (Ideen ohne harten Beleg)
- [ ] OPT-1 | Automatisierte Lighthouse-CI Reports in PR-Kommentaren verlinken | P3 | M | .github/workflows/ci.yml | - | Fertig wenn: Lighthouse-Audit-Scores als GitHub PR-Kommentar gepostet werden.
- [ ] OPT-2 | Pre-Push Git Hook für automatischen Schnellcheck (`npm run check`) einrichten | P3 | S | .githooks/pre-push | - | Fertig wenn: Fehlgeschlagene statische Gates einen Push auf `main` lokal vorab abfangen.

## 3. Vorgehen je Phase
### Phase 1: CI-Blocker, Build-Stabilität & Produktions-Sicherheit (M01 – M04)
- **Reihenfolge**: Zuerst M01 (`npm run generate-sw-assets`), danach M02 (`build_minified.js` Error-Handling/Retry), M03 (`vercel.json` Permissions-Policy) und M04 (`fix_project_html_paths.js`).
- **Test nach Phase 1**: `npm run check`, `npm run build:dist`, `node scripts/audit_project_html_paths.js`.
- **Rollback**: `git checkout -- sw.js scripts/build_minified.js vercel.json Projekte/`.

### Phase 2: Runtime-Robustheit & Codequalität (M05 – M10)
- **Reihenfolge**: M05 (`snake.js`), M06 (`score`-Scope-Kapselung), M07 (`interview.js`), M08 (`contact-form.js`), M09 (`globals.d.ts`), M10 (Backup Allowlist Test).
- **Test nach Phase 2**: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npx playwright test assets/js/modules/all_pages.spec.js --project=chromium`.
- **Rollback**: `git checkout -- assets/js/`.

### Phase 3: Test- & Build-Performance (M11 – M15)
- **Reihenfolge**: M11 (`vitest.config.js`), M12 (`playwright.config.js`), M13 (Domain-Harmonisierung), M14 (`ci.yml`), M15 (Skript-Unit-Tests).
- **Test nach Phase 3**: `npm run test:unit`, `npx playwright test --project=chromium`, `npm run check-sitemap`.
- **Rollback**: `git checkout -- vitest.config.js playwright.config.js robots.txt sitemap.xml scripts/ .github/`.

### Phase 4: A11y, Dokumentation & Governance (M16 – M20)
- **Reihenfolge**: M16 (`.gitignore`), M17 (A11y Drawer Test), M18 (ADR 0012), M19 (Node-Doku), M20 (Akzentfarben-Kontrast).
- **Test nach Phase 4**: `npm run check`, `npx playwright test assets/js/modules/accessibility.spec.js --project=chromium`.
- **Rollback**: `git checkout -- .gitignore docs/ README.md CLAUDE.md assets/js/modules/accessibility.spec.js`.

## 4. Risiken und offene Fragen
- **Risiko 1 (Service Worker Cache-Invalidierung)**: Änderungen an Precache-Dateien erzeugen bei jedem Commit einen neuen Hash in `sw.js`. Wird `generate-sw-assets` nicht als allerletzter Schritt ausgeführt, bricht CI ab. Gegenmaßnahme: Pre-Commit- oder CI-Verifikationsschritt fest verankern.
- **Risiko 2 (Windows File-Locks auf `dist/`)**: Unter Windows können IDEs, Antiviren-Scanner oder dev-Server geöffnete Handles auf Unterordner in `dist/Projekte/` halten. Gegenmaßnahme: `scripts/build_minified.js` muss `fs.rmSync` mit Retries und gezieltem Fehlerabfang ausstatten, anstatt hart mit `EPERM` abzustürzen.
- **Risiko 3 (Unterprojekt-Sync überschreibt lokale Fixes)**: `scripts/sync_projects.js` zieht Repos frisch aus GitHub. Pfadänderungen in `Projekte/**` müssen in Upstream-Repos oder in `REPO_MAPPING.preserve` gepflegt werden, um nicht beim nächsten Sync überschrieben zu werden.
- **Offene Frage 1**: Soll die Domain `max-schenk.tech` (Apex) oder `www.max-schenk.tech` kanonisch sein? `CNAME` und `README.md` nutzen die Apex-Domain, `sitemap.xml` und `robots.txt` aktuell `www.`.
