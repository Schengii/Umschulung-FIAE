import { encryptData, decryptData } from './cryptoStorage';

const WEBAUTHN_CHALLENGE = new Uint8Array([21, 34, 55, 89, 144, 233, 11, 42, 67, 101, 153, 211, 45, 78, 112, 167]);

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
 * Checks if a Passkey was already registered and linked for the vault.
 */
export function hasRegisteredPasskey(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return Boolean(localStorage.getItem('finanz_passkey_credential_id') && localStorage.getItem('finanz_passkey_wrapped_key'));
}

/**
 * Derives a consistent AES key string from credential rawId / signature.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Registers a new Passkey and stores a wrapped copy of the vault PIN/secret.
 * @param masterPin The user's active vault master PIN / password.
 */
export async function registerPasskeyForVault(masterPin: string, username: string = 'FinanzPortfolio User'): Promise<{ success: boolean; error?: string }> {
  try {
    if (!await isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn / Passkeys werden auf diesem Gerät oder Browser nicht unterstützt.' };
    }

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: WEBAUTHN_CHALLENGE,
        rp: {
          name: 'FinanzPortfolio CoPilot',
          id: window.location.hostname || 'localhost'
        },
        user: {
          id: userId,
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
        timeout: 60000
      }
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Passkey-Erstellung abgebrochen.' };
    }

    // Save credential ID
    const credIdHex = bufferToHex(credential.rawId);
    localStorage.setItem('finanz_passkey_credential_id', credIdHex);

    // Wrap the master PIN using the credential ID as passkey salt
    const wrappedPin = await encryptData(masterPin, `passkey-${credIdHex}`);
    localStorage.setItem('finanz_passkey_wrapped_key', wrappedPin);
    localStorage.setItem('finanz_passkey_registered_at', new Date().toISOString());

    return { success: true };
  } catch (err: any) {
    console.error('Passkey registration error:', err);
    return { success: false, error: err?.message || 'Passkey-Registrierung fehlgeschlagen.' };
  }
}

/**
 * Authenticates with the registered Passkey and returns the decrypted Master PIN.
 */
export async function authenticateWithPasskey(): Promise<{ success: boolean; masterPin?: string; error?: string }> {
  try {
    const credIdHex = localStorage.getItem('finanz_passkey_credential_id');
    const wrappedPin = localStorage.getItem('finanz_passkey_wrapped_key');

    if (!credIdHex || !wrappedPin) {
      return { success: false, error: 'Kein Passkey für diesen Tresor eingerichtet.' };
    }

    // Convert hex back to Uint8Array
    const rawIdBytes = new Uint8Array(credIdHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: WEBAUTHN_CHALLENGE,
        allowCredentials: [{
          id: rawIdBytes,
          type: 'public-key'
        }],
        userVerification: 'required',
        timeout: 60000
      }
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: 'Biometrische Authentifizierung abgebrochen.' };
    }

    // Unwrap the master PIN
    const masterPin = await decryptData(wrappedPin, `passkey-${credIdHex}`);
    return { success: true, masterPin };
  } catch (err: any) {
    console.error('Passkey authentication error:', err);
    return { success: false, error: err?.message || 'Passkey-Authentifizierung fehlgeschlagen.' };
  }
}

/**
 * Removes passkey credentials from local device storage.
 */
export function unregisterPasskey(): void {
  localStorage.removeItem('finanz_passkey_credential_id');
  localStorage.removeItem('finanz_passkey_wrapped_key');
  localStorage.removeItem('finanz_passkey_registered_at');
}
