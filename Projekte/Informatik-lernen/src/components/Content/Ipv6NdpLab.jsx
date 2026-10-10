import React, { useState, useMemo } from 'react';
import { 
  Network, Globe, Server, Award, Check 
} from 'lucide-react';
import { 
  simulateIpv6NdLifecycle 
} from '../../utils/ipv6NdpEngine';
import { useStore } from '../../store/useStore';

export default function Ipv6NdpLab() {
  const { awardXP } = useStore();
  const [macAddress, setMacAddress] = useState('00:1a:2b:3c:4d:5e');
  const [prefix, setPrefix] = useState('2001:db8:acad:1');
  const [usePrivacy, setUsePrivacy] = useState(true);
  const [mFlag, setMFlag] = useState(false);
  const [oFlag, setOFlag] = useState(true);
  const [dadConflict, setDadConflict] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const simulation = useMemo(() => {
    try {
      return simulateIpv6NdLifecycle({
        mac: macAddress,
        prefix,
        usePrivacy,
        mFlag,
        oFlag,
        dadConflict
      });
    } catch {
      return null;
    }
  }, [macAddress, prefix, usePrivacy, mFlag, oFlag, dadConflict]);

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'IPv6 SLAAC, DHCPv6 & NDP Inspector gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Network size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                IPv6 SLAAC, DHCPv6 & NDP Inspector
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                RFC 4861 Neighbor Discovery, EUI-64 & RFC 8981 Privacy Extensions Simulation (IHK AP1 & FISI AP2)
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
            background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #6366f1, #4338ca)',
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
          {xpClaimed ? 'XP gutgeschrieben' : '+60 XP beanspruchen'}
        </button>
      </div>

      {/* Control Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Client & Prefix Config */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#6366f1" /> Client- & Router-Parameter
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              Client MAC-Adresse:
            </label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              placeholder="00:1a:2b:3c:4d:5e"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              Router Advertisement (RA) /64 Prefix:
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="2001:db8:acad:1"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'inherit',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        {/* Router RA Flags & Modes */}
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#6366f1" /> Router Flags & Sicherheits-Optionen
          </h2>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={usePrivacy}
              onChange={(e) => setUsePrivacy(e.target.checked)}
              disabled={mFlag}
            />
            <span><strong>RFC 8981 Privacy Extensions</strong> (Zufällige temporäre GUA)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mFlag}
              onChange={(e) => setMFlag(e.target.checked)}
            />
            <span><strong>Managed Address Flag (M-Flag = 1)</strong>: Stateful DHCPv6 erzwingen</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={oFlag}
              onChange={(e) => setOFlag(e.target.checked)}
            />
            <span><strong>Other Config Flag (O-Flag = 1)</strong>: Stateless DHCPv6 für DNS/NTP</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: dadConflict ? '#ef4444' : 'inherit' }}>
            <input
              type="checkbox"
              checked={dadConflict}
              onChange={(e) => setDadConflict(e.target.checked)}
            />
            <span><strong>DAD-Konflikt simulieren</strong> (Doppelte IP im Netzwerk)</span>
          </label>
        </div>
      </div>

      {/* Simulator Execution Steps */}
      {simulation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>
            Protokoll-Lebenszyklus (Schritt-für-Schritt)
          </h2>

          {simulation.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--card-bg, #ffffff)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderLeft: step.status?.includes('FEHLER') || step.status?.includes('Konflikt') ? '6px solid #ef4444' : '6px solid #6366f1'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{step.title}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca' }}>
                  {step.protocol}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 12px' }}>{step.description}</p>

              {step.address && (
                <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: '10px 14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  Link-Local IP: {step.address}
                </div>
              )}

              {step.addresses && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {step.addresses.map((a, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-subtle, #f8fafc)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, color: '#4338ca' }}>{a.address}</span>
                      <span style={{ color: '#64748b' }}>({a.type})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* IHK Wissens-Box */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', color: '#4338ca' }}>
          💡 IHK Prüfungs-Wissen (AP1 & AP2): EUI-64 & Flags
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary, #475569)' }}>
          <li><strong>EUI-64 u/l Bit (Universal/Local):</strong> Das 7. Bit im ersten Byte der MAC-Adresse wird invertiert (0x02 XOR), um anzuzeigen, ob die Adresse global eindeutig (0) oder lokal administriert (1) ist.</li>
          <li><strong>M-Flag (Managed):</strong> Steht es auf 1, ignoriert der Host SLAAC für IP-Adressen und kontaktiert einen Stateful DHCPv6-Server (RFC 8415).</li>
          <li><strong>O-Flag (Other):</strong> Steht es auf 1 und M=0, konfiguriert der Host seine IP via SLAAC, fragt aber DNS-Server & Domain-Suffixe per Stateless DHCPv6 an.</li>
          <li><strong>DAD (Duplicate Address Detection):</strong> Vor der Aktivierung jeder IPv6-Adresse sendet der Host eine Neighbor Solicitation an die Solicited-Node Multicast-Adresse. Antwortet niemand, ist die Adresse kollisionsfrei.</li>
        </ul>
      </div>
    </div>
  );
}
