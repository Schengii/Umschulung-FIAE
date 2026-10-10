import { describe, it, expect } from 'vitest';
import {
  electRootBridge,
  computeSpanningTree,
  getConvergenceMetrics,
  generateCiscoStpConfig
} from './stpProtocolEngine';

describe('stpProtocolEngine', () => {
  const sampleSwitches = [
    { id: 'sw1', name: 'Core-SW-1', priority: 4096, mac: '00:1A:2B:3C:4D:01' },
    { id: 'sw2', name: 'Dist-SW-2', priority: 32768, mac: '00:1A:2B:3C:4D:02' },
    { id: 'sw3', name: 'Dist-SW-3', priority: 32768, mac: '00:1A:2B:3C:4D:03' }
  ];

  const sampleLinks = [
    { id: 'l1', switchA: 'sw1', portA: 'Gi0/1', switchB: 'sw2', portB: 'Gi0/1', speed: '1G' },
    { id: 'l2', switchA: 'sw1', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/1', speed: '1G' },
    { id: 'l3', switchA: 'sw2', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/2', speed: '1G' }
  ];

  it('elects the switch with lowest priority as Root Bridge', () => {
    const root = electRootBridge(sampleSwitches);
    expect(root.id).toBe('sw1');
    expect(root.priority).toBe(4096);
  });

  it('breaks priority ties using lowest MAC address', () => {
    const tiedSwitches = [
      { id: 'swA', name: 'SW-A', priority: 32768, mac: '00:00:00:00:00:02' },
      { id: 'swB', name: 'SW-B', priority: 32768, mac: '00:00:00:00:00:01' }
    ];
    const root = electRootBridge(tiedSwitches);
    expect(root.id).toBe('swB');
  });

  it('computes spanning tree topology and assigns port roles correctly', () => {
    const result = computeSpanningTree(sampleSwitches, sampleLinks, 'rstp');
    expect(result.rootBridge.id).toBe('sw1');

    // All active ports on Root Bridge must be DESIGNATED
    expect(result.portAssignments['sw1:Gi0/1'].role).toBe('DESIGNATED');
    expect(result.portAssignments['sw1:Gi0/2'].role).toBe('DESIGNATED');

    // SW2 and SW3 direct link to root is their Root Port
    expect(result.portAssignments['sw2:Gi0/1'].role).toBe('ROOT');
    expect(result.portAssignments['sw3:Gi0/1'].role).toBe('ROOT');

    // Between SW2 and SW3 (link l3): both have cost 4 to root.
    // SW2 has lower MAC than SW3 -> SW2:Gi0/2 is DESIGNATED, SW3:Gi0/2 is ALTERNATE (BLOCKED)
    expect(result.portAssignments['sw2:Gi0/2'].role).toBe('DESIGNATED');
    expect(result.portAssignments['sw3:Gi0/2'].role).toBe('ALTERNATE');
    expect(result.portAssignments['sw3:Gi0/2'].state).toBe('DISCARDING');

    expect(result.blockedLinks).toContain('l3');
    expect(result.activeLinks).toContain('l1');
    expect(result.activeLinks).toContain('l2');
  });

  it('computes higher path cost correctly for slower link speeds', () => {
    const linksWithSlow = [
      { id: 'l1', switchA: 'sw1', portA: 'Gi0/1', switchB: 'sw2', portB: 'Gi0/1', speed: '100M' }, // Cost 19
      { id: 'l2', switchA: 'sw1', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/1', speed: '1G' },   // Cost 4
      { id: 'l3', switchA: 'sw2', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/2', speed: '1G' }    // Cost 4
    ];
    const result = computeSpanningTree(sampleSwitches, linksWithSlow, 'rstp');
    // SW2 via SW3 is cost 4+4=8, while direct to root is cost 19.
    // Root port for SW2 should be Gi0/2 (via SW3, cost 8)!
    expect(result.portAssignments['sw2:Gi0/2'].role).toBe('ROOT');
    expect(result.switchRootCosts['sw2']).toBe(8);
  });

  it('provides convergence metrics for STP and RSTP', () => {
    const stpMetrics = getConvergenceMetrics('stp');
    const rstpMetrics = getConvergenceMetrics('rstp');
    expect(stpMetrics.convergenceTimeMs).toBe(30000);
    expect(rstpMetrics.convergenceTimeMs).toBeLessThan(100);
  });

  it('generates Cisco IOS CLI configurations', () => {
    const configs = generateCiscoStpConfig(sampleSwitches, 'rapid-pvst');
    expect(configs['sw1']).toContain('spanning-tree mode rapid-pvst');
    expect(configs['sw1']).toContain('priority 4096');
    expect(configs['sw1']).toContain('ROOT BRIDGE');
  });
});
