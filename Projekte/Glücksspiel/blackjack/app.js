(function () {
    let balance = 1000.00;
    let betAmount = 10.00;
    
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let isGameActive = false;
    let isDealerRevealed = false;

    // Split hands state
    let isSplit = false;
    let currentSplitIndex = 0; // 0 for hand 1, 1 for hand 2
    let splitHands = []; // array of hands when split: [{ hand: [], bet: amount, isFinished: false, result: null }]

    // Metal mappings for Blackjack cards
    const METALS = {
        '2': { name: "Kupfererz", symbol: "🜔", style: "blei", value: 2 },
        '3': { name: "Zinnerz", symbol: "🜔", style: "blei", value: 3 },
        '4': { name: "Eisenerz", symbol: "🜔", style: "blei", value: 4 },
        '5': { name: "Bleierz", symbol: "🜔", style: "blei", value: 5 },
        '6': { name: "Bronzelegierung", symbol: "🜔", style: "blei", value: 6 },
        '7': { name: "Messinglegierung", symbol: "🜔", style: "zinn", value: 7 },
        '8': { name: "Silbererz", symbol: "🜔", style: "zinn", value: 8 },
        '9': { name: "Golderz", symbol: "🜔", style: "zinn", value: 9 },
        '10': { name: "Kupfer", symbol: "♀", style: "kupfer", value: 10 },
        'J': { name: "Eisen", symbol: "♂", style: "eisen", value: 10 },
        'Q': { name: "Zinn", symbol: "♃", style: "zinn", value: 10 },
        'K': { name: "Blei", symbol: "♄", style: "blei", value: 10 },
        'A': { name: "Urmaterie", symbol: "🜔", style: "prima", value: 11 }
    };

    // DOM ELEMENTS
    const balAmountEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('bet-input');
    const btnStart = document.getElementById('btn-start');
    const btnHit = document.getElementById('btn-hit');
    const btnStand = document.getElementById('btn-stand');
    const btnDoubleDown = document.getElementById('btn-double-down');
    const btnSplit = document.getElementById('btn-split');
    const playActionsContainer = document.getElementById('game-play-actions');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerScoreEl = document.getElementById('dealer-score-val');
    const playerScoreEl = document.getElementById('player-score-val');
    const tableStatus = document.getElementById('table-status');

    // Bet preset buttons
    const btnMin = document.getElementById('btn-bet-min');
    const btnHalf = document.getElementById('btn-bet-half');
    const btnDouble = document.getElementById('btn-bet-double');
    const btnMax = document.getElementById('btn-bet-max');

    // Apply global themes
    if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
        window.AlchemistShared.applyCurrentTheme();
    }

    // INITIALIZATION
    syncState();
    resetTable();

    // Preset button events
    if (btnMin) btnMin.addEventListener('click', () => { betInput.value = "5.00"; });
    if (btnHalf) btnHalf.addEventListener('click', () => { betInput.value = Math.max(5.00, Math.floor(parseFloat(betInput.value) / 2)).toFixed(2); });
    if (btnDouble) btnDouble.addEventListener('click', () => { betInput.value = Math.min(250.00, parseFloat(betInput.value) * 2).toFixed(2); });
    if (btnMax) btnMax.addEventListener('click', () => { betInput.value = "250.00"; });

    if (btnStart) btnStart.addEventListener('click', startDuel);
    if (btnHit) btnHit.addEventListener('click', playerHit);
    if (btnStand) btnStand.addEventListener('click', playerStand);
    if (btnDoubleDown) btnDoubleDown.addEventListener('click', playerDoubleDown);
    if (btnSplit) btnSplit.addEventListener('click', playerSplitPair);

    function syncState() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        if (balAmountEl) {
            balAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    function resetTable() {
        isGameActive = false;
        isDealerRevealed = false;
        isSplit = false;
        splitHands = [];
        currentSplitIndex = 0;
        
        if (btnStart) btnStart.classList.remove('hidden');
        if (playActionsContainer) playActionsContainer.classList.add('hidden');
        if (betInput) betInput.removeAttribute('disabled');
    }

    function updateActionButtonsState() {
        if (!isGameActive) return;

        const currentActiveHand = isSplit ? splitHands[currentSplitIndex].hand : playerHand;
        const canDouble = currentActiveHand.length === 2 && balance >= betAmount;
        const canSplit = !isSplit && playerHand.length === 2 && playerHand[0].value === playerHand[1].value && balance >= betAmount;

        if (btnDoubleDown) btnDoubleDown.disabled = !canDouble;
        if (btnSplit) btnSplit.disabled = !canSplit;
    }

    // DECK BUILDER
    function buildDeck() {
        let newDeck = [];
        const cardTypes = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (let deckNum = 0; deckNum < 4; deckNum++) {
            for (let suite = 0; suite < 4; suite++) {
                cardTypes.forEach(type => {
                    newDeck.push({
                        type: type,
                        ...METALS[type]
                    });
                });
            }
        }
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }

    function drawCard() {
        if (deck.length === 0) {
            deck = buildDeck();
        }
        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
        return deck.pop();
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        hand.forEach(card => {
            value += card.value;
            if (card.type === 'A') aces++;
        });
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        return value;
    }

    // GAME CONTROLLER
    function startDuel() {
        if (isGameActive) return;

        syncState();
        betAmount = Math.max(5.00, Math.min(250.00, parseFloat(betInput.value) || 10.00));
        betInput.value = betAmount.toFixed(2);

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

        // Setup deck & initial deal
        deck = buildDeck();
        playerHand = [drawCard(), drawCard()];
        dealerHand = [drawCard(), drawCard()];

        isGameActive = true;
        isDealerRevealed = false;
        isSplit = false;
        splitHands = [];
        
        btnStart.classList.add('hidden');
        playActionsContainer.classList.remove('hidden');
        betInput.setAttribute('disabled', 'true');
        
        tableStatus.style.color = 'var(--text-secondary)';
        tableStatus.textContent = "Ignatius teilt die Metalle aus. Wirst du ziehen, halten oder verdoppeln?";

        updateUI();
        updateActionButtonsState();

        // Instant natural 21 check
        let pScore = calculateHandValue(playerHand);
        if (pScore === 21) {
            playerStand();
        }
    }

    function playerHit() {
        if (!isGameActive) return;

        if (isSplit) {
            splitHands[currentSplitIndex].hand.push(drawCard());
            updateUI();

            let pScore = calculateHandValue(splitHands[currentSplitIndex].hand);
            if (pScore >= 21) {
                advanceSplitOrDealerTurn();
            }
        } else {
            playerHand.push(drawCard());
            updateUI();

            let pScore = calculateHandValue(playerHand);
            if (pScore > 21) {
                resolveRound(false, "Bust");
            } else if (pScore === 21) {
                playerStand();
            }
        }
        updateActionButtonsState();
    }

    function playerDoubleDown() {
        if (!isGameActive) return;

        const targetHandObj = isSplit ? splitHands[currentSplitIndex] : null;
        const currentBet = targetHandObj ? targetHandObj.bet : betAmount;

        if (balance < currentBet) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold zum Verdoppeln!", "info");
            }
            return;
        }

        // Deduct double bet
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-currentBet);
        } else {
            balance -= currentBet;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }
        syncState();

        if (isSplit) {
            targetHandObj.bet *= 2;
            targetHandObj.hand.push(drawCard());
            updateUI();
            advanceSplitOrDealerTurn();
        } else {
            betAmount *= 2;
            playerHand.push(drawCard());
            updateUI();

            let pScore = calculateHandValue(playerHand);
            if (pScore > 21) {
                resolveRound(false, "Bust");
            } else {
                playerStand();
            }
        }
    }

    function playerSplitPair() {
        if (!isGameActive || isSplit || playerHand.length !== 2) return;
        if (playerHand[0].value !== playerHand[1].value) return;

        if (balance < betAmount) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold zum Spalten!", "info");
            }
            return;
        }

        // Deduct 2nd bet for split hand
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-betAmount);
        } else {
            balance -= betAmount;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }
        syncState();

        isSplit = true;
        currentSplitIndex = 0;
        splitHands = [
            { hand: [playerHand[0], drawCard()], bet: betAmount, isFinished: false },
            { hand: [playerHand[1], drawCard()], bet: betAmount, isFinished: false }
        ];

        tableStatus.textContent = "⚔️ Paar gespalten! Spielem Hand 1...";
        updateUI();
        updateActionButtonsState();
    }

    function playerStand() {
        if (!isGameActive) return;

        if (isSplit) {
            advanceSplitOrDealerTurn();
        } else {
            executeDealerAI();
        }
    }

    function advanceSplitOrDealerTurn() {
        splitHands[currentSplitIndex].isFinished = true;
        if (currentSplitIndex === 0) {
            currentSplitIndex = 1;
            tableStatus.textContent = "⚔️ Hand 1 fertig. Jetzt Hand 2 spielen...";
            updateUI();
            updateActionButtonsState();
        } else {
            executeDealerAI();
        }
    }

    function executeDealerAI() {
        isDealerRevealed = true;
        updateUI();

        let dScore = calculateHandValue(dealerHand);

        const runTurn = () => {
            if (dScore < 17) {
                setTimeout(() => {
                    dealerHand.push(drawCard());
                    dScore = calculateHandValue(dealerHand);
                    updateUI();
                    runTurn();
                }, 700);
            } else {
                if (isSplit) {
                    resolveSplitRound();
                } else {
                    evaluateWinner();
                }
            }
        };

        runTurn();
    }

    function evaluateWinner() {
        let pScore = calculateHandValue(playerHand);
        let dScore = calculateHandValue(dealerHand);

        let activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || {};
        let hasBellows = !!activeUpgrades.bellows;

        if (dScore > 21) {
            resolveRound(true, "Rektor Bust");
        } else if (pScore > dScore) {
            resolveRound(true, "Höherer Wert");
        } else if (pScore < dScore) {
            resolveRound(false, "Ignatius überlegen");
        } else {
            if (hasBellows) {
                resolveRound(true, "Glut-Gebläse Sieg");
            } else {
                resolveRound(null, "Unentschieden");
            }
        }
    }

    function resolveSplitRound() {
        isGameActive = false;
        let dScore = calculateHandValue(dealerHand);
        let activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || {};
        let hasBellows = !!activeUpgrades.bellows;

        let totalWinAmount = 0;
        let totalBetSpent = 0;
        let summaryParts = [];

        splitHands.forEach((sh, idx) => {
            totalBetSpent += sh.bet;
            let pScore = calculateHandValue(sh.hand);
            let handWin = 0;

            if (pScore > 21) {
                summaryParts.push(`Hand ${idx+1}: Overhit (Bust)`);
            } else if (dScore > 21 || pScore > dScore || (pScore === dScore && hasBellows)) {
                handWin = sh.bet * 2.0;
                totalWinAmount += handWin;
                summaryParts.push(`Hand ${idx+1}: Sieg (+${handWin.toFixed(2)} €)`);
            } else if (pScore === dScore) {
                handWin = sh.bet;
                totalWinAmount += handWin;
                summaryParts.push(`Hand ${idx+1}: Unentschieden (+${handWin.toFixed(2)} €)`);
            } else {
                summaryParts.push(`Hand ${idx+1}: Verloren`);
            }
        });

        if (totalWinAmount > 0) {
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(totalWinAmount);
            }
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('win_fanfare');
            }
        }

        tableStatus.style.color = totalWinAmount > totalBetSpent ? 'var(--color-gold)' : 'var(--color-cyan)';
        tableStatus.textContent = `⚔️ Split-Ergebnis: ${summaryParts.join(" | ")}`;

        // Quests & XP
        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay('blackjack', totalWinAmount, totalBetSpent, totalBetSpent > 0 ? (totalWinAmount / totalBetSpent) : 0);
        }
        if (totalWinAmount > totalBetSpent && window.AlchemistShared && window.AlchemistShared.progressQuest) {
            window.AlchemistShared.progressQuest('blackjack_wins', 1);
        }
        if (window.AlchemistShared && window.AlchemistShared.addXP) {
            window.AlchemistShared.addXP(30);
        }

        syncState();
        resetTable();
    }

    function resolveRound(status, reason) {
        isGameActive = false;
        
        let winAmount = 0;
        let msg = "";
        let color = "";

        let activePotions = JSON.parse(localStorage.getItem('alchemist_active_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
        let isFortunaActive = activePotions.fortuna > 0;

        if (status === true) {
            let mult = 2.0;
            let fortunaText = "";
            
            // Ace + 10-value initial hand is a natural 21 Blackjack
            if (playerHand.length === 2 && calculateHandValue(playerHand) === 21) {
                mult = 2.5; // Pays 3:2
                fortunaText = " (Natur-Gold 3:2!)";
            }

            if (reason === "Glut-Gebläse Sieg" && window.AlchemistShared) {
                window.AlchemistShared.showToast("🔥 Glut-Gebläse verwandelt Unentschieden in Sieg!", "info");
            }

            winAmount = betAmount * mult;
            if (isFortunaActive) {
                winAmount = parseFloat((winAmount * 1.20).toFixed(2));
                fortunaText += " (+20% Fortuna-Bonus!)";
            }

            msg = `🔥 Transmutation geglückt: ${reason}! Du gewinnst ${winAmount.toFixed(2)} €!${fortunaText}`;
            color = 'var(--color-gold)';
            
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(winAmount);
            }
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('win_fanfare');
            }

            if (window.AlchemistShared && window.AlchemistShared.progressQuest) {
                window.AlchemistShared.progressQuest('blackjack_wins', 1);
            }
        } else if (status === false) {
            msg = `💥 Transmutation misslungen: ${reason === "Bust" ? "Überhitzt (Bust > 21)!" : "Der Rektor hat bessere Metalle!"} Einsatz verloren.`;
            color = 'var(--color-danger)';
            
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('slots_spin');
            }
        } else {
            winAmount = betAmount;
            msg = `⚖️ Metalle im Gleichgewicht (Unentschieden). Einsatz von ${betAmount.toFixed(2)} € zurückerstattet.`;
            color = '#a99ec6';
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(winAmount);
            }
        }

        tableStatus.style.color = color;
        tableStatus.innerHTML = msg;

        // Record play & XP
        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay('blackjack', winAmount, betAmount, winAmount / betAmount);
        }
        if (window.AlchemistShared && window.AlchemistShared.addXP) {
            window.AlchemistShared.addXP(20 + Math.floor(betAmount / 5));
        }

        syncState();
        resetTable();
    }

    // UI RENDERERS
    function updateUI() {
        if (isSplit) {
            playerCardsContainer.innerHTML = '';
            splitHands.forEach((sh, idx) => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `flex: 1; padding: 8px; border: 1.5px ${idx === currentSplitIndex ? 'solid #ffd700' : 'dashed rgba(255,255,255,0.1)'}; border-radius: 6px; background: rgba(0,0,0,0.2);`;
                
                const score = calculateHandValue(sh.hand);
                wrapper.innerHTML = `<div style="font-size:0.75rem; color:#a99ec6; margin-bottom:5px;">Hand ${idx+1} (Wert: <strong style="color:#fff;">${score}</strong>)</div>`;
                
                const cardsFlex = document.createElement('div');
                cardsFlex.style.cssText = "display:flex; gap:6px; flex-wrap:wrap;";
                sh.hand.forEach(c => cardsFlex.appendChild(createCardDOM(c, false)));
                
                wrapper.appendChild(cardsFlex);
                playerCardsContainer.appendChild(wrapper);
            });
            playerScoreEl.textContent = `Split (${calculateHandValue(splitHands[0].hand)} | ${calculateHandValue(splitHands[1].hand)})`;
        } else {
            playerCardsContainer.innerHTML = '';
            playerHand.forEach(card => {
                playerCardsContainer.appendChild(createCardDOM(card, false));
            });
            let pScore = calculateHandValue(playerHand);
            playerScoreEl.textContent = pScore;
            if (pScore === 21) {
                playerScoreEl.className = 'hand-score score-gold';
            } else {
                playerScoreEl.className = 'hand-score';
            }
        }

        // Dealer hand
        dealerCardsContainer.innerHTML = '';
        dealerHand.forEach((card, idx) => {
            if (idx === 1 && !isDealerRevealed) {
                dealerCardsContainer.appendChild(createCardDOM(card, true));
            } else {
                dealerCardsContainer.appendChild(createCardDOM(card, false));
            }
        });

        let dScore = isDealerRevealed ? calculateHandValue(dealerHand) : calculateHandValue([dealerHand[0]]);
        dealerScoreEl.textContent = isDealerRevealed ? dScore : `${dScore} + ?`;
        if (dScore === 21 && isDealerRevealed) {
            dealerScoreEl.className = 'hand-score score-gold';
        } else {
            dealerScoreEl.className = 'hand-score';
        }
    }

    function createCardDOM(card, isHidden) {
        const div = document.createElement('div');
        if (isHidden) {
            div.className = 'alchemist-card hidden-card';
            return div;
        }

        div.className = `alchemist-card card-${card.style}`;
        div.innerHTML = `
            <div class="card-top">
                <span>${card.type}</span>
                <span>${card.symbol}</span>
            </div>
            <div class="card-center-symbol">${card.symbol}</div>
            <div class="card-bottom-name">${card.name}</div>
        `;
        return div;
    }
})();

