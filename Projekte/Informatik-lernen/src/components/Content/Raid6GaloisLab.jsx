import React, { useState, useMemo } from 'react';
import { 
  Database, HardDrive, ShieldCheck, ShieldAlert, 
  Check, Award, Calculator, AlertTriangle
} from 'lucide-react';
import { 
  calculateRaid6Parity, 
  simulateRaid6Recovery 
} from '../../utils/raid6GaloisEngine';
import { useStore } from '../../store/useStore';

export default function Raid6GaloisLab() {
  const { awardXP } = useStore();
  const [dataDisks, setDataDisks] = useState([65, 66, 67, 68]); // Byte values (A, B, C, D)
  const [failedDisks, setFailedDisks] = useState([0, 1]); // Indices of failed disks
  const [xpClaimed, setXpClaimed] = useState(false);

  // Parity computation
  const parityResult = useMemo(() => {
    return calculateRaid6Parity(dataDisks);
  }, [dataDisks]);

  // Recovery simulation
  const recoveryResult = useMemo(() => {
    return simulateRaid6Recovery(dataDisks, failedDisks);
  }, [dataDisks, failedDisks]);

  const toggleDiskFailure = (diskIndex) => {
    setFailedDisks((prev) => {
      let next;
      if (prev.includes(diskIndex)) {
        next = prev.filter((d) => d !== diskIndex);
      } else {
        next = [...prev, diskIndex];
      }
      return next;
    });

    if (!xpClaimed) {
      setXpClaimed(true);
      awardXP(65, 'raid6_galois_master');
    }
  };

  const handleUpdateByte = (index, val) => {
    const num = Math.max(0, Math.min(255, parseInt(val, 10) || 0));
    setDataDisks((prev) => {
      const copy = [...prev];
      copy[index] = num;
      return copy;
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(14, 165, 233, 0.25)'
          }}>
            <Database size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              RAID 6 Dual-Parity & Galois Field GF(2^8) Studio
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Mathematische P- und Q-Paritätsberechnung & simultane Rekonstruktion zweier Festplattenausfälle
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpClaimed ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Check size={16} /> 65 XP erhalten!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(14, 165, 233, 0.15)', 
              color: '#0ea5e9', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Award size={16} /> 65 XP verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Array Topology Visualizer */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} color="#0ea5e9" /> RAID 6 Stripe Topologie (Klick auf Festplatte zum Simulieren eines Ausfalls)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {/* Data Disks */}
          {dataDisks.map((byteVal, i) => {
            const isFailed = failedDisks.includes(i);
            return (
              <div 
                key={i}
                onClick={() => toggleDiskFailure(i)}
                style={{
                  background: isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.1)',
                  border: isFailed ? '2px dashed #ef4444' : '1px solid rgba(14, 165, 233, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  {isFailed ? <ShieldAlert size={28} color="#ef4444" /> : <HardDrive size={28} color="#0ea5e9" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                  Data Disk D_{i}
                </div>
                <div style={{ fontSize: '0.8rem', color: isFailed ? '#ef4444' : 'var(--text-muted)' }}>
                  {isFailed ? '💥 AUSGEFALLEN' : '🟢 ONLINE'}
                </div>
                <div style={{ marginTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>Byte Wert (0-255):</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="255"
                    value={byteVal}
                    disabled={isFailed}
                    onChange={(e) => handleUpdateByte(i, e.target.value)}
                    style={{
                      width: '60px',
                      textAlign: 'center',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '4px',
                      color: '#ffffff',
                      padding: '4px',
                      fontSize: '0.85rem'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    0x{byteVal.toString(16).toUpperCase().padStart(2, '0')} ('{String.fromCharCode(byteVal)}')
                  </div>
                </div>
              </div>
            );
          })}

          {/* P-Parity Disk */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <ShieldCheck size={28} color="#a855f7" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
              Parity Disk P
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a855f7' }}>
              XOR-Summe
            </div>
            <div style={{ marginTop: '14px', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              {parityResult.pParity}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              0x{parityResult.pParity.toString(16).toUpperCase().padStart(2, '0')}
            </div>
          </div>

          {/* Q-Parity Disk */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <ShieldCheck size={28} color="#eab308" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
              Parity Disk Q
            </div>
            <div style={{ fontSize: '0.8rem', color: '#eab308' }}>
              Galois GF(2^8)
            </div>
            <div style={{ marginTop: '14px', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              {parityResult.qParity}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              0x{parityResult.qParity.toString(16).toUpperCase().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Status Card */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          {recoveryResult.canRecover ? (
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)' }}>
              <Check size={20} color="#10b981" />
            </div>
          ) : (
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)' }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
          )}
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            Status: {recoveryResult.status} ({failedDisks.length} Ausfälle)
          </h3>
        </div>
        <p style={{ margin: '4px 0 0 0', color: recoveryResult.canRecover ? '#10b981' : '#ef4444', fontSize: '0.92rem' }}>
          {recoveryResult.message}
        </p>
      </div>

      {/* Mathematical Formulas & Explanation */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="#0ea5e9" /> Mathematischer Hintergrund (IHK FISI & Storage-Prüfung)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>P-Parität (Standard XOR):</strong> {parityResult.formulaP}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Q-Parität (Reed-Solomon Galois-Feld):</strong> {parityResult.formulaQ} über dem Generatorpolynom $x^8 + x^4 + x^3 + x^2 + 1$ (0x11d).
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Warum 2 Ausfälle kein Problem sind:</strong> Mit 2 bekannten Gleichungen (P und Q) und 2 Unbekannten (z. B. $D_0$ und $D_1$) kann das lineare Gleichungssystem in GF(2^8) exakt und eindeutig gelöst werden, da im Galois-Feld jede Zahl $\ne 0$ ein multiplikatives Inverses besitzt.
          </div>
        </div>
      </div>
    </div>
  );
}
