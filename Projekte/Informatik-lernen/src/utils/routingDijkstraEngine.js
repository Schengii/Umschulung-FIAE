// @ts-check
/**
 * @file routingDijkstraEngine.js
 * Algorithmen- und Routing-Engine für Dijkstra (OSPF Link-State) & Spanning Tree Protocol (STP / IEEE 802.1D)
 */

/**
 * @typedef {object} TopologyNode
 * @property {string} id
 * @property {string} label
 * @property {number} x
 * @property {number} y
 * @property {number} priority - STP Bridge Priority (z.B. 32768, 4096)
 * @property {string} mac - MAC-Adresse für STP Tie-Breaking
 */

/**
 * @typedef {object} TopologyEdge
 * @property {string} id
 * @property {string} from
 * @property {string} to
 * @property {number} cost - OSPF Link Cost / Metrik (z.B. 10Gbps=1, 1Gbps=4, 100Mbps=19)
 * @property {string} [bandwidth] - z.B. '1 Gbps', '100 Mbps'
 */

/**
 * Standard OSPF Link-State / STP Netzwerk-Topologie
 * @type {{ nodes: TopologyNode[], edges: TopologyEdge[] }}
 */
export const DEFAULT_NETWORK_TOPOLOGY = {
  nodes: [
    { id: 'R1', label: 'Router 1 (Core)', x: 100, y: 150, priority: 4096, mac: '00:11:22:33:44:01' },
    { id: 'R2', label: 'Router 2 (Dist-A)', x: 260, y: 70, priority: 32768, mac: '00:11:22:33:44:02' },
    { id: 'R3', label: 'Router 3 (Dist-B)', x: 260, y: 230, priority: 32768, mac: '00:11:22:33:44:03' },
    { id: 'R4', label: 'Router 4 (Access-1)', x: 420, y: 70, priority: 32768, mac: '00:11:22:33:44:04' },
    { id: 'R5', label: 'Router 5 (Access-2)', x: 420, y: 230, priority: 32768, mac: '00:11:22:33:44:05' },
    { id: 'R6', label: 'Router 6 (Edge/WAN)', x: 580, y: 150, priority: 61440, mac: '00:11:22:33:44:06' }
  ],
  edges: [
    { id: 'e1', from: 'R1', to: 'R2', cost: 4, bandwidth: '1 Gbps' },
    { id: 'e2', from: 'R1', to: 'R3', cost: 10, bandwidth: '100 Mbps' },
    { id: 'e3', from: 'R2', to: 'R3', cost: 2, bandwidth: '10 Gbps' },
    { id: 'e4', from: 'R2', to: 'R4', cost: 6, bandwidth: '1 Gbps' },
    { id: 'e5', from: 'R3', to: 'R5', cost: 3, bandwidth: '1 Gbps' },
    { id: 'e6', from: 'R4', to: 'R5', cost: 8, bandwidth: '100 Mbps' },
    { id: 'e7', from: 'R4', to: 'R6', cost: 5, bandwidth: '1 Gbps' },
    { id: 'e8', from: 'R5', to: 'R6', cost: 2, bandwidth: '10 Gbps' }
  ]
};

/**
 * Berechnet Schritt-für-Schritt den kürzesten Pfad mit Dijkstra (OSPF SPF)
 * @param {TopologyNode[]} nodes
 * @param {TopologyEdge[]} edges
 * @param {string} startNodeId
 * @param {string} targetNodeId
 * @returns {{
 *   distances: Record<string, number>,
 *   previous: Record<string, string | null>,
 *   path: string[],
 *   totalCost: number,
 *   steps: Array<{ current: string, visited: string[], unvisited: string[], distances: Record<string, number>, note: string }>
 * }}
 */
export function calculateDijkstra(nodes, edges, startNodeId, targetNodeId) {
  /** @type {Record<string, number>} */
  const distances = {};
  /** @type {Record<string, string | null>} */
  const previous = {};
  const unvisited = new Set(nodes.map(n => n.id));
  const visited = new Set();
  /** @type {Array<{ current: string, visited: string[], unvisited: string[], distances: Record<string, number>, note: string }>} */
  const steps = [];

  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
  });

  // Nachbarschafts-Adjazenz
  /** @type {Record<string, Array<{ neighbor: string, cost: number }>>} */
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.from]?.push({ neighbor: e.to, cost: e.cost });
    adj[e.to]?.push({ neighbor: e.from, cost: e.cost });
  });

  while (unvisited.size > 0) {
    // Knoten mit minimaler Distanz wählen
    let current = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        current = nodeId;
      }
    }

    if (!current || minDistance === Infinity) {
      break; // Restliche Knoten unerreichbar
    }

    unvisited.delete(current);
    visited.add(current);

    steps.push({
      current,
      visited: Array.from(visited),
      unvisited: Array.from(unvisited),
      distances: { ...distances },
      note: `Untersuche Knoten ${current} (aktuelle SPF-Kosten: ${distances[current] === Infinity ? '∞' : distances[current]})`
    });

    if (current === targetNodeId) {
      break;
    }

    // Nachbarn entspannen (Relaxation)
    for (const { neighbor, cost } of adj[current] || []) {
      if (unvisited.has(neighbor)) {
        const alt = distances[current] + cost;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
        }
      }
    }
  }

  // Pfad rekonstruieren
  /** @type {string[]} */
  const path = [];
  let curr = targetNodeId;
  if (distances[targetNodeId] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr] || '';
    }
  }

  return {
    distances,
    previous,
    path,
    totalCost: distances[targetNodeId] === Infinity ? -1 : distances[targetNodeId],
    steps
  };
}

/**
 * Berechnet den Spanning Tree nach IEEE 802.1D STP (Root Bridge, Root Ports, Designated Ports, Blocking Ports)
 * @param {TopologyNode[]} nodes
 * @param {TopologyEdge[]} edges
 * @returns {{
 *   rootBridgeId: string,
 *   forwardingEdges: string[],
 *   blockedEdges: string[],
 *   nodeRoles: Record<string, { isRootBridge: boolean, costToRoot: number, rootPortEdgeId: string | null }>
 * }}
 */
export function calculateSpanningTree(nodes, edges) {
  // 1. Root Bridge Wahl: Kleinste Priority; bei Gleichstand kleinste MAC
  let rootNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    const candidate = nodes[i];
    if (
      candidate.priority < rootNode.priority ||
      (candidate.priority === rootNode.priority && candidate.mac < rootNode.mac)
    ) {
      rootNode = candidate;
    }
  }

  // 2. Kürzeste Pfade von allen Switches zur Root Bridge (Dijkstra)
  const rootDijkstra = calculateDijkstra(nodes, edges, rootNode.id, nodes[nodes.length - 1].id);

  /** @type {Record<string, { isRootBridge: boolean, costToRoot: number, rootPortEdgeId: string | null }>} */
  const nodeRoles = {};
  nodes.forEach(n => {
    nodeRoles[n.id] = {
      isRootBridge: n.id === rootNode.id,
      costToRoot: rootDijkstra.distances[n.id] || 0,
      rootPortEdgeId: null
    };
  });

  // 3. Root Port Ermittlung für Nicht-Root-Bridges
  const forwardingEdgeSet = new Set();

  nodes.forEach(n => {
    if (n.id === rootNode.id) return;
    const parentId = rootDijkstra.previous[n.id];
    if (parentId) {
      // Kante zwischen n und parentId finden
      const edge = edges.find(
        e => (e.from === n.id && e.to === parentId) || (e.from === parentId && e.to === n.id)
      );
      if (edge) {
        forwardingEdgeSet.add(edge.id);
        nodeRoles[n.id].rootPortEdgeId = edge.id;
      }
    }
  });

  // Alle anderen Kanten, die redundante Loops bilden, werden geblockt (Discarding/Blocking)
  const blockedEdges = edges.filter(e => !forwardingEdgeSet.has(e.id)).map(e => e.id);

  return {
    rootBridgeId: rootNode.id,
    forwardingEdges: Array.from(forwardingEdgeSet),
    blockedEdges,
    nodeRoles
  };
}
