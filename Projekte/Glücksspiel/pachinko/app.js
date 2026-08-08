/* ATHANOR-SCHMELZE (PACHINKO) GAME ENGINE */
document.addEventListener('DOMContentLoaded', () => {
    let balance = parseFloat(localStorage.getItem('alchemist_balance')) || 1000.00;

    const canvas = document.getElementById('pachinko-canvas');
    const ctx = canvas.getContext('2d');

    const balanceEl = document.getElementById('balance-amount');
    const betInput = document.getElementById('pachinko-bet-input');
    const btnDrop = document.getElementById('btn-drop-pachinko');

    const autoRoundsInput = document.getElementById('autobet-rounds');
    const autoStopLossInput = document.getElementById('autobet-stoploss');
    const autoTakeProfitInput = document.getElementById('autobet-takeprofit');
    const btnAuto = document.getElementById('btn-toggle-autobet');

    let autoActive = false;
    let autoStartBalance = balance;
    let autoRoundsLeft = 0;

    function updateHUD() {
        if (balanceEl) balanceEl.textContent = balance.toFixed(2);
    }
    updateHUD();

    // Stage Setup
    const pegs = [];
    const spinners = [];
    const buckets = [
        { x: 30, width: 60, mult: 5.0, color: '#ffd700', label: '5.0x' },
        { x: 100, width: 60, mult: 2.0, color: '#0891b2', label: '2.0x' },
        { x: 170, width: 60, mult: 0.5, color: '#6b7280', label: '0.5x' },
        { x: 240, width: 60, mult: 1.5, color: '#7c3aed', label: '1.5x' },
        { x: 310, width: 60, mult: 2.0, color: '#0891b2', label: '2.0x' },
        { x: 380, width: 60, mult: 8.0, color: '#ef4444', label: '8.0x' }
    ];

    // Build Peg Grid
    for (let row = 0; row < 8; row++) {
        let cols = row % 2 === 0 ? 9 : 8;
        let startX = row % 2 === 0 ? 30 : 55;
        for (let col = 0; col < cols; col++) {
            pegs.push({
                x: startX + col * 48,
                y: 80 + row * 45,
                r: 5,
                color: '#ffd700'
            });
        }
    }

    // Add rotating gears
    spinners.push({ x: 140, y: 220, r: 25, angle: 0, speed: 0.04 });
    spinners.push({ x: 320, y: 220, r: 25, angle: 0, speed: -0.04 });

    // Active Balls
    const balls = [];

    function spawnBall(betAmount) {
        balls.push({
            x: 230 + (Math.random() - 0.5) * 40,
            y: 20,
            vx: (Math.random() - 0.5) * 2,
            vy: 2,
            r: 8,
            bet: betAmount,
            color: '#ef4444'
        });
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw Spinners
        spinners.forEach(sp => {
            sp.angle += sp.speed;
            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.rotate(sp.angle);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, sp.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-sp.r, 0); ctx.lineTo(sp.r, 0);
            ctx.moveTo(0, -sp.r); ctx.lineTo(0, sp.r);
            ctx.stroke();
            ctx.restore();
        });

        // Draw Pegs
        pegs.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Buckets at Bottom
        buckets.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, 470, b.width, 45);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(b.label, b.x + b.width / 2, 496);
        });

        // Update Balls
        for (let i = balls.length - 1; i >= 0; i--) {
            let ball = balls[i];
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.vy += 0.2; // gravity

            // Bounce off walls
            if (ball.x - ball.r < 10) { ball.x = 10 + ball.r; ball.vx *= -0.7; }
            if (ball.x + ball.r > canvas.width - 10) { ball.x = canvas.width - 10 - ball.r; ball.vx *= -0.7; }

            // Bounce off pegs
            pegs.forEach(p => {
                let dx = ball.x - p.x;
                let dy = ball.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < ball.r + p.r) {
                    let angle = Math.atan2(dy, dx);
                    ball.vx = Math.cos(angle) * 3 + (Math.random() - 0.5);
                    ball.vy = Math.sin(angle) * 3;
                    if (window.AlchemistShared) window.AlchemistShared.playBounceNote();
                }
            });

            // Bounce off spinners
            spinners.forEach(sp => {
                let dx = ball.x - sp.x;
                let dy = ball.y - sp.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < ball.r + sp.r) {
                    let angle = Math.atan2(dy, dx);
                    ball.vx = Math.cos(angle) * 5;
                    ball.vy = Math.sin(angle) * 5;
                }
            });

            // Draw Ball
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd700';
            ctx.stroke();

            // Check bucket collision
            if (ball.y >= 470) {
                let hitBucket = buckets.find(b => ball.x >= b.x && ball.x <= b.x + b.width);
                let mult = hitBucket ? hitBucket.mult : 1.0;
                let win = ball.bet * mult;

                let midasBonus = 0;
                if (win > 0 && window.AlchemistShared && window.AlchemistShared.hasEquippedRelic('midas_ring')) {
                    midasBonus = win * 0.05;
                    win += midasBonus;
                }

                balance += win;
                localStorage.setItem('alchemist_balance', balance.toFixed(2));
                updateHUD();

                if (window.AlchemistShared) {
                    window.AlchemistShared.recordPlay('pachinko', win, ball.bet, mult);
                    window.AlchemistShared.addXP(Math.floor(ball.bet * 1.5));
                    if (win > ball.bet) {
                        window.AlchemistShared.showToast(`🎯 Pachinko Landung: ${mult}x (+${win.toFixed(2)}€)!`, 'quest-complete');
                        window.AlchemistShared.particles.spawnGoldCoins(ball.x + 20, 480);
                    }
                }

                balls.splice(i, 1);

                // Auto-bet continuation
                if (autoActive) {
                    let profit = balance - autoStartBalance;
                    let stopLoss = parseFloat(autoStopLossInput.value) || 100;
                    let takeProfit = parseFloat(autoTakeProfitInput.value) || 200;

                    if (autoRoundsLeft > 1 && profit > -stopLoss && profit < takeProfit) {
                        autoRoundsLeft--;
                        setTimeout(triggerDrop, 400);
                    } else {
                        stopAutoPlay();
                    }
                }
            }
        }

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function triggerDrop() {
        let bet = parseFloat(betInput.value) || 10.00;
        if (bet > balance) {
            if (window.AlchemistShared) window.AlchemistShared.showToast("❌ Nicht genügend Gold!", "info");
            stopAutoPlay();
            return;
        }

        balance -= bet;
        localStorage.setItem('alchemist_balance', balance.toFixed(2));
        updateHUD();

        spawnBall(bet);
    }

    btnDrop.addEventListener('click', triggerDrop);

    function stopAutoPlay() {
        autoActive = false;
        btnAuto.textContent = "AUTO-PLAY STARTEN";
        btnAuto.style.background = "rgba(124,58,237,0.15)";
    }

    btnAuto.addEventListener('click', () => {
        if (!autoActive) {
            autoActive = true;
            autoStartBalance = balance;
            autoRoundsLeft = parseInt(autoRoundsInput.value) || 10;
            btnAuto.textContent = "STOPP AUTO-PLAY";
            btnAuto.style.background = "var(--color-danger)";
            triggerDrop();
        } else {
            stopAutoPlay();
        }
    });
});
