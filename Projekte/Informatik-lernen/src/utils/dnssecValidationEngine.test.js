import { describe, it, expect } from 'vitest';
import { 
  validateDnssecChain, 
  verifyNsec3Proof, 
  simulateKaminskyAttack 
} from './dnssecValidationEngine';

describe('dnssecValidationEngine', () => {
  it('validates a correct and unbroken DNSSEC chain with status SECURE', () => {
    const result = validateDnssecChain();
    expect(result.status).toBe('SECURE');
    expect(result.resolvedIp).toBe('93.184.216.34');
    expect(result.bogusReason).toBeNull();
    expect(result.steps.length).toBe(5);
    expect(result.steps.every(s => s.valid)).toBe(true);
    expect(result.dnssecAlert).toContain('NOERROR');
  });

  it('detects tampered DS record in parent zone and flags BOGUS', () => {
    const result = validateDnssecChain({ tamperDomainDs: true });
    expect(result.status).toBe('BOGUS');
    expect(result.resolvedIp).toBeNull();
    expect(result.bogusReason).toContain('DS-Digest in Parent Zone passt nicht');
    expect(result.dnssecAlert).toContain('SERVFAIL');
  });

  it('detects expired RRSIG signature and marks chain as BOGUS', () => {
    const result = validateDnssecChain({ expireRrsig: true });
    expect(result.status).toBe('BOGUS');
    expect(result.bogusReason).toContain('abgelaufen');
  });

  it('verifies NSEC3 authenticated denial of existence without leaking zone entries', () => {
    const proof = verifyNsec3Proof('nonexistent-subdomain.example.de');
    expect(proof.query).toBe('nonexistent-subdomain.example.de');
    expect(proof.isExisting).toBe(false);
    expect(proof.nxdomainProven).toBe(true);
    expect(proof.coveringInterval).not.toBeNull();
  });

  it('demonstrates that Kaminsky cache poisoning is defeated when DNSSEC is enabled', () => {
    const unpoisoned = simulateKaminskyAttack({ dnssecEnabled: true });
    expect(unpoisoned.success).toBe(false);
    expect(unpoisoned.poisoned).toBe(false);
    expect(unpoisoned.resolverStatus).toBe('SERVFAIL');

    const poisoned = simulateKaminskyAttack({ dnssecEnabled: false });
    expect(poisoned.success).toBe(true);
    expect(poisoned.poisoned).toBe(true);
    expect(poisoned.resultIp).toBe('6.6.6.66');
  });
});
