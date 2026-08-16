/**
 * 30-60-90 Days Onboarding & Probation Planner Submodule
 * Provides a structured roadmap, checklist and feedback tracker for the first 3 months in a new job.
 */
import { storage } from '../../storage.js';

export const onboardingPlanner = {
    selectedPhase: 30, // 30 | 60 | 90

    render(container, job, profile) {
        const company = job ? job.company : 'Neues Unternehmen';
        const title = job ? job.title : 'Neue Position';

        container.innerHTML = `
            <div class="onboarding-planner-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="compass"></i> 30-60-90 Tage Onboarding- &amp; Probezeit-Planer</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Dein strategischer Leitfaden für die ersten 3 Monate als "${title}" bei "${company}"
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase === 30 ? 'active' : ''}" id="btn-phase-30">
                            Tag 1 - 30 (Lernen &amp; Setup)
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase === 60 ? 'active' : ''}" id="btn-phase-60">
                            Tag 31 - 60 (Eigenständigkeit)
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase === 90 ? 'active' : ''}" id="btn-phase-90">
                            Tag 61 - 90 (Volle Wirkung)
                        </button>
                    </div>
                </div>

                <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
                    ${this.renderPhaseContent(this.selectedPhase, company, title)}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    renderPhaseContent(phase, company, title) {
        if (phase === 30) {
            return `
                <div style="border-left: 4px solid var(--color-primary); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 1: Orientierung, Einarbeitung &amp; Beziehungsaufbau (Tag 1 - 30)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Systeme verstehen, Teammitglieder kennenlernen und Erwartungshaltungen mit der Führungskraft klären.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-primary);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Arbeitsumgebung &amp; Zugänge (GitHub, Jira, Slack, VPN) einrichten</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 1:1 Kennenlerngespräche mit allen direkten Teammitgliedern führen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Codebase, Architektur &amp; Deployment-Pipelines von ${company} verstehen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Ersten kleinen Pull Request / Bugfix erfolgreich mergen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 30-Tage-Feedbackgespräch mit dem Teamleiter terminieren</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="help-circle"></i> Schlüsselfragen für dein 30-Tage 1:1:</h4>
                        <ul style="padding-left: 16px; margin: 0; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                            <li><em>"Was lief in meinen ersten 4 Wochen besonders gut?"</em></li>
                            <li><em>"Gibt es Bereiche oder Abläufe, bei denen ich mich noch schneller einarbeiten sollte?"</em></li>
                            <li><em>"Welches sind die Top-3 Prioritäten für meine nächsten 30 Tage?"</em></li>
                        </ul>
                    </div>
                </div>
            `;
        } else if (phase === 60) {
            return `
                <div style="border-left: 4px solid var(--color-warning); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 2: Eigenständige Umsetzung &amp; Vertiefung (Tag 31 - 60)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Selbstständige Bearbeitung komplexerer Aufgaben und aktive Mitarbeit in Sprint-Planungen.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-warning);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Eigenverantwortliche Umsetzung eines größeren Features</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Aktive Durchführung von Code-Reviews für Kollegen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Dokumentation von unklaren internen Prozessen im Wiki verbessern</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Erste Vorschläge für Performance- oder UI-Verbesserungen einbringen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 60-Tage Zwischenbilanz mit Vorgesetzten besprechen</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="help-circle"></i> Schlüsselfragen für dein 60-Tage 1:1:</h4>
                        <ul style="padding-left: 16px; margin: 0; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                            <li><em>"Entspricht mein Arbeitsrhythmus und Output Ihren Erwartungen?"</em></li>
                            <li><em>"Wo sehen Sie Möglichkeiten, dass ich noch mehr Verantwortung übernehme?"</em></li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            return `
                <div style="border-left: 4px solid var(--color-success); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 3: Volle Wirkung &amp; Probezeit-Bestehen (Tag 61 - 90)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Eigene Impulse setzen, strategische Themen anstoßen und das offizielle Probezeitgespräch vorbereiten.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-success);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Zusammenstellung einer Erfolgsliste aller gelieferten Features</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Feedback von 2-3 Kollegen einholen (Peer-Feedback)</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Vorschlag für ein Quartalsziel (OKR / KPI) erarbeiten</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Offizielles Probezeit-Abschlussgespräch erfolgreich führen</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="award"></i> Ziel: Erfolgreiches Bestehen der Probezeit</h4>
                        <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0;">
                            Mit einer sauberen Dokumentation deiner Erfolge gehst du selbstbewusst in das finale Gespräch und legst den Grundstein für deine nächste Gehalts- und Entwicklungsstufe bei ${company}!
                        </p>
                    </div>
                </div>
            `;
        }
    },

    bindEvents(container, job, profile) {
        container.querySelector('#btn-phase-30')?.addEventListener('click', () => {
            this.selectedPhase = 30;
            this.render(container, job, profile);
        });

        container.querySelector('#btn-phase-60')?.addEventListener('click', () => {
            this.selectedPhase = 60;
            this.render(container, job, profile);
        });

        container.querySelector('#btn-phase-90')?.addEventListener('click', () => {
            this.selectedPhase = 90;
            this.render(container, job, profile);
        });
    }
};
