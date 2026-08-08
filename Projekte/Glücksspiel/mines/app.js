/* ==========================================================================
   ALCHEMISTEN-AKADEMIE: RUNEN-MINEN CORE GAME LOGIC (mines/app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFS ---
    const betInput = document.getElementById('bet-input');
    const minesSlider = document.getElementById('mines-count-input');
    const minesDisplay = document.getElementById('mines-count-display');
    const btnStart = document.getElementById('btn-start');
    const btnCashout = document.getElementById('btn-cashout');
    const cashoutPreview = document.getElementById('cashout-preview');
    const gameStatusText = document.getElementById('game-status-text');
    const minesGrid = document.getElementById('mines-grid');
    const multiplierList = document.getElementById('multiplier-list');
    const gridOverlay = document.getElementById('grid-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlaySubtitle = document.getElementById('overlay-subtitle');
    const btnOverlayClose = document.getElementById('btn-overlay-close');
    const historyListContainer = document.getElementById('history-list');
    const riskSummaryValue = document.getElementById('risk-value');
    const riskSummaryTip = document.getElementById('risk-tip');

    // Modals
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnMute = document.getElementById('btn-mute');

    // Presets
    const btnMin = document.getElementById('btn-bet-min');
    const btnHalf = document.getElementById('btn-bet-half');
    const btnDouble = document.getElementById('btn-bet-double');
    const btnMax = document.getElementById('btn-bet-max');

    // --- GAME STATE ---
    let playing = false;
    let betAmount = 10.00;
    let minesCount = 3;
    let minePositions = []; // Array of indices (0-24)
    let revealedTiles = []; // Array of boolean
    let stepsClicked = 0;
    let currentMultiplier = 1.00;
    
    // Alchemical symbols to display on safe tiles
    const ALCHEMICAL_SYMBOLS = ['🔮', '🧪', '🌟', '📜', '💠', '⚕️', '🔱', '🜔', '🜕', '🜁', '🜄', '🜂', '🜃'];

    function formatCurrency(value) {
        return Number(value || 0).toFixed(2);
    }

    function sanitizeBetInput() {
        const rawValue = parseFloat(betInput.value);
        if (Number.isNaN(rawValue) || rawValue <= 0) {
            betAmount = 10;
            betInput.value = formatCurrency(betAmount);
            return betAmount;
        }

        const clamped = Math.min(500, Math.max(1, Math.round(rawValue * 100) / 100));
        betAmount = clamped;
        betInput.value = formatCurrency(betAmount);
        return betAmount;
    }

    function updateRiskSummary() {
        const safeTiles = Math.max(0, 25 - minesCount);
        const chanceToStaySafe = safeTiles > 0 ? ((safeTiles / 25) * 100).toFixed(1) : '0.0';
        if (riskSummaryValue) {
            riskSummaryValue.textContent = `~ ${chanceToStaySafe}%`;
        }
        if (riskSummaryTip) {
            riskSummaryTip.textContent = `${minesCount} instabile Runen · ${safeTiles} sichere Runen`;
        }
    }

    // --- MATH HELPERS ---
    function binomialCoeff(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }

    function getMultiplier(mines, steps) {
        let waysTotal = binomialCoeff(25, steps);
        let waysSafe = binomialCoeff(25 - mines, steps);
        if (waysSafe === 0) return 0;
        let mult = (0.97 * (waysTotal / waysSafe)); // 3% house edge
        return Math.max(1.01, parseFloat(mult.toFixed(2)));
    }

    // --- UI UPDATERS ---
    function updateMinesDisplay() {
        minesCount = parseInt(minesSlider.value);
        minesDisplay.textContent = minesCount;
        updateRiskSummary();
        if (!playing) {
            renderMultiplierList();
        }
    }

    function renderMultiplierList() {
        multiplierList.innerHTML = '';
        const maxSteps = 25 - minesCount;
        
        // Show up to 12 steps or all if short
        const stepsToShow = Math.min(maxSteps, 12);
        for (let i = 1; i <= stepsToShow; i++) {
            const mult = getMultiplier(minesCount, i);
            const item = document.createElement('div');
            item.className = 'multiplier-item';
            item.id = `mult-step-${i}`;
            
            if (playing && stepsClicked === i) {
                item.classList.add('active');
            } else if (playing && stepsClicked + 1 === i) {
                item.classList.add('next');
            }

            item.innerHTML = `
                <span class="multiplier-step">Schritt ${i}</span>
                <span class="multiplier-val">${mult.toFixed(2)}x</span>
            `;
            multiplierList.appendChild(item);
            
            // Auto-scroll to active or next element within the panel
            if (playing && (stepsClicked === i || stepsClicked + 1 === i)) {
                setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
            }
        }

        if (maxSteps > 12) {
            const dots = document.createElement('div');
            dots.style.textAlign = 'center';
            dots.style.color = '#a99ec6';
            dots.style.fontSize = '0.8rem';
            dots.style.padding = '5px 0';
            dots.textContent = `... (+${maxSteps - 12} weitere Stufen)`;
            multiplierList.appendChild(dots);
        }
    }

    // --- GAME ENGINE ---
    function initGrid() {
        minesGrid.innerHTML = '';
        revealedTiles = Array(25).fill(false);
        
        for (let i = 0; i < 25; i++) {
            const tile = document.createElement('button');
            tile.className = 'mine-tile';
            tile.setAttribute('data-index', i);
            tile.setAttribute('type', 'button');
            
            const rune = document.createElement('span');
            rune.className = 'rune-symbol';
            rune.textContent = '🜁'; // Default generic rune placeholder
            tile.appendChild(rune);

            tile.tabIndex = 0;
            tile.setAttribute('aria-label', `Runenfeld ${i + 1}`);
            tile.addEventListener('click', () => handleTileClick(i));
            tile.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    event.preventDefault();
                    handleTileClick(i);
                }
            });
            minesGrid.appendChild(tile);
        }
    }

    function generateMines() {
        minePositions = [];
        while (minePositions.length < minesCount) {
            let rand = Math.floor(Math.random() * 25);
            if (!minePositions.includes(rand)) {
                minePositions.push(rand);
            }
        }
    }

    function handleTileClick(index) {
        if (!playing || revealedTiles[index]) return;
        
        revealedTiles[index] = true;
        const tile = minesGrid.children[index];
        tile.classList.add('revealed');

        if (minePositions.includes(index)) {
            // Check Aegis Potion protection
            let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
            if (activePotions && activePotions.aegis > 0) {
                // Prevent explosion!
                tile.classList.add('safe');
                minePositions = minePositions.filter(p => p !== index);
                
                const symbol = ALCHEMICAL_SYMBOLS[Math.floor(Math.random() * ALCHEMICAL_SYMBOLS.length)];
                tile.querySelector('.rune-symbol').textContent = symbol;
                tile.style.boxShadow = '0 0 15px #ffd700, 0 0 5px #ffd700 inset';
                tile.style.borderColor = '#ffd700';

                stepsClicked++;

                if (window.AlchemistShared && window.AlchemistShared.playBounceNote) {
                    window.AlchemistShared.playBounceNote(stepsClicked / (25 - minesCount));
                }

                // Consume Aegis Potion
                activePotions.aegis = 0;
                localStorage.setItem('alchemist_active_potions', JSON.stringify(activePotions));
                if (window.AlchemistShared && window.AlchemistShared.injectFloatingPotionHUD) {
                    window.AlchemistShared.injectFloatingPotionHUD();
                }
                
                if (window.AlchemistShared && window.AlchemistShared.showToast) {
                    window.AlchemistShared.showToast("🛡️ Aegis-Elixier hat die Explosion absorbiert!", "quest-complete");
                }

                currentMultiplier = getMultiplier(minesCount, stepsClicked);
                btnCashout.removeAttribute('disabled');
                cashoutPreview.textContent = (betAmount * currentMultiplier).toFixed(2) + " €";
                gameStatusText.textContent = `Aegis geschützt! (${currentMultiplier.toFixed(2)}x)`;

                renderMultiplierList();

                if (stepsClicked === 25 - minesCount) {
                    cashout();
                }
                return;
            }

            // EXPLOSION / HIT A MINE
            tile.classList.add('mine');
            tile.querySelector('.rune-symbol').textContent = '💥';
            
            // Play explosion boom using procedural synth
            playProceduralSound('explosion');
            
            gameOver(false);
        } else {
            // SAFE RUNES
            tile.classList.add('safe');
            const symbol = ALCHEMICAL_SYMBOLS[Math.floor(Math.random() * ALCHEMICAL_SYMBOLS.length)];
            tile.querySelector('.rune-symbol').textContent = symbol;

            stepsClicked++;
            
            // Dynamic pentatonic scale progress chime
            const pitchFactor = stepsClicked / (25 - minesCount);
            if (window.AlchemistShared && window.AlchemistShared.playBounceNote) {
                window.AlchemistShared.playBounceNote(pitchFactor);
            }

            // Update quest progress
            if (window.AlchemistShared && window.AlchemistShared.progressQuest) {
                window.AlchemistShared.progressQuest('mines_safe', 1);
            }

            // Calculate multiplier
            currentMultiplier = getMultiplier(minesCount, stepsClicked);
            btnCashout.removeAttribute('disabled');
            cashoutPreview.textContent = (betAmount * currentMultiplier).toFixed(2) + " €";
            gameStatusText.textContent = `${stepsClicked} Rune(n) sicher aufgedeckt (${currentMultiplier.toFixed(2)}x)`;

            renderMultiplierList();

            // Check if all safe tiles are opened
            if (stepsClicked === 25 - minesCount) {
                cashout();
            }
        }
    }

    function startGame() {
        let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        betAmount = sanitizeBetInput();

        if (betAmount > balance) {
            gameStatusText.textContent = 'Nicht genug Guthaben für diesen Einsatz.';
            return;
        }

        // Deduct bet
        if (window.AlchemistShared) {
            window.AlchemistShared.addBalance(-betAmount);
        }

        playing = true;
        stepsClicked = 0;
        currentMultiplier = 1.00;
        
        minesSlider.setAttribute('disabled', 'true');
        betInput.setAttribute('disabled', 'true');
        btnStart.classList.add('hidden');
        btnCashout.classList.remove('hidden');
        btnCashout.setAttribute('disabled', 'true');
        gridOverlay.classList.remove('show');
        gridOverlay.classList.add('hidden');
        
        // Set initial preview to the chosen bet amount instead of 0.00
        cashoutPreview.textContent = betAmount.toFixed(2) + " €";
        gameStatusText.textContent = `Einsatz ${betAmount.toFixed(2)} € · ${minesCount} instabile Runen`;

        initGrid();
        generateMines();
        renderMultiplierList();
        updateRiskSummary();
        
        // Apply Runen-Detektor passive upgrade (reveals 1 safe tile at start)
        let safeRevealCount = 0;
        if (window.AlchemistShared && window.AlchemistShared.hasUpgrade('detector')) {
            safeRevealCount++;
        }
        if (window.AlchemistShared && window.AlchemistShared.hasRecipe('master_rune')) {
            safeRevealCount++;
        }

        if (safeRevealCount > 0) {
            let safeIndexes = [];
            for (let i = 0; i < 25; i++) {
                if (!minePositions.includes(i) && !revealedTiles[i]) safeIndexes.push(i);
            }
            
            let actuallyRevealed = 0;
            for (let r = 0; r < safeRevealCount; r++) {
                if (safeIndexes.length > 0) {
                    let randomIndexInList = Math.floor(Math.random() * safeIndexes.length);
                    let randomSafeIndex = safeIndexes[randomIndexInList];
                    safeIndexes.splice(randomIndexInList, 1);
                    
                    revealedTiles[randomSafeIndex] = true;
                    const tile = minesGrid.children[randomSafeIndex];
                    tile.classList.add('revealed', 'safe');
                    const symbol = ALCHEMICAL_SYMBOLS[Math.floor(Math.random() * ALCHEMICAL_SYMBOLS.length)];
                    tile.querySelector('.rune-symbol').textContent = symbol;
                    tile.style.boxShadow = '0 0 12px var(--color-cyan, #00f0ff)';
                    actuallyRevealed++;
                }
            }
            if (actuallyRevealed > 0) {
                stepsClicked = actuallyRevealed;
                currentMultiplier = getMultiplier(minesCount, stepsClicked);
                btnCashout.removeAttribute('disabled');
                cashoutPreview.textContent = (betAmount * currentMultiplier).toFixed(2) + " €";
                
                let text = "Detektor";
                if (safeRevealCount === 2) text = "Detektor & Meister-Rune haben";
                else if (safeRevealCount === 1 && window.AlchemistShared && window.AlchemistShared.hasRecipe('master_rune')) text = "Meister-Rune hat";
                else text = "Detektor hat";
                
                gameStatusText.textContent = `${text} ${actuallyRevealed} sichere Rune(n) aufgedeckt! (${currentMultiplier.toFixed(2)}x)`;
                renderMultiplierList();
            }
        }
        
        // Intensity raised for active play
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.5, 75);
        }
    }

    function cashout() {
        if (!playing) return;
        gameOver(true);
    }

    function gameOver(isWin) {
        playing = false;
        
        minesSlider.removeAttribute('disabled');
        betInput.removeAttribute('disabled');
        btnStart.classList.remove('hidden');
        btnCashout.classList.add('hidden');

        // Reveal everything and lock interactions
        for (let i = 0; i < 25; i++) {
            const tile = minesGrid.children[i];
            tile.setAttribute('disabled', 'true');
            
            if (minePositions.includes(i)) {
                tile.classList.add('mine');
                tile.querySelector('.rune-symbol').textContent = '💥';
            } else if (!revealedTiles[i]) {
                tile.style.opacity = '0.5';
                tile.querySelector('.rune-symbol').textContent = '✨';
            }
        }

        let finalWin = 0;
        if (isWin) {
            finalWin = betAmount * currentMultiplier;
            gameStatusText.textContent = `Runde abgeschlossen · ${currentMultiplier.toFixed(2)}x`;
            
            // Play success chime
            playProceduralSound('success');

            // Add XP & check master_rune recipe
            const xpEarned = Math.max(5, Math.round(5 * currentMultiplier));
            if (window.AlchemistShared) {
                window.AlchemistShared.addXP(xpEarned);
                window.AlchemistShared.progressQuest('mines_mult', currentMultiplier);
                
                if (stepsClicked >= 10) {
                    window.AlchemistShared.unlockRecipe('master_rune');
                }
                
                if (window.AlchemistShared.progressLegendaryQuest) {
                    window.AlchemistShared.progressLegendaryQuest('mines_legendary', stepsClicked);
                }
            }

            // Trigger double or nothing gamble
            setTimeout(() => {
                if (window.AlchemistShared && window.AlchemistShared.triggerGamble) {
                    window.AlchemistShared.triggerGamble(finalWin, (gambleResult) => {
                        saveGameResult(gambleResult, true);
                    });
                } else {
                    saveGameResult(finalWin, true);
                }
            }, 600);
        } else {
            gameStatusText.textContent = 'Kessel explodiert · Einsatz verloren';
            saveGameResult(0, false);
        }

        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.1, 60);
        }
    }

    function saveGameResult(winAmount, isWinRound) {
        if (winAmount > 0) {
            if (window.AlchemistShared) {
                window.AlchemistShared.addBalance(winAmount);
            }
            showOverlay(true, winAmount);
        } else {
            showOverlay(false, 0);
        }

        // Add history badge
        const badge = document.createElement('div');
        badge.className = `history-badge ${winAmount > 0 ? 'win' : 'loss'}`;
        badge.textContent = winAmount > 0 ? `${(winAmount / betAmount).toFixed(2)}x · +${winAmount.toFixed(2)} €` : '💥';
        
        if (historyListContainer.querySelector('.history-empty')) {
            historyListContainer.innerHTML = '';
        }
        historyListContainer.insertBefore(badge, historyListContainer.firstChild);

        // Keep history to 6 entries max
        while (historyListContainer.children.length > 6) {
            historyListContainer.removeChild(historyListContainer.lastChild);
        }

        // Save stat history via central engine
        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            let mult = betAmount > 0 ? winAmount / betAmount : 1.00;
            window.AlchemistShared.recordPlay('mines', winAmount, betAmount, mult);
        }
    }

    function showOverlay(win, amount) {
        gridOverlay.classList.remove('hidden');
        // Small layout forced reflow to support smooth transition
        void gridOverlay.offsetWidth; 
        gridOverlay.classList.add('show');

        if (win) {
            overlayTitle.textContent = "GEWINN GESICHERT!";
            overlayTitle.className = "overlay-title win";
            overlaySubtitle.innerHTML = `Du hast deine Essenzen abgefüllt.<br><strong style="color:var(--color-cyan); font-size: 1.25rem;">+${amount.toFixed(2)} €</strong>`;
        } else {
            overlayTitle.textContent = "KESSEL EXPLODIERT!";
            overlayTitle.className = "overlay-title loss";
            overlaySubtitle.textContent = "Eine Spreng-Rune wurde ausgelöst. Dein Einsatz ist verpufft.";
        }
    }

    function hideOverlay() {
        gridOverlay.classList.remove('show');
        setTimeout(() => {
            gridOverlay.classList.add('hidden');
            initGrid();
            renderMultiplierList();
            gameStatusText.textContent = "Bereit für die nächste Runde";
        }, 300);
    }

    // --- PROCEDURAL AUDIO HELPERS ---
    function playProceduralSound(type) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        
        if (localStorage.getItem('alchemist_muted') === 'true') return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;

        try {
            const ctx = new AudioContextClass();
            // Resume AudioContext handling for modern browser security policies
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            if (type === 'success') {
                let now = ctx.currentTime;
                let notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    let o = ctx.createOscillator();
                    let g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.08);
                    g.gain.setValueAtTime(0, now);
                    g.gain.linearRampToValueAtTime(0.08 * volumeSFX, now + idx * 0.08 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(now + idx * 0.08);
                    o.stop(now + idx * 0.08 + 0.45);
                });
            } else if (type === 'explosion') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(120, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
                
                gain.gain.setValueAtTime(0.3 * volumeSFX, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.65);
            }
        } catch(e) {
            console.warn("Procedural audio failed to play:", e);
        }
    }

    // --- EVENT BINDINGS ---
    minesSlider.addEventListener('input', updateMinesDisplay);
    betInput.addEventListener('input', sanitizeBetInput);
    betInput.addEventListener('change', sanitizeBetInput);
    btnStart.addEventListener('click', startGame);
    btnCashout.addEventListener('click', cashout);
    btnOverlayClose.addEventListener('click', hideOverlay);

    // Bet presets
    btnMin.addEventListener('click', () => {
        betInput.value = "1.00";
        sanitizeBetInput();
    });
    btnHalf.addEventListener('click', () => {
        let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        betInput.value = Math.max(1, Math.round(balance / 2)).toFixed(2);
        sanitizeBetInput();
    });
    btnDouble.addEventListener('click', () => {
        betInput.value = (Math.min(500, parseFloat(betInput.value) * 2 || 10)).toFixed(2);
        sanitizeBetInput();
    });
    btnMax.addEventListener('click', () => {
        let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        betInput.value = Math.min(500, balance).toFixed(2);
        sanitizeBetInput();
    });

    // Instructions modal
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.add('hidden');
    });

    // Mute button logic
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    function updateMuteBtn() {
        if (isMuted) {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
            btnMute.style.color = 'var(--color-danger)';
        } else {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
            btnMute.style.color = 'var(--text-secondary)';
        }
    }
    btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('alchemist_muted', isMuted);
        updateMuteBtn();
    });

    // Init Page Run
    updateMuteBtn();
    initGrid();
    updateMinesDisplay();
});