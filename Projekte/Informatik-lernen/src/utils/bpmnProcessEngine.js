// @ts-check
/**
 * OMG BPMN 2.0 Business Process Modeling & Notation Engine
 * Supports:
 * - Start Events, End Events, Intermediate Events
 * - Tasks (User Task, Service Task, Manual Task)
 * - Gateways (Exclusive XOR, Parallel AND, Inclusive OR)
 * - Pools and Swimlanes (e.g., Kunde, Vertrieb, Lager, Buchhaltung)
 * - IHK-Compliance Linter (Dead-Ends, Orphaned Nodes, Gateway Mismatch)
 * - Token Simulation (Step-by-step execution tracer)
 * @module bpmnProcessEngine
 */

/**
 * @typedef {'START_EVENT' | 'END_EVENT' | 'USER_TASK' | 'SERVICE_TASK' | 'MANUAL_TASK' | 'GATEWAY_XOR' | 'GATEWAY_AND' | 'GATEWAY_OR'} BpmnNodeType
 *
 * @typedef {{
 *   id: string;
 *   name: string;
 *   type: BpmnNodeType;
 *   laneId: string;
 * }} BpmnNode
 *
 * @typedef {{
 *   id: string;
 *   from: string;
 *   to: string;
 *   condition?: string;
 * }} BpmnFlow
 *
 * @typedef {{
 *   id: string;
 *   name: string;
 *   color?: string;
 * }} BpmnLane
 *
 * @typedef {{
 *   id: string;
 *   title: string;
 *   description: string;
 *   lanes: BpmnLane[];
 *   nodes: BpmnNode[];
 *   flows: BpmnFlow[];
 * }} BpmnProcess
 */

/**
 * Predefined IHK exam business processes
 */
export const IHK_BPMN_TEMPLATES = {
  order_fulfillment: {
    id: 'order_fulfillment',
    title: 'IHK AP2: E-Commerce Auftragsabwicklung & Versand',
    description: 'Bestelleingang, automatisierte Bonitätsprüfung (XOR), parallele Lagerentnahme & Rechnungsstellung (AND) und Kundenversand.',
    lanes: [
      { id: 'lane_kunde', name: 'Kunde / Webshop', color: '#4338ca' },
      { id: 'lane_vertrieb', name: 'Vertrieb & ERP', color: '#0f766e' },
      { id: 'lane_lager', name: 'Logistik & Lager', color: '#b45309' },
      { id: 'lane_finanzen', name: 'Buchhaltung', color: '#6d28d9' }
    ],
    nodes: [
      { id: 'start_1', name: 'Bestellung eingegangen', type: 'START_EVENT', laneId: 'lane_kunde' },
      { id: 'task_boni', name: 'Bonitätsprüfung durchführen', type: 'SERVICE_TASK', laneId: 'lane_vertrieb' },
      { id: 'gw_xor_1', name: 'Bonität OK?', type: 'GATEWAY_XOR', laneId: 'lane_vertrieb' },
      { id: 'task_cancel', name: 'Auftrag stornieren & Kunde benachrichtigen', type: 'USER_TASK', laneId: 'lane_vertrieb' },
      { id: 'end_cancel', name: 'Auftrag abgelehnt', type: 'END_EVENT', laneId: 'lane_vertrieb' },
      { id: 'gw_and_fork', name: 'Parallelverarbeitung starten', type: 'GATEWAY_AND', laneId: 'lane_vertrieb' },
      { id: 'task_pick', name: 'Artikel kommissionieren & verpacken', type: 'MANUAL_TASK', laneId: 'lane_lager' },
      { id: 'task_invoice', name: 'Rechnung erstellen & buchen', type: 'SERVICE_TASK', laneId: 'lane_finanzen' },
      { id: 'gw_and_join', name: 'Synchronisation', type: 'GATEWAY_AND', laneId: 'lane_vertrieb' },
      { id: 'task_ship', name: 'Paket an Spedition übergeben', type: 'MANUAL_TASK', laneId: 'lane_lager' },
      { id: 'end_shipped', name: 'Bestellung erfolgreich versendet', type: 'END_EVENT', laneId: 'lane_kunde' }
    ],
    flows: [
      { id: 'f1', from: 'start_1', to: 'task_boni' },
      { id: 'f2', from: 'task_boni', to: 'gw_xor_1' },
      { id: 'f3', from: 'gw_xor_1', to: 'task_cancel', condition: 'Nein (Score < 70)' },
      { id: 'f4', from: 'task_cancel', to: 'end_cancel' },
      { id: 'f5', from: 'gw_xor_1', to: 'gw_and_fork', condition: 'Ja (Score >= 70)' },
      { id: 'f6', from: 'gw_and_fork', to: 'task_pick' },
      { id: 'f7', from: 'gw_and_fork', to: 'task_invoice' },
      { id: 'f8', from: 'task_pick', to: 'gw_and_join' },
      { id: 'f9', from: 'task_invoice', to: 'gw_and_join' },
      { id: 'f10', from: 'gw_and_join', to: 'task_ship' },
      { id: 'f11', from: 'task_ship', to: 'end_shipped' }
    ]
  },
  incident_management: {
    id: 'incident_management',
    title: 'ITIL 4 / IHK FISI: Incident Management & Eskalation',
    description: 'Meldungseingang beim 1st-Level-Support, Lösung oder Eskalation an 2nd-Level-Spezialisten mit SLA-Prüfung.',
    lanes: [
      { id: 'lane_anwender', name: 'Anwender / Nutzer', color: '#4338ca' },
      { id: 'lane_1st_level', name: 'Service Desk (1st Level)', color: '#0f766e' },
      { id: 'lane_2nd_level', name: 'Systemadministration (2nd Level)', color: '#6d28d9' }
    ],
    nodes: [
      { id: 'inc_start', name: 'Störung gemeldet', type: 'START_EVENT', laneId: 'lane_anwender' },
      { id: 'inc_triage', name: 'Störung klassifizieren & priorisieren', type: 'USER_TASK', laneId: 'lane_1st_level' },
      { id: 'inc_gw_sol', name: 'Bekannte Lösung vorhanden?', type: 'GATEWAY_XOR', laneId: 'lane_1st_level' },
      { id: 'inc_apply_kb', name: 'Knowledge-Base Lösung anwenden', type: 'USER_TASK', laneId: 'lane_1st_level' },
      { id: 'inc_escalate', name: 'Ticket an Fachteam eskalieren', type: 'USER_TASK', laneId: 'lane_2nd_level' },
      { id: 'inc_deep_fix', name: 'Ursachenanalyse & Hotfix ausrollen', type: 'USER_TASK', laneId: 'lane_2nd_level' },
      { id: 'inc_gw_join', name: 'Zusammenführung', type: 'GATEWAY_XOR', laneId: 'lane_1st_level' },
      { id: 'inc_confirm', name: 'Nutzerbestätigung einholen', type: 'USER_TASK', laneId: 'lane_anwender' },
      { id: 'inc_end', name: 'Ticket erfolgreich geschlossen', type: 'END_EVENT', laneId: 'lane_1st_level' }
    ],
    flows: [
      { id: 'if1', from: 'inc_start', to: 'inc_triage' },
      { id: 'if2', from: 'inc_triage', to: 'inc_gw_sol' },
      { id: 'if3', from: 'inc_gw_sol', to: 'inc_apply_kb', condition: 'Ja' },
      { id: 'if4', from: 'inc_gw_sol', to: 'inc_escalate', condition: 'Nein (Unbekannt)' },
      { id: 'if5', from: 'inc_escalate', to: 'inc_deep_fix' },
      { id: 'if6', from: 'inc_apply_kb', to: 'inc_gw_join' },
      { id: 'if7', from: 'inc_deep_fix', to: 'inc_gw_join' },
      { id: 'if8', from: 'inc_gw_join', to: 'inc_confirm' },
      { id: 'if9', from: 'inc_confirm', to: 'inc_end' }
    ]
  }
};

/**
 * Validates a BPMN 2.0 Process according to official OMG & IHK modeling rules
 * @param {BpmnProcess} process
 * @returns {{
 *   isValid: boolean;
 *   score: number;
 *   errors: string[];
 *   warnings: string[];
 * }}
 */
export function validateBpmnProcess(process) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  const nodes = process.nodes || [];
  const flows = process.flows || [];

  if (nodes.length === 0) {
    return {
      isValid: false,
      score: 0,
      errors: ['Der Prozess enthält keine Knoten.'],
      warnings: []
    };
  }

  // 1. Start and End event existence
  const startNodes = nodes.filter((n) => n.type === 'START_EVENT');
  const endNodes = nodes.filter((n) => n.type === 'END_EVENT');

  if (startNodes.length === 0) {
    errors.push('Fehlendes Startereignis: Jeder BPMN-Prozess muss mit genau mindestens einem Startereignis beginnen.');
  }

  if (endNodes.length === 0) {
    errors.push('Fehlendes Endereignis: Jeder BPMN-Prozess muss mindestens ein definiertes Endereignis besitzen.');
  }

  // Node Degree Analysis
  /** @type {Record<string, number>} */
  const inDegree = {};
  /** @type {Record<string, number>} */
  const outDegree = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    outDegree[n.id] = 0;
  });

  flows.forEach((f) => {
    if (inDegree[f.to] !== undefined) inDegree[f.to]++;
    if (outDegree[f.from] !== undefined) outDegree[f.from]++;
  });

  // 2. Start Event constraints
  startNodes.forEach((s) => {
    if (inDegree[s.id] > 0) {
      errors.push(`Startereignis "${s.name}" darf keine eingehenden Sequenzflüsse besitzen.`);
    }
    if (outDegree[s.id] === 0) {
      errors.push(`Startereignis "${s.name}" muss mindestens einen ausgehenden Sequenzfluss besitzen.`);
    }
  });

  // 3. End Event constraints
  endNodes.forEach((e) => {
    if (outDegree[e.id] > 0) {
      errors.push(`Endereignis "${e.name}" darf keine ausgehenden Sequenzflüsse besitzen.`);
    }
    if (inDegree[e.id] === 0) {
      errors.push(`Endereignis "${e.name}" ist unerreichbar (kein eingehender Sequenzfluss).`);
    }
  });

  // 4. Tasks and Gateways degree validation
  nodes.forEach((n) => {
    if (n.type !== 'START_EVENT' && n.type !== 'END_EVENT') {
      if (inDegree[n.id] === 0) {
        errors.push(`Knoten "${n.name}" ist isoliert (kein eingehender Sequenzfluss).`);
      }
      if (outDegree[n.id] === 0) {
        errors.push(`Sackgasse: Knoten "${n.name}" hat keinen ausgehenden Sequenzfluss.`);
      }

      // Gateway branching check
      if (n.type.startsWith('GATEWAY_')) {
        const isSplit = outDegree[n.id] > 1;
        const isJoin = inDegree[n.id] > 1;

        if (!isSplit && !isJoin) {
          warnings.push(`Gateway "${n.name}" hat weder Verzweigung noch Zusammenführung.`);
        }
      }
    }
  });

  // 5. Swimlane check
  const laneIds = new Set((process.lanes || []).map((l) => l.id));
  nodes.forEach((n) => {
    if (!laneIds.has(n.laneId)) {
      warnings.push(`Knoten "${n.name}" ist keiner gültigen Swimlane zugeordnet.`);
    }
  });

  const isValid = errors.length === 0;
  let score = 100 - errors.length * 25 - warnings.length * 10;
  if (score < 0) score = 0;

  return {
    isValid,
    score,
    errors,
    warnings
  };
}

/**
 * Steps through token execution from a start node to next available nodes
 * @param {BpmnProcess} process
 * @param {string[]} currentActiveNodeIds
 * @param {string} [choiceCondition]
 * @returns {string[]} next active node IDs
 */
export function stepBpmnExecution(process, currentActiveNodeIds, choiceCondition = '') {
  const nextNodes = new Set();
  const flows = process.flows || [];
  const nodes = process.nodes || [];

  currentActiveNodeIds.forEach((currId) => {
    const currNode = nodes.find((n) => n.id === currId);
    if (!currNode) return;

    if (currNode.type === 'END_EVENT') {
      return; // Token stops at end event
    }

    const outgoing = flows.filter((f) => f.from === currId);

    if (currNode.type === 'GATEWAY_XOR') {
      // If condition provided, match it, otherwise take first flow
      const matched = choiceCondition
        ? outgoing.find((f) => f.condition?.toLowerCase().includes(choiceCondition.toLowerCase()))
        : outgoing[0];

      if (matched) {
        nextNodes.add(matched.to);
      } else if (outgoing.length > 0) {
        nextNodes.add(outgoing[0].to);
      }
    } else {
      // Parallel or normal task: propagate token across all outgoing flows
      outgoing.forEach((f) => nextNodes.add(f.to));
    }
  });

  return Array.from(nextNodes);
}
