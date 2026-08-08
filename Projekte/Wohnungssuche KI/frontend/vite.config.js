import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // Im Netzwerk erreichbar (für Android über WLAN)
    port: 5222,
    strictPort: true
  },
  build: {
    outDir: 'dist'   // Ausgabeordner für Capacitor
  }
})
