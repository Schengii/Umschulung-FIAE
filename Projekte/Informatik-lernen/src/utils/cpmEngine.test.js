import { describe, it, expect } from 'vitest';
import { calculateCpmNetwork, DEFAULT_CPM_PROJECT } from './cpmEngine';

describe('cpmEngine (IHK Netzplantechnik DIN 69900)', () => {
  it('berechnet Vorwärts- und Rückwärtsrechnung sowie Projektdauer korrekt', () => {
    const result = calculateCpmNetwork(DEFAULT_CPM_PROJECT);

    expect(result.hasCycle).toBe(false);
    expect(result.projectDuration).toBe(17);
    expect(result.criticalPath).toEqual(['A', 'B', 'D', 'F', 'G']);

    const nodeA = result.nodes.find(n => n.id === 'A');
    expect(nodeA.faz).toBe(0);
    expect(nodeA.fez).toBe(3);
    expect(nodeA.saz).toBe(0);
    expect(nodeA.sez).toBe(3);
    expect(nodeA.gp).toBe(0);
    expect(nodeA.fp).toBe(0);
    expect(nodeA.isCritical).toBe(true);

    const nodeC = result.nodes.find(n => n.id === 'C');
    expect(nodeC.faz).toBe(3);
    expect(nodeC.fez).toBe(5);
    expect(nodeC.saz).toBe(6);
    expect(nodeC.sez).toBe(8);
    expect(nodeC.gp).toBe(3);
    expect(nodeC.fp).toBe(2);
    expect(nodeC.isCritical).toBe(false);
  });

  it('erkennt zyklische Abhängigkeiten und vermeidet Endlosschleifen', () => {
    const cyclicGraph = [
      { id: '1', name: 'Task 1', duration: 2, predecessors: ['2'] },
      { id: '2', name: 'Task 2', duration: 3, predecessors: ['1'] }
    ];

    const result = calculateCpmNetwork(cyclicGraph);
    expect(result.hasCycle).toBe(true);
    expect(result.criticalPath).toEqual([]);
    expect(result.projectDuration).toBe(0);
  });

  it('behandelt leere Netzpläne fehlerfrei', () => {
    const result = calculateCpmNetwork([]);
    expect(result.projectDuration).toBe(0);
    expect(result.nodes).toEqual([]);
    expect(result.hasCycle).toBe(false);
  });
});
