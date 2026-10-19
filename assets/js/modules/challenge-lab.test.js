// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';

const PAGE = `
    <div class="page-challenge-lab">
        <span id="lab-score-display"></span>
        <span id="lab-progress-display"></span>
        <span id="lab-rank-display"></span>
        <div id="lab-challenges-list"></div>
    </div>`;

// The module keeps the solved challenges and the XP in module state, so every test loads a
// fresh copy of it.
async function loadLab() {
    vi.resetModules();
    const lab = await import('./challenge-lab.js');
    lab.initChallengeLab();
    return lab;
}

const $ = (selector) => document.querySelector(selector);
const optionButton = (challengeId, optionId) =>
    $(`.challenge-opt-btn[data-challenge-id="${challengeId}"][data-opt-id="${optionId}"]`);
const answer = (challenge, correct) => {
    const option = challenge.options.find((o) => Boolean(o.correct) === correct);
    optionButton(challenge.id, option.id).click();
};
const text = (id) => document.getElementById(id).textContent;

beforeEach(() => resetDocument(PAGE));

describe('challenge-lab: rendering', () => {
    it('does nothing on other pages', async () => {
        resetDocument('<div id="other"></div>');
        await loadLab();
        expect(document.querySelectorAll('.card')).toHaveLength(0);
    });

    it('renders one card per challenge with all of its options', async () => {
        const { CHALLENGES } = await loadLab();
        expect(document.querySelectorAll('#lab-challenges-list .card')).toHaveLength(CHALLENGES.length);
        for (const challenge of CHALLENGES) {
            const buttons = document.querySelectorAll(`.challenge-opt-btn[data-challenge-id="${challenge.id}"]`);
            expect(buttons).toHaveLength(challenge.options.length);
        }
    });

    it('has exactly one correct option per challenge', async () => {
        const { CHALLENGES } = await loadLab();
        for (const challenge of CHALLENGES) {
            expect(challenge.options.filter((o) => o.correct)).toHaveLength(1);
        }
    });

    it('shows the initial progress header', async () => {
        const { CHALLENGES } = await loadLab();
        expect(text('lab-score-display')).toBe('0 XP');
        expect(text('lab-progress-display')).toBe(`0 / ${CHALLENGES.length} Labs`);
        expect(text('lab-rank-display')).toBe('Novize');
    });

    it('escapes the code snippet instead of injecting markup', async () => {
        await loadLab();
        expect(document.querySelectorAll('#lab-challenges-list pre code script')).toHaveLength(0);
        expect($('#lab-challenges-list pre code').textContent.length).toBeGreaterThan(10);
    });

    it('renders English texts and rank after a language change', async () => {
        const { CHALLENGES } = await loadLab();
        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange'));

        expect($('#lab-challenges-list h3').textContent).toBe(CHALLENGES[0].title_en);
        expect(text('lab-rank-display')).toBe('Novice');
        document.documentElement.removeAttribute('lang');
    });
});

describe('challenge-lab: answering', () => {
    it('explains a wrong answer without giving XP', async () => {
        const { CHALLENGES } = await loadLab();
        answer(CHALLENGES[0], false);

        const feedback = document.getElementById(`feedback-${CHALLENGES[0].id}`);
        expect(feedback.style.display).toBe('block');
        expect(feedback.textContent).toContain('Nicht ganz richtig');
        expect(text('lab-score-display')).toBe('0 XP');
    });

    it('awards XP and updates the rank for a correct answer', async () => {
        const { CHALLENGES } = await loadLab();
        answer(CHALLENGES[0], true);

        const feedback = document.getElementById(`feedback-${CHALLENGES[0].id}`);
        expect(feedback.textContent).toContain('Exzellent gelöst!');
        expect(text('lab-score-display')).toBe(`${CHALLENGES[0].xp} XP`);
        expect(text('lab-progress-display')).toBe(`1 / ${CHALLENGES.length} Labs`);
        expect(text('lab-rank-display')).toBe('Junior Refactorer');
    });

    it('awards the XP of a challenge only once', async () => {
        const { CHALLENGES } = await loadLab();
        answer(CHALLENGES[0], true);
        answer(CHALLENGES[0], true);
        expect(text('lab-score-display')).toBe(`${CHALLENGES[0].xp} XP`);
    });

    it('can still be retried after a wrong answer', async () => {
        const { CHALLENGES } = await loadLab();
        answer(CHALLENGES[1], false);
        answer(CHALLENGES[1], true);
        expect(text('lab-score-display')).toBe(`${CHALLENGES[1].xp} XP`);
    });

    it('walks through all ranks up to Lead Architect', async () => {
        const { CHALLENGES } = await loadLab();
        const ranks = [];
        for (const challenge of CHALLENGES) {
            answer(challenge, true);
            ranks.push(text('lab-rank-display'));
        }
        expect(ranks).toEqual(['Junior Refactorer', 'Junior Refactorer', 'Clean Code Craftsman', '🏆 Lead Architect']);
        expect(text('lab-score-display')).toBe(`${CHALLENGES.reduce((sum, c) => sum + c.xp, 0)} XP`);
    });

    it('answers in English when the page language is English', async () => {
        const { CHALLENGES } = await loadLab();
        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange'));
        answer(CHALLENGES[0], false);

        expect(document.getElementById(`feedback-${CHALLENGES[0].id}`).textContent).toContain('Not quite right');
        document.documentElement.removeAttribute('lang');
    });
});
