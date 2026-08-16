import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { calculateGermanNetSalary } from '../utils/taxCalculator.js';

export const kanbanView = {
    filterWorkmode: 'all',
    sortBy: 'date-desc',
    selectedJobIds: new Set(),
    batchMode: false,

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const jobs = storage.getJobs();
        const profile = storage.getProfile();
        const customColumns = storage.getCustomColumns();

        // Filter jobs
        let filteredJobs = [...jobs];
        if (this.filterWorkmode !== 'all') {
            filteredJobs = filteredJobs.filter(j => j.workMode === this.filterWorkmode);
        }

        // Sort jobs
        filteredJobs.sort((a, b) => {
            if (this.sortBy === 'salary-desc') {
                return (b.salary || 0) - (a.salary || 0);
            } else if (this.sortBy === 'match-desc') {
                const scoreA = mockAi.analyzeJobMatch(a.description || '', profile.skills).matchScore;
                const scoreB = mockAi.analyzeJobMatch(b.description || '', profile.skills).matchScore;
                return scoreB - scoreA;
            } else if (this.sortBy === 'deadline-asc') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            } else {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        container.innerHTML = `
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Bewerbungs-Tracker (Kanban)</h2>
                    <span class="text-secondary">${filteredJobs.length} Jobs in ${customColumns.length} Phasen</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm" id="btn-toggle-batch-mode">
                        <i data-lucide="${this.batchMode ? 'check-square' : 'square'}"></i> ${this.batchMode ? 'Mehrfachauswahl Beenden' : 'Mehrfachauswahl'}
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-configure-columns">
                        <i data-lucide="settings"></i> Spalten Anpassen
                    </button>
                </div>
            </div>
            
            ${this.batchMode ? `
                <div class="batch-actions-bar glass-card flex-between align-center" style="padding: 12px 20px; margin-bottom: 16px; border: 1px solid var(--color-primary);">
                    <span><strong>${this.selectedJobIds.size}</strong> Jobs ausgewählt</span>
                    <div class="flex-row gap-8">
                        <select id="batch-move-status" class="form-input" style="padding: 4px 8px; font-size: 0.85rem;">
                            <option value="">Status ändern zu...</option>
                            ${customColumns.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                        </select>
                        <button class="btn btn-danger btn-sm" id="btn-batch-delete"><i data-lucide="trash-2"></i> Löschen</button>
                    </div>
                </div>
            ` : ''}

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
                ${customColumns.map(col => {
                    const colJobs = filteredJobs.filter(j => j.status === col.id);
                    return `
                        <div class="kanban-column" data-status="${col.id}">
                            <div class="kanban-column-header flex-between align-center">
                                <div class="column-title-group">
                                    <i data-lucide="folder"></i>
                                    <h4>${col.title}</h4>
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

        if (window.lucide) lucide.createIcons();
        this.initDragAndDrop(container);
        this.bindCardEvents(container);
        this.bindControlsEvents(container);
    },

    createCardHtml(job, userSkills) {
        const profile = storage.getProfile();
        const matchAnalysis = mockAi.analyzeJobMatch(job.description || '', userSkills || profile.skills);
        const score = matchAnalysis.matchScore;
        
        let scoreClass = 'low';
        if (score >= 75) scoreClass = 'high';
        else if (score >= 40) scoreClass = 'medium';

        // Check for follow-up needed (applied > 14 days ago)
        const dateCreated = new Date(job.createdAt || Date.now());
        const daysDiff = Math.floor((Date.now() - dateCreated.getTime()) / (1000 * 3600 * 24));
        const needsFollowUp = (job.status === 'applied' || job.status === 'ready') && daysDiff >= 14;

        const isChecked = this.selectedJobIds.has(job.id);

        return `
            <div class="glass-card kanban-card ${isChecked ? 'selected' : ''}" draggable="true" data-id="${job.id}" tabindex="0">
                ${this.batchMode ? `
                    <div style="margin-bottom: 6px;">
                        <input type="checkbox" class="batch-card-checkbox" data-id="${job.id}" ${isChecked ? 'checked' : ''}>
                    </div>
                ` : ''}
                <div class="card-top flex-between align-center">
                    <span class="card-company" title="${job.company}">${job.company}</span>
                    <div class="card-menu">
                        <button class="card-btn-action edit" title="Bearbeiten"><i data-lucide="edit-2"></i></button>
                        <button class="card-btn-action delete" title="Löschen"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <h5 class="card-title" title="${job.title}">${job.title}</h5>

                ${needsFollowUp ? `
                    <div style="margin: 6px 0;">
                        <button class="btn btn-warning btn-sm btn-followup" data-id="${job.id}" style="font-size: 0.72rem; padding: 2px 6px;">
                            <i data-lucide="mail"></i> Nachfassen (${daysDiff} Tage)
                        </button>
                    </div>
                ` : ''}

                <div class="card-meta-grid">
                    <div class="meta-item">
                        <i data-lucide="map-pin"></i>
                        <span>${job.location || 'K.A.'}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="euro"></i>
                        <span>${job.salary ? job.salary.toLocaleString('de-DE') + ' €' : 'K.A.'}</span>
                    </div>
                </div>

                ${job.tags && Array.isArray(job.tags) && job.tags.length > 0 ? `
                    <div class="card-tags-list" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                        ${job.tags.slice(0, 3).map(t => `<span class="badge badge-saved" style="font-size: 0.65rem; padding: 1px 5px;">#${t}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="card-footer flex-between align-center" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color);">
                    <span class="match-badge ${scoreClass}">${score}% Match</span>
                    <span class="text-muted" style="font-size: 0.75rem;">${daysDiff === 0 ? 'heute' : `vor ${daysDiff}d`}</span>
                </div>
            </div>
        `;
    },

    initDragAndDrop(container) {
        const cards = container.querySelectorAll('.kanban-card');
        const lists = container.querySelectorAll('.kanban-cards-list');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
                card.classList.add('dragging');
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
                
                if (jobId && newStatus) {
                    const jobs = storage.getJobs();
                    const job = jobs.find(j => j.id === jobId);

                    if (job) {
                        // Prompt rejection reason if moving to rejected status
                        if (newStatus === 'rejected' && job.status !== 'rejected') {
                            this.promptRejectionReason(job, () => {
                                job.status = newStatus;
                                storage.saveJobs(jobs);
                                this.render('view-kanban');
                            });
                        } else {
                            job.status = newStatus;
                            storage.saveJobs(jobs);
                            this.render('view-kanban');
                        }
                    }
                }
            });
        });
    },

    promptRejectionReason(job, callback) {
        const modalHtml = `
            <div class="modal-overlay active" id="rejection-prompt-modal">
                <div class="glass-card modal-content" style="max-width: 440px; padding: 24px;">
                    <h3><i data-lucide="frown"></i> Absagegrund erfassen</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                        Erfasse den Grund für die Absage bei <strong>${job.company}</strong>, um dein Profil im Dashboard zu optimieren:
                    </p>

                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem;">Hauptgrund:</label>
                        <select id="rej-reason-select" class="form-input">
                            <option value="Gehaltsvorstellung zu hoch">Gehaltsvorstellung zu hoch</option>
                            <option value="Fehlende Erfahrung in Tech-Skill">Fehlende Erfahrung in Tech-Skill</option>
                            <option value="Intern besetzt">Intern besetzt</option>
                            <option value="Absage nach Erstgespräch">Absage nach Erstgespräch</option>
                            <option value="Keine Rückmeldung / Sonstiges">Keine Rückmeldung / Sonstiges</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="font-size: 0.85rem;">Notizen / Details:</label>
                        <textarea id="rej-notes-input" class="form-input" rows="3" placeholder="Zusätzliches Feedback..."></textarea>
                    </div>

                    <div class="flex-between">
                        <button class="btn btn-secondary" id="btn-cancel-rej">Überspringen</button>
                        <button class="btn btn-primary" id="btn-save-rej">Speichern &amp; Verschieben</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) lucide.createIcons();

        const modal = document.getElementById('rejection-prompt-modal');
        const closeModal = () => {
            if (modal) modal.remove();
            if (callback) callback();
        };

        modal.querySelector('#btn-cancel-rej')?.addEventListener('click', closeModal);
        modal.querySelector('#btn-save-rej')?.addEventListener('click', () => {
            const reason = modal.querySelector('#rej-reason-select').value;
            const notes = modal.querySelector('#rej-notes-input').value;
            storage.addRejectionReason(job.id, job.company, job.title, reason, notes);
            closeModal();
        });
    },

    bindCardEvents(container) {
        // Edit card click
        container.querySelectorAll('.card-btn-action.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.kanban-card');
                const jobId = card.getAttribute('data-id');
                if (window.app && typeof window.app.openJobModal === 'function') {
                    window.app.openJobModal(jobId);
                }
            });
        });

        // Delete card click
        container.querySelectorAll('.card-btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.kanban-card');
                const jobId = card.getAttribute('data-id');
                if (confirm('Möchtest du diese Bewerbung wirklich löschen?')) {
                    storage.deleteJob(jobId);
                    this.render('view-kanban');
                }
            });
        });

        // Follow-up email trigger
        container.querySelectorAll('.btn-followup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = btn.getAttribute('data-id');
                const job = storage.getJobs().find(j => j.id === jobId);
                if (job) {
                    const subject = encodeURIComponent(`Nachfrage zu meiner Bewerbung als ${job.title}`);
                    const body = encodeURIComponent(`Sehr geehrte Damen und Herren,\n\nich wollte mich erkundigen, wie der aktuelle Stand meiner Bewerbung für die Stelle als ${job.title} bei ${job.company} ist.\n\nMit freundlichen Grüßen`);
                    window.location.href = `mailto:${job.contactEmail || ''}?subject=${subject}&body=${body}`;
                }
            });
        });

        // Batch checkboxes
        container.querySelectorAll('.batch-card-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) this.selectedJobIds.add(id);
                else this.selectedJobIds.delete(id);
                this.render('view-kanban');
            });
        });
    },

    bindControlsEvents(container) {
        // Workmode filter
        const workmodeSelect = container.querySelector('#kanban-filter-workmode');
        if (workmodeSelect) {
            workmodeSelect.addEventListener('change', (e) => {
                this.filterWorkmode = e.target.value;
                this.render('view-kanban');
            });
        }

        // Sort by
        const sortSelect = container.querySelector('#kanban-sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.render('view-kanban');
            });
        }

        // Toggle batch mode
        const batchBtn = container.querySelector('#btn-toggle-batch-mode');
        if (batchBtn) {
            batchBtn.addEventListener('click', () => {
                this.batchMode = !this.batchMode;
                if (!this.batchMode) this.selectedJobIds.clear();
                this.render('view-kanban');
            });
        }

        // Batch move status
        const batchMoveSelect = container.querySelector('#batch-move-status');
        if (batchMoveSelect) {
            batchMoveSelect.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                if (!newStatus || this.selectedJobIds.size === 0) return;
                const jobs = storage.getJobs();
                jobs.forEach(j => {
                    if (this.selectedJobIds.has(j.id)) j.status = newStatus;
                });
                storage.saveJobs(jobs);
                this.selectedJobIds.clear();
                this.render('view-kanban');
            });
        }

        // Batch delete
        const batchDeleteBtn = container.querySelector('#btn-batch-delete');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                if (this.selectedJobIds.size === 0) return;
                if (confirm(`${this.selectedJobIds.size} ausgewählte Jobs wirklich löschen?`)) {
                    let jobs = storage.getJobs();
                    jobs = jobs.filter(j => !this.selectedJobIds.has(j.id));
                    storage.saveJobs(jobs);
                    this.selectedJobIds.clear();
                    this.render('view-kanban');
                }
            });
        }

        // Configure custom columns button
        container.querySelector('#btn-configure-columns')?.addEventListener('click', () => {
            this.openColumnConfigModal();
        });
    },

    openColumnConfigModal() {
        const columns = storage.getCustomColumns();

        const modalHtml = `
            <div class="modal-overlay active" id="column-config-modal">
                <div class="glass-card modal-content" style="max-width: 500px; padding: 24px;">
                    <h3><i data-lucide="settings"></i> Kanban-Spalten Anpassen</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                        Passe die Namen und Reihenfolge deiner Kanban-Phasen an:
                    </p>

                    <div id="col-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        ${columns.map((c, idx) => `
                            <div class="flex-between align-center" style="gap: 8px;">
                                <input type="text" class="form-input col-title-input" data-idx="${idx}" value="${c.title}">
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex-between">
                        <button class="btn btn-secondary" id="btn-close-col-config">Abbrechen</button>
                        <button class="btn btn-primary" id="btn-save-col-config">Speichern</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) lucide.createIcons();

        const modal = document.getElementById('column-config-modal');
        modal.querySelector('#btn-close-col-config')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#btn-save-col-config')?.addEventListener('click', () => {
            const inputs = modal.querySelectorAll('.col-title-input');
            inputs.forEach(inp => {
                const idx = parseInt(inp.getAttribute('data-idx'), 10);
                if (columns[idx]) columns[idx].title = inp.value.trim() || columns[idx].title;
            });
            storage.saveCustomColumns(columns);
            modal.remove();
            this.render('view-kanban');
        });
    }
};
