/**
 * Kubernetes Cluster Topology & Scheduling Engine
 * Simulates K8s Architecture: Control Plane, Nodes, Deployments, ReplicaSets, Pods, Services & Ingress
 */

export function createInitialCluster() {
  return {
    controlPlane: {
      apiServer: { status: 'Healthy', version: 'v1.30.2' },
      etcd: { status: 'Healthy', leader: true },
      scheduler: { status: 'Healthy', algorithm: 'DefaultPreemption' },
      controllerManager: { status: 'Healthy' }
    },
    nodes: [
      {
        id: 'node-worker-1',
        name: 'worker-node-1',
        role: 'worker',
        status: 'Ready',
        capacity: { cpu: 4, memoryMb: 8192 },
        allocatable: { cpu: 3.6, memoryMb: 7500 },
        ip: '10.244.1.10'
      },
      {
        id: 'node-worker-2',
        name: 'worker-node-2',
        role: 'worker',
        status: 'Ready',
        capacity: { cpu: 4, memoryMb: 8192 },
        allocatable: { cpu: 3.6, memoryMb: 7500 },
        ip: '10.244.2.10'
      },
      {
        id: 'node-worker-3',
        name: 'worker-node-3',
        role: 'worker',
        status: 'Ready',
        capacity: { cpu: 4, memoryMb: 8192 },
        allocatable: { cpu: 3.6, memoryMb: 7500 },
        ip: '10.244.3.10'
      }
    ],
    deployments: [
      {
        id: 'deploy-auth-api',
        name: 'auth-api-deployment',
        namespace: 'production',
        replicas: 3,
        image: 'auth-api:v1.0',
        labels: { app: 'auth-api', tier: 'backend' },
        resources: { cpu: 0.5, memoryMb: 512 }
      },
      {
        id: 'deploy-web-frontend',
        name: 'web-frontend-deployment',
        namespace: 'production',
        replicas: 2,
        image: 'web-ui:v2.1',
        labels: { app: 'web-frontend', tier: 'frontend' },
        resources: { cpu: 0.3, memoryMb: 256 }
      }
    ],
    pods: [
      { id: 'pod-auth-1', name: 'auth-api-7b89f-1a2b', deploymentId: 'deploy-auth-api', nodeId: 'node-worker-1', status: 'Running', ip: '10.244.1.15', restarts: 0 },
      { id: 'pod-auth-2', name: 'auth-api-7b89f-3c4d', deploymentId: 'deploy-auth-api', nodeId: 'node-worker-2', status: 'Running', ip: '10.244.2.18', restarts: 0 },
      { id: 'pod-auth-3', name: 'auth-api-7b89f-5e6f', deploymentId: 'deploy-auth-api', nodeId: 'node-worker-3', status: 'Running', ip: '10.244.3.22', restarts: 0 },
      { id: 'pod-web-1', name: 'web-ui-9912a-88x1', deploymentId: 'deploy-web-frontend', nodeId: 'node-worker-1', status: 'Running', ip: '10.244.1.25', restarts: 0 },
      { id: 'pod-web-2', name: 'web-ui-9912a-99y2', deploymentId: 'deploy-web-frontend', nodeId: 'node-worker-2', status: 'Running', ip: '10.244.2.30', restarts: 0 }
    ],
    services: [
      {
        id: 'svc-auth',
        name: 'auth-api-svc',
        type: 'ClusterIP',
        clusterIP: '10.96.14.88',
        port: 8080,
        targetPort: 8080,
        selector: { app: 'auth-api' }
      },
      {
        id: 'svc-frontend',
        name: 'web-frontend-svc',
        type: 'LoadBalancer',
        clusterIP: '10.96.42.100',
        externalIP: '203.0.113.50',
        port: 80,
        targetPort: 80,
        selector: { app: 'web-frontend' }
      }
    ],
    ingress: {
      name: 'main-ingress-router',
      rules: [
        { path: '/api/auth', serviceName: 'auth-api-svc', servicePort: 8080 },
        { path: '/', serviceName: 'web-frontend-svc', servicePort: 80 }
      ]
    }
  };
}

/**
 * Scale a Deployment (Reconciliation Loop)
 */
export function scaleDeployment(cluster, deploymentId, targetReplicas) {
  const nextCluster = JSON.parse(JSON.stringify(cluster));
  const dep = nextCluster.deployments.find(d => d.id === deploymentId);
  if (!dep) return cluster;

  dep.replicas = Math.max(0, targetReplicas);
  const currentPods = nextCluster.pods.filter(p => p.deploymentId === deploymentId);

  if (currentPods.length < targetReplicas) {
    // Add pending pods
    const readyNodes = nextCluster.nodes.filter(n => n.status === 'Ready');
    for (let i = currentPods.length; i < targetReplicas; i++) {
      const targetNode = readyNodes[i % readyNodes.length] || readyNodes[0];
      const podIndex = Math.floor(Math.random() * 1000).toString(16);
      const podIp = targetNode ? `10.244.${targetNode.name.slice(-1)}.${Math.floor(Math.random() * 200 + 20)}` : 'None';
      
      nextCluster.pods.push({
        id: `pod-${dep.id}-${Date.now()}-${i}`,
        name: `${dep.labels.app}-${podIndex}-${i}`,
        deploymentId: dep.id,
        nodeId: targetNode ? targetNode.id : null,
        status: targetNode ? 'Running' : 'Pending',
        ip: podIp,
        restarts: 0
      });
    }
  } else if (currentPods.length > targetReplicas) {
    // Remove excess pods
    const remainingPods = nextCluster.pods.filter(p => p.deploymentId !== deploymentId);
    const keptPods = currentPods.slice(0, targetReplicas);
    nextCluster.pods = [...remainingPods, ...keptPods];
  }

  return nextCluster;
}

/**
 * Simulate Node Failure and Pod Eviction / Rescheduling
 */
export function toggleNodeFailure(cluster, nodeId) {
  const nextCluster = JSON.parse(JSON.stringify(cluster));
  const node = nextCluster.nodes.find(n => n.id === nodeId);
  if (!node) return cluster;

  if (node.status === 'Ready') {
    // Node Crashes
    node.status = 'NotReady';
    const survivingNodes = nextCluster.nodes.filter(n => n.id !== nodeId && n.status === 'Ready');

    // Evict and reschedule pods
    nextCluster.pods = nextCluster.pods.map(pod => {
      if (pod.nodeId === nodeId) {
        if (survivingNodes.length > 0) {
          const newNode = survivingNodes[Math.floor(Math.random() * survivingNodes.length)];
          return {
            ...pod,
            nodeId: newNode.id,
            status: 'Running',
            ip: `10.244.${newNode.name.slice(-1)}.${Math.floor(Math.random() * 200 + 20)}`,
            restarts: pod.restarts + 1
          };
        } else {
          return { ...pod, nodeId: null, status: 'Pending', ip: 'None' };
        }
      }
      return pod;
    });
  } else {
    // Node Recovers
    node.status = 'Ready';
  }

  return nextCluster;
}

/**
 * Route Ingress HTTP Request to Service and Endpoint Pods (Round-Robin)
 */
export function routeIngressRequest(cluster, requestPath) {
  const matchedRule = cluster.ingress.rules.find(r => requestPath.startsWith(r.path)) || cluster.ingress.rules[cluster.ingress.rules.length - 1];
  const service = cluster.services.find(s => s.name === matchedRule.serviceName);

  if (!service) {
    return { success: false, error: '503 Service Unavailable' };
  }

  // Find matching pods via Service Selector
  const selectorKey = Object.keys(service.selector)[0];
  const selectorVal = service.selector[selectorKey];
  
  const matchingDeployments = cluster.deployments.filter(d => d.labels[selectorKey] === selectorVal);
  const matchingDepIds = matchingDeployments.map(d => d.id);
  const healthyEndpoints = cluster.pods.filter(p => matchingDepIds.includes(p.deploymentId) && p.status === 'Running');

  if (healthyEndpoints.length === 0) {
    return {
      success: false,
      ingress: cluster.ingress.name,
      service: service.name,
      serviceIP: service.clusterIP,
      error: '502 Bad Gateway (No healthy Pod endpoints)'
    };
  }

  // Pick random healthy pod for load balancing
  const targetPod = healthyEndpoints[Math.floor(Math.random() * healthyEndpoints.length)];
  const targetNode = cluster.nodes.find(n => n.id === targetPod.nodeId);

  return {
    success: true,
    ingress: cluster.ingress.name,
    matchedPath: matchedRule.path,
    service: service.name,
    serviceIP: service.clusterIP,
    pod: targetPod.name,
    podIP: targetPod.ip,
    node: targetNode ? targetNode.name : 'Unknown',
    nodeIP: targetNode ? targetNode.ip : 'Unknown'
  };
}
