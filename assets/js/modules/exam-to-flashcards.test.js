import { describe, it, expect } from 'vitest';
import { questionToCard, addMistakesAsCards, EXAM_CARD_PREFIX } from './exam-to-flashcards.js';
import { EXAM_QUESTIONS, EXAM_TOPICS } from './exam-questions.js';
import { isCustomCard } from './flashcard-deck.js';

const ofType = (type) => EXAM_QUESTIONS.find((question) => (question.type || 'single') === type);
const TYPES = ['single', 'multi', 'order', 'match', 'numeric', 'cloze'];

describe('questionToCard', () => {
    it('macht aus einer Einzelwahl-Frage eine zweisprachige eigene Karte', () => {
        const question = ofType('single');
        const card = questionToCard(question);
        expect(card.id).toBe(`${EXAM_CARD_PREFIX}${question.id}`);
        expect(isCustomCard(card)).toBe(true);
        expect(card.category).toBe(EXAM_TOPICS[question.topic].category);
        expect(card.hint_de).toBe(EXAM_TOPICS[question.topic].de);
        expect(card.hint_en).toBe(EXAM_TOPICS[question.topic].en);
        expect(card.question_de).toContain(question.question.de);
        expect(card.question_en).toContain(question.question.en);
        for (const answer of question.answers) expect(card.question_de).toContain(answer.de);
        expect(card.answer_de).toContain(question.answers[question.correct].de);
        expect(card.answer_en).toContain(question.explanation.en);
    });

    it.each(TYPES)('liefert für den Fragetyp %s nichtleere Texte in beiden Sprachen', (type) => {
        const question = ofType(type);
        expect(question, `kein Beispiel für ${type}`).toBeDefined();
        const card = questionToCard(question);
        for (const field of ['hint', 'question', 'answer']) {
            expect(card[`${field}_de`].trim().length).toBeGreaterThan(0);
            expect(card[`${field}_en`].trim().length).toBeGreaterThan(0);
        }
    });

    it('nennt bei Reihenfolge-Fragen die Elemente, ohne die richtige Reihenfolge zu verraten', () => {
        const question = ofType('order');
        const card = questionToCard(question);
        for (const item of question.items) expect(card.question_de).toContain(item.de);
        expect(card.answer_de).toContain('1. ');
        expect(card.question_de).not.toContain('1. ');
    });

    it('ersetzt bei Lückentexten die Lücken durch Platzhalter', () => {
        const question = ofType('cloze');
        const card = questionToCard(question);
        expect(card.question_de).not.toMatch(/\{\d+\}/);
        expect(card.question_de).toContain('___');
    });

    it('kann den gesamten Fragenpool umwandeln', () => {
        for (const question of EXAM_QUESTIONS) {
            const card = questionToCard(question);
            expect(card.question_de.length, question.id).toBeGreaterThan(0);
            expect(card.answer_de.length, question.id).toBeGreaterThan(0);
        }
    });
});

describe('addMistakesAsCards', () => {
    const [first, second, third] = EXAM_QUESTIONS.filter((question) => (question.type || 'single') === 'single');
    const right = (question) => question.correct;
    const wrong = (question) => (question.correct + 1) % question.answers.length;
    const base = () => ({
        questions: [first, second, third],
        answers: [right(first), wrong(second), undefined],
        cards: [{ id: 'custom_1', category: 'software' }],
        boxLevels: { 1: 3, custom_1: 2 },
    });

    it('legt nur falsch oder gar nicht beantwortete Fragen als Karten in Box 1 an', () => {
        const result = addMistakesAsCards(base());
        expect(result.added).toBe(2);
        expect(result.alreadyKnown).toBe(0);
        expect(result.cards.map((card) => card.id)).toEqual([
            'custom_1',
            `${EXAM_CARD_PREFIX}${second.id}`,
            `${EXAM_CARD_PREFIX}${third.id}`,
        ]);
        expect(result.boxLevels[`${EXAM_CARD_PREFIX}${second.id}`]).toBe(1);
        expect(result.boxLevels[`${EXAM_CARD_PREFIX}${first.id}`]).toBeUndefined();
    });

    it('lässt bestehende Karten und Boxen unangetastet und verändert die Eingaben nicht', () => {
        const input = base();
        const snapshot = JSON.stringify(input);
        const result = addMistakesAsCards(input);
        expect(JSON.stringify(input)).toBe(snapshot);
        expect(result.boxLevels[1]).toBe(3);
        expect(result.boxLevels.custom_1).toBe(2);
    });

    it('legt beim zweiten Lauf keine Doppelten an und setzt die Box nicht zurück', () => {
        const once = addMistakesAsCards(base());
        const boxed = { ...once.boxLevels, [`${EXAM_CARD_PREFIX}${second.id}`]: 4 };
        const twice = addMistakesAsCards({ ...base(), cards: once.cards, boxLevels: boxed });
        expect(twice.added).toBe(0);
        expect(twice.alreadyKnown).toBe(2);
        expect(twice.cards).toHaveLength(once.cards.length);
        expect(twice.boxLevels[`${EXAM_CARD_PREFIX}${second.id}`]).toBe(4);
    });

    it('meldet 0 hinzugefügte Karten, wenn alles richtig war', () => {
        const result = addMistakesAsCards({
            ...base(),
            answers: [right(first), right(second), right(third)],
        });
        expect(result.added).toBe(0);
        expect(result.cards).toHaveLength(1);
    });
});
