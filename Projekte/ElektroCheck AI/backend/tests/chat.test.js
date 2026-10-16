import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Chat Endpoint (/api/gemini/chat)', () => {
  it('should return 400 if messages are missing or empty', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Keine Chat-Nachrichten übergeben.');
  });

  it('should return 400 if messages is not an array', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Keine Chat-Nachrichten übergeben.');
  });
});
