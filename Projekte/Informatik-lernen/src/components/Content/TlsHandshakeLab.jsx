import React, { useState, useMemo } from 'react';
import { Lock, Award, Server, User, ShieldCheck } from 'lucide-react';
import { buildFullHandshake, buildResumptionHandshake, CIPHER_SUITES, KEY_EXCHANGE_GROUPS } from '../../utils/tlsHandshakeEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function TlsHandshakeLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [mode, setMode] = useState('full'); // 'full' | 'resumption'
  const [sni, setSni] = useState('app.devgame.it');
  const [cipherSuiteId, setCipherSuiteId] = useState(CIPHER_SUITES[0].id);
  const [keyGroupId, setKeyGroupId] = useState(KEY_EXCHANGE_GROUPS[0].id);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handshake = useMemo(() => {
    return mode === 'full'
      ? buildFullHandshake({ sni, cipherSuiteId, keyGroupId })
      : buildResumptionHandshake({ sni });
  }, [mode, sni, cipherSuiteId, keyGroupId]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'tls_handshake_master');
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
              <Lock size={14} /> Netzwerksicherheit &amp; Kryptographie
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> TLS 1.3 Handshake (RFC 8446)
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔒 TLS 1.3 Handshake Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Verfolge den vollständigen 1-RTT TLS-1.3-Handshake Schritt für Schritt (ClientHello bis Finished) und vergleiche ihn mit der 0-RTT Session-Resumption via PSK.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          disabled={xpClaimed}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {xpClaimed ? 'XP gesichert!' : 'Handshake Bestätigen (+45 XP)'}
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => { setMode('full'); triggerHaptic('SELECTION'); }}
          className={`btn ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          1. Vollständiger Handshake (1-RTT)
        </button>
        <button
          onClick={() => { setMode('resumption'); triggerHaptic('SELECTION'); }}
          className={`btn ${mode === 'resumption' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          2. Session Resumption (0-RTT via PSK)
        </button>
      </div>

      {/* Parameters */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Server Name Indication (SNI):
            </label>
            <input
              type="text"
              value={sni}
              onChange={(e) => setSni(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
          </div>

          {mode === 'full' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Cipher Suite:
                </label>
                <select
                  value={cipherSuiteId}
                  onChange={(e) => setCipherSuiteId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                >
                  {CIPHER_SUITES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Key-Exchange-Gruppe (ECDHE):
                </label>
                <select
                  value={keyGroupId}
                  onChange={(e) => setKeyGroupId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                >
                  {KEY_EXCHANGE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Handshake Flow */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'block', marginBottom: '16px' }}>
          Nachrichtenfluss ({handshake.totalRtt} RTT bis zur ersten verschlüsselten Application Data):
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {handshake.steps.map((step, idx) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                flexDirection: step.actor === 'Server' ? 'row-reverse' : 'row',
                textAlign: step.actor === 'Server' ? 'right' : 'left'
              }}
            >
              <div style={{
                minWidth: '36px', height: '36px', borderRadius: '50%',
                background: step.actor === 'Client' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {step.actor === 'Client' ? <User size={18} color="var(--accent-primary)" /> : <Server size={18} color="#10b981" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Schritt {idx + 1} — {step.actor}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {step.title}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
        💡 {handshake.summary}
      </div>
    </div>
  );
}
