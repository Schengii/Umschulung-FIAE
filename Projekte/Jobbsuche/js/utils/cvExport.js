/**
 * Opens a print-friendly window with a structured CV layout
 * and triggers the system printing dialog.
 * 
 * @param {Object} profile - User profile containing experience, skills, and details.
 */
export function printCurriculumVitae(profile) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Bitte erlaube Pop-Ups für diese Seite, um den Lebenslauf-Export zu starten.');
        return;
    }

    const skillsHtml = (profile.skills || []).map(skill => `
        <span class="skill-badge">${skill}</span>
    `).join('');

    const experienceLines = (profile.experience || '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const cleanLine = line.replace(/^-\s*/, '');
            return `<li>${cleanLine}</li>`;
        })
        .join('');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Lebenslauf - ${profile.name || 'Bewerber'}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10.5pt;
                    line-height: 1.6;
                    color: #1e293b;
                    margin: 0;
                    padding: 0;
                    background-color: #ffffff;
                }
                .cv-container {
                    display: grid;
                    grid-template-columns: 1fr 2.2fr;
                    min-height: 297mm; /* Standard A4 height */
                }
                .sidebar {
                    background-color: #0f172a;
                    color: #cbd5e1;
                    padding: 25mm 15mm;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .sidebar h2 {
                    color: #ffffff;
                    font-size: 14pt;
                    border-bottom: 2px solid #38bdf8;
                    padding-bottom: 6px;
                    margin-top: 10px;
                    margin-bottom: 15px;
                }
                .main-content {
                    padding: 25mm 20mm;
                    color: #334155;
                }
                .name {
                    font-size: 26pt;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.1;
                    margin: 0 0 5px 0;
                }
                .title-focused {
                    font-size: 14pt;
                    color: #0284c7;
                    font-weight: 600;
                    margin: 0 0 30px 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .section-title {
                    font-size: 14pt;
                    color: #0f172a;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 4px;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .skill-badge {
                    display: inline-block;
                    background-color: #1e293b;
                    color: #f1f5f9;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 9pt;
                    margin-right: 6px;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                .exp-list {
                    padding-left: 20px;
                    margin: 0;
                    color: #334155;
                }
                .exp-list li {
                    margin-bottom: 12px;
                }
                .contact-item {
                    font-size: 9.5pt;
                    margin-bottom: 10px;
                }
                .contact-label {
                    display: block;
                    font-weight: bold;
                    color: #38bdf8;
                    font-size: 8pt;
                    text-transform: uppercase;
                }
                @media print {
                    body {
                        background-color: #ffffff;
                    }
                    .cv-container {
                        min-height: 100vh;
                    }
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                <div class="sidebar">
                    <div>
                        <h2>Kontakt</h2>
                        <div class="contact-item">
                            <span class="contact-label">Name</span>
                            ${profile.name || 'Max Mustermann'}
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">Fokus</span>
                            ${profile.title || 'Entwickler'}
                        </div>
                    </div>
                    
                    <div>
                        <h2>Fähigkeiten</h2>
                        <div style="margin-top: 10px;">
                            ${skillsHtml || 'Keine Skills hinterlegt.'}
                        </div>
                    </div>
                </div>
                
                <div class="main-content">
                    <h1 class="name">${profile.name || 'Max Mustermann'}</h1>
                    <div class="title-focused">${profile.title || 'Senior Software Engineer'}</div>
                    
                    <h2 class="section-title">Werdegang &amp; Erfahrung</h2>
                    <ul class="exp-list">
                        ${experienceLines || '<li>Keine Erfahrungspunkte angegeben.</li>'}
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}
