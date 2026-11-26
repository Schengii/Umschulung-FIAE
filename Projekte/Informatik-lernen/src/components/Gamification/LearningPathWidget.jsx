import React, { useMemo, useState } from 'react';
import { Compass, BellOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { LAB_MODULES } from '../../data/labModulesData';
import { resolveLabKey } from '../../data/labRegistry';
import { EXAM_QUESTIONS } from '../../data/examData';
import { toDateKey } from '../../utils/mistakeJournalEngine';
import { DRILL_LAB_BY_QUESTION_ID } from '../../data/drillQuestions';
import { useStudyPlan } from '../Shared/useStudyPlan';
import { MIX_DAYS_TARGET } from '../../utils/studyPlanEngine';
import { CAREER_FILTERS, countMistakesByDomain, countMistakesByLab, recommendLearningPath } from '../../utils/learningPathEngine';

// Dashboard-Karte "Empfohlen für dich": die 3 besten nächsten Labs mit Begründung,
// abgeleitet aus Einstufungstest, Fehlerjournal, Prüfungstermin, Rolle und Fortschritt.

export default function LearningPathWidget({ onSelectLab }) {
  const userState = useStore((s) => s.userState);
  const setCareerFilter = useStore((s) => s.setCareerFilter);
  const snoozePathLab = useStore((s) => s.snoozePathLab);
  const [now] = useState(() => new Date());

  const careerId = userState.careerFilter || 'all';
  const plan = useStudyPlan();
  const week = plan.weeks.find((w) => w.isCurrent);
  const recommendations = useMemo(
    () =>
      recommendLearningPath({
        modules: LAB_MODULES,
        placement: userState.placementResult,
        mistakeCounts: countMistakesByDomain(userState.mistakeJournal, EXAM_QUESTIONS),
        labMistakeCounts: countMistakesByLab(userState.mistakeJournal, DRILL_LAB_BY_QUESTION_ID),
        progress: userState.labProgress,
        resolveKey: resolveLabKey,
        role: userState.role,
        examDate: userState.examTargetDate,
        careerId,
        snoozed: userState.pathSnoozed,
        now
      }),
    [userState.placementResult, userState.mistakeJournal, userState.labProgress, userState.role, userState.examTargetDate, userState.pathSnoozed, careerId, now]
  );

  const snooze = (labId) => {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    snoozePathLab(labId, toDateKey(tomorrow));
  };

  return (
    <section className="glass-panel" aria-labelledby="learning-path-title" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-teal, #14b8a6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <h3 id="learning-path-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} aria-hidden="true" /> Empfohlen für dich
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="learning-path-career" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Beruf</label>
          <select id="learning-path-career" className="btn btn-secondary btn-sm" value={careerId} onChange={(e) => setCareerFilter(e.target.value)}>
            {CAREER_FILTERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {week && (
        <p style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
          <strong>Diese Woche:</strong>{' '}
          {week.targets.labs > 0 ? `${Math.min(week.done.labs, week.targets.labs)}/${week.targets.labs} Labs · ` : ''}
          {Math.min(week.done.mixDays, MIX_DAYS_TARGET)}/{MIX_DAYS_TARGET} Lernmix-Tage ·{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onSelectLab('ihk_study_plan_lab')} style={{ width: 'auto', minHeight: 0, padding: '2px 10px' }}>
            Prüfungsplan öffnen
          </button>
        </p>
      )}

      {!userState.placementResult && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
          Tipp: Mit dem Einstufungstest (Karte „Heute lernen“) erkenne ich deine schwächsten Bereiche und empfehle gezielter.
        </p>
      )}

      {recommendations.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Keine offenen Empfehlungen für diesen Filter – du hast alles abgeschlossen oder ausgeblendet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
          {recommendations.map(({ lab, reason }) => {
            const Icon = lab.icon;
            return (
              <li key={lab.id} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onSelectLab(lab.id)}
                  style={{ flex: 1, minWidth: 0, width: 'auto', justifyContent: 'flex-start', gap: '10px', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', height: 'auto', border: '1px solid var(--border-color)' }}
                >
                  {Icon && <Icon size={18} color={lab.color} aria-hidden="true" style={{ flexShrink: 0 }} />}
                  <span style={{ display: 'grid', gap: '2px' }}>
                    <span style={{ fontWeight: 700 }}>{lab.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{reason} · {lab.difficulty}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => snooze(lab.id)}
                  style={{ width: 'auto', flexShrink: 0 }}
                  aria-label={`${lab.title} bis morgen ausblenden`}
                  title="Nicht jetzt (bis morgen ausblenden)"
                >
                  <BellOff size={14} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
