import { describe, it, expect } from 'vitest';
import { inspectDnsPrivacy } from './dnsPrivacyEngine';

describe('dnsPrivacyEngine', () => {
  it('detects plain DNS as unencrypted and visible to ISPs on port 53', () => {
    const res = inspectDnsPrivacy('banking.example.de', 'PlainDNS');
    expect(res.port).toBe(53);
    expect(res.isEncrypted).toBe(false);
    expect(res.isIspVisible).toBe(true);
    expect(res.hexDumpPreview).toContain('banking.example.de');
  });

  it('verifies DoT uses port 853 with TLS encryption', () => {
    const res = inspectDnsPrivacy('banking.example.de', 'DoT');
    expect(res.port).toBe(853);
    expect(res.isEncrypted).toBe(true);
    expect(res.isIspVisible).toBe(false);
    expect(res.packetFormat).toContain('RFC 7858');
  });

  it('verifies DoH uses port 443 with application/dns-message', () => {
    const res = inspectDnsPrivacy('banking.example.de', 'DoH');
    expect(res.port).toBe(443);
    expect(res.isEncrypted).toBe(true);
    expect(res.isIspVisible).toBe(false);
    expect(res.hexDumpPreview).toContain('application/dns-message');
  });
});
