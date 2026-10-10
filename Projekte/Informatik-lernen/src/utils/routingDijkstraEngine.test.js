import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NETWORK_TOPOLOGY,
  calculateDijkstra,
  calculateSpanningTree
} from './routingDijkstraEngine';

describe('routingDijkstraEngine', () => {
  it('correctly calculates shortest path from R1 to R6 using Dijkstra', () => {
    const { nodes, edges } = DEFAULT_NETWORK_TOPOLOGY;
    const result = calculateDijkstra(nodes, edges, 'R1', 'R6');

    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.path[0]).toBe('R1');
    expect(result.path[result.path.length - 1]).toBe('R6');
    // R1 -> R2 (4) -> R3 (2) -> R5 (3) -> R6 (2) = 11 vs R1->R2->R4(6)->R6(5) = 15
    expect(result.totalCost).toBe(11);
    expect(result.path).toEqual(['R1', 'R2', 'R3', 'R5', 'R6']);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('identifies Root Bridge and calculates STP blocking ports to prevent switching loops', () => {
    const { nodes, edges } = DEFAULT_NETWORK_TOPOLOGY;
    const stp = calculateSpanningTree(nodes, edges);

    // R1 has lowest priority 4096 -> must be Root Bridge
    expect(stp.rootBridgeId).toBe('R1');
    expect(stp.nodeRoles['R1'].isRootBridge).toBe(true);
    expect(stp.nodeRoles['R1'].costToRoot).toBe(0);

    // Number of forwarding edges in a spanning tree with N nodes must be N - 1
    expect(stp.forwardingEdges.length).toBe(nodes.length - 1);
    expect(stp.blockedEdges.length).toBe(edges.length - (nodes.length - 1));
  });

  it('handles isolated or unreachable targets gracefully', () => {
    const nodes = [
      { id: 'A', label: 'A', x: 0, y: 0, priority: 32768, mac: '00:00:00:00:00:01' },
      { id: 'B', label: 'B', x: 10, y: 0, priority: 32768, mac: '00:00:00:00:00:02' }
    ];
    const edges = [];
    const result = calculateDijkstra(nodes, edges, 'A', 'B');
    expect(result.totalCost).toBe(-1);
    expect(result.path).toEqual([]);
  });
});
