/**
 * Recovery-Key für den Tresor: Ein zufälliger 160-Bit-Schlüssel (Base32, in 4er-Gruppen), mit dem die
 * Master-PIN wiederhergestellt werden kann. Auf dem Gerät liegt nur die damit verschlüsselte PIN
 * (`finanz_recovery_wrapped`); der Schlüssel selbst wird dem Nutzer genau einmal angezeigt.
 */
import { encryptData, decryptData } from './cryptoStorage';

const WRAPPED_KEY = 'finanz_recovery_wrapped';
const CREATED_AT_KEY = 'finanz_recovery_created_at';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Entfernt Trennzeichen/Leerraum und vereinheitlicht die Schreibweise. */
export function normalizeRecoveryKey(input: string): string {
  return input.toUpperCase().replace(/[^A-Z2-7]/g, '');
}

export function generateRecoveryKey(): string {
  const bytes = new Uint8Array(20); // 160 Bit = 32 Base32-Zeichen
  window.crypto.getRandomValues(bytes);

  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out.match(/.{1,4}/g)!.join('-');
}

export function hasRecoveryKey(): boolean {
  return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(WRAPPED_KEY));
}

export function getRecoveryKeyCreatedAt(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(CREATED_AT_KEY) : null;
}

/** Erzeugt einen neuen Recovery-Key für die aktuelle PIN und gibt ihn (einmalig) zurück. */
export async function createRecoveryKey(masterPin: string): Promise<string> {
  const key = generateRecoveryKey();
  const wrapped = await encryptData(masterPin, normalizeRecoveryKey(key));
  localStorage.setItem(WRAPPED_KEY, wrapped);
  localStorage.setItem(CREATED_AT_KEY, new Date().toISOString());
  return key;
}

/** Stellt die Master-PIN mit dem Recovery-Key wieder her; wirft bei falschem Key. */
export async function recoverPinWithKey(recoveryKey: string): Promise<string> {
  const wrapped = localStorage.getItem(WRAPPED_KEY);
  if (!wrapped) throw new Error('Kein Recovery-Key eingerichtet.');
  return decryptData(wrapped, normalizeRecoveryKey(recoveryKey));
}

export function removeRecoveryKey(): void {
  localStorage.removeItem(WRAPPED_KEY);
  localStorage.removeItem(CREATED_AT_KEY);
}
