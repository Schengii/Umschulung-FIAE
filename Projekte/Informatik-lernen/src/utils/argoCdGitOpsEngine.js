// @ts-check
/**
 * ArgoCD GitOps Engine
 * Didaktische Engine zur Simulation deklarativer Kubernetes GitOps-Workflows:
 * Git-Repository-State (Desired State) vs. Live-Cluster-State (Actual State),
 * Out-of-Sync Diffs, Auto-Sync & Self-Healing, Auto-Prune verwaister Ressourcen,
 * Rollback-Historie und Canary Traffic Shifting.
 */

/**
 * @typedef {Object} K8sResource
 * @property {string} kind
 * @property {string} name
 * @property {string} namespace
 * @property {number} replicas
 * @property {string} image
 * @property {Record<string, string>} [env]
 * @property {number} [trafficWeight]
 */

/**
 * @typedef {Object} ArgoApplication
 * @property {string} name
 * @property {string} repoUrl
 * @property {string} targetRevision
 * @property {'Synced' | 'OutOfSync'} syncStatus
 * @property {'Healthy' | 'Degraded' | 'Progressing'} healthStatus
 * @property {boolean} autoSync
 * @property {boolean} selfHeal
 * @property {boolean} autoPrune
 * @property {K8sResource[]} gitResources
 * @property {K8sResource[]} liveResources
 */

/**
 * Erstellt eine Standard-ArgoCD-Applikation
 * @returns {ArgoApplication}
 */
export function createInitialArgoApp() {
  return {
    name: 'ecommerce-payment-service',
    repoUrl: 'https://github.com/enterprise/gitops-manifests.git',
    targetRevision: 'main (commit a8f12c4)',
    syncStatus: 'Synced',
    healthStatus: 'Healthy',
    autoSync: false,
    selfHeal: true,
    autoPrune: true,
    gitResources: [
      { kind: 'Deployment', name: 'payment-api', namespace: 'prod', replicas: 3, image: 'ghcr.io/org/payment:v2.4.0', env: { LOG_LEVEL: 'info', TIMEOUT_MS: '3000' } },
      { kind: 'Service', name: 'payment-svc', namespace: 'prod', replicas: 1, image: 'ClusterIP:8080' },
      { kind: 'Ingress', name: 'payment-ingress', namespace: 'prod', replicas: 1, image: 'api.shop.de/payment' }
    ],
    liveResources: [
      { kind: 'Deployment', name: 'payment-api', namespace: 'prod', replicas: 3, image: 'ghcr.io/org/payment:v2.4.0', env: { LOG_LEVEL: 'info', TIMEOUT_MS: '3000' } },
      { kind: 'Service', name: 'payment-svc', namespace: 'prod', replicas: 1, image: 'ClusterIP:8080' },
      { kind: 'Ingress', name: 'payment-ingress', namespace: 'prod', replicas: 1, image: 'api.shop.de/payment' }
    ]
  };
}

/**
 * Ermittelt Unterschiede (Drift / Diff) zwischen Git (Desired) und Cluster (Live)
 * @param {K8sResource[]} gitResources
 * @param {K8sResource[]} liveResources
 */
export function computeGitOpsDiff(gitResources, liveResources) {
  /** @type {Array<{ kind: string, name: string, type: 'MATCH' | 'MODIFIED' | 'MISSING_IN_CLUSTER' | 'ORPHAN_IN_CLUSTER', details: string }>} */
  const diffs = [];

  // Prüfe Ressourcen im Git
  gitResources.forEach(gitRes => {
    const liveRes = liveResources.find(l => l.kind === gitRes.kind && l.name === gitRes.name);
    if (!liveRes) {
      diffs.push({
        kind: gitRes.kind,
        name: gitRes.name,
        type: 'MISSING_IN_CLUSTER',
        details: `Ressource existiert im Git, fehlt aber im Live-Cluster.`
      });
    } else {
      // Vergleiche Replicas und Image
      const changes = [];
      if (gitRes.replicas !== liveRes.replicas) {
        changes.push(`Replicas: Git=${gitRes.replicas} vs Live=${liveRes.replicas}`);
      }
      if (gitRes.image !== liveRes.image) {
        changes.push(`Image: Git=${gitRes.image} vs Live=${liveRes.image}`);
      }
      if (JSON.stringify(gitRes.env) !== JSON.stringify(liveRes.env)) {
        changes.push(`Env-Vars abweichend`);
      }

      if (changes.length > 0) {
        diffs.push({
          kind: gitRes.kind,
          name: gitRes.name,
          type: 'MODIFIED',
          details: changes.join(' | ')
        });
      } else {
        diffs.push({
          kind: gitRes.kind,
          name: gitRes.name,
          type: 'MATCH',
          details: 'Synchron (Git & Live stimmen überein)'
        });
      }
    }
  });

  // Prüfe verwaiste Ressourcen im Cluster (nicht im Git definiert)
  liveResources.forEach(liveRes => {
    const gitRes = gitResources.find(g => g.kind === liveRes.kind && g.name === liveRes.name);
    if (!gitRes) {
      diffs.push({
        kind: liveRes.kind,
        name: liveRes.name,
        type: 'ORPHAN_IN_CLUSTER',
        details: `Verwaist: Ressource existiert im Live-Cluster, aber nicht in Git (Prune-Kandidat).`
      });
    }
  });

  const isSynced = diffs.every(d => d.type === 'MATCH');

  return {
    isSynced,
    status: isSynced ? 'Synced' : 'OutOfSync',
    diffs
  };
}

/**
 * Führt Synchronisation durch (Git -> Cluster)
 * @param {ArgoApplication} app
 * @returns {ArgoApplication}
 */
export function synchronizeApplication(app) {
  // Wenn autoPrune aktiviert ist, werden verwaiste Ressourcen gelöscht
  // Desired State (Git) überschreibt Live State komplett
  const clonedLive = app.gitResources.map(r => ({
    ...r,
    env: r.env ? { ...r.env } : undefined
  }));

  return {
    ...app,
    syncStatus: 'Synced',
    healthStatus: 'Healthy',
    liveResources: clonedLive
  };
}
