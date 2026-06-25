/**
 * Countdown Module — IHK Exam Countdown Timer
 * Shows completion message if the target date is in the past.
 */
function initCountdown() {
    const targetDate = new Date(APP.IHK_TARGET_DATE).getTime();

    const daysVal = document.getElementById('cd-days');
    const hoursVal = document.getElementById('cd-hours');
    const minsVal = document.getElementById('cd-minutes');
    const secsVal = document.getElementById('cd-seconds');

    if (!daysVal || !hoursVal || !minsVal || !secsVal) return;

    // Check if exam is already done
    const now = new Date().getTime();
    if (targetDate - now <= 0) {
        // Show completion state instead of zeros
        const countdownBox = daysVal.closest('.countdown-box, .countdown, [class*="countdown"]');
        const wrapper = countdownBox ? countdownBox.parentElement : daysVal.parentElement;
        if (wrapper) {
            const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
            wrapper.innerHTML = `<div class="countdown-done" style="text-align:center; padding: 1rem; font-size: 1.1rem; font-weight: 600; color: var(--primary);">
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <span lang="de"> IHK-Prüfung am 08.06.2026 erfolgreich abgeschlossen! 🎉</span>
                <span lang="en"> IHK exam on June 8, 2026 successfully completed! 🎉</span>
            </div>`;
        } else {
            daysVal.textContent = '✓';
            hoursVal.textContent = '✓';
            minsVal.textContent = '✓';
            secsVal.textContent = '✓';
        }
        return;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            clearInterval(interval);
            daysVal.textContent = '00';
            hoursVal.textContent = '00';
            minsVal.textContent = '00';
            secsVal.textContent = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysVal.textContent = String(days).padStart(2, '0');
        hoursVal.textContent = String(hours).padStart(2, '0');
        minsVal.textContent = String(minutes).padStart(2, '0');
        secsVal.textContent = String(seconds).padStart(2, '0');
    }

    function updateLabels() {
        const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
        const labels = {
            de: { days: 'Tage', hours: 'Stunden', mins: 'Minuten', secs: 'Sekunden' },
            en: { days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds' }
        };
        const currentLabels = labels[lang] || labels.de;

        const lDays = document.getElementById('cd-label-days');
        const lHours = document.getElementById('cd-label-hours');
        const lMins = document.getElementById('cd-label-mins');
        const lSecs = document.getElementById('cd-label-secs');

        if (lDays) lDays.textContent = currentLabels.days;
        if (lHours) lHours.textContent = currentLabels.hours;
        if (lMins) lMins.textContent = currentLabels.mins;
        if (lSecs) lSecs.textContent = currentLabels.secs;
    }

    updateCountdown();
    updateLabels();
    const interval = setInterval(updateCountdown, 1000);
    document.addEventListener('langchange', updateLabels);
}
