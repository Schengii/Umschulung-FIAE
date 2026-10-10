// @ts-check
/**
 * DNS-over-HTTPS (DoH, RFC 8484) & DNS-over-TLS (DoT, RFC 7858) Privacy Engine
 * Compares Plaintext DNS (UDP 53), DoT (TCP 853 with TLS), and DoH (TCP 443 HTTP/2 Wire-Format),
 * simulating ISP eavesdropping, SNI/query leakages, and encrypted DNS frames.
 */

/**
 * @typedef {'PlainDNS' | 'DoT' | 'DoH'} DnsProtocol
 */

/**
 * @typedef {Object} DnsQueryInspection
 * @property {string} domain
 * @property {DnsProtocol} protocol
 * @property {number} port
 * @property {boolean} isEncrypted
 * @property {boolean} isIspVisible
 * @property {string} packetFormat
 * @property {string} hexDumpPreview
 * @property {number} latencyOverheadMs
 */

/**
 * Evaluates DNS request under chosen protocol
 * @param {string} domain
 * @param {DnsProtocol} protocol
 * @returns {DnsQueryInspection}
 */
export function inspectDnsPrivacy(domain = 'secure.bank-portal.de', protocol = 'DoH') {
  const cleanDomain = domain.trim().toLowerCase() || 'example.com';

  if (protocol === 'PlainDNS') {
    return {
      domain: cleanDomain,
      protocol: 'PlainDNS',
      port: 53,
      isEncrypted: false,
      isIspVisible: true,
      packetFormat: 'Unverschlüsseltes UDP-Datagramm (RFC 1035)',
      hexDumpPreview: `00 01 01 00 00 01 00 00 00 00 00 00 [${cleanDomain}] 00 01 00 01 (Klartext lesbar!)`,
      latencyOverheadMs: 12 // Fast 1-RTT
    };
  }

  if (protocol === 'DoT') {
    return {
      domain: cleanDomain,
      protocol: 'DoT',
      port: 853,
      isEncrypted: true,
      isIspVisible: false,
      packetFormat: 'TLS 1.3 über dedizierten Port 853 (RFC 7858)',
      hexDumpPreview: '17 03 03 00 3c [TLS Application Data: AES-256-GCM Encrypted Payload]',
      latencyOverheadMs: 38 // TCP + TLS Handshake
    };
  }

  // DoH (RFC 8484)
  return {
    domain: cleanDomain,
    protocol: 'DoH',
    port: 443,
    isEncrypted: true,
    isIspVisible: false,
    packetFormat: 'HTTP/2 Binary Wire-Format über HTTPS Port 443 (RFC 8484)',
    hexDumpPreview: ':method=POST :path=/dns-query content-type=application/dns-message [TLS 1.3 Ciphertext]',
    latencyOverheadMs: 35 // HTTP/2 Multiplexed over standard Web Port
  };
}
