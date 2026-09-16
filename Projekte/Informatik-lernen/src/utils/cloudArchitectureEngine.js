/**
 * Cloud Architecture Topology, SLA Availability & SPOF Audit Engine
 */

export const INITIAL_CLOUD_TOPOLOGY = [
  { id: 'node_waf', type: 'WAF', name: 'AWS WAF / Shield', sla: 0.9999, cost: 25, isRedundant: true, tier: 1 },
  { id: 'node_cdn', type: 'CDN', name: 'CloudFront CDN Edge', sla: 0.9999, cost: 35, isRedundant: true, tier: 1 },
  { id: 'node_alb', type: 'ALB', name: 'Application Load Balancer', sla: 0.9995, cost: 28, isRedundant: true, tier: 2 },
  { id: 'node_asg', type: 'APP', name: 'Auto Scaling App Cluster (2x t4g.medium)', sla: 0.9995, cost: 68, isRedundant: true, tier: 3 },
  { id: 'node_cache', type: 'CACHE', name: 'ElastiCache Redis (Primary/Replica)', sla: 0.9999, cost: 45, isRedundant: true, tier: 4 },
  { id: 'node_db', type: 'DB', name: 'RDS PostgreSQL (Multi-AZ)', sla: 0.9995, cost: 110, isRedundant: true, tier: 4 },
  { id: 'node_s3', type: 'STORAGE', name: 'S3 Standard Bucket', sla: 0.9999, cost: 15, isRedundant: true, tier: 4 }
];

/**
 * Calculates overall System SLA availability and downtime
 */
export function calculateSystemSla(nodes) {
  if (!nodes || nodes.length === 0) {
    return { overallSla: 0, slaPercent: '0%', annualDowntimeMinutes: 525600, annualDowntimeText: '365 Tage' };
  }

  // Tiers represent serial dependencies. Inside tier, redundant nodes act as parallel.
  const tierMap = {};
  nodes.forEach(node => {
    if (!tierMap[node.tier]) tierMap[node.tier] = [];
    tierMap[node.tier].push(node);
  });

  let overallSla = 1.0;
  Object.values(tierMap).forEach(tierNodes => {
    if (tierNodes.length === 1) {
      overallSla *= tierNodes[0].sla;
    } else {
      // Parallel availability: 1 - product(1 - A_i)
      const unavail = tierNodes.reduce((acc, n) => acc * (1 - n.sla), 1.0);
      overallSla *= (1.0 - unavail);
    }
  });

  const minutesPerYear = 365.25 * 24 * 60; // 525,960 min
  const annualDowntimeMinutes = Number(((1.0 - overallSla) * minutesPerYear).toFixed(1));

  let annualDowntimeText = '';
  if (annualDowntimeMinutes < 60) {
    annualDowntimeText = `${annualDowntimeMinutes} Minuten / Jahr`;
  } else if (annualDowntimeMinutes < 1440) {
    const hours = (annualDowntimeMinutes / 60).toFixed(1);
    annualDowntimeText = `${hours} Stunden / Jahr`;
  } else {
    const days = (annualDowntimeMinutes / 1440).toFixed(1);
    annualDowntimeText = `${days} Tage / Jahr`;
  }

  return {
    overallSla,
    slaPercent: (overallSla * 100).toFixed(3) + '%',
    annualDowntimeMinutes,
    annualDowntimeText,
    totalBaseCostMonthly: nodes.reduce((acc, n) => acc + (n.cost || 0), 0)
  };
}

/**
 * Single Point of Failure (SPOF) Security & High Availability Linter
 */
export function auditSpofRisks(nodes) {
  const warnings = [];

  const hasAlb = nodes.some(n => n.type === 'ALB');
  const appNodes = nodes.filter(n => n.type === 'APP');
  const dbNodes = nodes.filter(n => n.type === 'DB');
  const cacheNodes = nodes.filter(n => n.type === 'CACHE');

  if (appNodes.length === 1 && !appNodes[0].isRedundant) {
    warnings.push({
      severity: 'CRITICAL',
      title: 'Single App Instance (SPOF)',
      description: 'Die Anwendung läuft nur auf einer einzelnen Instanz ohne Auto-Scaling oder Multi-Node Redundanz.'
    });
  }

  if (dbNodes.length === 1 && !dbNodes[0].isRedundant) {
    warnings.push({
      severity: 'HIGH',
      title: 'Single-AZ Database (SPOF)',
      description: 'Die Datenbank verfügt über kein Multi-AZ Standby oder Read-Replikat. Bei RZ-Ausfall droht vollständiger Downtime.'
    });
  }

  if (!hasAlb && appNodes.length > 1) {
    warnings.push({
      severity: 'MEDIUM',
      title: 'Fehlender Load Balancer',
      description: 'Mehrere App-Instanzen vorhanden, aber kein Application Load Balancer zur Lastverteilung konfiguriert.'
    });
  }

  if (cacheNodes.length === 0 && dbNodes.length > 0) {
    warnings.push({
      severity: 'INFO',
      title: 'Keine In-Memory Caching Schicht',
      description: 'Datenbankabfragen werden nicht via Redis/Memcached gecacht, was bei Lastspitzen zu DB-Engpässen führen kann.'
    });
  }

  return warnings;
}
