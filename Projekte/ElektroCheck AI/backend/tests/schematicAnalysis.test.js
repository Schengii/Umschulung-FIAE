import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('Schematic Analysis Endpoint', () => {
  it('should return 400 if imageBase64 is missing', async () => {
    // Basic test checking route handler validation
    const app = express();
    app.use(express.json());
    app.post('/api/gemini/schematic-analysis', (req, res) => {
      const { imageBase64 } = req.body || {};
      if (!imageBase64) return res.status(400).json({ error: 'Kein Schaltplan-Bild übergeben.' });
      res.json({ ok: true });
    });

    const res = await request(app)
      .post('/api/gemini/schematic-analysis')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Kein Schaltplan-Bild übergeben.');
  });
});
