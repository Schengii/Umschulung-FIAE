/**
 * Arbeitszeugnis-Prüfer & HR-Code Entschlüssler Submodule
 * Analysiert Arbeitszeugnisse auf typische deutsche HR-Formulierungen,
 * berechnet eine Gesamtnote (1-5) und deckt versteckte Fallstricke auf.
 */
import { cvParser } from '../../utils/cvParser.js';
import { geminiApi } from '../../utils/geminiApi.js';

export const referenceChecker = {
    analysisResult: null,

    render(container, job, profile) {
        container.innerHTML = `
            <div class="reference-checker-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="file-badge"></i> KI-Arbeitszeugnis-Prüfer &amp; HR-Code Entschlüssler</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Lies dein Zwischen- oder Endzeugnis ein, um versteckte HR-Geheimcodes und deine Gesamtnote (1-5) zu prüfen.
                        </p>
                    </div>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Zeugnis einlesen
                        <input type="file" id="ref-pdf-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="ref-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Zeugnistext:</label>
                    <textarea id="ref-text-input" rows="8" class="form-input" placeholder="Füge den Text deines Arbeitszeugnisses hier ein (z.B. Leistungsbeurteilung, Verhalten, Schlussformel)...">Herr/Frau Neumann erledigte die ihm/ihr übertragenen Aufgaben stets zu unserer vollsten Zufriedenheit. Sein/Ihr Verhalten gegenüber Vorgesetzten und Kollegen war jederzeit einwandfrei. Wir bedauern sein/ihr Ausscheiden sehr und danken ihm/ihr für die stets sehr gute Zusammenarbeit.</textarea>
                </div>

                <div class="action-bar flex-between align-center" style="margin-bottom: 20px;">
                    <button class="btn btn-primary" id="btn-analyze-reference">
                        <i data-lucide="sparkles"></i> Zeugnis jetzt analysieren &amp; Note berechnen
                    </button>
                </div>

                <div id="ref-analysis-output"></div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    bindEvents(container, job, profile) {
        const fileInput = container.querySelector('#ref-pdf-input');
        const statusBox = container.querySelector('#ref-parse-status');
        const textInput = container.querySelector('#ref-text-input');
        const analyzeBtn = container.querySelector('#btn-analyze-reference');
        const outputBox = container.querySelector('#ref-analysis-output');

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

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
                const text = textInput.value.trim();
                if (!text) return;

                analyzeBtn.disabled = true;
                analyzeBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Analysiere Zeugniscodes...`;
                if (window.lucide) lucide.createIcons();

                const evaluation = await this.evaluateReference(text);
                this.renderEvaluationResults(outputBox, evaluation);

                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = `<i data-lucide="sparkles"></i> Zeugnis jetzt analysieren &amp; Note berechnen`;
                if (window.lucide) lucide.createIcons();
            });
        }
    },

    async evaluateReference(text) {
        const lower = text.toLowerCase();

        // Standard German HR code rules
        let overallGrade = 2; // Default Gut
        const findings = [];

        // 1. Leistungsbeurteilung
        if (lower.includes('stets zur vollsten zufriedenheit') || lower.includes('stets zu unserer vollsten zufriedenheit')) {
            findings.push({ category: 'Arbeitsleistung', phrase: 'stets zu unserer vollsten Zufriedenheit', grade: 'Note 1 (Sehr gut)', type: 'positive' });
            overallGrade = Math.min(overallGrade, 1);
        } else if (lower.includes('zur vollsten zufriedenheit') || lower.includes('stets zur vollen zufriedenheit')) {
            findings.push({ category: 'Arbeitsleistung', phrase: 'stets zur vollen Zufriedenheit', grade: 'Note 2 (Gut)', type: 'positive' });
        } else if (lower.includes('zur vollen zufriedenheit')) {
            findings.push({ category: 'Arbeitsleistung', phrase: 'zur vollen Zufriedenheit', grade: 'Note 3 (Befriedigend)', type: 'warning' });
            overallGrade = Math.max(overallGrade, 3);
        } else if (lower.includes('zur zufriedenheit') || lower.includes('im großen und ganzen')) {
            findings.push({ category: 'Arbeitsleistung', phrase: 'zur Zufriedenheit / im Großen und Ganzen', grade: 'Note 4 (Ausreichend)', type: 'danger' });
            overallGrade = Math.max(overallGrade, 4);
        }

        // 2. Sozialverhalten (Vorgesetzte VOR Kollegen)
        if (lower.includes('vorgesetzten und kollegen') || lower.includes('vorgesetzten sowie mitarbeitern')) {
            findings.push({ category: 'Sozialverhalten', phrase: 'Verhalten gegenüber Vorgesetzten und Kollegen einwandfrei', grade: 'Note 1-2 (Klassische korrekte Reihenfolge)', type: 'positive' });
        } else if (lower.includes('kollegen und vorgesetzten')) {
            findings.push({ category: 'Sozialverhalten (Achtung)', phrase: 'Kollegen vor Vorgesetzten genannt', grade: 'Hinweis auf Autoritätskonflikte / Kritik am Verhalten', type: 'danger' });
            overallGrade = Math.max(overallGrade, 3);
        }

        // 3. Schlussformel & Bedauern
        if (lower.includes('bedauern') && (lower.includes('danken') || lower.includes('dank'))) {
            findings.push({ category: 'Schlussformel', phrase: 'Bedauern und Dank für die Zusammenarbeit ausgedrückt', grade: 'Sehr wertschätzendes Ausscheiden', type: 'positive' });
        } else if (!lower.includes('bedauern')) {
            findings.push({ category: 'Schlussformel (Achtung)', phrase: 'Kein Bedauern über das Ausscheiden genannt', grade: 'Versteckter Abzug (Unternehmen ist nicht unglücklich über den Weggang)', type: 'danger' });
            overallGrade = Math.max(overallGrade, 3);
        }

        let aiExpertOpinion = '';
        if (geminiApi.hasApiKey()) {
            try {
                const prompt = `Analysiere folgendes deutsches Arbeitszeugnis professionell nach den gängigen HR-Geheimcodes. Gib eine Gesamtnote (1-5) und 2-3 konkrete Tipps/Auffälligkeiten:\n\n${text}`;
                aiExpertOpinion = await geminiApi.generateText(prompt, 'Du bist ein erfahrener Fachanwalt für Arbeitsrecht und HR-Experte.');
            } catch (e) {
                console.error(e);
            }
        }

        return {
            overallGrade,
            findings,
            aiExpertOpinion
        };
    },

    renderEvaluationResults(container, evalData) {
        const gradeText = {
            1: 'Sehr Gut (Note 1)',
            2: 'Gut (Note 2)',
            3: 'Befriedigend (Note 3)',
            4: 'Ausreichend (Note 4)',
            5: 'Mangelhaft (Note 5)'
        }[evalData.overallGrade] || 'Gut (Note 2)';

        const gradeColor = evalData.overallGrade <= 2 ? 'var(--color-success)' : (evalData.overallGrade === 3 ? 'var(--color-warning)' : 'var(--color-danger)');

        container.innerHTML = `
            <div class="glass-card" style="padding: 24px; border-left: 4px solid ${gradeColor}; margin-top: 16px;">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <span class="text-secondary" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Ermittelte Zeugnisnote</span>
                        <h2 style="margin: 2px 0 0 0; color: ${gradeColor}; font-size: 1.6rem;">${gradeText}</h2>
                    </div>
                    <span class="badge ${evalData.overallGrade <= 2 ? 'badge-offer' : 'badge-interviewing'}">
                        ${evalData.findings.length} HR-Codes erkannt
                    </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${evalData.findings.map(f => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px 14px; border-radius: var(--radius-md); border-left: 3px solid ${f.type === 'positive' ? 'var(--color-success)' : (f.type === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)')}; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 0.88rem; display: block; color: var(--text-primary);">${f.category}: "${f.phrase}"</strong>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">${f.grade}</span>
                            </div>
                            <span class="badge ${f.type === 'positive' ? 'badge-offer' : 'badge-interviewing'}" style="font-size: 0.7rem;">
                                ${f.type === 'positive' ? '✓ Positiv' : '⚠ Auffällig'}
                            </span>
                        </div>
                    `).join('')}
                </div>

                ${evalData.aiExpertOpinion ? `
                    <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 8px 0; color: var(--color-primary); font-size: 0.9rem;"><i data-lucide="sparkles"></i> KI-Expertenurteil:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap;">${evalData.aiExpertOpinion}</p>
                    </div>
                ` : ''}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }
};
