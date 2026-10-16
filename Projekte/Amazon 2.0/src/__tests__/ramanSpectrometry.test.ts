import { describe, it, expect } from 'vitest';
import { scanRamanSpectrometry } from '../utils/ramanSpectrometry';

describe('Raman Laser Spectrometry & Authenticity Engine', () => {
  it('scans molecular Raman fingerprint and validates diamond peak authenticity', () => {
    const report = scanRamanSpectrometry('Diamant-Solitär 1.5ct');
    expect(report.isAuthentic).toBe(true);
    expect(report.laserWavelengthNm).toBe(785);
    expect(report.molecularFingerprintPeakCm1).toBeCloseTo(1332.5, 1);
    expect(report.authenticityScorePercent).toBeGreaterThan(99.0);
    expect(report.blockchainCertificateNft).toContain('eip155:');
  });
});
