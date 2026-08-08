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
    
    // Format DTSTART: YYYYMMDDTHHMMSSZ (Wir setzen standardmäßig 09:00 Uhr UTC)
    date.setUTCHours(9, 0, 0);
    const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Format DTEND: 1 Stunde später (10:00 Uhr UTC)
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Zeilenumbrüche für iCalendar escapen
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
