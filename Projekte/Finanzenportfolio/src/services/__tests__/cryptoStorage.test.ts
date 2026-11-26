// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { encryptData, decryptData, isLegacyCipher, LEGACY_ITERATIONS } from '../cryptoStorage';
import {
  VAULT_KEY,
  secureGet,
  secureSet,
  secureRemove,
  unlockSecrets,
  persistSecrets,
  lockSecrets,
  restoreSecretsToPlaintext,
  setSessionPin,
  __resetSecureStoreForTests
} from '../secureStore';


/** Erzeugt einen Chiffretext im alten Format (100k Iterationen, ohne Präfix). */
async function legacyEncrypt(data: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const material = await window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: LEGACY_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const ct = new Uint8Array(await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data)));
  const all = new Uint8Array(28 + ct.length);
  all.set(salt, 0);
  all.set(iv, 16);
  all.set(ct, 28);
  return btoa(String.fromCharCode(...all));
}

describe('cryptoStorage', () => {
  it('Roundtrip: v2-Format mit Präfix', async () => {
    const cipher = await encryptData('{"a":1}', 'geheim');
    expect(cipher.startsWith('v2:')).toBe(true);
    expect(isLegacyCipher(cipher)).toBe(false);
    expect(await decryptData(cipher, 'geheim')).toBe('{"a":1}');
  });

  it('liest Legacy-Chiffretexte (100k) weiterhin und erkennt sie', async () => {
    const legacy = await legacyEncrypt('alt', 'pin1234');
    expect(isLegacyCipher(legacy)).toBe(true);
    expect(await decryptData(legacy, 'pin1234')).toBe('alt');
  });

  it('falsche PIN wird abgelehnt', async () => {
    const cipher = await encryptData('x', 'richtig');
    await expect(decryptData(cipher, 'falsch')).rejects.toBeDefined();
  });

  it('manipulierter Chiffretext wird abgelehnt (GCM-Authentifizierung)', async () => {
    const cipher = await encryptData('x', 'pin');
    const body = cipher.slice(3);
    const bytes = Uint8Array.from(atob(body), c => c.charCodeAt(0));
    bytes[bytes.length - 1] ^= 0xff;
    const tampered = 'v2:' + btoa(String.fromCharCode(...bytes));
    await expect(decryptData(tampered, 'pin')).rejects.toBeDefined();
  });

  it('verschlüsselt große Payloads (> 200 KB) ohne Stack-Überlauf', async () => {
    const big = 'x'.repeat(300_000);
    const cipher = await encryptData(big, 'pin');
    expect((await decryptData(cipher, 'pin')).length).toBe(big.length);
  }, 20000);

  it('erzeugt bei jedem Aufruf neuen Salt/IV', async () => {
    const a = await encryptData('gleich', 'pin');
    const b = await encryptData('gleich', 'pin');
    expect(a).not.toBe(b);
  });
});

describe('secureStore', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetSecureStoreForTests();
  });

  it('ohne Tresor: Werte liegen in localStorage', () => {
    secureSet('finanz_finnhub_api_key', 'abc');
    expect(localStorage.getItem('finanz_finnhub_api_key')).toBe('abc');
    expect(secureGet('finanz_finnhub_api_key')).toBe('abc');
    secureRemove('finanz_finnhub_api_key');
    expect(secureGet('finanz_finnhub_api_key')).toBeNull();
  });

  it('mit Tresor: Klartext wird migriert und nicht mehr im Klartext gespeichert', async () => {
    localStorage.setItem('finanz_finnhub_api_key', 'KEY-123');
    localStorage.setItem(VAULT_KEY, await encryptData('[]', 'pin'));

    await unlockSecrets('pin');

    expect(localStorage.getItem('finanz_finnhub_api_key')).toBeNull();
    expect(secureGet('finanz_finnhub_api_key')).toBe('KEY-123');
    const bundleCipher = localStorage.getItem('finanz_encrypted_secrets');
    expect(bundleCipher).toBeTruthy();
    expect(bundleCipher).not.toContain('KEY-123');
  }, 20000);

  it('Sperren verwirft Werte, erneutes Entsperren stellt sie wieder her', async () => {
    localStorage.setItem(VAULT_KEY, await encryptData('[]', 'pin'));
    await unlockSecrets('pin');
    secureSet('finanz_webhook_url', 'https://example.test/hook');
    await persistSecrets();
    lockSecrets();
    expect(secureGet('finanz_webhook_url')).toBeNull();

    await unlockSecrets('pin');
    expect(secureGet('finanz_webhook_url')).toBe('https://example.test/hook');
  }, 30000);

  it('falsche PIN beim Entsperren wirft', async () => {
    localStorage.setItem(VAULT_KEY, await encryptData('[]', 'pin'));
    await unlockSecrets('pin');
    secureSet('finanz_webhook_url', 'x');
    await persistSecrets();
    lockSecrets();
    await expect(unlockSecrets('falsch')).rejects.toBeDefined();
    setSessionPin(null);
  }, 30000);

  it('Deaktivieren stellt Klartext wieder her', async () => {
    localStorage.setItem(VAULT_KEY, await encryptData('[]', 'pin'));
    await unlockSecrets('pin');
    secureSet('finanz_webdav_config', '{"u":1}');
    localStorage.removeItem(VAULT_KEY);
    restoreSecretsToPlaintext();
    expect(localStorage.getItem('finanz_webdav_config')).toBe('{"u":1}');
    expect(localStorage.getItem('finanz_encrypted_secrets')).toBeNull();
  }, 20000);
});
