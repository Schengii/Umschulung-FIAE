/* ==========================================================================
   ATHANOR-WÜRFELN: CORE GAME CONTROLLER (dice/app.js)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFS ---
    const balanceAmountEl = document.getElementById('balance-amount');
    const xpLevelNumEl = document.getElementById('xp-level-num');
    const xpCurrentValEl = document.getElementById('xp-current-val');
    const xpTargetValEl = document.getElementById('xp-target-val');
    const xpBarFill = document.getElementById('xp-bar-fill');
    
    const betInput = document.getElementById('bet-input');
    const btnBetMin = document.getElementById('btn-bet-min');
    const btnBetHalf = document.getElementById('btn-bet-half');
    const btnBetDouble = document.getElementById('btn-bet-double');
    const btnBetMax = document.getElementById('btn-bet-max');
    
    const btnModeDuel = document.getElementById('btn-mode-duel');
    const btnModePredict = document.getElementById('btn-mode-predict');
    const paneDuel = document.getElementById('pane-duel');
    const panePredict = document.getElementById('pane-predict');
    
    const predictionBtns = document.querySelectorAll('.predict-btn');
    const btnRoll = document.getElementById('btn-roll');
    const gameStatusText = document.getElementById('game-status-text');
    
    const duelArena = document.getElementById('duel-arena');
    const predictArena = document.getElementById('predict-arena');
    const gridOverlay = document.getElementById('grid-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlaySubtitle = document.getElementById('overlay-subtitle');
    const btnOverlayClose = document.getElementById('btn-overlay-close');
    
    const playerSumEl = document.getElementById('player-sum');
    const rectorSumEl = document.getElementById('rector-sum');
    const predictSumEl = document.getElementById('predict-sum');
    
    const statRoundsEl = document.getElementById('stat-rounds');
    const statWinsEl = document.getElementById('stat-wins');
    const statWinrateEl = document.getElementById('stat-winrate');
    const historyListContainer = document.getElementById('history-list');
    
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnMute = document.getElementById('btn-mute');

    // --- GAME STATE ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let betAmount = 10.00;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    
    let playMode = 'duel'; // duel, predict
    let activePrediction = null; // under, seven, over
    let isRolling = false;
    
    // Web Audio Context
    let audioCtx = null;

    // 3D Dice Rotations Map for Face Values (points to user)
    const DICE_ROTATIONS = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: 180 },
        3: { x: 0, y: -90 },
        4: { x: 0, y: 90 },
        5: { x: -90, y: 0 },
        6: { x: 90, y: 0 }
    };

    // --- INITIALIZATION ---
    function init() {
        updateHUD();
        updateMuteBtn();
        loadDiceStats();
        
        // Intensity check for sound ambient
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(0.2, 60);
        }

        // Add listeners
        btnStartInteractions();
    }

    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.body.addEventListener('click', initAudio, { once: true });

    function btnStartInteractions() {
        // Bet Presets
        betInput.addEventListener('input', validateBetInput);
        betInput.addEventListener('change', validateBetInput);
        btnBetMin.addEventListener('click', () => setBet(1.00));
        btnBetHalf.addEventListener('click', () => setBet(Math.max(1.00, betAmount / 2)));
        btnBetDouble.addEventListener('click', () => setBet(Math.min(500, betAmount * 2)));
        btnBetMax.addEventListener('click', () => setBet(Math.min(500, balance)));

        // Mode Switching
        btnModeDuel.addEventListener('click', () => switchMode('duel'));
        btnModePredict.addEventListener('click', () => switchMode('predict'));

        // Prediction buttons
        predictionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isRolling) return;
                predictionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activePrediction = btn.getAttribute('data-predict');
                playProceduralSound('click');
            });
        });

        // Roll Action
        btnRoll.addEventListener('click', startRoll);
        btnOverlayClose.addEventListener('click', hideOverlay);

        // Modal triggers
        btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
        btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
        });

        // Mute toggle
        btnMute.addEventListener('click', toggleMute);
    }

    // --- BET HANDLING ---
    function setBet(amount) {
        if (isRolling) return;
        betAmount = parseFloat(amount);
        if (betAmount > balance) betAmount = balance;
        if (betAmount < 1.00) betAmount = 1.00;
        betInput.value = betAmount.toFixed(2);
        validateBetInput();
    }

    // --- VALIDATION ---
    function validateBetInput() {
        let val = parseFloat(betInput.value);
        if (isNaN(val) || val < 1.00) {
            val = 1.00;
        } else if (val > balance) {
            val = balance;
        } else if (val > 500) {
            val = 500;
        }
        betAmount = val;
        betInput.value = betAmount.toFixed(2);
    }

    // --- MODE NAVIGATION ---
    function switchMode(mode) {
        if (isRolling) return;
        playMode = mode;
        playProceduralSound('click');

        if (mode === 'duel') {
            btnModeDuel.classList.add('active');
            btnModePredict.classList.remove('active');
            paneDuel.classList.remove('hidden');
            panePredict.classList.add('hidden');
            duelArena.classList.remove('hidden');
            predictArena.classList.add('hidden');
            gameStatusText.textContent = "Bereit fürs Elementen-Duell";
        } else {
            btnModePredict.classList.add('active');
            btnModeDuel.classList.remove('active');
            panePredict.classList.remove('hidden');
            paneDuel.classList.add('hidden');
            predictArena.classList.remove('hidden');
            duelArena.classList.add('hidden');
            
            // Auto-select Under 7 by default if nothing selected
            if (!activePrediction) {
                document.getElementById('btn-predict-under').click();
            }
            gameStatusText.textContent = "Wähle deine Vorhersage";
        }
    }

    // --- STATE SYNC & STATS ---
    function updateHUD() {
        if (window.AlchemistShared) {
            // Write directly to local storage so shared syncs it
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
            balanceAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            level = parseInt(localStorage.getItem('alchemist_level')) || 1;
            xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
            
            xpLevelNumEl.textContent = level;
            xpCurrentValEl.textContent = xp;
            xpTargetValEl.textContent = level * 500;
            xpBarFill.style.width = `${(xp / (level * 500)) * 100}%`;
        }
    }

    function addXP(amount) {
        if (window.AlchemistShared) {
            window.AlchemistShared.addXP(amount);
        }
        updateHUD();
    }

    function loadDiceStats() {
        let statsObj = JSON.parse(localStorage.getItem('alchemist_stats')) || {};
        let diceStats = statsObj.dice || { rounds: 0, wins: 0, highestMultiplier: 1.00 };
        
        statRoundsEl.textContent = diceStats.rounds;
        statWinsEl.textContent = diceStats.wins;
        
        let wr = diceStats.rounds > 0 ? Math.round((diceStats.wins / diceStats.rounds) * 100) : 0;
        statWinrateEl.textContent = wr + "%";
    }

    // --- DICE CONTROLLER MECHANICS ---
    function startRoll() {
        if (isRolling) return;
        initAudio();
        validateBetInput();

        if (balance < betAmount) {
            gameStatusText.textContent = 'Nicht genug Guthaben für diesen Einsatz.';
            return;
        }

        if (playMode === 'predict' && !activePrediction) {
            gameStatusText.textContent = 'Bitte wähle eine Vorhersage.';
            return;
        }

        // Deduct bet amount
        balance -= betAmount;
        updateHUD();

        isRolling = true;
        btnRoll.disabled = true;
        btnRoll.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> WÜRFEL WERDEN GESCHMOLZEN...`;
        gameStatusText.textContent = "Die Würfel rollen im Athanor-Feuer...";
        
        // Visual class trigger for heating furnace
        document.querySelector('.athanor-oven-visual').classList.add('heating');

        // Play rolling audio loop
        playRollSound();

        // 3D Dice spin animations
        const p1 = document.getElementById('p-die-1');
        const p2 = document.getElementById('p-die-2');
        const r1 = document.getElementById('r-die-1');
        const r2 = document.getElementById('r-die-2');
        const pr1 = document.getElementById('pr-die-1');
        const pr2 = document.getElementById('pr-die-2');

        const diceToRoll = [];
        if (playMode === 'duel') {
            p1.className = 'die-3d rolling';
            p2.className = 'die-3d rolling';
            r1.className = 'die-3d rolling';
            r2.className = 'die-3d rolling';
            diceToRoll.push(p1, p2, r1, r2);
        } else {
            pr1.className = 'die-3d rolling';
            pr2.className = 'die-3d rolling';
            diceToRoll.push(pr1, pr2);
        }

        // Intensity raised
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.6, 95);
        }

        // Core maths roll
        let pVal1 = Math.floor(Math.random() * 6) + 1;
        let pVal2 = Math.floor(Math.random() * 6) + 1;
        let pSum = pVal1 + pVal2;

        let rVal1 = 0;
        let rVal2 = 0;
        let rSum = 0;

        if (playMode === 'duel') {
            rVal1 = Math.floor(Math.random() * 6) + 1;
            rVal2 = Math.floor(Math.random() * 6) + 1;
            rSum = rVal1 + rVal2;
        }

        // Staggered stop trigger after 1.5s
        setTimeout(() => {
            // Remove rolling animation classes
            diceToRoll.forEach(d => d.classList.remove('rolling'));
            document.querySelector('.athanor-oven-visual').classList.remove('heating');

            // Apply target rotations
            if (playMode === 'duel') {
                applyDiceRotation(p1, pVal1);
                applyDiceRotation(p2, pVal2);
                applyDiceRotation(r1, rVal1);
                applyDiceRotation(r2, rVal2);
                
                playerSumEl.textContent = pSum;
                rectorSumEl.textContent = rSum;
            } else {
                applyDiceRotation(pr1, pVal1);
                applyDiceRotation(pr2, pVal2);
                predictSumEl.textContent = pSum;
            }

            // Play stop sound
            playProceduralSound('stop');

            // Resolve results after a short delay for rotations to finish
            setTimeout(() => {
                resolveOutcome(pSum, rSum);
            }, 600);

        }, 1500);
    }

    function applyDiceRotation(dieElement, val) {
        let baseRot = DICE_ROTATIONS[val];
        // Add random extra circles for rotation feel
        let extraX = (Math.floor(Math.random() * 3) + 2) * 360;
        let extraY = (Math.floor(Math.random() * 3) + 2) * 360;
        
        dieElement.style.transform = `rotateX(${baseRot.x + extraX}deg) rotateY(${baseRot.y + extraY}deg)`;
    }

    function resolveOutcome(playerSum, rectorSum) {
        let win = false;
        let tie = false;
        let payout = 0;
        let mult = 0;

        if (playMode === 'duel') {
            let hasBellows = window.AlchemistShared && window.AlchemistShared.hasUpgrade('bellows');
            if (playerSum > rectorSum) {
                win = true;
                mult = 1.90;
                payout = betAmount * mult;
            } else if (playerSum === rectorSum) {
                if (hasBellows) {
                    win = true;
                    mult = 1.90;
                    payout = betAmount * mult;
                    if (window.AlchemistShared && window.AlchemistShared.showToast) {
                        window.AlchemistShared.showToast("💨 Glut-Gebläse hat das Unentschieden zum Sieg gemacht!", "quest-complete");
                    }
                } else {
                    tie = true;
                    mult = 1.00;
                    payout = betAmount;
                }
            } else {
                win = false;
                mult = 0;
                payout = 0;
            }
        } else {
            // Predict Mode
            if (activePrediction === 'under' && playerSum < 7) {
                win = true;
                mult = 2.00;
            } else if (activePrediction === 'seven' && playerSum === 7) {
                win = true;
                mult = 5.00;
            } else if (activePrediction === 'over' && playerSum > 7) {
                win = true;
                mult = 2.00;
            }
            payout = win ? betAmount * mult : 0;
            if (win && window.AlchemistShared && window.AlchemistShared.hasRecipe('dice_master')) {
                payout *= 1.10;
                payout = parseFloat(payout.toFixed(2));
            }
        }

        // Multiplier scaling by Fortuna potion if won
        let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
        if (activePotions && activePotions.fortuna > 0 && win) {
            payout *= 1.20;
            payout = parseFloat(payout.toFixed(2));
            mult *= 1.20;
            if (window.AlchemistShared.showToast) {
                window.AlchemistShared.showToast("🔮 Fortuna-Segen: +20% Gewinn!", "quest-complete");
            }
        }

        // Potion charges decrement and stats recording is done at end via recordPlay()
        if (win && !tie) {
            playProceduralSound('success');
            addXP(Math.round(15 * mult));
            
            // Open gamble risk mix double-or-nothing
            setTimeout(() => {
                if (window.AlchemistShared && window.AlchemistShared.triggerGamble) {
                    window.AlchemistShared.triggerGamble(payout, (gambleAmt) => {
                        if (gambleAmt > 0) {
                            balance += gambleAmt;
                            playProceduralSound('success');
                            showOverlay(true, false, gambleAmt);
                            window.AlchemistShared.recordPlay('dice', gambleAmt, betAmount, gambleAmt / betAmount);
                        } else {
                            playProceduralSound('explosion');
                            showOverlay(false, false, 0);
                            window.AlchemistShared.recordPlay('dice', 0, betAmount, 0);
                        }
                        updateHUD();
                        loadDiceStats();
                        finalizeRoundReset();
                    });
                } else {
                    balance += payout;
                    updateHUD();
                    showOverlay(true, false, payout);
                    window.AlchemistShared.recordPlay('dice', payout, betAmount, mult);
                    loadDiceStats();
                    finalizeRoundReset();
                }
            }, 600);

        } else if (tie) {
            playProceduralSound('click');
            balance += payout;
            updateHUD();
            showOverlay(false, true, payout);
            window.AlchemistShared.recordPlay('dice', payout, betAmount, 1.00);
            loadDiceStats();
            finalizeRoundReset();
        } else {
            playProceduralSound('explosion');
            showOverlay(false, false, 0);
            window.AlchemistShared.recordPlay('dice', 0, betAmount, 0);
            loadDiceStats();
            finalizeRoundReset();
        }

        // Add history row
        addHistoryRow(playerSum, rectorSum, payout, win, tie);
    }

    function finalizeRoundReset() {
        isRolling = false;
        btnRoll.disabled = false;
        btnRoll.innerHTML = `<i class="fa-solid fa-dice"></i> ATHANOR HEIZEN & WÜRFELN`;
        
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.1, 60);
        }
    }

    function showOverlay(win, tie, amount) {
        gridOverlay.classList.remove('hidden');
        setTimeout(() => gridOverlay.classList.add('show'), 20);

        const titleEl = document.getElementById('overlay-title');
        const subtitleEl = document.getElementById('overlay-subtitle');

        if (win) {
            titleEl.textContent = "SIEG ERUNGEN!";
            titleEl.className = "overlay-title win";
            subtitleEl.innerHTML = `Augen geworfen und Schicksal geschmolzen.<br><strong style="color:var(--color-cyan); font-size:1.3rem;">+${amount.toFixed(2)} €</strong>`;
        } else if (tie) {
            titleEl.textContent = "GLEICHSTAND!";
            titleEl.className = "overlay-title tie";
            subtitleEl.textContent = "Unentschieden im Athanor. Dein Einsatz wurde erstattet.";
        } else {
            titleEl.textContent = "FEHLSCHLAG!";
            titleEl.className = "overlay-title loss";
            subtitleEl.textContent = "Der Rektor oder das Athanor-Feuer war mächtiger. Wette verloren.";
        }
    }

    function hideOverlay() {
        gridOverlay.classList.remove('show');
        setTimeout(() => {
            gridOverlay.classList.add('hidden');
            
            // Reset sums text display
            playerSumEl.textContent = "-";
            rectorSumEl.textContent = "-";
            predictSumEl.textContent = "-";
            
            if (playMode === 'dice') {
                gameStatusText.textContent = "Bereit fürs Elementen-Duell";
            } else {
                gameStatusText.textContent = "Wähle deine Vorhersage";
            }
        }, 300);
    }

    function addHistoryRow(pSum, rSum, payout, win, tie) {
        const row = document.createElement('div');
        row.className = 'history-item-side';

        let modeText = playMode === 'duel' ? '⚔️ Duell' : '🔮 Vorher.';
        let outcomeClass = 'loss';
        let outcomeText = 'Verloren';
        
        if (win && !tie) {
            outcomeClass = 'win';
            outcomeText = `Gewonnen (+${payout.toFixed(0)}€)`;
        } else if (tie) {
            outcomeClass = 'tie';
            outcomeText = 'Gleichstand';
        }

        let rollsText = playMode === 'duel' ? `${pSum} vs ${rSum}` : `Summe: ${pSum}`;

        row.innerHTML = `
            <span class="hist-mode">${modeText}</span>
            <span class="hist-details">${rollsText}</span>
            <span class="hist-outcome ${outcomeClass}">${outcomeText}</span>
        `;

        if (historyListContainer.querySelector('.history-empty')) {
            historyListContainer.innerHTML = '';
        }

        historyListContainer.insertBefore(row, historyListContainer.firstChild);

        while (historyListContainer.children.length > 8) {
            historyListContainer.removeChild(historyListContainer.lastChild);
        }
    }

    // --- PROCEDURAL SOUND GENERATOR ---
    function playRollSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;

        try {
            let now = audioCtx.currentTime;
            
            // rattling dice sound is simulated by scheduling multiple brief high-frequency rattle clicks
            for (let i = 0; i < 12; i++) {
                let delay = i * 0.12;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                
                osc.type = Math.random() < 0.5 ? 'triangle' : 'sine';
                // random frequency rattle clicks
                osc.frequency.setValueAtTime(600 + Math.random() * 800, now + delay);
                
                gain.gain.setValueAtTime(0, now + delay);
                gain.gain.linearRampToValueAtTime(0.06 * volumeSFX, now + delay + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.08);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now + delay);
                osc.stop(now + delay + 0.1);
            }
        } catch(e) {}
    }

    function playProceduralSound(type) {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;

        try {
            let now = audioCtx.currentTime;
            
            if (type === 'click') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(450, now);
                gain.gain.setValueAtTime(0.05 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.06);
            } 
            else if (type === 'stop') {
                // deep solid rattle impact
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.1);
                gain.gain.setValueAtTime(0.15 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.14);
            }
            else if (type === 'success') {
                let notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.06 * volumeSFX, now + idx * 0.07 + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + idx * 0.07);
                    osc.stop(now + idx * 0.07 + 0.4);
                });
            }
            else if (type === 'explosion') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(110, now);
                osc.frequency.linearRampToValueAtTime(30, now + 0.45);
                gain.gain.setValueAtTime(0.2 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.55);
            }
        } catch(e) {}
    }

    // --- MUTE & COMFORTS ---
    function updateMuteBtn() {
        if (isMuted) {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
            btnMute.style.color = 'var(--color-danger)';
        } else {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
            btnMute.style.color = 'var(--text-secondary)';
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('alchemist_muted', isMuted);
        updateMuteBtn();
    }

    init();
});
