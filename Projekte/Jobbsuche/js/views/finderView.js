import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { webClipper } from '../utils/webClipper.js';
import { jobApi } from '../utils/jobApi.js';

export const finderView = {
    searchQuery: '',
    searchLocation: '',
    workModeFilter: 'all',
    liveResults: [],
    isLoading: false,

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const profile = storage.getProfile();
        if (!this.searchQuery && profile.title) {
            this.searchQuery = profile.title;
        }

        const bookmarkletCode = webClipper.getBookmarkletCode();

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Job-Suche, Live-Aggregator &amp; Web Clipper</h2>
                <span class="text-secondary">Durchsuche echte Live-Stellenangebote (Arbeitnow &amp; Open Feeds) oder clippe Jobs direkt aus LinkedIn, StepStone &amp; Co.</span>
            </div>

            <!-- Web Clipper / Bookmarklet Banner -->
            <div class="glass-card" style="padding: 20px; margin-bottom: 24px; border-left: 4px solid var(--color-primary);">
                <div class="flex-between align-center">
                    <div>
                        <h4 style="margin: 0;"><i data-lucide="bookmark"></i> JobMatch Web Clipper Bookmarklet</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin: 4px 0 0 0;">Ziehe den Button in deine Browser-Lesezeichenleiste, um Jobs direkt von beliebigen Jobbörsen in JobMatch zu speichern:</p>
                    </div>
                    <a href="${bookmarkletCode}" class="btn btn-primary" onclick="alert('Ziehe diesen Button in deine Lesezeichenleiste!'); return false;" style="cursor: move;">
                        📌 + In JobMatch clippen
                    </a>
                </div>
            </div>

            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <form id="finder-search-form" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 2; min-width: 200px;">
                        <input type="text" id="finder-query-input" value="${this.searchQuery}" placeholder="Suchbegriff (z.B. Frontend, React, Python, DevOps)..." class="form-input">
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <input type="text" id="finder-location-input" value="${this.searchLocation}" placeholder="Ort (z.B. München, Remote, Berlin)..." class="form-input">
                    </div>
                    <div style="min-width: 130px;">
                        <select id="finder-workmode-select" class="form-input" style="padding: 10px;">
                            <option value="all" ${this.workModeFilter === 'all' ? 'selected' : ''}>Alle Modelle</option>
                            <option value="Remote" ${this.workModeFilter === 'Remote' ? 'selected' : ''}>100% Remote</option>
                            <option value="Hybrid" ${this.workModeFilter === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                            <option value="Vor Ort" ${this.workModeFilter === 'Vor Ort' ? 'selected' : ''}>Vor Ort</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" id="btn-finder-search" ${this.isLoading ? 'disabled' : ''}>
                        <i data-lucide="${this.isLoading ? 'loader' : 'search'}" class="${this.isLoading ? 'spin' : ''}"></i> 
                        ${this.isLoading ? 'Suche läuft...' : 'Live Jobs suchen'}
                    </button>
                </form>
            </div>

            <div id="finder-results-container">
                ${this.renderResultsHtml(profile)}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container);

        // Auto-search initially if no results yet
        if (this.liveResults.length === 0 && !this.isLoading) {
            this.performSearch(container);
        }
    },

    renderResultsHtml(profile) {
        if (this.isLoading) {
            return `
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <div class="ai-loader-spinner" style="margin: 0 auto 16px auto;"></div>
                    <p>Durchsuche Live-Job-APIs nach aktuellen Stellenangeboten...</p>
                </div>
            `;
        }

        let filtered = [...this.liveResults];
        if (this.workModeFilter !== 'all') {
            filtered = filtered.filter(j => j.workMode === this.workModeFilter);
        }

        if (filtered.length === 0) {
            return `
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="compass" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
                    <p>Keine passenden Stellen gefunden. Probiere andere Suchbegriffe oder Orte aus.</p>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                <strong>${filtered.length}</strong> Stellenangebote gefunden (Echtzeit-Treffer):
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${filtered.map((job, idx) => {
                    const match = mockAi.analyzeJobMatch(job.description || '', profile.skills || []);
                    return `
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-top: 3px solid var(--color-primary);">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${job.company}</span>
                                    <span class="card-score-tag ${match.matchScore >= 70 ? 'high' : 'medium'}">${match.matchScore}% Match</span>
                                </div>
                                <h4 style="font-size: 1rem; margin: 0 0 8px 0; color: var(--text-primary); font-weight: 600;">${job.title}</h4>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                                    <span><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${job.location}</span>
                                    <span><i data-lucide="briefcase" style="width: 12px; height: 12px; display: inline;"></i> ${job.workMode || 'Vollzeit'}</span>
                                    <span><i data-lucide="euro" style="width: 12px; height: 12px; display: inline;"></i> ~${(job.salary || 60000).toLocaleString('de-DE')} €</span>
                                </div>
                                ${job.tags && job.tags.length > 0 ? `
                                    <div class="keyword-tags" style="margin-bottom: 10px;">
                                        ${job.tags.map(t => `<span class="badge badge-saved" style="font-size: 0.7rem;">#${t}</span>`).join(' ')}
                                    </div>
                                ` : ''}
                                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                                    ${job.description}
                                </p>
                            </div>
                            <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                                <button class="btn btn-primary btn-sm btn-import-found-job" data-idx="${idx}" style="flex: 1;">
                                    <i data-lucide="plus"></i> Zu Kanban hinzufügen
                                </button>
                                ${job.url ? `
                                    <a href="${job.url}" target="_blank" class="btn btn-secondary btn-sm" title="Anzeige öffnen">
                                        <i data-lucide="external-link"></i>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    bindEvents(container) {
        const form = container.querySelector('#finder-search-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchQuery = container.querySelector('#finder-query-input').value.trim();
                this.searchLocation = container.querySelector('#finder-location-input').value.trim();
                const modeSelect = container.querySelector('#finder-workmode-select');
                if (modeSelect) this.workModeFilter = modeSelect.value;
                this.performSearch(container);
            });
        }

        const modeSelect = container.querySelector('#finder-workmode-select');
        if (modeSelect) {
            modeSelect.addEventListener('change', () => {
                this.workModeFilter = modeSelect.value;
                const profile = storage.getProfile();
                const resultsContainer = container.querySelector('#finder-results-container');
                if (resultsContainer) {
                    resultsContainer.innerHTML = this.renderResultsHtml(profile);
                    if (window.lucide) lucide.createIcons();
                    this.bindResultsEvents(container);
                }
            });
        }

        this.bindResultsEvents(container);
    },

    bindResultsEvents(container) {
        container.querySelectorAll('.btn-import-found-job').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const job = this.liveResults[idx];
                if (job) {
                    storage.addJob({
                        ...job,
                        id: 'job-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                        createdAt: new Date().toISOString()
                    });
                    btn.innerHTML = `<i data-lucide="check"></i> Hinzugefügt!`;
                    btn.disabled = true;
                    if (window.lucide) lucide.createIcons();
                    if (window.app && window.app.showToast) {
                        window.app.showToast(`Job "${job.title}" zu Kanban hinzugefügt!`, 'success');
                    }
                }
            });
        });
    },

    async performSearch(container) {
        this.isLoading = true;
        const profile = storage.getProfile();
        const resultsContainer = container.querySelector('#finder-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderResultsHtml(profile);
        }

        const query = this.searchQuery || profile.title || 'Developer';
        const loc = this.searchLocation || '';

        try {
            this.liveResults = await jobApi.searchJobs(query, loc);
        } catch (e) {
            console.error('Job search error:', e);
            this.liveResults = jobApi.getFallbackJobs();
        } finally {
            this.isLoading = false;
            this.render('view-finder');
        }
    }
};
