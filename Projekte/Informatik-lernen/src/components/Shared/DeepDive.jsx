import React from 'react';
import MarkdownView from './MarkdownView';

/**
 * Ausklappbarer Bereich „Fachlich vertieft“ unter einem Lerninhalt.
 *
 * @param {object} props
 * @param {{ md: string, sources?: Array<{label: string, url: string}> } | undefined} props.deepDive
 * @param {string} [props.title]
 */
export default function DeepDive({ deepDive, title = '🔬 Fachlich vertieft' }) {
  if (!deepDive?.md) return null;
  const sources = (deepDive.sources || []).filter((s) => /^https:\/\//.test(s.url || ''));
  return (
    <details className="glass-panel" style={{ marginTop: '24px', padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.02rem' }}>{title}</summary>
      <div style={{ marginTop: '12px', color: 'var(--text-main)', lineHeight: 1.65, fontSize: '0.96rem' }}>
        <MarkdownView markdown={deepDive.md} />
        {sources.length > 0 && (
          <p style={{ margin: '14px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Quellen:{' '}
            {sources.map((s, i) => (
              <React.Fragment key={s.url}>
                {i > 0 && ' · '}
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>{s.label || s.url}</a>
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </details>
  );
}
