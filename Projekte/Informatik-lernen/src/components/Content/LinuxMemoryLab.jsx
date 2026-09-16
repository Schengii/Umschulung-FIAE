import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Cpu, HardDrive, Search, Award } from 'lucide-react';
import { LinuxMemorySimulator } from '../../utils/linuxMemoryEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function LinuxMemoryLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [addrInput, setAddrInput] = useState('0x7ffd040');
  const [accessResult, setAccessResult] = useState(null);
  const [procRss, setProcRss] = useState(2500);
  const [oomAdj, setOomAdj] = useState(0);
  const [solved, setSolved] = useState(false);

  const simRef = useRef(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    simRef.current = new LinuxMemorySimulator(4096, 2048);
    setTick(t => t + 1);
  }, []);

  const handleAccess = () => {
    if (!simRef.current) return;
    const res = simRef.current.accessMemory(addrInput);
    setAccessResult(res);
    triggerHaptic(res.status === 'TLB_HIT' ? 'SUCCESS' : 'WARNING');
    setTick(t => t + 1);
    checkXP();
  };

  const oomInfo = useMemo(() => {
    if (!simRef.current) return { oomScore: 0, riskLevel: 'LOW' };
    return simRef.current.calculateOomScore(procRss, oomAdj);
  }, [procRss, oomAdj]);

  const checkXP = () => {
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'linux_memory_master');
      }
    }
  };

  const stats = simRef.current ? simRef.current.pageFaultStats : { tlbHits: 0, minorFaults: 0, majorFaults: 0 };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} /> Linux Kernel &amp; OS Internals
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={14} /> Virtual Memory, Page Faults &amp; OOM-Killer
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🧠 Linux Virtual Memory &amp; Page Fault Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Simuliere virtuelle Adressübersetzung via TLB, beobachte Minor vs. Major Page Faults (Swap Disk I/O) und berechne den Linux OOM-Score (`/proc/[pid]/oom_score`).
          </p>
        </div>

        <button
          onClick={() => { handleAccess(); checkXP(); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Adress-Lookup Bestätigen (+45 XP)
        </button>
      </div>

      {/* Memory Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TLB Cache Hits:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {stats.tlbHits} Hits
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Minor Page Faults (Cache):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {stats.minorFaults} Faults
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Major Page Faults (Disk Swap):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>
            {stats.majorFaults} Faults
          </div>
        </div>
      </div>

      {/* Interactive Virtual Address Bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Virtuelle Hex-Adresse:</label>
          <input
            type="text"
            value={addrInput}
            onChange={(e) => setAddrInput(e.target.value)}
            style={{ width: '160px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <button
            onClick={handleAccess}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Search size={14} /> Übersetzen (MMU)
          </button>
        </div>
      </div>

      {/* Address Resolution Result Card */}
      {accessResult && (
        <div style={{ background: accessResult.status === 'TLB_HIT' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', border: `1px solid ${accessResult.status === 'TLB_HIT' ? '#10b981' : '#f59e0b'}`, borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Status: {accessResult.status}</span>
            <span>Latenz: {accessResult.latencyNs >= 1000 ? `${(accessResult.latencyNs / 1000).toFixed(1)} µs` : `${accessResult.latencyNs} ns`}</span>
          </div>
          <div style={{ marginTop: '6px', fontFamily: 'monospace' }}>
            Virtuell: <code>{accessResult.virtualAddress}</code> ➔ Physischer RAM: <code>{accessResult.physicalAddress}</code>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {accessResult.description}
          </div>
        </div>
      )}

      {/* Linux OOM Killer Score Calculator Grid */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
          Linux OOM (Out-of-Memory) Killer Score Rechner (`/proc/[pid]/oom_score`):
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Prozess RSS Speicher: {procRss} MB (von 4096 MB RAM)
            </label>
            <input
              type="range"
              min="100"
              max="4000"
              step="50"
              value={procRss}
              onChange={(e) => setProcRss(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', marginBottom: '6px' }}>
              oom_score_adj [-1000 bis 1000]: {oomAdj}
            </label>
            <input
              type="range"
              min="-1000"
              max="1000"
              step="50"
              value={oomAdj}
              onChange={(e) => setOomAdj(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Berechneter `oom_score`:</span>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: oomInfo.oomScore >= 600 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
              {oomInfo.oomScore} / 1000
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', marginTop: '4px', color: oomInfo.oomScore >= 600 ? '#ef4444' : 'var(--text-muted)' }}>
              Risiko: {oomInfo.riskLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
