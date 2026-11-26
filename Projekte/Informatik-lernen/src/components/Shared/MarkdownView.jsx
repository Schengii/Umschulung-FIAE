import React from 'react';
import { parseMarkdown } from '../../utils/markdownLite';

function InlineTokens({ tokens }) {
  return tokens.map((t, i) => {
    if (t.type === 'bold') return <strong key={i}>{t.text}</strong>;
    if (t.type === 'code') {
      return <code key={i} style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.88em' }}>{t.text}</code>;
    }
    return <React.Fragment key={i}>{t.text}</React.Fragment>;
  });
}

/**
 * Rendert Markdown (Überschriften, Listen, Tabellen, Code, Zitate) als React-Elemente.
 * Es wird kein HTML eingeschleust. Der Parser steht in `utils/markdownLite.js`.
 *
 * @param {object} props
 * @param {string} props.markdown
 */
export default function MarkdownView({ markdown }) {
  const blocks = parseMarkdown(markdown);
  const cellStyle = { padding: '6px 10px', border: '1px solid var(--border-color)', textAlign: 'left' };
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading': {
            const sizes = { 1: '1.5rem', 2: '1.3rem', 3: '1.15rem', 4: '1.02rem' };
            return <div key={i} role="heading" aria-level={Math.min(b.level + 1, 6)} style={{ fontWeight: 800, fontSize: sizes[b.level], margin: '14px 0 6px' }}><InlineTokens tokens={b.tokens} /></div>;
          }
          case 'code':
            return <pre key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', overflowX: 'auto', fontSize: '0.85rem', margin: '8px 0' }}><code>{b.text}</code></pre>;
          case 'list': {
            const ListTag = b.ordered ? 'ol' : 'ul';
            return <ListTag key={i} style={{ margin: '6px 0', paddingLeft: '22px' }}>{b.items.map((item, j) => <li key={j}><InlineTokens tokens={item} /></li>)}</ListTag>;
          }
          case 'table':
            return (
              <div key={i} style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead><tr>{b.header.map((h, j) => <th key={j} scope="col" style={{ ...cellStyle, background: 'var(--bg-tertiary)' }}><InlineTokens tokens={h} /></th>)}</tr></thead>
                  <tbody>{b.rows.map((row, r) => <tr key={r}>{row.map((c, j) => <td key={j} style={cellStyle}><InlineTokens tokens={c} /></td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          case 'quote':
            return <blockquote key={i} style={{ margin: '8px 0', padding: '8px 14px', borderLeft: '4px solid var(--accent-teal)', background: 'var(--bg-tertiary)', borderRadius: '4px' }}><InlineTokens tokens={b.tokens} /></blockquote>;
          default:
            return <p key={i} style={{ margin: '6px 0' }}><InlineTokens tokens={b.tokens} /></p>;
        }
      })}
    </>
  );
}
