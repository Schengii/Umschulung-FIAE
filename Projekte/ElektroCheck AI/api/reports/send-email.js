import { guard, logError } from '../_lib/http.js';
import { MailError, sendMail } from '../_lib/mailer.js';
import { escapeHtml, isValidEmail, MAX_EMAIL_PDF_BASE64_LENGTH } from '../_lib/security.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { rate: { max: 5, key: 'email' } }))) return;

  try {
    const { recipientEmail, recipientName, reportTitle, reportSummary, pdfBase64 } = req.body || {};
    if (!isValidEmail(recipientEmail)) {
      return res.status(400).json({ error: 'Gültige Empfänger-E-Mail erforderlich.' });
    }
    if (pdfBase64 && (typeof pdfBase64 !== 'string' || pdfBase64.length > MAX_EMAIL_PDF_BASE64_LENGTH)) {
      return res.status(413).json({ error: 'PDF-Anhang ist zu groß.' });
    }

    const result = await sendMail({
      to: recipientEmail,
      subject: String(reportTitle || '').slice(0, 200) || 'Ihr ElektroCheck AI Wartungs- und Prüfbericht',
      html: `
        <h2>ElektroCheck AI - Offizieller Prüfbericht</h2>
        <p>Sehr geehrte(r) ${escapeHtml(recipientName) || 'Damen und Herren'},</p>
        <p>anbei erhalten Sie den aktuellen Prüfbericht gemäß DGUV V3 / DIN VDE.</p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #0284c7;">
          <strong>Zusammenfassung:</strong><br/>
          ${escapeHtml(reportSummary) || 'Prüfung erfolgreich abgeschlossen.'}
        </div>
        <p>Mit freundlichen Grüßen,<br/>Ihr Elektrofachbetrieb</p>
      `,
      attachments: pdfBase64
        ? [{ filename: 'Pruefprotokoll.pdf', content: pdfBase64.replace(/^data:application\/pdf;base64,/, '') }]
        : []
    });

    if (result.mode === 'simulated') {
      return res.json({
        success: true,
        mode: 'simulated',
        message: `Prüfbericht für ${recipientEmail} im Simulationsmodus verarbeitet (nicht versendet).`
      });
    }
    res.json({ success: true, mode: 'sent', id: result.id });
  } catch (error) {
    logError(req, 'Fehler beim E-Mail-Versand', error);
    if (error instanceof MailError) {
      return res.status(error.status).json({
        error: error.status === 503 ? error.message : 'E-Mail konnte nicht versendet werden.'
      });
    }
    res.status(500).json({ error: error.message || 'Fehler beim E-Mail-Versand.' });
  }
}
