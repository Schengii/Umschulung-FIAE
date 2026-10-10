// @ts-check
/**
 * WebAuthn & FIDO2 Passkey Simulation Engine
 * Veranschaulicht asymmetrische Public-Key-Authentifizierung, Hardware-Tokens (YubiKey/TouchID),
 * Authenticator Data Flags (UP, UV), COSE Key Encoding und Phishing-Resistenz.
 */

/**
 * @typedef {object} PublicKeyJwk
 * @property {string} kty
 * @property {string} crv
 * @property {string} x
 * @property {string} y
 * @property {string} alg
 *
 * @typedef {object} RegisterPasskeyInput
 * @property {string} [username]
 * @property {string} [rpId]
 * @property {string} [origin]
 * @property {'required' | 'preferred' | 'discouraged'} [userVerification]
 * @property {'platform' | 'cross-platform'} [authenticatorType]
 *
 * @typedef {object} RegisteredCredential
 * @property {string} credentialId
 * @property {string} username
 * @property {string} rpId
 * @property {string} origin
 * @property {'platform' | 'cross-platform'} authenticatorType
 * @property {object} clientDataJSON
 * @property {object} attestationObject
 * @property {PublicKeyJwk} storedPublicKey
 * @property {number} signCount
 * @property {boolean} isRegistered
 *
 * @typedef {object} AuthenticatePasskeyInput
 * @property {RegisteredCredential} registeredCredential
 * @property {string} [clientOrigin]
 * @property {boolean} [simulatedUserPresence]
 * @property {boolean} [simulatedUserVerified]
 *
 * @typedef {object} AuthenticatePasskeyFailure
 * @property {false} success
 * @property {string} error
 * @property {boolean} [isPhishingBlocked]
 *
 * @typedef {object} AuthenticatePasskeySuccess
 * @property {true} success
 * @property {object} assertion
 * @property {number} newSignCount
 * @property {false} isPhishingBlocked
 * @property {string} message
 *
 * @typedef {AuthenticatePasskeyFailure | AuthenticatePasskeySuccess} AuthenticatePasskeyResult
 */

export const FIDO2_ALGORITHMS = {
  ES256: { id: -7, name: 'ECDSA mit SHA-256 (P-256 Curve)' },
  RS256: { id: -257, name: 'RSASSA-PKCS1-v1_5 mit SHA-256' },
  EdDSA: { id: -8, name: 'Ed25519 Curve' }
};

/**
 * Erzeugt eine kryptografische Challenge
 * @param {number} [length]
 * @returns {string}
 */
export function generateChallenge(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let challenge = '';
  for (let i = 0; i < length; i++) {
    challenge += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return challenge;
}

/**
 * Simuliert die Passkey-Registrierung (navigator.credentials.create)
 * @param {RegisterPasskeyInput} input
 * @returns {RegisteredCredential}
 */
export function registerPasskey({
  username = 'alex.dev@firma.de',
  rpId = 'it-devgame.local',
  origin = 'https://it-devgame.local',
  userVerification = 'preferred', // 'required' | 'preferred' | 'discouraged'
  authenticatorType = 'platform' // 'platform' (TouchID/FaceID) | 'cross-platform' (USB Token/YubiKey)
}) {
  const challenge = generateChallenge();
  const credentialId = `cred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Authenticator Data Flags
  // Bit 0: User Presence (UP)
  // Bit 2: User Verification (UV)
  // Bit 6: Attested Credential Data (AT)
  const isUp = true;
  const isUv = userVerification !== 'discouraged';

  const clientDataJSON = {
    type: 'webauthn.create',
    challenge,
    origin,
    crossOrigin: false
  };

  const publicKeyJwk = {
    kty: 'EC',
    crv: 'P-256',
    x: `x_${Math.random().toString(36).slice(2, 10)}`,
    y: `y_${Math.random().toString(36).slice(2, 10)}`,
    alg: 'ES256'
  };

  const attestationObject = {
    fmt: 'packed',
    authData: {
      rpIdHash: `sha256(${rpId})`,
      flags: {
        userPresent: isUp,
        userVerified: isUv,
        attestationIncluded: true
      },
      signCount: 0,
      credentialId,
      publicKey: publicKeyJwk
    }
  };

  return {
    credentialId,
    username,
    rpId,
    origin,
    authenticatorType,
    clientDataJSON,
    attestationObject,
    storedPublicKey: publicKeyJwk,
    signCount: 0,
    isRegistered: true
  };
}

/**
 * Simuliert die Passkey-Anmeldung (navigator.credentials.get)
 * @param {AuthenticatePasskeyInput} input
 * @returns {AuthenticatePasskeyResult}
 */
export function authenticatePasskey({
  registeredCredential,
  clientOrigin = 'https://it-devgame.local',
  simulatedUserPresence = true,
  simulatedUserVerified = true
}) {
  if (!registeredCredential || !registeredCredential.isRegistered) {
    return {
      success: false,
      error: 'Kein Passkey-Credential im Speicher gefunden.'
    };
  }

  const challenge = generateChallenge();

  // 1. Phishing-Schutz Prüfung: Ursprung muss exakt übereinstimmen!
  const expectedOrigin = registeredCredential.origin;
  if (clientOrigin !== expectedOrigin) {
    return {
      success: false,
      isPhishingBlocked: true,
      error: `Phishing-Angriff erkannt und abgewehrt! Ursprung '${clientOrigin}' stimmt nicht mit hinterlegtem Relying Party Ursprung '${expectedOrigin}' überein.`
    };
  }

  // 2. User Presence Prüfung
  if (!simulatedUserPresence) {
    return {
      success: false,
      error: 'Authentifizierung abgelehnt: Keine physische Benutzer-Anwesenheit (UP) detektiert.'
    };
  }

  const newSignCount = registeredCredential.signCount + 1;

  const assertionResult = {
    credentialId: registeredCredential.credentialId,
    clientDataJSON: {
      type: 'webauthn.get',
      challenge,
      origin: clientOrigin
    },
    authData: {
      rpIdHash: `sha256(${registeredCredential.rpId})`,
      flags: {
        userPresent: simulatedUserPresence,
        userVerified: simulatedUserVerified
      },
      signCount: newSignCount
    },
    signatureValid: true
  };

  return {
    success: true,
    assertion: assertionResult,
    newSignCount,
    isPhishingBlocked: false,
    message: 'Erfolgreich passwortlos authentifiziert via FIDO2 WebAuthn Signature!'
  };
}

/**
 * Prüft, ob der aktuelle Browser und das Betriebssystem echte WebAuthn/FIDO2 Hardware-Tokens unterstützen.
 * @returns {boolean}
 */
export function isWebAuthnSupported() {
  return typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined';
}

/**
 * Führt einen realen Browser Web Crypto / WebAuthn Testdurchlauf durch, falls Hardware vorhanden ist.
 * @param {string} _username
 * @returns {Promise<{ isSupported: boolean, hasPlatformAuthenticator?: boolean, error?: string }>}
 */
export async function testRealWebAuthnHardware(_username = 'ihk-azubi@devgame.local') {
  if (!isWebAuthnSupported()) {
    return {
      isSupported: false,
      error: 'WebAuthn API im aktuellen Browser nicht verfügbar (z.B. unsichere HTTP-Verbindung oder veralteter Client).'
    };
  }

  try {
    const hasPlatformAuthenticator = typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ? await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      : false;

    return {
      isSupported: true,
      hasPlatformAuthenticator
    };
  } catch (err) {
    return {
      isSupported: true,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

