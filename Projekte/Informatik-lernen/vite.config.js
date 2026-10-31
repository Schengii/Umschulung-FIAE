import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// `vite preview` (und damit die E2E-Tests) liefert dieselben Header wie Vercel
// aus (CSP, HSTS, ...), sonst bleiben CSP-Verstöße bis zum Deployment
// unsichtbar. Die `source`-Muster aus vercel.json werden als RegExp gelesen;
// später passende Regeln überschreiben frühere (wie bei Vercel, siehe Muster
// mit Lookahead für den Sandbox-Worker, damit sich CSPs nie überlagern).
function vercelHeadersForPreview() {
  const { headers = [] } = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
  const rules = headers.map(({ source, headers: list }) => ({ pattern: new RegExp(`^${source}$`), list }))
  return {
    name: 'vercel-headers-for-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '/').split('?')[0]
        for (const { pattern, list } of rules) {
          if (pattern.test(path)) list.forEach(({ key, value }) => res.setHeader(key, value))
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Nur Theme + Utilities (kein Preflight-Reset), damit global.css unverändert bleibt.
    tailwindcss(),
    vercelHeadersForPreview(),
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
        // Große, nur bei Bedarf geladene Chunks (PDF, SQL, Charts, Sentry,
        // Monaco) aus dem Precache ausschließen; sie werden per runtimeCaching
        // beim ersten Zugriff gecacht und danach per StaleWhileRevalidate
        // bedient. Der Precache (gemessen 29.10.2026: ca. 4,2 MB) enthält
        // danach App-Shell und alle Labs, damit die Labs offline laufen.
        globIgnores: [
          'assets/vendor-pdf-*.js',
          'assets/vendor-sql-*.js',
          // alasql-Worker (bündelt alasql selbst, nur in den SQL-Labs)
          'assets/sql.worker-*.js',
          'assets/vendor-charts-*.js',
          // canvg/core-js (jsPDF-SVG-Export) und Sentry (nur mit DSN), siehe manualChunks
          'assets/vendor-canvg-*.js',
          'assets/vendor-sentry-*.js',
          // Monaco (nur im Monaco-Lab): Editor-Kern, Worker, Sprachmodus und CSS.
          // "jsonMode" enthält beim Rolldown-Splitting den Großteil des Kerns (1,2 MB).
          'assets/editor.api-*.js',
          'assets/jsonMode-*',
          'assets/editor-*.css',
          'assets/editor.worker-*.js',
          'assets/json.worker-*.js'
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(vendor-(pdf|sql|charts|canvg|sentry)|sql\.worker|editor\.api|editor\.worker|json\.worker|jsonMode|editor)-[^/]+\.(js|css)$/,
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
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
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
          // Feste Namen für Chunks, die nur bei Bedarf laden und deshalb
          // nicht in den Precache gehören (globIgnores oben): canvg/core-js
          // lädt jsPDF erst beim SVG-Export, Sentry nur mit gesetzter DSN.
          if (/node_modules\/(canvg|core-js|rgbcolor|stackblur-canvas|svg-pathdata)\//.test(id)) {
            return 'vendor-canvg';
          }
          if (id.includes('node_modules/@sentry/') || id.includes('node_modules/@sentry-internal/')) {
            return 'vendor-sentry';
          }
        }
      }
    }
  },
  test: {
    environment: 'node',
    testTimeout: 15000,
    // Gemessen 29.10.2026: isolate:false ist nicht schneller (116–117 s gegen
    // 113–121 s) und ließ in 2 von 3 Läufen 3–6 Tests sporadisch scheitern
    // (Zustand zwischen Testdateien) – daher Isolation pro Datei.
    isolate: true,
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
        // Globale Untergrenze (Ist-Stand 29.10.2026: 63,79 / 55,37 / 48,59 / 65,36 %): verhindert,
        // dass neue Komponenten/Utilities die Gesamtabdeckung still absenken.
        statements: 63,
        branches: 54.5,
        functions: 47.5,
        lines: 64.5,
        'src/utils/**/*Engine.js': {
          lines: 85,
          branches: 70,
          functions: 90
        }
      }
    }
  }
})
