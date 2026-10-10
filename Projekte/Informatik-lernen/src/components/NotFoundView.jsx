import React from 'react';
import { Compass, Home, Search } from 'lucide-react';

/**
 * 404-Ansicht für unbekannte URLs (Tippfehler, veraltete Lesezeichen, Links
 * auf umbenannte Labs). Ohne sie bliebe der Inhaltsbereich unter der
 * Navigation einfach leer, weil kein Tab zur URL passt.
 */
export default function NotFoundView({ path, onGoHome, onOpenSearch }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '32px',
        borderRadius: 'var(--radius-xl)',
        border: '2px solid var(--border-color)',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '14px',
        maxWidth: '640px',
        margin: '32px auto'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
        <Compass size={24} />
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Seite nicht gefunden
        </h1>
      </div>
      <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Unter <code style={{ wordBreak: 'break-all' }}>{path}</code> gibt es kein Modul. Vielleicht wurde
        das Lab umbenannt oder die Adresse enthält einen Tippfehler. Dein Fortschritt ist davon nicht
        betroffen.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onGoHome} style={{ gap: '8px' }}>
          <Home size={16} /> Zum Dashboard
        </button>
        {typeof onOpenSearch === 'function' && (
          <button className="btn btn-secondary" onClick={onOpenSearch} style={{ gap: '8px' }}>
            <Search size={16} /> Modul suchen
          </button>
        )}
      </div>
    </div>
  );
}
