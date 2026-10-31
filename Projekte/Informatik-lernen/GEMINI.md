# GEMINI.md

This file provides guidance to Google Gemini and Antigravity IDE when working with code in this repository.

# Informatik-lernen (IT-DevGame)

Entwickler- und KI-Leitfaden für das Projekt **Informatik-lernen (IT-DevGame)** – Interaktive Lernplattform und IHK-Prüfungsvorbereitung für IT-Berufe (Fachinformatiker Anwendungsentwicklung / Systemintegration / Daten- und Prozessanalyse / Digitale Vernetzung, IT-Systemelektroniker, Kaufleute für IT-Systemmanagement).

---

## 🛠️ Tech-Stack & Kerntechnologien

- **Frontend**: React 19 (Hooks, Context, Zustand Store, React.lazy Code-Splitting)
- **Bundler & Build**: Vite 8 mit Rolldown-Engine & `@vite-pwa` Service Worker
- **Styling**: Vanilla CSS Design-System (`src/styles/global.css`), CSS Custom Properties, Glassmorphism, Dark Mode & WCAG 2.1 A11y (Reduced Motion)
- **Icons**: `lucide-react`
- **State Management**: Zustand (`src/store/useStore.js`) mit LocalStorage-Persistenz & BroadcastChannel Multi-Tab Synchronisation
- **Testing**: Vitest 5 mit `@testing-library/react` und jsdom
- **Linting**: Oxlint (`oxlint src`) für ultraschnelle statische Analyse
- **Type Checking**: TypeScript (`tsc --noEmit`) mit selektivem `// @ts-check` und JSDoc

---

## 🚀 Häufige Entwickler-Befehle

Voraussetzung: Node >=22.19.0 (`engines` in `package.json`).

```bash
# Entwicklungsserver starten (Standard-Port http://localhost:5173)
npm run dev

# Vollständige Test-Suite ausführen
npm test

# Test-Coverage-Report erzeugen
npm run test:coverage

# Linter im CI-Modus (bricht bei jeder Warnung ab)
npm run lint:ci

# Typprüfung der @ts-check markierten Dateien
npm run typecheck

# Produktions-Build erstellen & PWA generieren
npm run build

# Bundle-Size Regression-Check gegen Budgets prüfen (< 105 KB Shell)
npm run size

# End-to-End Tests gegen den Produktions-Build (Playwright)
npm run e2e
```

**CI-Pipeline-Reihenfolge**:
`npm run lint:ci` → `npm run typecheck` → `npm test` → `npm run test:coverage` → `npm run build` → `npm run size` → `npm run e2e`

---

## 📐 Architektur- & Design-Prinzipien

1. **Entkopplung von Engine & UI**:
   - Rechnungen, Protokollsimulationen und Algorithmen gehören in `src/utils/*Engine.js`.
   - Jede Engine wird durch eine isolierte Unit-Test-Datei (`src/utils/*Engine.test.js`) abgedeckt.
   - UI-Komponenten in `src/components/Content/*Lab.jsx` konsumieren die Engines und vergeben XP via Prop `onXPGain` bzw. `awardXP`.

2. **Lab-Registrierung & Code-Splitting**:
   - Neue Labs werden in `src/data/labRegistry.js` registriert (`tabs`, `load`, optional `xp`).
   - Große Komponenten werden per `React.lazy()` dynamisch nachgeladen.

3. **Code-Sandbox für Nutzercode**:
   - Nutzercode wird **niemals** per `eval` oder `new Function` im UI-Hauptthread ausgeführt.
   - Ausführung erfolgt über `runInSandbox` / `runTestCasesInSandbox` (`src/utils/sandboxRunner.js`) im Web Worker mit 3s Timeout.

4. **Persistenz & UI-Präferenzen**:
   - Spielfortschritt (XP, Level, Badges) wird in `userState` (`useStore.js`) gespeichert.
   - Barrierefreiheits- und Anzeige-Einstellungen (Theme, Schriftgröße, Dyslexie, Reduced Motion) liegen in `informatik_game_ui_prefs_v1` (`src/utils/uiPreferences.js`).

5. **Barrierefreiheit (WCAG 2.1 AA)**:
   - Alle interaktiven Elemente müssen über Tastatur bedienbar und mit `aria-label` / `aria-describedby` versehen sein.
   - Unbeschriftete Controls werden zur Laufzeit durch `a11yAutoLabel.js` angereichert.
   - Automatische axe-core Tests laufen über alle Labs in `allLabsA11y.test.jsx`.

6. **README & CHANGELOG Maintenance**:
   - Wann immer Dateien hinzugefügt, verändert oder entfernt werden, müssen sowohl `README.md` als auch `CHANGELOG.md` aktualisiert werden.
