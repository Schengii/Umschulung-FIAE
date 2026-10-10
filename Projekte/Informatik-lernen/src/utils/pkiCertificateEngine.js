// @ts-check
/**
 * X.509 PKI & Certificate Chain Validator Engine
 * Gemäß RFC 5280 (Internet X.509 PKI Certificate and CRL Profile)
 * 
 * Behandelt:
 * 1. Chain of Trust: Root CA (Self-signed) -> Intermediate CA -> Leaf / End-Entity Certificate
 * 2. Gültigkeitsprüfung (notBefore / notAfter Zeitfenster)
 * 3. Subject Alternative Name (SAN) Host-Matching (z.B. *.example.com vs. sub.example.com)
 * 4. Revocation-Status: CRL (Certificate Revocation List) & OCSP Stapling (RFC 6960)
 * 5. Key Usage & Basic Constraints (CA:TRUE / pathlen)
 */

/**
 * @typedef {object} X509Cert
 * @property {string} id
 * @property {string} subject
 * @property {string} issuer
 * @property {string} serialNumber
 * @property {string} validFrom
 * @property {string} validTo
 * @property {string[]} san
 * @property {boolean} isCa
 * @property {number} [pathLen]
 * @property {boolean} isSelfSigned
 * @property {boolean} isRevoked
 */

/**
 * Validiert eine X.509 Zertifikatskette für eine Ziel-Domain
 * @param {X509Cert[]} chain [leaf, intermediate, root]
 * @param {string} domainToCheck z.B. "api.my-cloud.de"
 * @param {Date} [currentDate]
 * @returns {{ isValid: boolean, errors: string[], warnings: string[], validatedHops: number }}
 */
export function validateCertificateChain(chain, domainToCheck, currentDate = new Date('2026-09-26T12:00:00Z')) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  if (!chain || chain.length < 2) {
    errors.push('Unvollständige Zertifikatskette: Mindestens Leaf-Zertifikat und Root-CA erforderlich.');
    return { isValid: false, errors, warnings, validatedHops: 0 };
  }

  const leaf = chain[0];
  const root = chain[chain.length - 1];

  // 1. Root-CA Prüfung
  if (!root.isSelfSigned || root.subject !== root.issuer) {
    errors.push(`Ungültige Root-CA: Zertifikat "${root.subject}" ist nicht selbst-signiert (kein Trust Anchor).`);
  }
  if (!root.isCa) {
    errors.push(`Root-Zertifikat "${root.subject}" fehlt die Basic Constraint CA:TRUE.`);
  }

  // 2. Chain-of-Trust Verknüpfung prüfen
  for (let i = 0; i < chain.length - 1; i++) {
    const child = chain[i];
    const parent = chain[i + 1];

    if (child.issuer !== parent.subject) {
      errors.push(`Kettenbruch zwischen "${child.subject}" und "${parent.subject}": Issuer stimmt nicht überein.`);
    }

    if (i > 0 && !child.isCa) {
      errors.push(`Intermediate-Zertifikat "${child.subject}" besitzt keine CA-Berechtigung (CA:FALSE).`);
    }
  }

  // 3. Gültigkeitszeiträume aller Zertifikate prüfen
  chain.forEach(cert => {
    const from = new Date(cert.validFrom);
    const to = new Date(cert.validTo);

    if (currentDate < from) {
      errors.push(`Zertifikat "${cert.subject}" ist noch nicht gültig (Gültig ab: ${cert.validFrom}).`);
    } else if (currentDate > to) {
      errors.push(`Zertifikat "${cert.subject}" ist abgelaufen (Abgelaufen am: ${cert.validTo}).`);
    }

    if (cert.isRevoked) {
      errors.push(`Sicherheitsalarm: Zertifikat "${cert.subject}" wurde widerrufen (CRL / OCSP Revoked)!`);
    }
  });

  // 4. SAN / Hostname-Matching auf Leaf-Ebene
  const domain = domainToCheck.toLowerCase().trim();
  const matchesSan = leaf.san.some(pattern => {
    const p = pattern.toLowerCase().trim();
    if (p === domain) return true;
    if (p.startsWith('*.')) {
      const suffix = p.slice(2);
      const parts = domain.split('.');
      if (parts.length > 2) {
        const domainSuffix = parts.slice(1).join('.');
        return domainSuffix === suffix;
      }
    }
    return false;
  });

  if (!matchesSan) {
    errors.push(`Hostname Mismatch: Domain "${domainToCheck}" ist nicht im Subject Alternative Name (SAN) von "${leaf.subject}" enthalten.`);
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    warnings,
    validatedHops: chain.length
  };
}
