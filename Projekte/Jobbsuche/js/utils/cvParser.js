/**
 * CV & LinkedIn PDF Parser Utility for JobMatch
 * Uses PDF.js to extract text content from PDF resumes or LinkedIn exports
 * and extracts skills, experience keywords, email, and candidate info.
 */

export const cvParser = {
    /**
     * Extracts full raw text content from a PDF ArrayBuffer or File
     * @param {File|ArrayBuffer} pdfSource 
     * @returns {Promise<string>}
     */
    async extractTextFromPdf(pdfSource) {
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library is not loaded.');
        }

        let arrayBuffer;
        if (pdfSource instanceof File) {
            arrayBuffer = await pdfSource.arrayBuffer();
        } else {
            arrayBuffer = pdfSource;
        }

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    },

    /**
     * Parses candidate skills, contact info, and experience from raw text
     * @param {string} text 
     * @returns {Object} Structured CV Data
     */
    parseCvText(text = '') {
        const textLower = text.toLowerCase();

        // 1. Email extraction
        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
        const email = emailMatch ? emailMatch[0] : '';

        // 2. Phone extraction
        const phoneMatch = text.match(/(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        // 3. Known Skill Keywords taxonomy
        const knownSkills = [
            'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express',
            'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 'C++',
            'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'SQL', 'PostgreSQL', 'MongoDB',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD',
            'REST API', 'GraphQL', 'Figma', 'UI/UX', 'Agile', 'Scrum', 'Kanban',
            'Projektmanagement', 'Projektleiter', 'Marketing', 'Sales', 'Design'
        ];

        const detectedSkills = knownSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
            return regex.test(text);
        });

        // 4. Extract first line or name candidate
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        const nameCandidate = lines.length > 0 ? lines[0] : '';

        return {
            nameCandidate,
            email,
            phone,
            detectedSkills,
            rawTextLength: text.length
        };
    }
};
