/**
 * iCal & Google Calendar Generator for Appointment Scheduling
 */

export function initIcalGenerator() {
    const bookingBtn = document.getElementById('confirm-booking-btn');
    const slotsContainer = document.getElementById('booking-slots-container');
    const successDiv = document.getElementById('booking-success');
    if (!bookingBtn || !slotsContainer) return;

    let selectedTime = null;

    slotsContainer.querySelectorAll('.btn-slot').forEach(btn => {
        btn.addEventListener('click', () => {
            slotsContainer.querySelectorAll('.btn-slot').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = btn.dataset.time || '10:00';
            bookingBtn.classList.remove('display-none');
        });
    });

    bookingBtn.addEventListener('click', () => {
        if (!selectedTime) return;

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 2); // 2 days from now
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');

        const [hours, minutes] = selectedTime.split(':');
        const startISO = `${year}${month}${day}T${hours}${minutes}00`;
        const endHours = String(parseInt(hours, 10) + 1).padStart(2, '0');
        const endISO = `${year}${month}${day}T${endHours}${minutes}00`;

        const title = 'Kennenlerngespräch - Maximilian Schenk (FIAE)';
        const description = 'Kennenlerngespräch bezüglich Fachinformatiker Anwendungsentwicklung Position. Website: https://max-schenk.de';
        const location = 'Online Meeting (Teams / Zoom)';

        // 1. Generate Google Calendar URL
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

        // 2. Generate iCal File Content
        const icsData = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Maximilian Schenk Portfolio//DE',
            'BEGIN:VEVENT',
            `SUMMARY:${title}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            `DTSTART:${startISO}`,
            `DTEND:${endISO}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        if (successDiv) {
            successDiv.classList.remove('display-none');
            successDiv.innerHTML = `
                <div class="margin-bottom-0-5rem">
                    ✅ Termin angebahnt für ${day}.${month}.${year} um ${selectedTime} Uhr!
                </div>
                <div class="d-flex flex-wrap gap-2 justify-center margin-top-0-5rem">
                    <a href="${gcalUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary border-radius-4px font-size-0-8rem">
                        <i class="fa-brands fa-google me-1"></i> Google Calendar
                    </a>
                    <button type="button" id="btn-download-ics" class="btn btn-sm btn-primary border-radius-4px font-size-0-8rem">
                        <i class="fa-solid fa-calendar-plus me-1"></i> .ics iCal Datei
                    </button>
                </div>
            `;

            const csBtn = successDiv.querySelector('#btn-download-ics');
            if (csBtn) {
                csBtn.addEventListener('click', () => {
                    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Kennenlerngespraech-Maximilian-Schenk.ics`;
                    link.click();
                });
            }
        }
    });
}
