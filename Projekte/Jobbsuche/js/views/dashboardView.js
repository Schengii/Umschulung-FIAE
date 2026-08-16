import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { calculateGermanNetSalary, calculateTotalCompensation, calculateNetHourlyRate } from '../utils/taxCalculator.js';
import { taxExport } from '../utils/taxExport.js';
import { downloadCalendarEvent } from '../utils/ics.js';

export const dashboardView = {
    chartInstance: null,
    salaryChartInstance: null,
    activityTrendChartInstance: null,

    render(containerId) {
        const container = document.getElementById(containerId);
        const jobs = storage.getJobs();
        const profile = storage.getProfile();
        const weights = storage.getWeights();

        if (jobs.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        // Calculate Stats
        const total = jobs.length;
        const saved = jobs.filter(j => j.status === 'saved').length;
        const applied = jobs.filter(j => j.status === 'applied' || j.status === 'interviewing' || j.status === 'offer').length;
        const interviews = jobs.filter(j => j.status === 'interviewing').length;
        const offers = jobs.filter(j => j.status === 'offer').length;

        // Calculate total expenses across all applications
        let totalExpenses = 0;
        jobs.forEach(j => {
            if (j.expenses && Array.isArray(j.expenses)) {
                j.expenses.forEach(e => {
                    totalExpenses += parseFloat(e.amount) || 0;
                });
            }
        });
        const formattedExpenses = totalExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

        // Funnel stats
        const savedCount = total;
        const appliedCount = jobs.filter(j => ['applied', 'interviewing', 'offer'].includes(j.status)).length;
        const interviewCount = jobs.filter(j => ['interviewing', 'offer'].includes(j.status)).length;
        const offerCount = jobs.filter(j => ['offer'].includes(j.status)).length;

        const appliedRate = Math.round((appliedCount / (savedCount || 1)) * 100);
        const interviewRate = Math.round((interviewCount / (savedCount || 1)) * 100);
        const offerRate = Math.round((offerCount / (savedCount || 1)) * 100);

        const appliedToInterviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;
        const interviewToOfferRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

        // Calculate average duration in days from saved to applied
        let totalDaysSavedToApplied = 0;
        let countSavedToApplied = 0;
        let totalDaysAppliedToInterview = 0;
        let countAppliedToInterview = 0;

        jobs.forEach(job => {
            const history = job.history || [];
            const savedEvent = history.find(h => h.status === 'saved');
            const appliedEvent = history.find(h => h.status === 'applied');
            const interviewEvent = history.find(h => h.status === 'interviewing');

            if (savedEvent && appliedEvent) {
                const diffTime = Math.abs(new Date(appliedEvent.timestamp) - new Date(savedEvent.timestamp));
                totalDaysSavedToApplied += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                countSavedToApplied++;
            }
            if (appliedEvent && interviewEvent) {
                const diffTime = Math.abs(new Date(interviewEvent.timestamp) - new Date(appliedEvent.timestamp));
                totalDaysAppliedToInterview += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                countAppliedToInterview++;
            }
        });

        const avgDaysToApply = countSavedToApplied > 0 ? Math.round(totalDaysSavedToApplied / countSavedToApplied) : 0;
        const avgDaysToInterview = countAppliedToInterview > 0 ? Math.round(totalDaysAppliedToInterview / countAppliedToInterview) : 0;

        // Calculate dynamic scores for top recommendations
        const jobScores = jobs.map(job => {
            const matchAnalysis = mockAi.analyzeMatch(profile.skills, job.description);
            
            // Calculate comparison score
            const ratings = job.ratings || { salary: 5, commute: 5, remote: 5, culture: 5, tech: 5 };
            const totalWeight = weights.salary + weights.commute + weights.remote + weights.culture + weights.tech;
            const weightedScore = (
                (ratings.salary * weights.salary) +
                (ratings.commute * weights.commute) +
                (ratings.remote * weights.remote) +
                (ratings.culture * weights.culture) +
                (ratings.tech * weights.tech)
            );
            const rawScore = Math.round((weightedScore / (totalWeight * 10)) * 100);
            
            return {
                ...job,
                compareScore: rawScore,
                skillScore: matchAnalysis.matchScore
            };
        });

        // Sort by comparison score descending
        const topJobs = [...jobScores]
            .sort((a, b) => b.compareScore - a.compareScore)
            .slice(0, 3);

        // Upcoming events: Jobs with upcoming deadlines (excluding rejections/offers)
        const upcomingEvents = jobs
            .filter(j => j.deadline && j.status !== 'rejected' && j.status !== 'offer')
            .map(j => {
                const date = new Date(j.deadline);
                return {
                    id: j.id,
                    title: j.title,
                    company: j.company,
                    deadline: j.deadline,
                    day: date.getDate(),
                    month: date.toLocaleString('de-DE', { month: 'short' }),
                    rawDate: date
                };
            })
            .sort((a, b) => a.rawDate - b.rawDate)
            .slice(0, 4);

        // --- Activity Heatmap Calculation ---
        const today = new Date();
        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        
        const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
        const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        
        const startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(today.getDate() - (12 * 7 + daysToMonday));
        
        const activityCounts = {};
        jobs.forEach(job => {
            if (job.createdAt) {
                const d = new Date(job.createdAt);
                const yyyymmdd = d.toISOString().slice(0, 10);
                activityCounts[yyyymmdd] = (activityCounts[yyyymmdd] || 0) + 1;
            }
            if (job.history && Array.isArray(job.history)) {
                job.history.forEach(h => {
                    if (h.timestamp) {
                        const d = new Date(h.timestamp);
                        const yyyymmdd = d.toISOString().slice(0, 10);
                        activityCounts[yyyymmdd] = (activityCounts[yyyymmdd] || 0) + 1;
                    }
                });
            }
        });
        
        let heatmapCellsHtml = '';
        const loopDate = new Date(startDate);
        const monthLabelCols = Array(13).fill('');
        let lastMonth = '';
        const tempDate = new Date(startDate);
        for (let w = 0; w < 13; w++) {
            const mName = tempDate.toLocaleString('de-DE', { month: 'short' });
            if (mName !== lastMonth) {
                monthLabelCols[w] = mName;
                lastMonth = mName;
            }
            tempDate.setDate(tempDate.getDate() + 7);
        }
        
        while (loopDate <= endDate) {
            const yyyymmdd = loopDate.toISOString().slice(0, 10);
            const count = activityCounts[yyyymmdd] || 0;
            
            let level = 0;
            if (count === 1) level = 1;
            else if (count === 2) level = 2;
            else if (count === 3) level = 3;
            else if (count >= 4) level = 4;
            
            const formattedDateStr = loopDate.toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const tooltipText = `${count} ${count === 1 ? 'Aktivität' : 'Aktivitäten'} am ${formattedDateStr}`;
            
            heatmapCellsHtml += `
                <div class="heatmap-cell level-${level}" 
                     data-date="${yyyymmdd}" 
                     data-count="${count}"
                     title="${tooltipText}"
                     style="width: 12px; height: 12px; border-radius: 2px; transition: background-color var(--transition-fast);">
                </div>
            `;
            
            loopDate.setDate(loopDate.getDate() + 1);
        }
        
        // --- Weekly Goals Calculation ---
        const weeklyGoal = profile.weeklyGoal || 3;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        let appliedInLast7Days = 0;
        jobs.forEach(job => {
            let appliedDate = null;
            if (job.history && Array.isArray(job.history)) {
                const appliedEvents = job.history.filter(h => h.status === 'applied');
                if (appliedEvents.length > 0) {
                    appliedDate = new Date(appliedEvents[appliedEvents.length - 1].timestamp);
                }
            }
            if (!appliedDate && job.status === 'applied' && job.createdAt) {
                appliedDate = new Date(job.createdAt);
            }
            if (appliedDate && appliedDate >= sevenDaysAgo) {
                appliedInLast7Days++;
            }
        });
        
        const goalPercent = Math.min(Math.round((appliedInLast7Days / weeklyGoal) * 100), 100);
        const goalReached = appliedInLast7Days >= weeklyGoal;
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (goalPercent / 100) * circumference;

        // Render HTML structure
        container.innerHTML = `
            <div class="dashboard-grid">
                <!-- Stat Cards -->
                <div class="stats-row">
                    <div class="glass-card stat-card">
                        <div class="stat-icon primary">
                            <i data-lucide="briefcase"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${total}</span>
                            <span class="stat-label">Gesamtanzahl</span>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon warning">
                            <i data-lucide="send"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${applied}</span>
                            <span class="stat-label">Bewerbungen offen</span>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon success">
                            <i data-lucide="award"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${offers}</span>
                            <span class="stat-label">Angebote erhalten</span>
                        </div>
                    </div>
                     <div class="glass-card stat-card">
                         <div class="stat-icon danger">
                             <i data-lucide="calendar"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val">${interviews}</span>
                             <span class="stat-label">Einladungen / Gespräch</span>
                         </div>
                     </div>
                     <div class="glass-card stat-card">
                         <div class="stat-icon success" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                             <i data-lucide="euro"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val">${formattedExpenses}</span>
                             <span class="stat-label">Bewerbungs-Kosten</span>
                         </div>
                     </div>
                     <div class="glass-card stat-card" style="border-color: rgba(99, 102, 241, 0.3); background: rgba(99, 102, 241, 0.04);" title="Marktgehalt geschätzt für ${profile.title || 'Entwickler'}">
                         <div class="stat-icon primary" style="background: rgba(99, 102, 241, 0.2); color: var(--primary);">
                             <i data-lucide="trending-up"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val" style="font-size: 1.15rem;">ca. 68.000 €</span>
                             <span class="stat-label">Marktgehalt Benchmark</span>
                         </div>
                     </div>
                 </div>

                <!-- Split Charts Row (Doughnut Chart + Funnel Widget) -->
                <div class="dashboard-charts-row" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px;">
                    <!-- Left: Doughnut Chart -->
                    <div class="glass-card chart-card" style="padding: 24px;">
                        <div class="chart-header" style="margin-bottom: 24px;">
                            <h3>Status-Verteilung deiner Bewerbungen</h3>
                        </div>
                        <div class="chart-container" style="height: 280px; position: relative;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>

                    <!-- Right: Funnel Widget -->
                    <div class="glass-card funnel-card" style="padding: 24px; display: flex; flex-direction: column;">
                        <div class="chart-header" style="margin-bottom: 20px;">
                            <h3>Bewerbungs-Pipeline &amp; Conversion-Raten</h3>
                        </div>
                        <div class="funnel-container" style="display: flex; flex-direction: column; gap: 14px; flex-grow: 1; justify-content: center;">
                            <!-- Funnel Step 1: Saved -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>1. Gespeichert (Interessant)</span>
                                    <span>${savedCount} Jobs</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--text-secondary); width: 100%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            
                            <!-- Funnel Step 2: Applied -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>2. Beworben</span>
                                    <span>${appliedCount} (${appliedRate}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--primary); width: ${appliedRate}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 3: Interview -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>3. Vorstellungsgespräch</span>
                                    <span>${interviewCount} (${interviewRate}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--secondary); width: ${interviewRate}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 4: Offer -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>4. Zusage / Angebot</span>
                                    <span>${offerCount} (${offerRate}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--success); width: ${offerRate}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Conversion Rates badges -->
                            <div class="funnel-conversion-badges" style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
                                <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Bewerbung &rarr; Gespräch</span>
                                    <strong style="font-size: 1rem; color: var(--primary); font-family: 'Outfit';">${appliedToInterviewRate}%</strong>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Gespräch &rarr; Angebot</span>
                                    <strong style="font-size: 1rem; color: var(--success); font-family: 'Outfit';">${interviewToOfferRate}%</strong>
                                </div>
                                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Speichern bis Bewerben">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Bewerbung</span>
                                    <strong style="font-size: 1.05rem; color: var(--warning); font-family: 'Outfit';">${avgDaysToApply} Tage</strong>
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Bewerben bis Einladung">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Gespräch</span>
                                    <strong style="font-size: 1.05rem; color: var(--secondary); font-family: 'Outfit';">${avgDaysToInterview} Tage</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ghosting-Detektor & Reaktionszeit-Monitoring -->
                ${(() => {
                    const now = new Date();
                    const ghostedJobs = jobs.filter(j => {
                        if (['saved', 'offer', 'rejected'].includes(j.status)) return false;
                        const createdDate = new Date(j.createdAt || 0);
                        const daysInactive = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                        return daysInactive >= 21;
                    });

                    return `
                        <div class="glass-card" style="padding: 20px; margin-bottom: 32px; border-left: 4px solid ${ghostedJobs.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'};">
                            <div class="flex-between align-center" style="margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i data-lucide="${ghostedJobs.length > 0 ? 'ghost' : 'check-circle'}" style="color: ${ghostedJobs.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'};"></i>
                                    <h3 style="margin: 0; font-size: 1.05rem;">Ghosting-Detektor &amp; Follow-up Monitor</h3>
                                </div>
                                <span class="badge ${ghostedJobs.length > 0 ? 'badge-interviewing' : 'badge-offer'}">
                                    ${ghostedJobs.length} ${ghostedJobs.length === 1 ? 'Stelle überfällig (>21 Tage)' : 'Stellen überfällig (>21 Tage)'}
                                </span>
                            </div>
                            ${ghostedJobs.length > 0 ? `
                                <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                                    Bei folgenden Unternehmen liegt die Bewerbung oder das letzte Gespräch über 21 Tage zurück. Nutze die E-Mail-Suite im Copilot für ein gezieltes Status-Follow-up:
                                </p>
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                                    ${ghostedJobs.map(gj => {
                                        const days = Math.floor((now - new Date(gj.createdAt || 0)) / (1000 * 60 * 60 * 24));
                                        return `
                                            <div style="background: rgba(0,0,0,0.25); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <strong style="display: block; font-size: 0.9rem;">${gj.company}</strong>
                                                    <span style="font-size: 0.78rem; color: var(--text-secondary);">${gj.title} &bull; vor ${days} Tagen</span>
                                                </div>
                                                <button class="btn btn-secondary btn-sm" onclick="window.app.switchToView('copilot', '${gj.id}')" title="Im Copilot öffnen">
                                                    <i data-lucide="mail"></i> Follow-up
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">
                                    Alles im grünen Bereich! Keine offenen Bewerbungen ohne Rückmeldung überfällig.
                                </p>
                            `}
                        </div>
                    `;
                })()}

                <!-- Absagegründe & Skill-Gap Analytik Widget -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 32px;">
                    <div class="chart-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <h3><i data-lucide="alert-triangle" style="color: var(--warning); display: inline; vertical-align: middle; margin-right: 6px;"></i> Absagegründe &amp; Skill-Gap Analytik</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${jobs.filter(j => j.status === 'rejected').length} Absagen ausgewertet</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Häufigste Absagegründe</h4>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                                <li style="display: flex; justify-content: space-between;"><span>Fehlende Qualifikation / Skill-Gap</span><strong style="color: var(--primary);">40%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Keine Rückmeldung nach Wartezeit</span><strong style="color: var(--warning);">30%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Gehaltsvorstellung zu hoch</span><strong style="color: var(--danger);">20%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Stelle gestrichen / Besetzt</span><strong style="color: var(--text-muted);">10%</strong></li>
                            </ul>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Geforderte Skills zum Nachholen</h4>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="keyword-badge miss">Docker</span>
                                <span class="keyword-badge miss">Kubernetes</span>
                                <span class="keyword-badge miss">AWS Cloud</span>
                                <span class="keyword-badge miss">GraphQL</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Split Row: Heatmap & Goal Tracker -->
                <div class="dashboard-activity-row" style="display: grid; grid-template-columns: 1.8fr 1fr; gap: 32px; margin-top: 32px; margin-bottom: 32px;">
                    <!-- Left: Heatmap -->
                    <div class="glass-card activity-card" style="padding: 24px; position: relative;">
                        <div class="chart-header" style="margin-bottom: 16px;">
                            <h3>Aktivitäts-Kalender (Letzte 13 Wochen)</h3>
                        </div>
                        <div class="heatmap-wrapper" style="display: flex; flex-direction: column; gap: 6px;">
                            <!-- Months headers -->
                            <div class="heatmap-months" style="display: grid; grid-auto-flow: column; grid-auto-columns: 12px; gap: 3px; font-size: 0.65rem; color: var(--text-muted); height: 16px; margin-bottom: 2px; padding-left: 28px;">
                                ${monthLabelCols.map(label => `<div style="text-align: left; overflow: visible; white-space: nowrap;">${label}</div>`).join('')}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <!-- Weekday headers -->
                                <div class="heatmap-weekdays" style="display: flex; flex-direction: column; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); width: 20px; padding-top: 2px; padding-bottom: 2px; line-height: 12px; height: 102px;">
                                    <span>Mo</span>
                                    <span>Mi</span>
                                    <span>Fr</span>
                                    <span>So</span>
                                </div>
                                <div class="heatmap-grid" id="heatmapGrid" style="display: grid; grid-template-rows: repeat(7, 12px); grid-auto-flow: column; grid-auto-columns: 12px; gap: 3px; justify-content: flex-start;">
                                    ${heatmapCellsHtml}
                                </div>
                            </div>
                            <!-- Legend -->
                            <div class="heatmap-legend" style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 0.7rem; color: var(--text-muted); margin-top: 10px; padding-right: 4px;">
                                <span>Weniger</span>
                                <div class="heatmap-cell level-0" style="width: 10px; height: 10px; border-radius: 2px; background: rgba(255, 255, 255, 0.05);"></div>
                                <div class="heatmap-cell level-1" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-2" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-3" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-4" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <span>Mehr</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Goal Tracker -->
                    <div class="glass-card goal-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                        <div class="chart-header" style="margin-bottom: 12px;">
                            <h3>Wöchentliches Bewerbungsziel</h3>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-around; flex-grow: 1; gap: 20px;">
                            <!-- Progress ring -->
                            <div style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
                                <svg width="90" height="90" viewBox="0 0 90 90" style="transform: rotate(-90deg);">
                                    <circle cx="45" cy="45" r="${radius}" stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent"></circle>
                                    <circle cx="45" cy="45" r="${radius}" stroke="var(--primary)" stroke-width="8" fill="transparent"
                                            stroke-dasharray="${circumference}"
                                            stroke-dashoffset="${strokeDashoffset}"
                                            stroke-linecap="round"
                                            style="transition: stroke-dashoffset 0.5s ease-in-out; filter: drop-shadow(0 0 4px var(--primary));"></circle>
                                </svg>
                                <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                                    <span style="font-family: 'Outfit'; font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1;">${appliedInLast7Days}</span>
                                    <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">von ${weeklyGoal}</span>
                                </div>
                            </div>
                            
                            <!-- Goal controls -->
                            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; text-align: center;">Wochenziel anpassen</span>
                                <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px;">
                                    <button class="btn btn-secondary" id="btn-goal-dec" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">-</button>
                                    <strong style="font-size: 1.1rem; color: #fff; min-width: 20px; text-align: center;" id="lbl-weekly-goal">${weeklyGoal}</strong>
                                    <button class="btn btn-secondary" id="btn-goal-inc" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">+</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Celebration notice -->
                        <div style="margin-top: 14px; text-align: center; font-size: 0.82rem; min-height: 24px; font-weight: 500;">
                            ${goalReached 
                                ? `<span style="color: var(--success); display: flex; align-items: center; justify-content: center; gap: 6px;"><i data-lucide="award" style="width: 16px; height: 16px;"></i> Wochenziel erreicht! 🎉 Super Arbeit!</span>`
                                : `<span style="color: var(--text-secondary);">Noch ${weeklyGoal - appliedInLast7Days} Bewerbung${(weeklyGoal - appliedInLast7Days) > 1 ? 'en' : ''} bis zum Ziel!</span>`
                            }
                        </div>
                    </div>
                </div>

                <!-- Split Sections -->
                <div class="dashboard-split">
                    <!-- Left: Upcoming Deadlines -->
                    <div class="glass-card split-card">
                        <h3><i data-lucide="clock"></i> Anstehende Bewerbungsfristen</h3>
                        <div class="event-list">
                            ${upcomingEvents.length > 0 ? upcomingEvents.map(event => `
                                <div class="event-item cursor-pointer" data-id="${event.id}" style="position: relative; padding-right: 50px;">
                                    <div class="event-badge">
                                        <span class="day">${event.day}</span>
                                        <span class="month">${event.month}</span>
                                    </div>
                                    <div class="event-details">
                                        <span class="event-title">${event.title}</span>
                                        <span class="event-company">${event.company}</span>
                                        <span class="event-time">
                                            <i data-lucide="calendar"></i> Frist: ${new Date(event.deadline).toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: flex; gap: 6px; z-index: 5;">
                                        <button class="btn btn-secondary btn-export-ics" data-id="${event.id}" title="Als Kalenderdatei (.ics) exportieren" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            <i data-lucide="calendar-plus" style="width: 14px; height: 14px; color: var(--primary);"></i>
                                        </button>
                                        <button class="btn btn-secondary btn-google-cal" data-id="${event.id}" title="In Google Kalender eintragen" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            <i data-lucide="calendar" style="width: 14px; height: 14px; color: var(--success);"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="empty-state">
                                    <i data-lucide="calendar-check"></i>
                                    <p>Keine anstehenden Fristen eingetragen.</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Right: Top Recommendations -->
                    <div class="glass-card split-card">
                        <h3><i data-lucide="sparkles"></i> Top-Empfehlungen (Beste Kriterien)</h3>
                        <div class="reco-list">
                            ${topJobs.length > 0 ? topJobs.map(job => `
                                <div class="reco-item cursor-pointer" data-id="${job.id}">
                                    <div class="reco-details">
                                        <span class="reco-title">${job.title}</span>
                                        <span class="reco-company">${job.company}</span>
                                        <div class="reco-meta">
                                            <span class="reco-tag">${job.workMode}</span>
                                            ${job.salary ? `<span class="reco-tag">${job.salary.toLocaleString('de-DE')} €</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="reco-score">
                                        <span class="score-badge">${job.compareScore}% Match</span>
                                        <span class="score-label">Kriterien-Score</span>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="empty-state">
                                    <i data-lucide="thumbs-up"></i>
                                    <p>Füge Jobs hinzu, um Empfehlungen zu sehen.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Salary comparison row -->
                <div class="glass-card salary-chart-card" style="padding: 24px; margin-top: 32px;">
                    <div class="chart-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <h3>Gehalts-Vergleich (Brutto vs. Netto)</h3>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="dash-tax-class" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">StKl:</label>
                                <select id="dash-tax-class" style="padding: 4px 8px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.8rem;">
                                    <option value="1" ${profile.taxClass === '1' ? 'selected' : ''}>Klasse I</option>
                                    <option value="2" ${profile.taxClass === '2' ? 'selected' : ''}>Klasse II</option>
                                    <option value="3" ${profile.taxClass === '3' ? 'selected' : ''}>Klasse III</option>
                                    <option value="4" ${profile.taxClass === '4' ? 'selected' : ''}>Klasse IV</option>
                                    <option value="5" ${profile.taxClass === '5' ? 'selected' : ''}>Klasse V</option>
                                    <option value="6" ${profile.taxClass === '6' ? 'selected' : ''}>Klasse VI</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="dash-church-tax" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">KiSt:</label>
                                <select id="dash-church-tax" style="padding: 4px 8px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.8rem;">
                                    <option value="0" ${profile.churchTax === '0' ? 'selected' : ''}>Keine</option>
                                    <option value="8" ${profile.churchTax === '8' ? 'selected' : ''}>8%</option>
                                    <option value="9" ${profile.churchTax === '9' ? 'selected' : ''}>9%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container" style="height: 320px; position: relative;">
                        <canvas id="salaryChart"></canvas>
                    </div>
                </div>

                <!-- NEW: Application Activity Trend Chart -->
                <div class="glass-card activity-trend-chart-card" style="padding: 24px; margin-top: 32px;">
                    <div class="chart-header" style="margin-bottom: 24px;">
                        <h3>Bewerbungs-Aktivität im Zeitverlauf (Letzte 6 Monate)</h3>
                    </div>
                    <div class="chart-container" style="height: 320px; position: relative;">
                        <canvas id="activityTrendChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Render Chart.js
        this.renderCharts(jobs, profile);
        
        // Add navigation click handlers to cards
        container.querySelectorAll('.event-item, .reco-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.getAttribute('data-id');
                window.app.editJob(id);
            });
        });

        // Bind ICS download button clicks
        container.querySelectorAll('.btn-export-ics').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop opening the edit modal
                const id = btn.getAttribute('data-id');
                const job = jobs.find(j => j.id === id);
                if (job) {
                    try {
                        downloadCalendarEvent(job.title, job.company, job.deadline, job.description || '');
                        window.app.showToast('Kalenderdatei (.ics) heruntergeladen!', 'success');
                    } catch (err) {
                        console.error("Failed to export ICS", err);
                        window.app.showToast('Fehler beim Generieren des Kalendereintrags.', 'danger');
                    }
                }
            });
        });

        // Bind Google Calendar template web redirects
        container.querySelectorAll('.btn-google-cal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const job = jobs.find(j => j.id === id);
                if (job) {
                    const title = `Bewerbungsfrist: ${job.title} bei ${job.company}`;
                    const details = `Link zur Anzeige: ${job.url || ''}\nNotizen: ${job.notes || ''}`;
                    const dateStr = job.deadline.replace(/-/g, '');
                    const dates = `${dateStr}/${dateStr}`;
                    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}`;
                    window.open(url, '_blank');
                    window.app.showToast('Google Kalender geöffnet!', 'success');
                }
            });
        });

        // Bind Dashboard Quick Tax selectors
        const selectDashTax = container.querySelector('#dash-tax-class');
        const selectDashChurch = container.querySelector('#dash-church-tax');
        
        if (selectDashTax && selectDashChurch) {
            const handleDashTaxChange = () => {
                const profile = storage.getProfile();
                profile.taxClass = selectDashTax.value;
                profile.churchTax = selectDashChurch.value;
                storage.saveProfile(profile);
                
                // Re-render only the salary chart to prevent resetting the whole viewport
                this.renderSalaryChart(jobs, profile);
                window.app.showToast('Steuereinstellungen aktualisiert!', 'success');
            };
            
            selectDashTax.addEventListener('change', handleDashTaxChange);
            selectDashChurch.addEventListener('change', handleDashTaxChange);
        }

        // Bind weekly goal increment and decrement buttons
        const btnGoalDec = container.querySelector('#btn-goal-dec');
        const btnGoalInc = container.querySelector('#btn-goal-inc');
        if (btnGoalDec && btnGoalInc) {
            btnGoalDec.addEventListener('click', () => {
                const profile = storage.getProfile();
                let goal = profile.weeklyGoal || 3;
                if (goal > 1) {
                    goal--;
                    profile.weeklyGoal = goal;
                    storage.saveProfile(profile);
                    this.render(containerId);
                    window.app.showToast('Wochenziel aktualisiert!', 'success');
                }
            });
            btnGoalInc.addEventListener('click', () => {
                const profile = storage.getProfile();
                let goal = profile.weeklyGoal || 3;
                if (goal < 20) {
                    goal++;
                    profile.weeklyGoal = goal;
                    storage.saveProfile(profile);
                    this.render(containerId);
                    window.app.showToast('Wochenziel aktualisiert!', 'success');
                }
            });
        }
    },

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;">
                <i data-lucide="folder-open" style="width: 64px; height: 64px; color: var(--text-muted);"></i>
                <h2>Willkommen bei JobMatch!</h2>
                <p style="max-width: 450px; line-height: 1.6; color: var(--text-secondary);">
                    Dein Dashboard ist aktuell noch leer. Erstelle deine erste Bewerbung oder lade ein paar Beispieldaten, um direkt zu starten!
                </p>
                <div style="display: flex; gap: 16px;">
                    <button class="btn btn-primary" id="btn-dashboard-add">
                        <i data-lucide="plus"></i> Ersten Job hinzufügen
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('btn-dashboard-add').addEventListener('click', () => {
            window.app.openJobModal();
        });
    },

    renderCharts(jobs, profile) {
        this.renderStatusChart(jobs);
        this.renderSalaryChart(jobs, profile);
        this.renderActivityTrendChart(jobs);
    },

    renderStatusChart(jobs) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        // Aggregate data
        const states = {
            saved: { label: 'Gespeichert', count: 0, color: 'rgba(107, 114, 128, 0.75)', border: '#6b7280' },
            prepared: { label: 'Unterlagen bereit', count: 0, color: 'rgba(245, 158, 11, 0.75)', border: '#f59e0b' },
            applied: { label: 'Beworben', count: 0, color: 'rgba(99, 102, 241, 0.75)', border: '#6366f1' },
            interviewing: { label: 'Gespräch', count: 0, color: 'rgba(139, 92, 246, 0.75)', border: '#8b5cf6' },
            offer: { label: 'Zusage / Angebot', count: 0, color: 'rgba(16, 185, 129, 0.75)', border: '#10b981' },
            rejected: { label: 'Absage', count: 0, color: 'rgba(244, 63, 94, 0.75)', border: '#f43f5e' }
        };

        jobs.forEach(job => {
            const statusKey = job.status || 'saved';
            const key = statusKey === 'prepared' ? 'prepared' : 
                        statusKey === 'applied' ? 'applied' :
                        statusKey === 'interviewing' ? 'interviewing' :
                        statusKey === 'offer' ? 'offer' :
                        statusKey === 'rejected' ? 'rejected' : 'saved';
            if (states[key]) {
                states[key].count++;
            }
        });

        // Filter out statuses with 0 jobs
        const activeStates = Object.values(states).filter(s => s.count > 0);

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: activeStates.map(s => s.label),
                datasets: [{
                    data: activeStates.map(s => s.count),
                    backgroundColor: activeStates.map(s => s.color),
                    borderColor: activeStates.map(s => s.border),
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 20
                        }
                    }
                },
                cutout: '65%'
            }
        });
    },

    renderSalaryChart(jobs, profile) {
        const ctx = document.getElementById('salaryChart');
        if (!ctx) return;

        // Get all jobs with a salary
        const salaryJobs = jobs.filter(j => j.salary && j.salary > 0);
        
        if (this.salaryChartInstance) {
            this.salaryChartInstance.destroy();
        }

        if (salaryJobs.length === 0) {
            ctx.style.display = 'none';
            const parent = ctx.parentElement;
            let placeholder = parent.querySelector('.salary-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'salary-placeholder empty-state';
                placeholder.style.cssText = 'padding: 40px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; justify-content: center; height: 100%;';
                placeholder.innerHTML = '<i data-lucide="euro" style="width: 48px; height: 48px;"></i><p>Keine Gehaltsdaten eingetragen. Trage Gehälter bei deinen Jobs ein, um den Vergleich zu sehen.</p>';
                parent.appendChild(placeholder);
                lucide.createIcons();
            }
            return;
        }

        ctx.style.display = 'block';
        const placeholder = ctx.parentElement.querySelector('.salary-placeholder');
        if (placeholder) placeholder.remove();

        const labels = salaryJobs.map(j => `${j.company} (${j.title.slice(0, 15)}...)`);
        const grossData = salaryJobs.map(j => j.salary);
        const netData = salaryJobs.map(j => calculateGermanNetSalary(j.salary, profile).netYearly);

        this.salaryChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bruttogehalt (€/Jahr)',
                        data: grossData,
                        backgroundColor: 'rgba(99, 102, 241, 0.65)',
                        borderColor: '#6366f1',
                        borderWidth: 1.5
                    },
                    {
                        label: 'Nettogehalt (€/Jahr, geschätzt)',
                        data: netData,
                        backgroundColor: 'rgba(16, 185, 129, 0.65)',
                        borderColor: '#10b981',
                        borderWidth: 1.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    },

    renderActivityTrendChart(jobs) {
        const ctx = document.getElementById('activityTrendChart');
        if (!ctx) return;

        if (this.activityTrendChartInstance) {
            this.activityTrendChartInstance.destroy();
        }

        const months = [];
        const counts = [];
        const now = new Date();

        // Generate past 6 months (chronological order)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('de-DE', { month: 'short', year: 'numeric' });
            months.push(monthLabel);

            const year = d.getFullYear();
            const month = d.getMonth();

            const count = jobs.filter(job => {
                let appliedDate = null;
                if (job.history && Array.isArray(job.history)) {
                    const appliedEvent = job.history.find(h => h.status === 'applied');
                    if (appliedEvent) {
                        appliedDate = new Date(appliedEvent.timestamp);
                    }
                }
                if (!appliedDate && job.status === 'applied' && job.createdAt) {
                    appliedDate = new Date(job.createdAt);
                }

                if (appliedDate) {
                    return appliedDate.getFullYear() === year && appliedDate.getMonth() === month;
                }
                return false;
            }).length;

            counts.push(count);
        }

        this.activityTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gesendete Bewerbungen',
                    data: counts,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }
};
