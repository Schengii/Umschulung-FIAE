import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { calculateGermanNetSalary } from '../utils/taxCalculator.js';

export const comparerView = {
    activeTab: 'matrix',
    showdownJob1Id: null,
    showdownJob2Id: null,
    chartInstance: null,

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const jobs = storage.getJobs().filter(j => j.status !== 'rejected');
        const weights = storage.getWeights();

        if (jobs.length >= 2) {
            if (!this.showdownJob1Id || !jobs.some(j => j.id === this.showdownJob1Id)) this.showdownJob1Id = jobs[0].id;
            if (!this.showdownJob2Id || !jobs.some(j => j.id === this.showdownJob2Id)) this.showdownJob2Id = jobs[1].id;
        }

        container.innerHTML = `
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Job-Vergleicher &amp; Entscheidungsmatrix</h2>
                    <span class="text-secondary">Objektive Bewertung und 1-gegen-1 Showdown für deine Angebote</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm ${this.activeTab === 'matrix' ? 'active' : ''}" id="btn-tab-matrix">
                        <i data-lucide="grid"></i> Entscheidungsmatrix
                    </button>
                    <button class="btn btn-secondary btn-sm ${this.activeTab === 'showdown' ? 'active' : ''}" id="btn-tab-showdown">
                        <i data-lucide="swords"></i> 1-vs-1 Showdown
                    </button>
                </div>
            </div>

            <div id="comparer-tab-content"></div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindTabEvents(container, jobs, weights);
        this.renderTabContent(jobs, weights);
    },

    bindTabEvents(container, jobs, weights) {
        container.querySelector('#btn-tab-matrix')?.addEventListener('click', () => {
            this.activeTab = 'matrix';
            this.render('view-comparer');
        });
        container.querySelector('#btn-tab-showdown')?.addEventListener('click', () => {
            this.activeTab = 'showdown';
            this.render('view-comparer');
        });
    },

    renderTabContent(jobs, weights) {
        const contentBox = document.getElementById('comparer-tab-content');
        if (!contentBox) return;

        if (this.activeTab === 'matrix') {
            this.renderMatrixTab(contentBox, jobs, weights);
        } else {
            this.renderShowdownTab(contentBox, jobs);
        }
    },

    renderMatrixTab(contentBox, jobs, weights) {
        contentBox.innerHTML = `
            <div class="comparer-layout">
                <!-- Left: Weights Config Panel -->
                <div class="glass-card weighting-panel">
                    <h3>Kriterien-Gewichtung</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                        Passe an, wie wichtig dir die einzelnen Faktoren bei der Jobsuche sind (1 = Nebensächlich, 5 = Essentiell).
                    </p>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Gehalt &amp; Benefits</span>
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
                <div class="matrix-container" id="matrix-cols-holder"></div>
            </div>
        `;

        this.renderColumns(jobs, weights);
        this.bindSliderEvents(contentBox, jobs);
        if (window.lucide) lucide.createIcons();
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
            if (window.lucide) lucide.createIcons();
            return;
        }

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
            const scorePercent = Math.round((weightedScore / (totalWeight * 10)) * 100);
            return { ...job, scorePercent, ratings };
        }).sort((a, b) => b.scorePercent - a.scorePercent);

        holder.innerHTML = `
            <div class="flex-row gap-16" style="overflow-x: auto; padding-bottom: 12px;">
                ${scoredJobs.map((job, idx) => `
                    <div class="glass-card matrix-col" style="min-width: 260px; padding: 20px; border-top: 4px solid ${idx === 0 ? 'var(--color-success)' : 'var(--color-primary)'};">
                        ${idx === 0 ? '<span class="badge badge-offer" style="margin-bottom: 8px; display: inline-block;">★ Empfehlung Nr. 1</span>' : ''}
                        <h4 style="margin: 0; font-size: 1.1rem;">${job.company}</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin: 2px 0 12px 0;">${job.title}</p>

                        <div style="font-size: 2rem; font-weight: 800; color: var(--color-primary); margin-bottom: 16px;">
                            ${job.scorePercent}%
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                            <div class="flex-between"><span>Gehalt:</span><strong>${job.salary ? job.salary.toLocaleString('de-DE') + ' €' : 'K.A.'}</strong></div>
                            <div class="flex-between"><span>Modell:</span><strong>${job.workMode || 'K.A.'}</strong></div>
                            <div class="flex-between"><span>Standort:</span><strong>${job.location || 'K.A.'}</strong></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    bindSliderEvents(container, jobs) {
        ['salary', 'commute', 'remote', 'culture', 'tech'].forEach(key => {
            const slider = container.querySelector(`#slide-w-${key}`);
            const lbl = container.querySelector(`#lbl-w-${key}`);
            if (slider && lbl) {
                slider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value, 10);
                    lbl.textContent = `x${val}`;
                    const weights = storage.getWeights();
                    weights[key] = val;
                    storage.saveWeights(weights);
                    this.renderColumns(jobs, weights);
                });
            }
        });
    },

    renderShowdownTab(contentBox, jobs) {
        if (jobs.length < 2) {
            contentBox.innerHTML = `
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="swords" style="font-size: 3rem; color: var(--color-primary);"></i>
                    <h3>Mindestens 2 Angebote erforderlich</h3>
                    <p class="text-secondary">Für den 1-vs-1 Showdown benötigst du mindestens zwei aktive Jobangebote im Tracker.</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const job1 = jobs.find(j => j.id === this.showdownJob1Id) || jobs[0];
        const job2 = jobs.find(j => j.id === this.showdownJob2Id) || jobs[1];

        contentBox.innerHTML = `
            <div class="showdown-container">
                <div class="glass-card flex-between align-center" style="padding: 16px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Kandidat 1 (Blau):</label>
                        <select id="showdown-select-1" class="form-input" style="margin-top: 4px;">
                            ${jobs.map(j => `<option value="${j.id}" ${j.id === job1.id ? 'selected' : ''}>${j.company} - ${j.title}</option>`).join('')}
                        </select>
                    </div>

                    <div style="padding: 0 20px; font-weight: 800; font-size: 1.2rem; color: var(--text-secondary);">VS</div>

                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-secondary);">Kandidat 2 (Lila):</label>
                        <select id="showdown-select-2" class="form-input" style="margin-top: 4px;">
                            ${jobs.map(j => `<option value="${j.id}" ${j.id === job2.id ? 'selected' : ''}>${j.company} - ${j.title}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex-row gap-20" style="margin-bottom: 20px;">
                    <!-- Radar Chart -->
                    <div class="glass-card flex-1" style="padding: 20px; min-height: 320px;">
                        <h4><i data-lucide="radar"></i> Kriterien-Radar Diagramm</h4>
                        <div style="position: relative; height: 260px;">
                            <canvas id="showdown-radar-chart"></canvas>
                        </div>
                    </div>

                    <!-- Direct Stats Comparison -->
                    <div class="glass-card flex-1" style="padding: 20px;">
                        <h4><i data-lucide="list-checks"></i> Direkt-Vergleich</h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.85rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                                    <th style="padding: 8px;">Kriterium</th>
                                    <th style="padding: 8px; color: var(--color-primary);">${job1.company}</th>
                                    <th style="padding: 8px; color: var(--color-secondary);">${job2.company}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Gehalt (Brutto):</td>
                                    <td style="padding: 8px;">${job1.salary ? job1.salary.toLocaleString('de-DE') + ' €' : 'K.A.'}</td>
                                    <td style="padding: 8px;">${job2.salary ? job2.salary.toLocaleString('de-DE') + ' €' : 'K.A.'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Arbeitsmodell:</td>
                                    <td style="padding: 8px;">${job1.workMode || 'K.A.'}</td>
                                    <td style="padding: 8px;">${job2.workMode || 'K.A.'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Standort:</td>
                                    <td style="padding: 8px;">${job1.location || 'K.A.'}</td>
                                    <td style="padding: 8px;">${job2.location || 'K.A.'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.initShowdownChart(job1, job2);

        contentBox.querySelector('#showdown-select-1')?.addEventListener('change', (e) => {
            this.showdownJob1Id = e.target.value;
            this.renderShowdownTab(contentBox, jobs);
        });
        contentBox.querySelector('#showdown-select-2')?.addEventListener('change', (e) => {
            this.showdownJob2Id = e.target.value;
            this.renderShowdownTab(contentBox, jobs);
        });
    },

    initShowdownChart(job1, job2) {
        const canvas = document.getElementById('showdown-radar-chart');
        if (!canvas || !window.Chart) return;

        if (this.chartInstance) this.chartInstance.destroy();

        const r1 = job1.ratings || { salary: 5, commute: 5, remote: 5, culture: 5, tech: 5 };
        const r2 = job2.ratings || { salary: 5, commute: 5, remote: 5, culture: 5, tech: 5 };

        this.chartInstance = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['Gehalt', 'Pendelzeit', 'Homeoffice', 'Kultur', 'Tech-Stack'],
                datasets: [
                    {
                        label: job1.company,
                        data: [r1.salary, r1.commute, r1.remote, r1.culture, r1.tech],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)'
                    },
                    {
                        label: job2.company,
                        data: [r2.salary, r2.commute, r2.remote, r2.culture, r2.tech],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: { stepSize: 2 }
                    }
                }
            }
        });
    }
};
