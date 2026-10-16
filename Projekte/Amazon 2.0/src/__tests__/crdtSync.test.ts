import { describe, it, expect } from 'vitest';
import { CRDTObservedRemoveSet, getNetworkMode, setNetworkMode } from '../utils/crdtSync';

describe('Offline-First CRDT State Machine Engine', () => {
  it('performs conflict-free deterministic merging across replicas', () => {
    const replicaA = new CRDTObservedRemoveSet<string>();
    const replicaB = new CRDTObservedRemoveSet<string>();

    replicaA.add('item-1', 'Sony Headphones', 'node-a', 100);
    replicaB.add('item-2', 'Apple AirPods', 'node-b', 105);

    expect(replicaA.read()).toEqual(['Sony Headphones']);
    expect(replicaB.read()).toEqual(['Apple AirPods']);

    // 2-way Merge
    replicaA.merge(replicaB);
    replicaB.merge(replicaA);

    expect(replicaA.read().sort()).toEqual(['Apple AirPods', 'Sony Headphones'].sort());
    expect(replicaB.read().sort()).toEqual(['Apple AirPods', 'Sony Headphones'].sort());

    // Remove item on A and merge back
    replicaA.remove('item-1', 'node-a', 120);
    replicaB.merge(replicaA);
    expect(replicaB.read()).toEqual(['Apple AirPods']);

    setNetworkMode('offline');
    expect(getNetworkMode()).toBe('offline');
  });
});
