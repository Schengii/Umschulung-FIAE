/**
 * IHK VLSM (Variable Length Subnet Masking) Calculation Engine
 * Optimale Subnetz-Zuteilung und hierarchische IP-Planung nach IHK-Prüfungsstandard
 */

export const DEFAULT_VLSM_SUBNETS = [
  { id: 'sub_dev', name: 'Softwareentwicklung & DevOps', requiredHosts: 60 },
  { id: 'sub_sales', name: 'Vertrieb & Marketing', requiredHosts: 28 },
  { id: 'sub_wifi', name: 'Gäste-WLAN & Konferenz', requiredHosts: 14 },
  { id: 'sub_servers', name: 'DMZ & Lokale Server', requiredHosts: 6 },
  { id: 'sub_wan', name: 'Point-to-Point WAN Link (Router-Uplink)', requiredHosts: 2 }
];

/**
 * Wandelt eine 32-Bit Integer IP in einen Dotted-Decimal String um
 */
export function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

/**
 * Wandelt einen Dotted-Decimal IPv4 String in einen 32-Bit Integer um
 */
export function ipToInt(ipStr) {
  const octets = ipStr.trim().split('.').map(Number);
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    throw new Error(`Ungültige IPv4-Adresse: ${ipStr}`);
  }
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

/**
 * Berechnet die minimale Host-Bitanzahl für die geforderten Hosts
 */
export function getRequiredHostBits(hosts) {
  const h = Math.max(1, Number(hosts));
  // /31 Link (RFC 3021) für 2 Hosts benötigt 1 Host-Bit wenn Point-to-Point, sonst 2^h - 2 >= hosts
  let bits = 2;
  while ((Math.pow(2, bits) - 2) < h) {
    bits++;
    if (bits > 30) break;
  }
  return bits;
}

/**
 * Berechnet die vollständige VLSM-Subnetzverteilung
 */
export function calculateVlsm({
  baseIp = '192.168.10.0',
  basePrefix = 24,
  subnets = DEFAULT_VLSM_SUBNETS
}) {
  let baseInt = 0;
  try {
    baseInt = ipToInt(baseIp);
  } catch (e) {
    return { error: e.message, isValid: false };
  }

  const baseTotalIps = Math.pow(2, 32 - basePrefix);
  const baseMaskInt = (~((1 << (32 - basePrefix)) - 1)) >>> 0;
  const networkStartInt = (baseInt & baseMaskInt) >>> 0;
  const networkEndInt = (networkStartInt + baseTotalIps - 1) >>> 0;

  // 1. Nach Hostbedarf absteigend sortieren (IHK VLSM Grundregel!)
  const sortedSubnets = [...subnets]
    .filter(s => Number(s.requiredHosts) > 0)
    .sort((a, b) => Number(b.requiredHosts) - Number(a.requiredHosts));

  let currentPointer = networkStartInt;
  let totalAllocatedIps = 0;
  let totalRequestedHosts = 0;
  const allocatedSubnets = [];
  let isOverflow = false;

  for (const sub of sortedSubnets) {
    const reqHosts = Number(sub.requiredHosts);
    totalRequestedHosts += reqHosts;

    const hostBits = getRequiredHostBits(reqHosts);
    const prefix = 32 - hostBits;
    const blockSize = Math.pow(2, hostBits);
    const usableHosts = blockSize - 2;

    // Boundary-Alignment: Pointer an Blockgröße ausrichten
    const remainder = currentPointer % blockSize;
    if (remainder !== 0) {
      currentPointer += (blockSize - remainder);
    }

    const netAddressInt = currentPointer >>> 0;
    const broadcastInt = (netAddressInt + blockSize - 1) >>> 0;

    if (broadcastInt > networkEndInt) {
      isOverflow = true;
    }

    const maskInt = (~((1 << hostBits) - 1)) >>> 0;
    const maskStr = intToIp(maskInt);
    const netAddressStr = intToIp(netAddressInt);
    const broadcastStr = intToIp(broadcastInt);
    const firstHostStr = intToIp((netAddressInt + 1) >>> 0);
    const lastHostStr = intToIp((broadcastInt - 1) >>> 0);
    const efficiency = Math.round((reqHosts / usableHosts) * 100);

    allocatedSubnets.push({
      id: sub.id,
      name: sub.name,
      requiredHosts: reqHosts,
      allocatedHosts: usableHosts,
      totalBlockSize: blockSize,
      prefix: `/${prefix}`,
      prefixNumber: prefix,
      subnetMask: maskStr,
      networkAddress: netAddressStr,
      firstUsableHost: firstHostStr,
      lastUsableHost: lastHostStr,
      broadcastAddress: broadcastStr,
      efficiencyPercent: efficiency,
      isOverflow: broadcastInt > networkEndInt
    });

    currentPointer = (broadcastInt + 1) >>> 0;
    totalAllocatedIps += blockSize;
  }

  const freeIpsRemaining = Math.max(0, baseTotalIps - totalAllocatedIps);
  const overallUtilizationPercent = Math.min(100, Math.round((totalAllocatedIps / baseTotalIps) * 100));

  return {
    isValid: true,
    baseNetwork: intToIp(networkStartInt),
    basePrefix,
    baseBroadcast: intToIp(networkEndInt),
    baseTotalIps,
    totalRequestedHosts,
    totalAllocatedIps,
    freeIpsRemaining,
    overallUtilizationPercent,
    isOverflow,
    subnets: allocatedSubnets
  };
}
