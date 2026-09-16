/**
 * Terraform / OpenTofu Infrastructure-as-Code (IaC) Simulation Engine
 * Simuliert DAG Resource Graphs, State Diffing (Plan) & Drift Detection
 */

export const DEFAULT_TERRAFORM_RESOURCES = [
  {
    id: 'aws_vpc.main',
    type: 'aws_vpc',
    name: 'main',
    provider: 'aws',
    attributes: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: true },
    dependsOn: []
  },
  {
    id: 'aws_subnet.public_a',
    type: 'aws_subnet',
    name: 'public_a',
    provider: 'aws',
    attributes: { cidr_block: '10.0.1.0/24', availability_zone: 'eu-central-1a' },
    dependsOn: ['aws_vpc.main']
  },
  {
    id: 'aws_internet_gateway.gw',
    type: 'aws_internet_gateway',
    name: 'gw',
    provider: 'aws',
    attributes: { vpc_id: 'aws_vpc.main.id' },
    dependsOn: ['aws_vpc.main']
  },
  {
    id: 'aws_security_group.web',
    type: 'aws_security_group',
    name: 'web',
    provider: 'aws',
    attributes: { description: 'Allow HTTPS & SSH', ingress_ports: [443, 22] },
    dependsOn: ['aws_vpc.main']
  },
  {
    id: 'aws_instance.app_server',
    type: 'aws_instance',
    name: 'app_server',
    provider: 'aws',
    attributes: { ami: 'ami-0c55b159cbfafe1f0', instance_type: 't3.micro' },
    dependsOn: ['aws_subnet.public_a', 'aws_security_group.web']
  }
];

/**
 * Berechnet den Terraform Plan (Diff zwischen gewünschtem Code und aktuellem State)
 * @param {Array} desiredResources Ressourcen im HCL-Code
 * @param {Array} currentStates Ressourcen im aktuellen State
 */
export function calculateTerraformPlan(desiredResources = [], currentStates = []) {
  const stateMap = new Map();
  currentStates.forEach(r => stateMap.set(r.id, r));

  const planActions = [];
  const desiredIds = new Set();

  // 1. Untersuche alle gewünschten Ressourcen
  desiredResources.forEach(res => {
    desiredIds.add(res.id);
    if (!stateMap.has(res.id)) {
      // Neu erstellen
      planActions.push({
        id: res.id,
        action: 'create',
        symbol: '+',
        color: 'var(--accent-emerald)',
        details: res.attributes
      });
    } else {
      const stateRes = stateMap.get(res.id);
      // Vergleiche Attribute
      const diffs = [];
      const allKeys = new Set([...Object.keys(res.attributes || {}), ...Object.keys(stateRes.attributes || {})]);
      
      allKeys.forEach(k => {
        const val1 = JSON.stringify(res.attributes?.[k]);
        const val2 = JSON.stringify(stateRes.attributes?.[k]);
        if (val1 !== val2) {
          diffs.push({ key: k, oldVal: stateRes.attributes?.[k], newVal: res.attributes?.[k] });
        }
      });

      if (diffs.length > 0) {
        planActions.push({
          id: res.id,
          action: 'update',
          symbol: '~',
          color: 'var(--accent-amber)',
          diffs
        });
      } else {
        planActions.push({
          id: res.id,
          action: 'no-op',
          symbol: ' ',
          color: 'var(--text-muted)'
        });
      }
    }
  });

  // 2. Untersuche verwaiste State-Ressourcen (müssen gelöscht werden)
  stateMap.forEach((res, id) => {
    if (!desiredIds.has(id)) {
      planActions.push({
        id: res.id,
        action: 'destroy',
        symbol: '-',
        color: 'var(--accent-rose)',
        details: res.attributes
      });
    }
  });

  const createCount = planActions.filter(p => p.action === 'create').length;
  const updateCount = planActions.filter(p => p.action === 'update').length;
  const destroyCount = planActions.filter(p => p.action === 'destroy').length;

  return {
    planActions,
    summaryText: `Plan: ${createCount} to add, ${updateCount} to change, ${destroyCount} to destroy.`,
    createCount,
    updateCount,
    destroyCount
  };
}

/**
 * Topologische Abhängigkeitsauflösung für Bereitstellungsreihenfolge
 */
export function getDeploymentOrder(resources = []) {
  const inDegree = new Map();
  const graph = new Map();

  resources.forEach(r => {
    inDegree.set(r.id, (r.dependsOn || []).length);
    graph.set(r.id, []);
  });

  resources.forEach(r => {
    (r.dependsOn || []).forEach(parent => {
      if (graph.has(parent)) {
        graph.get(parent).push(r.id);
      }
    });
  });

  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const order = [];
  while (queue.length > 0) {
    const curr = queue.shift();
    order.push(curr);
    (graph.get(curr) || []).forEach(child => {
      const newDeg = inDegree.get(child) - 1;
      inDegree.set(child, newDeg);
      if (newDeg === 0) queue.push(child);
    });
  }

  return {
    order,
    hasCircularDependency: order.length !== resources.length
  };
}
