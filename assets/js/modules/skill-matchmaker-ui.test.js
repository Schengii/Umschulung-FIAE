// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initSkillMatchmaker } from './skill-matchmaker.js';

// The recruiter matchmaker widget on the home page (the score formula itself is covered by
// skill-matchmaker.test.js).

const PAGE = `
    <div id="skill-matchmaker-widget"></div>
    <div class="project-card" data-tags="java spring">Java Spring Shop</div>
    <div class="project-card" data-tags="godot">Godot Spiel</div>`;

const PROJECTS = [
    { tags: ['Java', 'SQL'], language: 'Java', descDe: 'Ein Java Projekt mit OOP und JavaScript' },
    { tags: ['HTML5'], language: 'HTML', descDe: '' },
];

const $ = (selector) => document.querySelector(selector);
const chip = (skill) => $(`.chip-btn[data-skill="${skill}"]`);
const badge = () => $('#match-score-badge').textContent.trim();
const fill = () => $('#match-progress-fill').style.width;
const flush = async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve();
};

beforeEach(() => {
    resetDocument(PAGE);
    window.projectsData = PROJECTS;
    window.showToast = vi.fn();
});
afterEach(() => {
    delete window.projectsData;
    delete window.showToast;
    delete globalThis.fetch;
    document.documentElement.removeAttribute('lang');
});

describe('skill matchmaker widget', () => {
    it('does nothing on pages without the widget', () => {
        resetDocument('');
        expect(() => initSkillMatchmaker()).not.toThrow();
    });

    it('renders nine skill chips with four preselected', () => {
        initSkillMatchmaker();
        expect(document.querySelectorAll('.chip-btn')).toHaveLength(9);
        expect(document.querySelectorAll('.chip-btn.active')).toHaveLength(4);
        expect(chip('java').classList.contains('active')).toBe(true);
        expect(chip('react').classList.contains('active')).toBe(false);
    });

    it('shows a match score for the preselected skills', () => {
        initSkillMatchmaker();
        // Java, JavaScript, HTML/CSS and SQL: the best project matches Java, SQL and JavaScript.
        expect(badge()).toMatch(/^🎯 \d+% Match für Ihr Team$/);
        expect(fill()).toMatch(/^\d+%$/);
        expect(fill()).not.toBe('0%');
    });

    it('recomputes the score when a skill is toggled', () => {
        initSkillMatchmaker();
        const before = fill();
        chip('godot').click();
        expect(chip('godot').classList.contains('active')).toBe(true);
        chip('godot').click();
        expect(chip('godot').classList.contains('active')).toBe(false);
        expect(fill()).toBe(before);
    });

    it('shows zero when every skill is deselected', () => {
        initSkillMatchmaker();
        for (const skill of ['java', 'js', 'htmlcss', 'sql']) chip(skill).click();
        expect(badge()).toBe('🎯 0% Match');
        expect(fill()).toBe('0%');
    });

    it('speaks English when the page is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        initSkillMatchmaker();
        expect(badge()).toMatch(/% match for your team$/);
    });

    it('filters the project cards by the selected skills and confirms with a toast', () => {
        initSkillMatchmaker();
        $('#btn-filter-matched').click();

        const [java, godot] = document.querySelectorAll('.project-card');
        expect(java.style.display).toBe('block');
        expect(godot.style.display).toBe('none');
        expect(window.showToast).toHaveBeenCalledTimes(1);
        expect(window.showToast.mock.calls[0][0].de).toContain('4 Skills');
    });

    it('shows every card again when no skill is selected', () => {
        initSkillMatchmaker();
        for (const skill of ['java', 'js', 'htmlcss', 'sql']) chip(skill).click();
        $('#btn-filter-matched').click();
        expect([...document.querySelectorAll('.project-card')].map((card) => card.style.display)).toEqual([
            'block',
            'block',
        ]);
    });

    it('fetches the project catalogue when the page did not load it', async () => {
        delete window.projectsData;
        globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(PROJECTS) }));
        initSkillMatchmaker();
        expect(badge()).toMatch(/^🎯 0% Match/);

        await flush();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(badge()).toMatch(/^🎯 [1-9]\d*% Match/);
    });

    it('keeps working when the catalogue cannot be fetched', async () => {
        delete window.projectsData;
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline')));
        initSkillMatchmaker();
        await flush();
        expect(badge()).toMatch(/^🎯 0% Match/);
        vi.restoreAllMocks();
    });
});
