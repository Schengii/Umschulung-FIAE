(function () {
    let balance = 1000.00;
    let selectedChipVal = 5;
    let placedBets = {}; // Maps cellId to bet amount (e.g. { "num-17": 10 })
    let betHistory = []; // Stack of placed chips for Undo: [{ betId, amount }]
    let lastRoundBets = null; // Remembers previous round bets for Re-bet
    
    let isSpinning = false;
    let angle = 0;
    let angularVelocity = 0;
    let lastTickAngle = 0;
    
    // Wheel numbers layout order (standard European roulette wheel)
    const WHEEL_NUMBERS = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
        5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];

    const RUBEDO_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    
    // DOM Elements
    const balAmountEl = document.getElementById('balance-amount');
    const totalBetEl = document.getElementById('total-bet-amount');
    const btnSpin = document.getElementById('btn-spin');
    const btnClear = document.getElementById('btn-clear');
    const btnRebet = document.getElementById('btn-rebet');
    const btnDoubleBet = document.getElementById('btn-double-bet');
    const btnUndo = document.getElementById('btn-undo');
    const gameStatusText = document.getElementById('game-status-text');
    const canvas = document.getElementById('roulette-wheel');
    const historyContainer = document.getElementById('history-container');
    const numbersGrid = document.getElementById('numbers-grid-container');

    // Apply global themes
    if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
        window.AlchemistShared.applyCurrentTheme();
    }

    // INITIALIZATION
    syncState();
    buildBettingGrid();
    setupOutsideBetListeners();
    drawWheel();

    // Chip selectors
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedChipVal = parseInt(chip.getAttribute('data-val')) || 5;
        });
    });

    if (btnSpin) btnSpin.addEventListener('click', startSpin);
    if (btnClear) btnClear.addEventListener('click', clearBets);
    if (btnRebet) btnRebet.addEventListener('click', rebetLastBets);
    if (btnDoubleBet) btnDoubleBet.addEventListener('click', doubleCurrentBets);
    if (btnUndo) btnUndo.addEventListener('click', undoLastChip);

    function syncState() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        if (balAmountEl) {
            balAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        updateTotalBetDisplay();
        updateActionButtons();
    }

    function updateTotalBetDisplay() {
        let total = getTotalBetAmount();
        if (totalBetEl) {
            totalBetEl.textContent = total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    function getTotalBetAmount() {
        let total = 0;
        Object.keys(placedBets).forEach(k => { total += placedBets[k]; });
        return total;
    }

    function updateActionButtons() {
        const hasBets = getTotalBetAmount() > 0;
        const canRebet = !hasBets && lastRoundBets && Object.keys(lastRoundBets).length > 0;

        if (btnSpin) btnSpin.disabled = isSpinning;
        if (btnClear) btnClear.disabled = isSpinning || !hasBets;
        if (btnDoubleBet) btnDoubleBet.disabled = isSpinning || !hasBets;
        if (btnUndo) btnUndo.disabled = isSpinning || betHistory.length === 0;
        if (btnRebet) btnRebet.disabled = isSpinning || !canRebet;
    }

    // BUILD FELT NUMBERS GRID (3 rows x 12 columns)
    function buildBettingGrid() {
        if (!numbersGrid) return;
        numbersGrid.innerHTML = '';

        const row3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
        const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
        const row1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

        const rowsOrder = [row3, row2, row1];
        rowsOrder.forEach(rowArr => {
            rowArr.forEach(num => {
                const cell = document.createElement('div');
                const isRubedo = RUBEDO_NUMBERS.includes(num);
                cell.className = `bet-cell cell-num ${isRubedo ? 'rubedo' : 'albedo'}`;
                cell.setAttribute('data-bet', `num-${num}`);
                cell.innerHTML = `
                    <span class="num-lbl">${num}</span>
                    <div class="chip-on-cell hidden"></div>
                `;
                
                cell.addEventListener('click', () => handleCellClick(cell, `num-${num}`));
                numbersGrid.appendChild(cell);
            });
        });
    }

    function setupOutsideBetListeners() {
        document.querySelectorAll('.bet-cell').forEach(cell => {
            const betId = cell.getAttribute('data-bet');
            if (betId && !betId.startsWith('num-')) {
                cell.innerHTML = `${cell.textContent} <div class="chip-on-cell hidden"></div>`;
                cell.addEventListener('click', () => handleCellClick(cell, betId));
            }
        });
    }

    function handleCellClick(cell, betId) {
        if (isSpinning) return;

        if (balance < selectedChipVal) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            }
            return;
        }

        // Deduct balance
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-selectedChipVal);
        } else {
            balance -= selectedChipVal;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }

        placedBets[betId] = (placedBets[betId] || 0) + selectedChipVal;
        betHistory.push({ betId: betId, amount: selectedChipVal });
        
        syncState();
        refreshChipBadges();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
    }

    function undoLastChip() {
        if (isSpinning || betHistory.length === 0) return;

        const lastItem = betHistory.pop();
        if (!lastItem) return;

        placedBets[lastItem.betId] -= lastItem.amount;
        if (placedBets[lastItem.betId] <= 0) {
            delete placedBets[lastItem.betId];
        }

        // Refund balance
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(lastItem.amount);
        } else {
            balance += lastItem.amount;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }

        syncState();
        refreshChipBadges();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
    }

    function doubleCurrentBets() {
        if (isSpinning) return;

        const currentTotal = getTotalBetAmount();
        if (currentTotal === 0) return;

        if (balance < currentTotal) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold zum Verdoppeln!", "info");
            }
            return;
        }

        // Deduct additional total
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-currentTotal);
        } else {
            balance -= currentTotal;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }

        // Double each bet
        Object.keys(placedBets).forEach(betId => {
            const currentVal = placedBets[betId];
            placedBets[betId] *= 2;
            betHistory.push({ betId: betId, amount: currentVal });
        });

        syncState();
        refreshChipBadges();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('win_fanfare');
        }
    }

    function rebetLastBets() {
        if (isSpinning || !lastRoundBets || Object.keys(lastRoundBets).length === 0) return;

        let neededTotal = 0;
        Object.keys(lastRoundBets).forEach(k => { neededTotal += lastRoundBets[k]; });

        if (balance < neededTotal) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold für Wiederholung!", "info");
            }
            return;
        }

        clearBets();

        // Apply last bets
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-neededTotal);
        } else {
            balance -= neededTotal;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }

        placedBets = JSON.parse(JSON.stringify(lastRoundBets));
        betHistory = [];
        Object.keys(placedBets).forEach(betId => {
            betHistory.push({ betId: betId, amount: placedBets[betId] });
        });

        syncState();
        refreshChipBadges();

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('slots_stop');
        }
    }

    function clearBets() {
        if (isSpinning) return;

        let totalRefund = getTotalBetAmount();
        if (totalRefund > 0) {
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(totalRefund);
            } else {
                balance += totalRefund;
                localStorage.setItem('alchemist_balance', balance.toFixed(2));
            }
        }

        placedBets = {};
        betHistory = [];
        syncState();
        refreshChipBadges();
    }

    function refreshChipBadges() {
        document.querySelectorAll('.bet-cell').forEach(cell => {
            const betId = cell.getAttribute('data-bet');
            const badge = cell.querySelector('.chip-on-cell');
            if (badge) {
                if (betId && placedBets[betId] > 0) {
                    badge.classList.remove('hidden');
                    badge.textContent = placedBets[betId];
                } else {
                    badge.classList.add('hidden');
                    badge.textContent = '';
                }
            }
        });
    }

    function clearWinningHighlights() {
        document.querySelectorAll('.bet-cell').forEach(cell => {
            cell.classList.remove('winning-cell');
        });
    }

    // DRAW THE WHEEL ON CANVAS
    function drawWheel(ballAngle = null) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = cx - 12;

        ctx.clearRect(0, 0, w, h);

        // Draw Outer Rim
        ctx.beginPath();
        ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = "#1e1330";
        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        ctx.lineWidth = 6;
        ctx.fill();
        ctx.stroke();

        const numSegments = WHEEL_NUMBERS.length;
        const arc = (Math.PI * 2) / numSegments;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Draw sectors
        for (let i = 0; i < numSegments; i++) {
            const startAng = i * arc;
            const endAng = startAng + arc;
            const num = WHEEL_NUMBERS[i];

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAng, endAng);
            ctx.closePath();
            
            if (num === 0) {
                ctx.fillStyle = "#065f46"; // Nigredo
            } else if (RUBEDO_NUMBERS.includes(num)) {
                ctx.fillStyle = "#991b1b"; // Rubedo
            } else {
                ctx.fillStyle = "#1e293b"; // Albedo
            }
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label
            ctx.save();
            ctx.rotate(startAng + arc / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 11px Outfit, sans-serif";
            ctx.fillText(num, r - 15, 0);
            ctx.restore();
        }

        // Inner Brass Cone
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.fillStyle = "#3b2314";
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Draw Ball if spinning/positioned
        if (ballAngle !== null) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ballAngle);
            ctx.beginPath();
            ctx.arc(r - 35, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#ffffff";
            ctx.fill();
            ctx.restore();
        }
    }

    // GAME CONTROLLER
    function startSpin() {
        if (isSpinning) return;

        const totalPlaced = getTotalBetAmount();
        if (totalPlaced === 0) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Platziere zuerst Einsätze!", "info");
            }
            return;
        }

        // Save last bets for Re-bet
        lastRoundBets = JSON.parse(JSON.stringify(placedBets));

        isSpinning = true;
        clearWinningHighlights();
        updateActionButtons();

        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.7, 95);
        }

        // Determine winning number early so deceleration aligns naturally
        let hasMagnet = window.AlchemistShared && window.AlchemistShared.hasUpgrade('magnet');
        let chosenWinner = null;
        
        if (hasMagnet) {
            let straightBets = Object.keys(placedBets).filter(k => k.startsWith('num-')).map(k => parseInt(k.replace('num-', '')));
            if (straightBets.length > 0 && Math.random() < 0.15) {
                chosenWinner = straightBets[Math.floor(Math.random() * straightBets.length)];
            }
        }

        if (chosenWinner === null) {
            chosenWinner = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
        }

        // Calculate exact stop angle on wheel
        const winnerIndexOnWheel = WHEEL_NUMBERS.indexOf(chosenWinner);
        const arc = (Math.PI * 2) / WHEEL_NUMBERS.length;
        const extraRotations = 4 + Math.floor(Math.random() * 2);
        const targetWheelAngle = angle + (extraRotations * Math.PI * 2) + (winnerIndexOnWheel * arc);

        lastTickAngle = angle;
        
        let spinDuration = 3500; // 3.5s spin
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            let elapsed = timestamp - startTime;
            let progress = Math.min(1.0, elapsed / spinDuration);
            
            // Ease out cubic physics
            let easeProgress = 1 - Math.pow(1 - progress, 3);
            angle = targetWheelAngle * easeProgress;

            let ballAngle = -angle * 1.8;

            // Tick sound on slice crossing
            const sliceAngle = (Math.PI * 2) / WHEEL_NUMBERS.length;
            let currentSliceStep = Math.floor(angle / sliceAngle);
            let lastSliceStep = Math.floor(lastTickAngle / sliceAngle);

            if (currentSliceStep !== lastSliceStep) {
                if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                    window.AlchemistShared.playProceduralSound('roulette_tick');
                }
                lastTickAngle = angle;
            }

            drawWheel(ballAngle);

            if (progress < 1.0) {
                requestAnimationFrame(animate);
            } else {
                drawWheel(0);
                evaluatePayouts(chosenWinner);
            }
        }

        requestAnimationFrame(animate);
    }

    function evaluatePayouts(winnerNum) {
        let totalWin = 0;
        let isRubedo = RUBEDO_NUMBERS.includes(winnerNum);
        let isAlbedo = winnerNum !== 0 && !isRubedo;
        
        Object.keys(placedBets).forEach(betId => {
            let betAmt = placedBets[betId];
            if (betId.startsWith('num-')) {
                let num = parseInt(betId.replace('num-', ''));
                if (num === winnerNum) {
                    totalWin += betAmt * 36;
                }
            } else if (betId === 'outside-rubedo' && isRubedo) {
                totalWin += betAmt * 2;
            } else if (betId === 'outside-albedo' && isAlbedo) {
                totalWin += betAmt * 2;
            } else if (betId === 'outside-even' && winnerNum !== 0 && winnerNum % 2 === 0) {
                totalWin += betAmt * 2;
            } else if (betId === 'outside-odd' && winnerNum !== 0 && winnerNum % 2 !== 0) {
                totalWin += betAmt * 2;
            } else if (betId === 'outside-low' && winnerNum >= 1 && winnerNum <= 18) {
                totalWin += betAmt * 2;
            } else if (betId === 'outside-high' && winnerNum >= 19 && winnerNum <= 36) {
                totalWin += betAmt * 2;
            } else if (betId === 'dozen-1' && winnerNum >= 1 && winnerNum <= 12) {
                totalWin += betAmt * 3;
            } else if (betId === 'dozen-2' && winnerNum >= 13 && winnerNum <= 24) {
                totalWin += betAmt * 3;
            } else if (betId === 'dozen-3' && winnerNum >= 25 && winnerNum <= 36) {
                totalWin += betAmt * 3;
            } else if (betId === 'col-1' && winnerNum !== 0 && winnerNum % 3 === 1) {
                totalWin += betAmt * 3;
            } else if (betId === 'col-2' && winnerNum !== 0 && winnerNum % 3 === 2) {
                totalWin += betAmt * 3;
            } else if (betId === 'col-3' && winnerNum !== 0 && winnerNum % 3 === 0) {
                totalWin += betAmt * 3;
            }
        });

        // Apply Fortuna Potion bonus (+20%)
        let activePotions = JSON.parse(localStorage.getItem('alchemist_active_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
        let isFortunaActive = activePotions.fortuna > 0;
        let fortunaBonusText = "";

        if (totalWin > 0 && isFortunaActive) {
            totalWin = parseFloat((totalWin * 1.20).toFixed(2));
            fortunaBonusText = " (+20% Fortuna-Bonus!)";
        }

        let totalBet = getTotalBetAmount();
        let colorName = winnerNum === 0 ? "Nigredo (Grün)" : (isRubedo ? "Rubedo (Rot)" : "Albedo (Silber)");
        let resultMsg = "";
        let color = "";

        if (totalWin > 0) {
            resultMsg = `✨ Kugel landet auf ${winnerNum} (${colorName})! Auszahlung: +${totalWin.toFixed(2)} €!${fortunaBonusText}`;
            color = 'var(--color-gold)';
            if (window.AlchemistShared && window.AlchemistShared.addBalance) {
                window.AlchemistShared.addBalance(totalWin);
            }
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('win_fanfare');
            }
        } else {
            resultMsg = `💨 Kugel landet auf ${winnerNum} (${colorName})! Keine Treffer erzielt.`;
            color = 'var(--color-danger)';
        }

        gameStatusText.style.color = color;
        gameStatusText.textContent = resultMsg;

        // Highlight winning cells on felt
        highlightWinningCellsOnFelt(winnerNum, isRubedo, isAlbedo);

        // Add history badge
        addHistoryBadge(winnerNum, isRubedo);

        // Record play inside alchemist engine
        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay('classic_roulette', totalWin, totalBet, totalBet > 0 ? (totalWin / totalBet) : 0);
        }

        // Progress Quest & XP
        if (window.AlchemistShared && window.AlchemistShared.progressQuest) {
            window.AlchemistShared.progressQuest('roulette_spins', 1);
        }
        if (window.AlchemistShared && window.AlchemistShared.addXP) {
            window.AlchemistShared.addXP(20 + Math.floor(totalBet / 5));
        }

        // Reset bets placed on board
        placedBets = {};
        betHistory = [];
        refreshChipBadges();

        isSpinning = false;
        syncState();

        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.1, 60);
        }
    }

    function highlightWinningCellsOnFelt(winnerNum, isRubedo, isAlbedo) {
        const winningNumCell = document.querySelector(`.bet-cell[data-bet="num-${winnerNum}"]`);
        if (winningNumCell) winningNumCell.classList.add('winning-cell');

        if (isRubedo) {
            const rubCell = document.querySelector('.bet-cell[data-bet="outside-rubedo"]');
            if (rubCell) rubCell.classList.add('winning-cell');
        }
        if (isAlbedo) {
            const albCell = document.querySelector('.bet-cell[data-bet="outside-albedo"]');
            if (albCell) albCell.classList.add('winning-cell');
        }
        if (winnerNum !== 0 && winnerNum % 2 === 0) {
            const evenCell = document.querySelector('.bet-cell[data-bet="outside-even"]');
            if (evenCell) evenCell.classList.add('winning-cell');
        }
        if (winnerNum !== 0 && winnerNum % 2 !== 0) {
            const oddCell = document.querySelector('.bet-cell[data-bet="outside-odd"]');
            if (oddCell) oddCell.classList.add('winning-cell');
        }
    }

    function addHistoryBadge(winnerNum, isRubedo) {
        if (!historyContainer) return;
        
        const badge = document.createElement('div');
        let styleClass = winnerNum === 0 ? 'nigredo' : (isRubedo ? 'rubedo' : 'albedo');
        badge.className = `history-badge ${styleClass}`;
        badge.textContent = winnerNum;

        historyContainer.insertBefore(badge, historyContainer.firstChild);

        if (historyContainer.children.length > 7) {
            historyContainer.removeChild(historyContainer.lastChild);
        }
    }
})();

