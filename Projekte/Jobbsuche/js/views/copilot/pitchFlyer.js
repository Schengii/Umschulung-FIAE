/**
 * Candidate Pitch Flyer Submodule
 * Generates a modern 1-page visual candidate snapshot card / mini pitch-deck for portfolio or networking.
 */
import { storage } from '../../storage.js';

export const pitchFlyer = {
    render(container, job, profile) {
        const topSkills = (profile.skills || []).slice(0, 6);
        const name = profile.name || 'Alex Neumann';
        const title = profile.title || 'Frontend Developer & UI Specialist';

        container.innerHTML = `
            <div class="pitch-flyer-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="presentation"></i> 1-Page Bewerber-Flyer &amp; Pitch-Deck</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Kompakter visueller Steckbrief ("Candidate Snapshot") zum Teilen auf LinkedIn oder als Kurzvorstellung.
                        </p>
                    </div>
                    <button class="btn btn-primary" id="btn-print-flyer">
                        <i data-lucide="printer"></i> Flyer drucken / Als PDF exportieren
                    </button>
                </div>

                <!-- Printable Flyer Canvas -->
                <div id="flyer-card-canvas" class="glass-card" style="padding: 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); max-width: 800px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                    
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--color-primary); padding-bottom: 20px; margin-bottom: 24px;">
                        <div>
                            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 1px;">Kandidaten-Steckbrief</span>
                            <h1 style="font-size: 1.8rem; margin: 4px 0; color: #ffffff; font-weight: 800;">${name}</h1>
                            <div style="font-size: 1.1rem; color: #38bdf8; font-weight: 600;">${title}</div>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
                            <div>📍 München / Deutschland</div>
                            <div>🚀 Sofort / 1 Monat Kündigungsfrist</div>
                            <div>💼 Vollzeit / Hybrid / Remote</div>
                        </div>
                    </div>

                    <!-- 3-Column Highlights Grid -->
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <!-- Left: Value Proposition & Impact -->
                        <div>
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Mein Mehrwert &amp; Profil
                            </h4>
                            <p style="font-size: 0.88rem; line-height: 1.5; color: #cbd5e1; margin: 0 0 14px 0;">
                                ${profile.cvStructured?.summary || profile.experience || 'Erfahrener Entwickler mit Fokus auf performante Webapplikationen, agile Workflows und moderne Frameworks. Begeisterung für saubere Software-Architekturen und Nutzerorientierung.'}
                            </p>
                            
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Top-Meilensteine &amp; Erfolge
                            </h4>
                            <ul style="margin: 0; padding-left: 18px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                                <li>Entwicklung skalierbarer Benutzeroberflächen mit über 50.000 monatlichen Nutzern</li>
                                <li>Optimierung der Ladezeiten (Core Web Vitals) um über 35%</li>
                                <li>Erfolgreiche Einführung von TypeScript &amp; Component Testing</li>
                            </ul>
                        </div>

                        <!-- Right: Core Skills & Target Role -->
                        <div>
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Kernkompetenzen
                            </h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
                                ${topSkills.map(s => `<span style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${s}</span>`).join('')}
                            </div>

                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Rahmendaten &amp; Zielrolle
                            </h4>
                            <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
                                <div>🎯 <strong>Rolle:</strong> ${job ? job.title : 'Senior / Lead Developer'}</div>
                                <div>💶 <strong>Gehaltsziel:</strong> ~${(job?.salary || 75000).toLocaleString('de-DE')} € brutto/Jahr</div>
                                <div>💬 <strong>Sprachen:</strong> Deutsch (Muttersprache), Englisch (Fließend)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer / Contact CTA -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
                        <span style="font-size: 0.8rem; color: #94a3b8;">Erstellt mit JobMatch Companion</span>
                        <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600;">
                            ✉️ Kontakt: alex.neumann@example.com &bull; 🌐 LinkedIn: linkedin.com/in/alexneumann
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        container.querySelector('#btn-print-flyer')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Pop-Ups erlauben, um den Flyer zu drucken.');
                return;
            }

            const canvasHtml = container.querySelector('#flyer-card-canvas').innerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Bewerber-Flyer - ${profile.name || 'Kandidat'}</title>
                    <style>
                        @page { size: A4 landscape; margin: 10mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    </style>
                </head>
                <body>
                    <div style="max-width: 900px; margin: 0 auto; background: #0f172a; padding: 20px; border-radius: 12px;">
                        ${canvasHtml}
                    </div>
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
