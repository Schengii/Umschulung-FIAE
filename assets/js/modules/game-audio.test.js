// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    installPageGlobals,
    removePageGlobals,
    resetDocument,
    trackDocumentListeners,
} from '../../../scripts/test-support/dom-helpers.js';

/** Minimal Web Audio stand-in that records what was played. */
function installFakeAudio() {
    const started = [];
    class FakeParam {
        setValueAtTime() {}
        exponentialRampToValueAtTime() {}
        linearRampToValueAtTime() {}
    }
    class FakeAudioContext {
        constructor() {
            this.state = 'suspended';
            this.currentTime = 0;
            this.destination = {};
            this.resume = vi.fn();
        }
        createOscillator() {
            const osc = { type: '', frequency: new FakeParam(), connect() {}, stop() {} };
            osc.start = () => started.push(osc.type);
            return osc;
        }
        createGain() {
            return { gain: new FakeParam(), connect() {} };
        }
    }
    window.AudioContext = /** @type {any} */ (FakeAudioContext);
    return started;
}

let storage;
let untrack;
let GameAudio;

beforeEach(async () => {
    storage = installPageGlobals();
    resetDocument('<button id="audio-toggle"><i></i> Audio</button>');
    untrack = trackDocumentListeners();
    window.showToast = vi.fn();
    vi.resetModules();
    ({ GameAudio } = await import('./game-audio.js'));
    GameAudio.audioCtx = null;
});
afterEach(() => {
    untrack();
    removePageGlobals();
    delete window.showToast;
    vi.restoreAllMocks();
});

const toggle = () => document.getElementById('audio-toggle');

describe('GameAudio', () => {
    it('is muted until the visitor turns sound on and drops the old keys', () => {
        storage.setItem('audio_effects_enabled', 'true');
        storage.setItem('game_audio_muted', 'false');
        GameAudio.init();
        expect(GameAudio.isMuted).toBe(true);
        expect(storage.data.has('audio_effects_enabled')).toBe(false);
        expect(storage.data.has('game_audio_muted')).toBe(false);
        expect(toggle().getAttribute('aria-pressed')).toBe('false');
        expect(toggle().getAttribute('aria-label')).toBe('Audio: Sound einschalten');
    });

    it('remembers a stored "on" switch', () => {
        storage.setItem('sound_enabled', 'true');
        GameAudio.init();
        expect(GameAudio.isMuted).toBe(false);
        expect(toggle().querySelector('i').className).toContain('fa-volume-high');
    });

    it('toggles through the footer button, stores the choice and tells the visitor', () => {
        const played = installFakeAudio();
        GameAudio.init();
        toggle().click();
        expect(GameAudio.isMuted).toBe(false);
        expect(storage.getItem('sound_enabled')).toBe('true');
        expect(window.showToast).toHaveBeenCalledWith(
            { de: 'Sound-Effekte aktiviert', en: 'Sound effects on' },
            'success'
        );
        expect(played).toEqual(['sine']);

        toggle().click();
        expect(GameAudio.isMuted).toBe(true);
        expect(storage.getItem('sound_enabled')).toBe('false');
    });

    it('labels the switch in English after a language change', () => {
        GameAudio.init();
        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(toggle().getAttribute('aria-label')).toBe('Audio: Turn sound on');
    });

    it('plays nothing while muted and every effect once unmuted', () => {
        const played = installFakeAudio();
        GameAudio.isMuted = true;
        GameAudio.play('eat');
        expect(played).toEqual([]);

        GameAudio.isMuted = false;
        for (const type of ['eat', 'die', 'match', 'win', 'ui-hover', 'ui-click', 'unknown']) GameAudio.play(type);
        expect(played).toEqual(['triangle', 'sawtooth', 'sine', 'sine', 'sine', 'triangle']);
        expect(GameAudio.audioCtx.resume).toHaveBeenCalled();
    });

    it('swallows audio errors', () => {
        window.AudioContext = /** @type {any} */ (
            class {
                constructor() {
                    throw new Error('no audio');
                }
            }
        );
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        GameAudio.isMuted = false;
        expect(() => GameAudio.play('eat')).not.toThrow();
        expect(warn).toHaveBeenCalled();
    });

    it('is reachable for page scripts through the global', () => {
        expect(window.GameAudio).toBe(GameAudio);
    });
});
