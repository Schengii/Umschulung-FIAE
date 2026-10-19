// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initEasterEggs } from './easter-eggs.js';

const KONAMI = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
];

// initEasterEggs registers a document listener every time it runs, so it is initialised
// once for the whole file; each test starts from a fresh <body> and a reset key sequence.
beforeAll(() => initEasterEggs());

let confetti;
let audio;
let achievements;

const press = (key, target = document.body) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
const pressAll = (keys, target) => keys.forEach((key) => press(key, target));
const egg = () => document.body.querySelector('div[style*="easterEggPop"]');

beforeEach(() => {
    vi.useFakeTimers();
    resetDocument('<input id="field"><textarea id="area"></textarea>');
    confetti = { start: vi.fn() };
    audio = { play: vi.fn() };
    achievements = { unlock: vi.fn() };
    globalThis.Confetti = confetti;
    globalThis.GameAudio = audio;
    globalThis.Achievements = achievements;
});
afterEach(() => {
    press('x'); // reset a half-typed sequence
    vi.useRealTimers();
    delete globalThis.Confetti;
    delete globalThis.GameAudio;
    delete globalThis.Achievements;
});

describe('easter-eggs: Konami code', () => {
    it('celebrates after the full sequence', () => {
        pressAll(KONAMI);

        expect(egg()).not.toBeNull();
        expect(confetti.start).toHaveBeenCalledWith(5000);
        expect(audio.play).toHaveBeenCalledWith('win');
        expect(achievements.unlock).toHaveBeenCalledWith('konami_master');
    });

    it('does not trigger on a wrong key in the middle of the sequence', () => {
        pressAll([...KONAMI.slice(0, 5), 'x', ...KONAMI.slice(5)]);
        expect(egg()).toBeNull();
        expect(achievements.unlock).not.toHaveBeenCalled();
    });

    it('starts over after a mistake', () => {
        pressAll(['ArrowUp', 'ArrowUp', 'x']);
        pressAll(KONAMI);
        expect(achievements.unlock).toHaveBeenCalledTimes(1);
    });

    it('ignores keys typed into form fields', () => {
        pressAll(KONAMI, document.getElementById('field'));
        pressAll(KONAMI, document.getElementById('area'));
        expect(egg()).toBeNull();
    });

    it('fades the message out and removes it', () => {
        pressAll(KONAMI);
        const message = egg();

        vi.advanceTimersByTime(4000);
        expect(message.style.opacity).toBe('0');
        expect(document.body.contains(message)).toBe(true);

        vi.advanceTimersByTime(500);
        expect(document.body.contains(message)).toBe(false);
    });

    it('works without the optional confetti, audio and achievement modules', () => {
        delete globalThis.Confetti;
        delete globalThis.GameAudio;
        delete globalThis.Achievements;
        expect(() => pressAll(KONAMI)).not.toThrow();
        expect(egg()).not.toBeNull();
    });
});
