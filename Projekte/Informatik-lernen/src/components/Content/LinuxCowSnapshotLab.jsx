import React, { useState, useMemo } from 'react';
import { HardDrive, Copy, RotateCcw, ShieldCheck, Zap, Terminal, RefreshCw, Layers } from 'lucide-react';
import { 
  createInitialFileSystemState, 
  calculateStorageMetrics, 
  createSnapshot, 
  modifyFileWithCow, 
  rollbackToSnapshot, 
  executeScrub 
} from '../../utils/linuxCowSnapshotEngine';
import { useStore } from '../../store/useStore';

export default function LinuxCowSnapshotLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' | 'scrub' | 'deepdive'

  // FS State
  const [fsState, setFsState] = useState(() => createInitialFileSystemState());
  const [activeFileContent, setActiveFileContent] = useState('SECURE_KERNEL_PARAMETER=1');
  const [lastActionLog, setLastActionLog] = useState('$ btrfs filesystem show /mnt/btrfs\nLabel: "rootfs"  uuid: 4f8a-98bc-11a2\nTotal devices 1 FS bytes used 16.00KiB\n');
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const metrics = useMemo(() => {
    return calculateStorageMetrics(fsState);
  }, [fsState]);

  const handleCreateSnapshot = () => {
    const snapCount = fsState.snapshots.length + 1;
    const snapName = `@snap-backup-${snapCount}`;
    const nextFs = createSnapshot(fsState, 'subvol-root', snapName, true);
    setFsState(nextFs);
    setLastActionLog(prev => prev + `\n$ btrfs subvolume snapshot -r /mnt/btrfs/@root /mnt/btrfs/${snapName}\nCreate a readonly snapshot of '/mnt/btrfs/@root' in '/mnt/btrfs/${snapName}' (0 Bytes physisch kopiert - Metadaten-Pointer geteilt)`);
  };

  const handleModifyFile = () => {
    const nextFs = modifyFileWithCow(fsState, 'subvol-root', '/etc/systemd.conf', activeFileContent);
    setFsState(nextFs);
    setLastActionLog(prev => prev + `\n$ echo "${activeFileContent}" >> /etc/systemd.conf\n[CoW Event] Neuer Datenblock ${nextFs.lastAllocatedBlock} auf Disk alloziert. Quell-Snapshot-Blöcke bleiben unangetastet!`);
  };

  const handleRollback = (snapId, snapName) => {
    const nextFs = rollbackToSnapshot(fsState, 'subvol-root', snapId);
    setFsState(nextFs);
    setLastActionLog(prev => prev + `\n$ btrfs subvolume set-default ${snapId} /mnt/btrfs\n[Rollback] Subvolume @root zeigt wieder auf die Block-Pointer von ${snapName}. Änderungen rückgängig gemacht.`);
  };

  const handleInjectBitRot = () => {
    if (fsState.diskBlocks.length === 0) return;
    const corruptedBlocks = fsState.diskBlocks.map((b, i) => i === 0 ? { ...b, corrupted: true, checksum: 'ERR_BAD' } : b);
    setFsState(prev => ({ ...prev, diskBlocks: corruptedBlocks }));
    setLastActionLog(prev => prev + '\n[Hardware Alert] Silent Data Corruption (Bit-Rot) in Block blk-0 injiziert! Prüfsumme auf Disk stimmt nicht mehr.');
  };

  const handleRunScrub = () => {
    const scrubResult = executeScrub(fsState);
    setFsState(scrubResult.fsState);
    setLastActionLog(prev => prev + `\n$ btrfs scrub start /mnt/btrfs\n${scrubResult.log}`);
  };

  const handleResetFs = () => {
    setFsState(createInitialFileSystemState());
    setLastActionLog('$ btrfs filesystem show /mnt/btrfs\n[Reset] Dateisystem auf Standard initialisiert.\n');
  };

  const handleClaimReward = () => {
    if (!rewardClaimed) {
      awardXP(70);
      setRewardClaimed(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Linux Kernel & Storage
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Btrfs & OpenZFS Architecture
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-cyan-400" />
            Linux Btrfs / ZFS Copy-on-Write (CoW) & Snapshot Sandbox
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simuliere Extent-B-Trees, geteilte physische Disk-Blöcke (Refcounts), atomare 0-Byte-Snapshots, Write-Delta-Allokationen, Instant Rollbacks und Bit-Rot Self-Healing Scrubbing.
          </p>
        </div>

        <button
          onClick={handleClaimReward}
          disabled={rewardClaimed}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg ${
            rewardClaimed 
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 cursor-default'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          {rewardClaimed ? '✓ 70 XP Eingelöst' : '+70 XP Belohnung'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'interactive' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Copy className="w-4 h-4" />
          CoW & Snapshot Simulator
        </button>
        <button
          onClick={() => setActiveTab('scrub')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'scrub' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Bit-Rot & Self-Healing Scrub
        </button>
        <button
          onClick={() => setActiveTab('deepdive')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'deepdive' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Ext4 vs. Btrfs Architektur-Vergleich
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Physische Disk-Blöcke</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{metrics.physicalBlocksUsed} / 16</div>
          <div className="text-xs text-cyan-400 mt-1">{metrics.physicalUsageKb} KiB belegt</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Logische Datenmenge</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.logicalUsageKb} KiB</div>
          <div className="text-xs text-slate-400 mt-1">inkl. aller Snapshots</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Geteilte CoW-Blöcke</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.sharedBlocksCount} Blöcke</div>
          <div className="text-xs text-emerald-400/80 mt-1">Refcount &gt; 1</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Speicherersparnis (CoW)</div>
          <div className="text-2xl font-bold text-teal-400 mt-1">+{metrics.savingsKb} KiB</div>
          <div className="text-xs text-slate-400 mt-1">durch 0-Byte-Snapshots</div>
        </div>
      </div>

      {/* Tab 1: Interactive CoW */}
      {activeTab === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-slate-200">Dateisystem-Aktionen</h2>
              <button 
                onClick={handleResetFs}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <button
                onClick={handleCreateSnapshot}
                className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition"
              >
                <Copy className="w-4 h-4" />
                Snapshot von @root anlegen (0 Bytes Kopie)
              </button>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs text-slate-400 block mb-1">Neuer Inhalt für /etc/systemd.conf</label>
                <input
                  type="text"
                  value={activeFileContent}
                  onChange={e => setActiveFileContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-100 mb-2"
                />
                <button
                  onClick={handleModifyFile}
                  className="w-full py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4" />
                  Datei modifizieren (Copy-on-Write Allokation)
                </button>
              </div>
            </div>

            {/* Subvolumes & Snapshots Tree */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Aktive Subvolumes & Snapshots:</div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {fsState.subvolumes.map(subvol => (
                  <div key={subvol.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                      <span>{subvol.name} (Aktiv RW)</span>
                      <span className="text-[10px] font-mono text-slate-400">3 Dateien</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 space-y-0.5">
                      {subvol.files.map(f => (
                        <div key={f.name} className="flex justify-between">
                          <span>{f.name}</span>
                          <span className="text-slate-200">[{f.blockIds.join(', ')}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {fsState.snapshots.map(snap => (
                  <div key={snap.id} className="p-3 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                      <span>{snap.name} (ReadOnly)</span>
                      <button
                        onClick={() => handleRollback(snap.id, snap.name)}
                        className="text-[10px] px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Rollback
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 space-y-0.5">
                      {snap.files.map(f => (
                        <div key={f.name} className="flex justify-between">
                          <span>{f.name}</span>
                          <span className="text-emerald-400">[{f.blockIds.join(', ')}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Disk Blocks Grid & Terminal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-2">Physische Disk-Blöcke (4 KiB Extents auf SSD)</h2>
              <p className="text-xs text-slate-400 mb-4">
                Grün hervorgehobene Blöcke werden durch CoW-Snapshots geteilt (Refcount &gt; 1). Neue Schreibzugriffe überschreiben keine Blöcke, sondern belegen freie Disk-Slots.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: fsState.capacityBlocks }).map((_, idx) => {
                  const block = fsState.diskBlocks[idx];
                  const refCount = block ? (metrics.refCounts[block.id] || 0) : 0;
                  const isShared = refCount > 1;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] transition ${
                        block 
                          ? block.corrupted 
                            ? 'bg-rose-950/40 border-rose-500' 
                            : isShared 
                              ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-950' 
                              : 'bg-slate-800/80 border-slate-700'
                          : 'bg-slate-950/40 border-slate-800 border-dashed text-slate-600'
                      }`}
                    >
                      {block ? (
                        <>
                          <div className="flex justify-between items-center text-xs font-mono font-bold">
                            <span className="text-slate-300">{block.id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                              isShared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                            }`}>
                              Ref:{refCount}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate my-1">
                            {block.data}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                            <span>CRC: {block.checksum}</span>
                            {block.corrupted && <span className="text-rose-400 font-bold">BIT-ROT!</span>}
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs font-mono">
                          Freier Block
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terminal Live Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-slate-500">
                <Terminal className="w-3.5 h-3.5" />
                <span>btrfs-progs CLI Emulator</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto text-emerald-400">
                {lastActionLog}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scrub */}
      {activeTab === 'scrub' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Btrfs Scrub & Bit-Rot Self-Healing (Prüfsummen-Reparatur)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Silent Data Corruption entsteht durch alternden Flash-Speicher oder magnetische Bit-Flips ohne Festplatten-Fehlermeldung. Btrfs speichert für jeden Datenblock eine Prüfsumme (CRC32C / Blake2b) im Metadatenbaum.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInjectBitRot}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                Bit-Rot injizieren
              </button>
              <button
                onClick={handleRunScrub}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-cyan-900/30"
              >
                <ShieldCheck className="w-4 h-4" />
                btrfs scrub start
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
              <div className="font-semibold text-cyan-300">1. Datenlesung & Checksum-Audit</div>
              <p className="text-slate-300 leading-relaxed">
                Beim Lesen jedes Blocks errechnet der Kernel die Prüfsumme neu. Weicht diese vom im B-Tree gespeicherten Wert ab, meldet der Kernel einen Checksum-Mismatch (`csum failed`).
              </p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
              <div className="font-semibold text-emerald-300">2. Automatische Selbstreparatur (Self-Healing)</div>
              <p className="text-slate-300 leading-relaxed">
                Sofern RAID 1, RAID 10 oder das DUP-Metadatenprofil aktiv ist, lädt Btrfs automatisch die intakte Kopie vom zweiten Spiegel und überschreibt den defekten Sektor transparent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Deep Dive */}
      {activeTab === 'deepdive' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-rose-400">Klassisches Dateisystem: Ext4 / XFS</h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li><strong>In-Place Overwrite</strong>: Beim Ändern einer Datei wird der physische Festplattensektor direkt überschrieben.</li>
              <li><strong>Snapshots nur über LVM</strong>: Erfordert LVM Thin Provisioning mit komplexem Volume-Management außerhalb des Dateisystems.</li>
              <li><strong>Keine Datenprüfsummen</strong>: Ext4 prüft nur Metadaten. Stille Datenkorruption in Nutzerdateien bleibt unbemerkt.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-cyan-400">Next-Gen CoW: Btrfs & OpenZFS</h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li><strong>Copy-on-Write</strong>: Modifikationen schreiben immer auf neue freie Blöcke. Der alte Zustand bleibt atomar erhalten.</li>
              <li><strong>Subvolumes & 0-Byte-Snapshots</strong>: Snapshots entstehen in Millisekunden und teilen bestehende Block-Pointer.</li>
              <li><strong>End-to-End Integrität</strong>: Jeder Daten- und Metadatenblock ist kryptografisch geschützt (`btrfs scrub`).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
