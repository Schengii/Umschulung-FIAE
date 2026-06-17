/**
 * Contact Form Module — simulated submission
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.removeAttribute('onsubmit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const message = document.getElementById('contact-message');
        const feedback = document.getElementById('form-feedback');

        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) return;

        if (feedback) feedback.style.display = 'block';
        form.reset();

        if (feedback) {
            setTimeout(() => { feedback.style.display = 'none'; }, 5000);
        }
    });
}
