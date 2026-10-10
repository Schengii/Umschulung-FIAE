// @vitest-environment jsdom
//
// A11y-Regressionstest für ALLE Lab-Komponenten (Content/*.jsx) mit axe-core.
// Geprüft werden die in jsdom zuverlässig auswertbaren "Name/Rolle/Wert"-Regeln
// (Beschriftung von Buttons, Formularfeldern, Links, Bildern, gültiges ARIA).
// Kontrast-/Layout-Regeln brauchen einen echten Browser und laufen in
// e2e/accessibility.spec.js.
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { writeFileSync } from 'node:fs';
import { applyAutoLabels } from '../utils/a11yAutoLabel';

afterEach(() => cleanup());

const labModules = import.meta.glob(['./Content/*.jsx', '!./Content/*.test.jsx'], { eager: true });

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

const KNOWN_UNSUITABLE_FOR_JSDOM_SMOKE = new Set([
  './Content/PythonWasmLab.jsx', // lädt Pyodide per echtem Netzwerk-Fetch
  './Content/MonacoStudioLab.jsx', // benötigt Monaco Web Worker (nicht in jsdom verfügbar)
  './Content/CodeExecutionDebuggerLab.jsx', // nutzt denselben Monaco-Editor-Worker-Unterbau
  './Content/WasmCompilerPlaygroundLab.jsx', // kompiliert echtes WASM zur Laufzeit
  './Content/WasmRustLab.jsx' // kompiliert echtes WASM zur Laufzeit
]);

const RULES = ['button-name', 'label', 'select-name', 'link-name', 'image-alt', 'input-image-alt',
  'aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr', 'aria-allowed-attr', 'aria-roles', 'duplicate-id-aria'];

describe('Alle Labs: axe-core A11y (Name/Rolle/Wert)', () => {
  const entries = Object.entries(labModules).filter(([p]) => !KNOWN_UNSUITABLE_FOR_JSDOM_SMOKE.has(p));
  const report = {};

  for (const [path, mod] of entries) {
    const name = path.replace('./Content/', '');
    it(`${name} hat keine axe-Verstöße`, async () => {
      const { container } = render(React.createElement(mod.default, genericNoopProps));
      // Entspricht dem Laufzeit-Sicherheitsnetz in App.jsx (observeAutoLabels)
      applyAutoLabels(container);
      const result = await axe.run(container, { runOnly: { type: 'rule', values: RULES }, iframes: false });
      const v = result.violations.map((x) => ({ id: x.id, n: x.nodes.length, html: x.nodes.slice(0, 3).map((nd) => nd.html.slice(0, 160)) }));
      if (v.length) report[name] = v;
      if (process.env.A11Y_REPORT) return;
      expect(v, JSON.stringify(v)).toEqual([]);
    }, 30000);
  }

  it('Report', () => {
    if (process.env.A11Y_REPORT) writeFileSync(process.env.A11Y_REPORT, JSON.stringify(report, null, 1));
    expect(true).toBe(true);
  });
});
