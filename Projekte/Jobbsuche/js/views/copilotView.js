import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';

export const copilotView = {
    selectedJobId: null,
    interviewQuestions: [],
    currentQuestionIdx: 0,
    interviewScores: [],
    negotiationHistory: [],
    negotiationTargetSalary: 0,
    negotiationMinSalary: 0,
    negotiationPersona: 'tough',

    render(containerId, targetJobId = null) {
        const container = document.getElementById(containerId);
        const jobs = storage.getJobs();
        const profile = storage.getProfile();

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px;">
                    <i data-lucide="sparkles"></i>
                    <h2>Bewerbungs-Copilot ist bereit!</h2>
                    <p>Füge zuerst Jobangebote hinzu, um den AI-gestützten Skill-Vergleich und Anschreiben-Generator zu nutzen.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Handle pre-selected job routing
        if (targetJobId) {
            this.selectedJobId = targetJobId;
        } else if (!this.selectedJobId || !jobs.some(j => j.id === this.selectedJobId)) {
            // Default select the first active job
            this.selectedJobId = jobs[0].id;
        }

        const activeJob = jobs.find(j => j.id === this.selectedJobId) || jobs[0];
        const matchData = mockAi.analyzeMatch(profile.skills, activeJob.description);

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Bewerbungs-Copilot (AI)</h2>
                <span class="text-secondary">Analysiere Übereinstimmungen und entwerfe maßgeschneiderte Bewerbungen</span>
            </div>

            <div class="copilot-layout">
                <!-- Left panel: Job list selection & details -->
                <div class="copilot-panel">
                    <div class="glass-card job-select-card">
                        <h3><i data-lucide="briefcase"></i> Job auswählen</h3>
                        <div class="job-selector-list">
                            ${jobs.map(job => `
                                <button class="job-selector-item ${job.id === this.selectedJobId ? 'active' : ''}" data-id="${job.id}">
                                    <span class="title">${job.title}</span>
                                    <span class="company">${job.company}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Skills preview -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Meine Skills</h4>
                            <button class="btn btn-secondary btn-sm" id="copilot-edit-profile-btn" style="padding: 4px 8px; font-size: 0.75rem;">
                                <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i> Bearbeiten
                            </button>
                        </div>
                        <div class="keyword-tags" style="gap: 4px;">
                            ${profile.skills.length > 0 ? profile.skills.map(skill => `
                                <span class="keyword-badge match" style="font-size: 0.75rem;">${skill}</span>
                            `).join('') : `
                                <span class="text-muted" style="font-size: 0.8rem;">Keine Skills eingetragen.</span>
                            `}
                        </div>
                    </div>

                    <!-- Notes & Contact Person Sidebar Card -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Notizen &amp; Kontakt</h4>
                            <button class="btn btn-secondary btn-sm" id="copilot-edit-notes-btn" style="padding: 4px 8px; font-size: 0.75rem;">
                                <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Details
                            </button>
                        </div>
                        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <span class="text-muted" style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 2px;">Kontaktperson / Recruiter:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${activeJob.contact || 'Keine Angabe'}</span>
                            </div>
                            <div>
                                <span class="text-muted" style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 2px;">Eigene Notizen:</span>
                                <span style="white-space: pre-wrap; color: var(--text-secondary); line-height: 1.4;">${activeJob.notes || 'Keine Notizen hinterlegt.'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right panel: Analyzed Details & AI tools -->
                <div class="copilot-main">
                    <!-- Match Overview Row -->
                    <div class="copilot-match-row">
                        <!-- Score circle -->
                        <div class="glass-card match-circle-card">
                            <div class="match-radial">
                                <span class="num">${matchData.matchScore}</span>
                                <span class="txt">% Match</span>
                            </div>
                            <h4>Skill Übereinstimmung</h4>
                        </div>

                        <!-- Keyword breakdown -->
                        <div class="glass-card match-details-card">
                            <h3>Anforderungs-Abgleich</h3>
                            <div class="keyword-lists">
                                <div class="keyword-col matching">
                                    <h4><i data-lucide="check-circle2"></i> Gefundene Skills (${matchData.matchingSkills.length})</h4>
                                    <div class="keyword-tags">
                                        ${matchData.matchingSkills.length > 0 ? matchData.matchingSkills.map(s => `
                                            <span class="keyword-badge match">${s}</span>
                                        `).join('') : `
                                            <span class="text-muted" style="font-size: 0.8rem;">Keine Übereinstimmung gefunden.</span>
                                        `}
                                    </div>
                                </div>
                                <div class="keyword-col missing">
                                    <h4><i data-lucide="alert-circle"></i> Fehlende Skills (${matchData.missingSkills.length})</h4>
                                    <div class="keyword-tags">
                                        ${matchData.missingSkills.length > 0 ? matchData.missingSkills.map(s => `
                                            <span class="keyword-badge miss">${s}</span>
                                        `).join('') : `
                                            <span class="text-muted" style="font-size: 0.8rem;">Perfektes Match! Keine fehlenden Skills gefunden.</span>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Tools Container with Tabs -->
                    <div class="glass-card" style="padding: 28px;">
                        <nav class="tabs-nav">
                            <button class="tab-btn active" data-tab="tab-cover-letter">
                                <i data-lucide="file-text" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Anschreiben-Generator
                            </button>
                            <button class="tab-btn" data-tab="tab-interview-prep">
                                <i data-lucide="help-circle" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Interview-Vorbereitung (Prepper)
                            </button>
                            <button class="tab-btn" data-tab="tab-resume-optimizer">
                                <i data-lucide="file-check" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Lebenslauf-Optimizer
                            </button>
                            <button class="tab-btn" data-tab="tab-email-writer">
                                <i data-lucide="mail" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> E-Mail-Assistent
                            </button>
                            <button class="tab-btn" data-tab="tab-salary-negotiation">
                                <i data-lucide="coins" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Gehaltsverhandlung
                            </button>
                        </nav>

                        <!-- Tab 1: Cover Letter Generator -->
                        <div id="tab-cover-letter" class="tab-content active">
                            <div class="ai-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="sparkles" style="color: var(--primary);"></i> Individuelles Bewerbungsanschreiben</h3>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <select id="cover-letter-tone" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="classic">Klassisch (Formell)</option>
                                        <option value="creative">Kreativ &amp; Modern</option>
                                        <option value="pitch">Kurzer Pitch (3 Gründe)</option>
                                    </select>
                                    <button class="btn btn-primary" id="btn-generate-letter">
                                        <i data-lucide="cpu"></i> Anschreiben generieren
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-letter-output" style="margin-top: 14px;">
                                Hier erscheint dein maßgeschneidertes Anschreiben basierend auf deinen Skills und der Jobbeschreibung. Klicke oben auf "Anschreiben generieren", um den AI-Copiloten zu starten.
                            </div>
                        </div>

                        <!-- Tab 2: Interview Prepper -->
                        <div id="tab-interview-prep" class="tab-content">
                            <div class="ai-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="help-circle" style="color: var(--secondary);"></i> Simulierte Gesprächsfragen &amp; Antworten</h3>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-secondary" id="btn-generate-cheatsheet" style="border-color: rgba(139, 92, 246, 0.4); color: var(--secondary);">
                                        <i data-lucide="file-text"></i> Spickzettel (1-Pager)
                                    </button>
                                    <button class="btn btn-primary" id="btn-generate-prep" style="background: linear-gradient(135deg, var(--secondary), var(--primary)); box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.3);">
                                        <i data-lucide="play" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Simulator starten
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-prep-output" style="margin-top: 14px;">
                                Der AI-Simulator analysiert das Stellenprofil und generiert 5 typische Interviewfragen, die speziell auf deine Übereinstimmungen und Skill-Gaps zugeschnitten sind. Du kannst deine Antworten eintippen oder einsprechen und erhältst direkt Feedback. Klicke oben auf "Simulator starten", um zu beginnen.
                            </div>
                        </div>

                        <!-- Tab 3: Resume Optimizer -->
                        <div id="tab-resume-optimizer" class="tab-content">
                            <div class="resume-optimizer-grid">
                                <div class="resume-input-section" style="display: flex; flex-direction: column; gap: 10px;">
                                    <div class="ai-card-header" style="margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                        <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="file-check" style="color: var(--primary);"></i> Dein Lebenslauf-Text</h3>
                                        <button class="btn btn-secondary btn-sm" id="btn-save-cv-text" title="Lebenslauf dauerhaft im Profil speichern" style="padding: 4px 8px; font-size: 0.75rem;">
                                            <i data-lucide="save" style="width: 12px; height: 12px;"></i> Speichern
                                        </button>
                                    </div>
                                    <textarea id="resume-cv-text" rows="12" placeholder="Füge hier den reinen Text deines aktuellen Lebenslaufs ein (z. B. Werdegang, Ausbildung, Skills). Der AI-Copilot vergleicht ihn mit der Stellenanzeige." style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); padding: 14px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; min-height: 200px;">${profile.cvText || ''}</textarea>
                                    <button class="btn btn-primary btn-full" id="btn-optimize-resume" style="margin-top: 14px; width: 100%;">
                                        <i data-lucide="sparkles"></i> Lebenslauf optimieren
                                    </button>
                                </div>
                                <div class="resume-results-section" id="resume-optimize-results" style="margin-top: 20px;">
                                    <div class="ai-output-box" style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); font-size: 0.9rem; min-height: 150px; padding: 24px;">
                                        Trage links deinen Lebenslauf ein und klicke auf "Lebenslauf optimieren", um den automatischen Abgleich und Formulierungsvorschläge zu erhalten.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 4: Email Writer -->
                        <div id="tab-email-writer" class="tab-content">
                            <div class="ai-card-header" style="margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; width: 100%;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="mail" style="color: var(--primary);"></i> E-Mail-Assistent (AI)</h3>
                                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                                    <select id="email-type" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="status">Status-Nachfrage</option>
                                        <option value="thankyou">Danksagung nach Gespräch</option>
                                        <option value="negotiate">Angebot verhandeln</option>
                                        <option value="decline">Bewerbung absagen</option>
                                        <option value="withdraw">Bewerbung zurückziehen</option>
                                    </select>
                                    <select id="email-tone" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="formal">Formell (Sie)</option>
                                        <option value="casual">Locker (Du)</option>
                                    </select>
                                    <button class="btn btn-primary btn-sm" id="btn-generate-email">
                                        <i data-lucide="cpu"></i> Schreiben
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-email-output" style="margin-top: 14px; min-height: 200px;">
                                Wähle oben den Typ und die Tonalität der E-Mail aus und klicke auf "Schreiben", um einen personalisierten Entwurf zu generieren.
                            </div>
                        </div>

                        <!-- Tab 5: Gehaltsverhandlungs-Trainer -->
                        <div id="tab-salary-negotiation" class="tab-content" style="display: none;">
                            <div class="ai-card-header" style="margin-bottom: 16px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="coins" style="color: var(--warning);"></i> AI Gehaltsverhandlungs-Coach</h3>
                                <button class="btn btn-primary btn-sm" id="btn-start-neg" style="background: linear-gradient(135deg, var(--warning), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px;">
                                    <i data-lucide="play"></i> Simulation starten
                                </button>
                            </div>
                            <div class="ai-output-box" id="ai-neg-output" style="margin-top: 14px; min-height: 200px;">
                                <div class="neg-start-setup" style="display: flex; flex-direction: column; gap: 14px; text-align: left; max-width: 500px; margin: 0 auto; padding: 10px;">
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">Simulation konfigurieren</h4>
                                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Bereite dich auf das Gehaltsgespräch vor. Stelle dein Wunschgehalt und deine Argumente ein, um die Verhandlung mit dem AI-Recruiter zu starten.</p>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-target-salary" style="font-size: 0.8rem;">Wunschgehalt (€ pro Jahr) *</label>
                                        <input type="number" id="neg-target-salary" placeholder="z. B. 65000" style="padding: 8px 12px; font-size: 0.85rem;" value="${activeJob.salary || ''}">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-min-salary" style="font-size: 0.8rem;">Schmerzgrenze (€ pro Jahr) *</label>
                                        <input type="number" id="neg-min-salary" placeholder="z. B. 58000" style="padding: 8px 12px; font-size: 0.85rem;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-persona" style="font-size: 0.8rem;">Verhandlungspartner (Recruiter Persona)</label>
                                        <select id="neg-persona" style="padding: 8px 12px; font-size: 0.85rem; background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-sm);">
                                            <option value="tough">Hart aber fair (Hinterfragt viel)</option>
                                            <option value="friendly">Freundlich &amp; kompromissbereit</option>
                                            <option value="budget">Strikte Budgetgrenze (Sehr preisbewusst)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        this.bindEvents(container, activeJob, profile);
    },

    bindEvents(container, activeJob, profile) {
        // Job selection click list
        container.querySelectorAll('.job-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                this.selectedJobId = id;
                this.render('view-copilot');
            });
        });

        // Edit Profile/Skills quicklink
        container.querySelector('#copilot-edit-profile-btn')?.addEventListener('click', () => {
            window.app.openProfileModal();
        });

        // Edit Job details (for notes/contactperson) quicklink
        container.querySelector('#copilot-edit-notes-btn')?.addEventListener('click', () => {
            window.app.editJob(activeJob.id);
        });

        // --- TABS TOGGLING ---
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Deactivate all
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activate clicked
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                container.querySelector(`#${tabId}`).classList.add('active');
            });
        });

        // --- TAB 1: COVER LETTER ---
        const genBtn = container.querySelector('#btn-generate-letter');
        const outputBox = container.querySelector('#ai-letter-output');

        if (genBtn && outputBox) {
            genBtn.addEventListener('click', async () => {
                outputBox.innerHTML = `
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Copilot analysiert die Anforderungen von ${activeJob.company} und formuliert das Anschreiben...</p>
                    </div>
                `;
                genBtn.disabled = true;

                try {
                    const toneSelect = container.querySelector('#cover-letter-tone');
                    const selectedTone = toneSelect ? toneSelect.value : 'classic';
                    const text = await mockAi.generateCoverLetter(profile, activeJob, selectedTone);
                    outputBox.innerHTML = `
                        <div style="position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; gap: 8px; align-items: center;">
                            <select id="pdf-style-preset" style="padding: 6px 10px; font-size: 0.75rem; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 500; cursor: pointer; outline: none;">
                                <option value="din5008">DIN 5008 (Klassisch)</option>
                                <option value="modern">Modern (Sans-Serif)</option>
                                <option value="elegant">Elegant (Serif)</option>
                            </select>
                            <button class="btn btn-secondary btn-sm" id="btn-tts-letter">
                                <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-copy-letter">
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Text kopieren
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-pdf-letter" style="background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25); color: var(--primary);">
                                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> PDF Export
                            </button>
                        </div>
                        <div style="padding-top: 10px;">${text}</div>
                    `;
                    lucide.createIcons();

                    document.getElementById('btn-tts-letter').addEventListener('click', () => {
                        if (!('speechSynthesis' in window)) {
                            window.app.showToast('Sprachausgabe wird nicht unterstützt.', 'warning');
                            return;
                        }

                        const btn = document.getElementById('btn-tts-letter');
                        if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                            return;
                        }

                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'de-DE';
                        btn.innerHTML = `<i data-lucide="volume-x" style="width: 14px; height: 14px;"></i> Stoppen`;
                        lucide.createIcons();

                        utterance.onend = () => {
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                        };
                        utterance.onerror = () => {
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                        };
                        window.speechSynthesis.speak(utterance);
                    });

                    document.getElementById('btn-copy-letter').addEventListener('click', () => {
                        navigator.clipboard.writeText(text).then(() => {
                            window.app.showToast('In Zwischenablage kopiert!', 'success');
                        }).catch(() => {
                            window.app.showToast('Fehler beim Kopieren.', 'danger');
                        });
                    });

                    document.getElementById('btn-pdf-letter').addEventListener('click', () => {
                        const stylePreset = document.getElementById('pdf-style-preset').value;
                        import('../utils/pdfExport.js').then(module => {
                            module.printCoverLetter(profile, activeJob, text, stylePreset);
                            window.app.showToast('Drucker-PDF-Dialog geöffnet!', 'success');
                        }).catch(err => {
                            console.error("Failed to load PDF export utility", err);
                            window.app.showToast('Fehler beim Generieren der PDF.', 'danger');
                        });
                    });
                } catch (err) {
                    outputBox.innerHTML = 'Ein Fehler ist bei der Generierung aufgetreten. Bitte versuche es erneut.';
                } finally {
                    genBtn.disabled = false;
                }
            });
        }

        // --- TAB 2: INTERVIEW PREP ---
        const prepBtn = container.querySelector('#btn-generate-prep');
        const prepOutputBox = container.querySelector('#ai-prep-output');

        if (prepBtn && prepOutputBox) {
            prepBtn.addEventListener('click', async () => {
                prepOutputBox.innerHTML = `
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Simulator bereitet 5 individuelle Gesprächsfragen vor...</p>
                    </div>
                `;
                prepBtn.disabled = true;

                try {
                    const questions = await mockAi.generateInterviewPrep(profile, activeJob);
                    this.interviewQuestions = questions;
                    this.currentQuestionIdx = 0;
                    this.interviewScores = [];
                    
                    this.renderActiveQuestion(prepOutputBox, activeJob, profile);
                } catch (err) {
                    console.error(err);
                    prepOutputBox.innerHTML = 'Ein Fehler ist bei der Vorbereitung aufgetreten. Bitte versuche es erneut.';
                } finally {
                    prepBtn.disabled = false;
                }
            });
        }

        // Spickzettel (Cheat Sheet 1-Pager) Button
        const cheatSheetBtn = container.querySelector('#btn-generate-cheatsheet');
        if (cheatSheetBtn && prepOutputBox) {
            cheatSheetBtn.addEventListener('click', () => {
                const matchData = mockAi.analyzeMatch(profile.skills, activeJob.description);
                prepOutputBox.innerHTML = `
                    <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <h4 style="margin: 0; font-size: 1.1rem; color: var(--secondary);">📋 Interview-Spickzettel (1-Pager): ${activeJob.company}</h4>
                            <button class="btn btn-secondary btn-sm" onclick="window.print()"><i data-lucide="printer"></i> Drucken</button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Meine Top-Argumente:</strong>
                                <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">
                                    ${matchData.matchingSkills.slice(0, 4).map(s => `<li>Experte in ${s}</li>`).join('') || '<li>Hohe Lernbereitschaft &amp; Motivation</li>'}
                                </ul>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Eigene Fragen an das Team:</strong>
                                <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">
                                    <li>Wie sieht ein typischer Arbeitstag im Team aus?</li>
                                    <li>Welche Tech-Stack Herausforderungen stehen als Nächstes an?</li>
                                    <li>Wie verläuft das Einarbeitungskonzept?</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            });
        }

        // --- TAB 3: RESUME OPTIMIZER ---
        const btnSaveCv = container.querySelector('#btn-save-cv-text');
        const textareaCv = container.querySelector('#resume-cv-text');
        const btnOptimize = container.querySelector('#btn-optimize-resume');
        const resultsBox = container.querySelector('#resume-optimize-results');

        if (btnSaveCv && textareaCv) {
            btnSaveCv.addEventListener('click', () => {
                const cvText = textareaCv.value;
                const activeProfile = storage.getProfile();
                activeProfile.cvText = cvText;
                storage.saveProfile(activeProfile);
                window.app.showToast('Lebenslauf-Text erfolgreich gespeichert!', 'success');
            });
        }

        if (btnOptimize && resultsBox) {
            btnOptimize.addEventListener('click', async () => {
                const cvText = textareaCv.value.trim();
                if (!cvText) {
                    window.app.showToast('Bitte füge zuerst deinen Lebenslauf-Text ein.', 'warning');
                    return;
                }

                btnOptimize.disabled = true;
                btnOptimize.innerHTML = `<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Optimiere...`;
                resultsBox.innerHTML = `
                    <div class="ai-loader" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 40px 0;">
                        <div class="ai-loader-spinner"></div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">AI-Copilot vergleicht Lebenslauf mit Stellenprofil...</p>
                    </div>
                `;

                try {
                    const result = await mockAi.generateResumeOptimization(profile, activeJob, cvText);
                    
                    let scoreClass = 'low';
                    if (result.score >= 75) scoreClass = 'high';
                    else if (result.score >= 40) scoreClass = 'medium';

                    const matchingHtml = result.matchingKeywords.length > 0 
                        ? result.matchingKeywords.map(kw => `<span class="keyword-badge match" style="font-size: 0.72rem;">${kw}</span>`).join('')
                        : `<span class="text-muted" style="font-size: 0.8rem;">Keine Keywords gefunden.</span>`;

                    const missingHtml = result.missingKeywords.length > 0 
                        ? result.missingKeywords.map(kw => `<span class="keyword-badge miss" style="font-size: 0.72rem;">${kw}</span>`).join('')
                        : `<span class="text-muted" style="font-size: 0.8rem;">Perfektes Keyword-Match!</span>`;

                    const bulletPointsHtml = result.bulletPoints.map(bp => `
                        <div class="bp-compare-card" style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
                            <div class="bp-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                                <div style="opacity: 0.6; border-right: 1px solid var(--border-color); padding-right: 14px;">
                                    <span style="font-size: 0.68rem; text-transform: uppercase; color: var(--danger); font-weight: 700; display: block; margin-bottom: 2px;">Vorher:</span>
                                    <p style="font-size: 0.82rem; margin: 0; color: var(--text-secondary); font-style: italic;">"${bp.original}"</p>
                                </div>
                                <div>
                                    <span style="font-size: 0.68rem; text-transform: uppercase; color: var(--success); font-weight: 700; display: block; margin-bottom: 2px;">Nachher (Optimiert):</span>
                                    <p style="font-size: 0.82rem; margin: 0; color: var(--text-primary); font-weight: 500;">"${bp.improved}"</p>
                                </div>
                            </div>
                            <div style="background: rgba(99, 102, 241, 0.04); border-left: 2px solid var(--primary); padding: 6px 10px; font-size: 0.76rem; color: var(--text-secondary); margin-top: 4px; border-radius: 0 4px 4px 0;">
                                <strong>Warum:</strong> ${bp.why}
                            </div>
                        </div>
                    `).join('');

                    resultsBox.innerHTML = `
                        <div class="resume-results-scroll" style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: 520px; padding-right: 8px;">
                            <!-- Header Score -->
                            <div style="display: flex; align-items: center; gap: 18px; background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px;">
                                <div class="evaluation-score-badge ${scoreClass}" style="width: 54px; height: 54px; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${result.score}</div>
                                <div>
                                    <h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 2px 0;">Lebenslauf Match-Score</h4>
                                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Übereinstimmung mit ${activeJob.company}-Stellenprofil</span>
                                </div>
                            </div>

                            <!-- Keywords matching/missing -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px;">
                                    <h5 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><i data-lucide="check-circle2" style="width: 14px; height: 14px; color: var(--success);"></i> Gefundene Keywords</h5>
                                    <div class="keyword-tags" style="gap: 4px;">${matchingHtml}</div>
                                </div>
                                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px;">
                                    <h5 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><i data-lucide="alert-circle" style="width: 14px; height: 14px; color: var(--warning);"></i> Fehlende Keywords</h5>
                                    <div class="keyword-tags" style="gap: 4px;">${missingHtml}</div>
                                </div>
                            </div>

                            <!-- Bulletpoint formulations -->
                            <div>
                                <h5 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-primary); font-weight: 700; margin-bottom: 12px;">Formulierungs-Vorschläge</h5>
                                ${bulletPointsHtml}
                            </div>

                            <!-- General Tips -->
                            <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
                                <h5 style="font-size: 0.8rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;"><i data-lucide="info" style="width: 14px; height: 14px;"></i> Strategische Tipps</h5>
                                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">${result.generalTips}</p>
                            </div>
                        </div>
                    `;
                    lucide.createIcons();
                } catch (err) {
                    console.error(err);
                    resultsBox.innerHTML = `
                        <div class="ai-output-box" style="border-color: var(--danger); background: rgba(244,63,94,0.05); color: var(--danger); text-align: center; padding: 24px;">
                            Fehler bei der Analyse: ${err.message}
                        </div>
                    `;
                } finally {
                    btnOptimize.disabled = false;
                    btnOptimize.innerHTML = `<i data-lucide="sparkles"></i> Lebenslauf optimieren`;
                    lucide.createIcons();
                }
            });
        }
    },

    bindAudioEvents(container, profile) {
        // Speech Synthesis: Read question aloud
        container.querySelectorAll('.btn-tts').forEach(btn => {
            btn.addEventListener('click', () => {
                const textToSpeak = decodeURIComponent(btn.getAttribute('data-text'));
                
                if (!('speechSynthesis' in window)) {
                    window.app.showToast('Sprachausgabe wird in diesem Browser leider nicht unterstützt.', 'warning');
                    return;
                }

                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    btn.classList.remove('active');
                    btn.innerHTML = `<i data-lucide="volume-2"></i> Vorlesen`;
                    lucide.createIcons();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'de-DE';
                
                // Toggle active style
                btn.classList.add('active');
                btn.innerHTML = `<i data-lucide="volume-x"></i> Stoppen`;
                lucide.createIcons();
                
                utterance.onend = () => {
                    btn.classList.remove('active');
                    btn.innerHTML = `<i data-lucide="volume-2"></i> Vorlesen`;
                    lucide.createIcons();
                };

                utterance.onerror = () => {
                    btn.classList.remove('active');
                    btn.innerHTML = `<i data-lucide="volume-2"></i> Vorlesen`;
                    lucide.createIcons();
                };

                window.speechSynthesis.speak(utterance);
            });
        });

        // Speech Recognition: STT
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'de-DE';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
        }

        let activeRecognitionQId = null;
        let activeRecBtn = null;

        container.querySelectorAll('.btn-stt').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = btn.getAttribute('data-id');
                const textarea = container.querySelector(`.user-answer-input[data-id="${qId}"]`);
                
                if (!SpeechRecognition) {
                    window.app.showToast('Spracherkennung (Diktieren) wird in diesem Browser nicht unterstützt. Bitte tippe deine Antwort ein.', 'warning');
                    return;
                }

                if (activeRecognitionQId !== null) {
                    recognition.stop();
                    if (activeRecognitionQId === qId) {
                        return; // Toggled off current
                    }
                }

                try {
                    activeRecognitionQId = qId;
                    activeRecBtn = btn;
                    
                    btn.classList.add('recording');
                    btn.innerHTML = `<i data-lucide="mic-off"></i> Stoppen...`;
                    lucide.createIcons();
                    
                    recognition.start();
                    
                    recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        if (textarea.value.trim()) {
                            textarea.value += ' ' + transcript;
                        } else {
                            textarea.value = transcript;
                        }
                    };
                    
                    recognition.onerror = (e) => {
                        console.error(e);
                        window.app.showToast('Fehler bei der Spracherkennung.', 'danger');
                        resetSpeechUI();
                    };
                    
                    recognition.onend = () => {
                        resetSpeechUI();
                    };
                } catch (err) {
                    console.error(err);
                    resetSpeechUI();
                }
            });
        });

        function resetSpeechUI() {
            if (activeRecBtn) {
                activeRecBtn.classList.remove('recording');
                activeRecBtn.innerHTML = `<i data-lucide="mic"></i> Antworten`;
                lucide.createIcons();
            }
            activeRecognitionQId = null;
            activeRecBtn = null;
        }

        // AI feedback evaluator click
        container.querySelectorAll('.btn-evaluate').forEach(btn => {
            btn.addEventListener('click', async () => {
                const qId = btn.getAttribute('data-id');
                const textarea = container.querySelector(`.user-answer-input[data-id="${qId}"]`);
                const resultBox = container.querySelector(`.evaluation-result-box[data-id="${qId}"]`);
                const questionText = container.querySelector(`.question-text[data-id="${qId}"]`).textContent;

                const answer = textarea.value.trim();
                if (!answer) {
                    window.app.showToast('Bitte trage oder spreche zuerst deine Antwort ein.', 'warning');
                    return;
                }

                btn.disabled = true;
                btn.innerHTML = `<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Auswerten...`;
                
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <div class="evaluation-result-card" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div class="ai-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">AI-Coach bewertet Antwort...</span>
                    </div>
                `;

                try {
                    const result = await mockAi.evaluateInterviewAnswer(profile.geminiApiKey, questionText, answer);
                    
                    let scoreColorClass = 'low';
                    if (result.score >= 75) scoreColorClass = 'high';
                    else if (result.score >= 50) scoreColorClass = 'medium';

                    resultBox.innerHTML = `
                        <div class="evaluation-result-card">
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div class="evaluation-score-badge ${scoreColorClass}">${result.score}</div>
                                <div>
                                    <h4 style="font-size: 0.95rem; font-weight:600; margin: 0 0 2px 0; color: var(--text-primary);">AI-Coach Bewertung</h4>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">Ergebnis: ${result.score}/100 Punkte</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; line-height: 1.45;">
                                <div>
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Feedback:</strong>
                                    <p style="color: var(--text-secondary); margin: 0;">${result.feedback}</p>
                                </div>
                                <div style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Verbesserungsvorschläge:</strong>
                                    <p style="color: var(--text-secondary); margin: 0;">${result.suggestions}</p>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.error(err);
                    resultBox.innerHTML = `
                        <div class="evaluation-result-card" style="border-color: var(--danger); background: rgba(244,63,94,0.05);">
                            <span style="font-size: 0.85rem; color: var(--danger);">Fehler bei der Auswertung: ${err.message}</span>
                        </div>
                    `;
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="sparkles"></i> Bewerten`;
                    lucide.createIcons();
                }
            });
        });

        // --- TAB 4: EMAIL WRITER ---
        const btnGenerateEmail = container.querySelector('#btn-generate-email');
        const emailOutputBox = container.querySelector('#ai-email-output');
        const emailTypeSelect = container.querySelector('#email-type');
        const emailToneSelect = container.querySelector('#email-tone');

        if (btnGenerateEmail && emailOutputBox) {
            btnGenerateEmail.addEventListener('click', async () => {
                const type = emailTypeSelect.value;
                const tone = emailToneSelect.value;

                emailOutputBox.innerHTML = `
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Assistent verfasst die E-Mail...</p>
                    </div>
                `;
                btnGenerateEmail.disabled = true;

                try {
                    const text = await mockAi.generateEmail(profile, activeJob, type, tone);
                    emailOutputBox.innerHTML = `
                        <div style="position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" id="btn-tts-email">
                                <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-copy-email">
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Text kopieren
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-save-email-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning);">
                                <i data-lucide="history" style="width: 14px; height: 14px;"></i> In Verlauf speichern
                            </button>
                        </div>
                        <div style="padding-top: 10px; white-space: pre-wrap;">${text}</div>
                    `;
                    lucide.createIcons();

                    document.getElementById('btn-tts-email').addEventListener('click', () => {
                        if (!('speechSynthesis' in window)) {
                            window.app.showToast('Sprachausgabe wird nicht unterstützt.', 'warning');
                            return;
                        }

                        const btn = document.getElementById('btn-tts-email');
                        if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                            return;
                        }

                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'de-DE';
                        btn.innerHTML = `<i data-lucide="volume-x" style="width: 14px; height: 14px;"></i> Stoppen`;
                        lucide.createIcons();

                        utterance.onend = () => {
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                        };
                        utterance.onerror = () => {
                            btn.innerHTML = `<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen`;
                            lucide.createIcons();
                        };
                        window.speechSynthesis.speak(utterance);
                    });

                    document.getElementById('btn-copy-email').addEventListener('click', () => {
                        navigator.clipboard.writeText(text).then(() => {
                            window.app.showToast('In Zwischenablage kopiert!', 'success');
                        }).catch(() => {
                            window.app.showToast('Fehler beim Kopieren.', 'danger');
                        });
                    });

                    const saveLogBtn = document.getElementById('btn-save-email-log');
                    if (saveLogBtn) {
                        saveLogBtn.addEventListener('click', () => {
                            if (!activeJob.communicationLogs) activeJob.communicationLogs = [];
                            
                            const emailSubject = emailTypeSelect.options[emailTypeSelect.selectedIndex].text;
                            
                            activeJob.communicationLogs.push({
                                id: Date.now().toString(),
                                date: new Date().toISOString(),
                                type: 'E-Mail',
                                subject: `Entwurf: ${emailSubject}`,
                                content: text
                            });
                            
                            storage.updateJob(activeJob);
                            window.app.showToast('Entwurf im Kommunikationsverlauf gespeichert!', 'success');
                            saveLogBtn.disabled = true;
                            saveLogBtn.innerHTML = `<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert`;
                            lucide.createIcons();
                        });
                    }
                } catch (err) {
                    console.error(err);
                    emailOutputBox.innerHTML = 'Ein Fehler ist bei der Generierung aufgetreten. Bitte versuche es erneut.';
                } finally {
                    btnGenerateEmail.disabled = false;
                }
            });
        }

        // --- TAB 5: SALARY NEGOTIATION ---
        const startNegBtn = container.querySelector('#btn-start-neg');
        const negOutputBox = container.querySelector('#ai-neg-output');

        if (startNegBtn && negOutputBox) {
            startNegBtn.addEventListener('click', async () => {
                const targetSalaryInput = container.querySelector('#neg-target-salary');
                const minSalaryInput = container.querySelector('#neg-min-salary');
                const personaSelect = container.querySelector('#neg-persona');

                const targetVal = parseFloat(targetSalaryInput.value);
                const minVal = parseFloat(minSalaryInput.value);

                if (isNaN(targetVal) || targetVal <= 0) {
                    window.app.showToast('Bitte gib ein Wunschgehalt an.', 'warning');
                    return;
                }
                if (isNaN(minVal) || minVal <= 0) {
                    window.app.showToast('Bitte gib deine Schmerzgrenze an.', 'warning');
                    return;
                }
                if (minVal > targetVal) {
                    window.app.showToast('Die Schmerzgrenze darf nicht über dem Wunschgehalt liegen.', 'warning');
                    return;
                }

                this.negotiationTargetSalary = targetVal;
                this.negotiationMinSalary = minVal;
                this.negotiationPersona = personaSelect.value;
                this.negotiationHistory = [];

                negOutputBox.innerHTML = `
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Coach bereitet das Gehaltsgespräch vor...</p>
                    </div>
                `;
                startNegBtn.disabled = true;

                try {
                    const apiKey = profile.geminiApiKey;
                    const response = await mockAi.negotiateSalary(
                        apiKey, 
                        activeJob.title, 
                        activeJob.company, 
                        targetVal, 
                        minVal, 
                        personaSelect.value, 
                        [], 
                        "Simulation starten"
                    );

                    this.negotiationHistory.push({ sender: 'recruiter', text: response.text });
                    this.renderNegotiationChat(negOutputBox, activeJob, profile);
                } catch (err) {
                    console.error(err);
                    negOutputBox.innerHTML = 'Ein Fehler ist beim Starten aufgetreten. Bitte versuche es erneut.';
                    startNegBtn.disabled = false;
                }
            });
        }
    },

    renderActiveQuestion(prepOutputBox, activeJob, profile) {
        if (!this.interviewQuestions || this.interviewQuestions.length === 0) return;

        const q = this.interviewQuestions[this.currentQuestionIdx];
        const progress = Math.round(((this.currentQuestionIdx + 1) / this.interviewQuestions.length) * 100);

        prepOutputBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
                <div style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">
                        <span>Gesprächs-Simulation</span>
                        <span>Frage ${this.currentQuestionIdx + 1} von ${this.interviewQuestions.length}</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                        <div style="background: linear-gradient(90deg, var(--secondary), var(--primary)); width: ${progress}%; height: 100%; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div style="background-color: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; position: relative;">
                    <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px;">
                        <span style="background: var(--secondary); color:#fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; margin-top: 1px;">?</span>
                        <h4 class="question-text" style="font-size: 1rem; font-weight: 600; line-height: 1.45; color: var(--text-primary); margin: 0;">${q.question}</h4>
                    </div>
                    
                    <div style="margin-left: 34px;">
                        <textarea class="user-answer-input" placeholder="Deine Antwort hier einsprechen (Mikrofon) oder eintippen..." rows="4" style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); padding: 10px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 12px;"></textarea>
                        
                        <div class="audio-controls-row" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-secondary btn-sm btn-tts" title="Frage vorlesen lassen">
                                <i data-lucide="volume-2"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm btn-stt" title="Spracherkennung über das Mikrofon">
                                <i data-lucide="mic"></i> Antworten
                            </button>
                            <button class="btn btn-primary btn-sm btn-evaluate" style="margin-left: auto; background: linear-gradient(135deg, var(--secondary), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px;">
                                <i data-lucide="sparkles"></i> Antwort abgeben
                            </button>
                        </div>

                        <div class="evaluation-result-box" style="margin-top: 16px; display: none;"></div>

                        <details style="margin-top: 14px; cursor: pointer;">
                            <summary style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); user-select: none;">Spickzettel &amp; Musterantwort anzeigen</summary>
                            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px; padding-left: 12px; border-left: 2px solid var(--border-color);">
                                <div style="background: rgba(99, 102, 241, 0.04); border-left: 2px solid var(--primary); padding: 8px 12px; border-radius: 0 4px 4px 0;">
                                    <span style="display: block; font-size: 0.72rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 2px;">Strategische Empfehlung:</span>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">${q.strategy}</p>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.04); border-left: 2px solid var(--success); padding: 8px 12px; border-radius: 0 4px 4px 0;">
                                    <span style="display: block; font-size: 0.72rem; text-transform: uppercase; color: var(--success); font-weight: 700; margin-bottom: 2px;">Musterantwort:</span>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; font-style: italic; margin: 0;">"${q.sampleAnswer}"</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Bind TTS
        const ttsBtn = prepOutputBox.querySelector('.btn-tts');
        ttsBtn.addEventListener('click', () => {
            if (!('speechSynthesis' in window)) {
                window.app.showToast('Sprachausgabe wird nicht unterstützt.', 'warning');
                return;
            }
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                ttsBtn.innerHTML = `<i data-lucide="volume-2"></i> Vorlesen`;
                lucide.createIcons();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(q.question);
            utterance.lang = 'de-DE';
            ttsBtn.innerHTML = `<i data-lucide="volume-x"></i> Stoppen`;
            lucide.createIcons();
            utterance.onend = () => {
                ttsBtn.innerHTML = `<i data-lucide="volume-2"></i> Vorlesen`;
                lucide.createIcons();
            };
            window.speechSynthesis.speak(utterance);
        });

        // Bind STT
        const sttBtn = prepOutputBox.querySelector('.btn-stt');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'de-DE';
            recognition.interimResults = false;
        }

        sttBtn.addEventListener('click', () => {
            if (!SpeechRecognition) {
                window.app.showToast('Spracherkennung wird nicht unterstützt.', 'warning');
                return;
            }
            if (sttBtn.classList.contains('recording')) {
                recognition.stop();
                return;
            }
            sttBtn.classList.add('recording');
            sttBtn.innerHTML = `<i data-lucide="mic-off"></i> Stoppen...`;
            lucide.createIcons();
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                textarea.value = textarea.value.trim() ? textarea.value + ' ' + transcript : transcript;
            };
            recognition.onerror = () => {
                window.app.showToast('Spracherkennung fehlgeschlagen.', 'danger');
                resetSTT();
            };
            recognition.onend = () => {
                resetSTT();
            };
        });

        const resetSTT = () => {
            sttBtn.classList.remove('recording');
            sttBtn.innerHTML = `<i data-lucide="mic"></i> Antworten`;
            lucide.createIcons();
        };

        // Bind Evaluate
        const evalBtn = prepOutputBox.querySelector('.btn-evaluate');
        const resultBox = prepOutputBox.querySelector('.evaluation-result-box');
        evalBtn.addEventListener('click', async () => {
            const answer = textarea.value.trim();
            if (!answer) {
                window.app.showToast('Bitte trage eine Antwort ein.', 'warning');
                return;
            }

            evalBtn.disabled = true;
            evalBtn.innerHTML = `<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Bewerten...`;
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <div class="evaluation-result-card" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-sm);">
                    <div class="ai-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">AI-Coach bewertet Antwort...</span>
                </div>
            `;

            try {
                const apiKey = profile.geminiApiKey;
                const result = await mockAi.evaluateInterviewAnswer(apiKey, q.question, answer);
                
                this.interviewScores.push({
                    id: q.id,
                    question: q.question,
                    answer: answer,
                    score: result.score,
                    feedback: result.feedback,
                    suggestions: result.suggestions
                });

                let scoreColor = 'low';
                if (result.score >= 75) scoreColor = 'high';
                else if (result.score >= 50) scoreColor = 'medium';

                resultBox.innerHTML = `
                    <div class="evaluation-result-card" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="evaluation-score-badge ${scoreColor}" style="width: 44px; height: 44px; font-size: 1.15rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${result.score}</div>
                            <div>
                                <h4 style="font-size: 0.9rem; font-weight: 600; margin: 0; color: var(--text-primary);">Coach Bewertung</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${result.score} / 100 Punkte</span>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; line-height: 1.45; color: var(--text-secondary);">
                            <p style="margin: 0 0 8px 0;"><strong>Feedback:</strong> ${result.feedback}</p>
                            <p style="margin: 0;"><strong>Vorschlag:</strong> ${result.suggestions}</p>
                        </div>
                    </div>
                `;

                const isLast = this.currentQuestionIdx === this.interviewQuestions.length - 1;
                evalBtn.disabled = false;
                evalBtn.innerHTML = isLast ? `<i data-lucide="award"></i> Ergebnis anzeigen` : `<i data-lucide="arrow-right"></i> Nächste Frage`;
                evalBtn.style.background = 'linear-gradient(135deg, var(--success), var(--primary))';
                lucide.createIcons();

                evalBtn.replaceWith(evalBtn.cloneNode(true));
                const nextBtn = prepOutputBox.querySelector('.btn-evaluate');
                nextBtn.addEventListener('click', () => {
                    if (isLast) {
                        this.renderInterviewScorecard(prepOutputBox, activeJob);
                    } else {
                        this.currentQuestionIdx++;
                        this.renderActiveQuestion(prepOutputBox, activeJob, profile);
                    }
                });
            } catch (err) {
                console.error(err);
                resultBox.innerHTML = `
                    <div class="evaluation-result-card" style="border-color: var(--danger); background: rgba(244,63,94,0.05); color: var(--danger); font-size: 0.85rem; padding: 12px; border-radius: var(--radius-sm);">
                        Fehler bei der Bewertung: ${err.message}
                    </div>
                `;
                evalBtn.disabled = false;
                evalBtn.innerHTML = `<i data-lucide="sparkles"></i> Antwort abgeben`;
                lucide.createIcons();
            }
        });
    },

    renderInterviewScorecard(prepOutputBox, activeJob) {
        const totalScore = this.interviewScores.reduce((sum, s) => sum + s.score, 0);
        const avgScore = Math.round(totalScore / this.interviewScores.length);

        let ratingText = 'Gut vorbereitet';
        let colorClass = 'medium';
        if (avgScore >= 75) {
            ratingText = 'Exzellent vorbereitet! 🎉';
            colorClass = 'high';
        } else if (avgScore < 50) {
            ratingText = 'Mehr Übung empfohlen 💡';
            colorClass = 'low';
        }

        prepOutputBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 24px; text-align: left;">
                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div class="evaluation-score-badge ${colorClass}" style="width: 72px; height: 72px; font-size: 1.6rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${avgScore}</div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Gesamt-Score</span>
                    </div>
                    <div style="flex-grow: 1; min-width: 200px;">
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-primary); font-family: 'Outfit';">Simulation abgeschlossen!</h3>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">Dein Trainingsergebnis für die Position als <strong>${activeJob.title}</strong> bei <strong>${activeJob.company}</strong>.</p>
                        <span style="font-size: 0.85rem; font-weight: 600; color: ${avgScore >= 75 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'};">${ratingText}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" id="btn-save-interview-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning); display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="history"></i> In Verlauf speichern
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-restart-interview" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="rotate-ccw"></i> Neu starten
                        </button>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <h4 style="font-size: 0.95rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 0;">Detaillierte Auswertung</h4>
                    ${this.interviewScores.map((s, idx) => `
                        <details style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; cursor: pointer;">
                            <summary style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 0.88rem; color: var(--text-primary); user-select: none;">
                                <span style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: var(--secondary); color: #fff; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;">${idx + 1}</span>
                                    Frage ${idx + 1}
                                </span>
                                <span class="evaluation-score-badge ${s.score >= 75 ? 'high' : s.score >= 50 ? 'medium' : 'low'}" style="width: 28px; height: 28px; font-size: 0.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-left: auto; margin-right: 12px;">${s.score}</span>
                            </summary>
                            <div style="margin-top: 12px; font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); cursor: default; padding-left: 28px;" onclick="event.stopPropagation()">
                                <p style="margin: 0 0 6px 0;"><strong>Frage:</strong> ${s.question}</p>
                                <p style="margin: 0 0 6px 0; font-style: italic;"><strong>Deine Antwort:</strong> "${s.answer}"</p>
                                <p style="margin: 0 0 6px 0;"><strong>Feedback:</strong> ${s.feedback}</p>
                                <p style="margin: 0;"><strong>Verbesserung:</strong> ${s.suggestions}</p>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();

        prepOutputBox.querySelector('#btn-restart-interview')?.addEventListener('click', () => {
            const prepBtn = document.getElementById('btn-generate-prep');
            if (prepBtn) {
                prepBtn.disabled = false;
                prepBtn.click();
            }
        });

        const saveLogBtn = prepOutputBox.querySelector('#btn-save-interview-log');
        saveLogBtn.addEventListener('click', () => {
            if (!activeJob.communicationLogs) activeJob.communicationLogs = [];

            const logContent = this.interviewScores.map((s, idx) => {
                return `Frage ${idx + 1}: ${s.question}\nAntwort: ${s.answer}\nScore: ${s.score}/100\nFeedback: ${s.feedback}\n`;
            }).join('\n---\n\n');

            activeJob.communicationLogs.push({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'Vor-Ort-Gespräch',
                subject: `Interview-Training (Gesamt: ${avgScore}/100)`,
                content: logContent
            });

            storage.updateJob(activeJob);
            window.app.showToast('Trainingsergebnis im Kommunikationsverlauf gespeichert!', 'success');
            saveLogBtn.disabled = true;
            saveLogBtn.innerHTML = `<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert`;
            lucide.createIcons();
        });
    },

    renderNegotiationChat(negOutputBox, activeJob, profile) {
        const round = Math.floor(this.negotiationHistory.length / 2) + 1; // Round 1, 2, or 3
        const maxRounds = 3;

        negOutputBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
                <!-- Progress Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <span>Verhandlungs-Simulator</span>
                    <span>Runde ${Math.min(round, maxRounds)} von ${maxRounds}</span>
                </div>

                <!-- Chat Messages Area -->
                <div class="negotiation-chat-messages" style="display: flex; flex-direction: column; gap: 12px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
                    ${this.negotiationHistory.map(msg => {
                        const isUser = msg.sender === 'user';
                        return `
                            <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; width: 100%;">
                                <div style="max-width: 80%; background: ${isUser ? 'linear-gradient(135deg, var(--secondary), var(--primary))' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isUser ? 'transparent' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 12px 16px; color: var(--text-primary); font-size: 0.88rem; line-height: 1.45;">
                                    <span style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${isUser ? 'rgba(255,255,255,0.7)' : 'var(--warning)'}; margin-bottom: 4px;">
                                        ${isUser ? 'Deine Antwort' : 'Recruiter'}
                                    </span>
                                    ${msg.text}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- User Counter Form -->
                <div class="negotiation-input-area" style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 8px;">
                    <textarea id="neg-message-input" placeholder="Schreibe deine Argumente / Gegenangebot... (z. B. 'Aufgrund meiner 3 Jahre Erfahrung im Bereich React halte ich ein Gehalt von...')" rows="3" style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); padding: 10px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 12px;"></textarea>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Tipp: Beziehe dich auf deine Skills und die Anforderungen der Stelle.</span>
                        <button class="btn btn-primary btn-sm" id="btn-submit-counter" style="background: linear-gradient(135deg, var(--warning), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px; margin-left: auto;">
                            <i data-lucide="send"></i> Antwort senden
                        </button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Scroll chat to bottom
        const chatMsgs = negOutputBox.querySelector('.negotiation-chat-messages');
        if (chatMsgs) {
            setTimeout(() => {
                chatMsgs.scrollTop = chatMsgs.scrollHeight;
            }, 50);
        }

        // Bind Submit button
        const submitBtn = negOutputBox.querySelector('#btn-submit-counter');
        const msgInput = negOutputBox.querySelector('#neg-message-input');

        submitBtn.addEventListener('click', async () => {
            const userMsg = msgInput.value.trim();
            if (!userMsg) {
                window.app.showToast('Bitte trage ein Angebot oder Argument ein.', 'warning');
                return;
            }

            // Disable UI
            submitBtn.disabled = true;
            msgInput.disabled = true;
            submitBtn.innerHTML = `<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Antwortet...`;

            // Append user message to history
            this.negotiationHistory.push({ sender: 'user', text: userMsg });

            // Re-render immediately to show user bubble
            this.renderNegotiationChat(negOutputBox, activeJob, profile);

            // Fetch recruiter response
            try {
                const apiKey = profile.geminiApiKey;
                const response = await mockAi.negotiateSalary(
                    apiKey,
                    activeJob.title,
                    activeJob.company,
                    this.negotiationTargetSalary,
                    this.negotiationMinSalary,
                    this.negotiationPersona,
                    this.negotiationHistory,
                    userMsg
                );

                this.negotiationHistory.push({ sender: 'recruiter', text: response.text });

                if (response.endNegotiation) {
                    this.renderNegotiationScorecard(negOutputBox, activeJob, response);
                } else {
                    this.renderNegotiationChat(negOutputBox, activeJob, profile);
                }
            } catch (err) {
                console.error(err);
                window.app.showToast('Fehler bei der Antwort-Generierung.', 'danger');
                this.renderNegotiationChat(negOutputBox, activeJob, profile);
            }
        });
    },

    renderNegotiationScorecard(negOutputBox, activeJob, finalResult) {
        const rating = finalResult.rating || 50;
        const finalSalary = finalResult.finalSalary || this.negotiationMinSalary;

        let ratingText = 'Verhandlung erfolgreich abgeschlossen';
        let colorClass = 'medium';
        if (rating >= 75) {
            ratingText = 'Exzellente Verhandlungsführung! 💰';
            colorClass = 'high';
        } else if (rating < 50) {
            ratingText = 'Ausbaufähiges Verhandlungsgeschick 💡';
            colorClass = 'low';
        }

        negOutputBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 24px; text-align: left;">
                <!-- Performance Card -->
                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div class="evaluation-score-badge ${colorClass}" style="width: 72px; height: 72px; font-size: 1.6rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${rating}</div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Geschick-Score</span>
                    </div>
                    <div style="flex-grow: 1; min-width: 200px;">
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-primary); font-family: 'Outfit';">Verhandlung beendet!</h3>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">Ergebnis der Verhandlung für die Position als <strong>${activeJob.title}</strong>.</p>
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--success); margin-bottom: 6px;">
                            Erzieltes Gehalt: ${finalSalary.toLocaleString('de-DE')} € / Jahr
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">${ratingText}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" id="btn-save-neg-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning); display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="history"></i> In Verlauf speichern
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-restart-neg" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="rotate-ccw"></i> Neu starten
                        </button>
                    </div>
                </div>

                <!-- Recruiter Feedback -->
                <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 0 0 10px 0;">Recruiter Feedback</h4>
                    <p style="font-size: 0.88rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">${finalResult.feedback || 'Gute Arbeit! Die Verhandlung wurde erfolgreich abgeschlossen.'}</p>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Bind Save to Log
        const saveLogBtn = negOutputBox.querySelector('#btn-save-neg-log');
        saveLogBtn.addEventListener('click', () => {
            if (!activeJob.communicationLogs) activeJob.communicationLogs = [];

            const logContent = `Erzieltes Gehalt: ${finalSalary.toLocaleString('de-DE')} €\nScore: ${rating}/100\nFeedback: ${finalResult.feedback}\n\nVerlauf:\n` + 
                this.negotiationHistory.map(h => `${h.sender === 'user' ? 'Kandidat' : 'Recruiter'}: ${h.text}`).join('\n');

            activeJob.communicationLogs.push({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'Sonstiges',
                subject: `Gehaltsverhandlung (Ergebnis: ${finalSalary.toLocaleString('de-DE')} €)`,
                content: logContent
            });

            activeJob.salary = finalSalary;

            storage.updateJob(activeJob);
            window.app.showToast('Verhandlungsergebnis im Kommunikationsverlauf gespeichert!', 'success');
            saveLogBtn.disabled = true;
            saveLogBtn.innerHTML = `<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert`;
            lucide.createIcons();
        });

        // Bind Restart
        negOutputBox.querySelector('#btn-restart-neg')?.addEventListener('click', () => {
            const startBtn = document.getElementById('btn-start-neg');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.click();
            }
        });
    }
};
