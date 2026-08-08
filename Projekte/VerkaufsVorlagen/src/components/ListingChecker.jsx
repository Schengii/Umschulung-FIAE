import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const CHECKS = [
  { key: 'name', label: 'Anzeigentitel', check: (item) => item.name && item.name.length >= 5 },
  { key: 'description', label: 'Beschreibung (min. 50 Zeichen)', check: (item) => item.description && item.description.length >= 50 },
  { key: 'condition', label: 'Zustand ausgewählt', check: (item) => !!item.condition },
  { key: 'suggestedPrice', label: 'Verkaufspreis gesetzt', check: (item) => !!item.suggestedPrice && item.suggestedPrice > 0 },
  { key: 'functionality', label: 'Funktionalität & Mängel beschrieben', check: (item) => item.functionality && item.functionality.length >= 5 },
  { key: 'shippingMethod', label: 'Versandoptionen angegeben', check: (item) => item.shippingMethod && item.shippingMethod.length >= 3 },
  { key: 'paymentMethod', label: 'Zahlungsarten angegeben', check: (item) => item.paymentMethod && item.paymentMethod.length >= 3 },
  { key: 'tags', label: 'SEO-Schlagwörter generiert', check: (item) => item.tags && item.tags.length > 0 },
  { key: 'minimumPrice', label: 'Schmerzgrenze gesetzt', check: (item) => !!item.minimumPrice && item.minimumPrice > 0 },
];

export default function ListingChecker({ currentItem }) {
  const results = CHECKS.map((c) => ({ ...c, passed: c.check(currentItem) }));
  const passedCount = results.filter((r) => r.passed).length;
  const total = results.length;
  const pct = Math.round((passedCount / total) * 100);

  const scoreColor = pct >= 80 ? '#00bc7e' : pct >= 50 ? '#ffb61e' : '#f87171';
  const scoreLabel = pct >= 80 ? '🏆 Sehr vollständig' : pct >= 50 ? '⚡ Fast fertig' : '⚠️ Unvollständig';

  return (
    <div className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 2px 0' }}>Inserat-Vollständigkeit</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{scoreLabel}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{passedCount}/{total} Punkte</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: scoreColor, borderRadius: '3px', transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {results.map((r) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem' }}>
            {r.passed
              ? <CheckCircle size={14} style={{ color: '#00bc7e', flexShrink: 0 }} />
              : <Circle size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            }
            <span style={{ color: r.passed ? 'var(--text-secondary)' : 'rgba(255,255,255,0.35)', textDecoration: r.passed ? 'none' : 'none' }}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
