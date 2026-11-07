import React from 'react';
import { Award, FileText, Sun, Moon, Sliders } from 'lucide-react';
import { onActivationKey } from '../Shared/keyActivation';

export default function NavProfileMenu({
  userState,
  currentRole,
  onOpenProfileModal,
  onOpenBadgesModal,
  onOpenCertificateModal,
  onClose,
  theme,
  setTheme,
  setFontSize,
  isDyslexic,
  setIsDyslexic,
  isColorblind,
  setIsColorblind,
  isHighContrast,
  setIsHighContrast,
  isReducedMotion,
  setIsReducedMotion
}) {
  return (
    <div
      className="animate-fade-in nav-dropdown-popover"
      style={{
        position: 'absolute',
        top: '125%',
        right: 0,
        width: 'min(330px, calc(100vw - 40px))',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
        padding: '14px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* User Header in Dropdown */}
      <div style={{ padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>
            {userState.userName || 'Dev Explorer'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
            {currentRole?.title?.split('(')[0] || 'Entwickler'}
          </div>
        </div>
        <button
          onClick={() => { onOpenProfileModal(); onClose(); }}
          style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer' }}
        >
          Rolle ändern
        </button>
      </div>

      {/* Badges & Stats Action */}
      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenBadgesModal(); onClose(); })}
        onClick={() => { onOpenBadgesModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={17} color="var(--accent-amber)" /> Badges &amp; Erfolge
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          {userState.unlockedBadges?.length || 0} freigeschaltet
        </span>
      </div>

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenCertificateModal(); onClose(); })}
        onClick={() => { onOpenCertificateModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <FileText size={17} color="var(--accent-teal)" /> Zertifikat erstellen
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

      {/* Theme Switcher Row */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          {theme === 'light' ? <Sun size={17} color="var(--accent-amber)" /> : <Moon size={17} color="var(--accent-primary)" />} Farbschema
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setTheme('light')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--border-color)', background: theme === 'light' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: theme === 'light' ? 'var(--text-on-accent)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            Hell
          </button>
          <button
            onClick={() => setTheme('dark')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--border-color)', background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: theme === 'dark' ? 'var(--text-on-accent)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            Dunkel
          </button>
        </div>
      </div>

      {/* Accessibility Controls Inside Unified Dropdown */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={13} /> Barrierefreiheit (WCAG)
        </div>

        {/* Font Size Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
          <span>Schriftgröße</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setFontSize(prev => Math.max(prev - 5, 85))} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}>A-</button>
            <button onClick={() => setFontSize(100)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}>100%</button>
            <button onClick={() => setFontSize(prev => Math.min(prev + 5, 130))} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}>A+</button>
          </div>
        </div>

        {/* Accessibility Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span>Dyslexie-Schrift</span>
            <input type="checkbox" checked={isDyslexic} onChange={e => setIsDyslexic(e.target.checked)} style={{ cursor: 'pointer' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span>Rot-Grün-Sehhilfe</span>
            <input type="checkbox" checked={isColorblind} onChange={e => setIsColorblind(e.target.checked)} style={{ cursor: 'pointer' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span>Hoher Kontrast</span>
            <input type="checkbox" checked={isHighContrast} onChange={e => setIsHighContrast(e.target.checked)} style={{ cursor: 'pointer' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span>Reduzierte Bewegung</span>
            <input type="checkbox" checked={isReducedMotion} onChange={e => setIsReducedMotion(e.target.checked)} style={{ cursor: 'pointer' }} />
          </label>
        </div>
      </div>
    </div>
  );
}

