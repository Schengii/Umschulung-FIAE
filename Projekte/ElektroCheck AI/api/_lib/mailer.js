/**
 * E-Mail-Versand über Resend. Ohne RESEND_API_KEY läuft der Versand außerhalb von Production im
 * Simulationsmodus (nichts wird gesendet); in Production ist das ein Konfigurationsfehler.
 */
export class MailError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export const isMailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/**
 * @param {{ to: string, subject: string, html: string, attachments?: Array<{ filename: string, content: string }> }} mail
 * @returns {Promise<{ mode: 'sent' | 'simulated', id?: string }>}
 */
export async function sendMail({ to, subject, html, attachments = [] }) {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new MailError('E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt).', 503);
    }
    return { mode: 'simulated' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'ElektroCheck AI <noreply@elektrocheck.de>',
      to: [to],
      subject,
      html,
      attachments
    })
  });

  if (!response.ok) {
    throw new MailError(`Resend API Fehler: ${await response.text()}`);
  }
  const data = await response.json();
  return { mode: 'sent', id: data.id };
}
