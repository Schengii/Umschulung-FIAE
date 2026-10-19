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
    },
  },
});
