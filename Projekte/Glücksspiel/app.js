/* ==========================================================================
   ALCHEMISTEN-AKADEMIE: LOBBY CORE ENGINE (app.js at root)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- HUD LOGIC ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    
    // Achievements definieren
    const ACHIEVEMENT_DEFS = {
        hermes: { title: 'Lehrling des Hermes', desc: 'Braue 5 Tränke erfolgreich.', icon: '🧪' },
        master: { title: 'Großmeister', desc: 'Erreiche einen Multiplikator von über 8.00x.', icon: '👑' },
        volcano: { title: 'Tanz auf dem Vulkan', desc: 'Zahle bei über 80% Kessel-Instabilität aus.', icon: '🌋' },
        dragon: { title: 'Drachen-Liebhaber', desc: 'Nutze 3x Drachenblut in einer einzigen Runde.', icon: '🩸' },
        lucky: { title: 'Glückspilz', desc: 'Löse ein Wildcard-Ereignis aus.', icon: '❄️' }
    };
    
    let achievements = JSON.parse(localStorage.getItem('alchemist_achievements')) || {
        hermes: false, master: false, volcano: false, dragon: false, lucky: false
    };

    let stats = JSON.parse(localStorage.getItem('alchemist_stats')) || {
        global: { totalRounds: 0, totalWins: 0, highestMultiplier: 1.00, balanceHistory: [1000] },
        cauldron: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
        plinko: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
        slots: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
        mines: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
        roulette: { rounds: 0, wins: 0, highestMultiplier: 1.00 }
    };
    
    // Safety check for legacy/migrated stats
    if (stats.totalRounds !== undefined && stats.global === undefined) {
        stats = {
            global: {
                totalRounds: stats.totalRounds || 0,
                totalWins: stats.totalWins || 0,
                highestMultiplier: stats.highestMultiplier || 1.00,
                balanceHistory: stats.balanceHistory || [1000]
            },
            cauldron: { rounds: stats.totalRounds || 0, wins: stats.totalWins || 0, highestMultiplier: stats.highestMultiplier || 1.00 },
            plinko: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
            slots: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
            mines: { rounds: 0, wins: 0, highestMultiplier: 1.00 },
            roulette: { rounds: 0, wins: 0, highestMultiplier: 1.00 }
        };
    }
    
    const balanceHistory = (stats.global && stats.global.balanceHistory) ? stats.global.balanceHistory : [1000];

    function updateHUD() {
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
        
        let targetXP = level * 500;
        if (xpTgtEl) xpTgtEl.textContent = targetXP;
        
        if (xpBarEl) {
            let percentage = (xp / targetXP) * 100;
            xpBarEl.style.width = `${percentage}%`;
        }

        // V4.0 Prestige Diplomas
        const diplomas = window.AlchemistShared ? window.AlchemistShared.getDiplomas() : 0;
        const diplomasCountEl = document.getElementById('lobby-diplomas-count');
        if (diplomasCountEl) diplomasCountEl.textContent = diplomas;
        
        const btnPrestige = document.getElementById('btn-prestige-action');
        const prestigeReqInfo = document.getElementById('prestige-req-info');
        if (btnPrestige && prestigeReqInfo) {
            if (level >= 10) {
                btnPrestige.style.display = 'block';
                prestigeReqInfo.style.display = 'none';
            } else {
                btnPrestige.style.display = 'none';
                prestigeReqInfo.style.display = 'block';
            }
        }
    }

    // --- RENDER TROPHIES ---
    function renderTrophies() {
        const grid = document.getElementById('lobby-achievements');
        if (!grid) return;
        grid.innerHTML = '';

        Object.keys(ACHIEVEMENT_DEFS).forEach(key => {
            const def = ACHIEVEMENT_DEFS[key];
            const unlocked = achievements[key];
            
            const card = document.createElement('div');
            card.className = `lobby-trophy ${unlocked ? 'unlocked' : 'locked'}`;
            card.setAttribute('data-title', `${def.title}: ${def.desc}`);
            card.innerHTML = unlocked ? def.icon : '🔒';
            grid.appendChild(card);
        });
    }

    // --- RENDER DYNAMIC LEGENDARY QUEST ---
    function renderLegendaryQuest() {
        const container = document.getElementById('lobby-legendary-quest-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (!window.AlchemistShared || !window.AlchemistShared.getLegendaryQuest) return;
        const q = window.AlchemistShared.getLegendaryQuest();
        
        const card = document.createElement('div');
        card.className = `lobby-quest-item ${q.completed ? 'completed' : ''}`;
        card.style.background = 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(124, 58, 237, 0.12))';
        card.style.border = '1.5px solid rgba(217, 119, 6, 0.4)';
        card.style.boxShadow = '0 0 10px rgba(217, 119, 6, 0.1)';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        
        let percent = (q.current / q.targetCount) * 100;
        
        card.innerHTML = `
            <div style="position: absolute; top: 0; right: 0; background: var(--color-gold); color: #000; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-bottom-left-radius: 6px; letter-spacing: 0.5px;">LEGENDÄR</div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom: 6px;">
                <span style="font-size: 1.4rem;">${q.npcIcon}</span>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size: 0.72rem; font-weight:700; color:var(--color-gold);">${q.npcName}</span>
                    <span class="lobby-quest-desc" style="font-weight: 800; color:#fff; font-size: 0.82rem;">${q.text}</span>
                </div>
            </div>
            <div class="lobby-quest-progress-bar-wrapper">
                <div class="lobby-quest-progress-bar-outer" style="background: rgba(0,0,0,0.3);">
                    <div class="lobby-quest-progress-bar-inner" style="width: ${percent}%; background: linear-gradient(to right, var(--color-gold), var(--color-purple));"></div>
                </div>
                <span class="lobby-quest-progress-nums" style="color: var(--color-gold); font-weight:800;">${q.current} / ${q.targetCount}</span>
            </div>
            <div class="lobby-quest-rewards">
                <div class="lobby-reward-item gold"><i class="fa-solid fa-coins"></i> +${q.rewardGold}€</div>
                <div class="lobby-reward-item xp"><i class="fa-solid fa-sparkles"></i> +${q.rewardXP} XP</div>
                <div class="lobby-reward-item" style="color:var(--color-cyan); font-weight:800; border-color:rgba(0, 240, 255, 0.25);"><i class="fa-solid fa-scroll"></i> Rezept</div>
            </div>
        `;
        container.appendChild(card);
    }

    // --- RENDER DAILY QUESTS ---
    function renderQuests() {
        renderLegendaryQuest();

        const container = document.getElementById('lobby-quests-container');
        if (!container) return;
        container.innerHTML = '';

        let dailyQuests = JSON.parse(localStorage.getItem('alchemist_quests')) || [];
        if (dailyQuests.length === 0) {
            container.innerHTML = '<div style="font-style:italic; color:#666; font-size:0.85rem; text-align:center; padding: 20px 0;">Keine Aufträge verfügbar. Betrete ein Spiel, um sie zu initialisieren!</div>';
            return;
        }

        dailyQuests.forEach(q => {
            let percent = (q.current / q.targetCount) * 100;
            const card = document.createElement('div');
            card.className = `lobby-quest-item ${q.completed ? 'completed' : ''}`;
            card.innerHTML = `
                <span class="lobby-quest-desc">${q.text}</span>
                <div class="lobby-quest-progress-bar-wrapper">
                    <div class="lobby-quest-progress-bar-outer">
                        <div class="lobby-quest-progress-bar-inner" style="width: ${percent}%;"></div>
                    </div>
                    <span class="lobby-quest-progress-nums">${q.current} / ${q.targetCount}</span>
                </div>
                <div class="lobby-quest-rewards">
                    <div class="lobby-reward-item gold"><i class="fa-solid fa-coins"></i> +${q.rewardGold}€</div>
                    <div class="lobby-reward-item xp"><i class="fa-solid fa-sparkles"></i> +${q.rewardXP} XP</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- RENDER LINE CHART ---
    function drawChart() {
        const canvas = document.getElementById('lobby-balance-chart');
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width) || 310;
        const displayHeight = Math.round(rect.height) || 150;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = displayWidth;
        const h = displayHeight;

        ctx.clearRect(0, 0, w, h);

        let historyData = [...balanceHistory];
        
        // Guarantee at least 2 points to draw a line
        if (historyData.length === 1) {
            historyData = [1000, historyData[0]];
        }

        let min = Math.min(...historyData) * 0.95;
        let max = Math.max(...historyData) * 1.05;
        if (max - min < 20) {
            min = Math.max(0, min - 10);
            max += 10;
        }

        const padding = 16;
        const chartW = w - (padding * 2);
        const chartH = h - (padding * 2);

        const points = [];
        for (let i = 0; i < historyData.length; i++) {
            let val = historyData[i];
            let x = padding + (chartW / (historyData.length - 1)) * i;
            let y = padding + chartH - ((val - min) / (max - min)) * chartH;
            points.push({ x, y, val });
        }

        // Draw horizontal grid lines
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            let y = padding + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw fill area gradient
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding + chartH);
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[points.length - 1].x, padding + chartH);
        ctx.closePath();

        let areaGrad = ctx.createLinearGradient(0, 0, 0, h);
        areaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        areaGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw dots
        points.forEach((p, idx) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = idx === points.length - 1 ? '#ffd700' : '#00f0ff';
            ctx.shadowColor = idx === points.length - 1 ? '#ffd700' : '#00f0ff';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            if (idx === 0 || idx === points.length - 1) {
                ctx.fillStyle = '#5c5270';
                ctx.font = '8px Outfit, sans-serif';
                ctx.fillText(`${Math.round(p.val)}€`, p.x - 12, p.y - 8);
            }
        });
    }

    // --- PARTICLES ENGINE ---
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 1,
                speed: Math.random() * 0.4 + 0.1,
                color: `rgba(0, 240, 255, ${Math.random() * 0.12 + 0.04})`
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                p.y -= p.speed;
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
            });
            requestAnimationFrame(draw);
        }
        draw();
    }

    // --- BANKRUPTCY & RECTOR'S FAVOR ---
    const rectorFavorContainer = document.getElementById('rector-favor-container');
    const btnRectorFavor = document.getElementById('btn-rector-favor');

    function checkBankruptcy() {
        if (balance < 10.00) {
            if (rectorFavorContainer) rectorFavorContainer.classList.remove('hidden');
        } else {
            if (rectorFavorContainer) rectorFavorContainer.classList.add('hidden');
        }
    }

    if (btnRectorFavor) {
        btnRectorFavor.addEventListener('click', () => {
            balance += 100.00;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
            updateHUD();
            checkBankruptcy();
            window.AlchemistShared.showToast("🎁 Not-Stipendium erhalten: +100,00 €!");
        });
    }

    // --- SAVEGAME IMPORT/EXPORT ---
    const btnExportSave = document.getElementById('btn-export-save');
    const btnImportSave = document.getElementById('btn-import-save');

    if (btnExportSave) {
        btnExportSave.addEventListener('click', () => {
            const base64 = window.AlchemistShared.exportSavegame();
            navigator.clipboard.writeText(base64).then(() => {
                window.AlchemistShared.showToast("📋 Spielstand in die Zwischenablage kopiert!");
            }).catch(() => {
                alert("Spielstand Base64 Code:\n\n" + base64);
            });
        });
    }

    if (btnImportSave) {
        btnImportSave.addEventListener('click', () => {
            const code = prompt("Füge den exportierten Spielstand Base64 Code hier ein:");
            if (code) {
                const success = window.AlchemistShared.importSavegame(code);
                if (success) {
                    window.AlchemistShared.showToast("✨ Spielstand erfolgreich importiert!", "quest-complete");
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    window.AlchemistShared.showToast("❌ Ungültiger Spielstand-Code!", "info");
                }
            }
        });
    }

    // --- LOBBY SOUND CONTROLS ---
    const btnSoundControl = document.getElementById('btn-sound-control-trigger');
    const soundDropdown = document.getElementById('sound-control-dropdown');
    const musicSlider = document.getElementById('music-vol-slider');
    const sfxSlider = document.getElementById('sfx-vol-slider');
    const musicDisplay = document.getElementById('music-vol-display');
    const sfxDisplay = document.getElementById('sfx-vol-display');

    if (btnSoundControl && soundDropdown) {
        btnSoundControl.addEventListener('click', (e) => {
            e.stopPropagation();
            soundDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!soundDropdown.classList.contains('hidden') && !soundDropdown.contains(e.target) && e.target !== btnSoundControl) {
                soundDropdown.classList.add('hidden');
            }
        });

        if (window.AlchemistShared) {
            let mVol = window.AlchemistShared.getVolume('music');
            let sVol = window.AlchemistShared.getVolume('sfx');
            musicSlider.value = mVol;
            sfxSlider.value = sVol;
            musicDisplay.textContent = Math.round(mVol * 100) + '%';
            sfxDisplay.textContent = Math.round(sVol * 100) + '%';
        }

        musicSlider.addEventListener('input', (e) => {
            let val = e.target.value;
            musicDisplay.textContent = Math.round(val * 100) + '%';
            if (window.AlchemistShared) {
                window.AlchemistShared.setVolume('music', val);
            }
        });

        sfxSlider.addEventListener('input', (e) => {
            let val = e.target.value;
            sfxDisplay.textContent = Math.round(val * 100) + '%';
            if (window.AlchemistShared) {
                window.AlchemistShared.setVolume('sfx', val);
            }
        });
    }

    // --- DAILY SPIN ENGINE ---
    const SPIN_REWARDS = [
        { text: "10,00 €", type: "gold", value: 10, color: "#2d1b4e" },
        { text: "50 XP", type: "xp", value: 50, color: "#1b2d4e" },
        { text: "25,00 €", type: "gold", value: 25, color: "#2d1b4e" },
        { text: "1x Schwefel", type: "ingredient", value: "sulfur", color: "#4e351b" },
        { text: "100 XP", type: "xp", value: 100, color: "#1b2d4e" },
        { text: "50,00 €", type: "gold", value: 50, color: "#2d1b4e" },
        { text: "1x Quecksilber", type: "ingredient", value: "quicksilver", color: "#4e351b" },
        { text: "100,00 €", type: "gold", value: 100, color: "#ffd700", textColor: "#000" }
    ];

    const spinWheelModal = document.getElementById('daily-spin-modal');
    const btnOpenDailySpin = document.getElementById('btn-open-daily-spin');
    const btnCloseDailySpin = document.getElementById('btn-close-daily-spin');
    const btnSpinWheelAction = document.getElementById('btn-spin-wheel-action');
    const spinWheelCanvas = document.getElementById('daily-spin-wheel');

    let wheelAngle = 0;
    let wheelVel = 0;
    let isWheelSpinning = false;

    function checkDailySpinCooldown() {
        let lastSpin = localStorage.getItem('alchemist_last_daily_spin');
        let btnOpen = document.getElementById('btn-open-daily-spin');
        let cdText = document.getElementById('daily-spin-cooldown-text');
        
        if (lastSpin) {
            let elapsed = Date.now() - parseInt(lastSpin);
            let cooldown = 24 * 60 * 60 * 1000;
            if (elapsed < cooldown) {
                let remaining = cooldown - elapsed;
                let hours = Math.floor(remaining / (60 * 60 * 1000));
                let minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                
                if (btnOpen) {
                    btnOpen.disabled = true;
                    btnOpen.textContent = "GESPERRT";
                    btnOpen.style.background = "rgba(255, 255, 255, 0.05)";
                    btnOpen.style.color = "#666";
                }
                if (cdText) {
                    cdText.style.display = "block";
                    cdText.textContent = `Nächster Dreh in ${hours}h ${minutes}m`;
                }
                return false;
            }
        }
        
        if (btnOpen) {
            btnOpen.disabled = false;
            btnOpen.textContent = "RAD DREHEN";
            btnOpen.style.background = "linear-gradient(135deg, #ffd700, #ff8c00)";
            btnOpen.style.color = "#000";
        }
        if (cdText) {
            cdText.style.display = "none";
        }
        return true;
    }

    if (btnOpenDailySpin && spinWheelModal) {
        btnOpenDailySpin.addEventListener('click', () => {
            if (checkDailySpinCooldown()) {
                spinWheelModal.classList.remove('hidden');
                drawDailySpinWheel();
            }
        });
        
        btnCloseDailySpin.addEventListener('click', () => {
            if (!isWheelSpinning) {
                spinWheelModal.classList.add('hidden');
                checkDailySpinCooldown();
            }
        });
    }

    function drawDailySpinWheel() {
        if (!spinWheelCanvas) return;
        const ctx = spinWheelCanvas.getContext('2d');
        const w = spinWheelCanvas.width;
        const h = spinWheelCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = cx - 10;
        const numSegments = SPIN_REWARDS.length;
        const arc = (Math.PI * 2) / numSegments;

        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(wheelAngle);

        for (let i = 0; i < numSegments; i++) {
            const startAng = i * arc;
            const endAng = startAng + arc;
            const reward = SPIN_REWARDS[i];

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAng, endAng);
            ctx.closePath();
            ctx.fillStyle = reward.color;
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.rotate(startAng + arc / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = reward.textColor || "#fff";
            ctx.font = "bold 13px Outfit, sans-serif";
            ctx.fillText(reward.text, r - 30, 0);
            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fillStyle = "#120b22";
        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 20px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔮", 0, 0);

        ctx.restore();

        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    if (btnSpinWheelAction) {
        btnSpinWheelAction.addEventListener('click', () => {
            if (isWheelSpinning) return;
            if (!checkDailySpinCooldown()) return;

            isWheelSpinning = true;
            btnSpinWheelAction.disabled = true;
            btnSpinWheelAction.textContent = "MISCHUNG ROTIERT...";

            if (window.AlchemistShared) {
                window.AlchemistShared.setMusicState(0.7, 100);
            }

            wheelVel = 0.22 + Math.random() * 0.15;
            requestAnimationFrame(animateDailySpin);
        });
    }

    function animateDailySpin() {
        if (wheelVel > 0.002) {
            wheelAngle += wheelVel;
            wheelVel *= 0.982;

            if (Math.random() < 0.1 && window.AlchemistShared && window.AlchemistShared.playBounceNote) {
                window.AlchemistShared.playBounceNote(0.7);
            }

            drawDailySpinWheel();
            requestAnimationFrame(animateDailySpin);
        } else {
            finishDailySpin();
        }
    }

    function finishDailySpin() {
        let normalizedAngle = (wheelAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        let targetAngle = (-Math.PI / 2 - normalizedAngle) % (Math.PI * 2);
        if (targetAngle < 0) targetAngle += Math.PI * 2;
        
        let sliceSize = (Math.PI * 2) / SPIN_REWARDS.length;
        let winnerIndex = Math.floor(targetAngle / sliceSize);
        winnerIndex = Math.max(0, Math.min(SPIN_REWARDS.length - 1, winnerIndex));

        const reward = SPIN_REWARDS[winnerIndex];

        if (reward.type === "gold") {
            if (window.AlchemistShared) window.AlchemistShared.addBalance(reward.value);
            window.AlchemistShared.showToast(`🎁 Rad-Gewinn: +${reward.value.toFixed(2)}€ erhalten!`, 'quest-complete');
        } else if (reward.type === "xp") {
            if (window.AlchemistShared) window.AlchemistShared.addXP(reward.value);
            window.AlchemistShared.showToast(`🎁 Rad-Gewinn: +${reward.value} XP erhalten!`, 'level-up');
        } else if (reward.type === "ingredient") {
            let ingredients = JSON.parse(localStorage.getItem('alchemist_ingredients')) || { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 };
            ingredients[reward.value] = (ingredients[reward.value] || 0) + 1;
            localStorage.setItem('alchemist_ingredients', JSON.stringify(ingredients));
            
            let ingNames = { sulfur: "Schwefel", quicksilver: "Quecksilber", mandrake: "Alraunenwurzel", dragon_blood: "Drachenblut" };
            window.AlchemistShared.showToast(`🎁 Rad-Gewinn: 1x ${ingNames[reward.value]} erhalten!`, 'quest-complete');
        }

        localStorage.setItem('alchemist_last_daily_spin', Date.now().toString());

        btnSpinWheelAction.textContent = "DREH BEENDET";
        setTimeout(() => {
            spinWheelModal.classList.add('hidden');
            checkDailySpinCooldown();
            isWheelSpinning = false;
            btnSpinWheelAction.textContent = "JETZT DREHEN";
            btnSpinWheelAction.disabled = false;
        }, 1500);

        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.1, 60);
        }
    }

    // Call cooldown check on load
    checkDailySpinCooldown();

    // --- LOBBY TAB NAVIGATION ---
    const lobbyNavPortalsBtn = document.getElementById('lobby-nav-portals');
    const lobbyNavMarketBtn = document.getElementById('lobby-nav-market');
    const lobbyPanePortalsEl = document.getElementById('tab-pane-portals');
    const lobbyPaneMarketEl = document.getElementById('tab-pane-market');

    if (lobbyNavPortalsBtn && lobbyNavMarketBtn) {
        lobbyNavPortalsBtn.addEventListener('click', () => {
            lobbyNavPortalsBtn.classList.add('active');
            lobbyNavMarketBtn.classList.remove('active');
            if (lobbyPanePortalsEl) {
                lobbyPanePortalsEl.classList.add('active');
                lobbyPanePortalsEl.classList.remove('hidden');
            }
            if (lobbyPaneMarketEl) {
                lobbyPaneMarketEl.classList.add('hidden');
                lobbyPaneMarketEl.classList.remove('active');
            }
        });

        lobbyNavMarketBtn.addEventListener('click', () => {
            lobbyNavMarketBtn.classList.add('active');
            lobbyNavPortalsBtn.classList.remove('active');
            if (lobbyPaneMarketEl) {
                lobbyPaneMarketEl.classList.add('active');
                lobbyPaneMarketEl.classList.remove('hidden');
            }
            if (lobbyPanePortalsEl) {
                lobbyPanePortalsEl.classList.add('hidden');
                lobbyPanePortalsEl.classList.remove('active');
            }
            renderMarket();
            renderLaboratory();
        });
    }

    const MARKET_ITEMS = [
        { id: 'ice', name: 'Eis-Design', type: 'theme', desc: 'Kosmetisches eisiges Portal-Design (Cyan/Frost).', price: 150, lvlReq: 2, icon: '❄️' },
        { id: 'volcano', name: 'Vulkan-Design', type: 'theme', desc: 'Feuriges Magma-Portal-Design (Rot/Hitze).', price: 500, lvlReq: 4, icon: '🌋' },
        { id: 'astral', name: 'Astral-Design', type: 'theme', desc: 'Ein prachtvolles kosmetisches Sternenbild-Design (Dunkelblau/Violett).', price: 1000, lvlReq: 6, icon: '🌌' },
        { id: 'copper', name: 'Kupfer-Filter', type: 'upgrade', desc: 'Kessel-Upgrade: Senkt den passiven Instabilitätszuwachs um 10%.', price: 300, lvlReq: 3, icon: '🛡️' },
        { id: 'crystal', name: 'Katalysator-Kristall', type: 'upgrade', desc: 'Kessel-Upgrade: Erhöht alle Kessel-Auszahlungen dauerhaft um 10%.', price: 800, lvlReq: 5, icon: '✨' },
        { id: 'catalyst', name: 'Glücks-Katalysator', type: 'upgrade', desc: 'Physik/Spin-Upgrade: Erhöht Plinko-Split & Slots Freispielchancen um 15%.', price: 400, lvlReq: 4, icon: '🔮' },
        { id: 'detector', name: 'Runen-Detektor', type: 'upgrade', desc: 'Minen-Upgrade: Ermöglicht ein risikofreies Aufdecken einer sicheren Rune pro Runde.', price: 600, lvlReq: 5, icon: '💎' },
        { id: 'magnet', name: 'Äther-Magnet', type: 'upgrade', desc: 'Roulette-Upgrade: Erhöht die Äther-Gewinnwahrscheinlichkeit am Rad um 10%.', price: 800, lvlReq: 6, icon: '🧲' },
        { id: 'bellows', name: 'Glut-Gebläse', type: 'upgrade', desc: 'Würfel-Upgrade: Verwandelt unentschiedene Würfel-Duelle in Siege.', price: 500, lvlReq: 4, icon: '💨' },
        { id: 'spell_fire_up', name: 'Feuerstoß-Veredelung', type: 'spell', desc: 'Kampf-Upgrade: Erhöht den Brandschaden um +25%.', price: 200, lvlReq: 2, icon: '🔥' },
        { id: 'spell_earth_up', name: 'Erdbeben-Veredelung', type: 'spell', desc: 'Kampf-Upgrade: Erhöht den Erdschaden um +25%.', price: 350, lvlReq: 4, icon: '🪨' },
        { id: 'spell_wind_up', name: 'Windstoß-Veredelung', type: 'spell', desc: 'Kampf-Upgrade: Senkt die MP-Kosten permanent.', price: 250, lvlReq: 3, icon: '💨' },
        { id: 'spell_ice_unlock', name: 'Eis-Spruchrolle', type: 'spell', desc: 'Kampf-Zauber: Schaltet Eis-Splitter frei (Friert Gegner 1 Runde ein).', price: 400, lvlReq: 4, icon: '❄️' }
    ];

    function renderMarket() {
        const grid = document.getElementById('lobby-market-grid');
        if (!grid) return;
        grid.innerHTML = '';

        let spells = window.AlchemistShared ? window.AlchemistShared.getArenaSpells() : { fire: 1, earth: 1, wind: 1, iceUnlocked: false };

        MARKET_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'market-item-card';
            
            let isUnlocked = false;
            let isEquipped = false;
            let btnText = '';
            let btnDisabled = false;

            if (item.type === 'theme') {
                isUnlocked = unlockedThemes.includes(item.id);
                isEquipped = equippedTheme === item.id;
            } else if (item.type === 'upgrade') {
                isUnlocked = unlockedUpgrades.includes(item.id);
                isEquipped = activeUpgrades[item.id];
            } else if (item.type === 'spell') {
                if (item.id === 'spell_fire_up') {
                    let lvl = spells.fire;
                    isUnlocked = lvl >= 5;
                    isEquipped = lvl >= 5;
                    item.desc = `Kampf-Upgrade: Erhöht den Brandschaden um +25%. Aktuelle Stufe: ${lvl}/5`;
                } else if (item.id === 'spell_earth_up') {
                    let lvl = spells.earth;
                    isUnlocked = lvl >= 5;
                    isEquipped = lvl >= 5;
                    item.desc = `Kampf-Upgrade: Erhöht den Erdschaden um +25%. Aktuelle Stufe: ${lvl}/5`;
                } else if (item.id === 'spell_wind_up') {
                    let lvl = spells.wind;
                    isUnlocked = lvl >= 5;
                    isEquipped = lvl >= 5;
                    item.desc = `Kampf-Upgrade: Senkt die MP-Kosten von Windstoß permanent. Stufe: ${lvl}/5`;
                } else if (item.id === 'spell_ice_unlock') {
                    isUnlocked = spells.iceUnlocked;
                    isEquipped = spells.iceUnlocked;
                }
            }
            
            if (!isUnlocked) {
                if (level >= item.lvlReq) {
                    btnText = `<i class="fa-solid fa-coins"></i> KAUFEN (${item.price}€)`;
                } else {
                    btnText = `<i class="fa-solid fa-lock"></i> Stufe ${item.lvlReq} nötig`;
                    btnDisabled = true;
                }
            } else {
                if (item.type === 'theme') {
                    btnText = isEquipped ? 'AUSGERÜSTET' : 'AUSRÜSTEN';
                    if (isEquipped) btnDisabled = true;
                } else if (item.type === 'upgrade') {
                    btnText = isEquipped ? 'DEAKTIVIEREN' : 'AKTIVIEREN';
                } else if (item.type === 'spell') {
                    btnText = 'MAX STUFE';
                    btnDisabled = true;
                }
            }

            card.innerHTML = `
                <div class="market-item-badge badge-${item.type}">${item.type === 'theme' ? 'STIL' : (item.type === 'upgrade' ? 'PASSIV' : 'ZAUBER')}</div>
                <div class="market-item-icon">${item.icon}</div>
                <h3 class="market-item-title">${item.name}</h3>
                <p class="market-item-desc">${item.desc}</p>
                <button type="button" class="btn" style="width:100%; background:${isEquipped ? 'rgba(57, 255, 20, 0.2)' : 'linear-gradient(135deg, #8a2be2, #4b0082)'}; border: 1px solid rgba(255, 255, 255, 0.1); color:#fff; font-weight:700;" ${btnDisabled ? 'disabled' : ''}>
                     ${btnText}
                </button>
            `;

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (!isUnlocked) {
                    if (balance >= item.price) {
                        balance -= item.price;
                        localStorage.setItem('alchemist_balance', balance.toFixed(2));
                        updateHUD();
                        checkBankruptcy();

                        if (item.type === 'theme') {
                            unlockedThemes.push(item.id);
                            localStorage.setItem('alchemist_unlocked_themes', JSON.stringify(unlockedThemes));
                            window.AlchemistShared.showToast(`✨ ${item.name} gekauft!`, 'quest-complete');
                        } else if (item.type === 'upgrade') {
                            unlockedUpgrades.push(item.id);
                            localStorage.setItem('alchemist_unlocked_upgrades', JSON.stringify(unlockedUpgrades));
                            activeUpgrades[item.id] = true;
                            localStorage.setItem('alchemist_upgrades', JSON.stringify(activeUpgrades));
                            window.AlchemistShared.showToast(`✨ ${item.name} gekauft!`, 'quest-complete');
                        } else if (item.type === 'spell') {
                            if (window.AlchemistShared && window.AlchemistShared.upgradeSpell) {
                                if (item.id === 'spell_fire_up') {
                                    window.AlchemistShared.upgradeSpell('fire');
                                } else if (item.id === 'spell_earth_up') {
                                    window.AlchemistShared.upgradeSpell('earth');
                                } else if (item.id === 'spell_wind_up') {
                                    window.AlchemistShared.upgradeSpell('wind');
                                } else if (item.id === 'spell_ice_unlock') {
                                    window.AlchemistShared.upgradeSpell('ice');
                                }
                            }
                        }
                    } else {
                        window.AlchemistShared.showToast(`❌ Nicht genügend Guthaben!`, 'info');
                    }
                } else {
                    if (item.type === 'theme') {
                        equippedTheme = item.id;
                        localStorage.setItem('alchemist_theme', equippedTheme);
                        if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
                            window.AlchemistShared.applyCurrentTheme();
                        }
                        window.AlchemistShared.showToast(`🎨 Theme ${item.name} ausgerüstet!`, 'info');
                    } else if (item.type === 'upgrade') {
                        activeUpgrades[item.id] = !activeUpgrades[item.id];
                        localStorage.setItem('alchemist_upgrades', JSON.stringify(activeUpgrades));
                        window.AlchemistShared.showToast(`⚙️ Upgrade ${item.name} ${activeUpgrades[item.id] ? 'aktiviert' : 'deaktiviert'}!`, 'info');
                    }
                }
                renderMarket();
            });

            grid.appendChild(card);
        });
    }

    function renderLaboratory() {
        const ingredientsEl = document.getElementById('lab-ingredients-inventory');
        const potionsGridEl = document.getElementById('lab-potions-grid');
        if (!ingredientsEl || !potionsGridEl) return;

        if (!window.AlchemistShared) return;

        const ing = window.AlchemistShared.getIngredients();
        const pot = window.AlchemistShared.getPotions();
        const act = window.AlchemistShared.getActivePotions();
        const INGREDIENT_DEFS = window.AlchemistShared.INGREDIENT_DEFS;
        const POTION_DEFS = window.AlchemistShared.POTION_DEFS;

        // Render News Ticker & Market prices
        const marketState = window.AlchemistShared.getMarketState();
        const newsTextEl = document.getElementById('market-news-text');
        if (newsTextEl) {
            newsTextEl.textContent = marketState.news;
        }

        const exchangeBoardEl = document.getElementById('market-exchange-board');
        if (exchangeBoardEl) {
            exchangeBoardEl.innerHTML = '';
            Object.keys(INGREDIENT_DEFS).forEach(id => {
                const def = INGREDIENT_DEFS[id];
                const price = marketState.prices[id] || def.price;
                const trend = marketState.trends[id] || 0.0;
                
                const card = document.createElement('div');
                card.className = 'exchange-card';
                
                let trendHtml = '';
                if (trend > 0) {
                    trendHtml = `<span class="trend-badge up"><i class="fa-solid fa-arrow-trend-up"></i> +${(trend * 100).toFixed(1)}%</span>`;
                } else if (trend < 0) {
                    trendHtml = `<span class="trend-badge down"><i class="fa-solid fa-arrow-trend-down"></i> ${(trend * 100).toFixed(1)}%</span>`;
                } else {
                    trendHtml = `<span class="trend-badge" style="color:var(--text-secondary);"><i class="fa-solid fa-arrows-left-right"></i> 0%</span>`;
                }

                card.innerHTML = `
                    <div style="font-size:2rem; margin-bottom: 5px;">${def.icon}</div>
                    <strong style="color:var(--text-primary); font-size:0.85rem; display:block;">${def.name}</strong>
                    <div class="item-price" style="color:${trend < 0 ? 'var(--color-green)' : 'var(--text-primary)'};">${price.toFixed(2)} €</div>
                    <div style="margin-bottom: 12px;">${trendHtml}</div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn btn-buy-market" style="flex:1; font-size:0.68rem; padding:4px; background:rgba(8,145,178,0.1); border-color:rgba(8,145,178,0.3); color:var(--color-cyan); font-weight:700;">
                            Kauf
                        </button>
                        <button type="button" class="btn btn-sell-market" style="flex:1; font-size:0.68rem; padding:4px; background:rgba(22,163,74,0.1); border-color:rgba(22,163,74,0.3); color:var(--color-green); font-weight:700;" ${ing[id] <= 0 ? 'disabled' : ''}>
                            Verkauf
                        </button>
                    </div>
                `;

                card.querySelector('.btn-buy-market').addEventListener('click', () => {
                    if (window.AlchemistShared.buyIngredient(id)) {
                        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                        updateHUD();
                        renderLaboratory();
                    }
                });

                card.querySelector('.btn-sell-market').addEventListener('click', () => {
                    if (window.AlchemistShared.sellIngredient(id)) {
                        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                        updateHUD();
                        renderLaboratory();
                    }
                });

                exchangeBoardEl.appendChild(card);
            });
        }

        // Render NPC Trading Post
        const npcCardEl = document.getElementById('lobby-npc-trade-card');
        if (npcCardEl) {
            const offer = window.AlchemistShared.getNPCOffer();
            if (!offer || !offer.active) {
                npcCardEl.innerHTML = `
                    <div style="text-align:center; width:100%; padding:15px; color:var(--text-secondary); font-style:italic;">
                        Gerade sucht kein Alchemist nach Tränken. Komm nach der nächsten Spielrunde wieder!
                        <button type="button" class="btn btn-primary" id="btn-force-npc" style="margin-top:10px; font-size:0.75rem; padding:6px 12px; background:linear-gradient(135deg, var(--color-purple), #6b21a8); border:none; color:#fff;">
                            Händler anlocken (5,00 €)
                        </button>
                    </div>
                `;
                
                const btnForce = npcCardEl.querySelector('#btn-force-npc');
                if (btnForce) {
                    btnForce.addEventListener('click', () => {
                        if (window.AlchemistShared.cycleNPCOffer(true)) {
                            balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                            updateHUD();
                            renderLaboratory();
                        }
                    });
                }
            } else {
                const requiredPotionName = POTION_DEFS[offer.potionId].name;
                const ownedPotionCount = pot[offer.potionId] || 0;
                const hasEnough = ownedPotionCount >= offer.count;
                const totalWin = offer.count * offer.pricePerUnit;

                npcCardEl.innerHTML = `
                    <div class="npc-avatar">${offer.npcIcon}</div>
                    <div class="npc-dialog-bubble">
                        <h4 class="npc-name">${offer.npcName}</h4>
                        <p class="npc-text">"${offer.dialog}"</p>
                        <div style="margin-top:8px; font-size:0.8rem; font-weight:700; color:var(--text-primary);">
                            Gesucht: <span style="color:var(--color-purple);">${offer.count}x ${requiredPotionName}</span> 
                            (Besitz: <strong style="color:${hasEnough ? 'var(--color-green)' : 'var(--color-danger)'}">${ownedPotionCount}/${offer.count}</strong>)
                        </div>
                    </div>
                    <div class="npc-trade-actions">
                        <button type="button" class="btn btn-primary btn-sell-potion" style="width:100%; font-size:0.8rem; padding:8px; background:linear-gradient(135deg, var(--color-green), #15803d); border:none; color:#fff; font-weight:800;" ${!hasEnough ? 'disabled' : ''}>
                            <i class="fa-solid fa-coins"></i> VERKAUFEN (+${totalWin.toFixed(2)} €)
                        </button>
                        <button type="button" class="btn btn-cycle-npc" style="width:100%; font-size:0.72rem; padding:6px; background:rgba(0,0,0,0.04); border:1px solid var(--border-color); color:var(--text-secondary);">
                            Aushang wechseln (5,00 €)
                        </button>
                    </div>
                `;

                npcCardEl.querySelector('.btn-sell-potion').addEventListener('click', () => {
                    if (window.AlchemistShared.sellPotionToNPC()) {
                        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                        updateHUD();
                        renderLaboratory();
                    }
                });

                npcCardEl.querySelector('.btn-cycle-npc').addEventListener('click', () => {
                    if (window.AlchemistShared.cycleNPCOffer(true)) {
                        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                        updateHUD();
                        renderLaboratory();
                    }
                });
            }
        }

        // Set up refresh market listener once
        const btnRefreshMarket = document.getElementById('btn-refresh-market');
        if (btnRefreshMarket && !btnRefreshMarket.dataset.listenerAdded) {
            btnRefreshMarket.dataset.listenerAdded = 'true';
            btnRefreshMarket.addEventListener('click', () => {
                window.AlchemistShared.updateMarketPrices(true);
                renderLaboratory();
                window.AlchemistShared.showToast("🔔 Börsenkurse aktualisiert!", "info");
            });
        }

        // Render ingredients list inventory
        ingredientsEl.innerHTML = '';
        Object.keys(INGREDIENT_DEFS).forEach(id => {
            const def = INGREDIENT_DEFS[id];
            const count = ing[id] || 0;
            const price = marketState.prices[id] || def.price;
            const item = document.createElement('div');
            item.className = 'inventory-item';
            item.innerHTML = `
                <span class="inv-icon" style="font-size:1.8rem; filter:drop-shadow(0 0 5px rgba(255,255,255,0.1));">${def.icon}</span>
                <strong style="color:var(--text-primary); font-size:0.82rem; margin-top:2px;">${def.name}</strong>
                <span class="inv-count">${count} im Besitz</span>
                <button type="button" class="btn btn-buy-ing" style="margin-top: 8px; font-size: 0.68rem; padding: 4px 10px; background: rgba(0, 240, 255, 0.08); border-color: rgba(0, 240, 255, 0.25); color: #00f0ff; font-weight:700;">
                    Kaufen (${price.toFixed(2)}€)
                </button>
            `;
            item.querySelector('.btn-buy-ing').addEventListener('click', () => {
                if (window.AlchemistShared.buyIngredient(id)) {
                    balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                    updateHUD();
                    renderLaboratory();
                }
            });
            ingredientsEl.appendChild(item);
        });

        potionsGridEl.innerHTML = '';
        Object.keys(POTION_DEFS).forEach(potionId => {
            const def = POTION_DEFS[potionId];
            const potCount = pot[potionId] || 0;
            const actRounds = act[potionId] || 0;
            
            let costHtml = '';
            let canBrew = true;
            Object.keys(def.cost).forEach(material => {
                const costCount = def.cost[material];
                const owned = ing[material] || 0;
                const missing = owned < costCount;
                if (missing) canBrew = false;
                const matIcon = INGREDIENT_DEFS[material] ? INGREDIENT_DEFS[material].icon : '🜔';
                costHtml += `
                    <span class="recipe-cost-item ${missing ? 'missing' : ''}" title="${costCount}x ${material}" style="padding: 2px 5px; font-size:0.68rem;">
                        ${matIcon} ${owned}/${costCount}
                    </span>
                `;
            });

            const card = document.createElement('div');
            card.className = 'lab-card';
            card.innerHTML = `
                <div>
                    <div class="lab-card-icon" style="font-size:2.4rem;">${def.icon}</div>
                    <h4 class="lab-card-title">${def.name}</h4>
                    <p class="lab-card-desc">${def.desc}</p>
                    <div class="recipe-cost-list" style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap;">
                        ${costHtml}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                    <button type="button" class="btn btn-brew" style="font-size: 0.72rem; padding: 6px 12px; background:linear-gradient(135deg, #8a2be2, #4b0082); border-color: rgba(255,255,255,0.1); color:#fff;" ${!canBrew ? 'disabled' : ''}>
                        Brauen (+100 XP)
                    </button>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span style="font-size: 0.75rem; color: #a99ec6;">Besitz: <strong>${potCount}</strong></span>
                        <button type="button" class="btn btn-drink" style="font-size: 0.72rem; padding: 4px 10px; background: rgba(57, 255, 20, 0.1); border-color: rgba(57, 255, 20, 0.3); color: #39ff14;" ${potCount <= 0 ? 'disabled' : ''}>
                            Trinken
                        </button>
                    </div>
                    ${actRounds > 0 ? `<span style="font-size:0.7rem; color:#39ff14; font-weight:800; text-align:center; display:block; margin-top:4px;">Aktiv: ${actRounds} Rnd. übrig</span>` : ''}
                </div>
            `;

            card.querySelector('.btn-brew').addEventListener('click', () => {
                if (window.AlchemistShared.brewPotion(potionId)) {
                    xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
                    level = parseInt(localStorage.getItem('alchemist_level')) || 1;
                    updateHUD();
                    renderLaboratory();
                }
            });

            card.querySelector('.btn-drink').addEventListener('click', () => {
                if (window.AlchemistShared.consumePotion(potionId)) {
                    renderLaboratory();
                }
            });

            potionsGridEl.appendChild(card);
        });
    }

    // --- STATS BOOK MODAL ENGINE (MULTI-PAGE) ---
    const btnOpenStatsBook = document.getElementById('btn-open-stats-book');
    const btnCloseStatsBook = document.getElementById('btn-close-stats-book');
    const statsBookModal = document.getElementById('stats-book-modal');
    
    let currentBookTab = 'stats';

    const tabStatsBtn = document.getElementById('book-tab-stats-btn');
    const tabGrimoireBtn = document.getElementById('book-tab-grimoire-btn');
    const tabTrophiesBtn = document.getElementById('book-tab-trophies-btn');
    const tabChronicleBtn = document.getElementById('book-tab-chronicle-btn');
    const tabRivalsBtn = document.getElementById('book-tab-rivals-btn');

    if (tabStatsBtn) tabStatsBtn.addEventListener('click', () => switchBookTab('stats'));
    if (tabGrimoireBtn) tabGrimoireBtn.addEventListener('click', () => switchBookTab('grimoire'));
    if (tabTrophiesBtn) tabTrophiesBtn.addEventListener('click', () => switchBookTab('trophies'));
    if (tabChronicleBtn) tabChronicleBtn.addEventListener('click', () => switchBookTab('chronicle'));
    if (tabRivalsBtn) tabRivalsBtn.addEventListener('click', () => switchBookTab('rivals'));

    const GAME_NAMES = {
        cauldron: 'Kessel des Schicksals',
        plinko: 'Essenz-Plinko',
        slots: 'Alchemisten-Spins',
        mines: 'Runen-Minen',
        roulette: 'Elementen-Roulette',
        dice: 'Athanor-Würfeln',
        blackjack: 'Blei-Transmutation',
        classic_roulette: 'Alchemisten-Roulette',
        arena: 'Arena der Prüfungen'
    };

    if (btnOpenStatsBook) {
        btnOpenStatsBook.addEventListener('click', openStatsBook);
    }
    if (btnCloseStatsBook) {
        btnCloseStatsBook.addEventListener('click', () => statsBookModal.classList.add('hidden'));
    }
    window.addEventListener('click', (e) => {
        if (e.target === statsBookModal) {
            statsBookModal.classList.add('hidden');
        }
    });

    function switchBookTab(tabName) {
        currentBookTab = tabName;
        tabStatsBtn.classList.toggle('active', tabName === 'stats');
        tabGrimoireBtn.classList.toggle('active', tabName === 'grimoire');
        tabTrophiesBtn.classList.toggle('active', tabName === 'trophies');
        if (tabChronicleBtn) tabChronicleBtn.classList.toggle('active', tabName === 'chronicle');
        if (tabRivalsBtn) tabRivalsBtn.classList.toggle('active', tabName === 'rivals');
        renderBookContent();
    }

    function openStatsBook() {
        switchBookTab('stats');
        statsBookModal.classList.remove('hidden');
    }

    function renderBookContent() {
        const leftContent = document.getElementById('book-left-content');
        const rightContent = document.getElementById('book-right-content');
        if (!leftContent || !rightContent) return;

        let currentStats = JSON.parse(localStorage.getItem('alchemist_stats')) || {
            global: { totalRounds: 0, totalWins: 0, highestMultiplier: 1.00, balanceHistory: [1000] }
        };

        if (currentBookTab === 'stats') {
            const totalRounds = currentStats.global.totalRounds || 0;
            const totalWins = currentStats.global.totalWins || 0;
            const winrate = totalRounds > 0 ? ((totalWins / totalRounds) * 100).toFixed(0) + '%' : '0%';
            const highestMult = currentStats.global.highestMultiplier || 1.00;

            leftContent.innerHTML = `
                <h2 class="book-title" id="stats-book-title"><i class="fa-solid fa-book-skull"></i> Magische Annalen</h2>
                <p class="book-subtitle">Globale Ergebnisse deiner alchemistischen Experimente.</p>
                
                <div class="book-stats-grid">
                    <div class="book-stat-card">
                        <span class="book-stat-lbl">Experimente</span>
                        <span class="book-stat-val">${totalRounds}</span>
                    </div>
                    <div class="book-stat-card">
                        <span class="book-stat-lbl">Erfolgsquote</span>
                        <span class="book-stat-val">${winrate} (${totalWins})</span>
                    </div>
                    <div class="book-stat-card">
                        <span class="book-stat-lbl">Höchster Gewinn</span>
                        <span class="book-stat-val">${highestMult.toFixed(2)}x</span>
                    </div>
                </div>

                <div class="book-chart-section">
                    <h3 class="book-section-title"><i class="fa-solid fa-chart-line"></i> Vermögensverlauf</h3>
                    <div class="canvas-chart-container book-chart-container" style="background: rgba(40, 30, 20, 0.15); border: 1px solid rgba(139, 100, 60, 0.15);">
                        <canvas id="book-chart" width="310" height="130"></canvas>
                    </div>
                </div>
            `;

            rightContent.innerHTML = `
                <h3 class="book-section-title" style="margin-top:0;"><i class="fa-solid fa-scroll"></i> Spiele-Register</h3>
                <p class="book-subtitle">Aufschlüsselung der Ergebnisse je Laborbereich.</p>
                
                <div class="book-table-wrapper">
                    <table class="book-stats-table">
                        <thead>
                            <tr>
                                <th>Spielbereich</th>
                                <th>Runden</th>
                                <th>Erfolg</th>
                                <th>Rekord</th>
                            </tr>
                        </thead>
                        <tbody id="book-table-body">
                        </tbody>
                    </table>
                </div>
            `;

            const tbody = document.getElementById('book-table-body');
            Object.keys(GAME_NAMES).forEach(gameId => {
                const gameData = currentStats[gameId] || { rounds: 0, wins: 0, highestMultiplier: 1.00 };
                const gameWinrate = gameData.rounds > 0 ? ((gameData.wins / gameData.rounds) * 100).toFixed(0) + '%' : '0%';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${GAME_NAMES[gameId]}</strong></td>
                    <td>${gameData.rounds}</td>
                    <td style="color:#047857;">${gameWinrate}</td>
                    <td style="color:#b45309; font-weight:800;">${gameData.highestMultiplier.toFixed(2)}x</td>
                `;
                tbody.appendChild(tr);
            });

            setTimeout(drawBookChart, 60);
        } else if (currentBookTab === 'grimoire') {
            leftContent.innerHTML = `
                <h2 class="book-title"><i class="fa-solid fa-book-sparkles"></i> Grimoire</h2>
                <p class="book-subtitle">Entdecke seltene Gebräue für dauerhafte Boni.</p>
                <div class="recipes-list" style="display:flex; flex-direction:column; gap:10px;">
                </div>
            `;

            let recipesList = leftContent.querySelector('.recipes-list');
            Object.keys(window.AlchemistShared.RECIPE_DEFS).forEach(key => {
                const def = window.AlchemistShared.RECIPE_DEFS[key];
                const unlocked = window.AlchemistShared.hasRecipe(key);

                const item = document.createElement('div');
                item.style.padding = '8px 12px';
                item.style.background = unlocked ? 'rgba(57, 255, 20, 0.05)' : 'rgba(0,0,0,0.03)';
                item.style.border = unlocked ? '1px solid rgba(57, 255, 20, 0.2)' : '1px dashed rgba(0,0,0,0.1)';
                item.style.borderRadius = '8px';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#4e2b0f;">${unlocked ? def.icon : '🔒'} ${def.title}</strong>
                        <span style="font-size:0.65rem; padding:1px 6px; border-radius:4px; font-weight:800; background:${unlocked ? '#d1fae5; color:#065f46;' : '#f3f4f6; color:#374151;'}">${unlocked ? 'ENTDECKT' : 'GESPERRT'}</span>
                    </div>
                `;
                item.addEventListener('click', () => selectRecipe(key));
                recipesList.appendChild(item);
            });

            rightContent.innerHTML = `
                <h3 class="book-section-title" style="margin-top:0;"><i class="fa-solid fa-wand-magic-sparkles"></i> Elixier-Geheimnisse</h3>
                <p class="book-subtitle">Wähle eine Rezeptur, um Details anzuzeigen.</p>
                <div id="recipe-detail-pane" style="background: rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.05); padding:15px; border-radius:8px; min-height:220px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
                    <span style="font-size:3rem; margin-bottom:10px; opacity:0.3;">🧪</span>
                    <p style="color:#6a5342; font-size:0.85rem; font-style:italic;">Keine Rezeptur ausgewählt</p>
                </div>
            `;
            // Select first by default
            selectRecipe(Object.keys(window.AlchemistShared.RECIPE_DEFS)[0]);
        } else if (currentBookTab === 'trophies') {
            leftContent.innerHTML = `
                <h2 class="book-title"><i class="fa-solid fa-award"></i> Trophäen</h2>
                <p class="book-subtitle">Ein Ehrenkabinett deines Lernfortschritts.</p>
                <div id="book-trophies-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
                </div>
            `;

            let trophiesGrid = leftContent.querySelector('#book-trophies-grid');
            Object.keys(ACHIEVEMENT_DEFS).forEach(key => {
                const def = ACHIEVEMENT_DEFS[key];
                const unlocked = achievements[key];

                const card = document.createElement('div');
                card.style.aspectRatio = '1';
                card.style.borderRadius = '8px';
                card.style.background = unlocked ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0,0,0,0.05)';
                card.style.border = unlocked ? '1px solid rgba(255, 215, 0, 0.25)' : '1px dashed rgba(0,0,0,0.1)';
                card.style.display = 'flex';
                card.style.justifyContent = 'center';
                card.style.alignItems = 'center';
                card.style.fontSize = '1.6rem';
                card.style.cursor = 'pointer';
                card.innerHTML = unlocked ? def.icon : '🔒';
                card.addEventListener('click', () => selectTrophy(key));
                trophiesGrid.appendChild(card);
            });

            rightContent.innerHTML = `
                <h3 class="book-section-title" style="margin-top:0;"><i class="fa-solid fa-award"></i> Trophäen-Logbuch</h3>
                <p class="book-subtitle">Wähle eine Trophäe, um Details anzuzeigen.</p>
                <div id="trophy-detail-pane" style="background: rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.05); padding:15px; border-radius:8px; min-height:220px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
                    <span style="font-size:3rem; margin-bottom:10px; opacity:0.3;">🏆</span>
                    <p style="color:#6a5342; font-size:0.85rem; font-style:italic;">Keine Trophäe ausgewählt</p>
                </div>
            `;
            // Select first by default
            selectTrophy(Object.keys(ACHIEVEMENT_DEFS)[0]);
        } else if (currentBookTab === 'chronicle') {
            leftContent.innerHTML = `
                <h2 class="book-title"><i class="fa-solid fa-scroll"></i> Die Chronik</h2>
                <p class="book-subtitle">Ein Register deiner herausragendsten alchemistischen Erfolge.</p>
                <div style="background: rgba(78, 43, 15, 0.04); border: 1px dashed rgba(78, 43, 15, 0.15); padding: 15px; border-radius: 8px; font-size: 0.82rem; line-height: 1.4; color: #4e2b0f; margin-top: 15px;">
                    <p style="margin-top:0;"><strong>Der Pfad des Reichtums:</strong></p>
                    <p>Jeder Trank, der veredelt wird, und jede Wette, die Früchte trägt, hinterlässt eine magische Signatur in dieser Chronik.</p>
                    <p style="margin-bottom:0;">Nur die Top 10 deiner größten Gewinne werden hier verzeichnet. Strebe nach höheren Multiplikatoren, um deine Taten in Gold einzumeißeln!</p>
                </div>
            `;
            let highscores = JSON.parse(localStorage.getItem('alchemist_highscores')) || [];
            let rowsHtml = '';
            if (highscores.length === 0) {
                rowsHtml = `<tr><td colspan="5" style="text-align:center; font-style:italic; padding: 20px 0;">Noch keine großen Taten verzeichnet.</td></tr>`;
            } else {
                highscores.forEach((entry, index) => {
                    let gameName = GAME_NAMES[entry.game] || entry.game;
                    rowsHtml += `
                        <tr>
                            <td><strong>#${index + 1}</strong></td>
                            <td>${gameName}</td>
                            <td>${entry.bet.toFixed(2)} €</td>
                            <td style="color:#047857;">${entry.mult.toFixed(2)}x</td>
                            <td style="color:#b45309; font-weight:800; text-align:right;">${entry.win.toFixed(2)} €</td>
                        </tr>
                    `;
                });
            }
            rightContent.innerHTML = `
                <h3 class="book-section-title" style="margin-top:0;"><i class="fa-solid fa-scroll"></i> Ehrenhalle</h3>
                <p class="book-subtitle">Deine Top 10 Höchstgewinne.</p>
                <div class="book-table-wrapper" style="max-height: 250px; overflow-y: auto;">
                    <table class="book-stats-table">
                        <thead>
                            <tr>
                                <th>Rang</th>
                                <th>Bereich</th>
                                <th>Einsatz</th>
                                <th>Multiplikator</th>
                                <th style="text-align:right;">Gewinn</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (currentBookTab === 'rivals') {
            leftContent.innerHTML = `
                <h2 class="book-title"><i class="fa-solid fa-ranking-star"></i> Rangliste</h2>
                <p class="book-subtitle">Die ruhmreichsten Alchemisten der Akademie im Vergleich.</p>
                <div style="background: rgba(124, 58, 237, 0.04); border: 1px dashed rgba(124, 58, 237, 0.15); padding: 15px; border-radius: 8px; font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary); margin-top: 15px;">
                    <p style="margin-top:0;"><strong>Die Rangliste des Wissens:</strong></p>
                    <p>Deine Mitstudenten und Meister forschen ununterbrochen. Jedes Mal, wenn du experimentierst, schreiten auch sie voran!</p>
                    <p style="margin-bottom:0;">Steige im Rang auf, indem du dein Guthaben erhöhst und Stufen aufsteigst, um den Rektor Ignatius einzuholen.</p>
                </div>
            `;
            if (window.AlchemistShared && window.AlchemistShared.getRivals) {
                let rivals = [...window.AlchemistShared.getRivals()];
                let playerLevel = parseInt(localStorage.getItem('alchemist_level')) || 1;
                let playerBalance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
                rivals.push({
                    name: "Du (Alchemist)",
                    icon: "🧙‍♂️",
                    level: playerLevel,
                    balance: playerBalance,
                    isPlayer: true
                });
                rivals.sort((a, b) => {
                    if (b.level !== a.level) return b.level - a.level;
                    return b.balance - a.balance;
                });
                let rowsHtml = '';
                rivals.forEach((r, idx) => {
                    let rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''));
                    let rankText = `<span class="rival-rank-badge ${rankClass}">${idx + 1}</span>`;
                    let isPl = r.isPlayer ? 'class="rival-row-player"' : '';
                    rowsHtml += `
                        <tr ${isPl}>
                            <td style="text-align:center;">${rankText}</td>
                            <td><span style="font-size:1.15rem; margin-right:6px;">${r.icon}</span> <strong>${r.name}</strong></td>
                            <td><span class="rival-lvl-tag">Lvl ${r.level}</span></td>
                            <td style="color:var(--color-gold); font-weight:800; text-align:right;">${r.balance.toLocaleString('de-DE', {minimumFractionDigits: 2})} €</td>
                        </tr>
                    `;
                });
                rightContent.innerHTML = `
                    <h3 class="book-section-title" style="margin-top:0;"><i class="fa-solid fa-medal"></i> Bestenliste</h3>
                    <p class="book-subtitle">Sortiert nach Akademie-Stufe und Vermögen.</p>
                    <div class="book-table-wrapper" style="max-height: 290px; overflow-y: auto;">
                        <table class="rivals-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px; text-align:center;">Rang</th>
                                    <th>Alchemist</th>
                                    <th>Stufe</th>
                                    <th style="text-align:right;">Vermögen</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    }

    function selectRecipe(key) {
        const def = window.AlchemistShared.RECIPE_DEFS[key];
        const unlocked = window.AlchemistShared.hasRecipe(key);
        const pane = document.getElementById('recipe-detail-pane');
        if (!pane) return;
        
        pane.innerHTML = `
            <span style="font-size:3.2rem; margin-bottom:10px;">${unlocked ? def.icon : '🔒'}</span>
            <h4 style="font-family:'Cinzel', serif; font-size:1.25rem; color:#4e2b0f; margin-bottom:6px;">${def.title}</h4>
            <p style="font-size:0.82rem; color:#6a5342; margin-bottom:15px; font-weight:600;">"${unlocked ? def.desc : 'Geheimnisvolles Rezept'}"</p>
            <div style="background:${unlocked ? 'rgba(57, 255, 20, 0.06)' : 'rgba(0,0,0,0.05)'}; border: 1px solid ${unlocked ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0,0,0,0.1)'}; padding:10px; border-radius:6px; width:100%;">
                <span style="font-size:0.62rem; font-weight:800; color:${unlocked ? '#047857' : '#374151'}; display:block; margin-bottom:2px;">PERMANENTER SPEZIALBONUS</span>
                <strong style="font-size:0.85rem; color:${unlocked ? '#047857' : '#374151'};">${def.rewardDesc}</strong>
            </div>
        `;
    }

    function selectTrophy(key) {
        const def = ACHIEVEMENT_DEFS[key];
        const unlocked = achievements[key];
        const pane = document.getElementById('trophy-detail-pane');
        if (!pane) return;
        
        pane.innerHTML = `
            <span style="font-size:3.2rem; margin-bottom:10px;">${unlocked ? def.icon : '🔒'}</span>
            <h4 style="font-family:'Cinzel', serif; font-size:1.25rem; color:#4e2b0f; margin-bottom:6px;">${def.title}</h4>
            <p style="font-size:0.82rem; color:#6a5342; margin-bottom:15px; font-weight:600;">${def.desc}</p>
            <div style="background:${unlocked ? 'rgba(255, 215, 0, 0.06)' : 'rgba(0,0,0,0.05)'}; border: 1px solid ${unlocked ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0,0,0,0.1)'}; padding:10px; border-radius:6px; width:100%;">
                <strong style="font-size:0.8rem; color:${unlocked ? '#b45309' : '#374151'};">${unlocked ? '✓ FREIGESCHALTET' : '❌ SPERRE'}</strong>
            </div>
        `;
    }

    function drawBookChart() {
        const canvas = document.getElementById('book-chart');
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width) || 310;
        const displayHeight = Math.round(rect.height) || 130;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = displayWidth;
        const h = displayHeight;

        ctx.clearRect(0, 0, w, h);

        let currentStats = JSON.parse(localStorage.getItem('alchemist_stats')) || {};
        let historyData = (currentStats.global && currentStats.global.balanceHistory) ? [...currentStats.global.balanceHistory] : [1000];
        
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

        // Draw grids (Sepia colored)
        ctx.strokeStyle = 'rgba(78, 43, 15, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            let y = padding + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Fill area (warm sepia gradient)
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding + chartH);
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[points.length - 1].x, padding + chartH);
        ctx.closePath();

        let areaGrad = ctx.createLinearGradient(0, 0, 0, h);
        areaGrad.addColorStop(0, 'rgba(78, 43, 15, 0.12)');
        areaGrad.addColorStop(1, 'rgba(78, 43, 15, 0.0)');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#4e2b0f'; // sepia line
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dots
        points.forEach((p, idx) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fdf5e2';
            ctx.strokeStyle = '#4e2b0f';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
        });
    }

    // --- RESET SYSTEM ---
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm("Möchtest du all deinen Fortschritt in der Akademie unwiderruflich zurücksetzen (Guthaben, XP, Erfolge)?")) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    // --- PORTAL TRANSITIONS ---
    const portalCards = document.querySelectorAll('.portal-card');
    portalCards.forEach(card => {
        const link = card.querySelector('.btn-portal-enter');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            
            const vortex = card.querySelector('.portal-vortex');
            if (vortex) {
                vortex.style.animationDuration = '1s';
                vortex.style.transform = 'scale(4.0)';
            }
            
            document.body.style.transition = 'opacity 0.4s ease';
            document.body.style.opacity = '0';
            
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });

    // Prestige Thesis button click listener
    const btnPrestige = document.getElementById('btn-prestige-action');
    if (btnPrestige) {
        btnPrestige.addEventListener('click', () => {
            if (window.AlchemistShared) {
                window.AlchemistShared.submitThesisPrestige();
            }
        });
    }

    // --- ALCHEMY QUIZ ENGINE (BARNABAS) ---
    const QUIZ_QUESTIONS = [
        {
            q: "Welches Metall wird in der hermetischen Alchemie traditionell dem Planeten Quecksilber zugeordnet?",
            options: ["Blei", "Quecksilber", "Eisen", "Zinn"],
            correct: 1,
            exp: "Quecksilber (Hydrargyrum) ist dem schnellen Götterboten Hermes (lat. Mercurius) zugeordnet."
        },
        {
            q: "Was bewirkt der legendäre Stein der Weisen?",
            options: ["Erschafft ewige Dunkelheit", "Transmutation unedler Metalle in Gold & ewiges Leben", "Verwandelt Wasser in Wein", "Schützt vor Drachenfeuer"],
            correct: 1,
            exp: "Der Stein der Weisen (Lapis Philosophorum) wandelt unedle Metalle in Gold und erzeugt das Elixier des Lebens."
        },
        {
            q: "Welches der vier klassischen Elemente gilt als trocken und warm?",
            options: ["Erde", "Wasser", "Luft", "Feuer"],
            correct: 3,
            exp: "Feuer ist nach der Vier-Elemente-Lehre von Aristoteles warm und trocken."
        },
        {
            q: "Wie bezeichneten Alchemisten das Gemisch aus Salpetersäure und Salzsäure, das Gold auflösen kann?",
            options: ["Königswasser", "Drachenblut", "Vitriol", "Scheidewasser"],
            correct: 0,
            exp: "Königswasser (Aqua Regis) ist eine Säuremischung, die sogar das 'königliche' Gold auflösen kann."
        },
        {
            q: "Wer gilt als der legendäre Begründer der Alchemie und Verfasser der Tabula Smaragdina?",
            options: ["Albertus Magnus", "Isaac Newton", "Hermes Trismegistos", "Paracelsus"],
            correct: 2,
            exp: "Hermes Trismegistos, der dreimal größte Hermes, gilt als Urvater der Alchemie und Hermetik."
        },
        {
            q: "Welcher alchemistische Begriff beschreibt das Große Werk zur Veredelung der Seele und Materie?",
            options: ["Opus Magnum", "Transmutation", "Coagula", "Solve"],
            correct: 0,
            exp: "Das Opus Magnum (Großes Werk) ist die alchemistische Bezeichnung für die Herstellung des Steins der Weisen."
        }
    ];

    function initQuiz() {
        const questionText = document.getElementById('quiz-question-text');
        const optionsContainer = document.getElementById('quiz-options-container');
        const resultBox = document.getElementById('quiz-result-box');
        const questionBox = document.getElementById('quiz-question-box');
        const resultText = document.getElementById('quiz-result-text');
        const expText = document.getElementById('quiz-explanation-text');

        if (!questionText || !optionsContainer || !resultBox || !questionBox) return;

        let lastQuizDate = localStorage.getItem('alchemist_last_quiz_date');
        let todayStr = new Date().toDateString();

        if (lastQuizDate === todayStr) {
            questionBox.style.display = 'none';
            resultBox.style.display = 'block';
            resultText.textContent = "💤 Barnabas ruht sich aus";
            resultText.style.color = 'var(--color-gold)';
            expText.textContent = "Du hast das heutige Quiz bereits absolviert. Komm morgen für neue Fragen wieder!";
            return;
        }

        // Get index based on current date
        let qIdx = new Date().getDate() % QUIZ_QUESTIONS.length;
        const currentQ = QUIZ_QUESTIONS[qIdx];

        questionText.textContent = currentQ.q;
        optionsContainer.innerHTML = '';

        currentQ.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn';
            btn.style.width = '100%';
            btn.style.fontSize = '0.75rem';
            btn.style.padding = '6px';
            btn.style.textAlign = 'left';
            btn.style.background = 'rgba(255, 255, 255, 0.03)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.08)';
            btn.style.color = '#fff';
            btn.textContent = `${idx + 1}. ${opt}`;

            btn.addEventListener('click', () => {
                localStorage.setItem('alchemist_last_quiz_date', todayStr);
                questionBox.style.display = 'none';
                resultBox.style.display = 'block';

                if (idx === currentQ.correct) {
                    balance += 100.00;
                    localStorage.setItem('alchemist_balance', balance.toFixed(2));
                    if (window.AlchemistShared) {
                        window.AlchemistShared.addXP(250);
                    }
                    updateHUD();

                    resultText.textContent = "✅ Richtig geantwortet!";
                    resultText.style.color = 'var(--color-green)';
                    expText.innerHTML = `Ausgezeichnet! +100,00 € & +250 XP erhalten.<br><br>${currentQ.exp}`;
                    if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                        window.AlchemistShared.playProceduralSound('win_fanfare');
                    }
                } else {
                    resultText.textContent = "❌ Falsche Antwort!";
                    resultText.style.color = 'var(--color-danger)';
                    expText.innerHTML = `Leider falsch. Barnabas schüttelt enttäuscht den Kopf.<br><br><strong>Erklärung:</strong> ${currentQ.exp}`;
                }
            });

            optionsContainer.appendChild(btn);
        });
    }

    // --- LOBBY TAB NAVIGATION ---
    const navPortalsBtn = document.getElementById('lobby-nav-portals');
    const navMarketBtn = document.getElementById('lobby-nav-market');
    const navGardenBtn = document.getElementById('lobby-nav-garden');
    const navGuildBtn = document.getElementById('lobby-nav-guild');
    const navExpeditionsBtn = document.getElementById('lobby-nav-expeditions');
    const navCampaignBtn = document.getElementById('lobby-nav-campaign');
    const navHomunculusBtn = document.getElementById('lobby-nav-homunculus');
    const navTournamentBtn = document.getElementById('lobby-nav-tournament');

    const panePortals = document.getElementById('tab-pane-portals');
    const paneMarket = document.getElementById('tab-pane-market');
    const paneGarden = document.getElementById('tab-pane-garden');
    const paneGuild = document.getElementById('tab-pane-guild');
    const paneExpeditions = document.getElementById('tab-pane-expeditions');
    const paneCampaign = document.getElementById('tab-pane-campaign');
    const paneHomunculus = document.getElementById('tab-pane-homunculus');
    const paneTournament = document.getElementById('tab-pane-tournament');

    function switchTab(targetPane, targetBtn) {
        [panePortals, paneMarket, paneGarden, paneGuild, paneExpeditions, paneCampaign, paneHomunculus, paneTournament].forEach(p => { if (p) p.classList.add('hidden'); });
        [navPortalsBtn, navMarketBtn, navGardenBtn, navGuildBtn, navExpeditionsBtn, navCampaignBtn, navHomunculusBtn, navTournamentBtn].forEach(b => { if (b) b.classList.remove('active'); });

        if (targetPane) targetPane.classList.remove('hidden');
        if (targetBtn) targetBtn.classList.add('active');

        if (targetPane === paneGarden) renderGardenUI();
        if (targetPane === paneGuild) renderGuildsUI();
        if (targetPane === paneExpeditions) renderExpeditionsTabUI();
        if (targetPane === paneCampaign) renderCampaignUI();
        if (targetPane === paneHomunculus) renderHomunculusUI();
        if (targetPane === paneTournament) renderTournamentUI();
    }

    if (navPortalsBtn) navPortalsBtn.addEventListener('click', () => switchTab(panePortals, navPortalsBtn));
    if (navMarketBtn) navMarketBtn.addEventListener('click', () => switchTab(paneMarket, navMarketBtn));
    if (navGardenBtn) navGardenBtn.addEventListener('click', () => switchTab(paneGarden, navGardenBtn));
    if (navGuildBtn) navGuildBtn.addEventListener('click', () => switchTab(paneGuild, navGuildBtn));
    if (navExpeditionsBtn) navExpeditionsBtn.addEventListener('click', () => switchTab(paneExpeditions, navExpeditionsBtn));
    if (navCampaignBtn) navCampaignBtn.addEventListener('click', () => switchTab(paneCampaign, navCampaignBtn));
    if (navHomunculusBtn) navHomunculusBtn.addEventListener('click', () => switchTab(paneHomunculus, navHomunculusBtn));
    if (navTournamentBtn) navTournamentBtn.addEventListener('click', () => switchTab(paneTournament, navTournamentBtn));

    // Jukebox Selector Listener
    const jukeboxSelect = document.getElementById('jukebox-select-track');
    if (jukeboxSelect) {
        jukeboxSelect.addEventListener('change', (e) => {
            if (window.AlchemistShared) window.AlchemistShared.setJukeboxTrack(parseInt(e.target.value));
        });
    }

    function updateHomunculusHUD() {
        if (!window.AlchemistShared) return;
        const state = window.AlchemistShared.getHomunculusState();
        const types = window.AlchemistShared.HOMUNCULUS_TYPES;
        const iconEl = document.getElementById('homunculus-avatar-icon');
        const nameEl = document.getElementById('homunculus-name-label');
        const lvlEl = document.getElementById('homunculus-level-label');

        let def = types[state.type] || types.egg;
        if (iconEl) iconEl.textContent = def.icon;
        if (nameEl) nameEl.textContent = state.hatched ? state.name : 'Homunculus-Ei';
        if (lvlEl) lvlEl.textContent = state.hatched ? `Stufe ${state.level}` : 'Ei im Kessel';
    }

    function renderCampaignUI() {
        const container = document.getElementById('campaign-chapters-container');
        if (!container || !window.AlchemistShared) return;

        const chapters = window.AlchemistShared.CAMPAIGN_CHAPTERS;
        const state = window.AlchemistShared.getCampaignState();

        container.innerHTML = '';
        chapters.forEach(ch => {
            let isCurrent = state.currentChapter === ch.id;
            let isClaimed = state.claimedChapters.includes(ch.id);
            let isCompleted = isCurrent && state.progress >= ch.target;

            let percent = isClaimed ? 100 : (isCurrent ? Math.min(100, Math.floor((state.progress / ch.target) * 100)) : 0);

            const card = document.createElement('div');
            card.className = `chapter-card ${isCurrent ? 'active' : ''} ${isClaimed ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="chapter-icon-badge">${ch.icon}</div>
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h4 style="margin:0; font-family:'Cinzel',serif; color:var(--color-gold); font-size:1rem;">${ch.title}</h4>
                        <span style="font-size:0.7rem; color:var(--text-secondary);">(${ch.npc})</span>
                    </div>
                    <p style="margin:4px 0 8px 0; font-size:0.8rem; color:var(--text-primary);">${ch.desc}</p>
                    <div style="background:rgba(0,0,0,0.1); height:8px; border-radius:4px; overflow:hidden;">
                        <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, var(--color-gold), var(--color-purple));"></div>
                    </div>
                </div>
                <button type="button" class="btn" style="padding:10px 16px; font-weight:800; font-size:0.75rem; background:${isClaimed ? 'rgba(22,163,74,0.15)' : (isCompleted ? 'var(--color-green)' : 'rgba(0,0,0,0.05)')}; color:${isClaimed ? 'var(--color-green)' : '#fff'};" ${!isCompleted || isClaimed ? 'disabled' : ''}>
                    ${isClaimed ? '✓ ABGESCHLOSSEN' : (isCompleted ? '🎁 ABHOLEN' : `${state.progress}/${ch.target}`)}
                </button>
            `;

            if (isCompleted && !isClaimed) {
                card.querySelector('button').addEventListener('click', () => {
                    if (window.AlchemistShared.claimCampaignChapter(ch.id)) {
                        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                        updateHUD();
                        renderCampaignUI();
                    }
                });
            }

            container.appendChild(card);
        });
    }

    function renderHomunculusUI() {
        const container = document.getElementById('homunculus-main-card');
        if (!container || !window.AlchemistShared) return;

        const state = window.AlchemistShared.getHomunculusState();
        const types = window.AlchemistShared.HOMUNCULUS_TYPES;
        let def = types[state.type] || types.egg;

        if (!state.hatched) {
            container.innerHTML = `
                <div style="font-size:4rem;">🥚</div>
                <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--color-gold);">Wähle das Element deines Homunculus</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); max-width:450px;">Das Ei brütet im Kessel. Wähle eine elementare Essenz, um deinen Gefährten mit einzigartigen Boni auszubrüten:</p>
                <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
                    <button type="button" class="btn btn-hatch" data-elem="fire" style="background:rgba(239,68,68,0.15); border-color:#ef4444; color:#ef4444; font-weight:800;">🦎 Feuer (+10% Arena DMG)</button>
                    <button type="button" class="btn btn-hatch" data-elem="ice" style="background:rgba(6,182,212,0.15); border-color:#06b6d4; color:#06b6d4; font-weight:800;">🧊 Eis (-10% Kessel Instab.)</button>
                    <button type="button" class="btn btn-hatch" data-elem="aether" style="background:rgba(124,58,237,0.15); border-color:#7c3aed; color:#7c3aed; font-weight:800;">🦚 Äther (+5% Verlust-Cashback)</button>
                    <button type="button" class="btn btn-hatch" data-elem="earth" style="background:rgba(16,185,129,0.15); border-color:#10b981; color:#10b981; font-weight:800;">🗿 Erde (+20% Garten-Tempo)</button>
                </div>
            `;

            container.querySelectorAll('.btn-hatch').forEach(b => {
                b.addEventListener('click', () => {
                    let elem = b.getAttribute('data-elem');
                    window.AlchemistShared.hatchHomunculus(elem);
                    updateHomunculusHUD();
                    renderHomunculusUI();
                });
            });
        } else {
            let targetXP = state.level * 100;
            let percent = Math.min(100, Math.floor((state.xp / targetXP) * 100));

            container.innerHTML = `
                <div class="homunculus-avatar" style="font-size:4.5rem;">${def.icon}</div>
                <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--color-gold);">${state.name} (${def.name})</h3>
                <span style="font-size:0.8rem; font-weight:800; color:var(--color-purple); background:rgba(124,58,237,0.1); padding:4px 12px; border-radius:20px;">
                    Stufe ${state.level} • Perk: ${def.perk}
                </span>

                <div style="width:100%; max-width:320px; margin-top:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                        <span>Erfahrung</span>
                        <span>${state.xp} / ${targetXP} XP</span>
                    </div>
                    <div style="background:rgba(0,0,0,0.1); height:10px; border-radius:5px; overflow:hidden;">
                        <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #7c3aed, #ffd700);"></div>
                    </div>
                </div>

                <h4 style="margin:15px 0 8px 0; font-family:'Cinzel',serif; font-size:0.9rem; color:var(--text-secondary);">Gefährten füttern</h4>
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                    <button type="button" class="btn btn-feed" data-ing="sulfur" style="font-size:0.75rem;">🜎 Schwefel (+25 XP)</button>
                    <button type="button" class="btn btn-feed" data-ing="quicksilver" style="font-size:0.75rem;">☿ Quecksilber (+35 XP)</button>
                    <button type="button" class="btn btn-feed" data-ing="mandrake" style="font-size:0.75rem;">🌱 Alraune (+60 XP)</button>
                    <button type="button" class="btn btn-feed" data-ing="dragon_blood" style="font-size:0.75rem;">🩸 Drachenblut (+120 XP)</button>
                </div>
            `;

            container.querySelectorAll('.btn-feed').forEach(b => {
                b.addEventListener('click', () => {
                    let ingId = b.getAttribute('data-ing');
                    window.AlchemistShared.feedHomunculus(ingId);
                    updateHomunculusHUD();
                    renderHomunculusUI();
                });
            });
        }
    }

    function renderTournamentUI() {
        const container = document.getElementById('tournament-standings-container');
        if (!container || !window.AlchemistShared) return;

        const state = window.AlchemistShared.getTournamentState();
        let remainMs = state.endsAt - Date.now();
        let days = Math.floor(remainMs / (24 * 3600 * 1000));
        let hours = Math.floor((remainMs % (24 * 3600 * 1000)) / (3600 * 1000));

        let standings = [
            { name: "Du (Spieler)", points: state.points, icon: "👑", isPlayer: true },
            ...state.rivals
        ];
        standings.sort((a, b) => b.points - a.points);

        let tableRows = standings.map((s, idx) => `
            <tr style="${s.isPlayer ? 'background:rgba(124,58,237,0.1); font-weight:800;' : ''}">
                <td style="padding:10px;">#${idx + 1}</td>
                <td style="padding:10px;">${s.icon} ${s.name}</td>
                <td style="padding:10px; text-align:right; color:var(--color-gold); font-weight:800;">${s.points} Pkt</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div>
                    <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--color-gold);">Wochen-Saison #12</h3>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">Endet in: ${days} Tage ${hours} Std.</span>
                </div>
                <div style="font-size:0.85rem; font-weight:800; color:var(--color-purple);">Deine Punkte: ${state.points} Pkt</div>
            </div>
            <table class="rivals-table">
                <thead>
                    <tr><th>Rang</th><th>Alchemist</th><th style="text-align:right;">Turnierpunkte</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    }

    updateHomunculusHUD();

    function renderExpeditionsTabUI() {
        renderRelicsUI();
        renderExpeditionsUI();
        renderWorkbenchUI();
        renderAuctionsUI();
    }

    function renderRelicsUI() {
        const slotsContainer = document.getElementById('relics-slots-container');
        const invContainer = document.getElementById('relics-inventory-container');
        if (!slotsContainer || !invContainer || !window.AlchemistShared) return;

        const defs = window.AlchemistShared.RELIC_DEFS;
        const owned = window.AlchemistShared.getOwnedRelics();
        const equipped = window.AlchemistShared.getEquippedRelics();

        slotsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            let relId = equipped[i];
            let def = relId ? defs[relId] : null;
            const slot = document.createElement('div');
            slot.className = `relic-slot ${def ? 'filled' : ''}`;
            slot.innerHTML = def ? `<span class="relic-icon">${def.icon}</span><span class="relic-name-tag">${def.name}</span>` : `<span style="font-size:1.2rem; color:#a99ec6;">+</span>`;
            if (def) {
                slot.title = `Klick zum Ablegen: ${def.name}`;
                slot.addEventListener('click', () => {
                    window.AlchemistShared.unequipRelic(relId);
                    renderRelicsUI();
                });
            }
            slotsContainer.appendChild(slot);
        }

        invContainer.innerHTML = '';
        owned.forEach(id => {
            let def = defs[id];
            if (!def) return;
            let isEq = equipped.includes(id);
            const card = document.createElement('div');
            card.className = `relic-item-card ${isEq ? 'equipped' : ''}`;
            card.innerHTML = `
                <span style="font-size:2rem;">${def.icon}</span>
                <div style="flex:1;">
                    <h4 style="margin:0 0 2px 0; font-family:'Cinzel',serif; font-size:0.9rem; color:var(--color-gold);">${def.name}</h4>
                    <p style="margin:0; font-size:0.72rem; color:var(--text-secondary);">${def.desc}</p>
                </div>
                <button type="button" class="btn" style="font-size:0.7rem; padding:4px 8px; background:${isEq ? 'rgba(124,58,237,0.2)' : 'var(--color-gold)'}; color:${isEq ? '#7c3aed' : '#000'}; font-weight:800;">
                    ${isEq ? 'AUSGERÜSTET' : 'AUSRÜSTEN'}
                </button>
            `;
            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (isEq) {
                    window.AlchemistShared.unequipRelic(id);
                } else {
                    window.AlchemistShared.equipRelic(id);
                }
                renderRelicsUI();
            });
            invContainer.appendChild(card);
        });
    }

    function renderExpeditionsUI() {
        const container = document.getElementById('expeditions-container');
        if (!container || !window.AlchemistShared) return;

        const defs = window.AlchemistShared.EXPEDITION_DEFS;
        const current = window.AlchemistShared.getExpeditionState();

        container.innerHTML = '';
        Object.keys(defs).forEach(id => {
            let def = defs[id];
            let isCurrent = current && current.type === id;
            let isReady = false;
            let percent = 0;
            let statusText = `${Math.floor(def.durationMs / 60000)} Min. Dauer`;

            if (isCurrent) {
                let elapsed = Date.now() - current.startTime;
                percent = Math.min(100, Math.floor((elapsed / current.durationMs) * 100));
                if (elapsed >= current.durationMs) {
                    isReady = true;
                    statusText = "✅ ABGESCHLOSSEN!";
                } else {
                    let remainSec = Math.ceil((current.durationMs - elapsed) / 1000);
                    statusText = `⏳ Verbleibend: ${Math.floor(remainSec / 60)}m ${remainSec % 60}s`;
                }
            }

            const card = document.createElement('div');
            card.className = `expedition-card ${isCurrent ? (isReady ? 'ready' : 'running') : ''}`;
            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:2.2rem;">${def.icon}</span>
                    <div>
                        <h4 style="margin:0 0 2px 0; font-family:'Cinzel',serif; font-size:0.95rem; color:var(--color-gold);">${def.name}</h4>
                        <p style="margin:0; font-size:0.72rem; color:var(--text-secondary);">${def.desc}</p>
                    </div>
                </div>
                <div style="font-size:0.75rem; font-weight:700; color:${isReady ? 'var(--color-green)' : 'var(--color-purple)'};">${statusText}</div>
                <div class="expedition-timer-bar">
                    <div class="expedition-timer-fill" style="width:${percent}%;"></div>
                </div>
                <button type="button" class="btn" style="width:100%; font-weight:800; font-size:0.75rem; background:${isReady ? 'var(--color-green)' : (isCurrent ? 'rgba(0,0,0,0.1)' : 'linear-gradient(135deg, #0891b2, #7c3aed)')}; color:#fff;" ${isCurrent && !isReady ? 'disabled' : ''}>
                    ${isReady ? '🎁 BELOHNUNG ABHOLEN' : (isCurrent ? 'EXPEDITION LÄUFT...' : '🚀 EXPEDITION STARTEN')}
                </button>
            `;

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (isReady) {
                    window.AlchemistShared.claimExpeditionReward();
                } else if (!isCurrent) {
                    window.AlchemistShared.startExpedition(id);
                }
                renderExpeditionsUI();
            });

            container.appendChild(card);
        });
    }

    function renderWorkbenchUI() {
        const container = document.getElementById('workbench-container');
        if (!container || !window.AlchemistShared) return;

        const defs = window.AlchemistShared.WORKBENCH_DEFS;
        const curLvl = window.AlchemistShared.getWorkbenchLevel();
        const curDef = defs[curLvl - 1];
        const nextDef = defs[curLvl];

        container.innerHTML = `
            <div style="font-size:3rem;">🔨</div>
            <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--color-gold);">${curDef.name}</h3>
                    <span class="workbench-level-badge">Stufe ${curDef.level}</span>
                </div>
                <p style="margin:4px 0 0 0; font-size:0.8rem; color:var(--text-secondary);">Bonus: <strong>${curDef.bonusDesc}</strong></p>
                ${nextDef ? `<p style="margin:2px 0 0 0; font-size:0.72rem; color:var(--color-purple);">Nächste Stufe (${nextDef.name}): ${nextDef.bonusDesc}</p>` : ''}
            </div>
            ${nextDef ? `
                <button type="button" class="btn" id="btn-upgrade-workbench" style="background:linear-gradient(135deg, #ffd700, #ff8c00); color:#000; font-weight:800; padding:10px 16px;">
                    AUFWERTEN (${nextDef.cost}€)
                </button>
            ` : `<span style="font-weight:800; color:var(--color-green);">MAX STUFE</span>`}
        `;

        const btnUp = document.getElementById('btn-upgrade-workbench');
        if (btnUp) {
            btnUp.addEventListener('click', () => {
                if (window.AlchemistShared.upgradeWorkbench()) {
                    balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                    updateHUD();
                    renderWorkbenchUI();
                }
            });
        }
    }

    function renderAuctionsUI() {
        const container = document.getElementById('auctions-container');
        if (!container || !window.AlchemistShared) return;

        const auctions = window.AlchemistShared.getAuctions();
        container.innerHTML = '';

        auctions.forEach(auc => {
            const card = document.createElement('div');
            card.className = 'auction-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0; font-family:'Cinzel',serif; font-size:0.9rem; color:var(--color-gold);">${auc.name}</h4>
                    <span style="font-size:0.7rem; font-weight:800; color:${auc.ended ? 'var(--color-green)' : 'var(--color-purple)'};">${auc.ended ? 'BEENDET' : 'AKTIV'}</span>
                </div>
                <p style="margin:0; font-size:0.75rem; color:var(--text-secondary);">Höchstgebot: <strong>${auc.topBid.toFixed(2)} €</strong> (${auc.topBidder})</p>
                ${!auc.ended ? `
                    <div class="auction-bid-row">
                        <input type="number" id="auc-bid-val-${auc.id}" min="${auc.topBid + 10}" value="${auc.topBid + 25}" step="5">
                        <button type="button" class="btn btn-bid-${auc.id}" style="background:var(--color-purple); color:#fff; font-weight:800; font-size:0.75rem;">
                            GEBOT ABGEBEN
                        </button>
                    </div>
                ` : `<div style="font-size:0.72rem; color:var(--color-green); font-weight:700;">Gewonnen von ${auc.topBidder}!</div>`}
            `;

            if (!auc.ended) {
                card.querySelector(`.btn-bid-${auc.id}`).addEventListener('click', () => {
                    const input = document.getElementById(`auc-bid-val-${auc.id}`);
                    if (input) {
                        let amount = parseFloat(input.value);
                        if (window.AlchemistShared.placeAuctionBid(auc.id, amount)) {
                            balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
                            updateHUD();
                            renderAuctionsUI();
                        }
                    }
                });
            }

            container.appendChild(card);
        });
    }

    // --- RENDER GARDEN UI ---
    function renderGardenUI() {
        const container = document.getElementById('garden-pots-container');
        if (!container || !window.AlchemistShared || !window.AlchemistShared.getGardenState) return;

        const gardenState = window.AlchemistShared.getGardenState();
        const ingDefs = window.AlchemistShared.INGREDIENT_DEFS;
        container.innerHTML = '';

        gardenState.forEach((pot, idx) => {
            const card = document.createElement('div');
            card.style.cssText = "background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; text-align: center;";

            if (pot.seed === null) {
                card.innerHTML = `
                    <div style="font-size:2.5rem; margin-bottom:8px;">🪴</div>
                    <h4 style="margin:0 0 6px 0; font-family:'Cinzel', serif; font-size:1rem; color:#a99ec6;">Topf ${idx+1} (Leer)</h4>
                    <p style="font-size:0.75rem; color:#6b7280; margin-bottom:12px;">Pflanze einen Samen, um Zutaten zu züchten.</p>
                    <select id="seed-select-${idx}" class="bet-input-field" style="width:100%; margin-bottom:8px; font-size:0.75rem; padding:4px;">
                        <option value="sulfur"> Schwefel-Samen (4 Rnd)</option>
                        <option value="quicksilver">☿ Quecksilber-Samen (6 Rnd)</option>
                        <option value="mandrake">🌱 Alraunen-Samen (8 Rnd)</option>
                        <option value="dragon_blood">🩸 Drachenblut-Samen (12 Rnd)</option>
                    </select>
                    <button type="button" class="btn" id="btn-plant-${idx}" style="width:100%; font-size:0.75rem; background:var(--color-gold); color:#000; font-weight:800;">
                        🌱 Pflanzen
                    </button>
                `;
            } else {
                const isReady = pot.progress >= pot.target;
                const percent = Math.min(100, Math.floor((pot.progress / pot.target) * 100));
                const ingDef = ingDefs[pot.seed] || { name: pot.seed, icon: '🌿' };

                card.innerHTML = `
                    <div style="font-size:2.5rem; margin-bottom:8px;">${isReady ? '🌺' : '🌱'}</div>
                    <h4 style="margin:0 0 4px 0; font-family:'Cinzel', serif; font-size:1rem; color:#ffd700;">${ingDef.name}</h4>
                    <div style="font-size:0.72rem; color:#a99ec6; margin-bottom:10px;">Status: ${isReady ? '<strong style="color:var(--color-green);">Erntebereit!</strong>' : `${pot.progress} / ${pot.target} Runden`}</div>
                    <div style="background:rgba(0,0,0,0.3); height:8px; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                        <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #10b981, #34d399);"></div>
                    </div>
                    <button type="button" class="btn ${isReady ? 'btn-success' : ''}" id="btn-harvest-${idx}" ${!isReady ? 'disabled' : ''} style="width:100%; font-size:0.75rem; font-weight:800;">
                        ${isReady ? '🌾 ERNTEN' : 'Wachsen...'}
                    </button>
                `;
            }

            container.appendChild(card);

            const btnPlant = document.getElementById(`btn-plant-${idx}`);
            if (btnPlant) {
                btnPlant.addEventListener('click', () => {
                    const sel = document.getElementById(`seed-select-${idx}`);
                    if (sel) {
                        window.AlchemistShared.plantSeed(idx, sel.value);
                        renderGardenUI();
                    }
                });
            }

            const btnHarvest = document.getElementById(`btn-harvest-${idx}`);
            if (btnHarvest) {
                btnHarvest.addEventListener('click', () => {
                    window.AlchemistShared.harvestGardenPot(idx);
                    renderGardenUI();
                });
            }
        });
    }

    // --- RENDER GUILDS UI ---
    function renderGuildsUI() {
        const container = document.getElementById('guilds-selection-container');
        if (!container || !window.AlchemistShared || !window.AlchemistShared.GUILD_DEFS) return;

        const guilds = window.AlchemistShared.GUILD_DEFS;
        const currentGuild = window.AlchemistShared.getGuildState();
        const level = parseInt(localStorage.getItem('alchemist_level')) || 1;

        container.innerHTML = '';

        Object.keys(guilds).forEach(guildId => {
            const g = guilds[guildId];
            const isJoined = currentGuild === guildId;

            const card = document.createElement('div');
            card.style.cssText = `background: rgba(255,255,255,0.03); border: 1.5px solid ${isJoined ? g.color : 'rgba(255,255,255,0.08)'}; border-radius: 10px; padding: 18px; text-align: center; position: relative; ${isJoined ? 'box-shadow: 0 0 15px ' + g.color + '40;' : ''}`;

            card.innerHTML = `
                <div style="font-size:3rem; margin-bottom:10px;">${g.icon}</div>
                <h3 style="margin:0 0 8px 0; font-family:'Cinzel', serif; font-size:1.1rem; color:${g.color};">${g.name}</h3>
                <p style="font-size:0.8rem; color:#a99ec6; margin-bottom:15px; min-height:40px;">${g.desc}</p>
                <button type="button" class="btn" id="btn-guild-select-${guildId}" ${isJoined || level < 5 ? 'disabled' : ''} style="width:100%; font-size:0.8rem; background:${isJoined ? g.color : 'rgba(255,255,255,0.1)'}; color:${isJoined ? '#000' : '#fff'}; font-weight:800;">
                    ${isJoined ? '✓ GILDE BEIGETRETEN' : (level < 5 ? '🔒 BENÖTIGT STUFE 5' : '🛡️ GILDE WÄHLEN')}
                </button>
            `;

            container.appendChild(card);

            const btnSel = document.getElementById(`btn-guild-select-${guildId}`);
            if (btnSel && !isJoined && level >= 5) {
                btnSel.addEventListener('click', () => {
                    window.AlchemistShared.selectGuild(guildId);
                    renderGuildsUI();
                });
            }
        });
    }

    // Run Initializations
    initParticles();
    updateHUD();
    checkBankruptcy();
    renderTrophies();
    renderQuests();
    initQuiz();
    setTimeout(drawChart, 100);
});

