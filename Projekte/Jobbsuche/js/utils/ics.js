/**
 * Generiert eine .ics-Datei für Kalenderanwendungen und startet den Download.
 * 
 * @param {string} title - Der Titel des Termins.
 * @param {string} company - Das Unternehmen.
 * @param {string} dateStr - Das Zieldatum (YYYY-MM-DD).
 * @param {string} description - Optionale Beschreibung.
 */
export function downloadCalendarEvent(title, company, dateStr, description = '') {
    const date = new Date(dateStr);
    
    date.setUTCHours(9, 0, 0);
    const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const cleanDesc = description.replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const cleanTitle = `Frist: ${title} (${company})`.replace(/,/g, '\\,').replace(/;/g, '\\;');
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JobMatch//DE',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `SUMMARY:${cleanTitle}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `DESCRIPTION:${cleanDesc}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `deadline_${company.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Generiert einen direkten Link zum Hinzufügen eines Termins in Google Calendar.
 */
export function generateGoogleCalendarUrl(title, company, dateStr, details = '') {
    const date = new Date(dateStr);
    date.setUTCHours(9, 0, 0);
    const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const text = encodeURIComponent(`Bewerbung: ${title} (${company})`);
    const detailsEnc = encodeURIComponent(details);
    const dates = `${startStr}/${endStr}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${detailsEnc}`;
}

/**
 * Generiert einen direkten Link zum Hinzufügen eines Termins in Outlook Web / Office 365.
 */
export function generateOutlookCalendarUrl(title, company, dateStr, details = '') {
    const date = new Date(dateStr);
    date.setUTCHours(9, 0, 0);
    const startStr = date.toISOString();
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    const endStr = endDate.toISOString();

    const subject = encodeURIComponent(`Bewerbung: ${title} (${company})`);
    const body = encodeURIComponent(details);

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${encodeURIComponent(startStr)}&enddt=${encodeURIComponent(endStr)}&body=${body}`;
}


/**
 * Exportiert alle aktiven Fristen und Termine aller Jobs in einer einzelnen .ics-Datei.
 */
export function downloadAllCalendarEventsBundle(jobs = []) {
    const events = [];

    jobs.forEach(job => {
        if (job.deadline) {
            const date = new Date(job.deadline);
            date.setUTCHours(9, 0, 0);
            const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const endDate = new Date(date.getTime() + 60 * 60 * 1000);
            const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            events.push([
                'BEGIN:VEVENT',
                `SUMMARY:Frist: ${job.title} (${job.company})`,
                `DTSTART:${startStr}`,
                `DTEND:${endStr}`,
                `DESCRIPTION:Bewerbungsfrist für ${job.title} bei ${job.company}`,
                'STATUS:CONFIRMED',
                'END:VEVENT'
            ].join('\r\n'));
        }

        if (job.interviews && Array.isArray(job.interviews)) {
            job.interviews.forEach(inv => {
                if (inv.date) {
                    const date = new Date(inv.date);
                    date.setUTCHours(10, 0, 0);
                    const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
                    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                    events.push([
                        'BEGIN:VEVENT',
                        `SUMMARY:Vorstellungsgespräch: ${job.title} (${job.company})`,
                        `DTSTART:${startStr}`,
                        `DTEND:${endStr}`,
                        `DESCRIPTION:Interview-Termin mit ${job.company}. Notizen: ${inv.notes || 'Keine'}`,
                        'STATUS:CONFIRMED',
                        'END:VEVENT'
                    ].join('\r\n'));
                }
            });
        }
    });

    if (events.length === 0) {
        alert("Keine Fristen oder Termine vorhanden zum Exportieren.");
        return;
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JobMatch Bundle//DE',
        'CALSCALE:GREGORIAN',
        ...events,
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `jobmatch_all_deadlines.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
}
