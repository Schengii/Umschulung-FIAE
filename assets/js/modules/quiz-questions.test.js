import { describe, it, expect } from 'vitest';
import { questionsDE, questionsEN, QUIZ_QUESTION_COUNT } from './quiz-questions.js';

describe('quiz questions', () => {
    it('has the same number of questions in German and English', () => {
        expect(questionsEN).toHaveLength(questionsDE.length);
        expect(QUIZ_QUESTION_COUNT).toBe(questionsDE.length);
        expect(QUIZ_QUESTION_COUNT).toBeGreaterThan(0);
    });

    it('has exactly one correct answer per question, in both languages', () => {
        for (const question of [...questionsDE, ...questionsEN]) {
            expect(question.answers.filter((answer) => answer.correct)).toHaveLength(1);
        }
    });
});
