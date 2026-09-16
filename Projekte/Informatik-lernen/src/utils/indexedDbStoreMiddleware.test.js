import { describe, it, expect, beforeEach } from 'vitest';
import {
  syncUserStateToIndexedDb,
  hydrateUserStateFromIndexedDb,
  createStoreSnapshot,
  listStoreSnapshots,
  deleteStoreSnapshot
} from './indexedDbStoreMiddleware';
import { clearStore } from './indexedDbStorage';

describe('indexedDbStoreMiddleware', () => {
  beforeEach(async () => {
    await clearStore('keyvalue');
  });

  it('should sync user state to IndexedDB and hydrate it correctly', async () => {
    const testState = {
      userName: 'Ada Lovelace',
      xp: 1500,
      level: 5,
      completedTopics: ['binary', 'sorting']
    };

    const saved = await syncUserStateToIndexedDb(testState);
    expect(saved).toBe(true);

    const hydrated = await hydrateUserStateFromIndexedDb();
    expect(hydrated).not.toBeNull();
    expect(hydrated.userName).toBe('Ada Lovelace');
    expect(hydrated.xp).toBe(1500);
  });

  it('should create, list, and delete store snapshots', async () => {
    const stateA = { xp: 100, step: 1 };
    const stateB = { xp: 200, step: 2 };

    const snap1 = await createStoreSnapshot('Checkpoint Level 1', stateA);
    const snap2 = await createStoreSnapshot('Checkpoint Level 2', stateB);

    expect(snap1).not.toBeNull();
    expect(snap2).not.toBeNull();

    const snapshots = await listStoreSnapshots();
    expect(snapshots.length).toBe(2);

    const deleted = await deleteStoreSnapshot(snap1.key);
    expect(deleted).toBe(true);

    const remaining = await listStoreSnapshots();
    expect(remaining.length).toBe(1);
    expect(remaining[0].key).toBe(snap2.key);
  });
});
