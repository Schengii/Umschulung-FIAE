import React, { useState, useRef, useEffect } from 'react';
import { Shield, Copy, Check, Network, Play } from 'lucide-react';
import { ServiceMeshSimulator } from '../../utils/serviceMeshEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function ServiceMeshLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [canaryV1, setCanaryV1] = useState(80);
  const [mtlsMode, setMtlsMode] = useState('STRICT');
  const [copied, setCopied] = useState(false);
  const [solved, setSolved] = useState(false);

  const meshRef = useRef(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    meshRef.current = new ServiceMeshSimulator();
    meshRef.current.setCanaryWeights(80);
    meshRef.current.routeRequest(101);
    meshRef.current.routeRequest(102);
    setTick(t => t + 1);
  }, []);

  const handleWeightChange = (val) => {
    setCanaryV1(val);
    if (meshRef.current) meshRef.current.setCanaryWeights(val);
    triggerHaptic('SELECTION');
    setTick(t => t + 1);
  };

  const handleMtlsChange = (mode) => {
    setMtlsMode(mode);
    if (meshRef.current) meshRef.current.mtlsMode = mode;
    triggerHaptic('SELECTION');
    setTick(t => t + 1);
  };

  const handleSendRequest = () => {
    if (!meshRef.current) return;
    meshRef.current.routeRequest(Math.floor(100 + Math.random() * 900));
    triggerHaptic('SUCCESS');
    setTick(t => t + 1);
    checkXP();
  };

  const handleCopyYaml = () => {
    if (!meshRef.current) return;
    navigator.clipboard.writeText(meshRef.current.generateVirtualServiceYaml());
    setCopied(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => setCopied(false), 2000);
    checkXP();
  };

  const checkXP = () => {
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'service_mesh_master');
      }
    }
  };

  const history = meshRef.current ? meshRef.current.routingHistory : [];
  const yaml = meshRef.current ? meshRef.current.generateVirtualServiceYaml() : '';

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} /> Cloud-Native Microservices
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Service Mesh mTLS &amp; Envoy Proxy
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🕸️ Service Mesh mTLS &amp; Envoy Sidecar Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche Envoy Sidecar Proxy Interception, SPIFFE/SPIRE X.509 mTLS Identitäten und dynamisches Canary Traffic Shifting mit Istio VirtualServices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSendRequest}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={16} /> Request Senden
          </button>
          <button
            onClick={handleCopyYaml}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Kopiert!' : 'Istio YAML Kopieren (+45 XP)'}
          </button>
        </div>
      </div>

      {/* Mode Controls & SPIFFE Ident Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>mTLS Authentifizierung:</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            {['STRICT', 'PERMISSIVE', 'DISABLED'].map(mode => (
              <button
                key={mode}
                onClick={() => handleMtlsChange(mode)}
                className={`btn ${mtlsMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client SPIFFE Identity:</span>
          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#10b981', marginTop: '6px', wordBreak: 'break-all' }}>
            <code>spiffe://cluster.local/ns/prod/sa/frontend</code>
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target SPIFFE Identity:</span>
          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--accent-primary)', marginTop: '6px', wordBreak: 'break-all' }}>
            <code>spiffe://cluster.local/ns/prod/sa/order-service</code>
          </div>
        </div>
      </div>

      {/* Canary Traffic Slider */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Canary Traffic Split:</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            v1 (Stable): {canaryV1}% | v2 (Canary): {100 - canaryV1}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={canaryV1}
          onChange={(e) => handleWeightChange(parseInt(e.target.value, 10))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Live Routing Log & Istio YAML Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Envoy Intercept Log */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
            Envoy Sidecar Routing &amp; mTLS Log:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {history.map((h, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  <span>Req #{h.requestId} ➔ {h.selectedVersion}</span>
                  <span style={{ color: h.mtlsStatus.includes('ESTABLISHED') ? '#10b981' : '#ef4444' }}>{h.mtlsStatus}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Envoy Port: {h.envoyPortIntercept}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Istio Manifest */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
            Istio VirtualService &amp; PeerAuthentication (YAML):
          </span>

          <pre
            style={{
              margin: 0,
              padding: '14px',
              background: '#090d16',
              color: '#38bdf8',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: '1.4',
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            {yaml}
          </pre>
        </div>
      </div>
    </div>
  );
}
