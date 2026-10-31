import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

/**
 * Quellenangaben am Ende eines Labs: Erklärungen und Drillfragen nennen, woher die Fakten stammen.
 *
 * @param {object} props
 * @param {Array<{ title: string, url?: string, note?: string }>} props.sources
 * @param {string} [props.checkedOn] - Datum der Prüfung (TT.MM.JJJJ)
 */
export default function SourceList({ sources, checkedOn }) {
  return (
    <section className="glass-panel" style={{ padding: '20px', marginTop: '24px' }} aria-labelledby="lab-sources-heading">
      <h2 id="lab-sources-heading" style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
        <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} /> Quellen
      </h2>
      <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {sources.map((s) => (
          <li key={s.title}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600, overflowWrap: 'anywhere' }}>
                {s.title} <ExternalLink size={12} aria-hidden="true" style={{ verticalAlign: 'baseline' }} />
              </a>
            ) : (
              <strong style={{ color: 'var(--text-main)' }}>{s.title}</strong>
            )}
            {s.note && <span> – {s.note}</span>}
          </li>
        ))}
      </ul>
      {checkedOn && <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>Inhalte geprüft am {checkedOn}.</p>}
    </section>
  );
}
