import React, { useState } from 'react';
import { Network, Server, Laptop, Play, RotateCcw, Award, CheckCircle2, ShieldAlert } from 'lucide-react';
import { createTcpSession, sendTcpPacket, TCP_SCENARIOS } from '../../utils/tcpStateMachineEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function TcpStateMachineLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [session, setSession] = useState(() => createTcpSession());
  const [xpClaimed, setXpClaimed] = useState(false);
  const [activePreset, setActivePreset] = useState('handshake');

  const handleRunPreset = (presetKey) => {
    setActivePreset(presetKey);
    let s = createTcpSession();
    if (presetKey === 'handshake') {
      for (const step of TCP_SCENARIOS.threeWayHandshake) {
        s = sendTcpPacket(s, step.sender, step.packet);
      }
    } else if (presetKey === 'teardown') {
      s.clientState = 'ESTABLISHED';
      s.serverState = 'ESTABLISHED';
      for (const step of TCP_SCENARIOS.connectionTeardown) {
        s = sendTcpPacket(s, step.sender, step.packet);
      }
    }
    setSession(s);
    triggerHaptic('SUCCESS');

    if (!xpClaimed) {
      setXpClaimed(true);
      const xpFn = onRewardXP || awardXP;
      xpFn?.(55, 'TCP State Machine & Handshake Master');
    }
  };

  const handleSendCustom = (sender, flags) => {
    const s = sendTcpPacket(session, sender, flags);
    setSession(s);
    triggerHaptic('SUCCESS');
  };

  const handleReset = () => {
    setSession(createTcpSession());
    triggerHaptic('WARNING');
  };

  const getStateBadgeColor = (state) => {
    switch (state) {
      case 'ESTABLISHED':
        return 'var(--accent-emerald, #10b981)';
      case 'SYN_SENT':
      case 'SYN_RECEIVED':
        return 'var(--accent-amber, #f59e0b)';
      case 'FIN_WAIT_1':
      case 'FIN_WAIT_2':
      case 'CLOSE_WAIT':
      case 'LAST_ACK':
      case 'TIME_WAIT':
        return 'var(--accent-indigo, #6366f1)';
      case 'CLOSED':
      default:
        return 'var(--text-muted, #94a3b8)';
    }
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="lab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} /> RFC 793 Transport Layer
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> TCP Connection Lifecycle
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🌐 TCP Connection State Machine &amp; 3-Way Handshake Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '800px' }}>
            Simuliere den vollständigen TCP-Zustandsautomaten nach RFC 793: Vom 3-Way-Handshake (SYN &rarr; SYN-ACK &rarr; ACK) über Datenübertragung bis zum 4-Way-Teardown (FIN &rarr; ACK &rarr; FIN &rarr; ACK mit TIME_WAIT 2MSL).
          </p>
        </div>

        {xpClaimed && (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} /> +55 XP gesichert
          </span>
        )}
      </div>

      {/* Preset Action Buttons */}
      <div className="glass-panel" style={{ padding: '18px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className={activePreset === 'handshake' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => handleRunPreset('handshake')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Play size={16} /> 1. 3-Way Handshake ausführen (Aufbau)
        </button>
        <button
          type="button"
          className={activePreset === 'teardown' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => handleRunPreset('teardown')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Play size={16} /> 2. 4-Way Teardown ausführen (Abbau &amp; TIME_WAIT)
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => handleSendCustom('SERVER', { rst: true })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)' }}
        >
          <ShieldAlert size={16} /> RST Injection (Verbindungsabbruch)
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={handleReset}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Nodes Overview: Client <-> Server */}
      <div className="grid-responsive" style={{ gap: '24px', marginBottom: '24px' }}>
        {/* Client Card */}
        <div className="glass-panel" style={{ padding: '22px', border: `2px solid ${getStateBadgeColor(session.clientState)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Laptop size={24} style={{ color: 'var(--accent-indigo, #6366f1)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>TCP Client (Initiator)</h3>
            </div>
            <span
              className="badge"
              style={{
                background: getStateBadgeColor(session.clientState),
                color: '#fff',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              {session.clientState}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Aktuelle Client-Seq: <code>{session.clientSeq}</code>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('CLIENT', { syn: true })}
            >
              Sende SYN
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('CLIENT', { ack: true })}
            >
              Sende ACK
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('CLIENT', { psh: true, ack: true, payloadBytes: 250 })}
            >
              Sende Daten (PSH+ACK)
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('CLIENT', { fin: true, ack: true })}
            >
              Sende FIN
            </button>
          </div>
        </div>

        {/* Server Card */}
        <div className="glass-panel" style={{ padding: '22px', border: `2px solid ${getStateBadgeColor(session.serverState)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={24} style={{ color: 'var(--accent-teal, #14b8a6)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>TCP Server (Listener)</h3>
            </div>
            <span
              className="badge"
              style={{
                background: getStateBadgeColor(session.serverState),
                color: '#fff',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              {session.serverState}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Aktuelle Server-Seq: <code>{session.serverSeq}</code>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('SERVER', { syn: true, ack: true })}
            >
              Sende SYN+ACK
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('SERVER', { ack: true })}
            >
              Sende ACK
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => handleSendCustom('SERVER', { fin: true, ack: true })}
            >
              Sende FIN
            </button>
          </div>
        </div>
      </div>

      {/* Packet Sequence Flow (Ladder / Trace Diagram) */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>
          Paket-Verlauf &amp; Zustandsübergänge ({session.history.length} Schritte)
        </h3>

        {session.history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Noch keine Pakete gesendet. Klicke auf &quot;3-Way Handshake ausführen&quot; oder sende individuelle Pakete oben.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {session.history.map((h) => {
              const isClient = h.sender === 'CLIENT';
              return (
                <div
                  key={h.step}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isClient ? 'rgba(99, 102, 241, 0.2)' : 'rgba(20, 184, 166, 0.2)',
                        color: isClient ? 'var(--accent-indigo)' : 'var(--accent-teal)',
                      }}
                    >
                      #{h.step} {h.sender} &rarr; {isClient ? 'SERVER' : 'CLIENT'}
                    </span>
                    <strong style={{ fontSize: '0.9rem' }}>
                      {h.packet.description || `${h.sender} Packet`}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      (Seq={h.packet.seq}, Ack={h.packet.ackNum})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Zustand danach: Client={h.clientStateAfter} | Server={h.serverStateAfter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
