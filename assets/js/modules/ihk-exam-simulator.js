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
import { getIhkGrade } from './grade-calculator.js';

/** Questions per run and time limit of each exam part (about 80 seconds per question). */
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
    const byTopic = new Map();
    for (const question of pool) {
        if (question.exam !== exam) continue;
        if (!byTopic.has(question.topic)) byTopic.set(question.topic, []);
        byTopic.get(question.topic).push(question);
    }
    const queues = shuffle([...byTopic.values()], random).map((questions) => shuffle(questions, random));

    const picked = [];
    while (picked.length < count && queues.some((queue) => queue.length > 0)) {
        for (const queue of queues) {
            if (picked.length < count && queue.length > 0) picked.push(queue.pop());
        }
    }
    return shuffle(picked, random);
}

/**
 * @param {import('./exam-questions.js').ExamQuestion[]} questions
 * @param {(number | null | undefined)[]} answers chosen answer index per question
 */
export function evaluateExam(questions, answers) {
    const topics = new Map();
    let correct = 0;
    let answered = 0;

    questions.forEach((question, index) => {
        const given = answers[index];
        const isCorrect = given === question.correct;
        if (given !== null && given !== undefined) answered++;
        if (isCorrect) correct++;

        const topic = topics.get(question.topic) || { topic: question.topic, total: 0, correct: 0 };
        topic.total++;
        if (isCorrect) topic.correct++;
        topics.set(question.topic, topic);
    });

    const total = questions.length;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    const topicResults = [...topics.values()].map((topic) => ({
        ...topic,
        percent: Math.round((topic.correct / topic.total) * 100),
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

function element(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
        if (name === 'class') node.className = value;
        else if (name === 'text') node.textContent = value;
        else node.setAttribute(name, value);
    }
    node.append(...children.filter((child) => child !== null && child !== undefined));
    return node;
}

export function initIhkExamSimulator() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de');
    const t = (de, en) => (lang() === 'en' ? en : de);

    /** @type {{mode: string, questions: any[], order: number[][], answers: (number|null)[], index: number, deadline: number, view: 'intro'|'running'|'result', timedOut: boolean} | null} */
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
        timerDisplay.querySelector('.exam-timer-label').textContent = t('⏱️ Restzeit:', '⏱️ Time left:');
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

        // Weak topics feed the learning recommendations on the dashboard.
        if (result.weakTopics.length > 0) {
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
    function selectMode(nextMode) {
        stopTimer();
        mode = nextMode;
        run = null;
        submitArmed = false;
        const isExam = mode !== 'standard';
        quizContainer.classList.toggle('exam-active', isExam);
        examPanel.hidden = !isExam;
        timerDisplay.hidden = !isExam;
        timerDisplay.classList.remove('exam-timer-low');
        renderFrame();
        if (isExam) {
            timerValue.textContent = formatTimerText(EXAM_MODES[mode].durationSeconds);
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
        const config = EXAM_MODES[mode];
        const questions = pickExamQuestions(EXAM_QUESTIONS, mode, config.questionCount);
        run = {
            mode,
            questions,
            order: questions.map((question) => shuffle(question.answers.map((_answer, index) => index))),
            answers: questions.map(() => null),
            index: 0,
            deadline: Date.now() + config.durationSeconds * 1000,
            view: 'running',
            timedOut: false,
        };
        submitArmed = false;
        render();
        startTimer();
    }

    function finish(timedOut) {
        if (!run || run.view !== 'running') return;
        stopTimer();
        run.view = 'result';
        run.timedOut = timedOut;
        const result = evaluateExam(run.questions, run.answers);
        saveResult(run.mode, result);
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

    function renderIntro() {
        const config = EXAM_MODES[run.mode];
        const stored = readResults()[run.mode];
        const start = element('button', {
            type: 'button',
            class: 'btn-primary exam-start-btn',
            id: 'exam-start-btn',
            text: t('Prüfung starten', 'Start exam'),
        });
        start.addEventListener('click', startRun);

        examPanel.replaceChildren(
            element('h3', { class: 'exam-heading', text: t(config.de, config.en) }),
            element('p', {
                text: t(
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
            start
        );
    }

    function renderQuestion() {
        const { questions, answers, order, index } = run;
        const question = questions[index];
        const language = lang();
        const questionId = 'exam-question-text';

        const options = element('div', { class: 'exam-answers', role: 'radiogroup', 'aria-labelledby': questionId });
        order[index].forEach((answerIndex) => {
            const selected = answers[index] === answerIndex;
            const option = element('button', {
                type: 'button',
                class: `btn-quiz exam-answer${selected ? ' selected' : ''}`,
                role: 'radio',
                'aria-checked': String(selected),
                text: question.answers[answerIndex][language],
            });
            option.addEventListener('click', () => {
                run.answers[index] = answerIndex;
                submitArmed = false;
                renderQuestion();
                /** @type {HTMLElement} */ (examPanel.querySelector('.exam-answer.selected'))?.focus();
            });
            options.appendChild(option);
        });

        const steps = element('div', { class: 'exam-steps', role: 'group', 'aria-label': t('Fragen', 'Questions') });
        questions.forEach((_question, stepIndex) => {
            const answeredStep = answers[stepIndex] !== null;
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

        const previous = element('button', { type: 'button', class: 'btn-secondary', text: t('Zurück', 'Back') });
        previous.disabled = index === 0;
        previous.addEventListener('click', () => goTo(index - 1));
        const next = element('button', { type: 'button', class: 'btn-secondary', text: t('Weiter', 'Next') });
        next.disabled = index === questions.length - 1;
        next.addEventListener('click', () => goTo(index + 1));

        const open = answers.filter((answer) => answer === null).length;
        const submit = element('button', {
            type: 'button',
            class: 'btn-primary',
            id: 'exam-submit-btn',
            text: submitArmed ? t('Trotzdem abgeben', 'Hand in anyway') : t('Prüfung abgeben', 'Hand in exam'),
        });
        submit.addEventListener('click', () => {
            if (open > 0 && !submitArmed) {
                submitArmed = true;
                renderQuestion();
                /** @type {HTMLElement} */ (examPanel.querySelector('#exam-submit-btn'))?.focus();
                return;
            }
            finish(false);
        });

        examPanel.replaceChildren(
            element(
                'div',
                { class: 'exam-question-meta' },
                element('span', {
                    text: t(
                        `Frage ${index + 1} von ${questions.length}`,
                        `Question ${index + 1} of ${questions.length}`
                    ),
                }),
                element('span', { class: 'exam-topic-chip', text: EXAM_TOPICS[question.topic][language] })
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

    function goTo(index) {
        if (!run || index < 0 || index >= run.questions.length) return;
        run.index = index;
        submitArmed = false;
        renderQuestion();
    }

    function renderResult() {
        const language = lang();
        const result = evaluateExam(run.questions, run.answers);

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
        run.questions.forEach((question, index) => {
            const given = run.answers[index];
            const isCorrect = given === question.correct;
            review.appendChild(
                element(
                    'li',
                    { class: isCorrect ? 'exam-review-correct' : 'exam-review-wrong' },
                    element('p', { class: 'exam-review-question', text: question.question[language] }),
                    element('p', {
                        text:
                            (isCorrect ? '✓ ' : '✗ ') +
                            t('Deine Antwort: ', 'Your answer: ') +
                            (given === null ? t('keine', 'none') : question.answers[given][language]),
                    }),
                    isCorrect
                        ? null
                        : element('p', {
                              text: t('Richtig: ', 'Correct: ') + question.answers[question.correct][language],
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
        again.addEventListener('click', () => selectMode(run.mode));

        const weakNames = result.weakTopics.map((topic) => EXAM_TOPICS[topic][language]).join(', ');

        examPanel.replaceChildren(
            element('h3', { class: 'exam-heading', tabindex: '-1', text: t('Ergebnis', 'Result') }),
            run.timedOut
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
            again
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
