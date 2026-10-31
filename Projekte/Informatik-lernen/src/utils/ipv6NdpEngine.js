// @ts-check
/**
 * IPv6 SLAAC, DHCPv6 & NDP (Neighbor Discovery Protocol) Simulator Engine
 * Simuliert RFC 4861 (NDP), RFC 4862 (SLAAC mit EUI-64 & RFC 8981 Privacy Extensions)
 * und DHCPv6 (Stateless O-Flag vs. Stateful M-Flag).
 */

/**
 * Wandelt eine MAC-Adresse nach EUI-64 in ein Interface Identifier (IID) um
 * Invertiert das Universal/Local (u/l) Bit an Bit 7 und fügt 0xFFFE in der Mitte ein.
 * @param {string} mac - MAC-Adresse z. B. "00:1a:2b:3c:4d:5e"
 * @returns {string} - 64-Bit Hex-String z. B. "021a:2bff:fe3c:4d5e"
 */
export function generateEui64(mac) {
  const parts = mac.replace(/[:-]/g, '').toLowerCase().match(/.{1,2}/g);
  if (!parts || parts.length !== 6) {
    throw new Error('Ungültige MAC-Adresse für EUI-64');
  }

  // Erstes Byte invertiert das U/L Bit (Bit 7, d.h. 0x02 XOR)
  let firstByte = parseInt(parts[0], 16) ^ 0x02;
  const firstByteHex = firstByte.toString(16).padStart(2, '0');

  // EUI-64: Byte0, Byte1, Byte2, FF, FE, Byte3, Byte4, Byte5
  const p1 = `${firstByteHex}${parts[1]}`;
  const p2 = `${parts[2]}ff`;
  const p3 = `fe${parts[3]}`;
  const p4 = `${parts[4]}${parts[5]}`;

  return `${p1}:${p2}:${p3}:${p4}`;
}

/**
 * Erzeugt eine temporäre Privacy-Extension-Adresse nach RFC 8981
 * @param {string} prefix - z. B. "2001:db8:acad:1"
 * @returns {string}
 */
export function generatePrivacyAddress(prefix) {
  const randomHexChunk = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const iid = `${randomHexChunk()}:${randomHexChunk()}:${randomHexChunk()}:${randomHexChunk()}`;
  return `${prefix}:${iid}`;
}

/**
 * Neighbor Discovery Protocol (NDP) Nachrichtentypen nach RFC 4861
 */
export const NDP_MESSAGE_TYPES = {
  RS: { type: 133, name: 'Router Solicitation (RS)', desc: 'Host bittet alle Router um ein Router Advertisement (Multicast an ff02::2)' },
  RA: { type: 134, name: 'Router Advertisement (RA)', desc: 'Router sendet Prefix-Informationen, Default-Gateway und Flags (ff02::1)' },
  NS: { type: 135, name: 'Neighbor Solicitation (NS)', desc: 'Ermittelt Link-Layer-Adresse eines Nachbarn oder DAD (Duplicate Address Detection)' },
  NA: { type: 136, name: 'Neighbor Advertisement (NA)', desc: 'Antwort auf NS mit der eigenen MAC-Adresse oder Flag-Update' },
  REDIRECT: { type: 137, name: 'Redirect', desc: 'Informiert Host über einen besseren First-Hop-Router' }
};

/**
 * Simuliert den Lebenszyklus des IPv6 Autoconfig-Ablaufs
 * @param {Object} options
 * @param {string} options.mac - MAC des Clients
 * @param {string} options.prefix - IPv6 Prefix des Routers, z. B. "2001:db8:1337:1"
 * @param {boolean} options.usePrivacy - Privacy Extensions aktivieren?
 * @param {boolean} options.mFlag - Managed Address Flag (Stateful DHCPv6)
 * @param {boolean} options.oFlag - Other Config Flag (Stateless DHCPv6 für DNS)
 * @param {boolean} options.dadConflict - Soll ein DAD-Adresskonflikt simuliert werden?
 */
export function simulateIpv6NdLifecycle(options) {
  const {
    mac = '00:1a:2b:3c:4d:5e',
    prefix = '2001:db8:1337:1',
    usePrivacy = true,
    mFlag = false,
    oFlag = true,
    dadConflict = false
  } = options;

  const steps = [];

  // Schritt 1: Link-Local Adresse erzeugen (fe80::/10 + EUI-64)
  const eui64 = generateEui64(mac);
  const linkLocal = `fe80::${eui64}`;
  steps.push({
    title: '1. Link-Local Adresserstellung',
    protocol: 'SLAAC (RFC 4862)',
    address: linkLocal,
    scope: 'Link-Local',
    description: `Client generiert lokale Adresse aus Prefix fe80::/64 und invertiertem EUI-64 Identifier (${eui64}).`
  });

  // Schritt 2: DAD (Duplicate Address Detection) für Link-Local
  steps.push({
    title: '2. DAD (Duplicate Address Detection)',
    protocol: 'ICMPv6 NS (Typ 135)',
    target: linkLocal,
    multicastGroup: `ff02::1:ff${mac.replace(/[:-]/g, '').slice(-6)} (Solicited-Node Multicast)`,
    status: dadConflict ? 'Konflikt (NA empfangen!)' : 'Eindeutig (Kein NA erhalten)',
    description: dadConflict 
      ? 'FEHLER: Ein anderer Host im Netz hat auf die NS geantwortet. Adresse ist Duplikat und wird deaktiviert!' 
      : 'Erfolg: Keine Antwort binnen Retransmit-Timer. Link-Local Adresse ist gültig und betriebsbereit.'
  });

  if (dadConflict) {
    return {
      success: false,
      reason: 'DAD_CONFLICT',
      linkLocal: null,
      globalAddresses: [],
      steps
    };
  }

  // Schritt 3: Router Solicitation (RS)
  steps.push({
    title: '3. Router Solicitation (RS)',
    protocol: 'ICMPv6 Typ 133',
    source: linkLocal,
    destination: 'ff02::2 (All-Routers Multicast)',
    description: 'Host sucht aktive IPv6-Router im lokalen Subnetz.'
  });

  // Schritt 4: Router Advertisement (RA) mit Flags
  steps.push({
    title: '4. Router Advertisement (RA)',
    protocol: 'ICMPv6 Typ 134',
    source: 'fe80::1 (Default Gateway Router)',
    destination: 'ff02::1 (All-Nodes Multicast)',
    flags: {
      mFlag,
      oFlag,
      routerLifetime: 1800,
      prefix: `${prefix}::/64`
    },
    description: `Router antwortet mit Prefix ${prefix}::/64. Flags: M=${mFlag ? 1 : 0} (${mFlag ? 'Stateful DHCPv6' : 'SLAAC aktiv'}), O=${oFlag ? 1 : 0} (${oFlag ? 'Stateless DHCPv6 DNS' : 'Kein DHCPv6'}).`
  });

  // Schritt 5: Global Unicast Adressen (GUA)
  const globalAddresses = [];

  if (!mFlag) {
    // SLAAC
    const slaacEui64 = `${prefix}:${eui64}`;
    globalAddresses.push({ address: slaacEui64, type: 'SLAAC EUI-64 (Statisch)', lifetime: 'Unbegrenzt' });

    if (usePrivacy) {
      const privacy = generatePrivacyAddress(prefix);
      globalAddresses.push({ address: privacy, type: 'Privacy Extension (RFC 8981, Temporär)', lifetime: '24 Stunden' });
    }
  } else {
    // Stateful DHCPv6
    globalAddresses.push({ address: `${prefix}::150`, type: 'DHCPv6 IA_NA (Lease vom Server)', lifetime: '86400s' });
  }

  steps.push({
    title: '5. Globale IPv6-Adresszuweisung (GUA)',
    protocol: mFlag ? 'DHCPv6 Stateful' : 'SLAAC + Privacy Extensions',
    addresses: globalAddresses,
    dnsServers: oFlag ? ['2001:4860:4860::8888', '2001:db8:1::53'] : ['Vom Router RA RDNSS'],
    description: mFlag 
      ? 'Client bezieht Adressen und Lease über Stateful DHCPv6 Server.' 
      : `Client konfiguriert Global Unicast IP via SLAAC Autokonfiguration ${usePrivacy ? 'inklusive temporärer Privacy Address zum Tracking-Schutz' : ''}.`
  });

  return {
    success: true,
    linkLocal,
    globalAddresses,
    gateway: 'fe80::1',
    steps
  };
}
