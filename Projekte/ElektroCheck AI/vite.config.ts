import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'ElectroCheck AI - Diagnose',
        short_name: 'ElectroCheck',
        description: 'KI-gestützte Fehlerdiagnose für die Instandhaltung',
        theme_color: '#005fcc',
        background_color: '#ffffff',
        display: 'standalone',
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