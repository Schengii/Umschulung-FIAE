/* ==========================================================================
   ALCHEMISTEN-GOLD: SPIELLOGIK, GRAPHIK & SOUND (VERSION 4.0)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- INGREDIENT DATA ---
    const INGREDIENTS = {
        dew: {
            name: "Mondtau",
            instability: 5,
            mult: 1.10,
            color: "#00c3ff"
        },
        feather: {
            name: "Phönixfeder",
            instability: 15,
            mult: 1.40,
            color: "#ff8c00"
        },
        blood: {
            name: "Drachenblut",
            instability: 30,
            mult: 2.00,
            color: "#ff2d55"
        },
        matter: {
            name: "Dunkle Materie",
            instability: 50,
            mult: 4.00,
            color: "#bd00ff"
        }
    };

    // --- ACHIEVEMENTS DEFINITIONS ---
    const ACHIEVEMENT_DEFS = {
        hermes: {
            id: 'hermes',
            title: 'Lehrling des Hermes',
            desc: 'Braue 5 Tränke erfolgreich.',
            icon: '🧪'
        },
        master: {
            id: 'master',
            title: 'Großmeister',
            desc: 'Erreiche einen Multiplikator von über 8.00x.',
            icon: '👑'
        },
        volcano: {
            id: 'volcano',
            title: 'Tanz auf dem Vulkan',
            desc: 'Zahle bei über 80% Kessel-Instabilität erfolgreich aus.',
            icon: '🌋'
        },
        dragon: {
            id: 'dragon',
            title: 'Drachen-Liebhaber',
            desc: 'Nutze 3x Drachenblut in einer einzigen Runde.',
            icon: '🩸'
        },
        lucky: {
            id: 'lucky',
            title: 'Glückspilz',
            desc: 'Löse ein Wildcard-Ereignis aus.',
            icon: '❄️'
        }
    };

    // --- GAME STATE ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let bet = 10.00;
    let multiplier = 1.00;
    let instability = 0;
    let gameState = 'IDLE'; // IDLE, BREWING, EXPLODED, CASHED_OUT
    let addedCount = 0;
    let currentPotionColor = '#100a25';
    let history = JSON.parse(localStorage.getItem('alchemist_history')) || [];
    
    // Duel Mode variables
    let isDuelMode = false;
    let npcId = 'ignis';
    let npcMultiplier = 1.00;
    let npcState = 'IDLE'; // IDLE, BREWING, CASHED_OUT, EXPLODED
    let npcThreshold = 1.5;
    let npcTimer = null;
    
    // Wildcards
    let dragonBloodCount = 0;
    let wildcardActiveType = null; // null, frost, stability, catalyst
    let activeWildcardShield = false; 
    let catalystSparks = false;
    let isSafetyValveActive = false;

    // V3.0 XP & Level State variables
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    let equippedTheme = localStorage.getItem('alchemist_theme') || 'default'; // default, ice, volcano
    let unlockedThemes = JSON.parse(localStorage.getItem('alchemist_unlocked_themes')) || ['default'];
    let activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false, catalyst: false, detector: false, magnet: false, bellows: false };
    let unlockedUpgrades = JSON.parse(localStorage.getItem('alchemist_unlocked_upgrades')) || [];

    // V4.0 Dynamic Difficulty Configuration (stored in LocalStorage)
    let riskExponent = parseFloat(localStorage.getItem('alchemist_risk_exponent')) || 2.5;
    let difficultyMultiplier = parseFloat(localStorage.getItem('alchemist_difficulty_multiplier')) || 1.0;

    let gameMode = localStorage.getItem('alchemist_game_mode') || 'standard'; // standard, casino
    let targetWinRate = parseFloat(localStorage.getItem('alchemist_target_win_rate')) || 0.25;
    let roundOutcome = null; // win, loss
    let lossTriggerStep = null;

    // Stats & Achievements
    let stats = {
        totalRounds: 0,
        totalWins: 0,
        highestMultiplier: 1.00,
        balanceHistory: [1000]
    };
    function loadStatsFromShared() {
        let rawStats = localStorage.getItem('alchemist_stats');
        if (rawStats) {
            try {
                let parsed = JSON.parse(rawStats);
                if (parsed.global) {
                    stats.totalRounds = parsed.cauldron ? (parsed.cauldron.rounds || 0) : (parsed.global.totalRounds || 0);
                    stats.totalWins = parsed.cauldron ? (parsed.cauldron.wins || 0) : (parsed.global.totalWins || 0);
                    stats.highestMultiplier = parsed.cauldron ? (parsed.cauldron.highestMultiplier || 1.00) : (parsed.global.highestMultiplier || 1.00);
                    stats.balanceHistory = parsed.global.balanceHistory || [1000];
                } else {
                    stats.totalRounds = parsed.totalRounds || 0;
                    stats.totalWins = parsed.totalWins || 0;
                    stats.highestMultiplier = parsed.highestMultiplier || 1.00;
                    stats.balanceHistory = parsed.balanceHistory || [1000];
                }
            } catch(e) {}
        }
    }
    loadStatsFromShared();
    
    let achievements = JSON.parse(localStorage.getItem('alchemist_achievements')) || {
        hermes: false,
        master: false,
        volcano: false,
        dragon: false,
        lucky: false
    };

    // --- SOUND ENGINE ---
    let audioCtx = null;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    let bubbleTimeout = null;

    // --- CANVAS GRAPHICS ---
    const canvas = document.getElementById('cauldron-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particlePool = [];

    function spawnParticle(x, y, type, color = '#ffffff') {
        let p;
        if (particlePool.length > 0) {
            p = particlePool.pop();
            p.init(x, y, type, color);
        } else {
            p = new Particle(x, y, type, color);
        }
        particles.push(p);
    }
    let liquidOffset = 0;
    let screenShake = 0;

    // --- DOM ELEMENTS ---
    const balanceAmountEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('bet-input');
    const btnBetMin = document.getElementById('btn-bet-min');
    const btnBetHalf = document.getElementById('btn-bet-half');
    const btnBetDouble = document.getElementById('btn-bet-double');
    const btnBetMax = document.getElementById('btn-bet-max');
    const btnStart = document.getElementById('btn-start');
    const btnCashout = document.getElementById('btn-cashout');
    const cashoutPreview = document.getElementById('cashout-preview');
    const instabilityValEl = document.getElementById('instability-value');
    const instabilityBar = document.getElementById('instability-bar');
    const warningText = document.getElementById('warning-text');
    const currentMultiplierEl = document.getElementById('current-multiplier');
    const multiplierDisplay = document.getElementById('multiplier-display');
    const cauldronStatus = document.getElementById('cauldron-status');
    const historyList = document.getElementById('history-list');
    const btnHelp = document.getElementById('btn-help');
    const btnMute = document.getElementById('btn-mute');
    const helpModal = document.getElementById('help-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');

    // Duel Mode elements
    const btnModeSingle = document.getElementById('btn-mode-single');
    const btnModeDuel = document.getElementById('btn-mode-duel');
    const duelSelectorContainer = document.getElementById('duel-selector-container');
    const selectDuelNpc = document.getElementById('select-duel-npc');
    const duelStatusBadge = document.getElementById('duel-status-badge');
    const duelNpcIcon = document.getElementById('duel-npc-icon');
    const duelNpcName = document.getElementById('duel-npc-name');
    const duelNpcMultiplier = document.getElementById('duel-npc-multiplier');
    const duelNpcState = document.getElementById('duel-npc-state');

    // Auto-Cashout
    const chkAutoCashout = document.getElementById('chk-auto-cashout');
    const autoCashoutInputGroup = document.getElementById('auto-cashout-input-group');
    const autoCashoutVal = document.getElementById('auto-cashout-val');
    const chkSafetyValve = document.getElementById('chk-safety-valve');
    const safetyValveCostEl = document.getElementById('safety-valve-cost');
    const tickerFeed = document.getElementById('ticker-feed');
    const toastContainer = document.getElementById('toast-container');
    const wildcardBanner = document.getElementById('wildcard-banner');
    const wildcardTitle = document.getElementById('wildcard-title');
    const wildcardDesc = document.getElementById('wildcard-desc');
    const wildcardIcon = document.getElementById('wildcard-icon');

    // V3.0 Tab Navigation
    const tabBtnIng = document.getElementById('tab-btn-ing');
    const tabBtnLab = document.getElementById('tab-btn-lab');
    const tabBtnStats = document.getElementById('tab-btn-stats');
    const tabContentIng = document.getElementById('tab-content-ing');
    const tabContentLab = document.getElementById('tab-content-lab');
    const tabContentStats = document.getElementById('tab-content-stats');

    // V3.0 Level Up Modal
    const levelModal = document.getElementById('level-modal');
    const modalLevelNum = document.getElementById('modal-level-num');
    const modalLevelTxt = document.getElementById('modal-level-txt');
    const modalUnlockIcon = document.getElementById('modal-unlock-icon');
    const modalUnlockTitle = document.getElementById('modal-unlock-title');
    const modalUnlockDesc = document.getElementById('modal-unlock-desc');
    const btnLevelClose = document.getElementById('btn-level-close');

    // V3.0 Header Level Elements
    const xpLevelNumEl = document.getElementById('xp-level-num');
    const xpCurrentValEl = document.getElementById('xp-current-val');
    const xpTargetValEl = document.getElementById('xp-target-val');
    const xpBarFill = document.getElementById('xp-bar-fill');

    // V3.0 Labor Elements
    const btnThemeDefault = document.getElementById('btn-theme-default');
    const btnThemeIce = document.getElementById('btn-theme-ice');
    const btnThemeVolcano = document.getElementById('btn-theme-volcano');
    const btnUpgradeCopper = document.getElementById('btn-upgrade-copper');
    const btnUpgradeCrystal = document.getElementById('btn-upgrade-crystal');

    // V4.0 Tutorial and Admin elements
    const welcomeModal = document.getElementById('welcome-modal');
    const btnWelcomeClose = document.getElementById('btn-welcome-close');
    const chkHideWelcome = document.getElementById('chk-hide-welcome');
    const btnAdmin = document.getElementById('btn-admin');
    const adminModal = document.getElementById('admin-modal');
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    const slideExponent = document.getElementById('slide-exponent');
    const slideMultiplier = document.getElementById('slide-multiplier');
    const valExponent = document.getElementById('val-exponent');
    const valMultiplier = document.getElementById('val-multiplier');
    const mathPct20 = document.getElementById('math-pct-20');
    const mathPct50 = document.getElementById('math-pct-50');
    const mathPct80 = document.getElementById('math-pct-80');
    const btnAdminReset = document.getElementById('btn-admin-reset');
    const btnAdminSave = document.getElementById('btn-admin-save');

    // Casino Mode Admin elements
    const selectGameMode = document.getElementById('select-game-mode');
    const groupExponent = document.getElementById('group-exponent');
    const groupMultiplier = document.getElementById('group-multiplier');
    const groupWinRate = document.getElementById('group-win-rate');
    const slideWinRate = document.getElementById('slide-win-rate');
    const valWinRate = document.getElementById('val-win-rate');
    const previewTitle = document.getElementById('preview-title');
    const previewMathGrid = document.getElementById('preview-math-grid');
    const previewCasinoInfo = document.getElementById('preview-casino-info');
    const casinoInfoPct = document.getElementById('casino-info-pct');

    // Stats Labels
    const statRoundsEl = document.getElementById('stat-rounds');
    const statWinsEl = document.getElementById('stat-wins');
    const statRecordEl = document.getElementById('stat-record');
    const achievementsListEl = document.getElementById('achievements-list');

    // Ingredient Cards
    const ingDewBtn = document.getElementById('ing-dew');
    const ingFeatherBtn = document.getElementById('ing-feather');
    const ingBloodBtn = document.getElementById('ing-blood');
    const ingMatterBtn = document.getElementById('ing-matter');
    const allIngredientBtns = [ingDewBtn, ingFeatherBtn, ingBloodBtn, ingMatterBtn];

    // ==========================================================================
    // INITIALIZATION & TAB CONTROLS
    // ==========================================================================
    
    function init() {
        updateBalanceDisplay();
        updateMuteButtonDisplay();
        renderHistory();
        renderAchievements();
        updateStatsDisplay();
        updateXPDisplay();
        renderLabor();
        
        // V4.0 Welcome Tutorial check
        if (localStorage.getItem('alchemist_hide_welcome') !== 'true') {
            welcomeModal.classList.remove('hidden');
        }

        // Modus toggles
        if (btnModeSingle && btnModeDuel) {
            btnModeSingle.addEventListener('click', () => {
                isDuelMode = false;
                btnModeSingle.classList.add('active');
                btnModeSingle.style.background = 'rgba(138,43,226,0.3)';
                btnModeSingle.style.color = '#fff';
                btnModeDuel.classList.remove('active');
                btnModeDuel.style.background = 'none';
                btnModeDuel.style.color = 'var(--text-secondary)';
                duelSelectorContainer.classList.add('hidden');
            });
            btnModeDuel.addEventListener('click', () => {
                isDuelMode = true;
                btnModeDuel.classList.add('active');
                btnModeDuel.style.background = 'rgba(138,43,226,0.3)';
                btnModeDuel.style.color = '#fff';
                btnModeSingle.classList.remove('active');
                btnModeSingle.style.background = 'none';
                btnModeSingle.style.color = 'var(--text-secondary)';
                duelSelectorContainer.classList.remove('hidden');
            });
        }
        if (selectDuelNpc) {
            selectDuelNpc.addEventListener('change', () => {
                npcId = selectDuelNpc.value;
            });
        }

        // Bet validation bounds
        betInput.value = bet.toFixed(2);
        validateBetInput();
        
        // Listeners for betting
        betInput.addEventListener('input', validateBetInput);
        betInput.addEventListener('change', validateBetInput);
        btnBetMin.addEventListener('click', () => setBet(1.00));
        btnBetHalf.addEventListener('click', () => setBet(Math.max(1.00, bet / 2)));
        btnBetDouble.addEventListener('click', () => setBet(Math.min(500, bet * 2)));
        btnBetMax.addEventListener('click', () => setBet(Math.min(500, balance)));

        // Action Buttons
        btnStart.addEventListener('click', startBrewing);
        btnCashout.addEventListener('click', cashOut);

        // Ingredient additions
        ingDewBtn.addEventListener('click', () => addIngredient('dew'));
        ingFeatherBtn.addEventListener('click', () => addIngredient('feather'));
        ingBloodBtn.addEventListener('click', () => addIngredient('blood'));
        ingMatterBtn.addEventListener('click', () => addIngredient('matter'));

        // Utility Buttons
        btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
        btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
            if (e.target === welcomeModal) welcomeModal.classList.add('hidden');
            if (e.target === adminModal) adminModal.classList.add('hidden');
        });

        btnMute.addEventListener('click', toggleMute);

        // V3.0 Tab Switching
        tabBtnIng.addEventListener('click', () => switchTab('ing'));
        tabBtnLab.addEventListener('click', () => switchTab('lab'));
        tabBtnStats.addEventListener('click', () => switchTab('stats'));

        // V3.0 Level Modal Close
        btnLevelClose.addEventListener('click', () => levelModal.classList.add('hidden'));

        // V3.0 Labor Equips / Upgrades
        btnThemeDefault.addEventListener('click', () => equipTheme('default'));
        btnThemeIce.addEventListener('click', () => equipTheme('ice'));
        btnThemeVolcano.addEventListener('click', () => equipTheme('volcano'));
        
        btnUpgradeCopper.addEventListener('click', () => toggleUpgrade('copper'));
        btnUpgradeCrystal.addEventListener('click', () => toggleUpgrade('crystal'));

        // V2.0 Auto-Cashout toggle
        chkAutoCashout.addEventListener('change', () => {
            if (chkAutoCashout.checked) {
                autoCashoutInputGroup.classList.remove('hidden');
                validateAutoCashoutInput();
            } else {
                autoCashoutInputGroup.classList.add('hidden');
            }
        });
        autoCashoutVal.addEventListener('change', validateAutoCashoutInput);

        // Safety Valve Toggle
        if (chkSafetyValve) {
            chkSafetyValve.addEventListener('change', updateSafetyValveCost);
        }

        // V4.0 Tutorial Events
        btnWelcomeClose.addEventListener('click', () => {
            if (chkHideWelcome.checked) {
                localStorage.setItem('alchemist_hide_welcome', 'true');
            }
            welcomeModal.classList.add('hidden');
        });

        // V4.0 Admin Settings Events
        btnAdmin.addEventListener('click', openAdminPanel);
        btnCloseAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));
        slideExponent.addEventListener('input', calculateAdminMath);
        slideMultiplier.addEventListener('input', calculateAdminMath);
        btnAdminReset.addEventListener('click', resetAdminSettings);
        btnAdminSave.addEventListener('click', saveAdminSettings);

        // Casino Mode Listeners
        selectGameMode.addEventListener('change', onGameModeChange);
        slideWinRate.addEventListener('input', calculateAdminMath);

        // Start Ticker Feed Simulation
        setInterval(simulatePlayerActivity, 2200);

        // Start Canvas Loop
        requestAnimationFrame(renderLoop);
    }

    // Initialize Audio context on first interaction
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.body.addEventListener('click', initAudio, { once: true });

    // Tab-visibility-aware AudioContext management
    document.addEventListener('visibilitychange', () => {
        if (audioCtx) {
            if (document.hidden) {
                if (audioCtx.state === 'running') {
                    audioCtx.suspend();
                }
            } else {
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }
        }
    });

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

    function switchTab(tab) {
        tabBtnIng.classList.toggle('active', tab === 'ing');
        tabBtnLab.classList.toggle('active', tab === 'lab');
        tabBtnStats.classList.toggle('active', tab === 'stats');

        tabContentIng.classList.toggle('hidden', tab !== 'ing');
        tabContentLab.classList.toggle('hidden', tab !== 'lab');
        tabContentStats.classList.toggle('hidden', tab !== 'stats');

        if (tab === 'stats') {
            setTimeout(drawBalanceChart, 50);
        } else if (tab === 'lab') {
            renderLabor();
        }
    }

    // ==========================================================================
    // SOUND EFFECTS SYNTHESIS
    // ==========================================================================

    // Procedural bubble sounds
    function triggerAmbientBubbles() {
        if (gameState !== 'BREWING') return;

        if (!isMuted && audioCtx) {
            let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
            if (volumeSFX > 0.0) {
                try {
                    let osc = audioCtx.createOscillator();
                    let gainNode = audioCtx.createGain();
                    let filter = audioCtx.createBiquadFilter();
                    
                    let startFreq = 90 + Math.random() * 60;
                    let endFreq = startFreq + 110 + Math.random() * 90;
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.12);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
                    
                    gainNode.gain.setValueAtTime((0.01 + Math.random() * 0.025) * volumeSFX, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.12);
                    
                    osc.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.13);
                } catch (e) {
                    console.error("Audio error: ", e);
                }
            }
        }

        let delay = 180 + Math.random() * (400 - (instability * 3.6));
        bubbleTimeout = setTimeout(triggerAmbientBubbles, Math.max(45, delay));
    }

    // Procedural sound when ingredient is dropped
    function playSizzleSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let osc = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();
            let filter = audioCtx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(700, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.35);

            filter.type = 'bandpass';
            filter.Q.value = 2.0;
            filter.frequency.setValueAtTime(900, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.35);

            gainNode.gain.setValueAtTime(0.10 * volumeSFX, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            console.error(e);
        }
    }

    // Procedural sound when wildcard event triggers
    function playWildcardSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            let filter = audioCtx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(1600, now + 0.6);

            filter.type = 'bandpass';
            filter.Q.value = 6.0;
            filter.frequency.setValueAtTime(300, now);
            filter.frequency.exponentialRampToValueAtTime(1800, now + 0.6);

            gain.gain.setValueAtTime(0.01 * volumeSFX, now);
            gain.gain.linearRampToValueAtTime(0.18 * volumeSFX, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(now + 0.65);
        } catch (e) {
            console.error(e);
        }
    }

    // Procedural sound for unlock achievements
    function playAchievementUnlockSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; 
            
            notes.forEach((freq, index) => {
                let osc = audioCtx.createOscillator();
                let gainNode = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + index * 0.06);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.1 * volumeSFX, now + index * 0.06 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.5);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start(now + index * 0.06);
                osc.stop(now + index * 0.06 + 0.6);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // V3.0 Level Up fanfare chime
    function playLevelUpSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let chords = [
                { f1: 261.63, f2: 392.00, delay: 0.0 }, // C4, G4
                { f1: 329.63, f2: 523.25, delay: 0.2 }, // E4, C5
                { f1: 392.00, f2: 659.25, delay: 0.4 }, // G4, E5
                { f1: 523.25, f2: 783.99, f3: 1046.50, delay: 0.6 } // C5, G5, C6
            ];

            chords.forEach(chord => {
                const triggerNotes = [chord.f1, chord.f2];
                if (chord.f3) triggerNotes.push(chord.f3);

                triggerNotes.forEach(freq => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + chord.delay);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.08 * volumeSFX, now + chord.delay + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + chord.delay + 0.9);
                    
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.start(now + chord.delay);
                    osc.stop(now + chord.delay + 0.95);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Satisfying explosion boom sound
    function playExplosionSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let subOsc = audioCtx.createOscillator();
            let subGain = audioCtx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
            subOsc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.9);

            subGain.gain.setValueAtTime(0.7 * volumeSFX, audioCtx.currentTime);
            subGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

            subOsc.connect(subGain);
            subGain.connect(audioCtx.destination);
            subOsc.start();
            subOsc.stop(audioCtx.currentTime + 0.95);

            let bufferSize = audioCtx.sampleRate * 1.5;
            let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            let data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            let noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            let filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 1.3);

            let noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.4 * volumeSFX, audioCtx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.3);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);

            noise.start();
            noise.stop(audioCtx.currentTime + 1.4);
        } catch (e) {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(60, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3 * volumeSFX, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        }
    }

    // Ascending arpeggio chime for cashout
    function playCashoutSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
            
            notes.forEach((freq, index) => {
                let osc = audioCtx.createOscillator();
                let gainNode = audioCtx.createGain();
                let filter = audioCtx.createBiquadFilter();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + index * 0.07);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.12 * volumeSFX, now + index * 0.07 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.6);
                
                osc.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start(now + index * 0.07);
                osc.stop(now + index * 0.07 + 0.7);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // ==========================================================================
    // V3.0 XP & LEVEL SYSTEM PROGRESSION
    // ==========================================================================

    function addXP(amount) {
        xp += amount;
        let targetXP = level * 500;

        let levelUpHappened = false;
        while (xp >= targetXP) {
            xp -= targetXP;
            level++;
            levelUpHappened = true;
            targetXP = level * 500;
        }

        localStorage.setItem('alchemist_xp', xp);
        localStorage.setItem('alchemist_level', level);
        
        updateXPDisplay();

        if (levelUpHappened) {
            triggerLevelUp(level);
        }
    }

    function updateXPDisplay() {
        xpLevelNumEl.textContent = level;
        xpCurrentValEl.textContent = xp;
        
        let targetXP = level * 500;
        xpTargetValEl.textContent = targetXP;
        
        let percentage = (xp / targetXP) * 100;
        xpBarFill.style.width = `${percentage}%`;
    }

    function triggerLevelUp(newLvl) {
        playLevelUpSound();

        if (newLvl === 2 && !unlockedThemes.includes('ice')) {
            setupLevelUpModal('❄️', 'Eis-Kelch Design kaufbar', 'Der Eis-Kelch steht jetzt im Labor-Tab zum Kauf bereit. Kosten: 150€.');
        } else if (newLvl === 3 && !unlockedUpgrades.includes('copper')) {
            setupLevelUpModal('🛡️', 'Kupfer-Filter kaufbar', 'Der passive Kupfer-Filter (-10% Instabilität) kann jetzt im Labor gekauft werden. Kosten: 300€.');
        } else if (newLvl === 4 && !unlockedThemes.includes('volcano')) {
            setupLevelUpModal('🌋', 'Vulkan-Topf Design kaufbar', 'Der feurige Vulkan-Topf steht jetzt im Labor-Tab zum Kauf bereit. Kosten: 500€.');
        } else if (newLvl === 5 && !unlockedUpgrades.includes('crystal')) {
            setupLevelUpModal('💎', 'Katalysator-Kristall kaufbar', 'Der passive Katalysator-Kristall (+10% Gewinnbonus) kann jetzt im Labor gekauft werden. Kosten: 800€.');
        } else {
            setupLevelUpModal('⭐', 'Orden der Alchemisten', 'Du hast eine neue Stufe der Meisterschaft erreicht! Schalte weiterhin XP frei für mehr Ehren.');
        }

        modalLevelNum.textContent = newLvl;
        modalLevelTxt.textContent = newLvl;

        levelModal.classList.remove('hidden');
        renderLabor();
    }

    function setupLevelUpModal(icon, title, desc) {
        modalUnlockIcon.textContent = icon;
        modalUnlockTitle.textContent = title;
        modalUnlockDesc.textContent = desc;
    }

    // ==========================================================================
    // V3.0 LABOR TAB (THEMES & UPGRADES) - SHOP SYSTEM
    // ==========================================================================

    const LABOR_ITEMS = {
        'default': { price: 0, levelReq: 1 },
        'ice': { price: 150, levelReq: 2 },
        'volcano': { price: 500, levelReq: 4 },
        'copper': { price: 300, levelReq: 3 },
        'crystal': { price: 800, levelReq: 5 }
    };

    function triggerGoldSparkles() {
        for (let i = 0; i < 40; i++) {
            let x = 300 + (Math.random() - 0.5) * 120;
            let y = 380 + (Math.random() - 0.5) * 120;
            spawnParticle(x, y, 'spark', 'var(--color-gold)');
        }
    }

    function renderLabor() {
        // Sync arrays from localStorage first
        unlockedThemes = JSON.parse(localStorage.getItem('alchemist_unlocked_themes')) || ['default'];
        unlockedUpgrades = JSON.parse(localStorage.getItem('alchemist_unlocked_upgrades')) || [];
        activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false };
        equippedTheme = localStorage.getItem('alchemist_theme') || 'default';

        updateThemeCard('default', true); 
        updateThemeCard('ice', unlockedThemes.includes('ice'));
        updateThemeCard('volcano', unlockedThemes.includes('volcano'));

        updateUpgradeCard('copper', unlockedUpgrades.includes('copper'));
        updateUpgradeCard('crystal', unlockedUpgrades.includes('crystal'));
    }

    function updateThemeCard(id, isUnlocked) {
        const card = document.getElementById(`theme-card-${id}`);
        const btn = document.getElementById(`btn-theme-${id}`);
        if (!card || !btn) return;

        card.className = "theme-card";

        if (!isUnlocked) {
            let reqLvl = LABOR_ITEMS[id].levelReq;
            let price = LABOR_ITEMS[id].price;
            if (level >= reqLvl) {
                card.classList.add('unlocked'); // styling class
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-coins"></i> KAUFEN (${price}€)`;
            } else {
                card.classList.add('locked');
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-lock"></i> Stufe ${reqLvl}`;
            }
        } else {
            if (equippedTheme === id) {
                card.classList.add('equipped');
                btn.disabled = true;
                btn.innerHTML = `AUSGERÜSTET`;
            } else {
                card.classList.add('unlocked');
                btn.disabled = false;
                btn.innerHTML = `AUSRÜSTEN`;
            }
        }
    }

    function updateUpgradeCard(id, isUnlocked) {
        const card = document.getElementById(`up-card-${id}`);
        const btn = document.getElementById(`btn-upgrade-${id}`);
        if (!card || !btn) return;

        card.className = "upgrade-card";

        if (!isUnlocked) {
            let reqLvl = LABOR_ITEMS[id].levelReq;
            let price = LABOR_ITEMS[id].price;
            if (level >= reqLvl) {
                card.classList.add('unlocked');
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-coins"></i> KAUFEN (${price}€)`;
            } else {
                card.classList.add('locked');
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-lock"></i> Stufe ${reqLvl}`;
            }
        } else {
            if (activeUpgrades[id]) {
                card.classList.add('active');
                btn.disabled = false;
                btn.innerHTML = `AKTIV`;
            } else {
                card.classList.add('unlocked');
                btn.disabled = false;
                btn.innerHTML = `AKTIVIEREN`;
            }
        }
    }

    function equipTheme(themeName) {
        // Double check purchase state
        if (!unlockedThemes.includes(themeName)) {
            // Attempt to purchase
            let item = LABOR_ITEMS[themeName];
            if (level >= item.levelReq) {
                if (balance >= item.price) {
                    balance -= item.price;
                    updateBalanceDisplay();
                    unlockedThemes.push(themeName);
                    localStorage.setItem('alchemist_unlocked_themes', JSON.stringify(unlockedThemes));
                    
                    // FX & Audio
                    playAchievementUnlockSound();
                    triggerGoldSparkles();
                    let itemName = themeName === 'ice' ? 'Eis-Kelch' : 'Vulkan-Topf';
                    window.AlchemistShared.showToast(`✨ ${itemName} für ${item.price}€ gekauft!`, 'info');
                    
                    equippedTheme = themeName;
                    localStorage.setItem('alchemist_theme', themeName);
                } else {
                    window.AlchemistShared.showToast("💥 Nicht genügend Guthaben!", 'info');
                    return;
                }
            } else {
                return;
            }
        } else {
            equippedTheme = themeName;
            localStorage.setItem('alchemist_theme', themeName);
        }

        if (equippedTheme === 'ice') {
            currentPotionColor = '#00f0ff';
        } else if (equippedTheme === 'volcano') {
            currentPotionColor = '#ff3300';
        } else {
            currentPotionColor = '#13ad89';
        }

        renderLabor();
    }

    function toggleUpgrade(upgradeId) {
        if (!unlockedUpgrades.includes(upgradeId)) {
            // Attempt to purchase
            let item = LABOR_ITEMS[upgradeId];
            if (level >= item.levelReq) {
                if (balance >= item.price) {
                    balance -= item.price;
                    updateBalanceDisplay();
                    unlockedUpgrades.push(upgradeId);
                    localStorage.setItem('alchemist_unlocked_upgrades', JSON.stringify(unlockedUpgrades));
                    
                    // FX & Audio
                    playAchievementUnlockSound();
                    triggerGoldSparkles();
                    let itemName = upgradeId === 'copper' ? 'Kupfer-Filter' : 'Katalysator-Kristall';
                    window.AlchemistShared.showToast(`✨ ${itemName} für ${item.price}€ gekauft!`, 'info');
                    
                    activeUpgrades[upgradeId] = true;
                    localStorage.setItem('alchemist_upgrades', JSON.stringify(activeUpgrades));
                } else {
                    window.AlchemistShared.showToast("💥 Nicht genügend Guthaben!", 'info');
                    return;
                }
            } else {
                return;
            }
        } else {
            activeUpgrades[upgradeId] = !activeUpgrades[upgradeId];
            localStorage.setItem('alchemist_upgrades', JSON.stringify(activeUpgrades));
        }
        
        renderLabor();
    }

    // ==========================================================================
    // V4.0 ADMINISTRATOR DIFFICULTY SETTINGS
    // ==========================================================================

    function openAdminPanel() {
        initAudio();
        // Load current config values
        selectGameMode.value = gameMode;
        slideExponent.value = riskExponent;
        slideMultiplier.value = difficultyMultiplier;

        let ratePercent = Math.round(targetWinRate * 100);
        slideWinRate.value = ratePercent;
        valWinRate.textContent = ratePercent + '%';

        valExponent.textContent = riskExponent.toFixed(1);
        valMultiplier.textContent = difficultyMultiplier.toFixed(1);

        toggleAdminUIMode(gameMode);
        calculateAdminMath();
        adminModal.classList.remove('hidden');
    }

    function onGameModeChange() {
        let mode = selectGameMode.value;
        toggleAdminUIMode(mode);
        calculateAdminMath();
    }

    function toggleAdminUIMode(mode) {
        if (mode === 'casino') {
            groupExponent.classList.add('hidden');
            groupMultiplier.classList.add('hidden');
            groupWinRate.classList.remove('hidden');
            
            previewTitle.textContent = "📊 Casino-Auszahlungsprognose:";
            previewMathGrid.classList.add('hidden');
            previewCasinoInfo.classList.remove('hidden');
        } else {
            groupExponent.classList.remove('hidden');
            groupMultiplier.classList.remove('hidden');
            groupWinRate.classList.add('hidden');
            
            previewTitle.textContent = "📊 Berechnete Explosionswahrscheinlichkeiten (Live-Vorschau):";
            previewMathGrid.classList.remove('hidden');
            previewCasinoInfo.classList.add('hidden');
        }
    }

    function calculateAdminMath() {
        let mode = selectGameMode.value;
        if (mode === 'casino') {
            let rate = parseInt(slideWinRate.value);
            valWinRate.textContent = rate + '%';
            casinoInfoPct.textContent = `${rate}% Gewinn / ${100 - rate}% Verlust`;
        } else {
            let exp = parseFloat(slideExponent.value);
            let mult = parseFloat(slideMultiplier.value);

            valExponent.textContent = exp.toFixed(1);
            valMultiplier.textContent = mult.toFixed(1);

            // Calculate live math
            // P = (Instability / 100) ^ Exp * Mult
            let p20 = Math.pow(20 / 100, exp) * mult;
            let p50 = Math.pow(50 / 100, exp) * mult;
            let p80 = Math.pow(80 / 100, exp) * mult;

            mathPct20.textContent = Math.min(100.0, p20 * 100.0).toFixed(1) + '%';
            mathPct50.textContent = Math.min(100.0, p50 * 100.0).toFixed(1) + '%';
            mathPct80.textContent = Math.min(100.0, p80 * 100.0).toFixed(1) + '%';
        }
    }

    function resetAdminSettings() {
        selectGameMode.value = 'standard';
        slideExponent.value = 2.5;
        slideMultiplier.value = 1.0;
        slideWinRate.value = 25;
        toggleAdminUIMode('standard');
        calculateAdminMath();
    }

    function saveAdminSettings() {
        gameMode = selectGameMode.value;
        riskExponent = parseFloat(slideExponent.value);
        difficultyMultiplier = parseFloat(slideMultiplier.value);
        targetWinRate = parseFloat(slideWinRate.value) / 100.0;

        localStorage.setItem('alchemist_game_mode', gameMode);
        localStorage.setItem('alchemist_risk_exponent', riskExponent.toFixed(1));
        localStorage.setItem('alchemist_difficulty_multiplier', difficultyMultiplier.toFixed(1));
        localStorage.setItem('alchemist_target_win_rate', targetWinRate.toFixed(2));

        adminModal.classList.add('hidden');
        cauldronStatus.textContent = "Admin-Einstellungen gespeichert!";
        cauldronStatus.className = "status-message ready";
        setTimeout(() => {
            if (gameState === 'IDLE') {
                cauldronStatus.textContent = "Mische die Zutaten im Kessel";
            }
        }, 2000);
    }

    // ==========================================================================
    // BET CALCULATIONS & ROUND MANAGEMENT
    // ==========================================================================

    function setBet(amount) {
        if (gameState !== 'IDLE') return;
        bet = parseFloat(amount);
        if (bet > balance) bet = balance;
        if (bet < 1.00) bet = 1.00;
        betInput.value = bet.toFixed(2);
        validateBetInput();
    }

    function validateBetInput() {
        let val = parseFloat(betInput.value);
        if (isNaN(val) || val < 1.00) {
            val = 1.00;
        } else if (val > balance) {
            val = balance;
        } else if (val > 500) {
            val = 500;
        }
        bet = val;
        betInput.value = bet.toFixed(2);
        updateSafetyValveCost();
    }

    function updateSafetyValveCost() {
        if (safetyValveCostEl) {
            safetyValveCostEl.textContent = (bet * 0.20).toFixed(2) + " €";
        }
    }

    function validateAutoCashoutInput() {
        let val = parseFloat(autoCashoutVal.value);
        if (isNaN(val) || val < 1.05) {
            val = 1.05;
        } else if (val > 100.0) {
            val = 100.0;
        }
        autoCashoutVal.value = val.toFixed(2);
    }

    function updateBalanceDisplay() {
        balanceAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
    }

    // Starts a new game round
    function startBrewing() {
        initAudio();
        validateBetInput();

        let safetyValveBought = chkSafetyValve && chkSafetyValve.checked;
        let finalBetCost = bet;
        if (safetyValveBought) {
            finalBetCost += bet * 0.20;
            isSafetyValveActive = true;
        } else {
            isSafetyValveActive = false;
        }

        if (balance < finalBetCost) {
            alert("Nicht genügend Guthaben für Einsatz inkl. Sicherheits-Ventil!");
            return;
        }

        // Deduct bet from balance
        balance -= finalBetCost;
        updateBalanceDisplay();

        // Quest progress
        window.AlchemistShared.progressQuest('cauldron_rounds', 1);

        // Reset music state
        window.AlchemistShared.setMusicState(0.0, 60);

        // Reset state variables
        gameState = 'BREWING';
        multiplier = 1.00;
        instability = 0;
        addedCount = 0;
        dragonBloodCount = 0;
        wildcardActiveType = null;
        activeWildcardShield = false;

        activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false, catalyst: false, detector: false, magnet: false, bellows: false };

        // Duel Mode Initialisation
        if (isDuelMode) {
            npcState = 'BREWING';
            npcMultiplier = 1.00;
            npcThreshold = npcId === 'ignis' ? (1.3 + Math.random() * 0.5) : npcId === 'aurelius' ? (2.5 + Math.random() * 2.0) : (5.0 + Math.random() * 6.0);
            
            if (duelStatusBadge) {
                duelStatusBadge.classList.remove('hidden');
                duelNpcName.textContent = npcId === 'ignis' ? 'Novize Ignis' : npcId === 'aurelius' ? 'Gildemeister Aurelius' : 'Erz-Alchemistin Shadow';
                duelNpcIcon.textContent = npcId === 'ignis' ? '🔥' : npcId === 'aurelius' ? '👑' : '🌌';
                duelNpcMultiplier.textContent = '1.00x';
                duelNpcState.textContent = '(Braut...)';
                duelNpcState.style.color = '#00f0ff';
            }
        } else {
            if (duelStatusBadge) duelStatusBadge.classList.add('hidden');
            npcState = 'IDLE';
        }

        // Casino Mode Pre-determination
        if (gameMode === 'casino') {
            let roll = Math.random();
            if (roll < targetWinRate) {
                roundOutcome = 'win';
                lossTriggerStep = null;
            } else {
                roundOutcome = 'loss';
                // Cauldron will explode on step 1, 2, 3 or 4
                lossTriggerStep = Math.floor(Math.random() * 4) + 1;
            }
        } else {
            roundOutcome = null;
            lossTriggerStep = null;
        }
        
        if (equippedTheme === 'ice') {
            currentPotionColor = '#00f0ff';
        } else if (equippedTheme === 'volcano') {
            currentPotionColor = '#ff4d00';
        } else {
            currentPotionColor = '#13ad89';
        }
        
        wildcardBanner.classList.add('hidden');

        // UI updates
        btnStart.classList.add('hidden');
        btnCashout.classList.remove('hidden');
        btnCashout.disabled = true; 
        betInput.disabled = true;
        chkAutoCashout.disabled = true;
        autoCashoutVal.disabled = true;
        if (chkSafetyValve) chkSafetyValve.disabled = true;
        allIngredientBtns.forEach(btn => btn.disabled = false);

        btnBetMin.disabled = true;
        btnBetHalf.disabled = true;
        btnBetDouble.disabled = true;
        btnBetMax.disabled = true;

        multiplierDisplay.classList.remove('hidden');
        currentMultiplierEl.textContent = "1.00x";
        currentMultiplierEl.className = 'multiplier-number';
        updateCashoutButtonText();

        cauldronStatus.textContent = "Der Kessel erhitzt sich. Zutaten hinzufügen!";
        cauldronStatus.className = "status-message cooking";
        
        updateInstabilityMeter();

        if (bubbleTimeout) clearTimeout(bubbleTimeout);
        triggerAmbientBubbles();
    }

    // Handles adding ingredients to the Cauldron
    function addIngredient(type) {
        if (gameState !== 'BREWING') return;
        initAudio();

        const ingredient = INGREDIENTS[type];
        if (!ingredient) return;

        addedCount++;
        if (type === 'blood') {
            dragonBloodCount++;
            window.AlchemistShared.progressQuest('cauldron_dragon', 1);
        }

        let instInc = ingredient.instability;

        // Apply Hermes Potion (-15% instability increment)
        let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
        if (activePotions && activePotions.hermes > 0) {
            instInc = instInc * 0.85;
        }

        // V3.0 Apply Passive copper filter reduction (reduces increase by 10%)
        if (activeUpgrades.copper) {
            instInc = instInc * 0.9;
        }

        // Apply Ice-Tincture Recipe passive (-5% instability increment)
        if (window.AlchemistShared && window.AlchemistShared.hasRecipe('ice_tincture')) {
            instInc = instInc * 0.95;
        }

        // V2.0 Wildcard Roller (10% chance)
        let wildcardRoll = Math.random() < 0.10;
        if (wildcardRoll) {
            triggerWildcardEvent();
        }

        // Apply Frost-Schild if active
        if (activeWildcardShield) {
            instInc = 0;
            activeWildcardShield = false; 
        }

        // Apply multiplier
        multiplier = multiplier * ingredient.mult;
        
        // If Glücks-Katalysator was rolled, double the current multiplier!
        if (wildcardActiveType === 'catalyst') {
            multiplier *= 2.0;
            wildcardActiveType = null; 
        }

        instability += instInc;
        instability = Math.round(instability * 10) / 10;

        // Music state update
        window.AlchemistShared.setMusicState(instability / 100.0, 60 + Math.round((instability / 100.0) * 80));

        // V3.0 XP gained on adding ingredient
        addXP(5);

        // Visual effects trigger
        playSizzleSound();
        triggerRippleEffect(ingredient.color);
        triggerVaporBurst(ingredient.color);

        currentPotionColor = blendColors(currentPotionColor, ingredient.color, 0.45);

        currentMultiplierEl.textContent = multiplier.toFixed(2) + "x";
        currentMultiplierEl.classList.remove('pop-anim');
        void currentMultiplierEl.offsetWidth; 
        currentMultiplierEl.classList.add('pop-anim');

        updateCashoutButtonText();
        btnCashout.disabled = false; 

        checkLiveAchievements();

        // Check for explosion
        let exploded = checkExplosion();
        if (exploded) {
            triggerExplosion();
        } else {
            updateInstabilityMeter();
            cauldronStatus.textContent = `${ingredient.name} hinzugefügt!`;

            // Duel Mode Live NPC choice
            if (isDuelMode && npcState === 'BREWING') {
                npcMultiplier = multiplier;
                if (npcMultiplier >= npcThreshold) {
                    npcState = 'CASHED_OUT';
                    if (duelNpcState) {
                        duelNpcState.textContent = '(Ausgezahlt!)';
                        duelNpcState.style.color = '#39ff14';
                    }
                    window.AlchemistShared.showToast(`${npcId === 'ignis' ? 'Novize Ignis' : npcId === 'aurelius' ? 'Gildemeister Aurelius' : 'Erz-Alchemistin Shadow'} hat bei ${npcMultiplier.toFixed(2)}x ausgezahlt!`);
                }
                if (duelNpcMultiplier) {
                    duelNpcMultiplier.textContent = npcMultiplier.toFixed(2) + 'x';
                }
            }
            
            if (multiplier >= 8.0) {
                currentMultiplierEl.className = 'multiplier-number color-matter';
            } else if (multiplier >= 4.0) {
                currentMultiplierEl.className = 'multiplier-number color-blood';
            } else if (multiplier >= 2.0) {
                currentMultiplierEl.className = 'multiplier-number color-feather';
            }

            // V2.0 Auto-Cashout check
            if (chkAutoCashout.checked) {
                let limit = parseFloat(autoCashoutVal.value);
                if (multiplier >= limit) {
                    cauldronStatus.textContent = "Auto-Auszahlung ausgelöst...";
                    setTimeout(cashOut, 400);
                }
            }
        }
    }

    // Handles Version 2.0 Wildcard Triggers
    function triggerWildcardEvent() {
        const types = ['frost', 'stability', 'catalyst'];
        const rolledType = types[Math.floor(Math.random() * types.length)];
        
        wildcardActiveType = rolledType;
        playWildcardSound();
        
        wildcardBanner.className = "wildcard-banner";
        wildcardBanner.classList.add(rolledType);

        if (rolledType === 'frost') {
            wildcardIcon.textContent = "❄️";
            wildcardTitle.textContent = "FROST-SCHILD!";
            wildcardDesc.textContent = "0% Instabilität durch die nächste Zutat.";
            activeWildcardShield = true;
            currentPotionColor = blendColors(currentPotionColor, '#00f0ff', 0.5);
        } else if (rolledType === 'stability') {
            wildcardIcon.textContent = "🧪";
            wildcardTitle.textContent = "STABILITÄTS-BOOST!";
            wildcardDesc.textContent = "Kessel-Instabilität sinkt sofort um -15%.";
            instability = Math.max(0, instability - 15);
            for (let i = 0; i < 20; i++) {
                spawnParticle(300 + (Math.random()-0.5)*120, 260, 'bubble', '#39ff14');
            }
        } else if (rolledType === 'catalyst') {
            wildcardIcon.textContent = "✨";
            wildcardTitle.textContent = "GLÜCKS-KATALYSATOR!";
            wildcardDesc.textContent = "Zutaten-Wert für diesen Schritt VERDOPPELT!";
            catalystSparks = true;
            setTimeout(() => catalystSparks = false, 1500);
        }

        wildcardBanner.classList.remove('hidden');
        unlockAchievement('lucky');

        setTimeout(() => {
            wildcardBanner.classList.add('hidden');
        }, 3000);
    }

    // Calculates explosion probability based on current instability
    function checkExplosion() {
        if (instability >= 100) {
            if (isSafetyValveActive) {
                triggerSafetyValveTriggered();
                return false;
            }
            return true;
        }
        
        if (gameMode === 'casino') {
            if (roundOutcome === 'loss' && addedCount >= lossTriggerStep) {
                if (isSafetyValveActive) {
                    triggerSafetyValveTriggered();
                    return false;
                }
                return true;
            }
            return false;
        } else {
            let probability = Math.pow(instability / 100, riskExponent) * difficultyMultiplier;
            let roll = Math.random();
            let explodes = roll < probability;
            if (explodes) {
                if (isSafetyValveActive) {
                    triggerSafetyValveTriggered();
                    return false;
                }
                return true;
            }
            return false;
        }
    }

    function triggerSafetyValveTriggered() {
        isSafetyValveActive = false;
        instability = 0;
        updateInstabilityMeter();
        
        // Visual effects
        playSizzleSound();
        triggerVaporBurst('#00ffff');
        liquidOffset = 25; // wave splash
        
        cauldronStatus.textContent = "🛡️ SCHUTZVENTIL AUSGELÖST! Kessel abgekühlt!";
        cauldronStatus.className = "status-message ready";
        
        window.AlchemistShared.showToast("🛡️ Sicherheitsventil verbraucht! Kessel stabilisiert.");
        window.AlchemistShared.setMusicState(0.0, 60); // reset music
    }

    // Triggered when cauldron explodes
    function triggerExplosion() {
        gameState = 'EXPLODED';
        if (bubbleTimeout) clearTimeout(bubbleTimeout);

        window.AlchemistShared.setMusicState(0.0, 60);

        playExplosionSound();
        screenShake = 30; 
        createExplosionParticles();

        instability = 100;
        updateInstabilityMeter();

        if (isDuelMode) {
            cauldronStatus.textContent = "💥 EXPLODIERT! Duell verloren! ❌";
            if (duelNpcState) {
                duelNpcState.textContent = npcState === 'BREWING' ? '(Ausgezahlt!)' : `(Ausgezahlt bei ${npcMultiplier.toFixed(2)}x)`;
                duelNpcState.style.color = '#39ff14';
            }
        } else {
            cauldronStatus.textContent = "💥 EXPLODIERT!";
        }
        cauldronStatus.className = "status-message exploded";
        currentMultiplierEl.className = 'multiplier-number color-danger';

        btnCashout.classList.add('hidden');
        btnStart.classList.remove('hidden');
        
        addHistoryBadge('loss', '0.00x');

        window.AlchemistShared.recordPlay('cauldron', 0, bet, 0.0);
        loadStatsFromShared();
        updateStatsDisplay();

        endGameReset();
    }

    // Cash out current winnings
    function cashOut() {
        if (gameState !== 'BREWING' || multiplier <= 1.00) return;
        initAudio();

        gameState = 'CASHED_OUT';
        if (bubbleTimeout) clearTimeout(bubbleTimeout);

        playCashoutSound();
        
        let payoutMult = multiplier;
        if (activeUpgrades.crystal) {
            payoutMult = payoutMult * 1.1;
        }

        let baseWinAmount = bet * payoutMult;
        
        // Hide normal Cashout button and disable controls during gamble
        btnCashout.classList.add('hidden');
        
        window.AlchemistShared.setMusicState(0.0, 60);

        if (isDuelMode) {
            // Resolve NPC if they are still brewing
            if (npcState === 'BREWING') {
                let tempInstability = instability;
                let tempMultiplier = multiplier;
                
                while (npcState === 'BREWING') {
                    let mult = 1.0;
                    if (activeUpgrades.copper) mult *= 0.9;
                    if (window.AlchemistShared && window.AlchemistShared.hasRecipe('ice_tincture')) mult *= 0.95;
                    tempInstability += 15 * mult;
                    tempMultiplier *= 1.40;
                    
                    if (tempInstability >= 100) {
                        npcState = 'EXPLODED';
                    } else {
                        let probability = Math.pow(tempInstability / 100, riskExponent) * difficultyMultiplier;
                        if (Math.random() < probability) {
                            npcState = 'EXPLODED';
                        } else if (tempMultiplier >= npcThreshold) {
                            npcState = 'CASHED_OUT';
                            npcMultiplier = tempMultiplier;
                        }
                    }
                }
            }

            if (duelNpcMultiplier) duelNpcMultiplier.textContent = npcMultiplier.toFixed(2) + 'x';
            
            let duelWinAmount = 0;
            let duelOutcomeText = "";
            let duelOutcomeType = "loss";

            if (npcState === 'EXPLODED') {
                if (duelNpcState) {
                    duelNpcState.textContent = '(Explodiert!)';
                    duelNpcState.style.color = 'var(--color-danger)';
                }
                duelWinAmount = bet * 2.0;
                duelOutcomeText = `Duell gewonnen! Gegner explodiert. Gewinn: ${duelWinAmount.toFixed(2)} € 🎉`;
                duelOutcomeType = "win";
            } else {
                if (duelNpcState) {
                    duelNpcState.textContent = `(Ausgezahlt bei ${npcMultiplier.toFixed(2)}x)`;
                    duelNpcState.style.color = '#39ff14';
                }
                
                if (multiplier > npcMultiplier) {
                    duelWinAmount = bet * 2.0;
                    duelOutcomeText = `Duell gewonnen! Höher abgefüllt (${multiplier.toFixed(2)}x vs ${npcMultiplier.toFixed(2)}x). Gewinn: ${duelWinAmount.toFixed(2)} € 🎉`;
                    duelOutcomeType = "win";
                } else {
                    duelWinAmount = 0;
                    duelOutcomeText = `Duell verloren! Gegner hat höher abgefüllt (${npcMultiplier.toFixed(2)}x vs ${multiplier.toFixed(2)}x). ❌`;
                    duelOutcomeType = "loss";
                }
            }

            if (duelOutcomeType === "win" && activeUpgrades.crystal) {
                duelWinAmount *= 1.1;
                duelOutcomeText += " (+10% Kristall-Bonus!)";
            }

            if (duelWinAmount > 0) {
                balance += duelWinAmount;
                updateBalanceDisplay();
                cauldronStatus.textContent = duelOutcomeText;
                cauldronStatus.className = "status-message ready";
                addHistoryBadge('gold-win', (duelWinAmount / bet).toFixed(2) + 'x');
                stats.totalWins++;
                createCashoutParticles();
            } else {
                cauldronStatus.textContent = duelOutcomeText;
                cauldronStatus.className = "status-message exploded";
                addHistoryBadge('loss', '0.00x');
            }

            let achievedMult = duelWinAmount > 0 ? (duelWinAmount / bet) : 0.0;
            window.AlchemistShared.recordPlay('cauldron', duelWinAmount, bet, achievedMult);
            loadStatsFromShared();

            let xpGained = Math.round(25 * achievedMult);
            if (xpGained > 0) addXP(xpGained);

            checkEndGameAchievements();
            updateStatsDisplay();
            btnStart.classList.remove('hidden');
            endGameReset();
            return;
        }

        // Trigger shared alchemist gamble modal!
        window.AlchemistShared.triggerGamble(baseWinAmount, (finalAmount) => {
            if (finalAmount > 0) {
                balance += finalAmount;
                updateBalanceDisplay();
                
                cauldronStatus.textContent = `Trank abgefüllt! Gewinn: ${finalAmount.toFixed(2)} € 🎉`;
                cauldronStatus.className = "status-message ready";
                
                let winType = finalAmount >= (bet * 5.0) ? 'gold-win' : 'win';
                addHistoryBadge(winType, (finalAmount / bet).toFixed(2) + 'x');
                stats.totalWins++;
                
                // Quest Progress (mult achieved)
                window.AlchemistShared.progressQuest('cauldron_mult', finalAmount / bet);
                
                createCashoutParticles();
            } else {
                cauldronStatus.textContent = "Trank verdampft! Der Kessel hat den Gewinn verschlungen. 💥";
                cauldronStatus.className = "status-message exploded";
                addHistoryBadge('loss', '0.00x');
            }

            // Stats updating
            let achievedMult = finalAmount > 0 ? (finalAmount / bet) : multiplier;
            window.AlchemistShared.recordPlay('cauldron', finalAmount, bet, achievedMult);
            loadStatsFromShared();

            // XP Gained
            let xpGained = Math.round(25 * (finalAmount > 0 ? (finalAmount / bet) : 0));
            if (xpGained > 0) {
                addXP(xpGained);
            }

            checkEndGameAchievements();
            updateStatsDisplay();
            
            btnStart.classList.remove('hidden');
            endGameReset();
        });
    }

    // Reset controls after round ends
    function endGameReset() {
        betInput.disabled = false;
        chkAutoCashout.disabled = false;
        if (chkAutoCashout.checked) autoCashoutVal.disabled = false;
        if (chkSafetyValve) chkSafetyValve.disabled = false;
        allIngredientBtns.forEach(btn => btn.disabled = true);

        btnBetMin.disabled = false;
        btnBetHalf.disabled = false;
        btnBetDouble.disabled = false;
        btnBetMax.disabled = false;

        if (balance < 1.00) {
            setTimeout(autoRechargeBalance, 1800);
        }
    }

    function autoRechargeBalance() {
        balance = 1000.00;
        updateBalanceDisplay();
        
        cauldronStatus.textContent = "Guthaben aufgeladen! (+1000 €)";
        cauldronStatus.className = "status-message ready";
        
        const balanceCard = document.querySelector('.balance-card');
        balanceCard.style.borderColor = 'var(--color-green)';
        balanceCard.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.4)';
        setTimeout(() => {
            balanceCard.style.borderColor = '';
            balanceCard.style.boxShadow = '';
        }, 1500);
    }

    function updateCashoutButtonText() {
        let previewMultiplier = multiplier;
        if (activeUpgrades.crystal) {
            previewMultiplier = previewMultiplier * 1.1;
        }
        let winPreview = bet * previewMultiplier;
        cashoutPreview.textContent = winPreview.toFixed(2) + " €";
    }

    function updateInstabilityMeter() {
        instabilityValEl.textContent = `${instability}%`;
        instabilityBar.style.width = `${instability}%`;

        if (instability >= 75) {
            warningText.textContent = "⚠️ Kessel steht kurz vor der Explosion!";
            warningText.className = "meter-warning-text danger";
            instabilityBar.style.background = 'var(--color-danger)';
            instabilityBar.style.boxShadow = '0 0 10px var(--color-danger)';
        } else if (instability >= 40) {
            warningText.textContent = "⚡ Potion brodelt heftig...";
            warningText.className = "meter-warning-text warning";
            instabilityBar.style.background = 'var(--color-gold)';
            instabilityBar.style.boxShadow = '0 0 8px var(--color-gold)';
        } else {
            warningText.textContent = gameState === 'BREWING' ? "✔ Stabil" : "Stabil & bereit";
            warningText.className = "meter-warning-text";
            instabilityBar.style.background = 'linear-gradient(to right, var(--color-green), var(--color-cyan))';
            instabilityBar.style.boxShadow = '0 0 5px var(--color-green)';
        }
    }

    // ==========================================================================
    // HISTORY SYSTEM
    // ==========================================================================
    
    function addHistoryBadge(type, value) {
        history.unshift({ type, value });
        if (history.length > 8) history.pop();
        localStorage.setItem('alchemist_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Keine Tränke gebraut</div>';
            return;
        }

        history.forEach(item => {
            const badge = document.createElement('div');
            badge.className = `history-badge ${item.type}`;
            badge.textContent = item.value;
            historyList.appendChild(badge);
        });
    }

    // ==========================================================================
    // STATS & CANVAS-BASED LINE CHART
    // ==========================================================================

    function updateStatsDisplay() {
        statRoundsEl.textContent = stats.totalRounds;
        
        let rate = stats.totalRounds > 0 ? Math.round((stats.totalWins / stats.totalRounds) * 100) : 0;
        statWinsEl.textContent = `${rate}%`;
        
        statRecordEl.textContent = `${stats.highestMultiplier.toFixed(2)}x`;
        
        if (tabBtnStats.classList.contains('active')) {
            drawBalanceChart();
        }
    }

    function drawBalanceChart() {
        const cCanvas = document.getElementById('stats-chart');
        if (!cCanvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = cCanvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width) || 330;
        const displayHeight = Math.round(rect.height) || 130;

        cCanvas.width = displayWidth * dpr;
        cCanvas.height = displayHeight * dpr;

        const c = cCanvas.getContext('2d');
        c.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = displayWidth;
        const h = displayHeight;

        c.clearRect(0, 0, w, h);

        let historyData = stats.balanceHistory;
        if (historyData.length === 1) {
            historyData = [1000, historyData[0]]; 
        }

        let min = Math.min(...historyData) * 0.95;
        let max = Math.max(...historyData) * 1.05;
        if (max - min < 20) {
            min = Math.max(0, min - 10);
            max += 10;
        }

        const padding = 14;
        const chartW = w - (padding * 2);
        const chartH = h - (padding * 2);

        const points = [];
        for (let i = 0; i < historyData.length; i++) {
            let val = historyData[i];
            let x = padding + (chartW / (historyData.length - 1)) * i;
            let y = padding + chartH - ((val - min) / (max - min)) * chartH;
            points.push({ x, y, val });
        }

        c.strokeStyle = 'rgba(138, 43, 226, 0.08)';
        c.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            let y = padding + (chartH / 4) * i;
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(w, y);
            c.stroke();
        }

        c.beginPath();
        c.moveTo(points[0].x, padding + chartH);
        for (let i = 0; i < points.length; i++) {
            c.lineTo(points[i].x, points[i].y);
        }
        c.lineTo(points[points.length - 1].x, padding + chartH);
        c.closePath();

        let areaGrad = c.createLinearGradient(0, 0, 0, h);
        areaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
        areaGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
        c.fillStyle = areaGrad;
        c.fill();

        c.beginPath();
        c.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            c.lineTo(points[i].x, points[i].y);
        }
        c.strokeStyle = '#00f0ff';
        c.lineWidth = 2.5;
        c.stroke();

        points.forEach((p, idx) => {
            c.beginPath();
            c.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            c.fillStyle = idx === points.length - 1 ? '#ffd700' : '#00f0ff';
            c.shadowColor = idx === points.length - 1 ? '#ffd700' : '#00f0ff';
            c.shadowBlur = 6;
            c.fill();
            c.shadowBlur = 0; 

            if (idx === 0 || idx === points.length - 1) {
                c.fillStyle = '#5c5270';
                c.font = '8px Outfit, sans-serif';
                c.fillText(`${Math.round(p.val)}€`, p.x - 12, p.y - 8);
            }
        });
    }

    // ==========================================================================
    // ACHIEVEMENT TOASTS & BOOK
    // ==========================================================================

    function checkLiveAchievements() {
        if (multiplier >= 8.00) {
            unlockAchievement('master');
        }
        if (dragonBloodCount >= 3) {
            unlockAchievement('dragon');
        }
    }

    function checkEndGameAchievements() {
        if (stats.totalWins >= 5) {
            unlockAchievement('hermes');
        }
        if (instability >= 80) {
            unlockAchievement('volcano');
        }
    }

    function unlockAchievement(id) {
        if (achievements[id]) return; 

        achievements[id] = true;
        localStorage.setItem('alchemist_achievements', JSON.stringify(achievements));
        
        playAchievementUnlockSound();
        showAchievementToast(ACHIEVEMENT_DEFS[id]);
        
        addXP(200);

        renderAchievements();
        updateStatsDisplay();
    }

    function showAchievementToast(def) {
        const toast = document.createElement('div');
        toast.className = 'toast-achievement';
        toast.innerHTML = `
            <div class="toast-icon-box">${def.icon}</div>
            <div class="toast-details">
                <h4>ERFOLG FREIGESCHALTET!</h4>
                <h3>${def.title}</h3>
                <p>${def.desc}</p>
            </div>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    function renderAchievements() {
        achievementsListEl.innerHTML = '';
        
        Object.keys(ACHIEVEMENT_DEFS).forEach(key => {
            const def = ACHIEVEMENT_DEFS[key];
            const unlocked = achievements[key];
            
            const item = document.createElement('div');
            item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="ach-icon-box">${unlocked ? def.icon : '🔒'}</div>
                <div class="ach-details">
                    <h5>${def.title}</h5>
                    <p>${def.desc}</p>
                </div>
            `;
            achievementsListEl.appendChild(item);
        });
    }

    // ==========================================================================
    // MULTIPLAYER SIMULATOR (TICKER FEED)
    // ==========================================================================

    const PLAYER_NAMES = [
        'Eldrin_der_Weise', 'ZaubererZephyr', 'MageLuna', 'HexerBob', 
        'Gandalf_69', 'AlchemistRex', 'ValeriaStar', 'MorganaLaFay', 
        'KesselMeister', 'DruidePanoramix'
    ];

    function simulatePlayerActivity() {
        const name = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
        const actionType = Math.random();
        
        let item = document.createElement('div');
        
        if (actionType < 0.35) {
            item.className = 'ticker-item brew';
            item.innerHTML = `
                <span class="ticker-name">${name}</span>
                <span class="ticker-action">heizt den Kessel an...</span>
                <span class="ticker-multi">🧪</span>
            `;
        } else if (actionType < 0.70) {
            let multi = 1.15 + (Math.random() * 3.5);
            item.className = 'ticker-item win';
            item.innerHTML = `
                <span class="ticker-name">${name}</span>
                <span class="ticker-action">abgefüllt</span>
                <span class="ticker-multi win">${multi.toFixed(2)}x</span>
            `;
        } else {
            let hit = 35 + Math.floor(Math.random() * 60);
            item.className = 'ticker-item loss';
            item.innerHTML = `
                <span class="ticker-name">${name}</span>
                <span class="ticker-action">explodiert bei ${hit}%</span>
                <span class="ticker-multi loss">💥</span>
            `;
        }

        tickerFeed.prepend(item);

        if (tickerFeed.children.length > 4) {
            tickerFeed.lastElementChild.remove();
        }
    }

    // ==========================================================================
    // GRAPHICS ENGINE (CANVAS THEMES & RENDERING)
    // ==========================================================================

    class Particle {
        constructor(x, y, type, color = '#ffffff') {
            this.init(x, y, type, color);
        }
        
        init(x, y, type, color = '#ffffff') {
            this.x = x;
            this.y = y;
            this.type = type; 
            this.color = color;
            this.gravity = 0;
            
            if (type === 'bubble') {
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = -(0.8 + Math.random() * 1.4);
                this.radius = 2.5 + Math.random() * 4.5;
                this.alpha = 0.5 + Math.random() * 0.4;
                this.wobbleSpeed = 0.04 + Math.random() * 0.05;
                this.wobbleRange = 0.8 + Math.random() * 2;
                this.wobbleOffset = Math.random() * Math.PI * 2;
                this.decay = 0;
            } else if (type === 'steam') {
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = -(0.4 + Math.random() * 0.8);
                this.radius = 8 + Math.random() * 14;
                this.alpha = 0.15 + Math.random() * 0.25;
                this.decay = 0.003 + Math.random() * 0.004;
                this.wobbleSpeed = 0;
                this.wobbleRange = 0;
                this.wobbleOffset = 0;
            } else if (type === 'flame') {
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = -(1.2 + Math.random() * 1.8);
                this.radius = 3 + Math.random() * 4;
                this.alpha = 0.8;
                this.decay = 0.02 + Math.random() * 0.02;
                this.wobbleSpeed = 0;
                this.wobbleRange = 0;
                this.wobbleOffset = 0;
            } else if (type === 'explosion') {
                let angle = Math.random() * Math.PI * 2;
                let speed = 1.5 + Math.random() * 7;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - (1 + Math.random() * 3);
                this.radius = 3.5 + Math.random() * 7;
                this.alpha = 1.0;
                this.decay = 0.008 + Math.random() * 0.015;
                this.gravity = 0.12;
                this.wobbleSpeed = 0;
                this.wobbleRange = 0;
                this.wobbleOffset = 0;
            } else if (type === 'spark') {
                let angle = Math.random() * Math.PI * 2;
                let speed = 1.0 + Math.random() * 4;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 0.5;
                this.radius = 1.5 + Math.random() * 2;
                this.alpha = 1.0;
                this.decay = 0.015 + Math.random() * 0.02;
                this.wobbleSpeed = 0;
                this.wobbleRange = 0;
                this.wobbleOffset = 0;
            }
        }
        
        update() {
            if (this.type === 'bubble') {
                this.x += this.vx + Math.sin(Date.now() * this.wobbleSpeed + this.wobbleOffset) * 0.08;
                this.y += this.vy;
                if (this.y < 255) { 
                    this.alpha = 0;
                }
            } else if (this.type === 'steam') {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
                this.radius += 0.15;
            } else if (this.type === 'flame') {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
                this.radius = Math.max(0.1, this.radius - 0.1);
            } else if (this.type === 'explosion') {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.alpha -= this.decay;
                this.radius = Math.max(0.1, this.radius - 0.04);
            } else if (this.type === 'spark') {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
                this.radius = Math.max(0.1, this.radius - 0.02);
            }
        }
        
        draw(c) {
            if (this.alpha <= 0) return;
            c.save();
            c.globalAlpha = this.alpha;
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            if (this.type === 'bubble') {
                c.strokeStyle = this.color;
                c.lineWidth = 1.2;
                c.stroke();
                c.beginPath();
                c.arc(this.x - this.radius*0.3, this.y - this.radius*0.3, this.radius*0.2, 0, Math.PI*2);
                c.fillStyle = '#ffffff';
                c.fill();
            } else if (this.type === 'steam') {
                let grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                grad.addColorStop(0, this.color);
                grad.addColorStop(1, 'transparent');
                c.fillStyle = grad;
                c.fill();
            } else if (this.type === 'flame') {
                let colors = ['#ff4500', '#ff8c00', '#ffd700']; 
                if (equippedTheme === 'ice') {
                    colors = ['#00bfff', '#00f0ff', '#e0ffff']; 
                } else if (equippedTheme === 'volcano') {
                    colors = ['#ff2200', '#ff5500', '#ffaa00']; 
                }
                c.fillStyle = colors[Math.floor(this.alpha * 3.9) % 3] || colors[0];
                if (equippedTheme === 'ice') {
                    c.shadowColor = '#00f0ff';
                    c.shadowBlur = 8;
                }
                c.fill();
            } else if (this.type === 'explosion') {
                let grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                if (equippedTheme === 'ice') {
                    grad.addColorStop(0, '#e0ffff');
                    grad.addColorStop(0.3, '#00f0ff');
                    grad.addColorStop(0.8, '#4169e1');
                } else {
                    grad.addColorStop(0, this.color);
                    grad.addColorStop(0.3, '#ff8c00');
                    grad.addColorStop(0.8, '#ff0000');
                }
                grad.addColorStop(1, 'transparent');
                c.fillStyle = grad;
                c.fill();
            } else if (this.type === 'spark') {
                c.fillStyle = this.color;
                c.shadowColor = this.color;
                c.shadowBlur = 8;
                c.fill();
            }
            c.restore();
        }
    }

    // Ripple wave effect in the liquid
    function triggerRippleEffect(color) {
        liquidOffset = 25; 
    }

    // Burst of colorful vapor on ingredient drop
    function triggerVaporBurst(color) {
        for (let i = 0; i < 20; i++) {
            let x = 300 + (Math.random() - 0.5) * 160;
            let y = 255 + (Math.random() - 0.5) * 15;
            spawnParticle(x, y, 'steam', color);
        }
    }

    function createExplosionParticles() {
        let pColor = equippedTheme === 'ice' ? '#00f0ff' : '#ff4d00';
        for (let i = 0; i < 80; i++) {
            spawnParticle(300, 390, 'explosion', pColor);
        }
        let sparkColor = equippedTheme === 'ice' ? '#ffffff' : '#ffd700';
        for (let i = 0; i < 40; i++) {
            spawnParticle(300, 390, 'spark', sparkColor);
        }
    }

    function createCashoutParticles() {
        for (let i = 0; i < 40; i++) {
            let x = 300 + (Math.random() - 0.5) * 180;
            let y = 255 + (Math.random() - 0.5) * 20;
            spawnParticle(x, y, 'spark', Math.random() > 0.5 ? 'var(--color-cyan)' : 'var(--color-gold)');
        }
    }

    // Renders everything at 60fps
    function renderLoop() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width) || 600;
        const displayHeight = Math.round(rect.height) || 600;

        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
        }
        
        const scaleX = (displayWidth * dpr) / 600;
        const scaleY = (displayHeight * dpr) / 600;
        ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

        ctx.clearRect(0, 0, 600, 600);
        
        ctx.save();
        if (screenShake > 0) {
            let dx = (Math.random() - 0.5) * screenShake;
            let dy = (Math.random() - 0.5) * screenShake;
            ctx.translate(dx, dy);
            screenShake *= 0.9; 
            if (screenShake < 0.2) screenShake = 0;
        }

        drawBurnerFlames();
        drawBackRim();

        if (gameState !== 'EXPLODED') {
            drawLiquid();
        }

        // Optimized Zero-Allocation Particle Update & Pooling
        let activeCount = 0;
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.update();
            if (p.alpha > 0) {
                p.draw(ctx);
                particles[activeCount++] = p;
            } else {
                if (particlePool.length < 500) {
                    particlePool.push(p);
                }
            }
        }
        particles.length = activeCount;

        drawCauldronBody();
        drawFrontRim();
        generateParticles();

        ctx.restore();
        
        requestAnimationFrame(renderLoop);
    }

    function drawBurnerFlames() {
        ctx.save();
        ctx.strokeStyle = equippedTheme === 'ice' ? '#1c283f' : '#150f24';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(200, 520);
        ctx.lineTo(240, 560);
        ctx.lineTo(360, 560);
        ctx.lineTo(400, 520);
        ctx.stroke();

        ctx.strokeStyle = equippedTheme === 'ice' ? '#0b1322' : '#090510';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(250, 560);
        ctx.lineTo(250, 580);
        ctx.moveTo(350, 560);
        ctx.lineTo(350, 580);
        ctx.stroke();
        ctx.restore();
    }

    function drawBackRim() {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(300, 255, 120, 24, 0, Math.PI, 0); 
        if (equippedTheme === 'ice') {
            ctx.fillStyle = '#08172b';
        } else if (equippedTheme === 'volcano') {
            ctx.fillStyle = '#1c0c08';
        } else {
            ctx.fillStyle = '#0f0c18';
        }
        ctx.fill();
        ctx.restore();
    }

    function drawFrontRim() {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(300, 255, 120, 24, 0, 0, Math.PI); 
        ctx.lineWidth = 6;
        if (equippedTheme === 'ice') {
            ctx.strokeStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
        } else if (equippedTheme === 'volcano') {
            ctx.strokeStyle = '#3d251d';
        } else {
            ctx.strokeStyle = '#2b2440';
        }
        ctx.stroke();
        ctx.shadowBlur = 0; 

        ctx.beginPath();
        ctx.ellipse(300, 255, 118, 22, 0, 0.2 * Math.PI, 0.8 * Math.PI);
        if (equippedTheme === 'ice') {
            ctx.strokeStyle = '#e0ffff';
        } else if (equippedTheme === 'volcano') {
            ctx.strokeStyle = '#5a3d34';
        } else {
            ctx.strokeStyle = '#524675';
        }
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function drawLiquid() {
        ctx.save();
        
        ctx.beginPath();
        ctx.ellipse(300, 255, 118, 22, 0, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = currentPotionColor;
        ctx.fill();

        liquidOffset += 0.08;
        let waveHeight = gameState === 'BREWING' ? 2.5 + (instability * 0.1) : 1;
        if (liquidOffset > 1000) liquidOffset = 0;

        ctx.fillStyle = blendColors(currentPotionColor, '#ffffff', 0.15); 
        ctx.beginPath();
        ctx.moveTo(170, 255);
        for (let x = 170; x <= 430; x += 5) {
            let y = 255 + Math.sin((x * 0.05) + liquidOffset) * waveHeight;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(430, 280);
        ctx.lineTo(170, 280);
        ctx.closePath();
        ctx.fill();

        let grad = ctx.createRadialGradient(300, 255, 10, 300, 255, 120);
        grad.addColorStop(0, 'rgba(255,255,255,0.2)');
        grad.addColorStop(0.5, 'transparent');
        grad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(300, 255, 118, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawCauldronBody() {
        ctx.save();

        if (gameState === 'EXPLODED') {
            ctx.restore();
            return;
        }

        // Draw safety valve shield dome
        if (isSafetyValveActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 18 + Math.sin(Date.now() * 0.005) * 6;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(300, 385, 200, 155, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        let grad = ctx.createRadialGradient(240, 350, 20, 300, 410, 180);
        
        if (equippedTheme === 'ice') {
            grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');    
            grad.addColorStop(0.3, 'rgba(10, 35, 60, 0.7)');   
            grad.addColorStop(0.8, 'rgba(5, 15, 30, 0.9)');    
            grad.addColorStop(1, 'rgba(2, 6, 12, 0.98)');     
        } else if (equippedTheme === 'volcano') {
            grad.addColorStop(0, '#5a4640');      
            grad.addColorStop(0.3, '#2a1a15');    
            grad.addColorStop(0.8, '#140c09');    
            grad.addColorStop(1, '#080504');      
        } else {
            grad.addColorStop(0, '#352e4f');      
            grad.addColorStop(0.3, '#1c172d');    
            grad.addColorStop(0.8, '#0b0814');    
            grad.addColorStop(1, '#05030a');      
        }

        ctx.beginPath();
        ctx.moveTo(180, 255);
        ctx.bezierCurveTo(120, 310, 110, 520, 300, 530);
        ctx.bezierCurveTo(490, 520, 480, 310, 420, 255);
        ctx.closePath();
        
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.lineWidth = 5;
        ctx.strokeStyle = equippedTheme === 'ice' ? '#00c3ff' : '#120d20';
        ctx.stroke();

        ctx.strokeStyle = equippedTheme === 'ice' ? 'rgba(0, 240, 255, 0.3)' : '#27203b';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(130, 380, 25, Math.PI * 0.5, Math.PI * 1.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(470, 380, 25, Math.PI * 1.4, Math.PI * 0.5);
        ctx.stroke();

        ctx.strokeStyle = equippedTheme === 'ice' ? 'rgba(255,255,255,0.25)' : '#4a3f69';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(180, 256);
        ctx.bezierCurveTo(122, 311, 112, 519, 300, 528);
        ctx.stroke();

        if (equippedTheme === 'volcano') {
            ctx.save();
            ctx.strokeStyle = '#ff3c00';
            ctx.shadowColor = '#ff3c00';
            ctx.shadowBlur = 8 + Math.sin(Date.now() * 0.005) * 5;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(260, 340);
            ctx.lineTo(275, 370);
            ctx.lineTo(270, 400);
            ctx.lineTo(290, 440);
            ctx.moveTo(340, 345);
            ctx.lineTo(325, 380);
            ctx.lineTo(330, 410);
            ctx.lineTo(315, 450);
            ctx.moveTo(275, 370);
            ctx.lineTo(325, 380);
            ctx.moveTo(270, 400);
            ctx.lineTo(330, 410);
            ctx.stroke();
            
            ctx.restore();
        } else if (instability > 0) {
            ctx.save();
            ctx.globalAlpha = instability / 100;
            let glowColor = equippedTheme === 'ice' ? '#ffffff' : '#00f0ff';
            ctx.strokeStyle = glowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12 + (instability * 0.1);
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(300, 370);
            ctx.lineTo(315, 395);
            ctx.lineTo(285, 395);
            ctx.closePath();
            
            ctx.moveTo(300, 395);
            ctx.lineTo(300, 420);
            
            ctx.moveTo(280, 415);
            ctx.lineTo(300, 420);
            ctx.lineTo(320, 415);

            ctx.moveTo(270, 380);
            ctx.lineTo(290, 390);

            ctx.moveTo(330, 380);
            ctx.lineTo(310, 390);
            
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    function generateParticles() {
        if (gameState === 'BREWING') {
            let bubbleRate = 0.05 + (instability * 0.005);
            if (Math.random() < bubbleRate) {
                let rx = 200 + Math.random() * 200;
                let ry = 280 + Math.random() * 200;
                let dx = rx - 300;
                let dy = ry - 410;
                if (dx*dx + dy*dy < 140*140) {
                    let bColor = blendColors(currentPotionColor, '#ffffff', 0.6);
                    if (equippedTheme === 'ice') bColor = '#e0ffff'; 
                    spawnParticle(rx, ry, 'bubble', bColor);
                }
            }

            let steamRate = 0.03 + (instability * 0.003);
            if (Math.random() < steamRate) {
                let sx = 200 + Math.random() * 200;
                let sColor = currentPotionColor;
                if (equippedTheme === 'ice') sColor = 'rgba(173, 216, 230, 0.4)'; 
                if (equippedTheme === 'volcano') sColor = 'rgba(60, 60, 60, 0.5)'; 
                spawnParticle(sx, 250, 'steam', sColor);
            }

            if (catalystSparks && Math.random() < 0.4) {
                spawnParticle(200 + Math.random()*200, 250, 'spark', 'var(--color-gold)');
            }
        }

        if (gameState === 'BREWING' || gameState === 'IDLE') {
            let flameRate = gameState === 'BREWING' ? 0.9 : 0.25;
            if (Math.random() < flameRate) {
                let fx = 230 + Math.random() * 140;
                spawnParticle(fx, 520, 'flame');
            }
        }
    }

    // Helper: Blend Hex colors
    function blendColors(c1, c2, weight) {
        function parseHex(h) {
            if (h.startsWith('var')) {
                if (h.includes('cyan')) return [0, 240, 255];
                if (h.includes('gold')) return [255, 215, 0];
            }
            if (h.startsWith('#')) {
                if (h.length === 4) {
                    return [
                        parseInt(h[1] + h[1], 16),
                        parseInt(h[2] + h[2], 16),
                        parseInt(h[3] + h[3], 16)
                    ];
                }
                return [
                    parseInt(h.slice(1, 3), 16),
                    parseInt(h.slice(3, 5), 16),
                    parseInt(h.slice(5, 7), 16)
                ];
            }
            if (h.startsWith('rgb')) {
                let match = h.match(/\d+/g);
                if (match) return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
            }
            return [20, 15, 35]; 
        }

        let rgb1 = parseHex(c1);
        let rgb2 = parseHex(c2);

        let r = Math.round(rgb1[0] * (1 - weight) + rgb2[0] * weight);
        let g = Math.round(rgb1[1] * (1 - weight) + rgb2[1] * weight);
        let b = Math.round(rgb1[2] * (1 - weight) + rgb2[2] * weight);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Start everything
    init();
});
