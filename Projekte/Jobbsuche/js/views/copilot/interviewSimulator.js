/**
 * Interview Simulator Submodule
 * Handles 5-question STAR interview simulation with Speech Recognition, Speech Synthesis,
 * Voice Coach Speech Analytics (Filler words & WPM pace analysis), and STAR Feedback.
 */
import { mockAi } from '../../mockAi.js';
import { speechRecognitionHelper } from '../../utils/speechRecognition.js';

export const interviewSimulator = {
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    scores: [],
    startTime: null,

    init(job, profile) {
        this.questions = mockAi.generateInterviewQuestions(job.title, profile.skills);
        this.currentIndex = 0;
        this.userAnswers = [];
        this.scores = [];
        this.startTime = Date.now();
    },

    renderCurrentQuestion(container) {
        if (!this.questions || this.questions.length === 0) return;
        const q = this.questions[this.currentIndex];

        container.innerHTML = `
            <div class="interview-sim-box">
                <div class="sim-header flex-between align-center" style="margin-bottom: 16px;">
                    <span class="badge badge-primary">Frage ${this.currentIndex + 1} von ${this.questions.length}</span>
                    <button class="btn btn-secondary btn-sm" id="btn-speak-question">
                        <i data-lucide="volume-2"></i> Vorlesen
                    </button>
                </div>

                <h3 class="question-text" style="margin-bottom: 20px; font-size: 1.25rem;">${q}</h3>

                <div class="form-group">
                    <label style="font-weight: 600;">Deine Antwort (oder Einsprechen):</label>
                    <textarea id="sim-answer-input" rows="5" class="form-input" placeholder="Verwende die STAR-Methode (Situation, Task, Action, Result)...">${this.userAnswers[this.currentIndex] || ''}</textarea>
                </div>

                <div class="action-buttons flex-between align-center" style="margin-top: 16px;">
                    <button class="btn btn-secondary" id="btn-mic-toggle">
                        <i data-lucide="mic"></i> <span id="mic-status-label">Antwort einsprechen</span>
                    </button>

                    <button class="btn btn-primary" id="btn-submit-answer">
                        ${this.currentIndex < this.questions.length - 1 ? 'Nächste Frage' : 'Ergebnis & STAR-Feedback auswerten'}
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container);
    },

    bindEvents(container) {
        const speakBtn = container.querySelector('#btn-speak-question');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                const text = this.questions[this.currentIndex];
                if ('speechSynthesis' in window) {
                    const synth = window.speechSynthesis;
                    synth.cancel();
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.lang = 'de-DE';
                    synth.speak(utter);
                }
            });
        }

        const micBtn = container.querySelector('#btn-mic-toggle');
        const answerInput = container.querySelector('#sim-answer-input');
        if (micBtn && answerInput) {
            micBtn.addEventListener('click', () => {
                if (speechRecognitionHelper.isListening) {
                    speechRecognitionHelper.stop();
                    micBtn.classList.remove('btn-danger');
                    container.querySelector('#mic-status-label').textContent = 'Antwort einsprechen';
                } else {
                    speechRecognitionHelper.start((transcript) => {
                        answerInput.value += (answerInput.value ? ' ' : '') + transcript;
                    }, () => {
                        micBtn.classList.remove('btn-danger');
                        container.querySelector('#mic-status-label').textContent = 'Antwort einsprechen';
                    });
                    micBtn.classList.add('btn-danger');
                    container.querySelector('#mic-status-label').textContent = 'Aufnahme stoppen...';
                }
            });
        }

        const submitBtn = container.querySelector('#btn-submit-answer');
        if (submitBtn && answerInput) {
            submitBtn.addEventListener('click', () => {
                const answerText = answerInput.value.trim();
                this.userAnswers[this.currentIndex] = answerText;

                const feedback = mockAi.evaluateInterviewAnswer(answerText);
                this.scores.push(feedback);

                if (this.currentIndex < this.questions.length - 1) {
                    this.currentIndex++;
                    this.renderCurrentQuestion(container);
                } else {
                    this.renderSummary(container);
                }
            });
        }
    },

    /**
     * Analyzes overall speech answers for filler words & pace
     */
    analyzeSpeechQuality() {
        const allText = this.userAnswers.join(' ').toLowerCase();
        const totalWords = allText.split(/\s+/).filter(w => w.length > 0).length;

        // Common German filler words
        const fillerWords = ['äh', 'ähm', 'halt', 'sozusagen', 'quasi', 'eigentlich', 'irgendwie', 'also'];
        let fillerCount = 0;

        fillerWords.forEach(fw => {
            const regex = new RegExp(`\\b${fw}\\b`, 'gi');
            const matches = allText.match(regex);
            if (matches) fillerCount += matches.length;
        });

        const timeMinutes = Math.max(0.5, (Date.now() - (this.startTime || Date.now())) / 60000);
        const wpm = Math.round(totalWords / timeMinutes);

        return {
            totalWords,
            fillerCount,
            wpm,
            paceRating: wpm > 160 ? 'Zu schnell (Hektisch)' : wpm < 90 ? 'Etwas langsam' : 'Optimales Sprechtempo (110-140 WPM)'
        };
    },

    renderSummary(container) {
        const avgScore = Math.round(this.scores.reduce((acc, curr) => acc + curr.score, 0) / (this.scores.length || 1));
        const speechAnalysis = this.analyzeSpeechQuality();

        container.innerHTML = `
            <div class="interview-summary-card">
                <h3><i data-lucide="award"></i> Simulation Abgeschlossen!</h3>
                
                <div class="score-overview flex-row align-center" style="margin: 20px 0; gap: 20px;">
                    <div class="overall-circle" style="font-size: 2rem; font-weight: 800; color: var(--color-primary);">
                        ${avgScore} / 100
                    </div>
                    <div>
                        <p style="font-weight: 600; margin-bottom: 4px;">Dein STAR-Methoden Score</p>
                        <p class="text-secondary" style="font-size: 0.85rem;">
                            ${avgScore >= 75 ? 'Hervorragend! Du hast Situation, Aufgabe, Handlung und Ergebnis klar dargestellt.' : 'Guter Ansatz. Tipp: Strukturiere deine Antworten noch stärke nach der STAR-Methode.'}
                        </p>
                    </div>
                </div>

                <!-- Voice Coach Speech Analysis Card -->
                <div class="glass-card" style="padding: 20px; margin-bottom: 24px; border: 1px solid var(--color-primary);">
                    <h4><i data-lucide="mic"></i> AI Voice Coach - Sprechanalyse</h4>
                    <div class="flex-row gap-16" style="margin-top: 12px;">
                        <div style="flex: 1;">
                            <span class="text-secondary" style="font-size: 0.8rem; display: block;">Geschätztes Sprechtempo:</span>
                            <strong style="font-size: 1.1rem; color: var(--color-primary);">${speechAnalysis.wpm} WPM</strong>
                            <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">${speechAnalysis.paceRating}</p>
                        </div>
                        <div style="flex: 1;">
                            <span class="text-secondary" style="font-size: 0.8rem; display: block;">Erkannte Füllwörter:</span>
                            <strong style="font-size: 1.1rem; color: ${speechAnalysis.fillerCount > 4 ? 'var(--color-danger)' : 'var(--color-success)'};">${speechAnalysis.fillerCount} Mal</strong>
                            <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">(${speechAnalysis.fillerCount === 0 ? 'Perfekt! Keine Füllwörter erkannt.' : 'z.B. "äh", "halt", "sozusagen"'})</p>
                        </div>
                    </div>
                </div>

                <div class="question-feedback-list" style="margin-bottom: 24px;">
                    ${this.questions.map((q, idx) => `
                        <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                            <p style="font-weight: 600;">Q${idx + 1}: ${q}</p>
                            <p class="text-muted" style="font-size: 0.85rem; margin: 4px 0;">Deine Antwort: "${this.userAnswers[idx] || 'Keine Antwort'}"</p>
                            <span class="badge ${this.scores[idx]?.score >= 70 ? 'badge-applied' : 'badge-saved'}">Score: ${this.scores[idx]?.score || 50}/100</span>
                        </div>
                    `).join('')}
                </div>

                <button class="btn btn-primary" id="btn-restart-sim">
                    <i data-lucide="rotate-ccw"></i> Neue Simulation starten
                </button>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        container.querySelector('#btn-restart-sim')?.addEventListener('click', () => {
            this.currentIndex = 0;
            this.userAnswers = [];
            this.scores = [];
            this.startTime = Date.now();
            this.renderCurrentQuestion(container);
        });
    }
};
