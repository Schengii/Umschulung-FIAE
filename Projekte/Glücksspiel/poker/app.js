(function () {
    let balance = 1000.00;
    let betAmount = 10.00;
    
    let deck = [];
    let currentHand = [];
    let heldIndices = [false, false, false, false, false];
    
    let gameState = 'IDLE'; // 'IDLE' -> 'DEALT' -> 'RESOLVED'

    const SUITS = [
        { name: 'Feuer', symbol: '🔥', style: 'fire' },
        { name: 'Wasser', symbol: '💧', style: 'water' },
        { name: 'Erde', symbol: '🌿', style: 'earth' },
        { name: 'Luft', symbol: '⚡', style: 'air' }
    ];

    const RANKS = [
        { type: '2', val: 2 }, { type: '3', val: 3 }, { type: '4', val: 4 },
        { type: '5', val: 5 }, { type: '6', val: 6 }, { type: '7', val: 7 },
        { type: '8', val: 8 }, { type: '9', val: 9 }, { type: '10', val: 10 },
        { type: 'J', val: 11 }, { type: 'Q', val: 12 }, { type: 'K', val: 13 }, { type: 'A', val: 14 }
    ];

    // DOM Elements
    const balAmountEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('bet-input');
    const betDisplay = document.getElementById('bet-display');
    const btnDeal = document.getElementById('btn-deal');
    const cardsGrid = document.getElementById('poker-cards-grid');
    const statusText = document.getElementById('poker-status-text');

    if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
        window.AlchemistShared.applyCurrentTheme();
    }

    syncState();
    renderEmptyBoard();

    if (btnDeal) btnDeal.addEventListener('click', handleDealClick);

    function syncState() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        if (balAmountEl) {
            balAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    function buildDeck() {
        let newDeck = [];
        SUITS.forEach(suit => {
            RANKS.forEach(rank => {
                newDeck.push({
                    type: rank.type,
                    value: rank.val,
                    suitName: suit.name,
                    suitSymbol: suit.symbol,
                    style: suit.style
                });
            });
        });
        // Shuffle
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }

    function renderEmptyBoard() {
        cardsGrid.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const wrap = document.createElement('div');
            wrap.className = 'poker-card-wrapper';
            wrap.innerHTML = `
                <div class="poker-card" style="opacity:0.3; justify-content:center; align-items:center;">
                    <span style="font-size:2rem;">🔮</span>
                </div>
                <button class="poker-hold-btn" disabled>HALTEN</button>
            `;
            cardsGrid.appendChild(wrap);
        }
    }

    function handleDealClick() {
        if (gameState === 'IDLE' || gameState === 'RESOLVED') {
            startFirstDeal();
        } else if (gameState === 'DEALT') {
            drawSecondDeal();
        }
    }

    function startFirstDeal() {
        syncState();
        betAmount = Math.max(5.00, Math.min(250.00, parseFloat(betInput.value) || 10.00));
        betInput.value = betAmount.toFixed(2);
        if (betDisplay) betDisplay.textContent = betAmount.toFixed(2);

        if (balance < betAmount) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            }
            return;
        }

        // Deduct bet
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-betAmount);
        } else {
            balance -= betAmount;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }
        syncState();

        deck = buildDeck();
        currentHand = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
        heldIndices = [false, false, false, false, false];

        gameState = 'DEALT';
        btnDeal.textContent = "TAUSCHEN";
        betInput.setAttribute('disabled', 'true');
        clearPaytableHighlights();

        statusText.style.color = 'var(--text-secondary)';
        statusText.textContent = "Klicke auf Karten oder 'HALTEN', um gewünschte Elemente zu behalten.";

        renderCardsUI();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
    }

    function drawSecondDeal() {
        for (let i = 0; i < 5; i++) {
            if (!heldIndices[i]) {
                currentHand[i] = deck.pop();
            }
        }

        gameState = 'RESOLVED';
        btnDeal.textContent = "NEUES DUELL";
        betInput.removeAttribute('disabled');

        renderCardsUI();
        evaluateHandOutcome();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
    }

    function toggleHold(idx) {
        if (gameState !== 'DEALT') return;
        heldIndices[idx] = !heldIndices[idx];
        renderCardsUI();
    }

    function renderCardsUI() {
        cardsGrid.innerHTML = '';
        currentHand.forEach((card, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'poker-card-wrapper';

            const cardEl = document.createElement('div');
            cardEl.className = `poker-card card-suit-${card.style}`;
            cardEl.innerHTML = `
                <div class="card-top">
                    <span>${card.type}</span>
                    <span>${card.suitSymbol}</span>
                </div>
                <div class="card-center-symbol">${card.suitSymbol}</div>
                <div class="card-bottom-name" style="text-align:right;">${card.type}</div>
            `;

            const holdBtn = document.createElement('button');
            holdBtn.className = `poker-hold-btn ${heldIndices[idx] ? 'held' : ''}`;
            holdBtn.textContent = heldIndices[idx] ? 'GEHALTEN' : 'HALTEN';
            holdBtn.disabled = gameState !== 'DEALT';

            cardEl.addEventListener('click', () => toggleHold(idx));
            holdBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHold(idx);
            });

            wrap.appendChild(cardEl);
            wrap.appendChild(holdBtn);
            cardsGrid.appendChild(wrap);
        });
    }

    function evaluateHandOutcome() {
        const handResult = analyzeHand(currentHand);
        clearPaytableHighlights();

        let mult = 0;
        let payKey = null;

        if (handResult.isRoyal) { mult = 250; payKey = 'royal'; }
        else if (handResult.isStraightFlush) { mult = 50; payKey = 'str_flush'; }
        else if (handResult.isFour) { mult = 25; payKey = 'four'; }
        else if (handResult.isFullHouse) { mult = 9; payKey = 'full'; }
        else if (handResult.isFlush) { mult = 6; payKey = 'flush'; }
        else if (handResult.isStraight) { mult = 4; payKey = 'straight'; }
        else if (handResult.isThree) { mult = 3; payKey = 'three'; }
        else if (handResult.isTwoPair) { mult = 2; payKey = 'two_pair'; }
        else if (handResult.isJacksOrBetter) { mult = 1; payKey = 'jacks'; }

        let totalWin = betAmount * mult;

        // Fortuna potion bonus (+20%)
        let activePotions = JSON.parse(localStorage.getItem('alchemist_active_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
        if (totalWin > 0 && activePotions.fortuna > 0) {
            totalWin = parseFloat((totalWin * 1.20).toFixed(2));
        }

        if (payKey) {
            const payRow = document.querySelector(`.pay-row[data-hand="${payKey}"]`);
            if (payRow) payRow.classList.add('active-win');
        }

        if (totalWin > 0) {
            statusText.style.color = 'var(--color-gold)';
            statusText.textContent = `✨ ${handResult.name}! Auszahlung: +${totalWin.toFixed(2)} €!`;
            
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(totalWin);
            }
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('win_fanfare');
            }
        } else {
            statusText.style.color = 'var(--color-danger)';
            statusText.textContent = `💨 Kein gewinnendes Blatt (${handResult.name}). Einsatz verloren.`;
        }

        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay('poker', totalWin, betAmount, totalWin / betAmount);
        }
        if (window.AlchemistShared && window.AlchemistShared.addXP) {
            window.AlchemistShared.addXP(20 + Math.floor(betAmount / 5));
        }

        syncState();
    }

    function clearPaytableHighlights() {
        document.querySelectorAll('.pay-row').forEach(r => r.classList.remove('active-win'));
    }

    function analyzeHand(hand) {
        // Sort values asc
        let sorted = [...hand].sort((a, b) => a.value - b.value);
        let values = sorted.map(c => c.value);
        let suits = sorted.map(c => c.style);

        // Count ranks
        let counts = {};
        values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        let countVals = Object.values(counts).sort((a, b) => b - a);

        let isFlush = suits.every(s => s === suits[0]);

        // Check straight
        let isStraight = false;
        if (new Set(values).size === 5) {
            if (values[4] - values[0] === 4) isStraight = true;
            // Ace low straight: A, 2, 3, 4, 5 -> 14, 2, 3, 4, 5
            if (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14) isStraight = true;
        }

        let isRoyal = isFlush && isStraight && values[0] === 10 && values[4] === 14;
        let isStraightFlush = isFlush && isStraight;
        let isFour = countVals[0] === 4;
        let isFullHouse = countVals[0] === 3 && countVals[1] === 2;
        let isThree = countVals[0] === 3 && countVals[1] === 1;
        let isTwoPair = countVals[0] === 2 && countVals[1] === 2;
        
        let isJacksOrBetter = false;
        if (countVals[0] === 2 && countVals[1] === 1) {
            // Find pair rank
            for (let r in counts) {
                if (counts[r] === 2 && parseInt(r) >= 11) {
                    isJacksOrBetter = true;
                }
            }
        }

        let name = "High Card";
        if (isRoyal) name = "Urmaterie Royal Flush";
        else if (isStraightFlush) name = "Elementar Straight Flush";
        else if (isFour) name = "Vierling (4x Metalle)";
        else if (isFullHouse) name = "Full House";
        else if (isFlush) name = "Flush";
        else if (isStraight) name = "Straße";
        else if (isThree) name = "Drilling";
        else if (isTwoPair) name = "Zwei Paare";
        else if (isJacksOrBetter) name = "Buben oder Besser";

        return {
            name: name,
            isRoyal: isRoyal,
            isStraightFlush: isStraightFlush,
            isFour: isFour,
            isFullHouse: isFullHouse,
            isFlush: isFlush,
            isStraight: isStraight,
            isThree: isThree,
            isTwoPair: isTwoPair,
            isJacksOrBetter: isJacksOrBetter
        };
    }
})();
