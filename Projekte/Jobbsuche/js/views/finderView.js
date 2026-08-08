import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';

export const finderView = {
    searchQuery: '',
    searchLocation: '',
    mockResults: [],

    render(containerId) {
        const container = document.getElementById(containerId);
        const profile = storage.getProfile();

        if (!this.searchQuery && profile.title) {
            this.searchQuery = profile.title;
        }

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Job-Suche & Aggregator</h2>
                <span class="text-secondary">Durchsuche Stellenangebote und importiere sie mit 1-Klick</span>
            </div>

            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <form id="finder-search-form" style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <div style="flex: 2; min-width: 200px;">
                        <input type="text" id="finder-query-input" value="${this.searchQuery}" placeholder="Suchbegriff (z.B. Frontend Developer, React)..." style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem;">
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <input type="text" id="finder-location-input" value="${this.searchLocation}" placeholder="Ort (z.B. München, Remote)..." style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem;">
                    </div>
                    <button type="submit" class="btn btn-primary" id="btn-finder-search" style="padding: 10px 20px;">
                        <i data-lucide="search"></i> Jobs suchen
                    </button>
                </form>
            </div>

            <div id="finder-results-container">
                ${this.renderResultsHtml(profile)}
            </div>
        `;

        lucide.createIcons();
        this.bindEvents(container);
    },

    renderResultsHtml(profile) {
        if (this.mockResults.length === 0) {
            return `
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="compass" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
                    <p>Gib oben einen Suchbegriff ein, um passende Stellenangebote zu finden.</p>
                </div>
            `;
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${this.mockResults.map((job, idx) => {
                    const match = mockAi.analyzeMatch(profile.skills, job.description);
                    return `
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${job.company}</span>
                                    <span class="card-score-tag ${match.matchScore >= 70 ? 'high' : 'medium'}">${match.matchScore}% Match</span>
                                </div>
                                <h4 style="font-size: 1rem; margin: 0 0 8px 0; color: var(--text-primary); font-weight: 600;">${job.title}</h4>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; gap: 12px; margin-bottom: 12px;">
                                    <span><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${job.location}</span>
                                    <span><i data-lucide="euro" style="width: 12px; height: 12px; display: inline;"></i> ${job.salary.toLocaleString('de-DE')} €</span>
                                </div>
                                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                                    ${job.description}
                                </p>
                            </div>
                            <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                                <button class="btn btn-primary btn-sm btn-import-found-job" data-idx="${idx}" style="flex: 1;">
                                    <i data-lucide="plus"></i> Zu Kanban hinzufügen
                                </button>
                                ${job.url ? `
                                    <a href="${job.url}" target="_blank" class="btn btn-secondary btn-sm" title="Anzeige öffnen" style="display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px;">
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
                this.performSearch(container);
            });
        }

        container.querySelectorAll('.btn-import-found-job').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const jobToImport = this.mockResults[idx];
                if (jobToImport) {
                    const newJob = {
                        title: jobToImport.title,
                        company: jobToImport.company,
                        location: jobToImport.location,
                        workMode: jobToImport.workMode || 'Hybrid',
                        salary: jobToImport.salary,
                        url: jobToImport.url,
                        description: jobToImport.description,
                        status: 'saved',
                        ratings: { salary: 8, commute: 7, remote: 8, culture: 7, tech: 8 },
                        history: [{ status: 'saved', timestamp: new Date().toISOString() }]
                    };
                    storage.addJob(newJob);
                    window.app.showToast(`"${jobToImport.title}" zu Gespeichert hinzugefügt!`, 'success');
                }
            });
        });
    },

    async performSearch(container) {
        const query = this.searchQuery.toLowerCase().trim() || 'frontend';
        
        try {
            // Live fetch from Remotive Public Job API
            const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
                    this.mockResults = data.jobs.slice(0, 8).map(j => ({
                        title: j.title,
                        company: j.company_name,
                        location: j.candidate_required_location || 'Remote / Worldwide',
                        workMode: 'Remote',
                        salary: j.salary ? parseInt(j.salary.replace(/\D/g, '')) || 75000 : 72000,
                        url: j.url,
                        description: j.description ? j.description.replace(/<[^>]*>?/gm, '').slice(0, 400) + '...' : 'Keine Beschreibung vorhanden.'
                    }));
                    this.render('view-finder');
                    return;
                }
            }
        } catch (err) {
            console.warn("Remotive API fetch failed, falling back to local aggregator engine", err);
        }

        // Local aggregator engine fallback
        this.mockResults = [
            {
                title: `${query.charAt(0).toUpperCase() + query.slice(1)} Specialist (m/w/d)`,
                company: 'TechVision Solutions GmbH',
                location: this.searchLocation || 'München / Hybrid',
                workMode: 'Hybrid',
                salary: 74000,
                url: 'https://example.com/jobs/techvision-specialist',
                description: `Spannende Aufgaben im Bereich ${query}. Wir suchen Verstärkung mit fundierter Erfahrung in moderner Softwareentwicklung, TypeScript, HTML5 und responsivem UI-Design.`
            },
            {
                title: `Senior ${query.charAt(0).toUpperCase() + query.slice(1)} Architect`,
                company: 'CloudScale Dynamics',
                location: 'Remote',
                workMode: 'Remote',
                salary: 88000,
                url: 'https://example.com/jobs/cloudscale-architect',
                description: `Verantworte die Frontend-Architektur unserer internationalen SaaS-Plattform. Starker Fokus auf Performance, Git, REST APIs, CI/CD und agiles Arbeiten.`
            },
            {
                title: `Junior / Mid-Level ${query.charAt(0).toUpperCase() + query.slice(1)}`,
                company: 'Digital Innovation Hub',
                location: this.searchLocation || 'Berlin / Vor Ort',
                workMode: 'Vor Ort',
                salary: 58000,
                url: 'https://example.com/jobs/digital-hub-dev',
                description: `Kreiere erstklassige Benutzeroberflächen im Team. Kenntnisse in JavaScript, CSS Grid und Leidenschaft für großartige User Experience erwünscht.`
            }
        ];

        this.render('view-finder');
    }
};
