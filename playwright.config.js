const { defineConfig, devices } = require('@playwright/test');

// E2E_ROOT=dist serves the minified production build (what Vercel deploys) instead of the
// source tree, on its own port so a running dev server is never reused by accident.
const serveRoot = process.env.E2E_ROOT || '.';
const port = serveRoot === '.' ? 8080 : 8081;
const baseURL = `http://127.0.0.1:${port}`;

module.exports = defineConfig({
  testDir: './assets/js/modules',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // The site follows the system colour scheme on a first visit. Pin it, so every spec
    // starts from the dark theme regardless of the machine it runs on; specs that care
    // about the light theme emulate it explicitly.
    colorScheme: 'dark',
  },
  webServer: {
    command: `npx http-server ${serveRoot} -p ${port} -c-1`,
    url: baseURL,
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
