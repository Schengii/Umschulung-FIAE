import { storage } from '../storage.js';

export const calendarView = {
    currentDate: new Date(),

    render(containerId) {
        const container = document.getElementById(containerId);
        const jobs = storage.getJobs();

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];

        // Collect events (deadlines & interviews)
        const events = [];

        jobs.forEach(job => {
            if (job.deadline && job.status !== 'rejected') {
                events.push({
                    id: job.id,
                    type: 'deadline',
                    dateStr: job.deadline, // YYYY-MM-DD
                    title: `Frist: ${job.company}`,
                    subtitle: job.title,
                    color: 'var(--primary)'
                });
            }
            if (job.interviews && Array.isArray(job.interviews)) {
                job.interviews.forEach(inv => {
                    if (inv.date) {
                        const dateStr = inv.date.slice(0, 10);
                        events.push({
                            id: job.id,
                            type: 'interview',
                            dateStr: dateStr,
                            title: `Interview: ${job.company}`,
                            subtitle: inv.round || 'Gespräch',
                            color: 'var(--secondary)'
                        });
                    }
                });
            }
        });

        // Calendar grid calculations
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // 0 is Sunday, convert to Monday = 0, Sunday = 6
        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6;

        const totalDays = lastDayOfMonth.getDate();

        const daysGrid = [];
        // Empty slots for previous month padding
        for (let i = 0; i < startingDay; i++) {
            daysGrid.push({ isPadding: true });
        }
        // Month days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.dateStr === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            daysGrid.push({
                dayNum: d,
                dateStr: dateStr,
                events: dayEvents,
                isToday: isToday,
                isPadding: false
            });
        }

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Interaktiver Bewerbungs-Kalender</h2>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="btn btn-secondary btn-sm" id="btn-cal-prev"><i data-lucide="chevron-left"></i> Vorheriger</button>
                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); min-width: 160px; text-align: center;">${monthNames[month]} ${year}</span>
                    <button class="btn btn-secondary btn-sm" id="btn-cal-next">Nächster <i data-lucide="chevron-right"></i></button>
                    <button class="btn btn-primary btn-sm" id="btn-cal-today">Heute</button>
                </div>
            </div>

            <div class="glass-card" style="padding: 24px;">
                <!-- Weekday Headers -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center; font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <div>Mo</div>
                    <div>Di</div>
                    <div>Mi</div>
                    <div>Do</div>
                    <div>Fr</div>
                    <div>Sa</div>
                    <div>So</div>
                </div>

                <!-- Calendar Grid -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
                    ${daysGrid.map(cell => {
                        if (cell.isPadding) {
                            return `<div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: var(--radius-sm); min-height: 90px; opacity: 0.3;"></div>`;
                        }

                        return `
                            <div class="cal-day-cell ${cell.isToday ? 'today' : ''}" data-date="${cell.dateStr}" style="background: ${cell.isToday ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.025)'}; border: 1px solid ${cell.isToday ? 'var(--primary)' : 'var(--border-color)'}; border-radius: var(--radius-sm); min-height: 90px; padding: 8px; display: flex; flex-direction: column; gap: 4px; position: relative;">
                                <span style="font-size: 0.85rem; font-weight: ${cell.isToday ? '800' : '600'}; color: ${cell.isToday ? 'var(--primary)' : 'var(--text-primary)'};">${cell.dayNum}</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 70px;">
                                    ${cell.events.map(ev => `
                                        <div class="cal-event-badge" data-job-id="${ev.id}" style="background: rgba(255,255,255,0.05); border-left: 3px solid ${ev.color}; padding: 3px 6px; border-radius: 2px; font-size: 0.7rem; cursor: pointer; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${ev.title}: ${ev.subtitle}">
                                            <strong style="color: var(--text-primary);">${ev.title}</strong>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();
        this.bindEvents(container);
    },

    bindEvents(container) {
        const prevBtn = container.querySelector('#btn-cal-prev');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render('view-calendar');
        });
        const nextBtn = container.querySelector('#btn-cal-next');
        if (nextBtn) nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render('view-calendar');
        });
        const todayBtn = container.querySelector('#btn-cal-today');
        if (todayBtn) todayBtn.addEventListener('click', () => {
            this.currentDate = new Date();
            this.render('view-calendar');
        });

        container.querySelectorAll('.cal-event-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = badge.getAttribute('data-job-id');
                window.app.editJob(jobId);
            });
        });
    }
};
