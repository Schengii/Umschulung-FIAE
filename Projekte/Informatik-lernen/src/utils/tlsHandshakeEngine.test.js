import { describe, it, expect } from 'vitest';
import { buildFullHandshake, buildResumptionHandshake, CIPHER_SUITES, KEY_EXCHANGE_GROUPS } from './tlsHandshakeEngine';

describe('TLS 1.3 Handshake Engine', () => {
  it('builds a full 1-RTT handshake with 7 steps ending in Finished', () => {
    const hs = buildFullHandshake({});
    expect(hs.steps.length).toBe(7);
    expect(hs.steps[0].id).toBe('client_hello');
    expect(hs.steps[hs.steps.length - 1].id).toBe('client_finished');
    expect(hs.totalRtt).toBe(1);
  });

  it('reflects the chosen cipher suite and key exchange group in the steps', () => {
    const hs = buildFullHandshake({ cipherSuiteId: 'TLS_CHACHA20_POLY1305_SHA256', keyGroupId: 'secp384r1' });
    expect(hs.cipherSuite.id).toBe('TLS_CHACHA20_POLY1305_SHA256');
    expect(hs.keyGroup.id).toBe('secp384r1');
    expect(hs.steps[1].detail).toContain('TLS_CHACHA20_POLY1305_SHA256');
  });

  it('falls back to a default cipher suite / group for unknown ids', () => {
    const hs = buildFullHandshake({ cipherSuiteId: 'not_a_real_suite', keyGroupId: 'not_a_real_group' });
    expect(hs.cipherSuite.id).toBe(CIPHER_SUITES[0].id);
    expect(hs.keyGroup.id).toBe(KEY_EXCHANGE_GROUPS[0].id);
  });

  it('builds a shorter 0-RTT resumption handshake with no certificate steps', () => {
    const hs = buildResumptionHandshake({});
    expect(hs.totalRtt).toBe(0);
    const ids = hs.steps.map(s => s.id);
    expect(ids).not.toContain('server_certificate');
    expect(ids).not.toContain('server_cert_verify');
    expect(ids[0]).toBe('client_hello_psk');
  });

  it('includes the SNI hostname in both handshake types', () => {
    const full = buildFullHandshake({ sni: 'shop.example.com' });
    const resumed = buildResumptionHandshake({ sni: 'shop.example.com' });
    expect(full.sni).toBe('shop.example.com');
    expect(resumed.sni).toBe('shop.example.com');
  });
});
