import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('POST /api/gemini/transcribe', () => {
  it('returns 400 when no audio is provided', async () => {
    const res = await request(app).post('/api/gemini/transcribe').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
