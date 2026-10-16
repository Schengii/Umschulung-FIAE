import { describe, it, expect } from 'vitest';
import { getFreeportVaultStatus } from '../utils/freeportVault';

describe('Autonomous Freeport Customs Vault Engine', () => {
  it('reads Swiss freeport vault status and verifies VAT exemption', () => {
    const fp = getFreeportVaultStatus();
    expect(fp.vaultLocation).toContain('Zürich Freeport');
    expect(fp.vatTaxSavedPercent).toBe(19.0);
    expect(fp.insuranceCoverageEur).toBeGreaterThan(1000000);
    expect(fp.isInspectedOnChain).toBe(true);
  });
});
