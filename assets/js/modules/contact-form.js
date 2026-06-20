/**
 * Contact Form Module — triggers mailto
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

        // Show feedback message
        if (feedback) feedback.style.display = 'block';

        // Trigger mailto
        const subject = encodeURIComponent(`Portfolio Kontakt: ${name.value}`);
        const body = encodeURIComponent(`${message.value}\n\n--\nGesendet von: ${name.value} (${email.value})`);
        window.location.href = `mailto:info@Max-Schenk.de?subject=${subject}&body=${body}`;

        // Reset the form
        form.reset();

        if (feedback) {
            setTimeout(() => { feedback.style.display = 'none'; }, 5000);
        }
    });
}
