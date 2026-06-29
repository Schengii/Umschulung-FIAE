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
    },
    "sps-logic": {
        titleDe: "SPS Selbsthalteschaltung (SPS/PLC Simulator)",
        titleEn: "PLC Latch Circuit (PLC Simulator)",
        html: `<div class="sps-simulator">
    <h2>⚡ SPS / PLC Logik-Simulator ⚡</h2>
    <p>Simuliere eine Selbsthalteschaltung (Start/Stop-Latch-Schaltkreis) in Echtzeit.</p>
    
    <div class="field-panel">
        <div class="panel-section">
            <h3>Taster / Push Buttons</h3>
            <button id="s1-btn" class="push-button s1-no">START (S1 - Schließer)</button>
            <button id="s0-btn" class="push-button s0-nc">STOPP (S0 - Öffner)</button>
        </div>
        
        <div class="panel-section">
            <h3>Ausgang / Output</h3>
            <div class="motor-box">
                <div class="motor-icon" id="motor-indicator">⚙️</div>
                <div class="motor-label">Motor (Q0.0): <span id="q0-text">AUS / OFF</span></div>
            </div>
        </div>
    </div>

    <div class="ladder-diagram">
        <h3>Kontaktplan (KOP) / Ladder Diagram</h3>
        <div class="ladder-rung">
            <div class="rail left-rail"></div>
            
            <div class="rung-path">
                <div class="rung-branch">
                    <div class="branch-top path-segment" id="path-top">
                        <span class="contact no-contact" id="c-s1">S1 (Start)</span>
                    </div>
                    <div class="branch-bottom path-segment" id="path-bottom">
                        <span class="contact no-contact" id="c-q0">Q0.0</span>
                    </div>
                </div>
                <div class="rung-connector path-segment" id="path-connector"></div>
                <div class="rung-series path-segment" id="path-series">
                    <span class="contact nc-contact" id="c-s0">S0 (Stopp)</span>
                </div>
                <div class="rung-coil path-segment" id="path-coil">
                    <span class="coil" id="coil-q0">Q0.0</span>
                </div>
            </div>
            
            <div class="rail right-rail"></div>
        </div>
    </div>
</div>`,
        css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #0f172a;
    color: #f8fafc;
    margin: 0;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
.sps-simulator {
    width: 100%;
    max-width: 500px;
    background: #1e293b;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #334155;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
h2, h3 {
    text-align: center;
    margin-top: 0;
}
h2 {
    color: #38bdf8;
    font-size: 1.4rem;
}
h3 {
    font-size: 1.05rem;
    color: #94a3b8;
    border-bottom: 1px solid #334155;
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
}
.field-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}
.panel-section {
    background: #0f172a;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #334155;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.push-button {
    padding: 0.75rem;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.15s;
    user-select: none;
}
.s1-no {
    background: #064e3b;
    color: #6ee7b7;
    border: 2px solid #047857;
}
.s1-no.active {
    background: #059669;
    box-shadow: 0 0 12px #059669;
}
.s0-nc {
    background: #450a0a;
    color: #ef4444;
    border: 2px solid #b91c1c;
}
.s0-nc.active {
    background: #991b1b;
    color: #fca5a5;
}
.motor-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}
.motor-icon {
    font-size: 3rem;
    margin-bottom: 0.25rem;
    transition: transform 0.1s linear;
}
.motor-icon.running {
    animation: spin 2s infinite linear;
    text-shadow: 0 0 15px #10b981;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.motor-label {
    font-weight: bold;
}
.motor-label span {
    color: #ef4444;
    transition: color 0.15s;
}

/* Ladder diagram css */
.ladder-diagram {
    background: #0f172a;
    padding: 1.25rem;
    border-radius: 8px;
    border: 1px solid #334155;
}
.ladder-rung {
    display: flex;
    height: 100px;
    align-items: center;
}
.rail {
    width: 6px;
    height: 100%;
    background: #475569;
}
.left-rail { background: #ef4444; }
.right-rail { background: #3b82f6; }

.rung-path {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    height: 100%;
}
.rung-branch {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 70px;
    width: 140px;
    position: relative;
    margin-left: 10px;
}
.rung-branch::before {
    content: '';
    position: absolute;
    left: 0;
    top: 15px;
    bottom: 15px;
    width: 2px;
    background: #475569;
}
.rung-branch::after {
    content: '';
    position: absolute;
    right: 0;
    top: 15px;
    bottom: 15px;
    width: 2px;
    background: #475569;
}
.branch-top, .branch-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
}
.rung-connector {
    width: 20px;
    height: 2px;
    background: #475569;
}
.rung-series {
    width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.rung-coil {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.rung-coil::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    width: 35px;
    height: 2px;
    background: #475569;
}

/* Contacts and coils */
.contact, .coil {
    background: #1e293b;
    border: 2px solid #475569;
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
    font-weight: bold;
    user-select: none;
    position: relative;
}
.contact::before, .contact::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 10px;
    height: 2px;
    background: #475569;
}
.contact::before { left: -12px; }
.contact::after { right: -12px; }

/* NC Contact crossline */
.nc-contact::after {
    content: '';
    position: absolute;
    top: 10%;
    bottom: 10%;
    left: 48%;
    width: 2px;
    background: #ef4444;
    transform: rotate(25deg);
}

.coil {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

/* Active coloring */
.rung-branch.active-left::before { background: #ef4444; }
.rung-branch.active-right::after { background: #ef4444; }

.contact.active, .coil.active {
    border-color: #ef4444;
    color: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}
.left-rail {
    box-shadow: 2px 0 8px rgba(239, 68, 68, 0.3);
}`,
        js: `// Start/Stopp-Selbsthalteschaltung (SPS) Simulator
const s1Btn = document.getElementById('s1-btn');
const s0Btn = document.getElementById('s0-btn');
const indicator = document.getElementById('motor-indicator');
const q0Text = document.getElementById('q0-text');

const cS1 = document.getElementById('c-s1');
const cS0 = document.getElementById('c-s0');
const cQ0 = document.getElementById('c-q0');
const coilQ0 = document.getElementById('coil-q0');

const branch = document.querySelector('.rung-branch');
const pathTop = document.getElementById('path-top');
const pathBottom = document.getElementById('path-bottom');
const pathConnector = document.getElementById('path-connector');
const pathSeries = document.getElementById('path-series');
const pathCoil = document.getElementById('path-coil');

let S1 = false; // Start (NO)
let S0 = true;  // Stop (NC - true means contact is closed, i.e. current flows)
let Q0 = false; // Motor Output Coil

function updatePLC() {
    // PLC Logic: Q0 = (S1 || Q0) && S0
    Q0 = (S1 || Q0) && S0;
    
    // UI Push buttons
    if (S1) s1Btn.classList.add('active');
    else s1Btn.classList.remove('active');
    
    if (S0) s0Btn.classList.add('active'); // active when NC is closed (not pressed)
    else s0Btn.classList.remove('active'); // pressed = open

    // Output Motor
    if (Q0) {
        indicator.classList.add('running');
        q0Text.textContent = 'AN / ON';
        q0Text.style.color = '#10b981';
    } else {
        indicator.classList.remove('running');
        q0Text.textContent = 'AUS / OFF';
        q0Text.style.color = '#ef4444';
    }

    // Contacts
    if (S1) cS1.classList.add('active');
    else cS1.classList.remove('active');

    if (Q0) cQ0.classList.add('active');
    else cQ0.classList.remove('active');

    if (S0) cS0.classList.add('active');
    else cS0.classList.remove('active');

    if (Q0) coilQ0.classList.add('active');
    else coilQ0.classList.remove('active');

    // Visual current path flow
    const topActive = S1;
    const bottomActive = Q0;
    const branchActive = topActive || bottomActive;
    
    pathTop.style.background = topActive ? '#ef4444' : '';
    pathBottom.style.background = bottomActive ? '#ef4444' : '';

    if (branchActive) {
        branch.classList.add('active-left', 'active-right');
        pathConnector.style.background = '#ef4444';
    } else {
        branch.classList.remove('active-left', 'active-right');
        pathConnector.style.background = '';
    }

    const seriesActive = branchActive && S0;
    pathSeries.style.background = seriesActive ? '#ef4444' : '';
    pathCoil.style.background = seriesActive ? '#ef4444' : '';
}

// S1 logic: NO Switch
s1Btn.addEventListener('mousedown', () => { S1 = true; console.log('INPUT: S1 geschlossen (Start gedrückt)'); updatePLC(); });
s1Btn.addEventListener('mouseup', () => { S1 = false; console.log('INPUT: S1 geöffnet (Start losgelassen)'); updatePLC(); });
s1Btn.addEventListener('mouseleave', () => { if (S1) { S1 = false; updatePLC(); } });

s1Btn.addEventListener('touchstart', (e) => { e.preventDefault(); S1 = true; updatePLC(); });
s1Btn.addEventListener('touchend', () => { S1 = false; updatePLC(); });

// S0 logic: NC Switch (Open on click)
s0Btn.addEventListener('mousedown', () => { S0 = false; console.log('INPUT: S0 geöffnet (Stopp gedrückt)'); updatePLC(); });
s0Btn.addEventListener('mouseup', () => { S0 = true; console.log('INPUT: S0 geschlossen (Stopp losgelassen)'); updatePLC(); });
s0Btn.addEventListener('mouseleave', () => { if (!S0) { S0 = true; updatePLC(); } });

s0Btn.addEventListener('touchstart', (e) => { e.preventDefault(); S0 = false; updatePLC(); });
s0Btn.addEventListener('touchend', () => { S0 = true; updatePLC(); });

updatePLC();
console.log('SPS-Selbsthalteschaltungs-Simulator initialisiert.');
console.log('Ausgang Q0.0 = (Start S1 ODER Selbsthaltung Q0.0) UND Stopp S0');`
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
