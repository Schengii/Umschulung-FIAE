import React, { useState } from 'react';
import { IHK_LERNFELDER } from '../../data/lernfelderData';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

export default function FisiLernfelderHub() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [activeLfId, setActiveLfId] = useState(IHK_LERNFELDER[0].id);

  const filteredLernfelder = IHK_LERNFELDER.filter(lf => {
    if (selectedYear === 'all') return true;
    return lf.year === selectedYear;
  });

  const activeLf = IHK_LERNFELDER.find(lf => lf.id === activeLfId) || IHK_LERNFELDER[0];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>
          🎓 IHK Rahmenlehrplan (FISI & FIAE)
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap size={32} style={{ color: 'var(--accent-indigo)' }} /> IHK Lernfelder für Fachinformatiker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Umfassende Übersicht aller 12 Lernfelder für Berufsschule, AP Teil 1 & AP Teil 2 Systemintegration.
        </p>
      </div>

      {/* Lehrjahr Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Alle 12 Lernfelder' },
          { id: '1. Lehrjahr', label: '1. Lehrjahr (LF 1 - 5)' },
          { id: '2. Lehrjahr', label: '2. Lehrjahr (LF 6 - 9)' },
          { id: '3. Lehrjahr', label: '3. Lehrjahr (LF 10b - 12b)' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedYear(filter.id)}
            style={{
              minHeight: '44px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.92rem',
              background: selectedYear === filter.id ? 'var(--accent-indigo)' : 'var(--bg-card)',
              color: selectedYear === filter.id ? '#ffffff' : 'var(--text-main)',
              border: selectedYear === filter.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid Layout: List + Detail View */}
      <div className="grid-responsive" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Left Column: List of Lernfelder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredLernfelder.map(lf => (
            <div
              key={lf.id}
              onClick={() => setActiveLfId(lf.id)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: activeLfId === lf.id ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-card)',
                border: activeLfId === lf.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.78rem' }}>{lf.number}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lf.year}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
                {lf.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Lernfeld Detailed View */}
        {activeLf && (
          <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-teal" style={{ fontSize: '0.9rem' }}>{activeLf.number} • {activeLf.year}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700 }}>IHK Prüfungsrelevant</span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
              {activeLf.title}
            </h2>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Zusammenfassung & Ausbildungsziel:</strong>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {activeLf.summary}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>
                🎯 Konkrete Themen & Lehrinhalte:
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeLf.topics.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', shrink: 0 }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
