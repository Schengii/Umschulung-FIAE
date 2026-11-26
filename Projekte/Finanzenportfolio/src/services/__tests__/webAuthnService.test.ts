import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isWebAuthnSupported,
  hasRegisteredPasskey,
  unregisterPasskey,
  authenticateWithPasskey
} from '../webAuthnService';

describe('webAuthnService', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => { mockStore[key] = val; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; }
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockLocalStorage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
  });

  it('detects missing WebAuthn support when window.PublicKeyCredential is not present', async () => {
    const supported = await isWebAuthnSupported();
    expect(supported).toBe(false);
  });

  it('checks registered passkey state accurately (Credential-ID, PRF-Salt und Wrapped-Key nötig)', () => {
    expect(hasRegisteredPasskey()).toBe(false);

    localStorage.setItem('finanz_passkey_credential_id', 'deadbeef1234');
    localStorage.setItem('finanz_passkey_wrapped_key', 'cipher123');
    localStorage.setItem('finanz_passkey_prf_salt', 'aabbcc');
    expect(hasRegisteredPasskey()).toBe(true);

    unregisterPasskey();
    expect(hasRegisteredPasskey()).toBe(false);
    expect(localStorage.getItem('finanz_passkey_credential_id')).toBeNull();
    expect(localStorage.getItem('finanz_passkey_prf_salt')).toBeNull();
  });

  it('verwirft alte, nur verschleierte Passkey-Registrierungen ohne PRF-Salt', () => {
    localStorage.setItem('finanz_passkey_credential_id', 'deadbeef1234');
    localStorage.setItem('finanz_passkey_wrapped_key', 'cipher123');

    expect(hasRegisteredPasskey()).toBe(false);
    expect(localStorage.getItem('finanz_passkey_credential_id')).toBeNull();
    expect(localStorage.getItem('finanz_passkey_wrapped_key')).toBeNull();
  });

  it('Authentifizierung ohne Registrierung schlägt kontrolliert fehl', async () => {
    const res = await authenticateWithPasskey();
    expect(res.success).toBe(false);
    expect(res.masterPin).toBeUndefined();
  });
});
