import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// Vercel begrenzt Request-Bodies hart auf 4,5 MB – der Adapter bildet das lokal nach.
describe('Body-Limit des Express-Adapters', () => {
  it('antwortet bei zu großem Body mit JSON-413 statt HTML', async () => {
    const big = 'a'.repeat(5 * 1024 * 1024);
    const res = await request(app).post('/api/gemini/diagnosis').send({ image: big });
    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/zu groß/i);
  });

  it('lässt Bodies unter 4,5 MB bei Gemini-Routen passieren (kein 413)', async () => {
    const ok = 'a'.repeat(1024 * 1024);
    const res = await request(app).post('/api/gemini/diagnosis').send({ image: ok });
    expect(res.status).not.toBe(413);
  });

  it('begrenzt andere Routen weiter auf 100 kb', async () => {
    const res = await request(app).post('/api/tickets').send({ data: 'a'.repeat(200 * 1024) });
    expect(res.status).toBe(413);
  });
});
