import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isWebAuthnSupported,
  hasRegisteredPasskey,
  unregisterPasskey
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
    (globalThis as any).localStorage = mockLocalStorage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it('detects missing WebAuthn support when window.PublicKeyCredential is not present', async () => {
    const supported = await isWebAuthnSupported();
    expect(supported).toBe(false);
  });

  it('checks registered passkey state accurately', () => {
    expect(hasRegisteredPasskey()).toBe(false);

    localStorage.setItem('finanz_passkey_credential_id', 'deadbeef1234');
    expect(hasRegisteredPasskey()).toBe(false);

    localStorage.setItem('finanz_passkey_wrapped_key', 'cipher123');
    expect(hasRegisteredPasskey()).toBe(true);

    unregisterPasskey();
    expect(hasRegisteredPasskey()).toBe(false);
    expect(localStorage.getItem('finanz_passkey_credential_id')).toBeNull();
  });
});
