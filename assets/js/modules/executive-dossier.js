/**
 * @file executive-dossier.js
 * @description Rollenspezifischer 1-Klick Dossier & PDF-Generator für Recruiter & Prüfer
 */

const DOSSIER_TEMPLATES = {
  fullstack: {
    title: 'Executive Dossier: Fullstack & Frontend Engineering',
    role: 'Frontend & PWA Specialist (React / TypeScript / Lit)',
    summary: 'Spezialisierung auf performante Single-Page- & Progressive-Web-Apps mit nativer Browser-Architektur, Offline-First-Konzepten und moderner UI/UX nach WCAG 2.1 AAA.',
    highlights: [
      'EcoChef (Lit/TS PWA + Gemini KI) — IHK Abschlussprojekt',
      'ElektroCheck AI (React/Vite + OpenAI API)',
      'Finanzenportfolio (React + Recharts Dashboards)',
      'Urlaubsfotos (React/Vite PWA mit Filter-Engine)'
    ],
    skills: 'TypeScript, JavaScript ES6+, React 19, Lit Web Components, HTML5/CSS3, PWA (Service Worker, IndexedDB), Vite, Playwright E2E'
  },
  backend: {
    title: 'Executive Dossier: Systems Engineering & C++ / Godot',
    role: 'Software Architect & Game Engine Developer',
    summary: 'Fokus auf objektorientierte Systementwicklung, hardwarenahe Programmierung, algorithmische Komplexität und performante Grafik-Engines.',
    highlights: [
      'Minecraft 3D Voxel Engine (C++20, OpenGL 4.5, Biome & Redstone)',
      'Minecraft-Pokemon RPG (Godot 4.x, C# .NET)',
      'Orbital Scrap (Godot 4.6 Sci-Fi Idle Game)',
      'SQL & Relational DB Playground (PostgreSQL / SQLite)'
    ],
    skills: 'C++20, Modern C# .NET, Godot Engine 4.x, OpenGL 4.5, GLSL Shaders, SQL (3NF), Git, Design Patterns, Multithreading'
  },
  ihk: {
    title: 'IHK Prüfungs-Dossier: Fachinformatiker Anwendungsentwicklung',
    role: 'IHK Abschlussprüfung FIAE (Sommer 2026)',
    summary: 'Umfassender Nachweis der beruflichen Handlungskompetenz nach Ausbildungsrahmenplan: Von der Wirtschaftlichkeitsanalyse über saubere C4-Architektur bis hin zur vollständigen Testabdeckung.',
    highlights: [
      '80h IHK-Abschlussprojekt EcoChef (inkl. Nutzwertanalyse & Amortisation)',
      'Elektroniker-FIAE Transfermatrix & Systemkompetenz',
      'Playwright Test-Suite mit 100% Pass-Rate',
      'Vollständige Einhaltung von DSGVO und WCAG 2.1 AAA'
    ],
    skills: 'Software Engineering, Projektmanagement (80h), Nutzwertanalyse, UML/C4, Relationale DBs (SQL), Clean Code, QA & E2E Testing'
  }
};

export function initExecutiveDossier() {
  injectDossierModal();
  attachDossierEvents();
}

function injectDossierModal() {
  if (document.getElementById('executive-dossier-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'executive-dossier-modal';
  modal.className = 'modal-backdrop';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modal.style.backdropFilter = 'blur(6px)';
  modal.style.zIndex = '99999';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '1rem';

  modal.innerHTML = `
    <div class="card" style="width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; background: var(--bg-card, #1e293b); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
        <div>
          <h3 style="margin: 0; font-size: 1.25rem;">📄 Executive Dossier Generator 2.0</h3>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Maßgeschneidertes Profil für Recruiter & Prüfer</span>
        </div>
        <button id="btn-close-dossier" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary);">✕</button>
      </div>

      <!-- Template Switcher -->
      <div style="margin-bottom: 1.25rem;">
        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Zielprofil wählen:</label>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary dossier-type-btn active" data-type="fullstack">💻 Fullstack Web / PWA</button>
          <button class="btn btn-sm btn-secondary dossier-type-btn" data-type="backend">⚙️ C++ / Godot / Systems</button>
          <button class="btn btn-sm btn-secondary dossier-type-btn" data-type="ihk">🎓 IHK Prüfer-Dossier</button>
        </div>
      </div>

      <!-- Live Printable Preview Box -->
      <div id="dossier-preview-box" class="card" style="background: #ffffff; color: #0f172a; padding: 1.5rem; border-radius: 8px; font-family: 'Inter', system-ui, sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <h2 id="dossier-name" style="margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 800;">Maximilian Schenk</h2>
            <div id="dossier-role-text" style="color: #0ea5e9; font-weight: 700; font-size: 0.95rem; margin-top: 0.2rem;">Frontend & PWA Specialist</div>
          </div>
          <div style="text-align: right; font-size: 0.75rem; color: #64748b;">
            <div>IHK FIAE 2026</div>
            <div>BFW Dortmund</div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.85rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Profil & Kernkompetenz</h4>
          <p id="dossier-summary-text" style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #334155;"></p>
        </div>

        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.85rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Top-Projekte & Referenzen</h4>
          <ul id="dossier-highlights-list" style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #334155; line-height: 1.5;"></ul>
        </div>

        <div>
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.85rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Tech-Stack & Werkzeuge</h4>
          <div id="dossier-skills-text" style="font-size: 0.82rem; font-weight: 600; color: #0ea5e9; background: #f0f9ff; padding: 0.5rem; border-radius: 4px; border: 1px solid #bae6fd;"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button id="btn-print-dossier" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
          🖨️ Drucken / Als PDF speichern
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function attachDossierEvents() {
  const modal = document.getElementById('executive-dossier-modal');
  const btnClose = document.getElementById('btn-close-dossier');
  const btnPrint = document.getElementById('btn-print-dossier');
  const typeBtns = document.querySelectorAll('.dossier-type-btn');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => (modal.style.display = 'none'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');

      renderDossierPreview(btn.dataset.type);
    });
  });

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Trigger from anywhere with [data-open-dossier]
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-dossier]');
    if (trigger) {
      e.preventDefault();
      openDossierModal();
    }
  });
}

export function openDossierModal(initialType = 'fullstack') {
  const modal = document.getElementById('executive-dossier-modal');
  if (!modal) return;

  renderDossierPreview(initialType);
  modal.style.display = 'flex';
}

function renderDossierPreview(typeKey) {
  const data = DOSSIER_TEMPLATES[typeKey] || DOSSIER_TEMPLATES.fullstack;

  const roleEl = document.getElementById('dossier-role-text');
  const summaryEl = document.getElementById('dossier-summary-text');
  const highlightsEl = document.getElementById('dossier-highlights-list');
  const skillsEl = document.getElementById('dossier-skills-text');

  if (roleEl) roleEl.textContent = data.role;
  if (summaryEl) summaryEl.textContent = data.summary;
  if (skillsEl) skillsEl.textContent = data.skills;

  if (highlightsEl) {
    highlightsEl.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');
  }
}
