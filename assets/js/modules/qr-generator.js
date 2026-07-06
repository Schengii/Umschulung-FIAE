/**
 * QR-Code & Link Generator Module
 * Generates recruiter personalized landing page links and downloadable QR codes.
 */
function initQrGenerator() {
    const companyInput = document.getElementById('qr-company-input');
    const nameInput = document.getElementById('qr-name-input');
    const targetSelect = document.getElementById('qr-target-select');

    const placeholder = document.getElementById('qr-code-placeholder');
    const imageContainer = document.getElementById('qr-code-image-container');
    const resultDetails = document.getElementById('qr-result-details');
    const instructionText = document.getElementById('qr-instruction-text');
    const generatedLinkInput = document.getElementById('qr-generated-link');

    const copyBtn = document.getElementById('qr-copy-btn');
    const downloadBtn = document.getElementById('qr-download-btn');

    if (!companyInput || !nameInput || !targetSelect) return;

    let debounceTimeout = null;

    // Helper to calculate the base URL path
    function getBaseUrl() {
        if (window.location.protocol === 'file:') {
            return 'https://max-schenk.de';
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

        // Generate QR code URL (using the free api.qrserver.com API, 300x300, 10px margin)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&margin=10`;

        // Load QR Code image
        imageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = qrApiUrl;
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

        imageContainer.appendChild(img);
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

            navigator.clipboard.writeText(url).then(() => {
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
            }).catch(err => {
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
            const cleanFilename = `qr_code_${companyVal.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;

            // Get current loaded image element src
            const img = imageContainer.querySelector('img');
            if (!img) return;

            const qrUrl = img.src;

            // Fetch image blob to bypass standard download behavior and trigger saving dialog
            fetch(qrUrl)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = cleanFilename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);

                    // Show success toast
                    if (typeof window.showToast === 'function') {
                        const lang = document.documentElement.getAttribute('lang') || 'de';
                        const msg = lang === 'de' ? 'QR-Code Download gestartet!' : 'QR code download started!';
                        window.showToast(msg, 'success');
                    }
                })
                .catch(err => {
                    console.error('Failed to download QR code image blob:', err);
                    // Fallback to opening in a new tab
                    window.open(qrUrl, '_blank');
                });
        });
    }
}
