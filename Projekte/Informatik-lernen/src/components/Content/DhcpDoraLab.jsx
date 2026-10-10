import React, { useState } from 'react';
import { Network, Play, RotateCcw, Award, Route, Clock, Radio } from 'lucide-react';
import {
  createDhcpSession,
  executeDhcpAction,
  runFullDoraHandshake,
  DHCP_DRILL_QUESTIONS
} from '../../utils/dhcpDoraEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function DhcpDoraLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('dora'); // 'dora' | 'lease' | 'drill'
  const [session, setSession] = useState(() => createDhcpSession());
  const [isRelayActive, setIsRelayActive] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleStep = (action) => {
    const s = executeDhcpAction(session, action);
    setSession(s);
    triggerHaptic('LIGHT');

    if (action === 'ACK' && !xpClaimed) {
      setXpClaimed(true);
      triggerHaptic('SUCCESS');
      const fn = onRewardXP || awardXP;
      fn?.(55, 'DHCP DORA & RFC 2131 Master');
    }
  };

  const handleFullDora = () => {
    const s = runFullDoraHandshake(session);
    setSession(s);
    triggerHaptic('SUCCESS');

    if (!xpClaimed) {
      setXpClaimed(true);
      const fn = onRewardXP || awardXP;
      fn?.(55, 'DHCP DORA & RFC 2131 Master');
    }
  };

  const handleReset = () => {
    setSession(createDhcpSession({ isRelayActive }));
    triggerHaptic('WARNING');
  };

  const handleToggleRelay = () => {
    const nextVal = !isRelayActive;
    setIsRelayActive(nextVal);
    setSession(createDhcpSession({ isRelayActive: nextVal }));
    triggerHaptic('MEDIUM');
  };

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      triggerHaptic('SUCCESS');
      const fn = onRewardXP || awardXP;
      fn?.(55, 'DHCP DORA & RFC 2131 Master');
    } else {
      triggerHaptic(correctCount >= 2 ? 'SUCCESS' : 'WARNING');
    }
  };

  const getStateBadgeColor = (state) => {
    switch (state) {
      case 'BOUND':
        return '#10b981';
      case 'SELECTING':
      case 'REQUESTING':
      case 'RENEWING':
      case 'REBINDING':
        return '#f59e0b';
      case 'INIT':
      default:
        return '#64748b';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-color, #334155)',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              display: 'flex',
              color: '#fff'
            }}>
              <Network size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                RFC 2131 DHCP DORA & Relay-Agent Studio
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                4-Way DORA Handshake (UDP 67/68), Lease-Lifecycle (T1 50% & T2 87.5%) und Relay Agent Routing (GIADDR)
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#0ea5e9',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              IHK AP2 FISI / FIDV Pflichtstoff
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* Tab-Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'dora', label: '1. DORA-Handshake & Paket-Inspektor', icon: Network },
            { id: 'lease', label: '2. Lease-Lifecycle & Timer (T1 & T2)', icon: Clock },
            { id: 'drill', label: '3. IHK Prüfungs-Drill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerHaptic('LIGHT');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: isActive ? '#0ea5e9' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#fff' : 'var(--text-muted, #94a3b8)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DORA HANDSHAKE */}
      {activeTab === 'dora' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status & Kontroll-Panel */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Client-Zustand:</span>
                  <div style={{
                    display: 'inline-block',
                    marginLeft: '0.5rem',
                    background: getStateBadgeColor(session.clientState),
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.3rem',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {session.clientState}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Zugewiesene IP:</span>
                  <strong style={{ marginLeft: '0.5rem', color: session.assignedIp ? '#10b981' : '#94a3b8' }}>
                    {session.assignedIp || 'Keine (Unkonfiguriert)'}
                  </strong>
                </div>
              </div>

              {/* Relay Toggle & Schnell-Aktionen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleToggleRelay}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.4rem',
                    border: `1px solid ${isRelayActive ? '#0ea5e9' : 'var(--border-color, #334155)'}`,
                    background: isRelayActive ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isRelayActive ? '#0ea5e9' : 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Route size={16} />
                  Relay Agent: {isRelayActive ? 'AKTIV (GIADDR)' : 'Aus (Lokales LAN)'}
                </button>

                <button
                  onClick={handleFullDora}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: '#10b981',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={16} />
                  1-Klick Auto DORA
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.4rem',
                    border: '1px solid var(--border-color, #334155)',
                    background: 'transparent',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>

            {/* Schritt-für-Schritt Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <button
                onClick={() => handleStep('DISCOVER')}
                disabled={session.clientState !== 'INIT'}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #0ea5e9',
                  background: session.clientState === 'INIT' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: session.clientState === 'INIT' ? '#0ea5e9' : '#64748b',
                  fontWeight: 600,
                  cursor: session.clientState === 'INIT' ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem'
                }}
              >
                1. DISCOVER ➔
              </button>

              <button
                onClick={() => handleStep('OFFER')}
                disabled={session.clientState !== 'SELECTING'}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #0ea5e9',
                  background: session.clientState === 'SELECTING' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: session.clientState === 'SELECTING' ? '#0ea5e9' : '#64748b',
                  fontWeight: 600,
                  cursor: session.clientState === 'SELECTING' ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem'
                }}
              >
                2. ➔ OFFER
              </button>

              <button
                onClick={() => handleStep('REQUEST')}
                disabled={session.history.length === 0 || session.history[session.history.length - 1].phase !== 'OFFER'}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #0ea5e9',
                  background: session.history.length > 0 && session.history[session.history.length - 1].phase === 'OFFER' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: session.history.length > 0 && session.history[session.history.length - 1].phase === 'OFFER' ? '#0ea5e9' : '#64748b',
                  fontWeight: 600,
                  cursor: session.history.length > 0 && session.history[session.history.length - 1].phase === 'OFFER' ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem'
                }}
              >
                3. REQUEST ➔
              </button>

              <button
                onClick={() => handleStep('ACK')}
                disabled={session.clientState !== 'REQUESTING'}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #10b981',
                  background: session.clientState === 'REQUESTING' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: session.clientState === 'REQUESTING' ? '#10b981' : '#64748b',
                  fontWeight: 600,
                  cursor: session.clientState === 'REQUESTING' ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem'
                }}
              >
                4. ➔ ACK (Bound)
              </button>
            </div>
          </div>

          {/* Wireshark-like Paket-Inspektor */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={20} color="#0ea5e9" />
              Paketverlauf & Wireshark-Inspektor ({session.history.length} Pakete)
            </h2>

            {session.history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                Klicke auf <strong>1. DISCOVER</strong> oder <strong>1-Klick Auto DORA</strong>, um den Paketfluss zu starten.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {session.history.map((pkt) => (
                  <div
                    key={pkt.stepNum}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border-color, #334155)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: pkt.phase === 'DISCOVER' || pkt.phase === 'REQUEST' ? '#0ea5e9' : '#10b981',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.3rem'
                        }}>
                          {pkt.options.messageType}
                        </span>
                        <strong style={{ fontSize: '0.95rem' }}>
                          {pkt.sender} ➔ {pkt.receiver}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'monospace' }}>
                        UDP {pkt.srcPort} ➔ {pkt.dstPort} | XID: {pkt.xid}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', marginBottom: '0.5rem' }}>
                      <div>Src IP: {pkt.srcIp}</div>
                      <div>Dst IP: {pkt.dstIp}</div>
                      <div>Your IP (yiaddr): <span style={{ color: pkt.yiaddr !== '0.0.0.0' ? '#10b981' : 'inherit' }}>{pkt.yiaddr}</span></div>
                      <div>Relay IP (giaddr): <span style={{ color: pkt.giaddr !== '0.0.0.0' ? '#0ea5e9' : 'inherit' }}>{pkt.giaddr}</span></div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.4' }}>
                      {pkt.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LEASE LIFECYCLE & TIMER */}
      {activeTab === 'lease' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={22} color="#0ea5e9" />
              RFC 2131 Lease-Zeit & Timer-Architektur
            </h2>

            {/* Timeline Balken */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>0h (Lease Start / ACK)</span>
                <span style={{ color: '#0ea5e9' }}>T1: 12h (50% Renewal - Unicast)</span>
                <span style={{ color: '#f59e0b' }}>T2: 21h (87.5% Rebind - Broadcast)</span>
                <span style={{ color: '#ef4444' }}>24h (Expiry)</span>
              </div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '7px', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '50%', background: '#10b981' }} title="T1 Erneuerungsfenster" />
                <div style={{ width: '37.5%', background: '#0ea5e9' }} title="T2 Rebind-Fenster" />
                <div style={{ width: '12.5%', background: '#ef4444' }} title="Kritischer Ablauf" />
              </div>
            </div>

            {/* Timer Aktionen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color, #334155)' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0ea5e9', marginBottom: '0.25rem' }}>
                  Timer T1 (50% Lease)
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 0.75rem 0' }}>
                  Sendet <strong>UNICAST</strong> direkt an den leasing DHCP-Server zur Verlängerung.
                </p>
                <button
                  onClick={() => handleStep('RENEW_T1')}
                  disabled={session.clientState !== 'BOUND'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: session.clientState === 'BOUND' ? '#0ea5e9' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: session.clientState === 'BOUND' ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem'
                  }}
                >
                  T1 Renewal testen (Unicast)
                </button>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color, #334155)' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#f59e0b', marginBottom: '0.25rem' }}>
                  Timer T2 (87.5% Lease)
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 0.75rem 0' }}>
                  Ursprünglicher Server antwortet nicht. Sendet <strong>BROADCAST</strong> an alle Server.
                </p>
                <button
                  onClick={() => handleStep('REBIND_T2')}
                  disabled={session.clientState !== 'BOUND' && session.clientState !== 'RENEWING'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: session.clientState === 'BOUND' || session.clientState === 'RENEWING' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: session.clientState === 'BOUND' || session.clientState === 'RENEWING' ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem'
                  }}
                >
                  T2 Rebind testen (Broadcast)
                </button>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color, #334155)' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#ef4444', marginBottom: '0.25rem' }}>
                  DHCP Release
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 0.75rem 0' }}>
                  Gibt die zugewiesene IP-Adresse ordnungsgemäß an den Server zurück.
                </p>
                <button
                  onClick={() => handleStep('RELEASE')}
                  disabled={session.clientState !== 'BOUND'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.4rem',
                    border: 'none',
                    background: session.clientState === 'BOUND' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: session.clientState === 'BOUND' ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem'
                  }}
                >
                  DHCP Release senden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IHK PRÜFUNGS-DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: DHCP & Netzwerkprotokolle"
          questions={DHCP_DRILL_QUESTIONS}
          accentColor="#0ea5e9"
          selectedBg="rgba(14, 165, 233, 0.2)"
          selectedBorderColor="#0ea5e9"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
