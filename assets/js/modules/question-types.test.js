import { describe, it, expect } from 'vitest';
import {
    QUESTION_TYPES,
    typeOf,
    normalizeText,
    parseNumber,
    isAnswered,
    scoreAnswer,
    isFullyCorrect,
    shuffleableIndices,
    correctAnswerText,
    givenAnswerText,
    validateQuestion,
} from './question-types.js';
import { EXAM_QUESTIONS } from './exam-questions.js';

const bi = (de, en = de) => ({ de, en });
const base = {
    id: 'x',
    exam: 'ap1',
    topic: 'network',
    question: bi('Frage'),
    explanation: bi('Erklärung'),
    correct: -1,
};

const single = { ...base, answers: [bi('a'), bi('b'), bi('c'), bi('d')], correct: 2 };
const multi = { ...base, type: 'multi', answers: [bi('a'), bi('b'), bi('c'), bi('d')], correctSet: [0, 2] };
const order = { ...base, type: 'order', answers: [], items: [bi('eins'), bi('zwei'), bi('drei'), bi('vier')] };
const match = {
    ...base,
    type: 'match',
    answers: [],
    pairs: [
        { left: bi('A'), right: bi('1') },
        { left: bi('B'), right: bi('2') },
        { left: bi('C'), right: bi('3') },
        { left: bi('D'), right: bi('4') },
    ],
};
const numeric = { ...base, type: 'numeric', answers: [], answer: 1875, tolerance: 1, unit: 'MB' };
const cloze = {
    ...base,
    type: 'cloze',
    answers: [],
    template: bi('SELECT * FROM t {1} x = 1 {2} y;'),
    blanks: [['WHERE'], ['ORDER BY']],
};

describe('typeOf', () => {
    it('treats a question without type as single choice', () => {
        expect(typeOf(single)).toBe('single');
        expect(typeOf(multi)).toBe('multi');
        expect(QUESTION_TYPES).toHaveLength(6);
    });
});

describe('normalizeText', () => {
    it('ignores case, spacing, quotes and a trailing semicolon', () => {
        expect(normalizeText('  Order   By ')).toBe('order by');
        expect(normalizeText("name = 'Bonn';")).toBe('name=bonn');
        expect(normalizeText('i < 5')).toBe('i<5');
        expect(normalizeText(null)).toBe('');
    });
});

describe('parseNumber', () => {
    it('reads German and English notation', () => {
        expect(parseNumber('1,5')).toBe(1.5);
        expect(parseNumber('1.5')).toBe(1.5);
        expect(parseNumber('1.875')).toBe(1875);
        expect(parseNumber('1.875,5')).toBe(1875.5);
        expect(parseNumber('1,875')).toBe(1875);
        expect(parseNumber(' 30 ')).toBe(30);
        expect(parseNumber(7)).toBe(7);
    });
    it('rejects text and empty input', () => {
        expect(parseNumber('')).toBeNull();
        expect(parseNumber('abc')).toBeNull();
        expect(parseNumber(null)).toBeNull();
        expect(parseNumber(Number.NaN)).toBeNull();
    });
});

describe('isAnswered', () => {
    it('is false without an answer for every type', () => {
        for (const question of [single, multi, order, match, numeric, cloze]) {
            expect(isAnswered(question, null)).toBe(false);
            expect(isAnswered(question, undefined)).toBe(false);
        }
        expect(isAnswered(multi, [])).toBe(false);
        expect(isAnswered(order, [0, 1])).toBe(false);
        expect(isAnswered(match, [null, null, null, null])).toBe(false);
        expect(isAnswered(numeric, 'abc')).toBe(false);
        expect(isAnswered(cloze, ['', '  '])).toBe(false);
    });
    it('is true once something was given', () => {
        expect(isAnswered(single, 0)).toBe(true);
        expect(isAnswered(multi, [1])).toBe(true);
        expect(isAnswered(order, [3, 2, 1, 0])).toBe(true);
        expect(isAnswered(match, [null, 1, null, null])).toBe(true);
        expect(isAnswered(numeric, '1.875')).toBe(true);
        expect(isAnswered(cloze, ['where', ''])).toBe(true);
    });
});

describe('scoreAnswer', () => {
    it('scores single choice all or nothing', () => {
        expect(scoreAnswer(single, 2)).toBe(1);
        expect(scoreAnswer(single, 1)).toBe(0);
        expect(scoreAnswer(single, null)).toBe(0);
    });

    it('gives partial credit for multiple choice and subtracts wrong ticks', () => {
        expect(scoreAnswer(multi, [0, 2])).toBe(1);
        expect(scoreAnswer(multi, [2])).toBe(0.5);
        expect(scoreAnswer(multi, [0, 2, 1])).toBe(0.5);
        expect(scoreAnswer(multi, [1])).toBe(0);
        expect(scoreAnswer(multi, [1, 3])).toBe(0);
        expect(isFullyCorrect(multi, [0, 2, 3])).toBe(false);
    });

    it('scores ordering by items in the right place', () => {
        expect(scoreAnswer(order, [0, 1, 2, 3])).toBe(1);
        expect(scoreAnswer(order, [1, 0, 2, 3])).toBe(0.5);
        expect(scoreAnswer(order, [3, 2, 1, 0])).toBe(0);
    });

    it('scores matching by pairs in the right place', () => {
        expect(scoreAnswer(match, [0, 1, 2, 3])).toBe(1);
        expect(scoreAnswer(match, [0, 1, 3, 2])).toBe(0.5);
        expect(scoreAnswer(match, [0, null, null, null])).toBe(0.25);
    });

    it('accepts numbers within the tolerance', () => {
        expect(scoreAnswer(numeric, '1875')).toBe(1);
        expect(scoreAnswer(numeric, '1.876')).toBe(1);
        expect(scoreAnswer(numeric, '1.877')).toBe(0);
        expect(scoreAnswer(numeric, 'abc')).toBe(0);
    });

    it('compares cloze blanks after normalising', () => {
        expect(scoreAnswer(cloze, ['where', 'order  by;'])).toBe(1);
        expect(scoreAnswer(cloze, ['WHERE', 'group by'])).toBe(0.5);
        expect(scoreAnswer(cloze, ['', 'xyz'])).toBe(0);
    });
});

describe('texts for the review', () => {
    it('names the right and the given answers per type', () => {
        expect(correctAnswerText(single, 'de')).toBe('c');
        expect(correctAnswerText(multi, 'de')).toBe('a; c');
        expect(correctAnswerText(order, 'de')).toBe('1. eins → 2. zwei → 3. drei → 4. vier');
        expect(correctAnswerText(match, 'de')).toBe('A → 1; B → 2; C → 3; D → 4');
        expect(correctAnswerText(numeric, 'de')).toBe('1875 MB');
        expect(correctAnswerText(cloze, 'de')).toBe('1: WHERE; 2: ORDER BY');

        expect(givenAnswerText(single, 0, 'de')).toBe('a');
        expect(givenAnswerText(multi, [2, 0], 'de')).toBe('a; c');
        expect(givenAnswerText(order, [1, 0, 2, 3], 'de')).toBe('1. zwei → 2. eins → 3. drei → 4. vier');
        expect(givenAnswerText(match, [0, null, 2, 3], 'de')).toBe('A → 1; B → –; C → 3; D → 4');
        expect(givenAnswerText(numeric, '1,5', 'de')).toBe('1.5 MB');
        expect(givenAnswerText(cloze, ['where', ''], 'de')).toBe('1: where; 2: –');
        expect(givenAnswerText(single, null, 'de')).toBeNull();
    });
});

describe('shuffleableIndices', () => {
    it('lists the parts the exam shuffles', () => {
        expect(shuffleableIndices(single)).toEqual([0, 1, 2, 3]);
        expect(shuffleableIndices(multi)).toEqual([0, 1, 2, 3]);
        expect(shuffleableIndices(order)).toEqual([0, 1, 2, 3]);
        expect(shuffleableIndices(match)).toEqual([0, 1, 2, 3]);
        expect(shuffleableIndices(numeric)).toEqual([]);
        expect(shuffleableIndices(cloze)).toEqual([]);
    });
});

describe('validateQuestion', () => {
    it('accepts well-formed questions of every type', () => {
        for (const question of [single, multi, order, match, numeric, cloze]) {
            expect(validateQuestion(question)).toEqual([]);
        }
    });

    it('reports typical mistakes', () => {
        expect(validateQuestion({ ...single, correct: 7 })).toContain('correct index out of range');
        expect(validateQuestion({ ...single, answers: [bi('a')] })).toContain(
            'single choice needs exactly four answers'
        );
        expect(validateQuestion({ ...multi, correctSet: [0] })).toContain('correctSet needs 2 up to n-1 entries');
        expect(validateQuestion({ ...multi, correctSet: [0, 0, 9] })).toContain(
            'correctSet has duplicates or indices out of range'
        );
        expect(validateQuestion({ ...order, items: [bi('a')] })).toContain('order needs at least three items');
        expect(validateQuestion({ ...match, pairs: [] })).toContain('match needs at least three pairs');
        expect(validateQuestion({ ...numeric, answer: 'x' })).toContain('answer must be a number');
        expect(validateQuestion({ ...cloze, template: bi('nur {1}') })).toContain('template de lacks {2}');
        expect(validateQuestion({ ...single, explanation: { de: 'x', en: '' } })).toContain(
            'explanation needs de and en'
        );
        expect(validateQuestion({ ...single, type: 'bogus' })).toEqual(['unknown type "bogus"']);
    });
});

describe('question pool', () => {
    it('is valid in every entry with unique ids', () => {
        const problems = EXAM_QUESTIONS.flatMap((question) =>
            validateQuestion(question).map((problem) => `${question.id}: ${problem}`)
        );
        expect(problems).toEqual([]);
        const ids = EXAM_QUESTIONS.map((question) => question.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('has no two questions with the same text', () => {
        const texts = EXAM_QUESTIONS.map((question) => question.question.de);
        expect(texts.filter((text, index) => texts.indexOf(text) !== index)).toEqual([]);
    });

    it('uses every question type at least once', () => {
        const used = new Set(EXAM_QUESTIONS.map(typeOf));
        expect([...used].sort()).toEqual([...QUESTION_TYPES].sort());
    });

    it('answers every question correctly with its own model solution', () => {
        for (const question of EXAM_QUESTIONS) {
            const model = {
                single: question.correct,
                multi: question.correctSet,
                order: question.items?.map((_item, index) => index),
                match: question.pairs?.map((_pair, index) => index),
                numeric: question.answer,
                cloze: question.blanks?.map((accepted) => accepted[0]),
            }[typeOf(question)];
            expect(scoreAnswer(question, model), question.id).toBe(1);
        }
    });
});
