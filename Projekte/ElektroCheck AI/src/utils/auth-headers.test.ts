import { describe, it, expect, beforeEach } from 'vitest';
import { buildApiHeaders, withAccessToken } from './auth-headers';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

beforeEach(() => {
  (globalThis as { localStorage: unknown }).localStorage = new MemoryStorage();
});

describe('withAccessToken', () => {
  it('sendet ohne Token keinen Authorization-Header', () => {
    expect(withAccessToken({ A: '1' })).toEqual({ A: '1' });
  });

  it('nutzt den Dienst-Zugriffstoken', () => {
    localStorage.setItem('electrocheck_access_token', ' dienst ');
    expect(withAccessToken().Authorization).toBe('Bearer dienst');
  });

  it('bevorzugt die Session des Logins vor dem Dienst-Token', () => {
    localStorage.setItem('electrocheck_access_token', 'dienst');
    localStorage.setItem('electrocheck_session', 'sitzung');
    expect(withAccessToken().Authorization).toBe('Bearer sitzung');
  });
});

describe('buildApiHeaders', () => {
  it('setzt JSON, eigene API-Keys und Authorization', () => {
    localStorage.setItem('electrocheck_session', 's');
    expect(buildApiHeaders({ apiKey: 'g', perplexityApiKey: 'p' })).toEqual({
      'Content-Type': 'application/json',
      'x-gemini-api-key': 'g',
      'x-perplexity-api-key': 'p',
      Authorization: 'Bearer s',
    });
  });
});
