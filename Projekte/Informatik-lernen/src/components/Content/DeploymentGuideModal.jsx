import React from 'react';
import { Rocket, ExternalLink, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function DeploymentGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '650px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Schließen"
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Rocket size={36} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            Live Deployment Leitfaden
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Veröffentliche deine IT-DevGame App mit 1-Klick auf Vercel, Netlify oder GitHub Pages.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: '1.05rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>
              1. Deployment auf Vercel (Empfohlen)
            </strong>
            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Verbinde dein GitHub-Repository `Schengii/Informatik-lernen` mit vercel.com. Vercel baut automatisch deine Vite-App bei jedem Push.
            </p>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: '1.05rem', color: 'var(--accent-teal)', display: 'block', marginBottom: '4px' }}>
              2. Deployment auf GitHub Pages
            </strong>
            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Führe `npm run build` aus und nutze das `gh-pages` Package zum kostenlosen Hostings auf GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
