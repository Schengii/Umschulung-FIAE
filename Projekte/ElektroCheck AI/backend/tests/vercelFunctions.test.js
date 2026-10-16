import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../index.js';

const apiDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'api');

function countFunctions(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => {
    if (entry.name.startsWith('_')) return sum; // _lib enthält Hilfsmodule, keine Functions
    if (entry.isDirectory()) return sum + countFunctions(path.join(dir, entry.name));
    return sum + (entry.name.endsWith('.js') ? 1 : 0);
  }, 0);
}

describe('Vercel-Functions', () => {
  it('bleiben im Limit des Hobby-Plans (max. 12 pro Deployment)', () => {
    expect(countFunctions(apiDir)).toBeLessThanOrEqual(12);
  });

  it('Auth-Dispatcher antwortet auf unbekannte Aktionen mit 404', async () => {
    const res = await request(app).post('/api/auth/gibt-es-nicht').send({});
    expect(res.status).toBe(404);
  });
});
