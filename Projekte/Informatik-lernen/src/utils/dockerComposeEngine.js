/**
 * Docker Compose Multi-Container Orchestrator Engine
 * DAG Service Dependency Resolution (depends_on), Network Bridge Isolation & Volume Mounts
 */

export const DEFAULT_COMPOSE_PROJECT = {
  version: '3.8',
  services: [
    {
      id: 'postgres',
      name: 'postgres',
      image: 'postgres:16-alpine',
      ports: ['5432:5432'],
      networks: ['backend_net'],
      volumes: ['pg_data:/var/lib/postgresql/data'],
      environment: { POSTGRES_DB: 'app_db', POSTGRES_USER: 'admin' },
      depends_on: [],
      healthcheck: 'pg_isready -U admin',
      status: 'stopped'
    },
    {
      id: 'redis',
      name: 'redis',
      image: 'redis:7-alpine',
      ports: ['6379:6379'],
      networks: ['backend_net'],
      volumes: ['redis_data:/data'],
      environment: {},
      depends_on: [],
      status: 'stopped'
    },
    {
      id: 'api',
      name: 'api_server',
      image: 'node:20-alpine',
      ports: ['3000:3000'],
      networks: ['frontend_net', 'backend_net'],
      volumes: [],
      environment: { DB_HOST: 'postgres', REDIS_HOST: 'redis', PORT: '3000' },
      depends_on: ['postgres', 'redis'],
      status: 'stopped'
    },
    {
      id: 'web',
      name: 'web_frontend',
      image: 'nginx:alpine',
      ports: ['80:80'],
      networks: ['frontend_net'],
      volumes: ['./dist:/usr/share/nginx/html:ro'],
      environment: { API_URL: 'http://api_server:3000' },
      depends_on: ['api'],
      status: 'stopped'
    }
  ],
  networks: ['frontend_net', 'backend_net'],
  volumes: ['pg_data', 'redis_data']
};

/**
 * Löst die Startreihenfolge der Services basierend auf depends_on auf (Kahn-Topologie / DAG)
 */
export function resolveDependencyOrder(services) {
  const serviceMap = new Map();
  const inDegree = new Map();
  const graph = new Map();

  services.forEach(s => {
    serviceMap.set(s.id, s);
    inDegree.set(s.id, 0);
    graph.set(s.id, []);
  });

  services.forEach(s => {
    const deps = s.depends_on || [];
    deps.forEach(depId => {
      if (serviceMap.has(depId)) {
        // depId muss VOR s starten: Edge von depId -> s
        graph.get(depId).push(s.id);
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1);
      }
    });
  });

  const queue = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const launchOrder = [];
  while (queue.length > 0) {
    const current = queue.shift();
    launchOrder.push(current);

    const neighbors = graph.get(current) || [];
    neighbors.forEach(nextId => {
      const newDegree = inDegree.get(nextId) - 1;
      inDegree.set(nextId, newDegree);
      if (newDegree === 0) {
        queue.push(nextId);
      }
    });
  }

  const hasCycle = launchOrder.length !== services.length;

  return {
    launchOrder,
    hasCycle,
    error: hasCycle ? 'Zyklische Abhängigkeit in depends_on erkannt!' : null
  };
}

/**
 * Prüft die Netzwerkerreichbarkeit (Bridge-Isolation) zwischen zwei Services
 */
export function checkNetworkReachability(fromServiceId, toServiceId, services) {
  const sFrom = services.find(s => s.id === fromServiceId);
  const sTo = services.find(s => s.id === toServiceId);

  if (!sFrom || !sTo) {
    return { canReach: false, sharedNetworks: [], error: 'Service nicht gefunden' };
  }

  const netsFrom = new Set(sFrom.networks || []);
  const sharedNetworks = (sTo.networks || []).filter(net => netsFrom.has(net));

  return {
    canReach: sharedNetworks.length > 0,
    sharedNetworks,
    reason: sharedNetworks.length > 0
      ? `Gemeinsames Bridge-Netzwerk: [${sharedNetworks.join(', ')}]`
      : 'Kein gemeinsames Docker-Netzwerk (Sicherheits-Isolation aktiv!)'
  };
}

/**
 * Generiert sauberes Docker Compose YAML (v3.8)
 */
export function generateComposeYaml(project = DEFAULT_COMPOSE_PROJECT) {
  let yaml = `version: '${project.version}'\n\nservices:\n`;

  project.services.forEach(s => {
    yaml += `  ${s.id}:\n`;
    yaml += `    image: ${s.image}\n`;
    yaml += `    container_name: ${s.name}\n`;
    if (s.ports && s.ports.length > 0) {
      yaml += `    ports:\n`;
      s.ports.forEach(p => yaml += `      - "${p}"\n`);
    }
    if (s.depends_on && s.depends_on.length > 0) {
      yaml += `    depends_on:\n`;
      s.depends_on.forEach(d => yaml += `      - ${d}\n`);
    }
    if (s.networks && s.networks.length > 0) {
      yaml += `    networks:\n`;
      s.networks.forEach(n => yaml += `      - ${n}\n`);
    }
    if (s.volumes && s.volumes.length > 0) {
      yaml += `    volumes:\n`;
      s.volumes.forEach(v => yaml += `      - ${v}\n`);
    }
    if (s.environment && Object.keys(s.environment).length > 0) {
      yaml += `    environment:\n`;
      Object.entries(s.environment).forEach(([k, v]) => {
        yaml += `      ${k}: "${v}"\n`;
      });
    }
    yaml += `\n`;
  });

  if (project.networks && project.networks.length > 0) {
    yaml += `networks:\n`;
    project.networks.forEach(n => {
      yaml += `  ${n}:\n    driver: bridge\n`;
    });
    yaml += `\n`;
  }

  if (project.volumes && project.volumes.length > 0) {
    yaml += `volumes:\n`;
    project.volumes.forEach(v => {
      yaml += `  ${v}:\n`;
    });
  }

  return yaml;
}

/**
 * Führt einen simulierten 'docker compose up -d' Orchestrierungs-Lauf durch
 */
export function simulateComposeUp(project = DEFAULT_COMPOSE_PROJECT) {
  const { launchOrder, hasCycle, error } = resolveDependencyOrder(project.services);
  if (hasCycle) {
    return {
      success: false,
      logs: [`[FATAL] Error resolving depends_on: ${error}`],
      servicesStatus: {}
    };
  }

  const logs = [];
  logs.push(`[+] Running ${project.services.length}/${project.services.length}`);
  
  // Networks erstellen
  (project.networks || []).forEach(n => {
    logs.push(` Network ${n}  Created`);
  });

  // Volumes erstellen
  (project.volumes || []).forEach(v => {
    logs.push(` Volume ${v}  Created`);
  });

  const servicesStatus = {};

  launchOrder.forEach((sId, index) => {
    const s = project.services.find(item => item.id === sId);
    if (!s) return;
    const cid = Math.random().toString(16).substring(2, 8);
    logs.push(` Container ${s.name} (${cid})  Starting (Stage ${index + 1})...`);
    if (s.healthcheck) {
      logs.push(` Container ${s.name}  healthcheck: "${s.healthcheck}" -> healthy (200ms)`);
    }
    logs.push(` Container ${s.name}  Started on [${(s.networks || []).join(', ')}]`);
    servicesStatus[sId] = 'running';
  });

  return {
    success: true,
    launchOrder,
    logs,
    servicesStatus
  };
}
