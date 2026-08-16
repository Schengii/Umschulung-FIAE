/**
 * CV Optimizer Submodule
 * Evaluates candidate CV text against job requirements and parses uploaded PDF CVs.
 */
import { cvParser } from '../../utils/cvParser.js';
import { storage } from '../../storage.js';

export const cvOptimizer = {
    render(container, job, profile) {
        container.innerHTML = `
            <div class="cv-optimizer-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="file-check"></i> Lebenslauf-Abgleich &amp; PDF-Import</h3>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Lebenslauf / LinkedIn-Export importieren
                        <input type="file" id="cv-pdf-upload-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="pdf-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Dein aktueller Lebenslauf-Text (CV):</label>
                    <textarea id="cv-optimizer-text" rows="8" class="form-input" placeholder="Füge deinen Lebenslauf-Text ein oder lade oben eine PDF hoch...">${profile.cvText || profile.experience || ''}</textarea>
                </div>

                <div id="cv-analysis-results" style="margin-top: 16px;"></div>

                <div class="action-bar flex-between align-center" style="margin-top: 16px;">
                    <button class="btn btn-primary" id="btn-analyze-cv">
                        <i data-lucide="search"></i> Lebenslauf auf Stelle analysieren
                    </button>
                    <button class="btn btn-secondary" id="btn-save-cv-text">
                        <i data-lucide="save"></i> Text im Profil speichern
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        const fileInput = container.querySelector('#cv-pdf-upload-input');
        const statusBox = container.querySelector('#pdf-parse-status');
        const cvTextarea = container.querySelector('#cv-optimizer-text');

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                statusBox.style.display = 'block';
                statusBox.textContent = `Lese PDF "${file.name}" ein...`;

                try {
                    const text = await cvParser.extractTextFromPdf(file);
                    const parsedData = cvParser.parseCvText(text);

                    cvTextarea.value = text;
                    statusBox.className = 'alert alert-success';
                    statusBox.textContent = `PDF erfolgreich eingelesen (${text.length} Zeichen). Gefundene Skills: ${parsedData.detectedSkills.join(', ') || 'keine automatischen Treffer'}`;

                    // Update profile skills if new skills found
                    if (parsedData.detectedSkills.length > 0) {
                        const existingSkills = new Set(profile.skills || []);
                        parsedData.detectedSkills.forEach(s => existingSkills.add(s));
                        profile.skills = Array.from(existingSkills);
                        storage.saveProfile(profile);
                    }
                } catch (err) {
                    statusBox.className = 'alert alert-danger';
                    statusBox.textContent = `Fehler beim PDF-Import: ${err.message}`;
                }
            });
        }

        const analyzeBtn = container.querySelector('#btn-analyze-cv');
        const resultsBox = container.querySelector('#cv-analysis-results');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                const cvText = cvTextarea.value.toLowerCase();
                const descText = (job.description || '').toLowerCase();

                // Find missing keywords in CV compared to Job Description
                const keywords = ['react', 'typescript', 'javascript', 'html', 'css', 'git', 'figma', 'node.js', 'agile', 'rest api'];
                const missingInCv = keywords.filter(kw => descText.includes(kw) && !cvText.includes(kw));

                resultsBox.innerHTML = `
                    <div class="glass-card" style="padding: 16px;">
                        <h4>Analyse-Ergebnis für "${job.title}"</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 4px;">
                            ${missingInCv.length === 0 ? 'Perfekt! Dein Lebenslauf deckt alle wesentlichen Kernbegriffe der Stellenausschreibung ab.' : `Folgende Schlüsselwörter der Stelle fehlen noch in deinem Lebenslauf-Text:`}
                        </p>
                        ${missingInCv.length > 0 ? `
                            <div class="keyword-tags" style="margin-top: 8px;">
                                ${missingInCv.map(kw => `<span class="keyword-badge miss">+ ${kw}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }

        const saveBtn = container.querySelector('#btn-save-cv-text');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                profile.cvText = cvTextarea.value;
                storage.saveProfile(profile);
                saveBtn.textContent = 'Gespeichert!';
                setTimeout(() => { saveBtn.innerHTML = `<i data-lucide="save"></i> Text im Profil speichern`; if (window.lucide) lucide.createIcons(); }, 2000);
            });
        }
    }
};
