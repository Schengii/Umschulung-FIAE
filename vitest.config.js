const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['assets/js/modules/**/*.test.js'],
    exclude: ['Projekte/**', 'node_modules/**'],
    environment: 'node',
  },
});
