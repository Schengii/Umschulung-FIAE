// @ts-check
/**
 * Fachlogik-Engine für das Kubernetes & Cloud-Native Architecture Lab.
 * Validiert K8s-Manifeste (Deployments, Services), simuliert den Controller-Reconciliation-Loop,
 * berechnet Endpoints und liefert IHK-Prüfungsfragen.
 */

/**
 * Einfacher zeilenbasierter YAML-Parser für flache K8s-Manifest-Strukturen.
 * @param {string} yaml
 * @returns {Record<string, any>}
 */
export function parseSimpleK8sYaml(yaml) {
  const lines = yaml.split('\n');
  /** @type {Record<string, any>} */
  const doc = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Root-Ebene Key: Value
    if (!rawLine.startsWith(' ') && line.includes(':')) {
      const idx = line.indexOf(':');
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      doc[key] = val || {};
    }
  }

  // Wichtige Eigenschaften mit Regex extrahieren
  const apiVersionMatch = yaml.match(/apiVersion:\s*([^\s#]+)/);
  if (apiVersionMatch) doc.apiVersion = apiVersionMatch[1];

  const kindMatch = yaml.match(/kind:\s*([^\s#]+)/);
  if (kindMatch) doc.kind = kindMatch[1];

  const nameMatch = yaml.match(/name:\s*([^\s#]+)/);
  if (nameMatch) doc.name = nameMatch[1];

  const replicasMatch = yaml.match(/replicas:\s*(\d+)/);
  if (replicasMatch) doc.replicas = parseInt(replicasMatch[1], 10);

  const serviceTypeMatch = yaml.match(/type:\s*([^\s#]+)/);
  if (serviceTypeMatch) doc.serviceType = serviceTypeMatch[1];

  const portMatch = yaml.match(/port:\s*(\d+)/);
  if (portMatch) doc.port = parseInt(portMatch[1], 10);

  const targetPortMatch = yaml.match(/targetPort:\s*(\d+)/);
  if (targetPortMatch) doc.targetPort = parseInt(targetPortMatch[1], 10);

  const appLabelMatch = yaml.match(/app:\s*([^\s#]+)/g);
  if (appLabelMatch) {
    doc.appLabels = appLabelMatch.map((m) => m.split(':')[1].trim());
  }

  return doc;
}

/**
 * Validiert ein K8s Manifest auf Korrektheit und Best Practices.
 * @param {string} yaml
 */
export function validateK8sManifest(yaml) {
  const issues = [];
  const parsed = parseSimpleK8sYaml(yaml);

  if (!parsed.apiVersion) {
    issues.push('Fehlende apiVersion (z. B. apps/v1 für Deployments oder v1 für Services).');
  }
  if (!parsed.kind) {
    issues.push('Fehlendes kind (z. B. Deployment, Service, ConfigMap).');
  }
  if (!parsed.name) {
    issues.push('Fehlender metadata.name für die Kubernetes-Ressource.');
  }

  if (parsed.kind === 'Deployment') {
    if (parsed.apiVersion !== 'apps/v1') {
      issues.push(`Veraltete oder ungültige apiVersion '${parsed.apiVersion}' für Deployment (erwartet: apps/v1).`);
    }
    if (parsed.replicas === undefined || parsed.replicas < 0) {
      issues.push('spec.replicas muss eine nicht-negative Ganzzahl sein.');
    }
    if (!yaml.includes('matchLabels')) {
      issues.push('spec.selector.matchLabels fehlt im Deployment.');
    }
    if (!yaml.includes('resources:') || !yaml.includes('limits:')) {
      issues.push('Best Practice: Ressourcenlimits (resources.limits) fehlen (Schutz vor CPU/Memory-Exhaustion).');
    }
  } else if (parsed.kind === 'Service') {
    const validTypes = ['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName'];
    if (parsed.serviceType && !validTypes.includes(parsed.serviceType)) {
      issues.push(`Ungültiger Service-Typ '${parsed.serviceType}'. Erlaubt: ${validTypes.join(', ')}.`);
    }
    if (!parsed.port) {
      issues.push('spec.ports.port fehlt für den Service.');
    }
  }

  const isValid = issues.filter((i) => !i.startsWith('Best Practice')).length === 0;
  const score = Math.max(0, 100 - issues.length * 20);

  return {
    isValid,
    kind: parsed.kind || 'Unknown',
    name: parsed.name || 'unnamed',
    issues,
    parsed,
    score
  };
}

/**
 * Simuliert den Reconciliation-Loop des Kube-Controller-Managers für ein Deployment.
 * @param {number} desiredReplicas
 * @param {Array<{ id: string, name: string, status: 'Running' | 'Pending' | 'Terminating', node: string }>} currentPods
 */
export function simulateReconciliation(desiredReplicas, currentPods) {
  const healthyPods = currentPods.filter((p) => p.status === 'Running' || p.status === 'Pending');
  const diff = desiredReplicas - healthyPods.length;
  const nodes = ['node-worker-1', 'node-worker-2', 'node-worker-3'];

  /** @type {Array<{ id: string, name: string, status: 'Running' | 'Pending' | 'Terminating', node: string }>} */
  let updatedPods = [...currentPods];

  if (diff > 0) {
    // Neue Pods erstellen
    for (let i = 0; i < diff; i++) {
      const id = `pod-${Math.random().toString(36).substring(2, 7)}`;
      const node = nodes[(healthyPods.length + i) % nodes.length];
      updatedPods.push({
        id,
        name: `app-api-${id}`,
        status: 'Running',
        node
      });
    }
  } else if (diff < 0) {
    // Überzählige Pods entfernen
    let toRemove = Math.abs(diff);
    updatedPods = updatedPods.filter(() => {
      if (toRemove > 0) {
        toRemove--;
        return false;
      }
      return true;
    });
  }

  return {
    desiredReplicas,
    currentCount: updatedPods.length,
    inSync: updatedPods.length === desiredReplicas,
    pods: updatedPods
  };
}

/**
 * Ermittelt Service-Endpoints basierend auf Pod-Labels.
 * @param {string} serviceSelector
 * @param {Array<{ id: string, appLabel: string, ip: string, status: string }>} pods
 */
export function matchServiceEndpoints(serviceSelector, pods) {
  const matching = pods.filter((p) => p.appLabel === serviceSelector && p.status === 'Running');
  return {
    selector: serviceSelector,
    endpoints: matching.map((p) => ({ podId: p.id, ip: p.ip })),
    isAvailable: matching.length > 0
  };
}

export const K8S_DRILL_QUESTIONS = [
  {
    id: 'k8s-q1',
    question: 'Welche Aufgabe übernimmt ein Kubernetes Deployment im Vergleich zu einem einzelnen Pod?',
    options: [
      'Ein Deployment kompiliert den Source-Code des Containers auf den Worker-Nodes.',
      'Ein Deployment deklariert den gewünschten Soll-Zustand (Replicas, Image-Version) und sorgt via Controller automatisch für Self-Healing und unterbrechungsfreie Rolling Updates.',
      'Ein Deployment vergibt externe öffentliche IP-Adressen an alle Pods.',
      'Ein Deployment verschlüsselt das gesamte Dateisystem der Nodes.'
    ],
    correct: 1,
    explanation: 'Pods sind vergänglich. Deployments verwalten ReplikaSets deklarativ: Fällt ein Pod oder Node aus, startet der Deployment-Controller automatisch Ersatz-Pods, um den Soll-Zustand zu halten.'
  },
  {
    id: 'k8s-q2',
    question: 'Was ist der Standard-Service-Typ in Kubernetes, wenn kein `type` in der spec angegeben wird?',
    options: [
      'LoadBalancer',
      'NodePort',
      'ClusterIP',
      'Ingress'
    ],
    correct: 2,
    explanation: 'ClusterIP ist der Standard. Er weist dem Service eine cluster-interne virtuelle IP zu, sodass der Dienst nur von innerhalb des K8s-Clusters erreichbar ist.'
  },
  {
    id: 'k8s-q3',
    question: 'Wann sollte eine `readinessProbe` anstelle einer `livenessProbe` konfiguriert werden?',
    options: [
      'Wenn der Pod beim Scheitern sofort gekillt und neu gestartet werden soll.',
      'Wenn ein Container temporär überlastet ist oder Daten lädt und vorübergehend keinen Traffic erhalten soll, ohne jedoch neu gestartet zu werden.',
      'Wenn das SSL-Zertifikat des Ingress erneuert werden muss.',
      'readinessProbes werden nur für CronJobs verwendet.'
    ],
    correct: 1,
    explanation: 'LivenessProbes restarten tote Container. ReadinessProbes steuern, ob der Pod als Endpoint im Service eingetragen wird – schlägt sie fehl, wird der Pod aus dem Routing genommen, bleibt aber am Leben.'
  },
  {
    id: 'k8s-q4',
    question: 'Wie verbindet ein Kubernetes Service eingehenden Netzwerk-Traffic mit den zugehörigen Pods?',
    options: [
      'Über die MAC-Adresse der Node-Netzwerkkarte.',
      'Über Label-Selektoren (`spec.selector`), die mit den Metadaten-Labels der Pods (`metadata.labels`) übereinstimmen müssen.',
      'Durch manuelles Eintragen der statischen IP-Adressen in die kube-proxy Konfiguration.',
      'Über die Docker-Container-ID.'
    ],
    correct: 1,
    explanation: 'Kubernetes entkoppelt Services und Pods lose über Labels und Selektoren. Der EndpointSlice-Controller überwacht Pod-Labels und registriert passende Pod-IPs automatisch als Service-Endpoints.'
  }
];
