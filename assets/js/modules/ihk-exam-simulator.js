/**
 * IHK Timed Exam Simulator Module for AP1, AP2 & WISO
 */

export function initIhkExamSimulator() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    // Inject Exam Mode Selector Header
    const modeSelector = document.createElement('div');
    modeSelector.className = 'ihk-mode-selector margin-bottom-1rem p-3 background-glass border-radius-8px';
    modeSelector.innerHTML = `
        <div class="flex-between align-center flex-wrap gap-2">
            <div>
                <h4 class="m-0 font-size-1rem color-primary">
                    <i class="fa-solid fa-graduation-cap me-2"></i> Mode: <span id="current-exam-mode-name">IHK AP1/AP2 Prüfungssimulation</span>
                </h4>
                <p class="font-size-0-8rem text-muted m-0" lang="de">Wähle deinen Prüfungs-Modus mit Timer und Schwachstellen-Analyse:</p>
            </div>
            <div id="exam-timer-display" class="badge badge-warning font-size-0-9rem padding-6px-12px display-none">
                ⏱️ Restzeit: <span id="timer-countdown">90:00</span>
            </div>
        </div>
        <div class="d-flex flex-wrap gap-2 margin-top-0-75rem">
            <button type="button" class="btn btn-sm btn-outline-primary btn-exam-mode active" data-mode="standard">
                📋 Normales Quiz
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary btn-exam-mode" data-mode="ap1">
                ⏱️ AP1 Simulator (IT-Arbeitsplatz)
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary btn-exam-mode" data-mode="ap2">
                ⚡ AP2 Simulator (Software / OOP / SQL)
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary btn-exam-mode" data-mode="wiso">
                💼 WISO Spezial (Wirtschaft & Recht)
            </button>
        </div>
    `;

    quizContainer.insertBefore(modeSelector, quizContainer.children[1]);

    let timerInterval = null;
    let timeRemaining = 5400; // 90 mins

    const timerDisplay = modeSelector.querySelector('#exam-timer-display');
    const timerCountdown = modeSelector.querySelector('#timer-countdown');
    const modeButtons = modeSelector.querySelectorAll('.btn-exam-mode');

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            if (mode === 'standard') {
                clearInterval(timerInterval);
                timerDisplay.classList.add('display-none');
            } else {
                timerDisplay.classList.remove('display-none');
                startExamTimer(mode === 'wiso' ? 1800 : 5400);
            }

            if (window.showToast) {
                window.showToast(`Modus gewechselt: ${btn.textContent.trim()}`, 'info');
            }
        });
    });

    function startExamTimer(seconds) {
        clearInterval(timerInterval);
        timeRemaining = seconds;

        updateTimerText();
        timerInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timeRemaining = 0;
                updateTimerText();
                alert('⏰ Zeit abgelaufen! Die IHK-Prüfungssimulation wird nun ausgewertet.');
            } else {
                updateTimerText();
            }
        }, 1000);
    }

    function updateTimerText() {
        const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const secs = String(timeRemaining % 60).padStart(2, '0');
        if (timerCountdown) {
            timerCountdown.textContent = `${mins}:${secs}`;
        }
    }
}
