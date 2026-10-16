# GEMINI.md

Dieses Dokument bietet Leitlinien und Projektkontexte für Gemini und Antigravity bei der Arbeit im Repository **ElektroCheck AI**.

---

## Projektübersicht

**ElektroCheck AI** ist eine mobile & Web-fähige Prüf- und Dokumentations-App für Elektroinstallationen und Betriebsmittelprüfungen nach DGUV Vorschrift 3 und DIN VDE (0100-600, 0701-0702).

- **Frontend**: Lit + TypeScript, Vite, Vaadin Web Components (`@vaadin/*`), PWA (`vite-plugin-pwa`)
- **Mobile Runtime**: Capacitor (`@capacitor/core`, `@capacitor/android`)
- **Backend**: Vercel Functions in `api/` (vollständige Fachlogik) + lokaler Express-Adapter `backend/index.js` (Port 3000) für Entwicklung, Tests und Docker
- **Styling**: Vanilla CSS, Vaadin Lumo Theme, mobile-first
- **KI-Modelle**: Google Gemini (`gemini-2.0-flash` als Standard, `gemini-1.5-flash` als Fallback) via serverseitigem Proxy `/api/gemini/*`

---

## Wichtigste Befehle

```bash
# Installation
npm ci && cd backend && npm ci && cd ..

# Lokale Entwicklung (Frontend :5173 + Backend :3000 parallel)
npm run dev

# Nur Backend (Express-Adapter)
cd backend && npm start

# Build + TypeScript-Check
npm run build

# Linting (--max-warnings=0) für src/, api/ und backend/
npm run lint

# Pre-Commit Secret-Scanner (.env & API-Keys prüfen)
npm run check:secrets

# Alle Tests (Frontend + Backend)
npm run test
npm run test:frontend                       # nur Frontend (Vitest, src/**/*.test.ts)
npm run test:coverage                       # Frontend mit Coverage (coverage/, v8)
npm run test:e2e                            # Browser-Smoke-Test (Playwright + Chrome, e2e/smoke.mjs)
npm run test --prefix backend               # nur Backend (Vitest + Supertest, tests/*.test.js)

# Einzelne Tests ausführen
cd backend && npx vitest run tests/<dateiname>.test.js
npx vitest run src/utils/<dateiname>.test.ts

# Capacitor (Android)
npm run cap:sync   # Web-Assets synchronisieren
npm run cap:open   # Android Studio öffnen
```

---

## Architektur & Verzeichnisstruktur

```
ElektroCheck AI/
├── api/                      # Vercel Functions – einzige Backend-Implementierung
│   ├── _lib/                 # Gemeinsame Backend-Helfer (Auth, CORS, Gemini, Rate-Limit, KV, Schemas, Ticket-Store)
│   ├── gemini/               # diagnosis, scan-type-plate, scan-multimeter, transcribe, thermal-analysis, schematic-analysis, chat
│   ├── auth/[action].js      # Dispatcher für request-link, verify, me, logout (Vercel Hobby: max. 12 Functions)
│   ├── perplexity/search.js  # Perplexity AI Proxy
│   ├── reports/send-email.js # Resend E-Mail-Versand
│   └── tickets/              # index.js (GET/POST), [id].js (PUT/DELETE)
├── src/                      # Frontend (Lit + TypeScript)
│   ├── app-root.ts           # Root-Komponente & Router
│   ├── components/           # Lit Web Components (ec-*)
│   ├── services/             # API Clients (gemini, perplexity, auth, ticket, ble, voice)
│   ├── state/                # Reactive Controller (history, settings, dictation, audio-note, report)
│   └── utils/                # Kernlogik, Validierung, Berechnungen und Exporte (error, distribution-legend, image-resize, etc.)
├── backend/                  # Express-Adapter um /api (Dev, Tests, Docker): Helmet, Rate-Limit, Body-Limit 4,5 MB
├── capacitor.config.ts       # Capacitor Konfiguration (Android/iOS)
├── vite.config.ts            # Vite + PWA + API-Proxy (:5173 -> :3000)
└── vercel.json               # SPA-Rewrite, Functions maxDuration & Headers
```

---

## Sicherheits- & Qualitätsregeln

1. **Keine API-Keys im Frontend**: Sämtliche externen KI- und Drittanbieter-Aufrufe müssen über `api/` bzw. den Backend-Proxy laufen.
2. **Keine Secrets oder .env-Dateien committen**: Der Pre-Commit Hook (`scripts/check-secrets.mjs`) blockiert Commits mit sensiblen Daten.
3. **Vercel Hobby-Limit beachten**: Maximal 12 Serverless Functions in `api/` (außerhalb `_lib/`). Neue Endpunkte in bestehende Dispatcher einbetten.
4. **Typensicherheit**: Strikter TypeScript-Modus ohne `any`.
5. **Codequalität**: `npm run lint` muss mit 0 Warnungen (`--max-warnings=0`) und `npm run build` fehlerfrei durchlaufen.
6. **Tests**: Neue Logik in `src/utils/` oder `src/services/` immer mit Unit-Tests (`*.test.ts`) absichern.
