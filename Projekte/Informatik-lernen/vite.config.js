import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Nur Theme + Utilities (kein Preflight-Reset), damit global.css unverändert bleibt.
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Die Registrierung übernimmt src/main.jsx selbst (dort hängt auch das
      // `pwa-update-available`-Event für den Update-Toast dran) - ohne diesen
      // Schalter würde das Plugin zusätzlich ein eigenes registerSW.js
      // ausliefern und denselben Service Worker ein zweites Mal registrieren.
      injectRegister: false,
      devOptions: {
        enabled: true
      },
      workbox: {
        // Große Lab-Chunks (vendor-pdf, vendor-sql, vendor-charts, index) aus
        // dem Precache ausschließen – reduziert SW-Download von ~4,6 MB auf
        // ~1–1,5 MB. Sie werden per runtimeCaching beim ersten Zugriff
        // gecacht und danach per StaleWhileRevalidate bedient.
        globIgnores: [
          'assets/vendor-pdf-*.js',
          'assets/vendor-sql-*.js',
          'assets/vendor-charts-*.js'
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/vendor-(pdf|sql|charts)-[^/]+\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vendor-large-chunks',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      },
      manifest: {
        name: 'IT-DevGame',
        short_name: 'ITGame',
        description: 'Interaktives Informatik-Spiel & Lernplattform',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    cssMinify: true,
    // Budgets werden per gzip geprüft (size-limit) – alle Chunks liegen dort
    // im Rahmen. Die Standard-500-kB-Warnung bezieht sich auf unkomprimierte
    // Größe und ist hier ein False Positive.
    chunkSizeWarningLimit: 650,
    modulePreload: {
      resolveDependencies: (filename, deps) =>
        deps.filter((dep) => !/vendor-(charts|pdf|sql)-/.test(dep))
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/zustand/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/lucide-react/') || id.includes('node_modules/canvas-confetti/')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/jspdf/') || id.includes('node_modules/html2canvas/')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/alasql/')) {
            return 'vendor-sql';
          }
        }
      }
    }
  },
  test: {
    environment: 'node',
    // e2e/ enthält Playwright-Specs (eigener Testrunner, eigenes `test`-API) -
    // ohne diesen Ausschluss würde Vitests Standard-Glob (`*.spec.js`) sie
    // fälschlich einsammeln und mit der falschen Test-API ausführen wollen.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Nur tatsächlich getesteten Anwendungscode berücksichtigen - Config-,
      // Build- und Testdateien selbst verzerren sonst die Prozentzahl.
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/main.jsx',
        'src/assets/**'
      ],
      // Engines enthalten die Prüfungs-, Geld- und Sicherheitsberechnungen des
      // Projekts (siehe CLAUDE.md Punkt 8) - hier gilt ein hartes Mindestmaß,
      // knapp unter dem aktuellen Ist-Stand, damit neue Engines nicht
      // ungetestet einsickern können, ohne bestehende Ausreißer zu blockieren.
      thresholds: {
        // Globale Untergrenze (Ist-Stand 07.10.2026: 61,9 / 53,6 / 47,1 / 63,5 %): verhindert,
        // dass neue Komponenten/Utilities die Gesamtabdeckung still absenken.
        statements: 60,
        branches: 52,
        functions: 45,
        lines: 62,
        'src/utils/**/*Engine.js': {
          lines: 85,
          branches: 70,
          functions: 90
        }
      }
    }
  }
})
