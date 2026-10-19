const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['assets/js/modules/**/*.test.js', 'scripts/**/*.test.js'],
    exclude: ['Projekte/**', 'node_modules/**'],
    environment: 'node',
    isolate: false,
    coverage: {
      provider: 'v8',
      include: ['assets/js/modules/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js'],
      reporter: ['text-summary', 'text'],
    },
  },
});
