import React, { useState, useMemo } from 'react';
import { 
  Brain, AlertTriangle, CheckCircle2, ArrowRight, 
  Award, Check, RefreshCw, Target 
} from 'lucide-react';
import { 
  IHK_LEARN_FIELDS, 
  auditWeaknesses, 
  generateWeaknessRecommendations,
  mapQuestionToLernfeld
} from '../../utils/ihkWeaknessAuditEngine';
import { useStore } from '../../store/useStore';
import { EXAM_QUESTIONS } from '../../data/examData';
import { DRILL_QUESTIONS } from '../../data/drillQuestions';

// Stabile Referenz: ein `|| {}` im Render erzeugt jedes Mal ein neues Objekt und entwertet useMemo-Abhängigkeiten.
const EMPTY_OBJECT = Object.freeze({});

// Lookup-Map aller Fragen nach ID
const ALL_QUESTIONS_MAP = new Map([...EXAM_QUESTIONS, ...DRILL_QUESTIONS].map((q) => [String(q.id), q]));

export default function IhkWeaknessAuditLab({ onNavigateTab, onRewardXP, userState }) {
  const storeUserState = useStore((s) => s.userState);
  const currentUserState = userState || storeUserState;
  const mistakeJournal = currentUserState?.mistakeJournal || EMPTY_OBJECT;

  // Erzeuge Journal-basierte Historie aus echten Falschantworten
  const journalHistory = useMemo(() => {
    const entries = [];
    const journal = mistakeJournal || {};
    for (const [id, record] of Object.entries(journal)) {
      const q = ALL_QUESTIONS_MAP.get(String(id));
      const lfId = mapQuestionToLernfeld(q);
      const wrongCount = record.wrongCount || 1;
      const streak = record.streak || 0;
      // Falsche Antworten hinzufügen
      for (let i = 0; i < wrongCount; i++) {
        entries.push({ lfId, isCorrect: false });
      }
      // Richtige Antworten (Streak) hinzufügen
      for (let i = 0; i < streak; i++) {
        entries.push({ lfId, isCorrect: true });
      }
    }
    return entries;
  }, [mistakeJournal]);

  // Fallback-Mock-Historie, falls Journal noch komplett leer ist
  const defaultHistory = useMemo(() => [
    { lfId: 'LF4', isCorrect: false },
    { lfId: 'LF4', isCorrect: false },
    { lfId: 'LF4', isCorrect: true },
    { lfId: 'LF9', isCorrect: false },
    { lfId: 'LF9', isCorrect: true },
    { lfId: 'LF10', isCorrect: false },
    { lfId: 'LF10', isCorrect: false },
    { lfId: 'LF5', isCorrect: true }
  ], []);

  const [simulatedHistory, setSimulatedHistory] = useState(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Verwendete Historie: Entweder manuelle Simulation, echtes Journal oder Default
  const activeHistory = useMemo(() => {
    if (simulatedHistory !== null) return simulatedHistory;
    return journalHistory.length > 0 ? journalHistory : defaultHistory;
  }, [simulatedHistory, journalHistory, defaultHistory]);

  const isRealData = simulatedHistory === null && journalHistory.length > 0;

  const audit = useMemo(() => auditWeaknesses(activeHistory), [activeHistory]);
  const recommendations = useMemo(() => generateWeaknessRecommendations(audit.weakFields), [audit.weakFields]);

  const handleSimulateQuizResult = (lfId, isCorrect) => {
    setSimulatedHistory(prev => {
      const base = prev !== null ? prev : activeHistory;
      return [...base, { lfId, isCorrect }];
    });
  };

  const handleResetHistory = () => {
    setSimulatedHistory([
      { lfId: 'LF4', isCorrect: true },
      { lfId: 'LF4', isCorrect: true },
      { lfId: 'LF9', isCorrect: true },
      { lfId: 'LF10', isCorrect: true }
    ]);
  };

  const handleUseRealJournal = () => {
    setSimulatedHistory(null);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && onRewardXP) {
      onRewardXP(60, 'weakness_audit_master');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-purple), #6d28d9)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Brain size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                IHK Schwachstellen-Audit & Adaptiver Lernassistent
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Lernfeld-Fehleranalyse (LF 1 - 12), Wissenslücken-Erkennung & gezielte Lab-Wiederholungs-Sitzungen
                {isRealData && <span style={{ marginLeft: '8px', color: 'var(--accent-teal)', fontWeight: 700 }}>• Live aus Fehlerjournal synchronisiert</span>}
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
            background: xpClaimed ? 'var(--accent-emerald)' : 'var(--accent-purple)',
            color: 'var(--text-on-accent)',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', borderTop: '4px solid var(--accent-purple)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Gesamt-Erfolgsquote</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: audit.overallScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '4px' }}>
            {audit.overallScore}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{activeHistory.length} Prüfungsantworten ausgewertet</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Kritische Wissenslücken</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: audit.weakFields.length === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
            {audit.weakFields.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Lernfelder mit &gt;30% Fehlerquote</div>
        </div>
      </div>

      {/* Targeted Recommendations */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Target size={20} color="var(--accent-purple)" /> Gezielte Wiederholungs-Empfehlungen
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {simulatedHistory !== null && (
              <button
                onClick={handleUseRealJournal}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Journal-Daten wiederherstellen
              </button>
            )}
            <button
              onClick={handleResetHistory}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Alle Lücken geschlossen simulieren
            </button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--accent-emerald)' }}>Hervorragend! Keine kritischen Wissenslücken erkannt.</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Du beherrschst alle IHK-Lernfelder mit hoher Trefferquote.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
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
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{rec.title}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(239,68,68,0.2)', color: 'var(--accent-rose)' }}>
                      {rec.errorRatePercent}% Fehler
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
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
                      background: 'var(--accent-rose)',
                      color: 'var(--text-on-accent)',
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
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-main)' }}>
          Interaktiver Quiz-Simulator (Fehler/Treffer erfassen)
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {IHK_LEARN_FIELDS.slice(0, 6).map(lf => (
            <div key={lf.id} style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleSimulateQuizResult(lf.id, true)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + {lf.id} Richtig
              </button>
              <button
                onClick={() => handleSimulateQuizResult(lf.id, false)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
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
