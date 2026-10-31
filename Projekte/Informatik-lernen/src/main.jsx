import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './styles/fonts.css'
import './styles/tailwind.css'
import './styles/global.css'
import App from './App.jsx'
import { initErrorMonitoring } from './utils/errorMonitoring.js'

// /sw.js wird von vite-plugin-pwa (Workbox, `generateSW`) erzeugt - im Build
// nach dist/, im Dev-Server nach dev-dist/. Es gibt bewusst keine
// handgeschriebene public/sw.js mehr.
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('pwa-update-available'));
            }
          });
        }
      });
    }).catch((err) => console.log('SW reg error: ', err));
  });
}

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

if (!isLocalhost) {
  initErrorMonitoring();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {!isLocalhost && <Analytics />}
    </BrowserRouter>
  </StrictMode>,
)
