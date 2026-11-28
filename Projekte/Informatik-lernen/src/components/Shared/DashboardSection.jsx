import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const STORAGE_PREFIX = 'informatik_game_dash_section_';

function readOpen(id, fallback) {
  try {
    const v = localStorage.getItem(STORAGE_PREFIX + id);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

/**
 * Einklappbarer Dashboard-Abschnitt. Zustand bleibt je Abschnitt im LocalStorage erhalten.
 * Der Inhalt wird nur gerendert, wenn der Abschnitt offen ist (spart Arbeit bei schweren Widgets).
 */
export default function DashboardSection({ id, title, summary, defaultOpen = true, children }) {
  const [open, setOpen] = useState(() => readOpen(id, defaultOpen));
  const panelId = useId();

  const toggle = () => {
    setOpen((prev) => {
      try {
        localStorage.setItem(STORAGE_PREFIX + id, prev ? '0' : '1');
      } catch {
        // Speicher voll oder gesperrt – Zustand gilt dann nur für diese Sitzung
      }
      return !prev;
    });
  };

  return (
    <section aria-label={title}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', marginBottom: open ? '16px' : 0 }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textAlign: 'left' }}>
          <strong style={{ color: 'var(--text-main)' }}>{title}</strong>
          {!open && summary && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 400 }}>{summary}</span>}
        </span>
        <ChevronDown size={18} aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <div id={panelId} hidden={!open}>
        {open && children}
      </div>
    </section>
  );
}
