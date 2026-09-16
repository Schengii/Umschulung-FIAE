import React, { useState, useMemo } from 'react';
import { 
  Database, HardDrive, Layers, Award 
} from 'lucide-react';
import { calculateRaidStorage, RAID_LEVELS } from '../../utils/raidEngine';
import { useStore } from '../../store/useStore';

export default function RaidCalculatorLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [raidLevel, setRaidLevel] = useState(5);
  const [diskCount, setDiskCount] = useState(4);
  const [diskSizeTB, setDiskSizeTB] = useState(4);
  const [rebuildSpeedMBs, setRebuildSpeedMBs] = useState(150);
  const [xpClaimed, setXpClaimed] = useState(false);

  const raidData = useMemo(() => {
    return calculateRaidStorage({
      raidLevel,
      diskCount,
      diskSizeTB,
      rebuildSpeedMBs
    });
  }, [raidLevel, diskCount, diskSizeTB, rebuildSpeedMBs]);

  const handleClaimXP = () => {
    if (!xpClaimed) {
      if (onRewardXP) onRewardXP(45);
      else awardXP(45, 'raid_master');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={14} /> IHK FISI &amp; AP1 Standard
              </span>
              <span className="badge badge-teal">Lernfeld 4 &amp; 7</span>
              <span className="badge badge-green">Storage Architekturen</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              RAID Storage &amp; Paritäts-Rechner
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Simuliere RAID 0, 1, 5, 6, 10 und 50. Berechne Netto-Nutzdaten, Paritäts-Overhead, tolerierte Festplattenausfälle, Write Penalty, Rebuild-Dauer und das Risiko von URE (Unrecoverable Read Errors).
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleClaimXP}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Award size={18} />
            {xpClaimed ? 'XP eingesammelt!' : 'Storage Meister (+45 XP)'}
          </button>
        </div>
      </div>

      {/* RAID Level Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[0, 1, 5, 6, 10, 50].map((lvl) => (
          <button
            key={lvl}
            className={`btn ${raidLevel === lvl ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => {
              setRaidLevel(lvl);
              setDiskCount(prev => Math.max(prev, RAID_LEVELS[lvl].minDisks));
            }}
            style={{ minHeight: '40px', fontWeight: 700 }}
          >
            RAID {lvl}
          </button>
        ))}
      </div>

      {/* Config & Metrics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Controls */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" />
            Konfiguration
          </h2>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Anzahl Festplatten (Disks):</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{diskCount} Platten</span>
            </div>
            <input
              type="range"
              min={raidData.minDisks}
              max={16}
              step={raidLevel === 10 ? 2 : 1}
              value={diskCount}
              onChange={(e) => setDiskCount(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mindestanzahl für RAID {raidLevel}: {raidData.minDisks} Platten
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Größe pro Festplatte:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-teal)' }}>{diskSizeTB} TB</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={diskSizeTB}
              onChange={(e) => setDiskSizeTB(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Rebuild-Durchsatz:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-amber)' }}>{rebuildSpeedMBs} MB/s</span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={25}
              value={rebuildSpeedMBs}
              onChange={(e) => setRebuildSpeedMBs(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Ausfallsicherheit: </span>
            <span style={{ color: 'var(--text-muted)' }}>{raidData.faultToleranceDescription}</span>
          </div>
        </div>

        {/* Calculated Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Nutzdaten-Kapazität</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-emerald)', margin: '4px 0' }}>{raidData.usableCapacityTB} TB</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effizienz: {raidData.efficiencyPercent}%</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Parität &amp; Redundanz</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-amber)', margin: '4px 0' }}>{raidData.parityCapacityTB} TB</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overhead: {raidData.redundancyPercent}%</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Tolerierte Ausfälle</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '4px 0' }}>{raidData.maxFailedDisks} Platten</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Write Penalty: {raidData.writePenalty}x IOPS</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Rebuild-Dauer</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-purple)', margin: '4px 0' }}>ca. {raidData.rebuildHours} h</div>
            <div style={{ fontSize: '0.75rem', color: raidData.isUreRiskHigh ? 'var(--accent-rose)' : 'var(--text-muted)', fontWeight: raidData.isUreRiskHigh ? 700 : 400 }}>
              URE-Risiko: {raidData.urePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Disk Block Striping Array */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--accent-teal)" />
          Interaktives Festplatten-Array: Striping &amp; Paritäts-Layout
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${raidData.diskMatrix.length}, minmax(120px, 1fr))`, gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
          {raidData.diskMatrix.map((disk) => (
            <div
              key={disk.diskId}
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <HardDrive size={22} color="var(--accent-primary)" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>HDD {disk.diskId}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{diskSizeTB} TB</div>
              </div>

              {disk.blocks.map((b, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: b.isParity ? 'rgba(217, 119, 6, 0.15)' : 'rgba(79, 70, 229, 0.12)',
                    color: b.isParity ? 'var(--accent-amber)' : 'var(--accent-primary)',
                    border: b.isParity ? '1px dashed var(--accent-amber)' : '1px solid rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
