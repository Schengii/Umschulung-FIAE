import React, { useState, useMemo } from 'react';
import {
  Cloud, GitBranch, RefreshCw, CheckCircle, AlertTriangle, Award, Terminal, PlusCircle
} from 'lucide-react';
import {
  createInitialArgoApp, computeGitOpsDiff, synchronizeApplication
} from '../../utils/argoCdGitOpsEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function ArgoCdGitOpsLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [app, setApp] = useState(createInitialArgoApp);
  const [solved, setSolved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const diffResult = useMemo(() => {
    return computeGitOpsDiff(app.gitResources, app.liveResources);
  }, [app]);

  const handleSync = () => {
    setSyncing(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => {
      setApp(prev => synchronizeApplication(prev));
      setSyncing(false);
      triggerHaptic('LEVEL_UP');
    }, 600);
  };

  const simulateManualClusterDrift = () => {
    setApp(prev => {
      const live = [...prev.liveResources.map(r => ({ ...r }))];
      // Manueller kubectl scale Befehl direkt am Cluster vorbei
      if (live[0]) live[0].replicas = 7;
      // Verwaiste Ressource
      live.push({
        kind: 'Pod',
        name: 'manual-debug-troubleshoot',
        namespace: 'prod',
        replicas: 1,
        image: 'busybox:latest'
      });
      return {
        ...prev,
        liveResources: live
      };
    });
    triggerHaptic('WARNING');
  };

  const simulateGitCommitUpgrade = () => {
    setApp(prev => {
      const git = [...prev.gitResources.map(r => ({ ...r }))];
      if (git[0]) {
        git[0].image = 'ghcr.io/org/payment:v2.5.0-canary';
        git[0].replicas = 5;
      }
      return {
        ...prev,
        targetRevision: 'main (commit d93b8e1)',
        gitResources: git
      };
    });
    triggerHaptic('SUCCESS');
  };

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(65);
      } else {
        awardXP(65, 'argocd_gitops_master');
      }
    }
  };

  return (
    <div className="container-responsive" style={{ padding: '24px 16px', color: 'var(--text-main)' }}>
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={14} /> Cloud-Native Kubernetes
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <GitBranch size={14} /> GitOps Continuous Delivery (ArgoCD)
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🐙 ArgoCD GitOps &amp; Cluster Sync Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '850px' }}>
            Deklaratives Kubernetes GitOps: Git als Single Source of Truth. Erkenne Drift (Out-of-Sync), führe automatische Self-Healing-Syncs durch und bereinige verwaiste Cluster-Ressourcen (Auto-Prune).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {solved ? 'GitOps Meister' : 'Lab Validieren (+65 XP)'}
        </button>
      </div>

      {/* Status Bar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Applikation:</span>
            <strong style={{ fontSize: '1.1rem' }}>{app.name}</strong>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Git Revision:</span>
            <code>{app.targetRevision}</code>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Sync-Status:</span>
            <span className={`badge ${diffResult.isSynced ? 'badge-emerald' : 'badge-amber'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {diffResult.isSynced ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {diffResult.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={simulateGitCommitUpgrade}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={14} /> Git Commit: v2.5.0 Push
          </button>

          <button
            onClick={simulateManualClusterDrift}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)' }}
          >
            <AlertTriangle size={14} /> Ad-hoc Drift (kubectl scale)
          </button>

          <button
            onClick={handleSync}
            disabled={syncing || diffResult.isSynced}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Synchronisiere...' : 'Sync (Git -> Cluster)'}
          </button>
        </div>
      </div>

      {/* Grid: Git Repo (Desired) vs Cluster (Live) */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Desired State */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <GitBranch size={18} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Desired State (Git Repository)</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Im Git deklarierte YAML-Manifeste (Source of Truth):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {app.gitResources.map((res, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{res.kind} / {res.name}</strong>
                  <span className="badge badge-indigo">Replicas: {res.replicas}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  Image: {res.image}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cluster State */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cloud size={18} color="var(--accent-emerald)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Live State (Kubernetes Cluster)</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Aktuell im Produktiv-Cluster laufende Pods &amp; Objekte:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {app.liveResources.map((res, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{res.kind} / {res.name}</strong>
                  <span className="badge badge-emerald">Replicas: {res.replicas}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  Image: {res.image}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diffs & Drift Inspector */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="var(--accent-primary)" /> GitOps Drift &amp; Diff Protokoll
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {diffResult.diffs.map((d, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: d.type === 'MATCH' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.08)',
                borderLeft: `4px solid ${d.type === 'MATCH' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
              }}
            >
              <div>
                <strong>{d.kind} / {d.name}</strong>: {d.details}
              </div>
              <span className={`badge ${d.type === 'MATCH' ? 'badge-emerald' : 'badge-amber'}`}>
                {d.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
