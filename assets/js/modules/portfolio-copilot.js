/**
 * @file portfolio-copilot.js
 * @description Lokaler, 100% offline-fähiger KI-Portfolio-Copilot für Recruiter und Prüfer
 */

/**
 * Resolves internal page URLs correctly regardless of whether the current page
 * is in root (index.html) or in the /pages/ subdirectory.
 */
function resolvePageLink(targetPage) {
    if (!targetPage) return '#';
    if (targetPage.startsWith('http://') || targetPage.startsWith('https://') || targetPage.startsWith('#')) {
        return targetPage;
    }
    const path = window.location.pathname;
    const isPagesFolder = path.includes('/pages/') || path.includes('\\pages\\');
    if (isPagesFolder) {
        return targetPage;
    }
    return 'pages/' + targetPage;
}

const KNOWLEDGE_BASE = [
    {
        keywords: ['wer', 'kontakt', 'profil', 'person', 'maximilian', 'schenk', 'vorstellung', 'who', 'about', 'contact', 'developer'],
        responseDe: `Maximilian Schenk ist angehender <strong>Fachinformatiker für Anwendungsentwicklung (FIAE)</strong> mit IHK-Abschluss 2026. Zuvor erfolgreich als Elektroniker für Betriebstechnik tätig, kombiniert er tiefes Hardware-/Systemverständnis mit moderner Fullstack-Softwareentwicklung (TypeScript, C++, C#, Python, SQL).`,
        responseEn: `Maximilian Schenk is an aspiring <strong>IT Specialist for Application Development (FIAE)</strong> graduating in 2026. Formerly an electronics technician for industrial engineering, he bridges deep hardware & systems knowledge with modern full-stack development (TypeScript, C++, C#, Python, SQL).`,
        link: 'ueber-mich.html',
        linkTextDe: 'Über mich & Transfermatrix',
        linkTextEn: 'About Me & Transfer Matrix'
    },
    {
        keywords: ['abschluss', 'projekt', 'ihk', 'ecochef', 'antrag', 'doku', 'phasenplan', 'thesis', 'graduation'],
        responseDe: `Das IHK-Abschlussprojekt ist <strong>EcoChef</strong>: Ein KI-gestützter Rezept- & Nachhaltigkeitsplaner als PWA (Lit 3.x, TypeScript, Gemini KI API & IndexedDB) nach Clean Architecture, mit vollständiger Nutzwertanalyse und 80h Phasenplan.`,
        responseEn: `The IHK graduation project is <strong>EcoChef</strong>: An AI-driven recipe and sustainability planner built as a PWA (Lit 3.x, TypeScript, Gemini AI API & IndexedDB) following Clean Architecture with utility analysis and an 80-hour phase plan.`,
        link: 'ihk-cockpit.html',
        linkTextDe: 'IHK-Cockpit & EcoChef Doku',
        linkTextEn: 'IHK Cockpit & Documentation'
    },
    {
        keywords: ['react', 'web', 'frontend', 'typescript', 'javascript', 'html', 'css', 'pwa', 'lit', 'vite'],
        responseDe: `Im Web-/Frontend-Bereich nutzt Maximilian u.a. <strong>React 19, TypeScript, Lit Web Components, Vite und Tailwind/Vanilla CSS</strong>. Zu den Vorzeigeprojekten gehören *EcoChef*, *ElektroCheck AI*, *Finanzenportfolio* und *Urlaubsfotos*.`,
        responseEn: `In frontend & web technologies, Maximilian works with <strong>React 19, TypeScript, Lit Web Components, Vite, and modern CSS</strong>. Showcase projects include *EcoChef*, *ElektroCheck AI*, *Finanzenportfolio*, and *Urlaubsfotos*.`,
        link: 'portfolio.html?filter=web',
        linkTextDe: 'Web & PWA Projekte im Portfolio',
        linkTextEn: 'Web & PWA Projects'
    },
    {
        keywords: ['c++', 'c#', 'godot', 'engine', 'game', 'opengl', 'minecraft', 'spiele', 'games', 'gaming'],
        responseDe: `Für System- und Spieleprogrammierung setzt Maximilian auf <strong>C++20 mit OpenGL 4.5</strong> (eigene 3D Voxel Engine mit Biomen und Redstone) sowie <strong>Godot 4.x mit C# .NET</strong> (RPG *Minecraft-Pokemon*, *Orbital Scrap*).`,
        responseEn: `For systems and game programming, Maximilian utilizes <strong>C++20 with OpenGL 4.5</strong> (custom 3D voxel engine with biomes & redstone logic) and <strong>Godot 4.x with C# .NET</strong> (RPG *Minecraft-Pokemon*, *Orbital Scrap*).`,
        link: 'portfolio.html?filter=game',
        linkTextDe: 'C++ & Godot Games im Portfolio',
        linkTextEn: 'C++ & Godot Games'
    },
    {
        keywords: ['sql', 'datenbank', 'db', 'normalisierung', 'postgresql', 'sqlite', 'er-modell', 'database', 'postgres'],
        responseDe: `Maximilian beherrscht <strong>relationale Datenmodellierung (1NF bis 3NF)</strong>, komplexe SQL-Joins, Subqueries und Index-Optimierung (PostgreSQL, SQLite) und wendet diese in Fullstack-Projekten an.`,
        responseEn: `Maximilian is proficient in <strong>relational data modeling (1NF–3NF)</strong>, complex joins, subqueries, and index optimizations (PostgreSQL, SQLite) applied in full-stack projects.`,
        link: 'portfolio.html',
        linkTextDe: 'Datenbank-Projekte im Portfolio',
        linkTextEn: 'View Database Projects'
    },
    {
        keywords: ['ki', 'ai', 'gemini', 'openai', 'nlp', 'machine learning', 'bot', 'llm', 'copilot'],
        responseDe: `Im KI-Bereich hat Maximilian praktische Apps mit <strong>Google Gemini API, OpenAI API und lokalem NLP</strong> entwickelt: *EcoChef* (Rezept-KI), *ElektroCheck AI* (intelligente Prüfberichtsanalyse) und *finance-ai-bot*.`,
        responseEn: `In AI engineering, Maximilian has built production apps with <strong>Google Gemini API, OpenAI API, and local NLP algorithms</strong>: *EcoChef* (recipe AI), *ElektroCheck AI* (automated test report audit), and *finance-ai-bot*.`,
        link: 'portfolio.html?filter=ki',
        linkTextDe: 'Alle KI & AI-Projekte ansehen',
        linkTextEn: 'View All AI Projects'
    },
    {
        keywords: ['zeugnis', 'noten', 'gehalt', 'lebenslauf', 'cv', 'zertifikat', 'resume', 'grades', 'certificate'],
        responseDe: `Der Lebenslauf und alle Arbeits-/IHK-Zwischenzeugnisse sind auf der Lebenslauf-Seite hinterlegt. Vertrauliche Zeugnisse und Gehaltsangaben sind token-geschützt (Passwort: <code>fiae2026</code>).`,
        responseEn: `The CV, references, and intermediate IHK certificates are available on the resume page. Confidential certificates & salary expectations are token-protected (Access: <code>fiae2026</code>).`,
        link: 'lebenslauf.html',
        linkTextDe: 'Zum interaktiven Lebenslauf',
        linkTextEn: 'View Interactive CV'
    },
    {
        keywords: ['git', 'version', 'branch', 'merge', 'rebase', 'workflow', 'github'],
        responseDe: `Maximilian nutzt professionelle Git-Workflows (Feature-Branching, Rebase, Tags, Conventional Commits). Seine Git-Kenntnisse sind im Retro-CRT Git Simulator mit 6 Leveln visualisiert!`,
        responseEn: `Maximilian applies production Git workflows (feature branching, rebase, tagging, conventional commits). You can test his command-line mastery in the interactive Git Simulator!`,
        link: 'git-simulator.html',
        linkTextDe: 'Git-Simulator ausprobieren',
        linkTextEn: 'Try Git Simulator'
    }
];

export function initPortfolioCopilot() {
    injectCopilotWidget();
    attachCopilotEvents();
}

function injectCopilotWidget() {
    if (document.getElementById('portfolio-copilot-container')) return;

    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'de';

    const container = document.createElement('div');
    container.id = 'portfolio-copilot-container';
    container.setAttribute('role', 'complementary');
    container.setAttribute('aria-label', 'FIAE AI Copilot');

    container.innerHTML = `
        <!-- Floating Toggle Button -->
        <button id="copilot-toggle-btn" class="btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="copilot-chat-box" aria-label="FIAE AI Copilot öffnen" title="FIAE AI Copilot Chat">
            <span class="copilot-btn-icon">🤖</span>
            <span class="copilot-btn-text">FIAE AI Copilot</span>
            <span class="copilot-pulse-dot" aria-hidden="true"></span>
        </button>

        <!-- Chat Modal / Drawer -->
        <div id="copilot-chat-box" class="card" role="dialog" aria-modal="true" aria-labelledby="copilot-dialog-title" style="display: none;">
            <!-- Header -->
            <div class="copilot-header">
                <div class="copilot-header-left">
                    <div class="copilot-avatar-badge" aria-hidden="true">🤖</div>
                    <div>
                        <div id="copilot-dialog-title" class="copilot-header-title">FIAE Portfolio Copilot</div>
                        <div class="copilot-header-status">
                            <span class="copilot-pulse-dot" style="width:6px;height:6px;" aria-hidden="true"></span>
                            <span>100% Offline / Client-Side</span>
                        </div>
                    </div>
                </div>
                <div class="copilot-header-actions">
                    <button type="button" id="copilot-clear-btn" class="copilot-icon-btn" title="Chat zurücksetzen" aria-label="Chat zurücksetzen">
                        <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
                    </button>
                    <button type="button" id="copilot-close-btn" class="copilot-icon-btn" title="Schließen" aria-label="Copilot Chat schließen">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Message History -->
            <div id="copilot-messages" role="log" aria-live="polite">
                <div class="copilot-msg bot">
                    ${currentLang === 'en' 
                        ? 'Hello! I am Maximilian’s Portfolio Copilot. Feel free to ask anything about his skills, projects (C++, React, Godot, AI, SQL), or his IHK graduation project!' 
                        : 'Hallo! Ich bin der Portfolio-Copilot. Frag mich gerne alles zu Maximilians Fähigkeiten, Projekten (C++, React, Godot, KI, SQL) oder dem IHK-Abschlussprojekt!'}
                </div>

                <!-- Suggestion Chips -->
                <div id="copilot-suggestions">
                    <button type="button" class="copilot-chip" data-query="Welche C++ und Godot Projekte gibt es?">🎮 C++ & Godot</button>
                    <button type="button" class="copilot-chip" data-query="Erzähle mir vom IHK Abschlussprojekt EcoChef">🎓 IHK EcoChef</button>
                    <button type="button" class="copilot-chip" data-query="Welche Erfahrungen gibt es mit SQL und Datenbanken?">🗄️ SQL & DBs</button>
                    <button type="button" class="copilot-chip" data-query="Welche KI und Machine Learning Apps wurden gebaut?">🤖 KI & AI</button>
                    <button type="button" class="copilot-chip" data-query="Zeige mir den Lebenslauf und Zeugnisse">📄 CV & Zeugnisse</button>
                </div>
            </div>

            <!-- Input Bar -->
            <form id="copilot-form">
                <input type="text" id="copilot-input" placeholder="${currentLang === 'en' ? 'Ask a question...' : 'Frage eingeben...'}" aria-label="Nachricht an Copilot" autocomplete="off">
                <button type="submit" class="copilot-send-btn" aria-label="Senden" title="Senden">
                    <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(container);
}

function attachCopilotEvents() {
    const toggleBtn = document.getElementById('copilot-toggle-btn');
    const chatBox = document.getElementById('copilot-chat-box');
    const closeBtn = document.getElementById('copilot-close-btn');
    const clearBtn = document.getElementById('copilot-clear-btn');
    const form = document.getElementById('copilot-form');
    const input = document.getElementById('copilot-input');
    const messages = document.getElementById('copilot-messages');

    if (toggleBtn && chatBox) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = chatBox.style.display === 'flex';
            if (isVisible) {
                closeChatBox();
            } else {
                openChatBox();
            }
        });
    }

    function openChatBox() {
        if (!chatBox) return;
        chatBox.style.display = 'flex';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        if (input) setTimeout(() => input.focus(), 50);
        if (messages) messages.scrollTop = messages.scrollHeight;
    }

    function closeChatBox() {
        if (!chatBox) return;
        chatBox.style.display = 'none';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatBox();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            resetChatHistory();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatBox && chatBox.style.display === 'flex') {
            closeChatBox();
        }
    });

    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            handleUserQuery(text);
            input.value = '';
        });
    }

    // Suggestion Chips Click
    document.addEventListener('click', (e) => {
        const chip = e.target.closest('.copilot-chip');
        if (chip) {
            const query = chip.dataset.query;
            if (query) {
                handleUserQuery(query);
            }
        }
    });
}

function resetChatHistory() {
    const messages = document.getElementById('copilot-messages');
    if (!messages) return;

    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'de';
    messages.innerHTML = `
        <div class="copilot-msg bot">
            ${currentLang === 'en' 
                ? 'Chat reset. How else can I help you regarding Maximilian’s portfolio and projects?' 
                : 'Chat zurückgesetzt. Wie kann ich dir noch zu Maximilians Profil, Projekten und IHK-Abschluss weiterhelfen?'}
        </div>
        <div id="copilot-suggestions">
            <button type="button" class="copilot-chip" data-query="Welche C++ und Godot Projekte gibt es?">🎮 C++ & Godot</button>
            <button type="button" class="copilot-chip" data-query="Erzähle mir vom IHK Abschlussprojekt EcoChef">🎓 IHK EcoChef</button>
            <button type="button" class="copilot-chip" data-query="Welche Erfahrungen gibt es mit SQL und Datenbanken?">🗄️ SQL & DBs</button>
            <button type="button" class="copilot-chip" data-query="Welche KI und Machine Learning Apps wurden gebaut?">🤖 KI & AI</button>
            <button type="button" class="copilot-chip" data-query="Zeige mir den Lebenslauf und Zeugnisse">📄 CV & Zeugnisse</button>
        </div>
    `;
}

function handleUserQuery(queryText) {
    const messages = document.getElementById('copilot-messages');
    if (!messages) return;

    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'de';

    // Append user message bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'copilot-msg user';
    userMsg.textContent = queryText;
    messages.appendChild(userMsg);

    // Show animated typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'copilot-msg bot copilot-typing';
    typingIndicator.id = 'copilot-typing-indicator';
    typingIndicator.innerHTML = `
        <span class="copilot-typing-dot"></span>
        <span class="copilot-typing-dot"></span>
        <span class="copilot-typing-dot"></span>
    `;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    // Find best match in knowledge base
    const lower = queryText.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        for (const kw of item.keywords) {
            if (lower.includes(kw)) {
                score += kw.length > 3 ? 2 : 1;
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    }

    // Generate bot reply after a realistic micro-delay
    setTimeout(() => {
        const indicator = document.getElementById('copilot-typing-indicator');
        if (indicator) indicator.remove();

        const botMsg = document.createElement('div');
        botMsg.className = 'copilot-msg bot';

        if (bestMatch && maxScore > 0) {
            const respText = currentLang === 'en' && bestMatch.responseEn ? bestMatch.responseEn : bestMatch.responseDe;
            const btnText = currentLang === 'en' && bestMatch.linkTextEn ? bestMatch.linkTextEn : bestMatch.linkTextDe;
            const resolvedUrl = resolvePageLink(bestMatch.link);

            botMsg.innerHTML = `
                <div>${respText}</div>
                <div>
                    <a href="${resolvedUrl}" class="copilot-link-btn">
                        <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        <span>${btnText}</span>
                    </a>
                </div>
            `;
        } else {
            botMsg.innerHTML = currentLang === 'en'
                ? `<div>Thanks for your question! Maximilian has built hands-on projects in <strong>C++ (OpenGL), Godot (C#), TypeScript (React/Lit), Python, and SQL</strong>. Feel free to pick a suggestion or visit the <a href="${resolvePageLink('portfolio.html')}" class="copilot-link-btn">Portfolio</a> directly!</div>`
                : `<div>Danke für deine Frage! Maximilian hat praxisnahe Projekte in <strong>C++ (OpenGL), Godot (C#), TypeScript (React/Lit), Python und SQL</strong> entwickelt. Wähle gerne ein Thema oben aus oder springe direkt ins <a href="${resolvePageLink('portfolio.html')}" class="copilot-link-btn">Portfolio</a>.</div>`;
        }

        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 280);
}
