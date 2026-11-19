/**
 * Interview Simulator / Bewerbungs-Trainer Logic
 * Client-side evaluation based on keyword criteria & model answers.
 */
import { escapeHtml } from './modules/html-utils.js';
import { INTERVIEW_QUESTIONS } from './modules/interview-questions.js';
import { evaluateAnswerKeywords, getRatingFeedback } from './modules/interview-evaluator.js';

class InterviewSimulator {
    constructor() {
        /** @type {string[]} */
        this.selectedCategories = [];
        this.selectedLanguage = 'de';
        /** @type {Array<Record<string, any>>} */
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.totalPossibleKeywords = 0;
        this.matchedKeywordsCount = 0;
        /** @type {Array<Record<string, any>>} */
        this.history = []; // records of questions, answers, and scores

        this.chatContainer = /** @type {HTMLElement} */ (document.getElementById('chat-history'));
        this.setupForm = document.getElementById('setup-form');
        this.setupCard = /** @type {HTMLElement} */ (document.getElementById('setup-card'));
        this.chatCard = /** @type {HTMLElement} */ (document.getElementById('chat-card'));
        this.resultCard = /** @type {HTMLElement} */ (document.getElementById('result-card'));
        this.inputText = /** @type {HTMLInputElement} */ (document.getElementById('user-input-text'));
        this.sendBtn = /** @type {HTMLButtonElement} */ (document.getElementById('send-btn'));
        this.micBtn = /** @type {HTMLButtonElement} */ (document.getElementById('mic-btn'));
        this.ttsToggleBtn = document.getElementById('tts-toggle-btn');
        this.ttsEnabled = AppStorage.getItem('interview_tts_enabled', 'true') === 'true';
        this.recognition = null;
        this.isRecording = false;

        this.init();
    }

    init() {
        if (this.setupForm) {
            this.setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startSimulator();
            });
        }

        if (this.sendBtn && this.inputText) {
            this.sendBtn.addEventListener('click', () => this.handleUserSubmit());
            this.inputText.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserSubmit();
                }
            });
        }

        if (this.ttsToggleBtn) {
            this.updateTtsButtonIcon();
            this.ttsToggleBtn.addEventListener('click', () => {
                this.ttsEnabled = !this.ttsEnabled;
                AppStorage.setItem('interview_tts_enabled', this.ttsEnabled ? 'true' : 'false');
                this.updateTtsButtonIcon();
                if (!this.ttsEnabled && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
            });
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && this.micBtn) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isRecording = true;
                if (this.micBtn) {
                    this.micBtn.classList.add('recording');
                    const micIcon = this.micBtn.querySelector('i');
                    if (micIcon) micIcon.className = 'fa-solid fa-square';
                }
                if (this.inputText) {
                    this.inputText.placeholder =
                        this.selectedLanguage === 'de' ? 'Spreche jetzt...' : 'Listening now...';
                }
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                if (this.micBtn) {
                    this.micBtn.classList.remove('recording');
                    const micIcon = this.micBtn.querySelector('i');
                    if (micIcon) micIcon.className = 'fa fa-microphone';
                }
                this.updateLabels();
            };

            this.recognition.onresult = (/** @type {{results: ArrayLike<ArrayLike<{transcript: string}>>}} */ e) => {
                const transcript = e.results[0][0].transcript;
                if (this.inputText) {
                    const currentVal = this.inputText.value.trim();
                    this.inputText.value = currentVal ? `${currentVal} ${transcript}` : transcript;
                    // Trigger input event to update textarea size or state if needed
                    this.inputText.dispatchEvent(new Event('input'));
                }
            };

            this.recognition.onerror = (/** @type {{error: string}} */ e) => {
                console.warn('Speech recognition error:', e.error);
                this.isRecording = false;
                if (this.micBtn) {
                    this.micBtn.classList.remove('recording');
                    const micIcon = this.micBtn.querySelector('i');
                    if (micIcon) micIcon.className = 'fa fa-microphone';
                }
                if (window.showToast) {
                    const msg =
                        e.error === 'not-allowed'
                            ? { de: 'Mikrofonzugriff wurde verweigert.', en: 'Microphone access denied.' }
                            : { de: `Spracherkennungsfehler: ${e.error}`, en: `Speech recognition error: ${e.error}` };
                    window.showToast(msg, 'warning');
                }
            };

            this.micBtn.addEventListener('click', () => {
                if (window.isSecureContext === false) {
                    if (window.showToast) {
                        window.showToast(
                            {
                                de: 'Spracherkennung erfordert eine sichere Verbindung (HTTPS).',
                                en: 'Speech recognition requires a secure context (HTTPS).',
                            },
                            'warning'
                        );
                    }
                    return;
                }
                if (this.isRecording) {
                    this.recognition.stop();
                } else {
                    try {
                        this.recognition.lang = this.selectedLanguage === 'de' ? 'de-DE' : 'en-US';
                        this.recognition.start();
                    } catch (err) {
                        console.warn('Speech recognition start failed:', err);
                    }
                }
            });
        } else if (this.micBtn) {
            this.micBtn.style.display = 'none';
        }

        // Listen for global language toggle to adapt current setup screen if visible
        document.addEventListener('langchange', (e) => {
            this.selectedLanguage = e.detail || 'de';
            this.updateLabels();
            this.updateTtsButtonIcon();
        });
        this.selectedLanguage = document.documentElement.getAttribute('lang') || 'de';
    }

    updateTtsButtonIcon() {
        if (!this.ttsToggleBtn) return;
        const icon = this.ttsToggleBtn.querySelector('i');
        if (icon) {
            icon.className = this.ttsEnabled ? 'fa fa-volume-up' : 'fa fa-volume-mute';
        }
        this.ttsToggleBtn.setAttribute(
            'title',
            this.ttsEnabled
                ? this.selectedLanguage === 'de'
                    ? 'Sprachausgabe stummschalten'
                    : 'Mute speech output'
                : this.selectedLanguage === 'de'
                  ? 'Sprachausgabe aktivieren'
                  : 'Enable speech output'
        );
    }

    updateLabels() {
        // Adapt placeholders depending on active page language
        if (this.inputText) {
            this.inputText.placeholder =
                this.selectedLanguage === 'de' ? 'Schreibe deine Antwort hier...' : 'Type your answer here...';
        }
    }

    startSimulator() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        // Collect choices
        const checkedBoxes = /** @type {NodeListOf<HTMLInputElement>} */ (
            document.querySelectorAll('input[name="category"]:checked')
        );
        this.selectedCategories = Array.from(checkedBoxes).map((cb) => cb.value);

        if (this.selectedCategories.length === 0) {
            window.showAlert({
                de: 'Bitte wähle mindestens eine Kategorie aus!',
                en: 'Please select at least one category!',
            });
            return;
        }

        this.selectedLanguage = document.documentElement.getAttribute('lang') || 'de';

        // Filter questions
        this.currentQuestions = INTERVIEW_QUESTIONS.filter((q) => this.selectedCategories.includes(q.category));

        // Shuffle questions
        this.currentQuestions.sort(() => Math.random() - 0.5);

        // Slice to max 5 questions to keep it engaging
        this.currentQuestions = this.currentQuestions.slice(0, 5);

        this.currentIndex = 0;
        this.matchedKeywordsCount = 0;
        this.totalPossibleKeywords = 0;
        this.history = [];

        // Hide setup, show chat
        this.setupCard.classList.add('collapsed');
        this.chatCard.classList.remove('collapsed');
        this.chatContainer.innerHTML = '';

        this.updateLabels();
        this.sendBotQuestion();
    }

    /** @param {string} text */
    speak(text) {
        if (!this.ttsEnabled || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Stop current speech

        const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ''); // Strip any HTML tags
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = this.selectedLanguage === 'de' ? 'de-DE' : 'en-US';

        const voices = window.speechSynthesis.getVoices();
        let voice = null;
        if (voices.length > 0) {
            if (this.selectedLanguage === 'de') {
                voice =
                    voices.find((v) => v.lang.startsWith('de') && v.name.includes('Google')) ||
                    voices.find((v) => v.lang.startsWith('de'));
            } else {
                voice =
                    voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google')) ||
                    voices.find((v) => v.lang.startsWith('en'));
            }
        }
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    }

    sendBotQuestion() {
        if (this.currentIndex >= this.currentQuestions.length) {
            this.showResults();
            return;
        }

        const q = this.currentQuestions[this.currentIndex];
        const questionText = this.selectedLanguage === 'de' ? q.questionDe : q.questionEn;

        // Show bot typing
        this.showTypingIndicator();

        setTimeout(() => {
            this.removeTypingIndicator();
            this.appendMessage('bot', questionText);
            this.inputText.disabled = false;
            this.inputText.focus();
            this.sendBtn.disabled = false;
            if (this.micBtn) this.micBtn.disabled = false;

            this.speak(questionText);
        }, 1200);
    }

    handleUserSubmit() {
        const text = this.inputText.value.trim();
        if (!text) return;

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        this.inputText.value = '';
        this.inputText.disabled = true;
        this.sendBtn.disabled = true;

        this.appendMessage('user', text);

        this.showTypingIndicator();

        setTimeout(() => {
            this.removeTypingIndicator();
            this.evaluateAnswer(text);
        }, 1200);
    }

    /** @param {string} userAnswer */
    evaluateAnswer(userAnswer) {
        const q = this.currentQuestions[this.currentIndex];
        const keywords = this.selectedLanguage === 'de' ? q.keywordsDe : q.keywordsEn;
        const modelAnswer = this.selectedLanguage === 'de' ? q.modelAnswerDe : q.modelAnswerEn;

        // Keyword match (modules/interview-evaluator.js)
        const { matched, missing, scorePercentage } = evaluateAnswerKeywords(userAnswer, keywords);

        this.matchedKeywordsCount += matched.length;
        this.totalPossibleKeywords += keywords.length;

        // Sound effect
        if (typeof GameAudio !== 'undefined') {
            if (scorePercentage >= 50) {
                GameAudio.play('match');
            } else {
                GameAudio.play('fail');
            }
        }

        // Add to history
        this.history.push({
            question: this.selectedLanguage === 'de' ? q.questionDe : q.questionEn,
            answer: userAnswer,
            score: scorePercentage,
            matched: matched,
            missing: missing,
            modelAnswer: modelAnswer,
        });

        // Generate response bubble content
        const feedback = getRatingFeedback(scorePercentage);
        const { ratingDe, ratingEn, bubbleClass } = feedback;
        const rating = this.selectedLanguage === 'de' ? ratingDe : ratingEn;

        // Increment commits today!
        this.addPracticedCommit();

        const feedbackHTML = `
            <div class="feedback-bubble ${bubbleClass}">
                <strong>${rating} (${scorePercentage}%)</strong><br>
                <div style="margin: 0.5rem 0;">
                    <span lang="de"><strong>Gefundene Kriterien:</strong> ${matched.length > 0 ? matched.map((/** @type {string} */ m) => `<span class="badge-match">${escapeHtml(m)}</span>`).join(' ') : 'Keine'}</span>
                    <span lang="en"><strong>Found Criteria:</strong> ${matched.length > 0 ? matched.map((/** @type {string} */ m) => `<span class="badge-match">${escapeHtml(m)}</span>`).join(' ') : 'None'}</span>
                </div>
                <div style="margin-top: 0.8rem; border-top: 1px solid var(--border); padding-top: 0.5rem;">
                    <p style="font-style: italic; margin-bottom: 0.25rem;">
                        <span lang="de"><strong>Musterlösung:</strong></span>
                        <span lang="en"><strong>Model Answer:</strong></span>
                    </p>
                    <p class="small-muted" style="margin-bottom: 0;">${escapeHtml(modelAnswer)}</p>
                </div>
                <button class="btn-primary small-btn next-question-btn" style="margin-top: 1rem; width: auto;" id="next-btn-${this.currentIndex}">
                    <span lang="de">Nächste Frage <i class="fa fa-arrow-right" aria-hidden="true"></i></span>
                    <span lang="en">Next Question <i class="fa fa-arrow-right" aria-hidden="true"></i></span>
                </button>
            </div>
        `;

        this.appendMessage('bot', feedbackHTML, true);

        // Bind click event to Next button
        const nextBtn = document.getElementById(`next-btn-${this.currentIndex}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextBtn.remove();
                this.currentIndex++;
                this.sendBotQuestion();
            });
        }
    }

    addPracticedCommit() {
        if (window.addLiveCommit) {
            window.addLiveCommit();
        } else {
            let liveCommitsToday = parseInt(AppStorage.getItem('github_live_commits_today', 0)) || 0;
            liveCommitsToday++;
            AppStorage.setItem('github_live_commits_today', liveCommitsToday);
        }
    }

    showResults() {
        this.chatCard.classList.add('collapsed');
        this.resultCard.classList.remove('collapsed');

        const overallPercentage =
            this.totalPossibleKeywords > 0
                ? Math.round((this.matchedKeywordsCount / this.totalPossibleKeywords) * 100)
                : 100;

        const scoreVal = document.getElementById('result-score-val');
        if (scoreVal) scoreVal.textContent = `${overallPercentage}%`;

        // Radial SVG update
        const circle = /** @type {SVGCircleElement} */ (
            /** @type {unknown} */ (document.getElementById('result-ring-fill'))
        );
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            const offset = circumference - (overallPercentage / 100) * circumference;
            circle.style.strokeDashoffset = String(offset);
        }

        // Summary details
        const summaryDe = document.getElementById('result-summary-de');
        const summaryEn = document.getElementById('result-summary-en');

        let deSummaryText;
        let enSummaryText;

        if (overallPercentage >= 80) {
            deSummaryText =
                'Exzellente Leistung! Du hast fast alle wichtigen Fachausdrücke und Kriterien in deinen Antworten abgedeckt. Du bist hervorragend auf deine Vorstellungsgespräche vorbereitet!';
            enSummaryText =
                'Excellent performance! You covered almost all core keywords and concepts. You are fully prepared to impress recruiters!';
            if (typeof Achievements !== 'undefined') {
                Achievements.unlock('interview_ace');
            }
            if (typeof GameAudio !== 'undefined') GameAudio.play('win');
        } else if (overallPercentage >= 55) {
            deSummaryText =
                'Gute Arbeit! Deine Antworten zeigen solides Verständnis. Wenn du noch ein paar mehr fachspezifische Begriffe integrierst, wird dein Auftritt perfekt.';
            enSummaryText =
                'Good job! You demonstrated solid understanding. Adding a few more precise technical terms will make your pitch perfect.';
            if (typeof GameAudio !== 'undefined') GameAudio.play('success');
        } else {
            deSummaryText =
                'Solider Versuch! Nutze die Musterlösungen der Fragen, um dein Wissen weiter zu festigen und präzisere Fachbegriffe zu lernen.';
            enSummaryText =
                'Fair trial! Study the provided model answers to reinforce your technical vocabulary and structure your pitches better.';
            if (typeof GameAudio !== 'undefined') GameAudio.play('die');
        }

        if (summaryDe) summaryDe.textContent = deSummaryText;
        if (summaryEn) summaryEn.textContent = enSummaryText;

        // Details cards
        const reviewContainer = document.getElementById('result-review-container');
        if (reviewContainer) {
            reviewContainer.innerHTML = '';
            this.history.forEach((h, idx) => {
                const cardHTML = `
                    <div class="review-item" style="border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: var(--card-bg-light);">
                        <h4 style="margin-top:0; color: var(--text-primary); font-size: 1.05rem;">Q${idx + 1}: ${escapeHtml(h.question)}</h4>
                        <div style="margin: 0.5rem 0;">
                            <strong>Score: ${h.score}%</strong>
                        </div>
                        <p style="margin-bottom: 0.5rem;"><strong>Deine Antwort / Your Answer:</strong><br><span class="small-muted">${escapeHtml(h.answer)}</span></p>
                        <p style="margin-bottom: 0.5rem;"><strong>Erreichte Stichpunkte:</strong> ${h.matched.map((/** @type {string} */ m) => `<span class="badge-match" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">${m}</span>`).join(' ') || 'Keine'}</p>
                        <p style="margin-bottom: 0;"><strong>Fehlende Stichpunkte:</strong> ${h.missing.map((/** @type {string} */ m) => `<span class="badge-match" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">${m}</span>`).join(' ') || 'Keine'}</p>
                    </div>
                `;
                reviewContainer.insertAdjacentHTML('beforeend', cardHTML);
            });
        }

        // Restart listener
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.onclick = () => {
                this.resultCard.classList.add('collapsed');
                this.setupCard.classList.remove('collapsed');
            };
        }

        // Align language classes
        document.dispatchEvent(
            new CustomEvent('langchange', { detail: document.documentElement.getAttribute('lang') || 'de' })
        );
    }

    /**
     * @param {string} sender
     * @param {string} text
     * @param {boolean} [isHTML]
     */
    appendMessage(sender, text, isHTML = false) {
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message-wrapper ${sender}-wrapper`;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}-bubble`;

        if (isHTML) {
            bubble.innerHTML = text;
        } else {
            bubble.textContent = text;
        }

        wrapper.appendChild(bubble);
        this.chatContainer.appendChild(wrapper);

        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    showTypingIndicator() {
        this.removeTypingIndicator();

        const wrapper = document.createElement('div');
        wrapper.className = 'chat-message-wrapper bot-wrapper';
        wrapper.id = 'typing-indicator-wrapper';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot-bubble typing-bubble';
        bubble.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        wrapper.appendChild(bubble);
        this.chatContainer.appendChild(wrapper);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-wrapper');
        if (indicator) {
            indicator.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InterviewSimulator();
});
