import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('POST /api/gemini/scan-type-plate', () => {
  it('returns 400 when no image is provided', async () => {
    const res = await request(app).post('/api/gemini/scan-type-plate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 413 when image is too large', async () => {
    const bigBase64 = 'a'.repeat(7_000_000);
    const res = await request(app).post('/api/gemini/scan-type-plate').send({ imageBase64: bigBase64 });
    expect(res.status).toBe(413);
  });
});
