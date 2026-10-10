import React, { useState, useMemo } from 'react';
import { 
  Brain, AlertTriangle, CheckCircle2, ArrowRight, 
  Award, Check, RefreshCw, Target 
} from 'lucide-react';
import { 
  IHK_LEARN_FIELDS, 
  auditWeaknesses, 
  generateWeaknessRecommendations 
} from '../../utils/ihkWeaknessAuditEngine';
import { useStore } from '../../store/useStore';

export default function IhkWeaknessAuditLab({ onNavigateTab }) {
  const { awardXP } = useStore();
  const [history, setHistory] = useState([
    { lfId: 'LF4', isCorrect: false },
    { lfId: 'LF4', isCorrect: false },
    { lfId: 'LF4', isCorrect: true },
    { lfId: 'LF9', isCorrect: false },
    { lfId: 'LF9', isCorrect: true },
    { lfId: 'LF10', isCorrect: false },
    { lfId: 'LF10', isCorrect: false },
    { lfId: 'LF5', isCorrect: true }
  ]);
  const [xpClaimed, setXpClaimed] = useState(false);

  const audit = useMemo(() => auditWeaknesses(history), [history]);
  const recommendations = useMemo(() => generateWeaknessRecommendations(audit.weakFields), [audit.weakFields]);

  const handleSimulateQuizResult = (lfId, isCorrect) => {
    setHistory(prev => [...prev, { lfId, isCorrect }]);
  };

  const handleResetHistory = () => {
    setHistory([
      { lfId: 'LF4', isCorrect: true },
      { lfId: 'LF4', isCorrect: true },
      { lfId: 'LF9', isCorrect: true },
      { lfId: 'LF10', isCorrect: true }
    ]);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'IHK Schwachstellen-Audit Assistent gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Brain size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                IHK Schwachstellen-Audit & Adaptiver Lernassistent
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Lernfeld-Fehleranalyse (LF 1 - 12), Wissenslücken-Erkennung & gezielte Lab-Wiederholungs-Sitzungen
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimXP}
          disabled={xpClaimed}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: xpClaimed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {xpClaimed ? <Check size={16} /> : <Award size={16} />}
          {xpClaimed ? 'XP gutgeschrieben' : '+60 XP beanspruchen'}
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gesamt-Erfolgsquote</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: audit.overallScore >= 70 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
            {audit.overallScore}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{history.length} Fragen beantwortet</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Kritische Wissenslücken</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: audit.weakFields.length === 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {audit.weakFields.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Lernfelder mit &gt;30% Fehlerquote</div>
        </div>
      </div>

      {/* Targeted Recommendations */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#8b5cf6" /> Gezielte Wiederholungs-Empfehlungen
          </h2>
          <button
            onClick={handleResetHistory}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Alle Lücken geschlossen simulieren
          </button>
        </div>

        {recommendations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', color: '#166534' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
            <h3 style={{ margin: 0, fontWeight: 700 }}>Hervorragend! Keine kritischen Wissenslücken erkannt.</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Du beherrschst alle IHK-Lernfelder mit hoher Trefferquote.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                style={{
                  background: '#fef2f2',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    <strong style={{ fontSize: '0.95rem', color: '#991b1b' }}>{rec.title}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c' }}>
                      {rec.errorRatePercent}% Fehler
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: '4px 0 0' }}>
                    💡 Empfehlung: {rec.tip}
                  </p>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(rec.recommendedLab)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Lab öffnen <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulator Quick Toggles */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px' }}>
          Interaktiver Quiz-Simulator (Fehler/Treffer erfassen)
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {IHK_LEARN_FIELDS.slice(0, 6).map(lf => (
            <div key={lf.id} style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleSimulateQuizResult(lf.id, true)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + {lf.id} Richtig
              </button>
              <button
                onClick={() => handleSimulateQuizResult(lf.id, false)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + {lf.id} Falsch
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
