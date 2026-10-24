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
      include: ['assets/js/modules/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js'],
      reporter: ['text-summary', 'text'],
      // Ratchet: just below the current value so coverage cannot silently drop; raise it step by step (goal 60 %).
      thresholds: { statements: 45, branches: 45, functions: 45, lines: 45 },
    },
  },
});
