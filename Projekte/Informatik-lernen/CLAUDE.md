# CLAUDE.md - Informatik-lernen (IT-DevGame)

Entwickler- und KI-Leitfaden für das Projekt **Informatik-lernen (IT-DevGame)** – Die interaktive Lernplattform und Prüfungsvorbereitung für Fachinformatiker (FIAE, FISI, IT-SE) nach IHK-Standard.

---

## 🛠️ Tech-Stack & Kerntechnologien

- **Frontend-Framework**: React 19 (Hooks, Context, Zustand Store, React.lazy Code-Splitting)
- **Bundler & Build**: Vite 7 mit Rolldown-Engine & `@vite-pwa` Service Worker
- **Styling**: Vanilla CSS Design-System mit CSS-Variablen (`src/styles/global.css`), Glassmorphism, Dark Mode & WCAG 2.1 A11y (Reduced Motion)
- **Icons**: `lucide-react`
- **State Management**: Zustand (`src/store/useStore.js`) mit LocalStorage Persistenz & XP/Level/Streak Gamification
- **Testing**: Vitest 4 mit `@testing-library/react` und jsdom
- **Linting**: Oxlint (`oxlint src`) für ultraschnelle statische Codeanalyse

---

## 🚀 Häufige Entwickler-Befehle

```bash
# Entwicklungsserver starten (Standard-Port http://localhost:5173)
npm run dev

# Vollständige Test-Suite ausführen (100 Test-Dateien, 349 Tests)
npm test

# Einzelnen Test ausführen
npx vitest run src/utils/nwaEngine.test.js

# Linter ausführen (Oxlint)
npm run lint

# Produktions-Build erstellen & PWA Chunks generieren
npm run build

# Produktions-Build lokal vorab testen
npm run preview
```

---

## 📐 Architektur- & Design-Prinzipien

1. **Prüfungs- & Praxisrelevanz (IHK)**:
   - Alle Algorithmen, kaufmännischen Formeln und Netzwerk-Berechnungen (z. B. NWA, RAID, VLSM, Deckungsbeitrag, Optimaler Bestellmenge) müssen nach offiziellen IHK-Prüfungsrichtlinien validiert sein.
2. **Entkopplung von Engine & UI**:
   - Reine Berechnungs- und Simulationslogik gehört nach `src/utils/*Engine.js` und wird mit isolierten Unit-Tests (`src/utils/*Engine.test.js`) abgesichert.
   - UI-Komponenten in `src/components/Content/*.jsx` konsumieren die Engines und binden XP-Rewards ein.
3. **Performance & Code-Splitting**:
   - Alle großen Laboratorien und Simulatoren müssen in `src/App.jsx` per `React.lazy()` dynamisch importiert werden.
4. **Barrierefreiheit (Accessibility & A11y)**:
   - Respektiere Nutzer-Präferenzen für reduzierte Bewegung (`prefers-reduced-motion` und `body.reduced-motion`).
   - Keine Viewport-Zoom-Blocker (`user-scalable=no` verboten).
5. **README-Wartungsregel (`AGENTS.md`)**:
   - Wann immer Dateien hinzugefügt, verändert oder entfernt werden, muss `README.md` aktualisiert und die Änderungshistorie fortgeführt werden.
