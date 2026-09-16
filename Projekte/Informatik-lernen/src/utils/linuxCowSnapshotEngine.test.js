import { describe, it, expect } from 'vitest';
import { 
  createInitialFileSystemState, 
  calculateStorageMetrics, 
  createSnapshot, 
  modifyFileWithCow, 
  rollbackToSnapshot, 
  executeScrub 
} from './linuxCowSnapshotEngine';

describe('linuxCowSnapshotEngine', () => {
  it('initializes file system state and calculates block metrics', () => {
    const fs = createInitialFileSystemState();
    const metrics = calculateStorageMetrics(fs);
    expect(metrics.physicalBlocksUsed).toBe(4);
    expect(metrics.sharedBlocksCount).toBe(0);
    expect(metrics.savingsKb).toBe(0);
  });

  it('creates an instant atomic snapshot sharing blocks with zero data duplicate overhead', () => {
    const fs = createInitialFileSystemState();
    const fsWithSnap = createSnapshot(fs, 'subvol-root', '@snapshot-1', true);
    expect(fsWithSnap.snapshots.length).toBe(1);
    expect(fsWithSnap.snapshots[0].name).toBe('@snapshot-1');

    // Physical disk blocks must NOT increase on snapshot creation!
    expect(fsWithSnap.diskBlocks.length).toBe(fs.diskBlocks.length);

    const metrics = calculateStorageMetrics(fsWithSnap);
    expect(metrics.sharedBlocksCount).toBe(3); // 3 files are now shared
    expect(metrics.savingsKb).toBeGreaterThan(0);
  });

  it('allocates a new delta block on write without modifying the snapshot (Copy-on-Write)', () => {
    let fs = createInitialFileSystemState();
    fs = createSnapshot(fs, 'subvol-root', '@snap-pre-update', true);

    const originalBlockCount = fs.diskBlocks.length;
    const originalFileBlock = fs.subvolumes[0].files[1].blockIds[0];

    // Modify file
    fs = modifyFileWithCow(fs, 'subvol-root', '/etc/systemd.conf', 'PATCHED_CONFIGURATION_LINE');

    // 1 new block allocated
    expect(fs.diskBlocks.length).toBe(originalBlockCount + 1);

    // Active subvolume points to new block
    const activeFileBlock = fs.subvolumes[0].files[1].blockIds[0];
    expect(activeFileBlock).not.toBe(originalFileBlock);

    // Snapshot STILL points to the old original block!
    const snapFileBlock = fs.snapshots[0].files[1].blockIds[0];
    expect(snapFileBlock).toBe(originalFileBlock);
  });

  it('reverts file pointers during rollback and repairs bit-rot during scrub', () => {
    let fs = createInitialFileSystemState();
    fs = createSnapshot(fs, 'subvol-root', '@snap-restore-point', true);
    const snapId = fs.snapshots[0].id;
    const originalBlock = fs.subvolumes[0].files[1].blockIds[0];

    // Change file
    fs = modifyFileWithCow(fs, 'subvol-root', '/etc/systemd.conf', 'DAMAGED_DATA');
    expect(fs.subvolumes[0].files[1].blockIds[0]).not.toBe(originalBlock);

    // Rollback
    fs = rollbackToSnapshot(fs, 'subvol-root', snapId);
    expect(fs.subvolumes[0].files[1].blockIds[0]).toBe(originalBlock);

    // Simulate bit-rot and run scrub
    fs.diskBlocks[0].corrupted = true;
    const scrubResult = executeScrub(fs);
    expect(scrubResult.corruptedCount).toBe(1);
    expect(scrubResult.repairedCount).toBe(1);
    expect(scrubResult.status).toBe('SCRUB_REPAIRED');
    expect(scrubResult.fsState.diskBlocks[0].corrupted).toBe(false);
  });
});
