// js/projects.js
let projects = [];
let activeProjectTimer = null;

// DOM Elements for Projects
const PROJ_DOM = {
  container: document.getElementById('projects-list-container'),
  btnAdd: document.getElementById('btn-add-project')
};

document.addEventListener('DOMContentLoaded', () => {
  // Wait a tick for storage to be loaded in app.js, or load it here
  setTimeout(() => {
    loadProjects();
    setupProjectsEvents();
    renderProjects();
    startProjectLoop();
  }, 100);
});

function loadProjects() {
  const p = localStorage.getItem('officetrack_projects');
  projects = p ? JSON.parse(p) : [];
}

function saveProjects() {
  localStorage.setItem('officetrack_projects', JSON.stringify(projects));
  if (window.storageService && window.storageService.syncToCloud) {
    window.storageService.syncToCloud();
  }
}

function setupProjectsEvents() {
  if (!PROJ_DOM.btnAdd) return;

  PROJ_DOM.btnAdd.addEventListener('click', () => {
    const name = prompt('Wie heißt das neue Projekt/die neue Aufgabe?');
    if (name && name.trim()) {
      projects.push({
        id: Date.now().toString(36),
        name: name.trim(),
        totalMs: 0,
        isRunning: false,
        startTime: null
      });
      saveProjects();
      renderProjects();
    }
  });

  PROJ_DOM.container.addEventListener('click', (e) => {
    const btnPlay = e.target.closest('.btn-play');
    const btnStop = e.target.closest('.btn-stop');
    const btnDelete = e.target.closest('.btn-delete-item');
    
    if (btnPlay) {
      const id = btnPlay.getAttribute('data-id');
      startProject(id);
    } else if (btnStop) {
      const id = btnStop.getAttribute('data-id');
      stopProject(id);
    } else if (btnDelete) {
      const id = btnDelete.getAttribute('data-id');
      if (confirm('Projekt löschen?')) {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
        renderProjects();
      }
    }
  });
}

function startProject(id) {
  // Stop currently running project if any
  const running = projects.find(p => p.isRunning);
  if (running && running.id !== id) {
    stopProject(running.id);
  }

  const proj = projects.find(p => p.id === id);
  if (proj) {
    proj.isRunning = true;
    proj.startTime = Date.now();
    saveProjects();
    renderProjects();
  }
}

function stopProject(id) {
  const proj = projects.find(p => p.id === id);
  if (proj && proj.isRunning) {
    const now = Date.now();
    const elapsed = now - proj.startTime;
    proj.totalMs += elapsed;
    proj.isRunning = false;
    proj.startTime = null;
    saveProjects();
    renderProjects();
  }
}

function renderProjects() {
  if (!PROJ_DOM.container) return;

  if (projects.length === 0) {
    PROJ_DOM.container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="folder" class="empty-icon"></i>
        <p>Keine Projekte vorhanden. Erstelle ein Projekt, um aufgabenbasiert Zeit zu erfassen.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = '';
  projects.forEach(p => {
    // calculate current time if running
    let displayMs = p.totalMs;
    if (p.isRunning && p.startTime) {
      displayMs += (Date.now() - p.startTime);
    }

    const secs = Math.floor((displayMs / 1000) % 60);
    const mins = Math.floor((displayMs / (1000 * 60)) % 60);
    const hrs = Math.floor(displayMs / (1000 * 60 * 60));

    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;

    html += `
      <div class="project-item ${p.isRunning ? 'active' : ''}">
        <div class="project-info">
          <span class="project-name">${p.name}</span>
          <span class="project-time" id="proj-time-${p.id}">${timeStr}</span>
        </div>
        <div class="project-actions">
          ${p.isRunning 
            ? `<button class="btn btn-stop" data-id="${p.id}"><i data-lucide="square"></i></button>`
            : `<button class="btn btn-play" data-id="${p.id}"><i data-lucide="play"></i></button>`
          }
          <button class="btn-delete-item" data-id="${p.id}" style="display:inline-flex; margin-left:8px;"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
  });

  PROJ_DOM.container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

function startProjectLoop() {
  setInterval(() => {
    const running = projects.find(p => p.isRunning);
    if (running) {
      const el = document.getElementById(`proj-time-${running.id}`);
      if (el) {
        let displayMs = running.totalMs + (Date.now() - running.startTime);
        const secs = Math.floor((displayMs / 1000) % 60);
        const mins = Math.floor((displayMs / (1000 * 60)) % 60);
        const hrs = Math.floor(displayMs / (1000 * 60 * 60));
        const pad = n => n.toString().padStart(2, '0');
        el.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
      }
    }
  }, 1000);
}
