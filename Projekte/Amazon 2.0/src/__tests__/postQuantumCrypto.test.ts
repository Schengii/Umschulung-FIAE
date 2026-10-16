import { describe, it, expect } from 'vitest';
import { getPQCKeypairs, generatePQCKeypair, signQuantumTransaction } from '../utils/postQuantumCrypto';

describe('Post-Quantum Cryptography Suite (NIST PQC)', () => {
  it('generates NIST Kyber/Dilithium keypairs and creates verifiable quantum signatures', () => {
    const keys = getPQCKeypairs();
    expect(keys.length).toBeGreaterThan(0);

    const newKey = generatePQCKeypair('Test Kyber Key', 'ML-KEM-768 (Kyber)');
    expect(newKey.algorithm).toBe('ML-KEM-768 (Kyber)');
    expect(newKey.securityLevelBits).toBe(192);
    expect(newKey.fingerprint).toContain('KYBER:');

    const proof = signQuantumTransaction('TX-1234', 89.90);
    expect(proof.isQuantumSafe).toBe(true);
    expect(proof.quantumSignature).toContain('ML-DSA:');
    expect(proof.verifiedByValidatorNodes).toBeGreaterThan(0);
  });
});
