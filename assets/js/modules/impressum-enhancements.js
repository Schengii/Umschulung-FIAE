/**
 * Impressum Enhancements Module
 * Handles interactive booking slot selection and GDPR-compliant 2-click Google Maps.
 */
export function initImpressumEnhancements() {
    // 1. Two-Click Google Maps activation
    const mapContainers = document.querySelectorAll('.map-2click-container');
    mapContainers.forEach(container => {
        const btn = container.querySelector('.btn-load-map');
        const src = container.getAttribute('data-map-src');
        const title = container.getAttribute('data-title') || 'Google Maps';

        if (btn && src) {
            btn.addEventListener('click', () => {
                const iframe = document.createElement('iframe');
                iframe.setAttribute('title', title);
                iframe.setAttribute('src', src);
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('loading', 'lazy');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.minHeight = '250px';
                iframe.style.border = 'none';
                iframe.style.borderRadius = 'var(--border-radius-md, 8px)';

                container.innerHTML = '';
                container.appendChild(iframe);
            });
        }
    });

    // 2. Booking slots selection
    const slots = document.querySelectorAll('#booking-slots-container .btn-slot');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    const successDiv = document.getElementById('booking-success');

    if (!slots.length || !confirmBtn || !successDiv) return;

    let selectedSlot = null;

    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            slots.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            selectedSlot = slot.getAttribute('data-time');
            confirmBtn.style.display = 'block';
        });
    });

    confirmBtn.addEventListener('click', () => {
        if (!selectedSlot) return;
        confirmBtn.style.display = 'none';
        const slotsContainer = document.getElementById('booking-slots-container');
        if (slotsContainer) slotsContainer.style.display = 'none';
        successDiv.style.display = 'block';
    });
}
