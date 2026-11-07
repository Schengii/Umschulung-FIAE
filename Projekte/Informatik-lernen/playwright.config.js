import { defineConfig, devices } from '@playwright/test';

// End-to-End Smoke-Tests für kritische User-Flows (Onboarding, Navigation,
// XP-Vergabe), die die Unit-/Komponenten-Tests bewusst NICHT abdecken: dort
// wird jede Komponente isoliert gerendert, hier läuft die echte, gebaute App
// im echten Browser inklusive Routing, Zustand-Persistenz und PWA-Shell.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Auf 2 Worker begrenzt (lokal & CI), um Heap-OOM und Timeouts bei paralleler
  // Vite-Preview- und Service-Worker-Last zu verhindern (M02).
  workers: process.env.CI ? 2 : 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    // Testet den echten Produktions-Build (npm run preview), nicht den
    // Dev-Server - so werden Build-/Code-Splitting-Regressionen mit erfasst.
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    // Nie unbemerkt fremde/veraltete Server auf Port 4173 wiederverwenden,
    // um Fehlalarme durch Port-Kollisionen anderer Node-Prozesse zu verhindern (M01).
    reuseExistingServer: false,
    timeout: 60_000
  }
});
