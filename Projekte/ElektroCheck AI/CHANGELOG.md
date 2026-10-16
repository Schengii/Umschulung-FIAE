# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant
- Erweiterung der VDE-Normenprüfung für PV-Anlagen (DIN VDE 0126-23 / DIN EN 62446-1).
- Direkter Cloud-Sync mit externen Handwerkersoftware-Schnittstellen (Open MasterData / IDS Connect).
- Erweiterte Mehrbenutzer-Rechteverwaltung mit rollenbasiertem Mandantenmodell.

---

## [0.2.0] - 2026-10-12

### Hinzugefügt
- **Frontend Ticket-Management & Datenfluss**:
  - `TicketService`: Methoden `getTickets()`, `updateTicket()` und `deleteTicket()` ergänzt und mit Unit-Tests abgesichert.
  - `ec-dashboard`: Live-Synchronisation der Dashboard-KPIs und Tickets mit dem Backend inklusive typisiertem Datenfluss.
  - `DictationController`: Unterstützung für segmentierte Sprachtranskripte zur Vermeidung von Datenverlust bei längeren Diktaten.
- **Umfassende Testsuite (Abdeckung > 85 %)**:
  - Unit-Tests für `PerplexityService` (Suchanfragen, Timeouts, Fehlerpfade).
  - Unit-Tests für `VoiceAssistantService` (Sprachkommandos, Synthese, Spracherkennung).
  - Unit-Tests für `BleMultimeterService` (GATT-Verbindung, Messwert-Parser, Benachrichtigungen).
  - Unit-Tests für `DictationController` und `AudioNoteController` mit Mock-Host.
  - Erweiterte Testsuite für `GeminiAIService` (Wärmebild, Schaltplan, Typenschild, Multimeter-Display).
  - Unit-Tests für `image-resize.ts` (Canvas-Skalierung, EXIF-Handling, Größen-Loop) und `report-actions.ts` (E-Mail-Versand, ZVEH-Export, PDF-Vorschau).
  - E2E-Smoke-Test: Robuster Fallback mit klarer Fehlermeldung (`CHROME_PATH`), falls kein lokales Google Chrome installiert ist.
- **Developer Experience & Dokumentation**:
  - Neue `GEMINI.md` Referenzdokumentation für KI-gestützte Entwicklung mit Gemini und Antigravity.
  - Vollständige Synchronisation von Verzeichnis- und Utility-Strukturen in `README.md` und `CLAUDE.md`.
  - Detaillierte Dokumentation für Port-, Proxy- und Docker Compose-Setup in `README.md`.

### Geändert
- **Sicherheit & Build-Integrität**:
  - `vercel.json`: `buildCommand` führt `npm run build` (inkl. `tsc`) aus, um Typfehler vor dem Deployment abzufangen.
  - Gemini-Default-Modell standardisiert auf `gemini-2.0-flash` mit Fallback auf `gemini-1.5-flash`.
  - `backend/index.js`: Einheitliches Laden von `.env`-Dateien sowohl aus dem Root-Verzeichnis als auch aus `backend/.env`.
  - `package.json`: Sicherheits-Overrides für `lint-staged` und `vitest`/`tinypool` zur Beseitigung bekannter Schwachstellen.
  - `src/app-root.ts`: Vercel Analytics und Speed Insights im Capacitor-Kontext abgesichert.
  - `backend/index.js`: Informativer Startup-Fehlerhinweis bei fehlendem `GEMINI_API_KEY`.
  - `capacitor.config.ts`: Chrome Webview Remote-Debugging für Entwicklungs-Builds aktiviert.
- **Barrierefreiheit & Performance (A11y / Web Vitals)**:
  - `index.html`: Viewport-Zoom für WCAG 1.4.4 Konformität freigegeben (`user-scalable` Einschränkung entfernt).
  - `ec-schematic-analyzer.ts`: Deskriptives `alt`-Attribut für Schaltplan-Bildvorschauen ergänzt (WCAG 1.1.1).
  - `ec-app-header.ts`: `aria-label`-Attribute auf Icon-Buttons für Screenreader ergänzt (WCAG 4.1.2).
  - Font-Laden auf `<link rel="preconnect">` im `<head>` umgestellt, um Render-Blocking zu eliminieren.
  - `vite.config.ts`: Chunk-Size-Limit auf 2000 kB für `vendor-pdfmake` erhöht.
- **Codequalität & Bereinigung**:
  - `@typescript-eslint/no-unused-vars` in `eslint.config.js` aktiviert und ungenutzte Imports bereinigt.
  - `GET /api/tickets`: Antwortstruktur standardisiert (Paginierungs-Header und Envelope-Unterstützung).
  - `backend/package.json`: Redundantes `test:node` Skript entfernt.

---

## [0.1.0] - 2026-10-10

### Hinzugefügt
- **Prüf- und Dokumentations-Core**:
  - DGUV Vorschrift 3 und DIN VDE 0100-600 / 0701-0702 Prüfprotokoll-Erstellung.
  - Dynamischer Diagnose-Wizard (`ec-diagnosis-wizard`) mit mobiler Shell und Tab-Navigation.
  - PDF-Prüfbericht-Generierung mit digitaler Unterschrift (`ec-signature-pad`, `pdfmake`).
  - ZVEH-kompatibler Export und Stromkreisverzeichnis-Verwaltung.
  - Gefährdungsbeurteilungs-Generator (`ec-gbu-generator`) nach BetrSichV.
- **Multimodale KI-Integration (Google Gemini 3.8 / 3.6 Flash)**:
  - Vercel Serverless Proxy unter `/api/gemini/*` zum sicheren Schutz der API-Keys.
  - Wärmebildanalyse (`ec-thermal-analysis`): Hotspot-Erkennung und Risikobewertung.
  - Schaltplan- und Klemmenanalyse (`ec-schematic-analyzer`).
  - Typenschild-OCR und automatisierte Stammdatenerfassung (`scan-type-plate`).
  - Multimeter-Display-Erkennung via Kamera (`scan-multimeter`).
  - Interaktiver KI-Fehlerdiagnose-Chat (`ec-chat-panel`) mit Sprachassistent.
- **Hardware- & Sensoranbindung**:
  - Web Bluetooth API (BLE) Schnittstelle für Digitalmultimeter (`ec-ble-multimeter`).
  - Integrierter QR- & Barcode-Scanner (`html5-qrcode`) zur Betriebsmittelidentifikation.
  - GPS-Standorterfassung für Prüfobjekt-Lokalisierung via Capacitor Geolocation.
- **Backend & Cloud-Infrastruktur**:
  - Vercel Serverless Architecture mit schlanken API-Endpunkten in `/api/`.
  - Lokaler Express-Adapter (`backend/index.js`) für Offline-Entwicklung, Tests und Docker.
  - Magic-Link-Authentifizierung via E-Mail (`/api/auth/*`) ohne Passwortspeicherung.
  - E-Mail-Versand von Prüfberichten über Resend API (`/api/reports/send-email`).
  - Persistentes Ticket- und Protokollmanagement via Upstash Redis REST API.
  - Globales Rate-Limiting und Quotenüberwachung (`GEMINI_DAILY_LIMIT`).
- **Offline & Progressive Web App (PWA)**:
  - Offline-first Speicherung von Protokollen und Entwürfen via IndexedDB.
  - PWA-Support mit Service Worker und Caching über `vite-plugin-pwa`.
  - Native Android-App-Unterstützung über Capacitor (`@capacitor/android`).
- **Qualitätssicherung & DevOps**:
  - GitHub Actions CI-Pipeline mit Linting, Typecheck, Frontend- & Backend-Tests, Coverage und Playwright Smoke-Tests.
  - Dependabot-Konfiguration für automatisierte Dependency-Updates.
  - Husky Pre-Commit-Hooks mit automatisiertem Secret- & `.env`-Scanner (`scripts/check-secrets.mjs`), `lint-staged` und TypeScript-Validierung.
  - Umfassende Security-Tests für Header, Content Security Policy (CSP) und CORS.

---

### Leitfaden für Einträge
Einträge in diesem Changelog werden in folgende Kategorien unterteilt:
- `Hinzugefügt` (Added) für neue Funktionen.
- `Geändert` (Changed) für Änderungen an bestehenden Funktionen.
- `Veraltet` (Deprecated) für bald entfernte Funktionen.
- `Entfernt` (Removed) für nun entfernte Funktionen.
- `Behoben` (Fixed) für Fehlerbehebungen.
- `Sicherheit` (Security) für das Beheben von Sicherheitslücken.
