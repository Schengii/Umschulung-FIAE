/* ==========================================================================
   ALCHEMISTEN-AKADEMIE: ELEMENTEN-ROULETTE CORE LOGIC (roulette/app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFS ---
    const balanceAmountEl = document.getElementById('balance-amount');
    const totalBetEl = document.getElementById('total-bet-val');
    const btnSpin = document.getElementById('btn-spin');
    const btnClearBets = document.getElementById('btn-clear-bets');
    const gameStatusText = document.getElementById('game-status-text');
    const wheelCanvas = document.getElementById('wheel-canvas');
    const ctx = wheelCanvas.getContext('2d');
    const historyListContainer = document.getElementById('history-list');
    const pointerEl = document.querySelector('.wheel-pointer');

    // Modals & Controls
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnMute = document.getElementById('btn-mute');

    // Chip buttons
    const chipBtns = document.querySelectorAll('.chip-btn');
    const betZoneCards = document.querySelectorAll('.bet-zone-card');

    // --- GAME CONFIG & STATE ---
    const SECTORS = [
        'water', 'fire', 'earth', 'water', 'fire', 'water', 'air', 'water', 'fire', 'earth',
        'water', 'fire', 'water', 'aether', 'water', 'fire', 'earth', 'water', 'fire', 'water',
        'air', 'water', 'fire', 'earth', 'water', 'fire', 'water', 'water', 'fire', 'water'
    ]; // 30 sectors total

    const ELEMENT_DEFS = {
        water: { name: 'Wasser', color: '#00f0ff', mult: 2, icon: '💧' },
        fire: { name: 'Feuer', color: '#ff2d55', mult: 3, icon: '🔥' },
        earth: { name: 'Erde', color: '#39ff14', mult: 6, icon: '🌿' },
        air: { name: 'Luft', color: '#9b59b6', mult: 12, icon: '💨' },
        aether: { name: 'Äther', color: '#ffd700', mult: 24, icon: '⚜️' }
    };

    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let selectedChipVal = 1;
    let totalBet = 0;
    let lastRoundBet = 0;
    let lastRoundWin = 0;
    let isSpinning = false;
    
    let activeBets = {
        water: 0,
        fire: 0,
        earth: 0,
        air: 0,
        aether: 0
    };

    // Wheel Physics
    let angle = 0;
    let angularVelocity = 0;
    let lastTickAngle = 0;

    // Particles
    let particles = [];

    // --- WEB AUDIO ---
    let audioCtx = null;
    let isMuted = localStorage.getItem('alchemist_muted') === 'true';

    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.body.addEventListener('click', initAudio, { once: true });

    // --- CHIP SELECTOR ---
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedChipVal = parseInt(btn.getAttribute('data-val'));
        });
    });

    // --- BET PLACING ---
    betZoneCards.forEach(card => {
        card.addEventListener('click', () => {
            if (isSpinning) return;
            initAudio();

            const element = card.getAttribute('data-element');
            
            // Validate balance
            if (balance < selectedChipVal) {
                gameStatusText.textContent = 'Nicht genug Guthaben für diesen Jeton.';
                return;
            }

            // Deduct locally and place bet
            balance -= selectedChipVal;
            activeBets[element] += selectedChipVal;
            totalBet += selectedChipVal;

            updateHUD();
            playTickSound(880); // Quick placement chime
        });
    });

    // Clear Bets
    btnClearBets.addEventListener('click', () => {
        if (isSpinning) return;
        
        // Refund bets
        balance += totalBet;
        totalBet = 0;
        activeBets = { water: 0, fire: 0, earth: 0, air: 0, aether: 0 };
        
        updateHUD();
    });

    function updateHUD() {
        // Balance
        if (window.AlchemistShared) {
            // Write directly to local storage so shared syncs it
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
            // Let shared refresh its DOM elements
            balanceAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            // Sync HUD cards
            const level = parseInt(localStorage.getItem('alchemist_level')) || 1;
            const xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
            const lvlEl = document.getElementById('xp-level-num');
            const xpCurEl = document.getElementById('xp-current-val');
            const xpTgtEl = document.getElementById('xp-target-val');
            const xpBarEl = document.getElementById('xp-bar-fill');
            if (lvlEl) lvlEl.textContent = level;
            if (xpCurEl) xpCurEl.textContent = xp;
            if (xpTgtEl) xpTgtEl.textContent = level * 500;
            if (xpBarEl) xpBarEl.style.width = `${(xp / (level * 500)) * 100}%`;
        }

        // Total Bet
        totalBetEl.textContent = totalBet.toFixed(2) + " €";
        
        // Placed bet tags inside buttons
        Object.keys(activeBets).forEach(element => {
            const placedEl = document.getElementById(`bet-placed-${element}`);
            const card = document.querySelector(`.card-${element}`);
            if (placedEl) {
                placedEl.textContent = activeBets[element] > 0 ? `${activeBets[element]}€` : '0€';
            }
            if (card) {
                if (activeBets[element] > 0) {
                    card.classList.add('has-bet');
                } else {
                    card.classList.remove('has-bet');
                }
            }
        });

        // Toggle spin button status
        if (totalBet > 0 && !isSpinning) {
            btnSpin.removeAttribute('disabled');
        } else {
            btnSpin.setAttribute('disabled', 'true');
        }
    }

    // --- CANVAS RENDERING (THE WHEEL) ---
    function drawWheel() {
        const cx = 200;
        const cy = 200;
        const radius = 180;
        const totalSlices = 30;
        const sliceAngle = (Math.PI * 2) / totalSlices;

        ctx.clearRect(0, 0, 400, 400);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Draw sectors
        for (let i = 0; i < totalSlices; i++) {
            const startAng = i * sliceAngle;
            const endAng = startAng + sliceAngle;
            const element = SECTORS[i];
            const def = ELEMENT_DEFS[element];

            // Slice background
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAng, endAng);
            ctx.closePath();
            ctx.fillStyle = def.color;
            ctx.globalAlpha = 0.85;
            ctx.fill();

            // Inner dark shade for sector readability
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAng, endAng);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(10, 6, 20, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text / Icon inside slice
            ctx.save();
            ctx.rotate(startAng + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#06030c';
            ctx.font = '800 12px Outfit, sans-serif';
            ctx.fillText(def.icon, radius - 15, 0);
            ctx.restore();
        }

        // Draw inner hub/pin details
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#120b22';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();

        // Runic decorations in the hub
        ctx.fillStyle = 'var(--color-cyan)';
        ctx.font = '13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🜔', 0, 0);

        ctx.restore();

        // Draw pointer pin outer decoration
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'var(--border-color)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // --- GAME ACTIONS: SPIN ---
    btnSpin.addEventListener('click', startSpin);

    function startSpin() {
        if (isSpinning) return;
        initAudio();

        isSpinning = true;
        btnSpin.setAttribute('disabled', 'true');
        btnClearBets.setAttribute('disabled', 'true');
        gameStatusText.textContent = "Das Rad des Schicksals dreht sich...";

        betZoneCards.forEach(c => c.classList.remove('winner-flash'));

        // Initial spin velocity
        angularVelocity = 0.22 + Math.random() * 0.16;
        lastTickAngle = angle;

        // Increase intensity of ambient music
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.6, 90);
        }

        // Start animation frame loop for spin
        requestAnimationFrame(spinAnimation);
    }

    function spinAnimation() {
        if (angularVelocity > 0.002) {
            angle += angularVelocity;
            
            // Decelerate
            angularVelocity *= 0.985; // friction

            // Ticking sound
            const totalSlices = 30;
            const sliceAngle = (Math.PI * 2) / totalSlices;
            
            let currentSliceStep = Math.floor(angle / sliceAngle);
            let lastSliceStep = Math.floor(lastTickAngle / sliceAngle);
            
            if (currentSliceStep !== lastSliceStep) {
                // Tock pitch chime
                playTickSound(350 + (currentSliceStep % 10) * 15);
                if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                    window.AlchemistShared.playProceduralSound('roulette_tick');
                }
                triggerPointerTickVisual();
                lastTickAngle = angle;
            }

            drawWheel();
            drawParticles();
            requestAnimationFrame(spinAnimation);
        } else {
            // Apply bias if aether potion is active or magnet upgrade is owned
            let activePotions = window.AlchemistShared ? window.AlchemistShared.getActivePotions() : null;
            let hasMagnet = window.AlchemistShared && window.AlchemistShared.hasUpgrade('magnet');
            let aetherBiasChance = 0.0;
            if (activePotions && activePotions.aether > 0) aetherBiasChance += 0.15;
            if (hasMagnet) aetherBiasChance += 0.10;
            
            if (aetherBiasChance > 0 && Math.random() < aetherBiasChance) {
                // Force Äther (index 13)
                // Let's set angle so normalizedAngle is 0.6 * Math.PI
                let fullCircles = Math.floor(angle / (Math.PI * 2));
                angle = fullCircles * (Math.PI * 2) + 0.6 * Math.PI;
            }
            stopSpin();
        }
    }

    function triggerPointerTickVisual() {
        pointerEl.style.animationPlayState = 'running';
        setTimeout(() => {
            pointerEl.style.animationPlayState = 'paused';
        }, 60);
    }

    function stopSpin() {
        isSpinning = false;
        pointerEl.style.animationPlayState = 'paused';

        // Calculate slice at top (12 o'clock, which is -pi / 2 on unit circle)
        // Normalized angle of rotation
        let normalizedAngle = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        
        // Equation: initial_slice_angle + normalizedAngle = -pi/2
        // initial_slice_angle = -pi/2 - normalizedAngle
        let targetAngle = (-Math.PI / 2 - normalizedAngle) % (Math.PI * 2);
        if (targetAngle < 0) targetAngle += Math.PI * 2;
        
        let sliceSize = (Math.PI * 2) / 30;
        let winnerIndex = Math.floor(targetAngle / sliceSize);
        
        // Fallback safety bounds check
        winnerIndex = Math.max(0, Math.min(29, winnerIndex));

        const element = SECTORS[winnerIndex];
        const def = ELEMENT_DEFS[element];

        // Highlight winner card
        const card = document.querySelector(`.card-${element}`);
        if (card) card.classList.add('winner-flash');

        // Calculate payout
        let betPlaced = activeBets[element];
        let payout = betPlaced * def.mult;
        if (payout > 0 && window.AlchemistShared && window.AlchemistShared.hasRecipe('aether_vibe')) {
            payout *= 1.10; // +10% roulette wins
            payout = parseFloat(payout.toFixed(2));
        }

        let isWinner = payout > 0;

        // Visual Particles burst
        spawnExplodeParticles(200, 45, def.color);

        // Web Audio success / explosion sound
        if (isWinner) {
            playResultChime(true);
            gameStatusText.textContent = `GETROFFEN: ${def.name}! Du gewinnst ${payout.toFixed(2)} €!`;
            gameStatusText.style.color = 'var(--color-gold)';
            
            // Quests progress
            if (window.AlchemistShared && window.AlchemistShared.progressQuest) {
                window.AlchemistShared.progressQuest('roulette_spins', 1);
                if (element === 'aether') {
                    window.AlchemistShared.progressQuest('roulette_aether', 1);
                    if (window.AlchemistShared.progressLegendaryQuest) {
                        window.AlchemistShared.progressLegendaryQuest('roulette_aether_legendary', 1);
                    }
                }
                window.AlchemistShared.addXP(Math.round(10 * def.mult));
            }

            // Launch Double or Nothing gamble
            setTimeout(() => {
                if (window.AlchemistShared && window.AlchemistShared.triggerGamble) {
                    window.AlchemistShared.triggerGamble(payout, (gambleResult) => {
                        lastRoundBet = totalBet;
                        if (gambleResult > 0) {
                            balance += gambleResult;
                            lastRoundWin = gambleResult;
                            window.AlchemistShared.showToast(`✨ Gewinn gesichert: +${gambleResult.toFixed(2)}€!`);
                        } else {
                            lastRoundWin = 0;
                        }
                        finalizeRound();
                    });
                } else {
                    lastRoundBet = totalBet;
                    lastRoundWin = payout;
                    balance += payout;
                    finalizeRound();
                }
            }, 800);

        } else {
            playResultChime(false);
            gameStatusText.textContent = `GETROFFEN: ${def.name}. Leider verloren!`;
            gameStatusText.style.color = 'var(--color-danger)';
            
            if (window.AlchemistShared && window.AlchemistShared.progressQuest) {
                window.AlchemistShared.progressQuest('roulette_spins', 1);
            }

            lastRoundBet = totalBet;
            lastRoundWin = 0;

            setTimeout(finalizeRound, 1200);
        }

        // Add history badge
        addHistoryBadge(element);

        // Reset music state
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.1, 60);
        }
    }

    function finalizeRound() {
        totalBet = 0;
        activeBets = { water: 0, fire: 0, earth: 0, air: 0, aether: 0 };
        gameStatusText.style.color = 'var(--color-cyan)';
        gameStatusText.textContent = "Platziere deine Einsätze";
        
        btnClearBets.removeAttribute('disabled');
        updateHUD();
        saveStats();
    }

    function saveStats() {
        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay(
                'roulette',
                lastRoundWin,
                lastRoundBet,
                lastRoundBet > 0 ? (lastRoundWin / lastRoundBet) : 1.00
            );
        }
    }

    function addHistoryBadge(element) {
        const def = ELEMENT_DEFS[element];
        const badge = document.createElement('div');
        badge.className = `history-badge`;
        badge.style.borderColor = def.color;
        badge.style.color = def.color;
        badge.textContent = def.icon;

        if (historyListContainer.querySelector('.history-empty')) {
            historyListContainer.innerHTML = '';
        }
        historyListContainer.insertBefore(badge, historyListContainer.firstChild);

        while (historyListContainer.children.length > 8) {
            historyListContainer.removeChild(historyListContainer.lastChild);
        }
    }

    // --- PROCEDURAL AUDIO HELPERS ---
    function playTickSound(freq) {
        if (isMuted || !audioCtx || audioCtx.state === 'suspended') return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04 * volumeSFX, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.06);
        } catch(e) {}
    }

    function playResultChime(isWin) {
        if (isMuted || !audioCtx || audioCtx.state === 'suspended') return;
        let volumeSFX = parseFloat(localStorage.getItem('alchemist_volume_sfx') !== null ? localStorage.getItem('alchemist_volume_sfx') : '0.5');
        if (volumeSFX <= 0.0) return;
        try {
            let now = audioCtx.currentTime;
            if (isWin) {
                let notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.06 * volumeSFX, now + idx * 0.08 + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.45);
                });
            } else {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.linearRampToValueAtTime(60, now + 0.4);
                gain.gain.setValueAtTime(0.12 * volumeSFX, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(now + 0.5);
            }
        } catch(e) {}
    }

    // --- PARTICLE PHYSICS ENGINE ---
    function spawnExplodeParticles(x, y, color) {
        for (let i = 0; i < 24; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = 1.0 + Math.random() * 4.0;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.0,
                radius: 1.5 + Math.random() * 2.5,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                color: color
            });
        }
    }

    function drawParticles() {
        // Normally particles would overlay the wheel, let's keep it simple
        // Draw small floating circles on top of the canvas
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }

    // Modals
    btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => helpModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.add('hidden');
    });

    // Mute
    btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('alchemist_muted', isMuted);
        if (isMuted) {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
            btnMute.style.color = 'var(--color-danger)';
        } else {
            btnMute.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
            btnMute.style.color = 'var(--text-secondary)';
        }
    });

    // Init run
    if (isMuted) {
        btnMute.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
        btnMute.style.color = 'var(--color-danger)';
    }
    updateHUD();
    drawWheel();
});
