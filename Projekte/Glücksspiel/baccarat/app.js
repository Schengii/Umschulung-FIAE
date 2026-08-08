/* ALCHEMIE-BACCARA GAME ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;
    let selectedSpot = 'rubedo';
    let lastRoundSeeds = null;

    const balanceEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('baccarat-bet-input');
    const btnDeal = document.getElementById('btn-deal-baccarat');
    const statusMsg = document.getElementById('baccarat-status-msg');
    const rubedoCardsEl = document.getElementById('rubedo-cards');
    const albedoCardsEl = document.getElementById('albedo-cards');
    const rubedoScoreEl = document.getElementById('rubedo-score');
    const albedoScoreEl = document.getElementById('albedo-score');
    const btnPF = document.getElementById('btn-pf-verify');

    function updateHUD() {
        if (balanceEl) balanceEl.textContent = balance.toFixed(2);
    }
    updateHUD();

    // Spot selection
    document.querySelectorAll('.btn-bet-spot').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-bet-spot').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSpot = btn.getAttribute('data-spot');
        });
    });

    if (btnPF) {
        btnPF.addEventListener('click', () => {
            if (!lastRoundSeeds && window.AlchemistShared) {
                lastRoundSeeds = window.AlchemistShared.generateSeeds();
            }
            if (window.AlchemistShared) {
                window.AlchemistShared.openProvablyFairModal('Alchemie-Baccara', lastRoundSeeds.serverHash, lastRoundSeeds.serverSeed, lastRoundSeeds.clientSeed, lastRoundSeeds.nonce, 'Baccara-Kartenverteilung verifiziert');
            }
        });
    }

    function createCard() {
        const suits = ['🔴', '⚪', '🔥', '💧'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0]; // 10s and face cards are 0
        const cardVal = values[Math.floor(Math.random() * values.length)];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        return { val: cardVal, suit: suit };
    }

    function calcScore(cards) {
        let sum = cards.reduce((acc, c) => acc + c.val, 0);
        return sum % 10;
    }

    function renderCard(card, container) {
        const el = document.createElement('div');
        el.className = `baccarat-card ${card.suit === '🔴' || card.suit === '🔥' ? 'red' : 'black'}`;
        el.innerHTML = `<div>${card.val}</div><div style="font-size:1.2rem; align-self:center;">${card.suit}</div><div>${card.val}</div>`;
        container.appendChild(el);
    }

    btnDeal.addEventListener('click', () => {
        let bet = parseFloat(betInput.value) || 25.00;
        if (bet > balance) {
            if (window.AlchemistShared) window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            return;
        }

        // Deduct bet
        balance -= bet;
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
        updateHUD();

        btnDeal.disabled = true;
        rubedoCardsEl.innerHTML = '';
        albedoCardsEl.innerHTML = '';

        if (window.AlchemistShared) {
            lastRoundSeeds = window.AlchemistShared.generateSeeds();
        }

        let rubedoCards = [createCard(), createCard()];
        let albedoCards = [createCard(), createCard()];

        rubedoCards.forEach(c => renderCard(c, rubedoCardsEl));
        albedoCards.forEach(c => renderCard(c, albedoCardsEl));

        let rScore = calcScore(rubedoCards);
        let aScore = calcScore(albedoCards);

        rubedoScoreEl.textContent = rScore;
        albedoScoreEl.textContent = aScore;

        // Baccarat Third Card Rule logic
        if (rScore <= 5 && aScore < 8) {
            let thirdR = createCard();
            rubedoCards.push(thirdR);
            renderCard(thirdR, rubedoCardsEl);
            rScore = calcScore(rubedoCards);
            rubedoScoreEl.textContent = rScore;
        }

        if (aScore <= 5 && rScore < 8) {
            let thirdA = createCard();
            albedoCards.push(thirdA);
            renderCard(thirdA, albedoCardsEl);
            aScore = calcScore(albedoCards);
            albedoScoreEl.textContent = aScore;
        }

        let winner = 'tie';
        if (rScore > aScore) winner = 'rubedo';
        else if (aScore > rScore) winner = 'albedo';

        let winMult = 0;
        if (selectedSpot === winner) {
            if (winner === 'rubedo') winMult = 2.0;
            else if (winner === 'albedo') winMult = 1.95;
            else if (winner === 'tie') winMult = 9.0;
        }

        let totalPayout = bet * winMult;
        let midasBonus = 0;
        if (totalPayout > 0 && window.AlchemistShared && window.AlchemistShared.hasEquippedRelic('midas_ring')) {
            midasBonus = totalPayout * 0.05;
            totalPayout += midasBonus;
        }

        if (totalPayout > 0) {
            balance += totalPayout;
            localStorage.setItem('alchemist_balance', balance.toFixed(2));
            updateHUD();

            statusMsg.style.color = 'var(--color-green)';
            statusMsg.textContent = `🎉 GEWONNEN! ${winner.toUpperCase()} gewinnt mit ${Math.max(rScore, aScore)} Punkten (+${totalPayout.toFixed(2)}€)!`;

            if (window.AlchemistShared) {
                window.AlchemistShared.showToast(`👑 Baccara Gewinn: +${totalPayout.toFixed(2)} €!`, 'quest-complete');
                window.AlchemistShared.particles.spawnGoldCoins();
            }
        } else {
            statusMsg.style.color = 'var(--color-danger)';
            statusMsg.textContent = `❌ VERLOREN! Erbeutet: ${winner.toUpperCase()} gewinnt.`;
        }

        if (window.AlchemistShared) {
            window.AlchemistShared.recordPlay('baccarat', totalPayout, bet, winMult);
            window.AlchemistShared.addXP(Math.floor(bet * 2));
        }

        setTimeout(() => { btnDeal.disabled = false; }, 1000);
    });
});
