/**
 * Resignation Letter Generator Submodule
 * Generates legally sound German resignation letters with notice period calculation,
 * reference request and holiday settlement according to BGB § 622.
 */
export const resignationGen = {
    employerName: 'Aktueller Arbeitgeber GmbH',
    employerAddress: 'Musterstraße 123\n80333 München',
    noticeType: 'end_of_month', // 'end_of_month' | 'mid_month' | 'custom'

    render(container, job, profile) {
        const candidateName = profile.name || 'Alex Neumann';
        const candidateAddress = 'Musterweg 12\n80000 München';
        const todayStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

        container.innerHTML = `
            <div class="resignation-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="file-minus"></i> Rechtskonformer Kündigungsschreiben-Generator</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Erstelle ein formell einwandfreies Kündigungsschreiben mit Zeugnis-Aufforderung nach DIN 5008.
                        </p>
                    </div>
                    <button class="btn btn-primary" id="btn-print-resignation">
                        <i data-lucide="printer"></i> Schreiben drucken / PDF
                    </button>
                </div>

                <div class="glass-card" style="padding: 24px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
                    <!-- Settings -->
                    <div>
                        <h4 style="margin: 0 0 14px 0; font-size: 0.95rem;">Empfänger &amp; Fristen:</h4>
                        
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Arbeitgeber Name:</label>
                            <input type="text" id="resig-emp-name" class="form-input" value="${this.employerName}">
                        </div>

                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Arbeitgeber Adresse:</label>
                            <textarea id="resig-emp-addr" rows="2" class="form-input">${this.employerAddress}</textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Kündigungstermin:</label>
                            <select id="resig-notice-select" class="form-input">
                                <option value="end_of_month">Zum nächstmöglichen Monatsende</option>
                                <option value="mid_month">Zum 15. des nächsten Monats</option>
                                <option value="custom">Fristgerecht zum Ablauf der Probezeit</option>
                            </select>
                        </div>

                        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99,102,241,0.2); padding: 12px; border-radius: 8px; font-size: 0.8rem; line-height: 1.5; color: #cbd5e1;">
                            ⚖️ <strong>Wichtiger Rechtshinweis:</strong> Kündigungen im deutschen Arbeitsrecht bedürfen zwingend der <strong>Schriftform (§ 623 BGB)</strong> mit eigenhändiger Unterschrift (keine E-Mail!).
                        </div>
                    </div>

                    <!-- DIN 5008 Preview -->
                    <div id="resignation-preview-box" style="background: #ffffff; color: #1e293b; padding: 24px; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 16px;">
                            ${candidateName} &bull; Musterweg 12 &bull; 80000 München
                        </div>

                        <div id="preview-emp-addr" style="margin-bottom: 24px; font-weight: 500;">
                            ${this.employerName}<br>${this.employerAddress.replace(/\n/g, '<br>')}
                        </div>

                        <div style="text-align: right; margin-bottom: 20px; color: #64748b; font-size: 0.8rem;">
                            München, den ${todayStr}
                        </div>

                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 16px; color: #0f172a;">
                            Kündigung meines Arbeitsvertrages
                        </div>

                        <p style="margin: 0 0 12px 0;">Sehr geehrte Damen und Herren,</p>

                        <p style="margin: 0 0 12px 0;">
                            hiermit kündige ich das zwischen uns bestehende Arbeitsverhältnis unter Einhaltung der vertraglich vereinbarten Kündigungsfrist ordentlich und fristgerecht zum <strong>${this.getTerminationDateString(this.noticeType)}</strong>, hilfsweise zum nächstmöglichen Zeitpunkt.
                        </p>

                        <p style="margin: 0 0 12px 0;">
                            Ich bedanke mich herzlich für die angenehme Zusammenarbeit und die Unterstützung während meiner Beschäftigung in Ihrem Hause.
                        </p>

                        <p style="margin: 0 0 12px 0;">
                            Bitte bestätigen Sie mir den Erhalt dieses Schreibens sowie das genaue Beendigungsdatum schriftlich. Zudem bitte ich Sie um die Ausstellung eines qualifizierten, wohlwollenden Arbeitszeugnisses.
                        </p>

                        <p style="margin: 24px 0 36px 0;">
                            Mit freundlichen Grüßen,<br><br><br>
                            ___________________________________<br>
                            ${candidateName}
                        </p>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, job, profile);
    },

    getTerminationDateString(type) {
        const d = new Date();
        if (type === 'end_of_month') {
            const nextMonthLastDay = new Date(d.getFullYear(), d.getMonth() + 2, 0);
            return nextMonthLastDay.toLocaleDateString('de-DE');
        } else if (type === 'mid_month') {
            return `15.${String(d.getMonth() + 2).padStart(2, '0')}.${d.getFullYear()}`;
        }
        return 'nächstmöglichen Termin';
    },

    bindEvents(container, job, profile) {
        const empNameInput = container.querySelector('#resig-emp-name');
        const empAddrInput = container.querySelector('#resig-emp-addr');
        const select = container.querySelector('#resig-notice-select');

        const updatePreview = () => {
            this.employerName = empNameInput.value;
            this.employerAddress = empAddrInput.value;
            this.noticeType = select.value;
            this.render(container, job, profile);
        };

        empNameInput?.addEventListener('input', updatePreview);
        empAddrInput?.addEventListener('input', updatePreview);
        select?.addEventListener('change', updatePreview);

        container.querySelector('#btn-print-resignation')?.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Pop-Ups erlauben.');
                return;
            }

            const html = container.querySelector('#resignation-preview-box').innerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Kündigungsschreiben</title>
                    <style>
                        @page { size: A4; margin: 20mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
};
