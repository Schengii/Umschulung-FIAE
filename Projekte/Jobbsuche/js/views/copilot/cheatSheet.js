/**
 * Interview Cheat Sheet Submodule (1-Pager)
 * Generates a concise, print-ready 1-pager summary for interview preparation.
 */
import { mockAi } from '../../mockAi.js';

export const cheatSheet = {
    render(container, job, profile) {
        const questions = mockAi.generateInterviewQuestions(job.title, profile.skills);

        container.innerHTML = `
            <div class="cheat-sheet-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="file-spreadsheet"></i> 1-Pager Interview Spickzettel</h3>
                    <button class="btn btn-secondary btn-sm" id="btn-print-cheatsheet">
                        <i data-lucide="printer"></i> Spickzettel drucken / PDF
                    </button>
                </div>

                <div class="printable-cheatsheet glass-card" style="padding: 24px; background: var(--bg-surface-elevated);">
                    <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 1.4rem;">Spickzettel: ${job.title}</h2>
                        <p class="text-secondary" style="margin: 4px 0 0 0;">Firma: <strong>${job.company}</strong> | Standort: ${job.location || 'N/A'}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="star"></i> Meine Top 3 Argumente</h4>
                            <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                                <li>Fundierte Kenntnisse in: ${profile.skills.slice(0, 4).join(', ')}</li>
                                <li>Praxiserfahrung im Erstellen moderner Web-Applikationen</li>
                                <li>Hohe Lernbereitschaft und schnelle Einarbeitung in neue Stacks</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="help-circle"></i> Fragen an den Arbeitgeber</h4>
                            <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                                <li>Wie sieht ein typischer Sprint / Arbeitstag im Team aus?</li>
                                <li>Welche Weiterbildungsmöglichkeiten werden gefördert?</li>
                                <li>Was sind die größten technischen Herausforderungen im nächsten Halbjahr?</li>
                            </ul>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="target"></i> Antizipierte Interview-Fragen</h4>
                        <ol style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                            ${questions.slice(0, 3).map(q => `<li>${q}</li>`).join('')}
                        </ol>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        container.querySelector('#btn-print-cheatsheet')?.addEventListener('click', () => {
            window.print();
        });
    }
};
