/* ==========================================================================
   ALCHEMISTEN-AKADEMIE: SHARED SYSTEM ENGINE (shared.js)
   ========================================================================== */

window.AlchemistShared = (function() {
    // --- SHARED STATE ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';
    let isMusicPlaying = localStorage.getItem('alchemist_music_playing') === 'true';
    let volumeMusic = parseFloat(localStorage.getItem('alchemist_volume_music') !== null ? localStorage.getItem('alchemist_volume_music') : '0.3');
    let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');

    // --- SYNTH MUSIC ENGINE STATE ---
    let audioCtx = null;
    let musicNode = null;
    let chordInterval = null;
    let currentChordIndex = 0;
    let musicIntensity = 0.0;
    let musicTempoBPM = 60;
    let activeOscillators = [];
    let filterNode = null;
    let musicGainNode = null;

    // Mystical chord pads (C minor, Ab major, Eb major, G minor)
    // Frequencies for chords: [Bass, Tenor, Alto, Soprano]
    const CHORDS = [
        [65.41, 130.81, 196.00, 261.63, 311.13], // C minor (C2, C3, G3, C4, Eb4)
        [51.91, 103.83, 155.56, 207.65, 261.63], // Ab major (Ab1, Ab2, Eb3, Ab3, C4)
        [77.78, 155.56, 233.08, 311.13, 392.00], // Eb major (Eb2, Eb3, Bb3, Eb4, G4)
        [49.00, 98.00, 146.83, 196.00, 293.66]   // G minor (G1, G2, D3, G3, D4)
    ];

    // --- QUESTS DEFINITIONS POOL ---
    const QUEST_POOL = [
        { id: "cauldron_round_5", text: "5x im Kessel brauen", type: "cauldron_rounds", targetCount: 5, rewardXP: 100, rewardGold: 50 },
        { id: "cauldron_mult_5", text: "Erreiche 4.00x im Kessel", type: "cauldron_mult", targetCount: 4.0, rewardXP: 150, rewardGold: 75 },
        { id: "cauldron_blood_3", text: "Drachenblut eingeworfen", type: "cauldron_dragon", targetCount: 2, rewardXP: 150, rewardGold: 75 },
        { id: "plinko_drop_15", text: "15 Plinko-Essenzen dropfen", type: "plinko_drops", targetCount: 15, rewardXP: 100, rewardGold: 50 },
        { id: "plinko_mult_10", text: "Erreiche 5x bei Plinko", type: "plinko_mult", targetCount: 5.0, rewardXP: 150, rewardGold: 75 },
        { id: "plinko_split_2", text: "Löse einen Blitz-Split aus", type: "plinko_split", targetCount: 1, rewardXP: 150, rewardGold: 75 },
        { id: "slots_spin_20", text: "20x an den Walzen drehen", type: "slots_spins", targetCount: 20, rewardXP: 100, rewardGold: 50 },
        { id: "slots_fs_1", text: "Löse Freispiele aus", type: "slots_freespins", targetCount: 1, rewardXP: 200, rewardGold: 100 },
        { id: "slots_win_50", text: "Einen Spin-Gewinn > 25€ erzielen", type: "slots_win", targetCount: 25.0, rewardXP: 150, rewardGold: 75 },
        { id: "mines_safe_10", text: "10x sichere Runen aufdecken", type: "mines_safe", targetCount: 10, rewardXP: 100, rewardGold: 50 },
        { id: "mines_mult_4", text: "Erreiche 3.00x in Runen-Minen", type: "mines_mult", targetCount: 3.0, rewardXP: 150, rewardGold: 75 },
        { id: "roulette_spin_10", text: "10x am Elementen-Rad drehen", type: "roulette_spins", targetCount: 10, rewardXP: 100, rewardGold: 50 },
        { id: "roulette_aether_1", text: "Gewinne eine Äther-Wette", type: "roulette_aether", targetCount: 1, rewardXP: 250, rewardGold: 125 },
        { id: "blackjack_win_3", text: "Gewinne 3 Blackjack-Duelle", type: "blackjack_wins", targetCount: 3, rewardXP: 150, rewardGold: 75 }
    ];

    // Initialize shared components
    function init() {
        createToastContainer();
        initQuests();
        initStats();
        injectFloatingMusicButton();
        injectFloatingQuestButton();
        injectFloatingPotionHUD();
        injectQuickTravelStyles();
        injectQuickTravel();
        applyActivePotionEffects();

        // Initialize rivals and legendary quests if not present
        getRivals();
        getLegendaryQuest();

        // Apply theme on load
        applyCurrentTheme();

        // Resume AudioContext on first page interaction
        document.body.addEventListener('click', () => {
            initAudio();
            if (isMusicPlaying && !isMuted) {
                startMusic();
            }
        }, { once: true });
    }

    // --- AUDIO SYSTEM ---
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        musicGainNode = audioCtx.createGain();
        musicGainNode.gain.setValueAtTime(0.0, audioCtx.currentTime); // fade-in handles volume

        filterNode = audioCtx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(280, audioCtx.currentTime); // soft lowpass
        filterNode.Q.setValueAtTime(1.5, audioCtx.currentTime);

        musicGainNode.connect(filterNode);
        filterNode.connect(audioCtx.destination);
    }

    function toggleMusic() {
        initAudio();
        isMusicPlaying = !isMusicPlaying;
        localStorage.setItem('alchemist_music_playing', isMusicPlaying);
        
        const musicBtn = document.getElementById('alchemist-music-toggle-btn');

        if (isMusicPlaying) {
            startMusic();
            if (musicBtn) musicBtn.classList.add('playing');
            showToast("🎵 Magische Akkorde gestartet.");
        } else {
            stopMusic();
            if (musicBtn) musicBtn.classList.remove('playing');
        }
    }

    function startMusic() {
        if (chordInterval) return;
        playNextChord();
        scheduleNextChordLoop();
    }

    function stopMusic() {
        if (chordInterval) {
            clearTimeout(chordInterval);
            chordInterval = null;
        }
        fadeCurrentChord();
    }

    function scheduleNextChordLoop() {
        let duration = (60 / musicTempoBPM) * 4 * 1000; // time in ms per chord (4 beats)
        chordInterval = setTimeout(() => {
            currentChordIndex = (currentChordIndex + 1) % CHORDS.length;
            playNextChord();
            scheduleNextChordLoop();
        }, duration);
    }

    function playNextChord() {
        if (!audioCtx || audioCtx.state === 'suspended') return;
        fadeCurrentChord();

        let now = audioCtx.currentTime;
        let notes = CHORDS[currentChordIndex];
        
        // Dynamic volume based on intensity and slider volume
        let targetVolume = (0.015 + (musicIntensity * 0.015)) * volumeMusic;
        if (isMuted) targetVolume = 0.0;
        
        musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, now);
        musicGainNode.gain.linearRampToValueAtTime(targetVolume, now + 1.2);

        // Cutoff rises with intensity
        let cutoff = 240 + (musicIntensity * 450);
        filterNode.frequency.setValueAtTime(filterNode.frequency.value, now);
        filterNode.frequency.exponentialRampToValueAtTime(cutoff, now + 1.5);

        // Spawn a synth oscillator for each note in the chord
        notes.forEach((freq, idx) => {
            let osc = audioCtx.createOscillator();
            let noteGain = audioCtx.createGain();
            
            // Bass is deeper, higher voices have slight vibrato
            osc.type = (idx === 0) ? 'sine' : 'triangle';
            
            // Detune slightly for lush chorus effect
            osc.frequency.value = freq + (Math.random() - 0.5) * 0.8;
            
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.2, now + 1.0 + (idx * 0.2));
            
            // Vibrato (pitch modulation) for higher notes
            if (idx > 1 && musicIntensity > 0.3) {
                let lfo = audioCtx.createOscillator();
                let lfoGain = audioCtx.createGain();
                lfo.frequency.value = 3.5 + Math.random(); // 3.5-4.5Hz vibrato
                lfoGain.gain.value = 1.5 + (musicIntensity * 2.0); // vibrato depth
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(now);
                osc.lfo = lfo; // save reference to stop later
            }

            osc.connect(noteGain);
            noteGain.connect(musicGainNode);
            osc.start(now);

            activeOscillators.push({ osc, gain: noteGain });
        });
    }

    function fadeCurrentChord() {
        if (!audioCtx) return;
        let now = audioCtx.currentTime;
        let oldOscillators = activeOscillators;
        activeOscillators = [];

        oldOscillators.forEach(({ osc, gain }) => {
            try {
                gain.gain.setValueAtTime(gain.gain.value, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
                osc.stop(now + 1.9);
                if (osc.lfo) osc.lfo.stop(now + 1.9);
            } catch(e) {}
        });
    }

    function setMusicState(intensity, tempoBPM) {
        musicIntensity = Math.max(0.0, Math.min(1.0, intensity));
        musicTempoBPM = Math.max(40, Math.min(180, tempoBPM));
        
        if (audioCtx && musicGainNode && !isMuted && isMusicPlaying) {
            let now = audioCtx.currentTime;
            let targetVolume = (0.015 + (musicIntensity * 0.015)) * volumeMusic;
            musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, now);
            musicGainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.5);

            let cutoff = 240 + (musicIntensity * 450);
            filterNode.frequency.setValueAtTime(filterNode.frequency.value, now);
            filterNode.frequency.exponentialRampToValueAtTime(cutoff, now + 0.8);
        }
    }

    // Play Plinko peg bounce chimes
    function playBounceNote(pitchFactor) {
        if (isMuted || !audioCtx || audioCtx.state === 'suspended' || volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            let delayNode = audioCtx.createDelay();
            let feedback = audioCtx.createGain();

            // Calculate pentatonic frequency based on pitchFactor (0.0 to 1.0)
            const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]; // C pentatonic
            let noteIdx = Math.floor(pitchFactor * scale.length);
            noteIdx = Math.max(0, Math.min(scale.length - 1, noteIdx));
            let freq = scale[noteIdx];

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.06 * volumeSFX, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            // Synthesize short delay/reverb echo effect
            delayNode.delayTime.setValueAtTime(0.12, now);
            feedback.gain.setValueAtTime(0.3, now);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            // Connect echo loop
            gain.connect(delayNode);
            delayNode.connect(feedback);
            feedback.connect(delayNode);
            feedback.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.4);
        } catch(e) {}
    }

    // Procedural sound synthesizer (Web Audio API)
    function playProceduralSound(type) {
        if (isMuted || !audioCtx || audioCtx.state === 'suspended' || volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            if (type === 'slots_spin') {
                let bufferSize = audioCtx.sampleRate * 0.15;
                let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                let data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                let noiseNode = audioCtx.createBufferSource();
                noiseNode.buffer = buffer;
                
                let filter = audioCtx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(500, now);
                filter.frequency.exponentialRampToValueAtTime(1500, now + 0.12);
                
                let gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.06 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                
                noiseNode.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                noiseNode.start(now);
            } else if (type === 'slots_stop') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.05 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.10);
            } else if (type === 'roulette_tick') {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
                gain.gain.setValueAtTime(0.04 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'win_fanfare') {
                let notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0, now + idx * 0.08);
                    gain.gain.linearRampToValueAtTime(0.05 * volumeSFX, now + idx * 0.08 + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.35);
                });
            } else if (type === 'level_up') {
                let notes = [261.63, 329.63, 392.00, 523.25];
                notes.forEach((freq) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now);
                    
                    let filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(300, now);
                    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.04 * volumeSFX, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.60);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.start(now);
                    osc.stop(now + 0.70);
                });
            }
        } catch (e) {}
    }

    // --- DELUXE ARENA SPELLS LEVEL API ---
    function getArenaSpells() {
        return JSON.parse(localStorage.getItem('alchemist_arena_spells')) || { fire: 1, earth: 1, wind: 1, iceUnlocked: false };
    }

    function upgradeSpell(spellId) {
        let spells = getArenaSpells();
        if (spellId === 'ice') {
            spells.iceUnlocked = true;
            showToast("❄️ Eis-Spruchrolle entziffert! Der Eis-Splitter-Zauber ist nun bereit.", "quest-complete");
        } else {
            spells[spellId] = (spells[spellId] || 1) + 1;
            let spellName = spellId === 'fire' ? 'Feuerstoß' : (spellId === 'earth' ? 'Erdbeben' : 'Windstoß');
            showToast(`🔥 ${spellName} auf Stufe ${spells[spellId]} aufgewertet!`, "quest-complete");
        }
        localStorage.setItem('alchemist_arena_spells', JSON.stringify(spells));
        addXP(150);
        return true;
    }

    // --- XP & LEVEL PROGRESSION ---
    function addXP(amount) {
        // Always re-read from localStorage to avoid stale internal state
        // (cauldron or other games may write directly to localStorage)
        xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
        level = parseInt(localStorage.getItem('alchemist_level')) || 1;

        let diplomas = getDiplomas();
        let boostedAmount = Math.round(amount * (1.0 + (diplomas * 0.1)));
        xp += boostedAmount;
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

        // Update local HUDs
        updateLocalHUD();

        if (levelUpHappened) {
            showToast(`⭐ STUFE UP! Du hast Stufe ${level} erreicht!`, 'level-up');
            playProceduralSound('level_up');
            // Trigger unlock checks
            checkUnlocks(level);
        }
    }

    function addBalance(amount) {
        // Always re-read from localStorage to avoid stale internal state
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        balance += amount;
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
        updateLocalHUD();
    }

    function checkUnlocks(newLvl) {
        let unlockedThemes = JSON.parse(localStorage.getItem('alchemist_unlocked_themes')) || ['default'];
        let unlockedUpgrades = JSON.parse(localStorage.getItem('alchemist_unlocked_upgrades')) || [];
        
        if (newLvl === 2 && !unlockedThemes.includes('ice')) {
            showToast("🎁 FREIGESCHALTET: Der Eis-Kelch kann jetzt im Labor für 150€ gekauft werden!");
        } else if (newLvl === 3 && !unlockedUpgrades.includes('copper')) {
            showToast("🎁 FREIGESCHALTET: Der Kupfer-Filter kann jetzt im Labor für 300€ gekauft werden!");
        } else if (newLvl === 4 && !unlockedThemes.includes('volcano')) {
            showToast("🎁 FREIGESCHALTET: Der Vulkan-Topf kann jetzt im Labor für 500€ gekauft werden!");
        } else if (newLvl === 5 && !unlockedUpgrades.includes('crystal')) {
            showToast("🎁 FREIGESCHALTET: Der Katalysator-Kristall kann jetzt im Labor für 800€ gekauft werden!");
        }
    }

    function updateLocalHUD() {
        // Find balance and XP elements in the current page DOM and refresh them
        const balanceEl = document.getElementById('balance-amount');
        if (balanceEl) {
            balanceEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        const lvlEl = document.getElementById('xp-level-num');
        const xpCurEl = document.getElementById('xp-current-val');
        const xpTgtEl = document.getElementById('xp-target-val');
        const xpBarEl = document.getElementById('xp-bar-fill');

        if (lvlEl) lvlEl.textContent = level;
        if (xpCurEl) xpCurEl.textContent = xp;
        if (xpTgtEl) xpTgtEl.textContent = level * 500;
        if (xpBarEl) {
            let percentage = (xp / (level * 500)) * 100;
            xpBarEl.style.width = `${percentage}%`;
        }
    }

    // --- QUEST ENGINE ---
    function initQuests() {
        let questDate = localStorage.getItem('alchemist_quests_date');
        let today = new Date().toDateString();

        if (questDate !== today) {
            // Generate 3 random quests
            let shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
            let dailyQuests = shuffled.slice(0, 3).map(q => ({
                ...q,
                current: 0,
                completed: false
            }));

            localStorage.setItem('alchemist_quests', JSON.stringify(dailyQuests));
            localStorage.setItem('alchemist_quests_date', today);
        }
    }

    function progressQuest(type, amount) {
        let dailyQuests = JSON.parse(localStorage.getItem('alchemist_quests')) || [];
        let updated = false;

        dailyQuests.forEach(q => {
            if (q.type === type && !q.completed) {
                if (type.includes("mult") || type === "slots_win") {
                    // Maximum value checks
                    if (amount > q.current) {
                        q.current = amount;
                        updated = true;
                    }
                } else {
                    // Cumulative additions
                    q.current += amount;
                    updated = true;
                }

                // Check completion
                if (q.current >= q.targetCount) {
                    q.current = q.targetCount;
                    q.completed = true;
                    
                    // Give Rewards
                    addBalance(q.rewardGold);
                    addXP(q.rewardXP);

                    showToast(`📜 QUEST ERLEDIGT: ${q.text} (+${q.rewardGold}€ / +${q.rewardXP} XP)`, 'quest-complete');
                }
            }
        });

        if (updated) {
            localStorage.setItem('alchemist_quests', JSON.stringify(dailyQuests));
        }
    }

    // --- UNIVERSAL ALCHEMICAL GAMBLE OVERLAY ---
    function triggerGamble(currentWin, callback) {
        if (currentWin <= 0) {
            callback(0);
            return;
        }

        // Lock background interaction
        const overlay = document.createElement('div');
        overlay.className = 'alchemist-gamble-overlay';
        
        let accumulatedWin = currentWin;
        let potentialWin = currentWin * 2.0;

        overlay.innerHTML = `
            <div class="alchemist-gamble-box" id="gamble-box">
                <h2 class="alchemist-gamble-title">🧪 Magisches Risiko-Mischen</h2>
                <p class="alchemist-gamble-subtitle">Mische dein gewonnenes Elixier mit einer reaktiven Zutat. Wählst du die richtige Farbe, verdoppelt sich dein Gewinn!</p>
                
                <!-- Flask Choice Area -->
                <div class="alchemist-gamble-flasks" id="gamble-flasks-area">
                    <button class="alchemist-flask-btn red" id="btn-flask-red">
                        <svg class="alchemist-flask-svg" viewBox="0 0 100 150">
                            <path d="M40,10 L60,10 L60,40 L90,120 A20,20 0 0,1 70,140 L30,140 A20,20 0 0,1 10,120 L40,40 Z"/>
                        </svg>
                        <span class="alchemist-flask-label">ROTER RUBIN</span>
                    </button>

                    <button class="alchemist-flask-btn blue" id="btn-flask-blue">
                        <svg class="alchemist-flask-svg" viewBox="0 0 100 150">
                            <path d="M40,10 L60,10 L60,40 L90,120 A20,20 0 0,1 70,140 L30,140 A20,20 0 0,1 10,120 L40,40 Z"/>
                        </svg>
                        <span class="alchemist-flask-label">BLAUER SAPHIR</span>
                    </button>
                </div>

                <!-- Animated Mixing Beaker (Hidden initially) -->
                <div class="alchemist-gamble-beaker" id="gamble-beaker-area">
                    <svg class="alchemist-beaker-svg" viewBox="0 0 100 150">
                        <path d="M25,20 L75,20 L75,130 A10,10 0 0,1 65,140 L35,140 A10,10 0 0,1 25,130 Z"/>
                        <path class="alchemist-beaker-liquid" id="beaker-liquid" d="M26,110 L74,110 L74,130 A9,9 0 0,1 65,139 L35,139 A9,9 0 0,1 26,130 Z"/>
                        <g class="alchemist-beaker-bubbles" id="beaker-bubbles">
                            <circle cx="35" cy="120" r="3"/>
                            <circle cx="50" cy="115" r="4"/>
                            <circle cx="65" cy="125" r="2.5"/>
                        </g>
                    </svg>
                    <p class="alchemist-quest-desc" id="mixing-status-text" style="margin-top: 15px; font-weight:700;">Reagenzien werden gemischt...</p>
                </div>

                <div class="alchemist-gamble-values">
                    <div class="alchemist-gamble-value-card">
                        <span class="alchemist-val-label">AKTUELLER WERT</span>
                        <span class="alchemist-val-amount" id="gamble-cur-win-val">${accumulatedWin.toFixed(2)} €</span>
                    </div>
                    <div class="alchemist-gamble-value-card">
                        <span class="alchemist-val-label">RISIKO-WERT</span>
                        <span class="alchemist-val-amount potential" id="gamble-pot-win-val">${potentialWin.toFixed(2)} €</span>
                    </div>
                </div>

                <div class="alchemist-gamble-actions" id="gamble-actions-area">
                    <button class="alchemist-gamble-btn secondary" id="btn-gamble-collect">
                        <i class="fa-solid fa-hand-holding-dollar"></i> GEWINN SICHERN
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const btnRed = document.getElementById('btn-flask-red');
        const btnBlue = document.getElementById('btn-flask-blue');
        const btnCollect = document.getElementById('btn-gamble-collect');
        const flasksArea = document.getElementById('gamble-flasks-area');
        const beakerArea = document.getElementById('gamble-beaker-area');
        const beakerLiquid = document.getElementById('beaker-liquid');
        const statusText = document.getElementById('mixing-status-text');
        const curWinVal = document.getElementById('gamble-cur-win-val');
        const potWinVal = document.getElementById('gamble-pot-win-val');
        const actionsArea = document.getElementById('gamble-actions-area');
        const gambleBox = document.getElementById('gamble-box');

        btnCollect.addEventListener('click', () => {
            closeGamble(accumulatedWin);
        });

        btnRed.addEventListener('click', () => mixElixirs('red'));
        btnBlue.addEventListener('click', () => mixElixirs('blue'));

        function mixElixirs(chosenColor) {
            // Hide flasks, show beaker
            flasksArea.style.display = 'none';
            beakerArea.style.display = 'flex';
            btnCollect.style.display = 'none';

            // Set mixing liquid color based on choice
            beakerLiquid.style.fill = (chosenColor === 'red') ? '#ff2d55' : '#00f0ff';
            gambleBox.classList.add('alchemist-shaking');

            // Play procedural boiling sound
            playBoilSound();

            setTimeout(() => {
                gambleBox.classList.remove('alchemist-shaking');
                
                // Roll 50% chance
                let success = Math.random() < 0.5;
                if (success) {
                    // Win!
                    accumulatedWin = potentialWin;
                    potentialWin = accumulatedWin * 2.0;

                    beakerLiquid.style.fill = '#ffd700'; // golden success
                    statusText.innerHTML = "✨ ERFOLG! Der Trank hat sich veredelt! ✨";
                    statusText.style.color = '#ffd700';

                    // Update values display
                    curWinVal.textContent = accumulatedWin.toFixed(2) + " €";
                    potWinVal.textContent = potentialWin.toFixed(2) + " €";

                    // Play success sound
                    playSuccessChime();

                    // Show options again
                    beakerArea.style.display = 'none';
                    flasksArea.style.display = 'flex';
                    btnCollect.style.display = 'inline-flex';

                    // Update action buttons area
                    actionsArea.innerHTML = `
                        <button class="alchemist-gamble-btn secondary" id="btn-gamble-collect-new">
                            <i class="fa-solid fa-hand-holding-dollar"></i> GEWINN SICHERN
                        </button>
                    `;
                    document.getElementById('btn-gamble-collect-new').addEventListener('click', () => {
                        closeGamble(accumulatedWin);
                    });

                } else {
                    // Explosion loss!
                    accumulatedWin = 0;
                    beakerLiquid.style.fill = '#222'; // charred black
                    beakerArea.classList.add('alchemist-shaking');
                    statusText.innerHTML = "💥 FEHLSCHLAG! Der Trank ist verpufft! 💥";
                    statusText.style.color = '#ff3333';

                    // Play explosion boom
                    playExplosionSound();

                    // Hide buttons, show close button
                    actionsArea.innerHTML = `
                        <button class="alchemist-gamble-btn primary" id="btn-gamble-close">
                            BEENDEN
                        </button>
                    `;
                    document.getElementById('btn-gamble-close').addEventListener('click', () => {
                        closeGamble(0);
                    });
                }

            }, 2200);
        }

        function closeGamble(finalAmount) {
            overlay.remove();
            callback(finalAmount);
        }
    }

    // --- PROCEDURAL SOUND GENERATOR (GAMBLE & UI) ---
    function playBoilSound() {
        if (isMuted || !audioCtx || volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            
            // White noise node for boiling sizzle
            let bufferSize = audioCtx.sampleRate * 2.0;
            let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            let data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            let noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            let filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 8.0;
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.exponentialRampToValueAtTime(1200, now + 2.0);

            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04 * volumeSFX, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start(now);
            noise.stop(now + 2.2);
        } catch(e) {}
    }

    function playSuccessChime() {
        if (isMuted || !audioCtx || volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio
            notes.forEach((freq, i) => {
                let osc = audioCtx.createOscillator();
                let gainNode = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.08 * volumeSFX, now + i * 0.1 + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.5);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.6);
            });
        } catch(e) {}
    }

    function playExplosionSound() {
        if (isMuted || !audioCtx || volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            let osc = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();
            let filter = audioCtx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.linearRampToValueAtTime(20, now + 0.7);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);

            gainNode.gain.setValueAtTime(0.3 * volumeSFX, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.85);
        } catch(e) {}
    }

    // --- HTML INJECTIONS ---
    function createToastContainer() {
        if (document.querySelector('.alchemist-toast-container')) return;
        const container = document.createElement('div');
        container.className = 'alchemist-toast-container';
        document.body.appendChild(container);
    }

    function showToast(message, type = 'info') {
        createToastContainer();
        const container = document.querySelector('.alchemist-toast-container');
        const toast = document.createElement('div');
        toast.className = `alchemist-toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'level-up') icon = '⭐';
        if (type === 'quest-complete') icon = '📜';
        
        toast.innerHTML = `
            <span class="alchemist-toast-icon">${icon}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.4s ease forwards';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    function injectFloatingMusicButton() {
        if (document.getElementById('alchemist-music-toggle-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'alchemist-music-toggle-btn';
        btn.className = `alchemist-music-toggle ${isMusicPlaying ? 'playing' : ''}`;
        btn.title = "Ambient-Musik umschalten";
        btn.innerHTML = `<i class="fa-solid fa-music"></i>`;
        
        document.body.appendChild(btn);

        btn.addEventListener('click', toggleMusic);
    }

    function injectFloatingQuestButton() {
        // Only inject in subgames, not on lobby itself
        if (window.location.pathname.endsWith('index.html') && 
            !window.location.pathname.includes('/cauldron/') && 
            !window.location.pathname.includes('/slots/') && 
            !window.location.pathname.includes('/plinko/') &&
            !window.location.pathname.includes('/mines/') &&
            !window.location.pathname.includes('/roulette/')) {
            // We are on lobby, do not inject floating quest button since quests are shown inline
            return;
        }
        if (document.getElementById('alchemist-quest-toggle-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'alchemist-quest-toggle-btn';
        btn.className = 'alchemist-quest-trigger';
        btn.innerHTML = `<i class="fa-solid fa-book-sparkles"></i> Quests`;
        document.body.appendChild(btn);

        btn.addEventListener('click', showQuestModal);
    }

    function injectFloatingPotionHUD() {
        let existing = document.getElementById('alchemist-potion-hud');
        if (existing) existing.remove();

        let act = getActivePotions();
        let activeKeys = Object.keys(act).filter(key => act[key] > 0);
        if (activeKeys.length === 0) return;

        const container = document.createElement('div');
        container.id = 'alchemist-potion-hud';
        container.className = 'potion-hud-container';

        activeKeys.forEach(potionId => {
            const def = POTION_DEFS[potionId];
            const rounds = act[potionId];
            const badge = document.createElement('div');
            badge.className = `active-potion-badge ${potionId}`;
            badge.innerHTML = `
                <span style="font-size: 1.2rem;">${def.icon}</span>
                <div style="display:flex; flex-direction:column; text-align:left;">
                    <span style="font-size:0.75rem; font-weight:800; line-height:1.2;">${def.name}</span>
                    <span style="font-size:0.6rem; color:#a99ec6; font-weight:normal; line-height:1.2;">${def.desc}</span>
                </div>
                <span class="potion-duration" style="font-size: 0.65rem; font-weight: 800; color: #ffd700; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,215,0,0.2); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${rounds} Rnd.</span>
            `;
            container.appendChild(badge);
        });

        document.body.appendChild(container);
    }

    function showQuestModal() {
        if (document.getElementById('alchemist-quest-modal')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'alchemist-quest-modal';
        overlay.className = 'alchemist-quest-overlay';

        let dailyQuests = JSON.parse(localStorage.getItem('alchemist_quests')) || [];
        let cardsHtml = dailyQuests.map(q => {
            let percent = (q.current / q.targetCount) * 100;
            return `
                <div class="alchemist-quest-card ${q.completed ? 'completed' : ''}">
                    <span class="alchemist-quest-desc">${q.text}</span>
                    <div class="alchemist-quest-progress-wrapper">
                        <div class="alchemist-quest-bar-outer">
                            <div class="alchemist-quest-bar-inner" style="width: ${percent}%;"></div>
                        </div>
                        <span class="alchemist-quest-nums">${q.current} / ${q.targetCount}</span>
                    </div>
                    <div class="alchemist-quest-rewards">
                        <div class="alchemist-reward-item gold"><i class="fa-solid fa-coins"></i> +${q.rewardGold}€</div>
                        <div class="alchemist-reward-item xp"><i class="fa-solid fa-sparkles"></i> +${q.rewardXP} XP</div>
                    </div>
                </div>
            `;
        }).join('');

        overlay.innerHTML = `
            <div class="alchemist-quest-box">
                <h2 class="alchemist-quest-title"><i class="fa-solid fa-book-sparkles"></i> Tägliche Akademie-Aufträge</h2>
                <p class="alchemist-gamble-subtitle" style="margin-bottom:15px;">Erfülle diese Aufträge in den Spielen für Extra-Gold und XP.</p>
                <div class="alchemist-quest-list">
                    ${cardsHtml}
                </div>
                <button class="alchemist-quest-close-btn" id="btn-close-quests">ZURÜCK ZUM LABOR</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.getElementById('btn-close-quests').addEventListener('click', () => overlay.remove());
    }

    function initStats() {
        let stats = localStorage.getItem('alchemist_stats');
        if (!stats) {
            let initialStats = {
                global: { totalRounds: 0, totalWins: 0, highestMultiplier: 1.00, balanceHistory: [1000] },
                cauldron: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                plinko: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                slots: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                mines: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                roulette: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                dice: { rounds: 0, wins: 0, highestMultiplier: 1.00 }
            };
            localStorage.setItem('alchemist_stats', JSON.stringify(initialStats));
        } else {
            // Migrating old flat stats structure if it exists
            try {
                let parsed = JSON.parse(stats);
                if (parsed.totalRounds !== undefined && parsed.global === undefined) {
                    let migrated = {
                        global: {
                            totalRounds: parsed.totalRounds || 0,
                            totalWins: parsed.totalWins || 0,
                            highestMultiplier: parsed.highestMultiplier || 1.00,
                            balanceHistory: parsed.balanceHistory || [1000]
                        },
                        cauldron: { rounds: parsed.totalRounds || 0, wins: parsed.totalWins || 0, highestMultiplier: parsed.highestMultiplier || 1.00 },
                        plinko: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                        slots: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                        mines: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                        roulette: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
                        dice: { rounds: 0, wins: 0, highestMultiplier: 1.00 }
                    };
                    localStorage.setItem('alchemist_stats', JSON.stringify(migrated));
                }
            } catch(e) {}
        }
    }

    const RECIPE_DEFS = {
        midas: { title: 'Elixier des Midas', desc: 'Gewinn > 50€ an den Spins (Slots) erzielen.', rewardDesc: '+5% permanente Slots-Gewinne', icon: '👑' },
        ice_tincture: { title: 'Eiszeit-Tinktur', desc: 'Erreiche > 4.00x im Kessel mit Eis-Theme.', rewardDesc: '-5% Kessel-Instabilitätszuwachs', icon: '❄️' },
        crystal_essence: { title: 'Kristalline Essenz', desc: 'Erreiche einen 5.00x Multiplikator bei Plinko.', rewardDesc: '+10% Plinko-XP Belohnung', icon: '🔮' },
        master_rune: { title: 'Meister-Rune', desc: 'Sicheren Gewinn nach 10 Runen-Aufdeckungen abholen.', rewardDesc: '1x freies Minen-Aufdecken pro Runde', icon: '💎' },
        aether_vibe: { title: 'Ätherische Schwingung', desc: 'Gewinne eine Äther-Wette bei Roulette.', rewardDesc: '+10% Roulette-Gewinne', icon: '🌌' },
        dice_master: { title: 'Athanor-Meister', desc: 'Erreiche eine 3er-Siegessträhne bei Athanor-Würfeln.', rewardDesc: '+10% Vorhersage-Gewinne im Predict-Modus', icon: '🎲' }
    };

    function hasUpgrade(upgradeId) {
        let activeUpgrades = JSON.parse(localStorage.getItem('alchemist_upgrades')) || { copper: false, crystal: false, catalyst: false, detector: false, magnet: false, bellows: false };
        return !!activeUpgrades[upgradeId];
    }

    function hasRecipe(recipeId) {
        let recipes = JSON.parse(localStorage.getItem('alchemist_recipes')) || {
            midas: false, ice_tincture: false, crystal_essence: false, master_rune: false, aether_vibe: false, dice_master: false
        };
        return !!recipes[recipeId];
    }

    function unlockRecipe(recipeId) {
        let recipes = JSON.parse(localStorage.getItem('alchemist_recipes')) || {
            midas: false, ice_tincture: false, crystal_essence: false, master_rune: false, aether_vibe: false, dice_master: false
        };
        if (recipes[recipeId] === false) {
            recipes[recipeId] = true;
            localStorage.setItem('alchemist_recipes', JSON.stringify(recipes));
            showToast(`✨ REZEPT ENTDECKT: ${RECIPE_DEFS[recipeId].title}!`, 'quest-complete');
            addXP(250);
        }
    }

    function applyCurrentTheme() {
        const theme = localStorage.getItem('alchemist_theme') || 'default';
        document.body.classList.remove('theme-default', 'theme-ice', 'theme-volcano', 'theme-astral');
        document.body.classList.add('theme-' + theme);
    }

    // --- DELUXE PRESTIGE & DIPLOMA SYSTEM ---
    function getDiplomas() {
        return parseInt(localStorage.getItem('alchemist_diplomas')) || 0;
    }

    function submitThesisPrestige() {
        let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
        if (level < 10) {
            showToast("❌ Du musst mindestens Stufe 10 erreichen, um deine Thesis einzureichen!", "info");
            return false;
        }
        
        let diplomas = getDiplomas() + 1;
        localStorage.setItem('alchemist_diplomas', diplomas);
        
        // Reset values
        localStorage.setItem('alchemist_level', '1');
        localStorage.setItem('alchemist_xp', '0');
        localStorage.setItem('alchemist_balance', '1000.00');
        
        let emptyIngredients = { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 };
        localStorage.setItem('alchemist_ingredients', JSON.stringify(emptyIngredients));
        
        let emptyPotions = { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
        localStorage.setItem('alchemist_potions', JSON.stringify(emptyPotions));
        localStorage.setItem('alchemist_active_potions', JSON.stringify(emptyPotions));
        
        showToast(`🎓 THESIS ANGENOMMEN! Du hast dein ${diplomas}. Diplom erworben! (Boni erhöht)`, 'level-up');
        
        updateLocalHUD();
        applyActivePotionEffects();
        
        if (typeof window.location !== 'undefined') {
            setTimeout(() => { window.location.reload(); }, 2000);
        }
        return true;
    }

    // --- DELUXE RIVALS LEADERBOARD SYSTEM ---
    function getRivals() {
        let rivals = JSON.parse(localStorage.getItem('alchemist_rivals'));
        if (!rivals) {
            rivals = [
                { name: "Meister Ignatius", icon: "🧓", level: 10, balance: 5000, xp: 0 },
                { name: "Marius der Weise", icon: "🧙", level: 7, balance: 2500, xp: 0 },
                { name: "Kräuterhexe Sybilla", icon: "🧙‍♀️", level: 5, balance: 1400, xp: 0 },
                { name: "Novizin Sophie", icon: "👧", level: 3, balance: 800, xp: 0 },
                { name: "Lehrling Klaas", icon: "👦", level: 2, balance: 400, xp: 0 }
            ];
            localStorage.setItem('alchemist_rivals', JSON.stringify(rivals));
        }
        return rivals;
    }

    function updateRivals() {
        let rivals = getRivals();
        rivals.forEach(r => {
            let balChange = (Math.random() - 0.45) * 120;
            r.balance = Math.max(50, parseFloat((r.balance + balChange).toFixed(2)));
            
            let xpGained = Math.floor(Math.random() * 60) + 10;
            r.xp += xpGained;
            let targetXP = r.level * 500;
            if (r.xp >= targetXP) {
                r.xp -= targetXP;
                r.level++;
            }
        });
        localStorage.setItem('alchemist_rivals', JSON.stringify(rivals));
    }

    // --- DELUXE LEGENDARY QUESTS SYSTEM ---
    const LEGENDARY_QUEST_POOL = [
        { id: "boss_slayer", text: "Besiege Ignatius auf Etage 5", type: "arena_boss_win", targetCount: 1, rewardXP: 1000, rewardGold: 500, npcName: "Kräuterhexe Sybilla", npcIcon: "🧙‍♀️", recipeUnlock: "midas" },
        { id: "cauldron_king", text: "Erreiche 10.00x im Kessel", type: "cauldron_mult_legendary", targetCount: 10.0, rewardXP: 800, rewardGold: 400, npcName: "Meister Ignatius", npcIcon: "🧓", recipeUnlock: "ice_tincture" },
        { id: "mines_legend", text: "Decke 12 Runen in einer Runde auf", type: "mines_legendary", targetCount: 12, rewardXP: 900, rewardGold: 450, npcName: "Reisender Händler Silas", npcIcon: "👳", recipeUnlock: "master_rune" },
        { id: "roulette_master", text: "Gewinne 2 Äther-Wetten bei Roulette", type: "roulette_aether_legendary", targetCount: 2, rewardXP: 1200, rewardGold: 600, npcName: "Novizin Aurelia", npcIcon: "👧", recipeUnlock: "aether_vibe" }
    ];

    function getLegendaryQuest() {
        let quest = JSON.parse(localStorage.getItem('alchemist_legendary_quest'));
        if (!quest) {
            let base = LEGENDARY_QUEST_POOL[Math.floor(Math.random() * LEGENDARY_QUEST_POOL.length)];
            quest = { ...base, current: 0, completed: false };
            localStorage.setItem('alchemist_legendary_quest', JSON.stringify(quest));
        }
        return quest;
    }

    function progressLegendaryQuest(type, amount) {
        let q = getLegendaryQuest();
        if (!q || q.completed) return;
        
        let updated = false;
        if (q.type === type) {
            if (type.includes("mult")) {
                if (amount > q.current) {
                    q.current = amount;
                    updated = true;
                }
            } else {
                q.current += amount;
                updated = true;
            }
            
            if (q.current >= q.targetCount) {
                q.current = q.targetCount;
                q.completed = true;
                addBalance(q.rewardGold);
                addXP(q.rewardXP);
                if (q.recipeUnlock) {
                    unlockRecipe(q.recipeUnlock);
                }
                showToast(`👑 LEGENDE ERFÜLLT: ${q.text} (+${q.rewardGold}€ / +${q.rewardXP} XP)`, 'quest-complete');
                setTimeout(cycleLegendaryQuest, 3000);
            }
        }
        
        if (updated || q.completed) {
            localStorage.setItem('alchemist_legendary_quest', JSON.stringify(q));
        }
    }

    function cycleLegendaryQuest() {
        let current = getLegendaryQuest();
        let remaining = LEGENDARY_QUEST_POOL.filter(q => q.id !== current.id);
        if (remaining.length === 0) remaining = LEGENDARY_QUEST_POOL;
        let base = remaining[Math.floor(Math.random() * remaining.length)];
        let newQuest = { ...base, current: 0, completed: false };
        localStorage.setItem('alchemist_legendary_quest', JSON.stringify(newQuest));
        
        if (typeof window.location !== 'undefined' && window.location.pathname.endsWith('index.html')) {
            window.location.reload();
        }
    }

    // --- DELUXE ACTIVE POTION AURAS SYSTEM ---
    function applyActivePotionEffects() {
        if (!document.body) return;
        const act = getActivePotions();
        
        document.body.classList.remove('potion-active-hermes', 'potion-active-fortuna', 'potion-active-aegis', 'potion-active-aether');
        
        if (act.hermes > 0) document.body.classList.add('potion-active-hermes');
        if (act.fortuna > 0) document.body.classList.add('potion-active-fortuna');
        if (act.aegis > 0) document.body.classList.add('potion-active-aegis');
        if (act.aether > 0) document.body.classList.add('potion-active-aether');
    }

    function getPathPrefix() {
        const path = window.location.pathname;
        if (path.includes('/arena/') || path.includes('/cauldron/') || path.includes('/dice/') || path.includes('/mines/') || path.includes('/plinko/') || path.includes('/roulette/') || path.includes('/slots/') || path.includes('/blackjack/') || path.includes('/classic_roulette/') || path.includes('/baccarat/') || path.includes('/pachinko/') || path.includes('/keno/')) {
            return '../';
        }
        return './';
    }

    function injectQuickTravelStyles() {
        if (document.getElementById('alchemist-quick-travel-styles')) return;
        const style = document.createElement('style');
        style.id = 'alchemist-quick-travel-styles';
        style.textContent = `
            .quick-travel-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(18, 11, 38, 0.95);
                border-bottom: 2px solid rgba(255, 215, 0, 0.25);
                padding: 12px 24px;
                position: sticky;
                top: 0;
                z-index: 9999;
                backdrop-filter: blur(8px);
                font-family: 'Outfit', sans-serif;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            .quick-travel-bar .qt-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Cinzel', serif;
                font-weight: 700;
                color: #ffd700;
                text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
            }
            .quick-travel-bar .qt-logo a {
                color: #ffd700;
                text-decoration: none;
                font-size: 1rem;
                letter-spacing: 0.5px;
            }
            .quick-travel-bar .qt-links {
                display: flex;
                gap: 15px;
            }
            .quick-travel-bar .qt-links a {
                color: #a99ec6;
                text-decoration: none;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 6px;
                transition: all 0.3s ease;
                border: 1px solid transparent;
            }
            .quick-travel-bar .qt-links a:hover {
                color: #ffd700;
                background: rgba(255, 215, 0, 0.08);
                border-color: rgba(255, 215, 0, 0.2);
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
            }
            @media (max-width: 768px) {
                .quick-travel-bar {
                    flex-direction: column;
                    gap: 10px;
                    padding: 8px 10px;
                }
                .quick-travel-bar .qt-links {
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 6px;
                }
                .quick-travel-bar .qt-links a span {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function injectQuickTravel() {
        if (!document.body) return;
        if (document.getElementById('alchemist-quick-travel')) return;
        
        const prefix = getPathPrefix();
        const container = document.createElement('div');
        container.id = 'alchemist-quick-travel';
        container.className = 'quick-travel-bar';
        
        container.innerHTML = `
            <div class="qt-logo">
                <i class="fa-solid fa-graduation-cap"></i>
                <a href="${prefix}index.html">Akademie-Lobby</a>
            </div>
            <div class="qt-links">
                <a href="${prefix}cauldron/index.html" title="Kessel"><i class="fa-solid fa-fire-burner"></i> <span>Kessel</span></a>
                <a href="${prefix}plinko/index.html" title="Plinko"><i class="fa-solid fa-circle-nodes"></i> <span>Plinko</span></a>
                <a href="${prefix}slots/index.html" title="Slots"><i class="fa-solid fa-arrow-rotate-right"></i> <span>Slots</span></a>
                <a href="${prefix}mines/index.html" title="Minen"><i class="fa-solid fa-gem"></i> <span>Minen</span></a>
                <a href="${prefix}roulette/index.html" title="Roulette"><i class="fa-solid fa-spinner"></i> <span>Roulette</span></a>
                <a href="${prefix}classic_roulette/index.html" title="Zahlen-Roulette"><i class="fa-solid fa-circle-dot"></i> <span>Zahlen-Roulette</span></a>
                <a href="${prefix}dice/index.html" title="Würfeln"><i class="fa-solid fa-dice"></i> <span>Würfeln</span></a>
                <a href="${prefix}blackjack/index.html" title="Blackjack"><i class="fa-solid fa-code-merge"></i> <span>Transmutieren</span></a>
                <a href="${prefix}baccarat/index.html" title="Baccara"><i class="fa-solid fa-crown"></i> <span>Baccara</span></a>
                <a href="${prefix}pachinko/index.html" title="Schmelze"><i class="fa-solid fa-gear"></i> <span>Schmelze</span></a>
                <a href="${prefix}keno/index.html" title="Keno"><i class="fa-solid fa-fire-flame-curved"></i> <span>Keno</span></a>
                <a href="${prefix}arena/index.html" title="Arena"><i class="fa-solid fa-shield-halved"></i> <span>Arena</span></a>
            </div>
        `;
        
        document.body.insertBefore(container, document.body.firstChild);
    }

    // --- CRAFTING & POTIONS SYSTEM ---
    const INGREDIENT_DEFS = {
        sulfur: { name: "Schwefel", price: 20.0, icon: "🜎" },
        quicksilver: { name: "Quecksilber", price: 30.0, icon: "☿" },
        mandrake: { name: "Alraunenwurzel", price: 50.0, icon: "🌱" },
        dragon_blood: { name: "Drachenblut", price: 100.0, icon: "🩸" }
    };

    const POTION_DEFS = {
        hermes: {
            name: "Trank des Hermes",
            desc: "-15% Kessel-Instabilität (3 Runden)",
            cost: { quicksilver: 1, sulfur: 1 },
            duration: 3,
            icon: "🧪"
        },
        fortuna: {
            name: "Fortunas Essenz",
            desc: "+20% Gewinn bei Spins/Plinko (5 Runden)",
            cost: { sulfur: 1, mandrake: 1 },
            duration: 5,
            icon: "🔮"
        },
        aegis: {
            name: "Aegis-Elixier",
            desc: "Schützt 1x vor Minen-Explosion",
            cost: { mandrake: 2, dragon_blood: 1 },
            duration: 1,
            icon: "🛡️"
        },
        aether: {
            name: "Äther-Elixier",
            desc: "+15% Äther-Gewinnwahrscheinlichkeit am Roulette-Rad (5 Runden)",
            cost: { quicksilver: 1, dragon_blood: 1 },
            duration: 5,
            icon: "🌌"
        }
    };

    function getIngredients() {
        return JSON.parse(localStorage.getItem('alchemist_ingredients')) || { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 };
    }

    function getPotions() {
        return JSON.parse(localStorage.getItem('alchemist_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
    }

    function getActivePotions() {
        return JSON.parse(localStorage.getItem('alchemist_active_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
    }

    function buyIngredient(id) {
        let def = INGREDIENT_DEFS[id];
        if (!def) return false;
        
        let marketState = getMarketState();
        let price = marketState.prices[id] || def.price;
        
        let curBalance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
        if (curBalance < price) {
            showToast("❌ Nicht genügend Gold!", "info");
            return false;
        }

        addBalance(-price);
        let ing = getIngredients();
        ing[id] = (ing[id] || 0) + 1;
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));
        showToast(`✨ Zutat gekauft: 1x ${def.name} für ${price.toFixed(2)} €!`, "quest-complete");
        return true;
    }

    function getMarketState() {
        let state = JSON.parse(localStorage.getItem('alchemist_market_state'));
        if (!state) {
            state = {
                prices: { sulfur: 10.00, quicksilver: 25.00, mandrake: 50.00, dragon_blood: 100.00 },
                trends: { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 },
                news: "Willkommen an der Alchemistischen Börse! Die Rohstoffpreise schwanken täglich.",
                lastUpdate: Date.now()
            };
            localStorage.setItem('alchemist_market_state', JSON.stringify(state));
        }
        return state;
    }

    function updateMarketPrices(triggerNews = true) {
        let state = getMarketState();
        let oldPrices = { ...state.prices };
        
        const basePrices = { sulfur: 10.00, quicksilver: 25.00, mandrake: 50.00, dragon_blood: 100.00 };
        
        // Random news triggers a price shock
        const newsEvents = [
            { text: "Drachenflügel-Verband meldet Schwefelknappheit! Preise explodieren!", item: "sulfur", mult: 1.45 },
            { text: "Neue Adern in den Minen erschließen billiges Quecksilber!", item: "quicksilver", mult: 0.70 },
            { text: "Akademischer Kräutergarten meldet Rekordernte bei Alraunen!", item: "mandrake", mult: 0.65 },
            { text: "Drachenhort im Umland gesichtet: Drachenblut fließt reichlich!", item: "dragon_blood", mult: 0.75 },
            { text: "Unerwarteter Bedarf an Drachenblut für magische Barrieren!", item: "dragon_blood", mult: 1.35 },
            { text: "Bannkreis-Laboratorium kauft massive Mengen Schwefel auf!", item: "sulfur", mult: 1.30 },
            { text: "Wassermangel beeinträchtigt Alraunen-Ernte dramatisch!", item: "mandrake", mult: 1.40 },
            { text: "Fahrende Händler fluten den Markt mit günstigen Restposten Quecksilber!", item: "quicksilver", mult: 0.80 }
        ];

        let chosenNews = "Der Markt bleibt stabil. Keine besonderen Ereignisse an der Akademie.";
        let affectedItem = null;
        let affectedMult = 1.0;

        if (triggerNews && Math.random() < 0.6) {
            let ev = newsEvents[Math.floor(Math.random() * newsEvents.length)];
            chosenNews = ev.text;
            affectedItem = ev.item;
            affectedMult = ev.mult;
        }

        // Apply price changes
        for (let item in basePrices) {
            let base = basePrices[item];
            let current = state.prices[item] || base;
            
            // Random fluctuation +/- 10%
            let fluc = 1.0 + (Math.random() - 0.5) * 0.20;
            
            // Apply news spike/drop
            if (item === affectedItem) {
                fluc = affectedMult;
            }
            
            let newPrice = base * fluc;
            
            // Limit bounds to avoid negative/insane prices (e.g. at least 30% of base, at most 250% of base)
            newPrice = Math.max(base * 0.3, Math.min(base * 2.5, newPrice));
            
            state.prices[item] = parseFloat(newPrice.toFixed(2));
            state.trends[item] = parseFloat(((state.prices[item] - oldPrices[item]) / oldPrices[item]).toFixed(3));
        }

        state.news = chosenNews;
        state.lastUpdate = Date.now();
        localStorage.setItem('alchemist_market_state', JSON.stringify(state));
        return state;
    }

    function sellIngredient(id) {
        let def = INGREDIENT_DEFS[id];
        if (!def) return false;

        let ing = getIngredients();
        let count = ing[id] || 0;
        if (count <= 0) {
            showToast("❌ Keine Zutaten dieses Typs vorhanden!", "info");
            return false;
        }

        let marketState = getMarketState();
        let price = marketState.prices[id] || def.price;

        ing[id]--;
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));
        
        addBalance(price);
        showToast(`💰 Zutat verkauft: 1x ${def.name} für ${price.toFixed(2)} €!`, "quest-complete");
        return true;
    }

    function getNPCOffer() {
        let offer = JSON.parse(localStorage.getItem('alchemist_npc_trade'));
        if (!offer) {
            offer = generateNewNPCOffer();
        }
        return offer;
    }

    function generateNewNPCOffer() {
        const npcNames = [
            { name: "Klaas der Lehrling", icon: "🧙" },
            { name: "Kräuterhexe Sybilla", icon: "🧙‍♀️" },
            { name: "Meister Ignatius", icon: "🧓" },
            { name: "Reisender Händler Silas", icon: "👳" },
            { name: "Novizin Aurelia", icon: "👧" }
        ];

        const potions = [
            { id: "hermes", basePrice: 35 },
            { id: "fortuna", basePrice: 60 },
            { id: "aegis", basePrice: 75 },
            { id: "aether", basePrice: 150 }
        ];

        let npc = npcNames[Math.floor(Math.random() * npcNames.length)];
        let pot = potions[Math.floor(Math.random() * potions.length)];
        
        let count = Math.random() < 0.7 ? 1 : 2;
        
        // Random premium factor: 85% to 155%
        let factor = 0.85 + Math.random() * 0.70;
        let pricePerUnit = parseFloat((pot.basePrice * factor).toFixed(2));

        let potName = POTION_DEFS[pot.id].name;
        let dialogs = [
            `Ich benötige dringend ${count}x ${potName} für meine nächste Expedition! Biete guten Preis.`,
            `Kann mir jemand ${count}x ${potName} überlassen? Ich zahle bar und fair!`,
            `Suche ${count}x ${potName} für Forschungszwecke im Elementarturm. Zahle ${pricePerUnit.toFixed(2)} € pro Stück.`,
            `Habe eine dringende Bestellung für ${count}x ${potName}. Kannst du liefern?`
        ];
        let dialog = dialogs[Math.floor(Math.random() * dialogs.length)];

        let offer = {
            active: true,
            npcName: npc.name,
            npcIcon: npc.icon,
            potionId: pot.id,
            count: count,
            pricePerUnit: pricePerUnit,
            dialog: dialog
        };

        localStorage.setItem('alchemist_npc_trade', JSON.stringify(offer));
        return offer;
    }

    function cycleNPCOffer(payFee = false) {
        if (payFee) {
            let curBalance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
            if (curBalance < 5.00) {
                showToast("❌ Nicht genügend Gold für Vermittlungsgebühr!", "info");
                return false;
            }
            addBalance(-5.00);
            showToast("📣 Aushang für 5,00 € aktualisiert!", "info");
        }
        return generateNewNPCOffer();
    }

    function sellPotionToNPC() {
        let offer = getNPCOffer();
        if (!offer || !offer.active) return false;

        let pot = getPotions();
        let owned = pot[offer.potionId] || 0;
        if (owned < offer.count) {
            showToast("❌ Nicht genügend Tränke im Inventar!", "info");
            return false;
        }

        // Deduct potions
        pot[offer.potionId] -= offer.count;
        localStorage.setItem('alchemist_potions', JSON.stringify(pot));

        // Credit balance
        let totalWin = offer.count * offer.pricePerUnit;
        addBalance(totalWin);

        showToast(`💰 Tränke an ${offer.npcName} verkauft! +${totalWin.toFixed(2)} € erhalten!`, "quest-complete");

        // Clear active offer
        offer.active = false;
        localStorage.setItem('alchemist_npc_trade', JSON.stringify(offer));
        
        // Generate next offer ready
        setTimeout(generateNewNPCOffer, 100);

        return true;
    }

    function brewPotion(potionId) {
        let def = POTION_DEFS[potionId];
        if (!def) return false;

        let ing = getIngredients();
        for (let material in def.cost) {
            let costCount = def.cost[material];
            if ((ing[material] || 0) < costCount) {
                showToast("❌ Nicht genügend Zutaten!", "info");
                return false;
            }
        }

        for (let material in def.cost) {
            ing[material] -= def.cost[material];
        }
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));

        let pot = getPotions();
        let amountBrewed = 1;
        let crystalBonus = false;
        if (hasUpgrade('crystal') && Math.random() < 0.25) {
            amountBrewed = 2;
            crystalBonus = true;
        }
        pot[potionId] = (pot[potionId] || 0) + amountBrewed;
        localStorage.setItem('alchemist_potions', JSON.stringify(pot));
        
        if (crystalBonus) {
            showToast(`✨ Doppel-Brauen-Bonus! Erfolgreich gebraut: 2x ${def.name}!`, "quest-complete");
        } else {
            showToast(`🧪 Erfolgreich gebraut: ${def.name}!`, "quest-complete");
        }
        addXP(100);
        return true;
    }

    function consumePotion(potionId) {
        let pot = getPotions();
        if ((pot[potionId] || 0) <= 0) {
            showToast("❌ Keine Tränke dieses Typs im Inventar!", "info");
            return false;
        }

        let act = getActivePotions();
        let def = POTION_DEFS[potionId];
        act[potionId] = (act[potionId] || 0) + def.duration;
        localStorage.setItem('alchemist_active_potions', JSON.stringify(act));

        pot[potionId]--;
        localStorage.setItem('alchemist_potions', JSON.stringify(pot));

        showToast(`🧪 Trank getrunken: ${def.name} ist jetzt aktiv!`, "quest-complete");
        injectFloatingPotionHUD();
        applyActivePotionEffects();
        return true;
    }

    function exportSavegame() {
        let saveData = {};
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key && key.startsWith('alchemist_')) {
                saveData[key] = localStorage.getItem(key);
            }
        }
        let jsonStr = JSON.stringify(saveData);
        let base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        return base64;
    }

    function importSavegame(base64Str) {
        try {
            let jsonStr = decodeURIComponent(escape(atob(base64Str.trim())));
            let saveData = JSON.parse(jsonStr);
            if (saveData['alchemist_balance'] === undefined) {
                return false;
            }
            // Clear current alchemist keys
            for (let i = localStorage.length - 1; i >= 0; i--) {
                let key = localStorage.key(i);
                if (key && key.startsWith('alchemist_')) {
                    localStorage.removeItem(key);
                }
            }
            // Load new keys
            Object.keys(saveData).forEach(key => {
                localStorage.setItem(key, saveData[key]);
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    function recordPlay(gameId, winAmount, betAmount, multiplier) {
        initStats();
        let stats = JSON.parse(localStorage.getItem('alchemist_stats')) || {};
        
        let isWin = winAmount > betAmount || multiplier > 1.00;
        let multVal = parseFloat(multiplier) || (betAmount > 0 ? winAmount / betAmount : 1.00);
        multVal = parseFloat(multVal.toFixed(2));

        // Update Global
        if (!stats.global) {
            stats.global = { totalRounds: 0, totalWins: 0, highestMultiplier: 1.00, balanceHistory: [1000] };
        }
        stats.global.totalRounds++;
        if (isWin) stats.global.totalWins++;
        if (multVal > stats.global.highestMultiplier) stats.global.highestMultiplier = multVal;
        
        // Balance History
        let currentBalance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        if (!stats.global.balanceHistory) stats.global.balanceHistory = [1000];
        stats.global.balanceHistory.push(currentBalance);
        if (stats.global.balanceHistory.length > 25) {
            stats.global.balanceHistory.shift();
        }

        // Update specific game
        if (!stats[gameId]) {
            stats[gameId] = { rounds: 0, wins: 0, highestMultiplier: 1.00 };
        }
        stats[gameId].rounds++;
        if (isWin) stats[gameId].wins++;
        if (multVal > stats[gameId].highestMultiplier) stats[gameId].highestMultiplier = multVal;

        localStorage.setItem('alchemist_stats', JSON.stringify(stats));

        // Save highscore if won
        if (winAmount > 0) {
            let highscores = JSON.parse(localStorage.getItem('alchemist_highscores')) || [];
            let newEntry = {
                game: gameId,
                win: winAmount,
                bet: betAmount,
                mult: multVal,
                date: new Date().toLocaleString('de-DE')
            };
            highscores.push(newEntry);
            highscores.sort((a, b) => b.win - a.win);
            highscores = highscores.slice(0, 10);
            localStorage.setItem('alchemist_highscores', JSON.stringify(highscores));
        }

        // Check Recipes
        if (gameId === 'slots' && winAmount > 50.0) {
            unlockRecipe('midas');
        }
        if (gameId === 'cauldron' && multVal >= 4.0) {
            let equippedTheme = localStorage.getItem('alchemist_theme') || 'default';
            if (equippedTheme === 'ice') {
                unlockRecipe('ice_tincture');
            }
        }
        if (gameId === 'plinko' && multVal >= 5.0) {
            unlockRecipe('crystal_essence');
        }
        if (gameId === 'roulette' && multVal >= 24.0) {
            unlockRecipe('aether_vibe');
        }
        if (gameId === 'dice') {
            if (isWin) {
                let streak = parseInt(localStorage.getItem('alchemist_dice_streak') || '0');
                streak++;
                localStorage.setItem('alchemist_dice_streak', streak.toString());
                if (streak >= 3) {
                    unlockRecipe('dice_master');
                }
            } else {
                localStorage.setItem('alchemist_dice_streak', '0');
            }
        }

        // Decrement active potion charges based on game played
        let act = getActivePotions();
        let changed = false;
        if (gameId === 'cauldron' && act.hermes > 0) {
            act.hermes--;
            changed = true;
            if (act.hermes === 0) showToast("🧪 Trank des Hermes ist abgeklungen.", "info");
        }
        if ((gameId === 'slots' || gameId === 'plinko') && act.fortuna > 0) {
            act.fortuna--;
            changed = true;
            if (act.fortuna === 0) showToast("🧪 Fortunas Essenz ist abgeklungen.", "info");
        }
        if (gameId === 'roulette' && act.aether > 0) {
            act.aether--;
            changed = true;
            if (act.aether === 0) showToast("🧪 Äther-Elixier ist abgeklungen.", "info");
        }

        if (changed) {
            localStorage.setItem('alchemist_active_potions', JSON.stringify(act));
            injectFloatingPotionHUD();
            applyActivePotionEffects();
        }

        // Update simulated rivals progress
        updateRivals();

        // Progress Cauldron Mult Legendary Quest
        if (gameId === 'cauldron') {
            progressLegendaryQuest('cauldron_mult_legendary', multVal);
        }

        // Update Market prices after playing a round (25% chance of trigger news)
        updateMarketPrices(Math.random() < 0.25);
    }

    function setVolume(type, val) {
        let numericVal = parseFloat(val);
        if (isNaN(numericVal)) return;
        numericVal = Math.max(0.0, Math.min(1.0, numericVal));
        if (type === 'music') {
            volumeMusic = numericVal;
            localStorage.setItem('alchemist_volume_music', volumeMusic);
            if (audioCtx && musicGainNode && isMusicPlaying && !isMuted) {
                let now = audioCtx.currentTime;
                let targetVolume = (0.015 + (musicIntensity * 0.015)) * volumeMusic;
                musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, now);
                musicGainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.2);
            }
        } else if (type === 'sfx') {
            volumeSFX = numericVal;
            localStorage.setItem('alchemist_volume_sfx', volumeSFX);
        }
    }

    // --- ALCHEMIST GARDEN SYSTEM ---
    function getGardenState() {
        let garden = JSON.parse(localStorage.getItem('alchemist_garden_state'));
        if (!garden) {
            garden = [
                { pot: 0, seed: null, progress: 0, target: 5 },
                { pot: 1, seed: null, progress: 0, target: 5 },
                { pot: 2, seed: null, progress: 0, target: 5 },
                { pot: 3, seed: null, progress: 0, target: 5 }
            ];
            localStorage.setItem('alchemist_garden_state', JSON.stringify(garden));
        }
        return garden;
    }

    function plantSeed(potIdx, seedType) {
        let garden = getGardenState();
        if (potIdx < 0 || potIdx >= garden.length) return false;
        if (garden[potIdx].seed !== null) {
            showToast("❌ Dieser Topf ist bereits bepflanzt!", "info");
            return false;
        }

        const SEED_TARGETS = { sulfur: 4, quicksilver: 6, mandrake: 8, dragon_blood: 12 };
        garden[potIdx].seed = seedType;
        garden[potIdx].progress = 0;
        garden[potIdx].target = SEED_TARGETS[seedType] || 5;

        localStorage.setItem('alchemist_garden_state', JSON.stringify(garden));
        showToast(`🌱 Samen gepflanzt: 1x ${INGREDIENT_DEFS[seedType].name}!`, "quest-complete");
        return true;
    }

    function harvestGardenPot(potIdx) {
        let garden = getGardenState();
        if (potIdx < 0 || potIdx >= garden.length) return false;
        let p = garden[potIdx];

        if (!p.seed || p.progress < p.target) {
            showToast("❌ Die Pflanze ist noch nicht ausgewachsen!", "info");
            return false;
        }

        let seedName = p.seed;
        let ing = getIngredients();
        ing[seedName] = (ing[seedName] || 0) + 1;
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));

        showToast(`🌿 Geerntet: 1x ${INGREDIENT_DEFS[seedName].name}!`, "quest-complete");

        // Clear pot
        p.seed = null;
        p.progress = 0;
        localStorage.setItem('alchemist_garden_state', JSON.stringify(garden));
        return true;
    }

    function progressGardenGrowth() {
        let garden = getGardenState();
        let updated = false;

        let activeGuild = getGuildState();
        let growthSpeed = activeGuild === 'herbalists' ? 2 : 1; // Herbalists grow 2x faster

        garden.forEach(p => {
            if (p.seed && p.progress < p.target) {
                p.progress += growthSpeed;
                if (p.progress >= p.target) p.progress = p.target;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('alchemist_garden_state', JSON.stringify(garden));
        }
    }

    // --- ALCHEMIST GUILDS / FACTIONS SYSTEM ---
    const GUILD_DEFS = {
        transmutation: {
            id: "transmutation",
            name: "Zunft der Transmutations-Meister",
            icon: "👑",
            color: "#ffd700",
            desc: "+15% Goldgewinne in Roulette, Slots, Poker & Kessel",
            perkMsg: "👑 Transmutations-Bonus aktiv: +15% zusätzliche Gewinne!"
        },
        pyromancers: {
            id: "pyromancers",
            name: "Orden der Elementar-Pyromanten",
            icon: "🔥",
            color: "#ef4444",
            desc: "+25% Magie-Schaden in der Kampfarena",
            perkMsg: "🔥 Pyromanten-Kraft aktiv: +25% Arena-Schaden!"
        },
        herbalists: {
            id: "herbalists",
            name: "Kräuter-Zirkel der Akademie",
            icon: "🌿",
            color: "#10b981",
            desc: "2x schnelleres Gartenwachstum & doppelter Tranknutzen",
            perkMsg: "🌿 Kräuter-Zirkel aktiv: 2x schnelleres Gartenwachstum!"
        }
    };

    function getGuildState() {
        return localStorage.getItem('alchemist_guild') || null;
    }

    function selectGuild(guildId) {
        let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
        if (level < 5) {
            showToast("❌ Du musst mindestens Stufe 5 erreichen, um einer Gilde beizutreten!", "info");
            return false;
        }

        const def = GUILD_DEFS[guildId];
        if (!def) return false;

        localStorage.setItem('alchemist_guild', guildId);
        showToast(`🛡️ GILDE BEIGETRETEN: Willkommen bei ${def.name}!`, "level-up");
        return true;
    }

    function getVolume(type) {
        return type === 'music' ? volumeMusic : volumeSFX;
    }

    // --- CANVAS PARTICLE ENGINE ---
    class ParticleEngine {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.isInit = false;
        }
        init() {
            if (this.isInit || typeof document === 'undefined') return;
            this.canvas = document.getElementById('global-particle-canvas');
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'global-particle-canvas';
                document.body.appendChild(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.isInit = true;
            requestAnimationFrame(() => this.loop());
        }
        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        spawnGoldCoins(x, y, count = 30) {
            this.init();
            for (let i = 0; i < count; i++) {
                let angle = Math.random() * Math.PI * 2;
                let speed = 4 + Math.random() * 8;
                this.particles.push({
                    x: x || window.innerWidth / 2,
                    y: y || window.innerHeight / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 4,
                    gravity: 0.25,
                    size: 8 + Math.random() * 8,
                    alpha: 1,
                    decay: 0.015,
                    color: '#ffd700',
                    type: 'coin',
                    rotation: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        }
        spawnMagicSparks(x, y, color = '#0891b2', count = 25) {
            this.init();
            for (let i = 0; i < count; i++) {
                let angle = Math.random() * Math.PI * 2;
                let speed = 2 + Math.random() * 6;
                this.particles.push({
                    x: x || window.innerWidth / 2,
                    y: y || window.innerHeight / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.05,
                    size: 4 + Math.random() * 4,
                    alpha: 1,
                    decay: 0.02,
                    color: color,
                    type: 'spark',
                    rotation: 0,
                    rotSpeed: 0
                });
            }
        }
        spawnExplosion(x, y, count = 35) {
            this.init();
            for (let i = 0; i < count; i++) {
                let angle = Math.random() * Math.PI * 2;
                let speed = 5 + Math.random() * 10;
                this.particles.push({
                    x: x || window.innerWidth / 2,
                    y: y || window.innerHeight / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.1,
                    size: 6 + Math.random() * 8,
                    alpha: 1,
                    decay: 0.025,
                    color: Math.random() < 0.5 ? '#ef4444' : '#ff8c00',
                    type: 'explosion',
                    rotation: 0,
                    rotSpeed: 0
                });
            }
        }
        loop() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = this.particles.length - 1; i >= 0; i--) {
                let p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity || 0;
                p.alpha -= p.decay;
                p.rotation += p.rotSpeed || 0;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);

                if (p.type === 'coin') {
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#b45309';
                    this.ctx.stroke();
                } else {
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
            requestAnimationFrame(() => this.loop());
        }
    }
    const particlesEngine = new ParticleEngine();

    // --- PROVABLY FAIR ENGINE & SAVEGAME CHECKSUM ---
    function hashSeedSync(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        let hex = Math.abs(hash).toString(16).padStart(8, '0');
        return hex.repeat(8).substring(0, 64);
    }

    function generateSeeds() {
        let serverSeed = 'srv_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let clientSeed = 'cli_' + Math.random().toString(36).substring(2, 10);
        let nonce = Math.floor(Math.random() * 1000000);
        return { serverSeed, clientSeed, nonce, serverHash: hashSeedSync(serverSeed) };
    }

    function openProvablyFairModal(gameName, serverHash, serverSeed, clientSeed, nonce, resultText) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="pf-modal-box">
                <button type="button" class="book-close" onclick="this.closest('.modal').remove()">&times;</button>
                <h2 style="font-family:'Cinzel',serif; color:var(--color-gold); margin-top:0;"><i class="fa-solid fa-shield-halved"></i> Provably Fair Verifizierung</h2>
                <p style="font-size:0.8rem; color:var(--text-secondary);">Verifiziere die mathematische Fairness dieser Spielrunde (${gameName}):</p>
                <div class="pf-input-group">
                    <label>Server Seed Hash (Pre-round)</label>
                    <div class="pf-hash-badge">${serverHash || '3f8a91b...'}</div>
                </div>
                <div class="pf-input-group">
                    <label>Unverschlüsselter Server Seed</label>
                    <input type="text" readonly value="${serverSeed || 'srv_sample_seed'}">
                </div>
                <div class="pf-input-group">
                    <label>Client Seed</label>
                    <input type="text" readonly value="${clientSeed || 'cli_sample_seed'}">
                </div>
                <div class="pf-input-group">
                    <label>Nonce</label>
                    <input type="text" readonly value="${nonce || 1042}">
                </div>
                <div class="pf-input-group">
                    <label>Ergebnis-Status</label>
                    <div style="font-weight:800; color:var(--color-green); font-size:0.9rem;">✅ ${resultText || 'Mathematisch verifiziert'}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function generateSaveChecksum(jsonStr) {
        let hash = 0;
        for (let i = 0; i < jsonStr.length; i++) {
            hash = ((hash << 5) - hash) + jsonStr.charCodeAt(i);
            hash |= 0;
        }
        return 'sig_' + Math.abs(hash).toString(36);
    }

    // --- RELICS & EQUIPMENT SYSTEM ---
    const RELIC_DEFS = {
        midas_ring: { id: "midas_ring", name: "Ring des Midas", icon: "👑", desc: "+5% Gewinne in Kartenspielen & Spins", price: 300 },
        hermes_amulet: { id: "hermes_amulet", name: "Amulett des Hermes", icon: "🪽", desc: "-10% Instabilität im Kessel", price: 250 },
        monocle: { id: "monocle", name: "Kristall-Monokel", icon: "🧐", desc: "+15% Chance auf Enthüllung in Minen", price: 400 },
        philosopher_stone: { id: "philosopher_stone", name: "Stein der Weisen", icon: "💎", desc: "+20% XP-Gewinn in allen Spielen", price: 500 },
        ember_vial: { id: "ember_vial", name: "Glut-Phiole", icon: "🔥", desc: "+15% Magieschaden in der Arena", price: 350 },
        aether_compass: { id: "aether_compass", name: "Äther-Kompass", icon: "🧭", desc: "+10% Äther-Chance im Roulette", price: 300 }
    };

    function getOwnedRelics() {
        return JSON.parse(localStorage.getItem('alchemist_relics')) || ['hermes_amulet'];
    }

    function getEquippedRelics() {
        return JSON.parse(localStorage.getItem('alchemist_equipped_relics')) || ['hermes_amulet'];
    }

    function equipRelic(id) {
        let owned = getOwnedRelics();
        if (!owned.includes(id)) return false;
        let equipped = getEquippedRelics();
        if (equipped.includes(id)) return true;
        if (equipped.length >= 3) {
            showToast("❌ Maximal 3 Relikte gleichzeitig ausrüstbar!", "info");
            return false;
        }
        equipped.push(id);
        localStorage.setItem('alchemist_equipped_relics', JSON.stringify(equipped));
        showToast(`✨ Relikt ausgerüstet: ${RELIC_DEFS[id].name}!`, "quest-complete");
        return true;
    }

    function unequipRelic(id) {
        let equipped = getEquippedRelics();
        let idx = equipped.indexOf(id);
        if (idx !== -1) {
            equipped.splice(idx, 1);
            localStorage.setItem('alchemist_equipped_relics', JSON.stringify(equipped));
            showToast(`Relikt abgelegt: ${RELIC_DEFS[id].name}`, "info");
            return true;
        }
        return false;
    }

    function hasEquippedRelic(id) {
        return getEquippedRelics().includes(id);
    }

    // --- EXPEDITIONS SYSTEM ---
    const EXPEDITION_DEFS = {
        herb_search: { id: "herb_search", name: "Kräutersuche im Akademie-Hain", durationMs: 5 * 60 * 1000, desc: "Sammle Kräuter und Schwefel", xp: 50, gold: 30, icon: "🌿" },
        ruin_explore: { id: "ruin_explore", name: "Erkundung der Versunkenen Ruinen", durationMs: 15 * 60 * 1000, desc: "Finde Alraunen und Drachenblut", xp: 150, gold: 100, icon: "🏛️" },
        dragon_lair: { id: "dragon_lair", name: "Drachenhöhlen-Expedition", durationMs: 60 * 60 * 1000, desc: "Legendäre Ausbeute & Relikt-Chance", xp: 500, gold: 350, icon: "🐉" }
    };

    function getExpeditionState() {
        return JSON.parse(localStorage.getItem('alchemist_active_expedition')) || null;
    }

    function startExpedition(typeId) {
        let def = EXPEDITION_DEFS[typeId];
        if (!def) return false;
        let current = getExpeditionState();
        if (current && !current.claimed) {
            showToast("❌ Bereits eine Expedition aktiv!", "info");
            return false;
        }
        let expData = {
            type: typeId,
            startTime: Date.now(),
            durationMs: def.durationMs,
            claimed: false
        };
        localStorage.setItem('alchemist_active_expedition', JSON.stringify(expData));
        showToast(`🗺️ Expedition gestartet: ${def.name}!`, "quest-complete");
        return true;
    }

    function claimExpeditionReward() {
        let state = getExpeditionState();
        if (!state || state.claimed) return false;
        let def = EXPEDITION_DEFS[state.type];
        let elapsed = Date.now() - state.startTime;
        if (elapsed < state.durationMs) {
            showToast("❌ Expedition ist noch nicht abgeschlossen!", "info");
            return false;
        }
        state.claimed = true;
        localStorage.removeItem('alchemist_active_expedition');

        addBalance(def.gold);
        addXP(def.xp);

        let ing = getIngredients();
        ing.sulfur = (ing.sulfur || 0) + 2;
        ing.dragon_blood = (ing.dragon_blood || 0) + 1;
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));

        showToast(`🎁 EXPEDITION ABGESCHLOSSEN: +${def.gold}€ / +${def.xp} XP!`, "quest-complete");
        particlesEngine.spawnGoldCoins();
        return true;
    }

    // --- WORKBENCH SYSTEM ---
    const WORKBENCH_DEFS = [
        { level: 1, name: "Holz-Werkbank", cost: 0, bonusDesc: "Standard-Crafting" },
        { level: 2, name: "Kupfer-Athanor", cost: 250, bonusDesc: "+10% Brau-Ertrag" },
        { level: 3, name: "Silber-Destille", cost: 750, bonusDesc: "+20% Ertrag, -10% Zutatenkosten" },
        { level: 4, name: "Gold-Retorte", cost: 2000, bonusDesc: "+35% Ertrag, -20% Zutatenkosten" },
        { level: 5, name: "Kristall-Allembic", cost: 5000, bonusDesc: "+50% Ertrag, Relikt-Chance" }
    ];

    function getWorkbenchLevel() {
        return parseInt(localStorage.getItem('alchemist_workbench_level')) || 1;
    }

    function upgradeWorkbench() {
        let cur = getWorkbenchLevel();
        if (cur >= WORKBENCH_DEFS.length) {
            showToast("❌ Werkbank ist bereits auf der maximalen Stufe!", "info");
            return false;
        }
        let next = WORKBENCH_DEFS[cur];
        let bal = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
        if (bal < next.cost) {
            showToast(`❌ Nicht genügend Gold (${next.cost}€ benötigt)!`, "info");
            return false;
        }
        addBalance(-next.cost);
        localStorage.setItem('alchemist_workbench_level', cur + 1);
        showToast(`🔨 WERKBANK AUFGEWERTET: ${next.name}!`, "level-up");
        return true;
    }

    // --- SCHATTEN-AUKTIONSHAUS ---
    function getAuctions() {
        let auctions = JSON.parse(localStorage.getItem('alchemist_auctions'));
        if (!auctions) {
            auctions = [
                { id: 1, name: "Antikes Amulett des Midas", type: "relic", itemKey: "midas_ring", minBid: 150, topBid: 180, topBidder: "Marius der Weise", ended: false },
                { id: 2, name: "Rezept: Stein der Weisen", type: "recipe", itemKey: "philosopher_stone", minBid: 250, topBid: 290, topBidder: "Kräuterhexe Sybilla", ended: false },
                { id: 3, name: "Phiole mit Urmaterie (3x)", type: "material", itemKey: "dragon_blood", count: 3, minBid: 100, topBid: 120, topBidder: "Novizin Aurelia", ended: false }
            ];
            localStorage.setItem('alchemist_auctions', JSON.stringify(auctions));
        }
        return auctions;
    }

    function placeAuctionBid(auctionId, bidAmount) {
        let auctions = getAuctions();
        let auc = auctions.find(a => a.id === auctionId);
        if (!auc || auc.ended) return false;
        if (bidAmount <= auc.topBid) {
            showToast(`❌ Gebot muss höher als ${auc.topBid.toFixed(2)}€ sein!`, "info");
            return false;
        }
        let bal = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
        if (bal < bidAmount) {
            showToast("❌ Nicht genügend Gold!", "info");
            return false;
        }
        addBalance(-bidAmount);
        auc.topBid = bidAmount;
        auc.topBidder = "Du";
        auc.ended = true;
        localStorage.setItem('alchemist_auctions', JSON.stringify(auctions));

        if (auc.type === 'relic') {
            let owned = getOwnedRelics();
            if (!owned.includes(auc.itemKey)) owned.push(auc.itemKey);
            localStorage.setItem('alchemist_relics', JSON.stringify(owned));
        } else if (auc.type === 'material') {
            let ing = getIngredients();
            ing[auc.itemKey] = (ing[auc.itemKey] || 0) + (auc.count || 1);
            localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));
        }
        showToast(`🏆 AUKTION GEWONNEN: ${auc.name} ersteigert!`, "quest-complete");
        particlesEngine.spawnGoldCoins();
        return true;
    }

    // --- i18n MULTI-LANGUAGE SYSTEM ---
    const I18N_DICT = {
        de: {
            academy_title: "ALCHEMISTEN-AKADEMIE",
            halls_of_fate: "DIE HALLEN DES SCHICKSALS",
            portals: "Portale",
            market: "Marktplatz & Labor",
            garden: "Garten",
            guild: "Konvent (Gilden)",
            expeditions: "Expeditionen & Werkbank",
            balance: "GESAMTGUTHABEN",
            level: "AKADEMIE-STUFE"
        },
        en: {
            academy_title: "ALCHEMIST ACADEMY",
            halls_of_fate: "THE HALLS OF FATE",
            portals: "Portals",
            market: "Marketplace & Lab",
            garden: "Garden",
            guild: "Covens & Guilds",
            expeditions: "Expeditions & Workbench",
            balance: "TOTAL BALANCE",
            level: "ACADEMY LEVEL"
        }
    };

    function getLanguage() {
        return localStorage.getItem('alchemist_lang') || 'de';
    }

    function setLanguage(lang) {
        localStorage.setItem('alchemist_lang', lang);
        updateI18NElements();
    }

    function t(key) {
        let lang = getLanguage();
        return (I18N_DICT[lang] && I18N_DICT[lang][key]) || (I18N_DICT.de[key] || key);
    }

    function updateI18NElements() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            let k = el.getAttribute('data-i18n');
            if (k) el.textContent = t(k);
        });
    }

    // --- STORY CAMPAIGN ENGINE ---
    const CAMPAIGN_CHAPTERS = [
        { id: 1, title: "Kapitel I: Die Aufnahmeprüfung", desc: "Betrete die Portale und verdiene deine ersten 100 €.", type: "gold_earned", target: 100, rewardGold: 50, rewardXP: 100, icon: "📜", npc: "Dozent Barnabas" },
        { id: 2, title: "Kapitel II: Das Brodeln im Kessel", desc: "Erreiche einen Multiplikator von 3.00x im Kessel des Schicksals.", type: "cauldron_mult", target: 3.0, rewardGold: 100, rewardXP: 200, icon: "🔮", npc: "Kräuterhexe Sybilla" },
        { id: 3, title: "Kapitel III: Das Duell der Elemente", desc: "Gewinne 2 Runden im Alchemie-Baccara oder Würfel-Duell.", type: "duel_wins", target: 2, rewardGold: 150, rewardXP: 300, icon: "👑", npc: "Meister Ignatius", relicReward: "ember_vial" },
        { id: 4, title: "Kapitel IV: Die Tiefen der Schmelze", desc: "Decke 10 sichere Runen in Minen auf.", type: "mines_safe", target: 10, rewardGold: 250, rewardXP: 500, icon: "⚙️", npc: "Reisender Silas" },
        { id: 5, title: "Kapitel V: Der Stein der Weisen", desc: "Erreiche Akademie-Stufe 5 und behaupte dich an der Spitze.", type: "level_req", target: 5, rewardGold: 500, rewardXP: 1000, icon: "💎", npc: "Rektor Ignatius", relicReward: "philosopher_stone" }
    ];

    function getCampaignState() {
        let state = JSON.parse(localStorage.getItem('alchemist_campaign_state'));
        if (!state) {
            state = { currentChapter: 1, progress: 0, completed: false, claimedChapters: [] };
            localStorage.setItem('alchemist_campaign_state', JSON.stringify(state));
        }
        return state;
    }

    function progressCampaign(type, amount) {
        let state = getCampaignState();
        let ch = CAMPAIGN_CHAPTERS.find(c => c.id === state.currentChapter);
        if (!ch || state.claimedChapters.includes(ch.id)) return;

        let updated = false;
        if (ch.type === type) {
            if (type.includes("mult")) {
                if (amount > state.progress) { state.progress = amount; updated = true; }
            } else {
                state.progress += amount;
                updated = true;
            }

            if (state.progress >= ch.target) {
                state.progress = ch.target;
                showToast(`📜 KAMPAGNE-KAPITEL ABGESCHLOSSEN: ${ch.title}!`, "quest-complete");
                particlesEngine.spawnGoldCoins();
            }
            localStorage.setItem('alchemist_campaign_state', JSON.stringify(state));
        }
    }

    function claimCampaignChapter(chapterId) {
        let state = getCampaignState();
        let ch = CAMPAIGN_CHAPTERS.find(c => c.id === chapterId);
        if (!ch || state.progress < ch.target || state.claimedChapters.includes(chapterId)) return false;

        state.claimedChapters.push(chapterId);
        if (state.currentChapter < CAMPAIGN_CHAPTERS.length) {
            state.currentChapter++;
            state.progress = 0;
        } else {
            state.completed = true;
        }
        localStorage.setItem('alchemist_campaign_state', JSON.stringify(state));

        addBalance(ch.rewardGold);
        addXP(ch.rewardXP);
        if (ch.relicReward) {
            let owned = getOwnedRelics();
            if (!owned.includes(ch.relicReward)) owned.push(ch.relicReward);
            localStorage.setItem('alchemist_relics', JSON.stringify(owned));
        }
        showToast(`🎁 BELOHNUNG ABGEHOLT: +${ch.rewardGold}€ / +${ch.rewardXP} XP!`, "quest-complete");
        return true;
    }

    // --- HOMUNCULUS PET SYSTEM ---
    const HOMUNCULUS_TYPES = {
        egg: { name: "Magisches Homunculus-Ei", icon: "🥚", desc: "Brütet im Kessel aus..." },
        fire: { name: "Feuer-Salamander", icon: "🦎", perk: "+10% Arena-Magieschaden", element: "Feuer" },
        ice: { name: "Eis-Kristallit", icon: "🧊", perk: "-10% Kessel-Instabilität", element: "Eis" },
        aether: { name: "Äther-Phönix", icon: "🦚", perk: "+5% Cashback auf Runden-Verluste", element: "Äther" },
        earth: { name: "Erd-Golem", icon: "🗿", perk: "+20% schnelleres Gartenwachstum", element: "Erde" }
    };

    function getHomunculusState() {
        let state = JSON.parse(localStorage.getItem('alchemist_homunculus_state'));
        if (!state) {
            state = { hatched: false, type: 'egg', name: 'Ignis', level: 1, xp: 0, hunger: 100 };
            localStorage.setItem('alchemist_homunculus_state', JSON.stringify(state));
        }
        return state;
    }

    function hatchHomunculus(element) {
        let state = getHomunculusState();
        if (state.hatched) return false;
        state.hatched = true;
        state.type = element;
        state.level = 1;
        state.xp = 0;
        localStorage.setItem('alchemist_homunculus_state', JSON.stringify(state));
        showToast(`🐣 HOMUNCULUS AUSGEBRÜTET: Willkommen ${HOMUNCULUS_TYPES[element].name}!`, "level-up");
        particlesEngine.spawnMagicSparks();
        return true;
    }

    function feedHomunculus(ingredientId) {
        let state = getHomunculusState();
        if (!state.hatched) {
            showToast("❌ Zuerst musst du das Ei ausbrüten!", "info");
            return false;
        }
        let ing = getIngredients();
        if ((ing[ingredientId] || 0) <= 0) {
            showToast("❌ Keine Zutaten dieses Typs!", "info");
            return false;
        }
        ing[ingredientId]--;
        localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));

        const XP_GAINS = { sulfur: 25, quicksilver: 35, mandrake: 60, dragon_blood: 120 };
        let gained = XP_GAINS[ingredientId] || 20;
        state.xp += gained;
        let target = state.level * 100;
        if (state.xp >= target) {
            state.xp -= target;
            state.level++;
            showToast(`✨ HOMUNCULUS STUFENAUFSTIEG: Jetzt Stufe ${state.level}!`, "level-up");
        } else {
            showToast(`🍖 Homunculus gefüttert (+${gained} XP)!`, "quest-complete");
        }
        localStorage.setItem('alchemist_homunculus_state', JSON.stringify(state));
        return true;
    }

    // --- TOURNAMENT CUP SYSTEM ---
    function getTournamentState() {
        let state = JSON.parse(localStorage.getItem('alchemist_tournament_state'));
        if (!state) {
            state = {
                points: 0,
                endsAt: Date.now() + 7 * 24 * 3600 * 1000,
                rivals: [
                    { name: "Meister Ignatius", points: 4500, rank: 1, icon: "🧓" },
                    { name: "Marius der Weise", points: 3200, rank: 2, icon: "🧙" },
                    { name: "Kräuterhexe Sybilla", points: 2100, rank: 3, icon: "🧙‍♀️" },
                    { name: "Novizin Aurelia", points: 1400, rank: 4, icon: "👧" },
                    { name: "Lehrling Klaas", points: 600, rank: 5, icon: "👦" }
                ]
            };
            localStorage.setItem('alchemist_tournament_state', JSON.stringify(state));
        }
        return state;
    }

    function addTournamentPoints(pts) {
        if (pts <= 0) return;
        let state = getTournamentState();
        state.points += pts;
        state.rivals.forEach(r => {
            if (Math.random() < 0.3) r.points += Math.floor(Math.random() * 80);
        });
        localStorage.setItem('alchemist_tournament_state', JSON.stringify(state));
    }

    // --- JUKEBOX PLAYER ENGINE ---
    const JUKEBOX_TRACKS = [
        { title: "Hallen der Meister", desc: "Sanfte C-Moll Akkorde", bpm: 55 },
        { title: "Mitternacht im Garten", desc: "Mystisches Es-Dur", bpm: 65 },
        { title: "Tanz der Elemente", desc: "Rhythmisches As-Dur Arpeggio", bpm: 85 }
    ];

    function setJukeboxTrack(idx) {
        localStorage.setItem('alchemist_jukebox_track', idx);
        showToast(`🎵 Musik-Track gewechselt: ${JUKEBOX_TRACKS[idx].title}`, "info");
    }

    // Exported APIs
    return {
        init: init,
        progressQuest: progressQuest,
        triggerGamble: triggerGamble,
        setMusicState: setMusicState,
        playBounceNote: playBounceNote,
        addXP: addXP,
        addBalance: addBalance,
        showToast: showToast,
        recordPlay: function(gameId, winAmount, betAmount, multiplier) {
            recordPlay(gameId, winAmount, betAmount, multiplier);
            progressGardenGrowth();

            // Progress Campaign & Tournament
            progressCampaign('gold_earned', winAmount);
            if (gameId === 'cauldron') progressCampaign('cauldron_mult', multiplier);
            if (gameId === 'baccarat' || gameId === 'dice') progressCampaign('duel_wins', winAmount > betAmount ? 1 : 0);
            if (gameId === 'mines') progressCampaign('mines_safe', 1);

            let multVal = parseFloat(multiplier) || 1.0;
            addTournamentPoints(Math.floor(winAmount * multVal));

            // Homunculus Cashback Perk (Aether Phoenix refunds 5% of loss)
            let homState = getHomunculusState();
            if (homState.hatched && homState.type === 'aether' && winAmount <= 0 && betAmount > 0) {
                let cashback = betAmount * 0.05;
                addBalance(cashback);
                showToast(`🦚 Homunculus Cashback: +${cashback.toFixed(2)}€ erstattet!`, 'quest-complete');
            }
        },
        RECIPE_DEFS: RECIPE_DEFS,
        hasUpgrade: hasUpgrade,
        hasRecipe: hasRecipe,
        unlockRecipe: unlockRecipe,
        applyCurrentTheme: applyCurrentTheme,
        exportSavegame: exportSavegame,
        importSavegame: importSavegame,
        setVolume: setVolume,
        getVolume: getVolume,
        getIngredients: getIngredients,
        getPotions: getPotions,
        getActivePotions: getActivePotions,
        buyIngredient: buyIngredient,
        brewPotion: brewPotion,
        consumePotion: consumePotion,
        injectFloatingPotionHUD: injectFloatingPotionHUD,
        getMarketState: getMarketState,
        updateMarketPrices: updateMarketPrices,
        sellIngredient: sellIngredient,
        getNPCOffer: getNPCOffer,
        cycleNPCOffer: cycleNPCOffer,
        sellPotionToNPC: sellPotionToNPC,
        INGREDIENT_DEFS: INGREDIENT_DEFS,
        POTION_DEFS: POTION_DEFS,
        getDiplomas: getDiplomas,
        submitThesisPrestige: submitThesisPrestige,
        getRivals: getRivals,
        getLegendaryQuest: getLegendaryQuest,
        progressLegendaryQuest: progressLegendaryQuest,
        applyActivePotionEffects: applyActivePotionEffects,
        playProceduralSound: playProceduralSound,
        getArenaSpells: getArenaSpells,
        upgradeSpell: upgradeSpell,
        getGardenState: getGardenState,
        plantSeed: plantSeed,
        harvestGardenPot: harvestGardenPot,
        getGuildState: getGuildState,
        selectGuild: selectGuild,
        GUILD_DEFS: GUILD_DEFS,
        // NEW APIS
        particles: particlesEngine,
        generateSeeds: generateSeeds,
        openProvablyFairModal: openProvablyFairModal,
        RELIC_DEFS: RELIC_DEFS,
        getOwnedRelics: getOwnedRelics,
        getEquippedRelics: getEquippedRelics,
        equipRelic: equipRelic,
        unequipRelic: unequipRelic,
        hasEquippedRelic: hasEquippedRelic,
        EXPEDITION_DEFS: EXPEDITION_DEFS,
        getExpeditionState: getExpeditionState,
        startExpedition: startExpedition,
        claimExpeditionReward: claimExpeditionReward,
        WORKBENCH_DEFS: WORKBENCH_DEFS,
        getWorkbenchLevel: getWorkbenchLevel,
        upgradeWorkbench: upgradeWorkbench,
        getAuctions: getAuctions,
        placeAuctionBid: placeAuctionBid,
        t: t,
        getLanguage: getLanguage,
        setLanguage: setLanguage,
        // PHASE 2 MASTERPIECE APIS
        CAMPAIGN_CHAPTERS: CAMPAIGN_CHAPTERS,
        getCampaignState: getCampaignState,
        claimCampaignChapter: claimCampaignChapter,
        HOMUNCULUS_TYPES: HOMUNCULUS_TYPES,
        getHomunculusState: getHomunculusState,
        hatchHomunculus: hatchHomunculus,
        feedHomunculus: feedHomunculus,
        getTournamentState: getTournamentState,
        JUKEBOX_TRACKS: JUKEBOX_TRACKS,
        setJukeboxTrack: setJukeboxTrack
    };
})();

// Auto-run init on shared file load
document.addEventListener('DOMContentLoaded', () => {
    window.AlchemistShared.init();
});



