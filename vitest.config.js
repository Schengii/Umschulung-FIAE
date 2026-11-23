const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['assets/js/modules/**/*.test.js', 'scripts/**/*.test.js'],
    exclude: ['Projekte/**', 'node_modules/**'],
    environment: 'node',
    // Every file gets its own environment: the happy-dom tests register document listeners that
    // would otherwise leak into the next file of the same worker.
    isolate: true,
    // happy-dom meldet jede iframe-Navigation als DOMException im Testlog; die Setup-Datei verwirft genau diese
    // Meldung (Plan 6.7), alles andere bleibt sichtbar.
    setupFiles: ['scripts/test-support/quiet-happy-dom.js'],
    coverage: {
      provider: 'v8',
      include: ['assets/js/modules/**/*.js', 'assets/js/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', 'assets/js/projects_data.js'],
      reporter: ['text-summary', 'text'],
      // Ratchet (ADR 0015): just below the current value so coverage cannot silently drop; raise it
      // when the actual value stays well above (2026-11-23: 96.5 / 81.3 / 97.5 / 98.2 %).
      thresholds: {
        'assets/js/modules/**': { statements: 95, branches: 80, functions: 96, lines: 97 },
        // Seiten-Scripts (Plan 6.1, 3.4): eigene, niedrigere Schwelle, nach ADR 0015 hochziehen
        // (2026-11-23: 89.5 / 74.2 / 86.9 / 90.3 %). Ohne Tests bleiben dialog.js, main.js und die Datenschalen.
        'assets/js/*.js': { statements: 88, branches: 72, functions: 85, lines: 88 },
      },
    },
  },
});
