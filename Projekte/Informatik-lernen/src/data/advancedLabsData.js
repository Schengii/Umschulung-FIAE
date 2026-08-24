// Data for Advanced CI/CD Matrix, Postgres Query Tree & WebRTC Signaling Labs

export const CICD_YAML_TEMPLATES = [
  {
    id: 'matrix-fullstack',
    title: 'Multi-OS & Node Matrix Build Pipeline',
    description: 'Automatische Cross-Platform Tests auf Ubuntu, Windows und macOS mit Node 18, 20 & 22.',
    yaml: `name: CI Matrix Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-matrix:
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x, 22.x]
        
    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🔍 Run Linter & Typecheck
        run: npm run lint

      - name: 🧪 Execute Unit & Integration Tests
        run: npm test -- --coverage

      - name: 🚀 Build Production Bundle
        run: npm run build`,
    matrixVariants: [
      { id: 'u18', os: 'ubuntu-latest', node: '18.x', status: 'success', duration: '24s' },
      { id: 'u20', os: 'ubuntu-latest', node: '20.x', status: 'success', duration: '18s' },
      { id: 'u22', os: 'ubuntu-latest', node: '22.x', status: 'success', duration: '16s' },
      { id: 'w18', os: 'windows-latest', node: '18.x', status: 'success', duration: '42s' },
      { id: 'w20', os: 'windows-latest', node: '20.x', status: 'success', duration: '35s' },
      { id: 'w22', os: 'windows-latest', node: '22.x', status: 'success', duration: '31s' },
      { id: 'm18', os: 'macos-latest', node: '18.x', status: 'success', duration: '28s' },
      { id: 'm20', os: 'macos-latest', node: '20.x', status: 'success', duration: '22s' },
      { id: 'm22', os: 'macos-latest', node: '22.x', status: 'success', duration: '19s' }
    ]
  },
  {
    id: 'docker-k8s-deploy',
    title: 'Docker Build, Security Scan & K8s Deploy',
    description: 'Baut ein Docker OCI Image, führt Trivy Vulnerability Scans durch und rollt auf Kubernetes aus.',
    yaml: `name: Build, Scan & Deploy

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  security-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 🔒 Run Trivy Vulnerability Scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

      - name: 🐳 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔑 Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: 🚀 Build and Push OCI Image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/company/api:latest`,
    matrixVariants: [
      { id: 'deploy-prod', os: 'ubuntu-latest', node: 'K8s Runner', status: 'success', duration: '48s' }
    ]
  }
];

export const POSTGRES_EXPLAIN_PLANS = [
  {
    id: 'ecommerce-analytics',
    title: 'Complex Order & Customer Analytics Query',
    query: `EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
SELECT c.name, COUNT(o.id) AS order_count, SUM(o.total_amount) AS revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= '2026-01-01' AND c.country = 'DE'
GROUP BY c.id, c.name
ORDER BY revenue DESC LIMIT 10;`,
    totalTimeMs: 14.82,
    totalCost: 1420.50,
    planTree: {
      nodeType: 'Limit',
      cost: '1420.25..1420.50',
      actualRows: 10,
      actualTime: '14.80..14.82',
      children: [
        {
          nodeType: 'Sort (ORDER BY revenue DESC)',
          cost: '1410.00..1420.25',
          actualRows: 10,
          actualTime: '14.75..14.79',
          sortMethod: 'quicksort (In-Memory: 45kB)',
          children: [
            {
              nodeType: 'HashAggregate (GROUP BY c.id, c.name)',
              cost: '1250.00..1380.00',
              actualRows: 420,
              actualTime: '11.20..14.10',
              children: [
                {
                  nodeType: 'Hash Join (c.id = o.customer_id)',
                  cost: '45.00..1120.00',
                  actualRows: 2850,
                  actualTime: '2.10..9.45',
                  joinType: 'Inner Join',
                  children: [
                    {
                      nodeType: 'Bitmap Heap Scan on orders o',
                      cost: '20.00..650.00',
                      actualRows: 3100,
                      actualTime: '0.85..4.20',
                      filter: "created_at >= '2026-01-01'",
                      children: [
                        {
                          nodeType: 'Bitmap Index Scan on idx_orders_created_at',
                          cost: '0.00..18.50',
                          actualRows: 3100,
                          actualTime: '0.45..0.45',
                          indexName: 'idx_orders_created_at (B-Tree)'
                        }
                      ]
                    },
                    {
                      nodeType: 'Hash (customers c)',
                      cost: '15.00..15.00',
                      actualRows: 850,
                      actualTime: '1.10..1.10',
                      children: [
                        {
                          nodeType: 'Index Scan on customers c',
                          cost: '0.00..15.00',
                          actualRows: 850,
                          actualTime: '0.15..0.95',
                          indexName: 'idx_customers_country (c.country = \'DE\')'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

export const WEBRTC_SIGNALING_STEPS = [
  {
    step: 1,
    title: '1. Lokale Medienerfassung (MediaStream)',
    actor: 'Peer Alice',
    protocol: 'WebRTC navigator.mediaDevices',
    latency: '5 ms',
    desc: 'Alice fordert Zugriff auf Kamera & Mikrofon an: getUserMedia({ video: true, audio: true }).',
    technical: 'Erzeugt lokalen MediaStream mit H.264 / VP9 Video-Track und Opus Audio-Track.'
  },
  {
    step: 2,
    title: '2. PeerConnection & SDP Offer Erstellung',
    actor: 'Peer Alice',
    protocol: 'RTCPeerConnection.createOffer()',
    latency: '15 ms',
    desc: 'Alice initialisiert die RTCPeerConnection und erstellt eine SDP (Session Description Protocol) Offer.',
    technical: 'SDP enthält: m=audio 9 UDP/TLS/RTP/SAVPF 111 (Opus) | a=fingerprint:sha-256 ... | a=ice-ufrag:x89a'
  },
  {
    step: 3,
    title: '3. STUN Server ICE Candidate Discovery',
    actor: 'STUN Server (stun:stun.l.google.com:19302)',
    protocol: 'STUN Binding Request (UDP)',
    latency: '22 ms',
    desc: 'Alice fragt den STUN Server: "Welche öffentliche IP/Port habe ich hinter meinem NAT-Router?"',
    technical: 'STUN antwortet mit XOR-MAPPED-ADDRESS: 203.0.113.45:51820 (Server-Reflexive Candidate srflx).'
  },
  {
    step: 4,
    title: '4. Signalisierung: Offer & ICE an Bob senden',
    actor: 'Signaling Server (WebSocket)',
    protocol: 'WebSocket JSON Message',
    latency: '18 ms',
    desc: 'Über einen WebSocket/SIP Server übermittelt Alice ihr SDP Offer und die gesammelten ICE-Kandidaten an Bob.',
    technical: 'WebSocket Payload: { type: "offer", sdp: "v=0...", candidates: ["candidate:1 1 UDP ..."] }'
  },
  {
    step: 5,
    title: '5. Bob empfängt Offer & erzeugt SDP Answer',
    actor: 'Peer Bob',
    protocol: 'setRemoteDescription() & createAnswer()',
    latency: '16 ms',
    desc: 'Bob setzt Alices Offer als RemoteDescription, bindet seinen lokalen Stream ein und erstellt die SDP Answer.',
    technical: 'Bob sendet SDP Answer { type: "answer" } und seine eigenen Host-/STUN-Kandidaten über den Signaling Server.'
  },
  {
    step: 6,
    title: '6. ICE Connectivity Check & DTLS Handshake',
    actor: 'Alice <-> Bob (Direkt P2P)',
    protocol: 'ICE Binding Request & DTLS 1.2/1.3',
    latency: '25 ms',
    desc: 'Beide Peers testen die Kandidaten-Paare (ICE Checks). Sobald die schnellste Route steht, erfolgt der DTLS Key Exchange.',
    technical: 'DTLS generiert SRTP-Sitzungsschlüssel für hardwarebeschleunigte Ende-zu-Ende Verschlüsselung (AES-128-GCM).'
  },
  {
    step: 7,
    title: '7. Etablierter P2P Stream & RTCDataChannel',
    actor: 'Alice <-> Bob',
    protocol: 'SRTP (Audio/Video) & SCTP (DataChannel)',
    latency: '8 ms (Direct P2P)',
    desc: 'Glückwunsch! Der Video-Stream und bidirektionale RTCDataChannel laufen mit minimaler Latenz ohne Server-Relay.',
    technical: 'Bidirektionale Datenübertragung mit 60 FPS 1080p Video + ultra-low latency Byte Streams.'
  }
];
