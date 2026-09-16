/**
 * IHK Netzplantechnik (CPM / Critical Path Method nach DIN 69900)
 * Metra-Potenzial-Methode (Vorgangsknoten-Netzplan)
 * 
 * Berechnet:
 * - Vorwärtsrechnung (FAZ, FEZ)
 * - Rückwärtsrechnung (SAZ, SEZ)
 * - Pufferzeiten (Gesamtpuffer GP, Freier Puffer FP)
 * - Kritischer Pfad (GP = 0)
 * - Zyklen-Erkennung (Topologische Sortierung via Kahn-Algorithmus)
 */

export const DEFAULT_CPM_PROJECT = [
  { id: 'A', name: 'Ist-Analyse & Anforderungskatalog', duration: 3, predecessors: [] },
  { id: 'B', name: 'Architektur- & DB-Design', duration: 4, predecessors: ['A'] },
  { id: 'C', name: 'UI/UX Mockups & Prototyping', duration: 2, predecessors: ['A'] },
  { id: 'D', name: 'Backend API & Datenbank-Setup', duration: 5, predecessors: ['B'] },
  { id: 'E', name: 'Frontend Client Implementation', duration: 4, predecessors: ['C', 'B'] },
  { id: 'F', name: 'Integration & End-to-End Tests', duration: 3, predecessors: ['D', 'E'] },
  { id: 'G', name: 'Deployment, Schulung & Abnahme', duration: 2, predecessors: ['F'] }
];

export const IHK_CPM_TEMPLATES = {
  software_project: {
    name: 'IHK Abschlussprüfung: Web-Anwendungsentwicklung (80h)',
    nodes: [
      { id: '1', name: 'Projektinitialisierung & Kickoff', duration: 2, predecessors: [] },
      { id: '2', name: 'Fachkonzept & Lastenheft-Analyse', duration: 6, predecessors: ['1'] },
      { id: '3', name: 'System- & Schnittstellen-Entwurf', duration: 8, predecessors: ['2'] },
      { id: '4', name: 'Datenmodellierung & DDL', duration: 6, predecessors: ['2'] },
      { id: '5', name: 'Core Microservice Entwicklung', duration: 24, predecessors: ['3', '4'] },
      { id: '6', name: 'Unit- & Integrationstests', duration: 10, predecessors: ['5'] },
      { id: '7', name: 'Benutzerdokumentation & Handbuch', duration: 8, predecessors: ['5'] },
      { id: '8', name: 'Rollout, Deployment & Review', duration: 6, predecessors: ['6', '7'] }
    ]
  },
  datacenter_migration: {
    name: 'IHK FISI: Rechenzentrums- & Server-Migration (40h)',
    nodes: [
      { id: 'A', name: 'Bestandsaufnahme & Risikoanalyse', duration: 4, predecessors: [] },
      { id: 'B', name: 'Hardware-Aufbau & Verkabelung', duration: 6, predecessors: ['A'] },
      { id: 'C', name: 'OS & Hypervisor Installation', duration: 4, predecessors: ['B'] },
      { id: 'D', name: 'Netzwerk & VLAN Konfiguration', duration: 6, predecessors: ['A'] },
      { id: 'E', name: 'Storage & Backup Replikation', duration: 8, predecessors: ['C', 'D'] },
      { id: 'F', name: 'Funktionstests & Failover Test', duration: 4, predecessors: ['E'] },
      { id: 'G', name: 'Produktivschaltung & Übergabe', duration: 4, predecessors: ['F'] }
    ]
  }
};

/**
 * Führt die vollständige Netzplanberechnung durch
 * @param {Array} rawNodes Array von Knoten { id, name, duration, predecessors }
 * @returns {Object} { nodes, projectDuration, criticalPath, hasCycle, totalNodes }
 */
export function calculateCpmNetwork(rawNodes = []) {
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    return {
      nodes: [],
      projectDuration: 0,
      criticalPath: [],
      hasCycle: false,
      totalNodes: 0
    };
  }

  // 1. Initialisiere Arbeitsknoten
  const nodeMap = new Map();
  rawNodes.forEach(node => {
    nodeMap.set(node.id, {
      ...node,
      duration: Math.max(0, Number(node.duration) || 0),
      predecessors: Array.isArray(node.predecessors) ? [...node.predecessors] : [],
      successors: [],
      faz: 0,
      fez: 0,
      saz: 0,
      sez: 0,
      gp: 0,
      fp: 0,
      isCritical: false
    });
  });

  // 2. Fülle Nachfolgerbeziehungen auf
  nodeMap.forEach((node, id) => {
    node.predecessors.forEach(predId => {
      if (nodeMap.has(predId)) {
        nodeMap.get(predId).successors.push(id);
      }
    });
  });

  // 3. Topologische Sortierung (Kahn-Algorithmus) zur Zyklen-Erkennung
  const inDegree = new Map();
  nodeMap.forEach((node, id) => {
    inDegree.set(id, node.predecessors.filter(p => nodeMap.has(p)).length);
  });

  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const topoOrder = [];
  while (queue.length > 0) {
    const currId = queue.shift();
    topoOrder.push(currId);
    const currNode = nodeMap.get(currId);

    currNode.successors.forEach(succId => {
      const newDeg = inDegree.get(succId) - 1;
      inDegree.set(succId, newDeg);
      if (newDeg === 0) queue.push(succId);
    });
  }

  if (topoOrder.length !== nodeMap.size) {
    // Zyklus / Zirkuläre Abhängigkeit erkannt!
    return {
      nodes: Array.from(nodeMap.values()),
      projectDuration: 0,
      criticalPath: [],
      hasCycle: true,
      totalNodes: nodeMap.size
    };
  }

  // 4. VORWÄRTSRECHNUNG (FAZ & FEZ)
  // FAZ = max(FEZ aller Vorgänger)
  // FEZ = FAZ + Dauer
  for (const id of topoOrder) {
    const node = nodeMap.get(id);
    if (node.predecessors.length === 0) {
      node.faz = 0;
    } else {
      let maxPredFez = 0;
      node.predecessors.forEach(predId => {
        if (nodeMap.has(predId)) {
          maxPredFez = Math.max(maxPredFez, nodeMap.get(predId).fez);
        }
      });
      node.faz = maxPredFez;
    }
    node.fez = node.faz + node.duration;
  }

  // 5. Projektdauer ermitteln
  let projectDuration = 0;
  nodeMap.forEach(node => {
    projectDuration = Math.max(projectDuration, node.fez);
  });

  // 6. RÜCKWÄRTSRECHNUNG (SEZ & SAZ)
  // Für Endknoten (ohne Nachfolger): SEZ = projectDuration
  // Für andere: SEZ = min(SAZ aller Nachfolger)
  // SAZ = SEZ - Dauer
  const reverseTopo = [...topoOrder].reverse();
  for (const id of reverseTopo) {
    const node = nodeMap.get(id);
    if (node.successors.length === 0) {
      node.sez = projectDuration;
    } else {
      let minSuccSaz = Infinity;
      node.successors.forEach(succId => {
        if (nodeMap.has(succId)) {
          minSuccSaz = Math.min(minSuccSaz, nodeMap.get(succId).saz);
        }
      });
      node.sez = minSuccSaz === Infinity ? projectDuration : minSuccSaz;
    }
    node.saz = node.sez - node.duration;
  }

  // 7. PUFFERZEITEN BERECHNEN
  // Gesamtpuffer GP = SAZ - FAZ (oder SEZ - FEZ)
  // Freier Puffer FP = min(FAZ aller Nachfolger) - FEZ
  // (Endknoten: FP = projectDuration - FEZ)
  const criticalPath = [];
  nodeMap.forEach(node => {
    node.gp = Math.max(0, node.saz - node.faz);
    
    if (node.successors.length === 0) {
      node.fp = Math.max(0, projectDuration - node.fez);
    } else {
      let minSuccFaz = Infinity;
      node.successors.forEach(succId => {
        if (nodeMap.has(succId)) {
          minSuccFaz = Math.min(minSuccFaz, nodeMap.get(succId).faz);
        }
      });
      node.fp = Math.max(0, minSuccFaz - node.fez);
    }

    // Kritischer Knoten wenn GP == 0 (und FP == 0)
    node.isCritical = node.gp === 0;
  });

  // 8. Kritischer Pfad als Sequenz
  for (const id of topoOrder) {
    const node = nodeMap.get(id);
    if (node.isCritical) {
      criticalPath.push(node.id);
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    projectDuration,
    criticalPath,
    hasCycle: false,
    totalNodes: nodeMap.size
  };
}
