/**
 * Game Audio Module — Web Audio API Retro Sound Effects
 * Generates synthetic sounds on-the-fly, avoiding network requests for audio files.
 *
 * Also owns the site-wide sound switch (footer button `#audio-toggle`). Sound is off until
 * the visitor turns it on: nothing on this site may make noise unasked.
 */
const SOUND_KEY = 'sound_enabled';

export const GameAudio = {
    audioCtx: null,
    isMuted: true,

    init() {
        this.isMuted = AppStorage.getItem(SOUND_KEY) !== 'true';
        // Pre-unification keys; both defaulted to "on" without the visitor ever choosing.
        AppStorage.removeItem('audio_effects_enabled');
        AppStorage.removeItem('game_audio_muted');
        this.updateToggleUI();

        // The toggle lives in the footer, which components.js injects dynamically.
        document.addEventListener('click', (e) => {
            const target = /** @type {HTMLElement} */ (e.target).closest('#audio-toggle');
            if (!target) return;
            e.preventDefault();
            const muted = this.toggleMute();
            if (window.showToast) {
                window.showToast(
                    muted
                        ? { de: 'Sound-Effekte deaktiviert', en: 'Sound effects off' }
                        : { de: 'Sound-Effekte aktiviert', en: 'Sound effects on' },
                    'success'
                );
            }
            if (!muted) this.play('match');
        });
        document.addEventListener('langchange', () => this.updateToggleUI());
    },

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        AppStorage.setItem(SOUND_KEY, this.isMuted ? 'false' : 'true');
        this.updateToggleUI();
        return this.isMuted;
    },

    updateToggleUI() {
        const button = document.getElementById('audio-toggle');
        if (!button) return;
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        const icon = button.querySelector('i');
        if (icon) icon.className = `fa-solid ${this.isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`;
        const label = this.isMuted
            ? isEnglish
                ? 'Turn sound on'
                : 'Sound einschalten'
            : isEnglish
              ? 'Turn sound off'
              : 'Sound ausschalten';
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
        button.setAttribute('aria-pressed', String(!this.isMuted));
    },

    play(type) {
        if (this.isMuted) return;

        try {
            const ctx = this.getAudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'eat') {
                // Short retro pop
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'die' || type === 'fail') {
                // Downward buzzer
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now); // A3
                osc.frequency.linearRampToValueAtTime(80, now + 0.35);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'match' || type === 'success') {
                // Happy chord
                osc.type = 'sine';
                osc.frequency.setValueAtTime(392, now); // G4
                osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.setValueAtTime(0.15, now + 0.16);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'win' || type === 'complete') {
                // Arpeggio fanfare
                const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5]; // C chord arpeggio
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, now);

                notes.forEach((freq, idx) => {
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                });

                gain.gain.setValueAtTime(0.15, now + notes.length * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, now + notes.length * 0.08 + 0.4);
                osc.start(now);
                osc.stop(now + notes.length * 0.08 + 0.5);
            } else if (type === 'ui-hover') {
                // High-pass dynamic blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
                gain.gain.setValueAtTime(0.005, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'ui-click') {
                // Rich mechanical click
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(650, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
                gain.gain.setValueAtTime(0.035, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            console.warn('GameAudio error:', e);
        }
    },
};

// The page scripts (quiz.js, snake.js, memory.js, interview.js, ...) are classic <script>
// files and cannot import this module; they reach it through the global.
window.GameAudio = GameAudio;

export function initGameAudio() {
    GameAudio.init();
}
