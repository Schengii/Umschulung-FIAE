/**
 * Document Preview Module — Interactive preview modals for images, DOCX, and PPTX files.
 */
export function initDocumentPreview() {
    // 1. Create and inject modal markup if not already present
    let modal = document.getElementById('doc-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'doc-preview-modal';
        modal.className = 'doc-preview-modal hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="doc-preview-backdrop"></div>
            <div class="doc-preview-content">
                <button class="doc-preview-close" aria-label="Schließen / Close">✕</button>
                <div class="doc-preview-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Load modular CSS styles
        if (typeof window !== 'undefined' && window.loadStylesheet) {
            window.loadStylesheet('assets/css/modules/document_preview.css');
        }
    }

    const closeBtn = modal.querySelector('.doc-preview-close');
    const backdrop = modal.querySelector('.doc-preview-backdrop');
    const body = modal.querySelector('.doc-preview-body');

    /**
     * @param {HTMLElement} element
     * @param {string} fileUrl
     */
    const openPreviewModal = (element, fileUrl) => {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl);
        const isDocx = /\.docx$/i.test(fileUrl);
        const isPptx = /\.pptx$/i.test(fileUrl);

        body.innerHTML = '';

        if (isImage) {
            // Render image preview
            const container = document.createElement('div');
            container.className = 'doc-preview-img-container';
            const img = document.createElement('img');
            img.src = fileUrl;
            img.className = 'doc-preview-img';
            img.alt = 'Dokument Vorschau / Document Preview';
            container.appendChild(img);
            body.appendChild(container);

            // Add action buttons
            const btnRow = document.createElement('div');
            btnRow.className = 'doc-preview-btn-row';
            btnRow.innerHTML = `
                <a href="${fileUrl}" target="_blank" class="btn-primary small-btn">
                    <i class="fa fa-external-link"></i> ${lang === 'de' ? 'Vollbild' : 'Full Screen'}
                </a>
                <a href="${fileUrl}" download class="btn-secondary small-btn">
                    <i class="fa fa-download"></i> ${lang === 'de' ? 'Herunterladen' : 'Download'}
                </a>
            `;
            body.appendChild(btnRow);
        } else {
            // Render file card for word/pptx documents
            let iconClass = 'fa-regular fa-file';
            let iconColorClass = '';
            let fileTypeLabel = 'Dokument / File';
            let fileTitle = 'Bewerbungsunterlagen';

            if (isDocx) {
                iconClass = 'fa-regular fa-file-word';
                iconColorClass = 'word';
                fileTypeLabel = 'Word Dokument (DOCX)';
                fileTitle = lang === 'de' ? 'Bewerbungsunterlagen / Lebenslauf' : 'Application Portfolio / CV';
            } else if (isPptx) {
                iconClass = 'fa-regular fa-file-powerpoint';
                iconColorClass = 'powerpoint';
                fileTypeLabel = 'PowerPoint Präsentation (PPTX)';
                fileTitle =
                    element.closest('li')?.querySelector('strong')?.textContent ||
                    element.closest('.download-item-box')?.querySelector('.download-item-title')?.textContent ||
                    'Präsentation';
            }

            body.innerHTML = `
                <div class="doc-preview-file-card">
                    <i class="${iconClass} doc-preview-file-icon ${iconColorClass}"></i>
                    <div class="doc-preview-file-title">${fileTitle}</div>
                    <div class="doc-preview-file-meta">${fileTypeLabel}</div>
                    <p style="margin: 0; color: var(--text-secondary); max-width: 480px; font-size: 0.9rem;">
                        ${
                            lang === 'de'
                                ? 'Die direkte Vorschau dieses Dateiformats wird im Webbrowser nicht unterstützt. Bitte laden Sie die Datei herunter, um sie zu betrachten.'
                                : 'Direct preview of this file format is not supported in the web browser. Please download the file to view it.'
                        }
                    </p>
                    <div class="doc-preview-btn-row">
                        <a href="${fileUrl}" download class="btn-primary" style="padding: 0.5rem 1.5rem; font-size: 0.95rem;">
                            <i class="fa fa-download"></i> ${lang === 'de' ? 'Datei herunterladen' : 'Download File'}
                        </a>
                    </div>
                </div>
            `;
        }

        modal.classList.remove('hidden');
        modal.offsetHeight; // force reflow
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closePreviewModal = () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!modal.classList.contains('show')) {
                modal.classList.add('hidden');
            }
        }, 320);
    };

    // Attach click events
    closeBtn.addEventListener('click', closePreviewModal);
    backdrop.addEventListener('click', closePreviewModal);

    // Keyboard handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closePreviewModal();
        }
    });

    // Intercept clicks on links that view/download candidate files
    document.addEventListener('click', (e) => {
        const link = /** @type {HTMLElement} */ (e.target).closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const isDocx = href.endsWith('.docx');
        const isPptx = href.endsWith('.pptx');
        const isExtractedImage = href.includes('Bewerbungsunterlagen/extracted_images/');

        // Trigger on click for IHK certificates (.png, .jpg) or CV/Presentations
        if (isDocx || isPptx || isExtractedImage) {
            e.preventDefault();
            openPreviewModal(link, href);

            // Dispatch a custom event instead of calling the module directly
            if (href.includes('Bewerbungsunterlagen')) {
                document.dispatchEvent(new CustomEvent('achievement:unlock', { detail: 'cv_downloaded' }));
            }
        }
    });
}
