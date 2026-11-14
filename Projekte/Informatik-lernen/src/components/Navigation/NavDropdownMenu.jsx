import React from 'react';
import { onActivationKey } from '../Shared/keyActivation';

export default function NavDropdownMenu({ items, activeTab, onSelect, badgeBg = 'rgba(99, 102, 241, 0.15)', badgeColor = 'var(--accent-primary)' }) {
  return (
    <div
      className="animate-fade-in nav-dropdown-popover"
      style={{
        position: 'absolute',
        top: '125%',
        left: 0,
        width: 'min(480px, calc(100vw - 32px))',
        maxHeight: '78vh',
        overflowY: 'auto',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
        padding: '12px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => onSelect(item.id))}
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              background: isActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
              transition: 'background 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent'; }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.4' }}>
                {item.desc}
              </div>
            </div>
            {item.badge && (
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: badgeBg, color: badgeColor, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {item.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

