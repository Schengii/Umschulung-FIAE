/**
 * Salary Radar & Regional Benchmark Submodule
 * Calculates detailed salary percentiles based on German federal state, company size and seniority.
 */
export const salaryRadar = {
    selectedState: 'bayern',
    selectedCompanySize: 'medium',
    selectedSeniority: 'senior',

    stateMultipliers: {
        bayern: { name: 'Bayern (München, Nürnberg)', mult: 1.15 },
        bw: { name: 'Baden-Württemberg (Stuttgart)', mult: 1.14 },
        hessen: { name: 'Hessen (Frankfurt)', mult: 1.12 },
        hamburg: { name: 'Hamburg', mult: 1.08 },
        nrw: { name: 'Nordrhein-Westfalen (Köln, Düsseldorf)', mult: 1.04 },
        berlin: { name: 'Berlin', mult: 1.00 },
        niedersachsen: { name: 'Niedersachsen / Bremen', mult: 0.96 },
        ost: { name: 'Ostdeutschland (Sachsen, Thüringen etc.)', mult: 0.88 },
        remote: { name: '100% Remote (Bundesweiter Schnitt)', mult: 1.00 }
    },

    companyMultipliers: {
        startup: { name: 'Startup / Kleinbetrieb (< 50 MA)', mult: 0.90 },
        medium: { name: 'Mittelstand (50 - 500 MA)', mult: 1.00 },
        large: { name: 'Großunternehmen (500 - 2.000 MA)', mult: 1.10 },
        enterprise: { name: 'Konzern / DAX (> 2.000 MA)', mult: 1.25 }
    },

    baseSalariesByRole: {
        junior: { p25: 45000, median: 52000, p75: 58000, top10: 65000 },
        mid: { p25: 58000, median: 66000, p75: 74000, top10: 82000 },
        senior: { p25: 72000, median: 82000, p75: 94000, top10: 108000 },
        lead: { p25: 88000, median: 98000, p75: 115000, top10: 135000 }
    },

    render(container, job, profile) {
        const stats = this.calculateBenchmark();

        container.innerHTML = `
            <div class="salary-radar-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="compass"></i> Regionales &amp; Branchenweites Gehaltsbänder-Radar</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Ermittle realistische Gehaltsbänder nach Bundesland, Unternehmensgröße und Erfahrungslevel.
                        </p>
                    </div>
                </div>

                <!-- Filter Controls -->
                <div class="glass-card" style="padding: 20px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Bundesland / Region:</label>
                        <select id="radar-state-select" class="form-input">
                            ${Object.entries(this.stateMultipliers).map(([k, v]) => `
                                <option value="${k}" ${this.selectedState === k ? 'selected' : ''}>${v.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Unternehmensgröße:</label>
                        <select id="radar-company-select" class="form-input">
                            ${Object.entries(this.companyMultipliers).map(([k, v]) => `
                                <option value="${k}" ${this.selectedCompanySize === k ? 'selected' : ''}>${v.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Senioritäts-Level:</label>
                        <select id="radar-seniority-select" class="form-input">
                            <option value="junior" ${this.selectedSeniority === 'junior' ? 'selected' : ''}>Junior (0 - 2 Jahre)</option>
                            <option value="mid" ${this.selectedSeniority === 'mid' ? 'selected' : ''}>Mid-Level (3 - 5 Jahre)</option>
                            <option value="senior" ${this.selectedSeniority === 'senior' ? 'selected' : ''}>Senior (5+ Jahre)</option>
                            <option value="lead" ${this.selectedSeniority === 'lead' ? 'selected' : ''}>Lead / Staff / Architekt (8+ Jahre)</option>
                        </select>
                    </div>
                </div>

                <!-- Visual Salary Band Visualization -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
                    <div class="flex-between align-center" style="margin-bottom: 20px;">
                        <div>
                            <span class="text-secondary" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Marktüblicher Median</span>
                            <h2 style="margin: 2px 0 0 0; color: var(--color-primary); font-size: 1.8rem;">
                                ${stats.median.toLocaleString('de-DE')} € <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: normal;">brutto / Jahr</span>
                            </h2>
                        </div>
                        <span class="badge badge-offer" style="font-size: 0.85rem;">
                            Spanne: ${stats.p25.toLocaleString('de-DE')} € &ndash; ${stats.p75.toLocaleString('de-DE')} €
                        </span>
                    </div>

                    <!-- Visual Progress Bar -->
                    <div style="background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; position: relative; margin-bottom: 30px; overflow: hidden; display: flex;">
                        <div style="width: 25%; background: rgba(107, 114, 128, 0.4);" title="25. Perzentil"></div>
                        <div style="width: 50%; background: linear-gradient(90deg, var(--color-primary), #38bdf8);" title="Kernspanne (Median)"></div>
                        <div style="width: 25%; background: rgba(16, 185, 129, 0.5);" title="Top 10%"></div>
                    </div>

                    <!-- 4 Metric Cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">25. Perzentil</span>
                            <strong style="font-size: 1.05rem; color: #cbd5e1;">${stats.p25.toLocaleString('de-DE')} €</strong>
                        </div>
                        <div style="background: rgba(99,102,241,0.1); border: 1px solid var(--color-primary); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--color-primary); display: block; font-weight: 700;">Median (Marktwert)</span>
                            <strong style="font-size: 1.15rem; color: #ffffff;">${stats.median.toLocaleString('de-DE')} €</strong>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">75. Perzentil</span>
                            <strong style="font-size: 1.05rem; color: #cbd5e1;">${stats.p75.toLocaleString('de-DE')} €</strong>
                        </div>
                        <div style="background: rgba(16,185,129,0.1); border: 1px solid var(--color-success); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--color-success); display: block; font-weight: 700;">Top 10% (High Performer)</span>
                            <strong style="font-size: 1.05rem; color: var(--color-success);">${stats.top10.toLocaleString('de-DE')} €</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    calculateBenchmark() {
        const base = this.baseSalariesByRole[this.selectedSeniority] || this.baseSalariesByRole.senior;
        const stateMult = this.stateMultipliers[this.selectedState]?.mult || 1.0;
        const compMult = this.companyMultipliers[this.selectedCompanySize]?.mult || 1.0;

        const totalMult = stateMult * compMult;

        return {
            p25: Math.round((base.p25 * totalMult) / 500) * 500,
            median: Math.round((base.median * totalMult) / 500) * 500,
            p75: Math.round((base.p75 * totalMult) / 500) * 500,
            top10: Math.round((base.top10 * totalMult) / 500) * 500
        };
    },

    bindEvents(container, job, profile) {
        container.querySelector('#radar-state-select')?.addEventListener('change', (e) => {
            this.selectedState = e.target.value;
            this.render(container, job, profile);
        });

        container.querySelector('#radar-company-select')?.addEventListener('change', (e) => {
            this.selectedCompanySize = e.target.value;
            this.render(container, job, profile);
        });

        container.querySelector('#radar-seniority-select')?.addEventListener('change', (e) => {
            this.selectedSeniority = e.target.value;
            this.render(container, job, profile);
        });
    }
};
