/**
 * Memory Card Game — Match pairs of programming-related icons.
 * Features: Flip animations, move counter, timer, best score persistence.
 */

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

    // 8 pairs of programming-related symbols (Font Awesome icons)
    const symbols = [
        { name: 'js', icon: 'fa-brands fa-js', color: '#f7df1e' },
        { name: 'java', icon: 'fa-brands fa-java', color: '#f89820' },
        { name: 'python', icon: 'fa-brands fa-python', color: '#3776ab' },
        { name: 'database', icon: 'fa-solid fa-database', color: '#0064a5' },
        { name: 'react', icon: 'fa-brands fa-react', color: '#61dafb' },
        { name: 'git', icon: 'fa-brands fa-git-alt', color: '#f05032' },
        { name: 'html5', icon: 'fa-brands fa-html5', color: '#e34f26' },
        { name: 'css3', icon: 'fa-brands fa-css3-alt', color: '#1572b6' }
    ];
    let cards = [];
    let flippedCards = [];
    let matchedCount = 0;
    let moves = 0;
    let timerInterval = null;
    let seconds = 0;
    let gameStarted = false;

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

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
        const deck = shuffle([...symbols, ...symbols]);

        deck.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol.name;
            card.dataset.index = index;

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
            grid.appendChild(card);
            cards.push(card);
        });
    }

    function startTimer() {
        if (gameStarted) return;
        gameStarted = true;
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (timerDisplay) {
                timerDisplay.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
            }
        }, 1000);
    }

    function flipCard(card) {
        // Ignore if already flipped, matched, or two cards are already showing
        if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        startTimer();

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            if (movesDisplay) movesDisplay.textContent = moves;
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

            if (matchedCount === symbols.length) {
                gameWon();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 800);
        }
    }

    function gameWon() {
        clearInterval(timerInterval);

        // Save best score
        const bestMoves = StorageManager.getItem('memoryBestMoves');
        const bestTime = StorageManager.getItem('memoryBestTime');
        let isNewBest = false;

        if (!bestMoves || moves < parseInt(bestMoves)) {
            StorageManager.setItem('memoryBestMoves', moves);
            StorageManager.setItem('memoryBestTime', seconds);
            isNewBest = true;
        }

        // Show result
        if (resultContainer) {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
            
            let html = '';
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

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            cards = [];
            createBoard();
        });
    }
}
