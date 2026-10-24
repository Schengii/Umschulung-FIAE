// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { EXAM_QUESTIONS } from './exam-questions.js';
import { EXAM_MODES, initIhkExamSimulator } from './ihk-exam-simulator.js';

// The pure logic of the simulator is covered by ihk-exam-simulator.test.js; this file drives
// the rendered exam: mode selection, answering, hand-in, result view and persistence.

const PAGE = `
    <div class="quiz-container">
        <h2>Quiz</h2>
        <div id="quiz-box">standard quiz</div>
    </div>`;

let storage;
let audio;
let achievements;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const panel = () => $('.exam-panel');
const modeButton = (mode) => $(`.btn-exam-mode[data-mode="${mode}"]`);
const buttonByText = (text) => $$('button').find((button) => button.textContent.trim() === text);
const savedResults = () => JSON.parse(storage.getItem('exam_results') ?? '{}');

/** The pool question that is currently on screen, found through its text. */
function currentQuestion() {
    const text = $('#exam-question-text').textContent;
    return EXAM_QUESTIONS.find((question) => question.question.de === text || question.question.en === text);
}

/** Clicks the answer button whose text is the given answer of the question. */
function choose(question, answerIndex) {
    const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de';
    const text = question.answers[answerIndex][lang];
    $$('.exam-answer')
        .find((button) => button.textContent === text)
        .click();
}

/** Answers every question with the right (true), a wrong (false) or no (null) answer. */
function answerAll(mode, how) {
    const questionCount = $$('.exam-step').length;
    for (let i = 0; i < questionCount; i++) {
        const question = currentQuestion();
        if (how !== null) choose(question, how ? question.correct : (question.correct + 1) % 4);
        if (i < questionCount - 1) buttonByText('Weiter').click();
    }
}

function startExam(mode) {
    modeButton(mode).click();
    $('#exam-start-btn').click();
}

beforeEach(() => {
    vi.useFakeTimers();
    storage = installPageGlobals();
    Object.assign(globalThis.STORAGE_KEYS, {
        EXAM_RESULTS: 'exam_results',
        EXAM_TOPIC_STATS: 'exam_topic_stats',
        EXAM_WRONG_QUESTIONS: 'exam_wrong_questions',
        LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES: 'weak_categories',
    });
    audio = { play: vi.fn() };
    achievements = { unlock: vi.fn() };
    window.GameAudio = audio;
    window.Achievements = achievements;
    resetDocument(PAGE);
    initIhkExamSimulator();
});
afterEach(() => {
    window.dispatchEvent(new Event('pagehide'));
    vi.useRealTimers();
    removePageGlobals();
    delete window.GameAudio;
    delete window.Achievements;
});

describe('exam simulator: mode selection', () => {
    it('does nothing on pages without the quiz container', () => {
        resetDocument('');
        expect(() => initIhkExamSimulator()).not.toThrow();
    });

    it('renders five mode buttons with the standard quiz selected', () => {
        expect($$('.btn-exam-mode')).toHaveLength(5);
        expect(modeButton('standard').getAttribute('aria-pressed')).toBe('true');
        expect(modeButton('ap1').getAttribute('aria-pressed')).toBe('false');
        expect(panel().hidden).toBe(true);
        expect($('#exam-timer-display').hidden).toBe(true);
    });

    it('shows the intro with the time limit when an exam mode is chosen', () => {
        modeButton('ap2').click();

        expect(panel().hidden).toBe(false);
        expect($('#exam-timer-display').hidden).toBe(false);
        expect($('#timer-countdown').textContent).toBe('20:00');
        expect(panel().textContent).toContain('AP2');
        expect(panel().textContent).toContain('15 zufällig ausgewählte Fragen');
        expect($('.quiz-container').classList.contains('exam-active')).toBe(true);
    });

    it('uses the shorter limit for the WISO part', () => {
        modeButton('wiso').click();
        expect($('#timer-countdown').textContent).toBe('15:00');
    });

    it('returns to the standard quiz and hides the panel', () => {
        modeButton('ap1').click();
        modeButton('standard').click();
        expect(panel().hidden).toBe(true);
        expect($('.quiz-container').classList.contains('exam-active')).toBe(false);
    });

    it('re-renders frame and view in English after a language change', () => {
        modeButton('ap1').click();
        document.documentElement.setAttribute('lang', 'en');
        window.dispatchEvent(new CustomEvent('fiae:lang-change'));

        expect($('.exam-mode-title').textContent).toBe('Choose a mode');
        expect(modeButton('ap1').textContent).toContain('AP1 simulation');
        expect(panel().textContent).toContain('Start exam');
        document.documentElement.removeAttribute('lang');
    });

    it('shows earlier attempts in the intro', () => {
        storage.setItem('exam_results', JSON.stringify({ ap1: { attempts: 3, best: 80, last: 60 } }));
        modeButton('ap1').click();
        expect(panel().textContent).toContain('3 Versuch(e), bestes Ergebnis 80 %');
    });

    it('survives a damaged results entry', () => {
        storage.setItem('exam_results', '{kaputt');
        expect(() => modeButton('ap1').click()).not.toThrow();
        expect(panel().textContent).not.toContain('Bisher');
    });
});

describe('exam simulator: answering', () => {
    it('starts a run with the configured number of questions and four answers each', () => {
        startExam('ap1');
        expect($$('.exam-step')).toHaveLength(EXAM_MODES.ap1.questionCount);
        expect($$('.exam-answer')).toHaveLength(4);
        expect(panel().textContent).toContain(`Frage 1 von ${EXAM_MODES.ap1.questionCount}`);
        expect(currentQuestion()).toBeDefined();
    });

    it('marks the chosen answer and keeps no feedback during the exam', () => {
        startExam('ap1');
        const question = currentQuestion();
        choose(question, question.correct);

        const selected = $$('.exam-answer.selected');
        expect(selected).toHaveLength(1);
        expect(selected[0].getAttribute('aria-checked')).toBe('true');
        expect($('.exam-step.answered')).not.toBeNull();
        expect(panel().textContent).not.toContain('Richtig:');
    });

    it('navigates with back, next and the step buttons', () => {
        startExam('ap1');
        expect(buttonByText('Zurück').disabled).toBe(true);

        buttonByText('Weiter').click();
        expect(panel().textContent).toContain('Frage 2 von');
        expect(buttonByText('Zurück').disabled).toBe(false);

        $$('.exam-step')[4].click();
        expect(panel().textContent).toContain('Frage 5 von');
        expect($$('.exam-step')[4].getAttribute('aria-current')).toBe('step');

        buttonByText('Zurück').click();
        expect(panel().textContent).toContain('Frage 4 von');
    });

    it('disables next on the last question', () => {
        startExam('wiso');
        $$('.exam-step')[EXAM_MODES.wiso.questionCount - 1].click();
        expect(buttonByText('Weiter').disabled).toBe(true);
    });

    it('counts the time down and warns when little time is left', () => {
        startExam('ap1');
        vi.advanceTimersByTime(60 * 1000);
        expect($('#timer-countdown').textContent).toBe('19:00');

        vi.advanceTimersByTime(18 * 60 * 1000 + 1000);
        expect($('#exam-timer-display').classList.contains('exam-timer-low')).toBe(true);
        expect($('.sr-only').textContent).toContain('Noch 1 Minute(n).');
    });
});

describe('exam simulator: hand in', () => {
    it('asks for confirmation when questions are still open', () => {
        startExam('ap1');
        buttonByText('Prüfung abgeben').click();

        expect($('.exam-warning').textContent).toContain(`Noch ${EXAM_MODES.ap1.questionCount} Frage(n) unbeantwortet`);
        expect($('#exam-score')).toBeNull();

        buttonByText('Trotzdem abgeben').click();
        expect($('#exam-score')).not.toBeNull();
    });

    it('passes with all answers right, stores the result and unlocks the achievement', () => {
        startExam('ap1');
        answerAll('ap1', true);
        buttonByText('Prüfung abgeben').click();

        expect($('#exam-score').textContent).toContain(
            `${EXAM_MODES.ap1.questionCount} von ${EXAM_MODES.ap1.questionCount} richtig (100 %)`
        );
        expect($('#exam-score').textContent).toContain('Note 1 (sehr gut) – bestanden');
        expect($('#exam-score').classList.contains('exam-passed')).toBe(true);
        expect(achievements.unlock).toHaveBeenCalledWith('exam_passed');
        expect(audio.play).toHaveBeenCalledWith('success');

        const result = savedResults().ap1;
        expect(result).toMatchObject({ attempts: 1, best: 100, last: 100 });
        expect(new Date(result.date).getTime()).not.toBeNaN();
    });

    it('fails with all answers wrong and records the weak topics', () => {
        startExam('ap2');
        answerAll('ap2', false);
        buttonByText('Prüfung abgeben').click();

        expect($('#exam-score').textContent).toContain('nicht bestanden');
        expect($('#exam-score').classList.contains('exam-failed')).toBe(true);
        expect(achievements.unlock).not.toHaveBeenCalled();
        expect(audio.play).toHaveBeenCalledWith('fail');
        expect($('.exam-recommendation')).not.toBeNull();
        expect($$('.exam-topic-weak').length).toBeGreaterThan(0);

        const weak = JSON.parse(storage.getItem('weak_categories'));
        expect(Array.isArray(weak)).toBe(true);
        expect(weak.length).toBeGreaterThan(0);
    });

    it('reviews every question with the given and the correct answer', () => {
        startExam('wiso');
        answerAll('wiso', false);
        buttonByText('Prüfung abgeben').click();

        const items = $$('.exam-review > li');
        expect(items).toHaveLength(EXAM_MODES.wiso.questionCount);
        expect(items.every((li) => li.classList.contains('exam-review-wrong'))).toBe(true);
        expect(items[0].textContent).toContain('Richtig:');
        expect(items[0].querySelector('.exam-review-explanation').textContent.length).toBeGreaterThan(5);
    });

    it('reports unanswered questions as "keine"', () => {
        startExam('wiso');
        buttonByText('Prüfung abgeben').click();
        buttonByText('Trotzdem abgeben').click();
        expect($('.exam-review > li').textContent).toContain('Deine Antwort: keine');
    });

    it('accumulates attempts and keeps the best result', () => {
        startExam('wiso');
        answerAll('wiso', true);
        buttonByText('Prüfung abgeben').click();

        $('#exam-restart-btn').click();
        $('#exam-start-btn').click();
        answerAll('wiso', false);
        buttonByText('Prüfung abgeben').click();

        expect(savedResults().wiso).toMatchObject({ attempts: 2, best: 100, last: 0 });
    });

    it('hands in automatically when the time is up', () => {
        startExam('wiso');
        vi.advanceTimersByTime(EXAM_MODES.wiso.durationSeconds * 1000 + 500);

        expect($('#exam-score')).not.toBeNull();
        expect(panel().textContent).toContain('Die Zeit ist abgelaufen');
        expect(savedResults().wiso.attempts).toBe(1);
    });

    it('stops the clock after the hand in', () => {
        startExam('wiso');
        buttonByText('Prüfung abgeben').click();
        buttonByText('Trotzdem abgeben').click();
        vi.advanceTimersByTime(EXAM_MODES.wiso.durationSeconds * 1000 * 2);
        expect(savedResults().wiso.attempts).toBe(1);
    });

    it('offers a new run from the result view', () => {
        startExam('wiso');
        buttonByText('Prüfung abgeben').click();
        buttonByText('Trotzdem abgeben').click();
        $('#exam-restart-btn').click();
        expect($('#exam-start-btn')).not.toBeNull();
    });

    it('renders the result in English', () => {
        document.documentElement.setAttribute('lang', 'en');
        startExam('wiso');
        answerAllEnglish();
        buttonByText('Hand in exam').click();

        expect($('#exam-score').textContent).toMatch(/correct \(\d+%\) – grade \d \(.+\) – (passed|failed)/);
        document.documentElement.removeAttribute('lang');

        function answerAllEnglish() {
            const { questionCount } = EXAM_MODES.wiso;
            for (let i = 0; i < questionCount; i++) {
                const question = currentQuestion();
                choose(question, question.correct);
                if (i < questionCount - 1) buttonByText('Next').click();
            }
        }
    });
});

describe('exam simulator: statistics and repeating weaknesses', () => {
    const savedStats = () => JSON.parse(storage.getItem('exam_topic_stats') ?? '{}');
    const savedWrong = () => JSON.parse(storage.getItem('exam_wrong_questions') ?? '[]');

    it('records topic statistics and the wrongly answered questions after a run', () => {
        startExam('ap1');
        answerAll('ap1', false);
        $('#exam-submit-btn').click();

        const stats = savedStats();
        const total = Object.values(stats).reduce((sum, entry) => sum + entry.total, 0);
        expect(total).toBe(EXAM_MODES.ap1.questionCount);
        expect(Object.values(stats).every((entry) => entry.correct === 0)).toBe(true);
        expect(savedWrong()).toHaveLength(EXAM_MODES.ap1.questionCount);
    });

    it('removes questions from the open mistakes once they are answered correctly', () => {
        startExam('ap1');
        answerAll('ap1', false);
        $('#exam-submit-btn').click();
        const before = savedWrong().length;

        modeButton('weak').click();
        $('#exam-start-btn').click();
        answerAll('weak', true);
        $('#exam-submit-btn').click();

        expect(savedWrong().length).toBeLessThan(before);
    });

    it('asks to take a simulation first while nothing is known', () => {
        modeButton('weak').click();
        expect($('#exam-weak-empty')).not.toBeNull();
        expect($('#exam-start-btn')).toBeNull();
    });

    it('starts a revision run with the open mistakes and the shorter time limit', () => {
        storage.setItem(
            'exam_wrong_questions',
            JSON.stringify(EXAM_QUESTIONS.slice(0, 4).map((question) => question.id))
        );
        modeButton('weak').click();
        expect(panel().textContent).toContain('12:00');
        expect($('#exam-start-btn').textContent).toBe('Wiederholung starten');
        $('#exam-start-btn').click();
        expect($$('.exam-step').length).toBeGreaterThanOrEqual(4);
        expect(currentQuestion()).toBeTruthy();
    });

    it('does not count the revision run as an exam attempt of its own part', () => {
        storage.setItem('exam_wrong_questions', JSON.stringify([EXAM_QUESTIONS[0].id]));
        modeButton('weak').click();
        $('#exam-start-btn').click();
        answerAll('weak', true);
        $('#exam-submit-btn').click();
        expect(Object.keys(savedResults())).toEqual(['weak']);
    });

    it('shows the standing per topic in the intro once enough answers exist', () => {
        storage.setItem(
            'exam_topic_stats',
            JSON.stringify({ sql: { total: 10, correct: 3 }, network: { total: 2, correct: 2 } })
        );
        modeButton('ap2').click();
        const rows = $$('#exam-topic-overview tbody tr');
        expect(rows).toHaveLength(1);
        expect(rows[0].textContent).toContain('3 / 10');
        expect(rows[0].textContent).toContain('30 %');
        expect(rows[0].classList.contains('exam-topic-weak')).toBe(true);
    });

    it('hides the overview while there is too little data or the data is damaged', () => {
        modeButton('ap2').click();
        expect($('#exam-topic-overview')).toBeNull();
        storage.setItem('exam_topic_stats', 'kaputt');
        modeButton('ap1').click();
        expect($('#exam-topic-overview')).toBeNull();
    });

    it('offers to repeat weaknesses and to practise flashcards after a bad run', () => {
        startExam('ap1');
        answerAll('ap1', false);
        $('#exam-submit-btn').click();
        expect($('#exam-repeat-weak-btn')).not.toBeNull();
        expect($('.exam-nav a[href="flashcards.html"]')).not.toBeNull();

        $('#exam-repeat-weak-btn').click();
        expect(modeButton('weak').getAttribute('aria-pressed')).toBe('true');
        expect($('#exam-start-btn')).not.toBeNull();
    });

    it('offers neither after a perfect first run', () => {
        startExam('ap1');
        answerAll('ap1', true);
        $('#exam-submit-btn').click();
        expect($('#exam-repeat-weak-btn')).toBeNull();
        expect($('.exam-nav a[href="flashcards.html"]')).toBeNull();
    });
});
