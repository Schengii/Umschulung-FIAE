import { guard, logError } from '../_lib/http.js';
import { deleteTicket, getTicket, updateTicket } from '../_lib/ticket-store.js';
import { canEditFields, canManage, canModify } from '../_lib/ticket-access.js';
import { isValidEmail } from '../_lib/security.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { methods: ['PUT', 'DELETE'] }))) return;

  const id = String(req.query?.id || '');
  if (!id) return res.status(400).json({ error: 'Ticket-ID fehlt.' });

  try {
    const existing = await getTicket(id);
    // Fremde Tickets verhalten sich wie nicht vorhandene (keine Auskunft über fremde IDs)
    if (!existing || !canModify(existing, req.user)) {
      return res.status(404).json({ error: `Ticket ${id} nicht gefunden.` });
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Keine Update-Daten übergeben.' });
      }
      if (!canEditFields(existing, req.user, Object.keys(updates))) {
        return res.status(403).json({ error: 'Zugewiesene dürfen nur den Status ändern.' });
      }
      if ('assignedTo' in updates) {
        if (!canManage(existing, req.user)) {
          return res.status(403).json({ error: 'Nur der Ersteller darf das Ticket zuweisen.' });
        }
        if (updates.assignedTo !== null && !isValidEmail(updates.assignedTo)) {
          return res.status(400).json({ error: 'Ungültige E-Mail-Adresse für die Zuweisung.' });
        }
        updates.assignedTo = updates.assignedTo ? updates.assignedTo.trim().toLowerCase() : null;
      }
      return res.json(await updateTicket(id, updates));
    }

    if (!canManage(existing, req.user)) {
      return res.status(403).json({ error: 'Nur der Ersteller darf das Ticket löschen.' });
    }
    await deleteTicket(id);
    res.status(204).send();
  } catch (error) {
    logError(req, 'Fehler bei der Ticketverarbeitung', error);
    res.status(500).json({ error: 'Interner Serverfehler bei der Ticketverarbeitung.' });
  }
}
