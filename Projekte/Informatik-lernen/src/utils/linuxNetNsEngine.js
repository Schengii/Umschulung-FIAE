// @ts-check
/**
 * Linux Virtual Ethernet (veth) & Network Namespaces Simulator Engine
 * Simuliert `ip netns`, `ip link add type veth`, Linux Bridge `br0`,
 * Routing-Tabellen und iptables NAT MASQUERADE für Container-Isolation.
 */

/**
 * @typedef {Object} NetNamespace
 * @property {string} name
 * @property {string} ip
 * @property {string} gateway
 * @property {boolean} isBridge
 */

/**
 * Initialer Netzwerkaufbau mit Host, Default-Bridge und 2 isolierten Namespaces
 */
export const DEFAULT_NET_NAMESPACES = [
  { name: 'ns-web (Container 1)', ip: '10.0.0.2/24', gateway: '10.0.0.1', isBridge: false },
  { name: 'ns-db (Container 2)', ip: '10.0.0.3/24', gateway: '10.0.0.1', isBridge: false }
];

/**
 * Simuliert einen Ping zwischen zwei Namespaces oder ins Internet
 * @param {string} fromNs - z. B. 'ns-web'
 * @param {string} targetIp - z. B. '10.0.0.3' oder '8.8.8.8'
 * @param {boolean} bridgeUp - Ist die Linux Bridge br0 aktiviert?
 * @param {boolean} natEnabled - Ist iptables MASQUERADE aktiv?
 */
export function simulateNamespacePing(fromNs, targetIp, bridgeUp = true, natEnabled = true) {
  const steps = [];

  // Schritt 1: Lokale ARP / Routing Prüfung im Quell-Namespace
  steps.push({
    stage: '1. Namespace Interface & Routing',
    cmd: `ip netns exec ${fromNs} ip route get ${targetIp}`,
    detail: `Quell-Namespace prüft eigene Routing-Tabelle. Ziel ${targetIp} erfordert Weiterleitung über veth-Interface.`
  });

  if (!bridgeUp) {
    steps.push({
      stage: '2. Linux Bridge Ausfall',
      cmd: `brctl show / ip link show br0`,
      detail: `FEHLER: Interface br0 ist DOWN oder nicht konfiguriert. Paket verlässt den Namespace, wird aber an der Host-Bridge verworfen.`,
      success: false
    });
    return {
      success: false,
      reason: 'BRIDGE_DOWN',
      steps
    };
  }

  const isLocalSubnet = targetIp.startsWith('10.0.0.');

  if (isLocalSubnet) {
    // Schritt 2: Bridge L2 Switching
    steps.push({
      stage: '2. L2 Forwarding via br0',
      cmd: `bridge fdb show dev br0`,
      detail: `Bridge br0 lernt MAC-Adressen und leitet Ethernet-Frames direkt an den Peer-veth des Ziel-Namespaces weiter.`
    });

    steps.push({
      stage: '3. Ziel-Namespace Empfang',
      cmd: `ip netns exec target icmp_reply`,
      detail: `Ziel empfängt ICMP Echo Request auf veth-Peer und sendet ICMP Echo Reply (RTT ~0.2ms).`,
      success: true
    });

    return {
      success: true,
      rttMs: 0.24,
      steps
    };
  }

  // Externer Ping (z. B. 8.8.8.8)
  steps.push({
    stage: '2. Default Gateway Weiterleitung',
    cmd: `ip netns exec ${fromNs} -> Default Gateway 10.0.0.1 (br0)`,
    detail: `Paket wird an die Bridge-IP als Standard-Gateway gesendet und wechselt in den Host-Kernel-Routing-Stack.`
  });

  if (!natEnabled) {
    steps.push({
      stage: '3. NAT / MASQUERADE fehlt',
      cmd: `iptables -t nat -L POSTROUTING`,
      detail: `FEHLER: Keine iptables MASQUERADE Regel vorhanden! Private IP 10.0.0.2 kann im WAN nicht geroutet werden. Antwort geht verloren.`,
      success: false
    });
    return {
      success: false,
      reason: 'NO_NAT',
      steps
    };
  }

  steps.push({
    stage: '3. iptables NAT MASQUERADE',
    cmd: `iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE`,
    detail: `Host ersetzt private Quell-IP durch die eigene WAN-IP (SNAT / Port Address Translation).`
  });

  steps.push({
    stage: '4. Internet Breakout',
    cmd: `ping ${targetIp} -> WAN Interface (eth0)`,
    detail: `Echo Reply kehrt über Host-Conntrack zurück und wird an den Quell-Namespace zugestellt (RTT ~14ms).`,
    success: true
  });

  return {
    success: true,
    rttMs: 14.2,
    steps
  };
}

/**
 * Erzeugt die Linux Bash-Befehlskette zur Container-Netzwerkerstellung
 */
export function generateNetnsBashScript() {
  return `#!/bin/bash
# 1. Namespaces anlegen
ip netns add ns-web
ip netns add ns-db

# 2. Linux Bridge erstellen & aktivieren
ip link add name br0 type bridge
ip link set br0 up
ip addr add 10.0.0.1/24 dev br0

# 3. veth-Paare erstellen und verbinden
ip link add veth-web type veth peer name veth-web-br
ip link set veth-web netns ns-web
ip link set veth-web-br master br0
ip link set veth-web-br up

ip link add veth-db type veth peer name veth-db-br
ip link set veth-db netns ns-db
ip link set veth-db-br master br0
ip link set veth-db-br up

# 4. IP-Adressen und Default-Gateways im Namespace zuweisen
ip netns exec ns-web ip addr add 10.0.0.2/24 dev veth-web
ip netns exec ns-web ip link set veth-web up
ip netns exec ns-web ip route add default via 10.0.0.1

ip netns exec ns-db ip addr add 10.0.0.3/24 dev veth-db
ip netns exec ns-db ip link set veth-db up
ip netns exec ns-db ip route add default via 10.0.0.1

# 5. IP-Forwarding & NAT für Internet-Zugang aktivieren
sysctl -w net.ipv4.ip_forward=1
iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE
`;
}
