import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { kvResetMemory } from '../../api/_lib/kv.js';

const ENV_KEYS = ['AUTH_ALLOWED_EMAILS', 'AUTH_ADMIN_EMAILS', 'APP_ACCESS_TOKEN', 'APP_URL'];
let saved;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.AUTH_ALLOWED_EMAILS = '@firma.de,extern@beispiel.de';
  process.env.AUTH_ADMIN_EMAILS = 'chef@firma.de';
  process.env.APP_URL = 'https://app.example';
  delete process.env.APP_ACCESS_TOKEN;
  kvResetMemory();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const requestLink = (email) => request(app).post('/api/auth/request-link').send({ email });
const tokenFromLink = (link) => new URL(link).searchParams.get('login_token');
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

async function login(email) {
  const link = await requestLink(email);
  const res = await request(app).post('/api/auth/verify').send({ token: tokenFromLink(link.body.devLink) });
  expect(res.status).toBe(200);
  return res.body.sessionToken;
}

describe('Magic-Link-Login', () => {
  it('erzeugt Link und Code für freigegebene Adressen (Simulationsmodus liefert sie zurück)', async () => {
    const res = await requestLink('anna@firma.de');
    expect(res.status).toBe(200);
    expect(res.body.devLink.startsWith('https://app.example/?login_token=')).toBe(true);
    expect(res.body.devCode).toMatch(/^\d{6}$/);
  });

  it('antwortet für nicht freigegebene Adressen gleich, ohne Link (keine Auskunft über Zugang)', async () => {
    const res = await requestLink('fremd@andere.de');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('lehnt ungültige Adressen ab', async () => {
    expect((await requestLink('kein-mail')).status).toBe(400);
  });

  it('begrenzt Anfragen pro Adresse auf 3 pro 15 Minuten', async () => {
    for (let i = 0; i < 3; i++) expect((await requestLink('limit@firma.de')).body.devLink).toBeDefined();
    expect((await requestLink('limit@firma.de')).body).toEqual({ ok: true });
  });

  it('löst den Link ein und die Session öffnet die API; der Link ist nur einmal gültig', async () => {
    const link = (await requestLink('anna@firma.de')).body.devLink;
    const token = tokenFromLink(link);

    const verified = await request(app).post('/api/auth/verify').send({ token });
    expect(verified.status).toBe(200);
    expect(verified.body.user).toEqual({ email: 'anna@firma.de', role: 'member' });

    const me = await request(app).get('/api/auth/me').set(bearer(verified.body.sessionToken));
    expect(me.body.user.email).toBe('anna@firma.de');
    expect((await request(app).get('/api/tickets').set(bearer(verified.body.sessionToken))).status).toBe(200);

    expect((await request(app).post('/api/auth/verify').send({ token })).status).toBe(401);
  });

  it('akzeptiert E-Mail + Code statt Link und sperrt nach 5 Fehlversuchen', async () => {
    const { devCode } = (await requestLink('code@firma.de')).body;
    const ok = await request(app).post('/api/auth/verify').send({ email: 'code@firma.de', code: devCode });
    expect(ok.status).toBe(200);

    const second = (await requestLink('sperre@firma.de')).body;
    const wrong = second.devCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post('/api/auth/verify').send({ email: 'sperre@firma.de', code: wrong })).status).toBe(401);
    }
    // jetzt gesperrt – auch der richtige Code funktioniert nicht mehr
    expect((await request(app).post('/api/auth/verify').send({ email: 'sperre@firma.de', code: second.devCode })).status).toBe(401);
  });

  it('zählt parallele Fehlversuche atomar und setzt den Zähler durch neue Link-Anfragen nicht zurück', async () => {
    const first = (await requestLink('parallel@firma.de')).body;
    const wrong = first.devCode === '000000' ? '111111' : '000000';
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () => request(app).post('/api/auth/verify').send({ email: 'parallel@firma.de', code: wrong }))
    );
    expect(attempts.every((r) => r.status === 401)).toBe(true);

    // ein neuer Link/Code ändert nichts: das Versuchslimit gilt je Zeitfenster und Adresse
    const second = (await requestLink('parallel@firma.de')).body;
    expect((await request(app).post('/api/auth/verify').send({ email: 'parallel@firma.de', code: second.devCode })).status).toBe(401);
  });

  it('weist Tokens ab, die nie ausgestellt wurden', async () => {
    expect((await request(app).post('/api/auth/verify').send({ token: 'x'.repeat(43) })).status).toBe(401);
    expect((await request(app).post('/api/auth/verify').send({})).status).toBe(400);
  });

  it('verlangt eine Anmeldung für die API, sobald Login konfiguriert ist', async () => {
    expect((await request(app).get('/api/tickets')).status).toBe(401);
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/tickets').set(bearer('x'.repeat(43)))).status).toBe(401);
  });

  it('macht das Token beim Abmelden ungültig', async () => {
    const token = await login('anna@firma.de');
    expect((await request(app).post('/api/auth/logout').set(bearer(token))).status).toBe(200);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
  });

  it('entwertet Sessions, wenn die Adresse aus der Freigabeliste entfernt wird', async () => {
    const token = await login('extern@beispiel.de');
    process.env.AUTH_ALLOWED_EMAILS = '@firma.de';
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
  });

  it('vergibt die Admin-Rolle über AUTH_ADMIN_EMAILS', async () => {
    const token = await login('chef@firma.de');
    expect((await request(app).get('/api/auth/me').set(bearer(token))).body.user.role).toBe('admin');
  });

  it('lässt den Dienst-Token (APP_ACCESS_TOKEN) weiter zu', async () => {
    process.env.APP_ACCESS_TOKEN = 'dienst';
    const me = await request(app).get('/api/auth/me').set(bearer('dienst'));
    expect(me.body.user).toEqual({ email: 'service', role: 'service' });
  });
});

describe('Ticket-Besitz und Zuweisung', () => {
  const create = (token, body = { deviceName: 'Gerät' }) => request(app).post('/api/tickets').set(bearer(token)).send(body);

  it('ordnet Tickets dem Ersteller zu; der Besitzer ist nicht fälschbar', async () => {
    const anna = await login('anna@firma.de');
    const res = await create(anna, { deviceName: 'A', ownerEmail: 'chef@firma.de' });
    expect(res.status).toBe(201);
    expect(res.body.ownerEmail).toBe('anna@firma.de');
  });

  it('zeigt Mitgliedern nur eigene Tickets, Admins und Dienst-Token alle', async () => {
    const anna = await login('anna@firma.de');
    const ben = await login('ben@firma.de');
    const chef = await login('chef@firma.de');
    const ticket = (await create(anna)).body;

    const annaList = (await request(app).get('/api/tickets').set(bearer(anna))).body;
    const benList = (await request(app).get('/api/tickets').set(bearer(ben))).body;
    const chefList = (await request(app).get('/api/tickets').set(bearer(chef))).body;
    expect(annaList.some((t) => t.id === ticket.id)).toBe(true);
    expect(benList.some((t) => t.id === ticket.id)).toBe(false);
    expect(chefList.some((t) => t.id === ticket.id)).toBe(true);

    process.env.APP_ACCESS_TOKEN = 'dienst';
    expect((await request(app).get('/api/tickets').set(bearer('dienst'))).body.some((t) => t.id === ticket.id)).toBe(true);
  });

  it('behandelt fremde Tickets wie nicht vorhanden', async () => {
    const anna = await login('anna@firma.de');
    const ben = await login('ben@firma.de');
    const ticket = (await create(anna)).body;
    expect((await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(ben)).send({ status: 'x' })).status).toBe(404);
    expect((await request(app).delete(`/api/tickets/${ticket.id}`).set(bearer(ben))).status).toBe(404);
  });

  it('erlaubt dem Ersteller Zuweisung; Zugewiesene sehen und bearbeiten, aber löschen nicht', async () => {
    const anna = await login('anna@firma.de');
    const ben = await login('ben@firma.de');
    const ticket = (await create(anna)).body;

    const assigned = await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(anna)).send({ assignedTo: 'Ben@Firma.de' });
    expect(assigned.body.assignedTo).toBe('ben@firma.de');

    expect((await request(app).get('/api/tickets').set(bearer(ben))).body.some((t) => t.id === ticket.id)).toBe(true);
    const edit = await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(ben)).send({ status: 'in Arbeit' });
    expect(edit.status).toBe(200);
    expect(edit.body.status).toBe('in Arbeit');
    expect(edit.body.ownerEmail).toBe('anna@firma.de');
    expect((await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(ben)).send({ assignedTo: 'x@firma.de' })).status).toBe(403);
    expect((await request(app).delete(`/api/tickets/${ticket.id}`).set(bearer(ben))).status).toBe(403);
    expect((await request(app).delete(`/api/tickets/${ticket.id}`).set(bearer(anna))).status).toBe(204);
  });

  it('lässt Zugewiesene nur den Status ändern, alle anderen Felder bleiben dem Ersteller', async () => {
    const anna = await login('anna@firma.de');
    const ben = await login('ben@firma.de');
    const ticket = (await create(anna, { deviceName: 'Original' })).body;
    await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(anna)).send({ assignedTo: 'ben@firma.de' });

    for (const body of [{ deviceName: 'Manipuliert' }, { status: 'erledigt', notes: 'x' }, { ownerEmail: 'ben@firma.de' }]) {
      expect((await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(ben)).send(body)).status).toBe(403);
    }
    const unchanged = (await request(app).get('/api/tickets').set(bearer(anna))).body.find((t) => t.id === ticket.id);
    expect(unchanged.deviceName).toBe('Original');
    expect(unchanged.status).toBeUndefined();

    // Der Ersteller darf weiterhin alles ändern
    expect((await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(anna)).send({ deviceName: 'Neu' })).body.deviceName).toBe('Neu');
  });

  it('prüft die Adresse beim Anlegen eines Tickets mit Zuweisung', async () => {
    const anna = await login('anna@firma.de');
    expect((await create(anna, { deviceName: 'A', assignedTo: 'kaputt' })).status).toBe(400);
    const ok = await create(anna, { deviceName: 'A', assignedTo: 'Ben@Firma.de' });
    expect(ok.status).toBe(201);
    expect(ok.body.assignedTo).toBe('ben@firma.de');
  });

  it('prüft die Adresse bei der Zuweisung', async () => {
    const anna = await login('anna@firma.de');
    const ticket = (await create(anna)).body;
    expect((await request(app).put(`/api/tickets/${ticket.id}`).set(bearer(anna)).send({ assignedTo: 'kaputt' })).status).toBe(400);
  });
});
