import { Globe, Network, Radio, Route, ShieldAlert, Zap } from 'lucide-react';

export const networkModules = [
  {
    id: 'stp_protocol_lab',
    title: 'IEEE 802.1D / 802.1w Spanning Tree Protocol (STP & RSTP) Studio',
    category: 'network',
    tags: ['#STP', '#RSTP', '#8021D', '#8021w', '#RootBridge', '#PortRoles', '#BridgeID', '#FISI', '#AP1', '#IHKPrüfung'],
    difficulty: 'Intermediate',
    desc: 'Root-Bridge-Wahl (Priority + MAC), Pfadkosten (10G/1G/100M), Port-Rollen (Root, Designated, Alternate), Loop-Auflösung und STP (30-50s) vs. RSTP (<1s) Konvergenzvergleich.',
    icon: Network,
    badge: 'IHK Neu',
    color: '#4338ca'
  },
  {
    id: 'nat_pat_lab',
    title: 'RFC 3022 / RFC 2663 NAT, PAT & Port-Forwarding Studio',
    category: 'network',
    tags: ['#NAT', '#PAT', '#PortOverload', '#SNAT', '#DNAT', '#RFC1918', '#Netzwerk', '#FISI', '#IHKPrüfung'],
    difficulty: 'Intermediate',
    desc: 'Header-Transformation im Router: Inside Local zu Inside Global, dynamische PAT-Portvergabe, Live NAT Translation Table und RFC 1918 Adressraum-Prüfung.',
    icon: Network,
    badge: 'IHK Neu',
    color: '#0ea5e9'
  },
  {
    id: 'vlan_trunking_lab',
    title: 'IEEE 802.1Q VLAN, Trunking & Router-on-a-Stick Studio',
    category: 'network',
    tags: ['#VLAN', '#8021Q', '#Trunking', '#NativeVLAN', '#RouterOnAStick', '#Subinterfaces', '#Switching', '#FISI'],
    difficulty: 'Intermediate',
    desc: '4-Byte 802.1Q Tag-Bitfeldrechner (TPID 0x8100, PCP QoS, DEI, 12-Bit VID), Access- vs. Trunk-Port-Simulation und Cisco Router-on-a-Stick CLI-Konfigurationsgenerator.',
    icon: Route,
    badge: 'IHK Neu',
    color: '#8b5cf6'
  },
  {
    id: 'dhcp_dora_lab',
    title: 'RFC 2131 DHCP DORA & Relay-Agent Studio',
    category: 'network',
    tags: ['#DHCP', '#RFC2131', '#DORA', '#RelayAgent', '#GIADDR', '#UDP67', '#UDP68', '#LeaseTime', '#Netzwerk'],
    difficulty: 'Intermediate',
    desc: '4-Way DORA Handshake (Discover -> Offer -> Request -> Ack), Lease-Time Lifecycle (T1 50% Renewal & T2 87.5% Rebind) und GIADDR Relay Agent Routing.',
    icon: Network,
    badge: 'IHK Neu',
    color: '#0ea5e9'
  },
  {
    id: 'tcp_state_machine_lab',
    title: 'TCP Connection State Machine & 3-Way Handshake Studio',
    category: 'network',
    tags: ['#TCP', '#RFC793', '#Handshake', '#SYN', '#ACK', '#FIN', '#TIME_WAIT', '#Netzwerk', '#TransportLayer'],
    difficulty: 'Intermediate',
    desc: 'Interaktiver RFC 793 Zustandsautomat: 3-Way Handshake (SYN -> SYN-ACK -> ACK), Datenfluss mit PSH/ACK, 4-Way Teardown (FIN -> ACK -> FIN -> ACK) und TIME_WAIT 2MSL Timer.',
    icon: Network,
    badge: 'Neu',
    color: '#06b6d4'
  },
  {
    id: 'bgp_anycast_ddos_lab',
    title: 'BGP Anycast & DDoS Flow-Scrubber Studio',
    category: 'network',
    tags: ['#BGP', '#Anycast', '#DDoS', '#Scrubber', '#SYN_Cookies', '#FlowSpec', '#EdgePoP', '#Failover'],
    difficulty: 'Advanced',
    desc: 'Weltweite Ingress-Verkehrsverteilung über Edge-PoPs (Frankfurt, Amsterdam, New York, Tokio), SYN-Cookies, FlowSpec-Filterung und BGP Anycast Route-Withdrawal.',
    icon: ShieldAlert,
    badge: 'Neu',
    color: '#f43f5e'
  },
  {
    id: 'routing_dijkstra_lab',
    title: 'Routing-Algorithmen: Dijkstra (SPF) & Spanning Tree (STP)',
    category: 'network',
    tags: ['#OSPF', '#Dijkstra', '#STP', '#IEEE802_1D', '#ShortestPath', '#LoopPrevention', '#BridgeID'],
    difficulty: 'Advanced',
    desc: 'Interaktive Simulation von OSPF Shortest Path First (Dijkstra) und Spanning Tree Protocol (STP) zur Verhinderung von Switching-Loops und Broadcast-Storms.',
    icon: Route,
    badge: 'Neu',
    color: '#06b6d4'
  },
  {
    id: 'http_caching_lab',
    title: 'HTTP Caching Studio (RFC 9111): Cache-Control & ETag 304',
    category: 'network',
    tags: ['#HTTP', '#Caching', '#RFC9111', '#ETag', '#304NotModified', '#maxAge', '#noCache', '#noStore'],
    difficulty: 'Intermediate',
    desc: 'Browser- und Reverse-Proxy Caching nach RFC 9111: max-age, no-cache vs. no-store, bedingte Anfragen mit If-None-Match und 0-Byte 304 Revalidierung.',
    icon: Zap,
    badge: 'Neu',
    color: '#eab308'
  },
  {
    id: 'dns_privacy_lab',
    title: 'DNS Privacy Inspector: DoH & DoT vs. Port 53',
    category: 'network',
    tags: ['#DNS', '#DoH', '#DoT', '#RFC8484', '#RFC7858', '#TLS', '#Privacy', '#ISP'],
    difficulty: 'Intermediate',
    desc: 'RFC 8484 DNS-over-HTTPS & RFC 7858 DNS-over-TLS Wire-Format-Analyse, ISP-Eavesdropping Abwehr und TLS-Verschlüsselung im Vergleich.',
    icon: Globe,
    badge: 'Neu',
    color: '#3b82f6'
  },
  {
    id: 'webrtc_ice_gathering_lab',
    title: 'WebRTC STUN/TURN & ICE Candidate Gathering',
    category: 'network',
    tags: ['#WebRTC', '#ICE', '#RFC8445', '#STUN', '#TURN', '#SymmetricNAT', '#P2P'],
    difficulty: 'Advanced',
    desc: 'RFC 8445 Candidate Gathering (Host, Server Reflexive, Relay), NAT-Traversal & automatischer TURN Fallback.',
    icon: Radio,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'bgp_path_selection_lab',
    title: 'BGP Path Selection & Decision Studio',
    category: 'network',
    tags: ['#BGP', '#RFC4271', '#Weight', '#LocalPref', '#ASPath', '#MED', '#Routing', '#FISI'],
    difficulty: 'Advanced',
    desc: 'RFC 4271 8-Stufen-Entscheidungsprozess: Weight, Local Preference, AS-Path-Länge, Origin, MED, eBGP/iBGP & Router-ID.',
    icon: Network,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'linux_netns_lab',
    title: 'Linux Network Namespaces, veth & Bridge Studio',
    category: 'network',
    tags: ['#Linux', '#Namespaces', '#veth', '#Bridge', '#iptables', '#NAT', '#Container'],
    difficulty: 'Advanced',
    desc: 'Container-Netzwerkgrundlagen: Virtual Ethernet Pairs, br0 Switching & iptables MASQUERADE.',
    icon: Network,
    badge: 'Neu',
    color: '#3b82f6'
  },
  {
    id: 'ipv6_ndp_lab',
    title: 'IPv6 SLAAC, DHCPv6 & NDP Inspector',
    category: 'network',
    tags: ['#IPv6', '#SLAAC', '#NDP', '#EUI64', '#PrivacyExtensions', '#DHCPv6', '#FISI'],
    difficulty: 'Advanced',
    desc: 'RFC 4861 Neighbor Discovery Protocol, invertiertes EUI-64 u/l Bit & RFC 8981 Privacy Extensions Simulation.',
    icon: Network,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'vlsm_subnet',
    title: 'VLSM Subnet Splitter & IP-Planer',
    category: 'network',
    tags: ['#VLSM', '#Subnetting', '#CIDR', '#IPv4', '#Netzwerk', '#FISI'],
    difficulty: 'Intermediate',
    desc: 'Hierarchische IPv4-Subnetzaufteilung nach Host-Bedarf ohne Adressraum-Verschwendung.',
    icon: Network,
    badge: 'IHK Neu',
    color: '#d97706'
  },
  {
    id: 'transfer_time_lab',
    title: 'IHK Übertragungszeit- & Bandbreiten-Rechner',
    category: 'network',
    tags: ['#Bandbreite', '#Übertragungszeit', '#AP1', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Dateigröße, Bandbreite und Übertragungsdauer berechnen (Bit/Byte, Protokoll-Overhead).',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'packet_sniffer',
    title: 'Web-Wireshark Packet Sniffer',
    category: 'network',
    tags: ['#Wireshark', '#Packet', '#Sniffer', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Frame Dissection, Hex Dump & Display Filter',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'subnetting',
    title: 'Subnetting-Trainer (IPv4)',
    category: 'network',
    tags: ['#Subnetting', '#IPv4', '#CIDR', '#AP1', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Subnetzmasken, Netz-/Broadcast-Adressen und Hostbereiche berechnen und üben.',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'packet_tracer',
    title: 'Network Packet Tracer',
    category: 'network',
    tags: ['#Network', '#Packet', '#Tracer', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Route Visualizer & Ping-Simulation',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'websocket_protocol',
    title: 'WebSockets & Real-Time Protokoll',
    category: 'network',
    tags: ['#WebSockets', '#Real', '#Time', '#Protokoll', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Handshake, Frames & Ping/Pong',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'websockets',
    title: 'WebSockets Grundlagen',
    category: 'network',
    tags: ['#WebSockets', '#Grundlagen', '#NETWORK'],
    difficulty: 'Beginner',
    desc: 'HTTP-101-Handshake & TCP-Duplex-Verbindung',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'webrtc_peer_studio',
    title: 'WebRTC P2P & DataChannel Studio',
    category: 'network',
    tags: ['#WebRTC', '#DataChannel', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'SDP Offer/Answer, STUN/TURN & Live Impairment Chat',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'ebpf_xdp_lab',
    title: 'Linux eBPF & XDP Packet Filter',
    category: 'network',
    tags: ['#Linux', '#eBPF', '#Packet', '#Filter', '#NETWORK'],
    difficulty: 'Advanced',
    desc: 'Kernel Verifier, XDP_DROP & JIT Engine',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'webrtc_sfu_lab',
    title: 'WebRTC Media Server (SFU/MCU)',
    category: 'network',
    tags: ['#WebRTC', '#Media', '#Server', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Simulcast Routing vs. P2P-Mesh',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'linux_bridge_vxlan_lab',
    title: 'Linux Bridge & VXLAN Overlay',
    category: 'network',
    tags: ['#Linux', '#Bridge', '#VXLAN', '#Overlay', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'veth-Paare, br0 FDB & UDP 4789 Tunnel',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'bgp_anycast_lab',
    title: 'Linux BGP Routing & Anycast',
    category: 'network',
    tags: ['#Linux', '#Routing', '#Anycast', '#NETWORK'],
    difficulty: 'Advanced',
    desc: 'eBGP/iBGP Peering, AS-Path & Anycast IP',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'grpc_protobuf_lab',
    title: 'gRPC Protocol Buffers Studio',
    category: 'network',
    tags: ['#gRPC', '#Protocol', '#Buffers', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Proto3 Schema, Wire Varints & HTTP/2',
    icon: Zap,
    color: '#0369a1'
  },
  {
    id: 'api_studio',
    title: 'REST vs GraphQL API Studio',
    category: 'network',
    tags: ['#REST', '#GraphQL', '#NETWORK'],
    difficulty: 'Intermediate',
    desc: 'Endpunkte testen & HTTP-Status-Codes live',
    icon: Zap,
    color: '#0369a1'
  }
];
