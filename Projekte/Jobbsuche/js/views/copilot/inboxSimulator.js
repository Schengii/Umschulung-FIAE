/**
 * Inbox Automation & Email Webhook Simulator Submodule
 * Automatically parses incoming application emails, detects status changes and synchronizes with Kanban.
 */
import { storage } from '../../storage.js';

export const inboxSimulator = {
    sampleEmails: [
        {
            id: 'mail-1',
            sender: 'karriere@innotech-solutions.de',
            company: 'InnoTech Solutions',
            subject: 'Einladung zum Video-Interview: Senior Frontend Developer',
            date: 'Heute, 10:15 Uhr',
            statusSuggestion: 'interviewing',
            body: 'Sehr geehrter Herr Neumann,\n\nvielen Dank für Ihre Bewerbung. Ihr Profil hat uns sehr beeindruckt! Wir möchten Sie gerne zu einem ersten Kennenlerngespräch via Microsoft Teams am 22.08.2026 um 14:00 Uhr einladen.\n\nHerzliche Grüße,\nInnoTech HR-Team'
        },
        {
            id: 'mail-2',
            sender: 'recruiting@global-commerce.de',
            company: 'Global Commerce GmbH',
            subject: 'Eingangsbestätigung Ihrer Bewerbung',
            date: 'Gestern, 16:40 Uhr',
            statusSuggestion: 'applied',
            body: 'Hallo Alex,\n\ndeine Unterlagen sind erfolgreich bei uns eingegangen. Wir prüfen deine Bewerbung sorgfältig und melden uns innerhalb von zwei Wochen wieder bei dir.\n\nViele Grüße,\nGlobal Commerce Recruiting'
        },
        {
            id: 'mail-3',
            sender: 'jobs@designkraft.de',
            company: 'DesignKraft Agency',
            subject: 'Status Ihrer Bewerbung',
            date: 'Vor 3 Tagen',
            statusSuggestion: 'rejected',
            body: 'Sehr geehrter Herr Neumann,\n\nwir bedanken uns für das Interesse an unserem Unternehmen. Leider müssen wir Ihnen mitteilen, dass wir uns für einen anderen Kandidaten entschieden haben, dessen Profil noch etwas spezifischer passt.\n\nWir wünschen Ihnen für die Zukunft alles Gute.\nDesignKraft Team'
        }
    ],

    render(container, job, profile) {
        container.innerHTML = `
            <div class="inbox-simulator-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="inbox"></i> E-Mail-Inbox &amp; Auto-Status-Synchronisation</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Erkennt automatisch Einladungen, Eingangsbestätigungen &amp; Absagen und synchronisiert den Status im Kanban-Board.
                        </p>
                    </div>
                </div>

                <div class="glass-card" style="padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 0.95rem;"><i data-lucide="mail"></i> Erkannte Posteingangs-Nachrichten:</h4>

                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        ${this.sampleEmails.map(mail => `
                            <div class="glass-card" style="padding: 16px; border-left: 4px solid ${this.getStatusColor(mail.statusSuggestion)}; background: rgba(0,0,0,0.2);">
                                <div class="flex-between align-center" style="margin-bottom: 8px;">
                                    <div>
                                        <strong style="font-size: 0.95rem; color: #ffffff;">${mail.subject}</strong>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                                            Von: ${mail.sender} &bull; ${mail.date}
                                        </div>
                                    </div>
                                    <div class="flex-row gap-8 align-center">
                                        <span class="badge ${this.getStatusBadgeClass(mail.statusSuggestion)}" style="font-size: 0.75rem;">
                                            Erkannt: ${this.getStatusLabel(mail.statusSuggestion)}
                                        </span>
                                        <button class="btn btn-primary btn-sm btn-sync-mail-status" data-company="${mail.company}" data-status="${mail.statusSuggestion}">
                                            <i data-lucide="refresh-cw"></i> Status übernehmen
                                        </button>
                                    </div>
                                </div>
                                <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; white-space: pre-wrap;">${mail.body}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    getStatusColor(status) {
        if (status === 'interviewing') return 'var(--color-primary)';
        if (status === 'applied') return 'var(--color-warning)';
        if (status === 'rejected') return 'var(--color-danger)';
        return 'var(--text-muted)';
    },

    getStatusBadgeClass(status) {
        if (status === 'interviewing') return 'badge-primary';
        if (status === 'applied') return 'badge-interviewing';
        if (status === 'rejected') return 'badge-danger';
        return 'badge-saved';
    },

    getStatusLabel(status) {
        if (status === 'interviewing') return 'Einladung zum Gespräch';
        if (status === 'applied') return 'Eingangsbestätigung (Beworben)';
        if (status === 'rejected') return 'Absage';
        return status;
    },

    bindEvents(container, job, profile) {
        container.querySelectorAll('.btn-sync-mail-status').forEach(btn => {
            btn.addEventListener('click', () => {
                const company = btn.getAttribute('data-company');
                const newStatus = btn.getAttribute('data-status');

                const jobs = storage.getJobs();
                const targetJob = jobs.find(j => j.company.toLowerCase().includes(company.toLowerCase()));

                if (targetJob) {
                    targetJob.status = newStatus;
                    if (!targetJob.history) targetJob.history = [];
                    targetJob.history.push({ status: newStatus, timestamp: new Date().toISOString() });
                    storage.updateJob(targetJob);

                    btn.innerHTML = `<i data-lucide="check"></i> Status aktualisiert!`;
                    btn.disabled = true;
                    if (window.lucide) lucide.createIcons();
                    if (window.app && window.app.showToast) {
                        window.app.showToast(`Status für "${targetJob.company}" auf "${this.getStatusLabel(newStatus)}" gesetzt!`, 'success');
                    }
                } else {
                    if (window.app && window.app.showToast) {
                        window.app.showToast(`Kein aktiver Job für "${company}" gefunden.`, 'warning');
                    }
                }
            });
        });
    }
};
