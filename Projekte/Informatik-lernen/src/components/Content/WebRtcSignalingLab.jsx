import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowRight, Play, RotateCcw, CheckCircle2, ShieldCheck, Video, Send, Zap, Globe, MessageSquare } from 'lucide-react';
import { WEBRTC_SIGNALING_STEPS } from '../../data/advancedLabsData';
import { useStore } from '../../store/useStore';

export default function WebRtcSignalingLab() {
  const { awardXP } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'Alice', text: 'Hallo Bob! Kannst du meinen verschlüsselten WebRTC P2P Stream empfangen?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentStep = WEBRTC_SIGNALING_STEPS[currentStepIdx];

  const handleNextStep = () => {
    if (currentStepIdx < WEBRTC_SIGNALING_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(75, 'WebRTC Master: P2P Signaling & DataChannel');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { from: 'Du (Peer)', text: inputMsg }]);
    setInputMsg('');
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '20px', color: '#f472b6', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Radio size={16} /> Realtime Peer-to-Peer & SDP Signaling Handshake
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            WebRTC P2P & Signaling Simulator
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe SDP Offer/Answer, STUN NAT-Traversal, DTLS/SRTP Verschlüsselung und RTCDataChannels zwischen zwei Browsern.
          </p>
        </div>

        {/* Progress Badge */}
        <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#fbbf24" /> Schritt {currentStepIdx + 1} / {WEBRTC_SIGNALING_STEPS.length}
        </div>
      </div>

      {/* Pipeline Stepper Bar */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: '650px' }}>
          {WEBRTC_SIGNALING_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            const isPassed = idx < currentStepIdx;

            return (
              <div
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isActive ? 'linear-gradient(135deg, #db2777, #be185d)' : isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid #f472b6' : isPassed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? '#fff' : isPassed ? '#86efac' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Schritt {s.step}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{s.actor}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid: Handshake Step & Live DataChannel Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Step Details */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', fontWeight: 'bold' }}>
                {currentStep.actor}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                Latenz: {currentStep.latency}
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 12px 0' }}>
              {currentStep.title}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
              {currentStep.desc}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                Technische Nutzlast (Payload & Codecs):
              </div>
              <div style={{ color: '#f472b6', fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {currentStep.technical}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleNextStep}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isCompleted ? '#22c55e' : '#db2777',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(219, 39, 119, 0.4)'
              }}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {isCompleted ? 'P2P Verbindung aktiv (+75 XP)' : 'Nächster Signaling Schritt'}
            </button>
          </div>
        </div>

        {/* Right: Live RTCDataChannel & MediaStream Sandbox */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                <Video size={17} color="#38bdf8" /> RTCDataChannel Live Chat
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: currentStepIdx >= 5 ? '#22c55e' : '#eab308', color: '#000', fontWeight: 'bold' }}>
                {currentStepIdx >= 5 ? 'P2P VERBUNDEN' : 'SIGNALING WARTET'}
              </span>
            </div>

            {/* Chat History */}
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '14px', minHeight: '160px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                  <strong style={{ color: '#f472b6' }}>{msg.from}:</strong> <span style={{ color: '#e2e8f0' }}>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nachricht über RTCDataChannel senden..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={currentStepIdx < 5}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#0f172a',
                border: '1px solid #475569',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              disabled={currentStepIdx < 5 || !inputMsg.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#db2777',
                border: 'none',
                color: '#fff',
                cursor: currentStepIdx < 5 ? 'default' : 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
