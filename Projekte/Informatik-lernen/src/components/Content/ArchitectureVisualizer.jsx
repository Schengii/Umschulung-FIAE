import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { ARCH_NODES, ARCH_PATTERNS, ARCH_PRINCIPLES, ARCH_QUIZ } from '../../data/architectureData';
import {
  downtimeMinutesPerYear,
  downtimeMinutesPerMonth,
  formatDowntime,
  serialAvailability,
  parallelAvailability,
  availabilityClasses
} from '../../utils/availabilityEngine';
import SelfTestQuiz from '../Shared/SelfTestQuiz';
import DeepDive from '../Shared/DeepDive';
import { ARCH_NODE_DEEPDIVES } from '../../data/vertiefungDataRest';

const SECTIONS = [
  { id: 'components', label: 'Komponenten' },
  { id: 'patterns', label: 'Architekturmuster' },
  { id: 'principles', label: 'Skalierung & Resilienz' },
  { id: 'availability', label: 'Verfügbarkeitsrechner' },
  { id: 'quiz', label: 'Selbsttest' }
];

const cardStyle = { background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' };

function SourceLink({ source }) {
  if (!source?.url || !/^https:\/\//.test(source.url)) return null;
  return (
    <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
      Quelle:{' '}
      <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
        {source.label || source.url}
      </a>
    </p>
  );
}

/** "99,9 99.5; 99" -> [99.9, 99.5, 99]; ungültige Teile ergeben NaN. */
function parseList(text) {
  return String(text)
    .split(/[;\s]+/)
    .filter(Boolean)
    .map((t) => Number(t.replace(',', '.')));
}

function ComponentsSection() {
  const [selectedNode, setSelectedNode] = useState('gateway');
  const activeNode = ARCH_NODES.find((n) => n.id === selectedNode) || ARCH_NODES[0];
  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
        Klicke auf eine Komponente der Architektur:
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '12px', marginBottom: '24px' }}>
        {ARCH_NODES.map((node) => (
          <button
            key={node.id}
            type="button"
            aria-pressed={selectedNode === node.id}
            onClick={() => setSelectedNode(node.id)}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: selectedNode === node.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: selectedNode === node.id ? 'var(--text-on-accent)' : 'var(--text-main)',
              border: selectedNode === node.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            {node.name}
          </button>
        ))}
      </div>
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="badge badge-teal">{activeNode.type}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700 }}>Architektur Komponente</span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>{activeNode.name}</h3>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>{activeNode.desc}</p>
        <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
          <strong style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>⚙️ Technische Umsetzung:</strong>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{activeNode.details}</p>
        </div>
        <DeepDive key={activeNode.id} deepDive={ARCH_NODE_DEEPDIVES[activeNode.id]} />
      </div>
    </div>
  );
}

function PatternsSection() {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {ARCH_PATTERNS.map((p) => (
        <section key={p.id} className="glass-panel" style={{ padding: '24px' }} aria-labelledby={`pattern-${p.id}`}>
          <h2 id={`pattern-${p.id}`} style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>{p.name}</h2>
          <p style={{ color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 14px' }}>{p.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '12px' }}>
            <div style={cardStyle}>
              <strong style={{ color: 'var(--accent-emerald)' }}>👍 Vorteile</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {p.pros.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div style={cardStyle}>
              <strong style={{ color: 'var(--accent-amber)' }}>⚠️ Nachteile</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {p.cons.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
          <p style={{ margin: '14px 0 0', color: 'var(--text-muted)' }}><strong>Passt, wenn:</strong> {p.useWhen}</p>
          <SourceLink source={p.source} />
        </section>
      ))}
    </div>
  );
}

function PrinciplesSection() {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {ARCH_PRINCIPLES.map((p) => (
        <section key={p.id} className="glass-panel" style={{ padding: '24px' }} aria-labelledby={`principle-${p.id}`}>
          <h2 id={`principle-${p.id}`} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>{p.title}</h2>
          <p style={{ color: 'var(--text-main)', lineHeight: 1.7, margin: 0 }}>{p.text}</p>
          <SourceLink source={p.source} />
        </section>
      ))}
    </div>
  );
}

function AvailabilitySection() {
  const [percent, setPercent] = useState('99,9');
  const [listText, setListText] = useState('99,9 99,5 99');
  const [mode, setMode] = useState('serial');

  const single = Number(String(percent).replace(',', '.'));
  const yearMin = downtimeMinutesPerYear(single);
  const monthMin = downtimeMinutesPerMonth(single);

  const values = parseList(listText);
  const combined = mode === 'serial' ? serialAvailability(values) : parallelAvailability(values);
  const combinedValid = Number.isFinite(combined);
  const inputStyle = {
    minHeight: '44px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <section className="glass-panel" style={{ padding: '24px' }} aria-labelledby="avail-single">
        <h2 id="avail-single" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>Ausfallzeit aus Verfügbarkeit</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>
          Ein Jahr hat 365 Tage = 525.600 Minuten. Erlaubte Ausfallzeit = (100 % − Verfügbarkeit) · Betrachtungszeitraum.
        </p>
        <label htmlFor="avail-percent" style={{ fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
          Verfügbarkeit in Prozent
        </label>
        <input id="avail-percent" inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} style={{ ...inputStyle, maxWidth: '240px' }} />
        <p aria-live="polite" style={{ margin: '12px 0 0', color: 'var(--text-main)', lineHeight: 1.7 }}>
          {Number.isFinite(yearMin)
            ? <>Pro Jahr: <strong>{formatDowntime(yearMin)}</strong> · pro Monat (Durchschnitt): <strong>{formatDowntime(monthMin)}</strong></>
            : 'Bitte einen Wert zwischen 0 und 100 eingeben.'}
        </p>
        <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
          <caption style={{ textAlign: 'left', fontWeight: 700, paddingBottom: '6px' }}>Gängige Verfügbarkeitsklassen</caption>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid var(--border-color)' }}>Verfügbarkeit</th>
              <th scope="col" style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid var(--border-color)' }}>Ausfallzeit pro Jahr</th>
            </tr>
          </thead>
          <tbody>
            {availabilityClasses().map((c) => (
              <tr key={c.percent}>
                <td style={{ padding: '6px', borderBottom: '1px solid var(--border-color)' }}>{c.label}</td>
                <td style={{ padding: '6px', borderBottom: '1px solid var(--border-color)' }}>{formatDowntime(c.minutesPerYear)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass-panel" style={{ padding: '24px' }} aria-labelledby="avail-combo">
        <h2 id="avail-combo" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>Reihen- und Parallelschaltung</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.6 }}>
          Reihe (alle müssen laufen): A = A₁ · A₂ · … · Parallel (einer genügt): A = 1 − (1 − A₁) · (1 − A₂) · …
        </p>
        <label htmlFor="avail-list" style={{ fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
          Verfügbarkeiten der Komponenten in Prozent (durch Leerzeichen oder Semikolon getrennt)
        </label>
        <input id="avail-list" value={listText} onChange={(e) => setListText(e.target.value)} style={inputStyle} />
        <div role="radiogroup" aria-label="Schaltungsart" style={{ display: 'flex', gap: '10px', margin: '12px 0', flexWrap: 'wrap' }}>
          {[
            { id: 'serial', label: 'Reihenschaltung' },
            { id: 'parallel', label: 'Parallelschaltung (Redundanz)' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => setMode(m.id)}
              style={{
                minHeight: '44px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === m.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: mode === m.id ? 'var(--text-on-accent)' : 'var(--text-main)',
                border: mode === m.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p aria-live="polite" style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.7 }}>
          {combinedValid
            ? <>Gesamtverfügbarkeit: <strong>{combined.toFixed(4).replace('.', ',')} %</strong> · Ausfallzeit pro Jahr: <strong>{formatDowntime(downtimeMinutesPerYear(combined))}</strong></>
            : 'Bitte gültige Werte zwischen 0 und 100 eingeben.'}
        </p>
      </section>
    </div>
  );
}

export default function ArchitectureVisualizer() {
  const [section, setSection] = useState('components');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={32} style={{ color: 'var(--accent-primary)' }} /> Systemarchitektur & Microservices Visualizer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Verstehe wie skalierbare Cloud-Systeme, API Gateways, Microservices & Caches zusammenarbeiten, und berechne die Verfügbarkeit deiner Architektur.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={section === s.id}
            onClick={() => setSection(s.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: section === s.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: section === s.id ? 'var(--text-on-accent)' : 'var(--text-main)',
              border: section === s.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'components' && <ComponentsSection />}
      {section === 'patterns' && <PatternsSection />}
      {section === 'principles' && <PrinciplesSection />}
      {section === 'availability' && <AvailabilitySection />}
      {section === 'quiz' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <SelfTestQuiz quiz={ARCH_QUIZ} title="✅ Selbsttest Systemarchitektur" />
        </div>
      )}
    </div>
  );
}
