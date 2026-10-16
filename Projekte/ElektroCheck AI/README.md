# ElectroCheck AI

KI-gestützte Prüf- und Dokumentations-App für Elektroinstallationen nach **DGUV V3 / DIN VDE**.

**Live:** https://elektro-check-ai-three.vercel.app

---

## Features

- **KI-Fehlerdiagnose** via Google Gemini (Bild + Beschreibung mit Bounding-Boxen)
- **Reparatur-Co-Pilot (Interaktiver KI-Chat)** – Kontextbezogene Fachberatung, Reparaturtipps und VDE-Schutzmaßnahmen direkt zum Befund
- **Typenschild-OCR & Multimeter-OCR** – automatisches Auslesen von Typenschildern und Multimeter-Displays
- **Thermografie-Analyse** – Wärmebilder auswerten per KI mit Hotspot-Erkennung
- **DGUV V3 Prüfprotokoll** – Prüfungen nach **VDE 0701-0702** (Geräteprüfung: R_PE, R_ISO, I_PE, I_B) sowie **DIN VDE 0100-600 / DIN VDE 0105-100** (ortsfeste Anlagen & Verteilungen: RCD t_a, RCD I_ΔN, Schleifenimpedanz Z_s), digitale Unterschrift & PDF-Export
- **Messgeräte-Import (Benning, GMC Profitest, Fluke)** – Einlesen von Prüfgeräte-Exportdateien (CSV/TXT) zur direkten Übernahme aller Messwerte in das DGUV-Prüfprotokoll
- **E-Mail-Direktversand von Prüfberichten** – Automatische Generierung und Zustellung von PDF-Prüfprotokollen direkt an Kunden und Auftraggeber via Resend / SMTP
- **Liegenschafts- & Kundenhierarchie (PropertyManager)** – Strukturierte Verwaltung nach *Kunde → Liegenschaft/Gebäude → Unterverteiler/Stromkreis*
- **VDE-Rechner** & VDE-Regelwerk – Spannungsfall nach DIN VDE 0100-520 und Schleifenimpedanz Z_s
- **Schaltplan-Analyse** – KI erkennt Bauteile, Klemmen und Verdrahtungsfehler nach DIN EN 61082 / VDE 0100
- **GBU-Generator** – Gefährdungsbeurteilung nach ASR
- **BLE-Multimeter-Integration** – Messwerte via Web Bluetooth direkt übernehmen
- **QR- & Barcode-Scanner** – Betriebsmittel & Anlagen schnell per Kamera identifizieren
- **Ausfallsicherer Offline-Modus** – Speicherung in IndexedDB & LocalStorage; automatische Hintergrund-Synchronisation bei Netzverbindung
- **Ticket-System** – Wartungstickets mit Redis-Persistenz (Upstash) und lokalem Fallback; Tickets gehören dem Ersteller, Zugewiesene dürfen nur den Status ändern
- **Login per Magic-Link** – Anmeldung per E-Mail-Link oder 6-stelligem Code, Rollen (Mitglied/Admin)
- **ZVEH- & E-CHECK-Export** – Direkter Datenexport als CSV oder XML für Handwerkersoftware (z.B. KWP, Streit V.1, Kplus)
- **Schaltschrank-Legenden-Generator** – Druckfertiges Stromkreisverzeichnis für Verteilerschranktüren nach DIN EN 61439 / DIN VDE 0100-510 als Querformat-PDF
- **Freihand-Sprachausgabe (TTS) & Sprachsteuerung** – Vorlesen und sprachgesteuertes Durchschalten der Reparaturschritte ("Weiter", "Zurück", "Vorlesen", "Stopp")
- **PWA & Mobile Ready** – installierbar auf iOS, Android und Desktop (inklusive Taschenlampen-Steuerung in dunklen Schaltschränken)
- **Perplexity Web-Recherche** – VDE-Normen live online nachschlagen

---

## Plattformen

| Plattform | Unterstützung |
|-----------|--------------|
| Web (Chrome, Firefox, Edge) | ✅ Vollständig |
| iOS Safari (PWA) | ✅ Als Web-App installierbar |
| Android (PWA / Capacitor) | ✅ Vollständig |
| Android nativ (APK via Capacitor) | ✅ `npm run cap:sync && npm run cap:open` |
| iOS nativ (Xcode via Capacitor) | ⚙️ `@capacitor/ios` hinzufügen |

---

## Lokale Entwicklung

```bash
# Dependencies installieren
npm ci
cd backend && npm ci && cd ..

# Frontend + Backend starten
npm run dev
```

Vite läuft auf `http://localhost:5173`, das Express-Backend auf `http://localhost:3000`.

### Port- & Proxy-Konfiguration

- **Vite Dev-Proxy (`vite.config.ts`):** Leitet alle Frontend-Anfragen an `/api/*` transparent an den lokalen Express-Server (`http://localhost:3000`) weiter (`changeOrigin: true`). Dadurch sind im lokalen Entwicklungsbetrieb keine CORS-Ausnahmen im Browser notwendig.
- **Backend-Ports & .env-Laden:** Der Express-Server liest den Port über `PORT=3000` (Standard) und lädt Umgebungsvariablen sowohl aus `.env` im Projekt-Root als auch aus `backend/.env`. Das Default-KI-Modell ist `gemini-2.0-flash` mit automatischem Fallback auf `gemini-1.5-flash` bei Nichtverfügbarkeit.
- **Docker Compose (`docker-compose.yml`):**
  - `frontend`: Exponiert Port `5173` (Nginx-Container Port 80) für das statische Web-Bundle.
  - `backend`: Exponiert Port `3000` für die Express-API, angebunden an `FRONTEND_URL=http://localhost:5173` und mit persistentem Ticket-Volume (`tickets-data:/data`).
  - `redis`: Exponiert Port `6379` für persistentes Rate-Limiting und Sessions (`REDIS_URL=redis://redis:6379`).

---

## Umgebungsvariablen

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...        # optional
UPSTASH_REDIS_REST_URL=...    # Ticket-Persistenz, Login-Sessions, instanzübergreifendes Rate-Limit
UPSTASH_REDIS_REST_TOKEN=...
AUTH_ALLOWED_EMAILS=@firma.de # Login-Pflicht: erlaubte Adressen/Domains (kommagetrennt)
AUTH_ADMIN_EMAILS=chef@firma.de
APP_URL=https://...           # Basis-URL für den Link in der Anmelde-Mail
FRONTEND_URL=https://...      # erlaubte CORS-Origins (kommagetrennt, "*" als Platzhalter)
RESEND_API_KEY=...            # Mailversand (Anmelde-Link, Berichte)
EMAIL_FROM=...                # Absender; ohne eigene Domain: onboarding@resend.dev
APP_ACCESS_TOKEN=...          # optional: Dienst-Token für Skripte
GEMINI_DAILY_LIMIT=300        # optional: KI-Aufrufe pro Nutzer und UTC-Tag (0 = unbegrenzt)
TRUST_PROXY=1                 # optional: Anzahl vertrauter Reverse-Proxys (Docker/nginx), damit Rate-Limits die echte Client-IP sehen
```

Alle Variablen mit Erklärung stehen in `backend/.env.template`.

### Login (Magic-Link)

Mit `AUTH_ALLOWED_EMAILS` ist die gesamte `/api` nur noch angemeldet erreichbar. Ablauf: E-Mail eingeben →
Link bzw. 6-stelliger Code per Mail (15 Minuten gültig, einmalig) → Session (30 Tage, serverseitig widerrufbar).
Die Antwort ist für freigegebene und nicht freigegebene Adressen identisch (keine Auskunft, wer Zugang hat);
pro Adresse sind 3 Anfragen je 15 Minuten erlaubt. Tickets gehören dem Ersteller, Admins sehen alle, und über
`PUT /api/tickets/:id {"assignedTo": "kollege@firma.de"}` lässt sich ein Ticket zuweisen. Lokal ohne `RESEND_API_KEY`
zeigt die Login-Maske einen Direktlink (nur außerhalb von Production). `APP_ACCESS_TOKEN` bleibt als Dienst-Token für Skripte nutzbar.

Zugewiesene Personen dürfen am Ticket nur den `status` ändern (`ASSIGNEE_EDITABLE_FIELDS` in `api/_lib/ticket-access.js`);
Löschen, Zuweisen und alle anderen Felder bleiben dem Ersteller und Admins vorbehalten. Für den Code-Login gelten höchstens
5 Fehlversuche je Adresse und 15 Minuten (atomar gezählt); der Magic-Link funktioniert währenddessen weiter.

### Vercel (Production)

Projekt: `schengii/elektro-check-ai` (Hobby-Plan), Domain `elektro-check-ai-three.vercel.app`. In Vercel unter
*Settings → Environment Variables* hinterlegt: `GEMINI_API_KEY`, `AUTH_ALLOWED_EMAILS`, `AUTH_ADMIN_EMAILS`, `APP_URL`,
`FRONTEND_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
Neue oder geänderte Variablen wirken erst ab dem nächsten Deployment.

Zu beachten:
- **Hobby erlaubt max. 12 Functions pro Deployment.** Aktuell sind es 12 (`api/` außerhalb von `_lib/`); ein Test schützt davor,
  das Limit zu überschreiten. Neue Endpunkte gehören in bestehende Dispatcher.
- **Deployment Protection** (Vercel Authentication) muss für Production aus sein, sonst erreichen weder Nutzer noch die Capacitor-App die API.
- **Resend ohne eigene Domain:** Mit `onboarding@resend.dev` darf Resend nur an die Adresse des Resend-Kontos senden. Weitere Nutzer
  brauchen eine verifizierte Domain.
- **Rate-Limit:** Mit Upstash zählt das Limit instanzübergreifend, ohne Redis nur pro Funktionsinstanz.
- **Request-Bodies** sind auf Vercel hart auf 4,5 MB begrenzt (Bilder/Audio/PDFs als Base64); Sprachnotizen stoppen deshalb nach 5 Minuten.
- `maxDuration` in `vercel.json`: Gemini-Functions 60 s, alle anderen 30 s. Jeder `api/`-Ordner braucht einen eigenen Eintrag
  (Muster dürfen sich nicht überlappen).

---

## Build & Deploy

```bash
# Produktions-Build
npm run build

# Linting (src/, api/ und backend/)
npm run lint

# Tests (Frontend + Backend)
npm run test
npm run test:frontend             # nur Frontend (Vitest, src/**/*.test.ts)
npm run test:coverage             # Frontend mit Coverage-Report (coverage/, v8)
npm run test:e2e                  # Browser-Smoke-Test (Chrome + Playwright, startet Backend und Vite selbst)
npm run test --prefix backend     # nur Backend (Vitest + Supertest, tests/*.test.js)
```

Das Projekt deployed automatisch bei jedem Push auf `main` via GitHub → Vercel (Production). Ein Preview-Deploy ohne Push geht mit `vercel deploy --scope schengii`, ein Production-Deploy mit `--prod`.

Das Frontend erhält über `vercel.json` Sicherheits-Header (Content-Security-Policy, `nosniff`, Referrer-/Permissions-Policy). Neue externe Hosts (CDNs, Kartenkacheln, Schriften) müssen dort in der CSP freigegeben werden. Leaflet wird per CDN mit Subresource Integrity geladen. Neue App-Versionen werden erst nach Bestätigung eingespielt, damit keine Eingaben mitten in einer Prüfung verloren gehen.

Abhängigkeiten werden wöchentlich per Dependabot geprüft (`.github/dependabot.yml`).

Der Browser-Smoke-Test (`e2e/smoke.mjs`) prüft Einwilligung, Sicherheits-Check, alle Tabs, Diagnose (KI-Antwort gemockt), Prüfbestätigung, PDF-Vorschau, Downloads, E-Mail-Versand im Simulationsmodus und Ticket-Anlage. Er braucht ein installiertes Google Chrome (oder `CHROME_PATH`) und läuft in der CI als eigener Job.

Vor jedem Commit laufen `lint-staged` und `tsc --noEmit` (Husky), die CI (`.github/workflows/ci.yml`) prüft zusätzlich Build, alle Tests und `npm audit`.

---

## Architektur

```
ElektroCheck AI/
├── api/                      # Vercel Functions – einzige Backend-Implementierung
│   ├── _lib/
│   │   ├── http.js           # guard(): CORS, Rate-Limit, Anmeldung, Methodenprüfung
│   │   ├── security.js       # authenticate() (Session oder APP_ACCESS_TOKEN), HTML-Escaping, E-Mail-Prüfung
│   │   ├── auth.js           # Magic-Link/Code, Sessions, Freigabeliste, Rollen
│   │   ├── auth-handlers/    # Logik von request-link, verify, me, logout (vom Dispatcher aufgerufen)
│   │   ├── cors.js           # CORS inkl. Capacitor-Origins, Preflight
│   │   ├── rate-limit.js     # Rate-Limit: Upstash-Zähler, sonst In-Memory
│   │   ├── kv.js             # Key-Value mit TTL (Upstash Redis / In-Memory)
│   │   ├── mailer.js         # Resend-Versand (Simulationsmodus außerhalb von Production)
│   │   ├── ticket-access.js  # Lese-/Änderungsrechte (Besitzer, Zugewiesene, Admins)
│   │   ├── gemini-helper.js  # Gemini-Client, Bild-Validierung, JSON-Antworten
│   │   ├── schemas.js        # JSON-Schemas der KI-Antworten
│   │   └── ticket-store.js   # Upstash Redis / Datei / In-Memory
│   ├── gemini/               # diagnosis, scan-type-plate, scan-multimeter, transcribe,
│   │                         # thermal-analysis, schematic-analysis, chat
│   ├── auth/[action].js      # ein Dispatcher für request-link, verify, me, logout (Hobby: max. 12 Functions)
│   ├── perplexity/search.js
│   ├── reports/send-email.js
│   └── tickets/              # index.js (GET/POST), [id].js (PUT/DELETE)
├── src/                      # Frontend (Lit + TypeScript)
│   ├── app-root.ts
│   ├── components/           # Web Components (ec-*)
│   ├── services/             # API Clients (Gemini, Perplexity, Auth, Tickets, BLE, Voice)
│   ├── state/                # Controller für Verlauf, Einstellungen, Diktat, Sprachnotizen, Berichte
│   └── utils/                # Kernlogik, Validierung und Exporte:
│       ├── error.ts          # Sichere Extraktion von Fehlermeldungen (toErrorMessage)
│       ├── distribution-legend-generator.ts # PDF-Stromkreisverzeichnisse & Schaltschranklegenden
│       ├── image-resize.ts   # EXIF-gerechte Bildverkleinerung und Canvas-Kompression
│       ├── property-manager.ts # Liegenschafts-, Kunden- und Verteilerverwaltung (UUID-basiert)
│       ├── fetch-timeout.ts  # fetchWithTimeout mit konfigurierbaren Limits
│       ├── indexed-db.ts     # Offline-Queue und lokaler Cache
│       ├── pdf-generator.ts  # DGUV/VDE-Prüfprotokolle (pdfmake)
│       ├── report-actions.ts # PDF-Vorschau, ZVEH-Export, Legenden & E-Mail-Versand
│       ├── toast.ts          # Feedback & Confirmations
│       ├── dguv-evaluator.ts, basic-dguv-check.ts, gbu-evaluator.ts # Prüflogik
│       └── vde-cable-sizing.ts, roi-calculator.ts # Berechnungsmodule
├── backend/                  # Express-Adapter um /api (Dev, Tests, Docker): Helmet, Request-IDs, Rate-Limit, Body-Limit 4,5 MB
├── capacitor.config.ts       # Capacitor (Android/iOS)
├── vite.config.ts            # Vite + PWA + API-Proxy (:5173 -> :3000)
└── vercel.json               # SPA-Rewrite und maxDuration je api/-Ordner
```

---

## Android APK bauen

```bash
# 1. Production-Build
NODE_ENV=production npm run build

# 2. Capacitor synchronisieren
npm run cap:sync

# 3. Android Studio öffnen
npm run cap:open
# → In Android Studio: Build → Generate Signed APK
```

---

## iOS (PWA)

Auf iOS kann die App als PWA installiert werden:
1. https://elektro-check-ai-three.vercel.app in Safari öffnen
2. Teilen-Button → "Zum Home-Bildschirm"

Für eine native iOS-App (IPA):
```bash
npm install @capacitor/ios
npx cap add ios
npm run cap:sync
npx cap open ios
```

---

## Technologie-Stack

- **Frontend**: Lit 3, TypeScript, Vite 5, Vaadin Web Components, PWA
- **Backend**: Vercel Serverless Functions (Node.js)
- **KI**: Google Gemini 2.0 Flash
- **Persistenz**: Upstash Redis (Tickets, Sessions, Rate-Limit-Zähler)
- **Mail**: Resend (Login-Link, Prüfberichte)
- **Mobile**: Capacitor 8 (Android / iOS)
- **PDF**: pdfmake
