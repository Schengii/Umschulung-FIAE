import React, { useState, useMemo } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle2, RefreshCw, Zap, Bug, Eye } from 'lucide-react';
import { 
  createTlsSession, 
  processTls0RttRequest, 
  auditTls0RttConfiguration, 
  ANTI_REPLAY_MECHANISMS, 
  REQUEST_METHODS 
} from '../../utils/tlsReplayEngine';
import { useStore } from '../../store/useStore';

export default function TlsReplayLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' | 'audit' | 'deepdive'
  
  // Simulation State
  const [session, setSession] = useState(() => createTlsSession());
  const [selectedMethodKey, setSelectedMethodKey] = useState('POST_PAYMENT');
  const [antiReplay, setAntiReplay] = useState(ANTI_REPLAY_MECHANISMS.NONE);
  const [serverStrikeRegister, setServerStrikeRegister] = useState(() => new Set());
  const [lastResult, setLastResult] = useState(null);
  const [capturedPacket, setCapturedPacket] = useState(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Audit State
  const [allowNonIdempotent, setAllowNonIdempotent] = useState(true);
  const [auditAntiReplay, setAuditAntiReplay] = useState(ANTI_REPLAY_MECHANISMS.NONE);
  const [maxEarlyData, setMaxEarlyData] = useState(32768);

  const selectedRequest = REQUEST_METHODS[selectedMethodKey];

  const auditResult = useMemo(() => {
    return auditTls0RttConfiguration({
      allowNonIdempotent0Rtt: allowNonIdempotent,
      antiReplay: auditAntiReplay,
      maxEarlyDataBytes: maxEarlyData
    });
  }, [allowNonIdempotent, auditAntiReplay, maxEarlyData]);

  const handleSendLegit = () => {
    const res = processTls0RttRequest({
      session,
      request: selectedRequest,
      antiReplay,
      serverStrikeRegister,
      clientTimestampSkewMs: 120,
      isReplayed: false
    });

    if (res.strikeRegisterUpdated) {
      const fingerprint = `${session.sessionId}_${session.psk.substring(0, 6)}`;
      setServerStrikeRegister(prev => new Set([...prev, fingerprint]));
    }

    if (antiReplay === ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS) {
      setSession(prev => ({ ...prev, isUsed: true }));
    }

    setLastResult(res);
    setCapturedPacket({
      request: selectedRequest,
      sessionPsk: session.psk,
      timestamp: Date.now()
    });
  };

  const handleReplayAttack = () => {
    if (!capturedPacket) return;

    const res = processTls0RttRequest({
      session,
      request: capturedPacket.request,
      antiReplay,
      serverStrikeRegister,
      clientTimestampSkewMs: 6500, // Replay später
      isReplayed: true
    });

    setLastResult(res);

    if (res.riskLevel === 'safe' && !rewardClaimed) {
      awardXP(50, 'TLS 1.3 Anti-Replay Defense Mastery');
      setRewardClaimed(true);
    }
  };

  const handleResetSession = () => {
    setSession(createTlsSession());
    setServerStrikeRegister(new Set());
    setLastResult(null);
    setCapturedPacket(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Lock size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
                TLS 1.3 0-RTT Replay Attack & Defense Studio
              </h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                RFC 8446 Early Data Sicherheit: Idempotenz, Single-Use Tickets & Strike-Register Abwehr
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('interactive')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'interactive' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={16} /> Live-Simulation
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'audit' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Shield size={16} /> Server Security Audit
          </button>
          <button
            onClick={() => setActiveTab('deepdive')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'deepdive' ? '#3b82f6' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={16} /> RFC 8446 Deep Dive
          </button>
        </div>
      </div>

      {/* TAB 1: Live Simulation */}
      {activeTab === 'interactive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Request Type */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                1. HTTP Request Methode & Payload:
              </label>
              <select
                value={selectedMethodKey}
                onChange={(e) => setSelectedMethodKey(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px' }}
              >
                <option value="POST_PAYMENT">POST /transfers (Geldüberweisung - NICHT IDEMPOTENT!)</option>
                <option value="GET">GET /user/profile (Profilabruf - IDEMPOTENT & SICHER)</option>
                <option value="PUT_CONFIG">PUT /settings (Dark Mode Konfiguration - IDEMPOTENT)</option>
              </select>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: selectedRequest.idempotent ? '#4ade80' : '#f87171' }}>
                {selectedRequest.idempotent ? '✓ Idempotent: Mehrfaches Senden verändert den Systemzustand nicht' : '⚠️ Nicht idempotent: Mehrfaches Senden löst Mehrfachbuchungen aus!'}
              </div>
            </div>

            {/* Anti-Replay Mechanism */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                2. Serverseitiger Schutzmechanismus:
              </label>
              <select
                value={antiReplay}
                onChange={(e) => setAntiReplay(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px' }}
              >
                <option value={ANTI_REPLAY_MECHANISMS.NONE}>Keiner (Standard RFC 8446 ohne Schutz) ❌</option>
                <option value={ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS}>Single-Use Session Tickets (Invalidierung nach 1x) 🛡️</option>
                <option value={ANTI_REPLAY_MECHANISMS.CLIENT_TIMESTAMPS}>Client Timestamps (Max 5s Drift-Fenster) ⏱️</option>
                <option value={ANTI_REPLAY_MECHANISMS.STRIKE_REGISTER}>Server Strike-Register (Bloom-Filter Set gesehner Tickets) ⚡</option>
              </select>
            </div>
          </div>

          {/* Action Triggers */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSendLegit}
              style={{
                flex: '1 1 240px',
                padding: '12px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Zap size={18} /> 1. Sende legitime 0-RTT Early-Data Anfrage
            </button>

            <button
              onClick={handleReplayAttack}
              disabled={!capturedPacket}
              style={{
                flex: '1 1 240px',
                padding: '12px 20px',
                background: capturedPacket ? '#ef4444' : '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: capturedPacket ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Bug size={18} /> 2. 😈 Angreifer: Replay abgefangenes Paket
            </button>

            <button
              onClick={handleResetSession}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} /> Reset
            </button>
          </div>

          {/* Inspection Screen */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Session State */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>
                TLS 1.3 Session & Ticket Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>Session-ID:</strong> <code style={{ color: '#a78bfa' }}>{session.sessionId}</code></div>
                <div><strong>Pre-Shared Key (PSK):</strong> <code style={{ color: '#cbd5e1' }}>{session.psk}</code></div>
                <div><strong>Ticket Status:</strong> {session.isUsed ? <span style={{ color: '#f87171' }}>Verbraucht (Consumed)</span> : <span style={{ color: '#4ade80' }}>Gültig & Unbenutzt</span>}</div>
                <div><strong>Strike-Register Einträge:</strong> <span style={{ color: '#38bdf8' }}>{serverStrikeRegister.size} erfasste Ticket-Hashes</span></div>
              </div>

              {capturedPacket && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 'bold' }}>
                    😈 Im Äther abgefangenes 0-RTT Datenpaket:
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '4px', color: '#cbd5e1' }}>
                    Method: {capturedPacket.request.method} {capturedPacket.request.path}<br />
                    Payload: {capturedPacket.request.body || 'None'}<br />
                    PSK Bind: {capturedPacket.sessionPsk.substring(0, 10)}...
                  </div>
                </div>
              )}
            </div>

            {/* Server Feedback & Result */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>
                Server Response & Sicherheitsanalyse
              </h3>
              {lastResult ? (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: lastResult.riskLevel === 'critical' ? 'rgba(239, 68, 68, 0.2)' : lastResult.riskLevel === 'safe' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    border: `1px solid ${lastResult.riskLevel === 'critical' ? '#ef4444' : lastResult.riskLevel === 'safe' ? '#22c55e' : '#f59e0b'}`,
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: lastResult.riskLevel === 'critical' ? '#fca5a5' : lastResult.riskLevel === 'safe' ? '#86efac' : '#fcd34d' }}>
                      {lastResult.riskLevel === 'safe' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                      {lastResult.riskLevel === 'critical' ? 'KRITISCHER SICHERHEITSVORFALL' : lastResult.riskLevel === 'safe' ? 'ANFRAGE SICHER ABGEWICKELT' : 'WARNUNG: IDEMPOTENZ BEACHTEN'}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '6px', color: '#f8fafc' }}>
                      {lastResult.message}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>0-RTT Akzeptiert:</span> <strong>{lastResult.accepted0Rtt ? 'JA (0ms Latenz)' : 'NEIN (Fallback)'}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>Benötigte RTTs:</span> <strong>{lastResult.rttCount} RTT</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>Ausgeführt:</span> <strong>{lastResult.executedRequest ? 'Ja' : 'Abgelehnt'}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>Rejection Reason:</span> <code>{lastResult.rejectionReason || 'None'}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Klicke auf Button 1, um die erste 0-RTT Early-Data Anfrage abzusenden.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Server Security Audit */}
      {activeTab === 'audit' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#38bdf8' }}>
            TLS 1.3 Server 0-RTT Konfigurations-Audit
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Nicht-idempotente Anfragen in Early Data:
              </label>
              <select
                value={allowNonIdempotent ? 'yes' : 'no'}
                onChange={(e) => setAllowNonIdempotent(e.target.value === 'yes')}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
              >
                <option value="yes">Erlaubt (Extrem gefährlich! POST in 0-RTT)</option>
                <option value="no">Verboten (Nur GET / HEAD / PUT idempotent)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Anti-Replay Abwehrmechanismus:
              </label>
              <select
                value={auditAntiReplay}
                onChange={(e) => setAuditAntiReplay(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
              >
                <option value={ANTI_REPLAY_MECHANISMS.NONE}>Keiner</option>
                <option value={ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS}>Single-Use Session Tickets</option>
                <option value={ANTI_REPLAY_MECHANISMS.CLIENT_TIMESTAMPS}>Client Timestamps Window</option>
                <option value={ANTI_REPLAY_MECHANISMS.STRIKE_REGISTER}>Server Strike-Register</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Max Early Data Puffer: {maxEarlyData} Bytes
              </label>
              <input
                type="range"
                min="4096"
                max="65536"
                step="4096"
                value={maxEarlyData}
                onChange={(e) => setMaxEarlyData(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Audit Result Card */}
          <div style={{
            padding: '20px',
            borderRadius: '10px',
            background: auditResult.isCompliant ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${auditResult.isCompliant ? '#22c55e' : '#ef4444'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: auditResult.isCompliant ? '#86efac' : '#fca5a5' }}>
                Sicherheits-Bewertung: Note {auditResult.grade} ({auditResult.score} / 100 Punkte)
              </span>
              <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '20px', background: auditResult.isCompliant ? '#15803d' : '#991b1b', color: '#fff' }}>
                {auditResult.isCompliant ? 'RFC 8446 Konform' : 'Unsicher'}
              </span>
            </div>

            {auditResult.issues.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                {auditResult.issues.map((issue, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{issue}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#86efac' }}>
                Exzellente Konfiguration! Keine Replay-Schwachstellen vorhanden.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RFC 8446 Deep Dive */}
      {activeTab === 'deepdive' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 14px 0', color: '#f59e0b' }}>
            RFC 8446 Kapitel 8: Warum 0-RTT Replay-Angriffen ausgesetzt ist
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            <p>
              In TLS 1.2 benötigte ein Handshake typischerweise <strong>2 RTTs</strong> (Round-Trip Times). TLS 1.3 reduzierte den Standard-Handshake auf <strong>1 RTT</strong>.
              Mit <strong>0-RTT Session Resumption (Early Data)</strong> kann ein Client, der bereits zuvor mit dem Server kommuniziert hat, direkt im ersten Paket (ClientHello) verschlüsselte Anwendungsdaten mitsenden.
            </p>
            <h4 style={{ color: '#38bdf8', margin: '14px 0 6px 0' }}>Das Problem der fehlenden Forward Secrecy in 0-RTT:</h4>
            <p>
              Da der Server noch kein neues Schlüsselpaar ausgetauscht hat, basiert die Verschlüsselung von 0-RTT rein auf dem vorherigen Session-Ticket (PSK). Ein Angreifer im Netzwerk (z. B. WLAN-Sniffer) kann dieses Datenpaket unverändert kopieren und erneut an den Server senden. Der Server hält das Paket für legitim und entschlüsselt es!
            </p>
            <h4 style={{ color: '#4ade80', margin: '14px 0 6px 0' }}>Die 3 anerkannten Gegenmaßnahmen:</h4>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>Single-Use Tickets:</strong> Der Server invalidiert das Session-Ticket sofort nach dem ersten Eintreffen. Nachteil: Erfordert verteilten Cache über alle Server-Cluster hinweg.</li>
              <li><strong>Client Hello Timestamp Window:</strong> Der Client kodiert einen Zeitstempel. Pakete außerhalb von ±5 Sekunden werden abgewiesen.</li>
              <li><strong>Server Strike-Register:</strong> Der Server hält einen Bloom-Filter oder LRU-Cache kürzlich empfangener ClientHello-Hashes und weist Duplikate ab.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
