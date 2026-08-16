/**
 * AI Mentor & Negotiation Sparring Partner Submodule
 * Provides interactive multi-turn coaching, roleplay and real-time response feedback.
 */
import { geminiApi } from '../../utils/geminiApi.js';

export const aiMentor = {
    messages: [],
    mode: 'interview', // 'interview' | 'negotiation' | 'career'

    init(job, profile) {
        this.messages = [
            {
                role: 'assistant',
                text: `Hallo ${profile.name || ''}! Ich bin dein persönlicher KI-Karrierecoach & Verhandlungspartner. Wir können ein freies Vorstellungsgespräch für **"${job.title}"** bei **"${job.company}"** simulieren oder eine anspruchsvolle Gehaltsverhandlung üben. Wie möchtest du starten?`
            }
        ];
    },

    render(container, job, profile) {
        if (this.messages.length === 0) {
            this.init(job, profile);
        }

        container.innerHTML = `
            <div class="ai-mentor-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="bot"></i> KI-Mentor &amp; Sparringspartner</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Interaktives Echtzeit-Coaching für Bewerbungsgespräche und Gehaltsverhandlungen
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm ${this.mode === 'interview' ? 'active' : ''}" id="btn-mode-interview">
                            <i data-lucide="user-check"></i> Interview-Training
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.mode === 'negotiation' ? 'active' : ''}" id="btn-mode-negotiation">
                            <i data-lucide="dollar-sign"></i> Gehalts-Sparring
                        </button>
                        <button class="btn btn-secondary btn-sm" id="btn-reset-chat" title="Chat zurücksetzen">
                            <i data-lucide="rotate-ccw"></i>
                        </button>
                    </div>
                </div>

                <div class="mentor-chat-history glass-card" style="padding: 16px; min-height: 380px; max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; background: rgba(0,0,0,0.15);">
                    ${this.messages.map(m => `
                        <div style="display: flex; gap: 10px; align-self: ${m.role === 'user' ? 'flex-end' : 'flex-start'}; max-width: 82%;">
                            ${m.role === 'assistant' ? `
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
                                    <i data-lucide="bot" style="width: 18px; height: 18px;"></i>
                                </div>
                            ` : ''}
                            <div class="glass-card" style="padding: 12px 16px; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; ${m.role === 'user' ? 'background: var(--color-primary); color: #ffffff;' : 'background: var(--card-bg); border-left: 3px solid var(--color-primary);'}">
                                ${this.formatMessageText(m.text)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <form id="mentor-chat-form" style="display: flex; gap: 10px;">
                    <input type="text" id="mentor-chat-input" class="form-input" style="flex: 1;" placeholder="Schreibe deine Antwort oder Frage..." autocomplete="off">
                    <button type="submit" class="btn btn-primary" id="btn-send-mentor">
                        <i data-lucide="send"></i> Senden
                    </button>
                </form>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.scrollToBottom(container);
        this.bindEvents(container, job, profile);
    },

    formatMessageText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    },

    scrollToBottom(container) {
        const history = container.querySelector('.mentor-chat-history');
        if (history) {
            history.scrollTop = history.scrollHeight;
        }
    },

    bindEvents(container, job, profile) {
        const form = container.querySelector('#mentor-chat-form');
        const input = container.querySelector('#mentor-chat-input');
        const sendBtn = container.querySelector('#btn-send-mentor');

        if (form && input) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userText = input.value.trim();
                if (!userText) return;

                this.messages.push({ role: 'user', text: userText });
                input.value = '';
                this.render(container, job, profile);

                // Assistant response
                sendBtn.disabled = true;
                const assistantMsg = { role: 'assistant', text: 'Analysiere Antwort...' };
                this.messages.push(assistantMsg);
                this.render(container, job, profile);

                const responseText = await this.generateAiResponse(userText, job, profile);
                assistantMsg.text = responseText;
                sendBtn.disabled = false;
                this.render(container, job, profile);
            });
        }

        container.querySelector('#btn-mode-interview')?.addEventListener('click', () => {
            this.mode = 'interview';
            this.messages.push({
                role: 'assistant',
                text: `🎯 **Interview-Modus aktiviert:** Stellen wir uns vor, das Vorstellungsgespräch für **${job.title}** beginnt jetzt.\n\n*Frage: "Erzählen Sie uns kurz von sich und warum Sie der/die ideale Kandidat(in) für diese Position bei ${job.company} sind?"*`
            });
            this.render(container, job, profile);
        });

        container.querySelector('#btn-mode-negotiation')?.addEventListener('click', () => {
            this.mode = 'negotiation';
            this.messages.push({
                role: 'assistant',
                text: `💼 **Gehalts-Sparring aktiviert:** Wir befinden uns in der finalen Angebotsphase für **${job.title}**.\n\n*HR-Manager: "Herr/Frau ${profile.name || 'Bewerber'}, wir möchten Ihnen die Stelle sehr gerne anbieten. Unser Standard-Budget für diese Position liegt bei ${Math.round((job.salary || 65000) * 0.9).toLocaleString('de-DE')} € brutto im Jahr. Wie stehen Sie dazu?"*`
            });
            this.render(container, job, profile);
        });

        container.querySelector('#btn-reset-chat')?.addEventListener('click', () => {
            this.init(job, profile);
            this.render(container, job, profile);
        });
    },

    async generateAiResponse(userMessage, job, profile) {
        const systemPrompt = `Du bist ein erfahrener Bewerbungs- und Karrierecoach sowie HR-Verhandlungsexperte.
Der Bewerber bewirbt sich als "${job.title}" bei "${job.company}".
Das Anforderungsprofil: ${job.description || ''}.
Profil des Bewerbers: Skills [${(profile.skills || []).join(', ')}], Erfahrung: ${profile.experience || ''}.
Aktueller Modus: ${this.mode === 'negotiation' ? 'Gehaltsverhandlung (spiele einen fordernden, aber fairen HR-Verhandlungspartner)' : 'Bewerbungsgespräch'}.

Gib prägnantes Feedback zur letzten Antwort des Nutzers (1-2 Sätze Lob/Verbesserung) und führe das Gespräch dann direkt mit einer spannenden Folgefrage oder Gegenreaktion weiter. Halte die Antworten motivierend und professionell.`;

        if (geminiApi.hasApiKey()) {
            try {
                return await geminiApi.generateText(userMessage, systemPrompt);
            } catch (e) {
                console.error('Gemini Chat error:', e);
            }
        }

        // Offline Fallback logic
        if (this.mode === 'negotiation') {
            return `Sehr gut argumentiert! Du hast deinen Mehrwert mit deinen Skills in **${(profile.skills || [])[0] || 'Frontend'}** klar hervorgehoben.\n\n*HR-Gegenfrage: "Wir können beim Grundgehalt auf ${(job.salary || 70000).toLocaleString('de-DE')} € gehen, wenn wir dafür einen jährlichen Leistungsbonus und 2 zusätzliche Homeoffice-Tage vereinbaren. Wäre das für Sie ein gangbarer Weg?"*`;
        } else {
            return `Starke Antwort! Du hast eine gute Struktur gewählt. Achte darauf, konkrete Kennzahlen oder Ergebnisse (z. B. Performance-Steigerung in Prozent) zu erwähnen.\n\n*Nächste Frage: "Wie gehen Sie bei ${job.company} vor, wenn es im Projektteam zu Meinungsverschiedenheiten über technische Architekturentscheidungen kommt?"*`;
        }
    }
};
