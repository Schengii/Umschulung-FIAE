import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onActivationKey } from '../Shared/keyActivation';
import { prefetchLab } from '../../data/labRegistry';

/**
 * Filtert Menüeinträge nach Suchtext (Titel, Beschreibung, Badge) und ordnet sie in Gruppen.
 * Einträge ohne Gruppe stehen zuerst, die übrigen Gruppen in der Reihenfolge ihres ersten Auftretens.
 * @param {Array<{id: string, label: string, desc?: string, badge?: string}>} items
 * @param {string} query
 * @param {((item: object) => string | null | undefined) | undefined} groupOf
 * @returns {Array<{ name: string | null, items: object[] }>}
 */
export function groupMenuItems(items, query = '', groupOf) {
  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter((item) => `${item.label} ${item.desc || ''} ${item.badge || ''}`.toLowerCase().includes(q))
    : items;
  if (!groupOf) return visible.length ? [{ name: null, items: visible }] : [];
  const groups = new Map();
  for (const item of visible) {
    const name = groupOf(item) || null;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  const result = [...groups.entries()].map(([name, list]) => ({ name, items: list }));
  return result.sort((a, b) => (a.name === null ? -1 : b.name === null ? 1 : 0));
}

export default function NavDropdownMenu({ items, activeTab, onSelect, badgeBg = 'rgba(99, 102, 241, 0.15)', badgeColor = 'var(--accent-primary)', searchable = false, groupOf, searchLabel = 'Menü durchsuchen' }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  useEffect(() => {
    if (searchable) searchRef.current?.focus();
  }, [searchable]);
  const groups = useMemo(() => groupMenuItems(items, searchable ? query : '', groupOf), [items, query, searchable, groupOf]);

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
      {searchable && (
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen …"
          aria-label={searchLabel}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            padding: '9px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary, var(--bg-card))',
            color: 'var(--text-main)',
            fontSize: '0.9rem'
          }}
        />
      )}
      {searchable && groups.length === 0 && (
        <div role="status" style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Kein Treffer für „{query}“.
        </div>
      )}
      {groups.map((group) => (
        <React.Fragment key={group.name ?? '__general'}>
          {group.name && (
            <div style={{ padding: '10px 14px 2px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {group.name} <span style={{ fontWeight: 600 }}>({group.items.length})</span>
            </div>
          )}
          {group.items.map((item) => {
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
            onFocus={() => prefetchLab(item.id)}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; prefetchLab(item.id); }}
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
        </React.Fragment>
      ))}
    </div>
  );
}

