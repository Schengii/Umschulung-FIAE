import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
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
  }
})
