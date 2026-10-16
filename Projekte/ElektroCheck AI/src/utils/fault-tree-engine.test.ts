import { describe, it, expect } from 'vitest';
import { getTreeNode, getCategoryTrees } from './fault-tree-engine';

describe('fault-tree-engine', () => {
  it('Test 1: Category retrieval', () => {
    const motorTrees = getCategoryTrees('MOTOR');
    expect(motorTrees.length > 0, 'Test 1 failed: Motor tree should exist').toBe(true);
    expect(motorTrees[0].id === 'motor_tree', 'Test 1 failed: motor_tree ID mismatch').toBe(true);
  });

  it('Test 2: Tree root node retrieval', () => {
    const rootNode = getTreeNode('motor_tree', 'node_m1');
    expect(rootNode !== null, 'Test 2 failed: Root node node_m1 should exist').toBe(true);
    expect(rootNode?.options.length === 3, 'Test 2 failed: Root node should have 3 options').toBe(true);
  });

  it('Test 3: Path navigation from root to motor phase loss diagnosis', () => {
    const rootNode = getTreeNode('motor_tree', 'node_m1');
    const step1 = rootNode?.options[0]; // Motor brummt laut
    expect(step1?.nextNodeId === 'node_m2', 'Test 3 failed: Next node should be node_m2').toBe(true);

    const nodeM2 = getTreeNode('motor_tree', step1!.nextNodeId);
    const step2 = nodeM2?.options[1]; // Nein, eine Phase fehlt
    expect(step2?.nextNodeId === 'diag_m_phase_loss', 'Test 3 failed: Should point to diag_m_phase_loss').toBe(true);

    const finalDiagNode = getTreeNode('motor_tree', step2!.nextNodeId);
    expect(finalDiagNode?.diagnosis !== undefined, 'Test 3 failed: Final node must have diagnosis object').toBe(true);
    expect(finalDiagNode?.diagnosis?.deviceName === '3-Phasen Asynchronmotor', 'Test 3 failed: Device name mismatch').toBe(true);
  });

  it('Test 4: RCD distribution tree navigation', () => {
    const rcdRootNode = getTreeNode('distribution_tree', 'node_d1');
    expect(rcdRootNode !== null, 'Test 4 failed: Distribution root node should exist').toBe(true);
  });

});
