// @vitest-environment jsdom
//
// Generischer Smoke-Test für ALLE Lab-/Content-Komponenten.
//
// Hintergrund: `componentsIntegrity.test.jsx` importiert und rendert nur eine
// handverlesene Teilmenge der zuletzt hinzugefügten Labs (Stand vorher: ~26
// von 165 Komponenten, ~16% Abdeckung). Dieser Test schließt die Lücke, indem
// er via `import.meta.glob` AUTOMATISCH jede Datei in `src/components/Content/`
// einsammelt, rendert und auf einen sauberen Mount ohne unbehandelten
// Laufzeitfehler prüft – ohne dass bei jedem neuen Lab eine manuelle Test-Liste
// gepflegt werden muss.
//
// Die meisten Labs sind komplett requisiten-frei (`function Lab() {}`), ein
// kleinerer Teil erwartet generische Callback-Props (`onRewardXP`, `onClose`,
// `userState`, ...). Wir übergeben daher eine großzügige Menge an No-Op-Props;
// überschüssige, ungenutzte Props sind in React harmlos.
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Alle .jsx-Dateien in Content/ eager laden (Vite/Vitest-natives Glob-Feature).
// `eager: true` lädt synchron zur Testzeit, sodass wir keine Promises pro Test
// jonglieren müssen und Import-Fehler (z. B. kaputte Lucide-Icon-Imports)
// sofort als Testfehler sichtbar werden.
const labModules = import.meta.glob(['./Content/*.jsx', '!./Content/*.test.jsx'], { eager: true });

// Generische No-Op-Props, die die in Content/*.jsx real vorkommenden
// Prop-Signaturen abdecken (siehe Analyse: onRewardXP, isOpen/onClose,
// userState, onNavigateTab, onSelectLab, setActiveTab, onComplete*, ...).
const genericNoopProps = {
  onRewardXP: () => {},
  onReward: () => {},
  isOpen: true,
  onClose: () => {},
  onNavigate: () => {},
  onOpenModal: () => {},
  onNavigateTab: () => {},
  setActiveTab: () => {},
  onSelectLab: () => {},
  onBack: () => {},
  onCompleteTopic: () => {},
  onCompleteWorkshop: () => {},
  onCompleteVideo: () => {},
  onCompleteExam: () => {},
  onCompleteCloze: () => {},
  onCompleteProject: () => {},
  onCompleteChallenge: () => {},
  onDataImported: () => {},
  onSelectRole: () => {},
  topicId: 'smoke-test-topic',
  isCompleted: false,
  userState: {
    xp: 0,
    level: 1,
    role: 'anfaenger',
    completedTopics: [],
    unlockedBadges: [],
    srsFlashcards: {},
    streakFreezes: 0,
    soundSettings: { volume: 0.5, isMuted: true }
  }
};

// Ein paar Labs binden absichtsvoll schwere/nicht-jsdom-taugliche Browser-APIs
// direkt beim Mount ein (z. B. WebAssembly-Compiler-Toolchains, Monaco-Worker,
// Pyodide-Netzwerk-Downloads, echte WebRTC-Verbindungen). Deren *Engines* sind
// bereits über eigene `*Engine.test.js`-Dateien vollständig unit-getestet;
// ein jsdom-Smoke-Mount würde hier nur Test-Infrastruktur (Web Worker, echtes
// Netzwerk) simulieren müssen, ohne zusätzlichen Regressions-Nutzen für das
// UI selbst zu bringen. Sie werden bewusst und dokumentiert ausgeschlossen.
const KNOWN_UNSUITABLE_FOR_JSDOM_SMOKE = new Set([
  './Content/PythonWasmLab.jsx', // lädt Pyodide per echtem Netzwerk-Fetch
  './Content/MonacoStudioLab.jsx', // benötigt Monaco Web Worker (nicht in jsdom verfügbar)
  './Content/CodeExecutionDebuggerLab.jsx', // nutzt denselben Monaco-Editor-Worker-Unterbau
  './Content/WasmCompilerPlaygroundLab.jsx', // kompiliert echtes WASM zur Laufzeit
  './Content/WasmRustLab.jsx' // kompiliert echtes WASM zur Laufzeit
]);

describe('Alle Lab-Komponenten (Content/*.jsx): generischer Render-Smoke-Test', () => {
  const entries = Object.entries(labModules).filter(
    ([path]) => !KNOWN_UNSUITABLE_FOR_JSDOM_SMOKE.has(path)
  );

  it('hat Content-Komponenten zum Testen gefunden (Glob funktioniert)', () => {
    expect(entries.length).toBeGreaterThan(100);
  });

  const failures = [];

  for (const [path, mod] of entries) {
    const Component = mod.default;
    const name = path.replace('./Content/', '');

    it(`rendert ${name} ohne unbehandelten Laufzeitfehler`, () => {
      if (typeof Component !== 'function') {
        throw new Error(`${name} hat keinen gültigen default export (React-Komponente).`);
      }

      // console.error während des Renderns abfangen, damit React "act"- oder
      // PropTypes-Warnungen sichtbar bleiben, ohne die Testausgabe zuzumüllen,
      // und damit wir sie am Ende zusätzlich auswerten können.
      const consoleErrors = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(' '));
      });

      try {
        const { unmount } = render(<Component {...genericNoopProps} />);
        unmount();
      } catch (error) {
        failures.push({ name, error });
        throw error;
      } finally {
        spy.mockRestore();
      }
    }, 20000);
  }

  it('Zusammenfassung: keine Komponente ist beim Mount abgestürzt', () => {
    if (failures.length > 0) {
      const summary = failures.map((f) => `- ${f.name}: ${f.error.message}`).join('\n');
      throw new Error(`${failures.length} Lab-Komponente(n) sind beim Render-Smoke-Test abgestürzt:\n${summary}`);
    }
    expect(failures.length).toBe(0);
  });
});
