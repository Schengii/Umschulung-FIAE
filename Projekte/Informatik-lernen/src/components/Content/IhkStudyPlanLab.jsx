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

// Stabile Referenz: ein `|| {}` im Render erzeugt jedes Mal ein neues Objekt und entwertet useMemo-Abhängigkeiten.
const EMPTY_OBJECT = Object.freeze({});

export default function IhkStudyPlanLab({ onNavigateTab, onRewardXP, userState }) {
  const storeUserState = useStore((s) => s.userState);
  const storeToggleWeek = useStore((s) => s.toggleStudyPlanWeek);

  const currentUserState = userState || storeUserState;
  const persistedWeeks = currentUserState?.studyPlanWeeks || EMPTY_OBJECT;

  const [selectedExamId, setSelectedExamId] = useState('winter_2026');
  const [selectedDiscipline, setSelectedDiscipline] = useState('fiae');
  const [localWeeks, setLocalWeeks] = useState({});
  const [xpClaimed, setXpClaimed] = useState(false);

  // Kombinierter Zustand: Persistierter Zustand hat Vorrang bzw. wird mit lokalem Zustand vereint
  const completedWeeks = useMemo(() => {
    return { ...localWeeks, ...persistedWeeks };
  }, [localWeeks, persistedWeeks]);

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
    if (storeToggleWeek) {
      storeToggleWeek(weekNum);
    } else {
      setLocalWeeks(prev => ({
        ...prev,
        [weekNum]: !prev[weekNum]
      }));
    }
  };

  const completedCount = Object.values(completedWeeks).filter(Boolean).length;
  const progressPercent = studyPlan.length > 0 ? Math.round((completedCount / studyPlan.length) * 100) : 0;

  const handleClaimXP = () => {
    if (!xpClaimed && onRewardXP) {
      onRewardXP(60, 'study_plan_master');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-amber), #d97706)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Calendar size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                IHK Prüfungs-Countdown & Adaptiver Lernplaner
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Wochenbasierte Vorbereitung für FIAE, FISI, FIDP, FIDV, IT-SE & ITSM mit IHK-Prüfungsterminen
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
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, var(--accent-amber), #b45309)',
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
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '24px', borderRadius: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 700 }}>
            Verbleibende Zeit bis zur IHK-Abschlussprüfung
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '8px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
              {countdown.daysRemaining}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tage</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginLeft: '12px' }}>
              {countdown.weeksRemaining}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Wochen</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Prüfungstermin: <strong>{new Date(selectedExam.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
          </div>
        </div>

        {/* Progress Box */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '16px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lernplan Fortschritt</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: progressPercent >= 70 ? '#10b981' : 'var(--accent-amber)', marginTop: '4px' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {completedCount} von {studyPlan.length} Wochen absolviert
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
            IHK Prüfungstermin:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
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
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
            Deine Fachrichtung:
          </label>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Target size={22} color="var(--accent-amber)" /> Dein personalisierter Wochenplan
        </h2>

        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {studyPlan.map((week) => {
            const isDone = !!completedWeeks[week.weekNumber];

            return (
              <div
                key={week.weekNumber}
                role="listitem"
                style={{
                  background: 'var(--bg-card)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  borderLeft: isDone ? '6px solid #10b981' : '6px solid var(--accent-amber)',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: isDone ? '#10b981' : 'var(--accent-amber)' }}>
                      Woche {week.weekNumber}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>~{week.targetHours}h Lernaufwand</span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0', textDecoration: isDone ? 'line-through' : 'none', color: 'var(--text-main)' }}>
                    {week.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {week.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
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
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-main)',
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
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Woche ${week.weekNumber} als ${isDone ? 'offen' : 'erledigt'} markieren`}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isDone ? '#10b981' : 'var(--bg-tertiary)',
                      color: isDone ? '#fff' : 'var(--text-main)',
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
    </div>
  );
}
