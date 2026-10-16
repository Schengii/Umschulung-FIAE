import { guard, logError } from '../_lib/http.js';
import { createTicket, listTickets } from '../_lib/ticket-store.js';
import { canRead } from '../_lib/ticket-access.js';
import { isValidEmail } from '../_lib/security.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { methods: ['GET', 'POST'] }))) return;

  try {
    if (req.method === 'GET') {
      const all = (await listTickets()).filter((ticket) => canRead(ticket, req.user));
      const rawLimit = req.query?.limit;
      const limit = parseInt(rawLimit, 10);
      const page = parseInt(req.query?.page, 10) || 1;

      res.setHeader('X-Total-Count', String(all.length));
      res.setHeader('X-Page', String(page));

      if (rawLimit !== undefined) {
        const safeLimit = Math.max(1, isNaN(limit) ? 20 : limit);
        const offset = (Math.max(page, 1) - 1) * safeLimit;
        return res.json({ tickets: all.slice(offset, offset + safeLimit), total: all.length, page, limit: safeLimit });
      }

      if (req.query?.envelope === 'true' || req.query?.paginated === 'true') {
        return res.json({ tickets: all, total: all.length, page: 1, limit: all.length });
      }

      return res.json(all);
    }

    const ticket = req.body;
    if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket) || Object.keys(ticket).length === 0) {
      return res.status(400).json({ error: 'Keine Ticketdaten übergeben.' });
    }
    if (ticket.assignedTo != null) {
      if (!isValidEmail(ticket.assignedTo)) {
        return res.status(400).json({ error: 'Ungültige E-Mail-Adresse für die Zuweisung.' });
      }
      ticket.assignedTo = ticket.assignedTo.trim().toLowerCase();
    }
    const owner = req.user && req.user.role !== 'service' ? req.user.email : undefined;
    const created = await createTicket(ticket, owner);
    res.status(201).json(created);
  } catch (error) {
    logError(req, 'Fehler bei der Ticketverarbeitung', error);
    res.status(500).json({ error: 'Interner Serverfehler bei der Ticketverarbeitung.' });
  }
}
