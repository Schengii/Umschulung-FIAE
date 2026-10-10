import { describe, it, expect } from 'vitest';
import { createInitialArgoApp, computeGitOpsDiff, synchronizeApplication } from './argoCdGitOpsEngine';

describe('ArgoCD GitOps Engine', () => {
  it('detects in-sync state initially', () => {
    const app = createInitialArgoApp();
    const diff = computeGitOpsDiff(app.gitResources, app.liveResources);
    expect(diff.isSynced).toBe(true);
    expect(diff.status).toBe('Synced');
  });

  it('detects modified and orphan cluster resources (drift)', () => {
    const app = createInitialArgoApp();

    // Manuelle Ad-hoc Änderung im Cluster (Drift)
    app.liveResources[0].replicas = 8;
    // Verwaiste Ressource im Cluster angelegt
    app.liveResources.push({
      kind: 'ConfigMap',
      name: 'ad-hoc-debug-config',
      namespace: 'prod',
      replicas: 1,
      image: 'none'
    });

    const diff = computeGitOpsDiff(app.gitResources, app.liveResources);
    expect(diff.isSynced).toBe(false);
    expect(diff.status).toBe('OutOfSync');
    expect(diff.diffs.some(d => d.type === 'MODIFIED')).toBe(true);
    expect(diff.diffs.some(d => d.type === 'ORPHAN_IN_CLUSTER')).toBe(true);
  });

  it('synchronizes cluster state back to desired Git state', () => {
    let app = createInitialArgoApp();
    app.liveResources[0].replicas = 10;

    app = synchronizeApplication(app);
    const diff = computeGitOpsDiff(app.gitResources, app.liveResources);
    expect(diff.isSynced).toBe(true);
    expect(app.liveResources[0].replicas).toBe(3);
  });
});
