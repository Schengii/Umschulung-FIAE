/**
 * Email & Interview Date Auto-Parser Utility for JobMatch
 * Extracts dates, times, recruiters, video links (Zoom/Teams/Meet), and event titles
 * from raw email text or uploaded .eml files.
 */

export const emailParser = {
    /**
     * Parses raw text or email content and extracts event structured data
     * @param {string} emailText 
     * @returns {Object} Extracted event information
     */
    parseEmail(emailText = '') {
        const text = emailText.trim();
        if (!text) return null;

        // 1. Detect Meeting Video Links
        const zoomMatch = text.match(/https:\/\/[a-zA-Z0-9-]+\.zoom\.us\/j\/[^\s<>"]+/i);
        const teamsMatch = text.match(/https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"]+/i);
        const meetMatch = text.match(/https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i);

        const videoLink = zoomMatch ? zoomMatch[0] : teamsMatch ? teamsMatch[0] : meetMatch ? meetMatch[0] : '';
        const platform = zoomMatch ? 'Zoom' : teamsMatch ? 'Microsoft Teams' : meetMatch ? 'Google Meet' : 'Online / Telefon';

        // 2. Detect Date (German formats: 15.08.2026 or 15. August 2026)
        const dateMatch = text.match(/(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|\d{1,2})\.?\s*(\d{4})?/i);
        let extractedDate = new Date();

        if (dateMatch) {
            const day = parseInt(dateMatch[1], 10);
            const monthStr = dateMatch[2];
            let monthIdx = new Date().getMonth();

            const monthNames = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
            if (isNaN(monthStr)) {
                const foundIdx = monthNames.findIndex(m => m.startsWith(monthStr.toLowerCase().slice(0, 3)));
                if (foundIdx !== -1) monthIdx = foundIdx;
            } else {
                monthIdx = parseInt(monthStr, 10) - 1;
            }

            const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
            extractedDate = new Date(year, monthIdx, day);
        }

        // 3. Detect Time (14:30 Uhr or 14:30)
        const timeMatch = text.match(/(\d{1,2})[:.](\d{2})\s*(Uhr)?/i);
        let timeStr = '10:00';
        if (timeMatch) {
            const hour = timeMatch[1].padStart(2, '0');
            const min = timeMatch[2].padStart(2, '0');
            timeStr = `${hour}:${min}`;
        }

        // 4. Detect Recruiter / Sender Name
        const recruiterMatch = text.match(/(mit freundlichen grüßen|viele grüße|beste grüße|grüße)\s*[\r\n]+([a-zA-ZäöüÄÖÜß\s]+)/i);
        const recruiterName = recruiterMatch ? recruiterMatch[2].trim().split('\n')[0] : '';

        // 5. Detect Job / Subject Title
        const titleMatch = text.match(/(vorstellungsgespräch|interview|erstgespräch|einladung|stelle als|position als)\s*:?\s*([a-zA-ZäöüÄÖÜß0-9\s-]+)/i);
        const eventTitle = titleMatch ? titleMatch[0].trim() : 'Vorstellungsgespräch';

        return {
            title: eventTitle,
            dateIso: extractedDate.toISOString().split('T')[0],
            time: timeStr,
            platform,
            videoLink,
            recruiterName,
            rawSnippet: text.slice(0, 200) + '...'
        };
    }
};
