import { encryptData, decryptData } from './cryptoStorage';

/**
 * Passkey-Entsperrung über die WebAuthn-PRF-Erweiterung (hmac-secret).
 *
 * Der Schlüssel zum Entpacken der Master-PIN wird vom Authenticator aus einem gespeicherten
 * (nicht geheimen) Salt abgeleitet und verlässt das Gerät nie. Er liegt nirgends im Speicher
 * des Browsers; ohne erfolgreiche biometrische Prüfung lässt sich die PIN nicht entpacken.
 *
 * Frühere Versionen leiteten den Schlüssel aus der (im Klartext gespeicherten) Credential-ID ab.
 * Das war nur Verschleierung und wird nicht mehr akzeptiert: solche Einträge werden verworfen.
 */

const KEY_CRED_ID = 'finanz_passkey_credential_id';
const KEY_PRF_SALT = 'finanz_passkey_prf_salt';
const KEY_WRAPPED = 'finanz_passkey_wrapped_key';
const KEY_REGISTERED_AT = 'finanz_passkey_registered_at';

type PrfResults = { prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } } };

/**
 * Checks if the user's browser and hardware support WebAuthn / Passkeys.
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Checks if a (PRF-basierter) Passkey was already registered and linked for the vault.
 * Alte, unsichere Registrierungen ohne PRF-Salt werden dabei entfernt.
 */
export function hasRegisteredPasskey(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const hasCred = Boolean(localStorage.getItem(KEY_CRED_ID));
  const hasWrapped = Boolean(localStorage.getItem(KEY_WRAPPED));
  const hasSalt = Boolean(localStorage.getItem(KEY_PRF_SALT));
  if (hasCred && hasWrapped && !hasSalt) {
    unregisterPasskey();
    return false;
  }
  return hasCred && hasWrapped && hasSalt;
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map(byte => parseInt(byte, 16)));
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

/** Fragt beim Authenticator den PRF-Wert für den Salt ab (löst die biometrische Prüfung aus). */
async function evaluatePrf(credentialId: Uint8Array, salt: Uint8Array): Promise<string> {
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32) as unknown as BufferSource,
      allowCredentials: [{ id: credentialId as unknown as BufferSource, type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
      extensions: { prf: { eval: { first: salt } } } as AuthenticationExtensionsClientInputs
    }
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error('Biometrische Authentifizierung abgebrochen.');

  const first = (assertion.getClientExtensionResults() as PrfResults).prf?.results?.first;
  if (!first) {
    throw new Error(
      'Dieser Browser bzw. Authenticator unterstützt die PRF-Erweiterung nicht. ' +
      'Passkey-Entsperrung ist hier aus Sicherheitsgründen nicht verfügbar – bitte die Master-PIN nutzen.'
    );
  }
  return bufferToHex(first);
}

function wrapKeyFromPrf(prfHex: string): string {
  return `passkey-prf-${prfHex}`;
}

/**
 * Registers a new Passkey and stores a wrapped copy of the vault PIN/secret.
 * @param masterPin The user's active vault master PIN / password.
 */
export async function registerPasskeyForVault(
  masterPin: string,
  username: string = 'FinanzPortfolio User'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!await isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn / Passkeys werden auf diesem Gerät oder Browser nicht unterstützt.' };
    }

    const userId = randomBytes(16);
    const salt = randomBytes(32);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32) as unknown as BufferSource,
        rp: {
          name: 'FinanzPortfolio CoPilot',
          id: window.location.hostname || 'localhost'
        },
        user: {
          id: userId as unknown as BufferSource,
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        extensions: { prf: {} } as AuthenticationExtensionsClientInputs
      }
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Passkey-Erstellung abgebrochen.' };
    }

    const prf = (credential.getClientExtensionResults() as PrfResults).prf;
    if (!prf?.enabled) {
      return {
        success: false,
        error:
          'Dein Gerät/Browser unterstützt die PRF-Erweiterung nicht (benötigt z. B. Chrome/Edge ab 116 oder Safari ab 18). ' +
          'Ohne sie kann die PIN nicht sicher an den Passkey gebunden werden.'
      };
    }

    const credentialId = new Uint8Array(credential.rawId);
    const prfHex = await evaluatePrf(credentialId, salt);
    const wrappedPin = await encryptData(masterPin, wrapKeyFromPrf(prfHex));

    localStorage.setItem(KEY_CRED_ID, bufferToHex(credentialId));
    localStorage.setItem(KEY_PRF_SALT, bufferToHex(salt));
    localStorage.setItem(KEY_WRAPPED, wrappedPin);
    localStorage.setItem(KEY_REGISTERED_AT, new Date().toISOString());

    return { success: true };
  } catch (err: unknown) {
    console.error('Passkey registration error:', err);
    unregisterPasskey();
    return { success: false, error: err instanceof Error ? err.message : 'Passkey-Registrierung fehlgeschlagen.' };
  }
}

/**
 * Authenticates with the registered Passkey and returns the decrypted Master PIN.
 */
export async function authenticateWithPasskey(): Promise<{ success: boolean; masterPin?: string; error?: string }> {
  try {
    const credIdHex = localStorage.getItem(KEY_CRED_ID);
    const saltHex = localStorage.getItem(KEY_PRF_SALT);
    const wrappedPin = localStorage.getItem(KEY_WRAPPED);

    if (!credIdHex || !saltHex || !wrappedPin) {
      return { success: false, error: 'Kein Passkey für diesen Tresor eingerichtet.' };
    }

    const prfHex = await evaluatePrf(hexToBytes(credIdHex), hexToBytes(saltHex));
    const masterPin = await decryptData(wrappedPin, wrapKeyFromPrf(prfHex));
    return { success: true, masterPin };
  } catch (err: unknown) {
    console.error('Passkey authentication error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Passkey-Authentifizierung fehlgeschlagen.' };
  }
}

/**
 * Removes passkey credentials from local device storage.
 */
export function unregisterPasskey(): void {
  localStorage.removeItem(KEY_CRED_ID);
  localStorage.removeItem(KEY_PRF_SALT);
  localStorage.removeItem(KEY_WRAPPED);
  localStorage.removeItem(KEY_REGISTERED_AT);
}
