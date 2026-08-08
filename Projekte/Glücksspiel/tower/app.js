(function () {
    let balance = 1000.00;
    let betAmount = 10.00;
    let currentFloor = 0; // 1 to 10
    let isClimbing = false;
    let currentWin = 0.0;

    // Multipliers for Floors 1 to 10
    const FLOOR_MULTIPLIERS = [1.35, 1.85, 2.60, 3.75, 5.50, 8.20, 12.50, 19.00, 30.00, 50.00];

    // DOM Elements
    const balAmountEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('bet-input');
    const btnStart = document.getElementById('btn-start-climb');
    const btnCashout = document.getElementById('btn-cashout');
    const cashoutValEl = document.getElementById('cashout-val');
    const statusMsg = document.getElementById('tower-status-msg');
    const towerContainer = document.getElementById('tower-structure-container');

    // Bet presets
    const btnMin = document.getElementById('btn-bet-min');
    const btnHalf = document.getElementById('btn-bet-half');
    const btnDouble = document.getElementById('btn-bet-double');
    const btnMax = document.getElementById('btn-bet-max');

    // Apply themes
    if (window.AlchemistShared && window.AlchemistShared.applyCurrentTheme) {
        window.AlchemistShared.applyCurrentTheme();
    }

    // INITIALIZATION
    syncState();
    buildTowerUI();

    if (btnMin) btnMin.addEventListener('click', () => { betInput.value = "5.00"; });
    if (btnHalf) btnHalf.addEventListener('click', () => { betInput.value = Math.max(5.00, Math.floor(parseFloat(betInput.value) / 2)).toFixed(2); });
    if (btnDouble) btnDouble.addEventListener('click', () => { betInput.value = Math.min(250.00, parseFloat(betInput.value) * 2).toFixed(2); });
    if (btnMax) btnMax.addEventListener('click', () => { betInput.value = "250.00"; });

    if (btnStart) btnStart.addEventListener('click', startClimb);
    if (btnCashout) btnCashout.addEventListener('click', doCashout);

    function syncState() {
        balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
        if (balAmountEl) {
            balAmountEl.textContent = balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    function buildTowerUI() {
        if (!towerContainer) return;
        towerContainer.innerHTML = '';

        for (let floorNum = 1; floorNum <= 10; floorNum++) {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'tower-floor';
            floorDiv.id = `floor-${floorNum}`;

            const mult = FLOOR_MULTIPLIERS[floorNum - 1];

            floorDiv.innerHTML = `
                <div class="floor-badge">Etage ${floorNum}</div>
                <div class="doors-row">
                    <div class="tower-door" data-door="0"><i class="fa-solid fa-door-closed"></i></div>
                    <div class="tower-door" data-door="1"><i class="fa-solid fa-door-closed"></i></div>
                    <div class="tower-door" data-door="2"><i class="fa-solid fa-door-closed"></i></div>
                </div>
                <div class="floor-mult">${mult.toFixed(2)}x</div>
            `;

            // Door click events
            floorDiv.querySelectorAll('.tower-door').forEach((doorEl, doorIdx) => {
                doorEl.addEventListener('click', () => handleDoorClick(floorNum, doorIdx));
            });

            towerContainer.appendChild(floorDiv);
        }
    }

    function startClimb() {
        if (isClimbing) return;

        syncState();
        betAmount = Math.max(5.00, Math.min(250.00, parseFloat(betInput.value) || 10.00));
        betInput.value = betAmount.toFixed(2);

        if (balance < betAmount) {
            if (window.AlchemistShared) {
                window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            }
            return;
        }

        // Deduct bet
        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(-betAmount);
        } else {
            balance -= betAmount;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }
        syncState();

        isClimbing = true;
        currentFloor = 1;
        currentWin = 0.0;

        btnStart.classList.add('hidden');
        btnCashout.classList.add('hidden');
        betInput.setAttribute('disabled', 'true');

        buildTowerUI();
        highlightActiveFloor();

        statusMsg.style.color = 'var(--text-secondary)';
        statusMsg.textContent = "Wähle 1 von 3 Türen auf Etage 1!";
    }

    function highlightActiveFloor() {
        document.querySelectorAll('.tower-floor').forEach(f => {
            f.classList.remove('active');
        });
        const activeFloorEl = document.getElementById(`floor-${currentFloor}`);
        if (activeFloorEl) {
            activeFloorEl.classList.add('active');
        }
    }

    function handleDoorClick(floorNum, doorIdx) {
        if (!isClimbing || floorNum !== currentFloor) return;

        // 1 door is a Mimic (trap), 2 doors are Treasures
        const mimicDoorIdx = Math.floor(Math.random() * 3);

        const activeFloorEl = document.getElementById(`floor-${currentFloor}`);
        const doors = activeFloorEl.querySelectorAll('.tower-door');

        if (doorIdx === mimicDoorIdx) {
            // Mimic Trap hit!
            doors[doorIdx].className = 'tower-door revealed-mimic';
            doors[doorIdx].innerHTML = '<i class="fa-solid fa-dragon"></i>';

            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('slots_spin');
            }

            statusMsg.style.color = 'var(--color-danger)';
            statusMsg.textContent = `💥 MIMIC-FALLE! Auf Etage ${currentFloor} gescheitert. Einsatz verloren.`;

            isClimbing = false;
            btnStart.classList.remove('hidden');
            btnCashout.classList.add('hidden');
            betInput.removeAttribute('disabled');

            if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
                window.AlchemistShared.recordPlay('tower', 0, betAmount, 0);
            }
        } else {
            // Treasure found!
            doors[doorIdx].className = 'tower-door revealed-treasure';
            doors[doorIdx].innerHTML = '<i class="fa-solid fa-gem"></i>';

            if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
                window.AlchemistShared.playProceduralSound('slots_stop');
            }

            activeFloorEl.classList.remove('active');
            activeFloorEl.classList.add('completed');

            const mult = FLOOR_MULTIPLIERS[currentFloor - 1];
            currentWin = betAmount * mult;

            // Apply Fortuna potion bonus (+20%)
            let activePotions = JSON.parse(localStorage.getItem('alchemist_active_potions')) || { hermes: 0, fortuna: 0, aegis: 0, aether: 0 };
            if (activePotions.fortuna > 0) {
                currentWin = parseFloat((currentWin * 1.20).toFixed(2));
            }

            if (cashoutValEl) cashoutValEl.textContent = currentWin.toFixed(2);
            btnCashout.classList.remove('hidden');

            if (currentFloor === 10) {
                // Tower completed! (Jackpot)
                doCashout();
            } else {
                currentFloor++;
                highlightActiveFloor();
                statusMsg.style.color = 'var(--color-gold)';
                statusMsg.textContent = `✨ Etage ${currentFloor-1} gemeistert! Aktueller Gewinn: ${currentWin.toFixed(2)} € (${mult.toFixed(2)}x)`;
            }
        }
    }

    function doCashout() {
        if (!isClimbing || currentWin <= 0) return;

        isClimbing = false;

        if (window.AlchemistShared && window.AlchemistShared.addBalance) {
            window.AlchemistShared.addBalance(currentWin);
        } else {
            balance += currentWin;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
        }

        if (window.AlchemistShared && window.AlchemistShared.playProceduralSound) {
            window.AlchemistShared.playProceduralSound('win_fanfare');
        }

        statusMsg.style.color = 'var(--color-gold)';
        statusMsg.textContent = `🎉 CASHOUT ERFOLGREICH! +${currentWin.toFixed(2)} € gesichert!`;

        if (window.AlchemistShared && window.AlchemistShared.recordPlay) {
            window.AlchemistShared.recordPlay('tower', currentWin, betAmount, currentWin / betAmount);
        }
        if (window.AlchemistShared && window.AlchemistShared.addXP) {
            window.AlchemistShared.addXP(25 + Math.floor(currentWin / 5));
        }

        btnStart.classList.remove('hidden');
        btnCashout.classList.add('hidden');
        betInput.removeAttribute('disabled');
        syncState();
    }
})();
