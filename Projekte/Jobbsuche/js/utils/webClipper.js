/**
 * Web Clipper & Bookmarklet Utility for JobMatch
 * Generates browser bookmarklet code and processes clipped job JSON payloads.
 */

export const webClipper = {
    /**
     * Generates executable JavaScript Bookmarklet code string
     * @returns {string} Bookmarklet URL code
     */
    getBookmarkletCode() {
        const code = `javascript:(function(){
            var title = document.querySelector('h1')?.innerText?.trim() || document.title;
            var company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link, [class*="company"]')?.innerText?.trim() || 'Unbekannte Firma';
            var location = document.querySelector('.job-details-jobs-unified-top-card__bullet, [class*="location"]')?.innerText?.trim() || 'Remote / Deutschland';
            var desc = document.querySelector('#job-details, .description, [class*="description"]')?.innerText?.trim() || document.body.innerText.slice(0, 1000);
            
            var jobData = {
                title: title,
                company: company,
                location: location,
                description: desc,
                url: window.location.href,
                status: 'saved',
                workMode: location.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid'
            };
            
            var targetUrl = 'http://localhost:5173/?clip_job=' + encodeURIComponent(JSON.stringify(jobData));
            window.open(targetUrl, '_blank');
        })();`;
        return code.replace(/\s+/g, ' ');
    },

    /**
     * Parses clipped job payload from URL parameter or JSON string
     * @param {string} rawPayload 
     * @returns {Object|null} Formatted job item
     */
    parseClippedPayload(rawPayload) {
        if (!rawPayload) return null;
        try {
            const data = typeof rawPayload === 'string' ? JSON.parse(decodeURIComponent(rawPayload)) : rawPayload;
            if (!data.title && !data.company) return null;
            return {
                title: data.title || 'Neues Stellenangebot',
                company: data.company || 'Unbekannt',
                location: data.location || 'Remote',
                workMode: data.workMode || 'Remote',
                salary: Number(data.salary) || 60000,
                description: data.description || '',
                url: data.url || '',
                status: data.status || 'saved',
                ratings: { salary: 6, commute: 8, remote: 8, culture: 7, tech: 7 }
            };
        } catch (e) {
            console.warn('Failed to parse clipped job payload:', e);
            return null;
        }
    }
};
