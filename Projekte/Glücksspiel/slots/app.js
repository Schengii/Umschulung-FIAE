/* ==========================================================================
   ALCHEMISTEN-SPINS: LOGIK, MATHE & SOUNDS (VERSION 2.0)
   Autoplay, Turbo, Win-Counter, Casino-Modus
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- SYMBOLS DEFINITION ---
    const SYMBOLS = {
        wild: { name: "Stein der Weisen", emoji: "💎", color: "#00f0ff", payout: { 3: 15, 4: 50, 5: 250 } },
        scatter: { name: "Kessel", emoji: "🔮", color: "#bd00ff", payout: { 3: 5, 4: 20, 5: 100 } },
        feather: { name: "Phönixfeder", emoji: "🪶", color: "#ff8c00", payout: { 3: 10, 4: 40, 5: 200 } },
        potion: { name: "Blaues Elixier", emoji: "🧪", color: "#00c3ff", payout: { 3: 5, 4: 20, 5: 100 } },
        book: { name: "Zauberbuch", emoji: "📖", color: "#ff007f", payout: { 3: 4, 4: 15, 5: 75 } },
        rune_fire: { name: "Feuer-Rune", emoji: "🔥", color: "#ff3333", payout: { 3: 1, 4: 5, 5: 25 } },
        rune_water: { name: "Wasser-Rune", emoji: "💧", color: "#3388ff", payout: { 3: 1, 4: 5, 5: 25 } },
        rune_wind: { name: "Luft-Rune", emoji: "💨", color: "#a99ec6", payout: { 3: 1, 4: 5, 5: 25 } },
        rune_earth: { name: "Erde-Rune", emoji: "🪨", color: "#39ff14", payout: { 3: 1, 4: 5, 5: 25 } },
        bonus: { name: "Glücksrad", emoji: "☸️", color: "#ffcc00", payout: { 3: 0, 4: 0, 5: 0 } }
    };

    // Symbol keys array for generation weighting
    const SYMBOL_KEYS = [
        'rune_fire', 'rune_fire', 'rune_fire', 'rune_fire',
        'rune_water', 'rune_water', 'rune_water', 'rune_water',
        'rune_wind', 'rune_wind', 'rune_wind', 'rune_wind',
        'rune_earth', 'rune_earth', 'rune_earth', 'rune_earth',
        'book', 'book', 'book',
        'potion', 'potion',
        'feather', 'feather',
        'scatter',
        'wild',
        'bonus'
    ];

    // --- PAYLINES (10 Lines, 5 Columns, 3 Rows: 0=Top, 1=Middle, 2=Bottom) ---
    const PAYLINES = {
        1:  [1, 1, 1, 1, 1], // Middle Row
        2:  [0, 0, 0, 0, 0], // Top Row
        3:  [2, 2, 2, 2, 2], // Bottom Row
        4:  [0, 1, 2, 1, 0], // V-Shape
        5:  [2, 1, 0, 1, 2], // Inverted V-Shape
        6:  [0, 0, 1, 2, 2], // Top-left to Bottom-right steps
        7:  [2, 2, 1, 0, 0], // Bottom-left to Top-right steps
        8:  [1, 2, 1, 0, 1], // M-Shape
        9:  [1, 0, 1, 2, 1], // W-Shape
        10: [0, 2, 0, 2, 0]  // Zigzag
    };

    // Color definitions for drawing paylines on canvas
    const PAYLINE_COLORS = {
        1:  '#ff3333',
        2:  '#33ff33',
        3:  '#3333ff',
        4:  '#ffff33',
        5:  '#ff33ff',
        6:  '#33ffff',
        7:  '#ffaa00',
        8:  '#aa00ff',
        9:  '#00ffaa',
        10: '#ff00aa'
    };

    // --- GAME STATE ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let bet = parseFloat(localStorage.getItem('alchemist_slots_bet')) || 1.00;
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    
    let isSpinning = false;
    let currentWin = 0;
    let spinResultGrid = []; // 5 Columns x 3 Rows
    let activeWinningLines = []; // list of lines that hit
    let linesWinningSymbols = []; // array of winning cell coordinates [col, row]
    
    // Wheel of Fortune State
    let isWheelPending = false;
    let pendingWheelCoords = [];
    let wheelWinningIndex = null;
    
    // Free Spins State
    let freeSpinsActive = false;
    let freeSpinsCount = 0;
    let totalFreeSpinsWon = 0;
    let freeSpinsTotalWin = 0;

    // Gamble Card Game State
    let gambleCurrentAmount = 0;
    let gambleHistory = [];

    // --- SOUND ENGINE ---
    let audioCtx = null;

    // Autoplay State
    let autoplayActive = false;
    let autoplayRemaining = 0;

    // Turbo Mode
    let turboMode = false;

    // Casino-Modus State
    let slotsMode = localStorage.getItem('alchemist_slots_mode') || 'standard';
    let slotsWinRate = parseInt(localStorage.getItem('alchemist_slots_win_rate')) || 25;
    let slotsMaxMulti = parseInt(localStorage.getItem('alchemist_slots_max_multi')) || 50;

    // Win Counter Animation
    let winCounterAnimId = null;

    // --- DOM ELEMENTS ---
    const balanceAmountEl = document.getElementById('balance-amount');
    const xpLevelNumEl = document.getElementById('xp-level-num');
    const xpCurrentValEl = document.getElementById('xp-current-val');
    const xpTargetValEl = document.getElementById('xp-target-val');
    const xpBarFill = document.getElementById('xp-bar-fill');
    
    const betInput = document.getElementById('bet-input');
    const btnBetDec = document.getElementById('btn-bet-dec');
    const btnBetInc = document.getElementById('btn-bet-inc');
    const btnSpin = document.getElementById('btn-spin');
    
    const btnGamble = document.getElementById('btn-gamble');
    const btnCollect = document.getElementById('btn-collect');
    
    const infoStatusLabel = document.getElementById('info-status-label');
    const infoStatusValue = document.getElementById('info-status-value');
    const lineBadges = document.querySelectorAll('.line-badge');
    const slotViewport = document.querySelector('.slot-viewport');
    
    const freeSpinsIndicator = document.getElementById('free-spins-indicator');
    const fsCurrentCountEl = document.getElementById('fs-current-count');
    
    // Modals
    const helpModal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-help');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnMute = document.getElementById('btn-mute');
    
    const gambleModal = document.getElementById('gamble-modal');
    const btnGambleRed = document.getElementById('btn-gamble-red');
    const btnGambleBlack = document.getElementById('btn-gamble-black');
    const btnGambleCollect = document.getElementById('btn-gamble-collect');
    const gambleCurrentWinEl = document.getElementById('gamble-current-win');
    const gamblePotentialWinEl = document.getElementById('gamble-potential-win');
    const cardHistoryContainer = document.getElementById('card-history');
    const gambleCardInner = document.getElementById('gamble-card-inner');
    const cardFrontFace = document.getElementById('card-front-face');
    
    const fsTriggerModal = document.getElementById('fs-trigger-modal');
    const btnFsStart = document.getElementById('btn-fs-start');
    
    const toastContainer = document.getElementById('toast-container');
    const linesCanvas = document.getElementById('lines-canvas');
    const linesCtx = linesCanvas.getContext('2d');

    // New V2.0 DOM Elements
    const autoplayBtns = document.querySelectorAll('.btn-auto-preset');
    const btnAutoStop = document.getElementById('btn-auto-stop');
    const autoplayCounterEl = document.getElementById('autoplay-counter');
    const autoplayRemainingEl = document.getElementById('autoplay-remaining');
    const chkTurbo = document.getElementById('chk-turbo');
    const winCounterOverlay = document.getElementById('win-counter-overlay');
    const winCounterAmount = document.getElementById('win-counter-amount');
    const winCounterLabel = document.querySelector('.win-counter-label');

    // Admin Modal Elements
    const adminModal = document.getElementById('admin-modal');
    const btnAdmin = document.getElementById('btn-admin');
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    const selectSlotsMode = document.getElementById('select-slots-mode');
    const slideSlotsWinRate = document.getElementById('slide-slots-win-rate');
    const valSlotsWinRate = document.getElementById('val-slots-win-rate');
    const slideSlotsMaxMulti = document.getElementById('slide-slots-max-multi');
    const valSlotsMaxMulti = document.getElementById('val-slots-max-multi');
    const groupSlotsWinRate = document.getElementById('group-slots-win-rate');
    const groupSlotsMaxMulti = document.getElementById('group-slots-max-multi');
    const adminModeDisplay = document.getElementById('admin-mode-display');
    const adminRateDisplay = document.getElementById('admin-rate-display');
    const btnSlotsAdminReset = document.getElementById('btn-slots-admin-reset');
    const btnSlotsAdminSave = document.getElementById('btn-slots-admin-save');

    // ==========================================================================
    // INITIALIZATION & EVENT HANDLERS
    // ==========================================================================

    function init() {
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(0.2, 60);
        }
        
        syncStateFromLocalStorage();
        updateMuteButtonDisplay();
        setupReelsGridInitial();
        
        // Wheel of Fortune elements
        const btnWheelSpin = document.getElementById('btn-wheel-spin');
        const btnWheelCollect = document.getElementById('btn-wheel-collect');
        if (btnWheelSpin) {
            btnWheelSpin.addEventListener('click', spinWheel);
        }
        if (btnWheelCollect) {
            btnWheelCollect.addEventListener('click', collectWheelReward);
        }

        // Storage and Focus sync listeners
        window.addEventListener('storage', (e) => {
            if (e.key === 'alchemist_balance' || e.key === 'alchemist_xp' || e.key === 'alchemist_level' || e.key === 'alchemist_muted') {
                syncStateFromLocalStorage();
            }
        });
        window.addEventListener('focus', syncStateFromLocalStorage);
        
        // Bet inputs
        betInput.value = bet.toFixed(2);
        validateBetInput();
        
        btnBetDec.addEventListener('click', () => adjustBet(-0.50));
        btnBetInc.addEventListener('click', () => adjustBet(0.50));
        betInput.addEventListener('input', validateBetInput);
        betInput.addEventListener('change', validateBetInput);
        
        // Spin action
        btnSpin.addEventListener('click', startSpin);
        
        // Win collections
        btnCollect.addEventListener('click', collectWin);
        btnGamble.addEventListener('click', startGambleMode);
        
        // Gamble card clicks
        btnGambleRed.addEventListener('click', () => playGambleCard('red'));
        btnGambleBlack.addEventListener('click', () => playGambleCard('black'));
        btnGambleCollect.addEventListener('click', collectGambleWin);
        
        // Utilities
        btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
        btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));
        btnMute.addEventListener('click', toggleMute);
        
        btnFsStart.addEventListener('click', startFreeSpinsMode);
        
        // Autoplay buttons
        autoplayBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const spins = parseInt(btn.getAttribute('data-spins'));
                startAutoplay(spins);
            });
        });
        btnAutoStop.addEventListener('click', stopAutoplay);

        // Turbo toggle
        chkTurbo.addEventListener('change', () => {
            turboMode = chkTurbo.checked;
        });

        // Admin modal
        if (btnAdmin) {
            btnAdmin.addEventListener('click', openAdminModal);
        }
        if (btnCloseAdmin) {
            btnCloseAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));
        }
        if (selectSlotsMode) {
            selectSlotsMode.addEventListener('change', updateAdminUI);
        }
        if (slideSlotsWinRate) {
            slideSlotsWinRate.addEventListener('input', () => {
                valSlotsWinRate.textContent = slideSlotsWinRate.value + '%';
                updateAdminInfoDisplay();
            });
        }
        if (slideSlotsMaxMulti) {
            slideSlotsMaxMulti.addEventListener('input', () => {
                valSlotsMaxMulti.textContent = slideSlotsMaxMulti.value + 'x';
            });
        }
        if (btnSlotsAdminReset) {
            btnSlotsAdminReset.addEventListener('click', resetAdminDefaults);
        }
        if (btnSlotsAdminSave) {
            btnSlotsAdminSave.addEventListener('click', saveAdminSettings);
        }

        // Close modals clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
            if (e.target === adminModal) adminModal.classList.add('hidden');
        });

        // Hover payline badges to preview lines
        lineBadges.forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                const lineNum = parseInt(badge.getAttribute('data-line'));
                drawSinglePayline(lineNum);
            });
            badge.addEventListener('mouseleave', () => {
                clearPaylinesCanvas();
                // Redraw active winning lines if any
                if (activeWinningLines.length > 0 && !isSpinning) {
                    drawWinningLines(activeWinningLines);
                }
            });
        });

        // Window resize to handle Canvas crispness
        window.addEventListener('resize', handleCanvasResize);
        setTimeout(handleCanvasResize, 100);

        // Sync visibility audio pause
        document.addEventListener('visibilitychange', () => {
            if (audioCtx) {
                if (document.hidden) {
                    if (audioCtx.state === 'running') audioCtx.suspend();
                } else {
                    if (audioCtx.state === 'suspended') audioCtx.resume();
                }
            }
        });
    }

    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.body.addEventListener('click', initAudio, { once: true });

    function handleCanvasResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = linesCanvas.getBoundingClientRect();
        
        linesCanvas.width = rect.width * dpr;
        linesCanvas.height = rect.height * dpr;
        
        linesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        if (activeWinningLines.length > 0 && !isSpinning) {
            drawWinningLines(activeWinningLines);
        }
    }

    // ==========================================================================
    // REELS DISPLAY GENERATOR
    // ==========================================================================

    // Populates the 5 reels initially with random symbols
    function setupReelsGridInitial() {
        for (let col = 0; col < 5; col++) {
            const strip = document.querySelector(`#reel-${col} .reel-strip`);
            strip.innerHTML = '';
            
            // Generate 3 random symbols for initial view
            for (let i = 0; i < 3; i++) {
                const symKey = getRandomSymbolKey();
                const item = createSymbolDOMElement(symKey);
                strip.appendChild(item);
            }
        }
    }

    function getRandomSymbolKey() {
        if (window.AlchemistShared && window.AlchemistShared.hasUpgrade('catalyst') && Math.random() < 0.05) {
            return 'scatter';
        }
        return SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
    }

    function createSymbolDOMElement(key) {
        const def = SYMBOLS[key];
        const el = document.createElement('div');
        el.className = 'symbol-item';
        el.textContent = def.emoji;
        el.setAttribute('data-symbol', key);
        
        const label = document.createElement('span');
        label.className = 'symbol-name-hidden';
        label.textContent = def.name;
        el.appendChild(label);
        
        return el;
    }

    // ==========================================================================
    // BETTER STATE UPDATES
    // ==========================================================================

    function adjustBet(amount) {
        if (isSpinning || currentWin > 0) return;
        initAudio();
        let val = parseFloat(betInput.value) + amount;
        betInput.value = val.toFixed(2);
        validateBetInput();
    }

    function validateBetInput() {
        let val = parseFloat(betInput.value);
        if (isNaN(val) || val < 0.10) {
            val = 0.10;
        } else if (val > balance) {
            val = Math.max(0.10, balance);
        } else if (val > 50.00) {
            val = 50.00;
        }
        bet = val;
        betInput.value = bet.toFixed(2);
        localStorage.setItem('alchemist_slots_bet', bet.toFixed(2));
    }

    function updateBalanceDisplay() {
        balanceAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
    }

    function updateXPDisplay() {
        xpLevelNumEl.textContent = level;
        xpCurrentValEl.textContent = xp;
        let targetXP = level * 500;
        xpTargetValEl.textContent = targetXP;
        let percentage = (xp / targetXP) * 100;
        xpBarFill.style.width = `${percentage}%`;
    }

    function addXP(amount) {
        if (window.AlchemistShared) {
            window.AlchemistShared.addXP(amount);
        }
        syncStateFromLocalStorage();
    }

    // ==========================================================================
    // SOUND EFFECTS ENGINE
    // ==========================================================================

    function playSound(type) {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            const now = audioCtx.currentTime;
            if (type === 'click') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                gain.gain.setValueAtTime(0.04 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.06);
            } else if (type === 'spin_start') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(0.12 * volumeSFX, now);
                gain.gain.linearRampToValueAtTime(0.06 * volumeSFX, now + 0.25);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.25);
            } else if (type === 'reel_stop') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.setValueAtTime(100, now + 0.02);
                gain.gain.setValueAtTime(0.15 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.06);
            } else if (type === 'win_short') {
                let notes = [261.63, 329.63, 392.00, 523.25]; // C chord arpeggio
                notes.forEach((f, i) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + i * 0.06);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.08 * volumeSFX, now + i * 0.06 + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + i * 0.06);
                    osc.stop(now + i * 0.06 + 0.35);
                });
            } else if (type === 'win_big') {
                let notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
                notes.forEach((f, i) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now + i * 0.08);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1 * volumeSFX, now + i * 0.08 + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.5);
                });
            } else if (type === 'card_flip') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);
                gain.gain.setValueAtTime(0.08 * volumeSFX, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.13);
            } else if (type === 'lose_gamble') {
                let subOsc = audioCtx.createOscillator();
                let subGain = audioCtx.createGain();
                subOsc.type = 'sawtooth';
                subOsc.frequency.setValueAtTime(110, now);
                subOsc.frequency.linearRampToValueAtTime(55, now + 0.5);
                subGain.gain.setValueAtTime(0.18 * volumeSFX, now);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                subOsc.connect(subGain);
                subGain.connect(audioCtx.destination);
                subOsc.start();
                subOsc.stop(now + 0.6);
            } else if (type === 'scatter_hit') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
                gain.gain.setValueAtTime(0.15 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.5);
            }
        } catch (e) {
            console.error("Audio Synthesis error: ", e);
        }
    }

    function playAchievementChime() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            const now = audioCtx.currentTime;
            let chord = [261.63, 329.63, 392.00, 523.25, 659.25];
            chord.forEach((f, i) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.08 * volumeSFX, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.85);
            });
        } catch (e) {
            console.error(e);
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('alchemist_muted', isMuted);
        updateMuteButtonDisplay();
    }

    function updateMuteButtonDisplay() {
        const icon = btnMute.querySelector('i');
        if (!icon) return;
        if (isMuted) {
            icon.className = 'fa-solid fa-volume-xmark';
            btnMute.title = "Ton einschalten";
        } else {
            icon.className = 'fa-solid fa-volume-high';
            btnMute.title = "Ton stummschalten";
        }
    }

    // ==========================================================================
    // THE SPINNING MECHANICS
    // ==========================================================================

    function startSpin() {
        if (isSpinning) return;
        initAudio();
        
        // Sync first to avoid out-of-sync plays
        syncStateFromLocalStorage();

        // If gamble features are active, enforce collection first
        if (currentWin > 0) {
            collectWin();
            setTimeout(startSpin, 250);
            return;
        }

        validateBetInput();

        if (!freeSpinsActive && balance < bet) {
            infoStatusLabel.textContent = 'GUTHABEN';
            infoStatusValue.textContent = 'Nicht genug Guthaben für diesen Einsatz.';
            return;
        }

        // Deduct bet if not in Free Spins
        if (!freeSpinsActive) {
            balance -= bet;
            updateBalanceDisplay();
        } else {
            freeSpinsCount--;
            fsCurrentCountEl.textContent = freeSpinsCount;
        }

        // Modulate procedural ambient synthesizer based on spin state
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(freeSpinsActive ? 0.9 : 0.5, freeSpinsActive ? 110 : 80);
        }

        // Progress Quest for spins
        if (window.AlchemistShared) {
            window.AlchemistShared.progressQuest('slots_spins', 1);
            if (window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('slots_spin');
            }
        }

        // Lock UI controls during spin
        isSpinning = true;
        btnSpin.disabled = true;
        btnSpin.classList.add('spinning-active');
        btnSpin.innerHTML = `<i class="fa-solid fa-arrow-rotate-right"></i> DREHEN...`;
        
        btnBetDec.disabled = true;
        btnBetInc.disabled = true;
        betInput.disabled = true;
        btnGamble.classList.add('hidden');
        btnCollect.classList.add('hidden');

        infoStatusLabel.textContent = "WALZEN DREHEN";
        infoStatusValue.textContent = "...";
        clearPaylinesCanvas();
        removeWinningSymbolHighlights();
        hideWinCounter();

        // 1. Generate target stops
        // 5 columns, 3 rows grid
        if (slotsMode === 'casino' && !freeSpinsActive) {
            spinResultGrid = generateCasinoModeGrid();
        } else {
            spinResultGrid = [];
            for (let col = 0; col < 5; col++) {
                let colSymbols = [];
                for (let row = 0; row < 3; row++) {
                    colSymbols.push(getRandomSymbolKey());
                }
                spinResultGrid.push(colSymbols);
            }
        }

        // 2. Animate each reel strip with a translation
        // For physics look: we prepend random symbols before the target ones to simulate spinning distance
        const symbolsPerReel = turboMode ? 15 : 30; // fewer symbols in turbo
        const spinDuration = turboMode 
            ? [600, 700, 800, 900, 1000] 
            : [2000, 2250, 2500, 2750, 3000]; // staggered stop timings

        playSound('spin_start');

        for (let col = 0; col < 5; col++) {
            const strip = document.querySelector(`#reel-${col} .reel-strip`);
            
            // Build the strip DOM: prepend random symbols, end with target 3 symbols
            const tempFragment = document.createDocumentFragment();
            
            // Top padded random items that scroll by
            for (let i = 0; i < symbolsPerReel - 3; i++) {
                tempFragment.appendChild(createSymbolDOMElement(getRandomSymbolKey()));
            }
            
            // Bottom 3 target items (the real result)
            for (let row = 0; row < 3; row++) {
                const symKey = spinResultGrid[col][row];
                tempFragment.appendChild(createSymbolDOMElement(symKey));
            }

            // Replace reel contents
            strip.innerHTML = '';
            strip.appendChild(tempFragment);

            // Compute offset translation: each item is 130px in style
            // Translate the strip to the top, then transition down to 0
            const itemHeight = getSymbolItemHeight();
            const startTranslate = -(symbolsPerReel - 3) * itemHeight;
            
            strip.style.transition = 'none';
            strip.style.transform = `translateY(${startTranslate}px)`;
            
            // Trigger layout reflow
            void strip.offsetHeight;

            // Trigger scroll animation
            strip.style.transition = `transform ${spinDuration[col]}ms cubic-bezier(0.1, 0.8, 0.15, 1)`;
            strip.style.transform = `translateY(0)`;

            // Handle individual stop chimes
            setTimeout(() => {
                playSound('reel_stop');
                if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                    window.AlchemistShared.playProceduralSound('slots_stop');
                }
                
                // Crop list to keep only the bottom 3 visible target symbols to keep DOM lightweight
                if (col === 4) {
                    finishSpin();
                }
            }, spinDuration[col]);
        }
    }

    function getSymbolItemHeight() {
        const firstItem = document.querySelector('.symbol-item');
        if (firstItem) {
            return firstItem.offsetHeight || 130;
        }
        return 130;
    }

    // Wrap-up when all reels stop
    function finishSpin() {
        isSpinning = false;
        btnSpin.classList.remove('spinning-active');
        btnSpin.innerHTML = `<i class="fa-solid fa-arrow-rotate-right"></i> DREHEN`;

        // Clean up: keep only the bottom 3 visible target symbols per reel
        for (let col = 0; col < 5; col++) {
            const strip = document.querySelector(`#reel-${col} .reel-strip`);
            if (strip) {
                const items = strip.querySelectorAll('.symbol-item');
                // Remove all except the last 3 (the target symbols)
                for (let i = 0; i < items.length - 3; i++) {
                    items[i].remove();
                }
                // Reset transform so remaining 3 items are positioned correctly
                strip.style.transition = 'none';
                strip.style.transform = 'translateY(0)';
            }
        }

        // 1. Evaluate results
        evaluateSpinLines();
    }

    // ==========================================================================
    // MATHEMATICAL EVALUATION & PAYLINE MATCHING
    // ==========================================================================

    function evaluateSpinLines() {
        activeWinningLines = [];
        linesWinningSymbols = [];
        let totalWinFactor = 0;

        // Iterate over the 10 paylines
        for (let lineNum = 1; lineNum <= 10; lineNum++) {
            const coords = PAYLINES[lineNum]; // Row indices for columns 0 to 4
            
            // Get symbol keys along this line
            const lineSymbols = [];
            for (let col = 0; col < 5; col++) {
                lineSymbols.push(spinResultGrid[col][coords[col]]);
            }

            // Assess winning combinations from left-to-right
            let matchCount = 1;
            let targetKey = null;
            let lineWinCoordinates = [[0, coords[0]]]; // start with col 0

            // Determine base symbol: first symbol determines match, but Wild can substitute
            let firstKey = lineSymbols[0];
            if (firstKey === 'wild') {
                // Find first non-wild symbol
                let firstNonWild = lineSymbols.find(s => s !== 'wild');
                targetKey = firstNonWild || 'wild'; 
            } else {
                targetKey = firstKey;
            }

            // Compare subsequent symbols
            for (let col = 1; col < 5; col++) {
                const curKey = lineSymbols[col];
                if (curKey === targetKey || curKey === 'wild' || targetKey === 'wild') {
                    if (targetKey === 'wild' && curKey !== 'wild') {
                        targetKey = curKey; // Wild took shape of curKey
                    }
                    matchCount++;
                    lineWinCoordinates.push([col, coords[col]]);
                } else {
                    break;
                }
            }

            // Check if match count has a payout (minimum 3 matching symbols)
            if (matchCount >= 3 && targetKey !== 'scatter') {
                const payoutMult = SYMBOLS[targetKey].payout[matchCount];
                if (payoutMult) {
                    totalWinFactor += payoutMult;
                    activeWinningLines.push(lineNum);
                    
                    // Accumulate coordinates of winning symbols for glows
                    lineWinCoordinates.forEach(c => {
                        const exists = linesWinningSymbols.some(coord => coord[0] === c[0] && coord[1] === c[1]);
                        if (!exists) linesWinningSymbols.push(c);
                    });
                }
            }
        }

        // Calculate monetary wins
        currentWin = totalWinFactor * bet;
        if (freeSpinsActive) {
            currentWin *= 3.0; // Triple wins during free spins
        }

        // Apply Fortuna Potion (+20% spin wins)
        let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
        if (activePotions && activePotions.fortuna > 0 && currentWin > 0) {
            currentWin *= 1.20;
            currentWin = parseFloat(currentWin.toFixed(2));
        }

        // Apply Midas Recipe (+5% permanente Slots-Gewinne)
        let hasMidas = window.AlchemistShared && window.AlchemistShared.hasRecipe('midas');
        if (hasMidas && currentWin > 0) {
            currentWin *= 1.05;
            currentWin = parseFloat(currentWin.toFixed(2));
        }

        if (freeSpinsActive) {
            freeSpinsTotalWin += currentWin;
        }

        // Search for Scatters (Kessel) anywhere on screen (not bound to lines)
        let scatterCount = 0;
        let scatterCoordinates = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                if (spinResultGrid[col][row] === 'scatter') {
                    scatterCount++;
                    scatterCoordinates.push([col, row]);
                }
            }
        }

        // Scatter payouts & Free Spins triggers
        if (scatterCount >= 3) {
            playSound('scatter_hit');
            const scatterPayoutMult = SYMBOLS.scatter.payout[scatterCount];
            let scatterWin = scatterPayoutMult * bet * (freeSpinsActive ? 3.0 : 1.0);
            if (activePotions && activePotions.fortuna > 0 && scatterWin > 0) {
                scatterWin *= 1.20;
                scatterWin = parseFloat(scatterWin.toFixed(2));
            }
            if (hasMidas && scatterWin > 0) {
                scatterWin *= 1.05;
                scatterWin = parseFloat(scatterWin.toFixed(2));
            }
            currentWin += scatterWin;
            
            // Highlight scatter cells
            scatterCoordinates.forEach(c => {
                const exists = linesWinningSymbols.some(coord => coord[0] === c[0] && coord[1] === c[1]);
                if (!exists) linesWinningSymbols.push(c);
            });

            // Trigger Free Spins if not already active, or add more
            if (!freeSpinsActive) {
                totalFreeSpinsWon = 10;
                freeSpinsCount = 10;
            } else {
                freeSpinsCount += 10;
            }

            // Progress Quest slots_freespins
            if (window.AlchemistShared) {
                window.AlchemistShared.progressQuest('slots_freespins', 1);
            }
        }

        // Search for Bonus Symbols (Glücksrad) anywhere on screen
        let bonusCount = 0;
        let bonusCoordinates = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                if (spinResultGrid[col][row] === 'bonus') {
                    bonusCount++;
                    bonusCoordinates.push([col, row]);
                }
            }
        }

        if (bonusCount >= 3) {
            isWheelPending = true;
            pendingWheelCoords = bonusCoordinates;
            if (autoplayActive) stopAutoplay();
        }

        // --- ROUND WRAP-UP UI UPDATES ---
        if (currentWin > 0) {
            // Draw lines on canvas
            drawWinningLines(activeWinningLines);
            highlightWinningSymbols();
            
            infoStatusLabel.textContent = "GEWINN!";
            infoStatusValue.textContent = `${currentWin.toFixed(2)} €`;
            infoStatusValue.className = "info-value win-celebrate";

            // Show animated win counter
            showWinCounter(currentWin);

            // Add XP based on win size (min 10 XP, up to 250 XP)
            let xpEarned = Math.min(250, Math.max(10, Math.round(currentWin * 15)));
            addXP(xpEarned);

            // Progress Quest slots_win
            if (window.AlchemistShared) {
                window.AlchemistShared.progressQuest('slots_win', currentWin);
            }

            // Play chimes
            playSound(currentWin >= bet * 10 ? 'win_big' : 'win_short');
            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('win_fanfare');
            }

            // Set up Gamble or Collect
            if (!freeSpinsActive) {
                if (isWheelPending) {
                    // Enforce player decisions, pause autoplay
                    if (autoplayActive) stopAutoplay();
                    btnGamble.classList.remove('hidden');
                    btnCollect.classList.remove('hidden');
                    btnSpin.disabled = true;
                } else if (autoplayActive) {
                    // Autoplay: auto-collect and continue
                    setTimeout(() => {
                        collectWin();
                        setTimeout(handleAutoplayNext, 500);
                    }, turboMode ? 1200 : 2000);
                } else {
                    btnGamble.classList.remove('hidden');
                    btnCollect.classList.remove('hidden');
                    btnSpin.disabled = true; // Force player to decide
                }
            } else {
                // Free spins automatically collect
                window.AlchemistShared.recordPlay('slots', currentWin, bet, currentWin / bet);
                balance += currentWin;
                updateBalanceDisplay();
                currentWin = 0;
                
                // Keep rolling free spins automatically, unless Wheel is pending
                if (isWheelPending) {
                    setTimeout(() => {
                        triggerElementWheel(pendingWheelCoords);
                    }, 1200);
                } else {
                    setTimeout(handleNextFreeSpin, turboMode ? 800 : 1600);
                }
            }
        } else {
            // No wins
            window.AlchemistShared.recordPlay('slots', 0, bet, 0.0);
            infoStatusValue.className = "info-value";
            if (freeSpinsActive) {
                infoStatusLabel.textContent = "FREISPIELE AKTIV";
                infoStatusValue.textContent = "KEIN GEWINN";
                if (isWheelPending) {
                    setTimeout(() => {
                        triggerElementWheel(pendingWheelCoords);
                    }, 1200);
                } else {
                    setTimeout(handleNextFreeSpin, turboMode ? 600 : 1200);
                }
            } else {
                infoStatusLabel.textContent = "SPIELBEREIT";
                infoStatusValue.textContent = "KEIN GEWINN";
                
                if (isWheelPending) {
                    setTimeout(() => {
                        triggerElementWheel(pendingWheelCoords);
                    }, 1000);
                } else {
                    // Allow spins
                    btnSpin.disabled = false;
                    btnBetDec.disabled = false;
                    btnBetInc.disabled = false;
                    betInput.disabled = false;
                    
                    // Add 5 XP on loss as consolidation
                    addXP(5);

                    // Autoplay: continue to next spin
                    if (autoplayActive) {
                        setTimeout(handleAutoplayNext, turboMode ? 400 : 800);
                    }
                }
            }
        }

        // Check if Free Spins were just won and need to start
        if (totalFreeSpinsWon > 0 && !freeSpinsActive && !isWheelPending) {
            totalFreeSpinsWon = 0;
            if (autoplayActive) stopAutoplay(); // Pause autoplay for free spins
            setTimeout(() => {
                fsTriggerModal.classList.remove('hidden');
            }, 1000);
        }
    }

    // ==========================================================================
    // CANVAS PAYLINE RENDERER
    // ==========================================================================

    function clearPaylinesCanvas() {
        const rect = linesCanvas.getBoundingClientRect();
        linesCtx.clearRect(0, 0, rect.width, rect.height);
    }

    // Draw lines connecting symbol cells
    function drawWinningLines(linesList) {
        clearPaylinesCanvas();
        linesList.forEach(lineNum => {
            const coords = PAYLINES[lineNum];
            const color = PAYLINE_COLORS[lineNum];
            
            linesCtx.strokeStyle = color;
            linesCtx.lineWidth = 5;
            linesCtx.lineCap = 'round';
            linesCtx.lineJoin = 'round';
            linesCtx.shadowColor = color;
            linesCtx.shadowBlur = 10;
            
            linesCtx.beginPath();
            
            // Get pixel coordinates of the middle of each symbol in the grid
            for (let col = 0; col < 5; col++) {
                const cellCoords = getCellCenterPixel(col, coords[col]);
                if (col === 0) {
                    linesCtx.moveTo(cellCoords.x, cellCoords.y);
                } else {
                    linesCtx.lineTo(cellCoords.x, cellCoords.y);
                }
            }
            linesCtx.stroke();
        });
        linesCtx.shadowBlur = 0; // reset
    }

    // Draw single line on hover
    function drawSinglePayline(lineNum) {
        drawWinningLines([lineNum]);
    }

    // Helper: calculate center pixel of a cell [col, row]
    function getCellCenterPixel(col, row) {
        const reels = document.querySelectorAll('.reel');
        if (reels.length < 5) return { x: 0, y: 0 };

        const targetReel = reels[col];
        const reelLeft = targetReel.offsetLeft;
        const reelWidth = targetReel.offsetWidth;
        const itemHeight = getSymbolItemHeight();
        
        // Calculate cell center relative to canvas bounds
        const x = reelLeft + (reelWidth / 2);
        const y = (row * itemHeight) + (itemHeight / 2);
        
        return { x, y };
    }

    // Toggle flash animation on winning symbols
    function highlightWinningSymbols() {
        linesWinningSymbols.forEach(coord => {
            const col = coord[0];
            const row = coord[1];
            
            const reelStrip = document.querySelector(`#reel-${col} .reel-strip`);
            if (reelStrip) {
                const symbolItems = reelStrip.querySelectorAll('.symbol-item');
                // The visible symbols are the last 3 items in the strip (or bottom 3 indices)
                const targetIndex = symbolItems.length - 3 + row;
                if (symbolItems[targetIndex]) {
                    symbolItems[targetIndex].classList.add('winning');
                }
            }
        });
    }

    function removeWinningSymbolHighlights() {
        const items = document.querySelectorAll('.symbol-item.winning');
        items.forEach(item => item.classList.remove('winning'));
    }

    // ==========================================================================
    // WIN COLLECTIONS & GAME CONTINUATION
    // ==========================================================================

    function collectWin() {
        if (isSpinning || currentWin <= 0) return;
        playSound('click');

        balance += currentWin;
        updateBalanceDisplay();
        
        infoStatusLabel.textContent = "GEWINN GEBUCHT";
        infoStatusValue.textContent = `+${currentWin.toFixed(2)} €`;
        infoStatusValue.className = "info-value";

        window.AlchemistShared.recordPlay('slots', currentWin, bet, currentWin / bet);

        currentWin = 0;

        // Reset UI buttons
        btnGamble.classList.add('hidden');
        btnCollect.classList.add('hidden');
        
        if (isWheelPending) {
            triggerElementWheel(pendingWheelCoords);
        } else {
            btnSpin.disabled = false;
            btnBetDec.disabled = false;
            btnBetInc.disabled = false;
            betInput.disabled = false;

            clearPaylinesCanvas();
            removeWinningSymbolHighlights();
            
            // Adjust music state back to idle
            if (window.AlchemistShared) {
                window.AlchemistShared.setMusicState(0.2, 60);
            }
        }
    }

    // ==========================================================================
    // FREE SPINS ROUTINES
    // ==========================================================================

    function startFreeSpinsMode() {
        fsTriggerModal.classList.add('hidden');
        freeSpinsActive = true;
        freeSpinsTotalWin = 0;

        slotViewport.classList.add('free-spins-active');
        freeSpinsIndicator.classList.remove('hidden');
        fsCurrentCountEl.textContent = freeSpinsCount;

        // Collect any current line wins first
        currentWin = 0;
        btnGamble.classList.add('hidden');
        btnCollect.classList.add('hidden');

        // Increase music intensity for free spins
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(0.8, 100);
        }

        handleNextFreeSpin();
    }

    function handleNextFreeSpin() {
        if (freeSpinsCount > 0) {
            startSpin();
        } else {
            // Free spins ended!
            endFreeSpinsMode();
        }
    }

    function endFreeSpinsMode() {
        freeSpinsActive = false;
        slotViewport.classList.remove('free-spins-active');
        freeSpinsIndicator.classList.add('hidden');

        playAchievementChime();
        showFreeSpinsSummaryToast();

        // Release buttons
        btnSpin.disabled = false;
        btnBetDec.disabled = false;
        btnBetInc.disabled = false;
        betInput.disabled = false;
        
        infoStatusLabel.textContent = "FREISPIELE BEENDET";
        infoStatusValue.textContent = `GEWINN: +${freeSpinsTotalWin.toFixed(2)} €`;

        freeSpinsTotalWin = 0;

        // Reset music intensity
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(0.2, 60);
        }
    }

    function showFreeSpinsSummaryToast() {
        const toast = document.createElement('div');
        toast.className = 'toast-achievement';
        toast.innerHTML = `
            <div class="toast-icon-box">🔮</div>
            <div class="toast-details">
                <h4>FREISPIEL-SERIE BEENDET!</h4>
                <h3>+${freeSpinsTotalWin.toFixed(2)} €</h3>
                <p>Magischer Gesamtgewinn eingestrichen.</p>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    // ==========================================================================
    // CARD GAMBLE FEATURE (ROT / SCHWARZ)
    // ==========================================================================

    function startGambleMode() {
        if (currentWin <= 0) return;
        playSound('click');

        if (autoplayActive) stopAutoplay();

        // Hide normal actions
        btnGamble.classList.add('hidden');
        btnCollect.classList.add('hidden');

        // Trigger shared alchemist gamble modal!
        window.AlchemistShared.triggerGamble(currentWin, (finalAmount) => {
            if (finalAmount > 0) {
                balance += finalAmount;
                updateBalanceDisplay();

                playSound('win_big');
                infoStatusLabel.textContent = "RISIKO ERFOLG";
                infoStatusValue.textContent = `+${finalAmount.toFixed(2)} €`;
                infoStatusValue.className = "info-value win-celebrate";
            } else {
                playSound('lose_gamble');
                infoStatusLabel.textContent = "RISIKO VERLOREN";
                infoStatusValue.textContent = "0.00 €";
                infoStatusValue.className = "info-value";
            }

            window.AlchemistShared.recordPlay('slots', finalAmount, bet, finalAmount > 0 ? (finalAmount / bet) : 0.0);

            currentWin = 0;

            if (isWheelPending) {
                triggerElementWheel(pendingWheelCoords);
            } else {
                btnSpin.disabled = false;
                btnBetDec.disabled = false;
                btnBetInc.disabled = false;
                betInput.disabled = false;

                clearPaylinesCanvas();
                removeWinningSymbolHighlights();

                if (window.AlchemistShared) {
                    window.AlchemistShared.setMusicState(0.2, 60);
                }
            }
        });
    }

    // Stubs for legacy gamble card modal (unused, but kept for DOM compatibility)
    function playGambleCard(choice) {}
    function addCardToHistory(suit, color) {}
    function collectGambleWin() {}
    function exitGambleLoss() {}

    // ==========================================================================
    // AUTOPLAY SYSTEM
    // ==========================================================================

    function startAutoplay(spins) {
        if (isSpinning || currentWin > 0 || freeSpinsActive) return;
        initAudio();

        autoplayActive = true;
        autoplayRemaining = spins;

        // UI update: show stop button, hide preset buttons
        autoplayBtns.forEach(btn => btn.classList.add('hidden'));
        btnAutoStop.classList.remove('hidden');
        autoplayCounterEl.classList.remove('hidden');
        autoplayRemainingEl.textContent = autoplayRemaining;

        // Disable bet controls during autoplay
        btnBetDec.disabled = true;
        btnBetInc.disabled = true;
        betInput.disabled = true;

        handleAutoplayNext();
    }

    function handleAutoplayNext() {
        if (!autoplayActive || autoplayRemaining <= 0 || balance < bet) {
            stopAutoplay();
            return;
        }

        autoplayRemaining--;
        autoplayRemainingEl.textContent = autoplayRemaining;

        startSpin();
    }

    function stopAutoplay() {
        autoplayActive = false;
        autoplayRemaining = 0;

        // UI reset
        autoplayBtns.forEach(btn => btn.classList.remove('hidden'));
        btnAutoStop.classList.add('hidden');
        autoplayCounterEl.classList.add('hidden');

        // Re-enable bet controls
        if (!isSpinning && currentWin <= 0) {
            btnBetDec.disabled = false;
            btnBetInc.disabled = false;
            betInput.disabled = false;
        }
    }

    // ==========================================================================
    // ANIMATED WIN COUNTER OVERLAY
    // ==========================================================================

    function showWinCounter(targetAmount) {
        if (winCounterAnimId) cancelAnimationFrame(winCounterAnimId);

        const isBigWin = targetAmount >= bet * 10;
        
        winCounterOverlay.classList.remove('hidden');
        winCounterLabel.className = 'win-counter-label' + (isBigWin ? ' big-win' : '');
        winCounterLabel.textContent = isBigWin ? 'MEGA GEWINN!' : 'GEWINN!';
        winCounterAmount.className = 'win-counter-amount' + (isBigWin ? ' big-win' : '');

        // Animate counting up
        const duration = isBigWin ? 1500 : 800;
        const startTime = performance.now();
        
        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = targetAmount * easedProgress;
            
            winCounterAmount.textContent = currentVal.toFixed(2) + ' €';
            
            if (progress < 1) {
                winCounterAnimId = requestAnimationFrame(animate);
            } else {
                winCounterAnimId = null;
            }
        }
        
        winCounterAnimId = requestAnimationFrame(animate);
    }

    function hideWinCounter() {
        if (winCounterAnimId) {
            cancelAnimationFrame(winCounterAnimId);
            winCounterAnimId = null;
        }
        winCounterOverlay.classList.add('hidden');
    }

    // ==========================================================================
    // CASINO-MODUS: GRID GENERATOR (Controlled Outcomes)
    // ==========================================================================

    function generateCasinoModeGrid() {
        // Determine win/loss based on configured win rate
        const willWin = Math.random() * 100 < slotsWinRate;

        if (willWin) {
            // Generate a winning grid: place matching symbols on a random payline
            return generateWinningGrid();
        } else {
            // Generate a guaranteed losing grid: no 3+ matching symbols on any payline
            return generateLosingGrid();
        }
    }

    function generateWinningGrid() {
        // Start with random symbols
        let grid = [];
        for (let col = 0; col < 5; col++) {
            grid.push([getRandomSymbolKey(), getRandomSymbolKey(), getRandomSymbolKey()]);
        }

        // Pick a random payline and a random non-scatter, non-wild symbol
        const lineNum = Math.floor(Math.random() * 10) + 1;
        const coords = PAYLINES[lineNum];
        const winSymbols = ['feather', 'potion', 'book', 'rune_fire', 'rune_water', 'rune_wind', 'rune_earth'];
        const winSymbol = winSymbols[Math.floor(Math.random() * winSymbols.length)];
        
        // Place 3-5 matching symbols along the payline (from left)
        const matchCount = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
        const limitedMatch = Math.min(matchCount, 5);
        
        for (let col = 0; col < limitedMatch; col++) {
            grid[col][coords[col]] = winSymbol;
        }

        return grid;
    }

    function generateLosingGrid() {
        // Strategy: use only rune symbols (4 types) and distribute them so no payline has 3+ of the same
        const runeTypes = ['rune_fire', 'rune_water', 'rune_wind', 'rune_earth'];
        let grid = [];

        // Create a grid ensuring diversity on every payline
        for (let col = 0; col < 5; col++) {
            let colSymbols = [];
            for (let row = 0; row < 3; row++) {
                colSymbols.push(runeTypes[Math.floor(Math.random() * runeTypes.length)]);
            }
            grid.push(colSymbols);
        }

        // Validate: check that no payline has 3+ consecutive matching symbols from left
        // If any payline would win, swap symbols to break the match
        let maxAttempts = 50;
        while (maxAttempts-- > 0) {
            let hasWin = false;
            for (let lineNum = 1; lineNum <= 10; lineNum++) {
                const coords = PAYLINES[lineNum];
                const firstSym = grid[0][coords[0]];
                let matchCount = 1;
                for (let col = 1; col < 5; col++) {
                    if (grid[col][coords[col]] === firstSym) {
                        matchCount++;
                    } else {
                        break;
                    }
                }
                if (matchCount >= 3) {
                    // Break this match by changing the 3rd symbol
                    const breakCol = 2;
                    const breakRow = coords[breakCol];
                    const otherTypes = runeTypes.filter(r => r !== grid[breakCol][breakRow]);
                    grid[breakCol][breakRow] = otherTypes[Math.floor(Math.random() * otherTypes.length)];
                    hasWin = true;
                }
            }
            if (!hasWin) break;
        }

        return grid;
    }

    // ==========================================================================
    // ADMIN PANEL (CASINO-MODUS SETTINGS)
    // ==========================================================================

    function openAdminModal() {
        if (!adminModal) return;
        
        // Sync UI with current state
        selectSlotsMode.value = slotsMode;
        slideSlotsWinRate.value = slotsWinRate;
        valSlotsWinRate.textContent = slotsWinRate + '%';
        slideSlotsMaxMulti.value = slotsMaxMulti;
        valSlotsMaxMulti.textContent = slotsMaxMulti + 'x';

        updateAdminUI();
        adminModal.classList.remove('hidden');
    }

    function updateAdminUI() {
        const mode = selectSlotsMode.value;
        if (mode === 'casino') {
            groupSlotsWinRate.classList.remove('hidden');
            groupSlotsMaxMulti.classList.remove('hidden');
        } else {
            groupSlotsWinRate.classList.add('hidden');
            groupSlotsMaxMulti.classList.add('hidden');
        }
        updateAdminInfoDisplay();
    }

    function updateAdminInfoDisplay() {
        const mode = selectSlotsMode.value;
        adminModeDisplay.textContent = mode === 'casino' ? 'CASINO' : 'STANDARD';
        adminRateDisplay.textContent = mode === 'casino' ? slideSlotsWinRate.value + '%' : 'Zufall';
    }

    function saveAdminSettings() {
        slotsMode = selectSlotsMode.value;
        slotsWinRate = parseInt(slideSlotsWinRate.value);
        slotsMaxMulti = parseInt(slideSlotsMaxMulti.value);

        localStorage.setItem('alchemist_slots_mode', slotsMode);
        localStorage.setItem('alchemist_slots_win_rate', slotsWinRate.toString());
        localStorage.setItem('alchemist_slots_max_multi', slotsMaxMulti.toString());

        adminModal.classList.add('hidden');

        // Toast confirmation
        const toast = document.createElement('div');
        toast.className = 'toast-achievement';
        toast.innerHTML = `
            <div class="toast-icon-box">⚙️</div>
            <div class="toast-details">
                <h4>EINSTELLUNGEN GESPEICHERT</h4>
                <h3>Modus: ${slotsMode === 'casino' ? 'Casino (' + slotsWinRate + '%)' : 'Standard'}</h3>
                <p>Änderungen gelten ab dem nächsten Spin.</p>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4500);
    }

    function resetAdminDefaults() {
        selectSlotsMode.value = 'standard';
        slideSlotsWinRate.value = 25;
        valSlotsWinRate.textContent = '25%';
        slideSlotsMaxMulti.value = 50;
        valSlotsMaxMulti.textContent = '50x';
        updateAdminUI();
    }

    // ==========================================================================
    // WHEEL OF FORTUNE BONUS GAME (GLÜCKSRAD)
    // ==========================================================================

    function drawWheel() {
        const canvas = document.getElementById('wheel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const radius = width / 2;
        ctx.clearRect(0, 0, width, height);

        const segments = [
            { label: "5 Freispiele", type: "fs", value: 5, color: "#8e44ad" },
            { label: "10x Gold", type: "gold", value: 10, color: "#2980b9" },
            { label: "100 XP", type: "xp", value: 100, color: "#27ae60" },
            { label: "10 Freispiele", type: "fs", value: 10, color: "#e74c3c" },
            { label: "20x Gold", type: "gold", value: 20, color: "#f39c12" },
            { label: "250 XP", type: "xp", value: 250, color: "#16a085" },
            { label: "15 Freispiele", type: "fs", value: 15, color: "#d35400" },
            { label: "50x Gold", type: "gold", value: 50, color: "#c0392b" }
        ];

        const anglePerSegment = (2 * Math.PI) / segments.length;

        for (let i = 0; i < segments.length; i++) {
            const angle = i * anglePerSegment;
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius - 5, angle, angle + anglePerSegment);
            ctx.closePath();
            ctx.fillStyle = segments[i].color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(angle + anglePerSegment / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Outfit, sans-serif";
            ctx.fillText(segments[i].label, radius - 15, 0);
            ctx.restore();
        }

        // Center pin
        ctx.beginPath();
        ctx.arc(radius, radius, 15, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffcc00";
        ctx.stroke();
    }

    function triggerElementWheel(bonusCoordinates) {
        if (autoplayActive) stopAutoplay();
        
        // Highlight the bonus cells
        bonusCoordinates.forEach(coord => {
            const col = coord[0];
            const row = coord[1];
            const reelStrip = document.querySelector(`#reel-${col} .reel-strip`);
            if (reelStrip) {
                const symbolItems = reelStrip.querySelectorAll('.symbol-item');
                const targetIndex = symbolItems.length - 3 + row;
                if (symbolItems[targetIndex]) {
                    symbolItems[targetIndex].classList.add('winning');
                }
            }
        });
        
        // Show the wheel modal
        const wheelModal = document.getElementById('wheel-modal');
        const wheelCanvas = document.getElementById('wheel-canvas');
        const btnWheelSpin = document.getElementById('btn-wheel-spin');
        const btnWheelCollect = document.getElementById('btn-wheel-collect');
        const wheelResult = document.getElementById('wheel-result');
        
        // Reset wheel state
        wheelCanvas.style.transition = 'none';
        wheelCanvas.style.transform = 'rotate(0deg)';
        btnWheelSpin.disabled = false;
        btnWheelCollect.classList.add('hidden');
        wheelResult.classList.add('hidden');
        
        // Increase music intensity for the wheel
        if (window.AlchemistShared) {
            window.AlchemistShared.setMusicState(0.9, 120);
        }

        // Draw the wheel
        drawWheel();
        
        // Open modal
        wheelModal.classList.remove('hidden');
    }

    function spinWheel() {
        const btnWheelSpin = document.getElementById('btn-wheel-spin');
        const wheelCanvas = document.getElementById('wheel-canvas');
        const wheelResult = document.getElementById('wheel-result');
        const btnWheelCollect = document.getElementById('btn-wheel-collect');
        
        btnWheelSpin.disabled = true;
        
        const segments = [
            { label: "5 Freispiele", type: "fs", value: 5, color: "#8e44ad" },
            { label: "10x Gold", type: "gold", value: 10, color: "#2980b9" },
            { label: "100 XP", type: "xp", value: 100, color: "#27ae60" },
            { label: "10 Freispiele", type: "fs", value: 10, color: "#e74c3c" },
            { label: "20x Gold", type: "gold", value: 20, color: "#f39c12" },
            { label: "250 XP", type: "xp", value: 250, color: "#16a085" },
            { label: "15 Freispiele", type: "fs", value: 15, color: "#d35400" },
            { label: "50x Gold", type: "gold", value: 50, color: "#c0392b" }
        ];
        
        wheelWinningIndex = Math.floor(Math.random() * segments.length);
        const winner = segments[wheelWinningIndex];
        
        // Spin animation
        const angleCenterDegrees = (wheelWinningIndex + 0.5) * (360 / segments.length);
        const targetRotationDegrees = 360 * 8 + 270 - angleCenterDegrees;
        
        playSound('spin_start');
        
        wheelCanvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)';
        wheelCanvas.style.transform = `rotate(${targetRotationDegrees}deg)`;
        
        setTimeout(() => {
            playSound('win_big');
            
            // Show result
            wheelResult.classList.remove('hidden');
            wheelResult.innerHTML = `GEWONNEN: <span style="color: ${winner.color}; font-weight: 800;">${winner.label}</span>!`;
            
            btnWheelCollect.classList.remove('hidden');
        }, 4100);
    }

    function collectWheelReward() {
        const segments = [
            { label: "5 Freispiele", type: "fs", value: 5, color: "#8e44ad" },
            { label: "10x Gold", type: "gold", value: 10, color: "#2980b9" },
            { label: "100 XP", type: "xp", value: 100, color: "#27ae60" },
            { label: "10 Freispiele", type: "fs", value: 10, color: "#e74c3c" },
            { label: "20x Gold", type: "gold", value: 20, color: "#f39c12" },
            { label: "250 XP", type: "xp", value: 250, color: "#16a085" },
            { label: "15 Freispiele", type: "fs", value: 15, color: "#d35400" },
            { label: "50x Gold", type: "gold", value: 50, color: "#c0392b" }
        ];
        
        const winner = segments[wheelWinningIndex];
        const wheelModal = document.getElementById('wheel-modal');
        
        // Reset states
        isWheelPending = false;
        pendingWheelCoords = [];
        
        if (winner.type === 'fs') {
            freeSpinsCount += winner.value;
            totalFreeSpinsWon = winner.value;
            freeSpinsTotalWin = 0;
            
            wheelModal.classList.add('hidden');
            
            setTimeout(() => {
                fsTriggerModal.classList.remove('hidden');
                document.getElementById('fs-trigger-title').textContent = `${winner.value} FREISPIELE FREIGESCHALTET!`;
            }, 300);
            
            if (window.AlchemistShared) {
                window.AlchemistShared.progressQuest('slots_freespins', 1);
            }
        } else if (winner.type === 'gold') {
            let goldWin = winner.value * bet;
            let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
            if (activePotions && activePotions.fortuna > 0) {
                goldWin *= 1.20;
                goldWin = parseFloat(goldWin.toFixed(2));
            }
            if (window.AlchemistShared && window.AlchemistShared.hasRecipe('midas')) {
                goldWin *= 1.05;
                goldWin = parseFloat(goldWin.toFixed(2));
            }
            balance += goldWin;
            updateBalanceDisplay();
            
            window.AlchemistShared.recordPlay('slots', goldWin, 0, winner.value);
            
            wheelModal.classList.add('hidden');
            
            infoStatusLabel.textContent = "GLÜCKSRAD GEWINN";
            infoStatusValue.textContent = `+${goldWin.toFixed(2)} €`;
            infoStatusValue.className = "info-value win-celebrate";
            
            if (window.AlchemistShared) {
                window.AlchemistShared.progressQuest('slots_win', goldWin);
            }
            
            // Allow spins again
            btnSpin.disabled = false;
            btnBetDec.disabled = false;
            btnBetInc.disabled = false;
            betInput.disabled = false;
            
            clearPaylinesCanvas();
            removeWinningSymbolHighlights();
            
            if (window.AlchemistShared) {
                window.AlchemistShared.setMusicState(0.2, 60);
            }
        } else if (winner.type === 'xp') {
            if (window.AlchemistShared) {
                window.AlchemistShared.addXP(winner.value);
            }
            syncStateFromLocalStorage();
            
            wheelModal.classList.add('hidden');
            
            infoStatusLabel.textContent = "GLÜCKSRAD XP";
            infoStatusValue.textContent = `+${winner.value} XP`;
            infoStatusValue.className = "info-value win-celebrate";
            
            // Allow spins again
            btnSpin.disabled = false;
            btnBetDec.disabled = false;
            btnBetInc.disabled = false;
            betInput.disabled = false;
            
            clearPaylinesCanvas();
            removeWinningSymbolHighlights();
            
            if (window.AlchemistShared) {
                window.AlchemistShared.setMusicState(0.2, 60);
            }
        }
    }

    function syncStateFromLocalStorage() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
        level = parseInt(localStorage.getItem('alchemist_level')) || 1;
        isMuted = localStorage.getItem('alchemist_muted') === 'true';
        updateBalanceDisplay();
        updateXPDisplay();
    }

    // Initialize logic
    init();
});
