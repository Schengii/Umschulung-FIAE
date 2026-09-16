import { describe, it, expect } from 'vitest';
import { simulateWebhookDispatch, WEBHOOK_PRESETS } from './webhookSimulator';

describe('webhookSimulator', () => {
  it('simuliert einen GitHub Push Webhook erfolgreich', () => {
    const preset = WEBHOOK_PRESETS[0];
    const res = simulateWebhookDispatch(preset);

    expect(res.id).toBeDefined();
    expect(res.statusCode).toBe(200);
    expect(res.endpoint).toBe('/api/webhooks/github');
    expect(res.service).toBe('GitHub');
    expect(res.headers['X-GitHub-Event']).toBe('push');
  });

  it('liefert 400 Bad Request bei fehlendem Endpoint', () => {
    const res = simulateWebhookDispatch({});
    expect(res.statusCode).toBe(400);
    expect(res.statusText).toBe('Bad Request');
  });
});
