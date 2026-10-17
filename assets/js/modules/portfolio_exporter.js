/**
 * Portfolio One-Pager / Printable PDF Generator
 * Generates an executive printable summary of all key projects and competencies with clean CSS print formatting.
 */

export function initPortfolioExporter() {
    if (!window.location.pathname.includes('portfolio.html')) return;

    const container = document.querySelector('.portfolio-filters');
    if (!container || document.getElementById('btn-print-portfolio')) return;

    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.className = 'btn-filter';
    exportBtn.id = 'btn-print-portfolio';
    exportBtn.style.marginLeft = 'auto';
    exportBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> <span lang="de">PDF-OnePager</span><span lang="en">PDF One-Pager</span>`;
    exportBtn.setAttribute('title', 'Druckoptimiertes One-Pager Dossier erstellen');
    exportBtn.setAttribute('data-de-title', 'Druckoptimiertes One-Pager Dossier erstellen');
    exportBtn.setAttribute('data-en-title', 'Create print-optimized one-pager dossier');

    exportBtn.addEventListener('click', () => {
        if (typeof showToast === 'function') {
            showToast(
                {
                    de: 'Generiere druckoptimiertes Portfolio-Dossier...',
                    en: 'Generating print-optimised portfolio dossier...',
                },
                'info'
            );
        }
        window.print();
    });

    container.appendChild(exportBtn);
}
