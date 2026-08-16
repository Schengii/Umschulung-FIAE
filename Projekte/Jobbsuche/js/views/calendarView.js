import { storage } from '../storage.js';
import { downloadAllCalendarEventsBundle, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from '../utils/ics.js';
import { emailParser } from '../utils/emailParser.js';

export const calendarView = {
    currentDate: new Date(),

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

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
                    dateStr: job.deadline,
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

        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6;
        const totalDays = lastDayOfMonth.getDate();

        const daysGrid = [];
        for (let i = 0; i < startingDay; i++) {
            daysGrid.push({ isPadding: true });
        }
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
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Bewerbungs-Kalender</h2>
                    <span class="text-secondary">Übersicht aller Fristen &amp; Interview-Termine</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm" id="btn-export-ics">
                        <i data-lucide="download"></i> .ICS Export
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-sync-google-cal" title="Nächsten Termin in Google Kalender öffnen">
                        <i data-lucide="calendar"></i> Google Kalender
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-sync-outlook-cal" title="Nächsten Termin in Outlook öffnen">
                        <i data-lucide="calendar-plus"></i> Outlook Web
                    </button>
                </div>
            </div>

            <!-- Email Import Dropzone -->
            <div class="glass-card" style="padding: 16px; margin-bottom: 20px;">
                <div class="flex-between align-center">
                    <div>
                        <h4 style="margin: 0; font-size: 0.9rem;"><i data-lucide="mail"></i> Einladungs-E-Mail Auto-Parser</h4>
                        <p class="text-secondary" style="font-size: 0.8rem; margin: 2px 0 0 0;">Füge E-Mail-Text ein, um Termine &amp; Zoom/Teams-Links automatisch im Kalender einzutragen</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="btn-toggle-email-input">
                        <i data-lucide="plus"></i> E-Mail importieren
                    </button>
                </div>

                <div id="email-import-box" style="margin-top: 12px; display: none;">
                    <textarea id="email-raw-input" class="form-input" rows="4" placeholder="Kopiere hier den E-Mail-Text rein (z.B. Einladung zum Vorstellungsgespräch am 15.08.2026 um 14:30 Uhr via Zoom)..."></textarea>
                    <div class="flex-between align-center" style="margin-top: 8px;">
                        <select id="email-job-select" class="form-input" style="width: auto; padding: 4px 8px; font-size: 0.85rem;">
                            <option value="">Job zuordnen...</option>
                            ${jobs.map(j => `<option value="${j.id}">${j.company} - ${j.title}</option>`).join('')}
                        </select>
                        <button class="btn btn-success btn-sm" id="btn-parse-email-submit">
                            <i data-lucide="check"></i> Termin parsen &amp; eintragen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Month navigation -->
            <div class="glass-card flex-between align-center" style="padding: 12px 20px; margin-bottom: 20px;">
                <button class="btn btn-secondary btn-sm" id="btn-prev-month"><i data-lucide="chevron-left"></i> Vorheriger</button>
                <h3 style="margin: 0;">${monthNames[month]} ${year}</h3>
                <button class="btn btn-secondary btn-sm" id="btn-next-month">Nächster <i data-lucide="chevron-right"></i></button>
            </div>

            <!-- Calendar Grid -->
            <div class="glass-card" style="padding: 20px; overflow-x: auto;">
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-width: 700px; text-align: center; font-weight: 700; margin-bottom: 8px;">
                    <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-width: 700px;">
                    ${daysGrid.map(cell => {
                        if (cell.isPadding) {
                            return `<div style="min-height: 80px; background: rgba(255,255,255,0.02); border-radius: 8px;"></div>`;
                        }
                        return `
                            <div style="min-height: 80px; padding: 6px; border: 1px solid ${cell.isToday ? 'var(--color-primary)' : 'var(--border-color)'}; border-radius: 8px; background: ${cell.isToday ? 'rgba(99,102,241,0.08)' : 'transparent'};">
                                <span style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">${cell.dayNum}</span>
                                ${cell.events.map(ev => `
                                    <div style="font-size: 0.7rem; padding: 2px 4px; border-radius: 4px; background: ${ev.color}; color: #fff; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${ev.title}">
                                        ${ev.title}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, jobs);
    },

    bindEvents(container, jobs) {
        container.querySelector('#btn-prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render('view-calendar');
        });

        container.querySelector('#btn-next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render('view-calendar');
        });

        container.querySelector('#btn-export-ics')?.addEventListener('click', () => {
            downloadAllCalendarEventsBundle(jobs);
        });

        container.querySelector('#btn-sync-google-cal')?.addEventListener('click', () => {
            const nextJobWithDeadline = jobs.find(j => j.deadline && j.status !== 'rejected');
            if (nextJobWithDeadline) {
                const url = generateGoogleCalendarUrl(nextJobWithDeadline.title, nextJobWithDeadline.company, nextJobWithDeadline.deadline, nextJobWithDeadline.description || '');
                window.open(url, '_blank');
            } else {
                window.app.showToast('Keine anstehende Frist für Google Kalender gefunden.', 'info');
            }
        });

        container.querySelector('#btn-sync-outlook-cal')?.addEventListener('click', () => {
            const nextJobWithDeadline = jobs.find(j => j.deadline && j.status !== 'rejected');
            if (nextJobWithDeadline) {
                const url = generateOutlookCalendarUrl(nextJobWithDeadline.title, nextJobWithDeadline.company, nextJobWithDeadline.deadline, nextJobWithDeadline.description || '');
                window.open(url, '_blank');
            } else {
                window.app.showToast('Keine anstehende Frist für Outlook gefunden.', 'info');
            }
        });

        const toggleEmailBtn = container.querySelector('#btn-toggle-email-input');
        const emailBox = container.querySelector('#email-import-box');
        if (toggleEmailBtn && emailBox) {
            toggleEmailBtn.addEventListener('click', () => {
                emailBox.style.display = emailBox.style.display === 'none' ? 'block' : 'none';
            });
        }

        const parseSubmitBtn = container.querySelector('#btn-parse-email-submit');
        if (parseSubmitBtn) {
            parseSubmitBtn.addEventListener('click', () => {
                const rawText = container.querySelector('#email-raw-input').value;
                const jobId = container.querySelector('#email-job-select').value;

                if (!rawText) return;
                const parsed = emailParser.parseEmail(rawText);

                if (parsed && jobId) {
                    const allJobs = storage.getJobs();
                    const targetJob = allJobs.find(j => j.id === jobId);

                    if (targetJob) {
                        if (!targetJob.interviews) targetJob.interviews = [];
                        targetJob.interviews.push({
                            id: 'inv-' + Date.now(),
                            round: parsed.platform + ' Interview',
                            date: parsed.dateIso + 'T' + parsed.time,
                            location: parsed.videoLink || parsed.platform,
                            notes: `Recruiter: ${parsed.recruiterName}`
                        });
                        targetJob.status = 'interviewing';
                        storage.saveJobs(allJobs);
                        alert(`Termin am ${parsed.dateIso} um ${parsed.time} Uhr erfolgreich eingetragen!`);
                        this.render('view-calendar');
                    }
                } else if (parsed) {
                    alert(`Geparster Termin: ${parsed.dateIso} um ${parsed.time} Uhr (${parsed.platform}). Bitte wähle erst den zugehörigen Job aus.`);
                }
            });
        }
    }
};
