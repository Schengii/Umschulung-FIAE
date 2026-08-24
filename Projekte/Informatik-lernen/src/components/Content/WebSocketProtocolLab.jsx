import React, { useState, useEffect } from 'react';
import { Wifi, Send, ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle2, ShieldCheck, Zap, Terminal, Sparkles } from 'lucide-react';

export default function WebSocketProtocolLab({ onRewardXP }) {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED'); // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pingLatency, setPingLatency] = useState(null);
  const [handshakeHeaders, setHandshakeHeaders] = useState({
    secKey: 'dGhlIHNhbXBsZSBub25jZQ==',
    secAccept: 's3pPLMBiTxaQ9kYGzzhZRbK+xOo='
  });

  const handleConnect = () => {
    if (connectionStatus === 'CONNECTED') return;
    setConnectionStatus('CONNECTING');

    setTimeout(() => {
      setConnectionStatus('CONNECTED');
      setMessages([
        { id: 1, type: 'system', text: 'HTTP/1.1 101 Switching Protocols', time: new Date().toLocaleTimeString() },
        { id: 2, type: 'server', text: '👋 Willkommen am WebSocket Server (wss://realtime.devgame.it/chat)', time: new Date().toLocaleTimeString() }
      ]);
      if (onRewardXP) onRewardXP(30);
    }, 1000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('DISCONNECTED');
    setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'WebSocket Connection Closed (Code 1000: Normal Closure)', time: new Date().toLocaleTimeString() }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || connectionStatus !== 'CONNECTED') return;

    const userMsg = { id: Date.now(), type: 'client', text: inputMessage, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Echo reply simulation
    setTimeout(() => {
      const serverMsg = {
        id: Date.now() + 1,
        type: 'server',
        text: `Echo Server Antwort: "${userMsg.text}" (Processed in 12ms)`,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, serverMsg]);
    }, 600);
  };

  const handleSendPing = () => {
    if (connectionStatus !== 'CONNECTED') return;
    const start = performance.now();
    setMessages(prev => [...prev, { id: Date.now(), type: 'ping', text: 'PING Frame (Opcode 0x9)', time: new Date().toLocaleTimeString() }]);

    setTimeout(() => {
      const end = performance.now();
      const latency = Math.round(end - start);
      setPingLatency(latency);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'pong', text: `PONG Frame (Opcode 0xA) - Latency: ${latency}ms`, time: new Date().toLocaleTimeString() }]);
    }, 14);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={14} /> Realtime WebSockets Protocol (RFC 6455)
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌐 WebSockets & Real-Time Protocol Lab
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Erforsche den HTTP 101 Upgrade Handshake, bi-direktionale WebSocket Frames & Ping/Pong Heartbeats.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {connectionStatus === 'CONNECTED' ? (
            <button className="btn btn-secondary" onClick={handleDisconnect} style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', gap: '8px' }}>
              Verbindung Trennen
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect} disabled={connectionStatus === 'CONNECTING'} style={{ gap: '8px', minWidth: '170px' }}>
              <Wifi size={18} /> {connectionStatus === 'CONNECTING' ? 'Handshake...' : 'WebSocket Verbinden'}
            </button>
          )}
        </div>
      </div>

      {/* Handshake Details Banner */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🤝 HTTP 101 Switching Protocols Handshake:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
          <div style={{ background: '#0f172a', padding: '12px', borderRadius: 'var(--radius-md)', color: '#38bdf8' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>CLIENT REQUEST:</div>
            GET /chat HTTP/1.1<br />
            Host: realtime.devgame.it<br />
            Upgrade: websocket<br />
            Connection: Upgrade<br />
            Sec-WebSocket-Key: {handshakeHeaders.secKey}
          </div>
          <div style={{ background: '#0f172a', padding: '12px', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>SERVER RESPONSE:</div>
            HTTP/1.1 101 Switching Protocols<br />
            Upgrade: websocket<br />
            Connection: Upgrade<br />
            Sec-WebSocket-Accept: {handshakeHeaders.secAccept}
          </div>
        </div>
      </div>

      {/* WebSocket Frame Terminal Log & Chat Controls */}
      <div style={{ background: '#0f172a', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: connectionStatus === 'CONNECTED' ? '#10b981' : connectionStatus === 'CONNECTING' ? '#f59e0b' : '#ef4444',
              boxShadow: connectionStatus === 'CONNECTED' ? '0 0 10px #10b981' : 'none'
            }} />
            <span style={{ color: '#f8fafc', fontWeight: '700', fontSize: '0.9rem' }}>
              Status: {connectionStatus} {pingLatency ? `(${pingLatency}ms)` : ''}
            </span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleSendPing}
            disabled={connectionStatus !== 'CONNECTED'}
            style={{ fontSize: '0.82rem', padding: '6px 12px', gap: '6px' }}
          >
            <Zap size={14} style={{ color: '#f59e0b' }} /> Ping / Pong Test
          </button>
        </div>

        {/* Message Stream */}
        <div style={{
          background: '#020617',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          minHeight: '260px',
          maxHeight: '320px',
          overflowY: 'auto',
          border: '1px solid #0f172a',
          marginBottom: '16px'
        }}>
          {messages.length === 0 ? (
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Verbindung noch nicht hergestellt. Klicke oben auf "WebSocket Verbinden".</span>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                style={{
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem'
                }}
              >
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>[{m.time}]</span>
                {m.type === 'client' && (
                  <span style={{ color: '#6366f1', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowUpRight size={14} /> CLIENT FRAME:
                  </span>
                )}
                {m.type === 'server' && (
                  <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowDownLeft size={14} /> SERVER FRAME:
                  </span>
                )}
                {m.type === 'system' && (
                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>[SYSTEM]:</span>
                )}
                {m.type === 'ping' && (
                  <span style={{ color: '#ec4899', fontWeight: '700' }}>[PING]:</span>
                )}
                {m.type === 'pong' && (
                  <span style={{ color: '#38bdf8', fontWeight: '700' }}>[PONG]:</span>
                )}
                <span style={{ color: '#f8fafc' }}>{m.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={connectionStatus !== 'CONNECTED'}
            placeholder={connectionStatus === 'CONNECTED' ? 'WebSocket Nachricht senden...' : 'Verbinde erst zum WebSocket Server'}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontFamily: 'monospace',
              fontSize: '0.92rem'
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={connectionStatus !== 'CONNECTED'} style={{ gap: '8px' }}>
            <Send size={16} /> Senden
          </button>
        </form>
      </div>
    </div>
  );
}
