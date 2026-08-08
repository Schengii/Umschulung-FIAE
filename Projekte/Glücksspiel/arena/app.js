/* ==========================================================================
   ALCHEMISTEN-GOLD: ARENA GAME ENGINE (arena/app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
    let level = parseInt(localStorage.getItem('alchemist_level')) || 1;
    let equippedTheme = localStorage.getItem('alchemist_theme') || 'default';

    // Combat State
    let isCombatActive = false;
    let playerHP = 100;
    let playerMaxHP = 100;
    let playerMP = 50;
    let playerMaxMP = 50;
    let playerBuffs = { hermes: 0, fortuna: 0, aegis: false };

    let enemyHP = 100;
    let enemyMaxHP = 100;
    let enemyName = "";
    let enemyAvatar = "👾";
    let enemyAttack = 10;
    let enemyWeakness = ""; // fire, earth, etc.
    let enemyLoot = ""; // sulfur, quicksilver, mandrake, dragon_blood
    let enemyLootName = "";
    let enemyDebuffs = { windStun: false };
    let monsterMultiplier = 1.8;

    let entryFee = 15.00;

    // UI elements
    const balAmountEl = document.getElementById('balance-amount');
    const xpLvlNumEl = document.getElementById('xp-level-num');
    const xpCurValEl = document.getElementById('xp-current-val');
    const xpTarValEl = document.getElementById('xp-target-val');
    const xpBarFillEl = document.getElementById('xp-bar-fill');

    const betInput = document.getElementById('bet-input');
    const btnStartFight = document.getElementById('btn-start-fight');
    const entryFeeSection = document.getElementById('entry-fee-section');
    const combatActionsSection = document.getElementById('combat-actions-section');

    const enemyCard = document.getElementById('enemy-card');
    const enemyAvatarEl = document.getElementById('enemy-avatar');
    const enemyNameEl = document.getElementById('enemy-name');
    const enemyHpText = document.getElementById('enemy-hp-text');
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    const enemyBuffsEl = document.getElementById('enemy-buffs');

    const playerCard = document.getElementById('player-card');
    const playerHpText = document.getElementById('player-hp-text');
    const playerHpBar = document.getElementById('player-hp-bar');
    const playerMpText = document.getElementById('player-mp-text');
    const playerMpBar = document.getElementById('player-mp-bar');
    const playerBuffsEl = document.getElementById('player-buffs');

    const arenaOverlay = document.getElementById('arena-overlay');
    const arenaOverlayTitle = document.getElementById('arena-overlay-title');
    const arenaOverlaySubtitle = document.getElementById('arena-overlay-subtitle');
    const combatLog = document.getElementById('combat-log');
    
    // Potions & Spells buttons
    const btnAttack = document.getElementById('btn-attack');
    const btnSpellFire = document.getElementById('btn-spell-fire');
    const btnSpellEarth = document.getElementById('btn-spell-earth');
    const btnSpellWind = document.getElementById('btn-spell-wind');
    const btnSpellIce = document.getElementById('btn-spell-ice');
    const combatPotionInventory = document.getElementById('combat-potion-inventory');
    const btnFlee = document.getElementById('btn-flee');

    // Stats
    const statBattles = document.getElementById('stat-battles');
    const statWins = document.getElementById('stat-wins');
    const statWinrate = document.getElementById('stat-winrate');
    const lootStatsContainer = document.getElementById('loot-stats-container');

    // Preset buttons
    const btnMin = document.getElementById('btn-bet-min');
    const btnHalf = document.getElementById('btn-bet-half');
    const btnDouble = document.getElementById('btn-bet-double');
    const btnMax = document.getElementById('btn-bet-max');

    // Apply global themes
    if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
        window.AlchemistShared.applyCurrentTheme();
    }

    // Initialize UI
    syncStats();
    loadArenaStats();

    // Set presets listeners
    if (btnMin) btnMin.addEventListener('click', () => { betInput.value = "5.00"; });
    if (btnHalf) btnHalf.addEventListener('click', () => { betInput.value = Math.max(5.00, Math.floor(parseFloat(betInput.value) / 2)).toFixed(2); });
    if (btnDouble) btnDouble.addEventListener('click', () => { betInput.value = Math.min(250.00, parseFloat(betInput.value) * 2).toFixed(2); });
    if (btnMax) btnMax.addEventListener('click', () => { betInput.value = "250.00"; });

    if (btnStartFight) {
        btnStartFight.addEventListener('click', startCombat);
    }

    // --- SYNC STATS ---
    function syncStats() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 0;
        xp = parseInt(localStorage.getItem('alchemist_xp')) || 0;
        level = parseInt(localStorage.getItem('alchemist_level')) || 1;

        if (balAmountEl) balAmountEl.textContent = balance.toFixed(2);
        if (xpLvlNumEl) xpLvlNumEl.textContent = level;
        if (xpCurValEl) xpCurValEl.textContent = xp;
        
        let targetXP = level * 500;
        if (xpTarValEl) xpTarValEl.textContent = targetXP;
        if (xpBarFillEl) {
            let pct = Math.min(100, (xp / targetXP) * 100);
            xpBarFillEl.style.width = pct + "%";
        }
    }

    // --- LOOT & ARENA STATS ---
    function loadArenaStats() {
        let stats = JSON.parse(localStorage.getItem('alchemist_arena_stats')) || { battles: 0, wins: 0, loot: { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 } };
        if (statBattles) statBattles.textContent = stats.battles;
        if (statWins) statWins.textContent = stats.wins;
        if (statWinrate) {
            let rate = stats.battles > 0 ? Math.round((stats.wins / stats.battles) * 100) : 0;
            statWinrate.textContent = rate + "%";
        }

        if (lootStatsContainer) {
            lootStatsContainer.innerHTML = `
                <div class="loot-stat-badge"><span>🌋</span> <strong>${stats.loot.sulfur || 0}</strong></div>
                <div class="loot-stat-badge"><span>💧</span> <strong>${stats.loot.quicksilver || 0}</strong></div>
                <div class="loot-stat-badge"><span>🌱</span> <strong>${stats.loot.mandrake || 0}</strong></div>
                <div class="loot-stat-badge"><span>🐉</span> <strong>${stats.loot.dragon_blood || 0}</strong></div>
            `;
        }
    }

    function saveArenaLoot(lootKey) {
        let stats = JSON.parse(localStorage.getItem('alchemist_arena_stats')) || { battles: 0, wins: 0, loot: { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 } };
        stats.battles++;
        stats.wins++;
        stats.loot[lootKey] = (stats.loot[lootKey] || 0) + 1;
        localStorage.setItem('alchemist_arena_stats', JSON.stringify(stats));

        // Add to global ingredients
        if (window.AlchemistShared && window.AlchemistShared.getIngredients) {
            let ing = window.AlchemistShared.getIngredients();
            ing[lootKey] = (ing[lootKey] || 0) + 1;
            localStorage.setItem('alchemist_ingredients', JSON.stringify(ing));
        }
        loadArenaStats();
    }

    function saveArenaLoss() {
        let stats = JSON.parse(localStorage.getItem('alchemist_arena_stats')) || { battles: 0, wins: 0, loot: { sulfur: 0, quicksilver: 0, mandrake: 0, dragon_blood: 0 } };
        stats.battles++;
        localStorage.setItem('alchemist_arena_stats', JSON.stringify(stats));
        loadArenaStats();
    }

    // --- COMBAT INITIATION ---
    function startCombat() {
        let baseFee = parseFloat(betInput.value) || 15.00;
        let discount = 1.0;
        const unlockedThemes = JSON.parse(localStorage.getItem('alchemist_unlocked_themes')) || ['default'];
        if (unlockedThemes.includes('ice')) {
            discount = 0.85; // 15% discount for ice chalice theme owners
        }
        entryFee = baseFee * discount;

        if (balance < entryFee) {
            if (window.AlchemistShared && window.AlchemistShared.showToast) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            }
            return;
        }

        // Deduct entry fee
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-entryFee);
        } else {
            balance -= entryFee;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }
        syncStats();

        // Music intensity raised for fight
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.7, 95);
        }

        // Generate Monster
        generateMonster(entryFee);

        // Player initial state
        playerHP = 100;
        playerMP = 50;
        playerBuffs = { hermes: 0, fortuna: 0, aegis: false };
        enemyDebuffs = { windStun: false, frozen: false };

        // Hide/show ice spell
        let spells = (window.AlchemistShared && window.AlchemistShared.getArenaSpells) ? window.AlchemistShared.getArenaSpells() : { fire: 1, earth: 1, wind: 1, iceUnlocked: false };
        if (btnSpellIce) {
            btnSpellIce.style.display = spells.iceUnlocked ? 'block' : 'none';
        }

        isCombatActive = true;

        // Hide overlay, toggle controls
        arenaOverlay.classList.add('hidden');
        entryFeeSection.classList.add('hidden');
        combatActionsSection.classList.remove('hidden');

        // Clear log
        let discountText = discount < 1.0 ? " (inkl. 15% Rabatt durch Eis-Kelch-Upgrade!)" : "";
        combatLog.innerHTML = `<div class="log-entry system"><i class="fa-solid fa-swords"></i> Kampf begonnen! Du hast ${entryFee.toFixed(2)} € Teilnahme-Gebühr${discountText} bezahlt.</div>`;
        addLogEntry(`Ein wildes ${enemyName} (HP: ${enemyHP}) versperrt den Weg!`, 'enemy');

        updateCombatUI();
    }

    function generateMonster(fee) {
        const stageSelect = document.getElementById('arena-stage-select');
        const stage = stageSelect ? parseInt(stageSelect.value) : 1;

        const monsters = {
            1: { name: "Garten-Schleim", avatar: "🟢", hpMultiplier: 1.0, attackMultiplier: 0.08, weakness: "fire", loot: "sulfur", lootName: "Schwefel", mult: 1.5 },
            2: { name: "Eis-Elementar", avatar: "❄️", hpMultiplier: 1.4, attackMultiplier: 0.12, weakness: "fire", loot: "quicksilver", lootName: "Quecksilber", mult: 2.2 },
            3: { name: "Wald-Wächter", avatar: "🌳", hpMultiplier: 1.8, attackMultiplier: 0.16, weakness: "fire", loot: "mandrake", lootName: "Alraune", mult: 3.2 },
            4: { name: "Feuer-Salamander", avatar: "🦎", hpMultiplier: 2.3, attackMultiplier: 0.22, weakness: "earth", loot: "dragon_blood", lootName: "Drachenblut", mult: 4.5 },
            5: { name: "Akademie-Rektor Ignatius", avatar: "🧙", hpMultiplier: 3.2, attackMultiplier: 0.30, weakness: "wind", loot: "dragon_blood", lootName: "Drachenblut & Rektor-Essenz", mult: 7.0 }
        };

        let base = monsters[stage] || monsters[1];
        enemyName = base.name;
        enemyAvatar = base.avatar;
        enemyWeakness = base.weakness;
        enemyLoot = base.loot;
        enemyLootName = base.lootName;
        monsterMultiplier = base.mult;

        enemyMaxHP = Math.round(50 + fee * 2 * base.hpMultiplier);
        enemyHP = enemyMaxHP;
        enemyAttack = Math.round(5 + fee * 0.4 * base.attackMultiplier);
    }

    // --- ACTIONS INTERFACE ---
    btnAttack.addEventListener('click', () => { playerAction('attack'); });
    btnSpellFire.addEventListener('click', () => { playerAction('spell-fire'); });
    btnSpellEarth.addEventListener('click', () => { playerAction('spell-earth'); });
    btnSpellWind.addEventListener('click', () => { playerAction('spell-wind'); });
    if (btnSpellIce) btnSpellIce.addEventListener('click', () => { playerAction('spell-ice'); });
    btnFlee.addEventListener('click', tryFlee);

    function tryFlee() {
        if (Math.random() < 0.4) {
            addLogEntry("Erfolgreich geflohen! Der Kampf wurde abgebrochen.", "system");
            endCombat(false, "Flucht");
        } else {
            addLogEntry("Flucht gescheitert! Das Monster blockiert den Weg.", "enemy");
            enemyTurn();
        }
    }

    // --- COMBAT ROUNDS LOOP ---
    function playerAction(actionType) {
        if (!isCombatActive) return;

        let dmg = 0;
        let mpCost = 0;
        let logText = "";

        let spells = (window.AlchemistShared && window.AlchemistShared.getArenaSpells) ? window.AlchemistShared.getArenaSpells() : { fire: 1, earth: 1, wind: 1, iceUnlocked: false };

        if (actionType === 'attack') {
            dmg = Math.floor(Math.random() * 8) + 10;
            playerMP = Math.min(playerMaxMP, playerMP + 6);
            logText = `Du führst einen Standardangriff aus und triffst für ${dmg} Schaden! (+6 MP)`;
        } else if (actionType === 'spell-fire') {
            mpCost = 15;
            if (playerMP < mpCost) return;
            playerMP -= mpCost;
            dmg = Math.floor(Math.random() * 12) + 20;
            // Spell level damage boost (+25% per level above 1)
            dmg = Math.round(dmg * (1.0 + (spells.fire - 1) * 0.25));
            
            if (enemyWeakness === 'fire') {
                dmg = Math.round(dmg * 1.5);
                logText = `🔥 FEUERSTOß! (Stufe ${spells.fire}) Sehr effektiv gegen ${enemyName}! Du verursachst ${dmg} Schaden!`;
            } else {
                logText = `🔥 Feuerstoß! (Stufe ${spells.fire}) Du verursachst ${dmg} Schaden!`;
            }
        } else if (actionType === 'spell-earth') {
            mpCost = 25;
            if (playerMP < mpCost) return;
            playerMP -= mpCost;
            dmg = Math.floor(Math.random() * 15) + 32;
            // Spell level damage boost (+25% per level above 1)
            dmg = Math.round(dmg * (1.0 + (spells.earth - 1) * 0.25));

            if (enemyWeakness === 'earth') {
                dmg = Math.round(dmg * 1.3);
                logText = `💥 ERDBEBEN! (Stufe ${spells.earth}) Sehr effektiv gegen ${enemyName}! Du verursachst ${dmg} Schaden!`;
            } else {
                logText = `💥 Erdbeben! (Stufe ${spells.earth}) Du verursachst ${dmg} Schaden!`;
            }
        } else if (actionType === 'spell-wind') {
            mpCost = Math.max(2, 10 - (spells.wind - 1) * 2);
            if (playerMP < mpCost) return;
            playerMP -= mpCost;
            dmg = Math.floor(Math.random() * 6) + 12;
            enemyDebuffs.windStun = true;
            logText = `💨 Windstoß! (Stufe ${spells.wind}) Du wirbelst das Monster auf für ${dmg} Schaden und schwächst seinen nächsten Angriff! (MP: ${mpCost})`;
        } else if (actionType === 'spell-ice') {
            mpCost = 20;
            if (playerMP < mpCost) return;
            playerMP -= mpCost;
            dmg = Math.floor(Math.random() * 8) + 16;
            enemyDebuffs.frozen = true;
            logText = `❄️ Eis-Splitter! Du schießt Eiszapfen für ${dmg} Schaden und frierst das Monster ein! (Gegner setzt 1 Runde aus)`;
        }

        // Apply Fortuna buff (1.5x damage)
        if (playerBuffs.fortuna > 0) {
            dmg = Math.round(dmg * 1.5);
            logText += ` (✨ Kritischer Treffer durch Fortuna!)`;
        }

        // Deal damage
        let diplomas = (window.AlchemistShared && window.AlchemistShared.getDiplomas) ? window.AlchemistShared.getDiplomas() : 0;
        if (diplomas > 0) {
            dmg = Math.round(dmg * (1.0 + (diplomas * 0.1)));
            logText += ` (🎓 Diplom-Verstärkung: +${diplomas * 10}%)`;
        }
        enemyHP = Math.max(0, enemyHP - dmg);
        addLogEntry(logText, 'player');

        // Shake & Flash Enemy card
        enemyCard.classList.add('shake', 'attack-flash');
        setTimeout(() => { enemyCard.classList.remove('shake', 'attack-flash'); }, 400);

        updateCombatUI();

        // Check monster death
        if (enemyHP <= 0) {
            endCombat(true);
        } else {
            // Disable buttons during enemy turn
            setButtonsDisabled(true);
            setTimeout(() => {
                enemyTurn();
                setButtonsDisabled(false);
            }, 800);
        }
    }

    function enemyTurn() {
        if (!isCombatActive) return;

        if (enemyDebuffs.frozen) {
            enemyDebuffs.frozen = false;
            addLogEntry(`❄️ Das wilde ${enemyName} ist eingefroren und setzt eine Runde aus!`, 'system');
            
            // Decrement buffs
            if (playerBuffs.hermes > 0) playerBuffs.hermes--;
            if (playerBuffs.fortuna > 0) playerBuffs.fortuna--;
            updateCombatUI();
            return;
        }

        let dmg = enemyAttack;
        let isSpecial = Math.random() < 0.25;
        let actionMsg = "";

        if (isSpecial) {
            dmg = Math.round(dmg * 1.4);
            actionMsg = `💀 Das wilde ${enemyName} entfesselt einen Spezialangriff!`;
        } else {
            actionMsg = `⚔️ Das wilde ${enemyName} greift an.`;
        }

        // Shield (Aegis) check
        if (playerBuffs.aegis) {
            playerBuffs.aegis = false;
            addLogEntry(`${actionMsg} Aber dein 🛡️ Aegis-Schutzschild hat den gesamten Schaden absorbiert!`, 'system');
        } else {
            // Apply buffs & debuffs
            let dmgReduction = 1.0;
            if (playerBuffs.hermes > 0) dmgReduction -= 0.40; // -40% damage
            if (enemyDebuffs.windStun) {
                dmgReduction -= 0.40; // -40% damage
                enemyDebuffs.windStun = false;
            }

            dmg = Math.round(dmg * Math.max(0.1, dmgReduction));
            playerHP = Math.max(0, playerHP - dmg);
            addLogEntry(`${actionMsg} Du erleidest ${dmg} Schaden!`, 'enemy');

            // Shake & Flash player card
            playerCard.classList.add('shake');
            setTimeout(() => { playerCard.classList.remove('shake'); }, 400);
        }

        // Decrement buffs
        if (playerBuffs.hermes > 0) playerBuffs.hermes--;
        if (playerBuffs.fortuna > 0) playerBuffs.fortuna--;

        updateCombatUI();

        if (playerHP <= 0) {
            endCombat(false);
        }
    }

    // --- END COMBAT ---
    function endCombat(isVictory, reason = "") {
        isCombatActive = false;

        // Reset music intensity
        if (window.AlchemistShared && window.AlchemistShared.setMusicState) {
            window.AlchemistShared.setMusicState(0.3, 70);
        }

        entryFeeSection.classList.remove('hidden');
        combatActionsSection.classList.add('hidden');

        if (isVictory) {
            const stageSelect = document.getElementById('arena-stage-select');
            const stage = stageSelect ? parseInt(stageSelect.value) : 1;

            let winAmount = entryFee * monsterMultiplier;
            let xpWon = Math.round(entryFee * 1.5 + Math.random() * 20);
            let bossBonusText = "";

            if (stage === 5) {
                winAmount += 100.00; // 100€ boss bonus
                xpWon += 150; // Extra XP
                bossBonusText = " (inkl. 100€ Boss-Bonus)";
                if (window.AlchemistShared && window.AlchemistShared.unlockRecipe) {
                    window.AlchemistShared.unlockRecipe('master_rune');
                }
                if (window.AlchemistShared && window.AlchemistShared.progressLegendaryQuest) {
                    window.AlchemistShared.progressLegendaryQuest('arena_boss_win', 1);
                }
            }

            // Record wins & payout in shared alchemist engine
            if (window.AlchemistShared) {
                if (window.AlchemistShared.recordPlay) {
                    window.AlchemistShared.recordPlay('arena', winAmount, entryFee, monsterMultiplier);
                }
                if (window.AlchemistShared.addBalance) {
                    window.AlchemistShared.addBalance(winAmount);
                }
                if (window.AlchemistShared.addXP) {
                    window.AlchemistShared.addXP(xpWon);
                }
            } else {
                balance += winAmount;
                localStorage.setItem('alchemist_balance', balance.toFixed(2));
            }

            // Save ingredients
            saveArenaLoot(enemyLoot);

            addLogEntry(`🎉 SIEG! Du hast das ${enemyName} bezwungen!`, 'win');
            addLogEntry(`Erhaltene Belohnungen: +${winAmount.toFixed(2)} €${bossBonusText} und +${xpWon} XP.`, 'win');
            addLogEntry(`Zusätzliche Beute: 1x ${enemyLootName} (Zutat)!`, 'win');

            // Show victory screen
            arenaOverlayTitle.textContent = stage === 5 ? "🏆 LEGENDE DER ARENA!" : "🏆 Sieg in der Arena!";
            if (stage === 5) {
                arenaOverlaySubtitle.innerHTML = `Du hast den Rektor <strong>${enemyName}</strong> bezwungen!<br>Gewinn: <strong>+${winAmount.toFixed(2)} €</strong>${bossBonusText}<br>Beute: <strong>1x ${enemyLootName}</strong><br>XP: <strong>+${xpWon} XP</strong><br><em>Ein geheimes Rezept wurde freigeschaltet!</em>`;
            } else {
                arenaOverlaySubtitle.innerHTML = `Du hast das <strong>${enemyName}</strong> bezwungen.<br>Gewinn: <strong>+${winAmount.toFixed(2)} €</strong><br>Beute: <strong>1x ${enemyLootName}</strong><br>XP: <strong>+${xpWon} XP</strong>`;
            }
            arenaOverlay.classList.remove('hidden');
        } else {
            if (reason === "Flucht") {
                arenaOverlayTitle.textContent = "💨 Flucht geglückt";
                arenaOverlaySubtitle.textContent = "Du bist dem Kampf entkommen, verlierst aber deine Anmeldegebühr.";
            } else {
                saveArenaLoss();
                addLogEntry(`💀 NIEDERLAGE! Du wurdest von dem ${enemyName} besiegt!`, 'lose');
                
                arenaOverlayTitle.textContent = "💀 Du wurdest besiegt!";
                arenaOverlaySubtitle.innerHTML = `Das <strong>${enemyName}</strong> war zu stark.<br>Du verlierst deinen Einsatz von <strong>${entryFee.toFixed(2)} €</strong>.`;
            }
            arenaOverlay.classList.remove('hidden');
        }

        syncStats();
    }

    // --- UI UPDATES ---
    function updateCombatUI() {
        // HP / MP bar fills
        enemyHpText.textContent = `${enemyHP} / ${enemyMaxHP}`;
        enemyHpBar.style.width = Math.max(0, (enemyHP / enemyMaxHP) * 100) + "%";

        playerHpText.textContent = `${playerHP} / ${playerMaxHP}`;
        playerHpBar.style.width = Math.max(0, (playerHP / playerMaxHP) * 100) + "%";

        playerMpText.textContent = `${playerMP} / ${playerMaxMP}`;
        playerMpBar.style.width = Math.max(0, (playerMP / playerMaxMP) * 100) + "%";

        enemyAvatarEl.textContent = enemyAvatar;
        enemyNameEl.textContent = enemyName;

        // Buff indications
        playerBuffsEl.innerHTML = "";
        if (playerBuffs.hermes > 0) playerBuffsEl.innerHTML += `<span class="buff-badge hermes">💨 Hermes (${playerBuffs.hermes}R)</span>`;
        if (playerBuffs.fortuna > 0) playerBuffsEl.innerHTML += `<span class="buff-badge fortuna">✨ Fortuna (${playerBuffs.fortuna}R)</span>`;
        if (playerBuffs.aegis) playerBuffsEl.innerHTML += `<span class="buff-badge aegis">🛡️ Aegis</span>`;

        enemyBuffsEl.innerHTML = "";
        if (enemyDebuffs.windStun) enemyBuffsEl.innerHTML += `<span class="buff-badge hermes" style="background:rgba(234,88,12,0.1); color:var(--color-orange);">💨 Geschwächt</span>`;

        // Spells availability (MP checks)
        let spells = (window.AlchemistShared && window.AlchemistShared.getArenaSpells) ? window.AlchemistShared.getArenaSpells() : { fire: 1, earth: 1, wind: 1, iceUnlocked: false };
        let windCost = Math.max(2, 10 - (spells.wind - 1) * 2);

        btnSpellFire.disabled = playerMP < 15;
        btnSpellEarth.disabled = playerMP < 25;
        btnSpellWind.disabled = playerMP < windCost;
        if (btnSpellIce) btnSpellIce.disabled = playerMP < 20;

        // Load potion buttons dynamically
        loadPotionButtons();
    }

    function loadPotionButtons() {
        if (!window.AlchemistShared) return;

        let potions = window.AlchemistShared.getPotions();
        combatPotionInventory.innerHTML = "";

        const potNames = {
            hermes: { name: "Hermes-Trank (Schadensminderung)", emoji: "🧪", iconClass: "fa-solid fa-wind" },
            fortuna: { name: "Fortuna-Elixier (Crit-Boost)", emoji: "🧪", iconClass: "fa-solid fa-sparkles" },
            aegis: { name: "Aegis-Elixier (Absorbier-Schild)", emoji: "🧪", iconClass: "fa-solid fa-shield-halved" },
            aether: { name: "Äther-Essenz (Heilt HP/MP)", emoji: "🧪", iconClass: "fa-solid fa-droplet" }
        };

        for (let key in potions) {
            let count = potions[key] || 0;
            if (count > 0) {
                let btn = document.createElement('button');
                btn.type = "button";
                btn.className = "btn btn-potion-use";
                btn.innerHTML = `
                    <span>${potNames[key].emoji} ${potNames[key].name}</span>
                    <span class="potion-count">${count}x</span>
                `;
                
                btn.addEventListener('click', () => { usePotionInCombat(key); });
                combatPotionInventory.appendChild(btn);
            }
        }

        if (combatPotionInventory.children.length === 0) {
            combatPotionInventory.innerHTML = `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">Keine Tränke im Inventar. Braue welche im Kessel!</span>`;
        }
    }

    function usePotionInCombat(potionKey) {
        if (!isCombatActive) return;

        // Consume via shared alchemist state
        let consumed = window.AlchemistShared.consumePotion(potionKey);
        if (consumed) {
            if (potionKey === 'hermes') {
                playerBuffs.hermes = 3;
                addLogEntry("Du trinkst einen Hermes-Trank! Schaden des Monsters wird für 3 Runden um 40% verringert.", 'system');
            } else if (potionKey === 'fortuna') {
                playerBuffs.fortuna = 3;
                addLogEntry("Du trinkst ein Fortuna-Elixier! Deine Angriffe fügen für 3 Runden +50% Schaden zu.", 'system');
            } else if (potionKey === 'aegis') {
                playerBuffs.aegis = true;
                addLogEntry("Du trinkst ein Aegis-Elixier! Dein nächster Schaden wird komplett absorbiert.", 'system');
            } else if (potionKey === 'aether') {
                playerHP = Math.min(playerMaxHP, playerHP + 50);
                playerMP = Math.min(playerMaxMP, playerMP + 25);
                addLogEntry("Du trinkst eine Äther-Essenz! +50 HP und +25 MP regeneriert.", 'system');
            }

            updateCombatUI();
        }
    }

    function addLogEntry(text, type) {
        let entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = text;
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight;
    }

    function setButtonsDisabled(disabled) {
        let spells = (window.AlchemistShared && window.AlchemistShared.getArenaSpells) ? window.AlchemistShared.getArenaSpells() : { fire: 1, earth: 1, wind: 1, iceUnlocked: false };
        let windCost = Math.max(2, 10 - (spells.wind - 1) * 2);

        btnAttack.disabled = disabled;
        btnSpellFire.disabled = disabled || playerMP < 15;
        btnSpellEarth.disabled = disabled || playerMP < 25;
        btnSpellWind.disabled = disabled || playerMP < windCost;
        if (btnSpellIce) btnSpellIce.disabled = disabled || playerMP < 20;
        btnFlee.disabled = disabled;

        // Disable all potion buttons
        const potButtons = combatPotionInventory.querySelectorAll('.btn-potion-use');
        potButtons.forEach(btn => { btn.disabled = disabled; });
    }
});
