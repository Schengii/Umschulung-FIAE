import { describe, it, expect } from 'vitest';
import {
  createInitialCluster,
  scaleDeployment,
  toggleNodeFailure,
  routeIngressRequest
} from './k8sClusterEngine';

describe('Kubernetes Cluster & Topology Engine', () => {
  it('creates valid initial cluster state with control plane and worker nodes', () => {
    const cluster = createInitialCluster();
    expect(cluster.nodes.length).toBe(3);
    expect(cluster.deployments.length).toBe(2);
    expect(cluster.pods.length).toBe(5);
    expect(cluster.services.length).toBe(2);
  });

  it('scales deployment up and down correctly', () => {
    const cluster = createInitialCluster();
    const authDep = cluster.deployments[0]; // currently 3 replicas

    // Scale Up to 5
    const scaledUp = scaleDeployment(cluster, authDep.id, 5);
    const upPods = scaledUp.pods.filter(p => p.deploymentId === authDep.id);
    expect(upPods.length).toBe(5);
    expect(scaledUp.deployments.find(d => d.id === authDep.id).replicas).toBe(5);

    // Scale Down to 1
    const scaledDown = scaleDeployment(scaledUp, authDep.id, 1);
    const downPods = scaledDown.pods.filter(p => p.deploymentId === authDep.id);
    expect(downPods.length).toBe(1);
  });

  it('evicts and reschedules pods when a worker node fails', () => {
    const cluster = createInitialCluster();
    const targetNodeId = 'node-worker-1';

    // Count pods originally on node-worker-1
    const initialPodsOnNode = cluster.pods.filter(p => p.nodeId === targetNodeId);
    expect(initialPodsOnNode.length).toBeGreaterThan(0);

    // Crash node 1
    const updated = toggleNodeFailure(cluster, targetNodeId);
    const failedNode = updated.nodes.find(n => n.id === targetNodeId);
    expect(failedNode.status).toBe('NotReady');

    // Pods must have been moved to surviving nodes (worker 2 or worker 3)
    const remainingPodsOnNode = updated.pods.filter(p => p.nodeId === targetNodeId);
    expect(remainingPodsOnNode.length).toBe(0);

    // Total pod count must remain equal
    expect(updated.pods.length).toBe(cluster.pods.length);
  });

  it('routes ingress request to matching Service and load balances across healthy Pods', () => {
    const cluster = createInitialCluster();

    const result = routeIngressRequest(cluster, '/api/auth/login');
    expect(result.success).toBe(true);
    expect(result.service).toBe('auth-api-svc');
    expect(result.pod).toBeDefined();
    expect(result.podIP).toMatch(/^10\.244\./);
    expect(result.node).toBeDefined();
  });
});
