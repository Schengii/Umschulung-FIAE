/**
 * DNSSEC Cryptographic Chain of Trust & RRSIG Validation Engine
 * Simulates hierarchical validation from Root (.) -> TLD (.de) -> Zone (example.de)
 * Includes RRSIG verification, DS record hashing, NSEC3 Authenticated Denial of Existence,
 * and Kaminsky Cache Poisoning attack resilience.
 */

// Einfacher deterministischer String-Hash für kryptografische Simulationen
function simpleHash(str, salt = '', iterations = 1) {
  let combined = `${str}:${salt}`;
  let hash = 0x811c9dc5;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < combined.length; i++) {
      hash ^= combined.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    combined = Math.abs(hash).toString(16).padStart(8, '0');
  }
  return combined.toUpperCase();
}

/**
 * Standard-Konfiguration der DNSSEC-Vertrauenskette
 */
export const DEFAULT_DNSSEC_CONFIG = {
  root: {
    name: '.',
    kskId: 20326,
    zskId: 48921,
    algorithm: 'RSASHA256 (Alg 8)',
    isTrustAnchor: true
  },
  tld: {
    name: 'de',
    dsRecord: {
      keyTag: 2671,
      algorithm: 8,
      digestType: 2, // SHA-256
      digest: '7A8B9C1E2F3D4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B'
    },
    kskId: 2671,
    zskId: 19823,
    algorithm: 'ECDSAP256SHA256 (Alg 13)'
  },
  domain: {
    name: 'example.de',
    dsRecord: {
      keyTag: 38412,
      algorithm: 13,
      digestType: 2,
      digest: 'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2'
    },
    kskId: 38412,
    zskId: 54109,
    algorithm: 'ECDSAP256SHA256 (Alg 13)',
    rrset: {
      type: 'A',
      name: 'example.de',
      ttl: 3600,
      rdata: '93.184.216.34'
    },
    rrsig: {
      typeCovered: 'A',
      algorithm: 13,
      labels: 2,
      originalTtl: 3600,
      expiration: 1893456000, // Zukunfts-Timestamp (2030)
      inception: 1704067200,  // 2024
      keyTag: 54109,
      signerName: 'example.de',
      signature: 'MEYCIQDxK9...cryptographic_signature_zsk...d84A='
    }
  }
};

/**
 * Validiert die vollständige DNSSEC-Vertrauenskette
 * @param {Object} customConfig - Optionale Modifikationen (z.B. manipulierte Hashes, abgelaufene Signaturen)
 * @returns {Object} Validierungsergebnis mit Detailstatus jedes Hops
 */
export function validateDnssecChain(customConfig = {}) {
  const config = {
    ...DEFAULT_DNSSEC_CONFIG,
    ...customConfig,
    tld: { ...DEFAULT_DNSSEC_CONFIG.tld, ...(customConfig.tld || {}) },
    domain: { ...DEFAULT_DNSSEC_CONFIG.domain, ...(customConfig.domain || {}) }
  };

  const steps = [];
  let overallStatus = 'SECURE'; // 'SECURE' | 'BOGUS' | 'INSECURE'
  let bogusReason = null;

  // 1. Root Trust Anchor Prüfung
  steps.push({
    level: 'Root (.)',
    step: 'Root Trust Anchor Verification',
    description: `Lokaler Root-Schlüssel (KSK ${config.root.kskId}) im Resolver als Vertrauensanker verifiziert.`,
    valid: config.root.isTrustAnchor,
    badge: 'TRUST_ANCHOR'
  });

  if (!config.root.isTrustAnchor) {
    overallStatus = 'INSECURE';
    bogusReason = 'Root Trust Anchor fehlt oder ist nicht vertrauenswürdig konfiguriert.';
  }

  // 2. TLD Delegation & DS-Prüfung
  const expectedTldDs = config.tld.dsRecord?.digest;
  const tldKskValid = config.tld.kskId === config.tld.dsRecord?.keyTag;

  steps.push({
    level: 'Root -> TLD (.de)',
    step: 'TLD Delegation Signer (DS) Match',
    description: `DS-Record in Root verweist auf KSK ${config.tld.dsRecord?.keyTag} mit Digest-Match.`,
    valid: tldKskValid && Boolean(expectedTldDs),
    badge: tldKskValid ? 'DS_MATCH' : 'DS_MISMATCH'
  });

  if (!tldKskValid) {
    overallStatus = 'BOGUS';
    bogusReason = `DS-Record der Root-Zone passt nicht zum KSK (${config.tld.kskId}) der .de TLD.`;
  }

  // 3. Domain Delegation (TLD -> example.de)
  const domainDsKeyTagMatch = config.domain.dsRecord?.keyTag === config.domain.kskId;
  const domainDsTampered = customConfig.tamperDomainDs === true;
  const domainDsValid = domainDsKeyTagMatch && !domainDsTampered;

  steps.push({
    level: '.de -> example.de',
    step: 'Child Domain DS-Hash Verifikation',
    description: domainDsTampered 
      ? 'FEHLER: Der im TLD-Parent hinterlegte DS-Hash stimmt nicht mit dem KSK von example.de überein!'
      : `DS-Hash in .de stimmt exakt mit dem SHA-256 Fingerprint von KSK ${config.domain.kskId} überein.`,
    valid: domainDsValid,
    badge: domainDsValid ? 'DS_VERIFIED' : 'BOGUS_DS'
  });

  if (!domainDsValid && overallStatus === 'SECURE') {
    overallStatus = 'BOGUS';
    bogusReason = 'DS-Digest in Parent Zone passt nicht zum KSK der Domain (Chain of Trust unterbrochen).';
  }

  // 4. KSK validiert ZSK (DNSKEY RRset)
  const zskValid = !customConfig.tamperZsk;
  steps.push({
    level: 'example.de DNSKEY',
    step: 'KSK signiert Zone Signing Key (ZSK)',
    description: zskValid 
      ? `KSK ${config.domain.kskId} verifiziert die Signatur des aktiven ZSK ${config.domain.zskId}.`
      : 'FEHLER: ZSK-Signatur durch KSK ist ungültig oder Schlüssel wurde kompromittiert!',
    valid: zskValid,
    badge: zskValid ? 'ZSK_SIGNED' : 'INVALID_ZSK'
  });

  if (!zskValid && overallStatus === 'SECURE') {
    overallStatus = 'BOGUS';
    bogusReason = 'Zone Signing Key (ZSK) konnte nicht durch den Key Signing Key (KSK) validiert werden.';
  }

  // 5. RRSIG Signatur über Daten (A-Record)
  const rrsigExpired = customConfig.expireRrsig === true;
  const rrsetTampered = customConfig.tamperRecordData === true;
  const rrsigValid = !rrsigExpired && !rrsetTampered;

  let rrsigDesc = `ZSK ${config.domain.zskId} signiert A-Record (${config.domain.rrset.rdata}). Signatur kryptografisch gültig.`;
  if (rrsigExpired) {
    rrsigDesc = 'FEHLER: RRSIG-Signatur ist zeitlich abgelaufen (Signature Expiration Timestamp überschritten)!';
  } else if (rrsetTampered) {
    rrsigDesc = 'FEHLER: RRSIG-Signatur passt nicht zu den veränderten Record-Daten (Spoofing erkannt)!';
  }

  steps.push({
    level: 'example.de RRset (A)',
    step: 'RRSIG Validierung über Ziel-Record',
    description: rrsigDesc,
    valid: rrsigValid,
    badge: rrsigValid ? 'RRSIG_VALID' : 'RRSIG_INVALID'
  });

  if (!rrsigValid && overallStatus === 'SECURE') {
    overallStatus = 'BOGUS';
    bogusReason = rrsigExpired 
      ? 'RRSIG Signatur ist abgelaufen (Replay-Schutz greift).'
      : 'RRSIG Signaturprüfung fehlgeschlagen. Daten wurden auf dem Transportweg manipuliert.';
  }

  return {
    status: overallStatus, // 'SECURE' | 'BOGUS' | 'INSECURE'
    bogusReason,
    steps,
    resolvedIp: overallStatus === 'SECURE' ? config.domain.rrset.rdata : null,
    dnssecAlert: overallStatus === 'BOGUS' ? 'SERVFAIL (DNSSEC Validierungsfehler)' : 'NOERROR (Authentic Data AD=1)'
  };
}

/**
 * NSEC3 Authenticated Denial of Existence Proof
 * Beweist kryptografisch, dass eine Subdomain nicht existiert (NXDOMAIN),
 * ohne dass Angreifer durch NSEC-Zone-Walking alle Hostnamen auslesen können.
 */
export const NSEC3_SAMPLE_ZONE = [
  { hashedName: '2T9GK98', originalHint: 'api.example.de', nextHashedName: '7K1QP23', types: ['A', 'RRSIG'] },
  { hashedName: '7K1QP23', originalHint: 'mail.example.de', nextHashedName: 'B8X4M91', types: ['MX', 'RRSIG'] },
  { hashedName: 'B8X4M91', originalHint: 'vpn.example.de', nextHashedName: 'F9Z2L04', types: ['A', 'TXT', 'RRSIG'] },
  { hashedName: 'F9Z2L04', originalHint: 'www.example.de', nextHashedName: '2T9GK98', types: ['A', 'AAAA', 'RRSIG'] }
];

export function verifyNsec3Proof(subdomain, salt = 'B4F1', iterations = 10) {
  const normalized = subdomain.toLowerCase().trim();
  const hashedQuery = simpleHash(normalized, salt, iterations).substring(0, 7);

  // Suche Intervall in geordneter NSEC3 Kette
  let coveringRecord = null;
  for (const record of NSEC3_SAMPLE_ZONE) {
    if (record.hashedName < record.nextHashedName) {
      if (hashedQuery > record.hashedName && hashedQuery < record.nextHashedName) {
        coveringRecord = record;
        break;
      }
    } else {
      // Wrap-around am Ende der Zone
      if (hashedQuery > record.hashedName || hashedQuery < record.nextHashedName) {
        coveringRecord = record;
        break;
      }
    }
  }

  const exactMatch = NSEC3_SAMPLE_ZONE.find(r => r.hashedName === hashedQuery);

  return {
    query: subdomain,
    salt,
    iterations,
    hashedQuery,
    isExisting: Boolean(exactMatch),
    matchedRecord: exactMatch || null,
    coveringInterval: coveringRecord ? {
      from: coveringRecord.hashedName,
      to: coveringRecord.nextHashedName,
      proofText: `Liegt nachweislich zwischen Hash ${coveringRecord.hashedName} und ${coveringRecord.nextHashedName}`
    } : null,
    nxdomainProven: !exactMatch && Boolean(coveringRecord),
    antiZoneWalkingProtection: 'Gehashte und gesalzene NSEC3-Intervalle verhindern Wörterbuch-Angriffe auf Zonennamen.'
  };
}

/**
 * Simuliert den klassischen Kaminsky DNS Cache Poisoning Angriff
 * Vergleicht ungeschütztes Standard-DNS mit DNSSEC-validierendem Resolver
 */
export function simulateKaminskyAttack(options = {}) {
  const { dnssecEnabled = true, spoofedIp = '6.6.6.66' } = options;

  if (!dnssecEnabled) {
    return {
      success: true,
      poisoned: true,
      resultIp: spoofedIp,
      resolverStatus: 'CACHE_POISONED',
      responseCode: 'NOERROR',
      adFlag: false,
      message: 'Angriff erfolgreich! Unsignierte gefälschte Antwort mit erratener Transaction ID wurde im Cache gespeichert. Nutzer werden umgeleitet!'
    };
  }

  // Mit DNSSEC: Signaturprüfung schlägt fehl
  return {
    success: false,
    poisoned: false,
    resultIp: null,
    resolverStatus: 'SERVFAIL',
    responseCode: 'SERVFAIL',
    adFlag: false,
    message: 'Angriff abgewehrt! Der Resolver verwirft die gefälschte Antwort, da keine gültige RRSIG-Signatur mit dem ZSK der Domäne vorliegt. Client erhält SERVFAIL.'
  };
}
