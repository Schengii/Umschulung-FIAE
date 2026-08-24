/**
 * @file quick-sandbox.js
 * @description Schwebendes In-Browser Live-Play Modal für Web-/Canvas-/Game-Projekte
 */

const PLAYABLE_PROJECTS = {
  'EcoChef': {
    title: 'EcoChef — IHK PWA Abschlussprojekt',
    url: '../Projekte/EcoChef/www/index.html',
    type: 'PWA Web App',
    desc: 'Intelligenter KI-Rezept- & Nachhaltigkeitsplaner mit Lit, TypeScript & Gemini KI.'
  },
  'BurgenGame': {
    title: 'BurgenGame — 2D Aufbaustrategie',
    url: '../Projekte/BurgenGame/index.html',
    type: 'HTML5 Canvas Game',
    desc: 'Echtzeit-Burgbau, Ressourcenmanagement und Verteidigungsstrategie mit Vanilla JS.'
  },
  'Sims': {
    title: 'Sims 5 Next-Gen Web Experience',
    url: '../Projekte/Sims/dist/index.html',
    type: '2.5D Isometric Simulation',
    desc: 'Sims Simulation mit isometrischem Canvas-Rendering, dynamischen Bedürfnissen und Synthesizer-Audio.'
  },
  'ManuFaktur': {
    title: 'ManuFaktur — Digitale Kunstgalerie',
    url: '../Projekte/ManuFaktur/index.html',
    type: 'Web Application',
    desc: 'Moderne Kunstausstellung & Merkliste mit responsivem Design und dynamischen Filtern.'
  },
  'Glücksspiel': {
    title: 'Casino & Casual Games Suite',
    url: '../Projekte/Glücksspiel/index.html',
    type: 'Mini Game Suite',
    desc: 'Slots, Roulette und Plinko mit Physik-Simulation und Soundeffekten.'
  },
  'CoOpVersusGame': {
    title: 'Co-Op Versus Multiplayer Prototype',
    url: '../Projekte/CoOpVersusGame/coop-versus-demo.html',
    type: 'Godot / HTML5 Prototype',
    desc: 'Multiplayer Co-Op Game Prototyp mit dynamischer Level-Generierung.'
  },
  'Urlaubsfotos': {
    title: 'Urlaubsfotos — Modern Gallery PWA',
    url: '../Projekte/Urlaubsfotos/dist/index.html',
    type: 'React / Vite PWA',
    desc: 'Fotogalerie mit EXIF-Metadaten-Filter, Tags und Lightbox-Modus.'
  }
};

export function initQuickSandbox() {
  injectModalHtml();
  attachEventListeners();
}

function injectModalHtml() {
  if (document.getElementById('quick-sandbox-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'quick-sandbox-modal';
  modal.className = 'modal-backdrop';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  modal.style.backdropFilter = 'blur(8px)';
  modal.style.zIndex = '99999';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '1rem';

  modal.innerHTML = `
    <div class="sandbox-container card" style="width: 95vw; max-width: 1200px; height: 90vh; display: flex; flex-direction: column; background: var(--bg-card, #1e293b); border: 1px solid var(--border-color, #334155); border-radius: var(--radius-lg, 12px); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.25rem;">🎮</span>
          <div>
            <h3 id="sandbox-title" style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Projekt Preview</h3>
            <span id="sandbox-badge" style="font-size: 0.75rem; color: var(--accent-color); font-weight: 600;">Sandbox Mode</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button id="btn-sandbox-reload" class="btn btn-sm btn-outline" title="Neu laden" style="padding: 0.35rem 0.6rem;">🔄</button>
          <a id="btn-sandbox-newtab" href="#" target="_blank" class="btn btn-sm btn-secondary" title="In neuem Tab öffnen" style="padding: 0.35rem 0.6rem;">↗️ Neuer Tab</a>
          <button id="btn-sandbox-close" class="btn btn-sm btn-primary" title="Schließen" style="padding: 0.35rem 0.75rem; background: #ef4444; border-color: #ef4444;">✕</button>
        </div>
      </div>

      <!-- Iframe Sandbox Area -->
      <div style="flex: 1; position: relative; background: #000;">
        <div id="sandbox-loader" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.9); z-index: 2;">
          <div style="width: 40px; height: 40px; border: 3px solid rgba(14, 165, 233, 0.2); border-top-color: var(--accent-color, #0ea5e9); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 0.75rem;"></div>
          <span style="color: var(--text-secondary); font-size: 0.9rem;">Lade Live-Sandbox...</span>
        </div>
        <iframe id="sandbox-iframe" src="" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen; clipboard-write; encrypted-media"></iframe>
      </div>

      <!-- Footer Info -->
      <div style="padding: 0.5rem 1.25rem; font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.1);">
        <span id="sandbox-desc">In-Browser Instant Execution</span>
        <span>Drücke <kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px;">ESC</kbd> zum Schließen</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Keyframes for loader
  if (!document.getElementById('sandbox-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sandbox-keyframes';
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

function attachEventListeners() {
  const modal = document.getElementById('quick-sandbox-modal');
  const btnClose = document.getElementById('btn-sandbox-close');
  const btnReload = document.getElementById('btn-sandbox-reload');
  const iframe = document.getElementById('sandbox-iframe');
  const loader = document.getElementById('sandbox-loader');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => closeSandbox());
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSandbox();
    });
  }

  if (btnReload && iframe) {
    btnReload.addEventListener('click', () => {
      if (iframe.src) {
        if (loader) loader.style.display = 'flex';
        iframe.src = iframe.src;
      }
    });
  }

  if (iframe) {
    iframe.addEventListener('load', () => {
      if (loader) loader.style.display = 'none';
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeSandbox();
    }
  });

  // Delegate clicks on [data-sandbox-project]
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-sandbox-project]');
    if (trigger) {
      e.preventDefault();
      const projKey = trigger.dataset.sandboxProject;
      openSandbox(projKey);
    }
  });
}

export function openSandbox(projKey) {
  const project = PLAYABLE_PROJECTS[projKey];
  const modal = document.getElementById('quick-sandbox-modal');
  const iframe = document.getElementById('sandbox-iframe');
  const title = document.getElementById('sandbox-title');
  const badge = document.getElementById('sandbox-badge');
  const desc = document.getElementById('sandbox-desc');
  const btnNewTab = document.getElementById('btn-sandbox-newtab');
  const loader = document.getElementById('sandbox-loader');

  if (!modal || !iframe) return;

  const url = project ? project.url : `../Projekte/${projKey}/index.html`;
  const name = project ? project.title : projKey;
  const type = project ? project.type : 'Web Application';
  const description = project ? project.desc : 'Live Sandbox Runner';

  if (title) title.textContent = name;
  if (badge) badge.textContent = type;
  if (desc) desc.textContent = description;
  if (btnNewTab) btnNewTab.href = url;

  if (loader) loader.style.display = 'flex';
  iframe.src = url;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

export function closeSandbox() {
  const modal = document.getElementById('quick-sandbox-modal');
  const iframe = document.getElementById('sandbox-iframe');
  if (modal) modal.style.display = 'none';
  if (iframe) iframe.src = '';
  document.body.style.overflow = '';
}

// Self-init when loaded directly as a page module (e.g. on portfolio.html), since its
// trigger buttons are injected dynamically into project cards after page load and would
// otherwise be missed by main.js's one-time DOM-presence lazy-load check.
initQuickSandbox();
