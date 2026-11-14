import React, { useState, useMemo } from 'react';
import { Radio, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Send, Activity, Award, RefreshCw, Power } from 'lucide-react';
import {
  validateHandshakeHeaders,
  buildFrameAnalysis,
  transitionWsState,
  WS_OPCODES,
  WEBSOCKETS_DRILL_QUESTIONS
} from '../../utils/webSocketsEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const SOURCES = [
  { title: 'RFC 6455 – The WebSocket Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc6455', note: 'Offizieller IETF-Standard: Handshake, Masking, Framing und Opcodes' },
  { title: 'MDN Web Docs – Writing WebSocket client applications', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications', note: 'JavaScript WebSocket API (readyState, onmessage, send)' },
  { title: 'RFC 6455 Sec 5.1 – Masking Security Consideration', url: 'https://datatracker.ietf.org/doc/html/rfc6455#section-5.1', note: 'Verhinderung von Proxy Cache Poisoning durch obligatorische Client-Maskierung' }
];

export default function WebSocketsLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('handshake');
  const [xpClaimed, setXpClaimed] = useState(false);

  // Tab 1: Handshake
  const [requestHeaders, setRequestHeaders] = useState({
    'Upgrade': 'websocket',
    'Connection': 'Upgrade',
    'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
    'Sec-WebSocket-Version': '13'
  });
  const handshakeValidation = useMemo(
    () => validateHandshakeHeaders(requestHeaders),
    [requestHeaders]
  );

  // Tab 2: Frame Inspector
  const [fin, setFin] = useState(true);
  const [opcode, setOpcode] = useState(WS_OPCODES.TEXT.code);
  const [masked, setMasked] = useState(true);
  const [isClientToServer, setIsClientToServer] = useState(true);
  const [payloadText, setPayloadText] = useState('{"type":"ping","timestamp":1700000000}');

  const frameAnalysis = useMemo(() => {
    return buildFrameAnalysis({
      fin,
      opcode,
      masked,
      isClientToServer,
      payloadText
    });
  }, [fin, opcode, masked, isClientToServer, payloadText]);

  // Tab 3: State Machine & Realtime Log
  const [connectionState, setConnectionState] = useState('OPEN');
  const [messages, setMessages] = useState([
    { id: 1, direction: 'in', text: 'Server: 101 Switching Protocols akzeptiert', time: '12:00:01' },
    { id: 2, direction: 'out', text: 'Client: Hello Realtime World!', time: '12:00:02' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = () => {
    if (!inputMsg.trim() || connectionState !== 'OPEN') return;
    const now = new Date().toLocaleTimeString();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), direction: 'out', text: inputMsg, time: now },
      { id: Date.now() + 1, direction: 'in', text: `Echo: "${inputMsg}"`, time: now }
    ]);
    setInputMsg('');
  };

  const handleSendPing = () => {
    if (connectionState !== 'OPEN') return;
    const now = new Date().toLocaleTimeString();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), direction: 'out', text: 'PING (Opcode 0x9)', time: now },
      { id: Date.now() + 1, direction: 'in', text: 'PONG (Opcode 0xA)', time: now }
    ]);
  };

  const handleToggleConnection = () => {
    if (connectionState === 'OPEN') {
      const next = transitionWsState(connectionState, 'START_CLOSE');
      setConnectionState(next);
      setTimeout(() => setConnectionState('CLOSED'), 600);
    } else {
      setConnectionState('CONNECTING');
      setTimeout(() => setConnectionState('OPEN'), 600);
    }
  };

  const handleClaimLabXp = () => {
    if (!xpClaimed && onRewardXP && handshakeValidation.isValid) {
      onRewardXP(45);
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Radio size={30} style={{ color: 'var(--accent-teal)' }} /> WebSockets & Full-Duplex Realtime Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '750px' }}>
              RFC 6455 HTTP-101 Upgrade-Handshake, Frame-Parsing (Opcodes & Masking), Verbindungs-Lifecycle und IHK-Prüfungsdrill.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {handshakeValidation.isValid && !xpClaimed && (
              <button
                className="btn btn-primary"
                onClick={handleClaimLabXp}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Award size={18} /> +45 XP Einlösen
              </button>
            )}
            {xpClaimed && (
              <span className="badge badge-success" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} /> 45 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'handshake' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('handshake')}
          style={{ minHeight: '44px' }}
        >
          <ArrowRight size={16} /> 1. HTTP 101 Handshake
        </button>
        <button
          className={`btn ${activeTab === 'framing' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('framing')}
          style={{ minHeight: '44px' }}
        >
          <ShieldCheck size={16} /> 2. RFC 6455 Frame-Analyzer
        </button>
        <button
          className={`btn ${activeTab === 'realtime' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('realtime')}
          style={{ minHeight: '44px' }}
        >
          <Activity size={16} /> 3. Duplex-Session Simulator
        </button>
        <button
          className={`btn ${activeTab === 'drill' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('drill')}
          style={{ minHeight: '44px' }}
        >
          <Award size={16} /> 4. IHK-Drill
        </button>
      </div>

      {/* Tab 1: Handshake */}
      {activeTab === 'handshake' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Client Upgrade Request Header
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(requestHeaders).map(([key, val]) => (
                <div key={key}>
                  <label htmlFor={`hdr-${key}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {key}:
                  </label>
                  <input
                    id={`hdr-${key}`}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRequestHeaders((prev) => ({ ...prev, [key]: v }));
                    }}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      marginTop: '4px'
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setRequestHeaders({
                  'Upgrade': 'websocket',
                  'Connection': 'Upgrade',
                  'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
                  'Sec-WebSocket-Version': '13'
                })}
              >
                <RefreshCw size={14} /> RFC 6455 Standard
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setRequestHeaders((prev) => ({ ...prev, 'Upgrade': 'http/2' }))}
              >
                Fehlerhafter Upgrade-Header
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Server Response & Validierung
            </h3>

            {handshakeValidation.isValid ? (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '4px solid var(--accent-emerald)',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <CheckCircle2 size={18} /> HTTP/1.1 101 Switching Protocols
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <div>Upgrade: websocket</div>
                  <div>Connection: Upgrade</div>
                  <div>Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=</div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '4px solid var(--accent-rose)',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertTriangle size={18} /> Handshake Abgelehnt (400 Bad Request)
                </div>
                {handshakeValidation.issues.map((iss, i) => (
                  <div key={i} style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    &bull; {iss}
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>Hintergrund:</strong> Der Client initiiert einen regulären HTTP/1.1 GET-Request. Durch den Header <code>Upgrade: websocket</code> verhandeln Client und Server den Protokollwechsel auf dem bestehenden TCP-Socket.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Frame Analyzer */}
      {activeTab === 'framing' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            RFC 6455 Frame-Header & Masking-Analyzer
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Untersuche FIN-Bit, Opcodes (Text, Binary, Ping/Pong) und das obligatorische 4-Byte Client-Masking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="frame-direction-select" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Richtung:
              </label>
              <select
                id="frame-direction-select"
                value={isClientToServer ? 'c2s' : 's2c'}
                onChange={(e) => {
                  const c2s = e.target.value === 'c2s';
                  setIsClientToServer(c2s);
                  setMasked(c2s); // Standard-Vorgabe nach RFC
                }}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                <option value="c2s">Client &rarr; Server (Masking Pflicht)</option>
                <option value="s2c">Server &rarr; Client (Unmaskiert)</option>
              </select>
            </div>

            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="frame-opcode-select" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Opcode:
              </label>
              <select
                id="frame-opcode-select"
                value={opcode}
                onChange={(e) => setOpcode(Number(e.target.value))}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                {Object.entries(WS_OPCODES).map(([k, v]) => (
                  <option key={k} value={v.code}>
                    0x{v.code.toString(16).toUpperCase()} - {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}>
                <input
                  type="checkbox"
                  checked={masked}
                  onChange={(e) => setMasked(e.target.checked)}
                />
                Masked Bit gesetzt (4-Byte XOR Key)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={fin}
                  onChange={(e) => setFin(e.target.checked)}
                />
                FIN Bit (Finaler Frame)
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="frame-payload-input" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Nutzlast (Payload Text):
            </label>
            <input
              id="frame-payload-input"
              type="text"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontFamily: 'var(--font-mono, monospace)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: frameAnalysis.isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderLeft: `4px solid ${frameAnalysis.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                {frameAnalysis.isValid ? 'RFC 6455 konformer Frame' : 'Ungültiger Frame-Header'}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>Header-Overhead: <strong>{frameAnalysis.headerSize} Bytes</strong></span>
                <span>Payload: <strong>{frameAnalysis.payloadBytes} Bytes</strong></span>
                <span>Gesamt: <strong>{frameAnalysis.totalSize} Bytes</strong></span>
                <span>Overhead-Anteil: <strong>{frameAnalysis.overheadPercentage}%</strong></span>
              </div>
            </div>

            {frameAnalysis.issues.map((iss, i) => (
              <div key={i} style={{ color: 'var(--accent-rose)', fontSize: '0.88rem', marginTop: '4px' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {iss}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Duplex Session Simulator */}
      {activeTab === 'realtime' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>
                Echtzeit Full-Duplex Chat & Ping/Pong
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Zustand: <span className="badge badge-primary">{connectionState}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSendPing}
                disabled={connectionState !== 'OPEN'}
              >
                Heartbeat Ping (0x9)
              </button>
              <button
                className={`btn btn-sm ${connectionState === 'OPEN' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleToggleConnection}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Power size={14} /> {connectionState === 'OPEN' ? 'Trennen (Close)' : 'Verbinden'}
              </button>
            </div>
          </div>

          <div style={{
            height: '240px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '14px'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.direction === 'out' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  backgroundColor: m.direction === 'out' ? 'var(--accent-teal)' : 'var(--bg-main)',
                  color: m.direction === 'out' ? 'var(--text-on-accent)' : 'var(--text-main)',
                  fontSize: '0.9rem',
                  border: m.direction === 'out' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '2px' }}>{m.time}</div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder={connectionState === 'OPEN' ? 'Echtzeit-Nachricht eingeben...' : 'Verbindung geschlossen.'}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={connectionState !== 'OPEN'}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={connectionState !== 'OPEN' || !inputMsg.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={16} /> Senden
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Drill */}
      {activeTab === 'drill' && (
        <LabDrillSection
          title="WebSockets & Realtime Networking IHK-Prüfungsdrill"
          questions={WEBSOCKETS_DRILL_QUESTIONS}
          xpReward={55}
          onRewardXP={onRewardXP}
        />
      )}

      {/* Quellen */}
      <div style={{ marginTop: '28px' }}>
        <SourceList sources={SOURCES} />
      </div>
    </div>
  );
}
