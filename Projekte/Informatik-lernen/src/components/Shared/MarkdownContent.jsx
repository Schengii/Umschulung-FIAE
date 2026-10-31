import React, { useMemo } from 'react';
import { Info, Lightbulb, AlertTriangle, GraduationCap, FlaskConical, ExternalLink } from 'lucide-react';
import { parseMarkdown } from '../../utils/markdownEngine';
import { resolveTopicImage } from '../../data/topicImages';

const CALLOUT_META = {
  info: { icon: Info, label: 'Info' },
  tip: { icon: Lightbulb, label: 'Tipp' },
  warning: { icon: AlertTriangle, label: 'Achtung' },
  exam: { icon: GraduationCap, label: 'Prüfungstipp' },
  example: { icon: FlaskConical, label: 'Beispiel' }
};

/**
 * @param {{ nodes: any[], onNavigate?: (path: string) => void }} props
 */
function Inline({ nodes, onNavigate }) {
  return nodes.map((n, idx) => {
    switch (n.type) {
      case 'strong':
        return <strong key={idx}><Inline nodes={n.children} onNavigate={onNavigate} /></strong>;
      case 'em':
        return <em key={idx}><Inline nodes={n.children} onNavigate={onNavigate} /></em>;
      case 'code':
        return <code key={idx} className="md-inline-code">{n.value}</code>;
      case 'link':
        if (n.href.startsWith('/') && onNavigate) {
          return (
            <a
              key={idx}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(n.href.replace(/^\/+/, ''));
              }}
            >
              <Inline nodes={n.children} onNavigate={onNavigate} />
            </a>
          );
        }
        if (/^https?:/i.test(n.href)) {
          return (
            <a key={idx} href={n.href} target="_blank" rel="noopener noreferrer">
              <Inline nodes={n.children} onNavigate={onNavigate} />
              <ExternalLink size={12} aria-hidden="true" style={{ marginLeft: '2px', verticalAlign: 'baseline' }} />
            </a>
          );
        }
        return <a key={idx} href={n.href}><Inline nodes={n.children} onNavigate={onNavigate} /></a>;
      default:
        return <React.Fragment key={idx}>{n.value}</React.Fragment>;
    }
  });
}

/**
 * @param {{ blocks: any[], onNavigate?: (path: string) => void }} props
 */
function Blocks({ blocks, onNavigate }) {
  return blocks.map((b, idx) => {
    switch (b.type) {
      case 'heading': {
        const Tag = `h${b.level}`;
        return <Tag key={idx} id={b.id} className="md-heading" tabIndex={-1}><Inline nodes={b.children} onNavigate={onNavigate} /></Tag>;
      }
      case 'paragraph':
        return <p key={idx}><Inline nodes={b.children} onNavigate={onNavigate} /></p>;
      case 'hr':
        return <hr key={idx} className="md-hr" />;
      case 'list': {
        const items = b.items.map((item, i) => (
          <li key={i}>
            <Inline nodes={item.children} onNavigate={onNavigate} />
            {item.sublist && <Blocks blocks={[item.sublist]} onNavigate={onNavigate} />}
          </li>
        ));
        return b.ordered
          ? <ol key={idx} start={b.start !== 1 ? b.start : undefined}>{items}</ol>
          : <ul key={idx}>{items}</ul>;
      }
      case 'table':
        return (
          // Breite Tabellen scrollen auf dem Handy waagerecht; tabIndex macht das per Tastatur möglich (axe: scrollable-region-focusable)
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollbarer Bereich muss fokussierbar sein
          <div key={idx} className="md-table-wrap" role="region" aria-label="Tabelle" tabIndex={0}>
            <table className="md-table">
              <thead>
                <tr>
                  {b.header.map((cell, i) => (
                    <th key={i} scope="col" style={{ textAlign: b.align[i] || 'left' }}><Inline nodes={cell} onNavigate={onNavigate} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ textAlign: b.align[i] || 'left' }}><Inline nodes={cell} onNavigate={onNavigate} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'code':
        return (
          <div key={idx} className="code-window md-code">
            {b.lang && (
              <div className="code-header">
                <span>{b.lang}</span>
              </div>
            )}
            <pre className="code-body"><code>{b.value}</code></pre>
          </div>
        );
      case 'blockquote':
        return <blockquote key={idx} className="md-quote"><Blocks blocks={b.children} onNavigate={onNavigate} /></blockquote>;
      case 'callout': {
        const meta = CALLOUT_META[b.kind] || CALLOUT_META.info;
        const Icon = meta.icon;
        return (
          <aside key={idx} className={`md-callout md-callout-${b.kind}`} aria-label={b.title || meta.label}>
            <div className="md-callout-title">
              <Icon size={18} aria-hidden="true" /> {b.title || meta.label}
            </div>
            <Blocks blocks={b.children} onNavigate={onNavigate} />
          </aside>
        );
      }
      case 'image': {
        const src = resolveTopicImage(b.src);
        if (!src) return null;
        return (
          <figure key={idx} className="md-figure">
            <img src={src} alt={b.alt} loading="lazy" decoding="async" />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
      }
      default:
        return null;
    }
  });
}

/**
 * Rendert Artikel-Markdown (siehe `utils/markdownEngine.js`) als React-Elemente.
 * Interne Links (`/subnetting_calculator`) laufen über `onNavigate`, externe öffnen in einem neuen Tab.
 *
 * @param {object} props
 * @param {string} [props.markdown]
 * @param {any[]} [props.blocks] - bereits geparster Baum (spart doppeltes Parsen)
 * @param {(path: string) => void} [props.onNavigate]
 */
export default function MarkdownContent({ markdown, blocks, onNavigate }) {
  const parsed = useMemo(() => blocks || parseMarkdown(markdown || ''), [markdown, blocks]);
  return (
    <div className="md-content">
      <Blocks blocks={parsed} onNavigate={onNavigate} />
    </div>
  );
}
