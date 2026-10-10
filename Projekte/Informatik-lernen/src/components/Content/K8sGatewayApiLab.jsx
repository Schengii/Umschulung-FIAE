import React, { useState } from 'react';
import {
  Network,
  Split,
  FileCode,
  Award,
  Sparkles,
  Server,
  Play,
  CheckCircle,
  Percent
} from 'lucide-react';
import {
  routeRequest,
  simulateTrafficDistribution,
  generateGatewayApiYaml
} from '../../utils/k8sGatewayApiEngine';
import { useStore } from '../../store/useStore';

export default function K8sGatewayApiLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);

  // Split weights state
  const [stableWeight, setStableWeight] = useState(90);
  const [canaryWeight, setCanaryWeight] = useState(10);
  const [isHeaderCanary, setIsHeaderCanary] = useState(false);

  // Single test & batch results
  const [lastRouteResult, setLastRouteResult] = useState(null);
  const [batchStats, setBatchStats] = useState(null);

  const routeConfig = {
    name: 'order-service-route',
    gatewayName: 'cluster-edge-gateway',
    hostnames: ['api.enterprise.de'],
    rules: [
      ...(isHeaderCanary ? [{
        matchesHeaders: [{ name: 'X-Canary-User', type: /** @type {'Exact'} */ ('Exact'), value: 'true' }],
        backendRefs: [{ name: 'order-service-v2-canary', port: 8080, weight: 100 }]
      }] : []),
      {
        matchesPath: ['/api/v1/orders'],
        backendRefs: [
          { name: 'order-service-v1-stable', port: 8080, weight: stableWeight },
          { name: 'order-service-v2-canary', port: 8080, weight: canaryWeight }
        ]
      }
    ]
  };

  const handleSendSingleRequest = () => {
    const res = routeRequest(
      {
        path: '/api/v1/orders',
        headers: isHeaderCanary ? { 'X-Canary-User': 'true' } : {}
      },
      routeConfig
    );
    setLastRouteResult(res);

    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'k8s_gateway_api_master');
    }
  };

  const handleRunBatchSimulation = () => {
    const stats = simulateTrafficDistribution(
      1000,
      {
        path: '/api/v1/orders',
        headers: isHeaderCanary ? { 'X-Canary-User': 'true' } : {}
      },
      routeConfig
    );
    setBatchStats(stats);

    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'k8s_gateway_api_master');
    }
  };

  const yaml = generateGatewayApiYaml(routeConfig);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Network size={14} /> Kubernetes Networking
              </span>
              <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Split size={14} /> Gateway API &amp; Envoy Ingress
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Split size={28} style={{ color: 'var(--accent-indigo)' }} />
              Kubernetes Gateway API &amp; Envoy Traffic Splitting Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Der offizielle Nachfolger von K8s Ingress: Moderne L4/L7 Verkehrssteuerung mit <code>GatewayClass</code>, <code>Gateway</code> und <code>HTTPRoute</code>. 
              Prozentuale Canary-Traffic-Splits (z. B. 90% v1 vs. 10% v2) und Header-basiertes Routing live testen.
            </p>
          </div>

          <div>
            {completed && (
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> +65 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Traffic Controls & Routing Visualizer */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Canary Split Controls */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={18} style={{ color: 'var(--accent-teal)' }} /> Canary Traffic Split Konfiguration
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--accent-teal)' }}>Stable v1 ({stableWeight}%)</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-rose)' }}>Canary v2 ({canaryWeight}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={canaryWeight}
              onChange={(e) => {
                const c = Number(e.target.value);
                setCanaryWeight(c);
                setStableWeight(100 - c);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '18px', padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={isHeaderCanary}
                onChange={(e) => setIsHeaderCanary(e.target.checked)}
              />
              <span>Header-Bypass erzwingen: <code>X-Canary-User: true</code> (100% v2)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSendSingleRequest}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: '700' }}
            >
              <Play size={16} /> Einzelnen HTTP-Request senden
            </button>
            <button
              onClick={handleRunBatchSimulation}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
            >
              <Sparkles size={16} /> 1.000 Requests Stresstest
            </button>
          </div>

          {lastRouteResult && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '8px',
              background: lastRouteResult.isCanary ? 'rgba(244, 63, 94, 0.12)' : 'rgba(6, 182, 212, 0.12)',
              border: `1px solid ${lastRouteResult.isCanary ? 'var(--accent-rose)' : 'var(--accent-teal)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle size={18} style={{ color: lastRouteResult.isCanary ? 'var(--accent-rose)' : 'var(--accent-teal)' }} />
                <strong style={{ fontSize: '0.92rem', color: lastRouteResult.isCanary ? 'var(--accent-rose)' : 'var(--accent-teal)' }}>
                  Ziel-Pod: {lastRouteResult.selectedBackend}
                </strong>
                <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>
                  {lastRouteResult.isCanary ? 'Canary Release' : 'Stable Production'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Traffic Distribution Statistics */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: 'var(--accent-indigo)' }} /> Reale Lastverteilung (Envoy Proxy Telemetrie)
          </h2>

          {batchStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(batchStats).map(([backend, data]) => (
                <div key={backend} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: '700', color: backend.includes('canary') ? 'var(--accent-rose)' : 'var(--accent-teal)' }}>
                      {backend}
                    </span>
                    <span style={{ fontWeight: '800' }}>{data.percent}% ({data.count} Requests)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${data.percent}%`,
                      height: '100%',
                      background: backend.includes('canary') ? 'var(--accent-rose)' : 'var(--accent-teal)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Klicke auf "1.000 Requests Stresstest", um die reale statistische Gewichtsverteilung im Envoy Gateway zu visualisieren.
            </div>
          )}
        </div>
      </div>

      {/* Gateway API YAML Manifest */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode size={18} style={{ color: 'var(--accent-teal)' }} /> Kubernetes Gateway &amp; HTTPRoute Manifest
        </h2>
        <div className="code-window">
          <pre className="code-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <code>{yaml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
