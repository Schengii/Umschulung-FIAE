import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export default function PwaUpdateToast() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Hört auf das benutzerdefinierte Event oder Service Worker Update
    const handleUpdate = () => setShowToast(true);
    window.addEventListener('pwa-update-available', handleUpdate);

    // Prüft Service Worker Controller-Wechsel. Beim allerersten Besuch gibt
    // es noch keinen Controller - dort löst `clients.claim()` ebenfalls ein
    // `controllerchange` aus, das aber kein Update ist und keinen Toast
    // zeigen darf.
    const hadController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    const handleControllerChange = () => {
      if (hadController) setShowToast(true);
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  if (!showToast) return null;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: 9998,
        maxWidth: '360px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-primary)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-primary)" />
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Neues Update verfügbar!
          </strong>
        </div>
        <button
          onClick={() => setShowToast(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Schließen"
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        Eine neue Version von IT-DevGame wurde im Hintergrund installiert. Lade jetzt neu, um die neuesten Labs &amp; Fixes zu aktivieren.
      </p>

      <button
        onClick={handleReload}
        className="btn btn-primary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontWeight: 'bold',
          marginTop: '4px'
        }}
      >
        <RefreshCw size={14} /> Jetzt aktualisieren
      </button>
    </div>
  );
}
