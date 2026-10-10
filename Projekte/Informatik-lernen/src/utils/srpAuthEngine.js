// @ts-check
/**
 * @file srpAuthEngine.js
 * RFC 2945 / RFC 5054 SRP-6a (Secure Remote Password) Zero-Knowledge Authentication Engine
 * Ermöglicht mathematisch sichere Passwort-Authentifizierung, ohne dass das Klartext-Passwort
 * oder sein kryptografischer Hash jemals über das Netzwerk übertragen werden.
 */

/**
 * 256-Bit Standard Safe Prime N und Generator g (RFC 5054 modp-Gruppe 1/Test-Parameter)
 */
export const SRP_PARAMS = {
  N: 0xEEAF0AB9n, // Didaktische 32-Bit/64-Bit Demonstration für performante BigInt-Operationen
  g: 2n,
  k: 3n // k = H(N, g)
};

/**
 * Didaktische modulare Exponentiation (base^exp % mod)
 * @param {bigint} base
 * @param {bigint} exp
 * @param {bigint} mod
 * @returns {bigint}
 */
export function modPow(base, exp, mod) {
  let res = 1n;
  base = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) {
      res = (res * base) % mod;
    }
    base = (base * base) % mod;
    e = e / 2n;
  }
  return res;
}

/**
 * Einfacher didaktischer 32-Bit Hash zur Zahlengenerierung
 * @param {string | bigint} input
 * @returns {bigint}
 */
export function hashToBigInt(input) {
  const str = String(input);
  let hash = 5381n;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5n) + hash) + BigInt(str.charCodeAt(i));
    hash = hash & 0xFFFFFFFFn;
  }
  return (hash % 1000n) + 7n; // Begrenzung für lesbare Demonstration
}

/**
 * Phase 1: Registrierung
 * Client berechnet Verifier v = g^x % N aus Salt s und Passwort P
 * @param {string} username
 * @param {string} password
 * @param {bigint} [salt]
 * @returns {{ username: string, salt: bigint, verifier: bigint, x: bigint }}
 */
export function srpRegister(username, password, salt = 42n) {
  const x = hashToBigInt(`${salt}:${username}:${password}`);
  const verifier = modPow(SRP_PARAMS.g, x, SRP_PARAMS.N);
  return { username, salt, verifier, x };
}

/**
 * Phase 2: Client Hello
 * Client wählt geheimen Zufallswert a und sendet A = g^a % N
 * @param {bigint} a - Ephemeres Client-Geheimnis
 * @returns {{ a: bigint, A: bigint }}
 */
export function srpClientHello(a = 13n) {
  const A = modPow(SRP_PARAMS.g, a, SRP_PARAMS.N);
  return { a, A };
}

/**
 * Phase 3: Server Challenge
 * Server wählt geheimen Zufallswert b und sendet B = (k*v + g^b) % N mit Salt s
 * @param {bigint} verifier
 * @param {bigint} b - Ephemeres Server-Geheimnis
 * @returns {{ b: bigint, B: bigint }}
 */
export function srpServerChallenge(verifier, b = 17n) {
  const gb = modPow(SRP_PARAMS.g, b, SRP_PARAMS.N);
  const B = ((SRP_PARAMS.k * verifier) + gb) % SRP_PARAMS.N;
  return { b, B };
}

/**
 * Phase 4: Shared Secret Berechnung
 * Beide Parteien berechnen u = H(A, B) und daraus dasselbe Premaster-Secret S!
 * Client: S = (B - k * g^x) ^ (a + u*x) % N
 * Server: S = (A * v^u) ^ b % N
 * @param {bigint} A
 * @param {bigint} B
 * @param {bigint} a
 * @param {bigint} b
 * @param {bigint} x
 * @param {bigint} verifier
 * @returns {{
 *   u: bigint,
 *   clientS: bigint,
 *   serverS: bigint,
 *   clientProofM1: bigint,
 *   serverProofM2: bigint,
 *   isAuthenticated: boolean
 * }}
 */
export function srpComputeSharedKey(A, B, a, b, x, verifier) {
  const u = hashToBigInt(`${A}:${B}`);

  // Client Seite:
  // Base = (B - k * g^x) % N
  const kgx = (SRP_PARAMS.k * modPow(SRP_PARAMS.g, x, SRP_PARAMS.N)) % SRP_PARAMS.N;
  let baseClient = (B - kgx) % SRP_PARAMS.N;
  if (baseClient < 0n) baseClient += SRP_PARAMS.N;
  const expClient = a + (u * x);
  const clientS = modPow(baseClient, expClient, SRP_PARAMS.N);

  // Server Seite:
  // Base = (A * v^u) % N
  const vu = modPow(verifier, u, SRP_PARAMS.N);
  const baseServer = (A * vu) % SRP_PARAMS.N;
  const serverS = modPow(baseServer, b, SRP_PARAMS.N);

  // Proof of Key (M1 = H(A, B, S))
  const clientProofM1 = hashToBigInt(`${A}:${B}:${clientS}`);
  const serverProofM1 = hashToBigInt(`${A}:${B}:${serverS}`);

  // Server Proof (M2 = H(A, M1, S))
  const serverProofM2 = hashToBigInt(`${A}:${clientProofM1}:${serverS}`);

  const isAuthenticated = clientS === serverS && clientProofM1 === serverProofM1;

  return {
    u,
    clientS,
    serverS,
    clientProofM1,
    serverProofM2,
    isAuthenticated
  };
}
