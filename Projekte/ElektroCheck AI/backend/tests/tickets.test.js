import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('GET /api/tickets', () => {
  it('returns an array of tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.headers['x-total-count']).toBeDefined();
  });

  it('supports limit query parameter', async () => {
    const res = await request(app).get('/api/tickets?limit=2');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.page).toBe('number');
  });

  it('supports envelope query parameter for unified JSON responses', async () => {
    const res = await request(app).get('/api/tickets?envelope=true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.page).toBe('number');
  });
});

describe('POST /api/tickets', () => {
  it('returns 400 when no body is provided', async () => {
    const res = await request(app).post('/api/tickets').send({});
    expect(res.status).toBe(400);
  });

  it('creates a ticket and returns id', async () => {
    const diagnosis = {
      deviceName: 'Testgerät',
      identifiedDefect: 'Kabelbruch',
      recommendation: 'Kabel ersetzen',
      safetyLevel: 'WARNING'
    };
    const res = await request(app).post('/api/tickets').send(diagnosis);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toMatch(/^TKT-/);
  });
});

describe('PUT /api/tickets/:id', () => {
  it('returns 404 for a non-existent ticket id', async () => {
    const res = await request(app).put('/api/tickets/TKT-NONEXISTENT').send({ status: 'closed' });
    expect(res.status).toBe(404);
  });

  it('updates an existing ticket and returns updatedAt', async () => {
    // first create a ticket
    const createRes = await request(app).post('/api/tickets').send({
      deviceName: 'UpdateTest',
      identifiedDefect: 'Test',
      safetyLevel: 'SAFE'
    });
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app).put(`/api/tickets/${id}`).send({ status: 'in_progress' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('in_progress');
    expect(updateRes.body).toHaveProperty('updatedAt');
  });
});

describe('DELETE /api/tickets/:id', () => {
  it('returns 404 for a non-existent ticket id', async () => {
    const res = await request(app).delete('/api/tickets/TKT-NONEXISTENT');
    expect(res.status).toBe(404);
  });

  it('deletes an existing ticket and returns 204', async () => {
    const createRes = await request(app).post('/api/tickets').send({
      deviceName: 'DeleteTest',
      identifiedDefect: 'Test',
      safetyLevel: 'SAFE'
    });
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/tickets/${id}`);
    expect(deleteRes.status).toBe(204);

    // verify it's gone
    const getRes = await request(app).get('/api/tickets');
    const allIds = getRes.body.map((t) => t.id);
    expect(allIds).not.toContain(id);
  });
});
