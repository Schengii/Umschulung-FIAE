/**
 * @file portfolio-copilot.js
 * @description Lokaler, 100% offline-fähiger KI-Portfolio-Copilot für Recruiter und Prüfer
 */

const KNOWLEDGE_BASE = [
  {
    keywords: ['wer', 'kontakt', 'profil', 'person', 'maximilian', 'schenk', 'vorstellung'],
    response: `Maximilian Schenk ist angehender <strong>Fachinformatiker für Anwendungsentwicklung (FIAE)</strong> mit IHK-Abschluss 2026. Zuvor erfolgreich als Elektroniker für Betriebstechnik tätig, kombiniert er tiefes Hardware-/Systemverständnis mit moderner Fullstack-Softwareentwicklung (TypeScript, C++, C#, Python, SQL).`,
    link: 'ueber-mich.html',
    linkText: 'Über mich & Transfermatrix ansehen'
  },
  {
    keywords: ['abschluss', 'projekt', 'ihk', 'ecochef', 'antrag', 'doku', 'phasenplan'],
    response: `Das IHK-Abschlussprojekt ist <strong>EcoChef</strong>: Ein KI-gestützter Rezept- & Nachhaltigkeitsplaner als PWA (Lit 3.x, TypeScript, Gemini KI API & IndexedDB) nach Clean Architecture, mit vollständiger Nutzwertanalyse und 80h Phasenplan.`,
    link: 'ihk-cockpit.html',
    linkText: 'IHK-Cockpit & EcoChef Dokumentation'
  },
  {
    keywords: ['react', 'web', 'frontend', 'typescript', 'javascript', 'html', 'css', 'pwa'],
    response: `Im Web-/Frontend-Bereich nutzt Maximilian u.a. <strong>React 19, TypeScript, Lit Web Components, Vite und Tailwind/Vanilla CSS</strong>. Zu den Vorzeigeprojekten gehören *EcoChef*, *ElektroCheck AI*, *Finanzenportfolio* und *Urlaubsfotos*.`,
    link: 'portfolio.html?filter=web',
    linkText: 'Web & PWA Projekte im Portfolio'
  },
  {
    keywords: ['c++', 'c#', 'godot', 'engine', 'game', 'opengl', 'minecraft', 'spiele'],
    response: `Für System- und Spieleprogrammierung setzt Maximilian auf <strong>C++20 mit OpenGL 4.5</strong> (eigene 3D Voxel Engine mit Biomen und Redstone) sowie <strong>Godot 4.x mit C# .NET</strong> (RPG *Minecraft-Pokemon*, *Orbital Scrap*).`,
    link: 'portfolio.html?filter=game',
    linkText: 'C++ & Godot Game Projects anzeigen'
  },
  {
    keywords: ['sql', 'datenbank', 'db', 'normalisierung', 'postgresql', 'sqlite', 'er-modell'],
    response: `Maximilian beherrscht <strong>relationale Datenmodellierung (1NF bis 3NF)</strong>, komplexe SQL-Joins, Subqueries und Index-Optimierung (PostgreSQL, SQLite). Du kannst seine SQL-Skills direkt im In-Browser Playground testen!`,
    link: 'playground.html',
    linkText: 'Zum interaktiven SQL-Playground'
  },
  {
    keywords: ['ki', 'ai', 'gemini', 'openai', 'nlp', 'machine learning', 'bot'],
    response: `Im KI-Bereich hat Maximilian praktische Apps mit <strong>Google Gemini API, OpenAI API und lokalem NLP</strong> entwickelt: *EcoChef* (Rezept-KI), *ElektroCheck AI* (intelligente Prüfberichtsanalyse) und *finance-ai-bot*.`,
    link: 'portfolio.html?filter=ki',
    linkText: 'Alle KI & AI-Projekte ansehen'
  },
  {
    keywords: ['zeugnis', 'noten', 'gehalt', 'lebenslauf', 'cv', 'zertifikat'],
    response: `Der Lebenslauf und alle Arbeits-/IHK-Zwischenzeugnisse sind auf der Lebenslauf-Seite hinterlegt. Vertrauliche Zeugnisse und Gehaltsangaben sind token-geschützt (Passwort: <code>fiae2026</code>).`,
    link: 'lebenslauf.html',
    linkText: 'Zum interaktiven Lebenslauf'
  },
  {
    keywords: ['git', 'version', 'branch', 'merge', 'rebase', 'workflow'],
    response: `Maximilian nutzt professionelle Git-Workflows (Feature-Branching, Rebase, Tags, Conventional Commits). Seine Git-Kenntnisse sind im Retro-CRT Git Simulator mit 6 Leveln visualisiert!`,
    link: 'git-simulator.html',
    linkText: 'Git-Befehlssimulator ausprobieren'
  }
];

export function initPortfolioCopilot() {
  injectCopilotWidget();
  attachCopilotEvents();
}

function injectCopilotWidget() {
  if (document.getElementById('portfolio-copilot-container')) return;

  const container = document.createElement('div');
  container.id = 'portfolio-copilot-container';
  container.innerHTML = `
    <!-- Floating Toggle Button -->
    <button id="copilot-toggle-btn" class="btn btn-primary" style="position: fixed; bottom: 85px; right: 24px; z-index: 9990; border-radius: 9999px; padding: 0.65rem 1.1rem; box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5); display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer;">
      <span style="font-size: 1.2rem;">🤖</span>
      <span class="copilot-btn-text">FIAE AI Copilot</span>
    </button>

    <!-- Chat Modal / Drawer -->
    <div id="copilot-chat-box" class="card" style="display: none; position: fixed; bottom: 145px; right: 24px; width: 380px; max-width: calc(100vw - 32px); height: 500px; max-height: calc(100vh - 180px); z-index: 9995; flex-direction: column; padding: 0; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.5); background: var(--bg-card, #1e293b);">
      <!-- Header -->
      <div style="padding: 0.75rem 1rem; background: rgba(14, 165, 233, 0.1); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">🤖</span>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">FIAE Portfolio Copilot</div>
            <div style="font-size: 0.75rem; color: #10b981; display: flex; align-items: center; gap: 0.25rem;">
              <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
              100% Offline / Client-side
            </div>
          </div>
        </div>
        <button id="copilot-close-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; padding: 0.2rem 0.5rem;">✕</button>
      </div>

      <!-- Message History -->
      <div id="copilot-messages" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
        <div class="copilot-msg bot" style="background: rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: 12px 12px 12px 2px; border: 1px solid var(--border-color); line-height: 1.5;">
          Hallo! Ich bin der Portfolio-Copilot. Frag mich gerne alles zu Maximilians Fähigkeiten, Projekten (C++, React, Godot, KI, SQL) oder dem IHK-Abschlussprojekt!
        </div>

        <!-- Suggestion Chips -->
        <div id="copilot-suggestions" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem;">
          <button class="copilot-chip" data-query="Welche C++ und Godot Projekte gibt es?" style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 9999px; padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--accent-color); cursor: pointer;">🎮 C++ & Godot</button>
          <button class="copilot-chip" data-query="Erzähle mir vom IHK Abschlussprojekt EcoChef" style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 9999px; padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--accent-color); cursor: pointer;">🎓 IHK EcoChef</button>
          <button class="copilot-chip" data-query="Welche Erfahrungen gibt es mit SQL und Datenbanken?" style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 9999px; padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--accent-color); cursor: pointer;">🗄️ SQL & DBs</button>
          <button class="copilot-chip" data-query="Welche KI und Machine Learning Apps wurden gebaut?" style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 9999px; padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--accent-color); cursor: pointer;">🤖 KI & AI</button>
        </div>
      </div>

      <!-- Input Bar -->
      <form id="copilot-form" style="display: flex; gap: 0.5rem; padding: 0.75rem; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.15);">
        <input type="text" id="copilot-input" placeholder="Frage eingeben..." style="flex: 1; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: inherit; font-size: 0.85rem;" autocomplete="off">
        <button type="submit" class="btn btn-sm btn-primary" style="padding: 0.5rem 0.75rem;">➤</button>
      </form>
    </div>
  `;

  document.body.appendChild(container);
}

function attachCopilotEvents() {
  const toggleBtn = document.getElementById('copilot-toggle-btn');
  const chatBox = document.getElementById('copilot-chat-box');
  const closeBtn = document.getElementById('copilot-close-btn');
  const form = document.getElementById('copilot-form');
  const input = document.getElementById('copilot-input');
  const messages = document.getElementById('copilot-messages');

  if (toggleBtn && chatBox) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = chatBox.style.display === 'flex';
      chatBox.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && input) input.focus();
    });
  }

  if (closeBtn && chatBox) {
    closeBtn.addEventListener('click', () => {
      chatBox.style.display = 'none';
    });
  }

  if (form) {
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
      handleUserQuery(query);
    }
  });
}

function handleUserQuery(queryText) {
  const messages = document.getElementById('copilot-messages');
  if (!messages) return;

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'copilot-msg user';
  userMsg.style.alignSelf = 'flex-end';
  userMsg.style.background = 'var(--accent-color, #0ea5e9)';
  userMsg.style.color = '#fff';
  userMsg.style.padding = '0.6rem 0.9rem';
  userMsg.style.borderRadius = '12px 12px 2px 12px';
  userMsg.style.maxWidth = '85%';
  userMsg.style.wordBreak = 'break-word';
  userMsg.textContent = queryText;
  messages.appendChild(userMsg);

  // Find best match in knowledge base
  const lower = queryText.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Generate bot reply
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'copilot-msg bot';
    botMsg.style.alignSelf = 'flex-start';
    botMsg.style.background = 'rgba(255,255,255,0.05)';
    botMsg.style.padding = '0.75rem 1rem';
    botMsg.style.borderRadius = '12px 12px 12px 2px';
    botMsg.style.border = '1px solid var(--border-color)';
    botMsg.style.maxWidth = '90%';
    botMsg.style.lineHeight = '1.5';

    if (bestMatch && maxScore > 0) {
      botMsg.innerHTML = `
        <div>${bestMatch.response}</div>
        <div style="margin-top: 0.6rem;">
          <a href="${bestMatch.link}" class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; display: inline-block;">🔗 ${bestMatch.linkText}</a>
        </div>
      `;
    } else {
      botMsg.innerHTML = `
        <div>Danke für deine Frage! Maximilian hat umfangreiche praktische Projekte in <strong>C++ (OpenGL), Godot C#, TypeScript (React/Lit) und Python</strong> entwickelt. Wähle gerne ein Thema oben aus oder navigiere direkt zum <a href="portfolio.html" style="color: var(--accent-color); font-weight: 600;">Portfolio</a>.</div>
      `;
    }

    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 300);

  messages.scrollTop = messages.scrollHeight;
}
