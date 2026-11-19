/**
 * IHK exam simulation for quiz.html (AP1, AP2, WISO).
 *
 * A timed run over a random, topic-balanced selection from the question pool
 * (exam-questions.js). As in the written exam there is no feedback while answering; the
 * result shows points, the IHK grade and a breakdown per topic, followed by a review of
 * every question with its explanation.
 *
 * The first half of this file is pure logic (no DOM) and covered by unit tests.
 */

import { EXAM_QUESTIONS, EXAM_TOPICS } from './exam-questions.js';
import { parseHistory, addRunToHistory } from './exam-history.js';
import {
    scoreAnswer,
    isAnswered,
    isFullyCorrect,
    typeOf,
    shuffleableIndices,
    correctAnswerText,
    givenAnswerText,
    parseNumber,
} from './question-types.js';
import { getIhkGrade } from './grade-calculator.js';
import {
    addRunToTopicStats,
    parseTopicStats,
    parseWrongQuestions,
    pickWeaknessQuestions,
    rankTopics,
    updateWrongQuestions,
} from './exam-statistics.js';

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */

/**
 * Questions per run and time limit of each exam part (about 80 seconds per question).
 * @type {Readonly<Record<string, {questionCount: number, durationSeconds: number, de: string, en: string}>>}
 */
export const EXAM_MODES = Object.freeze({
    ap1: {
        questionCount: 15,
        durationSeconds: 20 * 60,
        de: 'AP1 – Einrichten eines IT-gestützten Arbeitsplatzes',
        en: 'AP1 – Setting up an IT workplace',
    },
    ap2: {
        questionCount: 15,
        durationSeconds: 20 * 60,
        de: 'AP2 – Softwareentwicklung, OOP & SQL',
        en: 'AP2 – Software development, OOP & SQL',
    },
    wiso: {
        questionCount: 12,
        durationSeconds: 15 * 60,
        de: 'WISO – Wirtschafts- und Sozialkunde',
        en: 'WISO – Economics and social studies',
    },
});

/**
 * "Repeat weaknesses": a shorter run made of the questions still answered wrongly and the
 * weakest topics (see exam-statistics.js). Kept apart from EXAM_MODES because it has no
 * question pool of its own.
 */
export const WEAKNESS_MODE = Object.freeze({
    questionCount: 10,
    durationSeconds: 12 * 60,
    de: 'Schwächen wiederholen – deine offenen Fragen und schwächsten Themen',
    en: 'Repeat weaknesses – your open questions and weakest topics',
});

/** @param {string} mode */
function modeConfig(mode) {
    return mode === 'weak' ? WEAKNESS_MODE : EXAM_MODES[mode];
}

/** @type {Readonly<Record<number, {de: string, en: string}>>} */
export const GRADE_LABELS = Object.freeze({
    1: { de: 'sehr gut', en: 'very good' },
    2: { de: 'gut', en: 'good' },
    3: { de: 'befriedigend', en: 'satisfactory' },
    4: { de: 'ausreichend', en: 'sufficient' },
    5: { de: 'mangelhaft', en: 'poor' },
    6: { de: 'ungenügend', en: 'insufficient' },
});

/** The written IHK exam is passed with at least 50 points (grade 4). */
export const PASS_PERCENT = 50;

/** @param {number} secondsRemaining */
export function formatTimerText(secondsRemaining) {
    const clamped = Math.max(0, secondsRemaining);
    const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
    const secs = String(clamped % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

/**
 * Fisher-Yates shuffle on a copy.
 * @template T
 * @param {T[]} items
 * @param {() => number} [random]
 * @returns {T[]}
 */
export function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Random selection of `count` questions of one exam part, spread evenly over its topics so
 * that a run never consists of a single subject area.
 * @param {import('./exam-questions.js').ExamQuestion[]} pool
 * @param {string} exam
 * @param {number} count
 * @param {() => number} [random]
 */
export function pickExamQuestions(pool, exam, count, random = Math.random) {
    /** @type {Map<string, import('./exam-questions.js').ExamQuestion[]>} */
    const byTopic = new Map();
    for (const question of pool) {
        if (question.exam !== exam) continue;
        const queue = byTopic.get(question.topic) || [];
        queue.push(question);
        byTopic.set(question.topic, queue);
    }
    const queues = shuffle([...byTopic.values()], random).map((questions) => shuffle(questions, random));

    /** @type {import('./exam-questions.js').ExamQuestion[]} */
    const picked = [];
    while (picked.length < count && queues.some((queue) => queue.length > 0)) {
        for (const queue of queues) {
            if (picked.length < count && queue.length > 0) picked.push(/** @type {ExamQuestion} */ (queue.pop()));
        }
    }
    return shuffle(picked, random);
}

/**
 * @param {import('./exam-questions.js').ExamQuestion[]} questions
 * @param {unknown[]} answers answer per question (shape depends on the question type, see question-types.js)
 */
export function evaluateExam(questions, answers) {
    const topics = new Map();
    let correct = 0;
    let answered = 0;
    let points = 0;

    questions.forEach((question, index) => {
        const given = answers[index];
        const score = scoreAnswer(question, given);
        if (isAnswered(question, given)) answered++;
        if (score === 1) correct++;
        points += score;

        const topic = topics.get(question.topic) || { topic: question.topic, total: 0, correct: 0, points: 0 };
        topic.total++;
        topic.points += score;
        if (score === 1) topic.correct++;
        topics.set(question.topic, topic);
    });

    const total = questions.length;
    // Partial credit (multiple choice, ordering, matching, cloze) counts into the rate.
    const percent = total === 0 ? 0 : Math.round((points / total) * 100);
    const topicResults = [...topics.values()].map(({ points: topicPoints, ...topic }) => ({
        ...topic,
        percent: Math.round((topicPoints / topic.total) * 100),
    }));

    return {
        total,
        correct,
        answered,
        percent,
        grade: getIhkGrade(percent),
        passed: percent >= PASS_PERCENT,
        topics: topicResults,
        // Topics below the pass mark, weakest first.
        weakTopics: topicResults
            .filter((topic) => topic.percent < PASS_PERCENT)
            .sort((a, b) => a.percent - b.percent)
            .map((topic) => topic.topic),
    };
}

/* ------------------------------------------------------------------------------------ */
/* Page integration                                                                      */
/* ------------------------------------------------------------------------------------ */

/**
 * @param {string} tag
 * @param {Record<string, string>} [attributes]
 * @param {...(Node | string | null | undefined)} children
 * @returns {HTMLElement}
 */
function element(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
        if (name === 'class') node.className = value;
        else if (name === 'text') node.textContent = value;
        else if (name === 'html') node.innerHTML = value;
        else node.setAttribute(name, value);
    }
    node.append(...children.filter((child) => child !== null && child !== undefined));
    return node;
}

export function initIhkExamSimulator() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de');
    /** @param {string} de @param {string} en */
    const t = (de, en) => (lang() === 'en' ? en : de);

    /** @type {{mode: string, questions: import('./exam-questions.js').ExamQuestion[], order: number[][], answers: any[], index: number, deadline: number, view: 'intro'|'running'|'result', timedOut: boolean} | null} */
    let run = null;
    let mode = 'standard';
    let timerId = 0;
    let submitArmed = false;

    // ---- static frame: mode selector and exam panel -------------------------------------
    const timerValue = element('span', { id: 'timer-countdown', text: '00:00' });
    const timerDisplay = element(
        'div',
        { id: 'exam-timer-display', class: 'exam-timer', role: 'timer', hidden: '' },
        element('span', { class: 'exam-timer-label' }),
        ' ',
        timerValue
    );
    const modeTitle = element('h3', { class: 'exam-mode-title' });
    const modeHint = element('p', { class: 'exam-mode-hint' });
    const modeButtons = element('div', { class: 'exam-mode-buttons', role: 'group' });
    const MODE_BUTTONS = [
        ['standard', '📋 Normales Quiz', '📋 Standard quiz'],
        ['ap1', '⏱️ AP1-Simulation', '⏱️ AP1 simulation'],
        ['ap2', '⚡ AP2-Simulation', '⚡ AP2 simulation'],
        ['wiso', '💼 WISO-Simulation', '💼 WISO simulation'],
        ['weak', '🎯 Schwächen wiederholen', '🎯 Repeat weaknesses'],
    ];
    for (const [key] of MODE_BUTTONS) {
        const button = element('button', { type: 'button', class: 'btn-exam-mode', 'data-mode': key });
        button.addEventListener('click', () => selectMode(key));
        modeButtons.appendChild(button);
    }

    const modeSelector = element(
        'div',
        { class: 'ihk-mode-selector' },
        element('div', { class: 'exam-mode-header' }, element('div', {}, modeTitle, modeHint), timerDisplay),
        modeButtons
    );
    const examPanel = element('section', { class: 'exam-panel', hidden: '' });
    /** @param {...(Node | string | null | undefined)} children */
    const setPanel = (...children) =>
        examPanel.replaceChildren(...children.filter((child) => child !== null && child !== undefined));
    // Announces the remaining time at a few marks without reading every second aloud.
    const announcer = element('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });

    quizContainer.insertBefore(modeSelector, quizContainer.children[1]);
    modeSelector.after(examPanel, announcer);

    function renderFrame() {
        modeTitle.textContent = t('Modus wählen', 'Choose a mode');
        modeHint.textContent = t(
            'Normales Quiz zur Website oder eine Prüfungssimulation mit Zeitlimit und Auswertung je Themengebiet.',
            'The standard quiz about this website, or a timed exam simulation with a breakdown per topic.'
        );
        modeButtons.setAttribute('aria-label', t('Quiz-Modus', 'Quiz mode'));
        const timerLabel = timerDisplay.querySelector('.exam-timer-label');
        if (timerLabel) timerLabel.textContent = t('⏱️ Restzeit:', '⏱️ Time left:');
        modeButtons.querySelectorAll('.btn-exam-mode').forEach((button, index) => {
            const [key, de, en] = MODE_BUTTONS[index];
            button.textContent = t(de, en);
            button.classList.toggle('active', key === mode);
            button.setAttribute('aria-pressed', String(key === mode));
        });
    }

    // ---- storage -------------------------------------------------------------------------
    function readResults() {
        try {
            const stored = JSON.parse(AppStorage.getItem(STORAGE_KEYS.EXAM_RESULTS, '{}'));
            return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
        } catch (_e) {
            return {};
        }
    }

    /** @param {string} examMode @param {ReturnType<typeof evaluateExam>} result */
    function saveResult(examMode, result) {
        const results = readResults();
        const previous = results[examMode] || { attempts: 0, best: 0 };
        results[examMode] = {
            attempts: previous.attempts + 1,
            best: Math.max(previous.best, result.percent),
            last: result.percent,
            date: new Date().toISOString(),
        };
        AppStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
        AppStorage.setItem(
            STORAGE_KEYS.EXAM_HISTORY,
            JSON.stringify(
                addRunToHistory(parseHistory(AppStorage.getItem(STORAGE_KEYS.EXAM_HISTORY, '[]')), {
                    mode: examMode,
                    percent: result.percent,
                    topics: result.topics,
                })
            )
        );

        // Weak topics feed the learning recommendations on the dashboard.
        if (result.weakTopics.length > 0) {
            /** @type {string[]} */
            let weak = [];
            try {
                const stored = JSON.parse(
                    AppStorage.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES, '[]')
                );
                if (Array.isArray(stored)) weak = stored.filter((entry) => typeof entry === 'string');
            } catch (_e) {
                weak = [];
            }
            for (const topic of result.weakTopics) {
                const category = EXAM_TOPICS[topic]?.category;
                if (category && !weak.includes(category)) weak.push(category);
            }
            AppStorage.setItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES, JSON.stringify(weak));
        }
    }

    function readTopicStats() {
        return parseTopicStats(AppStorage.getItem(STORAGE_KEYS.EXAM_TOPIC_STATS, '{}'));
    }

    function readWrongQuestions() {
        return parseWrongQuestions(AppStorage.getItem(STORAGE_KEYS.EXAM_WRONG_QUESTIONS, '[]'));
    }

    /** Adds the finished run to the statistics over all runs and to the list of open mistakes. */
    function recordStatistics() {
        const state = /** @type {NonNullable<typeof run>} */ (run);
        AppStorage.setItem(
            STORAGE_KEYS.EXAM_TOPIC_STATS,
            JSON.stringify(addRunToTopicStats(readTopicStats(), state.questions, state.answers))
        );
        AppStorage.setItem(
            STORAGE_KEYS.EXAM_WRONG_QUESTIONS,
            JSON.stringify(updateWrongQuestions(readWrongQuestions(), state.questions, state.answers))
        );
    }

    /** @returns {import('./exam-questions.js').ExamQuestion[]} */
    function pickWeaknessRun() {
        return pickWeaknessQuestions(
            EXAM_QUESTIONS,
            readWrongQuestions(),
            readTopicStats(),
            WEAKNESS_MODE.questionCount,
            shuffle
        );
    }

    // ---- timer ---------------------------------------------------------------------------
    function stopTimer() {
        clearInterval(timerId);
        timerId = 0;
    }

    function secondsLeft() {
        return run ? Math.max(0, Math.ceil((run.deadline - Date.now()) / 1000)) : 0;
    }

    function startTimer() {
        stopTimer();
        let announcedAt = Infinity;
        const tick = () => {
            const left = secondsLeft();
            timerValue.textContent = formatTimerText(left);
            timerDisplay.classList.toggle('exam-timer-low', left <= 60);
            for (const mark of [300, 60]) {
                if (left <= mark && announcedAt > mark) {
                    announcedAt = mark;
                    announcer.textContent = t(`Noch ${mark / 60} Minute(n).`, `${mark / 60} minute(s) left.`);
                }
            }
            if (left <= 0) finish(true);
        };
        tick();
        // The deadline is a timestamp, so a throttled background tab cannot stretch the exam.
        timerId = window.setInterval(tick, 250);
    }

    // ---- views ---------------------------------------------------------------------------
    /** @param {string} nextMode */
    function selectMode(nextMode) {
        stopTimer();
        mode = nextMode;
        run = null;
        submitArmed = false;
        const isExam = mode !== 'standard';
        quizContainer?.classList.toggle('exam-active', isExam);
        examPanel.hidden = !isExam;
        timerDisplay.hidden = !isExam;
        timerDisplay.classList.remove('exam-timer-low');
        renderFrame();
        if (isExam) {
            timerValue.textContent = formatTimerText(modeConfig(mode).durationSeconds);
            run = {
                mode,
                questions: [],
                order: [],
                answers: [],
                index: 0,
                deadline: 0,
                view: 'intro',
                timedOut: false,
            };
            render();
        }
    }

    function startRun() {
        const config = modeConfig(mode);
        const questions =
            mode === 'weak' ? pickWeaknessRun() : pickExamQuestions(EXAM_QUESTIONS, mode, config.questionCount);
        if (questions.length === 0) return;
        run = {
            mode,
            questions,
            order: questions.map((question) => shuffle(shuffleableIndices(question))),
            answers: questions.map(() => /** @type {any} */ (null)),
            index: 0,
            deadline: Date.now() + config.durationSeconds * 1000,
            view: 'running',
            timedOut: false,
        };
        submitArmed = false;
        render();
        startTimer();
    }

    /** @param {boolean} timedOut */
    function finish(timedOut) {
        if (!run || run.view !== 'running') return;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        stopTimer();
        run.view = 'result';
        run.timedOut = timedOut;
        const result = evaluateExam(run.questions, run.answers);
        saveResult(run.mode, result);
        recordStatistics();
        if (result.passed && window.Achievements) window.Achievements.unlock('exam_passed');
        if (window.GameAudio) window.GameAudio.play(result.passed ? 'success' : 'fail');
        render();
        examPanel.querySelector('h3')?.focus();
    }

    function render() {
        if (!run) return;
        if (run.view === 'intro') renderIntro();
        else if (run.view === 'running') renderQuestion();
        else renderResult();
    }

    /** "Your standing per topic" over all runs, or null while there is not enough data. */
    function renderTopicOverview() {
        const language = lang();
        const ranked = rankTopics(readTopicStats());
        if (ranked.length === 0) return null;
        const rows = ranked.map((entry) => {
            const label = EXAM_TOPICS[entry.topic]?.[language] ?? entry.topic;
            return element(
                'tr',
                { class: entry.percent < PASS_PERCENT ? 'exam-topic-weak' : '' },
                element('th', { scope: 'row', text: label }),
                element('td', { text: `${entry.correct} / ${entry.total}` }),
                element('td', { text: `${entry.percent} %` })
            );
        });
        return element(
            'details',
            { class: 'exam-overview', id: 'exam-topic-overview' },
            element('summary', {
                text: t('Dein Stand je Themengebiet (alle Versuche)', 'Your standing per topic (all attempts)'),
            }),
            element(
                'table',
                { class: 'exam-topic-table' },
                element(
                    'thead',
                    {},
                    element(
                        'tr',
                        {},
                        element('th', { scope: 'col', text: t('Themengebiet', 'Topic') }),
                        element('th', { scope: 'col', text: t('Richtig', 'Correct') }),
                        element('th', { scope: 'col', text: t('Quote', 'Rate') })
                    )
                ),
                element('tbody', {}, ...rows)
            )
        );
    }

    function renderIntro() {
        const state = /** @type {NonNullable<typeof run>} */ (run);
        const config = modeConfig(state.mode);
        const stored = readResults()[state.mode];
        const isWeakness = state.mode === 'weak';
        const available = isWeakness ? pickWeaknessRun().length : config.questionCount;
        const start = element('button', {
            type: 'button',
            class: 'btn-primary exam-start-btn',
            id: 'exam-start-btn',
            text: isWeakness ? t('Wiederholung starten', 'Start revision') : t('Prüfung starten', 'Start exam'),
        });
        start.addEventListener('click', startRun);
        if (isWeakness && available === 0) {
            setPanel(
                element('h3', { class: 'exam-heading', text: t(config.de, config.en) }),
                element('p', {
                    id: 'exam-weak-empty',
                    text: t(
                        'Noch keine Schwächen erfasst. Mach zuerst eine Simulation (AP1, AP2 oder WISO); falsch beantwortete Fragen und schwache Themen erscheinen dann hier.',
                        'No weaknesses recorded yet. Take a simulation first (AP1, AP2 or WISO); wrongly answered questions and weak topics will then show up here.'
                    ),
                }),
                renderTopicOverview()
            );
            return;
        }

        setPanel(
            element('h3', { class: 'exam-heading', text: t(config.de, config.en) }),
            element('p', {
                text: isWeakness
                    ? t(
                          `${available} Fragen aus deinen offenen Fehlern und den schwächsten Themengebieten, Zeitlimit ${formatTimerText(config.durationSeconds)} Minuten. Eine richtig beantwortete Frage verschwindet aus der Liste.`,
                          `${available} questions from your open mistakes and your weakest topics, time limit ${formatTimerText(config.durationSeconds)} minutes. A question answered correctly drops off the list.`
                      )
                    : t(
                          `${config.questionCount} zufällig ausgewählte Fragen, Zeitlimit ${formatTimerText(config.durationSeconds)} Minuten. Während der Prüfung gibt es keine Rückmeldung; die Auswertung folgt nach der Abgabe.`,
                          `${config.questionCount} randomly selected questions, time limit ${formatTimerText(config.durationSeconds)} minutes. There is no feedback during the exam; the evaluation follows after you hand in.`
                      ),
            }),
            element('p', {
                class: 'exam-note',
                text: t(
                    'Bestanden ist ab 50 %. Die Fragen sind Übungsaufgaben im Stil der IHK-Prüfung, keine Originalaufgaben.',
                    'The pass mark is 50%. The questions are practice tasks in the style of the IHK exam, not original exam tasks.'
                ),
            }),
            stored
                ? element('p', {
                      class: 'exam-best',
                      text: t(
                          `Bisher: ${stored.attempts} Versuch(e), bestes Ergebnis ${stored.best} %.`,
                          `So far: ${stored.attempts} attempt(s), best result ${stored.best}%.`
                      ),
                  })
                : null,
            renderTopicOverview(),
            start
        );
    }

    /**
     * Input element of the current question; the shape depends on its type (question-types.js).
     * @param {import('./exam-questions.js').ExamQuestion} question
     * @param {number} index position of the question in the run
     * @param {string} questionId id of the heading that labels the input
     * @returns {HTMLElement}
     */
    function renderAnswerInput(question, index, questionId) {
        const state = /** @type {NonNullable<typeof run>} */ (run);
        const items = question.items || [];
        const pairs = question.pairs || [];
        const blanks = question.blanks || [];
        const template = question.template || { de: '', en: '' };
        const language = lang();
        const type = typeOf(question);
        const refresh = (/** @type {string} */ focusSelector) => {
            submitArmed = false;
            renderQuestion();
            /** @type {HTMLElement | null} */ (examPanel.querySelector(focusSelector))?.focus();
        };
        /** Marks the step of this question as answered without re-rendering (keeps typing focus). */
        const syncStep = () => {
            examPanel
                .querySelector('.exam-step.current')
                ?.classList.toggle('answered', isAnswered(question, state.answers[index]));
        };

        if (type === 'multi') {
            const group = element('div', { class: 'exam-answers', role: 'group', 'aria-labelledby': questionId });
            state.order[index].forEach((answerIndex) => {
                const chosen = /** @type {number[]} */ (state.answers[index] || []);
                const selected = chosen.includes(answerIndex);
                const option = element('button', {
                    type: 'button',
                    class: `btn-quiz exam-answer${selected ? ' selected' : ''}`,
                    role: 'checkbox',
                    'aria-checked': String(selected),
                    'data-answer': String(answerIndex),
                    text: question.answers[answerIndex][language],
                });
                option.addEventListener('click', () => {
                    const next = selected ? chosen.filter((entry) => entry !== answerIndex) : [...chosen, answerIndex];
                    state.answers[index] = next.length ? next : null;
                    refresh(`[data-answer="${answerIndex}"]`);
                });
                group.appendChild(option);
            });
            return group;
        }

        if (type === 'order') {
            const sequence = /** @type {number[]} */ (state.answers[index] || state.order[index]);
            const list = element('ol', { class: 'exam-order', 'aria-labelledby': questionId });
            const move = (/** @type {number} */ from, /** @type {number} */ to) => {
                const next = [...sequence];
                next.splice(to, 0, /** @type {number} */ (next.splice(from, 1)[0]));
                state.answers[index] = next;
                refresh(`[data-position="${to}"]`);
            };
            sequence.forEach((itemIndex, position) => {
                const up = /** @type {HTMLButtonElement} */ (
                    element('button', {
                        type: 'button',
                        class: 'btn-secondary exam-order-btn',
                        'aria-label': t('Nach oben', 'Move up'),
                        text: '↑',
                    })
                );
                const down = /** @type {HTMLButtonElement} */ (
                    element('button', {
                        type: 'button',
                        class: 'btn-secondary exam-order-btn',
                        'aria-label': t('Nach unten', 'Move down'),
                        text: '↓',
                    })
                );
                up.disabled = position === 0;
                down.disabled = position === sequence.length - 1;
                up.addEventListener('click', () => move(position, position - 1));
                down.addEventListener('click', () => move(position, position + 1));
                list.appendChild(
                    element(
                        'li',
                        { class: 'exam-order-item', 'data-position': String(position), tabindex: '-1' },
                        element('span', { text: items[itemIndex][language] }),
                        up,
                        down
                    )
                );
            });
            const confirm = element('button', {
                type: 'button',
                class: 'btn-secondary exam-order-confirm',
                text: state.answers[index]
                    ? t('Reihenfolge übernommen ✓', 'Order confirmed ✓')
                    : t('Diese Reihenfolge übernehmen', 'Confirm this order'),
            });
            confirm.addEventListener('click', () => {
                state.answers[index] = [...sequence];
                refresh('.exam-order-confirm');
            });
            return element('div', { class: 'exam-answers' }, list, confirm);
        }

        if (type === 'match') {
            const chosen = /** @type {(number | null)[]} */ (
                state.answers[index] || pairs.map(() => /** @type {number | null} */ (null))
            );
            const rows = element('div', {
                class: 'exam-answers exam-match',
                role: 'group',
                'aria-labelledby': questionId,
            });
            pairs.forEach((pair, pairIndex) => {
                const selectId = `exam-match-${index}-${pairIndex}`;
                const select = /** @type {HTMLSelectElement} */ (
                    element('select', { id: selectId, class: 'exam-match-select' })
                );
                select.appendChild(element('option', { value: '', text: t('– auswählen –', '– choose –') }));
                state.order[index].forEach((rightIndex) => {
                    select.appendChild(
                        element('option', {
                            value: String(rightIndex),
                            text: pairs[rightIndex].right[language],
                        })
                    );
                });
                select.value = chosen[pairIndex] === null ? '' : String(chosen[pairIndex]);
                select.addEventListener('change', () => {
                    const next = [...chosen];
                    next[pairIndex] = select.value === '' ? null : Number(select.value);
                    chosen[pairIndex] = next[pairIndex];
                    state.answers[index] = next.some((entry) => entry !== null) ? next : null;
                    syncStep();
                    submitArmed = false;
                });
                rows.appendChild(
                    element(
                        'div',
                        { class: 'exam-match-row' },
                        element('label', { for: selectId, text: pair.left[language] }),
                        select
                    )
                );
            });
            return rows;
        }

        if (type === 'numeric') {
            const inputId = `exam-numeric-${index}`;
            const input = /** @type {HTMLInputElement} */ (
                element('input', {
                    id: inputId,
                    class: 'exam-numeric-input',
                    type: 'text',
                    inputmode: 'decimal',
                    autocomplete: 'off',
                })
            );
            const stored = state.answers[index];
            input.value = stored === null || stored === undefined ? '' : String(stored);
            input.addEventListener('input', () => {
                state.answers[index] = parseNumber(input.value) === null ? null : input.value.trim();
                syncStep();
                submitArmed = false;
            });
            return element(
                'div',
                { class: 'exam-answers exam-numeric' },
                element('label', { for: inputId, text: t('Ihre Antwort:', 'Your answer:') }),
                input,
                question.unit ? element('span', { class: 'exam-numeric-unit', text: question.unit }) : null
            );
        }

        if (type === 'cloze') {
            const typed = /** @type {string[]} */ (state.answers[index] || blanks.map(() => ''));
            const line = element('p', { class: 'exam-cloze', role: 'group', 'aria-labelledby': questionId });
            template[language].split(/\{(\d+)\}/).forEach((part, partIndex) => {
                if (partIndex % 2 === 0) {
                    if (part) line.append(part);
                    return;
                }
                const blankIndex = Number(part) - 1;
                const input = /** @type {HTMLInputElement} */ (
                    element('input', {
                        type: 'text',
                        class: 'exam-cloze-input',
                        autocomplete: 'off',
                        autocapitalize: 'off',
                        spellcheck: 'false',
                        'aria-label': t(`Lücke ${blankIndex + 1}`, `Blank ${blankIndex + 1}`),
                    })
                );
                input.value = typed[blankIndex] || '';
                input.addEventListener('input', () => {
                    typed[blankIndex] = input.value;
                    state.answers[index] = typed.some((entry) => entry.trim() !== '') ? [...typed] : null;
                    syncStep();
                    submitArmed = false;
                });
                line.append(input);
            });
            return element('div', { class: 'exam-answers' }, line);
        }

        // Classic single choice.
        const options = element('div', { class: 'exam-answers', role: 'radiogroup', 'aria-labelledby': questionId });
        state.order[index].forEach((answerIndex) => {
            const selected = state.answers[index] === answerIndex;
            const option = element('button', {
                type: 'button',
                class: `btn-quiz exam-answer${selected ? ' selected' : ''}`,
                role: 'radio',
                'aria-checked': String(selected),
                text: question.answers[answerIndex][language],
            });
            option.addEventListener('click', () => {
                state.answers[index] = answerIndex;
                refresh('.exam-answer.selected');
            });
            options.appendChild(option);
        });
        return options;
    }

    function renderQuestion() {
        const { questions, answers, order, index } = /** @type {NonNullable<typeof run>} */ (run);
        const question = questions[index];
        const language = lang();
        const questionId = 'exam-question-text';

        const options = renderAnswerInput(question, index, questionId);

        const steps = element('div', { class: 'exam-steps', role: 'group', 'aria-label': t('Fragen', 'Questions') });
        questions.forEach((_question, stepIndex) => {
            const answeredStep = isAnswered(_question, answers[stepIndex]);
            const step = element('button', {
                type: 'button',
                class: `exam-step${stepIndex === index ? ' current' : ''}${answeredStep ? ' answered' : ''}`,
                'aria-label': t(
                    `Frage ${stepIndex + 1}${answeredStep ? ', beantwortet' : ', offen'}`,
                    `Question ${stepIndex + 1}${answeredStep ? ', answered' : ', open'}`
                ),
                text: String(stepIndex + 1),
            });
            if (stepIndex === index) step.setAttribute('aria-current', 'step');
            step.addEventListener('click', () => goTo(stepIndex));
            steps.appendChild(step);
        });

        const previous = /** @type {HTMLButtonElement} */ (
            element('button', { type: 'button', class: 'btn-secondary', text: t('Zurück', 'Back') })
        );
        previous.disabled = index === 0;
        previous.addEventListener('click', () => goTo(index - 1));
        const next = /** @type {HTMLButtonElement} */ (
            element('button', { type: 'button', class: 'btn-secondary', text: t('Weiter', 'Next') })
        );
        next.disabled = index === questions.length - 1;
        next.addEventListener('click', () => goTo(index + 1));

        const countOpen = () => questions.filter((item, i) => !isAnswered(item, answers[i])).length;
        const open = countOpen();
        const submit = element('button', {
            type: 'button',
            class: 'btn-primary',
            id: 'exam-submit-btn',
            text: submitArmed ? t('Trotzdem abgeben', 'Hand in anyway') : t('Prüfung abgeben', 'Hand in exam'),
        });
        submit.addEventListener('click', () => {
            if (countOpen() > 0 && !submitArmed) {
                submitArmed = true;
                renderQuestion();
                /** @type {HTMLElement} */ (examPanel.querySelector('#exam-submit-btn'))?.focus();
                return;
            }
            finish(false);
        });

        const speakBtn =
            'speechSynthesis' in window
                ? element('button', {
                      type: 'button',
                      class: 'exam-speak-btn',
                      'aria-label': t('Frage und Optionen vorlesen', 'Read question and options aloud'),
                      title: t('Frage und Optionen vorlesen', 'Read question and options aloud'),
                      html: '<i class="fa-solid fa-volume-high" aria-hidden="true"></i>',
                  })
                : null;

        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                if (!('speechSynthesis' in window)) return;
                window.speechSynthesis.cancel();
                const qText = question.question[language] || '';
                const optsText = ['single', 'multi'].includes(typeOf(question))
                    ? order[index]
                          .map((ai, i) => `${String.fromCharCode(65 + i)}: ${question.answers[ai][language]}`)
                          .join('. ')
                    : '';
                const utterance = new SpeechSynthesisUtterance(`${qText}. ${optsText}`);
                utterance.lang = language === 'en' ? 'en-US' : 'de-DE';
                window.speechSynthesis.speak(utterance);
            });
        }

        setPanel(
            element(
                'div',
                { class: 'exam-question-meta' },
                element('span', {
                    text: t(
                        `Frage ${index + 1} von ${questions.length}`,
                        `Question ${index + 1} of ${questions.length}`
                    ),
                }),
                element('span', { class: 'exam-topic-chip', text: EXAM_TOPICS[question.topic][language] }),
                speakBtn
            ),
            element('h3', { class: 'exam-question', id: questionId, text: question.question[language] }),
            options,
            steps,
            element('div', { class: 'exam-nav' }, previous, next, submit),
            submitArmed && open > 0
                ? element('p', {
                      class: 'exam-warning',
                      role: 'alert',
                      text: t(
                          `Noch ${open} Frage(n) unbeantwortet. Zum Abgeben erneut bestätigen.`,
                          `${open} question(s) still unanswered. Confirm again to hand in.`
                      ),
                  })
                : null
        );
    }

    /** @param {number} index */
    function goTo(index) {
        if (!run || index < 0 || index >= run.questions.length) return;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        run.index = index;
        submitArmed = false;
        renderQuestion();
    }

    function renderResult() {
        const state = /** @type {NonNullable<typeof run>} */ (run);
        const language = lang();
        const result = evaluateExam(state.questions, state.answers);

        const table = element(
            'table',
            { class: 'exam-topic-table' },
            element('caption', { text: t('Auswertung nach Themengebiet', 'Breakdown by topic') }),
            element(
                'thead',
                {},
                element(
                    'tr',
                    {},
                    element('th', { scope: 'col', text: t('Themengebiet', 'Topic') }),
                    element('th', { scope: 'col', text: t('Richtig', 'Correct') }),
                    element('th', { scope: 'col', text: t('Quote', 'Rate') })
                )
            )
        );
        const body = element('tbody');
        for (const topic of [...result.topics].sort((a, b) => a.percent - b.percent)) {
            const bar = element('span', { class: 'exam-topic-bar' }, element('span', { class: 'exam-topic-fill' }));
            /** @type {HTMLElement} */ (bar.firstChild).style.width = `${topic.percent}%`;
            body.appendChild(
                element(
                    'tr',
                    { class: topic.percent < PASS_PERCENT ? 'exam-topic-weak' : '' },
                    element('th', { scope: 'row', text: EXAM_TOPICS[topic.topic][language] }),
                    element('td', { text: `${topic.correct} / ${topic.total}` }),
                    element('td', {}, bar, element('span', { class: 'exam-topic-percent', text: `${topic.percent} %` }))
                )
            );
        }
        table.appendChild(body);

        const review = element('ol', { class: 'exam-review' });
        state.questions.forEach((question, index) => {
            const given = state.answers[index];
            const isCorrect = isFullyCorrect(question, given);
            const score = scoreAnswer(question, given);
            const givenText = givenAnswerText(question, given, language);
            review.appendChild(
                element(
                    'li',
                    { class: isCorrect ? 'exam-review-correct' : 'exam-review-wrong' },
                    element('p', { class: 'exam-review-question', text: question.question[language] }),
                    element('p', {
                        text:
                            (isCorrect ? '✓ ' : '✗ ') +
                            t('Deine Antwort: ', 'Your answer: ') +
                            (givenText === null ? t('keine', 'none') : givenText) +
                            (!isCorrect && score > 0
                                ? t(
                                      ` (${Math.round(score * 100)} % der Punkte)`,
                                      ` (${Math.round(score * 100)}% of the points)`
                                  )
                                : ''),
                    }),
                    isCorrect
                        ? null
                        : element('p', {
                              text: t('Richtig: ', 'Correct: ') + correctAnswerText(question, language),
                          }),
                    element('p', { class: 'exam-review-explanation', text: question.explanation[language] })
                )
            );
        });

        const again = element('button', {
            type: 'button',
            class: 'btn-primary',
            id: 'exam-restart-btn',
            text: t('Neue Prüfung starten', 'Start a new exam'),
        });
        again.addEventListener('click', () => selectMode(state.mode));

        const hasOpenMistakes = readWrongQuestions().length > 0;
        const repeat = hasOpenMistakes
            ? element('button', {
                  type: 'button',
                  class: 'btn-secondary',
                  id: 'exam-repeat-weak-btn',
                  text: t('🎯 Schwächen wiederholen', '🎯 Repeat weaknesses'),
              })
            : null;
        repeat?.addEventListener('click', () => selectMode('weak'));
        const flashcardsLink = result.weakTopics.length
            ? element('a', {
                  class: 'btn-secondary',
                  href: 'flashcards.html',
                  text: t('Passende Lernkarten üben', 'Practise matching flashcards'),
              })
            : null;

        const weakNames = result.weakTopics.map((topic) => EXAM_TOPICS[topic][language]).join(', ');

        setPanel(
            element('h3', { class: 'exam-heading', tabindex: '-1', text: t('Ergebnis', 'Result') }),
            state.timedOut
                ? element('p', { class: 'exam-warning', text: t('⏰ Die Zeit ist abgelaufen.', '⏰ Time is up.') })
                : null,
            element(
                'p',
                { class: `exam-score ${result.passed ? 'exam-passed' : 'exam-failed'}`, id: 'exam-score' },
                t(
                    `${result.correct} von ${result.total} richtig (${result.percent} %) – Note ${result.grade} (${GRADE_LABELS[result.grade].de}) – ${result.passed ? 'bestanden' : 'nicht bestanden'}`,
                    `${result.correct} of ${result.total} correct (${result.percent}%) – grade ${result.grade} (${GRADE_LABELS[result.grade].en}) – ${result.passed ? 'passed' : 'failed'}`
                )
            ),
            table,
            weakNames
                ? element('p', {
                      class: 'exam-recommendation',
                      text: t(
                          `Wiederhole vor allem: ${weakNames}. Die passenden Lernkarten findest du unter „IHK Lernkarten“.`,
                          `Focus your revision on: ${weakNames}. Matching flashcards are available under "IHK Flashcards".`
                      ),
                  })
                : null,
            element('h3', { class: 'exam-subheading', text: t('Fragen im Überblick', 'Question review') }),
            review,
            element('div', { class: 'exam-nav' }, again, repeat, flashcardsLink)
        );
    }

    // ---- wiring --------------------------------------------------------------------------
    window.addEventListener('fiae:lang-change', () => {
        renderFrame();
        render();
    });

    // Leaving the page must not leave the interval behind.
    window.addEventListener('pagehide', stopTimer);

    renderFrame();
}
