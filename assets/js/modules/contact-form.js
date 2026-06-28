/**
 * Contact Form Module — triggers mailto
 * Handles both #contact-form (impressum.html) and #hire-me-form (portfolio.html).
 */
function initContactForm() {
    // Handle main contact form (impressum.html)
    _bindContactForm('contact-form', 'contact-name', 'contact-email', 'contact-message', 'form-feedback');
    // Handle hire-me form (portfolio.html) — uses distinct IDs to avoid conflicts
    _bindContactForm('hire-me-form', 'hire-me-name', 'hire-me-email', 'hire-me-message', 'hire-me-feedback');
}

function _bindContactForm(formId, nameId, emailId, messageId, feedbackId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.removeAttribute('onsubmit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById(nameId);
        const email = document.getElementById(emailId);
        const message = document.getElementById(messageId);
        const feedback = document.getElementById(feedbackId);

        if (!name || !email || !message) return;
        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) return;

        // Show feedback message
        if (feedback) feedback.style.display = 'block';

        // Trigger mailto
        const subject = encodeURIComponent(`Portfolio Kontakt: ${name.value}`);
        const body = encodeURIComponent(`${message.value}\n\n--\nGesendet von: ${name.value} (${email.value})`);
        window.location.href = `mailto:sche-max@web.de?subject=${subject}&body=${body}`;

        // Reset the form
        form.reset();

        if (feedback) {
            setTimeout(() => { feedback.style.display = 'none'; }, 5000);
        }
    });
}
