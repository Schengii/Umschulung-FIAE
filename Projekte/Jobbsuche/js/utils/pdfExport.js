/**
 * Öffnet ein neues Fenster mit dem formatierten Briefanschreiben im DIN 5008 Layout
 * und triggert den PDF-Druck-Dialog des Browsers.
 * 
 * @param {Object} profile - Das Profil des Benutzers.
 * @param {Object} job - Das Jobangebot.
 * @param {string} letterText - Der generierte Text des Anschreibens.
 */
export function printCoverLetter(profile, job, letterText, stylePreset = 'din5008') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Bitte erlaube Pop-Ups für diese Seite, um den PDF-Export zu starten.');
        return;
    }
    
    const today = new Date().toLocaleDateString('de-DE');
    const primaryHue = profile.themePrimaryHue || 239;
    const primaryColor = `hsl(${primaryHue}, 65%, 45%)`;
    
    let styleRules = '';
    let htmlBody = '';
    
    if (stylePreset === 'modern') {
        styleRules = `
            @page {
                size: A4;
                margin: 20mm 20mm 20mm 20mm;
            }
            body {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                font-size: 10.5pt;
                line-height: 1.6;
                color: #2c3e50;
                margin: 20mm;
            }
            .header-accent {
                height: 4px;
                background-color: ${primaryColor};
                margin-bottom: 25px;
            }
            .header-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .sender-info {
                text-align: right;
                font-size: 9pt;
                color: #666;
            }
            .sender-name {
                font-size: 14pt;
                font-weight: 700;
                color: ${primaryColor};
                display: block;
                margin-bottom: 4px;
            }
            .recipient-info {
                font-size: 10pt;
                color: #333;
                border-left: 3px solid ${primaryColor};
                padding-left: 12px;
            }
            .meta-row {
                display: flex;
                justify-content: space-between;
                font-size: 9.5pt;
                color: #7f8c8d;
                border-bottom: 1px solid #ecf0f1;
                padding-bottom: 8px;
                margin-bottom: 25px;
            }
            .subject-line {
                font-weight: 800;
                font-size: 14pt;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
                color: #2c3e50;
            }
            .footer {
                margin-top: 25px;
                border-top: 1px solid #ecf0f1;
                padding-top: 15px;
            }
            .signature-space {
                height: 12mm;
            }
        `;
        htmlBody = `
            <div class="header-accent"></div>
            <div class="header-grid">
                <div class="recipient-info">
                    <strong>${job.company}</strong><br>
                    ${job.contact ? `z. Hd. ${job.contact}<br>` : 'Personalabteilung<br>'}
                    ${job.location || 'Deutschland'}
                </div>
                <div class="sender-info">
                    <span class="sender-name">${profile.name || 'Max Mustermann'}</span>
                    ${profile.title || 'Webentwickler'}<br>
                    ${profile.experience ? profile.experience.split('\n')[0].replace(/^-\s*/, '') : ''}
                </div>
            </div>
            
            <div class="meta-row">
                <span>Bewerbungsschreiben</span>
                <span>${job.location ? job.location.split('/')[0].trim() : 'Ort'}, den ${today}</span>
            </div>
            
            <div class="subject-line">
                Bewerbung als ${job.title}
            </div>
            
            <div class="letter-content">${letterText}</div>
            
            <div class="footer">
                Mit freundlichen Grüßen,<br>
                <div class="signature-space"></div>
                <strong>${profile.name || 'Max Mustermann'}</strong>
            </div>
        `;
    } else if (stylePreset === 'elegant') {
        styleRules = `
            @page {
                size: A4;
                margin: 25mm 25mm 25mm 25mm;
            }
            body {
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #1a1a1a;
                margin: 25mm;
            }
            .sender-header {
                text-align: center;
                border-bottom: 2px double #888;
                padding-bottom: 15px;
                margin-bottom: 25px;
            }
            .sender-name {
                font-size: 18pt;
                font-family: Georgia, serif;
                letter-spacing: 1px;
                text-transform: uppercase;
                display: block;
                font-weight: normal;
                color: #111;
            }
            .sender-subtitle {
                font-size: 10pt;
                font-style: italic;
                color: #555;
            }
            .recipient-and-date {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 25px;
                font-size: 10pt;
            }
            .recipient-info {
                line-height: 1.4;
            }
            .date-line {
                font-style: italic;
            }
            .subject-line {
                font-family: Georgia, serif;
                font-size: 13pt;
                font-style: italic;
                border-bottom: 1px solid #ddd;
                padding-bottom: 6px;
                margin-bottom: 20px;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
            }
            .footer {
                margin-top: 30px;
                page-break-inside: avoid;
            }
            .signature-space {
                height: 15mm;
            }
        `;
        htmlBody = `
            <div class="sender-header">
                <span class="sender-name">${profile.name || 'Max Mustermann'}</span>
                <span class="sender-subtitle">
                    ${profile.title || 'Webentwickler'} &nbsp;|&nbsp; 
                    ${profile.experience ? profile.experience.split('\n')[0].replace(/^-\s*/, '') : ''}
                </span>
            </div>
            
            <div class="recipient-and-date">
                <div class="recipient-info">
                    <strong>${job.company}</strong><br>
                    ${job.contact ? `z. Hd. ${job.contact}<br>` : 'Personalabteilung<br>'}
                    ${job.location || 'Deutschland'}
                </div>
                <div class="date-line">
                    ${job.location ? job.location.split('/')[0].trim() : 'Ort'}, den ${today}
                </div>
            </div>
            
            <div class="subject-line">
                Bewerbung um die Position als ${job.title}
            </div>
            
            <div class="letter-content">${letterText}</div>
            
            <div class="footer">
                Mit vorzüglicher Hochachtung,<br>
                <div class="signature-space"></div>
                <strong>${profile.name || 'Max Mustermann'}</strong>
            </div>
        `;
    } else {
        styleRules = `
            @page {
                size: A4;
                margin: 0;
            }
            body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #000000;
                margin: 20mm 20mm 20mm 25mm;
                box-sizing: border-box;
            }
            .sender-info {
                text-align: right;
                margin-bottom: 25mm;
                font-size: 9pt;
                color: #444444;
            }
            .sender-name {
                font-size: 11pt;
                font-weight: bold;
                color: #000000;
            }
            .recipient-info {
                height: 45mm;
                margin-bottom: 12mm;
                font-size: 10pt;
            }
            .date-line {
                text-align: right;
                margin-bottom: 15mm;
            }
            .subject-line {
                font-weight: bold;
                font-size: 12pt;
                margin-bottom: 10mm;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
            }
            .footer {
                margin-top: 15mm;
            }
            .signature-space {
                height: 15mm;
            }
            @media print {
                body {
                    margin: 20mm 20mm 20mm 25mm;
                }
            }
        `;
        htmlBody = `
            <div class="sender-info">
                <span class="sender-name">${profile.name || 'Max Mustermann'}</span><br>
                ${profile.title || 'Webentwickler'}<br>
                ${profile.experience ? profile.experience.split('\n')[0].replace(/^-\s*/, '') : ''}
            </div>
            
            <div class="recipient-info">
                <strong>${job.company}</strong><br>
                ${job.contact ? `z. Hd. ${job.contact}<br>` : 'Personalabteilung<br>'}
                ${job.location || 'Deutschland'}
            </div>
            
            <div class="date-line">
                ${job.location ? job.location.split('/')[0].trim() : 'Ort'}, den ${today}
            </div>
            
            <div class="subject-line">
                Bewerbung als ${job.title}
            </div>
            
            <div class="letter-content">${letterText}</div>
            
            <div class="footer">
                Mit freundlichen Grüßen,<br>
                <div class="signature-space"></div>
                <strong>${profile.name || 'Max Mustermann'}</strong>
            </div>
        `;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Bewerbungsschreiben - ${profile.name || 'Bewerber'}</title>
            <style>
                ${styleRules}
            </style>
        </head>
        <body>
            ${htmlBody}
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
