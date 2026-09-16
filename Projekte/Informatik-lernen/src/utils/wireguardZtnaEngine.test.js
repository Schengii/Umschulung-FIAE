import { describe, it, expect } from 'vitest';
import { WireguardZtnaSimulator } from './wireguardZtnaEngine';

describe('WireGuard VPN & Zero-Trust ZTNA Engine', () => {
  it('grants access to compliant peer with valid NoiseIK handshake', () => {
    const wg = new WireguardZtnaSimulator();
    const res = wg.evaluateZtnaAccess('peer-dev-laptop', '10.0.1.50');

    expect(res.accessGranted).toBe(true);
    expect(res.handshake).toContain('NoiseIK');
    expect(res.policyResult).toContain('ACCESS_GRANTED');
  });

  it('denies access to non-compliant peer with low trust score', () => {
    const wg = new WireguardZtnaSimulator();
    const res = wg.evaluateZtnaAccess('peer-mobile-phone', '10.0.1.50');

    expect(res.accessGranted).toBe(false);
    expect(res.policyResult).toContain('ACCESS_DENIED');
  });
});
