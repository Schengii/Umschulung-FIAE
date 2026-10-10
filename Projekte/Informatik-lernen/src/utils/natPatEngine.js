// @ts-check
/**
 * @file natPatEngine.js
 * RFC 3022 & RFC 2663 Network Address Translation (NAT) & Port Address Translation (PAT / NAPT / Overload) Engine.
 * Simuliert Inside Local, Inside Global, Outside Local, Outside Global sowie SNAT und DNAT (Port Forwarding).
 */

/**
 * @typedef {'pat_overload' | 'static_nat' | 'dnat_forwarding'} NatMode
 * 
 * @typedef {object} NatEntry
 * @property {string} id
 * @property {'TCP' | 'UDP'} protocol
 * @property {string} insideLocalIp
 * @property {number} insideLocalPort
 * @property {string} insideGlobalIp
 * @property {number} insideGlobalPort
 * @property {string} outsideGlobalIp
 * @property {number} outsideGlobalPort
 * @property {string} state - 'ESTABLISHED' | 'TIME_WAIT' | 'STATIC'
 * @property {number} [expiresInSec]
 */

/**
 * @typedef {object} NetworkPacket
 * @property {string} srcIp
 * @property {number} srcPort
 * @property {string} dstIp
 * @property {number} dstPort
 * @property {'TCP' | 'UDP'} protocol
 * @property {string} payload
 */

/**
 * Private IPv4-Bereiche nach RFC 1918
 */
export const RFC_1918_RANGES = [
  { class: 'Class A', cidr: '10.0.0.0/8', range: '10.0.0.0 – 10.255.255.255', totalIps: 16777216 },
  { class: 'Class B', cidr: '172.16.0.0/12', range: '172.16.0.0 – 172.31.255.255', totalIps: 1048576 },
  { class: 'Class C', cidr: '192.168.0.0/16', range: '192.168.0.0 – 192.168.255.255', totalIps: 65536 }
];

/**
 * Prüft, ob eine IPv4-Adresse im privaten RFC 1918 Adressraum liegt
 * @param {string} ip
 * @returns {boolean}
 */
export function isPrivateIp(ip) {
  if (!ip) return false;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;

  return false;
}

/**
 * Simuliert das Übersetzen eines ausgehenden Pakets (LAN -> WAN) durch den NAT/PAT-Router.
 * @param {NetworkPacket} packet
 * @param {string} routerPublicIp
 * @param {NatEntry[]} table
 * @param {number} nextPort
 * @returns {{
 *   translatedPacket: NetworkPacket,
 *   updatedTable: NatEntry[],
 *   allocatedPort: number,
 *   wasNewEntry: boolean,
 *   explanation: string
 * }}
 */
export function translateOutboundPacket(packet, routerPublicIp, table, nextPort = 40001) {
  // Suche bestehenden aktiven Eintrag in der NAT-Tabelle
  let existing = table.find(
    e => e.protocol === packet.protocol &&
         e.insideLocalIp === packet.srcIp &&
         e.insideLocalPort === packet.srcPort &&
         e.outsideGlobalIp === packet.dstIp &&
         e.outsideGlobalPort === packet.dstPort
  );

  let updatedTable = [...table];
  let allocatedPort = nextPort;
  let wasNewEntry = false;
  let explanation = '';

  if (existing) {
    allocatedPort = existing.insideGlobalPort;
    explanation = `Bestehender NAT-Socket wiederverwendet: ${existing.insideLocalIp}:${existing.insideLocalPort} -> ${existing.insideGlobalIp}:${existing.insideGlobalPort}.`;
  } else {
    // Neuen PAT-Port vergeben
    while (updatedTable.some(e => e.insideGlobalPort === allocatedPort)) {
      allocatedPort++;
      if (allocatedPort > 65535) allocatedPort = 40001;
    }

    const newEntry = {
      id: `nat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      protocol: packet.protocol,
      insideLocalIp: packet.srcIp,
      insideLocalPort: packet.srcPort,
      insideGlobalIp: routerPublicIp,
      insideGlobalPort: allocatedPort,
      outsideGlobalIp: packet.dstIp,
      outsideGlobalPort: packet.dstPort,
      state: 'ESTABLISHED',
      expiresInSec: 300
    };

    updatedTable.push(newEntry);
    wasNewEntry = true;
    explanation = `Neuer PAT-Eintrag angelegt: Quell-Socket ${packet.srcIp}:${packet.srcPort} wird übersetzt nach ${routerPublicIp}:${allocatedPort}.`;
  }

  const translatedPacket = {
    srcIp: routerPublicIp,
    srcPort: allocatedPort,
    dstIp: packet.dstIp,
    dstPort: packet.dstPort,
    protocol: packet.protocol,
    payload: packet.payload
  };

  return {
    translatedPacket,
    updatedTable,
    allocatedPort,
    wasNewEntry,
    explanation
  };
}

/**
 * Simuliert das Übersetzen eines eingehenden Antwort-Pakets (WAN -> LAN) durch den NAT/PAT-Router.
 * @param {NetworkPacket} packet
 * @param {NatEntry[]} table
 * @returns {{
 *   success: boolean,
 *   translatedPacket: NetworkPacket | null,
 *   explanation: string
 * }}
 */
export function translateInboundPacket(packet, table) {
  // Router sucht Match auf Ziel-IP (seine Public IP) und Ziel-Port (Inside Global Port)
  const match = table.find(
    e => e.protocol === packet.protocol &&
         e.insideGlobalPort === packet.dstPort &&
         e.outsideGlobalIp === packet.srcIp
  );

  if (!match) {
    return {
      success: false,
      translatedPacket: null,
      explanation: `DROP: Kein aktiver NAT-Eintrag für Port ${packet.dstPort} von Quelle ${packet.srcIp} vorhanden. Firewall verwirft Paket.`
    };
  }

  const translatedPacket = {
    srcIp: packet.srcIp,
    srcPort: packet.srcPort,
    dstIp: match.insideLocalIp,
    dstPort: match.insideLocalPort,
    protocol: packet.protocol,
    payload: packet.payload
  };

  return {
    success: true,
    translatedPacket,
    explanation: `MATCH: Paket für ${packet.dstIp}:${packet.dstPort} wird an internen Host ${match.insideLocalIp}:${match.insideLocalPort} weitergeleitet.`
  };
}

/**
 * Standard IHK Demo-Szenario für NAT/PAT
 */
export const DEFAULT_NAT_SCENARIO = {
  routerPublicIp: '203.0.113.1',
  routerLanIp: '192.168.1.1',
  lanHosts: [
    { id: 'pc1', label: 'PC-1 (Azubi-Arbeitsplatz)', ip: '192.168.1.10', defaultPort: 51234 },
    { id: 'pc2', label: 'PC-2 (Verwaltung)', ip: '192.168.1.20', defaultPort: 52400 },
    { id: 'srv', label: 'Interner Webserver', ip: '192.168.1.80', defaultPort: 8080 }
  ],
  wanTargets: [
    { id: 'web1', label: 'Webserver (example.com)', ip: '93.184.216.34', port: 80 },
    { id: 'dns1', label: 'Public DNS (Google)', ip: '8.8.8.8', port: 53 },
    { id: 'api1', label: 'Cloud API (HTTPS)', ip: '142.250.185.206', port: 443 }
  ],
  initialTable: [
    {
      id: 'init_1',
      protocol: 'TCP',
      insideLocalIp: '192.168.1.10',
      insideLocalPort: 49152,
      insideGlobalIp: '203.0.113.1',
      insideGlobalPort: 40001,
      outsideGlobalIp: '93.184.216.34',
      outsideGlobalPort: 80,
      state: 'ESTABLISHED',
      expiresInSec: 280
    }
  ]
};

/**
 * IHK Prüfungsdrill Fragen für NAT, PAT & Port-Forwarding
 */
export const NAT_PAT_DRILL_QUESTIONS = [
  {
    id: 'nat_1',
    frage: 'Welcher Hauptunterschied besteht zwischen klassischem statischem NAT und PAT (Port Address Translation / NAT Overload)?',
    optionen: [
      'PAT übersetzt IP-Adressen nur für IPv6, während statisches NAT nur für IPv4 funktioniert.',
      'PAT erlaubt vielen privaten IP-Adressen das gleichzeitige Teilen einer einzigen öffentlichen IP mittels dynamischer TCP/UDP-Ports.',
      'Statisches NAT verschlüsselt die übertragenen Nutzdaten, PAT tut dies nicht.',
      'PAT benötigt keine Routing-Tabelle im Router.'
    ],
    korrektIndex: 1,
    erklaerung: 'Bei PAT (Port Address Translation / Overload) multiplexen hunderte Hosts im LAN über eine einzige öffentliche IP, indem der Router für jede Session einen eigenen Port im Bereich 49152–65535 vergibt.'
  },
  {
    id: 'nat_2',
    frage: 'Welche der folgenden IPv4-Adressen gehört laut RFC 1918 zum privaten Adressraum und wird im öffentlichen Internet nicht geroutet?',
    optionen: [
      '192.178.1.1',
      '172.25.10.5',
      '11.0.0.1',
      '8.8.4.4'
    ],
    korrektIndex: 1,
    erklaerung: '172.16.0.0 bis 172.31.255.255 ist der private Class-B-Bereich nach RFC 1918. 172.25.10.5 fällt genau in diesen Bereich.'
  },
  {
    id: 'nat_3',
    frage: 'Ein Unternehmen möchte einen internen Webserver (192.168.1.80:443) aus dem Internet über seine öffentliche IP (203.0.113.1:443) erreichbar machen. Welche NAT-Konfiguration ist hierfür erforderlich?',
    optionen: [
      'Source NAT (SNAT) Masquerading',
      'Destination NAT (DNAT) / Portweiterleitung (Port Forwarding)',
      'Carrier-Grade NAT (CGNAT)',
      'Proxy ARP ohne NAT'
    ],
    korrektIndex: 1,
    erklaerung: 'Bei Destination NAT (DNAT / Port-Forwarding) leitet der Router ankommende Verbindungen auf einem bestimmten Port der öffentlichen IP an die private IP des internen Servers weiter.'
  },
  {
    id: 'nat_4',
    frage: 'Welcher Cisco/IHK-Fachbegriff bezeichnet die IP-Adresse und Portnummer eines Hosts im LAN vor der Übersetzung durch den NAT-Router?',
    optionen: [
      'Outside Global',
      'Inside Global',
      'Inside Local',
      'Outside Local'
    ],
    korrektIndex: 2,
    erklaerung: 'Inside Local ist die private IP/Port-Kombination des internen Quellgeräts vor der Übersetzung. Inside Global ist die IP/Port nach der Übersetzung nach außen hin.'
  }
];
