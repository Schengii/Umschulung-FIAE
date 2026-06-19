/**
 * Code Playground / Sandbox Logic
 * Handles HTML/CSS/JS tab compilation, template injections,
 * and intercepts console logs/errors from iFrame to display them in a mock console.
 */

const PLAYGROUND_TEMPLATES = {
    counter: {
        titleDe: "Zähler-Button (Interactive Button)",
        titleEn: "Counter Button (Interactive Button)",
        html: `<div class="app-container">
    <h2>Zähler-Demo</h2>
    <p>Klicke auf den Button, um den Wert zu erhöhen!</p>
    <button id="counter-btn" class="btn">Klicks: <span id="count">0</span></button>
</div>`,
        css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background: #0f172a;
    color: #f8fafc;
}
.app-container {
    text-align: center;
    padding: 2rem;
    background: #1e293b;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1px solid #334155;
}
.btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: transform 0.15s, box-shadow 0.15s;
}
.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
.btn:active {
    transform: translateY(0);
}`,
        js: `// Button Zähler-Logik
const button = document.getElementById('counter-btn');
const display = document.getElementById('count');
let count = 0;

button.addEventListener('click', () => {
    count++;
    display.textContent = count;
    console.log('Button geklickt! Neuer Zählerstand:', count);

    // Audio-Effekt simulieren im iFrame
    if (count % 10 === 0) {
        console.log('🎉 Jubiläum! 10er Marke erreicht!');
    }
});`
    },
    flexbox: {
        titleDe: "CSS Flexbox Layout-Switcher",
        titleEn: "CSS Flexbox Layout Switcher",
        html: `<div class="container">
    <div class="controls">
        <button id="toggle-dir-btn">Layout umschalten (Direction)</button>
    </div>
    <div class="flex-wrapper" id="flex-wrapper">
        <div class="box box-1">Box 1</div>
        <div class="box box-2">Box 2</div>
        <div class="box box-3">Box 3</div>
    </div>
</div>`,
        css: `body {
    font-family: sans-serif;
    margin: 0;
    background: #111827;
    color: #f3f4f6;
    padding: 1.5rem;
}
.container {
    max-width: 800px;
    margin: 0 auto;
}
.controls {
    margin-bottom: 1rem;
}
button {
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}
.flex-wrapper {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    background: #1f2937;
    padding: 1rem;
    border-radius: 8px;
    border: 2px dashed #4b5563;
    transition: flex-direction 0.3s ease;
    min-height: 200px;
}
.box {
    flex: 1;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border-radius: 6px;
    color: white;
    font-size: 1.2rem;
}
.box-1 { background: #ef4444; }
.box-2 { background: #3b82f6; }
.box-3 { background: #f59e0b; }`,
        js: `// Flexbox Umschalter
const wrapper = document.getElementById('flex-wrapper');
const button = document.getElementById('toggle-dir-btn');

button.addEventListener('click', () => {
    const currentDir = wrapper.style.flexDirection || 'row';
    const nextDir = currentDir === 'row' ? 'column' : 'row';
    wrapper.style.flexDirection = nextDir;
    console.log('Flex-direction geändert zu:', nextDir);
});`
    },
    canvas: {
        titleDe: "HTML5 Canvas Ball-Physik",
        titleEn: "HTML5 Canvas Ball Physics",
        html: `<div class="canvas-container">
    <h3>Bouncing Ball (Physics Loop)</h3>
    <canvas id="physics-canvas" width="400" height="250"></canvas>
    <p class="desc">Klicke in den Canvas, um den Ball nach oben zu kicken!</p>
</div>`,
        css: `body {
    font-family: Arial, sans-serif;
    background: #18181b;
    color: #e4e4e7;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
.canvas-container {
    text-align: center;
}
canvas {
    background: #09090b;
    border: 2px solid #27272a;
    border-radius: 8px;
    cursor: pointer;
}
.desc {
    font-size: 0.85rem;
    color: #a1a1aa;
}`,
        js: `// Canvas Physik Loop
const canvas = document.getElementById('physics-canvas');
const ctx = canvas.getContext('2d');

let ball = {
    x: 200,
    y: 50,
    radius: 16,
    vx: 3,
    vy: 0,
    gravity: 0.2,
    bounce: 0.75
};

canvas.addEventListener('click', () => {
    ball.vy = -6; // Kick up!
    console.log('⚽ Ball gekickt! Y-Geschwindigkeit:', ball.vy);
});

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Physics update
    ball.vy += ball.gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Boundary collision X
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.vx = -ball.vx;
        ball.x = ball.x + ball.radius > canvas.width ? canvas.width - ball.radius : ball.radius;
    }
    
    // Boundary collision Y
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy * ball.bounce;
        // Stop tiny wobbles
        if (Math.abs(ball.vy) < 1) ball.vy = 0;
    }
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.closePath();
    
    requestAnimationFrame(draw);
}

console.log('Physik-Simulation gestartet.');
draw();`
    }
};

class CodePlayground {
    constructor() {
        this.activeTab = 'html';
        this.runTimeout = null;

        this.htmlEditor = document.getElementById('editor-html');
        this.cssEditor = document.getElementById('editor-css');
        this.jsEditor = document.getElementById('editor-js');
        this.previewIframe = document.getElementById('preview-iframe');
        this.consoleLogBox = document.getElementById('console-log-box');
        
        this.btnHtml = document.getElementById('btn-tab-html');
        this.btnCss = document.getElementById('btn-tab-css');
        this.btnJs = document.getElementById('btn-tab-js');
        
        this.runBtn = document.getElementById('run-code-btn');
        this.clearConsoleBtn = document.getElementById('clear-console-btn');

        this.init();
    }

    init() {
        // Tab switching listeners
        if (this.btnHtml) this.btnHtml.addEventListener('click', () => this.switchTab('html'));
        if (this.btnCss) this.btnCss.addEventListener('click', () => this.switchTab('css'));
        if (this.btnJs) this.btnJs.addEventListener('click', () => this.switchTab('js'));

        // Input listeners for Auto-run (debounced)
        const editors = [this.htmlEditor, this.cssEditor, this.jsEditor];
        editors.forEach(ed => {
            if (ed) {
                ed.addEventListener('input', () => {
                    clearTimeout(this.runTimeout);
                    this.runTimeout = setTimeout(() => this.runCode(), 1000);
                });
            }
        });

        // Run button
        if (this.runBtn) {
            this.runBtn.addEventListener('click', () => {
                this.runCode();
                this.addPlaygroundCommit();
            });
        }

        // Clear console
        if (this.clearConsoleBtn) {
            this.clearConsoleBtn.addEventListener('click', () => {
                if (this.consoleLogBox) this.consoleLogBox.innerHTML = '';
            });
        }

        // Message receiver from iFrame
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'CONSOLE_LOG') {
                this.appendLog(e.data.message, 'log');
            } else if (e.data && e.data.type === 'CONSOLE_ERROR') {
                this.appendLog(e.data.message, 'error');
            }
        });

        // Bind Template selection
        const templateBtns = document.querySelectorAll('.template-select-btn');
        templateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templKey = btn.getAttribute('data-template');
                this.loadTemplate(templKey);
            });
        });

        // Load initial template
        this.loadTemplate('counter');
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        this.btnHtml.classList.remove('active');
        this.btnCss.classList.remove('active');
        this.btnJs.classList.remove('active');
        
        if (tab === 'html') this.btnHtml.classList.add('active');
        if (tab === 'css') this.btnCss.classList.add('active');
        if (tab === 'js') this.btnJs.classList.add('active');

        // Show active editor
        this.htmlEditor.classList.add('collapsed');
        this.cssEditor.classList.add('collapsed');
        this.jsEditor.classList.add('collapsed');

        if (tab === 'html') this.htmlEditor.classList.remove('collapsed');
        if (tab === 'css') this.cssEditor.classList.remove('collapsed');
        if (tab === 'js') this.jsEditor.classList.remove('collapsed');
    }

    loadTemplate(key) {
        const templ = PLAYGROUND_TEMPLATES[key];
        if (!templ) return;

        if (this.htmlEditor) this.htmlEditor.value = templ.html;
        if (this.cssEditor) this.cssEditor.value = templ.css;
        if (this.jsEditor) this.jsEditor.value = templ.js;

        if (this.consoleLogBox) {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const welcomeMsg = lang === 'de' 
                ? `System: Template "${templ.titleDe}" geladen.` 
                : `System: Template "${templ.titleEn}" loaded.`;
            this.consoleLogBox.innerHTML = `<div class="console-entry system">[Info] ${welcomeMsg}</div>`;
        }

        this.runCode();
        this.addPlaygroundCommit();
    }

    runCode() {
        if (!this.previewIframe) return;

        const html = this.htmlEditor ? this.htmlEditor.value : '';
        const css = this.cssEditor ? this.cssEditor.value : '';
        const js = this.jsEditor ? this.jsEditor.value : '';

        // Combined content with Console Interceptor Script
        const compiledSource = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    ${css}
                </style>
                <script>
                    // Intercept logs and send them to parent window
                    const _log = console.log;
                    console.log = function(...args) {
                        window.parent.postMessage({ type: 'CONSOLE_LOG', message: args.join(' ') }, '*');
                        _log.apply(console, args);
                    };
                    window.onerror = function(message, source, lineno, colno, error) {
                        window.parent.postMessage({ type: 'CONSOLE_ERROR', message: message + " (Zeile / Line " + lineno + ")" }, '*');
                    };
                </script>
            </head>
            <body>
                ${html}
                <script>
                    try {
                        ${js}
                    } catch (err) {
                        window.parent.postMessage({ type: 'CONSOLE_ERROR', message: err.message }, '*');
                    }
                </script>
            </body>
            </html>
        `;

        // Set srcdoc
        this.previewIframe.srcdoc = compiledSource;

        // Play audio feed back if available
        if (typeof GameAudio !== 'undefined') {
            GameAudio.play('match');
        }
    }

    appendLog(message, type) {
        if (!this.consoleLogBox) return;

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;

        this.consoleLogBox.appendChild(entry);
        this.consoleLogBox.scrollTop = this.consoleLogBox.scrollHeight;
    }

    addPlaygroundCommit() {
        if (window.addLiveCommit) {
            window.addLiveCommit();
        } else {
            let liveCommitsToday = parseInt(StorageManager.getItem('github_live_commits_today', 0)) || 0;
            liveCommitsToday++;
            StorageManager.setItem('github_live_commits_today', liveCommitsToday);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CodePlayground();
});
