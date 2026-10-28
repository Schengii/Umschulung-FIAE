/**
 * @file quick-sandbox.js
 * @description Schwebendes In-Browser Live-Play Modal für Web-/Canvas-/Game-Projekte
 */

/** @type {Record<string, Record<string, any>>} */
const PLAYABLE_PROJECTS = {
    EcoChef: {
        title: 'EcoChef — IHK PWA Abschlussprojekt',
        url: '../Projekte/EcoChef/www/index.html',
        type: 'PWA Web App',
        desc: 'Intelligenter KI-Rezept- & Nachhaltigkeitsplaner mit Lit, TypeScript & Gemini KI.',
    },
    'Amazon-2.0': {
        title: 'Amazon 2.0 — Modern E-Commerce Platform',
        url: '../Projekte/Amazon 2.0/dist/index.html',
        type: 'TypeScript / Vite PWA',
        desc: 'Modernes Shop-System mit Produktfilter, Warenkorb, Command Palette und Dark Mode.',
    },
    'ElektroCheck-AI': {
        title: 'ElektroCheck AI — DGUV V3 Prüfbericht-Auditor',
        url: '../Projekte/ElektroCheck AI/index.html',
        type: 'KI Web-Applikation',
        desc: 'Automatisierte Prüfberichtsanalyse und Mängelerkennung nach DGUV V3 mit KI.',
    },
    Finanzenportfolio: {
        title: 'Finanzenportfolio — Asset Management & Analytics',
        url: '../Projekte/Finanzenportfolio/dist/index.html',
        type: 'React / Vite Dashboard',
        desc: 'Umfassendes Finanz- und Krypto-Tracking mit Recharts und Portfolio-Rebalancing.',
    },
    'Informatik-lernen': {
        title: 'Informatik-lernen — Interaktive Lernplattform',
        url: '../Projekte/Informatik-lernen/index.html',
        type: 'TypeScript Lernplattform',
        desc: 'Interaktive FIAE-Lernmodule für Algorithmen, Datenstrukturen und SQL-Design.',
    },
    ManuFaktur: {
        title: 'ManuFaktur — Digitale Kunstgalerie',
        url: '../Projekte/ManuFaktur/index.html',
        type: 'Web Application',
        desc: 'Moderne Kunstausstellung & Merkliste mit responsivem Design und dynamischen Filtern.',
    },
    Minecraft: {
        title: 'Minecraft Voxel Engine — Web Preview & Showcase',
        url: '../Projekte/Minecraft/index.html',
        type: '3D Voxel Engine Demo',
        desc: 'C++20 & OpenGL Voxel Engine mit Biomen, Chunk-Rendering und Redstone-Logik.',
    },
    'Wohnungssuche-KI': {
        title: 'Wohnungssuche KI — KI-Immobilien-Scout',
        url: '../Projekte/Wohnungssuche KI/frontend/dist/index.html',
        type: 'Fullstack KI-Plattform',
        desc: 'Automatisierte Wohnungssuche mit KI-Exposé-Bewertung und Mietpreisspiegel-Vergleich.',
    },
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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sandbox-title');
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
          <button id="btn-sandbox-reload" type="button" class="btn btn-sm btn-outline" title="Neu laden" data-en-title="Reload" aria-label="Neu laden" data-en-aria-label="Reload" style="padding: 0.35rem 0.6rem;"><span aria-hidden="true">🔄</span></button>
          <a id="btn-sandbox-newtab" href="#" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" title="In neuem Tab öffnen" data-en-title="Open in new tab" style="padding: 0.35rem 0.6rem;"><span aria-hidden="true">↗️</span> <span lang="de">Neuer Tab</span><span lang="en">New tab</span></a>
          <button id="btn-sandbox-close" type="button" class="btn btn-sm btn-primary" title="Schließen" data-en-title="Close" aria-label="Schließen" data-en-aria-label="Close" style="padding: 0.35rem 0.75rem; background: #ef4444; border-color: #ef4444;"><span aria-hidden="true">✕</span></button>
        </div>
      </div>

      <!-- Iframe Sandbox Area -->
      <div style="flex: 1; position: relative; background: #000;">
        <div id="sandbox-loader" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.9); z-index: 2;">
          <div style="width: 40px; height: 40px; border: 3px solid rgba(14, 165, 233, 0.2); border-top-color: var(--accent-color, #0ea5e9); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 0.75rem;"></div>
          <span style="color: var(--text-secondary); font-size: 0.9rem;"><span lang="de">Lade Live-Sandbox …</span><span lang="en">Loading live sandbox …</span></span>
        </div>
        <iframe id="sandbox-iframe" src="" title="Projekt-Vorschau" data-en-title="Project preview" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen; clipboard-write; encrypted-media"></iframe>
      </div>

      <!-- Footer Info -->
      <div style="padding: 0.5rem 1.25rem; font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.1);">
        <span id="sandbox-desc">In-Browser Instant Execution</span>
        <span><span lang="de">Drücke <kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px;">ESC</kbd> zum Schließen</span><span lang="en">Press <kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px;">ESC</kbd> to close</span></span>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // The loader keyframes live in assets/css/modules/portfolio_modals.css (CSP: no injected <style>).
}

function attachEventListeners() {
    const modal = document.getElementById('quick-sandbox-modal');
    const btnClose = document.getElementById('btn-sandbox-close');
    const btnReload = document.getElementById('btn-sandbox-reload');
    const iframe = /** @type {HTMLIFrameElement} */ (document.getElementById('sandbox-iframe'));
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
                // Re-assigning src is the intended way to reload the sandbox iframe.
                // eslint-disable-next-line no-self-assign
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
        const trigger = /** @type {HTMLElement} */ (e.target).closest('[data-sandbox-project]');
        if (trigger) {
            e.preventDefault();
            const projKey = trigger.dataset.sandboxProject;
            openSandbox(projKey);
        }
    });
}

/** Element that opened the sandbox; gets the focus back on close. */
/** @type {HTMLElement | null} */
let returnFocusTo = null;

/** @param {string} urlPath */
export function resolveSandboxUrl(urlPath) {
    if (!urlPath) return '';
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) return urlPath;
    const isPagesFolder =
        window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
    if (!isPagesFolder && urlPath.startsWith('../')) {
        return urlPath.substring(3);
    }
    if (isPagesFolder && !urlPath.startsWith('../')) {
        return '../' + urlPath.replace(/^\.\//, '');
    }
    return urlPath;
}

/** @param {string} projKey */
export function openSandbox(projKey) {
    const project =
        PLAYABLE_PROJECTS[projKey] ||
        (projKey ? PLAYABLE_PROJECTS[projKey.replace(/\s+/g, '-')] : null) ||
        (projKey ? PLAYABLE_PROJECTS[projKey.replace(/-/g, ' ')] : null);
    const modal = document.getElementById('quick-sandbox-modal');
    const iframe = /** @type {HTMLIFrameElement} */ (document.getElementById('sandbox-iframe'));
    const title = document.getElementById('sandbox-title');
    const badge = document.getElementById('sandbox-badge');
    const desc = document.getElementById('sandbox-desc');
    const btnNewTab = /** @type {HTMLAnchorElement} */ (document.getElementById('btn-sandbox-newtab'));
    const loader = document.getElementById('sandbox-loader');

    if (!modal || !iframe) return;

    const rawUrl = project ? project.url : `../Projekte/${projKey}/index.html`;
    const url = resolveSandboxUrl(rawUrl);
    const name = project ? project.title : projKey;
    const type = project ? project.type : 'Web Application';
    const description = project ? project.desc : 'Live Sandbox Runner';

    if (title) title.textContent = name;
    if (badge) badge.textContent = type;
    if (desc) desc.textContent = description;
    if (btnNewTab) btnNewTab.href = url;

    if (loader) loader.style.display = 'flex';
    iframe.src = url;
    returnFocusTo = /** @type {HTMLElement | null} */ (document.activeElement);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('btn-sandbox-close')?.focus();
}

export function closeSandbox() {
    const modal = document.getElementById('quick-sandbox-modal');
    const iframe = /** @type {HTMLIFrameElement} */ (document.getElementById('sandbox-iframe'));
    const wasOpen = Boolean(modal && modal.style.display !== 'none');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
    document.body.style.overflow = '';
    if (wasOpen && returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
    returnFocusTo = null;
}

// Self-init when loaded directly as a page module (e.g. on portfolio.html), since its
// trigger buttons are injected dynamically into project cards after page load and would
// otherwise be missed by main.js's one-time DOM-presence lazy-load check.
initQuickSandbox();
