import React from 'react';
import MarkdownView from './MarkdownView';

const LIST_LINE = /^\s*(?:[-*]|\d+\.)\s+/;

/**
 * Der Markdown-Parser verbindet aufeinanderfolgende Textzeilen zu einem Absatz.
 * Für Aufgaben soll jede Zeile ihren eigenen Absatz behalten (außer Listen und Codeblöcken).
 * @param {string} text
 */
export function toLineBreakMarkdown(text) {
  return String(text)
    .split(/(```[\s\S]*?```)/g)
    .map((part) => {
      if (part.startsWith('```')) return `\n${part}\n`;
      const lines = part.split('\n');
      return lines
        .map((line, i) => {
          const next = lines[i + 1];
          const bothList = next !== undefined && LIST_LINE.test(line) && LIST_LINE.test(next);
          return i < lines.length - 1 && line.trim() !== '' && next?.trim() !== '' && !bothList ? `${line}\n` : line;
        })
        .join('\n');
    })
    .join('');
}

/**
 * Kleine Übungsaufgaben mit ausklappbarem Tipp und ausklappbarer Lösung.
 *
 * @param {object} props
 * @param {Array<{ id: string, frage: string, hinweis?: string, loesung: string }>} props.aufgaben
 */
export default function MiniAufgaben({ aufgaben }) {
  if (!aufgaben?.length) return null;
  return (
    <section aria-label="Kleine Aufgaben zum Selberlösen" style={{ marginTop: '28px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>✏️ Kleine Aufgaben zum Selberlösen</h3>
      <p style={{ margin: '0 0 14px', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
        Versuche jede Aufgabe zuerst mit Stift und Papier. Erst danach den Tipp oder die Lösung aufklappen.
      </p>
      <div style={{ display: 'grid', gap: '14px' }}>
        {aufgaben.map((a, index) => (
          <div key={a.id} className="glass-panel" style={{ padding: '16px 18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '6px' }}>Aufgabe {index + 1}</div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
              <MarkdownView markdown={toLineBreakMarkdown(a.frage)} />
            </div>
            {a.hinweis && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-muted)' }}>💡 Tipp anzeigen</summary>
                <div style={{ marginTop: '6px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <MarkdownView markdown={toLineBreakMarkdown(a.hinweis)} />
                </div>
              </details>
            )}
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent-teal)' }}>✅ Lösung anzeigen</summary>
              <div style={{ marginTop: '6px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <MarkdownView markdown={toLineBreakMarkdown(a.loesung)} />
              </div>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}
