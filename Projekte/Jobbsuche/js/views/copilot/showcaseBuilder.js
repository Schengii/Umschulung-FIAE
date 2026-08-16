/**
 * Portfolio & Project Showcase Builder Submodule
 * Allows candidates to structure technical case studies, metrics and project highlights with PDF export.
 */
import { storage } from '../../storage.js';

export const showcaseBuilder = {
    projects: [
        {
            title: 'High-Performance E-Commerce Storefront',
            tech: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL'],
            role: 'Lead Frontend Developer',
            problem: 'Lange Ladezeiten (LCP > 4.2s) und hohe Absprungraten im Checkout-Prozess.',
            solution: 'Migration auf Server-Side Rendering (SSR), Bild-Optimierung und modulares State Management.',
            impact: 'Ladezeiten um 45% reduziert, Conversion-Rate um +18% gesteigert, Core Web Vitals im grünen Bereich.'
        },
        {
            title: 'Design System & Component Library',
            tech: ['Figma', 'Storybook', 'Web Components', 'CSS Grid', 'Jest'],
            role: 'UI/UX Engineer',
            problem: 'Inkonsistente UI-Elemente und doppelte Entwicklungsaufwände über 4 Plattformen hinweg.',
            solution: 'Aufbau einer zentralen barrierefreien Komponentenbibliothek mit automatisierter CI/CD-Pipeline.',
            impact: 'Entwicklungszeit für neue Features um 30% verkürzt, 100% WCAG 2.1 AA Barrierefreiheit erreicht.'
        }
    ],

    render(container, job, profile) {
        container.innerHTML = `
            <div class="showcase-builder-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="folder-git-2"></i> Projekt-Showcase &amp; Portfolio-Case-Studies</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Dokumentiere deine stärksten Praxisprojekte mit Vorher-Nachher-Metriken für Tech-Interviews.
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm" id="btn-add-showcase-project">
                            <i data-lucide="plus"></i> Neues Projekt
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-print-showcase">
                            <i data-lucide="printer"></i> Showcase drucken / PDF
                        </button>
                    </div>
                </div>

                <div id="showcase-projects-list" style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px;">
                    ${this.projects.map((p, idx) => `
                        <div class="glass-card" style="padding: 20px; border-left: 4px solid var(--color-primary); background: rgba(0,0,0,0.2);">
                            <div class="flex-between align-center" style="margin-bottom: 12px;">
                                <div>
                                    <h4 style="margin: 0; font-size: 1.1rem; color: #ffffff;">${p.title}</h4>
                                    <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 600;">Rolle: ${p.role}</span>
                                </div>
                                <button class="btn btn-danger btn-sm btn-delete-project" data-idx="${idx}" style="padding: 4px 8px;">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>

                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                                ${p.tech.map(t => `<span class="badge badge-saved" style="font-size: 0.75rem;">${t}</span>`).join('')}
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 14px; font-size: 0.85rem; line-height: 1.5;">
                                <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-warning); display: block; margin-bottom: 4px;">⚡ Problem / Ausgangslage:</strong>
                                    <span style="color: #cbd5e1;">${p.problem}</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-primary); display: block; margin-bottom: 4px;">🛠️ Lösung &amp; Architektur:</strong>
                                    <span style="color: #cbd5e1;">${p.solution}</span>
                                </div>
                                <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-success); display: block; margin-bottom: 4px;">📈 Erreichte Metriken / Impact:</strong>
                                    <span style="color: #ffffff;">${p.impact}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        container.querySelector('#btn-add-showcase-project')?.addEventListener('click', () => {
            const title = prompt('Projekttitel:', 'Neues Kundenprojekt');
            if (!title) return;
            const techStr = prompt('Tech-Stack (kommagetrennt):', 'Vue.js, Node.js, Docker');
            const problem = prompt('Ausgangssituation / Herausforderung:', 'Skalierungsprobleme der API');
            const solution = prompt('Deine technische Lösung:', 'Einführung von Redis-Caching & Microservices');
            const impact = prompt('Messbares Ergebnis / Erfolg:', 'Latenz um 50% gesenkt');

            this.projects.push({
                title: title,
                tech: techStr ? techStr.split(',').map(s => s.trim()) : [],
                role: profile.title || 'Developer',
                problem: problem || 'Keine Angabe',
                solution: solution || 'Keine Angabe',
                impact: impact || 'Keine Angabe'
            });

            this.render(container, job, profile);
        });

        container.querySelectorAll('.btn-delete-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                this.projects.splice(idx, 1);
                this.render(container, job, profile);
            });
        });

        container.querySelector('#btn-print-showcase')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Pop-Ups erlauben.');
                return;
            }

            const projectsHtml = this.projects.map(p => `
                <div style="margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px;">${p.title}</h3>
                            <div style="color: #0284c7; font-weight: 600; font-size: 13px;">${p.role}</div>
                        </div>
                        <div style="font-size: 12px; color: #64748b;">${p.tech.join(' • ')}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
                        <p><strong>Problem:</strong> ${p.problem}</p>
                        <p><strong>Lösung:</strong> ${p.solution}</p>
                        <p style="color: #047857; font-weight: 600;"><strong>Ergebnis:</strong> ${p.impact}</p>
                    </div>
                </div>
            `).join('');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Projekt-Portfolio - ${profile.name || 'Bewerber'}</title>
                    <style>
                        @page { size: A4; margin: 15mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
                    </style>
                </head>
                <body>
                    <h1 style="font-size: 22px; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 20px;">
                        Projekt-Showcase &amp; Technische Case Studies &ndash; ${profile.name || 'Bewerber'}
                    </h1>
                    ${projectsHtml}
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
};
