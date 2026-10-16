import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdfmake')) {
            return 'vendor-pdfmake';
          }
          if (id.includes('@vaadin')) {
            return 'vendor-vaadin';
          }
        },
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Das große PDF-Bundle erst beim ersten Export laden und dann cachen (spart Daten beim Erststart)
        globIgnores: ['**/vendor-pdfmake-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/vendor-pdfmake-.*\.js$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'pdfmake-cache', expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      },
      manifest: {
        name: 'ElectroCheck AI',
        short_name: 'ElectroCheck',
        description: 'KI-gestützte Fehlerdiagnose für Elektroinstallationen nach DGUV V3 / DIN VDE',
        theme_color: '#005fcc',
        background_color: '#090d16',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'de',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});