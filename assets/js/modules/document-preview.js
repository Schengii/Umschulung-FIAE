/**
 * Document Preview Module — Interactive preview modals for images, DOCX, and PPTX files.
 */
function initDocumentPreview() {
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

        // Inject modal CSS styles dynamically to keep components self-contained
        const style = document.createElement('style');
        style.textContent = `
            .doc-preview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .doc-preview-modal.show {
                opacity: 1;
                pointer-events: all;
            }
            .doc-preview-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(5px);
            }
            .doc-preview-content {
                position: relative;
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                background: var(--bg-card, #ffffff);
                border: 1px solid var(--border, #e2e8f0);
                border-radius: var(--radius-lg, 12px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            .doc-preview-modal.show .doc-preview-content {
                transform: scale(1);
            }
            .doc-preview-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(0, 0, 0, 0.05);
                color: var(--text-primary, #1e293b);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.2rem;
                font-weight: bold;
                transition: background 0.2s, color 0.2s;
                z-index: 10;
            }
            .theme-dark .doc-preview-close {
                background: rgba(255, 255, 255, 0.1);
                color: #f1f5f9;
            }
            .doc-preview-close:hover {
                background: var(--primary, #2563eb);
                color: #ffffff;
            }
            .doc-preview-body {
                padding: 2.5rem 1.5rem 1.5rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 200px;
            }
            .doc-preview-img-container {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .doc-preview-img {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
                border-radius: var(--radius-md, 6px);
                border: 1px solid var(--border);
            }
            .doc-preview-file-card {
                text-align: center;
                padding: 2rem 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.25rem;
            }
            .doc-preview-file-icon {
                font-size: 5rem;
                color: var(--primary);
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            }
            .doc-preview-file-icon.word {
                color: #2b579a;
            }
            .doc-preview-file-icon.powerpoint {
                color: #d24726;
            }
            .doc-preview-file-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                font-family: var(--font-heading);
            }
            .doc-preview-file-meta {
                font-size: 0.95rem;
                color: var(--text-secondary);
                background: var(--bg-page);
                padding: 0.35rem 0.75rem;
                border-radius: 20px;
                border: 1px solid var(--border);
            }
            .doc-preview-btn-row {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            @media (max-width: 640px) {
                .doc-preview-content {
                    width: 95%;
                    max-height: 90vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const closeBtn = modal.querySelector('.doc-preview-close');
    const backdrop = modal.querySelector('.doc-preview-backdrop');
    const body = modal.querySelector('.doc-preview-body');

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
                fileTitle = element.closest('li')?.querySelector('strong')?.textContent || 
                            element.closest('.download-item-box')?.querySelector('.download-item-title')?.textContent || 
                            'Präsentation';
            }

            body.innerHTML = `
                <div class="doc-preview-file-card">
                    <i class="${iconClass} doc-preview-file-icon ${iconColorClass}"></i>
                    <div class="doc-preview-file-title">${fileTitle}</div>
                    <div class="doc-preview-file-meta">${fileTypeLabel}</div>
                    <p style="margin: 0; color: var(--text-secondary); max-width: 480px; font-size: 0.9rem;">
                        ${lang === 'de' 
                            ? 'Die direkte Vorschau dieses Dateiformats wird im Webbrowser nicht unterstützt. Bitte laden Sie die Datei herunter, um sie zu betrachten.' 
                            : 'Direct preview of this file format is not supported in the web browser. Please download the file to view it.'}
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
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const isDocx = href.endsWith('.docx');
        const isPptx = href.endsWith('.pptx');
        const isExtractedImage = href.includes('Bewerbungsunterlagen/extracted_images/');

        // Trigger on click for IHK certificates (.png, .jpg) or CV/Presentations
        if (isDocx || isPptx || isExtractedImage) {
            e.preventDefault();
            openPreviewModal(link, href);

            // Unlock achievement if CV downloaded / viewed
            if (href.includes('Bewerbungsunterlagen') && typeof Achievements !== 'undefined') {
                Achievements.unlock('cv_downloaded');
            }
        }
    });
}
