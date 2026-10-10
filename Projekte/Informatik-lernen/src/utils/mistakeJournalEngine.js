// @ts-check
// Fehlerjournal: falsch beantwortete Prüfungsfragen werden mit steigenden
// Intervallen (1 → 3 → 7 → 14 → 30 Tage) wiederholt. Wer eine Frage dreimal in
// Folge richtig beantwortet, hat sie "gemeistert" und sie verlässt das Journal.
// Reine Logik ohne Seiteneffekte (Datum wird als Parameter übergeben).

/**
 * @typedef {Object} MistakeEntry
 * @property {number} wrongCount   Wie oft die Frage insgesamt falsch beantwortet wurde
 * @property {number} streak       Aufeinanderfolgende richtige Antworten seit dem letzten Fehler
 * @property {number} interval     Aktuelles Wiederholungsintervall in Tagen
 * @property {string} dueDate      Fälligkeit (YYYY-MM-DD, lokale Zeit)
 * @property {string} lastSeen     Zuletzt beantwortet (YYYY-MM-DD)
 */

/** @typedef {Record<string, MistakeEntry>} MistakeJournal */

/**
 * @typedef {Object} AnswerResult
 * @property {number|string} id   Frage-ID
 * @property {boolean} correct
 */

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
export const MASTERY_STREAK = 3;

/**
 * Lokaler Datumsschlüssel YYYY-MM-DD (konsistent zu storage.getTodayDateKey).
 * @param {Date} date
 * @returns {string}
 */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Wendet eine Menge Antworten auf das Journal an und liefert ein neues Journal.
 * - falsch: (neu) im Journal, Streak 0, Intervall 1 Tag
 * - richtig + bereits im Journal: Streak +1, nächstes Intervall; bei Streak >= 3 entfernt
 * - richtig + nicht im Journal: keine Änderung
 * @param {MistakeJournal | undefined | null} journal
 * @param {AnswerResult[]} results
 * @param {Date} [now]
 * @returns {MistakeJournal}
 */
export function applyAnswerResults(journal, results, now = new Date()) {
  /** @type {MistakeJournal} */
  const next = { ...(journal || {}) };
  const today = toDateKey(now);

  for (const result of results) {
    const key = String(result.id);
    const prev = next[key];

    if (!result.correct) {
      next[key] = {
        wrongCount: (prev?.wrongCount || 0) + 1,
        streak: 0,
        interval: REVIEW_INTERVALS[0],
        dueDate: toDateKey(addDays(now, REVIEW_INTERVALS[0])),
        lastSeen: today
      };
      continue;
    }

    if (!prev) continue;

    const streak = prev.streak + 1;
    if (streak >= MASTERY_STREAK) {
      delete next[key];
      continue;
    }
    const nextInterval = REVIEW_INTERVALS[Math.min(streak, REVIEW_INTERVALS.length - 1)];
    next[key] = {
      ...prev,
      streak,
      interval: nextInterval,
      dueDate: toDateKey(addDays(now, nextInterval)),
      lastSeen: today
    };
  }
  return next;
}

/**
 * IDs aller heute oder früher fälligen Fragen, älteste Fälligkeit zuerst.
 * @param {MistakeJournal | undefined | null} journal
 * @param {Date} [now]
 * @returns {string[]}
 */
export function getDueMistakeIds(journal, now = new Date()) {
  const today = toDateKey(now);
  return Object.entries(journal || {})
    .filter(([, entry]) => entry.dueDate <= today)
    .sort((a, b) => a[1].dueDate.localeCompare(b[1].dueDate) || b[1].wrongCount - a[1].wrongCount)
    .map(([id]) => id);
}

/**
 * @param {MistakeJournal | undefined | null} journal
 * @param {Date} [now]
 * @returns {{ total: number, due: number }}
 */
export function summarizeJournal(journal, now = new Date()) {
  return { total: Object.keys(journal || {}).length, due: getDueMistakeIds(journal, now).length };
}
