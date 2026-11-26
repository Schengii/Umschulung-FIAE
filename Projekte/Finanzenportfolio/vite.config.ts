import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { CSP_META } from './csp.ts'

// CSP als <meta> nur im Produktions-Build (Dev-Server/HMR braucht Inline-Skripte)
const cspMetaPlugin = (): Plugin => ({
  name: 'inject-csp-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_META }, injectTo: 'head-prepend' }
  ]
})

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), cspMetaPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/pdfjs-dist')) return 'pdfjs';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/react')) return 'vendor';
        }
      }
    }
  }
})


