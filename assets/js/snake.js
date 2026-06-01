/**
 * Modern Accessible Snake Game
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
let nextDirection = 'RIGHT'; // Queue next direction to prevent rapid double-taps causing self-collision
let score = 0;
let highscore = parseInt(localStorage.getItem('snake_highscore')) || 0;
let gameInterval;
let isPlaying = false;
let isPaused = false;
const speed = 150; // ms per tick

// Update highscore UI initially
if (highscoreEl) highscoreEl.textContent = highscore;

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
if (startBtn) startBtn.addEventListener('click', startGame);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

// Resize handler to ensure Canvas is sharp
function resizeCanvas() {
    cellWidth = canvas.width / cols;
    cellHeight = canvas.height / rows;
    draw();
}
window.addEventListener('resize', resizeCanvas);

function startGame() {
    if (isPlaying && !isPaused) return;
    
    if (isPaused) {
        // Resume
        isPaused = false;
        gameInterval = setInterval(gameStep, speed);
        updateButtons();
        return;
    }

    // Reset game state
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
    clearInterval(gameInterval);
    gameInterval = setInterval(gameStep, speed);
    
    updateButtons();
}

function togglePause() {
    if (!isPlaying) return;
    
    if (isPaused) {
        // Resume
        isPaused = false;
        gameInterval = setInterval(gameStep, speed);
    } else {
        // Pause
        isPaused = true;
        clearInterval(gameInterval);
    }
    updateButtons();
    draw();
}

function updateButtons() {
    if (startBtn) {
        startBtn.innerHTML = isPlaying ? '<i class="fa fa-refresh"></i> Reset' : '<i class="fa fa-play"></i> Start';
    }
    if (pauseBtn) {
        pauseBtn.disabled = !isPlaying;
        pauseBtn.innerHTML = isPaused ? '<i class="fa fa-play"></i> Fortsetzen' : '<i class="fa fa-pause"></i> Pause';
    }
}

function gameOver() {
    isPlaying = false;
    isPaused = false;
    clearInterval(gameInterval);
    
    // Check highscore
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('snake_highscore', highscore);
        if (highscoreEl) highscoreEl.textContent = highscore;
    }
    
    updateButtons();
    
    // Draw Game Over Screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ef4444'; // Red
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Punkte: ${score} | Highscore: ${highscore}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Klicke Start für eine neue Runde', canvas.width / 2, canvas.height / 2 + 50);
}

function gameStep() {
    direction = nextDirection;
    
    // Calculate new head position
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
    }
    
    // Wall Collision Check
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameOver();
        return;
    }
    
    // Self Collision Check
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Move snake head forward
    snake.unshift(head);
    
    // Food eaten check
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (scoreEl) scoreEl.textContent = score;
        placeFood();
    } else {
        // Remove tail if no food eaten
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
    // 1. Draw Canvas background with subtle grid
    ctx.fillStyle = '#0f172a'; // Deep slate blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtle grid lines
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

    // 2. Draw Food (Glowing Red Apple)
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
    ctx.shadowBlur = 0; // Reset shadow

    // 3. Draw Snake (Indigo Gradient Theme)
    snake.forEach((part, index) => {
        // Draw head differently
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#3b82f6' : '#60a5fa'; // Bright blue head, lighter blue body
        
        // Slightly round corners for a premium feel
        const x = part.x * cellWidth + 2;
        const y = part.y * cellHeight + 2;
        const w = cellWidth - 4;
        const h = cellHeight - 4;
        const r = 4; // Corner radius
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
        ctx.fill();
        
        // Eyes for the snake head
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

    // 4. Draw Pause screen overlay if paused
    if (isPaused) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
    }
    
    // 5. Ready state before playing
    if (!isPlaying && !isPaused) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#60a5fa';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Klicke Start zum Spielen', canvas.width / 2, canvas.height / 2);
    }
}

function handleKeyDown(e) {
    // Prevent scrolling default behavior for arrow keys
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

// Initial draw
draw();
