import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { LAB_MODULES } from '../../data/labModulesData';
import { resolveLabKey } from '../../data/labRegistry';
import { EXAM_QUESTIONS } from '../../data/examData';
import { DRILL_LAB_BY_QUESTION_ID } from '../../data/drillQuestions';
import { countMistakesByDomain, countMistakesByLab } from '../../utils/learningPathEngine';
import { buildStudyPlan } from '../../utils/studyPlanEngine';

/**
 * Leitet den adaptiven Prüfungsplan aus dem Spielstand ab (siehe studyPlanEngine).
 * Gemeinsam genutzt vom Prüfungsplaner und von der Dashboard-Karte „Empfohlen für dich“.
 * @param {{ hoursPerWeek?: number }} [options] Überschreibt die gespeicherten Wochenstunden
 */
export function useStudyPlan(options = {}) {
  const userState = useStore((s) => s.userState);
  const [now] = useState(() => new Date());
  const hoursPerWeek = options.hoursPerWeek ?? userState.studyHoursPerWeek ?? 6;

  return useMemo(
    () =>
      buildStudyPlan({
        modules: LAB_MODULES,
        placement: userState.placementResult,
        mistakeCounts: countMistakesByDomain(userState.mistakeJournal, EXAM_QUESTIONS),
        labMistakeCounts: countMistakesByLab(userState.mistakeJournal, DRILL_LAB_BY_QUESTION_ID),
        progress: userState.labProgress,
        resolveKey: resolveLabKey,
        role: userState.role,
        examDate: userState.examTargetDate,
        careerId: userState.careerFilter || 'all',
        hoursPerWeek,
        planStart: userState.studyPlanStart,
        mixDays: userState.mixDays,
        now
      }),
    [
      userState.placementResult, userState.mistakeJournal, userState.labProgress, userState.role,
      userState.examTargetDate, userState.careerFilter, userState.studyPlanStart, userState.mixDays, hoursPerWeek, now
    ]
  );
}
