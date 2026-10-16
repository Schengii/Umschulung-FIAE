// ============================================================
// Amazon 2.0 – Biometric Passkey / WebAuthn Engine
// ============================================================

export interface PasskeyCredential {
  id: string;
  name: string;
  deviceType: 'apple' | 'windows' | 'android' | 'security-key';
  createdAt: number;
  lastUsedAt: number;
  publicKeySnippet: string;
}

const STORAGE_KEY = 'amazon2_passkeys';

const DEFAULT_DEMO_KEYS: PasskeyCredential[] = [
  {
    id: 'passkey-default-1',
    name: 'Windows Hello / Touch ID Key',
    deviceType: 'apple',
    createdAt: Date.now() - 86400000 * 3,
    lastUsedAt: Date.now() - 3600000,
    publicKeySnippet: 'ecdsa-p256:4a8b...9f12',
  },
];

let inMemoryKeys: PasskeyCredential[] = [...DEFAULT_DEMO_KEYS];

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined';
}

export function getSavedPasskeys(): PasskeyCredential[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        savePasskeys(DEFAULT_DEMO_KEYS);
        return DEFAULT_DEMO_KEYS;
      }
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return inMemoryKeys;
}

export function savePasskeys(passkeys: PasskeyCredential[]): void {
  inMemoryKeys = passkeys;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(passkeys));
    }
  } catch (e) {
    console.error('Failed to save passkeys', e);
  }
}

export async function registerNewPasskey(name: string): Promise<PasskeyCredential> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent);
      const isWin = typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent);
      const deviceType = isMac ? 'apple' : isWin ? 'windows' : 'android';

      const newKey: PasskeyCredential = {
        id: `passkey-${Date.now()}`,
        name: name || (isMac ? 'Touch ID / Face ID' : isWin ? 'Windows Hello Biometrics' : 'Android Biometric Key'),
        deviceType,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        publicKeySnippet: `ecdsa-p256:${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      };

      const all = getSavedPasskeys();
      all.push(newKey);
      savePasskeys(all);
      resolve(newKey);
    }, 50);
  });
}

export async function verifyPasskeyBiometric(passkeyId?: string): Promise<{ success: boolean; passkeyName: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const keys = getSavedPasskeys();
      const target = keys.find(k => k.id === passkeyId) || keys[0];
      if (target) {
        target.lastUsedAt = Date.now();
        savePasskeys(keys);
        resolve({ success: true, passkeyName: target.name });
      } else {
        resolve({ success: true, passkeyName: 'Biometrischer Schlüssel' });
      }
    }, 50);
  });
}
