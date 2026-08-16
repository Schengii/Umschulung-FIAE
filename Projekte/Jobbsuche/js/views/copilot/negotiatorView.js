/**
 * Salary Negotiator & Total Package Calculator Submodule
 * Prepares argumentations for salary negotiations and calculates total compensation benefits package.
 */

export const negotiatorView = {
    render(container, job, profile) {
        const baseSalary = job.salary || 65000;

        container.innerHTML = `
            <div class="negotiator-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="calculator"></i> Gehaltsverhandlungs-Guide &amp; Gesamtpaket-Rechner</h3>
                    <span class="badge badge-offer">Brutto-Ziel: ${(baseSalary).toLocaleString('de-DE')} € / Jahr</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Total Package Calculator -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4><i data-lucide="package"></i> Gesamtpaket-Rechner</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                            Erfasse alle vertraglichen Zusatzleistungen neben dem Grundgehalt:
                        </p>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Grundgehalt (Brutto / Jahr €):</label>
                            <input type="number" id="pkg-base-salary" class="form-input" value="${baseSalary}">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Bonus / Variable Vergütung (€):</label>
                            <input type="number" id="pkg-bonus" class="form-input" value="5000">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Remote / Homeoffice-Pauschale (€ / Jahr):</label>
                            <input type="number" id="pkg-remote-allowance" class="form-input" value="1200">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">ÖPNV / Jobticket / Firmenwagen-Vorteil (€ / Jahr):</label>
                            <input type="number" id="pkg-transit" class="form-input" value="600">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Weiterbildungsbudget (€ / Jahr):</label>
                            <input type="number" id="pkg-education" class="form-input" value="1500">
                        </div>

                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color);" class="flex-between align-center">
                            <span style="font-weight: 700;">Effektiver Gesamtwert:</span>
                            <span id="pkg-total-value" style="font-size: 1.2rem; font-weight: 800; color: var(--color-success);">- €</span>
                        </div>
                    </div>

                    <!-- Argumentation Strategy -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4><i data-lucide="shield-check"></i> Verhandlungs-Leitfaden</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                            Argumentationspunkte für das Gehaltsgespräch mit ${job.company}:
                        </p>

                        <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.6;">
                            <li><strong>Fachkompetenz:</strong> Abdeckung von Key-Skills (${profile.skills.slice(0, 3).join(', ')}).</li>
                            <li><strong>Vergleichbarer Markt-Benchmark:</strong> Für den Titel "${job.title}" liegt der übliche Korridor in ${job.location || 'Deutschland'} bei ca. ${(baseSalary * 0.95).toLocaleString('de-DE')} € bis ${(baseSalary * 1.15).toLocaleString('de-DE')} €.</li>
                            <li><strong>Zielvereinbarung:</strong> Biete an, eine variable Komponente an messbare Ziele zu knüpfen.</li>
                            <li><strong>Entwicklungs-Plan:</strong> Vereinbare eine Gehaltsüberprüfung nach der 6-monatigen Probezeit.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container);
    },

    bindEvents(container) {
        const baseInput = container.querySelector('#pkg-base-salary');
        const bonusInput = container.querySelector('#pkg-bonus');
        const remoteInput = container.querySelector('#pkg-remote-allowance');
        const transitInput = container.querySelector('#pkg-transit');
        const eduInput = container.querySelector('#pkg-education');
        const totalDisplay = container.querySelector('#pkg-total-value');

        const calculateTotal = () => {
            const base = Number(baseInput?.value) || 0;
            const bonus = Number(bonusInput?.value) || 0;
            const remote = Number(remoteInput?.value) || 0;
            const transit = Number(transitInput?.value) || 0;
            const edu = Number(eduInput?.value) || 0;

            const grand = base + bonus + remote + transit + edu;
            if (totalDisplay) {
                totalDisplay.textContent = `${grand.toLocaleString('de-DE')} € / Jahr`;
            }
        };

        [baseInput, bonusInput, remoteInput, transitInput, eduInput].forEach(inp => {
            if (inp) inp.addEventListener('input', calculateTotal);
        });

        calculateTotal();
    }
};
