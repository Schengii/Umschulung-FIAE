/**
 * WebAuthn & FIDO2 Passkey Simulation Engine
 * Veranschaulicht asymmetrische Public-Key-Authentifizierung, Hardware-Tokens (YubiKey/TouchID),
 * Authenticator Data Flags (UP, UV), COSE Key Encoding und Phishing-Resistenz.
 */

export const FIDO2_ALGORITHMS = {
  ES256: { id: -7, name: 'ECDSA mit SHA-256 (P-256 Curve)' },
  RS256: { id: -257, name: 'RSASSA-PKCS1-v1_5 mit SHA-256' },
  EdDSA: { id: -8, name: 'Ed25519 Curve' }
};

/**
 * Erzeugt eine kryptografische Challenge
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
