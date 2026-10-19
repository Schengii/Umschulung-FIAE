// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initLearningProgress } from './learning-progress.js';

const PAGE = `
    <div id="progress-flashcards-bar"></div><span id="progress-flashcards"></span>
    <div id="progress-quiz-bar"></div><span id="progress-quiz"></span>
    <div id="progress-interview-bar"></div><span id="progress-interview"></span>
    <span id="hs-snake">?</span><span id="hs-memory">?</span><span id="hs-quiz">?</span>`;
let storage;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument(PAGE);
});
afterEach(removePageGlobals);

const text = (id) => document.getElementById(id).textContent;
const width = (id) => document.getElementById(id).style.width;

describe('learning-progress', () => {
    it('shows empty values without stored progress', () => {
        initLearningProgress();
        expect(text('progress-flashcards')).toBe('0%');
        expect(width('progress-flashcards-bar')).toBe('0%');
        expect(text('progress-quiz')).toBe('0%');
        expect(text('progress-interview')).toBe('0%');
        expect(text('hs-snake')).toBe('—');
        expect(text('hs-memory')).toBe('?');
        expect(text('hs-quiz')).toBe('?');
    });

    it('computes the flashcard percentage from correct and total answers', () => {
        storage.setItem('flashcard_correct_count', '3');
        storage.setItem('flashcard_total_count', '8');
        initLearningProgress();
        expect(text('progress-flashcards')).toBe('38%');
        expect(width('progress-flashcards-bar')).toBe('38%');
    });

    it('treats damaged counters as zero instead of NaN', () => {
        storage.setItem('flashcard_correct_count', 'abc');
        storage.setItem('flashcard_total_count', '10');
        storage.setItem('quiz_best_score', 'kaputt');
        initLearningProgress();
        expect(text('progress-flashcards')).toBe('0%');
        expect(text('progress-quiz')).toBe('0%');
    });

    it('shows the best quiz and interview scores', () => {
        storage.setItem('quiz_best_score', '80');
        storage.setItem('interview_best_score', '65');
        initLearningProgress();
        expect(text('progress-quiz')).toBe('80%');
        expect(width('progress-quiz-bar')).toBe('80%');
        expect(text('progress-interview')).toBe('65%');
        expect(text('hs-quiz')).toBe('80%');
    });

    it('renders the game highscores', () => {
        storage.setItem('snake_highscore', '120');
        storage.setItem('memory_best_moves', '14');
        storage.setItem('memory_best_time', '45');
        initLearningProgress();
        expect(text('hs-snake')).toBe('120 Pts');
        expect(text('hs-memory')).toBe('14 Züge / 45s');
    });

    it('only shows a memory highscore when moves and time are both known', () => {
        storage.setItem('memory_best_moves', '14');
        initLearningProgress();
        expect(text('hs-memory')).toBe('?');
    });

    it('skips widgets that are not on the page', () => {
        resetDocument('');
        expect(() => initLearningProgress()).not.toThrow();
    });
});
