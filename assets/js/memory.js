/**
 * Memory Card Game — Match pairs of programming-related icons.
 * Features: Flip animations, move counter, timer, best score persistence.
 * Deck, time format and leaderboard are DOM-free in modules/memory-logic.js.
 */
import { addScore, buildDeck, formatTime, isNewBest as beatsBest, parseLeaderboard } from './modules/memory-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    initMemoryGame();
});

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const movesDisplay = document.getElementById('memory-moves');
    const timerDisplay = document.getElementById('memory-timer');
    const restartBtn = document.getElementById('memory-restart');
    const resultContainer = document.getElementById('memory-result');

    if (!grid) return;

    let memoryLeaderboard = parseLeaderboard(AppStorage.getItem('memory_highscore_list', '[]'));

    function renderMemoryHighscores() {
        const listBody = document.getElementById('memory-highscore-list-body');
        if (!listBody) return;
        listBody.innerHTML = '';

        /** @type {Array<{moves: number | string, time: number | string}>} */
        const displayList = [...memoryLeaderboard];
        while (displayList.length < 5) {
            displayList.push({ moves: '-', time: '-' });
        }

        displayList.forEach((entry, idx) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border)';
            // Values are numbers from parseLeaderboard or the '-' placeholder, never stored text.
            const timeStr = typeof entry.time === 'number' ? formatTime(entry.time) : '-';
            row.innerHTML = `
                <td style="padding: 0.4rem 0.25rem; font-weight: bold; color: ${idx === 0 ? 'var(--primary)' : 'var(--text-secondary)'};">${idx + 1}</td>
                <td style="padding: 0.4rem 0.25rem; color: var(--text-primary); font-weight: 500;">${entry.moves}</td>
                <td style="padding: 0.4rem 0.25rem; text-align: right; color: var(--text-muted); font-family: monospace;">${timeStr}</td>
            `;
            listBody.appendChild(row);
        });
    }

    // Initial render
    renderMemoryHighscores();

    // 8 pairs of programming-related symbols (Font Awesome icons)
    const symbols = [
        { name: 'js', icon: 'fa-brands fa-js', color: '#f7df1e' },
        { name: 'java', icon: 'fa-brands fa-java', color: '#f89820' },
        { name: 'python', icon: 'fa-brands fa-python', color: '#3776ab' },
        { name: 'database', icon: 'fa-solid fa-database', color: '#0064a5' },
        { name: 'react', icon: 'fa-brands fa-react', color: '#61dafb' },
        { name: 'git', icon: 'fa-brands fa-git-alt', color: '#f05032' },
        { name: 'html5', icon: 'fa-brands fa-html5', color: '#e34f26' },
        { name: 'css3', icon: 'fa-brands fa-css3-alt', color: '#1572b6' },
    ];
    let cards = [];
    /** @type {HTMLElement[]} */
    let flippedCards = [];
    let matchedCount = 0;
    let moves = 0;
    /** @type {ReturnType<typeof setInterval> | null} */
    let timerInterval = null;
    let seconds = 0;
    let gameStarted = false;

    function createBoard() {
        // Reset state
        grid.innerHTML = '';
        flippedCards = [];
        matchedCount = 0;
        moves = 0;
        seconds = 0;
        gameStarted = false;
        if (timerInterval) clearInterval(timerInterval);
        if (movesDisplay) movesDisplay.textContent = '0';
        if (timerDisplay) timerDisplay.textContent = '0:00';
        if (resultContainer) resultContainer.style.display = 'none';

        // Create card pairs
        const deck = buildDeck(symbols);

        deck.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol.name;
            card.dataset.index = String(index);
            // Keyboard access: the cards are focusable buttons (Enter/Space flip them).
            card.setAttribute('role', 'button');
            card.tabIndex = 0;
            setCardLabel(card, index, null);

            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front">
                        <i class="fa fa-code" aria-hidden="true"></i>
                    </div>
                    <div class="memory-card-back">
                        <i class="${symbol.icon}" style="color: ${symbol.color}; font-size: 2.2rem;" aria-hidden="true"></i>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => flipCard(card));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    flipCard(card);
                }
            });
            grid.appendChild(card);
            cards.push(card);
        });
    }

    /**
     * @param {HTMLElement} card
     * @param {number} index
     * @param {string | null} symbolName shown symbol, null while the card is face down
     */
    function setCardLabel(card, index, symbolName) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const label =
            lang === 'de'
                ? `Karte ${index + 1}${symbolName ? `: ${symbolName}` : ', verdeckt'}`
                : `Card ${index + 1}${symbolName ? `: ${symbolName}` : ', face down'}`;
        card.setAttribute('aria-label', label);
    }

    /** @param {HTMLElement} card */
    const labelOf = (card) =>
        setCardLabel(
            card,
            Number(card.dataset.index),
            card.classList.contains('flipped') || card.classList.contains('matched') ? card.dataset.symbol : null
        );

    function startTimer() {
        if (gameStarted) return;
        gameStarted = true;
        timerInterval = setInterval(() => {
            seconds++;
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(seconds);
            }
        }, 1000);
    }

    /** @param {HTMLElement} card */
    function flipCard(card) {
        // Ignore if already flipped, matched, or two cards are already showing
        if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        startTimer();

        card.classList.add('flipped');
        labelOf(card);
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            if (movesDisplay) movesDisplay.textContent = String(moves);
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const match = card1.dataset.symbol === card2.dataset.symbol;

        if (match) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            matchedCount++;

            if (typeof GameAudio !== 'undefined') {
                GameAudio.play('match');
            }

            if (matchedCount === symbols.length) {
                gameWon();
            }
        } else {
            if (typeof GameAudio !== 'undefined') {
                GameAudio.play('fail');
            }
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                labelOf(card1);
                labelOf(card2);
                flippedCards = [];
            }, 800);
        }
    }

    function gameWon() {
        clearInterval(timerInterval);

        if (seconds < 60 && typeof Achievements !== 'undefined') {
            Achievements.unlock('memory_fast');
        }

        if (typeof GameAudio !== 'undefined') {
            GameAudio.play('win');
        }

        // Add live commit on victory!
        if (typeof window.addLiveCommit === 'function') {
            window.addLiveCommit();
        }

        // Save to leaderboard
        memoryLeaderboard = addScore(memoryLeaderboard, moves, seconds).list;
        AppStorage.setItem('memory_highscore_list', JSON.stringify(memoryLeaderboard));
        renderMemoryHighscores();

        if (typeof Confetti !== 'undefined') {
            Confetti.start();
        }

        // Save best score
        const isNewBest = beatsBest(AppStorage.getItem(STORAGE_KEYS.MEMORY_BEST_MOVES), moves);
        if (isNewBest) {
            AppStorage.setItem(STORAGE_KEYS.MEMORY_BEST_MOVES, moves);
            AppStorage.setItem(STORAGE_KEYS.MEMORY_BEST_TIME, seconds);
        }

        // Show result
        if (resultContainer) {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const timeStr = formatTime(seconds);

            let html;
            if (lang === 'de') {
                html = `<h3>🎉 Gewonnen!</h3>
                    <p>Du hast ${moves} Züge gebraucht und ${timeStr} Minuten benötigt.</p>`;
                if (isNewBest) html += '<p style="color: var(--primary); font-weight: 700;">🏆 Neuer Highscore!</p>';
            } else {
                html = `<h3>🎉 You Won!</h3>
                    <p>You completed the game in ${moves} moves and ${timeStr} minutes.</p>`;
                if (isNewBest) html += '<p style="color: var(--primary); font-weight: 700;">🏆 New High Score!</p>';
            }
            resultContainer.innerHTML = html;
            resultContainer.style.display = 'block';
        }
    }

    // Init
    createBoard();

    // Card labels follow the language switch
    document.addEventListener('langchange', () => {
        grid.querySelectorAll('.memory-card').forEach((card) => labelOf(/** @type {HTMLElement} */ (card)));
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            cards = [];
            createBoard();
        });
    }
}
