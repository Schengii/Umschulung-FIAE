/**
 * Impressum Enhancements Module
 * Handles interactive booking slot selection and confirmation mock.
 */
export function initImpressumEnhancements() {
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
        document.getElementById('booking-slots-container').style.display = 'none';
        successDiv.style.display = 'block';
    });
}
