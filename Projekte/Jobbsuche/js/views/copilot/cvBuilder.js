/**
 * CV Builder Submodule
 * Allows users to interactively build, customize, AI-optimize and export their professional CV.
 */
import { storage } from '../../storage.js';
import { printCurriculumVitae } from '../../utils/cvExport.js';
import { geminiApi } from '../../utils/geminiApi.js';

export const cvBuilder = {
    selectedTemplate: 'modern',

    render(container, job, profile) {
        const cvData = profile.cvStructured || this.getDefaultCvData(profile);

        container.innerHTML = `
            <div class="cv-builder-container">
                <div class="flex-between align-center" style="margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="award"></i> Interaktiver Lebenslauf-Builder</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 4px;">
                            Erstelle und exportiere deinen professionellen Lebenslauf als PDF &ndash; abgestimmt auf ${job ? `"${job.title}"` : 'dein Profil'}.
                        </p>
                    </div>
                    <div class="flex-row gap-8 align-center">
                        <select id="cv-template-select" class="form-input" style="padding: 6px 12px; width: auto;">
                            <option value="modern" ${this.selectedTemplate === 'modern' ? 'selected' : ''}>Layout: Modern Tech</option>
                            <option value="classic" ${this.selectedTemplate === 'classic' ? 'selected' : ''}>Layout: Classic Executive</option>
                            <option value="minimalist" ${this.selectedTemplate === 'minimalist' ? 'selected' : ''}>Layout: Minimalist</option>
                        </select>
                        <button class="btn btn-primary" id="btn-export-cv-pdf">
                            <i data-lucide="printer"></i> Lebenslauf drucken / PDF
                        </button>
                    </div>
                </div>

                <div class="cv-builder-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Left: Form Editor -->
                    <div class="glass-card" style="padding: 20px; max-height: 650px; overflow-y: auto;">
                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="user"></i> 1. Persönliche Angaben
                        </h4>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Vollständiger Name</label>
                            <input type="text" id="cv-input-name" class="form-input" value="${cvData.name || profile.name || ''}">
                        </div>
                        <div class="flex-row gap-12" style="margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <label style="font-size: 0.85rem; font-weight: 600;">Berufsbezeichnung / Zielrolle</label>
                                <input type="text" id="cv-input-title" class="form-input" value="${cvData.title || profile.title || ''}">
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 0.85rem; font-weight: 600;">E-Mail &amp; Telefon</label>
                                <input type="text" id="cv-input-contact" class="form-input" value="${cvData.contact || 'alex.neumann@example.com | +49 170 1234567'}">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Kurzprofil / Über mich</label>
                            <textarea id="cv-input-summary" rows="3" class="form-input">${cvData.summary || 'Erfahrener Softwareentwickler mit Leidenschaft für moderne Webtechnologien, skalierbare Architekturen und erstklassige User Experiences.'}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="briefcase"></i> 2. Berufserfahrung (Chronologisch)
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Stationen &amp; Erfolge (Zeilenweise mit '- ')</label>
                            <textarea id="cv-input-experience" rows="6" class="form-input">${cvData.experience || profile.experience || ''}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="graduation-cap"></i> 3. Ausbildung &amp; Studium
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <textarea id="cv-input-education" rows="3" class="form-input">${cvData.education || '2018 - 2022: B.Sc. Angewandte Informatik, TU München\n2015 - 2018: Allgemeine Hochschulreife'}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="code"></i> 4. Kernkompetenzen (Skills)
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="text" id="cv-input-skills" class="form-input" value="${(cvData.skills || profile.skills || []).join(', ')}" placeholder="Kommagetrennte Liste (z.B. React, TypeScript, Git, Docker)">
                        </div>

                        <div class="flex-row gap-8">
                            <button class="btn btn-secondary btn-sm" id="btn-save-cv-structure">
                                <i data-lucide="save"></i> Im Profil speichern
                            </button>
                            ${job ? `
                                <button class="btn btn-secondary btn-sm" id="btn-ai-tailor-cv">
                                    <i data-lucide="sparkles"></i> Per KI auf "${job.company}" zuschneiden
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Right: Live Preview -->
                    <div class="glass-card" style="padding: 24px; background: #ffffff; color: #1e293b; border-radius: var(--radius-lg); max-height: 650px; overflow-y: auto;">
                        <div id="cv-live-preview-box">
                            ${this.generatePreviewHtml(cvData, this.selectedTemplate)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    getDefaultCvData(profile) {
        return {
            name: profile.name || 'Alex Neumann',
            title: profile.title || 'Frontend Developer',
            contact: 'alex.neumann@example.com | +49 170 1234567 | München',
            summary: 'Erfahrener Softwareentwickler mit Leidenschaft für intuitive Webapplikationen, Clean Code und agile Methoden.',
            experience: profile.experience || '- 2023 - Heute: Senior Web Developer bei TechVision AG\n- 2021 - 2023: Frontend Developer bei Global Commerce GmbH\n- 2019 - 2021: Junior Web Engineer bei Agency Alpha',
            education: '2016 - 2020: B.Sc. Informatik (Hochschule München)',
            skills: profile.skills || ['JavaScript', 'React', 'TypeScript', 'CSS Grid', 'Git']
        };
    },

    generatePreviewHtml(data, template) {
        const skills = Array.isArray(data.skills) ? data.skills : (data.skills || '').split(',').map(s => s.trim()).filter(Boolean);
        const expItems = (data.experience || '').split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^-\s*/, '')}</li>`).join('');
        const eduItems = (data.education || '').split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^-\s*/, '')}</li>`).join('');

        return `
            <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.5; color: #334155;">
                <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
                    <h2 style="font-size: 18px; margin: 0; color: #0f172a; font-weight: 700;">${data.name}</h2>
                    <div style="color: #0284c7; font-weight: 600; font-size: 13px; margin: 2px 0;">${data.title}</div>
                    <div style="color: #64748b; font-size: 10px;">${data.contact}</div>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Profil</h4>
                    <p style="margin: 0; color: #475569;">${data.summary}</p>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Berufserfahrung</h4>
                    <ul style="margin: 4px 0 0 16px; padding: 0; color: #475569;">${expItems}</ul>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Ausbildung</h4>
                    <ul style="margin: 4px 0 0 16px; padding: 0; color: #475569;">${eduItems}</ul>
                </div>

                <div>
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Kenntnisse &amp; Skills</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                        ${skills.map(s => `<span style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500;">${s}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents(container, job, profile) {
        const updatePreview = () => {
            const data = this.getFormData(container);
            const previewBox = container.querySelector('#cv-live-preview-box');
            if (previewBox) {
                previewBox.innerHTML = this.generatePreviewHtml(data, this.selectedTemplate);
            }
        };

        container.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        const templateSelect = container.querySelector('#cv-template-select');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.selectedTemplate = e.target.value;
                updatePreview();
            });
        }

        const saveBtn = container.querySelector('#btn-save-cv-structure');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const data = this.getFormData(container);
                profile.cvStructured = data;
                profile.name = data.name;
                profile.title = data.title;
                profile.experience = data.experience;
                profile.skills = data.skills;
                storage.saveProfile(profile);
                saveBtn.textContent = 'Gespeichert!';
                setTimeout(() => { saveBtn.innerHTML = `<i data-lucide="save"></i> Im Profil speichern`; if (window.lucide) lucide.createIcons(); }, 2000);
            });
        }

        const printBtn = container.querySelector('#btn-export-cv-pdf');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const data = this.getFormData(container);
                printCurriculumVitae({
                    ...profile,
                    ...data
                }, this.selectedTemplate);
            });
        }

        const tailorBtn = container.querySelector('#btn-ai-tailor-cv');
        if (tailorBtn && job) {
            tailorBtn.addEventListener('click', async () => {
                tailorBtn.disabled = true;
                tailorBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Optimiere mit KI...`;
                if (window.lucide) lucide.createIcons();

                const summaryInput = container.querySelector('#cv-input-summary');
                const expInput = container.querySelector('#cv-input-experience');

                const prompt = `Passe das folgende Kurzprofil und die Berufserfahrung subtil und professionell für die Bewerbung als "${job.title}" bei "${job.company}" an. Hebe relevante Schlagworte hervor.\n\nAktuelles Profil:\n${summaryInput.value}\n\nAktuelle Erfahrung:\n${expInput.value}\n\nAntworte im Format:\nZUSAMMENFASSUNG: [text]\nERFAHRUNG: [text]`;
                
                try {
                    let res = '';
                    if (geminiApi.hasApiKey()) {
                        res = await geminiApi.generateText(prompt, 'Du bist ein professioneller Bewerbungscoach.');
                    } else {
                        res = `ZUSAMMENFASSUNG: Zielstrebiger ${job.title} mit tiefem Verständnis für moderne Architekturen, skalierbare Webprojekte und cross-funktionale Zusammenarbeit bei ${job.company}.\nERFAHRUNG:\n- Fokus auf Performance-Optimierung und agile Code-Reviews passend für ${job.title}\n${expInput.value}`;
                    }

                    if (res.includes('ZUSAMMENFASSUNG:') && res.includes('ERFAHRUNG:')) {
                        const parts = res.split('ERFAHRUNG:');
                        summaryInput.value = parts[0].replace('ZUSAMMENFASSUNG:', '').trim();
                        expInput.value = parts[1].trim();
                    }
                    updatePreview();
                } catch (e) {
                    console.error('Tailor error:', e);
                } finally {
                    tailorBtn.disabled = false;
                    tailorBtn.innerHTML = `<i data-lucide="sparkles"></i> Per KI auf "${job.company}" zuschneiden`;
                    if (window.lucide) lucide.createIcons();
                }
            });
        }
    },

    getFormData(container) {
        const skillsRaw = container.querySelector('#cv-input-skills')?.value || '';
        const skillsArr = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);

        return {
            name: container.querySelector('#cv-input-name')?.value || '',
            title: container.querySelector('#cv-input-title')?.value || '',
            contact: container.querySelector('#cv-input-contact')?.value || '',
            summary: container.querySelector('#cv-input-summary')?.value || '',
            experience: container.querySelector('#cv-input-experience')?.value || '',
            education: container.querySelector('#cv-input-education')?.value || '',
            skills: skillsArr
        };
    }
};
