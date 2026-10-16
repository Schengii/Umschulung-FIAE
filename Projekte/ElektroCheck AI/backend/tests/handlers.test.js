import { describe, it, expect, afterEach } from 'vitest';
import ticketsCollection from '../../api/tickets/index.js';
import ticketItem from '../../api/tickets/[id].js';
import sendEmail from '../../api/reports/send-email.js';

// Die Handler werden hier ohne Express aufgerufen – so wie Vercel sie ausführt.
function call(handler, { method = 'GET', body, query = {}, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload, headers: this.headers }); },
      send(payload) { resolve({ status: this.statusCode, body: payload, headers: this.headers }); }
    };
    const req = { method, body, query, headers: { 'x-forwarded-for': `test-${Math.random()}`, ...headers }, skipHandlerRateLimit: true };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

describe('Vercel-Handler: Tickets', () => {
  it('legt ein Ticket an, aktualisiert und löscht es', async () => {
    const created = await call(ticketsCollection, { method: 'POST', body: { deviceName: 'Handlertest', id: 'FAKE', createdAt: 'x' } });
    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^TKT-\d{4}-\d{6}$/); // id/createdAt aus dem Body werden überschrieben
    expect(created.body.createdAt).not.toBe('x');
    const { id } = created.body;

    const updated = await call(ticketItem, { method: 'PUT', query: { id }, body: { status: 'closed', id: 'OTHER' } });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ id, status: 'closed', deviceName: 'Handlertest' });
    expect(updated.body.updatedAt).toBeDefined();

    const list = await call(ticketsCollection, { method: 'GET' });
    expect(list.body.some(t => t.id === id)).toBe(true);

    expect((await call(ticketItem, { method: 'DELETE', query: { id } })).status).toBe(204);
    expect((await call(ticketItem, { method: 'DELETE', query: { id } })).status).toBe(404);
  });

  it('lehnt nicht erlaubte Methoden mit 405 ab', async () => {
    const res = await call(ticketsCollection, { method: 'DELETE' });
    expect(res.status).toBe(405);
    expect(res.headers.Allow).toBe('GET, POST');
  });
});

describe('Vercel-Handler: E-Mail-Versand', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it('meldet in Production ohne RESEND_API_KEY einen Fehler statt „gesendet“', async () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_ACCESS_TOKEN = 't';
    delete process.env.RESEND_API_KEY;
    const res = await call(sendEmail, {
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { recipientEmail: 'kunde@beispiel.de' }
    });
    expect(res.status).toBe(503);
  });
});
