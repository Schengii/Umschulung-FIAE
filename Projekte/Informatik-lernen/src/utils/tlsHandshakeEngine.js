/**
 * TLS 1.3 Handshake Engine
 * Simulates the TLS 1.3 (RFC 8446) 1-RTT handshake: ClientHello -> ServerHello
 * (+ EncryptedExtensions, Certificate, CertificateVerify, Finished) -> Finished,
 * plus the abbreviated 0-RTT resumption flow via a PSK (Pre-Shared Key).
 */

const CIPHER_SUITES = [
  { id: 'TLS_AES_256_GCM_SHA384', strength: 'Stark (256-Bit AEAD)' },
  { id: 'TLS_AES_128_GCM_SHA256', strength: 'Stark (128-Bit AEAD)' },
  { id: 'TLS_CHACHA20_POLY1305_SHA256', strength: 'Stark (Mobile-optimiert)' }
];

const KEY_EXCHANGE_GROUPS = [
  { id: 'x25519', label: 'X25519 (Curve25519 ECDHE)' },
  { id: 'secp256r1', label: 'secp256r1 (NIST P-256 ECDHE)' },
  { id: 'secp384r1', label: 'secp384r1 (NIST P-384 ECDHE)' }
];

export function buildFullHandshake({ sni = 'app.devgame.it', cipherSuiteId = 'TLS_AES_256_GCM_SHA384', keyGroupId = 'x25519' }) {
  const cipherSuite = CIPHER_SUITES.find(c => c.id === cipherSuiteId) || CIPHER_SUITES[0];
  const keyGroup = KEY_EXCHANGE_GROUPS.find(g => g.id === keyGroupId) || KEY_EXCHANGE_GROUPS[0];

  const steps = [
    {
      id: 'client_hello',
      actor: 'Client',
      title: 'ClientHello',
      detail: `SNI: ${sni} | Unterstützte Cipher Suites & Key-Share (${keyGroup.label}) | Random Nonce (32 Byte)`,
      rttMs: 0
    },
    {
      id: 'server_hello',
      actor: 'Server',
      title: 'ServerHello',
      detail: `Gewählte Cipher Suite: ${cipherSuite.id} | Server Key-Share (${keyGroup.label}) | Random Nonce (32 Byte)`,
      rttMs: 0
    },
    {
      id: 'server_encrypted_ext',
      actor: 'Server',
      title: '{EncryptedExtensions}',
      detail: 'ALPN (h2), weitere Erweiterungen — bereits verschlüsselt mit dem Handshake-Traffic-Secret.',
      rttMs: 0
    },
    {
      id: 'server_certificate',
      actor: 'Server',
      title: '{Certificate}',
      detail: `X.509 Zertifikatskette für ${sni}, verschlüsselt übertragen.`,
      rttMs: 0
    },
    {
      id: 'server_cert_verify',
      actor: 'Server',
      title: '{CertificateVerify}',
      detail: 'Digitale Signatur über den bisherigen Handshake-Transcript mit dem privaten Serverschlüssel.',
      rttMs: 0
    },
    {
      id: 'server_finished',
      actor: 'Server',
      title: '{Finished}',
      detail: 'HMAC über den kompletten Handshake-Transcript zur Integritätsprüfung.',
      rttMs: 0.5
    },
    {
      id: 'client_finished',
      actor: 'Client',
      title: '{Finished}',
      detail: 'Client bestätigt den Handshake — ab hier läuft Application Data verschlüsselt (1-RTT erreicht).',
      rttMs: 1
    }
  ];

  return {
    sni,
    cipherSuite,
    keyGroup,
    steps,
    totalRtt: 1,
    summary: `TLS 1.3 Full Handshake: ${cipherSuite.id} über ${keyGroup.label}, Verbindung nach 1 Round-Trip verschlüsselt.`
  };
}

export function buildResumptionHandshake({ sni = 'app.devgame.it' }) {
  const steps = [
    {
      id: 'client_hello_psk',
      actor: 'Client',
      title: 'ClientHello + pre_shared_key + early_data',
      detail: `SNI: ${sni} | PSK aus vorheriger Session (NewSessionTicket) | 0-RTT Application Data direkt mitgesendet`,
      rttMs: 0
    },
    {
      id: 'server_hello_psk',
      actor: 'Server',
      title: 'ServerHello + {EncryptedExtensions mit early_data}',
      detail: 'Server akzeptiert die PSK, bestätigt 0-RTT, keine erneute Zertifikatsprüfung nötig.',
      rttMs: 0
    },
    {
      id: 'server_finished_psk',
      actor: 'Server',
      title: '{Finished}',
      detail: 'HMAC über den Transcript — Verbindung war bereits ab dem ersten Client-Paket verschlüsselt (0-RTT).',
      rttMs: 0
    },
    {
      id: 'client_finished_psk',
      actor: 'Client',
      title: '{Finished}',
      detail: 'Handshake abgeschlossen. Achtung: 0-RTT-Daten sind anfällig für Replay-Angriffe (nicht forward-secret)!',
      rttMs: 0
    }
  ];

  return {
    sni,
    steps,
    totalRtt: 0,
    summary: '0-RTT Session Resumption: Keine neue Zertifikatsprüfung, Application Data ab dem ersten Paket — aber ohne Replay-Schutz.'
  };
}

export { CIPHER_SUITES, KEY_EXCHANGE_GROUPS };
