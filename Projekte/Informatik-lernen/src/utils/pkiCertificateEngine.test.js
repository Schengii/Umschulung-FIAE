import { describe, it, expect } from 'vitest';
import { validateCertificateChain } from './pkiCertificateEngine';

describe('pkiCertificateEngine', () => {
  const validRoot = {
    id: 'root',
    subject: 'Global Root CA G2',
    issuer: 'Global Root CA G2',
    serialNumber: '01',
    validFrom: '2020-01-01T00:00:00Z',
    validTo: '2030-01-01T00:00:00Z',
    san: [],
    isCa: true,
    isSelfSigned: true,
    isRevoked: false
  };

  const validIntermediate = {
    id: 'inter',
    subject: 'Cloud Intermediate CA 1',
    issuer: 'Global Root CA G2',
    serialNumber: '02',
    validFrom: '2022-01-01T00:00:00Z',
    validTo: '2028-01-01T00:00:00Z',
    san: [],
    isCa: true,
    isSelfSigned: false,
    isRevoked: false
  };

  const validLeaf = {
    id: 'leaf',
    subject: 'CN=*.my-cloud.de',
    issuer: 'Cloud Intermediate CA 1',
    serialNumber: '03',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2027-01-01T00:00:00Z',
    san: ['*.my-cloud.de', 'my-cloud.de'],
    isCa: false,
    isSelfSigned: false,
    isRevoked: false
  };

  it('validiert eine fehlerfreie Kette mit Wildcard SAN', () => {
    const res = validateCertificateChain(
      [validLeaf, validIntermediate, validRoot],
      'api.my-cloud.de',
      new Date('2026-05-01T00:00:00Z')
    );

    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
    expect(res.validatedHops).toBe(3);
  });

  it('erkennt abgelaufene Zertifikate', () => {
    const res = validateCertificateChain(
      [validLeaf, validIntermediate, validRoot],
      'api.my-cloud.de',
      new Date('2028-06-01T00:00:00Z')
    );

    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('abgelaufen'))).toBe(true);
  });

  it('erkennt Hostname Mismatches', () => {
    const res = validateCertificateChain(
      [validLeaf, validIntermediate, validRoot],
      'hacker-phishing.com',
      new Date('2026-05-01T00:00:00Z')
    );

    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('Hostname Mismatch'))).toBe(true);
  });

  it('erkennt widerrufene Zertifikate (CRL / OCSP)', () => {
    const revokedLeaf = { ...validLeaf, isRevoked: true };
    const res = validateCertificateChain(
      [revokedLeaf, validIntermediate, validRoot],
      'api.my-cloud.de',
      new Date('2026-05-01T00:00:00Z')
    );

    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('widerrufen'))).toBe(true);
  });
});
