# PLAN.md — Projektanalyse & Umsetzungsplan ElektroCheck AI

## 1. Ist-Zustand
ElektroCheck AI ist eine PWA/Capacitor-Anwendung (Lit 3, Vite 5, Node 22, Express-Adapter, 12 Vercel-Functions) zur DGUV V3 / DIN VDE Prüfung.
Build (`tsc && vite build`) und Linting (`--max-warnings=0`) laufen fehlerfrei durch; 44 Testdateien mit 222 Tests (141 Frontend, 81 Backend) sind zu 100 % grün.
Die Testabdeckung im Frontend liegt bei 72,7 % Statements / 71,3 % Branches, wobei Kern-Services (Perplexity, Voice Assistant, BLE) aktuell 0 % Coverage aufweisen.
Die Produktions-Abhängigkeiten weisen 0 Schwachstellen auf, in den Dev-Abhängigkeiten bestehen jedoch 14 Audit-Meldungen (darunter Tinypool/Braces).
Die Fachlogik ist sauber in `api/` gekapselt, der Vercel-Hobby-Plan ist mit exakt 12 Serverless Functions voll ausgelastet.
Zwischen Deployment-Konfiguration (`vercel.json`), lokalen `.env`-Pfaden und Dokumentation bestehen kleine Diskrepanzen (z. B. `npx vite build` ohne `tsc`).
Die mobile Barrierefreiheit ist durch Zoom-Sperren im Viewport und fehlende Screenreader-Labels auf Icon-Buttons noch nicht vollständig WCAG-konform.
Im Frontend `TicketService` sind bisher nur Erstellung und Synchronisation angebunden, während Backend-Endpunkte für Abruf, Update und Löschung bereits existieren.

## 2. Maßnahmen

### Phase 1: Sicherheit, Build & Deployment (Fundament & Stabilität)
- [x] CI-01 | Build-Befehl in vercel.json synchronisieren (TypeCheck aktivieren) | P1 | S | vercel.json | vercel.json:7 | Fertig wenn: `buildCommand` in `vercel.json` führt `npm run build` (inkl. `tsc`) aus und fängt Typfehler vor dem Deployment ab.
- [x] SEC-01 | Gemini-Default-Modellbezeichnung auf existierendes Modell aktualisieren | P1 | S | api/_lib/gemini-helper.js, README.md, .env.example, backend/.env.template | api/_lib/gemini-helper.js:10 | Fertig wenn: Default-Modell in `gemini-helper.js` und Templates verweist konsistent auf ein offizielles Gemini-Flash-Modell und stimmt mit README überein.
- [x] CI-02 | Einheitliche .env-Ladelogik für Root und Backend sicherstellen | P2 | S | backend/index.js, CONTRIBUTING.md, CLAUDE.md | backend/index.js:29 | Fertig wenn: `backend/index.js` lädt sowohl `.env` im Root als auch `backend/.env` transparent und Dokumentation empfiehlt einen einheitlichen Standardpfad.
- [x] CI-03 | Dev-Abhängigkeiten mit bekannten Sicherheitslücken aktualisieren | P2 | M | package.json, package-lock.json | package.json:52 | Fertig wenn: `npm audit` meldet 0 kritische/hohe Lücken in Dev-Dependencies (Update von `lint-staged` und `vitest`/`tinypool`).
- [x] SEC-02 | Vercel Analytics und Speed Insights im Capacitor-Kontext absichern | P2 | S | src/app-root.ts | src/app-root.ts:18 | Fertig wenn: Analytics-Initialisierung prüft auf native Capacitor-Schemata (`capacitor:`, `https://localhost`) und unterdrückt dort irrelevante Beacon-Fehler.
- [x] SEC-03 | Backend-Startup: Erklärende Fehlermeldung statt reinem Exit bei fehlendem Key | P2 | S | backend/index.js | backend/index.js:103 | Fertig wenn: Beim lokalen Start ohne `GEMINI_API_KEY` ein informativer Hinweis auf `.env.example` und den Test-Modus ausgegeben wird.
- [x] DEV-01 | Capacitor Webview-Debugging für Nicht-Production-Builds aktivieren | P3 | S | capacitor.config.ts | capacitor.config.ts:15 | Fertig wenn: `webContentsDebuggingEnabled: !isProduction` gesetzt ist, sodass Remote-Debugging in Chrome DevTools außerhalb von Production möglich ist.

### Phase 2: Barrierefreiheit & Web Vitals (Frontend & A11y)
- [x] A11Y-01 | Viewport-Zoom in index.html für barrierefreie Skalierbarkeit freigeben (WCAG 1.4.4) | P1 | S | index.html | index.html:5 | Fertig wenn: `maximum-scale=1.0, user-scalable=no` aus dem Viewport-Meta-Tag entfernt ist und Nutzer die UI im Browser vergrößern können.
- [x] A11Y-02 | Fehlende alt-Attribute bei Bildvorschauen ergänzen (WCAG 1.1.1) | P2 | S | src/components/ec-schematic-analyzer.ts | src/components/ec-schematic-analyzer.ts:133 | Fertig wenn: Bild-Elemente in `ec-schematic-analyzer.ts` ein deskriptives `alt`-Attribut besitzen.
- [x] A11Y-03 | aria-label auf Icon-Buttons in ec-app-header.ts ergänzen (WCAG 4.1.2) | P2 | S | src/components/ec-app-header.ts | src/components/ec-app-header.ts:51 | Fertig wenn: Buttons für Handschuh-Modus, Kontrast, Dark-Mode und Einstellungen Screenreadern per `aria-label` eindeutige Beschreibungen bieten.
- [x] PERF-01 | Google Fonts Ladeverhalten optimieren (Render-Blocking @import ersetzen) | P2 | S | src/index.css, index.html | src/index.css:1 | Fertig wenn: Schriftart per `<link rel="preconnect">` und `<link rel="stylesheet">` im `<head>` geladen wird statt via CSS-`@import`, um FCP/LCP zu verbessern.
- [x] PERF-02 | Rollup Chunk-Size-Limit für vendor-pdfmake anpassen | P3 | S | vite.config.ts | vite.config.ts:14 | Fertig wenn: `chunkSizeWarningLimit: 2000` konfiguriert ist und der Produktions-Build ohne Rollup-Größenwarnungen kompiliert.

### Phase 3: Codequalität & Linter-Härtung
- [x] CODE-01 | ESLint-Regel no-unused-vars für src/ aktivieren und Codebasis bereinigen | P2 | S | eslint.config.js, src/components/ec-camera-capture.ts, src/components/ec-thermal-analysis.ts | eslint.config.js:22 | Fertig wenn: `@typescript-eslint/no-unused-vars` aktiv ist (`argsIgnorePattern: '^_'`, `caughtErrors: 'none'`) und `npm run lint` mit 0 Warnungen abschließt.
- [x] CODE-02 | Antwortstruktur von GET /api/tickets vereinheitlichen | P2 | S | api/tickets/index.js, backend/tests/tickets.test.js | api/tickets/index.js:16 | Fertig wenn: Der Endpunkt sowohl mit als auch ohne `limit`-Query konsistent einheitliche JSON-Strukturen liefert und bestehende Backend-Tests grün bleiben.

### Phase 4: Funktion & Architektur (Services & Datenfluss)
- [x] FEAT-01 | Frontend TicketService um Lese-, Update- und Löschmethoden erweitern | P1 | M | src/services/ticket-service.ts, src/services/ticket-service.test.ts | src/services/ticket-service.ts:10 | Fertig wenn: `TicketService` Methoden `getTickets()`, `updateTicket(id, updates)` und `deleteTicket(id)` bereitstellt und per Unit-Tests verifiziert ist.
- [x] FEAT-02 | Dashboard Datengrundlage mit Ticket-Status synchronisieren | P2 | M | src/components/ec-dashboard.ts, src/components/ec-diagnosis-wizard.ts | src/components/ec-dashboard.ts:66 | Fertig wenn: `EcDashboard` Status und KPIs aus Backend-Tickets darstellen kann und der Datenfluss zwischen Wizard und Dashboard typisiert ist.
- [x] FEAT-03 | Mehrteilige Sprachtranskripte in DictationController robust verarbeiten | P3 | S | src/state/dictation-controller.ts | src/state/dictation-controller.ts:55 | Fertig wenn: `DictationController` alle Segmente aus `SpeechRecognitionEvent` korrekt aggregiert und Fehlerraten bei längeren Diktaten minimiert sind.

### Phase 5: Testabdeckung & Qualitätssicherung
- [x] TEST-01 | Unit-Tests für PerplexityService erstellen (0 % -> > 85 %) | P1 | S | src/services/perplexity-services.ts, src/services/perplexity-services.test.ts | src/services/perplexity-services.ts:1 | Fertig wenn: Neue Testdatei `perplexity-services.test.ts` Success-, HTTP-Fehler- und Timeout-Pfade abdeckt und Testsuite besteht.
- [x] TEST-02 | Unit-Tests für VoiceAssistantService erstellen (0 % -> > 80 %) | P2 | M | src/services/voice-assistant-service.ts, src/services/voice-assistant-service.test.ts | src/services/voice-assistant-service.ts:1 | Fertig wenn: Sprachkommandos ("Weiter", "Zurück", "Vorlesen", "Stopp") und TTS-Aufrufe mit gemockten Web-APIs getestet sind.
- [x] TEST-03 | Unit-Tests für BleMultimeterService erstellen (0 % -> > 75 %) | P2 | M | src/services/ble-multimeter-service.ts, src/services/ble-multimeter-service.test.ts | src/services/ble-multimeter-service.ts:1 | Fertig wenn: BLE-GATT-Verbindung, Messwert-Parser und Fehlerzustände per Mock-Bluetooth abgedeckt sind.
- [x] TEST-04 | Unit-Tests für DictationController und AudioNoteController erstellen | P2 | M | src/state/dictation-controller.ts, src/state/dictation-controller.test.ts, src/state/audio-note-controller.ts, src/state/audio-note-controller.test.ts | src/state/dictation-controller.ts:1 | Fertig wenn: Beide Controller durch Vitest-Dateien mit Mock-Host und Event-Simulationen abgesichert sind.
- [x] TEST-05 | Testabdeckung für GeminiAIService ausbauen (38 % -> > 80 %) | P2 | S | src/services/gemini-services.ts, src/services/gemini-services.test.ts | src/services/gemini-services.ts:1 | Fertig wenn: `analyzeThermal`, `analyzeSchematic`, `scanTypePlate` und `scanMultimeter` in `gemini-services.test.ts` integriert sind.
- [x] TEST-06 | Tests für image-resize.ts und report-actions.ts vervollständigen | P3 | S | src/utils/image-resize.ts, src/utils/image-resize.test.ts, src/utils/report-actions.ts, src/utils/report-actions.test.ts | src/utils/image-resize.ts:1 | Fertig wenn: Canvas-Skalierung in `image-resize.test.ts` und E-Mail-Dispatches in `report-actions.test.ts` getestet sind.
- [x] CI-04 | E2E-Smoke-Test Fallback für Umgebungen ohne Chrome absichern | P3 | S | e2e/smoke.mjs | e2e/smoke.mjs:47 | Fertig wenn: Fehlt Chrome lokal, bricht das Skript mit klarer Handlungsanweisung (`CHROME_PATH`) ab statt mit technischer Exception.

### Phase 6: Dokumentation & Bereinigung
- [x] DOC-01 | Architektur-Dokumentation in README.md und CLAUDE.md synchronisieren | P3 | S | README.md, CLAUDE.md | README.md:148 | Fertig wenn: Verzeichnisstruktur und Werkzeug-Liste in `README.md` und `CLAUDE.md` alle Utils (z. B. `error.ts`, `distribution-legend-generator.ts`) und Testpfade präzise abbilden.
- [x] DOC-02 | Port- und Proxy-Setup in README.md dokumentieren | P3 | S | README.md, vite.config.ts | README.md:58 | Fertig wenn: Die Interaktion zwischen Vite-Dev-Server (:5173), Express (:3000) und Docker Compose transparent beschrieben ist.
- [x] DEV-02 | Redundantes Test-Skript in backend/package.json bereinigen | P3 | S | backend/package.json | backend/package.json:10 | Fertig wenn: `"test:node"` aus `backend/package.json` entfernt oder dessen Zweck gegenüber `"test"` klargestellt ist.

### Optional (Ideen ohne harten Code-Beleg)
- [ ] OPT-01 | Background-Sync API für Offline-Tickets nach Service-Worker-Reaktivierung evaluieren
- [ ] OPT-02 | Shared Typeschnittstellen zwischen `src/services/ai-types.ts` und `api/_lib/schemas.js` via JSON-Schema-Typengenerierung teilen
- [ ] OPT-03 | Automatisierte Lighthouse- oder Axe-Accessibility-Prüfungen in die GitHub Actions CI integrieren

## 3. Vorgehen je Phase
Die Umsetzung erfolgt streng phasenweise in der nummerierten Reihenfolge (Phase 1 bis 6).

1. **Reihenfolge**:
   - Phase 1 (Sicherheit, Build & Deployment) schafft die verlässliche Basis für CI und Runtime.
   - Phase 2 (Barrierefreiheit & Web Vitals) behebt WCAG-Mängel und optimiert Ladezeiten.
   - Phase 3 (Codequalität & Linter) schärft die statische Analyse für den gesamten TypeScript-Code.
   - Phase 4 (Funktion & Architektur) erweitert den Frontend-Service um die bestehenden Backend-APIs.
   - Phase 5 (Testabdeckung) hebt die Testabdeckung von 72 % auf > 85 % an.
   - Phase 6 (Dokumentation & Bereinigung) schließt offene Dokumentationslücken ab.
2. **Test nach jeder Phase**:
   - `npm run build` (muss fehlerfrei kompilieren, 0 TypeScript-Fehler).
   - `npm run lint` (muss mit 0 Warnungen und 0 Fehlern durchlaufen).
   - `npm run test` (alle 44+ Testdateien müssen bestehen).
   - Nach Phase 4 & 5 zusätzlich: `npm run test:coverage` zur Verifizierung des Abdeckungsanstiegs.
3. **Rollback-Strategie**:
   - Jede Phase wird in einem separaten Git-Commit isoliert.
   - Scheitert ein Build- oder Testschritt nach einer Phase, wird die Phase via `git reset --hard HEAD~1` zurückgerollt, bevor nachgebessert wird.

## 4. Risiken und offene Fragen
- **Vercel Serverless Function Limit**: Das Hobby-Deployment erlaubt maximal 12 Functions. Keine Maßnahme darf neue `.js`-Dateien direkt in `api/` (außerhalb von `_lib/`) anlegen.
- **Capacitor Mobile Build-Kompatibilität**: Änderungen an `index.html` (z. B. Viewport, CSS-Imports) und `app-root.ts` müssen auf Android (`npm run cap:sync`) lauffähig bleiben.
- **Model Availability (Gemini)**: Bei Umstellung der Default-Modelle muss gewährleistet sein, dass Fallbacks für Regionen/Accounts greifen, in denen neuere Gemini-Modelle abweichende Quotas haben.
- **Offene Frage**: Soll die Ticketverwaltung im Dashboard (`EcDashboard`) künftig mit Benutzer-Filterung (nur eigene Tickets des eingeloggten Technikers) oder im Admin-Modus (alle Tickets) gerendert werden?
