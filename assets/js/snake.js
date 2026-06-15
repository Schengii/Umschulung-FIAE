/**
 * Modern Accessible Snake Game with DE/EN Translation
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');

const rows = 20;
const cols = 20;
let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let highscore = parseInt(StorageManager.getItem('snake_highscore', 0)) || 0;
let lastFrameTime = 0;
let isPlaying = false;
let isPaused = false;
const speed = 150;

if (highscoreEl) highscoreEl.textContent = highscore;

document.addEventListener('keydown', handleKeyDown);
if (startBtn) startBtn.addEventListener('click', startGame);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

function getLang() {
    return document.documentElement.getAttribute('lang') || 'de';
}

function resizeCanvas() {
    cellWidth = canvas.width / cols;
    cellHeight = canvas.height / rows;
    draw();
}
window.addEventListener('resize', resizeCanvas);

function gameLoop(timestamp) {
    if (!isPlaying) return;
    
    if (!isPaused) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        const elapsed = timestamp - lastFrameTime;
        
        if (elapsed >= speed) {
            gameStep();
            lastFrameTime = timestamp;
        }
    } else {
        lastFrameTime = 0;
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (isPlaying && !isPaused) return;
    
    if (isPaused) {
        isPaused = false;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);
        updateButtons();
        return;
    }

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    if (scoreEl) scoreEl.textContent = score;
    placeFood();
    
    isPlaying = true;
    isPaused = false;
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
    
    updateButtons();
}

function togglePause() {
    if (!isPlaying) return;
    
    if (isPaused) {
        isPaused = false;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);
    } else {
        isPaused = true;
    }
    updateButtons();
    draw();
}

function updateButtons() {
    const lang = getLang();
    if (startBtn) {
        const startText = lang === 'de' ? '<i class="fa fa-refresh"></i> Reset' : '<i class="fa fa-refresh"></i> Reset';
        const initialStartText = lang === 'de' ? '<i class="fa fa-play"></i> Start' : '<i class="fa fa-play"></i> Start';
        startBtn.innerHTML = isPlaying ? startText : initialStartText;
    }
    if (pauseBtn) {
        pauseBtn.disabled = !isPlaying;
        
        let pauseText = '';
        if (isPaused) {
            pauseText = lang === 'de' ? '<i class="fa fa-play"></i> Fortsetzen' : '<i class="fa fa-play"></i> Resume';
        } else {
            pauseText = lang === 'de' ? '<i class="fa fa-pause"></i> Pause' : '<i class="fa fa-pause"></i> Pause';
        }
        pauseBtn.innerHTML = pauseText;
    }
}

function gameOver() {
    isPlaying = false;
    isPaused = false;
    lastFrameTime = 0;
    
    if (score > highscore) {
        highscore = score;
        StorageManager.setItem('snake_highscore', highscore);
        if (highscoreEl) highscoreEl.textContent = highscore;
    }
    
    updateButtons();
    
    const lang = getLang();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    
    const scoreText = lang === 'de' ? `Punkte: ${score} | Highscore: ${highscore}` : `Score: ${score} | High Score: ${highscore}`;
    const restartText = lang === 'de' ? 'Klicke Reset für eine neue Runde' : 'Click Reset for a new round';
    
    ctx.fillText(scoreText, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(restartText, canvas.width / 2, canvas.height / 2 + 50);
}



function gameStep() {
    direction = nextDirection;
    
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
    }
    
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameOver();
        return;
    }
    
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (scoreEl) scoreEl.textContent = score;
        placeFood();
    } else {
        snake.pop();
    }
    
    draw();
}

function placeFood() {
    let newFoodPos;
    let isOnSnake = true;
    
    while (isOnSnake) {
        newFoodPos = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        
        isOnSnake = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFoodPos.x && snake[i].y === newFoodPos.y) {
                isOnSnake = true;
                break;
            }
        }
    }
    
    food = newFoodPos;
}

function draw() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(canvas.width, i * cellHeight);
        ctx.stroke();
    }

    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    const foodRadius = Math.min(cellWidth, cellHeight) / 2 - 2;
    ctx.arc(
        food.x * cellWidth + cellWidth / 2,
        food.y * cellHeight + cellHeight / 2,
        foodRadius,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((part, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#3b82f6' : '#60a5fa';
        
        const x = part.x * cellWidth + 2;
        const y = part.y * cellHeight + 2;
        const w = cellWidth - 4;
        const h = cellHeight - 4;
        const r = 4;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
        ctx.fill();
        
        if (isHead) {
            ctx.fillStyle = '#ffffff';
            let eyeX1, eyeY1, eyeX2, eyeY2;
            
            if (direction === 'LEFT' || direction === 'RIGHT') {
                eyeX1 = x + w / 2;
                eyeX2 = x + w / 2;
                eyeY1 = y + h / 4;
                eyeY2 = y + (3 * h) / 4;
            } else {
                eyeX1 = x + w / 4;
                eyeX2 = x + (3 * w) / 4;
                eyeY1 = y + h / 2;
                eyeY2 = y + h / 2;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 2, 0, 2 * Math.PI);
            ctx.arc(eyeX2, eyeY2, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

    const lang = getLang();

    if (isPaused) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
    }
    
    if (!isPlaying && !isPaused) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#60a5fa';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        const startText = lang === 'de' ? 'Klicke Start zum Spielen' : 'Click Start to play';
        ctx.fillText(startText, canvas.width / 2, canvas.height / 2);
    }
}

function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key === ' ' || e.key === 'Spacebar') {
        togglePause();
        return;
    }
    
    if (!isPlaying || isPaused) return;

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'RIGHT') nextDirection = 'LEFT';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'LEFT') nextDirection = 'RIGHT';
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'DOWN') nextDirection = 'UP';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'UP') nextDirection = 'DOWN';
            break;
    }
}

// Bei Sprachwechsel das Interface anpassen
document.addEventListener('langchange', () => {
    updateButtons();
    draw();
});

function initMobileControls() {
    const upBtn = document.getElementById('dpad-up');
    const leftBtn = document.getElementById('dpad-left');
    const rightBtn = document.getElementById('dpad-right');
    const downBtn = document.getElementById('dpad-down');

    if (!upBtn || !leftBtn || !rightBtn || !downBtn) return;

    const handlePress = (dir) => {
        if (!isPlaying) {
            startGame();
            return;
        }
        if (isPaused) {
            togglePause();
            return;
        }

        switch (dir) {
            case 'UP':
                if (direction !== 'DOWN') nextDirection = 'UP';
                break;
            case 'LEFT':
                if (direction !== 'RIGHT') nextDirection = 'LEFT';
                break;
            case 'RIGHT':
                if (direction !== 'LEFT') nextDirection = 'RIGHT';
                break;
            case 'DOWN':
                if (direction !== 'UP') nextDirection = 'DOWN';
                break;
        }
    };

    const addControlListener = (btn, dir) => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePress(dir);
        }, { passive: false });

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handlePress(dir);
        });
    };

    addControlListener(upBtn, 'UP');
    addControlListener(leftBtn, 'LEFT');
    addControlListener(rightBtn, 'RIGHT');
    addControlListener(downBtn, 'DOWN');
}

initMobileControls();
draw();
