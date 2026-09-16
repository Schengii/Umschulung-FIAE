import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowRight, ArrowLeft, RefreshCw, Send, MessageSquare, CheckCircle2, Globe, Wifi, Server, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  createPeerInstance,
  generateSdpOffer,
  generateSdpAnswer,
  generateIceCandidates,
  simulateDataChannelTransmit
} from '../../utils/webrtcPeerEngine';

export default function WebRtcPeerStudioLab() {
  const { awardXP } = useStore();
  const [step, setStep] = useState(1);
  const [peerA, setPeerA] = useState(() => createPeerInstance('peer_a', 'Peer A (Caller)'));
  const [peerB, setPeerB] = useState(() => createPeerInstance('peer_b', 'Peer B (Callee)'));
  const [sdpOffer, setSdpOffer] = useState(null);
  const [sdpAnswer, setSdpAnswer] = useState(null);
  const [iceCandidates, setIceCandidates] = useState([]);
  
  // DataChannel Chat & Impairments
  const [latency, setLatency] = useState(35);
  const [dropRate, setDropRate] = useState(0);
  const [chatLog, setChatLog] = useState([
    { seq: 1001, sender: 'Peer A (Caller)', text: 'Hallo Peer B! Verschlüsselte P2P-Verbindung steht.', timestamp: '12:00:01', isDropped: false }
  ]);
  const [inputMsgA, setInputMsgA] = useState('');
  const [inputMsgB, setInputMsgB] = useState('');

  // Step 1: Peer A generates Offer
  const handleCreateOffer = () => {
    const offer = generateSdpOffer('peer_a');
    setSdpOffer(offer);
    setPeerA(prev => ({ ...prev, signalingState: 'have-local-offer', localDescription: offer }));
    setStep(2);
  };

  // Step 2: Send Offer via Signaling to Peer B
  const handleDeliverOffer = () => {
    setPeerB(prev => ({ ...prev, signalingState: 'have-remote-offer', remoteDescription: sdpOffer }));
    const answer = generateSdpAnswer('peer_b', sdpOffer.sdp);
    setSdpAnswer(answer);
    setStep(3);
  };

  // Step 3: Peer B sends Answer back to Peer A
  const handleDeliverAnswer = () => {
    setPeerA(prev => ({ ...prev, signalingState: 'stable', remoteDescription: sdpAnswer }));
    setPeerB(prev => ({ ...prev, signalingState: 'stable', localDescription: sdpAnswer }));
    const candidates = generateIceCandidates('Alice & Bob');
    setIceCandidates(candidates);
    setStep(4);
  };

  // Step 4: ICE Gathering & DTLS Connection Established
  const handleEstablishP2P = () => {
    setPeerA(prev => ({ ...prev, iceConnectionState: 'connected', dataChannel: { ...prev.dataChannel, state: 'open' } }));
    setPeerB(prev => ({ ...prev, iceConnectionState: 'connected', dataChannel: { ...prev.dataChannel, state: 'open' } }));
    setStep(5);
    awardXP(50, 'WebRTC P2P & DataChannel Master');
  };

  // Chat message send handler
  const handleSendMessage = (senderName, text, clearInputFn) => {
    if (!text.trim()) return;
    const packet = simulateDataChannelTransmit({
      message: text,
      senderName,
      latencyMs: latency,
      dropRatePercent: dropRate
    });

    setChatLog(prev => [...prev, packet]);
    clearInputFn('');
  };

  const handleReset = () => {
    setStep(1);
    setPeerA(createPeerInstance('peer_a', 'Peer A (Caller)'));
    setPeerB(createPeerInstance('peer_b', 'Peer B (Callee)'));
    setSdpOffer(null);
    setSdpAnswer(null);
    setIceCandidates([]);
  };

  return (
    <div className="space-y-6" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Radio size={14} /> RFC 8829 JSEP &amp; RFC 8831 DataChannels</span>
              <span className="badge badge-teal"><Lock size={14} /> DTLS / SRTP End-to-End Encryption</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              📡 WebRTC P2P DataChannel &amp; Signaling Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '800px', fontSize: '0.95rem' }}>
              Simuliere den vollständigen Peer-to-Peer Verbindungsaufbau: SDP Offer/Answer Handshake über den Signaling-Server,
              STUN/TURN ICE-Candidate-Discovery und latenzarme Datenübertragung per RTCDataChannel (SCTP/DTLS).
            </p>
          </div>
          <button onClick={handleReset} className="action-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Handshake zurücksetzen
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { num: 1, title: '1. Create Offer', desc: 'Peer A erzeugt SDP Offer' },
            { num: 2, title: '2. Signaling Offer', desc: 'Server leitet an Peer B' },
            { num: 3, title: '3. Create Answer', desc: 'Peer B erzeugt SDP Answer' },
            { num: 4, title: '4. ICE Gathering', desc: 'STUN / TURN Discovery' },
            { num: 5, title: '5. P2P Connected', desc: 'Direkter DataChannel' }
          ].map((st) => (
            <div 
              key={st.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: step >= st.num ? 1 : 0.45
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step === st.num ? 'var(--accent-primary)' : step > st.num ? '#10b981' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                {step > st.num ? <CheckCircle2 size={18} /> : st.num}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{st.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Column Architecture View: Peer A | Signaling Server | Peer B */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(240px, 0.8fr) minmax(300px, 1fr)', gap: '16px' }}>
        {/* Peer A (Caller) */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderTop: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>👤 Peer A (Caller)</h3>
            <span className="badge badge-indigo">{peerA.signalingState}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            ICE State: <strong>{peerA.iceConnectionState}</strong> | DataChannel: <strong>{peerA.dataChannel.state}</strong>
          </div>

          {step === 1 && (
            <button onClick={handleCreateOffer} className="action-button primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              SDP Offer generieren <ArrowRight size={16} />
            </button>
          )}

          {sdpOffer && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>Local SDP Offer:</div>
              <pre style={{ margin: 0, padding: '10px', background: '#0f172a', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#38bdf8', maxHeight: '140px', overflowY: 'auto' }}>
                {sdpOffer.sdp}
              </pre>
            </div>
          )}
        </div>

        {/* Signaling Server (WebSocket / HTTP Relay) */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Server size={32} color="var(--accent-purple, #a855f7)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Signaling Server</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
            Vermittelt Metadaten (SDP &amp; ICE) vor dem direkten P2P-Verbindungsaufbau.
          </p>

          {step === 2 && (
            <button onClick={handleDeliverOffer} className="action-button primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Offer weiterleiten nach Peer B <ArrowRight size={14} />
            </button>
          )}

          {step === 3 && (
            <button onClick={handleDeliverAnswer} className="action-button primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Answer weiterleiten nach Peer A <ArrowLeft size={14} />
            </button>
          )}

          {step === 4 && (
            <button onClick={handleEstablishP2P} className="action-button primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              ICE &amp; DTLS P2P verbinden <Wifi size={14} />
            </button>
          )}

          {step === 5 && (
            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Direkter P2P Mesh aktiv!
            </div>
          )}
        </div>

        {/* Peer B (Callee) */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', borderTop: '4px solid var(--accent-teal, #14b8a6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>👤 Peer B (Callee)</h3>
            <span className="badge badge-teal">{peerB.signalingState}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            ICE State: <strong>{peerB.iceConnectionState}</strong> | DataChannel: <strong>{peerB.dataChannel.state}</strong>
          </div>

          {sdpAnswer && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--accent-teal, #14b8a6)', marginBottom: '4px' }}>Local SDP Answer:</div>
              <pre style={{ margin: 0, padding: '10px', background: '#0f172a', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#4ade80', maxHeight: '140px', overflowY: 'auto' }}>
                {sdpAnswer.sdp}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ICE Candidates Inspector */}
      {iceCandidates.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--accent-primary)" /> Entdeckte ICE Candidates (STUN / TURN / Host)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {iceCandidates.map((cand, idx) => (
              <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-indigo">Type: {cand.type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority: {cand.priority}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{cand.address}:{cand.port} ({cand.protocol.toUpperCase()})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{cand.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live DataChannel Sandbox with Network Impairment */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} color="var(--accent-primary)" /> Live RTCDataChannel &amp; Network Impairment Sandbox
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Sende Echtzeit-Nachrichten über die direkte Peer-to-Peer Verbindung und simuliere Latenzen oder Paketverluste.
              </p>
            </div>

            {/* Impairment Sliders */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Latenz (RTT): <strong>{latency} ms</strong>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="400" 
                  value={latency} 
                  onChange={(e) => setLatency(Number(e.target.value))}
                  style={{ width: '120px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Packet Drop: <strong>{dropRate} %</strong>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={dropRate} 
                  onChange={(e) => setDropRate(Number(e.target.value))}
                  style={{ width: '100px' }}
                />
              </div>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div style={{ height: '220px', overflowY: 'auto', background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatLog.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  alignSelf: msg.sender.includes('Peer A') ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  background: msg.isDropped ? 'rgba(239, 68, 68, 0.2)' : msg.sender.includes('Peer A') ? 'rgba(99, 102, 241, 0.25)' : 'rgba(20, 184, 166, 0.25)',
                  border: `1px solid ${msg.isDropped ? '#ef4444' : msg.sender.includes('Peer A') ? '#818cf8' : '#2dd4bf'}`,
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold', color: msg.sender.includes('Peer A') ? '#a5b4fc' : '#5eead4' }}>{msg.sender}</span>
                  <span>{msg.timestamp} ({msg.latencyMs}ms)</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc' }}>{msg.text}</div>
                {msg.isDropped && (
                  <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '2px', fontWeight: 'bold' }}>
                    ⚠️ Paket verloren (SCTP retransmission required)
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Controls for Peer A & Peer B */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nachricht von Peer A senden..."
                value={inputMsgA}
                onChange={(e) => setInputMsgA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('Peer A (Caller)', inputMsgA, setInputMsgA)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
              <button onClick={() => handleSendMessage('Peer A (Caller)', inputMsgA, setInputMsgA)} className="action-button primary" style={{ padding: '8px 14px' }}>
                <Send size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nachricht von Peer B senden..."
                value={inputMsgB}
                onChange={(e) => setInputMsgB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('Peer B (Callee)', inputMsgB, setInputMsgB)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
              <button onClick={() => handleSendMessage('Peer B (Callee)', inputMsgB, setInputMsgB)} className="action-button primary" style={{ padding: '8px 14px' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
