/**
 * @file question-types.js
 * @description Question types of the IHK exam simulation and how each one is scored, without DOM
 * access. A question without `type` is classic single choice (`answers` + `correct`), so the
 * existing pool keeps working.
 *
 * Types and the shape of the answer a user gives (`given`):
 *  - `single`  `correct: number`                     given: answer index
 *  - `multi`   `correctSet: number[]`                given: number[] of ticked answer indices
 *  - `order`   `items` listed in the correct order   given: number[] of item indices in the user's order
 *  - `match`   `pairs: {left, right}[]`              given: (number | null)[] right index per left item
 *  - `numeric` `answer`, `tolerance`, `unit?`        given: number
 *  - `cloze`   `template` with {1}, {2} ...,         given: string[] one entry per blank
 *              `blanks: string[][]` accepted spellings
 *
 * `scoreAnswer` returns 0..1: partial credit for multi, order, match and cloze, all or nothing for
 * single and numeric. An unanswered question scores 0, like in the exam itself.
 */

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */

export const QUESTION_TYPES = ['single', 'multi', 'order', 'match', 'numeric', 'cloze'];

/** @param {ExamQuestion} question @returns {string} */
export function typeOf(question) {
    return question.type || 'single';
}

/** @param {ExamQuestion} question */
export const isSingleChoice = (question) => typeOf(question) === 'single';

/**
 * Comparable form of a typed-in text: trimmed, lower case, one space between words, without
 * trailing semicolon and quotes around identifiers.
 * @param {unknown} value
 */
export function normalizeText(value) {
    return String(value ?? '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[`"'´]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([(),=<>*])\s*/g, '$1')
        .replace(/;+$/, '')
        .trim();
}

/**
 * Parses a number typed in German or English notation ("1,5", "1.5", "1.024" as thousands).
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value ?? '')
        .trim()
        .replace(/\s/g, '');
    if (!text) return null;
    const normalized = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)
        ? text.replace(/\./g, '').replace(',', '.')
        : /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)
          ? text.replace(/,/g, '')
          : text.replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
}

/**
 * Whether the user has given an answer at all.
 * @param {ExamQuestion} question
 * @param {unknown} given
 */
export function isAnswered(question, given) {
    if (given === null || given === undefined) return false;
    switch (typeOf(question)) {
        case 'multi':
            return Array.isArray(given) && given.length > 0;
        case 'order':
            return Array.isArray(given) && given.length === (question.items || []).length;
        case 'match':
            return Array.isArray(given) && given.some((entry) => entry !== null && entry !== undefined);
        case 'cloze':
            return Array.isArray(given) && given.some((entry) => String(entry ?? '').trim() !== '');
        case 'numeric':
            return parseNumber(given) !== null;
        default:
            return typeof given === 'number';
    }
}

/**
 * @param {ExamQuestion} question
 * @param {unknown} given
 * @returns {number} 0..1
 */
export function scoreAnswer(question, given) {
    if (!isAnswered(question, given)) return 0;
    switch (typeOf(question)) {
        case 'multi': {
            const correct = new Set(question.correctSet || []);
            const chosen = new Set(/** @type {number[]} */ (given));
            let hits = 0;
            let wrong = 0;
            for (const index of chosen) {
                if (correct.has(index)) hits++;
                else wrong++;
            }
            return correct.size === 0 ? 0 : Math.max(0, (hits - wrong) / correct.size);
        }
        case 'order': {
            const items = question.items || [];
            const placed = /** @type {number[]} */ (given);
            const right = placed.filter((item, position) => item === position).length;
            return items.length === 0 ? 0 : right / items.length;
        }
        case 'match': {
            const pairs = question.pairs || [];
            const chosen = /** @type {(number | null)[]} */ (given);
            const right = pairs.filter((_pair, index) => chosen[index] === index).length;
            return pairs.length === 0 ? 0 : right / pairs.length;
        }
        case 'numeric': {
            const value = parseNumber(given);
            return value !== null && Math.abs(value - Number(question.answer)) <= Number(question.tolerance ?? 0)
                ? 1
                : 0;
        }
        case 'cloze': {
            const blanks = question.blanks || [];
            const typed = /** @type {unknown[]} */ (given);
            const right = blanks.filter((accepted, index) =>
                accepted.some((candidate) => normalizeText(candidate) === normalizeText(typed[index]))
            ).length;
            return blanks.length === 0 ? 0 : right / blanks.length;
        }
        default:
            return given === question.correct ? 1 : 0;
    }
}

/**
 * Fully correct: counts for the statistics, the list of mistakes and the "correct" tally.
 * @param {ExamQuestion} question
 * @param {unknown} given
 */
export const isFullyCorrect = (question, given) => scoreAnswer(question, given) === 1;

/**
 * Display order of the shuffled parts of a question for one run: answer indices for single and
 * multi choice, item indices for order, right-hand indices for match.
 * @param {ExamQuestion} question
 * @returns {number[]} indices in natural order (the caller shuffles them)
 */
export function shuffleableIndices(question) {
    switch (typeOf(question)) {
        case 'order':
            return (question.items || []).map((_item, index) => index);
        case 'match':
            return (question.pairs || []).map((_pair, index) => index);
        case 'numeric':
        case 'cloze':
            return [];
        default:
            return (question.answers || []).map((_answer, index) => index);
    }
}

/**
 * Text of the right answer for the review after the exam.
 * @param {ExamQuestion} question
 * @param {'de' | 'en'} language
 * @returns {string}
 */
export function correctAnswerText(question, language) {
    switch (typeOf(question)) {
        case 'multi':
            return (question.correctSet || []).map((index) => question.answers[index][language]).join('; ');
        case 'order':
            return (question.items || []).map((item, index) => `${index + 1}. ${item[language]}`).join(' → ');
        case 'match':
            return (question.pairs || []).map((pair) => `${pair.left[language]} → ${pair.right[language]}`).join('; ');
        case 'numeric':
            return `${question.answer}${question.unit ? ` ${question.unit}` : ''}`;
        case 'cloze':
            return (question.blanks || []).map((accepted, index) => `${index + 1}: ${accepted[0]}`).join('; ');
        default:
            return question.answers[question.correct][language];
    }
}

/**
 * Text of the user's own answer for the review.
 * @param {ExamQuestion} question
 * @param {unknown} given
 * @param {'de' | 'en'} language
 * @returns {string | null} null when nothing was answered
 */
export function givenAnswerText(question, given, language) {
    if (!isAnswered(question, given)) return null;
    switch (typeOf(question)) {
        case 'multi':
            return /** @type {number[]} */ (given)
                .slice()
                .sort((a, b) => a - b)
                .map((index) => question.answers[index][language])
                .join('; ');
        case 'order':
            return /** @type {number[]} */ (given)
                .map((item, index) => `${index + 1}. ${(question.items || [])[item][language]}`)
                .join(' → ');
        case 'match':
            return (question.pairs || [])
                .map((pair, index) => {
                    const chosen = /** @type {(number | null)[]} */ (given)[index];
                    const right =
                        chosen === null || chosen === undefined ? '–' : question.pairs[chosen].right[language];
                    return `${pair.left[language]} → ${right}`;
                })
                .join('; ');
        case 'numeric':
            return `${parseNumber(given)}${question.unit ? ` ${question.unit}` : ''}`;
        case 'cloze':
            return /** @type {unknown[]} */ (given)
                .map((entry, index) => `${index + 1}: ${String(entry ?? '').trim() || '–'}`)
                .join('; ');
        default:
            return question.answers[/** @type {number} */ (given)][language];
    }
}

/**
 * Schema check of one question; returns the list of problems (empty = valid). Used by the unit
 * tests and `check-exam-questions`.
 * @param {ExamQuestion} question
 * @returns {string[]}
 */
export function validateQuestion(question) {
    const problems = [];
    const bilingual = (/** @type {any} */ value) =>
        value && typeof value.de === 'string' && value.de.trim() && typeof value.en === 'string' && value.en.trim();
    const type = typeOf(question);
    if (!QUESTION_TYPES.includes(type)) return [`unknown type "${type}"`];
    if (!question.id) problems.push('id missing');
    if (!['ap1', 'ap2', 'wiso'].includes(question.exam)) problems.push('exam must be ap1, ap2 or wiso');
    if (!question.topic) problems.push('topic missing');
    if (!bilingual(question.question)) problems.push('question needs de and en');
    if (!bilingual(question.explanation)) problems.push('explanation needs de and en');

    const answers = question.answers || [];
    switch (type) {
        case 'single':
            if (answers.length !== 4) problems.push('single choice needs exactly four answers');
            if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= answers.length) {
                problems.push('correct index out of range');
            }
            break;
        case 'multi': {
            const set = question.correctSet || [];
            if (answers.length < 4 || answers.length > 6) problems.push('multi choice needs four to six answers');
            if (set.length < 2 || set.length >= answers.length) problems.push('correctSet needs 2 up to n-1 entries');
            if (
                new Set(set).size !== set.length ||
                set.some((i) => !Number.isInteger(i) || i < 0 || i >= answers.length)
            ) {
                problems.push('correctSet has duplicates or indices out of range');
            }
            break;
        }
        case 'order':
            if ((question.items || []).length < 3) problems.push('order needs at least three items');
            if ((question.items || []).some((item) => !bilingual(item))) problems.push('items need de and en');
            break;
        case 'match':
            if ((question.pairs || []).length < 3) problems.push('match needs at least three pairs');
            if ((question.pairs || []).some((pair) => !bilingual(pair.left) || !bilingual(pair.right))) {
                problems.push('pairs need de and en on both sides');
            }
            break;
        case 'numeric':
            if (!Number.isFinite(question.answer)) problems.push('answer must be a number');
            if (!(Number(question.tolerance) >= 0)) problems.push('tolerance must be 0 or more');
            break;
        case 'cloze': {
            const blanks = question.blanks || [];
            if (blanks.length < 1 || blanks.some((accepted) => !Array.isArray(accepted) || accepted.length === 0)) {
                problems.push('cloze needs accepted answers per blank');
            }
            const template = question.template;
            if (!bilingual(template)) problems.push('template needs de and en');
            else {
                for (const language of /** @type {const} */ (['de', 'en'])) {
                    for (let n = 1; n <= blanks.length; n++) {
                        if (!template[language].includes(`{${n}}`)) problems.push(`template ${language} lacks {${n}}`);
                    }
                }
            }
            break;
        }
    }
    return problems;
}
