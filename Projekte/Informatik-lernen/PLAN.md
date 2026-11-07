# Umsetzungsplan (PLAN.md) – Informatik-lernen

Stand der Analyse: 2026-11-01, Version 3.79.0, Branch `main` (Commit `91d6523`).
PLAN.md ist ab jetzt die einzige Arbeitsgrundlage für Umsetzung und Tests.

---

## 1. Ist-Zustand (gemessen am 2026-11-01)

1. Stack & Umfang: React 19, Vite 8 (Rolldown), Zustand 5, Vitest 5, Playwright 1.64, Oxlint 1.88, Tailwind CSS v4, PWA; 252 Labs in `src/components/Content/`, 178 `*Engine.js`-Module in `src/utils/`, 24 Fachartikel in `src/data/topics/`.
2. Lint & Typen: `npm run lint:ci` (Oxlint) 0 Fehler, 0 Warnungen auf 775 Dateien (182 ms); `npm run typecheck` (`tsc --noEmit`) 0 Fehler.
3. Unit-Tests & Engines: `npm run test:fast` 232 Dateien / 1508 Tests grün (24 s); `npm run test:coverage` 236 Dateien / 2228 Tests grün (118 s); alle Engines isoliert getestet.
4. Coverage: Statements 64.23% (Schwelle 63%), Branches 55.67% (54.5%), Functions 48.86% (47.5%), Lines 65.75% (64.5%); Engine-Schwellen (85% Lines / 70% Branches / 90% Functions) übererfüllt.
5. Bundle-Limits: `npm run size` erfüllt alle 6 Budgets (App-Shell 81.4 KB / 105 KB, React/Router/Zustand 64.4 KB / 70 KB, UI 64.8 KB / 70 KB, PDF 175.0 KB / 190 KB).
6. E2E-Tests: `npx playwright test --workers=2` 55/55 Tests grün in 1.2 m; bei unbegrenzter Parallelität lokal OOM-/Timeout-Gefahr sowie Port-Kollision bei bereits belegtem Port 4173 (`reuseExistingServer: !process.env.CI`).
7. PWA & Caching: `npm run build` in 2.4 s; Service-Worker-Precache umfasst 410 Chunks mit 4606 KiB (große Vendor-Chunks sind per globIgnores im Runtime-Cache, 229 Lab-Chunks liegen im Precache).
8. Sicherheit & CSP: `npm audit --omit=dev --omit=optional --audit-level=high` 0 Funde in Produktion; 19 Funde in Dev-Dependencies (`deepmerge`/`workbox-build`, `minimatch`); alasql läuft in isoliertem Web Worker mit eigener CSP.
9. Barrierefreiheit (A11y): `allLabsA11y.test.jsx` 234 Tests grün; E2E-A11y klammert `color-contrast` aus (`KNOWN_DESIGN_DEBT_RULES`); `scripts/ui-audit.js` misst Handy-Überlauf und Kontrast.
10. Dokumentation & DX: `CLAUDE.md` und `README.md` enthalten veraltete Test-Zahlen (1998 Tests, 43 E2E); `scripts/new-lab.js` und modularisierte Datenstrukturen funktionieren konsistent.

---

## 2. Maßnahmen

### Phase 1: CI, E2E & Developer Experience (Grundlage für Tests & Stabilität)

- [x] M01 | Playwright reuseExistingServer absichern oder Port-Kollision abfangen | P1 | S | playwright.config.js | playwright.config.js:29 | Fertig wenn: E2E-Suite startet immer den verifizierten lokalen Build und greift nicht unbemerkt auf fremde Prozesse auf Port 4173 zu; e2e läuft isoliert grün.
- [x] M02 | Playwright Worker-Standardbegrenzung konfigurieren gegen OOM und Timeouts | P1 | S | playwright.config.js | playwright.config.js:9 | Fertig wenn: playwright.config.js begrenzt workers (z. B. auf 2 oder CI-gerecht), sodass npx playwright test ohne CLI-Flags lokal und im CI ohne Speicherabbruch (OOM) durchläuft.
- [x] M03 | UI-Audit Lifecycle automatisieren (Startet lokalen Preview-Server falls inaktiv) | P2 | S | scripts/ui-audit.js, package.json | scripts/ui-audit.js:17, package.json:24 | Fertig wenn: npm run audit:ui ohne vorheriges manuelles Starten eines zweiten Terminals auf localhost:4173 durchläuft oder saubere Fehlermeldung ausgibt.
- [x] M04 | Vitest Coverage-Schwellen auf aktuellen Ist-Stand anheben | P2 | S | vite.config.js | vite.config.js:165-168 | Fertig wenn: statements auf 64%, branches auf 55%, functions auf 48.5%, lines auf 65.5% angehoben sind und npm run test:coverage grün durchläuft.

### Phase 2: Sicherheit & Abhängigkeiten

- [x] M05 | npm audit Warnungen in Dev-Dependencies (deepmerge / minimatch) beheben | P2 | M | package.json, package-lock.json | package.json:90, npm audit: 19 Funde (deepmerge in vite-plugin-pwa, minimatch in vitest-Tools) | Fertig wenn: npm audit --audit-level=moderate 0 Schwachstellen meldet oder Overrides sauber in package.json dokumentiert sind ohne Breaking Changes.
- [x] M06 | E2E-CSP-Abdeckung auf Wissensartikel (/topic/:id) ausweiten | P2 | S | e2e/csp.spec.js | e2e/csp.spec.js:20, src/components/Topics/TopicReader.jsx:1 | Fertig wenn: Neuer Test in e2e/csp.spec.js verifiziert, dass Wissensartikel unter CSP fehlerfrei laden und 0 CSP-Verstöße in der Browser-Konsole werfen.

### Phase 3: Codequalität & Architektur (Dünne Labs nach CLAUDE.md-Standard ausbauen)

- [ ] M07 | DockerLab ausbauen (Engine, interaktive Validierung und Drill-Sektion) | P2 | M | src/components/Content/DockerLab.jsx, src/utils/dockerEngine.js, src/utils/dockerEngine.test.js | src/components/Content/DockerLab.jsx:1 | Fertig wenn: Dockerfile/Compose-Syntax per neuer dockerEngine validiert wird, XP-Vergabe integriert ist, dockerEngine.test.js > 85% Line-Coverage hat und DockerLab interaktiv ist.
- [ ] M08 | KubernetesLab ausbauen (Engine, Manifest-Simulator und Drill-Sektion) | P2 | M | src/components/Content/KubernetesLab.jsx, src/utils/kubernetesEngine.js, src/utils/kubernetesEngine.test.js | src/components/Content/KubernetesLab.jsx:1 | Fertig wenn: K8s YAML-Ressourcen (Deployment/Service) per kubernetesEngine geprüft werden, Aufgaben/XP vorhanden sind und Engine > 85% Line-Coverage erreicht.
- [ ] M09 | WebSocketsLab ausbauen (Engine für Frame-Parsing und Verbindungs-State-Machine) | P2 | M | src/components/Content/WebSocketsLab.jsx, src/utils/webSocketsEngine.js, src/utils/webSocketsEngine.test.js | src/components/Content/WebSocketsLab.jsx:1 | Fertig wenn: WebSocket-Handshake und Frame-Aufbau (Opcode, Masking, Payload) interaktiv simuliert werden und Unit-Tests für die Engine grün sind.
- [ ] M10 | OAuthOidcLab vertiefen (PKCE-, Code-Exchange- und Token-State-Engine) | P2 | M | src/components/Content/OAuthOidcLab.jsx, src/utils/oauthOidcEngine.js, src/utils/oauthOidcEngine.test.js | src/components/Content/OAuthOidcLab.jsx:1 | Fertig wenn: Autorisierungs-Flows (Auth Code + PKCE, Refresh Flow) mit simulierten Token-Payloads validiert werden und Engine-Coverage > 85% beträgt.
- [ ] M11 | CloudDevOpsLab um Architektur-Simulator und Pipeline-Engine erweitern | P2 | M | src/components/Content/CloudDevOpsLab.jsx, src/utils/cloudDevOpsEngine.js, src/utils/cloudDevOpsEngine.test.js | src/components/Content/CloudDevOpsLab.jsx:1 | Fertig wenn: CI/CD- und Multi-Cloud-Topologien interaktiv konfiguriert und validiert werden inkl. vollständiger Engine-Unit-Tests.
- [ ] M12 | Lab-Katalog-Daten synchronisieren und Metadaten-Integrität testen | P3 | S | src/data/labRegistry.js, src/data/labModulesData.js, src/data/labModules/\*.js | src/data/labRegistry.js:1, src/data/labModulesData.js:1 | Fertig wenn: Ein automatisierter Test sicherstellt, dass alle 252 Labs in Moduldaten und Registry konsistente IDs, Kategorien und Routen besitzen.

### Phase 4: Barrierefreiheit & Design-System

- [x] M13 | Farbkontraste für Kern-Routen auditieren und WCAG AA (4.5:1 / 3:1) herstellen | P2 | L | src/styles/global.css, e2e/accessibility.spec.js | e2e/accessibility.spec.js:34, src/styles/global.css:25 | Fertig wenn: KNOWN_DESIGN_DEBT_RULES auf mindestens den 5 Haupt-Dashboards (Home, Labs, Wissensbereich, Leaderboard, Einstellungen) ohne color-contrast-Ausnahme grün durchläuft.
- [x] M14 | E2E-Mobile-Layout-Regressionstest auf alle neuen Labs erweitern | P2 | S | e2e/mobile-layout.spec.js | e2e/mobile-layout.spec.js:20, scripts/ui-audit.js:18 | Fertig wenn: e2e/mobile-layout.spec.js stichprobenartig alle Lab-Kategorien bei 375 px Viewport prüft und 0 horizontale Überläufe feststellt.
- [x] M15 | TopicReader Tastatur-Fokus, Scroll-Spys und Skip-Links barrierefrei absichern | P3 | S | src/components/Topics/TopicReader.jsx | src/components/Topics/TopicReader.jsx:1 | Fertig wenn: Inhaltsverzeichnis und Markdown-Überschriften per Tab erreichbar sind, aktive Abschnitte per aria-current signalisiert werden und axe-core 0 Fehler meldet.

### Phase 5: Performance & PWA

- [x] M16 | PWA-Precache optimieren: Kern-Labs im Precache vs. On-Demand-Labs im Runtime-Cache | P2 | M | vite.config.js | vite.config.js:50-52, dist Build: 4606 KiB Precache (410 entries) | Fertig wenn: Precache auf < 2.5 MB gesenkt ist, während Offline-Kern-Funktionalität und e2e/pwa-offline.spec.js fehlerfrei bleiben.
- [x] M17 | SVGs im Wissensbereich auf Dateigröße und Barrierefreiheit (title/desc) prüfen | P3 | S | src/assets/topics/\*.svg | src/assets/topics/ (25 SVG-Dateien) | Fertig wenn: Alle Topic-SVGs über svgo komprimiert sind, integrierte <title>-Tags für Screenreader besitzen und keine ungenutzten Metadaten enthalten.

### Phase 6: Dokumentation & CI

- [x] M18 | Dokumentation der Testanzahl, E2E-Fälle und Coverage in README und CLAUDE.md aktualisieren | P3 | S | README.md, CLAUDE.md | CLAUDE.md:32, README.md:161 | Fertig wenn: Alle Doku-Angaben exakt mit den gemessenen Zahlen (2228 Unit-Tests, 55 E2E-Tests, 252 Labs, 178 Engines) übereinstimmen.
- [x] M19 | GitHub Actions Workflow SHA-Pinning und Dependency-Cache auditieren | P3 | S | .github/workflows/ci.yml | .github/workflows/ci.yml:13 | Fertig wenn: Alle Actions auf gültigen 40-Zeichen Full-SHAs fixiert sind und der CI-Run im PR ohne veraltete Node-Warnungen durchläuft.

### Optional (Ideen ohne harten Beleg im Code)

- [ ] M20 | Internationalisierung (i18n): Englisch-Sprachunterstützung für Kern-Labs vorbereiten | P3 | L | src/locales/ | Keine Mehrsprachigkeit angelegt | Fertig wenn: Sprachumschalter existiert und Kern-Labs mit Übersetzungsdateien geladen werden können.
- [ ] M21 | Native Dialog-Elemente (<dialog>) anstelle von ARIA role="dialog" evaluieren | P3 | M | src/components/Modals/ | CLAUDE.md:105 (bewusster Ausschluss von prefer-tag-over-role) | Fertig wenn: Native Modale mit showModal() und polyfill ohne Regressionsrisiko für Tastaturfokus eingeführt sind.
- [ ] M22 | WebAssembly-basierte SQLite-Engine für vollständige Offline-SQL-Ausführung evaluieren | P3 | M | src/utils/sqlSandboxEngine.js | src/utils/sqlSandboxEngine.js:1 | Fertig wenn: sqlite3-wasm als Fallback für alasql ohne eval-Worker evaluiert und getestet ist.

---

## 3. Vorgehen je Phase: Reihenfolge, Test nach jeder Phase, Rollback

### Reihenfolge der Umsetzung

1. **Phase 1 (CI, E2E & DX):** Beseitigt Flakiness in der Testausführung (Portkollisionen, Worker-Überlastung) und zieht die Coverage-Schwellen auf den Ist-Stand nach.
2. **Phase 2 (Sicherheit & Abhängigkeiten):** Behebt Audit-Meldungen in Dev-Dependencies und erweitert den E2E-Schutz unter CSP auf den Wissensbereich.
3. **Phase 3 (Codequalität & Architektur):** Rüstet dünne Labs mit echten Engines und Drills aus, damit alle Labs dem CLAUDE.md-Standard entsprechen.
4. **Phase 4 (Barrierefreiheit & Design-System):** Schließt schrittweise Kontrastlücken und sichert die mobile Darstellung bei 375 px ab.
5. **Phase 5 (Performance & PWA):** Optimiert den Precache-Umfang für schnellere PWA-Installationen und bereinigt Vektor-Assets.
6. **Phase 6 (Dokumentation & CI):** Synchronisiert Kennzahlen in README und CLAUDE.md und prüft CI-Pipelines.

### Test nach jeder Phase

Nach jeder Phase müssen alle folgenden Qualitäts-Gates lokal und im CI fehlerfrei bestanden sein:

1. `npm run lint:ci` (0 Fehler, 0 Warnungen)
2. `npm run typecheck` (0 Fehler)
3. `npm run test:fast` (alle schnellen Unit-Tests grün)
4. `npm run test:coverage` (2228+ Tests grün, Schwellen eingehalten)
5. `npm run build` (erfolgreicher Build ohne Bundle-Warnungen)
6. `npm run size` (alle 6 Bundle-Budgets grün)
7. `npx playwright test --workers=2` (alle E2E-Tests grün)

### Rollback-Strategie

- Jede Maßnahme wird in einem dedizierten Git-Branch umgesetzt.
- Vor jedem Merge in `main` wird die vollständige Test-Kette lokal verifiziert.
- Tritt bei der Umsetzung oder nach dem Merge eine Regression auf, die nicht innerhalb von 15 Minuten behoben werden kann, wird die Änderung via `git revert <commit-sha>` sofort zurückgerollt.
- Für PWA-Änderungen: Bei Cache-Inkonsistenzen wird die Cache-Versionsnummer in `vite.config.js` inkrementiert, um Client-Caches zu invalidieren.

---

## 4. Risiken und offene Fragen

### Risiken

1. **PWA-Precache vs. Offline-Garantie (M16):** Ein Verkleinern des Precache durch Verlagerung von Lab-Chunks in den Runtime-Cache spart initiale Download-Größe (~4.6 MB → < 2.5 MB), führt jedoch dazu, dass Labs erst nach dem ersten Online-Aufruf offline verfügbar sind.
2. **Kontrastanpassungen vs. Dark-Mode-Design (M13):** Das Erhöhen des Kontrasts für gedämpfte Texte (`--text-muted`) von ~2.8:1 auf WCAG AA (4.5:1) verändert die visuelle Hierarchie. Muss behutsam und systemweit über CSS-Variablen erfolgen.
3. **Parallelitäts-Timeouts bei E2E (M01, M02):** Auf unterschiedlichen Entwicklungsrechnern können zu viele parallele Playwright-Worker zu Heap-Out-of-Memory führen. Eine feste Begrenzung auf maximal 2 Worker ist Pflicht.
4. **Dev-Dependency Overrides (M05):** Erzwungene Upgrades von Sub-Abhängigkeiten wie `deepmerge` in `workbox-build` können transitive Inkompatibilitäten im Service-Worker-Build verursachen.

### Offene Fragen

1. **Offline-Priorität der Labs:** Sollen alle 252 Labs offline garantiert vorgehalten werden (Precache ~4.6 MB), oder nur eine definierte Auswahl der 50 beliebtesten Kern-Labs, während der Rest lazy über den StaleWhileRevalidate-Cache lädt?
2. **Tiefe der Simulatoren in Docker/K8s (M07, M08):** Sollen die Engines echte AST/Syntax-Validierungen durchführen oder reglementierte interaktive Schritt-für-Schritt-Zustandsautomaten bieten?
3. **Automatisierung von `audit:ui`:** Soll `scripts/ui-audit.js` als festes Quality-Gate in den CI-Workflow eingebunden werden, oder bleibt es vorerst ein lokales Entwickler-Werkzeug?
