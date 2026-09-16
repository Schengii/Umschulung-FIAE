/**
 * ZKP Crypto Engine
 * Basic Elliptic Curve Math over Finite Fields (for educational visualization)
 * Curve: y^2 = x^3 + ax + b (mod p)
 */

export class EllipticCurve {
  constructor(a, b, p) {
    this.a = BigInt(a);
    this.b = BigInt(b);
    this.p = BigInt(p);
  }

  // Modulo operation that handles negative numbers correctly
  mod(n, p = this.p) {
    const res = n % p;
    return res < 0n ? res + p : res;
  }

  // Extended Euclidean Algorithm for modular inverse
  modInverse(n, p = this.p) {
    let t = 0n;
    let newt = 1n;
    let r = p;
    let newr = n;

    while (newr !== 0n) {
      let quotient = r / newr;
      let tempT = t;
      t = newt;
      newt = tempT - quotient * newt;

      let tempR = r;
      r = newr;
      newr = tempR - quotient * newr;
    }

    if (r > 1n) return null; // Not invertible
    if (t < 0n) t = t + p;
    return t;
  }

  // Add two points P and Q on the curve
  pointAdd(P, Q) {
    if (P === null) return Q; // Point at infinity
    if (Q === null) return P;

    const [px, py] = P;
    const [qx, qy] = Q;

    if (px === qx && py !== qy) return null; // P + (-P) = Infinity

    let lambda;
    if (px === qx && py === qy) {
      // Point doubling
      if (py === 0n) return null; // Tangent is vertical
      const num = this.mod(3n * px * px + this.a);
      const den = this.modInverse(2n * py);
      if (den === null) return null;
      lambda = this.mod(num * den);
    } else {
      // Point addition
      const num = this.mod(qy - py);
      const den = this.modInverse(this.mod(qx - px));
      if (den === null) return null;
      lambda = this.mod(num * den);
    }

    const rx = this.mod(lambda * lambda - px - qx);
    const ry = this.mod(lambda * (px - rx) - py);
    return [rx, ry];
  }

  // Scalar multiplication k * P
  scalarMult(k, P) {
    let result = null;
    let addend = P;
    let multiplier = BigInt(k);

    while (multiplier > 0n) {
      if (multiplier & 1n) {
        result = this.pointAdd(result, addend);
      }
      addend = this.pointAdd(addend, addend);
      multiplier >>= 1n;
    }
    return result;
  }
}

/**
 * Schnorr Signature ZKP (Interactive Simulation)
 * Prover wants to prove they know private key (x) such that Public Key Y = x * G
 * 1. Prover generates random k, computes R = k * G. Sends R to Verifier.
 * 2. Verifier sends random challenge c.
 * 3. Prover computes s = k + c * x (mod n). Sends s to Verifier.
 * 4. Verifier checks if s * G == R + c * Y.
 */
export function simulateSchnorrZkp(curve, G, orderN, privateKeyX) {
  const Y = curve.scalarMult(privateKeyX, G);
  const k = 15n; // Mock random nonce for deterministic testing
  const R = curve.scalarMult(k, G);
  
  const c = 7n; // Mock random challenge from verifier
  
  // Prover calculates response
  // s = (k + c * x) mod n
  const s = (k + c * BigInt(privateKeyX)) % BigInt(orderN);
  
  // Verifier checks
  // sG = s * G
  const sG = curve.scalarMult(s, G);
  
  // cY = c * Y
  const cY = curve.scalarMult(c, Y);
  
  // checkR = R + cY
  const checkR = curve.pointAdd(R, cY);
  
  const isValid = sG[0] === checkR[0] && sG[1] === checkR[1];
  
  return {
    Y, k, R, c, s, sG, checkR, isValid
  };
}
