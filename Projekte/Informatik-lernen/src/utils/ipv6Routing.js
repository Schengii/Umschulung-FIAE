/**
 * IPv6 & Routing-Table Utilities
 * Compression, Expansion, EUI-64 / SLAAC Interface ID & Longest Prefix Match (LPM)
 */

export function expandIpv6(ipv6) {
  let address = ipv6.trim().toLowerCase();
  if (!address) return '';

  // Prüfen auf ::
  if (address.includes('::')) {
    const parts = address.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    const middle = Array(missing).fill('0000');
    const fullParts = [...left, ...middle, ...right];
    return fullParts.map(p => p.padStart(4, '0')).join(':');
  }

  const parts = address.split(':');
  if (parts.length === 8) {
    return parts.map(p => p.padStart(4, '0')).join(':');
  }

  return address;
}

export function compressIpv6(ipv6) {
  const expanded = expandIpv6(ipv6);
  if (!expanded || expanded.split(':').length !== 8) return ipv6;

  const parts = expanded.split(':').map(p => p.replace(/^0+/, '') || '0');

  // Längste Serie von Nullen finden
  let maxZeroStart = -1;
  let maxZeroLen = 0;
  let curZeroStart = -1;
  let curZeroLen = 0;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '0') {
      if (curZeroStart === -1) {
        curZeroStart = i;
        curZeroLen = 1;
      } else {
        curZeroLen++;
      }
      if (curZeroLen > maxZeroLen) {
        maxZeroLen = curZeroLen;
        maxZeroStart = curZeroStart;
      }
    } else {
      curZeroStart = -1;
      curZeroLen = 0;
    }
  }

  if (maxZeroLen > 1) {
    const left = parts.slice(0, maxZeroStart).join(':');
    const right = parts.slice(maxZeroStart + maxZeroLen).join(':');
    if (!left && !right) return '::';
    if (!left) return `::${right}`;
    if (!right) return `${left}::`;
    return `${left}::${right}`;
  }

  return parts.join(':');
}

export function generateEui64(macAddress, prefix = 'fe80::') {
  // MAC: 00:1A:2B:3C:4D:5E oder 00-1A-2B-3C-4D-5E oder 001A.2B3C.4D5E
  const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (cleanMac.length !== 12) {
    return { error: 'Ungültige MAC-Adresse (benötigt 12 Hex-Zeichen / 48 Bit)' };
  }

  const o1 = cleanMac.slice(0, 2);
  const o2 = cleanMac.slice(2, 4);
  const o3 = cleanMac.slice(4, 6);
  const o4 = cleanMac.slice(6, 8);
  const o5 = cleanMac.slice(8, 10);
  const o6 = cleanMac.slice(10, 12);

  // 1. Erstes Byte U/L Bit (Universal/Local) invertieren: XOR mit 0x02
  const firstByteNum = parseInt(o1, 16) ^ 0x02;
  const modO1 = firstByteNum.toString(16).padStart(2, '0').toUpperCase();

  // 2. FF:FE in die Mitte einfügen
  const g1 = `${modO1}${o2}`.toLowerCase();
  const g2 = `${o3}ff`.toLowerCase();
  const g3 = `fe${o4}`.toLowerCase();
  const g4 = `${o5}${o6}`.toLowerCase();

  const interfaceId = `${g1}:${g2}:${g3}:${g4}`;
  const cleanPrefix = prefix.endsWith(':') ? prefix : prefix + ':';
  const fullIpv6 = compressIpv6(`${cleanPrefix}${interfaceId}`);

  return {
    originalMac: `${o1}:${o2}:${o3}:${o4}:${o5}:${o6}`,
    modifiedFirstByte: modO1,
    insertedBytes: 'FF:FE',
    interfaceId,
    fullIpv6
  };
}

export function ipToBinary32(ip) {
  const octets = ip.trim().split('.').map(Number);
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    return null;
  }
  return octets.map(o => o.toString(2).padStart(8, '0')).join('');
}

export function matchRoutingTable(targetIp, routes = []) {
  // routes: [{ destination: '192.168.1.0/24', nextHop: '10.0.0.1', iface: 'eth0' }, ...]
  const targetBin = ipToBinary32(targetIp);
  if (!targetBin) {
    return { error: 'Ungültige Ziel-IP-Adresse' };
  }

  let bestMatch = null;
  let longestPrefixLength = -1;

  const evaluatedRoutes = routes.map(route => {
    const [destIp, cidrStr] = route.destination.split('/');
    const cidr = cidrStr !== undefined ? parseInt(cidrStr, 10) : 32;

    if (destIp === '0.0.0.0' && cidr === 0) {
      // Default Route
      const isDefault = true;
      if (longestPrefixLength < 0) {
        longestPrefixLength = 0;
        bestMatch = { ...route, prefixLength: 0, matchedBits: 0 };
      }
      return { ...route, prefixLength: 0, matches: true, isDefault };
    }

    const destBin = ipToBinary32(destIp);
    if (!destBin) {
      return { ...route, prefixLength: cidr, matches: false, reason: 'Invalid route IP' };
    }

    const matches = targetBin.slice(0, cidr) === destBin.slice(0, cidr);

    if (matches && cidr > longestPrefixLength) {
      longestPrefixLength = cidr;
      bestMatch = { ...route, prefixLength: cidr, matchedBits: cidr };
    }

    return {
      ...route,
      prefixLength: cidr,
      matches,
      destBinPrefix: destBin.slice(0, cidr),
      targetBinPrefix: targetBin.slice(0, cidr)
    };
  });

  return {
    targetIp,
    targetBin,
    bestMatch,
    evaluatedRoutes
  };
}
