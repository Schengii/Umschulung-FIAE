import { describe, it, expect } from 'vitest';
import {
    EXAM_MODES,
    GRADE_LABELS,
    evaluateExam,
    formatTimerText,
    pickExamQuestions,
    shuffle,
} from './ihk-exam-simulator.js';
import { EXAM_QUESTIONS, EXAM_TOPICS } from './exam-questions.js';

/** Deterministic pseudo random numbers (linear congruential generator). */
function seededRandom(seed) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

describe('formatTimerText', () => {
    it('formats a full 90-minute countdown as mm:ss', () => {
        expect(formatTimerText(5400)).toBe('90:00');
    });

    it('pads single-digit minutes and seconds with a leading zero', () => {
        expect(formatTimerText(65)).toBe('01:05');
    });

    it('formats zero seconds remaining as 00:00', () => {
        expect(formatTimerText(0)).toBe('00:00');
    });

    it('clamps negative values to 00:00 instead of showing a negative time', () => {
        expect(formatTimerText(-5)).toBe('00:00');
    });
});

describe('question pool', () => {
    it('has unique ids', () => {
        const ids = EXAM_QUESTIONS.map((question) => question.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('contains only well-formed questions', () => {
        for (const question of EXAM_QUESTIONS) {
            const label = question.id;
            expect(Object.keys(EXAM_MODES), label).toContain(question.exam);
            expect(Object.keys(EXAM_TOPICS), label).toContain(question.topic);
            expect(question.answers, label).toHaveLength(4);
            expect(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, label).toBe(
                true
            );
            for (const text of [question.question, question.explanation, ...question.answers]) {
                expect(text.de.trim().length, label).toBeGreaterThan(0);
                expect(text.en.trim().length, label).toBeGreaterThan(0);
            }
            // Four different answers per language, otherwise two options would look identical.
            expect(new Set(question.answers.map((answer) => answer.de)).size, label).toBe(4);
            expect(new Set(question.answers.map((answer) => answer.en)).size, label).toBe(4);
        }
    });

    it('offers more questions per exam part than one run uses', () => {
        for (const [mode, config] of Object.entries(EXAM_MODES)) {
            const available = EXAM_QUESTIONS.filter((question) => question.exam === mode).length;
            expect(available, mode).toBeGreaterThan(config.questionCount);
        }
    });

    it('does not always put the right answer in the same position', () => {
        const positions = new Set(EXAM_QUESTIONS.map((question) => question.correct));
        expect(positions.size).toBe(4);
    });
});

describe('shuffle', () => {
    it('keeps all elements and leaves the input untouched', () => {
        const input = [1, 2, 3, 4, 5];
        const result = shuffle(input, seededRandom(7));
        expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
        expect(input).toEqual([1, 2, 3, 4, 5]);
    });

    it('is deterministic for a given random source', () => {
        expect(shuffle([1, 2, 3, 4, 5], seededRandom(3))).toEqual(shuffle([1, 2, 3, 4, 5], seededRandom(3)));
    });
});

describe('pickExamQuestions', () => {
    it('returns the requested number of distinct questions of that exam part', () => {
        for (const [mode, config] of Object.entries(EXAM_MODES)) {
            const picked = pickExamQuestions(EXAM_QUESTIONS, mode, config.questionCount, seededRandom(1));
            expect(picked, mode).toHaveLength(config.questionCount);
            expect(new Set(picked.map((question) => question.id)).size, mode).toBe(config.questionCount);
            expect(
                picked.every((question) => question.exam === mode),
                mode
            ).toBe(true);
        }
    });

    it('covers every topic of the exam part', () => {
        for (const seed of [1, 2, 3, 4, 5]) {
            const picked = pickExamQuestions(EXAM_QUESTIONS, 'ap2', EXAM_MODES.ap2.questionCount, seededRandom(seed));
            const topics = new Set(picked.map((question) => question.topic));
            expect([...topics].sort()).toEqual(['algorithms', 'architecture', 'oop', 'quality', 'sql']);
        }
    });

    it('returns everything available when more is requested than exists', () => {
        const pool = EXAM_QUESTIONS.filter((question) => question.exam === 'wiso');
        expect(pickExamQuestions(EXAM_QUESTIONS, 'wiso', 500, seededRandom(1))).toHaveLength(pool.length);
    });

    it('varies between runs', () => {
        const first = pickExamQuestions(EXAM_QUESTIONS, 'ap1', 15, seededRandom(1)).map((question) => question.id);
        const second = pickExamQuestions(EXAM_QUESTIONS, 'ap1', 15, seededRandom(2)).map((question) => question.id);
        expect(first).not.toEqual(second);
    });
});

describe('evaluateExam', () => {
    const questions = [
        { topic: 'sql', correct: 0 },
        { topic: 'sql', correct: 1 },
        { topic: 'oop', correct: 2 },
        { topic: 'oop', correct: 3 },
    ];

    it('counts correct answers overall and per topic', () => {
        // sql: both right, oop: one wrong, one unanswered
        const result = evaluateExam(/** @type {any} */ (questions), [0, 1, 0, null]);
        expect(result).toMatchObject({ total: 4, correct: 2, answered: 3, percent: 50, grade: 4, passed: true });
        expect(result.topics).toEqual([
            { topic: 'sql', total: 2, correct: 2, percent: 100 },
            { topic: 'oop', total: 2, correct: 0, percent: 0 },
        ]);
        expect(result.weakTopics).toEqual(['oop']);
    });

    it('fails below 50 percent', () => {
        const result = evaluateExam(/** @type {any} */ (questions), [0, null, null, null]);
        expect(result).toMatchObject({ correct: 1, percent: 25, grade: 6, passed: false });
    });

    it('awards grade 1 for a flawless run and lists no weak topics', () => {
        const result = evaluateExam(/** @type {any} */ (questions), [0, 1, 2, 3]);
        expect(result).toMatchObject({ percent: 100, grade: 1, passed: true, weakTopics: [] });
    });

    it('orders weak topics from weakest to strongest', () => {
        const mixed = [
            { topic: 'a', correct: 0 },
            { topic: 'a', correct: 0 },
            { topic: 'a', correct: 0 },
            { topic: 'b', correct: 0 },
            { topic: 'b', correct: 0 },
        ];
        // a: 1 of 3 (33 %), b: 0 of 2 (0 %)
        expect(evaluateExam(/** @type {any} */ (mixed), [0, 1, 1, 1, 1]).weakTopics).toEqual(['b', 'a']);
    });

    it('handles an empty exam', () => {
        expect(evaluateExam([], [])).toMatchObject({ total: 0, percent: 0, passed: false });
    });

    it('has a label for every grade', () => {
        expect(Object.keys(GRADE_LABELS)).toEqual(['1', '2', '3', '4', '5', '6']);
    });
});
