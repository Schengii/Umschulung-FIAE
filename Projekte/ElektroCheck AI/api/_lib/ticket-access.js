import { canSeeAll } from './security.js';

/** Tickets ohne Besitzer (aus der Zeit vor dem Login) sehen nur Admins/Dienst-Token. */
export const isOwner = (ticket, user) => Boolean(user && ticket.ownerEmail && ticket.ownerEmail === user.email);
export const isAssignee = (ticket, user) => Boolean(user && ticket.assignedTo && ticket.assignedTo === user.email);

export const canRead = (ticket, user) => canSeeAll(user) || isOwner(ticket, user) || isAssignee(ticket, user);
/** Felder, die zugewiesene Personen ändern dürfen (alles andere bleibt dem Ersteller/Admin vorbehalten). */
export const ASSIGNEE_EDITABLE_FIELDS = ['status'];

/** Ändern: Besitzer und Admins; zugewiesene Personen dürfen nur ASSIGNEE_EDITABLE_FIELDS bearbeiten (siehe canEditFields). */
export const canModify = (ticket, user) => canSeeAll(user) || isOwner(ticket, user) || isAssignee(ticket, user);
/** Löschen und (Neu-)Zuweisen: nur Besitzer und Admins. */
export const canManage = (ticket, user) => canSeeAll(user) || isOwner(ticket, user);

/** Dürfen genau diese Felder geändert werden? Besitzer/Admins alle, Zugewiesene nur ASSIGNEE_EDITABLE_FIELDS. */
export const canEditFields = (ticket, user, fields) =>
  canManage(ticket, user) || fields.every((field) => ASSIGNEE_EDITABLE_FIELDS.includes(field));
