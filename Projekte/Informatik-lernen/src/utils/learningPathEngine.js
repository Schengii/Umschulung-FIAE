// @ts-check
/**
 * @file learningPathEngine.js
 * Lernpfad „Empfohlen für dich“: bewertet jedes Lab anhand von Einstufungstest,
 * Fehlerjournal, Prüfungstermin, Rolle und Fortschritt und liefert die besten
 * Empfehlungen mit Begründung. Reine Logik, Datum wird als Parameter übergeben.
 */
import { matchesCareer } from './labProgressEngine';
import { domainOfQuestion, weakestDomains } from './learningMixEngine';
import { toDateKey } from './mistakeJournalEngine';

/**
 * @typedef {Object} PathLab
 * @property {string} id
 * @property {string} category
 * @property {string[]} tags
 * @property {string} difficulty
 * @property {string} [badge]
 * @property {string} [examDomain] Optionale feste Zuordnung zu 'ap1' | 'ap2_1' | 'ap2_2' | 'wiso'
 */

/**
 * @typedef {Object} PathRecommendation
 * @property {PathLab} lab
 * @property {number} score
 * @property {string} reason
 */

export const DOMAIN_LABELS = /** @type {Record<string, string>} */ ({
  ap1: 'AP1',
  ap2_1: 'AP2 Planen & Konzipieren',
  ap2_2: 'AP2 Entwicklung & Fachaufgaben',
  wiso: 'WiSo'
});

/** Berufsfilter, Single Source für Dashboard-Karte und Labs-Dashboard (Schlüssel siehe `matchesCareer`). */
export const CAREER_FILTERS = [
  { id: 'all', name: 'Alle Berufe' },
  { id: 'ap1', name: 'AP1 Kernqualifikationen' },
  { id: 'fiae', name: 'FIAE (Anwendungsentwicklung)' },
  { id: 'fisi', name: 'FISI (Systemintegration)' },
  { id: 'itse', name: 'IT-SE (Systemelektronik)' },
  { id: 'wiso', name: 'WiSo & BWL' }
];

/** Tage, ab denen die Prüfungsnähe IHK-Labs bevorzugt. */
export const EXAM_PROXIMITY_DAYS = 60;

const DEV_CATEGORIES = ['algorithms', 'databases', 'database', 'fiae', 'code', 'ai', 'architecture', 'tools'];
const PLAN_CATEGORIES = ['network', 'security', 'cloud', 'devops', 'hardware', 'linux'];

/** Passende Schwierigkeitsgrade je Rolle. */
const ROLE_DIFFICULTIES = /** @type {Record<string, string[]>} */ ({
  anfaenger: ['Beginner', 'Intermediate'],
  azubi: ['Intermediate'],
  junior: ['Intermediate', 'Advanced'],
  pro: ['Advanced', 'Expert']
});

/**
 * Ordnet ein Lab einem Prüfungsbereich zu (oder `null`, wenn nicht eindeutig).
 * Ein gesetztes `examDomain` hat Vorrang vor der Heuristik.
 * @param {PathLab} lab
 * @returns {'ap1'|'ap2_1'|'ap2_2'|'wiso'|null}
 */
export function domainOfLab(lab) {
  if (lab.examDomain && lab.examDomain in DOMAIN_LABELS) return /** @type {any} */ (lab.examDomain);
  const tags = lab.tags || [];
  if (lab.category === 'wiso' || tags.some((t) => /wiso/i.test(t))) return 'wiso';
  if (tags.some((t) => /ap1/i.test(t))) return 'ap1';
  if (DEV_CATEGORIES.includes(lab.category)) return 'ap2_2';
  if (PLAN_CATEGORIES.includes(lab.category)) return 'ap2_1';
  return null;
}

/**
 * Anzahl offener Journal-Einträge je Bereich (nur Fragen, die im Katalog stehen).
 * @param {Record<string, unknown> | null | undefined} journal
 * @param {{ id: number|string, examType?: string, category?: string }[]} questions
 * @returns {Record<string, number>}
 */
export function countMistakesByDomain(journal, questions) {
  /** @type {Record<string, number>} */
  const counts = {};
  const byId = new Map(questions.map((q) => [String(q.id), q]));
  for (const id of Object.keys(journal || {})) {
    const q = byId.get(id);
    if (!q) continue;
    const d = domainOfQuestion(q);
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}

/**
 * Anzahl offener Journal-Einträge je Lab (nur Drill-Fragen, die einem Lab zugeordnet sind).
 * @param {Record<string, unknown> | null | undefined} journal
 * @param {Record<string, string>} labByQuestionId Frage-ID → Modul-ID (`DRILL_LAB_BY_QUESTION_ID`)
 * @returns {Record<string, number>}
 */
export function countMistakesByLab(journal, labByQuestionId) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const id of Object.keys(journal || {})) {
    const lab = labByQuestionId[id];
    if (lab) counts[lab] = (counts[lab] || 0) + 1;
  }
  return counts;
}

/**
 * Verbleibende Tage bis zum Datum (YYYY-MM-DD), negativ wenn vorbei, `null` ohne gültiges Datum.
 * @param {string | undefined | null} dateStr
 * @param {Date} now
 * @returns {number | null}
 */
export function daysUntil(dateStr, now) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/**
 * Hat das Lab IHK-Bezug (Badge oder Tag)?
 * @param {PathLab} lab
 */
export function isIhkRelated(lab) {
  return Boolean(lab.badge?.includes('IHK')) || (lab.tags || []).some((t) => /ihk|ap1|ap2/i.test(t));
}

/**
 * @param {{ placement?: any, domain: string|null }} p
 * @returns {{ weakness: number, rate: number | null }}
 */
function weaknessOf({ placement, domain }) {
  const r = domain ? placement?.domains?.[domain] : null;
  if (!r || !(r.total > 0)) return { weakness: 0, rate: null };
  const rate = r.correct / r.total;
  return { weakness: 1 - rate, rate };
}

/**
 * Bewertet alle Labs und liefert die besten `limit` Empfehlungen (je Kategorie höchstens eine).
 * @param {Object} input
 * @param {PathLab[]} input.modules
 * @param {any} [input.placement] Ergebnis des Einstufungstests
 * @param {Record<string, number>} [input.mistakeCounts] Offene Fehler je Bereich (`countMistakesByDomain`)
 * @param {Record<string, number>} [input.labMistakeCounts] Offene Drill-Fehler je Lab (`countMistakesByLab`)
 * @param {Record<string, { completed?: boolean }> | null} [input.progress]
 * @param {(moduleId: string) => string} [input.resolveKey] Modul-ID → Schlüssel im Fortschritt
 * @param {string} [input.role]
 * @param {string | null} [input.examDate] YYYY-MM-DD
 * @param {string} [input.careerId]
 * @param {string[]} [input.excludeIds] Lab-IDs, die nicht empfohlen werden sollen (z. B. schon im Plan)
 * @param {Record<string, string>} [input.snoozed] Lab-ID → Datum, bis zu dem es ausgeblendet bleibt (exklusiv)
 * @param {Date} [input.now]
 * @param {number} [input.limit]
 * @returns {PathRecommendation[]}
 */
export function recommendLearningPath({
  modules,
  placement = null,
  mistakeCounts = {},
  labMistakeCounts = {},
  progress = null,
  resolveKey = (id) => id,
  role = 'anfaenger',
  examDate = null,
  careerId = 'all',
  snoozed = {},
  excludeIds = [],
  now = new Date(),
  limit = 3
}) {
  const today = toDateKey(now);
  const days = daysUntil(examDate, now);
  const examNear = days !== null && days >= 0 && days <= EXAM_PROXIMITY_DAYS;
  const weakest = placement ? weakestDomains(placement)[0] : null;
  const fitting = ROLE_DIFFICULTIES[role] || ROLE_DIFFICULTIES.anfaenger;

  const scored = modules
    .map((lab, index) => ({ lab, index }))
    .filter(({ lab }) => !progress?.[resolveKey(lab.id)]?.completed)
    .filter(({ lab }) => !(snoozed[lab.id] && today < snoozed[lab.id]))
    .filter(({ lab }) => !excludeIds.includes(lab.id))
    .filter(({ lab }) => matchesCareer(lab, careerId))
    .map(({ lab, index }) => {
      const domain = domainOfLab(lab);
      const { weakness, rate } = weaknessOf({ placement, domain });
      const mistakes = domain ? mistakeCounts[domain] || 0 : 0;
      const labMistakes = labMistakeCounts[lab.id] || 0;
      const started = Boolean(progress?.[resolveKey(lab.id)]);
      const ihk = isIhkRelated(lab);

      const score =
        3 * weakness +
        2 * Math.min(1, mistakes / 5) +
        2 * Math.min(1, labMistakes / 3) +
        (examNear && ihk ? 2 : 0) +
        (fitting.includes(lab.difficulty) ? 1 : 0) +
        (started ? 1 : 0);

      /** @type {string} */
      let reason = 'Passt zu deinem Niveau';
      if (labMistakes > 0) reason = `${labMistakes} offene Fehler in den Drill-Fragen dieses Labs`;
      else if (domain && mistakes > 0) reason = `${mistakes} offene Fehler im Bereich ${DOMAIN_LABELS[domain]}`;
      else if (domain && rate !== null && domain === weakest && weakness > 0) {
        reason = `Dein schwächster Bereich: ${DOMAIN_LABELS[domain]} (${Math.round(rate * 100)} % im Einstufungstest)`;
      } else if (examNear && ihk) reason = `Prüfung in ${days} Tagen – IHK-relevant`;
      else if (started) reason = 'Du hast es begonnen';

      return { lab, index, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  /** @type {PathRecommendation[]} */
  const picked = [];
  const usedCategories = new Set();
  for (const item of scored) {
    if (picked.length >= Math.max(0, limit)) break;
    if (usedCategories.has(item.lab.category)) continue;
    usedCategories.add(item.lab.category);
    picked.push({ lab: item.lab, score: Math.round(item.score * 100) / 100, reason: item.reason });
  }
  // Gibt es zu wenige verschiedene Kategorien, mit den nächstbesten Labs auffüllen
  for (const item of scored) {
    if (picked.length >= Math.max(0, limit)) break;
    if (picked.some((p) => p.lab.id === item.lab.id)) continue;
    picked.push({ lab: item.lab, score: Math.round(item.score * 100) / 100, reason: item.reason });
  }
  return picked;
}
