/* KENO DER ELEMENTE GAME ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let selectedRunes = [];
    let lastRoundSeeds = null;

    const balanceEl = document.getElementById('balance-amount');
    const boardEl = document.getElementById('keno-board');
    const countEl = document.getElementById('keno-selected-count');
    const paytableEl = document.getElementById('keno-paytable');
    const betInput = document.getElementById('keno-bet-input');
    const btnDraw = document.getElementById('btn-draw-keno');
    const btnQuickpick = document.getElementById('btn-keno-quickpick');
    const btnClear = document.getElementById('btn-keno-clear');
    const btnPF = document.getElementById('btn-pf-verify');

    function updateHUD() {
        if (balanceEl) balanceEl.textContent = balance.toFixed(2);
    }
    updateHUD();

    // Paytable Definitions based on selected count
    const PAYTABLES = {
        1: [{ hits: 1, mult: 3.5 }],
        2: [{ hits: 2, mult: 7.0 }],
        3: [{ hits: 2, mult: 2.0 }, { hits: 3, mult: 16.0 }],
        4: [{ hits: 2, mult: 1.0 }, { hits: 3, mult: 5.0 }, { hits: 4, mult: 30.0 }],
        5: [{ hits: 3, mult: 3.0 }, { hits: 4, mult: 12.0 }, { hits: 5, mult: 75.0 }],
        6: [{ hits: 3, mult: 2.0 }, { hits: 4, mult: 6.0 }, { hits: 5, mult: 30.0 }, { hits: 6, mult: 150.0 }],
        7: [{ hits: 4, mult: 4.0 }, { hits: 5, mult: 15.0 }, { hits: 6, mult: 80.0 }, { hits: 7, mult: 300.0 }],
        8: [{ hits: 4, mult: 2.0 }, { hits: 5, mult: 8.0 }, { hits: 6, mult: 40.0 }, { hits: 7, mult: 200.0 }, { hits: 8, mult: 500.0 }],
        9: [{ hits: 5, mult: 5.0 }, { hits: 6, mult: 25.0 }, { hits: 7, mult: 100.0 }, { hits: 8, mult: 350.0 }, { hits: 9, mult: 750.0 }],
        10: [{ hits: 5, mult: 3.0 }, { hits: 6, mult: 15.0 }, { hits: 7, mult: 60.0 }, { hits: 8, mult: 200.0 }, { hits: 9, mult: 500.0 }, { hits: 10, mult: 1000.0 }]
    };

    // Render Board Grid (1-80)
    for (let i = 1; i <= 80; i++) {
        const tile = document.createElement('div');
        tile.className = 'rune-tile';
        tile.textContent = i;
        tile.setAttribute('data-num', i);

        tile.addEventListener('click', () => {
            if (selectedRunes.includes(i)) {
                selectedRunes = selectedRunes.filter(n => n !== i);
                tile.classList.remove('selected');
            } else {
                if (selectedRunes.length >= 10) {
                    if (window.AlchemistShared) window.AlchemistShared.showToast("❌ Maximal 10 Runen auswählbar!", "info");
                    return;
                }
                selectedRunes.push(i);
                tile.classList.add('selected');
            }
            updatePaytable();
        });

        boardEl.appendChild(tile);
    }

    function updatePaytable() {
        countEl.textContent = selectedRunes.length;
        paytableEl.innerHTML = '';
        let rules = PAYTABLES[selectedRunes.length] || [];

        if (rules.length === 0) {
            paytableEl.innerHTML = '<div style="font-size:0.75rem; color:#6b7280; text-align:center;">Wähle mindestens 1 Rune.</div>';
            return;
        }

        rules.forEach(r => {
            const row = document.createElement('div');
            row.className = 'paytable-row';
            row.id = `paytable-row-${r.hits}`;
            row.innerHTML = `<span>${r.hits} Treffer</span><span>${r.mult}x</span>`;
            paytableEl.appendChild(row);
        });
    }
    updatePaytable();

    btnQuickpick.addEventListener('click', () => {
        selectedRunes = [];
        document.querySelectorAll('.rune-tile').forEach(t => t.classList.remove('selected'));
        while (selectedRunes.length < 5) {
            let rnd = Math.floor(Math.random() * 80) + 1;
            if (!selectedRunes.includes(rnd)) selectedRunes.push(rnd);
        }
        selectedRunes.forEach(num => {
            const tile = document.querySelector(`.rune-tile[data-num="${num}"]`);
            if (tile) tile.classList.add('selected');
        });
        updatePaytable();
    });

    btnClear.addEventListener('click', () => {
        selectedRunes = [];
        document.querySelectorAll('.rune-tile').forEach(t => t.classList.remove('selected', 'drawn', 'hit'));
        updatePaytable();
    });

    if (btnPF) {
        btnPF.addEventListener('click', () => {
            if (!lastRoundSeeds && window.AlchemistShared) {
                lastRoundSeeds = window.AlchemistShared.generateSeeds();
            }
            if (window.AlchemistShared) {
                window.AlchemistShared.openProvablyFairModal('Keno der Elemente', lastRoundSeeds.serverHash, lastRoundSeeds.serverSeed, lastRoundSeeds.clientSeed, lastRoundSeeds.nonce, 'Keno 20-Runen Ziehung verifiziert');
            }
        });
    }

    btnDraw.addEventListener('click', () => {
        if (selectedRunes.length === 0) {
            if (window.AlchemistShared) window.AlchemistShared.showToast("❌ Wähle mindestens 1 Rune aus!", "info");
            return;
        }

        let bet = parseFloat(betInput.value) || 10.00;
        if (bet > balance) {
            if (window.AlchemistShared) window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            return;
        }

        balance -= bet;
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
        updateHUD();

        btnDraw.disabled = true;
        document.querySelectorAll('.rune-tile').forEach(t => t.classList.remove('drawn', 'hit'));

        if (window.AlchemistShared) {
            lastRoundSeeds = window.AlchemistShared.generateSeeds();
        }

        // Draw 20 random numbers out of 80
        let drawn = [];
        while (drawn.length < 20) {
            let rnd = Math.floor(Math.random() * 80) + 1;
            if (!drawn.includes(rnd)) drawn.push(rnd);
        }

        // Highlight drawn numbers with delay
        let hitsCount = 0;
        drawn.forEach((num, idx) => {
            setTimeout(() => {
                const tile = document.querySelector(`.rune-tile[data-num="${num}"]`);
                if (tile) {
                    if (selectedRunes.includes(num)) {
                        tile.classList.add('hit');
                        hitsCount++;
                        if (window.AlchemistShared) window.AlchemistShared.playBounceNote();
                    } else {
                        tile.classList.add('drawn');
                    }
                }

                // Finish calculation after last drawn tile
                if (idx === drawn.length - 1) {
                    let rules = PAYTABLES[selectedRunes.length] || [];
                    let matchedRule = rules.find(r => r.hits === hitsCount);
                    let mult = matchedRule ? matchedRule.mult : 0;
                    let win = bet * mult;

                    let midasBonus = 0;
                    if (win > 0 && window.AlchemistShared && window.AlchemistShared.hasEquippedRelic('midas_ring')) {
                        midasBonus = win * 0.05;
                        win += midasBonus;
                    }

                    if (win > 0) {
                        balance += win;
                        localStorage.setItem('alchemist_balance', balance.toFixed(2));
                        updateHUD();

                        if (window.AlchemistShared) {
                            window.AlchemistShared.showToast(`✨ Keno Gewinn: ${hitsCount} Treffer! (+${win.toFixed(2)}€)!`, 'quest-complete');
                            window.AlchemistShared.particles.spawnGoldCoins();
                        }
                    } else {
                        if (window.AlchemistShared) window.AlchemistShared.showToast(`Keno: ${hitsCount} Treffer. Leider kein Gewinn.`, 'info');
                    }

                    if (window.AlchemistShared) {
                        window.AlchemistShared.recordPlay('keno', win, bet, mult);
                        window.AlchemistShared.addXP(Math.floor(bet * 1.5));
                    }

                    btnDraw.disabled = false;
                }
            }, idx * 100);
        });
    });
});
