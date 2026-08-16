import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'assets',
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  }
});
