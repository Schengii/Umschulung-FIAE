/**
 * Recruiter PDF Factsheet Exporter Module
 * Generates an optimized 1-page application factsheet for recruiters or triggers print PDF view.
 */

export function initPdfExporter() {
    // lebenslauf.html's plain "print this page" buttons (moved off inline
    // onclick="window.print()" attributes for CSP script-src hardening).
    document.querySelectorAll('#btn-cv-print-header, #btn-cv-print-card').forEach(btn => {
        btn.addEventListener('click', () => window.print());
    });

    const exportBtns = document.querySelectorAll('.btn-export-pdf, [data-action="export-pdf"]');
    if (!exportBtns.length) return;

    exportBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            generateFactsheetModal();
        });
    });
}

function generateFactsheetModal() {
    const recruiterCompany = sessionStorage.getItem('recruiter_company') || localStorage.getItem('recruiter_company') || 'Ihr Unternehmen';
    const recruiterName = sessionStorage.getItem('recruiter_name') || localStorage.getItem('recruiter_name') || 'Sehr geehrte Damen und Herren';

    const modalId = 'pdf-export-modal';
    let existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop active d-flex align-center justify-center';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    modal.style.zIndex = '9999';
    modal.style.backdropFilter = 'blur(6px)';

    modal.innerHTML = `
        <div class="modal-content card background-glass" style="max-width: 750px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 2rem; border-radius: 12px; border: 1px solid var(--primary-color);">
            <div class="flex-between align-center margin-bottom-1rem border-bottom pb-2">
                <h3 class="m-0 color-primary">
                    <i class="fa-solid fa-file-pdf me-2"></i> Recruiter Factsheet — Maximilian Schenk
                </h3>
                <button type="button" class="btn-close-modal btn btn-sm btn-outline-secondary" aria-label="Schließen">✕</button>
            </div>
            
            <div id="factsheet-print-area" class="factsheet-container p-3 background-page border-radius-8px" style="color: var(--text-color);">
                <div class="header-section text-center margin-bottom-1-5rem border-bottom pb-3">
                    <h2 class="m-0 font-size-1-4rem color-primary">Maximilian Schenk</h2>
                    <p class="font-size-0-95rem text-muted m-0">Angehender Fachinformatiker für Anwendungsentwicklung (FIAE)</p>
                    <p class="font-size-0-85rem color-secondary m-0 margin-top-0-25rem">
                        📍 Berlin / Erfurt | 📧 schekky@gmail.com | 🌐 https://max-schenk.tech
                    </p>
                    ${recruiterCompany !== 'Ihr Unternehmen' ? `
                        <div class="badge badge-info margin-top-0-5rem font-size-0-8rem padding-4px-8px">
                            Exklusiv zusammengestellt für ${recruiterCompany}
                        </div>
                    ` : ''}
                </div>

                <div class="grid-2-col gap-3 margin-bottom-1rem d-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                    <div>
                        <h4 class="font-size-1rem color-primary border-bottom pb-1 margin-bottom-0-5rem">
                            💡 Profil & Stärken
                        </h4>
                        <ul class="font-size-0-85rem padding-left-1-2rem line-height-1-5">
                            <li>2 Jahre praxisnahe FIAE Umschulung bei der DFG</li>
                            <li>Fundierte Kenntnisse in Java SE, OOP, Spring Boot & REST APIs</li>
                            <li>Moderne Frontend-Entwicklung mit HTML5, CSS3, Vanilla JS (ESM)</li>
                            <li>Erfahrung in SQL, Datenbankdesign & Git Version Control</li>
                            <li>Background in Elektrotechnik: Starkes logisch-analytisches Denken</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-size-1rem color-primary border-bottom pb-1 margin-bottom-0-5rem">
                            🚀 Top-Projekt-Highlights
                        </h4>
                        <div class="font-size-0-85rem line-height-1-4">
                            <p class="m-0 font-weight-bold">1. EcoChef (IHK-Abschlussprojekt)</p>
                            <p class="text-muted font-size-0-8rem margin-bottom-0-5rem">Rezept- & Vorratsverwaltung mit Gemini AI Integration.</p>
                            
                            <p class="m-0 font-weight-bold">2. ElektroCheck AI</p>
                            <p class="text-muted font-size-0-8rem margin-bottom-0-5rem">KI Bounding-Box Objekterkennung für Bauteile.</p>

                            <p class="m-0 font-weight-bold">3. Git-Simulator & IHK Notenrechner</p>
                            <p class="text-muted font-size-0-8rem m-0">Interaktive Web-Tools zur Ausbildungsunterstützung.</p>
                        </div>
                    </div>
                </div>

                <div class="tech-stack-section border-top pt-2 margin-bottom-1rem">
                    <h4 class="font-size-1rem color-primary margin-bottom-0-5rem">🛠️ Kern-Technologien</h4>
                    <div class="d-flex flex-wrap gap-1 font-size-0-8rem">
                        <span class="badge badge-secondary">Java 17+</span>
                        <span class="badge badge-secondary">Spring Boot</span>
                        <span class="badge badge-secondary">JavaScript (ES6+)</span>
                        <span class="badge badge-secondary">HTML5 / CSS3</span>
                        <span class="badge badge-secondary">SQL (SQLite / MySQL)</span>
                        <span class="badge badge-secondary">Git & GitHub</span>
                        <span class="badge badge-secondary">Playwright E2E</span>
                        <span class="badge badge-secondary">PWA & Service Worker</span>
                    </div>
                </div>
            </div>

            <div class="flex-between align-center margin-top-1-5rem pt-2 border-top">
                <button type="button" class="btn btn-outline-secondary btn-close-modal">Abbrechen</button>
                <button type="button" id="btn-do-print" class="btn btn-primary">
                    <i class="fa-solid fa-print me-2"></i> Drucken / Als PDF speichern
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-close-modal').addEventListener('click', () => modal.remove());
    modal.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modal.remove()));

    modal.querySelector('#btn-do-print').addEventListener('click', () => {
        window.print();
    });
}
