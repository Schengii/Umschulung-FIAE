/**
 * Portfolio One-Pager / Printable PDF Generator
 * Generates an executive printable summary of all key projects and competencies with clean CSS print formatting.
 */

(function() {
    'use strict';

    function initPortfolioExporter() {
        if (!window.location.pathname.includes('portfolio.html')) return;

        const container = document.querySelector('.portfolio-filters');
        if (!container) return;

        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'btn-filter';
        exportBtn.id = 'btn-print-portfolio';
        exportBtn.style.marginLeft = 'auto';
        exportBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> <span lang="de">PDF-OnePager</span><span lang="en">PDF One-Pager</span>`;
        exportBtn.setAttribute('title', 'Druckoptimiertes One-Pager Dossier erstellen');

        exportBtn.addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('Generiere druckoptimiertes Portfolio-Dossier...', 'info');
            }
            window.print();
        });

        container.appendChild(exportBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortfolioExporter);
    } else {
        initPortfolioExporter();
    }
})();
