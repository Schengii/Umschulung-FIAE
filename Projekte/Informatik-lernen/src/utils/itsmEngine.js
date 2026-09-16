/**
 * ITIL 4 ITSM & Service Desk Management Simulator Engine
 */

export const ITSM_INITIAL_TICKETS = [
  {
    id: 'INC-1042',
    type: 'Incident',
    title: 'Produktionsdatenbank meldet Read-Only Mode nach Failover',
    impact: 'High',
    urgency: 'High',
    priority: 'P1 (Kritisch)',
    slaMinutesRemaining: 45,
    status: 'Open',
    assignee: 'Unassigned',
    category: 'Database / High Availability',
    solution: 'Replikat synchronisieren und Master Promote Flag setzen'
  },
  {
    id: 'REQ-2089',
    type: 'ServiceRequest',
    title: 'VPN-Zugang & SSH-Keys für neuen DevOps Praktikanten einrichten',
    impact: 'Low',
    urgency: 'Medium',
    priority: 'P3 (Mittel)',
    slaMinutesRemaining: 240,
    status: 'Open',
    assignee: 'Unassigned',
    category: 'Access Management',
    solution: 'LDAP-Gruppe devops zuweisen und WireGuard Profil generieren'
  },
  {
    id: 'CHG-3011',
    type: 'ChangeRequest',
    title: 'Upgrade Kubernetes Cluster von v1.28 auf v1.30 im Wartungsfenster',
    impact: 'High',
    urgency: 'Low',
    priority: 'P2 (Hoch)',
    slaMinutesRemaining: 720,
    status: 'Pending CAB Approval',
    assignee: 'Cloud Architecture Team',
    category: 'Infrastructure',
    solution: 'Blue-Green Node Rollout mit Helm Release Dry-Run'
  },
  {
    id: 'PRB-4005',
    type: 'Problem',
    title: 'Wiederkehrende Memory Leaks in Auth-Microservice bei JWT Validation',
    impact: 'Medium',
    urgency: 'Medium',
    priority: 'P2 (Hoch)',
    slaMinutesRemaining: 480,
    status: 'Under Investigation',
    assignee: 'Core Dev Team',
    category: 'Application Bug',
    solution: 'Heap-Profiling zeigt ungeschlossene Redis PubSub Connections'
  }
];

export function calculatePriorityMatrix(impact, urgency) {
  if (impact === 'High' && urgency === 'High') return 'P1 (Kritisch)';
  if (impact === 'High' || urgency === 'High') return 'P2 (Hoch)';
  if (impact === 'Medium' && urgency === 'Medium') return 'P3 (Mittel)';
  return 'P4 (Niedrig)';
}

export function evaluateCabRiskScore({ technicalComplexity, rollbackFeasibility, businessImpact }) {
  // Score: 1 - 5 each
  const totalScore = (technicalComplexity * 0.35) + ((6 - rollbackFeasibility) * 0.35) + (businessImpact * 0.30);
  let riskTier = 'Niedriges Risiko';
  if (totalScore >= 3.8) riskTier = 'Kritisches Risiko (Erfordert C-Level Freigabe)';
  else if (totalScore >= 2.6) riskTier = 'Mittleres Risiko (Standard CAB Review)';
  return {
    score: Number(totalScore.toFixed(2)),
    riskTier
  };
}
