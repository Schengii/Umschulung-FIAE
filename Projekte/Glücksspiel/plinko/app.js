/* ==========================================================================
   ALCHEMISTEN-PLINKO: GAME LOGIC & CANVAS PHYSICS (VERSION 1.0)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- ESSENCE / LEVEL DATA ---
    const ESSENCES = {
        water: {
            name: "Mondwasser",
            rows: 8,
            color: "#00c3ff",
            glow: "rgba(0, 195, 255, 0.4)",
            mults: [2.5, 1.8, 1.4, 1.1, 0.7, 0.5, 0.7, 1.1, 1.4, 1.8, 2.5]
        },
        ash: {
            name: "Phönix-Asche",
            rows: 10,
            color: "#ff8c00",
            glow: "rgba(255, 140, 0, 0.4)",
            mults: [10.0, 6.0, 4.0, 2.0, 1.2, 0.6, 0.2, 0.6, 1.2, 2.0, 4.0, 6.0, 10.0]
        },
        dragon: {
            name: "Drachenblut",
            rows: 12,
            color: "#ff2d55",
            glow: "rgba(255, 45, 85, 0.4)",
            mults: [50.0, 25.0, 10.0, 5.0, 1.5, 0.4, 0.0, 0.0, 0.0, 0.4, 1.5, 5.0, 10.0, 25.0, 50.0]
        },
        matter: {
            name: "Dunkle Materie",
            rows: 14,
            color: "#bd00ff",
            glow: "rgba(189, 0, 255, 0.4)",
            mults: [150.0, 50.0, 15.0, 5.0, 1.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 1.0, 5.0, 15.0, 50.0, 150.0]
        }
    };

    // --- GAME STATE ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let bet = 10.00;
    let activeEssence = 'water';
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    
    // Upgrades
    let activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false };
    let unlockedUpgrades = JSON.parse(localStorage.getItem('alchemist_unlocked_upgrades')) || [];
    let unlockedThemes = JSON.parse(localStorage.getItem('alchemist_unlocked_themes')) || ['default'];
    let equippedTheme = localStorage.getItem('alchemist_theme') || 'default';

    // Plinko Stats
    let stats = JSON.parse(localStorage.getItem('alchemist_plinko_stats')) || {
        totalDrops: 0,
        highestMultiplier: 0.00,
        wildcardsTriggered: 0,
        balanceHistory: [1000]
    };
    if (!stats.balanceHistory || stats.balanceHistory.length === 0) stats.balanceHistory = [1000];

    // Local Drop History
    let dropHistory = [];

    // Physics parameters (Admin adjustable)
    let gravity = parseFloat(localStorage.getItem('alchemist_plinko_gravity')) || 0.25;
    let elasticity = parseFloat(localStorage.getItem('alchemist_plinko_elasticity')) || 0.50;
    let plinkoMode = localStorage.getItem('alchemist_plinko_mode') || 'standard'; // standard, casino
    let targetRtp = parseInt(localStorage.getItem('alchemist_plinko_rtp')) || 95; // target RTP in %

    // Engine variables
    let droplets = [];
    let pegs = [];
    let particles = [];
    let audioCtx = null;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    let autoDropInterval = null;
    let dropBurst = null;
    let boardGlow = 0;

    // --- CANVAS DETAILS ---
    const canvas = document.getElementById('plinko-canvas');
    const ctx = canvas.getContext('2d');
    
    // UI elements
    const balanceAmountEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('bet-input');
    const btnBetMin = document.getElementById('btn-bet-min');
    const btnBetHalf = document.getElementById('btn-bet-half');
    const btnBetDouble = document.getElementById('btn-bet-double');
    const btnBetMax = document.getElementById('btn-bet-max');
    const btnDrop = document.getElementById('btn-drop');
    const chkAutoDrop = document.getElementById('chk-auto-drop');
    const historyList = document.getElementById('history-list');
    const toastContainer = document.getElementById('toast-container');
    const wildcardBanner = document.getElementById('wildcard-banner');
    
    // Navigation / Tabs
    const tabBtnLab = document.getElementById('tab-btn-lab');
    const tabBtnStats = document.getElementById('tab-btn-stats');
    const tabContentLab = document.getElementById('tab-content-lab');
    const tabContentStats = document.getElementById('tab-content-stats');

    // Stats
    const statDropsEl = document.getElementById('stat-drops');
    const statHighMultEl = document.getElementById('stat-high-mult');
    const statWildcardsEl = document.getElementById('stat-wildcards');

    // Upgrades List
    const upStatusCopper = document.getElementById('up-status-copper');
    const upStatusCrystal = document.getElementById('up-status-crystal');

    // Modals
    const helpModal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-help');
    const btnCloseModal = document.getElementById('btn-close-modal');

    const adminModal = document.getElementById('admin-modal');
    const btnAdmin = document.getElementById('btn-admin');
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    const selectPlinkoMode = document.getElementById('select-plinko-mode');
    const slideGravity = document.getElementById('slide-gravity');
    const slideBounce = document.getElementById('slide-bounce');
    const slideWinRate = document.getElementById('slide-win-rate');
    const valGravity = document.getElementById('val-gravity');
    const valBounce = document.getElementById('val-bounce');
    const valWinRate = document.getElementById('val-win-rate');
    const groupWinRate = document.getElementById('group-win-rate');
    const btnAdminReset = document.getElementById('btn-admin-reset');
    const btnAdminSave = document.getElementById('btn-admin-save');
    const btnMute = document.getElementById('btn-mute');

    // Level Header Elements
    const xpLevelNumEl = document.getElementById('xp-level-num');
    const xpCurrentValEl = document.getElementById('xp-current-val');
    const xpTargetValEl = document.getElementById('xp-target-val');
    const xpBarFill = document.getElementById('xp-bar-fill');

    // Essence Buttons
    const essWaterBtn = document.getElementById('ess-water');
    const essAshBtn = document.getElementById('ess-ash');
    const essDragonBtn = document.getElementById('ess-dragon');
    const essMatterBtn = document.getElementById('ess-matter');

    // ==========================================================================
    // INITIALIZATION & EVENT LISTENERS
    // ==========================================================================
    
    function init() {
        // Load initial balance, levels and state
        updateBalanceDisplay();
        updateMuteButtonDisplay();
        updateXPDisplay();
        renderUpgradesStatus();
        updateStatsDisplay();

        // Preset values
        betInput.value = bet.toFixed(2);
        validateBetInput();

        // Rebuild Pegs grid
        rebuildPegsGrid();

        // Event listeners for betting
        betInput.addEventListener('input', validateBetInput);
        betInput.addEventListener('change', validateBetInput);
        btnBetMin.addEventListener('click', () => setBet(1.00));
        btnBetHalf.addEventListener('click', () => setBet(Math.max(1.00, bet / 2)));
        btnBetDouble.addEventListener('click', () => setBet(Math.min(balance, bet * 2)));
        btnBetMax.addEventListener('click', () => setBet(Math.min(500, balance)));

        // Essence switches
        essWaterBtn.addEventListener('click', () => selectEssence('water'));
        essAshBtn.addEventListener('click', () => selectEssence('ash'));
        essDragonBtn.addEventListener('click', () => selectEssence('dragon'));
        if (essMatterBtn) essMatterBtn.addEventListener('click', () => selectEssence('matter'));

        // Play action
        btnDrop.addEventListener('click', triggerDrop);
        chkAutoDrop.addEventListener('change', toggleAutoDrop);

        // Tabs
        tabBtnLab.addEventListener('click', () => switchTab('lab'));
        tabBtnStats.addEventListener('click', () => switchTab('stats'));

        // Modals
        btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
        btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));

        btnAdmin.addEventListener('click', openAdminPanel);
        btnCloseAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));

        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.add('hidden');
            if (e.target === adminModal) adminModal.classList.add('hidden');
        });

        btnMute.addEventListener('click', toggleMute);

        // Admin controls
        slideGravity.addEventListener('input', () => { valGravity.textContent = slideGravity.value; });
        slideBounce.addEventListener('input', () => { valBounce.textContent = slideBounce.value; });
        slideWinRate.addEventListener('input', () => { valWinRate.textContent = slideWinRate.value + '%'; });
        selectPlinkoMode.addEventListener('change', onPlinkoModeChange);
        btnAdminReset.addEventListener('click', resetAdminSettings);
        btnAdminSave.addEventListener('click', saveAdminSettings);

        // Start animation loop
        requestAnimationFrame(renderLoop);
    }

    // Initialize Audio context on first interaction
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.body.addEventListener('click', initAudio, { once: true });

    // Handle tab focus audio states
    document.addEventListener('visibilitychange', () => {
        if (audioCtx) {
            if (document.hidden) {
                if (audioCtx.state === 'running') audioCtx.suspend();
            } else {
                if (audioCtx.state === 'suspended') audioCtx.resume();
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

    // Switch right panel tabs
    function switchTab(tab) {
        tabBtnLab.classList.toggle('active', tab === 'lab');
        tabBtnStats.classList.toggle('active', tab === 'stats');
        tabContentLab.classList.toggle('hidden', tab !== 'lab');
        tabContentStats.classList.toggle('hidden', tab !== 'stats');

        if (tab === 'stats') {
            setTimeout(drawBalanceChart, 50);
        }
    }

    // Switch essence type
    function selectEssence(type) {
        if (activeEssence === type) return;
        activeEssence = type;

        essWaterBtn.classList.toggle('active', type === 'water');
        essAshBtn.classList.toggle('active', type === 'ash');
        essDragonBtn.classList.toggle('active', type === 'dragon');
        if (essMatterBtn) essMatterBtn.classList.toggle('active', type === 'matter');

        rebuildPegsGrid();
    }

    // ==========================================================================
    // BET & BALANCE HELPERS
    // ==========================================================================
    
    function validateBetInput() {
        let val = parseFloat(betInput.value);
        if (isNaN(val) || val < 1.00) {
            val = 1.00;
        } else if (val > 500.00) {
            val = 500.00;
        }
        if (val > balance) {
            val = Math.max(1.00, balance);
        }
        bet = val;
        betInput.value = bet.toFixed(2);
    }

    function setBet(amount) {
        bet = amount;
        betInput.value = bet.toFixed(2);
        validateBetInput();
    }

    function updateBalanceDisplay() {
        balanceAmountEl.textContent = balance.toFixed(2);
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
    }

    // Recharges balance if the user runs out of money
    function autoRechargeBalance() {
        balance = 1000.00;
        updateBalanceDisplay();
        showToast("🔮 Guthaben leer! Du hast eine Notfall-Zufuhr von 1.000,00 € erhalten.");
        
        const balanceCard = document.querySelector('.balance-card');
        balanceCard.style.borderColor = 'var(--color-green)';
        balanceCard.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.4)';
        setTimeout(() => {
            balanceCard.style.borderColor = '';
            balanceCard.style.boxShadow = '';
        }, 1500);
    }

    // ==========================================================================
    // PROCEDURAL AUDIO SYNTHESIS
    // ==========================================================================

    function playPegBounceSound(pegY) {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            
            // Higher pitch for top pegs, lower pitch for bottom pegs
            let freq = 1200 - (pegY * 1.5);
            freq = Math.max(150, Math.min(1500, freq));
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0.04 * volumeSFX, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.09);
        } catch (e) {
            console.error("Audio Synthesis Error: ", e);
        }
    }

    function playSlotLandSound(multiplier) {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            
            if (multiplier >= 2.0) {
                // High win arpeggio (C Major chord)
                let chord = [523.25, 659.25, 783.99, 1046.50];
                if (multiplier >= 10.0) {
                    chord = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
                }
                chord.forEach((freq, idx) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    
                    gain.gain.setValueAtTime(0.08 * volumeSFX, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);
                    
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.6);
                });
            } else if (multiplier > 0) {
                // Short happy pop sound
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
                
                gain.gain.setValueAtTime(0.06 * volumeSFX, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.12);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(now + 0.13);
            } else {
                // Low sad tone for 0.0x land
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.25);
                
                gain.gain.setValueAtTime(0.05 * volumeSFX, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.25);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(now + 0.26);
            }
        } catch (e) {
            console.error(e);
        }
    }

    // ==========================================================================
    // PLINKO PHYSICS GRID & ENGINE
    // ==========================================================================
    
    function rebuildPegsGrid() {
        pegs = [];
        const data = ESSENCES[activeEssence];
        const rows = data.rows;
        
        const startY = 100;
        const dy = 34; // vertical spacing
        const dx = 38; // horizontal spacing
        const centerX = 300;

        for (let r = 0; r < rows; r++) {
            // Row `r` has `r + 3` pegs. (Row 0 has 3, Row 1 has 4, etc.)
            let numPegs = r + 3;
            let rowOffset = -((numPegs - 1) * dx) / 2;

            for (let i = 0; i < numPegs; i++) {
                let px = centerX + rowOffset + (i * dx);
                let py = startY + (r * dy);
                
                // Peg structures
                pegs.push({
                    x: px,
                    y: py,
                    radius: 4.5,
                    pulse: 1.0,
                    wildcard: null // none, split, fire, frost
                });
            }
        }
    }

    // Spawns peg wildcard activations with a 10% chance per drop (25% with catalyst upgrade)
    function assignPegWildcards() {
        let chance = (window.AlchemistShared && window.AlchemistShared.hasUpgrade('catalyst')) ? 0.25 : 0.10;
        if (Math.random() > chance) return;
        
        // Pick a random peg in the middle-bottom rows to make it a wildcard
        const potentialPegs = pegs.filter(p => p.y > 220 && p.y < 420);
        if (potentialPegs.length === 0) return;
        
        const types = ['split', 'fire', 'frost'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const peg = potentialPegs[Math.floor(Math.random() * potentialPegs.length)];
        
        peg.wildcard = chosenType;
        stats.wildcardsTriggered++;
        localStorage.setItem('alchemist_plinko_stats', JSON.stringify(stats));
        updateStatsDisplay();

        // Show wildcard notification banner
        wildcardBanner.classList.remove('hidden');
        const wildcardTitle = document.getElementById('wildcard-title');
        const wildcardDesc = document.getElementById('wildcard-desc');
        const wildcardIcon = document.getElementById('wildcard-icon');

        if (chosenType === 'split') {
            wildcardIcon.textContent = '⚡';
            wildcardIcon.style.color = 'var(--color-cyan)';
            wildcardTitle.textContent = 'BLITZ-TROPFEN!';
            wildcardTitle.style.color = 'var(--color-cyan)';
            wildcardDesc.textContent = 'Trifft den Blitz-Peg, um sich in zwei Essenzen aufzuteilen!';
            wildcardBanner.style.borderColor = 'var(--color-cyan)';
            wildcardBanner.style.boxShadow = 'var(--glow-cyan)';
        } else if (chosenType === 'fire') {
            wildcardIcon.textContent = '🔥';
            wildcardIcon.style.color = 'var(--color-gold)';
            wildcardTitle.textContent = 'FEUER-KATALYSATOR!';
            wildcardTitle.style.color = 'var(--color-gold)';
            wildcardDesc.textContent = 'Trifft den Feuer-Peg, um den End-Multiplikator zu verdoppeln (2x)!';
            wildcardBanner.style.borderColor = 'var(--color-gold)';
            wildcardBanner.style.boxShadow = '0 0 15px var(--color-gold)';
        } else if (chosenType === 'frost') {
            wildcardIcon.textContent = '❄️';
            wildcardIcon.style.color = 'var(--ess-water)';
            wildcardTitle.textContent = 'FROST-SHIELD!';
            wildcardTitle.style.color = 'var(--ess-water)';
            wildcardDesc.textContent = 'Trifft den Frost-Peg, um die Gravitation kurzzeitig zu halbieren!';
            wildcardBanner.style.borderColor = 'var(--ess-water)';
            wildcardBanner.style.boxShadow = '0 0 15px var(--ess-water)';
        }

        // Auto-dismiss banner after 3.5 seconds
        setTimeout(() => {
            wildcardBanner.classList.add('hidden');
        }, 3500);
    }

    // Triggered when button is clicked or auto-drop spawns
    function triggerDrop() {
        initAudio();
        validateBetInput();
        
        if (balance < bet) {
            autoRechargeBalance();
            return;
        }

        // Deduct stake
        balance -= bet;
        updateBalanceDisplay();

        // Roll wildcard assignments
        assignPegWildcards();

        // Droplet setup
        let startX = 300 + (Math.random() - 0.5) * 8;
        let startY = 40;
        
        // Define drop colors
        let dropColor = ESSENCES[activeEssence].color;
        dropBurst = {
            x: startX,
            y: startY,
            radius: 10,
            maxRadius: 72,
            alpha: 0.95,
            color: dropColor
        };

        btnDrop.classList.remove('drop-triggered');
        void btnDrop.offsetWidth;
        btnDrop.classList.add('drop-triggered');
        setTimeout(() => btnDrop.classList.remove('drop-triggered'), 350);
        boardGlow = 1.0;
        
        let targetSlot = null;
        let isSteered = false;
        
        // Casino Mode Calculations
        if (plinkoMode === 'casino') {
            isSteered = true;
            targetSlot = calculateCasinoTargetSlot();
        }

        let droplet = {
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1.0,
            radius: 7.5,
            color: dropColor,
            trail: [],
            isSteered: isSteered,
            targetSlot: targetSlot,
            targetX: null,
            multiplierBoost: 1.0, // altered by fire wildcard
            frostActive: false,
            frostTimer: 0
        };

        if (targetSlot !== null) {
            // Pre-calculate target X at bottom slots area
            const data = ESSENCES[activeEssence];
            const numSlots = data.rows + 3;
            const slotW = 600 / numSlots;
            droplet.targetX = (targetSlot + 0.5) * slotW;
        }

        droplets.push(droplet);
        
        // Quest progress
        window.AlchemistShared.progressQuest('plinko_drops', 1);
        
        // Increment stats
        stats.totalDrops++;
        localStorage.setItem('alchemist_plinko_stats', JSON.stringify(stats));
        updateStatsDisplay();

        // XP Progress
        addXP(2); // +2 XP for dropping
    }

    // Casino Mode target distribution logic (balances theoretical RTP)
    function calculateCasinoTargetSlot() {
        const data = ESSENCES[activeEssence];
        const numSlots = data.mults.length;
        
        // Multiplier probabilities - normal Plinko follows a binomial distribution.
        // We shape probabilities based on the target RTP.
        // Simple weight calculation:
        let weights = [];
        let rtpFactor = targetRtp / 100.0; // e.g. 0.95
        
        // Higher multipliers are at edges (slot 0 and slot numSlots-1).
        // Center slots have low multipliers.
        // We calculate weights prioritizing center vs edges depending on RTP.
        for (let i = 0; i < numSlots; i++) {
            let mult = data.mults[i];
            
            // Binomial-like base probability
            let distFromCenter = Math.abs(i - (numSlots - 1) / 2);
            let baseProb = Math.pow(0.5, numSlots - 1) * choose(numSlots - 1, i) * 1000;
            
            // Bias the probability based on multiplier size and target RTP
            let bias = 1.0;
            if (rtpFactor < 0.9) {
                // Favor lower multipliers (center)
                if (mult > 1.5) bias = 0.5 * rtpFactor;
                else bias = 1.2;
            } else if (rtpFactor > 1.1) {
                // Favor higher multipliers (edges)
                if (mult > 1.5) bias = 1.5;
                else bias = 0.8;
            }
            
            weights.push(Math.max(0.1, baseProb * bias));
        }

        // Weighted random selection
        let sum = weights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * sum;
        let runningSum = 0;
        
        for (let i = 0; i < numSlots; i++) {
            runningSum += weights[i];
            if (roll <= runningSum) {
                return i;
            }
        }
        return Math.floor(numSlots / 2);
    }

    // Helper: Combinations (n choose k)
    function choose(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - k + i) / i;
        }
        return Math.round(res);
    }

    // Auto-Drop Switch
    function toggleAutoDrop() {
        if (chkAutoDrop.checked) {
            autoDropInterval = setInterval(() => {
                if (!chkAutoDrop.checked) {
                    clearInterval(autoDropInterval);
                    return;
                }
                triggerDrop();
            }, 550); // Drop a potion every 550ms
        } else {
            if (autoDropInterval) clearInterval(autoDropInterval);
        }
    }

    // Tab switching/Upgrades synchronization
    function renderUpgradesStatus() {
        // Shared states from main cauldron upgrades
        activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false };
        unlockedUpgrades = JSON.parse(localStorage.getItem('alchemist_unlocked_upgrades')) || [];
        level = parseInt(localStorage.getItem('alchemist_level')) || 1;

        if (unlockedUpgrades.includes('copper')) {
            upStatusCopper.classList.remove('locked');
            if (activeUpgrades.copper) {
                upStatusCopper.classList.add('active');
                upStatusCopper.querySelector('.status-tag').textContent = "Aktiv";
            } else {
                upStatusCopper.classList.remove('active');
                upStatusCopper.querySelector('.status-tag').textContent = "Bereit (Ausgerüstet)";
            }
        } else {
            upStatusCopper.classList.add('locked');
            upStatusCopper.querySelector('.status-tag').textContent = "Gesperrt (Stufe 3)";
        }

        if (unlockedUpgrades.includes('crystal')) {
            upStatusCrystal.classList.remove('locked');
            if (activeUpgrades.crystal) {
                upStatusCrystal.classList.add('active');
                upStatusCrystal.querySelector('.status-tag').textContent = "Aktiv";
            } else {
                upStatusCrystal.classList.remove('active');
                upStatusCrystal.querySelector('.status-tag').textContent = "Bereit (Ausgerüstet)";
            }
        } else {
            upStatusCrystal.classList.add('locked');
            upStatusCrystal.querySelector('.status-tag').textContent = "Gesperrt (Stufe 5)";
        }
    }

    // ==========================================================================
    // PHYSICS ENGINE CALCULATIONS
    // ==========================================================================

    function updatePhysics() {
        const data = ESSENCES[activeEssence];
        const numSlots = data.rows + 3;
        const slotW = 600 / numSlots;
        
        // 1. UPDATE DECAY FOR PEGS PULSING & WILDCARDS
        pegs.forEach(peg => {
            if (peg.pulse > 1.0) peg.pulse -= 0.02;
        });

        // 2. UPDATE DROPLETS
        for (let i = droplets.length - 1; i >= 0; i--) {
            let p = droplets[i];
            
            // Frost Wildcard gravity calculation
            let currentGravity = gravity;
            if (p.frostActive) {
                currentGravity = gravity * 0.50; // half gravity
                p.frostTimer--;
                if (p.frostTimer <= 0) {
                    p.frostActive = false;
                    p.color = ESSENCES[activeEssence].color;
                }
            }

            // Steered Force (Casino Mode & Copper Filter Upgrade)
            if (p.isSteered && p.targetX !== null) {
                // Invisible magnetic steering
                let pct = (p.y - 40) / (520 - 40);
                pct = Math.max(0, Math.min(1.0, pct));
                // Guide horizontal trajectory naturally
                let targetX_at_y = 300 + (p.targetX - 300) * pct;
                let steerForce = (targetX_at_y - p.x) * 0.018;
                p.vx += steerForce;
            }

            // Kupfer-Filter (Stufe 3 Upgrade) - gently pushes droplet away from worst middle slots
            if (activeUpgrades.copper && !p.isSteered && p.y > 300 && p.y < 460) {
                let dxFromCenter = p.x - 300;
                if (Math.abs(dxFromCenter) < 40) {
                    // Push outwards (away from center) to increase outer column land chances
                    let pushDir = dxFromCenter >= 0 ? 1 : -1;
                    p.vx += pushDir * 0.08;
                }
            }

            // Update droplet physics
            p.vy += currentGravity;
            p.vx *= 0.99; // drag
            p.vy *= 0.99;
            p.x += p.vx;
            p.y += p.vy;

            // Track movement trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 8) p.trail.shift();

            // Wall Collisions
            if (p.x - p.radius < 0) {
                p.x = p.radius;
                p.vx = -p.vx * elasticity;
            } else if (p.x + p.radius > 600) {
                p.x = 600 - p.radius;
                p.vx = -p.vx * elasticity;
            }

            // Bouncing against Pegs (Pins)
            pegs.forEach(peg => {
                let dx = p.x - peg.x;
                let dy = p.y - peg.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let minDist = p.radius + peg.radius;

                if (dist < minDist) {
                    // Resolve overlap
                    let nx = dx / dist;
                    let ny = dy / dist;
                    p.x = peg.x + nx * minDist;
                    p.y = peg.y + ny * minDist;

                    // Relative velocity along normal vector
                    let vn = p.vx * nx + p.vy * ny;
                    if (vn < 0) {
                        p.vx = p.vx - (1 + elasticity) * vn * nx;
                        p.vy = p.vy - (1 + elasticity) * vn * ny;
                        
                        // Small horizontal dispersion for natural bounces
                        p.vx += (Math.random() - 0.5) * 0.3;
                    }

                    // Animate Peg pulse
                    peg.pulse = 1.4;

                    // Spark particle effects on peg hit
                    let sparkColor = p.color;
                    if (peg.wildcard === 'split') sparkColor = '#00ffff';
                    if (peg.wildcard === 'fire') sparkColor = '#ffd700';
                    if (peg.wildcard === 'frost') sparkColor = '#e0ffff';
                    
                    spawnSparkParticles(peg.x, peg.y, sparkColor);

                    // Web Audio Sound click
                    playPegBounceSound(peg.y);

                    // Shared Synth bounce chime note
                    let pitchFactor = (660 - peg.y) / 660;
                    window.AlchemistShared.playBounceNote(pitchFactor);

                    // Resolve Wildcard peg hits
                    if (peg.wildcard) {
                        triggerPegWildcardEffect(p, peg);
                        peg.wildcard = null; // consume wildcard
                    }
                }
            });

            // Landed inside collection slots
            if (p.y + p.radius >= 540) {
                // Find target column
                let slotIdx = Math.floor(p.x / slotW);
                slotIdx = Math.max(0, Math.min(numSlots - 1, slotIdx));

                // Process payout win
                processPayout(p, slotIdx);

                // Remove droplet
                droplets.splice(i, 1);
            }
        }

        // 3. UPDATE SPARK PARTICLES
        for (let i = particles.length - 1; i >= 0; i--) {
            let part = particles[i];
            part.x += part.vx;
            part.y += part.vy;
            part.vy += part.gravity;
            part.alpha -= part.decay;
            if (part.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Triggers special wildcard behaviors
    function triggerPegWildcardEffect(droplet, peg) {
        if (peg.wildcard === 'split') {
            // SPLIT: Spawns a second droplet going the opposite way
            let dColor = droplet.color;
            let targetSlot = null;
            let isSteered = false;
            if (plinkoMode === 'casino') {
                isSteered = true;
                targetSlot = calculateCasinoTargetSlot();
            }

            let splitDroplet = {
                x: peg.x - 5,
                y: peg.y - 2,
                vx: -droplet.vx - 0.5,
                vy: droplet.vy,
                radius: droplet.radius,
                color: '#00ffff',
                trail: [],
                isSteered: isSteered,
                targetSlot: targetSlot,
                targetX: null,
                multiplierBoost: droplet.multiplierBoost,
                frostActive: droplet.frostActive,
                frostTimer: droplet.frostTimer
            };

            if (targetSlot !== null) {
                const data = ESSENCES[activeEssence];
                const numSlots = data.rows + 3;
                const slotW = 600 / numSlots;
                splitDroplet.targetX = (targetSlot + 0.5) * slotW;
            }

            droplets.push(splitDroplet);
            
            // Adjust original droplet path
            droplet.x = peg.x + 5;
            droplet.vx = Math.abs(droplet.vx) + 0.5;
            droplet.color = '#00ffff';

            // Quest progress
            window.AlchemistShared.progressQuest('plinko_split', 1);

            showToast("⚡ Blitz-Splits ausgelöst! Deine Essenz wurde geteilt!");
        } else if (peg.wildcard === 'fire') {
            // FIRE: Double multiplier payout
            droplet.multiplierBoost = 2.0;
            droplet.color = 'var(--color-gold)';
            showToast("🔥 Feuer-Katalysator! Dieser Tropfen zahlt doppelten Multiplikator (2x)!");
        } else if (peg.wildcard === 'frost') {
            // FROST: Half gravity
            droplet.frostActive = true;
            droplet.frostTimer = 180; // 3 seconds at 60fps
            droplet.color = 'var(--ess-water)';
            showToast("❄️ Frost-Schild! Schwerkraft für den Tropfen halbiert.");
        }
    }

    // Payout and stats calculations
    function processPayout(droplet, slotIdx) {
        const data = ESSENCES[activeEssence];
        let baseMult = data.mults[slotIdx];

        // Apply wildcard fire peg boost
        let finalMult = baseMult * droplet.multiplierBoost;

        // Apply Level 5 passive crystal upgrade (+10% win bonus)
        if (activeUpgrades.crystal) {
            finalMult = finalMult * 1.1;
        }

        // Apply Fortuna Potion (+20% plinko wins)
        let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
        if (activePotions && activePotions.fortuna > 0 && finalMult > 0.0) {
            finalMult *= 1.20;
        }

        let baseWinAmount = bet * finalMult;
        let isAutoDrop = chkAutoDrop && chkAutoDrop.checked;

        if (finalMult >= 1.5 && !isAutoDrop) {
            // Trigger Gamble
            window.AlchemistShared.triggerGamble(baseWinAmount, (finalAmount) => {
                let finalMultAchieved = finalAmount / bet;

                if (finalAmount > 0) {
                    balance += finalAmount;
                    updateBalanceDisplay();

                    let badgeType = finalAmount >= (bet * 5.0) ? 'gold-win' : 'win';
                    addHistoryBadge(badgeType, finalMultAchieved.toFixed(2) + 'x');
                    
                    // Quest progress (mult achieved)
                    window.AlchemistShared.progressQuest('plinko_mult', finalMultAchieved);
                    
                    spawnSplashParticles(droplet.x, droplet.y, droplet.color);
                } else {
                    addHistoryBadge('loss', '0.00x');
                }

                // Stats tracking
                if (finalMultAchieved > stats.highestMultiplier) {
                    stats.highestMultiplier = finalMultAchieved;
                }
                stats.balanceHistory.push(balance);
                if (stats.balanceHistory.length > 10) stats.balanceHistory.shift();
                localStorage.setItem('alchemist_plinko_stats', JSON.stringify(stats));

                window.AlchemistShared.recordPlay('plinko', finalAmount, bet, finalMultAchieved);

                // XP gains
                let xpGained = Math.round(15 * finalMultAchieved);
                if (xpGained > 0) addXP(xpGained);

                checkPlinkoAchievements(finalMultAchieved);
                updateStatsDisplay();

                if (balance < 1.00 && droplets.length === 0) {
                    setTimeout(autoRechargeBalance, 1500);
                }
            });
        } else {
            // Normal payout without gamble
            balance += baseWinAmount;
            updateBalanceDisplay();

            let badgeType = 'loss';
            if (finalMult >= 2.0) badgeType = 'gold-win';
            else if (finalMult > 0.0) badgeType = 'win';
            addHistoryBadge(badgeType, finalMult.toFixed(2) + 'x');

            // Play slot land sound
            playSlotLandSound(finalMult);

            // Stats tracking
            if (finalMult > stats.highestMultiplier) {
                stats.highestMultiplier = finalMult;
            }
            stats.balanceHistory.push(balance);
            if (stats.balanceHistory.length > 10) stats.balanceHistory.shift();
            localStorage.setItem('alchemist_plinko_stats', JSON.stringify(stats));

            window.AlchemistShared.recordPlay('plinko', baseWinAmount, bet, finalMult);

            // XP gains
            let xpGained = Math.round(15 * finalMult);
            if (xpGained > 0) addXP(xpGained);

            // Quest progress
            window.AlchemistShared.progressQuest('plinko_mult', finalMult);

            // Trigger visual splash particles
            spawnSplashParticles(droplet.x, droplet.y, droplet.color);

            checkPlinkoAchievements(finalMult);
            updateStatsDisplay();

            if (balance < 1.00 && droplets.length === 0) {
                setTimeout(autoRechargeBalance, 1500);
            }
        }
    }

    // ==========================================================================
    // RENDER CANVAS GRAPHICS
    // ==========================================================================

    function renderLoop() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width) || 600;
        const displayHeight = Math.round(rect.height) || 660;

        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Update and draw the drop-start burst
        updateDropBurst();
        drawDropBurst();

        // Draw Board Background grid and borders
        drawBoardLayout(displayWidth, displayHeight);

        // Update math & draw components
        updatePhysics();

        // Draw Pegs (Pins)
        drawPegs();

        // Draw Droplets
        drawDroplets();

        // Draw Particles
        drawParticles();

        ctx.restore();

        requestAnimationFrame(renderLoop);
    }

    function updateDropBurst() {
        if (!dropBurst) return;

        dropBurst.radius += 3.6;
        dropBurst.alpha *= 0.92;

        if (dropBurst.alpha < 0.04 || dropBurst.radius >= dropBurst.maxRadius) {
            dropBurst = null;
        }

        if (boardGlow > 0) {
            boardGlow = Math.max(0, boardGlow - 0.06);
        }
    }

    function drawDropBurst() {
        if (!dropBurst) return;

        const burst = dropBurst;
        ctx.save();
        const gradient = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, burst.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.95 * burst.alpha})`);
        gradient.addColorStop(0.2, `${burst.color}`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.08 * burst.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.globalAlpha = burst.alpha;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * burst.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * 0.78, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawBoardLayout(w, h) {
        const data = ESSENCES[activeEssence];
        const numSlots = data.rows + 3;
        const slotW = w / numSlots;

        // Subtle board glow pulse on drop start
        if (boardGlow > 0) {
            ctx.save();
            ctx.globalAlpha = boardGlow * 0.18;
            ctx.fillStyle = data.color;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        // Draw boundaries
        ctx.strokeStyle = 'var(--border-color)';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(0, 0, w, h);

        // Draw vertical dividers at the bottom slots area (y: 540 to 600)
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
        ctx.lineWidth = 1.5;
        for (let s = 1; s < numSlots; s++) {
            let sx = s * slotW;
            ctx.beginPath();
            ctx.moveTo(sx, 540);
            ctx.lineTo(sx, 600);
            ctx.stroke();
        }

        // Draw bottom vials multipliers and background cards
        for (let s = 0; s < numSlots; s++) {
            let sx = s * slotW;
            let mult = data.mults[s];
            
            // Set colors based on size of multiplier
            let blockColor = 'rgba(10, 6, 20, 0.6)';
            let textColor = 'var(--text-secondary)';
            let glowColor = 'transparent';

            if (mult >= 10.0) {
                blockColor = 'rgba(255, 215, 0, 0.15)';
                textColor = 'var(--color-gold)';
                glowColor = 'var(--color-gold)';
            } else if (mult >= 1.5) {
                blockColor = 'rgba(57, 255, 20, 0.1)';
                textColor = 'var(--color-green)';
                glowColor = 'var(--color-green)';
            } else if (mult === 0.0) {
                blockColor = 'rgba(255, 51, 51, 0.05)';
                textColor = '#666';
            }

            // Fill card
            ctx.fillStyle = blockColor;
            ctx.fillRect(sx + 2, 542, slotW - 4, 56);
            
            // Border card
            if (glowColor !== 'transparent') {
                ctx.strokeStyle = glowColor;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 6;
                ctx.strokeRect(sx + 2, 542, slotW - 4, 56);
                ctx.shadowBlur = 0; // reset
            } else {
                ctx.strokeStyle = 'rgba(31, 18, 53, 0.15)';
                ctx.strokeRect(sx + 2, 542, slotW - 4, 56);
            }

            // Write multiplier value inside slot card
            ctx.fillStyle = textColor;
            ctx.font = '800 13px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${mult.toFixed(1)}x`, sx + slotW / 2, 570);
        }
    }

    function drawPegs() {
        pegs.forEach(peg => {
            ctx.save();
            ctx.beginPath();
            
            let radius = peg.radius * peg.pulse;
            ctx.arc(peg.x, peg.y, radius, 0, Math.PI * 2);

            let pegColor = 'rgba(74, 59, 100, 0.8)'; // standard gray runic peg
            let shadowColor = 'rgba(74, 59, 100, 0.3)';
            let shadowBlur = 4;

            // Wildcard coloring
            if (peg.wildcard === 'split') {
                pegColor = '#00ffff';
                shadowColor = '#00ffff';
                shadowBlur = 10;
            } else if (peg.wildcard === 'fire') {
                pegColor = '#ffd700';
                shadowColor = '#ffd700';
                shadowBlur = 10;
            } else if (peg.wildcard === 'frost') {
                pegColor = '#00c3ff';
                shadowColor = '#00c3ff';
                shadowBlur = 10;
            }

            ctx.fillStyle = pegColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.fill();
            ctx.restore();
        });
    }

    function drawDroplets() {
        droplets.forEach(p => {
            // Draw movement trail
            ctx.save();
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (let j = 1; j < p.trail.length; j++) {
                    ctx.lineTo(p.trail[j].x, p.trail[j].y);
                }
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = 0.25;
                ctx.lineWidth = p.radius * 0.8;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
            ctx.restore();

            // Draw droplet body
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            
            let grad = ctx.createRadialGradient(p.x - p.radius*0.2, p.y - p.radius*0.2, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, p.color);
            grad.addColorStop(1, blendColors(p.color, '#000000', 0.5));
            ctx.fillStyle = grad;

            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
        });
    }

    // Spark particles generator on Peg hit
    function spawnSparkParticles(x, y, color) {
        for (let i = 0; i < 4; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = 0.5 + Math.random() * 2.0;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                radius: 1.2 + Math.random() * 1.5,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.03,
                gravity: 0.08,
                color: color
            });
        }
    }

    // Land splash particle generator
    function spawnSplashParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            let angle = -Math.PI * (0.2 + Math.random() * 0.6); // spray upwards
            let speed = 1.0 + Math.random() * 3.5;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1.5 + Math.random() * 2.0,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.12,
                color: color
            });
        }
    }

    // Helper: Blend Hex/RGB colors
    function blendColors(c1, c2, weight) {
        function parseHex(h) {
            if (h.startsWith('var')) {
                if (h.includes('cyan')) return [0, 240, 255];
                if (h.includes('gold')) return [255, 215, 0];
                if (h.includes('danger')) return [255, 51, 51];
                if (h.includes('purple')) return [142, 68, 173];
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

    // ==========================================================================
    // HISTORY PANEL UPDATER
    // ==========================================================================

    function addHistoryBadge(type, value) {
        dropHistory.unshift({ type, value });
        if (dropHistory.length > 8) dropHistory.pop();
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (dropHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Keine Tropfen gelandet</div>';
            return;
        }

        dropHistory.forEach(item => {
            const badge = document.createElement('div');
            badge.className = `history-badge ${item.type}`;
            badge.textContent = item.value;
            historyList.appendChild(badge);
        });
    }

    // ==========================================================================
    // STATS & CHART DRAWING
    // ==========================================================================

    function updateStatsDisplay() {
        statDropsEl.textContent = stats.totalDrops;
        statHighMultEl.textContent = stats.highestMultiplier.toFixed(2) + 'x';
        statWildcardsEl.textContent = stats.wildcardsTriggered;

        if (tabBtnStats.classList.contains('active')) {
            drawBalanceChart();
        }
    }

    function drawBalanceChart() {
        const cCanvas = document.getElementById('plinko-chart');
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
            c.arc(p.x, p.y, 4, 0, Math.PI * 2);
            c.fillStyle = '#06030c';
            c.strokeStyle = '#00f0ff';
            c.lineWidth = 2;
            c.fill();
            c.stroke();
        });
    }

    // ==========================================================================
    // XP & SHARED PROGRESSION ENGINE
    // ==========================================================================

    function addXP(amount) {
        let oldLevel = level;
        if (window.AlchemistShared) {
            let mult = 1.0;
            if (window.AlchemistShared.hasRecipe && window.AlchemistShared.hasRecipe('crystal_essence')) {
                mult = 1.1; // +10% Plinko XP reward
            }
            window.AlchemistShared.addXP(Math.round(amount * mult));
        }
        // Sync local state from localStorage after shared engine updated it
        xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
        level = parseInt(localStorage.getItem('alchemist_level')) || 1;
        updateXPDisplay();

        // If level changed, trigger local effects
        if (level > oldLevel) {
            // Trigger level-up chime
            playLevelUpSound();
            // Check for new theme/upgrade unlocks based on level
            updateUnlockedItems(level);
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

    function updateUnlockedItems(newLvl) {
        if (newLvl === 2 && !unlockedThemes.includes('ice')) {
            showToast("🎁 FREIGESCHALTET: Eis-Kelch für 150€ im Labor kaufbar!");
        } else if (newLvl === 3 && !unlockedUpgrades.includes('copper')) {
            showToast("🎁 FREIGESCHALTET: Kupfer-Filter für 300€ im Labor kaufbar!");
        } else if (newLvl === 4 && !unlockedThemes.includes('volcano')) {
            showToast("🎁 FREIGESCHALTET: Vulkan-Topf für 500€ im Labor kaufbar!");
        } else if (newLvl === 5 && !unlockedUpgrades.includes('crystal')) {
            showToast("🎁 FREIGESCHALTET: Katalysator-Kristall für 800€ im Labor kaufbar!");
        }
        renderUpgradesStatus();
    }

    function playLevelUpSound() {
        if (isMuted || !audioCtx) return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            
            notes.forEach((freq, index) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.08);
                
                gain.gain.setValueAtTime(0.06 * volumeSFX, now + index * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now + index * 0.08);
                osc.stop(now + index * 0.08 + 0.7);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Achievements checklist matching cauldron
    function checkPlinkoAchievements(multiplier) {
        let alchemistAchievements = JSON.parse(localStorage.getItem('alchemist_achievements')) || {
            hermes: false, master: false, volcano: false, dragon: false, lucky: false
        };

        let unlocked = false;

        // Hermes: drop 5 potions successfully
        if (stats.totalDrops >= 5 && !alchemistAchievements.hermes) {
            alchemistAchievements.hermes = true;
            unlocked = true;
            addXP(200);
            showToast("🏆 ERLANGT: Lehrling des Hermes (+200 XP)");
        }

        // Master: mult over 8.00
        if (multiplier >= 8.0 && !alchemistAchievements.master) {
            alchemistAchievements.master = true;
            unlocked = true;
            addXP(200);
            showToast("🏆 ERLANGT: Großmeister (+200 XP)");
        }

        // Lucky: Wildcard events triggered
        if (stats.wildcardsTriggered >= 1 && !alchemistAchievements.lucky) {
            alchemistAchievements.lucky = true;
            unlocked = true;
            addXP(200);
            showToast("🏆 ERLANGT: Glückspilz (+200 XP)");
        }

        if (unlocked) {
            localStorage.setItem('alchemist_achievements', JSON.stringify(alchemistAchievements));
        }
    }

    // Helper: Toast Notifications
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.4s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // ==========================================================================
    // ADMIN PANEL MANAGEMENT
    // ==========================================================================

    function openAdminPanel() {
        // Load settings from state
        selectPlinkoMode.value = plinkoMode;
        slideGravity.value = gravity;
        slideBounce.value = elasticity;
        slideWinRate.value = targetRtp;

        valGravity.textContent = gravity.toFixed(2);
        valBounce.textContent = elasticity.toFixed(2);
        valWinRate.textContent = targetRtp + '%';

        onPlinkoModeChange();
        adminModal.classList.remove('hidden');
    }

    function onPlinkoModeChange() {
        const mode = selectPlinkoMode.value;
        if (mode === 'casino') {
            groupWinRate.classList.remove('hidden');
        } else {
            groupWinRate.classList.add('hidden');
        }
    }

    function resetAdminSettings() {
        selectPlinkoMode.value = 'standard';
        slideGravity.value = 0.25;
        slideBounce.value = 0.50;
        slideWinRate.value = 95;

        valGravity.textContent = '0.25';
        valBounce.textContent = '0.50';
        valWinRate.textContent = '95%';

        groupWinRate.classList.add('hidden');
    }

    function saveAdminSettings() {
        plinkoMode = selectPlinkoMode.value;
        gravity = parseFloat(slideGravity.value);
        elasticity = parseFloat(slideBounce.value);
        targetRtp = parseInt(slideWinRate.value);

        localStorage.setItem('alchemist_plinko_mode', plinkoMode);
        localStorage.setItem('alchemist_plinko_gravity', gravity.toFixed(2));
        localStorage.setItem('alchemist_plinko_elasticity', elasticity.toFixed(2));
        localStorage.setItem('alchemist_plinko_rtp', targetRtp.toString());

        adminModal.classList.add('hidden');
        showToast("⚙️ Plinko-Kontrollzentrum erfolgreich aktualisiert.");
    }

    // Initialize the game
    init();
});
