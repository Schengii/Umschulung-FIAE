// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { Achievements, initAchievements } from './achievements.js';

// The storage and notification half of Achievements (the toast, the event, the page
// listeners). Definitions and the unlock bookkeeping live in achievements.test.js.

let storage;
const toasts = () => [...document.querySelectorAll('.achievement-toast')];
const unlocked = () => JSON.parse(storage.getItem('achievements') ?? '[]');
const wait = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    storage = installPageGlobals();
    globalThis.STORAGE_KEYS.ACHIEVEMENTS = 'achievements';
    resetDocument();
    window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
});
afterEach(() => {
    removePageGlobals();
    vi.useRealTimers();
    delete window.GameAudio;
});

describe('Achievements: notification', () => {
    it('shows an accessible German toast and announces the unlock', () => {
        const heard = [];
        document.addEventListener('achievementunlocked', (event) => heard.push(event.detail), { once: true });

        Achievements.unlock('konami_master');

        expect(toasts()).toHaveLength(1);
        expect(toasts()[0].getAttribute('role')).toBe('status');
        expect(toasts()[0].textContent).toContain('Achievement freigeschaltet!');
        expect(toasts()[0].textContent).toContain(Achievements.definitions.konami_master.title_de);
        expect(heard).toEqual(['konami_master']);
        expect(unlocked()).toEqual(['konami_master']);
    });

    it('uses English texts when the page is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        Achievements.unlock('git_master');
        expect(toasts()[0].textContent).toContain('Achievement Unlocked!');
        expect(toasts()[0].textContent).toContain(Achievements.definitions.git_master.title_en);
        document.documentElement.removeAttribute('lang');
    });

    it('does not announce an achievement twice or an unknown one at all', () => {
        Achievements.unlock('konami_master');
        Achievements.unlock('konami_master');
        Achievements.unlock('does_not_exist');
        expect(toasts()).toHaveLength(1);
        expect(unlocked()).toEqual(['konami_master']);
    });

    it('plays the success sound through GameAudio when it is available', () => {
        window.GameAudio = { play: vi.fn() };
        Achievements.unlock('exam_passed');
        expect(window.GameAudio.play).toHaveBeenCalledWith('success');
    });

    it('slides the toast in, then out, then removes it', async () => {
        Achievements.unlock('polyglot');
        const toast = toasts()[0];
        await wait();
        expect(toast.classList.contains('show')).toBe(true);

        vi.useFakeTimers();
        Achievements.unlock('explorer');
        const second = toasts()[1];
        vi.advanceTimersByTime(4000);
        expect(second.classList.contains('hide')).toBe(true);
        expect(second.classList.contains('show')).toBe(false);
        vi.advanceTimersByTime(500);
        expect(document.body.contains(second)).toBe(false);
    });
});

describe('Achievements: page tracking (initAchievements)', () => {
    // The module registers observers and document listeners on every init, so the tests
    // below initialise once and exercise the shared listeners.
    beforeEach(() => {
        initAchievements();
    });

    it('unlocks "first visit" once and remembers the visit', () => {
        expect(unlocked()).toContain('first_visit');
        expect(storage.getItem('has_visited')).toBe('true');
    });

    it('records the visited page', () => {
        expect(JSON.parse(storage.getItem('visited_pages'))).toContain('index.html');
    });

    it('unlocks "explorer" after five distinct pages', () => {
        storage.setItem('visited_pages', JSON.stringify(['a.html', 'b.html', 'c.html', 'd.html']));
        initAchievements();
        expect(unlocked()).toContain('explorer');
    });

    it('starts over when the visited-pages entry is damaged', () => {
        storage.setItem('visited_pages', '{kaputt');
        expect(() => initAchievements()).not.toThrow();
        expect(JSON.parse(storage.getItem('visited_pages'))).toEqual(['index.html']);
    });

    it('unlocks "polyglot" when the visitor switches the language', () => {
        window.dispatchEvent(new CustomEvent('fiae:lang-change'));
        expect(unlocked()).toContain('polyglot');
    });

    it('unlocks "dark mode fan" when the theme becomes dark', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        await wait();
        expect(unlocked()).toContain('dark_mode_fan');
        document.documentElement.removeAttribute('data-theme');
    });

    it('unlocks "cv downloaded" for CV links and print buttons', () => {
        document.body.innerHTML =
            '<a id="cv" href="assets/Lebenslauf_Max.pdf">CV</a><button id="btn-cv-print-card">Drucken</button><a id="other" href="x.html">x</a>';

        document.getElementById('other').click();
        expect(unlocked()).not.toContain('cv_downloaded');

        document.getElementById('cv').click();
        expect(unlocked()).toContain('cv_downloaded');

        storage.removeItem('achievements');
        document.getElementById('btn-cv-print-card').click();
        expect(unlocked()).toContain('cv_downloaded');
    });
});
