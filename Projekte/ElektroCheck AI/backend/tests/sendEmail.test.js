import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Reports Email Endpoint (/api/reports/send-email)', () => {
  it('should return 400 if recipientEmail is missing or invalid', async () => {
    const res = await request(app)
      .post('/api/reports/send-email')
      .send({ recipientName: 'Max Mustermann' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Gültige Empfänger-E-Mail erforderlich.');
  });

  it('should return 200 with simulated mode if valid email is provided', async () => {
    const res = await request(app)
      .post('/api/reports/send-email')
      .send({
        recipientEmail: 'kunde@beispiel.de',
        recipientName: 'Herr Müller',
        reportTitle: 'Prüfbericht Bohrhammer',
        reportSummary: 'DGUV V3 Prüfung bestanden.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBeDefined();
  });
});
