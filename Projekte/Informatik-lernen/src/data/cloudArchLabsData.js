// Data for OAuth2 JWKS Key Rotation, Postgres MVCC and HTTP/3 QUIC Labs

export const JWKS_SETS = {
  currentKeyId: 'key-2026-auth-v2',
  keys: [
    {
      kty: 'RSA',
      use: 'sig',
      alg: 'RS256',
      kid: 'key-2026-auth-v2',
      n: 'u1l4V...RSA_MODULUS_2048...',
      e: 'AQAB',
      status: 'ACTIVE (Signieren neuer JWTs)'
    },
    {
      kty: 'RSA',
      use: 'sig',
      alg: 'RS256',
      kid: 'key-2025-auth-v1',
      n: 'w9x2Q...RSA_MODULUS_OLD...',
      e: 'AQAB',
      status: 'DEPRECATED (Nur noch Verifikation bestehender JWTs)'
    }
  ],
  sampleJwt: {
    header: { alg: 'RS256', typ: 'JWT', kid: 'key-2026-auth-v2' },
    payload: { sub: 'usr_8921', name: 'Max Mustermann', role: 'DevOps Engineer', iss: 'https://auth.company.de', exp: 1776328400 },
    signature: 'k9L3...CRYPTOGRAPHIC_HASH...'
  }
};

export const POSTGRES_MVCC_SCENARIOS = [
  {
    step: 1,
    action: 'INSERT INTO users (id, name, balance) VALUES (1, \'Alice\', 100);',
    txId: 501,
    tablePage: [
      { tuple: '(0,1)', xmin: 501, xmax: 0, data: 'id=1, name="Alice", balance=100', state: 'LIVE' }
    ],
    desc: 'Tupel wird auf Page 0 eingefügt. xmin=501 markiert die erstellende Transaktion. xmax=0 bedeutet noch nicht gelöscht/geändert.'
  },
  {
    step: 2,
    action: 'UPDATE users SET balance = 250 WHERE id = 1;',
    txId: 502,
    tablePage: [
      { tuple: '(0,1)', xmin: 501, xmax: 502, data: 'id=1, name="Alice", balance=100', state: 'DEAD (Old Version)' },
      { tuple: '(0,2)', xmin: 502, xmax: 0, data: 'id=1, name="Alice", balance=250', state: 'LIVE (New Version)' }
    ],
    desc: 'PostgreSQL überschreibt Zeilen niemals in-place! Es markiert das alte Tupel mit xmax=502 als tot und fügt ein neues Tupel mit xmin=502 ein.'
  },
  {
    step: 3,
    action: 'UPDATE users SET balance = 400 WHERE id = 1;',
    txId: 503,
    tablePage: [
      { tuple: '(0,1)', xmin: 501, xmax: 502, data: 'id=1, name="Alice", balance=100', state: 'DEAD (Old Version)' },
      { tuple: '(0,2)', xmin: 502, xmax: 503, data: 'id=1, name="Alice", balance=250', state: 'DEAD (Old Version)' },
      { tuple: '(0,3)', xmin: 503, xmax: 0, data: 'id=1, name="Alice", balance=400', state: 'LIVE (New Version)' }
    ],
    desc: 'Die Tabelle wächst an (Table Bloat). Es existieren 2 tote Tupel und 1 lebendes Tupel.'
  },
  {
    step: 4,
    action: 'VACUUM users;',
    txId: 504,
    tablePage: [
      { tuple: '(0,1)', xmin: 0, xmax: 0, data: '[FREE SPACE FOR NEW INSERTS]', state: 'RECLAIMED SPACE' },
      { tuple: '(0,2)', xmin: 0, xmax: 0, data: '[FREE SPACE FOR NEW INSERTS]', state: 'RECLAIMED SPACE' },
      { tuple: '(0,3)', xmin: 503, xmax: 0, data: 'id=1, name="Alice", balance=400', state: 'LIVE (New Version)' }
    ],
    desc: 'VACUUM scannt Page 0, entfernt die toten Tupel für Transaktionen < oldestXmin und markiert den Plattenplatz als wiederverwendbar.'
  }
];

export const HTTP3_QUIC_BENCHMARKS = [
  {
    protocol: 'HTTP/1.1 (TCP)',
    handshakeRtt: '2-3 RTT',
    headOfLineBlocking: 'Ja (Auf HTTP Request-Ebene)',
    packetLossImpact: 'Extrem hoch (Verbindung pausiert komplett)',
    connMigration: 'Nein (IP-Wechsel bricht Verbindung ab)',
    avgLatencyMs: 142.5
  },
  {
    protocol: 'HTTP/2 (TCP + TLS 1.3)',
    handshakeRtt: '1-2 RTT',
    headOfLineBlocking: 'Ja (TCP-Layer Head-of-Line Blocking)',
    packetLossImpact: 'Mittel (1 verlorenes TCP-Paket blockiert alle Streams)',
    connMigration: 'Nein (Bindung an TCP 4-Tuple Socket)',
    avgLatencyMs: 86.2
  },
  {
    protocol: 'HTTP/3 (QUIC over UDP)',
    handshakeRtt: '0-RTT / 1-RTT',
    headOfLineBlocking: 'NEIN! (Vollständig isolierte UDP Streams)',
    packetLossImpact: 'Minimal (Nur der betroffene Stream wartet, andere streamen weiter)',
    connMigration: 'Ja! (Connection ID überlebt WLAN -> 5G Wechsel)',
    avgLatencyMs: 38.4
  }
];
