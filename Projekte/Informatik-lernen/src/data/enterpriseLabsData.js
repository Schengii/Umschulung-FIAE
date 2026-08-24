// Data for Enterprise Labs: Redis Caching, Circuit Breaker & Kubernetes CNI

export const REDIS_CACHING_STRATEGIES = [
  {
    id: 'cache-aside',
    name: 'Cache-Aside (Lazy Loading)',
    desc: 'Die Anwendung liest zuerst aus dem Cache. Bei Cache Miss wird die Datenbank abgefragt und das Ergebnis für künftige Anfragen in Redis mit TTL gespeichert.',
    flow: ['1. App fragt Redis: GET user:42', '2. Cache Miss (nil)', '3. App liest Datenbank: SELECT * FROM users WHERE id=42 (85ms)', '4. App schreibt Redis: SETEX user:42 3600 {...}', '5. Nachfolgende Reads dauern nur noch 0.8ms!'],
    hitRatio: '94.2%',
    latencySaved: '84.2 ms'
  },
  {
    id: 'write-through',
    name: 'Write-Through Caching',
    desc: 'Schreibzugriffe erfolgen synchron zuerst in den Cache und direkt weiter in die Datenbank. Gewährleistet konsistente Daten, erhöht jedoch die Write-Latenz.',
    flow: ['1. App sendet Update an Cache-Layer', '2. Cache speichert neue Daten sofort', '3. Cache schreibt synchron in die Primärdatenbank', '4. Bestätigung an Client nach erfolgreichem DB-Write'],
    hitRatio: '99.1%',
    latencySaved: '72.0 ms'
  },
  {
    id: 'cache-stampede',
    name: 'Cache Stampede Defense (Distributed Lock)',
    desc: 'Wenn ein heißer Cache-Key mit hoher Last abläuft, stürmen tausende parallele Requests gleichzeitig auf die Datenbank. Lösung: Redis SET key val NX EX 10 (Mutex).',
    flow: ['1. Key läuft ab (TTL 0)', '2. 500 parallele Threads fordern Daten an', '3. Nur Thread #1 erhält den Mutex (SETNX lock:user:42)', '4. Thread #1 berechnet DB-Query und füllt Cache', '5. Andere 499 Threads warten kurz und lesen direkt aus Cache'],
    hitRatio: '100% DB-Schutz',
    latencySaved: 'Verhindert DB-Crash'
  }
];

export const CIRCUIT_BREAKER_STATES = [
  {
    state: 'CLOSED',
    color: '#22c55e',
    desc: 'Normalbetrieb. Alle Requests passieren ungehindert zum Ziel-Microservice. Fehlerrate unter 5%.',
    metrics: { requests: 1250, failures: 12, errorRate: '0.96%', status: 'HEALTHY' }
  },
  {
    state: 'OPEN',
    color: '#ef4444',
    desc: 'Ausfallschutz aktiv! Fehlerschwelle (>50%) überschritten. Requests werden sofort ohne Netzwerk-Roundtrip abgefangen und mit Fallback-Daten beantwortet.',
    metrics: { requests: 450, failures: 380, errorRate: '84.4%', status: 'TRIPPED & FAILING FAST' }
  },
  {
    state: 'HALF-OPEN',
    color: '#f59e0b',
    desc: 'Erholungsprüfung. Nach Ablauf des Sleep-Windows (z.B. 15s) lässt der Breaker eine begrenzte Test-Menge an Probe-Requests durch.',
    metrics: { requests: 10, failures: 0, errorRate: '0.0%', status: 'PROBING BACKEND HEALTH' }
  }
];

export const OPENTELEMETRY_TRACES = [
  {
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    name: 'POST /api/v1/orders/checkout',
    totalDurationMs: 68.4,
    spans: [
      { id: 'span-1', name: 'API Gateway: Route Request', service: 'api-gateway', durationMs: 4.2, status: 'OK' },
      { id: 'span-2', name: 'OrderService: CreateOrder()', service: 'order-service', durationMs: 38.1, status: 'OK' },
      { id: 'span-3', name: 'PostgreSQL: INSERT INTO orders', service: 'order-db', durationMs: 12.4, status: 'OK' },
      { id: 'span-4', name: 'PaymentService: AuthorizeCharge()', service: 'payment-service', durationMs: 24.5, status: 'OK' },
      { id: 'span-5', name: 'Kafka: Publish order.created event', service: 'kafka-broker', durationMs: 1.6, status: 'OK' }
    ]
  }
];

export const K8S_CNI_PACKET_STEPS = [
  {
    step: 1,
    location: 'Pod A (10.244.1.42)',
    layer: 'veth0 Interface',
    desc: 'Pod A sendet HTTP GET an Pod B (10.244.2.88). Linux Kernel prüft Routing Table und leitet Frame über Virtual Ethernet Pair (veth) an Host cbr0/cni0 weiter.',
    packet: 'Inner IP: Src=10.244.1.42, Dst=10.244.2.88'
  },
  {
    step: 2,
    location: 'Node 1 Host (192.168.1.10)',
    layer: 'CNI Calico / Flannel VXLAN',
    desc: 'CNI Daemon erkennt, dass Pod B auf Node 2 liegt. Der originale Ethernet-Frame wird in ein UDP-Paket gepackt (VXLAN Encapsulation, UDP Port 4789, VNI 1).',
    packet: 'Outer UDP Port 4789: Src=192.168.1.10, Dst=192.168.1.20 | VXLAN Header (VNI=1) | Inner IP: 10.244.1.42 -> 10.244.2.88'
  },
  {
    step: 3,
    location: 'Physikalisches Netzwerk (Underlay)',
    layer: 'Layer 3 Top-of-Rack Switch',
    desc: 'Das Standard-Netzwerk sieht nur normalen UDP-Traffic zwischen Node 1 und Node 2. Keine Notwendigkeit für Pod-IP Routing auf den physischen Switches.',
    packet: 'Underlay Packet routed via Gigabit Ethernet'
  },
  {
    step: 4,
    location: 'Node 2 Host (192.168.1.20)',
    layer: 'vxlan.calico / vxlan0 Interface',
    desc: 'Kernel auf Node 2 empfängt UDP Port 4789, entfernt den äußeren VXLAN-Header (Decapsulation) und leitet den originalen Inner Frame an das veth-Interface von Pod B weiter.',
    packet: 'Decapsulated Frame: Src=10.244.1.42, Dst=10.244.2.88'
  },
  {
    step: 5,
    location: 'Pod B (10.244.2.88)',
    layer: 'eth0 Application Stack',
    desc: 'Pod B empfängt das Paket mit der originalen Client-IP von Pod A. Antwort erfolgt symmetrisch über den umgekehrten VXLAN Overlay Tunnel.',
    packet: 'HTTP 200 OK Response initiated'
  }
];
