# CLAUDE.md – Guide für die Zusammenarbeit mit Claude / Claude Code

Willkommen im Repository von **Amazon 2.0**, einem hochmodernen E-Commerce-Prototyp auf Basis von **Vanilla TypeScript**, **Vite** und einem **Custom-CSS-Design-System**.

---

## 🚀 Wichtige Entwicklungsbefehle

```bash
# Entwicklungsserver starten (Vite)
npm run dev

# Tests ausführen (Vitest)
npm run test

# Einzelnen Test ausführen
npx vitest run src/__tests__/store.test.ts

# TypeScript Typ-Check & Produktions-Build
npm run build

# Gebaute Produktionsversion lokal testen
npm run preview

# Sicherheits-Prüfung auf .env-Dateien und API-Keys
npm run check:secrets

# Git Pre-Commit Hooks aktivieren
npm run prepare
```

---

## 📐 Architektur & Technologie-Stack

- **Sprache & Laufzeit**: TypeScript (ES2023 / ESNext), Node.js v20+.
- **Bundler & Build**: [Vite](https://vite.dev) (`vite build` → `dist/`).
- **Styling**: Vanilla CSS mit Design-Tokens in `src/style.css` und modularen Komponenten-Styles. *Kein TailwindCSS!*
- **Unit Testing**: [Vitest](https://vitest.dev) (Dateien unter `src/__tests__/*.test.ts`).
- **State & Storage**:
  - Reaktivität: Custom Event-Emitter & Store-Pattern (`src/store.ts`).
  - Persistenz: `localStorage` und IndexedDB (`src/indexedDB.ts`).
- **Umgebung**: Konfiguriert über `.env` (Client-Variablen müssen mit `VITE_` beginnen).

---

## 📂 Wichtige Verzeichnisse

```
Amazon 2.0/
├── src/
│   ├── components/      # UI-Modale, Widgets, View-Controller
│   ├── types.ts         # Zentrale TypeScript-Interfaces & Typdefinitionen
│   ├── store.ts         # Globaler State Manager & Event Bus
│   ├── catalog.ts       # Produktdaten & Filter-Engine
│   ├── cart.ts          # Warenkorb-Logik & Checkout-State
│   ├── formatters.ts    # Formatierung für Währungen, Datumsangaben etc.
│   ├── main.ts          # Einstiegspunkt & Initialisierung
│   └── __tests__/       # Vitest Unit-Tests (75 Testdateien, >120 Tests)
├── .githooks/           # Versionierte Git Hooks (pre-commit)
├── scripts/             # Build- und Sicherheits-Skripte (pre-commit-check.mjs)
├── public/              # Statische Assets, Icons, Favicon
├── .env.example         # Vorlage für Umgebungsvariablen
├── vercel.json          # Vercel Deployment- und SPA-Routing-Regeln
└── CHANGELOG.md         # Versionshistorie nach Keep a Changelog
```

---

## 🔒 Sicherheits- & Pre-Commit-Hook (Schutz vor Datenlecks)

In diesem Repository ist ein automatischer **Git Pre-Commit Hook** (`.githooks/pre-commit` ausgeführt über `scripts/pre-commit-check.mjs`) aktiv:

1. **Blockierung von `.env`-Dateien**:
   - Jede `.env`, `.env.local`, `.env.production` etc. wird beim Stagen/Commit sofort abgewiesen.
   - **Ausnahme**: Nur `.env.example` darf ins Repository eingecheckt werden.
2. **Blockierung von API-Keys & Tokens**:
   - Neu hinzugefügte Code-Zeilen werden auf API-Keys und Secrets gescannt:
     - Anthropic (`sk-ant-*`), OpenAI (`sk-*`, `sk-proj-*`), Google Gemini (`AIza*`), AWS (`AKIA*`), GitHub PATs (`ghp_*`, `github_pat_*`), Stripe (`sk_*`, `rk_*`), Slack-Tokens, Private-Key-Header (`BEGIN PRIVATE KEY`) und hartkodierte Secret-Zuweisungen.
3. **Claude Handlungsanweisungen**:
   - Trage NIEMALS echte API-Keys oder Zugangsdaten in den Quellcode ein.
   - Für Frontend-Werte immer `import.meta.env.VITE_*` verwenden.
   - Führe vor Commits `npm run check:secrets` aus, um gestagte Änderungen vorab zu prüfen.

---

## 📋 Code-Richtlinien für Claude

1. **Typensicherheit**:
   - Immer strenge TypeScript-Typen verwenden. Niemals `any` nutzen; falls unbekannt, `unknown` mit Typ-Guards verwenden.
   - Neue Typen in `src/types.ts` deklarieren.
2. **Design & Ästhetik**:
   - Moderne, immersive Gestaltung: Glassmorphism (`backdrop-filter`), geschmeidige Übergänge (`transition`), harmonische Farben (HSL/CSS-Variablen).
   - Deutsche Sprache für alle Benutzeroberflächen-Texte und Toasts.
3. **Modulare Struktur**:
   - Pro neues Feature: Ein separates Modul in `src/` oder `src/components/` erstellen und sauber exportieren/importieren.
   - Jedes neue Feature sollte einen Unit-Test in `src/__tests__/` haben.
4. **Verifizierung vor Abschluss**:
   - Immer `npm run test` und `npm run build` ausführen, um sicherzustellen, dass keine Compile- oder Testfehler entstehen.
   - Mit `npm run check:secrets` prüfen, dass keine ungewollten Dateien oder Secrets blockieren.
