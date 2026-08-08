import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { calculateGermanNetSalary } from '../utils/taxCalculator.js';

export const comparerView = {
    render(containerId) {
        const container = document.getElementById(containerId);
        const jobs = storage.getJobs().filter(j => j.status !== 'rejected'); // exclude rejected
        const weights = storage.getWeights();

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Job-Vergleicher (Entscheidungsmatrix)</h2>
                <span class="text-secondary">Vergleiche deine Angebote anhand gewichteter Kriterien</span>
            </div>
            
            <div class="comparer-layout">
                <!-- Left: Weights Config Panel -->
                <div class="glass-card weighting-panel">
                    <h3>Kriterien-Gewichtung</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                        Passe an, wie wichtig dir die einzelnen Faktoren bei der Jobsuche sind (1 = Nebensächlich, 5 = Essentiell).
                    </p>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Gehalt & Benefits</span>
                            <span class="weight-multiplier" id="lbl-w-salary">x${weights.salary}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-salary" min="1" max="5" value="${weights.salary}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Pendelzeit / Weg</span>
                            <span class="weight-multiplier" id="lbl-w-commute">x${weights.commute}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-commute" min="1" max="5" value="${weights.commute}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Homeoffice-Flexibilität</span>
                            <span class="weight-multiplier" id="lbl-w-remote">x${weights.remote}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-remote" min="1" max="5" value="${weights.remote}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Unternehmenskultur</span>
                            <span class="weight-multiplier" id="lbl-w-culture">x${weights.culture}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-culture" min="1" max="5" value="${weights.culture}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Tech-Stack / Aufgaben</span>
                            <span class="weight-multiplier" id="lbl-w-tech">x${weights.tech}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-tech" min="1" max="5" value="${weights.tech}">
                    </div>
                </div>

                <!-- Right: Scored Columns Matrix -->
                <div class="matrix-container" id="matrix-cols-holder">
                    <!-- Columns will be injected dynamically -->
                </div>
            </div>
        `;

        this.renderColumns(jobs, weights);
        this.bindSliderEvents(container, jobs);
        lucide.createIcons();
    },

    renderColumns(jobs, weights) {
        const holder = document.getElementById('matrix-cols-holder');
        if (!holder) return;

        if (jobs.length === 0) {
            holder.innerHTML = `
                <div class="glass-card empty-state" style="width: 100%; min-height: 300px;">
                    <i data-lucide="git-compare"></i>
                    <p>Keine aktiven Jobangebote zum Vergleichen vorhanden. Füge zuerst Jobs im Kanban-Board hinzu.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Calculate scores
        const scoredJobs = jobs.map(job => {
            const ratings = job.ratings || { salary: 5, commute: 5, remote: 5, culture: 5, tech: 5 };
            
            const totalWeight = weights.salary + weights.commute + weights.remote + weights.culture + weights.tech;
            const weightedScore = (
                (ratings.salary * weights.salary) +
                (ratings.commute * weights.commute) +
                (ratings.remote * weights.remote) +
                (ratings.culture * weights.culture) +
                (ratings.tech * weights.tech)
            );
            
            // Calculate final percentage score (0-100)
            const score = Math.round((weightedScore / (totalWeight * 10)) * 100);
            
            return {
                ...job,
                score,
                ratings
            };
        });

        // Sort by score descending
        scoredJobs.sort((a, b) => b.score - a.score);

        holder.innerHTML = scoredJobs.map((job, idx) => {
            const isBestMatch = idx === 0 && job.score > 0;
            const r = job.ratings;
            
            const getBadgeClass = (val) => val >= 8 ? 'high' : val >= 5 ? 'mid' : 'low';

            return `
                <div class="glass-card matrix-column ${isBestMatch ? 'best-match' : ''}">
                    ${isBestMatch ? `
                        <div class="best-match-badge">
                            <i data-lucide="trophy"></i> Best Match
                        </div>
                    ` : ''}
                    <span class="company-name">${job.company}</span>
                    <h4 class="job-title" title="${job.title}">${job.title}</h4>
                    
                    <div class="matrix-score-circle">
                        <span class="number">${job.score}</span>
                        <span class="percent">% Match</span>
                    </div>

                    <div class="matrix-criteria-list">
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Gehalt</span>
                            <span class="criteria-score-badge ${getBadgeClass(r.salary)}">${r.salary}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Pendelweg</span>
                            <span class="criteria-score-badge ${getBadgeClass(r.commute)}">${r.commute}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Homeoffice</span>
                            <span class="criteria-score-badge ${getBadgeClass(r.remote)}">${r.remote}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Kultur</span>
                            <span class="criteria-score-badge ${getBadgeClass(r.culture)}">${r.culture}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Tech Stack</span>
                            <span class="criteria-score-badge ${getBadgeClass(r.tech)}">${r.tech}/10</span>
                        </div>
                    </div>

                    <div class="matrix-meta-list">
                        <div class="matrix-meta-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                            <span class="label">Gehalt:</span>
                            <span class="val">${job.salary ? `${job.salary.toLocaleString('de-DE')} € Brutto` : 'K.A.'}</span>
                            ${job.salary ? (() => {
                                const net = calculateGermanNetSalary(job.salary);
                                return `<span style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 500;">ca. ${net.netMonthly.toLocaleString('de-DE')} € Netto/M.</span>`;
                            })() : ''}
                        </div>
                        <div class="matrix-meta-item">
                            <span class="label">Modus:</span>
                            <span class="val">${job.workMode || 'Hybrid'}</span>
                        </div>
                        <div class="matrix-meta-item">
                            <span class="label">Ort:</span>
                            <span class="val">${job.location || 'K.A.'}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button class="btn btn-secondary btn-full btn-sm btn-edit-comp" data-id="${job.id}">
                            <i data-lucide="edit-2"></i> Details
                        </button>
                        <button class="btn btn-primary btn-full btn-sm btn-copilot-comp" data-id="${job.id}">
                            <i data-lucide="sparkles"></i> Copilot
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();

        // Bind quick actions inside columns
        holder.querySelectorAll('.btn-edit-comp').forEach(btn => {
            btn.addEventListener('click', () => {
                window.app.editJob(btn.getAttribute('data-id'));
            });
        });

        holder.querySelectorAll('.btn-copilot-comp').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.app.switchToView('copilot', id);
            });
        });
    },

    bindSliderEvents(container, jobs) {
        const sliders = ['salary', 'commute', 'remote', 'culture', 'tech'];

        sliders.forEach(key => {
            const slider = container.querySelector(`#slide-w-${key}`);
            const label = container.querySelector(`#lbl-w-${key}`);

            if (slider && label) {
                slider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value);
                    label.textContent = `x${val}`;
                    
                    // Save weights
                    const weights = storage.getWeights();
                    weights[key] = val;
                    storage.saveWeights(weights);

                    // Re-calculate column layout
                    this.renderColumns(jobs, weights);
                });
            }
        });
    }
};
