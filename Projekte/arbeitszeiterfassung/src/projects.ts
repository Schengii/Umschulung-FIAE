export interface ProjectItem {
  id: string;
  name: string;
  totalMs: number;
  isRunning: boolean;
  startTime: number | null;
}

let projects: ProjectItem[] = [];

export function getProjects(): ProjectItem[] {
  return projects;
}

export function loadProjects(): ProjectItem[] {
  const p = localStorage.getItem("officetrack_projects");
  projects = p ? JSON.parse(p) : [];
  return projects;
}

export function saveProjects(): void {
  localStorage.setItem("officetrack_projects", JSON.stringify(projects));
  const win = window as any;
  if (win.storageService && win.storageService.syncToCloud) {
    win.storageService.syncToCloud();
  }
}

export function addProject(name: string): ProjectItem {
  const newProj: ProjectItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: name.trim(),
    totalMs: 0,
    isRunning: false,
    startTime: null,
  };
  projects.push(newProj);
  saveProjects();
  return newProj;
}

export function deleteProject(id: string): void {
  projects = projects.filter(p => p.id !== id);
  saveProjects();
}

export function startProject(id: string): void {
  const running = projects.find(p => p.isRunning);
  if (running && running.id !== id) {
    stopProject(running.id);
  }

  const proj = projects.find(p => p.id === id);
  if (proj) {
    proj.isRunning = true;
    proj.startTime = Date.now();
    saveProjects();
  }
}

export function stopProject(id: string): void {
  const proj = projects.find(p => p.id === id);
  if (proj && proj.isRunning && proj.startTime) {
    const elapsed = Date.now() - proj.startTime;
    proj.totalMs += elapsed;
    proj.isRunning = false;
    proj.startTime = null;
    saveProjects();
  }
}

export function setupProjectsUI(): void {
  const container = document.getElementById("projects-list-container");
  const btnAdd = document.getElementById("btn-add-project");
  if (!container) return;

  loadProjects();
  renderProjectsUI();

  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      const name = prompt("Wie heißt das neue Projekt/die neue Aufgabe?");
      if (name && name.trim()) {
        addProject(name);
        renderProjectsUI();
      }
    });
  }

  container.addEventListener("click", e => {
    const target = e.target as HTMLElement;
    const btnPlay = target.closest(".btn-play");
    const btnStop = target.closest(".btn-stop");
    const btnDelete = target.closest(".btn-delete-item");

    if (btnPlay) {
      const id = btnPlay.getAttribute("data-id");
      if (id) {
        startProject(id);
        renderProjectsUI();
      }
    } else if (btnStop) {
      const id = btnStop.getAttribute("data-id");
      if (id) {
        stopProject(id);
        renderProjectsUI();
      }
    } else if (btnDelete) {
      const id = btnDelete.getAttribute("data-id");
      if (id && confirm("Projekt löschen?")) {
        deleteProject(id);
        renderProjectsUI();
      }
    }
  });

  setInterval(() => {
    const running = projects.find(p => p.isRunning);
    if (running && running.startTime) {
      const el = document.getElementById(`proj-time-${running.id}`);
      if (el) {
        const displayMs = running.totalMs + (Date.now() - running.startTime);
        const secs = Math.floor((displayMs / 1000) % 60);
        const mins = Math.floor((displayMs / (1000 * 60)) % 60);
        const hrs = Math.floor(displayMs / (1000 * 60 * 60));
        const pad = (n: number) => n.toString().padStart(2, "0");
        el.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
      }
    }
  }, 1000);
}

export function renderProjectsUI(): void {
  const container = document.getElementById("projects-list-container");
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="folder" class="empty-icon"></i>
        <p>Keine Projekte vorhanden. Erstelle ein Projekt, um aufgabenbasiert Zeit zu erfassen.</p>
      </div>
    `;
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
    return;
  }

  let html = "";
  projects.forEach(p => {
    let displayMs = p.totalMs;
    if (p.isRunning && p.startTime) {
      displayMs += Date.now() - p.startTime;
    }

    const secs = Math.floor((displayMs / 1000) % 60);
    const mins = Math.floor((displayMs / (1000 * 60)) % 60);
    const hrs = Math.floor(displayMs / (1000 * 60 * 60));
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timeStr = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;

    html += `
      <div class="project-item ${p.isRunning ? "active" : ""}">
        <div class="project-info">
          <span class="project-name">${p.name}</span>
          <span class="project-time" id="proj-time-${p.id}">${timeStr}</span>
        </div>
        <div class="project-actions">
          ${
            p.isRunning
              ? `<button class="btn btn-stop" data-id="${p.id}"><i data-lucide="square"></i></button>`
              : `<button class="btn btn-play" data-id="${p.id}"><i data-lucide="play"></i></button>`
          }
          <button class="btn-delete-item" data-id="${p.id}" style="display:inline-flex; margin-left:8px;"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  const win = window as any;
  if (win.lucide) win.lucide.createIcons();
}
