/**
 * Cover Letter Generator Submodule
 * Generates custom cover letters using Gemini API or mockAi with live PDF download support.
 */
import { geminiApi } from '../../utils/geminiApi.js';
import { printCoverLetter } from '../../utils/pdfExport.js';


export const coverLetterGen = {
    render(container, job, profile) {
        const hasKey = geminiApi.hasApiKey();

        container.innerHTML = `
            <div class="cover-letter-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3>Anschreiben-Generator ${hasKey ? '<span class="badge badge-offer">Gemini Live AI</span>' : '<span class="badge badge-saved">Offline AI</span>'}</h3>
                    <div class="tone-selector flex-row align-center" style="gap: 8px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Tonalität:</label>
                        <select id="cover-letter-tone" class="form-input" style="padding: 4px 8px; width: auto;">
                            <option value="klassisch">Klassisch & Professionell</option>
                            <option value="kreativ">Kreativ & Modern</option>
                            <option value="kurz">Kurzer Pitch (E-Mail)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <textarea id="cover-letter-output" rows="12" class="form-input" style="font-family: monospace; font-size: 0.9rem; line-height: 1.5;" placeholder="Generiere ein maßgeschneidertes Anschreiben..."></textarea>
                </div>

                <div class="action-bar flex-between align-center">
                    <button class="btn btn-primary" id="btn-generate-cover-letter">
                        <i data-lucide="sparkles"></i> Anschreiben generieren
                    </button>
                    <div class="flex-row" style="gap: 8px;">
                        <button class="btn btn-secondary" id="btn-copy-cover-letter">
                            <i data-lucide="copy"></i> Kopieren
                        </button>
                        <button class="btn btn-secondary" id="btn-download-pdf">
                            <i data-lucide="download"></i> Als PDF herunterladen
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        const genBtn = container.querySelector('#btn-generate-cover-letter');
        const outputTextarea = container.querySelector('#cover-letter-output');
        const toneSelect = container.querySelector('#cover-letter-tone');

        if (genBtn && outputTextarea) {
            genBtn.addEventListener('click', async () => {
                genBtn.disabled = true;
                genBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Generiere Anschreiben...`;
                if (window.lucide) lucide.createIcons();

                const tone = toneSelect ? toneSelect.value : 'klassisch';
                const letter = await geminiApi.generateCoverLetter(job.title, job.company, job.description, profile, tone);

                outputTextarea.value = letter;
                genBtn.disabled = false;
                genBtn.innerHTML = `<i data-lucide="sparkles"></i> Anschreiben generieren`;
                if (window.lucide) lucide.createIcons();
            });
        }

        const copyBtn = container.querySelector('#btn-copy-cover-letter');
        if (copyBtn && outputTextarea) {
            copyBtn.addEventListener('click', () => {
                if (!outputTextarea.value) return;
                navigator.clipboard.writeText(outputTextarea.value);
                copyBtn.textContent = 'Kopiert!';
                setTimeout(() => {
                    copyBtn.innerHTML = `<i data-lucide="copy"></i> Kopieren`;
                    if (window.lucide) lucide.createIcons();
                }, 2000);
            });
        }

        const pdfBtn = container.querySelector('#btn-download-pdf');
        if (pdfBtn && outputTextarea) {
            pdfBtn.addEventListener('click', () => {
                const text = outputTextarea.value;
                if (!text) return;
                printCoverLetter(profile, job, text);
            });
        }

    }
};
