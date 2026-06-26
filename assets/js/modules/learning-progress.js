/**
 * Learning Progress Module — Tracks and displays progress across learning tools
 * Reads saved scores from localStorage and renders progress bars on the dashboard.
 */
function initLearningProgress() {
    // Flashcard progress
    const flashcardBar = document.getElementById('progress-flashcards-bar');
    const flashcardText = document.getElementById('progress-flashcards');
    if (flashcardBar && flashcardText) {
        const correct = parseInt(StorageManager.getItem('flashcard_correct_count', '0')) || 0;
        const total = parseInt(StorageManager.getItem('flashcard_total_count', '0')) || 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        flashcardBar.style.width = pct + '%';
        flashcardText.textContent = pct + '%';
    }

    // Quiz progress
    const quizBar = document.getElementById('progress-quiz-bar');
    const quizText = document.getElementById('progress-quiz');
    if (quizBar && quizText) {
        const quizScore = parseInt(StorageManager.getItem('quiz_best_score', '0')) || 0;
        quizBar.style.width = quizScore + '%';
        quizText.textContent = quizScore + '%';
    }

    // Interview progress
    const interviewBar = document.getElementById('progress-interview-bar');
    const interviewText = document.getElementById('progress-interview');
    if (interviewBar && interviewText) {
        const interviewScore = parseInt(StorageManager.getItem('interview_best_score', '0')) || 0;
        interviewBar.style.width = interviewScore + '%';
        interviewText.textContent = interviewScore + '%';
    }

    // Highscores
    const hsSnake = document.getElementById('hs-snake');
    const hsMemory = document.getElementById('hs-memory');
    const hsQuiz = document.getElementById('hs-quiz');

    if (hsSnake) {
        const score = StorageManager.getItem(STORAGE_KEYS.SNAKE_HIGHSCORE, '—');
        hsSnake.textContent = score !== '—' ? score + ' Pts' : '—';
    }

    if (hsMemory) {
        const bestMoves = StorageManager.getItem(STORAGE_KEYS.MEMORY_BEST_MOVES, null);
        const bestTime = StorageManager.getItem(STORAGE_KEYS.MEMORY_BEST_TIME, null);
        if (bestMoves && bestTime) {
            hsMemory.textContent = `${bestMoves} Züge / ${bestTime}s`;
        }
    }

    if (hsQuiz) {
        const quizScore = StorageManager.getItem('quiz_best_score', null);
        if (quizScore) {
            hsQuiz.textContent = quizScore + '%';
        }
    }
}
