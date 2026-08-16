/**
 * Audio Interview Trainer & Podcast Drill Submodule
 * Enables hands-free audio interview training with TTS, automated answer timers and countdown sound effects.
 */
import { mockAi } from '../../mockAi.js';

export const audioDrill = {
    isPlaying: false,
    currentIndex: 0,
    pauseSeconds: 20,
    timerId: null,
    timeRemaining: 0,
    questions: [],

    init(job, profile) {
        this.questions = mockAi.generateInterviewQuestions(job?.title || 'Entwickler', profile.skills || []);
        this.currentIndex = 0;
        this.isPlaying = false;
        this.stopTimer();
    },

    render(container, job, profile) {
        if (!this.questions || this.questions.length === 0) {
            this.init(job, profile);
        }

        const currentQuestion = this.questions[this.currentIndex] || 'Keine Frage verfügbar.';

        container.innerHTML = `
            <div class="audio-drill-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="headphones"></i> Audio-Interview-Trainer &amp; Podcast-Drill</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Hands-Free Interview-Training für unterwegs: Fragen werden vorgelesen mit automatischer Antwortpause.
                        </p>
                    </div>
                    <div class="flex-row gap-8 align-center">
                        <label style="font-size: 0.85rem; font-weight: 600;">Antwortzeit:</label>
                        <select id="audio-drill-pause-select" class="form-input" style="padding: 4px 8px; width: auto;">
                            <option value="15" ${this.pauseSeconds === 15 ? 'selected' : ''}>15 Sekunden</option>
                            <option value="20" ${this.pauseSeconds === 20 ? 'selected' : ''}>20 Sekunden</option>
                            <option value="30" ${this.pauseSeconds === 30 ? 'selected' : ''}>30 Sekunden</option>
                            <option value="45" ${this.pauseSeconds === 45 ? 'selected' : ''}>45 Sekunden</option>
                        </select>
                    </div>
                </div>

                <div class="glass-card" style="padding: 30px; text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,0,0,0.2)); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 10px;">
                        Frage ${this.currentIndex + 1} von ${this.questions.length}
                    </div>

                    <h2 id="audio-drill-question-text" style="font-size: 1.35rem; line-height: 1.5; color: var(--text-primary); margin: 0 0 20px 0; min-height: 70px;">
                        "${currentQuestion}"
                    </h2>

                    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 20px;">
                        <div id="audio-drill-timer-display" style="font-size: 2rem; font-family: monospace; font-weight: 800; color: ${this.timeRemaining > 0 ? 'var(--color-warning)' : 'var(--text-secondary)'};">
                            ${this.timeRemaining > 0 ? `⏱ ${this.timeRemaining}s Antwortpause` : 'Bereit'}
                        </div>
                    </div>

                    <!-- Audio Controls -->
                    <div class="audio-controls-row flex-row-center gap-16">
                        <button class="btn btn-secondary" id="btn-audio-prev" ${this.currentIndex === 0 ? 'disabled' : ''}>
                            <i data-lucide="skip-back"></i> Vorherige
                        </button>
                        <button class="btn ${this.isPlaying ? 'btn-danger' : 'btn-primary'}" id="btn-audio-play-toggle" style="padding: 10px 24px; font-size: 1rem;">
                            <i data-lucide="${this.isPlaying ? 'pause' : 'play'}"></i> ${this.isPlaying ? 'Training Pausieren' : 'Drill Starten'}
                        </button>
                        <button class="btn btn-secondary" id="btn-audio-repeat" title="Aktuelle Frage wiederholen">
                            <i data-lucide="rotate-cw"></i> Wiederholen
                        </button>
                        <button class="btn btn-secondary" id="btn-audio-next" ${this.currentIndex >= this.questions.length - 1 ? 'disabled' : ''}>
                            Nächste <i data-lucide="skip-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        const pauseSelect = container.querySelector('#audio-drill-pause-select');
        if (pauseSelect) {
            pauseSelect.addEventListener('change', (e) => {
                this.pauseSeconds = parseInt(e.target.value, 10);
            });
        }

        const toggleBtn = container.querySelector('#btn-audio-play-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pauseDrill(container, job, profile);
                } else {
                    this.startDrill(container, job, profile);
                }
            });
        }

        container.querySelector('#btn-audio-prev')?.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.stopTimer();
                this.render(container, job, profile);
                if (this.isPlaying) this.playCurrentQuestion(container, job, profile);
            }
        });

        container.querySelector('#btn-audio-next')?.addEventListener('click', () => {
            if (this.currentIndex < this.questions.length - 1) {
                this.currentIndex++;
                this.stopTimer();
                this.render(container, job, profile);
                if (this.isPlaying) this.playCurrentQuestion(container, job, profile);
            }
        });

        container.querySelector('#btn-audio-repeat')?.addEventListener('click', () => {
            this.playCurrentQuestion(container, job, profile);
        });
    },

    startDrill(container, job, profile) {
        this.isPlaying = true;
        this.render(container, job, profile);
        this.playCurrentQuestion(container, job, profile);
    },

    pauseDrill(container, job, profile) {
        this.isPlaying = false;
        this.stopTimer();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.render(container, job, profile);
    },

    playCurrentQuestion(container, job, profile) {
        if (!('speechSynthesis' in window)) {
            alert('Dein Browser unterstützt keine Sprachausgabe.');
            return;
        }

        window.speechSynthesis.cancel();
        this.stopTimer();

        const text = this.questions[this.currentIndex];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.95;

        utterance.onend = () => {
            if (!this.isPlaying) return;
            this.startAnswerTimer(container, job, profile);
        };

        window.speechSynthesis.speak(utterance);
    },

    startAnswerTimer(container, job, profile) {
        this.timeRemaining = this.pauseSeconds;
        const timerDisplay = container.querySelector('#audio-drill-timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `⏱ ${this.timeRemaining}s Antwortpause`;
            timerDisplay.style.color = 'var(--color-warning)';
        }

        this.timerId = setInterval(() => {
            this.timeRemaining--;
            if (timerDisplay) {
                timerDisplay.textContent = `⏱ ${this.timeRemaining}s Antwortpause`;
            }

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.playGong();

                if (this.currentIndex < this.questions.length - 1) {
                    this.currentIndex++;
                    this.render(container, job, profile);
                    setTimeout(() => {
                        if (this.isPlaying) this.playCurrentQuestion(container, job, profile);
                    }, 1000);
                } else {
                    this.isPlaying = false;
                    if (timerDisplay) {
                        timerDisplay.textContent = '🎉 Training abgeschlossen!';
                        timerDisplay.style.color = 'var(--color-success)';
                    }
                    this.render(container, job, profile);
                }
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.timeRemaining = 0;
    },

    playGong() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
        } catch (e) {
            // Audio context fallback
        }
    }
};
