// @ts-check
/**
 * @file vlanTrunkingEngine.js
 * IEEE 802.1Q VLAN & Trunking Protocol Engine.
 * Simuliert 802.1Q Ethernet Frame Tagging (TPID, PCP, DEI, VID),
 * Access- vs. Trunk-Ports, Native VLAN und Router-on-a-Stick Inter-VLAN Routing.
 */

/**
 * @typedef {object} VlanDefinition
 * @property {number} id - 1 bis 4094
 * @property {string} name
 * @property {string} subnet
 * @property {string} color
 * @property {string} purpose
 */

/**
 * @typedef {object} SwitchPortConfig
 * @property {string} id - z.B. 'Fa0/1'
 * @property {'access' | 'trunk'} mode
 * @property {number} [accessVlan] - Nur für Access-Ports
 * @property {number[]} [allowedVlans] - Für Trunk-Ports
 * @property {number} [nativeVlan] - Standard 1
 */

/**
 * @typedef {object} EthernetFrame
 * @property {string} srcMac
 * @property {string} dstMac
 * @property {number | null} vlanTag - VID wenn getaggt, sonst null (untagged)
 * @property {number} [pcp] - 0-7 (Priority Code Point)
 * @property {number} [dei] - 0 oder 1 (Drop Eligible Indicator)
 * @property {string} ethertype - '0x0800' (IPv4) oder '0x8100' (802.1Q)
 * @property {string} payload
 */

/**
 * Standard IHK VLAN-Setup im Firmennetzwerk
 * @type {VlanDefinition[]}
 */
export const DEFAULT_VLANS = [
  { id: 1, name: 'Default / Management', subnet: '192.168.1.0/24', color: '#64748b', purpose: 'Standard Native VLAN und Switch-Management' },
  { id: 10, name: 'Entwicklung (Dev)', subnet: '192.168.10.0/24', color: '#3b82f6', purpose: 'FIAE Arbeitsplätze & lokale Testserver' },
  { id: 20, name: 'Verwaltung / HR', subnet: '192.168.20.0/24', color: '#10b981', purpose: 'Buchhaltung, Personalwesen & Datenschutz-Zone' },
  { id: 30, name: 'Gäste-WLAN', subnet: '172.16.30.0/24', color: '#f59e0b', purpose: 'Isoliertes Besucher-Netzwerk ohne Zugriff auf interne Server' }
];

/**
 * Berechnet die Bitfelder des 4-Byte IEEE 802.1Q Tags
 * @param {number} vid - 1 bis 4094
 * @param {number} pcp - 0 bis 7 (QoS Priorität)
 * @param {number} dei - 0 oder 1 (Drop Eligibility)
 * @returns {{
 *   tpid: string,
 *   tpidHex: string,
 *   pcp: number,
 *   dei: number,
 *   vid: number,
 *   tagHex: string,
 *   isValid: boolean,
 *   error?: string
 * }}
 */
export function build8021qTag(vid, pcp = 0, dei = 0) {
  if (vid < 1 || vid > 4094) {
    return {
      tpid: '0x8100',
      tpidHex: '8100',
      pcp,
      dei,
      vid,
      tagHex: 'INVALID',
      isValid: false,
      error: `Ungültige VLAN ID ${vid}. Gültiger 802.1Q Bereich ist 1 bis 4094 (12 Bit).`
    };
  }

  // TCI (Tag Control Information) = 16 Bit: [3 Bit PCP][1 Bit DEI][12 Bit VID]
  const tci = ((pcp & 0x07) << 13) | ((dei & 0x01) << 12) | (vid & 0x0fff);
  const tagHex = `8100${tci.toString(16).padStart(4, '0').toUpperCase()}`;

  return {
    tpid: '0x8100',
    tpidHex: '8100',
    pcp,
    dei,
    vid,
    tagHex,
    isValid: true
  };
}

/**
 * Simuliert das Weiterleiten eines Frames durch einen Switch-Port (Ingress & Egress)
 * @param {EthernetFrame} frame
 * @param {SwitchPortConfig} ingressPort
 * @param {SwitchPortConfig} egressPort
 * @returns {{
 *   forwarded: boolean,
 *   outputFrame: EthernetFrame | null,
 *   assignedVlan: number,
 *   isEgressTagged: boolean,
 *   explanation: string
 * }}
 */
export function processFrameForwarding(frame, ingressPort, egressPort) {
  // 1. Ingress-Bewertung: Welchem VLAN gehört der Frame an?
  let assignedVlan = 1;

  if (ingressPort.mode === 'access') {
    assignedVlan = ingressPort.accessVlan || 1;
  } else if (ingressPort.mode === 'trunk') {
    if (frame.vlanTag !== null) {
      assignedVlan = frame.vlanTag;
    } else {
      assignedVlan = ingressPort.nativeVlan || 1;
    }
  }

  // 2. Egress-Prüfung: Darf der Frame auf dem Ziel-Port den Switch verlassen?
  if (egressPort.mode === 'access') {
    if ((egressPort.accessVlan || 1) !== assignedVlan) {
      return {
        forwarded: false,
        outputFrame: null,
        assignedVlan,
        isEgressTagged: false,
        explanation: `VERWORFEN: Frame gehört zu VLAN ${assignedVlan}, aber Port ${egressPort.id} ist Access-Port für VLAN ${egressPort.accessVlan}. Keine Broadcast-Weiterleitung über VLAN-Grenzen!`
      };
    }

    // Access-Ports senden IMMER untagged an Endgeräte
    const outputFrame = {
      ...frame,
      vlanTag: null,
      ethertype: '0x0800'
    };

    return {
      forwarded: true,
      outputFrame,
      assignedVlan,
      isEgressTagged: false,
      explanation: `WEITERGELEITET: Frame im Access-Port ${egressPort.id} für VLAN ${assignedVlan} zugestellt. 802.1Q-Header wurde vor dem Endgerät entfernt.`
    };
  } else {
    // Egress ist Trunk
    const allowed = egressPort.allowedVlans || [1, 10, 20, 30];
    if (!allowed.includes(assignedVlan)) {
      return {
        forwarded: false,
        outputFrame: null,
        assignedVlan,
        isEgressTagged: false,
        explanation: `VERWORFEN: VLAN ${assignedVlan} ist auf dem Trunk-Port ${egressPort.id} nicht in den allowed-VLANs zugelassen.`
      };
    }

    const isNative = assignedVlan === (egressPort.nativeVlan || 1);
    const outputFrame = {
      ...frame,
      vlanTag: isNative ? null : assignedVlan,
      ethertype: isNative ? '0x0800' : '0x8100'
    };

    return {
      forwarded: true,
      outputFrame,
      assignedVlan,
      isEgressTagged: !isNative,
      explanation: isNative
        ? `WEITERGELEITET: VLAN ${assignedVlan} ist das Native VLAN des Trunks. Frame wird ungetaggt übermittelt.`
        : `WEITERGELEITET: Frame wird mit 802.1Q Tag (VID ${assignedVlan}) über den Trunk-Port ${egressPort.id} gesendet.`
    };
  }
}

/**
 * IHK Prüfungsdrill Fragen für IEEE 802.1Q & VLANs
 */
export const VLAN_DRILL_QUESTIONS = [
  {
    id: 'vlan_1',
    frage: 'Wie viele Bits umfasst das VLAN Identifier (VID) Feld im IEEE 802.1Q Tag und wie viele nutzbare VLANs ergeben sich daraus maximal?',
    optionen: [
      '8 Bit = 256 VLANs',
      '12 Bit = 4.094 nutzbare VLANs (0 und 4095 reserviert)',
      '16 Bit = 65.536 VLANs',
      '4 Bit = 16 VLANs'
    ],
    korrektIndex: 1,
    erklaerung: 'Das VID-Feld ist exakt 12 Bit groß (2^12 = 4.096 Werte). VLAN 0 und 4095 sind reserviert, sodass 4.094 nutzbare VLANs (1 bis 4094) zur Verfügung stehen.'
  },
  {
    id: 'vlan_2',
    frage: 'Welche Aufgabe hat das "Native VLAN" auf einem IEEE 802.1Q Trunk-Port?',
    optionen: [
      'Es verschlüsselt alle getaggten Frames mit AES-256.',
      'Es transportiert ungetaggte Frames über den Trunk, ohne dass ein 802.1Q Header eingefügt wird.',
      'Es verhindert, dass Switche über Spanning Tree kommunizieren können.',
      'Es dient ausschließlich zur Zuweisung von IPv6-Adressen.'
    ],
    korrektIndex: 1,
    erklaerung: 'Auf einem 802.1Q Trunk werden Frames des Native VLANs standardmäßig ungetaggt übertragen (Standard ist meist VLAN 1). Beide Seiten des Trunks müssen dasselbe Native VLAN konfiguriert haben.'
  },
  {
    id: 'vlan_3',
    frage: 'Was versteht man in der Netzwerktechnik unter dem Verfahren "Router-on-a-Stick"?',
    optionen: [
      'Ein Router mit USB-Stick zur Firmware-Wiederherstellung.',
      'Inter-VLAN Routing über ein einziges physisches Router-Interface mit mehreren logischen 802.1Q Subinterfaces (z.B. g0/0.10, g0/0.20).',
      'Ein redundantes Router-Paar mit HSRP/VRRP.',
      'Das drahtlose Routing zwischen mobilen Access Points.'
    ],
    korrektIndex: 1,
    erklaerung: 'Bei Router-on-a-Stick verbindet ein einziger Trunk-Link den Switch mit dem Router. Am Router werden virtuelle Subinterfaces (z.B. g0/0.10) mit 802.1Q Encapsulation konfiguriert, die als Standard-Gateway für die jeweiligen VLANs dienen.'
  },
  {
    id: 'vlan_4',
    frage: 'Warum kann ein PC in VLAN 10 standardmäßig keinen Ping an einen PC in VLAN 20 auf demselben Switch senden?',
    optionen: [
      'Weil VLANs separate Broadcast-Domänen auf Layer 2 bilden und Datenverkehr zwischen verschiedenen VLANs ein Layer-3 Gerät (Router/L3-Switch) erfordert.',
      'Weil die Netzwerkkabel für verschiedene VLANs unterschiedliche Kupferstärken haben müssen.',
      'Weil der Switch den zweiten PC automatisch sperrt (Port Security MAC Flooding).',
      'Weil Ping nur innerhalb von Subnetzen mit /24 Maske erlaubt ist.'
    ],
    korrektIndex: 0,
    erklaerung: 'VLANs isolieren Layer-2 Broadcast-Domänen vollständig voneinander. Um Pakete zwischen zwei verschiedenen VLANs weiterzuleiten, muss geroutet werden (Layer 3).'
  }
];
