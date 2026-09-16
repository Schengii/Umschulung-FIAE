/**
 * Linux Btrfs / ZFS Copy-on-Write (CoW) & Snapshot Sandbox Engine
 * Simulates Extent-level B-Tree pointers, shared storage blocks, refcounts,
 * atomic snapshots, write-delta allocations, instant rollbacks, and Bit-Rot Scrubbing.
 */

/**
 * Erzeugt einen initialen Dateisystem-Zustand mit Datenblöcken
 */
export function createInitialFileSystemState() {
  return {
    capacityBlocks: 16,
    blockSizeKb: 4,
    // Physische Disk-Blöcke
    diskBlocks: [
      { id: 'blk-0', data: 'KERNEL_VMLINUZ_BIN', checksum: 'E9A12B', corrupted: false },
      { id: 'blk-1', data: 'SYSTEMD_INIT_CONF', checksum: 'C4D38E', corrupted: false },
      { id: 'blk-2', data: 'POSTGRES_DB_TUPLES', checksum: '8F21DA', corrupted: false },
      { id: 'blk-3', data: 'NGINX_ACCESS_LOG', checksum: '31BC77', corrupted: false }
    ],
    // Subvolumes (z.B. @root, @home)
    subvolumes: [
      {
        id: 'subvol-root',
        name: '@root',
        isSnapshot: false,
        isReadonly: false,
        files: [
          { name: '/boot/vmlinuz', blockIds: ['blk-0'], sizeKb: 4 },
          { name: '/etc/systemd.conf', blockIds: ['blk-1'], sizeKb: 4 },
          { name: '/var/lib/pgsql/data', blockIds: ['blk-2'], sizeKb: 4 }
        ]
      }
    ],
    // Snapshots
    snapshots: []
  };
}

/**
 * Berechnet Block-Referenzen und Speicherverbrauch (Deduplizierung vs. Physischer Speicher)
 */
export function calculateStorageMetrics(fsState) {
  const refCounts = {};
  fsState.diskBlocks.forEach(b => {
    refCounts[b.id] = 0;
  });

  // Alle Subvolumes und Snapshots durchzählen
  const allContainers = [...fsState.subvolumes, ...fsState.snapshots];
  let logicalUsageKb = 0;

  allContainers.forEach(container => {
    container.files.forEach(file => {
      file.blockIds.forEach(blkId => {
        if (refCounts[blkId] !== undefined) {
          refCounts[blkId]++;
        }
        logicalUsageKb += fsState.blockSizeKb;
      });
    });
  });

  const physicalBlocksUsed = fsState.diskBlocks.length;
  const physicalUsageKb = physicalBlocksUsed * fsState.blockSizeKb;
  const freeBlocks = Math.max(0, fsState.capacityBlocks - physicalBlocksUsed);
  const freeSpaceKb = freeBlocks * fsState.blockSizeKb;
  const sharedBlocksCount = Object.values(refCounts).filter(count => count > 1).length;
  const savingsKb = Math.max(0, logicalUsageKb - physicalUsageKb);

  return {
    totalCapacityKb: fsState.capacityBlocks * fsState.blockSizeKb,
    physicalUsageKb,
    logicalUsageKb,
    freeSpaceKb,
    physicalBlocksUsed,
    freeBlocks,
    sharedBlocksCount,
    savingsKb,
    refCounts
  };
}

/**
 * Erstellt einen atomaren CoW-Snapshot eines Subvolumes
 * @param {Object} fsState - Aktueller FS-Zustand
 * @param {string} sourceSubvolId - Quell-Subvolume
 * @param {string} snapshotName - Name des Snapshots (z.B. @snapshot-backup)
 * @param {boolean} isReadonly - Schreibgeschützter Snapshot
 */
export function createSnapshot(fsState, sourceSubvolId, snapshotName, isReadonly = true) {
  const source = fsState.subvolumes.find(s => s.id === sourceSubvolId);
  if (!source) {
    throw new Error(`Quell-Subvolume ${sourceSubvolId} nicht gefunden.`);
  }

  // Atomar: Exakt dieselben Block-IDs referenzieren! Keine physische Datenkopie.
  const newSnapshot = {
    id: `snap-${Date.now().toString().slice(-4)}`,
    name: snapshotName,
    sourceSubvolId: source.id,
    isSnapshot: true,
    isReadonly,
    createdAt: new Date().toISOString(),
    files: source.files.map(f => ({
      name: f.name,
      blockIds: [...f.blockIds],
      sizeKb: f.sizeKb
    }))
  };

  return {
    ...fsState,
    snapshots: [...fsState.snapshots, newSnapshot]
  };
}

/**
 * Copy-on-Write Datei-Modifikation:
 * Überschreibt NICHT den existierenden Block, sondern alloziert einen neuen Block!
 */
export function modifyFileWithCow(fsState, subvolId, fileName, newContent) {
  const targetSubvol = fsState.subvolumes.find(s => s.id === subvolId);
  if (!targetSubvol) {
    throw new Error(`Subvolume ${subvolId} nicht gefunden.`);
  }
  if (targetSubvol.isReadonly) {
    throw new Error('Operation verweigert: Subvolume ist Read-Only!');
  }

  const targetFile = targetSubvol.files.find(f => f.name === fileName);
  if (!targetFile) {
    throw new Error(`Datei ${fileName} in Subvolume nicht gefunden.`);
  }

  // Neuer Block wird auf der Disk reserviert
  const newBlockId = `blk-${Date.now().toString().slice(-4)}`;
  const newBlock = {
    id: newBlockId,
    data: newContent,
    checksum: Math.abs(newContent.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase().slice(0, 6),
    corrupted: false
  };

  // Subvolume Pointer wird auf den neuen Block umgeleitet (CoW Delta)
  const updatedSubvolumes = fsState.subvolumes.map(s => {
    if (s.id !== subvolId) return s;
    return {
      ...s,
      files: s.files.map(f => {
        if (f.name !== fileName) return f;
        return {
          ...f,
          blockIds: [newBlockId] // Jetzt zeigt die aktive Datei auf den neuen Block!
        };
      })
    };
  });

  return {
    ...fsState,
    diskBlocks: [...fsState.diskBlocks, newBlock],
    subvolumes: updatedSubvolumes,
    lastAllocatedBlock: newBlockId
  };
}

/**
 * Führt ein Rollback eines Subvolumes auf den Zustand eines Snapshots durch
 */
export function rollbackToSnapshot(fsState, subvolId, snapshotId) {
  const snapshot = fsState.snapshots.find(s => s.id === snapshotId);
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} nicht gefunden.`);
  }

  const updatedSubvolumes = fsState.subvolumes.map(s => {
    if (s.id !== subvolId) return s;
    return {
      ...s,
      files: snapshot.files.map(f => ({
        name: f.name,
        blockIds: [...f.blockIds],
        sizeKb: f.sizeKb
      }))
    };
  });

  return {
    ...fsState,
    subvolumes: updatedSubvolumes
  };
}

/**
 * Führt einen btrfs scrub zur Erkennung und Reparatur von Bit-Rot (Silent Data Corruption) durch
 */
export function executeScrub(fsState) {
  const corruptedBlocks = [];
  const repairedBlocks = [];

  const updatedBlocks = fsState.diskBlocks.map(block => {
    if (block.corrupted) {
      corruptedBlocks.push(block.id);
      // Btrfs Self-Healing: Aus Parität/Mirror rekonstruieren
      repairedBlocks.push(block.id);
      return {
        ...block,
        corrupted: false
      };
    }
    return block;
  });

  return {
    fsState: {
      ...fsState,
      diskBlocks: updatedBlocks
    },
    corruptedCount: corruptedBlocks.length,
    repairedCount: repairedBlocks.length,
    status: corruptedBlocks.length > 0 ? 'SCRUB_REPAIRED' : 'SCRUB_CLEAN',
    log: corruptedBlocks.length > 0
      ? `BTRFS Scrub fertiggestellt: ${corruptedBlocks.length} fehlerhafte(r) Block/Blöcke via Checksumme (CRC32C) erkannt und aus DUP/Mirror-Kopie repariert.`
      : 'BTRFS Scrub fertiggestellt: 0 Datenfehler festgestellt. Alle Prüfsummen intakt.'
  };
}
