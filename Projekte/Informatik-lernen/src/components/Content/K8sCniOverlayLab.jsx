import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Cloud, Server, ArrowRight, Play, RotateCcw, CheckCircle2, Layers, Cpu } from 'lucide-react';
import { K8S_CNI_PACKET_STEPS } from '../../data/enterpriseLabsData';
import { useStore } from '../../store/useStore';

export default function K8sCniOverlayLab() {
  const { awardXP } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = K8S_CNI_PACKET_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < K8S_CNI_PACKET_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(75, 'Cloud Master: Kubernetes CNI & VXLAN Overlay');
    }
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Cloud size={16} /> Kubernetes CNI Overlay (Calico / Flannel VXLAN)
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Kubernetes CNI & VXLAN Overlay Network Visualizer
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verfolge den Cross-Node Paketfluss: Von Pod A über veth-Interfaces, VXLAN UDP-Kapselung bis zur Auslieferung an Pod B.
          </p>
        </div>

        {/* Step Badge */}
        <span style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px', background: 'var(--card-bg, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontWeight: 'bold' }}>
          Schritt {currentStepIdx + 1} / {K8S_CNI_PACKET_STEPS.length}
        </span>
      </div>

      {/* Stepper Pipeline */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: '600px' }}>
          {K8S_CNI_PACKET_STEPS.map((s, idx) => {
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
                  background: isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid #38bdf8' : isPassed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)',
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
                <span>#{s.step}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{s.location}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details & Visual Encapsulation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Step Details */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 'bold' }}>
                {currentStep.layer}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                {currentStep.location}
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 12px 0' }}>
              {currentStep.desc}
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                Paket-Header & Kapselung (Encapsulation):
              </div>
              <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                {currentStep.packet}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleReset}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isCompleted ? '#22c55e' : '#0284c7',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {isCompleted ? 'Paket erfolgreich zugestellt (+75 XP)' : 'Nächste Netzwerk-Station'}
            </button>
          </div>
        </div>

        {/* Right: Architecture Diagram */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={17} color="#818cf8" /> Cross-Node Kubernetes Topology
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>Node 1 (192.168.1.10)</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Pod A: 10.244.1.42</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• vxlan.calico tunnel device</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>Node 2 (192.168.1.20)</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Pod B: 10.244.2.88</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• vxlan.calico tunnel device</div>
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
            💡 <strong>IHK & CKA Prüfungswissen:</strong> VXLAN nutzt standardmäßig **UDP Port 4789** (RFC 7348). Bei Cloud-Deployments (z. B. AWS/GCP) müssen die Security Groups diesen UDP-Port zwischen den Worker-Nodes freischalten.
          </div>
        </div>

      </div>
    </div>
  );
}
