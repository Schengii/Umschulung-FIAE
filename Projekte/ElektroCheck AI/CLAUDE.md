# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Projektübersicht

**ElektroCheck AI** ist eine mobile & Web-fähige Prüf- und Dokumentations-App für Elektroinstallationen und Geräteprüfungen (DGUV V3 / DIN VDE).

- **Frontend**: Lit + TypeScript, Vite, Vaadin Web Components (`@vaadin/*`), PWA
- **Mobile Runtime**: Capacitor (`@capacitor/core`, `@capacitor/android`)
- **Backend**: Vercel-Functions in `api/` (gesamte Fachlogik) + lokaler Express-Adapter `backend/index.js` für Entwicklung, Tests und Docker
- **Styling**: Vanilla CSS, Vaadin Lumo Theme, mobile-first

---

## Befehle

```bash
# Installation
npm ci && cd backend && npm ci && cd ..

# Lokale Entwicklung (Frontend + Backend parallel)
npm run dev

# Nur Backend (Express-Adapter)
cd backend && npm start

# Build + TypeScript-Check
npm run build

# Linting (--max-warnings=0) – src/, api/ und backend/ (Node-Regeln für api/ + backend/ in eslint.config.js)
npm run lint

# Pre-Commit Secret-Scanner (.env & API-Keys blockieren)
npm run check:secrets

# Alle Tests (Frontend + Backend)
npm run test
npm run test:frontend                       # nur Frontend (Vitest, src/**/*.test.ts)
npm run test:coverage                       # Frontend mit Coverage (coverage/, v8)
npm run test:e2e                            # Browser-Smoke-Test (e2e/smoke.mjs, Playwright + Chrome; startet Backend/Vite selbst, KI-Antwort gemockt)
npm run test --prefix backend               # nur Backend (Vitest + Supertest)
# Einzelnen Test ausführen:
cd backend && npx vitest run tests/<dateiname>
npx vitest run src/utils/<dateiname>.test.ts

# Capacitor (Android)
npm run cap:sync   # Web-Assets synchronisieren
npm run cap:open   # Android Studio öffnen
```

---

## Architektur

### App-Flow

`app-root.ts` rendert `ec-login` (wenn Login-Pflicht aktiv), `ec-welcome` (Startseite) oder `ec-diagnosis-wizard` (Haupt-App). Der Diagnosis-Wizard ist die zentrale Shell-Komponente mit Tab-Navigation und registriert alle anderen Feature-Komponenten.

### Komponenten (`src/components/`)

Alle Komponenten sind Lit Web Components mit dem Präfix `ec-`. Die meisten werden von `ec-diagnosis-wizard.ts` gelazy-importiert. Jede Komponente hat ihre CSS in einer gleichnamigen `.css?inline`-Datei.

Gruppen (nicht vollständig, `ls src/components` zeigt den Rest):
- **Shell / Navigation**: `ec-diagnosis-wizard`, `ec-app-header`, `ec-welcome`, `ec-login`, `ec-settings`, `ec-legal-modal`, `ec-gdpr-consent`
- **Tickets / Verlauf**: `ec-dashboard`, `ec-history-list`, `ec-property-selector`
- **Prüfung & Protokoll**: `ec-dguv-form`, `ec-inspection-schedule` (Prüffristen + Erinnerung), `ec-safety-checks`, `ec-signature-pad`, `ec-pdf-preview`, `ec-gbu-generator`
- **Erfassung**: `ec-camera-capture`, `ec-image-annotator`, `ec-ocr-result`, `ec-ble-multimeter`, `ec-multimeter-scan-modal`
- **KI-Analyse**: `ec-thermal-analysis`, `ec-schematic-analyzer`, `ec-chat-panel`, `ec-guided-repair`, `ec-trouble-tree`
- **Rechner / Regeln**: `ec-vde-calculator`, `ec-vde-rules`, `ec-roi-calculator`
- **Sonstiges**: `ec-datasheet-manager`, `ec-repair-checklist`, `ec-spare-part-links`, `ec-wholesaler-finder`

### State (`src/state/`)

Reactive Controller für den Wizard: `history-controller`, `settings-controller`, `dictation-controller`, `audio-note-controller`, `report-controller` (PDF-Vorschau/-Download, ZVEH-Export, Stromkreisverzeichnis, E-Mail-Versand; die Berichtslogik selbst steckt in `utils/report-actions.ts`). Statische Datenbanken in `src/data/` (`repair-database`, `vde-rules-db`).

### Services (`src/services/`)

- `gemini-services.ts` — Gemini über Backend-Proxy (`/api/gemini/*`)
- `perplexity-services.ts` — Perplexity über Backend-Proxy (`/api/perplexity/search`)
- `auth-service.ts` — Magic-Link-Login, Session, Rolle
- `ticket-service.ts` — CRUD für Prüf-Tickets (lokal + Backend-Persistenz)
- `ble-multimeter-service.ts` — Web Bluetooth API
- `voice-assistant-service.ts` — SpeechRecognition API
- `ai-types.ts` — Gemeinsame Typen für KI-Responses (`DiagnosisResult` etc.)

### Backend (`api/` + `backend/index.js`)

**Fachlogik liegt ausschließlich in `api/`** (Vercel-Functions: Validierung, Prompts, Auth, Ticket-Speicher). `backend/index.js` ist nur der lokale Express-Adapter, der dieselben Handler einbindet und Helmet, CORS, Request-IDs, Rate-Limiting und Logging (pino) ergänzt. Neue Endpunkte immer in `api/` anlegen und in `backend/index.js` registrieren – nie nur an einer Stelle.

Endpunkte:
- **Gemini**: `/api/gemini/diagnosis`, `transcribe`, `thermal-analysis`, `schematic-analysis`, `chat`, `scan-type-plate`, `scan-multimeter`
- **Perplexity**: `/api/perplexity/search`
- **Berichte**: `/api/reports/send-email` (Resend; ohne `RESEND_API_KEY` Simulationsmodus)
- **Auth**: `/api/auth/request-link`, `verify`, `me`, `logout` (Magic-Link, Sessions in Redis) — eine Function `api/auth/[action].js`, Logik in `api/_lib/auth-handlers/`
- **Tickets**: `GET/POST /api/tickets`, `PUT/DELETE /api/tickets/:id` — an Besitzer gebunden, Admins sehen alle (`api/_lib/ticket-access.js`). Zugewiesene (`assignedTo`) dürfen nur Felder aus `ASSIGNEE_EDITABLE_FIELDS` (aktuell `status`) ändern; Löschen, Zuweisen und alle anderen Felder nur Besitzer/Admin. `assignedTo` wird beim Anlegen und Ändern als E-Mail geprüft.

**Vercel Hobby erlaubt max. 12 Functions pro Deployment** (jede `.js` in `api/` außerhalb von `_lib/` zählt, aktuell 12 = am Limit; ein Test prüft das). Neue Endpunkte deshalb in bestehende Dispatcher legen, nicht als neue Datei. Jeder Ordner in `api/` braucht einen eigenen Eintrag unter `functions` in `vercel.json` (Muster dürfen sich nicht überlappen).

Gemeinsame Helfer in `api/_lib/`: `auth`, `cors`, `gemini-helper`, `http`, `kv`, `mailer`, `rate-limit`, `schemas` (AJV), `security`, `ticket-store`.

- **Ticket-Speicher**: Upstash Redis (`UPSTASH_REDIS_REST_URL/TOKEN`) primär; lokal JSON-Datei (`TICKETS_FILE`, Standard `backend/data/`), auf Vercel ohne Redis nur nicht-persistenter In-Memory-Speicher
- **Rate-Limiting**: `api/_lib/rate-limit.js` zählt über Upstash (`kvIncr`), wenn konfiguriert, sonst In-Memory pro Instanz (auch bei Redis-Ausfall). Der Express-Adapter setzt davor einen eigenen Limiter (`REDIS_URL` oder InMemory) und `req.skipHandlerRateLimit`.
- **Body-Limit**: Gemini-/E-Mail-Routen 4,5 MB (wie Vercel, `BODY_LIMIT_LARGE`), alle anderen 100 kb; Überschreitung = JSON-413
- **Tageskontingent**: `api/_lib/quota.js` begrenzt die Gemini-Endpunkte pro Nutzer (E-Mail, sonst Rolle/IP) und UTC-Tag über `guard(req, res, { quota: GEMINI_QUOTA })`; `GEMINI_DAILY_LIMIT` (Standard 300, `0` = aus). Neue KI-Endpunkte müssen es mitgeben.
- **Reverse-Proxy**: `TRUST_PROXY` (Anzahl Proxys) setzt `trust proxy` im Express-Adapter; Standard aus, damit `X-Forwarded-For` nicht gefälscht werden kann.
- **Login-Code**: E-Mail-Code max. 5 Fehlversuche je Adresse und 15 Minuten (atomar per `kvIncr`, ein neuer Code setzt den Zähler nicht zurück); der Magic-Link bleibt davon unberührt.
- **Auth-Modi**: `AUTH_ALLOWED_EMAILS` gesetzt = Login-Pflicht; `AUTH_ADMIN_EMAILS` = Admin-Rolle; `APP_ACCESS_TOKEN` = Dienst-Token (`Authorization: Bearer`). In Production ist einer von beiden Pflicht (sonst 503).
- **Frontend-Header**: `vercel.json` setzt CSP, `nosniff`, Referrer- und Permissions-Policy. Neue externe Hosts (CDN, Kartenkacheln, Schriften) dort in der CSP freigeben. Leaflet kommt per unpkg-CDN mit SRI-Hash (`index.html`); bei Versionswechsel Hash neu berechnen.
- **Sicherheit**: Helmet, CORS über `api/_lib/cors.js` (`FRONTEND_URL`, Wildcards möglich; Capacitor-Origins `https://localhost` / `capacitor://localhost` immer erlaubt), AJV-Schemas für alle Requests

### Utilities (`src/utils/`)

- `indexed-db.ts` — Offline-Datenblätter, Offline-Ticket-Warteschlange (`tickets_queue`) und Analyse-Warteschlange (`analysis_queue`), wird beim Start/Online-Wechsel übertragen. `ticket-service.ts` nutzt IndexedDB als einzige Ticket-Queue (LocalStorage nur als Notfall-Fallback und zur Migration alter Einträge); jedes Ticket wird einzeln nach dem Upload entfernt.
- `fetch-timeout.ts` — `fetchWithTimeout` (Standard 30 s, Gemini 65 s, `TimeoutError`); **alle** Backend-Aufrufe im Frontend gehen darüber, kein nacktes `fetch`. Gemini-Retries wiederholen weder Abbruch noch Timeout.
- `location.ts` — Standort mit hartem 12-s-Limit (inkl. Berechtigungsabfrage), sonst hängt die Analyse bei ignorierter Browser-Abfrage
- `pwa-update.ts` — Service-Worker-Registrierung (`registerType: 'prompt'`): Updates erst nach Bestätigung
- `pdf-generator.ts` — PDF-Export (pdfmake)
- `toast.ts` — Toast-Benachrichtigungen + Confirm-Dialoge
- `auth-headers.ts` — Auth-Header für API-Aufrufe
- `error.ts` — Einheitliche und typensichere Extraktion von Fehlermeldungen (`toErrorMessage`)
- `image-resize.ts` — EXIF-gerechte Bildverkleinerung und Canvas-Kompression zur Einhaltung des 4,5 MB Body-Limits
- `distribution-legend-generator.ts` — PDF-Generator für Stromkreisverzeichnisse und Schaltschranklegenden
- `property-manager.ts` — Kunden-, Liegenschafts- und Unterverteiler-Verwaltung mit UUIDs
- `markdown.ts` — Sichere Markdown-Formatierung für KI-Befunde
- Prüf-Logik: `dguv-evaluator`, `basic-dguv-check`, `inspection-schedule`, `gbu-evaluator`, `local-diagnosis`, `fault-tree-engine`
- Berechnung: `vde-cable-sizing`, `roi-calculator`
- Import/Export: `history-export` (CSV mit BOM für Excel), `zveh-export`, `tester-importer`, `report-actions`

Neue Logik in `src/utils/` bekommt eine `*.test.ts` daneben. IDs für Kunden/Objekte/Verteilungen in `property-manager.ts` sind UUID-basiert (nicht `Date.now()`).

---

## Dokumentation (`docs/`)

Enthält Projektdokumentation (`docs/Projektdoku/*.docx`), den ursprünglichen Prompt (`ElektroCheck_AI-prompt.txt`) und Test-PDFs (`docs/test-pdfs/`). Kein Code; technische Referenz bleiben `README.md` und diese Datei.

---

## Deployment (Vercel)

- Projekt `schengii/elektro-check-ai` (**Hobby-Plan**), Production: `https://elektro-check-ai-three.vercel.app`. Push auf `main` deployt automatisch; manuell: `vercel deploy --scope schengii` (Preview) bzw. `--prod`.
- Env-Variablen liegen in Vercel (*Settings → Environment Variables*), Werte sind nicht lesbar. Namen prüfen: `vercel env ls --scope schengii`. Änderungen wirken erst ab dem nächsten Deployment.
- Pflicht in Production: `GEMINI_API_KEY`, `AUTH_ALLOWED_EMAILS` (oder `APP_ACCESS_TOKEN`), `AUTH_ADMIN_EMAILS`, `APP_URL`, `FRONTEND_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `UPSTASH_REDIS_REST_URL/TOKEN`. Ohne `RESEND_API_KEY` antwortet der Login mit 503.
- Resend ohne eigene Domain (`EMAIL_FROM=onboarding@resend.dev`): Mails gehen nur an die Adresse des Resend-Kontos.
- Deployment Protection (Vercel Authentication) muss für Production aus sein.
- Request-Bodies auf Vercel max. 4,5 MB; `maxDuration`: Gemini 60 s, übrige 30 s (`vercel.json`).
- Typische Fehlerursachen: mehr als 12 Functions (Deploy-Fehler „No more than 12 Serverless Functions“), sich überlappende `functions`-Muster in `vercel.json`.

---

## Sicherheits- & Coding-Regeln

- **NIEMALS API-Keys im Frontend**: Alle externen KI-Aufrufe laufen über `api/` (bzw. den Express-Adapter).
- Backend-Konfiguration via `.env` im Projekt-Root (Vorlage: `.env.example`) oder `backend/.env` (Vorlage: `backend/.env.template`). Der Express-Adapter lädt beide Pfade transparent. Wichtigste: `GEMINI_API_KEY`, `PERPLEXITY_API_KEY`, `FRONTEND_URL`, `APP_URL`, `AUTH_*`, `APP_ACCESS_TOKEN`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_*`, `REDIS_URL`, `PORT`. Keine echten Werte committen.
- **Secrets**: Keine Keys in Chat, Commits oder Doku. Der frühere `GEMINI_API_KEY` lag in der Git-Historie und wurde rotiert (alter Key gelöscht).
- **Öffentliches Repo**: Keine Secrets, `.env`-Dateien, Kundendaten oder lokalen Pfade committen (`backend/data/`, `.env*` sind ignoriert). Externe Skripte nur mit SRI und CSP-Eintrag.
- **KI-Befunde** müssen vom Prüfer bestätigt werden (Prüfbestätigung), bevor sie ins Protokoll übernommen werden.
- **TypeScript**: Strikte Typisierung, kein `any`. Interfaces in `src/services/ai-types.ts` pflegen.
- **Lit**: Reaktivität über `@property()` / `@state()`, gekapselte Styles via `css` tagged template oder `css?inline`.
- Vor jedem Commit: `npm run lint` fehlerfrei + Tests dürfen nicht brechen. Der Husky-Pre-Commit-Hook (`.husky/pre-commit`) führt zuerst `node scripts/check-secrets.mjs` aus und **blockiert den Commit hart**, falls `.env`-Dateien oder API-Keys (Gemini, Resend, Upstash, OpenAI etc.) gestagt sind. Anschließend laufen `lint-staged` und `tsc --noEmit`. Die CI (`.github/workflows/ci.yml`, Node 22) führt den Secret-Check, Build, alle Tests, `npm audit` (high, production) und Coverage aus. Zusätzlich läuft `npm run test:e2e` als eigener CI-Job. Dependabot (`.github/dependabot.yml`) meldet wöchentlich Updates für Root und `backend/`.
- **Anweisung für Claude**: Vor dem Erstellen von Commits immer sicherstellen, dass keine `.env`-Dateien oder API-Keys gestagt sind. Bei Bedarf vorab `npm run check:secrets` ausführen. Echte Keys niemals in Source-Dateien hardcoden.
