/**
 * Gemini API Integration Manager for JobMatch
 * Connects directly to Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
 * using the user's stored API Key with intelligent fallback to mockAi.
 */
import { mockAi } from '../mockAi.js';

export const geminiApi = {
    /**
     * Retrieves stored API Key from LocalStorage
     * @returns {string|null}
     */
    getApiKey() {
        return localStorage.getItem('jobmatch_gemini_api_key') || null;
    },

    /**
     * Stores API key in LocalStorage
     * @param {string} key 
     */
    setApiKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('jobmatch_gemini_api_key', key.trim());
        } else {
            localStorage.removeItem('jobmatch_gemini_api_key');
        }
    },

    /**
     * Checks if a valid API Key is configured
     * @returns {boolean}
     */
    hasApiKey() {
        const key = this.getApiKey();
        return !!(key && key.length > 10);
    },

    /**
     * Generates content using Google Gemini REST API or falls back to mockAi.
     * @param {string} promptText 
     * @param {string} [systemInstruction] 
     * @returns {Promise<string>} Generated response text
     */
    async generateText(promptText, systemInstruction = '') {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.log('Gemini API Key not set. Falling back to mockAi.');
            return null; // Signals caller to use fallback
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const body = {
                contents: [{
                    parts: [{ text: promptText }]
                }]
            };

            if (systemInstruction) {
                body.systemInstruction = {
                    parts: [{ text: systemInstruction }]
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Gemini API HTTP Error ${response.status}`);
            }

            const data = await response.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
                return candidateText.trim();
            }
            throw new Error('No text candidate returned from Gemini API');
        } catch (error) {
            console.warn('Gemini API call failed:', error);
            return null;
        }
    },

    /**
     * High-level Cover Letter Generation with Gemini Live API fallback to mockAi
     */
    async generateCoverLetter(jobTitle, company, jobDescription, profile, tone = 'klassisch') {
        if (this.hasApiKey()) {
            const prompt = `Erstelle ein professionelles deutsches Anschreiben für die Stelle "${jobTitle}" bei "${company}".
Bewerber-Profil:
- Name: ${profile.name || 'Bewerber/in'}
- Berufstitel: ${profile.title || 'Fachkraft'}
- Hauptkompetenzen: ${profile.skills ? profile.skills.join(', ') : 'keine Angaben'}
- Zusammenfassung: ${profile.summary || ''}

Stellenbeschreibung:
${jobDescription || 'Keine nähere Beschreibung angegeben.'}

Tonalität: ${tone} (z.B. klassisch, kreativ & modern, oder kurzer pitch).
Formatiere das Anschreiben übersichtlich mit Betreff, Anrede, Einleitung, Hauptteil (Warum diese Stelle & Match der Skills), Schlusssatz und Grußformel.`;

            const result = await this.generateText(prompt, 'Du bist ein erfahrener Karriereberater und Experte für professionelle Bewerbungsunterlagen.');
            if (result) return result;
        }

        // Fallback to offline mockAi generator
        return mockAi.generateCoverLetter(jobTitle, company, jobDescription, profile, tone);
    },

    /**
     * High-level Job Match Scoring with Gemini Live API fallback
     */
    async analyzeJobMatch(jobDescription, userSkills = []) {
        if (this.hasApiKey()) {
            const prompt = `Analysiere das folgende Stellenangebot und vergleiche es mit den Skills des Bewerbers.
Bewerber-Skills: ${userSkills.join(', ')}

Stellenbeschreibung:
${jobDescription}

Antworte ausschließlich in folgendem JSON-Format (kein Markdown drumherum, nur valides JSON):
{
  "matchScore": 85,
  "matchingSkills": ["Skill1", "Skill2"],
  "missingSkills": ["Skill3"],
  "insights": "Kurze prägnante Analyse..."
}`;

            const response = await this.generateText(prompt);
            if (response) {
                try {
                    const cleanedJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(cleanedJsonStr);
                } catch (e) {
                    console.warn('Failed to parse Gemini JSON response:', e);
                }
            }
        }

        return mockAi.analyzeJobMatch(jobDescription, userSkills);
    }
};
