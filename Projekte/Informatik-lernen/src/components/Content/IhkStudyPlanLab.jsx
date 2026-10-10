import React, { useState, useMemo } from 'react';
import { 
  Calendar, Target, CheckCircle2, 
  ArrowRight, Award, Check 
} from 'lucide-react';
import { 
  IHK_EXAM_DATES, 
  IHK_DISCIPLINES, 
  calculateExamCountdown, 
  generateAdaptiveStudyPlan 
} from '../../utils/ihkStudyPlanEngine';
import { useStore } from '../../store/useStore';

export default function IhkStudyPlanLab({ onNavigateTab }) {
  const { awardXP } = useStore();
  const [selectedExamId, setSelectedExamId] = useState('winter_2026');
  const [selectedDiscipline, setSelectedDiscipline] = useState('fiae');
  const [completedWeeks, setCompletedWeeks] = useState({});
  const [xpClaimed, setXpClaimed] = useState(false);

  const selectedExam = useMemo(() => {
    return IHK_EXAM_DATES.find(e => e.id === selectedExamId) || IHK_EXAM_DATES[0];
  }, [selectedExamId]);

  const countdown = useMemo(() => {
    return calculateExamCountdown(selectedExam.date);
  }, [selectedExam]);

  const studyPlan = useMemo(() => {
    return generateAdaptiveStudyPlan(selectedDiscipline, countdown.weeksRemaining || 8);
  }, [selectedDiscipline, countdown.weeksRemaining]);

  const toggleWeek = (weekNum) => {
    setCompletedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const completedCount = Object.values(completedWeeks).filter(Boolean).length;
  const progressPercent = studyPlan.length > 0 ? Math.round((completedCount / studyPlan.length) * 100) : 0;

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'IHK Prüfungs-Countdown & Lernplaner eingerichtet!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Calendar size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                IHK Prüfungs-Countdown & Adaptiver Lernplaner
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Wochenbasierte Vorbereitung für FIAE, FISI, FIDP & IT-SE mit IHK-Prüfungsterminen
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
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #f59e0b, #b45309)',
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

      {/* Countdown Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: '24px', borderRadius: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>
            Verbleibende Zeit bis zur IHK-Abschlussprüfung
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '8px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b' }}>
              {countdown.daysRemaining}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#cbd5e1' }}>Tage</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginLeft: '12px' }}>
              {countdown.weeksRemaining}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#cbd5e1' }}>Wochen</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>
            Prüfungstermin: <strong>{new Date(selectedExam.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
          </div>
        </div>

        {/* Progress Circle / Box */}
        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px 24px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Lernplan Fortschritt</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: progressPercent >= 70 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {completedCount} von {studyPlan.length} Wochen absolviert
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
            IHK Prüfungstermin:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            {IHK_EXAM_DATES.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
            Deine Fachrichtung:
          </label>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--input-bg, #ffffff)',
              color: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            {IHK_DISCIPLINES.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Plan Roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={22} color="#f59e0b" /> Dein personalisierter Wochenplan
        </h2>

        {studyPlan.map((week) => {
          const isDone = !!completedWeeks[week.weekNumber];

          return (
            <div
              key={week.weekNumber}
              style={{
                background: 'var(--card-bg, #ffffff)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderLeft: isDone ? '6px solid #10b981' : '6px solid #f59e0b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                opacity: isDone ? 0.75 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: isDone ? '#dcfce7' : '#fef3c7', color: isDone ? '#15803d' : '#b45309' }}>
                    Woche {week.weekNumber}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>~{week.targetHours}h Lernaufwand</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0', textDecoration: isDone ? 'line-through' : 'none' }}>
                  {week.title}
                </h3>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {week.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(week.recommendedLab)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'transparent',
                      color: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Lab öffnen <ArrowRight size={14} />
                  </button>
                )}

                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isDone ? '#10b981' : '#f1f5f9',
                    color: isDone ? '#fff' : '#1e293b',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {isDone ? 'Erledigt' : 'Als erledigt markieren'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
