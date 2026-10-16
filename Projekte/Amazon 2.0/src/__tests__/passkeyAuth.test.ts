import { describe, it, expect } from 'vitest';
import { getSavedPasskeys, registerNewPasskey, verifyPasskeyBiometric } from '../utils/passkeyAuth';

describe('Biometric Passkey / WebAuthn Engine', () => {
  it('manages passkey list and registers new credentials', async () => {
    const initialKeys = getSavedPasskeys();
    expect(initialKeys.length).toBeGreaterThan(0);

    const newKey = await registerNewPasskey('Test Key MacBook');
    expect(newKey.name).toBe('Test Key MacBook');
    expect(newKey.id).toContain('passkey-');
    expect(newKey.publicKeySnippet).toContain('ecdsa-p256');

    const verify = await verifyPasskeyBiometric(newKey.id);
    expect(verify.success).toBe(true);
    expect(verify.passkeyName).toBe('Test Key MacBook');
  });
});
