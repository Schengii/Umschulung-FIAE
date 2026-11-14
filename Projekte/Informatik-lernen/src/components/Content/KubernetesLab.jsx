import React, { useState, useMemo } from 'react';
import { Cpu, Server, Network, CheckCircle2, AlertTriangle, Copy, Award, Plus, Minus, RefreshCw } from 'lucide-react';
import {
  validateK8sManifest,
  simulateReconciliation,
  matchServiceEndpoints,
  K8S_DRILL_QUESTIONS
} from '../../utils/kubernetesEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const INITIAL_DEPLOYMENT_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-api
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      containers:
      - name: payment-service
        image: registry.ihk-dev.de/payment:v2.1
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"`;

const SOURCES = [
  { title: 'Kubernetes Docs – Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/', note: 'Deklarative Updates für Pods und ReplicaSets' },
  { title: 'Kubernetes Docs – Services, Load Balancing, and Networking', url: 'https://kubernetes.io/docs/concepts/services-networking/service/', note: 'ClusterIP, NodePort, LoadBalancer und Endpoint-Selektoren' },
  { title: 'Kubernetes Docs – Configure Liveness and Readiness Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/', note: 'Healthchecks und Traffic-Steuerung' }
];

export default function KubernetesLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('manifest');
  const [yamlText, setYamlText] = useState(INITIAL_DEPLOYMENT_YAML);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Manifest Validation
  const validation = useMemo(() => validateK8sManifest(yamlText), [yamlText]);

  // Reconciliation Simulator State
  const [desiredReplicas, setDesiredReplicas] = useState(3);
  const [pods, setPods] = useState([
    { id: 'pod-a1b2', name: 'app-api-pod-a1b2', status: 'Running', node: 'node-worker-1', appLabel: 'payment-api', ip: '10.244.1.12' },
    { id: 'pod-c3d4', name: 'app-api-pod-c3d4', status: 'Running', node: 'node-worker-2', appLabel: 'payment-api', ip: '10.244.2.19' },
    { id: 'pod-e5f6', name: 'app-api-pod-e5f6', status: 'Running', node: 'node-worker-3', appLabel: 'payment-api', ip: '10.244.3.4' }
  ]);

  const reconciliation = useMemo(() => {
    return simulateReconciliation(desiredReplicas, pods);
  }, [desiredReplicas, pods]);

  // Service Routing Simulator State
  const [serviceSelector, setServiceSelector] = useState('payment-api');
  const serviceEndpoints = useMemo(() => {
    return matchServiceEndpoints(serviceSelector, pods);
  }, [serviceSelector, pods]);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKillPod = (id) => {
    setPods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClaimLabXp = () => {
    if (!xpClaimed && onRewardXP && validation.isValid) {
      onRewardXP(45);
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={30} style={{ color: 'var(--accent-indigo)' }} /> Kubernetes & Cloud Native Architecture Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '750px' }}>
              Deployments, Services, Controller-Reconciliation-Loop, Pod-Self-Healing und IHK-Prüfungsdrill.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {validation.isValid && !xpClaimed && (
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
          className={`btn ${activeTab === 'manifest' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('manifest')}
          style={{ minHeight: '44px' }}
        >
          <Cpu size={16} /> 1. Manifest Validator
        </button>
        <button
          className={`btn ${activeTab === 'controller' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('controller')}
          style={{ minHeight: '44px' }}
        >
          <Server size={16} /> 2. Controller & Self-Healing
        </button>
        <button
          className={`btn ${activeTab === 'service' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('service')}
          style={{ minHeight: '44px' }}
        >
          <Network size={16} /> 3. Service & Endpoints
        </button>
        <button
          className={`btn ${activeTab === 'drill' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('drill')}
          style={{ minHeight: '44px' }}
        >
          <Award size={16} /> 4. IHK-Drill
        </button>
      </div>

      {/* Tab 1: Manifest Validator */}
      {activeTab === 'manifest' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label htmlFor="k8s-manifest-editor" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Kubernetes YAML Manifest
              </label>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy} aria-label="YAML kopieren">
                <Copy size={14} /> {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
            <textarea
              id="k8s-manifest-editor"
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              rows={15}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.9rem',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setYamlText(INITIAL_DEPLOYMENT_YAML)}
              >
                <RefreshCw size={14} /> Vorlage: Deployment
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setYamlText("apiVersion: v1\nkind: Service\nmetadata:\n  name: payment-svc\nspec:\n  type: LoadBalancer\n  selector:\n    app: payment-api\n  ports:\n  - port: 80\n    targetPort: 8080")}
              >
                Vorlage: Service (LoadBalancer)
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              K8s Spezifikations-Check
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: validation.score >= 80 ? 'var(--accent-emerald)' : validation.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'
              }}>
                {validation.score}/100
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Ressource: {validation.kind} ({validation.name})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {validation.isValid ? 'Spezifikation syntaktisch valide' : 'Fehler in der Spezifikation'}
                </div>
              </div>
            </div>

            {validation.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: issue.startsWith('Best Practice') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderLeft: `4px solid ${issue.startsWith('Best Practice') ? 'var(--accent-amber)' : 'var(--accent-rose)'}`,
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={16} style={{ color: issue.startsWith('Best Practice') ? 'var(--accent-amber)' : 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '4px solid var(--accent-emerald)',
                color: 'var(--text-main)'
              }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> Keine Spezifikationsmängel
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Alle Pflichtfelder, Selektoren und Ressourcengrenzen sind korrekt deklariert.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Controller & Self Healing */}
      {activeTab === 'controller' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>
                Reconciliation-Loop & Self-Healing
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Der Kube-Controller gleicht den Ist-Zustand (laufende Pods) fortlaufend mit dem Soll-Zustand (Replicas) ab.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Soll-Replicas: {desiredReplicas}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDesiredReplicas((r) => Math.max(1, r - 1))}
                aria-label="Replicas verringern"
              >
                <Minus size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDesiredReplicas((r) => Math.min(6, r + 1))}
                aria-label="Replicas erhöhen"
              >
                <Plus size={14} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setPods(reconciliation.pods)}
              >
                <RefreshCw size={14} /> Reconcile
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '14px', marginBottom: '20px' }}>
            {pods.map((pod) => (
              <div
                key={pod.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {pod.name}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    {pod.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Node: <strong>{pod.node}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  IP: <code>{pod.ip || '10.244.x.x'}</code>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleKillPod(pod.id)}
                  style={{ width: '100%', color: 'var(--accent-rose)' }}
                >
                  Simuliere Pod-Crash (Kill)
                </button>
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: pods.length === desiredReplicas ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderLeft: `4px solid ${pods.length === desiredReplicas ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {pods.length === desiredReplicas ? (
                <span>Cluster in Sync: {pods.length} von {desiredReplicas} Pods aktiv und gesund.</span>
              ) : (
                <span>Drift erkannt: {pods.length} aktive Pods vs. {desiredReplicas} Soll-Replicas! Klicke 'Reconcile' für Self-Healing.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Service & Endpoints */}
      {activeTab === 'service' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Service Endpoint-Resolution
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Ein Kubernetes Service bündelt Pods über Label-Selektoren. Nur Pods mit übereinstimmendem Label erhalten Netzwerk-Traffic.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <label htmlFor="service-selector-input" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Service-Selektor (app=...):
            </label>
            <input
              id="service-selector-input"
              type="text"
              value={serviceSelector}
              onChange={(e) => setServiceSelector(e.target.value)}
              style={{
                padding: '6px 12px',
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
            backgroundColor: serviceEndpoints.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderLeft: `4px solid ${serviceEndpoints.isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
          }}>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Aktive Service-Endpoints ({serviceEndpoints.endpoints.length}):
            </div>
            {serviceEndpoints.isAvailable ? (
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)' }}>
                {serviceEndpoints.endpoints.map((ep, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    Pod: <strong>{ep.podId}</strong> &rarr; Routing an IP: <code>{ep.ip}:8080</code>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'var(--accent-rose)' }}>
                Keine gesunden Pods mit Label 'app={serviceSelector}' gefunden! Service liefert 503 Service Unavailable.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Drill */}
      {activeTab === 'drill' && (
        <LabDrillSection
          title="Kubernetes & Cloud Native IHK-Prüfungsdrill"
          questions={K8S_DRILL_QUESTIONS}
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
