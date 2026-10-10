// @ts-check
/**
 * @file mtlsZtnaEngine.js
 * Mutual TLS (mTLS) & Zero-Trust Network Access (ZTNA) Engine nach RFC 8446
 * Simuliert gegenseitige Zertifikatsprüfung auf Transportschicht für Microservice- & API-Security.
 */

/**
 * @typedef {object} MtlsCertificate
 * @property {string} commonName
 * @property {string} serialNumber
 * @property {string} issuer
 * @property {string} role - z.B. 'payment-service', 'inventory-service', 'untrusted-guest'
 * @property {string[]} allowedEndpoints
 * @property {boolean} isRevoked
 */

/**
 * Standard Vertrauensanker & Zertifikate im Service-Mesh
 * @type {{
 *   caCert: { commonName: string, issuer: string },
 *   services: Record<string, MtlsCertificate>
 * }}
 */
export const MTLS_MESH_CONFIG = {
  caCert: {
    commonName: 'Internal Service Mesh Root CA',
    issuer: 'Internal Service Mesh Root CA'
  },
  services: {
    'order-service': {
      commonName: 'order-service.internal.corp',
      serialNumber: 'SN-001-A9F',
      issuer: 'Internal Service Mesh Root CA',
      role: 'order-service',
      allowedEndpoints: ['GET /products', 'POST /orders', 'POST /checkout'],
      isRevoked: false
    },
    'payment-service': {
      commonName: 'payment-service.internal.corp',
      serialNumber: 'SN-002-B8E',
      issuer: 'Internal Service Mesh Root CA',
      role: 'payment-service',
      allowedEndpoints: ['POST /charges', 'POST /refunds'],
      isRevoked: false
    },
    'compromised-service': {
      commonName: 'rogue-bot.internal.corp',
      serialNumber: 'SN-666-BAD',
      issuer: 'Internal Service Mesh Root CA',
      role: 'untrusted-guest',
      allowedEndpoints: [],
      isRevoked: true
    }
  }
};

/**
 * Validiert den vollständigen mTLS 1.3 Handshake (Server + Client Zertifikat)
 * @param {MtlsCertificate} clientCert
 * @param {string} requestedEndpoint - z.B. 'POST /checkout'
 * @returns {{
 *   handshakeSuccess: boolean,
 *   httpStatus: number,
 *   errorMessage: string | null,
 *   handshakeSteps: Array<{ step: string, status: 'ok' | 'failed', details: string }>,
 *   sessionCipher: string
 * }}
 */
export function validateMtlsHandshake(clientCert, requestedEndpoint) {
  /** @type {Array<{ step: string, status: 'ok' | 'failed', details: string }>} */
  const steps = [];

  // Schritt 1: Client Hello
  steps.push({
    step: '1. Client Hello',
    status: 'ok',
    details: 'Client sendet unterstützte Cipher Suites (TLS_AES_256_GCM_SHA384) und TLS 1.3 Key Share.'
  });

  // Schritt 2: Server Hello & CertificateRequest
  steps.push({
    step: '2. Server Hello & CertificateRequest',
    status: 'ok',
    details: 'Server sendet Server-Zertifikat und verlangt zwingend ein Client-Zertifikat (CertificateRequest).'
  });

  // Schritt 3: Client Certificate Prüfung (Aussteller)
  if (clientCert.issuer !== MTLS_MESH_CONFIG.caCert.commonName) {
    steps.push({
      step: '3. Client Certificate Verification',
      status: 'failed',
      details: `Aussteller '${clientCert.issuer}' wird von der Root CA nicht anerkannt!`
    });
    return {
      handshakeSuccess: false,
      httpStatus: 495, // Nginx SSL Certificate Error
      errorMessage: 'SSL Handshake Failed: Untrusted Client Certificate Issuer',
      handshakeSteps: steps,
      sessionCipher: 'None'
    };
  }

  // Schritt 4: Revocation Check (CRL / OCSP)
  if (clientCert.isRevoked) {
    steps.push({
      step: '4. Revocation Status Check',
      status: 'failed',
      details: `Zertifikat mit Seriennummer ${clientCert.serialNumber} steht auf der CRL-Sperrliste!`
    });
    return {
      handshakeSuccess: false,
      httpStatus: 496, // SSL Certificate Revoked
      errorMessage: 'SSL Handshake Failed: Client Certificate Revoked',
      handshakeSteps: steps,
      sessionCipher: 'None'
    };
  }

  steps.push({
    step: '3. Client Certificate Verification',
    status: 'ok',
    details: `Zertifikat von '${clientCert.commonName}' (SN: ${clientCert.serialNumber}) erfolgreich verifiziert.`
  });

  // Schritt 5: Zero-Trust RBAC Endpoint Autorisierung
  const isAuthorized = clientCert.allowedEndpoints.some(ep => ep.toLowerCase() === requestedEndpoint.toLowerCase());
  if (!isAuthorized) {
    steps.push({
      step: '5. Zero-Trust RBAC Policy Check',
      status: 'failed',
      details: `Rolle '${clientCert.role}' hat keine Berechtigung für Endpunkt '${requestedEndpoint}'!`
    });
    return {
      handshakeSuccess: true, // TLS aufgebaut, aber Applikation lehnt ab
      httpStatus: 403,
      errorMessage: `Forbidden: Service '${clientCert.commonName}' ist für '${requestedEndpoint}' nicht autorisiert.`,
      handshakeSteps: steps,
      sessionCipher: 'TLS_AES_256_GCM_SHA384'
    };
  }

  steps.push({
    step: '5. Zero-Trust RBAC Policy Check',
    status: 'ok',
    details: `Endpunkt '${requestedEndpoint}' für Rolle '${clientCert.role}' genehmigt.`
  });

  return {
    handshakeSuccess: true,
    httpStatus: 200,
    errorMessage: null,
    handshakeSteps: steps,
    sessionCipher: 'TLS_AES_256_GCM_SHA384'
  };
}
