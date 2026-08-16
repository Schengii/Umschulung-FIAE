/**
 * Email Suite Submodule
 * Generates tailored post-interview thank you notes, follow-ups, salary counter-offers
 * and polite offer rejections with 1-click mailto: dispatch.
 */
import { geminiApi } from '../../utils/geminiApi.js';

export const emailSuite = {
    selectedTemplate: 'thank_you',

    render(container, job, profile) {
        container.innerHTML = `
            <div class="email-suite-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="mail"></i> Intelligente E-Mail-Suite &amp; Vorlagen</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Professionelle E-Mails für jeden Schritt des Bewerbungsprozesses bei "${job ? job.company : 'Unternehmen'}"
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <select id="email-template-select" class="form-input" style="padding: 6px 12px; width: auto;">
                            <option value="thank_you" ${this.selectedTemplate === 'thank_you' ? 'selected' : ''}>Dankschreiben nach Interview</option>
                            <option value="follow_up" ${this.selectedTemplate === 'follow_up' ? 'selected' : ''}>Status-Nachfrage (Follow-up)</option>
                            <option value="salary_counter" ${this.selectedTemplate === 'salary_counter' ? 'selected' : ''}>Gehalts-Gegenangebot</option>
                            <option value="decline_offer" ${this.selectedTemplate === 'decline_offer' ? 'selected' : ''}>Höfliche Absage an Firma</option>
                        </select>
                    </div>
                </div>

                <div class="glass-card" style="padding: 20px; margin-bottom: 16px;">
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Empfänger-E-Mail (Ansprechpartner)</label>
                        <input type="email" id="email-recipient" class="form-input" placeholder="z.B. hr@${(job?.company || 'firma').toLowerCase().replace(/\s+/g, '')}.de" value="${job?.contactEmail || ''}">
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Betreffzeile</label>
                        <input type="text" id="email-subject" class="form-input" value="${this.getDefaultSubject(this.selectedTemplate, job, profile)}">
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Nachrichtentext</label>
                        <textarea id="email-body-text" rows="10" class="form-input" style="font-family: inherit; font-size: 0.9rem; line-height: 1.5;">${this.getDefaultBody(this.selectedTemplate, job, profile)}</textarea>
                    </div>

                    <div class="flex-between align-center">
                        <button class="btn btn-secondary" id="btn-ai-enhance-email">
                            <i data-lucide="sparkles"></i> Per KI personalisieren
                        </button>
                        <div class="flex-row gap-8">
                            <button class="btn btn-secondary" id="btn-copy-email-body">
                                <i data-lucide="copy"></i> Text kopieren
                            </button>
                            <button class="btn btn-primary" id="btn-open-mailto">
                                <i data-lucide="send"></i> Im E-Mail-Programm öffnen (mailto:)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    getDefaultSubject(type, job, profile) {
        const title = job ? job.title : 'Bewerbung';
        const company = job ? job.company : 'Unternehmen';
        const name = profile.name || 'Bewerber';

        switch (type) {
            case 'thank_you':
                return `Vielen Dank für das angenehme Gespräch – Bewerbung als ${title}`;
            case 'follow_up':
                return `Kurze Nachfrage zum Stand meiner Bewerbung als ${title} (${name})`;
            case 'salary_counter':
                return `Rückmeldung zum Vertragsangebot – ${title} (${name})`;
            case 'decline_offer':
                return `Bewerbung als ${title} – Vielen Dank für das Angebot`;
            default:
                return `Bewerbung als ${title} – ${name}`;
        }
    },

    getDefaultBody(type, job, profile) {
        const title = job ? job.title : 'die offene Position';
        const company = job ? job.company : 'Ihrem Unternehmen';
        const name = profile.name || 'Alex Neumann';

        switch (type) {
            case 'thank_you':
                return `Sehr geehrte Damen und Herren,\n\nvielen Dank für das sehr sympathische und informative Gespräch am gestrigen Tag über die Position als ${title} bei ${company}.\n\nDer Einblick in Ihre aktuellen Projekte und die offene Teamkultur haben meinen Wunsch, Ihr Team tatkräftig zu unterstützen, nochmals bekräftigt. Besonders die Herausforderungen im Bereich moderner Technologien passen ideal zu meinen Erfahrungen.\n\nIch freue mich auf Ihre Rückmeldung zum weiteren Ablauf.\n\nHerzliche Grüße,\n${name}`;

            case 'follow_up':
                return `Sehr geehrte Damen und Herren,\n\nich hoffe, Sie hatten eine erfolgreiche Woche.\n\nVor zwei Wochen hatte ich meine Bewerbungsunterlagen für die Stelle als ${title} bei ${company} eingereicht (bzw. führten wir unser Erstgespräch). Da mir die Position und Ihre Unternehmenskultur sehr zusagen, möchte ich mich kurz nach dem aktuellen Stand des Auswahlprozesses erkundigen.\n\nSollten Sie noch zusätzliche Unterlagen oder Referenzen von mir benötigen, stehe ich Ihnen jederzeit gerne zur Verfügung.\n\nBeste Grüße,\n${name}`;

            case 'salary_counter':
                return `Sehr geehrte Damen und Herren,\n\nvielen Dank für das attraktive Angebot und das entgegengebrachte Vertrauen. Ich freue mich sehr über die Aussicht, als ${title} bei ${company} zu starten.\n\nNach eingehender Prüfung der Rahmenbedingungen und im Abgleich mit meinen Erfahrungen sowie dem Marktstandard möchte ich anfragen, ob wir beim Grundgehalt einen Rahmen von ${(job?.salary || 70000).toLocaleString('de-DE')} € brutto/Jahr vereinbaren können.\n\nIch bin zuversichtlich, dass wir eine für beide Seiten hervorragende Einigung finden werden, und freue mich auf ein kurzes Telefonat dazu.\n\nMit freundlichen Grüßen,\n${name}`;

            case 'decline_offer':
                return `Sehr geehrte Damen und Herren,\n\nvielen Dank für das Angebot und die Zeit, die Sie sich in den vergangenen Gesprächen für mich genommen haben. Die Einblicke in ${company} waren überaus positiv.\n\nNach reiflicher Überlegung habe ich mich jedoch entschieden, ein anderes Angebot anzunehmen, das noch etwas spezifischer zu meiner langfristigen Spezialisierung passt.\n\nIch wünsche Ihnen und dem Team weiterhin viel Erfolg und alles Gute.\n\nBeste Grüße,\n${name}`;

            default:
                return `Sehr geehrte Damen und Herren,\n\nvielen Dank für den Austausch.\n\nMit freundlichen Grüßen,\n${name}`;
        }
    },

    bindEvents(container, job, profile) {
        const select = container.querySelector('#email-template-select');
        const subjectInput = container.querySelector('#email-subject');
        const bodyTextarea = container.querySelector('#email-body-text');

        if (select) {
            select.addEventListener('change', (e) => {
                this.selectedTemplate = e.target.value;
                subjectInput.value = this.getDefaultSubject(this.selectedTemplate, job, profile);
                bodyTextarea.value = this.getDefaultBody(this.selectedTemplate, job, profile);
            });
        }

        const copyBtn = container.querySelector('#btn-copy-email-body');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(bodyTextarea.value);
                copyBtn.textContent = 'Kopiert!';
                setTimeout(() => {
                    copyBtn.innerHTML = `<i data-lucide="copy"></i> Text kopieren`;
                    if (window.lucide) lucide.createIcons();
                }, 2000);
            });
        }

        const mailtoBtn = container.querySelector('#btn-open-mailto');
        if (mailtoBtn) {
            mailtoBtn.addEventListener('click', () => {
                const recipient = container.querySelector('#email-recipient')?.value.trim() || '';
                const subject = encodeURIComponent(subjectInput.value);
                const body = encodeURIComponent(bodyTextarea.value);
                const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
                window.location.href = mailtoUrl;
            });
        }

        const aiBtn = container.querySelector('#btn-ai-enhance-email');
        if (aiBtn) {
            aiBtn.addEventListener('click', async () => {
                aiBtn.disabled = true;
                aiBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Verfeinere E-Mail...`;
                if (window.lucide) lucide.createIcons();

                const prompt = `Formuliere die folgende E-Mail (${this.selectedTemplate}) für die Bewerbung als "${job?.title}" bei "${job?.company}" noch eleganter, überzeugender und persönlicher. Halte den Ton professionell und sympathisch:\n\n${bodyTextarea.value}`;

                try {
                    let refined = '';
                    if (geminiApi.hasApiKey()) {
                        refined = await geminiApi.generateText(prompt, 'Du bist ein professioneller Bewerbungs- und Kommunikationsexperte.');
                    } else {
                        refined = bodyTextarea.value + `\n\nP.S.: Ich habe mit großem Interesse Ihre jüngsten Meilensteine bei ${job?.company || 'Ihrem Unternehmen'} verfolgt und freue mich auf die Zusammenarbeit!`;
                    }
                    bodyTextarea.value = refined;
                } catch (e) {
                    console.error('Email refinement error:', e);
                } finally {
                    aiBtn.disabled = false;
                    aiBtn.innerHTML = `<i data-lucide="sparkles"></i> Per KI personalisieren`;
                    if (window.lucide) lucide.createIcons();
                }
            });
        }
    }
};
