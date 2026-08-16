/**
 * Outreach & LinkedIn Message Generator Submodule
 * Generates short, high-conversion networking pitches & InMail templates for LinkedIn and Xing.
 */
import { geminiApi } from '../../utils/geminiApi.js';

export const outreachGen = {
    selectedType: 'recruiter_direct',

    render(container, job, profile) {
        container.innerHTML = `
            <div class="outreach-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="send"></i> LinkedIn &amp; Xing Direktnachrichten-Generator</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Prägnante, hochgradig konvertierende Networking-Nachrichten für Recruiter &amp; Teamleiter
                        </p>
                    </div>
                    <select id="outreach-type-select" class="form-input" style="padding: 6px 12px; width: auto;">
                        <option value="recruiter_direct" ${this.selectedType === 'recruiter_direct' ? 'selected' : ''}>Nachricht an Recruiter (nach Bewerbung)</option>
                        <option value="cold_pitch" ${this.selectedType === 'cold_pitch' ? 'selected' : ''}>Initiativer Pitch an Teamleiter</option>
                        <option value="connect_note" ${this.selectedType === 'connect_note' ? 'selected' : ''}>Vernetzungsanfrage (max. 300 Zeichen)</option>
                        <option value="headhunter_reply" ${this.selectedType === 'headhunter_reply' ? 'selected' : ''}>Antwort auf Headhunter-InMail</option>
                    </select>
                </div>

                <div class="glass-card" style="padding: 20px;">
                    <div class="flex-between align-center" style="margin-bottom: 8px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Nachrichtentext:</label>
                        <span id="outreach-char-count" class="text-secondary" style="font-size: 0.8rem;">0 Zeichen</span>
                    </div>

                    <textarea id="outreach-text-output" rows="6" class="form-input" style="font-family: inherit; font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">${this.getDefaultMessage(this.selectedType, job, profile)}</textarea>

                    <div class="flex-between align-center">
                        <button class="btn btn-secondary" id="btn-ai-shorten-pitch">
                            <i data-lucide="sparkles"></i> Per KI auf den Punkt bringen
                        </button>
                        <div class="flex-row gap-8">
                            <button class="btn btn-primary" id="btn-copy-outreach">
                                <i data-lucide="copy"></i> In Zwischenablage kopieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
        this.updateCharCount(container);
    },

    getDefaultMessage(type, job, profile) {
        const title = job ? job.title : 'Frontend Developer';
        const company = job ? job.company : 'Ihrem Unternehmen';
        const name = profile.name || 'Alex Neumann';
        const topSkill = (profile.skills || [])[0] || 'Webentwicklung';

        switch (type) {
            case 'recruiter_direct':
                return `Hallo [Name],\n\nich habe mich soeben auf die Stelle als ${title} bei ${company} beworben. Da ich mehrjährige Erfahrung mit ${topSkill} mitbringe und mich eure Projekte sehr begeistern, wollte ich mich auch hier kurz persönlich vernetzen.\n\nIch freue mich auf einen Austausch!\n\nBeste Grüße,\n${name}`;

            case 'cold_pitch':
                return `Hallo [Name],\n\nich verfolge die Entwicklung von ${company} schon länger mit großem Interesse. Als ${profile.title || 'Entwickler'} mit Fokus auf ${topSkill} unterstütze ich Teams dabei, moderne Architekturen effizient umzusetzen. Habt ihr aktuell Bedarf an Verstärkung in eurem Tech-Team?\n\nHerzliche Grüße,\n${name}`;

            case 'connect_note':
                return `Hallo [Name], ich bin ${name} (${title}). Ich verfolge die Tech-Arbeit bei ${company} sehr gerne und würde mich freuen, mein berufliches Netzwerk mit Ihnen zu erweitern!`;

            case 'headhunter_reply':
                return `Hallo [Name],\n\nvielen Dank für die Kontaktaufnahme und das spannende Angebot als ${title}! Die Position klingt sehr interessant, insbesondere im Hinblick auf ${topSkill}. Ich würde mich über ein kurzes 15-minütiges Kennenlerngespräch freuen.\n\nViele Grüße,\n${name}`;

            default:
                return `Hallo [Name],\n\nvielen Dank für den Austausch!\n\nBeste Grüße,\n${name}`;
        }
    },

    updateCharCount(container) {
        const text = container.querySelector('#outreach-text-output')?.value || '';
        const countEl = container.querySelector('#outreach-char-count');
        if (countEl) {
            countEl.textContent = `${text.length} Zeichen ${text.length <= 300 ? '(Perfekt für LinkedIn-Notiz)' : ''}`;
        }
    },

    bindEvents(container, job, profile) {
        const select = container.querySelector('#outreach-type-select');
        const textarea = container.querySelector('#outreach-text-output');

        if (select && textarea) {
            select.addEventListener('change', (e) => {
                this.selectedType = e.target.value;
                textarea.value = this.getDefaultMessage(this.selectedType, job, profile);
                this.updateCharCount(container);
            });
        }

        if (textarea) {
            textarea.addEventListener('input', () => this.updateCharCount(container));
        }

        const copyBtn = container.querySelector('#btn-copy-outreach');
        if (copyBtn && textarea) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(textarea.value);
                copyBtn.textContent = 'Kopiert!';
                setTimeout(() => {
                    copyBtn.innerHTML = `<i data-lucide="copy"></i> In Zwischenablage kopieren`;
                    if (window.lucide) lucide.createIcons();
                }, 2000);
            });
        }

        const aiBtn = container.querySelector('#btn-ai-shorten-pitch');
        if (aiBtn && textarea) {
            aiBtn.addEventListener('click', async () => {
                aiBtn.disabled = true;
                aiBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Optimiere...`;
                if (window.lucide) lucide.createIcons();

                const prompt = `Kürze und optimiere folgende LinkedIn-Nachricht, sodass sie maximal sympathisch, professionell und unter 300 Zeichen lang ist:\n\n${textarea.value}`;

                try {
                    let refined = '';
                    if (geminiApi.hasApiKey()) {
                        refined = await geminiApi.generateText(prompt, 'Du bist ein Experte für LinkedIn Networking und Social Recruiting.');
                    } else {
                        refined = textarea.value.replace(/\n\n/g, ' ').slice(0, 280);
                    }
                    textarea.value = refined;
                    this.updateCharCount(container);
                } catch (e) {
                    console.error(e);
                } finally {
                    aiBtn.disabled = false;
                    aiBtn.innerHTML = `<i data-lucide="sparkles"></i> Per KI auf den Punkt bringen`;
                    if (window.lucide) lucide.createIcons();
                }
            });
        }
    }
};
