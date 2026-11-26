// @ts-check
/**
 * @file studyPlanEngine.js
 * Adaptiver Prüfungsplan: leitet aus Einstufung, Fehlern, Fortschritt und Prüfungstermin einen
 * rollierenden Plan für die nächsten bis zu 4 Wochen ab. Der Plan wird nie gespeichert, sondern bei
 * jedem Aufruf neu berechnet – abgeschlossene Labs fallen dadurch automatisch heraus.
 * Reine Logik, das Datum wird als Parameter übergeben.
 */
import { daysUntil, domainOfLab, isIhkRelated, recommendLearningPath } from './learningPathEngine';
import { toDateKey } from './mistakeJournalEngine';

export const PLAN_HORIZON_WEEKS = 4;
export const HOURS_PER_LAB = 2;
export const MIX_DAYS_TARGET = 5;
/** Ab so vielen Tagen bis zur Prüfung wird nur noch gefestigt (keine neuen Labs). */
export const CONSOLIDATE_DAYS = 14;
/** Ab so vielen Tagen bis zur Prüfung kommen nur noch IHK-relevante Labs. */
export const DEEPEN_DAYS = 28;

/** Planer-Fachrichtung → Berufsfilter der Labs (siehe `matchesCareer`). */
export const DISCIPLINE_TO_CAREER = /** @type {Record<string, string>} */ ({
  fiae: 'fiae',
  fidp: 'fiae',
  fisi: 'fisi',
  fidv: 'fisi',
  itse: 'itse',
  itsm: 'wiso'
});

/**
 * Fachrichtung, die zu einem gespeicherten Berufsfilter passt.
 * @param {string | undefined} careerId
 * @returns {string}
 */
export function disciplineForCareer(careerId) {
  switch (careerId) {
    case 'fisi': return 'fisi';
    case 'itse': return 'itse';
    case 'wiso': return 'itsm';
    default: return 'fiae';
  }
}

/**
 * @typedef {Object} PlanLab
 * @property {import('./learningPathEngine').PathLab} lab
 * @property {string} reason
 */

/**
 * @typedef {Object} PlanWeek
 * @property {number} weekNumber
 * @property {string} startDate
 * @property {string} endDate
 * @property {'learn'|'deepen'|'consolidate'} phase
 * @property {PlanLab[]} labs
 * @property {string[]} tasks
 * @property {boolean} retest
 * @property {boolean} isCurrent
 * @property {{ labs: number, mixDays: number }} targets
 * @property {{ labs: number, mixDays: number }} done
 */

/**
 * @typedef {Object} StudyPlan
 * @property {'none'|'expired'|'active'} status
 * @property {number | null} daysLeft
 * @property {string} planStart Wirksamer Planstart (kann vom gespeicherten abweichen)
 * @property {PlanWeek[]} weeks
 */

/**
 * @param {string} dateKey YYYY-MM-DD
 * @returns {Date}
 */
function parseKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * @param {number} daysLeft
 * @returns {'learn'|'deepen'|'consolidate'}
 */
export function phaseForDaysLeft(daysLeft) {
  if (daysLeft <= CONSOLIDATE_DAYS) return 'consolidate';
  if (daysLeft <= DEEPEN_DAYS) return 'deepen';
  return 'learn';
}

/**
 * Baut den Plan für die nächsten Wochen.
 * @param {Object} input
 * @param {import('./learningPathEngine').PathLab[]} input.modules
 * @param {any} [input.placement]
 * @param {Record<string, number>} [input.mistakeCounts]
 * @param {Record<string, number>} [input.labMistakeCounts]
 * @param {Record<string, { completed?: boolean, completedOn?: string }> | null} [input.progress]
 * @param {(moduleId: string) => string} [input.resolveKey]
 * @param {string} [input.role]
 * @param {string | null} [input.examDate] YYYY-MM-DD
 * @param {string} [input.careerId]
 * @param {number} [input.hoursPerWeek]
 * @param {string} [input.planStart] Gespeicherter Beginn von Woche 1
 * @param {string[]} [input.mixDays] Tage mit erledigtem Lernmix
 * @param {Date} [input.now]
 * @returns {StudyPlan}
 */
export function buildStudyPlan({
  modules,
  placement = null,
  mistakeCounts = {},
  labMistakeCounts = {},
  progress = null,
  resolveKey = (id) => id,
  role = 'anfaenger',
  examDate = null,
  careerId = 'all',
  hoursPerWeek = 6,
  planStart = '',
  mixDays = [],
  now = new Date()
}) {
  const today = toDateKey(now);
  const daysLeft = daysUntil(examDate, now);
  if (daysLeft === null) return { status: 'none', daysLeft: null, planStart: today, weeks: [] };
  if (daysLeft < 0) return { status: 'expired', daysLeft, planStart: today, weeks: [] };

  // Wirksamer Start: der gespeicherte, solange der 4-Wochen-Abschnitt läuft, sonst heute (rollierend)
  const horizonDays = PLAN_HORIZON_WEEKS * 7;
  const storedValid = /^\d{4}-\d{2}-\d{2}$/.test(planStart) && planStart <= today && toDateKey(addDays(parseKey(planStart), horizonDays)) > today;
  const start = storedValid ? parseKey(planStart) : parseKey(today);
  const daysFromStart = /** @type {number} */ (daysUntil(/** @type {string} */ (examDate), start));
  const weekCount = Math.max(1, Math.min(PLAN_HORIZON_WEEKS, Math.ceil((daysFromStart + 1) / 7)));
  const labsPerWeek = Math.max(1, Math.round(hoursPerWeek / HOURS_PER_LAB));

  // Lern- und Prüfungswerkzeuge (Quiz, Karteikarten, Planer selbst …) haben keinen Prüfungsbereich und gehören nicht in einen Lernplan
  const planModules = modules.filter((lab) => domainOfLab(lab) !== null);
  const mixSet = new Set(mixDays);
  const completedOn = Object.values(progress || {})
    .map((entry) => (entry && entry.completed ? entry.completedOn : undefined))
    .filter((d) => typeof d === 'string');

  /** @type {string[]} */
  const usedIds = [];
  /** @type {PlanWeek[]} */
  const weeks = [];
  for (let w = 1; w <= weekCount; w++) {
    const weekStart = addDays(start, (w - 1) * 7);
    const weekEnd = addDays(weekStart, 6);
    const startKey = toDateKey(weekStart);
    const endKey = toDateKey(weekEnd);
    const daysLeftAtStart = /** @type {number} */ (daysUntil(/** @type {string} */ (examDate), weekStart));
    const phase = phaseForDaysLeft(daysLeftAtStart);
    const containsExam = daysLeftAtStart >= 0 && daysLeftAtStart <= 6;

    /** @type {PlanLab[]} */
    let labs = [];
    /** @type {string[]} */
    const tasks = [];
    if (phase === 'consolidate') {
      tasks.push('Fehlerjournal wiederholen', 'Karteikarten (SM-2) durchgehen');
      tasks.push(containsExam ? 'Ausgeruht in die Prüfung gehen: nur noch leicht wiederholen' : 'Prüfungssimulation unter Zeitdruck machen');
    } else {
      const pool = phase === 'deepen' ? planModules.filter(isIhkRelated) : planModules;
      labs = recommendLearningPath({
        modules: pool.length > 0 ? pool : planModules,
        placement,
        mistakeCounts,
        labMistakeCounts,
        progress,
        resolveKey,
        role,
        examDate,
        careerId,
        excludeIds: usedIds,
        now,
        limit: labsPerWeek
      }).map((r) => ({ lab: r.lab, reason: r.reason }));
      for (const item of labs) usedIds.push(item.lab.id);
      if (phase === 'deepen') tasks.push('Prüfungssimulation (90 Minuten) einplanen');
    }
    const retest = w === weekCount && weekCount >= 2 && phase === 'learn';
    if (retest) tasks.push('Einstufungstest wiederholen, damit der Plan deine Fortschritte neu misst');

    weeks.push({
      weekNumber: w,
      startDate: startKey,
      endDate: endKey,
      phase,
      labs,
      tasks,
      retest,
      isCurrent: today >= startKey && today <= endKey,
      targets: { labs: phase === 'consolidate' ? 0 : labsPerWeek, mixDays: MIX_DAYS_TARGET },
      done: {
        labs: completedOn.filter((d) => d >= startKey && d <= endKey).length,
        mixDays: [...mixSet].filter((d) => d >= startKey && d <= endKey).length
      }
    });
  }
  return { status: 'active', daysLeft, planStart: toDateKey(start), weeks };
}
