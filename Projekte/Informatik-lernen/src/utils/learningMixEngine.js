// @ts-check
/**
 * @file learningMixEngine.js
 * Einstufungstest (Startwert für den Bereitschafts-Score) und täglicher Lernmix
 * (fällige Fehler + neue Fragen aus den schwächsten Bereichen). Reine Logik:
 * Datum und Zufall werden als Parameter übergeben.
 */
import { getDueMistakeIds, toDateKey } from './mistakeJournalEngine';

/** Schlüssel entsprechen den Domänen in examReadinessEngine (ohne 'project'). */
export const PLACEMENT_DOMAINS = ['ap1', 'ap2_1', 'ap2_2', 'wiso'];
export const PLACEMENT_PER_DOMAIN = 3;
export const DAILY_MIX_SIZE = 10;
const MAX_DUE_IN_MIX = 6;
export const MAX_CARDS_IN_MIX = 3;

/**
 * @typedef {Object} MixQuestion
 * @property {number|string} id
 * @property {string} [examType]
 * @property {string} [category]
 * @property {number} correct
 */

/**
 * Ordnet eine Prüfungsfrage einem Bereitschafts-Bereich zu.
 * @param {{ examType?: string, category?: string }} q
 * @returns {'ap1'|'ap2_1'|'ap2_2'|'wiso'}
 */
export function domainOfQuestion(q) {
  const category = q.category || '';
  if (/wiso/i.test(category)) return 'wiso';
  if (q.examType === 'ap1') return 'ap1';
  if (/sql|daten|programm|algor|software|design|api|test|clean/i.test(category)) return 'ap2_2';
  return 'ap2_1';
}

/**
 * Deterministischer Zufallsgenerator (mulberry32) aus einem Text-Seed.
 * @param {string} seed
 * @returns {() => number}
 */
export function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @template T
 * @param {T[]} items
 * @param {() => number} rng
 * @returns {T[]}
 */
function shuffled(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Einstufungstest: je Bereich gleich viele zufällige Fragen, danach gemischt.
 * @param {MixQuestion[]} questions
 * @param {() => number} [rng]
 * @param {number} [perDomain]
 * @returns {string[]} Frage-IDs
 */
export function buildPlacementTest(questions, rng = Math.random, perDomain = PLACEMENT_PER_DOMAIN) {
  /** @type {string[]} */
  const picked = [];
  for (const domain of PLACEMENT_DOMAINS) {
    const pool = questions.filter((q) => domainOfQuestion(q) === domain);
    picked.push(...shuffled(pool, rng).slice(0, perDomain).map((q) => String(q.id)));
  }
  return shuffled(picked, rng);
}

/**
 * @typedef {Object} PlacementDomainResult
 * @property {number} correct
 * @property {number} total
 */

/**
 * @typedef {Object} PlacementResult
 * @property {string} date YYYY-MM-DD
 * @property {Record<string, PlacementDomainResult>} domains
 */

/**
 * @param {MixQuestion[]} answeredQuestions Beantwortete Fragen
 * @param {boolean[]} correctFlags Je Frage: richtig beantwortet?
 * @param {Date} [now]
 * @returns {PlacementResult}
 */
export function scorePlacement(answeredQuestions, correctFlags, now = new Date()) {
  /** @type {Record<string, PlacementDomainResult>} */
  const domains = {};
  answeredQuestions.forEach((q, i) => {
    const d = domainOfQuestion(q);
    domains[d] = domains[d] || { correct: 0, total: 0 };
    domains[d].total += 1;
    if (correctFlags[i]) domains[d].correct += 1;
  });
  return { date: toDateKey(now), domains };
}

/**
 * Wandelt das Testergebnis in Domänen-Statistiken für calculateExamReadiness um.
 * @param {PlacementResult | null | undefined} placement
 * @returns {Record<string, { completed: number, scoreSum: number }>}
 */
export function placementToDomainStats(placement) {
  /** @type {Record<string, { completed: number, scoreSum: number }>} */
  const stats = {};
  for (const [key, r] of Object.entries(placement?.domains || {})) {
    if (!r || r.total <= 0) continue;
    stats[key] = { completed: r.total, scoreSum: (r.correct / r.total) * 100 * r.total };
  }
  return stats;
}

/**
 * Addiert zwei Domänen-Statistiken.
 * @param {Record<string, { completed: number, scoreSum: number }>} a
 * @param {Record<string, { completed: number, scoreSum: number }>} b
 */
export function mergeDomainStats(a, b) {
  /** @type {Record<string, { completed: number, scoreSum: number }>} */
  const out = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key] || { completed: 0, scoreSum: 0 };
    const y = b[key] || { completed: 0, scoreSum: 0 };
    out[key] = { completed: x.completed + y.completed, scoreSum: x.scoreSum + y.scoreSum };
  }
  return out;
}

/**
 * Bereiche nach Trefferquote aufsteigend (schwächster zuerst); ungetestete zuerst.
 * @param {PlacementResult | null | undefined} placement
 * @returns {string[]}
 */
export function weakestDomains(placement) {
  const rate = (/** @type {string} */ d) => {
    const r = placement?.domains?.[d];
    return r && r.total > 0 ? r.correct / r.total : -1;
  };
  return [...PLACEMENT_DOMAINS].sort((a, b) => rate(a) - rate(b));
}

/**
 * Karteikarten für den Lernmix: zuerst fällige (älteste Fälligkeit zuerst),
 * dann noch nie gelernte in Katalogreihenfolge.
 * @param {Record<string, { dueDate?: string }> | null | undefined} srsData
 * @param {{ id: number|string }[]} cards
 * @param {Date} [now]
 * @param {number} [limit]
 * @returns {{ ids: string[], dueCount: number }}
 */
export function pickMixCards(srsData, cards, now = new Date(), limit = MAX_CARDS_IN_MIX) {
  const today = toDateKey(now);
  const data = srsData || {};
  const due = cards
    .filter((c) => data[c.id]?.dueDate && /** @type {string} */ (data[c.id].dueDate) <= today)
    .sort((a, b) => /** @type {string} */ (data[a.id].dueDate).localeCompare(/** @type {string} */ (data[b.id].dueDate)));
  const fresh = cards.filter((c) => !data[c.id]?.dueDate);
  const ids = [...due, ...fresh].slice(0, limit).map((c) => String(c.id));
  return { ids, dueCount: Math.min(due.length, limit) };
}

/**
 * Täglicher Lernmix: zuerst fällige Fehler (max. 6), dann neue Fragen
 * abwechselnd aus den schwächsten Bereichen. Pro Tag stabil (Seed = Datum).
 * @param {{
 *   journal?: Record<string, any> | null,
 *   questions: MixQuestion[],
 *   placement?: PlacementResult | null,
 *   extraKnownIds?: string[],
 *   cards?: { id: number|string }[],
 *   srsData?: Record<string, { dueDate?: string }> | null,
 *   now?: Date,
 *   size?: number
 * }} input
 * @returns {{ ids: string[], dueCount: number, cardIds: string[], dueCardCount: number }}
 */
export function buildDailyMix({ journal, questions, placement, extraKnownIds = [], cards = [], srsData = null, now = new Date(), size = DAILY_MIX_SIZE }) {
  const picked = pickMixCards(srsData, cards, now);
  const questionSize = size - picked.ids.length;
  // extraKnownIds: weitere beantwortbare Fragen (z. B. Lab-Drills), die nur als fällige Fehler vorkommen dürfen
  const known = new Set([...questions.map((q) => String(q.id)), ...extraKnownIds]);
  const due = getDueMistakeIds(journal, now).filter((id) => known.has(id)).slice(0, Math.min(MAX_DUE_IN_MIX, questionSize));
  const rng = seededRandom(toDateKey(now));
  const taken = new Set(due);
  const inJournal = new Set(Object.keys(journal || {}));

  const order = weakestDomains(placement);
  /** @type {Record<string, string[]>} */
  const pools = {};
  for (const d of order) {
    pools[d] = shuffled(
      questions.filter((q) => domainOfQuestion(q) === d && !inJournal.has(String(q.id))),
      rng
    ).map((q) => String(q.id));
  }

  const ids = [...due];
  let progressed = true;
  while (ids.length < questionSize && progressed) {
    progressed = false;
    for (const d of order) {
      const next = pools[d].find((id) => !taken.has(id));
      if (next === undefined) continue;
      taken.add(next);
      ids.push(next);
      progressed = true;
      if (ids.length >= questionSize) break;
    }
  }
  return { ids, dueCount: due.length, cardIds: picked.ids, dueCardCount: picked.dueCount };
}
