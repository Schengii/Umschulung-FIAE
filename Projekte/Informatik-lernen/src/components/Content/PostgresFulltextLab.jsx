import React, { useState, useMemo } from 'react';
import { Search, Award, Database } from 'lucide-react';
import { toTsVector, evaluateTsQuery } from '../../utils/postgresFulltextEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PostgresFulltextLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [docText, setDocText] = useState('PostgreSQL bietet schnelle Volltextsuche mit GIN-Indizes und Lexem-Stemming.');
  const [queryStr, setQueryStr] = useState('volltextsuche & lexem');
  const [solved, setSolved] = useState(false);

  const vectorData = useMemo(() => toTsVector(docText), [docText]);
  const queryResult = useMemo(() => evaluateTsQuery(vectorData, queryStr), [vectorData, queryStr]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'postgres_fulltext_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> PostgreSQL High-Performance
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} /> Full-Text Search (tsvector &amp; tsquery)
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔍 PostgreSQL Full-Text Search Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Generiere `to_tsvector('german', text)` Lexeme, führe boolesche Abfragen mit `to_tsquery('a &amp; b')` aus und visualisiere Relevanz-Scores (`ts_rank`).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Volltextsuche Bestätigen (+45 XP)
        </button>
      </div>

      {/* Input Text & Query Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Dokumententext (Eingabe):
          </label>
          <textarea
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Suchabfrage (tsquery boolesch mit &amp;, |, !):
          </label>
          <input
            type="text"
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value)}
            style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace' }}
          />

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Suchergebnis:</span>
            <span className={`badge ${queryResult.isMatch ? 'badge-emerald' : 'badge-rose'}`}>
              {queryResult.isMatch ? `MATCH (ts_rank: ${queryResult.rankScore})` : 'NO MATCH'}
            </span>
          </div>
        </div>
      </div>

      {/* tsvector Lexeme Output */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
          Extrahierter PostgreSQL `tsvector` (Gestemmte Lexeme mit Wortpositionen):
        </span>
        <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
          {vectorData.formattedVector}
        </pre>
      </div>
    </div>
  );
}
