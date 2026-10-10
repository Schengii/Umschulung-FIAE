# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Informatik-lernen (IT-DevGame)

Entwickler- und KI-Leitfaden für das Projekt **Informatik-lernen (IT-DevGame)** – Die interaktive Lernplattform und Prüfungsvorbereitung für Fachinformatiker (FIAE, FISI, IT-SE) nach IHK-Standard.

---

## 🛠️ Tech-Stack & Kerntechnologien

- **Frontend-Framework**: React 19 (Hooks, Context, Zustand Store, React.lazy Code-Splitting)
- **Bundler & Build**: Vite 8 mit Rolldown-Engine & `@vite-pwa` Service Worker
- **Styling**: Vanilla CSS Design-System mit CSS-Variablen (`src/styles/global.css`), Glassmorphism, Dark Mode & WCAG 2.1 A11y (Reduced Motion)
- **Icons**: `lucide-react`
- **State Management**: Zustand (`src/store/useStore.js`) mit LocalStorage Persistenz & XP/Level/Streak Gamification
- **Testing**: Vitest 5 (Coverage-Schwellen für Engines in `vite.config.js`) mit `@testing-library/react` und jsdom
- **Linting**: Oxlint (`oxlint src`) für ultraschnelle statische Codeanalyse

---

## 🚀 Häufige Entwickler-Befehle

Voraussetzung: Node >=22.19.0 (`engines` in package.json). CI-Workflow: `.github/workflows/ci.yml`.

```bash
# Entwicklungsserver starten (Standard-Port http://localhost:5173)
npm run dev

# Vollständige Test-Suite ausführen (Anzahl wächst laufend – exakte Zahl steht in README.md)
npm test

# Test-Coverage-Report erzeugen (Statements/Branches/Functions/Lines)
npm run test:coverage

# Bundle-Size-Regression gegen definierte Chunk-Limits prüfen (nach npm run build)
npm run size

# End-to-End Smoke-Tests gegen den Produktions-Build (Playwright) –
# startet selbst `npm run preview` auf Port 4173, daher vorher `npm run build`
npm run e2e

# Typprüfung der mit `// @ts-check` markierten Dateien
npm run typecheck

# Einzelnen Test ausführen (Vitest-Default-Umgebung ist `node`; DOM-Tests setzen `// @vitest-environment jsdom` pro Datei)
npx vitest run src/utils/nwaEngine.test.js
npx vitest run -t "Testname"   # nur Tests mit passendem Namen

# Linter ausführen (Oxlint); CI nutzt `npm run lint:ci` (--deny-warnings)
npm run lint

# Produktions-Build erstellen & PWA Chunks generieren
npm run build

# Produktions-Build lokal vorab testen
npm run preview
```

CI-Reihenfolge: `lint:ci` → `typecheck` → `test` → `test:coverage` → `build` → `size` → `e2e`.

---

## 📐 Architektur- & Design-Prinzipien

1. **Prüfungs- & Praxisrelevanz (IHK)**:
   - Alle Algorithmen, kaufmännischen Formeln und Netzwerk-Berechnungen (z. B. NWA, RAID, VLSM, Deckungsbeitrag, Optimaler Bestellmenge) müssen nach offiziellen IHK-Prüfungsrichtlinien validiert sein.
2. **Entkopplung von Engine & UI**:
   - Reine Berechnungs- und Simulationslogik gehört nach `src/utils/*Engine.js` und wird mit isolierten Unit-Tests (`src/utils/*Engine.test.js`) abgesichert.
   - UI-Komponenten in `src/components/Content/*.jsx` konsumieren die Engines und binden XP-Rewards ein.
3. **Performance & Code-Splitting**:
   - Alle Labs und Simulatoren werden per `React.lazy()` dynamisch geladen.
   - Ein Lab (ein Tab → eine Komponente) wird ausschließlich als Eintrag in `src/data/labRegistry.js` ergänzt (siehe Checkliste unten) – weder als `lazy`-Import noch als Block in `App.jsx`. Nur Tabs, die mehr als ein Lab rendern oder eigenen lokalen State brauchen (Dashboard, Wissen, Games, Lückentext, Videos, Projekte), bleiben eigene Blöcke in `App.jsx`.
4. **Barrierefreiheit (Accessibility & A11y)**:
   - Respektiere Nutzer-Präferenzen für reduzierte Bewegung (`prefers-reduced-motion` und `body.reduced-motion`).
   - Keine Viewport-Zoom-Blocker (`user-scalable=no` verboten).
5. **README- & CHANGELOG-Wartungsregel** (auch `_Projektuebersicht.md` wird bei neuen Labs gepflegt, siehe Git-Historie):
   - Wann immer Dateien hinzugefügt, verändert oder entfernt werden, müssen `README.md` und `CHANGELOG.md` aktualisiert und die Änderungshistorie fortgeführt werden.
6. **Fehlerisolation (Error Boundaries)**:
   - Der gesamte Tab-Content-Bereich in `App.jsx` sowie jedes Modal in `ModalContainer.jsx` sind bereits mit `src/components/ErrorBoundary.jsx` umschlossen. Neue Labs benötigen dafür KEINE eigene Boundary — ein Absturz in einem Lab zeigt automatisch eine lokale Fallback-UI statt die gesamte App zum Absturz zu bringen.
7. **Smoke-Test-Abdeckung für neue Labs**:
   - `src/components/allLabsSmoke.test.jsx` rendert automatisch JEDE Datei in `src/components/Content/*.jsx` (via `import.meta.glob`) mit generischen No-Op-Props. Ein neues Lab wird also ohne weiteres Zutun mitgetestet — nur bei echten Sonderfällen (z. B. Komponenten, die zwingend echtes Netzwerk/WebAssembly/Web-Worker beim Mount brauchen) muss es explizit in `KNOWN_UNSUITABLE_FOR_JSDOM_SMOKE` eingetragen und dort begründet werden.
8. **Graduelle Typisierung sicherheitskritischer Engines**:
   - `checkJs` ist projektweit deaktiviert (`tsconfig.json`), sodass bestehender Code nicht plötzlich hunderte Typfehler wirft. Eine Datei wird gezielt typgeprüft, indem `// @ts-check` als erste Zeile ergänzt und die Funktionen mit JSDoc (`@param`/`@returns`/`@typedef`) versehen werden — siehe `src/utils/ihkGradeCalculations.js`, `src/utils/nwaEngine.js` und `src/utils/storage.js` als Referenzmuster. `npm run typecheck` (`tsc --noEmit`) prüft nur die so markierten Dateien und läuft in CI. Neue oder geänderte Engines mit realem Fehlerrisiko (Noten-/Geld-/Sicherheitsberechnungen) sollten nach diesem Muster typisiert werden.
9. **Nutzercode nur in der Sandbox ausführen**:
   - Vom Nutzer eingegebener oder importierter JavaScript-Code wird nie per `new Function`/`eval` im Haupt-Thread ausgeführt, sondern über `runInSandbox` bzw. `runTestCasesInSandbox` aus `src/utils/sandboxRunner.js` (Web Worker mit Zeitlimit, ohne Zugriff auf DOM, Speicher und Netzwerk). In Unit-Tests gibt es keinen Worker: dort `{ createWorker: createInlineSandboxWorker }` aus `src/utils/sandboxTestUtils.js` übergeben; das echte Worker-Verhalten prüft `e2e/sandbox-and-settings.spec.js`.
10. **Anzeige-Einstellungen**:
   - Theme und Barrierefreiheits-Optionen liegen getrennt vom Spielstand unter `informatik_game_ui_prefs_v1` (`src/utils/uiPreferences.js`). Neue Einstellungen dieser Art im Store über `setUiPreference` setzen, damit sie einen Reload überstehen.

---

## 🧩 Checkliste: Neues Lab anlegen

Ein Lab besteht aus vier zusammenhängenden Stellen (sonst ist es nicht erreichbar/auffindbar):

1. `src/utils/<name>Engine.js` + `<name>Engine.test.js` – reine Logik.
2. `src/components/Content/<Name>Lab.jsx` – UI; XP über Prop (`onXPGain` / `onRewardXP`), in `App.jsx` an `awardXP(xp, badgeId)` gebunden.
3. Ein Eintrag in `src/data/labRegistry.js` (`tabs`, `load`, optional `xp`) – kein Eingriff in `App.jsx` nötig. In `activeLabElement` (`App.jsx`) stehen nur noch die wenigen Tabs, die App-Zustand brauchen (Navigation, `userState`, Fehlerjournal). Jede Tab-ID darf nur einmal vorkommen – `buildRegistryIndex` wirft sonst, `App.routing.test.jsx` rendert jede Registry-Tab-ID.
4. `src/data/labModulesData.js` – Eintrag in `LAB_MODULES` (`id` = Tab-ID; Quelle für `LabsDashboard` und `CommandPaletteModal`). Neue Einträge stehen am Listenanfang.

Abkürzung: `npm run new-lab -- <PascalName> "<Titel>" [category] [difficulty]` (`scripts/new-lab.js`) legt Engine, Test, Komponente und die Einträge aus 3. und 4. an. `docs/LABS.md` wird mit `npm run docs:labs` aus `LAB_MODULES` erzeugt (die README enthält keine Lab-Liste mehr).

Danach: `CHANGELOG.md` + `_Projektuebersicht.md` (und bei Bedarf `README.md`) aktualisieren; Smoke-Test (`allLabsSmoke.test.jsx`) und A11y-Test (`allLabsA11y.test.jsx`, axe-core) greifen automatisch. `labModulesData.test.js` schlägt fehl, wenn ein `LAB_MODULES`-Eintrag keine Route hat.

Prüfungsdrills: Fragen im Format `{ id, frage, optionen, korrektIndex, erklaerung }` in der Engine ablegen (IDs global eindeutig), in `src/data/drillQuestions.js` eintragen und im Lab per `IhkDrillPanel` (mit XP) oder `Shared/LabDrillSection` (ohne XP) einbinden – falsche Antworten landen dann automatisch im Fehlerjournal. Lab-Fortschritt (`labProgress`) wird in `App.jsx` automatisch erfasst, kein Eingriff im Lab nötig.

Achtung: Beide Glob-Tests laden `Content/*.jsx` und schließen `*.test.jsx` aus – Komponententests für Labs dürfen daneben liegen (`Content/XyzLab.test.jsx`, Muster: `TcpStateMachineLab.test.jsx`). Wiederverwendbare Bausteine, die kein eigenständiges Lab sind (z. B. `IhkDrillPanel` für den IHK-Multiple-Choice-Drill), gehören nach `src/components/Shared/`, nicht nach `Content/`.

## 📦 Bundle & PWA

`vite.config.js` splittet Vendor-Chunks (`vendor-react/ui/charts/pdf/sql`); `size-limit` in `package.json` prüft deren gzip-Größe nach dem Build. Die großen Chunks (pdf/sql/charts) sind vom Workbox-Precache ausgenommen und werden per Runtime-Cache geladen – neue schwere Abhängigkeiten dürfen diese Limits nicht reißen.

## ♿ A11y-Sicherheitsnetz, Streak & Fehlerjournal

- `src/utils/a11yAutoLabel.js` vergibt zur Laufzeit (MutationObserver in `App.jsx` auf `<main>`) `aria-label` an unbeschriftete Controls. Das ist ein Fallback: Neue Labs sollten trotzdem echte `<label>`/`aria-label` verwenden. Der axe-Test wendet dieselbe Funktion an.
- Streak/Tageswechsel: Datumsschlüssel sind **lokale Zeit** (`toLocalDateKey`), nie `toISOString()`. Streak-Logik: `updateStreak` in `storage.js` (wird von `recordDailyActivity` aufgerufen).
- Fehlerjournal: `mistakeJournalEngine.js` (rein) → Store-Aktion `recordMistakeResults` → `ExamSimulator` (`onRecordResults`) und `MistakeReviewWidget` (Dashboard, lazy). Frage-IDs in `examData.js` müssen eindeutig bleiben (Test `contentIntegrity.test.js`).
- `index.html`: Das Skeleton-Skript muss **hinter** `<div id="root">` stehen, sonst bleibt das Vollbild-Skeleton für immer sichtbar (E2E-Test in `smoke.spec.js`).
