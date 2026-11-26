// @ts-check
/**
 * @file drillFormat.js
 * Vereinheitlicht die Fragenformate der Lab-Drills auf das Format von `IhkDrillPanel` und
 * Fehlerjournal: `{ id, frage, optionen, korrektIndex, erklaerung }`.
 * Bekannte Quellformate: deutsch (`frage`/`optionen`/`korrektIndex`), BAB (`richtigIndex`),
 * englisch (`question`/`options`/`correct`/`explanation`) und UML (Optionen als
 * `{ text, isCorrect }`).
 */

/**
 * @typedef {Object} DrillQuestion
 * @property {string} id
 * @property {string} frage
 * @property {string[]} optionen
 * @property {number} korrektIndex
 * @property {string} erklaerung
 */

/**
 * @param {any[]} questions Fragen in einem der bekannten Formate
 * @returns {DrillQuestion[]}
 */
export function normalizeDrillQuestions(questions) {
  return questions.map((q) => {
    const raw = q.optionen ?? q.options ?? [];
    /** @type {string[]} */
    const optionen = raw.map((/** @type {any} */ o) => (typeof o === 'string' ? o : String(o.text)));
    let korrektIndex = q.korrektIndex ?? q.richtigIndex ?? q.correct;
    if (korrektIndex === undefined) {
      korrektIndex = raw.findIndex((/** @type {any} */ o) => typeof o === 'object' && o !== null && o.isCorrect === true);
    }
    return {
      id: String(q.id),
      frage: String(q.frage ?? q.question ?? ''),
      optionen,
      korrektIndex,
      erklaerung: String(q.erklaerung ?? q.explanation ?? '')
    };
  });
}
