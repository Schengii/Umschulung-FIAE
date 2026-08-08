import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { calculateGermanNetSalary } from '../utils/taxCalculator.js';

export const kanbanView = {
    filterWorkmode: 'all',
    sortBy: 'date-desc',

    render(containerId) {
        const container = document.getElementById(containerId);
        const jobs = storage.getJobs();
        const profile = storage.getProfile();

        // 1. Filter jobs
        let filteredJobs = [...jobs];
        if (this.filterWorkmode !== 'all') {
            filteredJobs = filteredJobs.filter(j => j.workMode === this.filterWorkmode);
        }

        // 2. Sort jobs
        filteredJobs.sort((a, b) => {
            if (this.sortBy === 'salary-desc') {
                return (b.salary || 0) - (a.salary || 0);
            } else if (this.sortBy === 'match-desc') {
                const scoreA = mockAi.analyzeMatch(profile.skills, a.description).matchScore;
                const scoreB = mockAi.analyzeMatch(profile.skills, b.description).matchScore;
                return scoreB - scoreA;
            } else if (this.sortBy === 'deadline-asc') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            } else {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        const columns = [
            { id: 'saved', name: 'Gespeichert', icon: 'folder' },
            { id: 'prepared', name: 'Unterlagen bereit', icon: 'file-text' },
            { id: 'applied', name: 'Beworben', icon: 'send' },
            { id: 'interviewing', name: 'Gespräch', icon: 'calendar' },
            { id: 'offer', name: 'Angebot erhalten', icon: 'award' },
            { id: 'rejected', name: 'Absage', icon: 'frown' }
        ];

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Bewerbungs-Tracker (Kanban)</h2>
                <span class="text-secondary">${filteredJobs.length} Jobs angezeigt</span>
            </div>
            
            <div class="kanban-controls-bar glass-card">
                <div class="kanban-control-group">
                    <label for="kanban-filter-workmode" class="kanban-control-label">Arbeitsmodell:</label>
                    <select id="kanban-filter-workmode" class="kanban-control-select">
                        <option value="all" ${this.filterWorkmode === 'all' ? 'selected' : ''}>Alle</option>
                        <option value="Remote" ${this.filterWorkmode === 'Remote' ? 'selected' : ''}>100% Remote</option>
                        <option value="Hybrid" ${this.filterWorkmode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                        <option value="Vor Ort" ${this.filterWorkmode === 'Vor Ort' ? 'selected' : ''}>Vor Ort</option>
                    </select>
                </div>
                <div class="kanban-control-group">
                    <label for="kanban-sort-by" class="kanban-control-label">Sortieren nach:</label>
                    <select id="kanban-sort-by" class="kanban-control-select">
                        <option value="date-desc" ${this.sortBy === 'date-desc' ? 'selected' : ''}>Neueste zuerst</option>
                        <option value="salary-desc" ${this.sortBy === 'salary-desc' ? 'selected' : ''}>Höchstes Gehalt</option>
                        <option value="match-desc" ${this.sortBy === 'match-desc' ? 'selected' : ''}>Bester Match-Score</option>
                        <option value="deadline-asc" ${this.sortBy === 'deadline-asc' ? 'selected' : ''}>Fristen (nächste zuerst)</option>
                    </select>
                </div>
            </div>

            <div class="kanban-board-container">
                ${columns.map(col => {
                    const colJobs = filteredJobs.filter(j => j.status === col.id);
                    return `
                        <div class="kanban-column" data-status="${col.id}">
                            <div class="kanban-column-header">
                                <div class="column-title-group">
                                    <i data-lucide="${col.icon}"></i>
                                    <h4>${col.name}</h4>
                                </div>
                                <span class="column-count">${colJobs.length}</span>
                            </div>
                            <div class="kanban-cards-list" data-status="${col.id}">
                                ${colJobs.map(job => this.createCardHtml(job, profile.skills)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        lucide.createIcons();
        this.initDragAndDrop(container);
        this.bindCardEvents(container);
        this.bindControlsEvents(container);
    },

    createCardHtml(job, userSkills) {
        const profile = storage.getProfile();
        const matchAnalysis = mockAi.analyzeMatch(userSkills || profile.skills, job.description);
        const score = matchAnalysis.matchScore;
        
        let scoreClass = 'low';
        if (score >= 75) scoreClass = 'high';
        else if (score >= 40) scoreClass = 'medium';

        const hasDeadline = job.deadline;
        let isOverdue = false;
        let formattedDate = 'Kein Datum';

        if (hasDeadline) {
            const deadlineDate = new Date(job.deadline);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            isOverdue = deadlineDate < today && job.status !== 'rejected' && job.status !== 'offer';
            formattedDate = deadlineDate.toLocaleDateString('de-DE');
        }

        // Calculate card age
        const dateCreated = new Date(job.createdAt || Date.now());
        const timeDiff = Math.abs(Date.now() - dateCreated.getTime());
        const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        const ageText = diffDays === 0 ? 'heute' : diffDays === 1 ? 'gestern' : `vor ${diffDays} Tagen`;

        return `
            <div class="glass-card kanban-card" draggable="true" data-id="${job.id}" tabindex="0" role="button" aria-label="Bewerbung bei ${job.company} als ${job.title}. Match: ${score} Prozent.">
                <div class="card-top">
                    <span class="card-company" title="${job.company}">${job.company}</span>
                    <div class="card-menu">
                        <button class="card-btn-action edit" aria-label="Bewerbung bearbeiten" title="Bearbeiten">
                            <i data-lucide="edit-2" aria-hidden="true"></i>
                        </button>
                        <button class="card-btn-action delete" aria-label="Bewerbung löschen" title="Löschen">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <h5 class="card-title" title="${job.title}">${job.title}</h5>
                ${job.tags && job.tags.length > 0 ? `
                    <div class="card-tags" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                        ${job.tags.map(t => `<span class="keyword-badge match" style="font-size: 0.68rem; padding: 1px 6px; background: rgba(99, 102, 241, 0.12); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.25);">${t}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="card-meta-grid">
                    <div class="meta-item">
                        <i data-lucide="map-pin" aria-hidden="true"></i>
                        <span title="${job.location || 'K.A.'}">${job.location || 'K.A.'}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="home" aria-hidden="true"></i>
                        <span>${job.workMode || 'Hybrid'}</span>
                    </div>
                    ${job.salary ? (() => {
                        const netSalary = calculateGermanNetSalary(job.salary, profile);
                        return `
                            <div class="meta-item" style="grid-column: span 2; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <i data-lucide="euro" aria-hidden="true" style="width: 14px; height: 14px;"></i>
                                    <span style="font-weight: 500;">${job.salary.toLocaleString('de-DE')} € brutto/Jahr</span>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 20px;">
                                    ca. ${netSalary.netMonthly.toLocaleString('de-DE')} € netto/Monat (StKl. ${profile.taxClass || 1})
                                </div>
                            </div>
                        `;
                    })() : ''}
                </div>
                <div class="card-bottom">
                    <div class="card-date ${isOverdue ? 'overdue' : ''}" title="${isOverdue ? 'Frist überschritten!' : 'Bewerbungsfrist'}" style="display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="calendar" aria-hidden="true"></i>
                        <span>${formattedDate}</span>
                        ${hasDeadline ? `
                        <button class="card-btn-action btn-kanban-google-cal" aria-label="Termin in Google Calendar eintragen" title="In Google Calendar eintragen" style="padding: 0; margin-left: 4px; display: inline-flex; align-items: center; justify-content: center; height: 14px; width: 14px; min-width: 14px; min-height: 14px;">
                            <i data-lucide="calendar-plus" aria-hidden="true" style="width: 12px; height: 12px;"></i>
                        </button>
                        ` : ''}
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic; white-space: nowrap; margin-right: auto; margin-left: 8px;" title="Hinzugefügt">${ageText}</span>
                    <span class="card-score-tag ${scoreClass}" title="AI Skill-Match Score">${score}% Match</span>
                </div>
            </div>
        `;
    },

    initDragAndDrop(container) {
        const cards = container.querySelectorAll('.kanban-card');
        const lists = container.querySelectorAll('.kanban-cards-list');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        lists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                
                const jobId = e.dataTransfer.getData('text/plain');
                const newStatus = list.getAttribute('data-status');
                
                const jobs = storage.getJobs();
                const jobIndex = jobs.findIndex(j => j.id === jobId);
                
                if (jobIndex !== -1 && jobs[jobIndex].status !== newStatus) {
                    const history = jobs[jobIndex].history || [];
                    history.push({ status: newStatus, timestamp: new Date().toISOString() });
                    jobs[jobIndex].history = history;
                    jobs[jobIndex].status = newStatus;
                    storage.saveJobs(jobs);
                    
                    // Trigger toast and rerender
                    window.app.showToast(`Bewerbung zu "${jobs[jobIndex].company}" verschoben!`, 'success');
                    this.render('view-kanban');
                }
            });
        });
    },

    bindCardEvents(container) {
        container.querySelectorAll('.kanban-card').forEach(card => {
            const id = card.getAttribute('data-id');
            
            // Allow double click to edit
            card.addEventListener('dblclick', (e) => {
                if (!e.target.closest('.card-btn-action')) {
                    window.app.editJob(id);
                }
            });

            // Keyboard interactive support (Enter or Space key to edit)
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (!e.target.closest('.card-btn-action')) {
                        e.preventDefault();
                        window.app.editJob(id);
                    }
                }
            });

            // Edit button click
            const btnEdit = card.querySelector('.card-btn-action.edit');
            if (btnEdit) {
                btnEdit.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.app.editJob(id);
                });
            }

            // Delete button click
            const btnDelete = card.querySelector('.card-btn-action.delete');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Bist du sicher, dass du dieses Jobangebot löschen möchtest?')) {
                        storage.deleteJob(id);
                        window.app.showToast('Job erfolgreich gelöscht', 'warning');
                        this.render('view-kanban');
                    }
                });
            }

            // Google Calendar button click
            const btnCal = card.querySelector('.btn-kanban-google-cal');
            if (btnCal) {
                btnCal.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const job = storage.getJobs().find(j => j.id === id);
                    if (job && job.deadline) {
                        const cleanDate = job.deadline.replace(/-/g, ''); // YYYYMMDD format
                        const title = `Bewerbungsfrist: ${job.title} bei ${job.company}`;
                        const details = `Link zur Anzeige: ${job.url || 'Keine URL vorhanden'}\n\nStandort: ${job.location || 'K.A.'}\nGehalt: ${job.salary ? job.salary + ' €' : 'K.A.'}`;
                        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${cleanDate}/${cleanDate}&details=${encodeURIComponent(details)}`;
                        window.open(calUrl, '_blank');
                    }
                });
            }
        });
    },

    bindControlsEvents(container) {
        const selectWorkmode = container.querySelector('#kanban-filter-workmode');
        const selectSort = container.querySelector('#kanban-sort-by');
        
        if (selectWorkmode) {
            selectWorkmode.addEventListener('change', (e) => {
                this.filterWorkmode = e.target.value;
                this.render('view-kanban');
            });
        }
        if (selectSort) {
            selectSort.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.render('view-kanban');
            });
        }
    }
};
