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

        // Check if Web3Forms key is set
        if (typeof APP !== 'undefined' && APP.WEB3FORMS_KEY) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> <span lang="de">Wird gesendet...</span><span lang="en">Sending...</span>';
                // Trigger translation update for button loader text
                const currentLang = document.documentElement.getAttribute('lang') || 'de';
                document.dispatchEvent(new CustomEvent('langchange', { detail: currentLang }));
            }

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: APP.WEB3FORMS_KEY,
                    name: name.value,
                    email: email.value,
                    message: message.value,
                    subject: `Portfolio Kontakt: ${name.value}`
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.className = 'form-feedback success';
                        feedback.innerHTML = '<span lang="de">Nachricht erfolgreich gesendet!</span><span lang="en">Message sent successfully!</span>';
                    }
                    form.reset();
                } else {
                    throw new Error(data.message || 'Web3Forms error');
                }
            })
            .catch(err => {
                console.warn('Web3Forms failed, falling back to mailto:', err);
                if (feedback) {
                    feedback.style.display = 'block';
                    feedback.className = 'form-feedback warning';
                    feedback.innerHTML = '<span lang="de">Fehler beim Senden. Mail-Programm wird geöffnet...</span><span lang="en">Error sending. Opening mail client...</span>';
                }
                setTimeout(() => {
                    _triggerMailto(name.value, email.value, message.value);
                }, 1000);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
                const currentLang = document.documentElement.getAttribute('lang') || 'de';
                document.dispatchEvent(new CustomEvent('langchange', { detail: currentLang }));
                
                if (feedback) {
                    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
                }
            });
        } else {
            // No key, trigger mailto directly
            if (feedback) {
                feedback.style.display = 'block';
                feedback.className = 'form-feedback info';
                feedback.innerHTML = '<span lang="de">E-Mail-Programm wird geöffnet...</span><span lang="en">Opening mail client...</span>';
                const currentLang = document.documentElement.getAttribute('lang') || 'de';
                document.dispatchEvent(new CustomEvent('langchange', { detail: currentLang }));
            }
            _triggerMailto(name.value, email.value, message.value);
            form.reset();
            if (feedback) {
                setTimeout(() => { feedback.style.display = 'none'; }, 5000);
            }
        }
    });
}

function _triggerMailto(name, email, message) {
    const subject = encodeURIComponent(`Portfolio Kontakt von ${name}`);
    const body = encodeURIComponent(`${message}\n\n--\nGesendet von: ${name} (${email})`);
    window.location.href = `mailto:sche-max@web.de?subject=${subject}&body=${body}`;
}
