# Gemini Project Guidelines - FinanzPortfolio CoPilot

> Dieses Dokument definiert Arbeitsrichtlinien, Architekturüberblick und Best Practices für Gemini und Antigravity AI-Assistenten in diesem Repository.

---

## 🎯 Projekt-Mission & Kernfokus

FinanzPortfolio CoPilot ist eine **reine Client-Side Privacy-First Webapplikation (PWA)** für ganzheitliches Finanztracking (Aktien, ETFs, Krypto, Immobilien, Cash, Optionen). Alle Daten verbleiben lokal im Browser und werden im Ruhezustand via Web Crypto API (AES-GCM 256-Bit) verschlüsselt.

---

## 💻 Tech-Stack & Build-Tools

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Testing**: Vitest (`npm run test`)
- **Type Checker**: TypeScript Compiler (`npm run lint` / `tsc --noEmit`)
- **Hosting**: Vercel & GitHub Pages
- **Styling**: Vanilla CSS mit Design-Tokens (`index.css`, `App.css`) – *kein TailwindCSS verwenden, es sei denn der Nutzer fordert es explizit an*.

---

## 📜 Wichtige Skripte

```bash
# Entwicklungsserver starten
npm run dev

# Tests ausführen
npm run test

# TypeScript Validierung
npm run lint

# Production Build erstellen
npm run build
```

> **Wichtig für Windows-Befehle**: PowerShell 5.1 unterstützt kein `&&` zwischen Befehlen. Befehle einzeln oder mit Semikolon `;` ausführen.

---

## 🛡️ Sicherheits- & Architektur-Regeln

1. **Datensouveränität**:
   - Keine unverschlüsselten Übertragungen von Depotwerten oder Transaktionsverläufen.
   - Synchronisation mit WebDAV oder Webhooks MUSS verschlüsselt durch `src/services/cryptoStorage.ts` erfolgen.
2. **State Management**:
   - Zustand wird zentral über `src/context/PortfolioContext.tsx` gehalten und synchronisiert.
   - Auto-Lock Mechanismus sperrt den Tresor nach Inaktivität.
3. **Typensicherheit**:
   - Keine Nutzung von `any`. Sämtliche Schnittstellen sind in `src/types.ts` typisiert.
   - Änderungen an Datenmodellen müssen abwärtskompatibel zu bestehenden Snapshots und Backups sein.
4. **Umgebungsvariablen & Git Pre-Commit Hook**:
   - Alle im Browser benötigten Variablen müssen das Präfix `VITE_` tragen und in `.env.example` dokumentiert sein.
   - Geheimnisse dürfen niemals hardcodiert oder in Git committet werden.
   - Der Pre-Commit Hook (`.githooks/pre-commit`, aktiv via `core.hooksPath`) blockiert `.env`-Dateien und API-Keys vor jedem Commit.

---

## 📁 Wichtige Einstiegspunkte

- **Haupteinstieg**: `src/main.tsx` & `src/App.tsx`
- **Kontext / Krypto-Tresor**: `src/context/PortfolioContext.tsx`
- **Typen**: `src/types.ts`
- **Dienste**: `src/services/`
  - `cryptoStorage.ts`: AES-GCM 256-Bit Verschlüsselung / Entschlüsselung
  - `universalCsvImporter.ts`: CSV Parser (PP, Parqet, IBKR, Trade Republic)
  - `marketDataApi.ts`: FX-Kurse & Krypto-Preise (CoinGecko / Free FX)
  - `cloudSyncService.ts`: WebDAV / Nextcloud Backup
- **Tests**: `src/components/__tests__/`
