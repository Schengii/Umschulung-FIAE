import React, { useState, useMemo } from 'react';
import { ShieldCheck, Award, Lock } from 'lucide-react';
import { WireguardZtnaSimulator } from '../../utils/wireguardZtnaEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WireguardZtnaLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [selectedPeerId, setSelectedPeerId] = useState('peer-dev-laptop');
  const [targetResource, setTargetResource] = useState('10.0.1.50 (Prod Postgres DB)');
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new WireguardZtnaSimulator(), []);

  const accessEvaluation = useMemo(() => {
    return sim.evaluateZtnaAccess(selectedPeerId, targetResource);
  }, [sim, selectedPeerId, targetResource]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wireguard_ztna_master');
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
              <Lock size={14} /> Modern Cryptographic VPN
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> WireGuard NoiseIK &amp; Zero-Trust ZTNA
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🛡️ WireGuard VPN &amp; Zero-Trust Architecture Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Simuliere WireGuard Cryptokey Routing (`AllowedIPs`), 1-RTT NoiseIK Handshakes (Curve25519) und dynamische Zero-Trust Policy Evaluierung basierend auf Device Health Scores.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> ZTNA-Policy Bestätigen (+45 XP)
        </button>
      </div>

      {/* Peer Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {sim.peers.map(peer => (
          <div
            key={peer.id}
            onClick={() => { setSelectedPeerId(peer.id); triggerHaptic('SELECTION'); }}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${selectedPeerId === peer.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              background: selectedPeerId === peer.id ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.95rem' }}>{peer.name}</strong>
              <span className={`badge ${peer.deviceTrustScore >= 80 ? 'badge-emerald' : 'badge-amber'}`}>
                Trust: {peer.deviceTrustScore}/100
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              AllowedIPs: {peer.allowedIps}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              OS: {peer.osVersion}
            </div>
          </div>
        ))}
      </div>

      {/* Target Resource Selector & Evaluation Card */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            Zero-Trust Policy Auswertung für Ziel-Ressource:
          </span>
          <select
            value={targetResource}
            onChange={(e) => setTargetResource(e.target.value)}
            style={{ padding: '6px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.82rem' }}
          >
            <option value="10.0.1.50 (Prod Postgres DB)">10.0.1.50 (Prod Postgres DB - Kritisch)</option>
            <option value="10.0.2.10 (Internal Wiki)">10.0.2.10 (Internal Wiki - Niedrig)</option>
          </select>
        </div>

        <div style={{ background: accessEvaluation.accessGranted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${accessEvaluation.accessGranted ? '#10b981' : '#ef4444'}`, borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.92rem' }}>
            <span>Status: {accessEvaluation.accessGranted ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED / QUARANTINE'}</span>
            <span style={{ color: 'var(--accent-primary)' }}>Handshake: {accessEvaluation.handshake}</span>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {accessEvaluation.policyResult}
          </p>
        </div>
      </div>
    </div>
  );
}
