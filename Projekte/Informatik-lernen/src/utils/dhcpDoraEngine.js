// @ts-check
/**
 * RFC 2131 Dynamic Host Configuration Protocol (DHCP) & Relay Agent Engine
 * Simuliert den vollständigen DHCP-Lifecycle nach offiziellem IHK-Standard:
 * - 4-Way DORA Handshake: Discover -> Offer -> Request -> Acknowledge
 * - Client Port 68 (UDP) & Server Port 67 (UDP)
 * - Lease-Time-Management & Timer T1 (50% Renewal) & T2 (87.5% Rebinding)
 * - DHCP Relay Agent (GIADDR RFC 3046 / Option 82) über Subnetzgrenzen
 * @module dhcpDoraEngine
 */

/**
 * @typedef {'INIT' | 'SELECTING' | 'REQUESTING' | 'BOUND' | 'RENEWING' | 'REBINDING'} DhcpClientState
 *
 * @typedef {{
 *   stepNum: number;
 *   phase: 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK' | 'RENEW' | 'REBIND' | 'RELEASE';
 *   sender: string;
 *   receiver: string;
 *   srcIp: string;
 *   dstIp: string;
 *   srcPort: number;
 *   dstPort: number;
 *   xid: string;
 *   ciaddr: string; // Client IP
 *   yiaddr: string; // Your IP
 *   siaddr: string; // Next Server IP
 *   giaddr: string; // Relay Agent IP
 *   options: {
 *     messageType: string;
 *     subnetMask?: string;
 *     router?: string;
 *     dns?: string;
 *     leaseTime?: number;
 *     serverIdentifier?: string;
 *     t1Renewal?: number;
 *     t2Rebind?: number;
 *   };
 *   description: string;
 * }} DhcpPacket
 *
 * @typedef {{
 *   clientState: DhcpClientState;
 *   clientMac: string;
 *   assignedIp: string | null;
 *   subnetMask: string;
 *   gateway: string;
 *   dns: string;
 *   leaseTimeSeconds: number;
 *   t1Seconds: number;
 *   t2Seconds: number;
 *   isRelayActive: boolean;
 *   relayIp: string;
 *   serverIp: string;
 *   history: DhcpPacket[];
 * }} DhcpSession
 */

/**
 * Initialisiert eine neue DHCP-Session
 * @param {Partial<DhcpSession>} [initialConfig]
 * @returns {DhcpSession}
 */
export function createDhcpSession(initialConfig = {}) {
  const lease = initialConfig.leaseTimeSeconds ?? 86400; // 24h
  return {
    clientState: 'INIT',
    clientMac: '00:1A:2B:3C:4D:5E',
    assignedIp: null,
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '192.168.1.1',
    leaseTimeSeconds: lease,
    t1Seconds: Math.round(lease * 0.5),   // 50%
    t2Seconds: Math.round(lease * 0.875), // 87.5%
    isRelayActive: false,
    relayIp: '192.168.2.1',
    serverIp: '192.168.1.1',
    history: [],
    ...initialConfig
  };
}

/**
 * Führt einen Schritt im DORA-Handshake oder Lease-Lifecycle aus
 * @param {DhcpSession} session
 * @param {'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK' | 'RENEW_T1' | 'REBIND_T2' | 'RELEASE'} action
 * @returns {DhcpSession}
 */
export function executeDhcpAction(session, action) {
  const nextHistory = [...session.history];
  const stepNum = nextHistory.length + 1;
  const xid = '0x39A4F1D2';
  const offeredIp = session.isRelayActive ? '192.168.2.150' : '192.168.1.150';
  const serverIp = session.isRelayActive ? '10.0.0.1' : session.serverIp;

  switch (action) {
    case 'DISCOVER': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'DISCOVER',
        sender: 'Client',
        receiver: session.isRelayActive ? 'DHCP Relay Agent' : 'DHCP Server (Broadcast)',
        srcIp: '0.0.0.0',
        dstIp: '255.255.255.255',
        srcPort: 68,
        dstPort: 67,
        xid,
        ciaddr: '0.0.0.0',
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        giaddr: session.isRelayActive ? session.relayIp : '0.0.0.0',
        options: {
          messageType: 'DHCPDISCOVER (1)',
          leaseTime: session.leaseTimeSeconds
        },
        description: session.isRelayActive
          ? `Client sendet Broadcast an Port 67. Relay Agent (${session.relayIp}) setzt GIADDR und leitet Paket per Unicast an zentralen Server (${serverIp}) weiter.`
          : 'Client besitzt noch keine IP-Adresse und sendet Broadcast (0.0.0.0 -> 255.255.255.255:67) zur Erkennung verfügbarer DHCP-Server.'
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'SELECTING',
        history: nextHistory
      };
    }

    case 'OFFER': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'OFFER',
        sender: session.isRelayActive ? 'DHCP Server via Relay' : 'DHCP Server',
        receiver: 'Client',
        srcIp: serverIp,
        dstIp: session.isRelayActive ? session.relayIp : '255.255.255.255',
        srcPort: 67,
        dstPort: 68,
        xid,
        ciaddr: '0.0.0.0',
        yiaddr: offeredIp,
        siaddr: serverIp,
        giaddr: session.isRelayActive ? session.relayIp : '0.0.0.0',
        options: {
          messageType: 'DHCPOFFER (2)',
          subnetMask: session.subnetMask,
          router: session.isRelayActive ? session.relayIp : session.gateway,
          dns: session.dns,
          leaseTime: session.leaseTimeSeconds,
          serverIdentifier: serverIp
        },
        description: `DHCP-Server reserviert temporär ${offeredIp} und bietet Konfiguration (Subnetzmaske, Gateway, DNS, Lease ${session.leaseTimeSeconds}s) an.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        history: nextHistory
      };
    }

    case 'REQUEST': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'REQUEST',
        sender: 'Client',
        receiver: 'DHCP Server (Broadcast)',
        srcIp: '0.0.0.0',
        dstIp: '255.255.255.255',
        srcPort: 68,
        dstPort: 67,
        xid,
        ciaddr: '0.0.0.0',
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        giaddr: session.isRelayActive ? session.relayIp : '0.0.0.0',
        options: {
          messageType: 'DHCPREQUEST (3)',
          serverIdentifier: serverIp
        },
        description: `Client akzeptiert das Angebot von Server ${serverIp} und fordert ${offeredIp} verbindlich an. Gleichzeitig signalisiert der Broadcast anderen Servern, dass ihr Angebot verworfen wurde.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'REQUESTING',
        history: nextHistory
      };
    }

    case 'ACK': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'ACK',
        sender: 'DHCP Server',
        receiver: 'Client',
        srcIp: serverIp,
        dstIp: session.isRelayActive ? session.relayIp : '255.255.255.255',
        srcPort: 67,
        dstPort: 68,
        xid,
        ciaddr: '0.0.0.0',
        yiaddr: offeredIp,
        siaddr: serverIp,
        giaddr: session.isRelayActive ? session.relayIp : '0.0.0.0',
        options: {
          messageType: 'DHCPACK (5)',
          subnetMask: session.subnetMask,
          router: session.isRelayActive ? session.relayIp : session.gateway,
          dns: session.dns,
          leaseTime: session.leaseTimeSeconds,
          t1Renewal: session.t1Seconds,
          t2Rebind: session.t2Seconds
        },
        description: `Server bestätigt die Lease-Zuweisung. Client bindet ${offeredIp} an Netzwerk-Interface und startet T1-Timer (${session.t1Seconds}s) und T2-Timer (${session.t2Seconds}s). Status wechselt auf BOUND.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'BOUND',
        assignedIp: offeredIp,
        history: nextHistory
      };
    }

    case 'RENEW_T1': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'RENEW',
        sender: 'Client',
        receiver: `DHCP Server (${serverIp})`,
        srcIp: session.assignedIp || offeredIp,
        dstIp: serverIp,
        srcPort: 68,
        dstPort: 67,
        xid,
        ciaddr: session.assignedIp || offeredIp,
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        giaddr: '0.0.0.0',
        options: {
          messageType: 'DHCPREQUEST (3) [T1 Renewal]',
          serverIdentifier: serverIp
        },
        description: `Timer T1 abgelaufen (50% der Lease-Zeit): Client sendet UNICAST an leasing Server ${serverIp} zur Verlängerung der Lease.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'RENEWING',
        history: nextHistory
      };
    }

    case 'REBIND_T2': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'REBIND',
        sender: 'Client',
        receiver: 'Alle DHCP-Server (Broadcast)',
        srcIp: session.assignedIp || offeredIp,
        dstIp: '255.255.255.255',
        srcPort: 68,
        dstPort: 67,
        xid,
        ciaddr: session.assignedIp || offeredIp,
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        giaddr: '0.0.0.0',
        options: {
          messageType: 'DHCPREQUEST (3) [T2 Rebind]'
        },
        description: `Timer T2 abgelaufen (87.5% der Lease-Zeit): Keine Antwort vom ursprünglichen Server. Client sendet BROADCAST an alle erreichbaren DHCP-Server zur Rettung der Lease.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'REBINDING',
        history: nextHistory
      };
    }

    case 'RELEASE': {
      /** @type {DhcpPacket} */
      const pkt = {
        stepNum,
        phase: 'RELEASE',
        sender: 'Client',
        receiver: `DHCP Server (${serverIp})`,
        srcIp: session.assignedIp || offeredIp,
        dstIp: serverIp,
        srcPort: 68,
        dstPort: 67,
        xid,
        ciaddr: session.assignedIp || offeredIp,
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        giaddr: '0.0.0.0',
        options: {
          messageType: 'DHCPRELEASE (7)',
          serverIdentifier: serverIp
        },
        description: `Client gibt zugewiesene IP-Adresse ${session.assignedIp || offeredIp} frei. Server markiert IP im Pool wieder als verfügbar. Client wechselt in INIT.`
      };
      nextHistory.push(pkt);
      return {
        ...session,
        clientState: 'INIT',
        assignedIp: null,
        history: nextHistory
      };
    }

    default:
      return session;
  }
}

/**
 * Führt den vollständigen 4-Way DORA Handshake automatisch aus
 * @param {DhcpSession} session
 * @returns {DhcpSession}
 */
export function runFullDoraHandshake(session) {
  let s = executeDhcpAction(session, 'DISCOVER');
  s = executeDhcpAction(s, 'OFFER');
  s = executeDhcpAction(s, 'REQUEST');
  s = executeDhcpAction(s, 'ACK');
  return s;
}

/**
 * IHK-Prüfungsfragen für DHCP & DORA
 */
export const DHCP_DRILL_QUESTIONS = [
  {
    id: 'dhcp_1',
    frage: 'In welcher Reihenfolge und mit welchen Transport-Adressen läuft der 4-Way DORA-Handshake ab?',
    optionen: [
      'Discover (Unicast) -> Offer (Broadcast) -> Request (Unicast) -> Ack (Broadcast)',
      'Discover (Broadcast) -> Offer (Unicast/Broadcast) -> Request (Broadcast) -> Ack (Unicast/Broadcast)',
      'Discover (Multicast) -> Offer (Multicast) -> Request (Multicast) -> Ack (Multicast)',
      'Demand -> Order -> Response -> Approval'
    ],
    korrektIndex: 1,
    erklaerung: 'DORA steht für Discover (Broadcast 255.255.255.255), Offer (vom Server), Request (erneuter Broadcast zur Bestätigung für alle Server) und Acknowledge (finale Bestätigung).'
  },
  {
    id: 'dhcp_2',
    frage: 'Welche UDP-Portnummern verwendet DHCP standardmäßig für Client und Server?',
    optionen: [
      'Client: Port 53, Server: Port 53',
      'Client: Port 67, Server: Port 68',
      'Client: Port 68, Server: Port 67',
      'Client: Port 80, Server: Port 443'
    ],
    korrektIndex: 2,
    erklaerung: 'Nach RFC 2131 lauscht der DHCP-Server auf UDP Port 67, während der DHCP-Client auf UDP Port 68 empfängt.'
  },
  {
    id: 'dhcp_3',
    frage: 'Zu welchem Zeitpunkt sendet ein DHCP-Client standardmäßig die erste Unicast-Anfrage zur Verlängerung seiner Lease (Timer T1)?',
    optionen: [
      'Sofort nach Ablauf von 100% der Lease-Dauer.',
      'Bei 50% der vereinbarten Lease-Zeit.',
      'Bei 87,5% der Lease-Zeit (Rebind Timer T2).',
      'Jede Stunde unabhängig von der Gesamt-Lease.'
    ],
    korrektIndex: 1,
    erklaerung: 'Nach RFC 2131 ist Timer T1 (Renewal Timer) standardmäßig auf 50% (0,5 * Lease Time) gesetzt. Bei Nicht-Erreichen folgt bei 87,5% der Broadcast-Rebind Timer T2.'
  },
  {
    id: 'dhcp_4',
    frage: 'Welche Aufgabe übernimmt ein DHCP-Relay-Agent (RFC 3046 / Option 82) im Unternehmensnetzwerk?',
    optionen: [
      'Er verschlüsselt DHCP-Pakete mittels TLS 1.3 zur Abwehr von DNS Spoofing.',
      'Er leitet DHCP-Broadcasts aus fremden Subnetzen als Unicast an einen zentralen DHCP-Server weiter und trägt seine IP in das GIADDR-Feld ein.',
      'Er blockiert unberechtigte Clients mittels 802.1X Port-Security.',
      'Er vergibt automatisch IPv6-Adressen via SLAAC ohne DHCP-Server.'
    ],
    korrektIndex: 1,
    erklaerung: 'Da Router Broadcasts nicht weiterleiten, nimmt der Relay Agent den Client-Broadcast im Subnetz entgegen, setzt seine eigene Gateway-IP in das GIADDR-Feld und leitet das Paket per Unicast an den zentralen DHCP-Server weiter.'
  }
];
