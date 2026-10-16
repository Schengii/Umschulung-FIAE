import { describe, it, expect } from 'vitest';
import { getZKProofs, generateZKProof } from '../utils/zkProofAuth';

describe('Zero-Knowledge Proof (zk-SNARKs) Auth Engine', () => {
  it('manages and computes zero-knowledge statement proofs without revealing raw data', async () => {
    const proofs = getZKProofs();
    expect(proofs.length).toBeGreaterThan(0);

    const newProof = await generateZKProof('age-18-plus');
    expect(newProof.circuitType).toBe('age-18-plus');
    expect(newProof.isVerified).toBe(true);
    expect(newProof.publicInputs.length).toBeGreaterThan(0);
    expect(newProof.statementProven).toContain('>= 18');
  });
});
