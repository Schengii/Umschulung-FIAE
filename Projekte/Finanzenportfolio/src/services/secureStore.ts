/**
 * Sensible Einstellungen (API-Keys, Webhook-/WebDAV-Zugang, Snapshots, ...) landen nicht mehr
 * im Klartext in localStorage, sobald der Tresor aktiv ist.
 *
 * - Tresor aktiv + entsperrt: Werte liegen im Speicher und werden als ein verschlüsseltes Bündel
 *   (`finanz_encrypted_secrets`) persistiert.
 * - Kein Tresor: Fallback auf localStorage (Nutzer hat keine Verschlüsselung aktiviert).
 *
 * Die Master-PIN wird nur im Arbeitsspeicher gehalten und beim Sperren verworfen.
 */
import { encryptData, decryptData } from './cryptoStorage';

export const VAULT_KEY = 'finanz_encrypted_vault';
const BUNDLE_KEY = 'finanz_encrypted_secrets';

/** Schlüssel, die bei aktivem Tresor verschlüsselt statt im Klartext gespeichert werden. */
export const SECURE_KEYS = [
  'finanz_finnhub_api_key',
  'finanz_webhook_url',
  'finanz_webhook_token',
  'finanz_webhook_logs',
  'finanz_webdav_config',
  'finanz_snapshots',
  'finanz_networth_custom_assets',
  'finanz_holding_tags'
] as const;

let sessionPin: string | null = null;
let bundle: Record<string, string> = {};
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function isVaultConfigured(): boolean {
  return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(VAULT_KEY));
}

export function setSessionPin(pin: string | null): void {
  sessionPin = pin;
}

export function getSessionPin(): string | null {
  return sessionPin;
}

export function secureGet(key: string): string | null {
  if (isVaultConfigured()) return bundle[key] ?? null;
  return localStorage.getItem(key);
}

export function secureSet(key: string, value: string): void {
  if (isVaultConfigured()) {
    bundle[key] = value;
    schedulePersist();
  } else {
    localStorage.setItem(key, value);
  }
}

export function secureRemove(key: string): void {
  if (isVaultConfigured()) {
    delete bundle[key];
    schedulePersist();
  } else {
    localStorage.removeItem(key);
  }
}

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void persistSecrets();
  }, 500);
}

/** Schreibt das Bündel verschlüsselt weg (nur mit entsperrtem Tresor). */
export async function persistSecrets(): Promise<void> {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (!sessionPin || !isVaultConfigured()) return;
  localStorage.setItem(BUNDLE_KEY, await encryptData(JSON.stringify(bundle), sessionPin));
}

/**
 * Lädt das verschlüsselte Bündel. Beim ersten Entsperren werden vorhandene Klartext-Werte
 * migriert und aus localStorage entfernt.
 */
export async function unlockSecrets(pin: string): Promise<void> {
  sessionPin = pin;
  const cipher = localStorage.getItem(BUNDLE_KEY);
  bundle = cipher ? (JSON.parse(await decryptData(cipher, pin)) as Record<string, string>) : {};
  await migratePlaintextSecrets();
}

/** Verschiebt Klartext-Werte (z. B. nach dem Aktivieren des Tresors) ins verschlüsselte Bündel. */
export async function migratePlaintextSecrets(): Promise<void> {
  let changed = false;
  for (const key of SECURE_KEYS) {
    const plain = localStorage.getItem(key);
    if (plain !== null) {
      if (!(key in bundle)) bundle[key] = plain;
      localStorage.removeItem(key);
      changed = true;
    }
  }
  if (changed || !localStorage.getItem(BUNDLE_KEY)) await persistSecrets();
}

/** Beim Deaktivieren des Tresors: Bündel zurück in localStorage und löschen. */
export function restoreSecretsToPlaintext(): void {
  for (const [key, value] of Object.entries(bundle)) {
    localStorage.setItem(key, value);
  }
  bundle = {};
  localStorage.removeItem(BUNDLE_KEY);
}

export function lockSecrets(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  bundle = {};
  sessionPin = null;
}

export function removeSecretsBundle(): void {
  localStorage.removeItem(BUNDLE_KEY);
}

/** Nur für Tests. */
export function __resetSecureStoreForTests(): void {
  lockSecrets();
}
