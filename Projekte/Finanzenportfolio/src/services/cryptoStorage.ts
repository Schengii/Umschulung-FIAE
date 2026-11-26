/**
 * AES-GCM Web Crypto API wrapper for encrypted local storage persistence.
 *
 * Formate:
 *  - Legacy (ohne Präfix): base64(salt[16] | iv[12] | ciphertext), PBKDF2 mit 100.000 Iterationen
 *  - v2 ("v2:"-Präfix):     base64(salt[16] | iv[12] | ciphertext), PBKDF2 mit 600.000 Iterationen
 *
 * Neue Daten werden immer als v2 geschrieben, Legacy-Daten bleiben lesbar und können
 * über `isLegacyCipher` erkannt und beim nächsten Speichern migriert werden.
 */

export const LEGACY_ITERATIONS = 100_000;
export const CURRENT_ITERATIONS = 600_000; // OWASP-Empfehlung für PBKDF2-HMAC-SHA256
const V2_PREFIX = 'v2:';

async function getKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Base64-Kodierung in Blöcken (String.fromCharCode(...bytes) sprengt bei großen Tresoren den Call-Stack). */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** true, wenn der Chiffretext noch im alten 100k-Format vorliegt und neu verschlüsselt werden sollte. */
export function isLegacyCipher(cipherText: string): boolean {
  return !cipherText.startsWith(V2_PREFIX);
}

export async function encryptData(data: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(password, salt, CURRENT_ITERATIONS);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    enc.encode(data)
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return V2_PREFIX + bytesToBase64(combined);
}

export async function decryptData(cipherTextB64: string, password: string): Promise<string> {
  const legacy = isLegacyCipher(cipherTextB64);
  const iterations = legacy ? LEGACY_ITERATIONS : CURRENT_ITERATIONS;
  const bytes = base64ToBytes(legacy ? cipherTextB64 : cipherTextB64.slice(V2_PREFIX.length));

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const data = bytes.slice(28);

  const key = await getKey(password, salt, iterations);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    data as unknown as BufferSource
  );

  return new TextDecoder().decode(decrypted);
}
