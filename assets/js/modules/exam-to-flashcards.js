/**
 * Exam mistakes as flashcards: turns exam questions into the custom cards of the flashcard
 * deck (see flashcard-deck.js), so a wrongly answered question comes back through the Leitner
 * box. Pure logic, no DOM and no storage.
 */

import { EXAM_TOPICS } from './exam-questions.js';
import { correctAnswerText, isFullyCorrect, typeOf } from './question-types.js';

/** Ids of these cards start with "custom_" (so the deck treats them as the visitor's own) and keep the question id. */
export const EXAM_CARD_PREFIX = 'custom_exam_';

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */
/** @typedef {Record<string, any>} Card */

const LABELS = {
    de: { options: 'Optionen', items: 'Elemente', left: 'Zuordnen', unit: 'Einheit' },
    en: { options: 'Options', items: 'Items', left: 'Match', unit: 'Unit' },
};

/**
 * What the front of the card shows: the question plus whatever the answer needs as context.
 * The correct arrangement of an ordering question is not given away (the items are sorted by text).
 * @param {ExamQuestion} question
 * @param {'de' | 'en'} lang
 */
function questionText(question, lang) {
    const labels = LABELS[lang];
    const lines = [question.question[lang]];
    switch (typeOf(question)) {
        case 'single':
        case 'multi':
            lines.push(`${labels.options}: ${question.answers.map((answer) => answer[lang]).join('; ')}`);
            break;
        case 'order':
            lines.push(
                `${labels.items}: ${(question.items || [])
                    .map((item) => item[lang])
                    .sort((a, b) => a.localeCompare(b, lang))
                    .join('; ')}`
            );
            break;
        case 'match':
            lines.push(`${labels.left}: ${(question.pairs || []).map((pair) => pair.left[lang]).join('; ')}`);
            break;
        case 'numeric':
            if (question.unit) lines.push(`${labels.unit}: ${question.unit}`);
            break;
        case 'cloze':
            if (question.template) lines.push(question.template[lang].replace(/\{\d+\}/g, '___'));
            break;
    }
    return lines.join('\n');
}

/**
 * @param {ExamQuestion} question
 * @returns {Card}
 */
export function questionToCard(question) {
    const topic = EXAM_TOPICS[question.topic];
    const answer = (/** @type {'de' | 'en'} */ lang) =>
        `${correctAnswerText(question, lang)}\n\n${question.explanation[lang]}`;
    return {
        id: `${EXAM_CARD_PREFIX}${question.id}`,
        category: topic.category,
        hint_de: topic.de,
        hint_en: topic.en,
        question_de: questionText(question, 'de'),
        question_en: questionText(question, 'en'),
        answer_de: answer('de'),
        answer_en: answer('en'),
    };
}

/**
 * Adds a card for every question that was not answered fully right, unless the deck already has
 * one for it (a card the visitor has moved to a higher box keeps its box). New cards start in
 * box 1 without a due date, which counts as due today. The inputs stay untouched.
 * @param {{questions: ExamQuestion[], answers: unknown[], cards: Card[], boxLevels: Record<string, number>}} input
 * @returns {{cards: Card[], boxLevels: Record<string, number>, added: number, alreadyKnown: number}}
 */
export function addMistakesAsCards({ questions, answers, cards, boxLevels }) {
    const known = new Set(cards.map((card) => card.id));
    const nextCards = [...cards];
    const nextBoxes = { ...boxLevels };
    let added = 0;
    let alreadyKnown = 0;

    questions.forEach((question, index) => {
        if (isFullyCorrect(question, answers[index])) return;
        const card = questionToCard(question);
        if (known.has(card.id)) {
            alreadyKnown++;
            return;
        }
        known.add(card.id);
        nextCards.push(card);
        nextBoxes[card.id] = 1;
        added++;
    });

    return { cards: nextCards, boxLevels: nextBoxes, added, alreadyKnown };
}
