/**
 * QR-Code & Link Generator Module
 * Generates recruiter personalized landing page links and downloadable QR codes.
 */
import { createQrDataUrl } from './qr-local.js';

export function initQrGenerator() {
    const companyInput = /** @type {HTMLInputElement} */ (document.getElementById('qr-company-input'));
    const nameInput = /** @type {HTMLInputElement} */ (document.getElementById('qr-name-input'));
    const targetSelect = /** @type {HTMLSelectElement} */ (document.getElementById('qr-target-select'));

    const placeholder = document.getElementById('qr-code-placeholder');
    const imageContainer = document.getElementById('qr-code-image-container');
    const resultDetails = document.getElementById('qr-result-details');
    const instructionText = document.getElementById('qr-instruction-text');
    const generatedLinkInput = /** @type {HTMLInputElement} */ (document.getElementById('qr-generated-link'));

    const copyBtn = document.getElementById('qr-copy-btn');
    const downloadBtn = document.getElementById('qr-download-btn');

    if (!companyInput || !nameInput || !targetSelect) return;

    let debounceTimeout = null;

    // Helper to calculate the base URL path
    function getBaseUrl() {
        if (window.location.protocol === 'file:') {
            return 'https://www.max-schenk.tech';
        }
        // Extract base folder (handling subfolders if hosted in a subdirectory)
        const path = window.location.pathname;
        const folder = path.substring(0, path.lastIndexOf('/'));
        return window.location.origin + folder;
    }

    function generateLink() {
        const companyVal = companyInput.value.trim();
        const nameVal = nameInput.value.trim();
        const targetPage = targetSelect.value;

        if (!companyVal && !nameVal) {
            // Hide preview if fields are empty
            placeholder.style.display = 'block';
            imageContainer.style.display = 'none';
            resultDetails.style.display = 'none';
            instructionText.style.display = 'block';
            return;
        }

        const base = getBaseUrl();
        let targetUrl = `${base}/${targetPage}`;
        const params = [];

        if (companyVal) params.push(`c=${encodeURIComponent(companyVal)}`);
        if (nameVal) params.push(`n=${encodeURIComponent(nameVal)}`);

        if (params.length > 0) {
            targetUrl += '?' + params.join('&');
        }

        // Update the textual URL preview
        generatedLinkInput.value = targetUrl;

        // Render the QR code locally; the personalised link never leaves the browser.
        imageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.alt = `QR Code pointing to ${targetUrl}`;
        img.style.width = '180px';
        img.style.height = '180px';
        img.style.display = 'block';
        img.style.margin = '0 auto';

        img.onload = () => {
            placeholder.style.display = 'none';
            instructionText.style.display = 'none';
            imageContainer.style.display = 'block';
            resultDetails.style.display = 'block';
        };

        img.onerror = () => {
            placeholder.style.display = 'none';
            instructionText.style.display = 'none';
            imageContainer.style.display = 'block';
            resultDetails.style.display = 'block';
            imageContainer.innerHTML = `
                <div class="qr-error-notice" style="color: var(--danger, #ef4444); text-align: center; padding: 1rem;">
                    <i class="fa fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem;" aria-hidden="true"></i>
                    <p lang="de">QR-Code konnte nicht geladen werden (der Link ist zu lang für einen QR-Code). Der personalisierte Link oben bleibt gültig.</p>
                    <p lang="en">QR code could not be loaded (the link is too long for a QR code). The personalised link above remains valid.</p>
                </div>
            `;
        };

        imageContainer.appendChild(img);
        try {
            img.src = createQrDataUrl(targetUrl);
        } catch (_e) {
            img.onerror(new Event('error'));
        }
    }

    // Event listeners with simple debouncing for typing fields
    function triggerUpdate() {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(generateLink, 250);
    }

    companyInput.addEventListener('input', triggerUpdate);
    nameInput.addEventListener('input', triggerUpdate);
    targetSelect.addEventListener('change', generateLink);

    // Copy to Clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const url = generatedLinkInput.value;
            if (!url) return;

            navigator.clipboard
                .writeText(url)
                .then(() => {
                    const lang = document.documentElement.getAttribute('lang') || 'de';
                    const originalText = copyBtn.innerHTML;

                    copyBtn.style.backgroundColor = '#10b981';
                    copyBtn.innerHTML = `
                    <i class="fa fa-check" aria-hidden="true"></i>
                    <span lang="de">Kopiert!</span>
                    <span lang="en">Copied!</span>
                `;

                    // Trigger translation listener just in case
                    if (typeof initTranslation === 'function') {
                        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
                    }

                    // Show toast notification if available
                    if (typeof window.showToast === 'function') {
                        const msg = lang === 'de' ? 'Link erfolgreich kopiert!' : 'Link successfully copied!';
                        window.showToast(msg, 'success');
                    }

                    setTimeout(() => {
                        copyBtn.style.backgroundColor = '';
                        copyBtn.innerHTML = originalText;
                        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
                    }, 1500);
                })
                .catch((err) => {
                    console.error('Failed to copy text: ', err);
                });
        });
    }

    // Download QR Code image
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const urlInput = generatedLinkInput.value;
            if (!urlInput) return;

            const companyVal = companyInput.value.trim() || 'Recruiter';
            const cleanFilename = `qr_code_${companyVal.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;

            // Get current loaded image element src
            const img = imageContainer.querySelector('img');
            if (!img) return;

            // The QR code is a local SVG data URL, so it can be saved directly (no fetch needed).
            const link = document.createElement('a');
            link.href = img.src;
            link.download = cleanFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (typeof window.showToast === 'function') {
                const lang = document.documentElement.getAttribute('lang') || 'de';
                const msg = lang === 'de' ? 'QR-Code Download gestartet!' : 'QR code download started!';
                window.showToast(msg, 'success');
            }
        });
    }

    // Moved off inline onsubmit/onclick attributes (CSP script-src hardening)
    const generatorForm = document.getElementById('qr-generator-form');
    if (generatorForm) {
        generatorForm.addEventListener('submit', (e) => e.preventDefault());
    }
    generatedLinkInput.addEventListener('click', () => generatedLinkInput.select());
}
