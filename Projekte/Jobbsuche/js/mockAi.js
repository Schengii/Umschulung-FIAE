// A sophisticated client-side keyword parser and AI cover letter simulator
import { storage } from './storage.js';

// List of common keywords in the tech and job market to scan for
const TECH_KEYWORDS = [
    'javascript', 'html5', 'html', 'css grid', 'css', 'react', 'vue', 'angular', 
    'typescript', 'node.js', 'node', 'next.js', 'tailwind', 'figma', 'ui', 'ux', 
    'git', 'github', 'python', 'java', 'c#', 'c++', 'docker', 'kubernetes', 'aws',
    'cloud', 'rest api', 'api', 'scrum', 'agile', 'projektmanagement', 'sql', 
    'nosql', 'mongodb', 'responsive design', 'adobe xd', 'sketch', 'english', 'deutsch'
];

export const mockAi = {
    /**
     * Fetches job description text from a URL using allorigins CORS proxy
     */
    async fetchJobDescriptionFromUrl(url) {
        if (!url) throw new Error("Keine URL angegeben.");
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der URL.");
        }
        const data = await response.json();
        const html = data.contents;
        if (!html) throw new Error("Keine Inhalte unter dieser URL gefunden.");
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Platform-specific selectors (LinkedIn, Indeed, StepStone, etc.)
        let contentElement = doc.body;
        
        const indeedDesc = doc.querySelector('#jobDescriptionText') || doc.querySelector('.jobsearch-JobComponent-description');
        const linkedinDesc = doc.querySelector('.show-more-less-html__markup') || doc.querySelector('.jobs-description__content') || doc.querySelector('.description__text');
        const stepstoneDesc = doc.querySelector('.job-description') || doc.querySelector('.js-app-ld-content') || doc.querySelector('.g-job-description');

        if (indeedDesc) contentElement = indeedDesc;
        else if (linkedinDesc) contentElement = linkedinDesc;
        else if (stepstoneDesc) contentElement = stepstoneDesc;

        // Remove non-content elements inside target
        contentElement.querySelectorAll('script, style, head, nav, footer, header, iframe, noscript, button, input').forEach(el => el.remove());
        
        const text = contentElement.innerText || contentElement.textContent || "";
        return text.replace(/\s+/g, ' ').trim().slice(0, 5000);
    },

    /**
     * Tests the provided Gemini API key with a minimal prompt
     */
    async testApiKey(apiKey) {
        if (!apiKey || !apiKey.trim()) throw new Error("Kein API-Key angegeben.");
        
        const profile = storage.getProfile();
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: [{ parts: [{ text: "Antworte kurz mit dem Wort 'OK', wenn du mich hoerst." }] }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Verbindung fehlgeschlagen.");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Keine Antwort von der API erhalten.");
        
        return true;
    },

    /**
     * Extracts keywords from job description that are relevant to technology/business
     */
    extractKeywords(description) {
        if (!description) return [];
        const text = description.toLowerCase();
        
        // Find matching keywords from our dictionary
        const found = TECH_KEYWORDS.filter(kw => {
            // Regex to match keyword as a separate word/phrase
            const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b|\\b${escaped}`, 'i');
            return regex.test(text);
        });

        // Unique values only
        return [...new Set(found)];
    },

    /**
     * Compares user skills with job description keywords
     */
    analyzeMatch(userSkills, jobDescription) {
        if (!jobDescription) {
            return {
                matchScore: 0,
                matchingSkills: [],
                missingSkills: []
            };
        }

        const jobKeywords = this.extractKeywords(jobDescription);
        
        if (jobKeywords.length === 0) {
            // Default check against job text with user skills
            const text = jobDescription.toLowerCase();
            const matching = userSkills.filter(skill => {
                const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                return regex.test(text);
            });
            
            return {
                matchScore: userSkills.length > 0 ? Math.round((matching.length / Math.min(userSkills.length, 5)) * 100) : 0,
                matchingSkills: matching,
                missingSkills: []
            };
        }

        const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
        
        const matchingSkills = [];
        const missingSkills = [];

        jobKeywords.forEach(kw => {
            // Check if user has this skill (exact or partial)
            const hasSkill = normalizedUserSkills.some(skill => 
                skill === kw || skill.includes(kw) || kw.includes(skill)
            );

            if (hasSkill) {
                // Find the original casing from user skills or use capitalized keyword
                const original = userSkills.find(s => s.toLowerCase().trim() === kw) || 
                                 kw.charAt(0).toUpperCase() + kw.slice(1);
                matchingSkills.push(original);
            } else {
                missingSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
            }
        });

        const totalKeywords = jobKeywords.length;
        const matchScore = totalKeywords > 0 
            ? Math.round((matchingSkills.length / totalKeywords) * 100) 
            : 0;

        return {
            matchScore: Math.min(matchScore, 100),
            matchingSkills,
            missingSkills
        };
    },

    /**
     * Generates a tailored cover letter / application outline
     */
    generateCoverLetter(profile, job, tone = 'classic') {
        if (profile.geminiApiKey && profile.geminiApiKey.trim()) {
            return this.generateRealCoverLetter(profile.geminiApiKey, profile, job, tone);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                const { matchingSkills } = this.analyzeMatch(profile.skills, job.description);
                const topSkills = matchingSkills.length > 0 ? matchingSkills.slice(0, 3).join(', ') : (profile.skills.slice(0, 3).join(', ') || 'Webentwicklung');
                
                if (tone === 'creative') {
                    const creativeDraft = `Hallo Team von ${job.company},\n\n` +
                        `Softwareentwicklung ist für mich leidenschaftliches Handwerk – und Ihre Stellenausschreibung als **${job.title}** hat mich sofort begeistert!\n\n` +
                        `Warum ich zu Ihnen passe? Ganz einfach: Mit meinen Kenntnissen in **${topSkills}** bringe ich frischen Wind und pragmatische Lösungen mit. ` +
                        `Ich liebe es, komplexe Herausforderungen in intuitive Benutzeroberflächen zu verwandeln.\n\n` +
                        `Lassen Sie uns im Gespräch herausfinden, wie wir gemeinsam Großartiges erschaffen können!\n\n` +
                        `Viele Grüße,\n${profile.name || 'Max Mustermann'}`;
                    resolve(creativeDraft);
                    return;
                } else if (tone === 'pitch') {
                    const pitchDraft = `Sehr geehrte Damen und Herren bei ${job.company},\n\n` +
                        `3 Gründe, warum ich Ihr neuer **${job.title}** sein sollte:\n` +
                        `1. **Experte in ${topSkills}**: Direkt einsatzbereit von Tag 1 an.\n` +
                        `2. **Praxiserfahrung**: ${profile.title || 'Entwickler'} mit Fokus auf moderne UI & Performance.\n` +
                        `3. **Lernbereitschaft**: Schnelle Einarbeitung in Ihren spezifischen Stack.\n\n` +
                        `Ich freue mich auf ein kurzes Erstgespräch!\n\n` +
                        `Beste Grüße,\n${profile.name || 'Max Mustermann'}`;
                    resolve(pitchDraft);
                    return;
                }

                // Standard classic
                const greeting = `Sehr geehrtes Team von ${job.company},\n\n`;
                const intro = `mit großem Interesse habe ich Ihre Ausschreibung für die Position als **${job.title}** gelesen. Da mein Profil ideal zu den von Ihnen genannten Anforderungen passt, möchte ich mich Ihnen gerne vorstellen.\n\n`;
                let skillsText = matchingSkills.length > 0
                    ? `In meiner bisherigen Laufbahn konnte ich fundierte Erfahrungen in Projekten sammeln, bei denen insbesondere **${topSkills}** im Fokus standen. Die von Ihnen geforderten Kompetenzen bringe ich daher direkt mit.\n\n`
                    : `Als motivierter ${profile.title || 'Entwickler'} bringe ich eine große Lernbereitschaft und Begeisterung für neue Webtechnologien mit.\n\n`;
                const outro = `Für Fragen stehe ich Ihnen jederzeit gerne zur Verfügung und freue mich über die Einladung zu einem persönlichen Kennenlernen.\n\nMit freundlichen Grüßen,\n${profile.name || 'Max Mustermann'}`;
                
                resolve(greeting + intro + skillsText + outro);
            }, 800);
        });
    },

    async generateRealCoverLetter(apiKey, profile, job, tone = 'classic') {
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const temp = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        const customInstr = profile.geminiCustomInstructions || '';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        let systemInstruction = `Du bist ein professioneller Bewerbungs-Schreiber. Verfasse das Anschreiben in der Tonalität: ${tone}.`;
        if (customInstr) {
            systemInstruction += `\nBeachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${customInstr}`;
        }
        
        const promptText = `Erstelle ein professionelles Bewerbungsanschreiben (${tone}-Stil) auf Deutsch für folgende Position:
Stellentitel: ${job.title}
Unternehmen: ${job.company}
Bewerber: ${profile.name || 'Max Mustermann'} (${profile.title || 'Entwickler'})
Skills: ${profile.skills.join(', ')}`;

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                temperature: temp
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Fehler beim Laden des Anschreibens.';
    },

    generateInterviewPrep(profile, job) {
        if (profile.geminiApiKey && profile.geminiApiKey.trim()) {
            return this.generateRealInterviewPrep(profile.geminiApiKey, profile, job);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                const { matchingSkills, missingSkills } = this.analyzeMatch(profile.skills, job.description);
                
                const questions = [];

                // Question 1: Behavioral based on matching skills
                if (matchingSkills.length > 0) {
                    const skill = matchingSkills[0];
                    questions.push({
                        id: 1,
                        question: `Sie erwähnen in Ihrem Profil Erfahrungen mit "${skill}". Können Sie uns ein konkretes Beispiel für ein Projekt nennen, bei dem Sie diese Technologie erfolgreich eingesetzt haben, und auf welche Herausforderungen Sie dabei gestoßen sind?`,
                        strategy: `Nutze die STAR-Methode (Situation, Task, Action, Result). Erkläre kurz das Projektziel, deine konkrete Rolle, wie du "${skill}" genutzt hast und welches positive Endergebnis erzielt wurde.`,
                        sampleAnswer: `Ja, in einem meiner letzten Projekte ging es um die Erstellung eines komplexen User-Dashboards. Dabei habe ich "${skill}" intensiv genutzt, um eine responsive und performante Oberfläche zu entwickeln. Eine der größten Herausforderungen war die Optimierung der Ladezeiten. Ich konnte dies lösen, indem ich gezielte Optimierungen vornahm, wodurch die Ladezeit um 25% sank.`
                    });
                } else {
                    questions.push({
                        id: 1,
                        question: `Warum interessieren Sie sich speziell für die Stelle als ${job.title} bei uns und warum sind Sie die richtige Besetzung, obwohl Sie neu in diesem Bereich einsteigen?`,
                        strategy: `Fokussiere dich auf deine hohe Lernbereitschaft und Motivation. Zeige, dass du dich im Vorfeld intensiv mit ${job.company} auseinandergesetzt hast und die Werte teilst.`,
                        sampleAnswer: `Ich verfolge die Entwicklung von ${job.company} schon länger und bin begeistert von Ihrer Innovationskraft. Als lernwilliger Entwickler reizt mich die Chance, mich in neue Frameworks einzuarbeiten und mein theoretisches Wissen direkt in einem professionellen Umfeld produktiv anzuwenden.`
                    });
                }

                // Question 2: Technical/Gap based on missing skills
                if (missingSkills.length > 0) {
                    const gap = missingSkills[0];
                    questions.push({
                        id: 2,
                        question: `In unserer Stellenausschreibung fordern wir Kenntnisse in "${gap}". Wie schätzen Sie Ihre Kenntnisse in diesem Bereich ein und wie würden Sie sich in den ersten Wochen einarbeiten?`,
                        strategy: `Gib offen zu, dass du hier noch Lernbedarf hast, aber verknüpfe es sofort mit einer proaktiven Lösungsstrategie. Nenne verwandte Technologien, die du bereits beherrschst, um zu zeigen, dass dir der Einstieg leicht fallen wird.`,
                        sampleAnswer: `Ich habe in der Praxis noch nicht tiefgehend mit "${gap}" gearbeitet, besitze aber fundierte Erfahrung in verwandten Bereichen wie ${matchingSkills[0] || 'Webtechnologien'}. Ich habe mir bereits Online-Ressourcen angeschaut und bin zuversichtlich, mich durch mein Verständnis moderner Softwarearchitekturen innerhalb weniger Wochen voll produktiv in "${gap}" einzuarbeiten.`
                    });
                } else {
                    questions.push({
                        id: 2,
                        question: `Wie gehen Sie vor, wenn Sie in einem Projekt auf ein technisches Problem stoßen, für das Sie ad hoc keine Lösung wissen?`,
                        strategy: `Hier geht es um deine Problemlösungsfähigkeiten und Teamarbeit. Zeige, dass du strukturiert recherchieren kannst (Dokumentation, StackOverflow), aber auch den Mut hast, im Team nachfragebereit zu sein.`,
                        sampleAnswer: `Zuerst analysiere ich das Problem systematisch und isoliere den Fehler. Ich recherchiere in offiziellen Dokumentationen. Wenn ich nach angemessener Zeit keine Lösung finde, bereite ich das Problem strukturiert vor, um einen Kollegen um ein kurzes Pair-Programming-Feedback zu bitten. Das spart dem Projekt Zeit.`
                    });
                }

                // Question 3: Teamwork and Culture
                questions.push({
                    id: 3,
                    question: `Wir legen bei ${job.company} großen Wert auf Teamkultur und das Arbeitsmodell (${job.workMode || 'Hybrid'}). Wie organisieren Sie sich im Alltag und wie kommunizieren Sie im Team?`,
                    strategy: `Betone deine Selbstorganisation und Zuverlässigkeit, besonders bei Remote- oder Hybridarbeit. Erwähne gängige Tools (Git, Slack, Jira, Zoom) und regelmäßige Check-Ins.`,
                    sampleAnswer: `Ich strukturiere meinen Tag mit festen To-Do-Listen und nutze Tools wie Git zur Versionskontrolle. In einem ${job.workMode || 'Hybrid'}-Modell ist mir proaktive Kommunikation extrem wichtig – lieber einmal mehr im Chat abstimmen als im Unklaren zu bleiben. Ich schätze regelmäßige Dailies sehr.`
                });

                // Question 4: Dealing with constructive feedback
                questions.push({
                    id: 4,
                    question: `Können Sie eine Situation beschreiben, in der Sie kritisches Feedback zu Ihrer Arbeit erhalten haben, und wie Sie damit umgegangen sind?`,
                    strategy: `Zeige professionelle Reife, Kritikfähigkeit und die Fähigkeit, Feedback zur persönlichen Weiterentwicklung zu nutzen. Nenne ein konkretes Beispiel und das positive Resultat der Umsetzung.`,
                    sampleAnswer: `In einem Code-Review wurde angemerkt, dass meine Komponenten-Struktur schwer wiederverwendbar war. Anstatt defensiv zu reagieren, habe ich mich mit dem Kollegen zusammengesetzt, um seine Best Practices zu verstehen. Ich habe die Komponenten refaktoriert und mein Verständnis für modularere Softwarearchitektur nachhaltig verbessert.`
                });

                // Question 5: Long-term career goals
                questions.push({
                    id: 5,
                    question: `Wo sehen Sie sich beruflich in den nächsten 3 bis 5 Jahren und wie trägt diese Position als ${job.title} dazu bei?`,
                    strategy: `Verbinde deine persönlichen Wachstumsziele mit dem Erfolg des Unternehmens. Zeige Ambition, aber bleibe realistisch und drücke deine Loyalität aus.`,
                    sampleAnswer: `In den nächsten Jahren möchte ich meine Expertise im Bereich Frontend-Architektur vertiefen und ggf. fachliche Verantwortung übernehmen. Die Position bei ${job.company} bietet mir durch die anspruchsvollen Projekte und das moderne Tech-Stack die ideale Umgebung, um mich fachlich weiterzuentwickeln und gleichzeitig einen wertvollen Beitrag zu eurem Wachstum zu leisten.`
                });

                resolve(questions);
            }, 1000);
        });
    },

    async generateRealInterviewPrep(apiKey, profile, job) {
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const temp = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        const customInstr = profile.geminiCustomInstructions || '';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        let systemInstruction = "Du bist ein professioneller Karriere-Coach. Du analysierst die Anforderungen einer Stelle und die Skills eines Bewerbers und generierst 5 typische Interviewfragen, eine strategische Empfehlung für den Bewerber zur Beantwortung sowie eine beispielhafte exzellente Modellantwort aus Sicht des Bewerbers.";
        if (customInstr) {
            systemInstruction += `\nBeachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${customInstr}`;
        }
        
        const promptText = `Analysiere die Anforderungen für folgende Stelle und die Skills des Bewerbers. Erstelle 5 typische Interviewfragen.
Stellentitel: ${job.title}
Unternehmen: ${job.company}
Stellenbeschreibung:
${job.description || 'Keine Angabe'}

Bewerber-Details:
Name: ${profile.name || 'Max Mustermann'}
Skills: ${profile.skills.join(', ')}
Erfahrung:
${profile.experience || 'Keine Angabe'}

Gib das Ergebnis als valides JSON-Array zurück. Jede Frage im Array muss exakt die Attribute "id", "question", "strategy" und "sampleAnswer" aufweisen (alles als Strings).`;

        const responseSchema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    id: { type: "INTEGER" },
                    question: { type: "STRING" },
                    strategy: { type: "STRING" },
                    sampleAnswer: { type: "STRING" }
                },
                required: ["id", "question", "strategy", "sampleAnswer"]
            }
        };

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: temp
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    async parseJobDescription(apiKey, rawText) {
        if (!rawText || !rawText.trim()) {
            throw new Error("Bitte geben Sie einen Text ein, der analysiert werden soll.");
        }

        if (apiKey && apiKey.trim()) {
            return this.parseRealJobDescription(apiKey, rawText);
        }

        // Simulierter lokaler Parser
        return new Promise((resolve) => {
            setTimeout(() => {
                const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                let title = "Unbekannter Jobtitel";
                let company = "Unbekanntes Unternehmen";
                let salary = 0;
                let location = "Deutschland";
                let workMode = "Hybrid";
                let contact = "";
                
                // Sehr einfache Heuristiken zur Demonstration des Fallbacks
                // 1. Jobtitel-Suche in den ersten Zeilen
                const titleKeywords = ["entwickler", "developer", "designer", "ingenieur", "engineer", "manager", "berater", "consultant", "architect", "spezialist", "specialist"];
                for (const line of lines.slice(0, 5)) {
                    if (titleKeywords.some(kw => line.toLowerCase().includes(kw))) {
                        title = line;
                        break;
                    }
                }
                
                // 2. Firmen-Suche
                const companyKeywords = ["gmbh", "ag", "co. kg", "se", "solutions", "technologies", "group", "partner"];
                for (const line of lines) {
                    if (companyKeywords.some(kw => line.toLowerCase().includes(kw))) {
                        company = line.replace(/(wir suchen|jobs|stelle|karriere|bei)\s*/i, '').trim();
                        break;
                    }
                }
                
                // 3. Gehalt-Suche
                const salaryRegex = /(?:gehalt|verdienst|einkommen|salär|jahresgehalt|vergütung)?\s*(?:bis|von|ca\.)?\s*([0-9]{2,3}(?:\.[0-9]{3})?)\s*(?:€|euro|\$)/i;
                const salaryMatch = rawText.match(salaryRegex);
                if (salaryMatch) {
                    salary = parseInt(salaryMatch[1].replace('.', ''), 10);
                } else {
                    const numberMatch = rawText.match(/\b(2[5-9][0-9]{3}|[3-9][0-9]{4}|1[0-8][0-9]{4})\b/);
                    if (numberMatch) {
                        salary = parseInt(numberMatch[1], 10);
                    }
                }
                
                // 4. Arbeitsort & Arbeitsmodell
                if (/remote|homeoffice|home-office|zuhause|work from home/i.test(rawText)) {
                    workMode = "Remote";
                } else if (/hybrid|flexibel/i.test(rawText)) {
                    workMode = "Hybrid";
                } else if (/vor ort|präsenz|büro/i.test(rawText)) {
                    workMode = "Vor Ort";
                }
                
                const locationKeywords = ["berlin", "münchen", "hamburg", "köln", "frankfurt", "stuttgart", "düsseldorf", "dortmund", "essen", "bremen", "leipzig", "dresden", "nürnberg", "karlsruhe"];
                for (const word of rawText.toLowerCase().split(/[^a-zäöüß]/)) {
                    if (locationKeywords.includes(word)) {
                        location = word.charAt(0).toUpperCase() + word.slice(1);
                        break;
                    }
                }

                // 5. Ansprechpartner-Suche
                const contactRegex = /(?:ansprechpartner|kontakt|bewerben an|kontaktperson|recruiter|hr-manager|hr)\s*(?:ist|unter|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/;
                const contactMatch = rawText.match(contactRegex);
                if (contactMatch) {
                    contact = contactMatch[1];
                }

                resolve({
                    title: title,
                    company: company,
                    salary: salary,
                    location: location,
                    workMode: workMode,
                    description: rawText.slice(0, 1000) + (rawText.length > 1000 ? "..." : ""),
                    contact: contact
                });
            }, 1000);
        });
    },

    async parseRealJobDescription(apiKey, rawText) {
        const profile = storage.getProfile();
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const systemInstruction = "Du bist ein intelligenter Daten-Extraktor. Analysiere den bereitgestellten Text einer Stellenanzeige und extrahiere strukturierte Daten auf Deutsch.";
        const promptText = `Analysiere folgende Stellenbeschreibung und extrahiere die Kerndaten:
---
${rawText}
---

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- title: Der gefundene Stellentitel (z.B. "Frontend Developer (m/w/d)")
- company: Der Firmenname
- salary: Das angebotene Jahresbruttogehalt als Ganzzahl in Euro (falls eine Gehaltsspanne angegeben ist, nimm den Mittelwert oder das Maximum; falls keins angegeben ist, setze 0)
- location: Der Arbeitsort / Standort
- workMode: Eines aus ["Vor Ort", "Hybrid", "Remote"]
- description: Eine prägnante, übersichtliche Zusammenfassung der Aufgaben und Anforderungen (Stichpunkte, max. 1000 Zeichen)
- contact: Name des Ansprechpartners oder der Ansprechpartnerin (falls ermittelbar, sonst leer)

Gib ausschließlich das JSON-Objekt zurück.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" },
                company: { type: "STRING" },
                salary: { type: "INTEGER" },
                location: { type: "STRING" },
                workMode: { type: "STRING" },
                description: { type: "STRING" },
                contact: { type: "STRING" }
            },
            required: ["title", "company", "salary", "location", "workMode", "description", "contact"]
        };

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    /**
     * Parses an incoming email text to determine status and company/position details
     */
    async parseEmailText(apiKey, emailText) {
        if (!emailText || !emailText.trim()) throw new Error("Kein E-Mail-Text angegeben.");

        const text = emailText.toLowerCase();
        let status = 'applied';
        if (text.includes('absage') || text.includes('leider') || text.includes('nicht berücksichtigen')) {
            status = 'rejected';
        } else if (text.includes('einladung') || text.includes('gespräch') || text.includes('interview') || text.includes('termin')) {
            status = 'interviewing';
        } else if (text.includes('angebot') || text.includes('zusage') || text.includes('arbeitsvertrag')) {
            status = 'offer';
        }

        // Try extracting company / title heuristic
        const companyMatch = emailText.match(/(?:bei|von|firma|unternehmen)\s+([A-Z][A-Za-z0-9\s&.-]+)/i);
        const company = companyMatch ? companyMatch[1].trim().split(/\s+/).slice(0, 3).join(' ') : '';

        return {
            status,
            company: company || '',
            notes: `E-Mail Import am ${new Date().toLocaleDateString('de-DE')}:\n"${emailText.slice(0, 200)}..."`
        };
    },

    async evaluateInterviewAnswer(apiKey, question, answer) {
        if (!answer || !answer.trim()) {
            throw new Error("Bitte geben Sie eine Antwort ein, die bewertet werden soll.");
        }

        if (apiKey && apiKey.trim()) {
            return this.evaluateRealInterviewAnswer(apiKey, question, answer);
        }

        // Lokales heuristisches Feedback
        return new Promise((resolve) => {
            setTimeout(() => {
                const words = answer.trim().split(/\s+/).length;
                let score = 50;
                
                if (words < 10) score -= 20;
                else if (words >= 10 && words < 30) score += 10;
                else if (words >= 30 && words < 80) score += 25;
                else score += 30;
                
                const keywords = ["projekt", "erfahrung", "herausforderung", "gelöst", "team", "kunde", "kunden", "kommunikation", "lösung", "lernen", "struktur", "star", "situation", "ziel", "ergebnis"];
                let foundKeywords = [];
                keywords.forEach(kw => {
                    if (answer.toLowerCase().includes(kw)) {
                        score += 3;
                        foundKeywords.push(kw);
                    }
                });

                score = Math.min(Math.max(score, 10), 100);

                let feedback = "";
                let suggestions = "";

                if (score < 50) {
                    feedback = "Deine Antwort ist sehr kurz geraten und geht kaum auf die Facetten der Frage ein. Recruiter möchten in der Regel mehr Kontext und Details hören.";
                    suggestions = "Versuche, deine Antwort nach der STAR-Methode aufzubauen: Welches Problem lag vor? Was war deine Aufgabe? Was hast du konkret getan? Und was war das messbare Resultat?";
                } else if (score >= 50 && score < 75) {
                    feedback = `Guter Ansatz! Du hast bereits einige wichtige Aspekte genannt (z.B. Wörter wie: ${foundKeywords.join(', ') || 'keine'}). Deine Antwort ist strukturiert, könnte aber noch mit einem konkreteren Beispiel belegt werden.`;
                    suggestions = "Untermauere deine Behauptungen mit einem echten Ereignis aus deiner Praxis. Erzähle eine kurze Story, wie du genau vorgegangen bist. Das wirkt authentischer und überzeugender.";
                } else {
                    feedback = `Hervorragende Antwort! Du hast sehr detailliert geantwortet (${words} Wörter) und wichtige Begriffe wie ${foundKeywords.join(', ') || 'Berufserfahrung'} verwendet. Damit vermittelst du Professionalität und Struktur.`;
                    suggestions = "Deine Antwort ist bereits sehr stark. Achte beim Vorlesen darauf, ruhig und selbstbewusst zu sprechen. Die Antwort ist perfekt vorbereitet!";
                }

                resolve({
                    score: score,
                    feedback: feedback,
                    suggestions: suggestions
                });
            }, 1000);
        });
    },

    async evaluateRealInterviewAnswer(apiKey, question, answer) {
        const profile = storage.getProfile();
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const temp = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        const customInstr = profile.geminiCustomInstructions || '';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        let systemInstruction = "Du bist ein professioneller Karriere-Coach. Bewerte die Antwort des Bewerbers ehrlich, professionell und konstruktiv auf Deutsch.";
        if (customInstr) {
            systemInstruction += `\nBeachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${customInstr}`;
        }
        
        const promptText = `Bewerte die folgende Antwort des Bewerbers auf die Interviewfrage:
Frage: ${question}
Antwort des Bewerbers: ${answer}

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- score: Eine Zahl von 0 bis 100, die die Qualität der Antwort bewertet
- feedback: Eine ehrliche, konstruktive Analyse der Stärken und Schwächen der Antwort (max. 500 Zeichen)
- suggestions: Konkrete, handlungsorientierte Verbesserungsvorschläge (was gefehlt hat, wie man es besser formuliert, max. 500 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                score: { type: "INTEGER" },
                feedback: { type: "STRING" },
                suggestions: { type: "STRING" }
            },
            required: ["score", "feedback", "suggestions"]
        };

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: temp
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    generateResumeOptimization(profile, job, cvText) {
        if (profile.geminiApiKey && profile.geminiApiKey.trim()) {
            return this.generateRealResumeOptimization(profile.geminiApiKey, profile, job, cvText);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                const jobKeywords = this.extractKeywords(job.description);
                const cvKeywords = this.extractKeywords(cvText);
                
                const matchingKeywords = jobKeywords.filter(kw => cvKeywords.includes(kw));
                const missingKeywords = jobKeywords.filter(kw => !cvKeywords.includes(kw));
                
                const totalKeywords = jobKeywords.length;
                let score = totalKeywords > 0 
                    ? Math.round((matchingKeywords.length / totalKeywords) * 100) 
                    : 50;
                if (!cvText || !cvText.trim()) score = 10;
                
                const capMatch = matchingKeywords.map(kw => kw.charAt(0).toUpperCase() + kw.slice(1));
                const capMiss = missingKeywords.map(kw => kw.charAt(0).toUpperCase() + kw.slice(1));
                
                const bulletPoints = [];
                if (missingKeywords.length > 0) {
                    const firstGap = capMiss[0];
                    bulletPoints.push({
                        original: 'Kenntnisse in der Softwareentwicklung.',
                        improved: `Konzeption und Implementierung robuster Softwarelösungen unter Anwendung von ${firstGap} für strukturierte Arbeitsabläufe.`,
                        why: `Hebt deine Kompetenz in ${firstGap} aktiv hervor und verwendet stärkere Aktionsverben.`
                    });
                }
                if (matchingKeywords.length > 0) {
                    const firstMatch = capMatch[0];
                    bulletPoints.push({
                        original: `Ich habe mit ${firstMatch} gearbeitet.`,
                        improved: `Erfolgreiche Integration von ${firstMatch} in produktiven Projekten zur Optimierung der Benutzerfreundlichkeit und Ladezeiten.`,
                        why: `Stellt den konkreten geschäftlichen Mehrwert (Ladezeiten, UX) in den Vordergrund.`
                    });
                } else {
                    bulletPoints.push({
                        original: 'Erstellung von Frontends und Webseiten.',
                        improved: 'Entwicklung hochperformanter, responsiver Benutzeroberflächen unter Einhaltung moderner Accessibility- und Design-Standards.',
                        why: 'Verwendet präzisere Fachbegriffe und zeigt Fokus auf Performance und Barrierefreiheit.'
                    });
                }
                
                bulletPoints.push({
                    original: 'Zusammenarbeit mit Kollegen im Team.',
                    improved: 'Agile Zusammenarbeit in interdisziplinären Teams unter Nutzung von Git, Scrum und kollaborativen Design-Tools wie Figma.',
                    why: 'Spezifiziert deine agilen Arbeitsmethoden und genutzten Tools.'
                });
                
                const generalTips = cvText && cvText.trim()
                    ? `Dein Lebenslauf hat bereits eine solide Basis (Match Score: ${score}%). Um für die Stelle als ${job.title} bei ${job.company} maximal attraktiv zu sein, solltest du die fehlenden Schlagworte wie ${capMiss.slice(0, 3).join(', ') || 'keine'} prominenter in deinen Projekten platzieren. Achte darauf, deine Erfahrungsergebnisse messbar zu beschreiben.`
                    : "Füge deinen Lebenslauf-Text im Eingabebereich ein, um eine detaillierte Keyword-Analyse und maßgeschneiderte Verbesserungsvorschläge für dieses Stellenprofil zu erhalten.";
                
                resolve({
                    score,
                    matchingKeywords: capMatch,
                    missingKeywords: capMiss,
                    bulletPoints,
                    generalTips
                });
            }, 1000);
        });
    },

    async generateRealResumeOptimization(apiKey, profile, job, cvText) {
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const temp = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        const customInstr = profile.geminiCustomInstructions || '';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        let systemInstruction = "Du bist ein professioneller Karriere-Coach und HR-Analyst. Du analysierst den Lebenslauf eines Bewerbers im Vergleich zu einer Stellenausschreibung. Du lieferst detailliertes Feedback, berechnest einen Match-Score und gibst konkrete Vorschläge zur Optimierung von Lebenslauf-Formulierungen.";
        if (customInstr) {
            systemInstruction += `\nBeachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${customInstr}`;
        }
        
        const promptText = `Vergleiche den Lebenslauf des Bewerbers mit der Stellenbeschreibung.
Stellentitel: ${job.title}
Unternehmen: ${job.company}
Stellenbeschreibung:
${job.description || 'Keine Angabe'}

Lebenslauf des Bewerbers:
${cvText || 'Keine Angabe'}

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- score: Eine Zahl von 0 bis 100, die beschreibt wie gut der Lebenslauf zum Jobprofil passt
- matchingKeywords: Ein Array von Strings mit Keywords/Skills aus der Anzeige, die im Lebenslauf bereits vorhanden sind
- missingKeywords: Ein Array von Strings mit wichtigen Keywords/Skills aus der Anzeige, die im Lebenslauf noch fehlen
- bulletPoints: Ein Array von Objekten. Jedes Objekt beschreibt eine verbesserte Formulierung im Lebenslauf und hat genau diese Felder:
  * original: Eine typische oder die tatsächliche Formulierung des Bewerbers (String)
  * improved: Die optimierte Formulierung, angepasst an die Anzeige (String)
  * why: Erklärung, warum die neue Formulierung besser wirkt (String)
- generalTips: Zusammenfassung von allgemeinen Tipps zur Formatierung, Struktur oder inhaltlichen Schwerpunktlegung speziell für diese Stelle (String, max. 600 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                score: { type: "INTEGER" },
                matchingKeywords: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                missingKeywords: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                bulletPoints: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            original: { type: "STRING" },
                            improved: { type: "STRING" },
                            why: { type: "STRING" }
                        },
                        required: ["original", "improved", "why"]
                    }
                },
                generalTips: { type: "STRING" }
            },
            required: ["score", "matchingKeywords", "missingKeywords", "bulletPoints", "generalTips"]
        };

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: temp
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    generateEmail(profile, job, type, tone) {
        if (profile.geminiApiKey && profile.geminiApiKey.trim()) {
            return this.generateRealEmail(profile.geminiApiKey, profile, job, type, tone);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                const contactPerson = job.contact || (tone === 'casual' ? 'Team' : 'Damen und Herren');
                const applicantName = profile.name || 'Alex Neumann';
                const jobTitle = job.title;
                const companyName = job.company;
                
                let text = '';
                
                if (type === 'status') {
                    if (tone === 'formal') {
                        text = `Sehr geehrte(r) Frau/Herr ${job.contact || 'Ansprechpartner'},

ich hoffe, es geht Ihnen gut.

ich möchte mich auf diesem Weg kurz nach dem aktuellen Stand meiner Bewerbung für die Position als **${jobTitle}** (Referenz: ${job.id}) erkundigen. 

Nach wie vor reizt mich die Aussicht, meine Erfahrungen in Ihr Team bei **${companyName}** einzubringen, sehr. Über ein kurzes Update zum Prozessverlauf würde ich mich daher außerordentlich freuen.

Für eventuell noch ausstehende Fragen stehe ich Ihnen selbstverständlich jederzeit zur Verfügung.

Mit freundlichen Grüßen,
${applicantName}`;
                    } else {
                        text = `Hallo ${job.contact ? job.contact.split(' ')[0] : 'Team'},

ich hoffe, bei euch läuft alles super!

ich wollte mal ganz unkompliziert nachfragen, wie es aktuell bei der Bewerbung als **${jobTitle}** aussieht. 

Ich habe weiterhin große Lust darauf, euch bei **${companyName}** zu unterstützen und an euren Projekten mitzuwirken. Lasst mich einfach wissen, wenn ihr noch weitere Infos von mir braucht oder wie die nächsten Schritte aussehen.

Viele Grüße,
${applicantName}`;
                    }
                } else if (type === 'thankyou') {
                    if (tone === 'formal') {
                        text = `Sehr geehrte(r) Frau/Herr ${job.contact || 'Ansprechpartner'},

ich möchte mich herzlich für das informative und angenehme Gespräch am gestrigen Tag bedanken. 

Die detaillierten Einblicke in die Aufgaben der Position als **${jobTitle}** und die zukünftigen Projekte von **${companyName}** haben meinen Wunsch, Teil Ihres Teams zu werden, nochmals bestärkt. Besonders unsere Diskussion über Ihre technologische Ausrichtung fand ich sehr spannend.

Ich freue mich darauf, wieder von Ihnen zu hören und verbleibe

mit freundlichen Grüßen,
${applicantName}`;
                    } else {
                        text = `Hallo ${job.contact ? job.contact.split(' ')[0] : 'zusammen'},

vielen Dank für das tolle und lockere Gespräch gestern! 

Es hat mir super viel Spaß gemacht, mehr über die Rolle als **${jobTitle}** und eure Pläne bei **${companyName}** zu erfahren. Der Austausch hat mich auf jeden Fall noch motivierter gemacht, bei euch einzusteigen und loszulegen.

Ich freue mich auf euer Feedback!

Viele Grüße,
${applicantName}`;
                    }
                } else if (type === 'negotiate') {
                    const currentSalary = job.salary ? `${job.salary.toLocaleString('de-DE')} €` : 'das besprochene Gehalt';
                    if (tone === 'formal') {
                        text = `Sehr geehrte(r) Frau/Herr ${job.contact || 'Ansprechpartner'},

ich bedanke mich herzlich für das attraktive Angebot und Ihr Vertrauen in meine Fähigkeiten. Ich freue mich sehr über die Möglichkeit, als **${jobTitle}** bei **${companyName}** zu starten.

Nach Durchsicht des Vertragsentwurfs hätte ich noch ein Anliegen bezüglich der Rahmenbedingungen. Angesichts meiner Qualifikationen und der besprochenen Anforderungen würde ich gerne fragen, ob beim Gehalt ein Spielraum in Richtung 8-10% über den angebotenen ${currentSalary} besteht oder ob wir dies durch zusätzliche Benefits (wie z. B. Übernahme des Jobtickets oder Weiterbildungsbudgets) ausgleichen können.

Ich bin überzeugt, dass wir hier eine für beide Seiten hervorragende Lösung finden können und freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,
${applicantName}`;
                    } else {
                        text = `Hallo ${job.contact ? job.contact.split(' ')[0] : 'Team'},

vielen Dank für das Vertragsangebot! Ich freue mich riesig über eure Zusage und darauf, bald als **${jobTitle}** bei **${companyName}** durchzustarten.

Ich habe mir den Entwurf durchgeschaut und würde gerne noch einen Punkt ansprechen: Passt das Gehalt noch etwas ins Budget? Da wir über recht viel Verantwortung gesprochen haben, fände ich ein Grundgehalt, das etwa 5-10% über den vorgeschlagenen ${currentSalary} liegt, passender. Alternativ können wir auch gerne über zusätzliche Benefits wie extra Urlaubstage oder Fortbildungsbudgets sprechen.

Was meint ihr dazu? Ich bin sicher, wir finden da einen guten gemeinsamen Nenner.

Viele Grüße,
${applicantName}`;
                    }
                } else if (type === 'decline') {
                    if (tone === 'formal') {
                        text = `Sehr geehrte(r) Frau/Herr ${job.contact || 'Ansprechpartner'},

vielen Dank für das mir entgegengebrachte Vertrauen und das Vertragsangebot für die Stelle als **${jobTitle}**.

Nach reiflicher Überlegung habe ich mich jedoch dazu entschieden, ein anderes Angebot anzunehmen, das noch etwas besser zu meiner aktuellen Spezialisierung passt. Diese Entscheidung ist mir nicht leichtgefallen, da ich einen sehr positiven Eindruck von **${companyName}** gewonnen habe.

Ich bedanke mich herzlich für die angenehmen Gespräche und wünsche Ihnen und Ihrem Team weiterhin viel Erfolg bei der Suche.

Mit freundlichen Grüßen,
${applicantName}`;
                    } else {
                        text = `Hallo ${job.contact ? job.contact.split(' ')[0] : 'Team'},

vielen Dank für das Angebot und das Vertrauen in mich! 

Ich habe mir alles gründlich durch den Kopf gehen lassen, mich aber letztendlich für ein anderes Angebot entschieden, das thematisch noch einen Tick besser zu meinen aktuellen Plänen passt. Die Entscheidung war echt schwer, weil ich euer Team und die Atmosphäre bei **${companyName}** super sympathisch fand.

Vielen Dank noch mal für die coolen Gespräche und viel Erfolg weiterhin für euch!

Viele Grüße,
${applicantName}`;
                    }
                } else if (type === 'withdraw') {
                    if (tone === 'formal') {
                        text = `Sehr geehrte(r) Frau/Herr ${job.contact || 'Ansprechpartner'},

hiermit möchte ich meine Bewerbung für die Position als **${jobTitle}** bei **${companyName}** zurückziehen.

Da ich mich beruflich anderweitig vertraglich gebunden habe, stehe ich für das weitere Auswahlverfahren leider nicht mehr zur Verfügung. Ich bedanke mich herzlich für die Prüfung meiner Unterlagen und den freundlichen Kontakt.

Für die Zukunft wünsche ich Ihrem Unternehmen alles Gute und viel Erfolg.

Mit freundlichen Grüßen,
${applicantName}`;
                    } else {
                        text = `Hallo ${job.contact ? job.contact.split(' ')[0] : 'Team'},

ich wollte euch kurz Bescheid geben, dass ich meine Bewerbung für die Stelle als **${jobTitle}** leider zurückziehen muss.

Ich habe ein anderes Angebot unterschrieben und bin daher nicht mehr auf der Suche. Vielen Dank für eure Zeit, das Anschauen meiner Unterlagen und den netten Austausch!

Wünsche euch alles Gute und weiterhin viel Erfolg!

Viele Grüße,
${applicantName}`;
                    }
                }
                
                resolve(text);
            }, 1000);
        });
    },

    async generateRealEmail(apiKey, profile, job, type, tone) {
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const temp = profile.geminiTemperature !== undefined ? profile.geminiTemperature : 0.7;
        const customInstr = profile.geminiCustomInstructions || '';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        let systemInstruction = "Du bist ein professioneller Bewerbungscoach und Entwurfs-Schreiber. Du verfasst fehlerfreie, moderne und überzeugende E-Mails für den Bewerbungsprozess auf Deutsch.";
        if (customInstr) {
            systemInstruction += `\nBeachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${customInstr}`;
        }
        
        const emailPurpose = 
            type === 'status' ? 'eine freundliche Nachfrage nach dem Bewerbungsstand' :
            type === 'thankyou' ? 'eine herzliche Danksagung nach dem Bewerbungsgespräch' :
            type === 'negotiate' ? 'eine professionelle Nachverhandlung des Gehalts bzw. von Arbeitsbedingungen' :
            type === 'decline' ? 'eine höfliche und wertschätzende Absage an das Unternehmen' :
            'das Zurückziehen der Bewerbung aufgrund einer anderen Vertragsunterzeichnung';

        const promptText = `Verfasse eine E-Mail auf Deutsch mit folgendem Zweck: ${emailPurpose}.
Stellentitel: ${job.title}
Unternehmen: ${job.company}
Ansprechpartner: ${job.contact || 'Personalabteilung'}

Bewerber-Details:
Name: ${profile.name || 'Bewerber'}
Skills: ${profile.skills.join(', ')}

Tonalität: Die E-Mail soll ${tone === 'casual' ? 'locker und kollegial per "Du"' : 'formell und höflich per "Sie"'} verfasst werden.
Das Gehalt in der Anzeige ist mit ${job.salary ? job.salary + ' €/Jahr' : 'unbekannt'} angegeben (nur verwenden, falls relevant für Verhandlungen).

Gib ausschließlich den Text der E-Mail ohne Betreffzeile, Markdowns oder sonstige Erklärungen zurück.`;

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                temperature: temp
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return textResult;
    },

    async parseCVText(apiKey, cvText) {
        if (!cvText || !cvText.trim()) {
            throw new Error("Lebenslauf-Text ist leer.");
        }

        if (apiKey && apiKey.trim()) {
            return this.parseRealCVText(apiKey, cvText);
        }

        // Mock heuristic parser
        return new Promise((resolve) => {
            setTimeout(() => {
                const lines = cvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                let name = "Alex Neumann";
                let title = "Software Entwickler";
                
                if (lines.length > 0) {
                    name = lines[0];
                }
                if (lines.length > 1) {
                    title = lines[1];
                }

                // Extract skills
                const foundSkills = this.extractKeywords(cvText);
                const skills = foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));

                // Take first 5 lines as experience preview
                const experience = lines.slice(2, 8).map(l => "- " + l).join('\n');

                resolve({
                    name,
                    title,
                    skills,
                    experience
                });
            }, 1000);
        });
    },

    async parseRealCVText(apiKey, cvText) {
        const profile = storage.getProfile();
        const model = profile.geminiModel || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const systemInstruction = "Du bist ein intelligenter Lebenslauf-Extraktor. Analysiere den bereitgestellten Text eines Lebenslaufs und extrahiere strukturierte Profildaten auf Deutsch.";
        const promptText = `Analysiere den folgenden Lebenslauf-Text und extrahiere die Kerndaten des Bewerbers:
---
${cvText}
---

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- name: Der vollständige Name der Person
- title: Die aktuelle Berufsbezeichnung / der Hauptfokus (z. B. "Frontend Entwickler" oder "UI/UX Designer")
- skills: Ein flaches Array von Strings mit den wichtigsten fachlichen Skills und Technologien (z. B. ["React", "JavaScript", "Figma", "CSS"])
- experience: Eine stichpunktartige Zusammenfassung der Berufserfahrung / des Werdegangs (als Liste mit Bindestrichen, max. 1000 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                name: { type: "STRING" },
                title: { type: "STRING" },
                skills: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                experience: { type: "STRING" }
            },
            required: ["name", "title", "skills", "experience"]
        };

        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    async negotiateSalary(apiKey, jobTitle, company, targetSalary, minSalary, persona, history, userMessage) {
        if (apiKey && apiKey.trim()) {
            return this.negotiateRealSalary(apiKey, jobTitle, company, targetSalary, minSalary, persona, history, userMessage);
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const round = Math.floor(history.length / 2) + 1; // 1 to 3
                let text = "";
                let endNegotiation = false;
                let finalSalary = null;
                let rating = null;
                let feedback = null;

                if (round === 1) {
                    const lowball = Math.round(minSalary * 0.9);
                    text = `Hallo! Schön, dass wir über die Konditionen sprechen. Für die Position als ${jobTitle} bei ${company} haben wir ein Budget geplant. Ihre Vorstellung liegt etwas über unserem Rahmen. Wir könnten Ihnen zum Einstieg ein Grundgehalt von ${lowball.toLocaleString('de-DE')} € anbieten. Was sagen Sie dazu?`;
                } else if (round === 2) {
                    const counter = Math.round(minSalary * 0.97);
                    text = `Ich verstehe Ihre Argumente bezüglich Ihrer Erfahrung. Allerdings müssen wir auch die interne Gehaltsstruktur berücksichtigen. Ich habe mit der Fachabteilung Rücksprache gehalten: Wir könnten uns auf ${counter.toLocaleString('de-DE')} € sowie zusätzliche Benefits (z. B. ÖPNV-Ticket oder Weiterbildungsbudget) einigen. Liegt das in Ihrem Bereich?`;
                } else {
                    endNegotiation = true;
                    finalSalary = Math.round((parseFloat(targetSalary) + parseFloat(minSalary)) / 2);
                    rating = 80;
                    feedback = "Gute Argumentation über persönliche Qualifikationen. Etwas mehr Flexibilität bei Zusatzleistungen hätte die Verhandlung beschleunigen können.";
                    text = `Das ist unser absolutes Limit: Wir bieten Ihnen ${finalSalary.toLocaleString('de-DE')} € als fixes Jahresbruttogehalt. Mehr lässt unser Budgetrahmen für diese Position leider nicht zu. Wir würden uns sehr freuen, Sie an Bord zu haben!`;
                }

                resolve({ text, endNegotiation, finalSalary, rating, feedback });
            }, 1000);
        });
    },

    async negotiateRealSalary(apiKey, jobTitle, company, targetSalary, minSalary, persona, history, userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const historyText = history.map(h => `${h.sender === 'user' ? 'Kandidat' : 'Recruiter'}: "${h.text}"`).join('\n');
        const round = Math.floor(history.length / 2) + 1;

        const systemInstruction = `Du bist ein professioneller Personalvermittler (Recruiter) und verhandelst das Gehalt für die Stelle als "${jobTitle}" bei der Firma "${company}".
Der Wunschgehalt des Kandidaten ist ${targetSalary} € und die absolute Schmerzgrenze des Kandidaten ist ${minSalary} €.
Deine Verhandlungspersönlichkeit ist "${persona === 'tough' ? 'Hart aber fair (Hinterfragt Argumente stark, fordert Belege)' : persona === 'friendly' ? 'Freundlich & kompromissbereit (Gibt schneller nach, bietet Zusatzleistungen an)' : 'Strikte Budgetgrenze (Sehr preisbewusst, betont Budgetlimits)'}".

Aktuelle Verhandlungsrunde: ${round} von 3.
Bisheriger Verlauf:
${historyText}

Der Kandidat sagt jetzt: "${userMessage}"

Verhalte dich entsprechend deiner Rolle und antworte auf Deutsch.
Generiere eine JSON-Antwort im folgenden Format:
{
  "text": "Deine direkte wörtliche Rede als Recruiter...",
  "endNegotiation": false,
  "finalSalary": null,
  "rating": null,
  "feedback": null
}

WICHTIG:
Wenn das die 3. Runde ist (d.h. der Kandidat hat jetzt zum 3. Mal geantwortet), MUSS die Verhandlung beendet werden ("endNegotiation": true).
Entscheide dich für ein faires Gehaltsangebot (eine Zahl zwischen ${minSalary} und ${targetSalary}) basierend auf der Argumentationsstärke des Kandidaten.
Setze in diesem Fall:
- "endNegotiation": true
- "finalSalary": das vereinbarte Jahresbruttogehalt als Zahl (z. B. 62500)
- "rating": Bewertung der Verhandlungsgeschicklichkeit des Kandidaten von 0 bis 100
- "feedback": 2-3 Sätze konstruktives Feedback dazu, wie geschickt der Kandidat verhandelt hat.`;

        const requestBody = {
            contents: [{ parts: [{ text: systemInstruction }] }],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Fehler bei der Gemini-API-Anfrage.");
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error("Keine Antwort erhalten.");
        
        return JSON.parse(textResult);
    },

    /**
     * Generates a 360° Company Research Briefing
     */
    async generateCompanyResearch(companyName, jobTitle) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    company: companyName,
                    overview: `${companyName} ist ein führender Anbieter im Bereich moderner Softwarelösungen und digitaler Produkte. Das Unternehmen zeichnet sich durch agile Teams und eine innovative Kultur aus.`,
                    keyFacts: [
                        'Fokus auf moderne Web-Technologien und User-Experience',
                        'Flache Hierarchien und transparente Kommunikation',
                        'Hoher Anspruch an Code-Qualität und kontinuierliche Weiterbildung'
                    ],
                    suggestedQuestions: [
                        `Wie sieht ein typischer Sprint-Cycle im Team für die Rolle als ${jobTitle} aus?`,
                        `Auf welche Herausforderung konzentriert sich die Abteilung in den nächsten 6 Monaten?`,
                        `Welche Entwicklungs- und Weiterbildungsmöglichkeiten bietet ${companyName}?`
                    ]
                });
            }, 800);
        });
    },

    /**
     * Parses raw incoming emails for application status updates
     */
    parseEmailStatusUpdate(emailContent) {
        if (!emailContent) return null;
        const text = emailContent.toLowerCase();

        let detectedStatus = 'applied';
        let statusLabel = 'Eingegangen / Unterlagen gesendet';
        let confidence = 'mittel';

        if (text.includes('einladung') || text.includes('gespräch') || text.includes('interview') || text.includes('termin')) {
            detectedStatus = 'interviewing';
            statusLabel = 'Einladung zum Vorstellungsgespräch';
            confidence = 'hoch';
        } else if (text.includes('angebot') || text.includes('zusage') || text.includes('freuen uns sehr Ihnen') || text.includes('vertrag')) {
            detectedStatus = 'offer';
            statusLabel = 'Angebot erhalten / Zusage';
            confidence = 'hoch';
        } else if (text.includes('absage') || text.includes('leider') || text.includes('nicht berücksichtigen') || text.includes('anderweitig entschieden')) {
            detectedStatus = 'rejected';
            statusLabel = 'Absage erhalten';
            confidence = 'hoch';
        }

        return {
            detectedStatus,
            statusLabel,
            confidence,
            summary: emailContent.slice(0, 180) + '...'
        };
    }
};


