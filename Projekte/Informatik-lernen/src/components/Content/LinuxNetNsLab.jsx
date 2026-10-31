import React, { useState, useMemo } from 'react';
import { 
  Network, Server, 
  Award, Check, Terminal, Copy 
} from 'lucide-react';
import { 
  simulateNamespacePing, 
  generateNetnsBashScript 
} from '../../utils/linuxNetNsEngine';
import { useStore } from '../../store/useStore';

export default function LinuxNetNsLab() {
  const { awardXP } = useStore();
  const [selectedSource, setSelectedSource] = useState('ns-web');
  const [targetIp, setTargetIp] = useState('10.0.0.3');
  const [bridgeUp, setBridgeUp] = useState(true);
  const [natEnabled, setNatEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const simulation = useMemo(() => {
    return simulateNamespacePing(selectedSource, targetIp, bridgeUp, natEnabled);
  }, [selectedSource, targetIp, bridgeUp, natEnabled]);

  const bashScript = useMemo(() => generateNetnsBashScript(), []);

  const handleCopyBash = () => {
    navigator.clipboard.writeText(bashScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(65, 'Linux Network Namespaces & veth Studio gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Network size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Linux Network Namespaces, veth & Bridge Studio
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Container-Netzwerkgrundlagen: Virtual Ethernet (`veth`), `br0` Switching & iptables NAT (FISI & CNI)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimXP}
          disabled={xpClaimed}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: xpClaimed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {xpClaimed ? <Check size={16} /> : <Award size={16} />}
          {xpClaimed ? 'XP gutgeschrieben' : '+65 XP beanspruchen'}
        </button>
      </div>

      {/* Interactive Topology Card */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px' }}>
          Interaktive Linux Container-Netzwerktopologie
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Namespace 1 */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '2px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Server size={18} color="#0284c7" />
              <strong style={{ fontSize: '0.95rem' }}>ns-web (Container 1)</strong>
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>IP: 10.0.0.2/24</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>veth-web &lt;--&gt; veth-web-br</div>
          </div>

          {/* Linux Bridge br0 */}
          <div style={{ background: bridgeUp ? '#eff6ff' : '#fee2e2', padding: '16px', borderRadius: '12px', border: bridgeUp ? '2px solid #3b82f6' : '2px solid #ef4444', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, color: bridgeUp ? '#1d4ed8' : '#b91c1c' }}>Linux Bridge br0</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '4px' }}>IP: 10.0.0.1 (Default Gateway)</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>Status: {bridgeUp ? 'UP (L2 Forwarding)' : 'DOWN (Ausfall)'}</div>
          </div>

          {/* Namespace 2 */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '2px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Server size={18} color="#0284c7" />
              <strong style={{ fontSize: '0.95rem' }}>ns-db (Container 2)</strong>
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>IP: 10.0.0.3/24</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>veth-db &lt;--&gt; veth-db-br</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Ping-Szenario konfigurieren
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              Quell-Namespace:
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--input-bg, #fff)' }}
            >
              <option value="ns-web">ns-web (10.0.0.2)</option>
              <option value="ns-db">ns-db (10.0.0.3)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              Ziel-IP (lokal oder Internet):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--input-bg, #fff)', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => setTargetIp(targetIp === '8.8.8.8' ? '10.0.0.3' : '8.8.8.8')}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                {targetIp === '8.8.8.8' ? 'Lokal (10.0.0.3)' : 'WAN (8.8.8.8)'}
              </button>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Kernel & Netzwerk-Flags
          </h2>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={bridgeUp}
              onChange={(e) => setBridgeUp(e.target.checked)}
            />
            <span><strong>Linux Bridge br0 ist UP</strong> (L2-Kopplung)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={natEnabled}
              onChange={(e) => setNatEnabled(e.target.checked)}
            />
            <span><strong>iptables MASQUERADE (NAT) aktiviert</strong> (Internet Breakout)</span>
          </label>
        </div>
      </div>

      {/* Simulation Trace Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>
          Paketverlauf (Kernel Packet Walk)
        </h2>

        {simulation.steps.map((st, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '16px 20px',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderLeft: st.success === false ? '6px solid #ef4444' : '6px solid #3b82f6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{st.stage}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{st.cmd}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: st.success === false ? '#dc2626' : 'var(--text-secondary, #64748b)' }}>
              {st.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Bash Script Export */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#3b82f6" /> Reproduzierbares Linux CLI-Skript
          </h3>
          <button
            onClick={handleCopyBash}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Kopiert!' : 'Bash-Skript kopieren'}
          </button>
        </div>

        <pre style={{
          background: '#0f172a',
          color: '#f8fafc',
          padding: '16px',
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          overflowX: 'auto',
          maxHeight: '260px'
        }}>
          {bashScript}
        </pre>
      </div>
    </div>
  );
}
