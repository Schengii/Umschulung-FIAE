/**
 * Contract & Job Offer Clause Checker Submodule
 * Evaluates employment contract drafts for unfair or invalid German labor law clauses
 * (overtime, non-compete, notice periods, IP rights).
 */
import { cvParser } from '../../utils/cvParser.js';
import { geminiApi } from '../../utils/geminiApi.js';

export const contractChecker = {
    render(container, job, profile) {
        container.innerHTML = `
            <div class="contract-checker-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="shield-alert"></i> KI-Arbeitsvertrags- &amp; Klausel-Checker</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Prüfe Arbeitsvertrags-Entwürfe auf juristische Fallstricke, unbezahlte Überstunden und unfaire Klauseln.
                        </p>
                    </div>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Vertrag einlesen
                        <input type="file" id="contract-pdf-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="contract-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Vertragstext / Klauseln:</label>
                    <textarea id="contract-text-input" rows="8" class="form-input" placeholder="Füge den Vertragstext oder einzelne Klauseln hier ein...">§ 4 Arbeitszeit & Überstunden: Die regelmäßige wöchentliche Arbeitszeit beträgt 40 Stunden. Etwaige anfallende Überstunden sind mit dem vereinbarten monatlichen Grundgehalt vollständig abgegolten.

§ 8 Kündigung: Das Arbeitsverhältnis kann von beiden Seiten mit einer Frist von 2 Wochen zur Monatsmitte gekündigt werden.

§ 12 Nachvertragliches Wettbewerbsverbot: Dem Arbeitnehmer ist es untersagt, für die Dauer von 12 Monaten nach Beendigung des Arbeitsverhältnisses für ein Konkurrenzunternehmen tätig zu werden.</textarea>
                </div>

                <div class="action-bar flex-between align-center" style="margin-bottom: 20px;">
                    <button class="btn btn-primary" id="btn-check-contract">
                        <i data-lucide="shield-check"></i> Vertragsklauseln jetzt prüfen
                    </button>
                </div>

                <div id="contract-analysis-output"></div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        const fileInput = container.querySelector('#contract-pdf-input');
        const statusBox = container.querySelector('#contract-parse-status');
        const textInput = container.querySelector('#contract-text-input');
        const checkBtn = container.querySelector('#btn-check-contract');
        const outputBox = container.querySelector('#contract-analysis-output');

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                statusBox.style.display = 'block';
                statusBox.className = 'alert alert-info';
                statusBox.textContent = `Lese PDF "${file.name}" ein...`;

                try {
                    const text = await cvParser.extractTextFromPdf(file);
                    textInput.value = text;
                    statusBox.className = 'alert alert-success';
                    statusBox.textContent = `PDF erfolgreich eingelesen (${text.length} Zeichen).`;
                } catch (err) {
                    statusBox.className = 'alert alert-danger';
                    statusBox.textContent = `Fehler beim PDF-Import: ${err.message}`;
                }
            });
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', async () => {
                const text = textInput.value.trim();
                if (!text) return;

                checkBtn.disabled = true;
                checkBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Prüfe Klauseln nach Arbeitsrecht...`;
                if (window.lucide) lucide.createIcons();

                const results = await this.evaluateContract(text);
                this.renderResults(outputBox, results);

                checkBtn.disabled = false;
                checkBtn.innerHTML = `<i data-lucide="shield-check"></i> Vertragsklauseln jetzt prüfen`;
                if (window.lucide) lucide.createIcons();
            });
        }
    },

    async evaluateContract(text) {
        const lower = text.toLowerCase();
        const checks = [];

        // 1. Überstunden-Pauschale
        if (lower.includes('vollständig abgegolten') || lower.includes('mit dem gehalt abgegolten') || lower.includes('pauschal abgegolten')) {
            checks.push({
                clause: 'Pauschale Überstundenabgeltung',
                status: 'danger',
                title: '⚠ Unwirksame Pauschalklausel vermutet',
                desc: 'Formulierungen wie "alle Überstunden sind abgegolten" ohne Nennung einer konkreten Stundenobergrenze (z. B. "bis zu 10h/Monat") sind nach BAG-Rechtsprechung (§ 307 BGB) meist unwirksam.',
                recommendation: 'Verhandle eine klare Obergrenze oder ein Zeiterfassungskonto mit Freizeitausgleich.'
            });
        } else {
            checks.push({
                clause: 'Überstundenregelung',
                status: 'success',
                title: '✓ Keine pauschale Alles-Abgegolten-Klausel erkannt',
                desc: 'Keine unzulässige Pauschalregelung gefunden.',
                recommendation: 'Achte dennoch auf klare Gleitzeit- oder Freizeitausgleichsregelungen.'
            });
        }

        // 2. Nachvertragliches Wettbewerbsverbot
        if (lower.includes('wettbewerbsverbot') || lower.includes('konkurrenzunternehmen')) {
            const hasKarenz = lower.includes('karenzentschädigung') || lower.includes('karenz');
            checks.push({
                clause: 'Nachvertragliches Wettbewerbsverbot',
                status: hasKarenz ? 'warning' : 'danger',
                title: hasKarenz ? '⚖ Wettbewerbsverbot mit Entschädigung' : '🚨 Wettbewerbsverbot ohne Karenzentschädigung (Nichtigkeit)',
                desc: hasKarenz
                    ? 'Ein Wettbewerbsverbot ist nur gültig, wenn dir der Arbeitgeber mindestens 50% der letzten Bezüge als Karenzentschädigung zahlt (§ 74 HGB).'
                    : 'Ein Wettbewerbsverbot OHNE ausdrückliche Zusage einer gesetzlichen Karenzentschädigung (mind. 50% des Gehalts) ist nach § 74 Abs. 2 HGB komplett unverbindlich/nichtig!',
                recommendation: hasKarenz ? 'Prüfe, ob du für diesen Zeitraum beruflich eingeschränkt sein möchtest.' : 'Streichung der Klausel verlangen.'
            });
        }

        // 3. Kündigungsfristen
        if (lower.includes('kündigungsfrist') || lower.includes('kündigung')) {
            checks.push({
                clause: 'Kündigungsfristen & Probezeit',
                status: 'info',
                title: 'ℹ Kündigungsregelungen beachten',
                desc: 'In der Probezeit (max. 6 Monate) gilt gesetzlich eine Frist von 2 Wochen (§ 622 Abs. 3 BGB). Nach der Probezeit darf die Frist für dich als Arbeitnehmer nicht länger sein als für den Arbeitgeber.',
                recommendation: 'Achte darauf, dass die Kündigungsfristen für beide Seiten symmetrisch sind.'
            });
        }

        let aiExpertReview = '';
        if (geminiApi.hasApiKey()) {
            try {
                const prompt = `Analysiere folgende Arbeitsvertragsklauseln nach deutschem Arbeitsrecht. Prüfe auf Unwirksamkeit nach AGB-Recht (§ 307 BGB), Überstundenfallen, Wettbewerbsverbote und unfaire Pflichten:\n\n${text}`;
                aiExpertReview = await geminiApi.generateText(prompt, 'Du bist ein erfahrener Fachanwalt für Arbeitsrecht.');
            } catch (e) {
                console.error(e);
            }
        }

        return {
            checks,
            aiExpertReview
        };
    },

    renderResults(container, data) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 24px; margin-top: 16px;">
                <h4 style="margin: 0 0 16px 0; font-size: 1.05rem;"><i data-lucide="check-circle2"></i> Analyse-Ergebnisse &amp; Risikobewertung:</h4>

                <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
                    ${data.checks.map(c => `
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid ${c.status === 'danger' ? 'var(--color-danger)' : (c.status === 'warning' ? 'var(--color-warning)' : 'var(--color-success)')};">
                            <div class="flex-between align-center" style="margin-bottom: 6px;">
                                <strong style="font-size: 0.95rem; color: #ffffff;">${c.title}</strong>
                                <span class="badge ${c.status === 'danger' ? 'badge-danger' : (c.status === 'warning' ? 'badge-interviewing' : 'badge-offer')}" style="font-size: 0.7rem;">
                                    ${c.clause}
                                </span>
                            </div>
                            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0 0 8px 0;">${c.desc}</p>
                            <div style="font-size: 0.8rem; color: #38bdf8; background: rgba(56, 189, 248, 0.08); padding: 6px 10px; border-radius: 4px;">
                                💡 <strong>Tipp für Verhandlung:</strong> ${c.recommendation}
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${data.aiExpertReview ? `
                    <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 8px 0; color: var(--color-primary); font-size: 0.9rem;"><i data-lucide="sparkles"></i> KI-Fachanwalts-Gutachten:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap;">${data.aiExpertReview}</p>
                    </div>
                ` : ''}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }
};
