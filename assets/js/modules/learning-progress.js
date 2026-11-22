/**
 * Learning Progress Module — Tracks and displays progress across learning tools
 * Reads saved scores from localStorage and renders progress bars on the dashboard.
 */
import { parseBestScore, percentage } from './quiz-logic.js';
import { QUIZ_QUESTION_COUNT } from './quiz-questions.js';

/**
 * The quiz stores its best score as a count of right answers; the dashboard shows a share.
 * @returns {number | null} 0 to 100, null when nothing valid is stored
 */
function quizBestPercent() {
    const score = parseBestScore(AppStorage.getItem('quiz_best_score', null));
    return score === null ? null : Math.min(100, percentage(score, QUIZ_QUESTION_COUNT));
}

export function initLearningProgress() {
    // Flashcard progress
    const flashcardBar = document.getElementById('progress-flashcards-bar');
    const flashcardText = document.getElementById('progress-flashcards');
    if (flashcardBar && flashcardText) {
        const correct = parseInt(AppStorage.getItem('flashcard_correct_count', '0')) || 0;
        const total = parseInt(AppStorage.getItem('flashcard_total_count', '0')) || 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        flashcardBar.style.width = pct + '%';
        flashcardText.textContent = pct + '%';
    }

    // Quiz progress
    const quizBar = document.getElementById('progress-quiz-bar');
    const quizText = document.getElementById('progress-quiz');
    if (quizBar && quizText) {
        const quizPercent = quizBestPercent() ?? 0;
        quizBar.style.width = quizPercent + '%';
        quizText.textContent = quizPercent + '%';
    }

    // Interview progress
    const interviewBar = document.getElementById('progress-interview-bar');
    const interviewText = document.getElementById('progress-interview');
    if (interviewBar && interviewText) {
        const interviewScore = parseInt(AppStorage.getItem('interview_best_score', '0')) || 0;
        interviewBar.style.width = interviewScore + '%';
        interviewText.textContent = interviewScore + '%';
    }

    // Highscores
    const hsSnake = document.getElementById('hs-snake');
    const hsMemory = document.getElementById('hs-memory');
    const hsQuiz = document.getElementById('hs-quiz');

    if (hsSnake) {
        const score = AppStorage.getItem(STORAGE_KEYS.SNAKE_HIGHSCORE, '—');
        hsSnake.textContent = score !== '—' ? score + ' Pts' : '—';
    }

    if (hsMemory) {
        const bestMoves = AppStorage.getItem(STORAGE_KEYS.MEMORY_BEST_MOVES, null);
        const bestTime = AppStorage.getItem(STORAGE_KEYS.MEMORY_BEST_TIME, null);
        if (bestMoves && bestTime) {
            hsMemory.textContent = `${bestMoves} Züge / ${bestTime}s`;
        }
    }

    if (hsQuiz) {
        const quizPercent = quizBestPercent();
        if (quizPercent !== null) {
            hsQuiz.textContent = quizPercent + '%';
        }
    }
}
