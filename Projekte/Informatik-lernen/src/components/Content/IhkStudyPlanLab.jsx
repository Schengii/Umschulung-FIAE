import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Target, ArrowRight, Award, Check, RefreshCw } from 'lucide-react';
import { IHK_DISCIPLINES, calculateExamCountdown, getIhkExamDates } from '../../utils/ihkStudyPlanEngine';
import { DISCIPLINE_TO_CAREER, MIX_DAYS_TARGET, disciplineForCareer } from '../../utils/studyPlanEngine';
import { useStudyPlan } from '../Shared/useStudyPlan';
import { useStore } from '../../store/useStore';

const HOURS_OPTIONS = [3, 6, 10];
const PHASE_LABELS = {
  learn: 'Lernen',
  deepen: 'Vertiefen (IHK)',
  consolidate: 'Festigen'
};

const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-main)',
  fontSize: '0.95rem',
  fontWeight: 600
};

function formatDay(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function formatFullDay(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Fortschrittszeile „x von y“ mit Balken
function Goal({ label, done, target }) {
  const percent = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 100;
  return (
    <div style={{ minWidth: '170px' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {label}: {done} von {target}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(done, target)}
        style={{ height: '6px', borderRadius: '999px', background: 'var(--border-color)', overflow: 'hidden', marginTop: '4px' }}
      >
        <div style={{ width: `${percent}%`, height: '100%', background: percent >= 100 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
      </div>
    </div>
  );
}

export default function IhkStudyPlanLab({ onNavigateTab, onRewardXP }) {
  const userState = useStore((s) => s.userState);
  const setUserState = useStore((s) => s.setUserState);
  const setCareerFilter = useStore((s) => s.setCareerFilter);
  const setStudyPlanPrefs = useStore((s) => s.setStudyPlanPrefs);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [now] = useState(() => new Date());

  const examDate = userState.examTargetDate || '';
  const hoursPerWeek = userState.studyHoursPerWeek || 6;
  const discipline = disciplineForCareer(userState.careerFilter);
  const plan = useStudyPlan();

  // Der wirksame Planstart (rollierend) wird gespeichert, damit die Wochengrenzen stabil bleiben
  useEffect(() => {
    if (plan.status === 'active' && plan.planStart !== userState.studyPlanStart) {
      setStudyPlanPrefs({ planStart: plan.planStart });
    }
  }, [plan.status, plan.planStart, userState.studyPlanStart, setStudyPlanPrefs]);

  const examOptions = useMemo(() => {
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const all = [...getIhkExamDates(now.getFullYear() - 1), ...getIhkExamDates(now.getFullYear())].filter((e) => e.date >= todayKey);
    const unique = all.filter((e, i) => all.findIndex((x) => x.date === e.date) === i);
    if (examDate && !unique.some((e) => e.date === examDate)) {
      unique.unshift({ id: 'custom', name: `Eigener Termin (${formatFullDay(examDate)})`, date: examDate });
    }
    return unique;
  }, [now, examDate]);

  const countdown = examDate ? calculateExamCountdown(examDate, now) : null;
  const currentWeek = plan.weeks.find((w) => w.isCurrent);
  const weekTarget = currentWeek ? currentWeek.targets.labs + MIX_DAYS_TARGET : 0;
  const weekDone = currentWeek ? Math.min(currentWeek.done.labs, currentWeek.targets.labs) + Math.min(currentWeek.done.mixDays, MIX_DAYS_TARGET) : 0;
  const weekPercent = weekTarget > 0 ? Math.round((weekDone / weekTarget) * 100) : 0;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-amber), #d97706)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
            <Calendar size={28} aria-hidden="true" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              IHK Prüfungs-Countdown & Adaptiver Lernplaner
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Dein Plan für die nächsten Wochen – berechnet aus Einstufungstest, Fehlerjournal, Fortschritt und Prüfungstermin
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimXP}
          disabled={xpClaimed}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: xpClaimed ? 'var(--accent-emerald)' : 'var(--accent-amber)',
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

      {/* Countdown */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 700 }}>
            Verbleibende Zeit bis zur IHK-Abschlussprüfung
          </div>
          {countdown ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: '16px', rowGap: '4px', marginTop: '8px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-amber)' }}>{countdown.daysRemaining}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tage</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{countdown.weeksRemaining}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Wochen</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Prüfungstermin: <strong>{formatFullDay(examDate)}</strong>
              </div>
            </>
          ) : (
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Wähle unten deinen Prüfungstermin, dann entsteht dein Plan.</p>
          )}
        </div>

        {currentWeek && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Diese Woche</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: weekPercent >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '4px' }}>
              {weekPercent}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {weekDone} von {weekTarget} Zielen erreicht
            </div>
          </div>
        )}
      </div>

      {/* Einstellungen */}
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
        <div>
          <label htmlFor="study-plan-exam" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
            IHK Prüfungstermin:
          </label>
          <select
            id="study-plan-exam"
            value={examDate}
            onChange={(e) => setUserState((prev) => ({ ...prev, examTargetDate: e.target.value }))}
            style={selectStyle}
          >
            {!examDate && <option value="">Bitte Termin wählen …</option>}
            {examOptions.map((e) => (
              <option key={e.id} value={e.date}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="study-plan-discipline" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
            Deine Fachrichtung:
          </label>
          <select
            id="study-plan-discipline"
            value={discipline}
            onChange={(e) => setCareerFilter(DISCIPLINE_TO_CAREER[e.target.value] || 'all')}
            style={selectStyle}
          >
            {IHK_DISCIPLINES.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="study-plan-hours" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
            Lernzeit pro Woche:
          </label>
          <select
            id="study-plan-hours"
            value={hoursPerWeek}
            onChange={(e) => setStudyPlanPrefs({ hoursPerWeek: Number(e.target.value) })}
            style={selectStyle}
          >
            {[...new Set([...HOURS_OPTIONS, hoursPerWeek])].sort((a, b) => a - b).map((h) => (
              <option key={h} value={h}>{h} Stunden</option>
            ))}
          </select>
        </div>
      </div>

      {/* Zustände ohne Plan */}
      {plan.status === 'none' && (
        <p role="status" style={{ color: 'var(--text-muted)' }}>Ohne Prüfungstermin gibt es noch keinen Plan.</p>
      )}
      {plan.status === 'expired' && (
        <p role="status" style={{ color: 'var(--text-muted)' }}>
          Dieser Prüfungstermin liegt in der Vergangenheit. Wähle oben einen neuen Termin, dann entsteht ein frischer Plan.
        </p>
      )}

      {/* Wochenplan */}
      {plan.status === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Target size={22} color="var(--accent-amber)" aria-hidden="true" /> Dein personalisierter Wochenplan
          </h2>

          <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plan.weeks.map((week) => (
              <div
                key={week.weekNumber}
                role="listitem"
                style={{
                  background: 'var(--bg-card)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  borderLeft: `6px solid ${week.isCurrent ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)' }}>
                    Woche {week.weekNumber}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {formatDay(week.startDate)} – {formatDay(week.endDate)} · {PHASE_LABELS[week.phase]}
                  </span>
                  {week.isCurrent && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>Aktuelle Woche</span>}
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {week.targets.labs > 0 && <Goal label="Labs abgeschlossen" done={week.done.labs} target={week.targets.labs} />}
                  <Goal label="Lernmix-Tage" done={week.done.mixDays} target={week.targets.mixDays} />
                </div>

                {week.labs.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {week.labs.map(({ lab, reason }) => (
                      <li key={lab.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'grid', gap: '2px', minWidth: 0 }}>
                          <span style={{ fontWeight: 700 }}>{lab.title}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{reason}</span>
                        </span>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab(lab.id)}
                            aria-label={`Lab öffnen: ${lab.title}`}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}
                          >
                            Lab öffnen <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {week.tasks.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', display: 'grid', gap: '4px' }}>
                    {week.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                )}

                {(week.phase !== 'learn' || week.retest) && onNavigateTab && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {week.phase !== 'learn' && (
                      <button
                        onClick={() => onNavigateTab('exam')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: 'auto' }}
                      >
                        Prüfungssimulation öffnen
                      </button>
                    )}
                    {week.retest && (
                      <button
                        onClick={() => onNavigateTab('dashboard')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}
                      >
                        <RefreshCw size={14} aria-hidden="true" /> Zum Einstufungstest (Dashboard)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
