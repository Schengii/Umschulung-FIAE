import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './App.css'

// Global fetch interceptor to automatically attach the X-Profile-ID header
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  if (typeof url === 'string' && (url.includes('/api/') || url.includes('/auth/'))) {
    options.headers = options.headers || {};
    const activeProfileId = localStorage.getItem('active_profile_id') || '1';
    if (options.headers instanceof Headers) {
      options.headers.set('X-Profile-ID', activeProfileId);
    } else if (Array.isArray(options.headers)) {
      options.headers.push(['X-Profile-ID', activeProfileId]);
    } else {
      options.headers['X-Profile-ID'] = activeProfileId;
    }
  }
  return originalFetch(url, options);
};

// Register Service Worker for PWA & Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker erfolgreich registriert:', reg.scope))
      .catch(err => console.error('Service Worker Registrierung fehlgeschlagen:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>,
)
