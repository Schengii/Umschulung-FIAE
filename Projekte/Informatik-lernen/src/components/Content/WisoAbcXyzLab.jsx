import React, { useState, useMemo } from 'react';
import {
  Package, Award, BarChart2
} from 'lucide-react';
import { calculateAbcXyzMatrix } from '../../utils/wisoAbcXyzEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoAbcXyzLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [solved, setSolved] = useState(false);

  const data = useMemo(() => calculateAbcXyzMatrix(), []);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_abc_xyz_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Package size={14} /> IHK Materialwirtschaft &amp; Logistik
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={14} /> ABC- &amp; XYZ-Materialanalyse
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📦 IHK ABC- &amp; XYZ-Analyse Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Klassifiziere Güter nach kumulativem Wertanteil (A bis 80%, B bis 95%, C über 95%) und Bedarfsstabilität (X/Y/Z) zur Optimierung von Just-in-Time Beschaffung und Lagerkosten.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Matrix-Analyse Bestätigen (+45 XP)
        </button>
      </div>

      {/* Summary Banner */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gesamter Beschaffungswert aller Artikel:</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '2px' }}>
            {data.summeGesamtwert.toLocaleString('de-DE')} €
          </div>
        </div>
      </div>

      {/* Material Table */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
          Artikel-Klassifizierung &amp; 3x3 Beschaffungsstrategie:
        </span>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Material / Artikel</th>
              <th style={{ padding: '10px' }}>Menge × Preis</th>
              <th style={{ padding: '10px' }}>Gesamtwert</th>
              <th style={{ padding: '10px' }}>Kumulativ %</th>
              <th style={{ padding: '10px' }}>ABC</th>
              <th style={{ padding: '10px' }}>XYZ</th>
              <th style={{ padding: '10px' }}>Empfohlene Beschaffungsstrategie</th>
            </tr>
          </thead>
          <tbody>
            {data.analyzedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{item.menge.toLocaleString('de-DE')} Stk. × {item.preis} €</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.gesamtwert.toLocaleString('de-DE')} €</td>
                <td style={{ padding: '10px', color: 'var(--accent-primary)' }}>{item.kumulierterAnteilPercent}%</td>
                <td style={{ padding: '10px' }}>
                  <span className={`badge ${item.abcClass === 'A' ? 'badge-indigo' : item.abcClass === 'B' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontWeight: 'bold' }}>
                    {item.abcClass}-Gut
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span className="badge badge-slate" style={{ fontWeight: 'bold' }}>
                    {item.xyzClass} ({item.schwankungPercent}%)
                  </span>
                </td>
                <td style={{ padding: '10px', color: item.matrixCode === 'AX' ? '#10b981' : 'var(--text-main)', fontWeight: item.matrixCode === 'AX' ? 'bold' : 'normal' }}>
                  {item.strategie}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
