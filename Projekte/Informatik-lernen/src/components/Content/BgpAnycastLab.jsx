import React, { useState, useMemo } from 'react';
import { Globe, Award, Network } from 'lucide-react';
import { BgpAnycastSimulator } from '../../utils/bgpAnycastEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function BgpAnycastLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [localPrefAlpha, setLocalPrefAlpha] = useState(100);
  const [localPrefBravo, setLocalPrefBravo] = useState(100);
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => {
    const s = new BgpAnycastSimulator();
    s.routes[0].localPref = localPrefAlpha;
    s.routes[1].localPref = localPrefBravo;
    return s;
  }, [localPrefAlpha, localPrefBravo]);

  const bgpData = useMemo(() => sim.evaluateBestPath(), [sim]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'bgp_anycast_master');
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
              <Globe size={14} /> Internet Routing Architecture
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} /> BGP-4 &amp; Anycast IP Studio
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🌐 Linux BGP Routing &amp; Anycast Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche Border Gateway Protocol (BGP) Peering, Anycast IP Announcement (`198.51.100.1/32`) und den BGP Best-Path Decision Algorithm (Local-Pref &gt; AS-Path &gt; MED).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> BGP-Routing Bestätigen (+45 XP)
        </button>
      </div>

      {/* Anycast IP Badge Banner */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Angekündigtes Anycast IPv4 Prefix:</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
            {bgpData.anycastIp} (AS{bgpData.localAsn})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">Aktiver Pfad: {bgpData.bestRoute.peerName}</span>
        </div>
      </div>

      {/* Routes List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {bgpData.allRoutes.map((route, idx) => (
          <div
            key={route.peerAsn}
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: route.isBest ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
              border: route.isBest ? '1px solid #10b981' : '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.95rem', color: route.isBest ? '#10b981' : 'var(--text-main)' }}>
                {route.peerName}
              </strong>
              <span className={`badge ${route.isBest ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.72rem' }}>
                {route.status}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>AS-Path:</strong> <code style={{ color: 'var(--accent-primary)' }}>{route.asPath.join(' $\\rightarrow$ ')}</code> ({route.asPath.length} Hops)</div>
              <div><strong>Local Preference:</strong> {route.localPref}</div>
              <div><strong>MED (Metric):</strong> {route.med}</div>
              <div><strong>Latenz:</strong> ~{route.latencyMs} ms</div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Local-Preference anpassen: {route.localPref}
              </label>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={idx === 0 ? localPrefAlpha : localPrefBravo}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (idx === 0) setLocalPrefAlpha(val);
                  else setLocalPrefBravo(val);
                }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
