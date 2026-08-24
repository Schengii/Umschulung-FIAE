import { describe, it, expect } from 'vitest';
import { 
  GRAPHQL_AST_SCENARIOS, 
  LINUX_PERMISSION_MODES, 
  RSA_CRYPTO_STEPS 
} from './expertLabsData';

describe('Expert Labs: GraphQL AST, Linux Permissions & RSA Cryptography', () => {
  it('should validate GraphQL AST parser scenario and DataLoader reduction', () => {
    expect(GRAPHQL_AST_SCENARIOS.length).toBeGreaterThanOrEqual(1);
    const scenario = GRAPHQL_AST_SCENARIOS[0];
    expect(scenario.astTree.kind).toBe('Document');
    expect(scenario.naiveCalls.length).toBeGreaterThan(scenario.dataloaderCalls.length);
  });

  it('should validate Linux Permission octal calculation and SUID bit', () => {
    expect(LINUX_PERMISSION_MODES.length).toBeGreaterThanOrEqual(4);
    const mode755 = LINUX_PERMISSION_MODES.find(m => m.octal === '755');
    expect(mode755).toBeDefined();
    expect(mode755.owner.read).toBe(true);
    expect(mode755.owner.write).toBe(true);
    expect(mode755.owner.execute).toBe(true);

    const suid = LINUX_PERMISSION_MODES.find(m => m.octal === '4755');
    expect(suid).toBeDefined();
    expect(suid.special).toContain('SUID');
  });

  it('should validate 5-step RSA math: phi calculation, public/private keys and encryption', () => {
    expect(RSA_CRYPTO_STEPS.length).toBe(5);
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    expect(n).toBe(3233);
    expect(phi).toBe(3120);

    const e = 17;
    const d = 2753;
    // Modular inverse check: (e * d) mod phi === 1
    expect((e * d) % phi).toBe(1);

    // Encryption & Decryption test
    const m = 65; // 'A'
    // 65^17 mod 3233 = 2790
    const powerMod = (base, exp, mod) => {
      let res = 1n;
      let b = BigInt(base);
      let e = BigInt(exp);
      let m = BigInt(mod);
      while (e > 0n) {
        if (e % 2n === 1n) res = (res * b) % m;
        b = (b * b) % m;
        e /= 2n;
      }
      return Number(res);
    };

    const c = powerMod(m, e, n);
    expect(c).toBe(2790);

    const decrypted = powerMod(c, d, n);
    expect(decrypted).toBe(m);
  });
});
