/**
 * Game Audio Module — Web Audio API Retro Sound Effects
 * Generates synthetic sounds on-the-fly, avoiding network requests for audio files.
 */
const GameAudio = {
    audioCtx: null,
    isMuted: false,

    init() {
        // Load mute state
        this.isMuted = StorageManager.getItem('game_audio_muted') === 'true';
        this.updateMuteButtonsUI();

        // Listen for mute clicks globally (since nav is loaded dynamically)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.mute-toggle-btn') || e.target.closest('#audio-mute-toggle');
            if (target) {
                e.preventDefault();
                this.toggleMute();
            }
        });
    },

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        StorageManager.setItem('game_audio_muted', this.isMuted ? 'true' : 'false');
        this.updateMuteButtonsUI();
        return this.isMuted;
    },

    updateMuteButtonsUI() {
        const buttons = document.querySelectorAll('.mute-toggle-btn');
        buttons.forEach(btn => {
            if (this.isMuted) {
                btn.innerHTML = '<i class="fa fa-volume-off" aria-hidden="true"></i>';
                btn.classList.add('muted');
                btn.setAttribute('title', 'Ton einschalten / Unmute');
            } else {
                btn.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i>';
                btn.classList.remove('muted');
                btn.setAttribute('title', 'Ton ausschalten / Mute');
            }
        });
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
            }
        } catch (e) {
            console.warn('GameAudio error:', e);
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    GameAudio.init();
});

function initGameAudio() {
    // GameAudio initializes itself via DOMContentLoaded
}
