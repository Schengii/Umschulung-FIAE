import { defineConfig } from 'vitest/config';
import os from 'node:os';
import path from 'node:path';

export default defineConfig({
  test: {
    env: {
      // Tests dürfen nicht in backend/data/tickets.json schreiben
      API_RATE_LIMIT_MAX: '100000',
      LOGIN_RATE_LIMIT_MAX: '100000',
      TICKETS_FILE: path.join(os.tmpdir(), 'electrocheck-test-tickets.json'),
    },
  },
});
