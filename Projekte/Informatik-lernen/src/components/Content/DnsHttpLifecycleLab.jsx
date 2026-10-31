import React, { useState } from 'react';

import { Globe, ArrowRight, Play, CheckCircle2, Network, RotateCcw } from 'lucide-react';
import { DNS_LIFECYCLE_STEPS } from '../../data/nextGenLabsData';
import { useStore } from '../../store/useStore';
import { onActivationKey } from '../Shared/keyActivation';

export default function DnsHttpLifecycleLab() {
  const { awardXP } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [inputUrl, setInputUrl] = useState('https://informatik-lernen.de/api/dashboard');

  const currentStep = DNS_LIFECYCLE_STEPS[currentStepIdx];

  const handleNextStep = () => {
    if (currentStepIdx < DNS_LIFECYCLE_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isComplete) {
      setIsComplete(true);
      awardXP(65, 'Netzwerk Master: DNS & HTTP Lifecycle');
    }
  };

  const handleAutoPlay = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentStepIdx(0);
    setIsComplete(false);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < DNS_LIFECYCLE_STEPS.length) {
        setCurrentStepIdx(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setIsComplete(true);
        awardXP(65, 'Netzwerk Master: DNS & HTTP Lifecycle');
      }
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsComplete(false);
    setIsSimulating(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '20px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Globe size={16} /> End-to-End Netzwerk- & Web-Architektur Visualizer
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            DNS & HTTP/TLS Request-Lifecycle Inspector
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Was passiert bei einem Browser-Klick? Verfolge die Reise von DNS-Iterationen bis zum TLS 1.3 Handshake & HTTP/2 Multiplexing.
          </p>
        </div>

        {/* URL Bar Simulator */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', gap: '8px', width: 'min(420px, 100%)' }}>
          <Globe size={16} color="#38bdf8" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%', fontFamily: 'monospace' }}
          />
        </div>
      </div>

      {/* Stepper Pipeline Bar */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: '700px' }}>
          {DNS_LIFECYCLE_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            const isPassed = idx < currentStepIdx;
            return (
              <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => !isSimulating && setCurrentStepIdx(idx))}
                key={s.step}
                onClick={() => !isSimulating && setCurrentStepIdx(idx)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid #38bdf8' : isPassed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--text-main)' : isPassed ? 'var(--accent-emerald)' : 'var(--text-dim)',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  cursor: isSimulating ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>#{s.step}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{s.phase}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Details & Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Step Inspector Card */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                Phase {currentStep.step} von 8
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                Latenz: {currentStep.latency}
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              {currentStep.title}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
              {currentStep.description}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Netzwerk-Details & Payload:
              </div>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                {currentStep.detail}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Ziel / Station:</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{currentStep.target}</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Protokoll / Port:</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{currentStep.protocol}</strong>
              </div>
            </div>
          </div>

          {/* Stepper Controls */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={handleAutoPlay}
              disabled={isSimulating}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: isSimulating ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Play size={16} /> {isSimulating ? 'Simulation läuft...' : 'Vollautomatik'}
            </button>
            <button
              onClick={handleNextStep}
              disabled={isSimulating || isComplete}
              style={{
                flex: 1.5,
                padding: '10px',
                borderRadius: '8px',
                background: isComplete ? '#22c55e' : '#0284c7',
                border: 'none',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: isComplete ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              {isComplete ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {isComplete ? 'Lebenszyklus komplett (+65 XP)' : 'Nächste Station'}
            </button>
            {isComplete && (
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Visual OSI & Network Stack Architecture Diagram */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="#818cf8" /> OSI-Schichten & Datenfluss
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { layer: 'Schicht 7 (Anwendung)', desc: 'HTTP/2, DNS, TLS 1.3 Daten payload', active: currentStep.step <= 5 || currentStep.step >= 7, color: 'var(--accent-cyan)' },
              { layer: 'Schicht 4 (Transport)', desc: 'TCP (Port 443 SYN/ACK) & UDP (Port 53)', active: currentStep.step === 6 || currentStep.step <= 5, color: 'var(--accent-primary)' },
              { layer: 'Schicht 3 (Vermittlung)', desc: 'IPv4 (185.199.108.153) & IPv6 Routing', active: true, color: 'var(--accent-emerald)' },
              { layer: 'Schicht 2 & 1 (Netzzugang)', desc: 'Ethernet Frames, Wi-Fi 6, Glasfaser Lichtimpulse', active: true, color: 'var(--accent-amber)' }
            ].map(l => (
              <div
                key={l.layer}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: l.active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  borderLeft: `4px solid ${l.color}`,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: l.color }}>{l.layer}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>{l.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            💡 <strong>Prüfungswissen FISI & FIAE:</strong> DNS nutzt standardmäßig **UDP Port 53** für maximale Geschwindigkeit und geringen Overhead. Ab Zonengrößen &gt; 512 Bytes (EDNS0) oder bei Zonentransfers (AXFR) wird automatisch auf **TCP Port 53** gewechselt.
          </div>
        </div>

      </div>
    </div>
  );
}
