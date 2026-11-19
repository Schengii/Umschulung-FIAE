const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['assets/js/modules/**/*.test.js', 'scripts/**/*.test.js'],
    exclude: ['Projekte/**', 'node_modules/**'],
    environment: 'node',
    // Every file gets its own environment: the happy-dom tests register document listeners that
    // would otherwise leak into the next file of the same worker.
    isolate: true,
    coverage: {
      provider: 'v8',
      include: ['assets/js/modules/**/*.js', 'assets/js/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', 'assets/js/projects_data.js'],
      reporter: ['text-summary', 'text'],
      // Ratchet (ADR 0015): just below the current value so coverage cannot silently drop; raise it
      // when the actual value stays well above (2026-11-19: 96 / 84 / 98 / 98 %).
      thresholds: {
        'assets/js/modules/**': { statements: 92, branches: 80, functions: 94, lines: 94 },
        // Seiten-Scripts (Plan 6.1): eigene, niedrigere Schwelle, nach ADR 0015 hochziehen.
        'assets/js/*.js': { statements: 0.5, branches: 0.5, functions: 0.1, lines: 0.5 },
      },
    },
  },
});
