# Claude Project Guidelines - FinanzPortfolio CoPilot

> Dieses Dokument definiert die Architektur, Entwicklungsrichtlinien und Befehle für Claude (Claude Code / Claude Desktop).

---

## 🏗️ Projektübersicht & Tech-Stack

- **Framework**: React 19 + Vite 8
- **Sprache**: TypeScript (strict mode, ES2022 / DOM)
- **Styling**: Vanilla CSS mit Design-Tokens & Glassmorphism (`index.css`, `App.css`)
- **Testing**: Vitest (`vitest run`) + React Testing Library + JSDOM
- **Icons & Charts**: `lucide-react`, `recharts`
- **Sicherheit & Krypto**: Native Browser Web Crypto API (AES-GCM 256, PBKDF2, SHA-256)
- **Deployment**: Vercel & GitHub Pages

---

## 🛠️ Wichtige Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Lokaler Vite Dev-Server (standardmäßig Port 5173) |
| `npm run build` | TypeScript-Kompilierung (`tsc -b`) & Vite Production Build (`vite build`) |
| `npm run lint` | TypeScript Type-Check ohne Emit (`tsc --noEmit`) |
| `npm run test` | Alle Vitest Unit- und Integrationstests ausführen (`vitest run`) |
| `npm run preview` | Lokale Vorschau des Production Builds |

> **Hinweis für Windows PowerShell**: Befehle nicht mit `&&` verketten, sondern separat oder mit `;` ausführen.

---

## 📐 Architektur & Verzeichnisstruktur

```
Finanzenportfolio/
├── .github/              # GitHub Actions (CI & GitHub Pages Deployment)
├── public/               # Statische Assets, PWA Manifest, Service Worker
├── src/
│   ├── components/       # UI-Komponenten, Modals, Widgets & __tests__/
│   ├── context/          # PortfolioContext (State Management, Auto-Lock, Crypto)
│   ├── services/         # Externe APIs, Importer (CSV/PDF), WebDAV, Crypto
│   ├── workers/          # Web Workers (z. B. Monte-Carlo Simulation)
│   ├── types.ts          # Zentrale TypeScript Typdefinitionen
│   ├── App.tsx           # Haupt-Dashboard & Tab-Navigation
│   └── main.tsx          # React Root & PWA Registrierung
├── .env.example          # Vorlage für Umgebungsvariablen
├── CHANGELOG.md          # Versionierung nach Keep a Changelog
├── vercel.json           # Vercel SPA Routing & Security Header
└── vite.config.ts        # Vite & PWA Build Konfiguration
```

---

## 🔒 Kernprinzipien & Sicherheitsregeln

1. **100% Client-Side Privacy**:
   - Es dürfen NIEMALS sensible Portfolio-Daten, Transaktionen oder PINs unverschlüsselt an externe Server gesendet werden.
   - Synchronisation (WebDAV / Webhooks) MUSS stets über den AES-GCM 256-Bit Tresor (`cryptoStorage.ts`) verschlüsselt sein.
2. **🛡️ Git Pre-Commit Hook (Secret & .env Schutz)**:
   - Im Projekt ist ein automatischer Pre-Commit Hook in `.githooks/pre-commit` eingerichtet und in Git aktiviert (`git config core.hooksPath .githooks`).
   - Der Hook blockiert automatisch:
     - Jegliche `.env`-Dateien (`.env`, `.env.local`, `.env.production` usw., außer `.env.example`).
     - Echte API-Keys, Private Keys (`-----BEGIN ... PRIVATE KEY-----`), GitHub/AWS/OpenAI/Anthropic Tokens (`sk-...`, `ghp_...`, `AKIA...`).
   - **Regel für Claude**: Committe NIEMALS echte Keys oder `.env`-Dateien. Nutze immer Platzhalter in `.env.example`.
   - Bei Neuinstallation wird der Hook automatisch über `npm run prepare` (in `package.json`) scharf geschaltet.
3. **Keine ungetypten Daten**:
   - Vermeide `any`. Verwende strikte Typen aus `src/types.ts`.
   - Bei neuen Portfolio-Feldern stets Abwärtskompatibilität für bestehende JSON-Snapshots sicherstellen (optionale Felder / Migrations-Fallbacks).
4. **Performance & Asynchronität**:
   - Schwere mathematische Berechnungen (z. B. Monte-Carlo 500+ Pfade) gehören in Web Workers oder asynchrone Batches, um den Main UI Thread nicht zu blockieren.
5. **Steuerlogik (DACH)**:
   - Berechnungen für Abgeltungsteuer (25% + Soli 5,5% = 26,375%), Sparerpauschbetrag (1.000 € / 2.000 €), Teilfreistellungen (Aktienfonds 30%) und Spekulationsfristen (§ 23 EStG) müssen fachlich exakt bleiben.

---

## 🧪 Testing & Qualitätsprüfung

Vor jedem Commit oder Pull Request:
1. `npm run lint` muss fehlerfrei durchlaufen (0 Type-Errors).
2. `npm run test` muss alle Tests bestehen.
3. Pre-Commit Hook führt vor jedem Commit den Secret-Check automatisch aus.
4. Bei neuen Features: Entsprechende Tests in `src/components/__tests__/` ergänzen.
