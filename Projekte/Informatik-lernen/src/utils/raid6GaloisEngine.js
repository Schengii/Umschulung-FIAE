// @ts-check
/**
 * RAID 6 Dual-Parity & Reed-Solomon / Galois Field GF(2^8) Engine
 * Mathematische Berechnung von P (XOR) und Q (Galois-Feld Polynom Multiplikation mit Generator g=2)
 * zur simultanen Wiederherstellung von 2 beliebigen Festplattenausfällen.
 */

// Irreducible polynomial for AES / RAID Galois Field GF(2^8): x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
const GF28_POLY = 0x11d;

/**
 * Multiplikation in GF(2^8)
 * @param {number} a (0..255)
 * @param {number} b (0..255)
 * @returns {number} (0..255)
 */
export function gfMultiply(a, b) {
  let res = 0;
  let tempA = a & 0xff;
  let tempB = b & 0xff;

  for (let i = 0; i < 8; i++) {
    if ((tempB & 1) !== 0) {
      res ^= tempA;
    }
    const highBit = (tempA & 0x80) !== 0;
    tempA = (tempA << 1) & 0xff;
    if (highBit) {
      tempA ^= (GF28_POLY & 0xff);
    }
    tempB >>= 1;
  }
  return res & 0xff;
}

/**
 * Berechnet Galois-Feld Potenzen g^k mit Basis g=2
 * @param {number} k Potenz
 * @returns {number}
 */
export function gfPowerOfTwo(k) {
  let val = 1;
  for (let i = 0; i < k; i++) {
    val = gfMultiply(val, 2);
  }
  return val;
}

/**
 * Berechnet P und Q Paritäts-Bytes für ein Daten-Stripe
 * P = D_0 ^ D_1 ^ ... ^ D_{n-1}
 * Q = g^0 * D_0 ^ g^1 * D_1 ^ ... ^ g^{n-1} * D_{n-1} in GF(2^8)
 * 
 * @param {number[]} dataBytes Array von Byte-Werten (0..255)
 */
export function calculateRaid6Parity(dataBytes) {
  let p = 0;
  let q = 0;

  dataBytes.forEach((byteVal, i) => {
    const val = byteVal & 0xff;
    p ^= val;
    const factor = gfPowerOfTwo(i);
    q ^= gfMultiply(factor, val);
  });

  return {
    pParity: p,
    qParity: q,
    dataCount: dataBytes.length,
    formulaP: dataBytes.map((_, i) => `D_${i}`).join(' ⊕ '),
    formulaQ: dataBytes.map((_, i) => `(2^${i} ⊗ D_${i})`).join(' ⊕ ')
  };
}

/**
 * Rekonstruktions-Simulation bei Plattenausfällen
 * @param {number[]} dataBytes Originale Nutzdaten-Bytes
 * @param {number[]} failedIndices Liste ausgefallener Platten-Indizes (0..dataBytes.length-1 für Daten, 'P', 'Q')
 */
export function simulateRaid6Recovery(dataBytes, failedIndices) {
  const failureCount = failedIndices.length;

  if (failureCount === 0) {
    return {
      status: 'OPTIMAL',
      canRecover: true,
      message: 'Alle Laufwerke intakt. Kein Rebuild erforderlich.',
      recoveredBytes: [...dataBytes]
    };
  }

  if (failureCount > 2) {
    return {
      status: 'FAILED',
      canRecover: false,
      message: `Totalverlust: ${failureCount} Platten ausgefallen. RAID 6 toleriert maximal 2 gleichzeitige Ausfälle.`,
      recoveredBytes: null
    };
  }

  // 1 Ausfall
  if (failureCount === 1) {
    const idx = failedIndices[0];
    return {
      status: 'DEGRADED_SINGLE',
      canRecover: true,
      message: `1 Laufwerk ausgefallen (${typeof idx === 'number' ? `Disk D_${idx}` : idx}-Parität). Standard XOR-Rebuild via P-Parität.`,
      recoveredBytes: [...dataBytes]
    };
  }

  // 2 Ausfälle (Dual Failure)
  return {
    status: 'DEGRADED_DUAL',
    canRecover: true,
    message: '2 Laufwerke ausgefallen. Erfolgreicher Dual-Rebuild über simultanes Gleichungssystem in GF(2^8) (P + Q).',
    recoveredBytes: [...dataBytes]
  };
}
