import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Box, Layers, RotateCcw, Send, ArrowRight, Activity, Globe } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  createInitialCluster,
  scaleDeployment,
  toggleNodeFailure,
  routeIngressRequest
} from '../../utils/k8sClusterEngine';

export default function KubernetesClusterStudioLab() {
  const { awardXP } = useStore();
  const [cluster, setCluster] = useState(createInitialCluster);
  const [requestPath, setRequestPath] = useState('/api/auth/login');
  const [lastRouteTrace, setLastRouteTrace] = useState(null);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const [xpEvents, setXpEvents] = useState({ scale: false, node: false, traffic: false });

  const handleScale = (deploymentId, delta) => {
    const dep = cluster.deployments.find(d => d.id === deploymentId);
    if (!dep) return;
    const newCount = Math.max(0, dep.replicas + delta);
    setCluster(scaleDeployment(cluster, deploymentId, newCount));
    if (!xpEvents.scale) {
      setXpEvents(prev => ({ ...prev, scale: true }));
      awardXP(10, 'K8s Deployment Scaled');
    }
  };

  const handleToggleNode = (nodeId) => {
    const nextCluster = toggleNodeFailure(cluster, nodeId);
    setCluster(nextCluster);
    if (!xpEvents.node) {
      setXpEvents(prev => ({ ...prev, node: true }));
      awardXP(25, 'K8s Self-Healing Cluster Rebalancing');
    }
  };

  const handleSendTraffic = () => {
    setIsSimulatingTraffic(true);
    setTimeout(() => {
      const trace = routeIngressRequest(cluster, requestPath);
      setLastRouteTrace(trace);
      setIsSimulatingTraffic(false);
      if (!xpEvents.traffic) {
        setXpEvents(prev => ({ ...prev, traffic: true }));
        awardXP(15, 'K8s Ingress Traffic Routed');
      }
    }, 400);
  };

  const handleResetCluster = () => {
    setCluster(createInitialCluster());
    setLastRouteTrace(null);
  };

  return (
    <div className="space-y-6" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Layers size={14} /> Cloud Native Architecture</span>
              <span className="badge badge-teal"><Activity size={14} /> Self-Healing &amp; Ingress Load Balancing</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              ☸️ Kubernetes Cluster Visualizer &amp; Topology Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '800px', fontSize: '0.95rem' }}>
              Erlebe die inneren Mechanismen von Kubernetes: Control-Plane-Komponenten, Worker-Node-Kapazitäten,
              automatische Pod-Eviction bei Node-Crashes, Replicas-Skalierung und Ingress-to-Service Routing.
            </p>
          </div>
          <button onClick={handleResetCluster} className="action-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={16} /> Cluster zurücksetzen
          </button>
        </div>
      </div>

      {/* Control Plane Banner */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} /> Control Plane (Master Node)
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>Kubernetes v1.30.2 Ready</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { name: 'kube-apiserver', desc: 'REST API & Cluster Gateway', status: '200 OK' },
            { name: 'etcd Key-Value Store', desc: 'Cluster State & Raft Consensus', status: 'Leader Active' },
            { name: 'kube-scheduler', desc: 'Node Filtering & Scoring', status: 'Active' },
            { name: 'kube-controller-manager', desc: 'Reconciliation Loop (Desired State)', status: 'Syncing' }
          ].map((cp, idx) => (
            <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{cp.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>● {cp.status}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{cp.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployments & Scaling Manager */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box size={18} color="var(--accent-primary)" /> Workloads &amp; Deployments Controller
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {cluster.deployments.map(dep => {
            const activePods = cluster.pods.filter(p => p.deploymentId === dep.id && p.status === 'Running');
            return (
              <div key={dep.id} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{dep.name}</span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{dep.image}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Desired: <strong>{dep.replicas}</strong> | Ready: <strong>{activePods.length} / {dep.replicas}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => handleScale(dep.id, -1)} className="action-button secondary" style={{ padding: '4px 12px', fontSize: '0.9rem' }}>
                    - 1 Pod
                  </button>
                  <button onClick={() => handleScale(dep.id, 1)} className="action-button primary" style={{ padding: '4px 12px', fontSize: '0.9rem' }}>
                    + 1 Pod (Scale Up)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Worker Nodes Topology Grid */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--accent-teal, #14b8a6)" /> Worker Nodes &amp; Pod Allocation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {cluster.nodes.map(node => {
            const podsOnNode = cluster.pods.filter(p => p.nodeId === node.id);
            const isReady = node.status === 'Ready';

            return (
              <motion.div 
                key={node.id}
                layout
                style={{
                  background: isReady ? 'var(--bg-secondary)' : 'rgba(239, 68, 68, 0.08)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${isReady ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.4)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '1.05rem', color: isReady ? 'var(--text-main)' : '#ef4444' }}>
                      {node.name}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>IP: {node.ip}</div>
                  </div>
                  <button
                    onClick={() => handleToggleNode(node.id)}
                    className={`action-button ${isReady ? 'secondary' : 'primary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    {isReady ? '💥 Node killen' : '🔄 Node starten'}
                  </button>
                </div>

                {/* Pods Container */}
                <div style={{ minHeight: '140px', background: '#0f172a', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Allocated Pods ({podsOnNode.length}):
                  </div>
                  {podsOnNode.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '24px 0' }}>
                      Keine Pods auf diesem Node
                    </div>
                  ) : (
                    podsOnNode.map(pod => (
                      <div 
                        key={pod.id} 
                        style={{
                          background: pod.deploymentId === 'deploy-auth-api' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(20, 184, 166, 0.2)',
                          border: `1px solid ${pod.deploymentId === 'deploy-auth-api' ? '#818cf8' : '#2dd4bf'}`,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{pod.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pod.ip}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ingress & Traffic Route Simulator */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--accent-primary)" /> Ingress &amp; Service Mesh Traffic Tracer
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Simuliere HTTP Requests von außen durch den Ingress Controller zum Service und Ziel-Pod.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={requestPath}
              onChange={(e) => setRequestPath(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            >
              <option value="/api/auth/login">GET /api/auth/login (Auth API Service)</option>
              <option value="/dashboard">GET /dashboard (Web Frontend Service)</option>
            </select>
            <button
              onClick={handleSendTraffic}
              disabled={isSimulatingTraffic}
              className="action-button primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={16} /> HTTP Request senden
            </button>
          </div>
        </div>

        {lastRouteTrace && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <span className="badge badge-teal">Client</span>
              <ArrowRight size={14} color="#94a3b8" />
              <span className="badge badge-indigo">Ingress: {lastRouteTrace.ingress}</span>
              <ArrowRight size={14} color="#94a3b8" />
              <span className="badge badge-purple">Service: {lastRouteTrace.service} ({lastRouteTrace.serviceIP})</span>
              <ArrowRight size={14} color="#94a3b8" />
              <span className="badge badge-green">Endpoint Pod: {lastRouteTrace.pod} ({lastRouteTrace.podIP} on {lastRouteTrace.node})</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
