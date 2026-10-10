// @ts-check
/**
 * Prometheus & Google SRE Multi-Window Multi-Burn-Rate Alerting Engine
 * Evaluates SLO target compliance, Error Budgets, and multi-window burn rate alerts
 * based on Google's Site Reliability Engineering Workbook (Chapter 5: Alerting on SLOs).
 */

/**
 * @typedef {Object} SloDefinition
 * @property {string} name Service/SLO Name
 * @property {number} targetPercent Target availability (e.g., 99.9% = 0.999)
 * @property {number} periodDays Measurement window in days (typically 30 days)
 * @property {number} totalRequests Total requests in period
 * @property {number} failedRequests Failed requests (5xx / timeouts)
 */

/**
 * @typedef {Object} BurnRateWindow
 * @property {string} id Alert identifier (e.g. 'page-1h', 'ticket-6h')
 * @property {string} severity 'PAGE' | 'TICKET'
 * @property {number} shortWindowMinutes Short lookback window in minutes
 * @property {number} longWindowMinutes Long lookback window in minutes
 * @property {number} burnRateThreshold Burn rate factor threshold
 * @property {number} errorBudgetConsumedPercent Expected error budget consumed if sustained
 */

/**
 * Standard Multi-Window Multi-Burn-Rate Matrix recommended by Google SRE Workbook (30-day window):
 * - Page Alert: 14.4x burn rate over 1h (long) AND 5m (short) -> Consumes 2% budget in 1 hour
 * - Page Alert: 6x burn rate over 6h (long) AND 30m (short) -> Consumes 5% budget in 6 hours
 * - Ticket Alert: 1x burn rate over 3 days (long) AND 6h (short) -> Consumes 10% budget in 3 days
 * @type {BurnRateWindow[]}
 */
export const STANDARD_SRE_BURN_WINDOWS = [
  {
    id: 'page_critical_1h',
    severity: 'PAGE',
    shortWindowMinutes: 5,
    longWindowMinutes: 60,
    burnRateThreshold: 14.4,
    errorBudgetConsumedPercent: 2.0
  },
  {
    id: 'page_high_6h',
    severity: 'PAGE',
    shortWindowMinutes: 30,
    longWindowMinutes: 360,
    burnRateThreshold: 6.0,
    errorBudgetConsumedPercent: 5.0
  },
  {
    id: 'ticket_elevated_3d',
    severity: 'TICKET',
    shortWindowMinutes: 360,
    longWindowMinutes: 4320,
    burnRateThreshold: 1.0,
    errorBudgetConsumedPercent: 10.0
  }
];

/**
 * Calculates SLO Error Budget metrics
 * @param {SloDefinition} slo
 */
export function calculateErrorBudget(slo) {
  const allowedErrorRate = Number((1.0 - (slo.targetPercent / 100)).toFixed(6));
  const totalRequests = Math.max(1, slo.totalRequests);
  const totalAllowedFailures = Math.round(totalRequests * allowedErrorRate);
  const remainingFailures = Math.max(0, totalAllowedFailures - slo.failedRequests);
  
  const actualErrorRate = slo.failedRequests / totalRequests;
  const currentAvailability = (1.0 - actualErrorRate) * 100;
  
  const budgetConsumedPercent = totalAllowedFailures > 0 
    ? (slo.failedRequests / totalAllowedFailures) * 100 
    : 100;

  const remainingBudgetPercent = Math.max(0, 100 - budgetConsumedPercent);

  return {
    allowedErrorRate,
    actualErrorRate,
    currentAvailability: Number(currentAvailability.toFixed(4)),
    totalAllowedFailures,
    consumedFailures: slo.failedRequests,
    remainingFailures,
    budgetConsumedPercent: Number(budgetConsumedPercent.toFixed(2)),
    remainingBudgetPercent: Number(remainingBudgetPercent.toFixed(2)),
    isDepleted: budgetConsumedPercent >= 100
  };
}

/**
 * Calculates the current burn rate for an error rate against an SLO target
 * Formula: Burn Rate = Actual Error Rate / Allowed Error Rate
 * 
 * @param {number} actualErrorRate
 * @param {number} targetPercent (e.g. 99.9)
 * @returns {number} Burn rate multiplier (1.0 means exactly burning 100% budget over 30 days)
 */
export function calculateCurrentBurnRate(actualErrorRate, targetPercent) {
  const allowedErrorRate = 1.0 - (targetPercent / 100);
  if (allowedErrorRate <= 0) return 0;
  return Number((actualErrorRate / allowedErrorRate).toFixed(2));
}

/**
 * Evaluates whether multi-window multi-burn-rate alerts should fire
 * @param {number} currentBurnRateShort
 * @param {number} currentBurnRateLong
 * @param {BurnRateWindow[]} [windows]
 * @returns {Array<BurnRateWindow & { isFiring: boolean, reason: string }>}
 */
export function evaluateBurnAlerts(currentBurnRateShort, currentBurnRateLong, windows = STANDARD_SRE_BURN_WINDOWS) {
  return windows.map(win => {
    // Both windows must exceed the burn rate threshold to fire (Google SRE recommendation)
    const isFiring = currentBurnRateShort >= win.burnRateThreshold && currentBurnRateLong >= win.burnRateThreshold;
    const reason = isFiring
      ? `FEUER: Sowohl Short-Window (${win.shortWindowMinutes}m: ${currentBurnRateShort}x) als auch Long-Window (${win.longWindowMinutes}m: ${currentBurnRateLong}x) überschreiten Schwellenwert (${win.burnRateThreshold}x).`
      : `OK: Schwellenwert (${win.burnRateThreshold}x) nicht in beiden Fenstern gleichzeitig überschritten.`;

    return {
      ...win,
      isFiring,
      reason
    };
  });
}

/**
 * Generates Prometheus PromQL Alerting Rule YAML for multi-window burn rate
 * @param {string} serviceName
 * @param {number} targetPercent
 * @returns {string} Prometheus Alerting Rule YAML
 */
export function generatePromqlBurnAlertYaml(serviceName, targetPercent) {
  const allowedErrorRate = (1.0 - (targetPercent / 100)).toFixed(4);

  return `groups:
  - name: ${serviceName.toLowerCase()}_slo_burn_alerts
    rules:
      - alert: CriticalErrorBudgetBurnPage
        expr: |
          (
            sum(rate(http_requests_total{job="${serviceName}", status=~"5.."}[1h]))
            /
            sum(rate(http_requests_total{job="${serviceName}"}[1h]))
          ) > (14.4 * ${allowedErrorRate})
          and
          (
            sum(rate(http_requests_total{job="${serviceName}", status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total{job="${serviceName}"}[5m]))
          ) > (14.4 * ${allowedErrorRate})
        for: 2m
        labels:
          severity: page
          tier: mission_critical
        annotations:
          summary: "Hohe SLO Error-Budget Verbrennungsrate (14.4x) in Service ${serviceName}"
          description: "2% des monatlichen Fehlerbudgets wurden innerhalb von 1 Stunde verbrannt."

      - alert: HighErrorBudgetBurnPage
        expr: |
          (
            sum(rate(http_requests_total{job="${serviceName}", status=~"5.."}[6h]))
            /
            sum(rate(http_requests_total{job="${serviceName}"}[6h]))
          ) > (6.0 * ${allowedErrorRate})
          and
          (
            sum(rate(http_requests_total{job="${serviceName}", status=~"5.."}[30m]))
            /
            sum(rate(http_requests_total{job="${serviceName}"}[30m]))
          ) > (6.0 * ${allowedErrorRate})
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "Mittlere SLO Error-Budget Verbrennungsrate (6x) in Service ${serviceName}"
          description: "5% des monatlichen Fehlerbudgets wurden innerhalb von 6 Stunden verbrannt."`;
}

/**
 * @typedef {'INACTIVE' | 'PENDING' | 'FIRING'} AlertState
 *
 * @typedef {{
 *   alertName: string;
 *   expr: string;
 *   currentValue: number;
 *   threshold: number;
 *   operator: '>' | '>=' | '<' | '<=';
 *   forDurationSec: number;
 *   activeDurationSec: number;
 *   labels: Record<string, string>;
 *   annotations: Record<string, string>;
 * }} PromqlAlertRuleInput
 *
 * @typedef {{
 *   alertName: string;
 *   state: AlertState;
 *   isConditionMet: boolean;
 *   formattedSummary: string;
 *   formattedDescription: string;
 *   evaluationMessage: string;
 * }} PromqlAlertRuleEvaluation
 */

/**
 * Evaluates a PromQL alerting rule against current value and duration,
 * simulating the Prometheus engine (Inactive -> Pending -> Firing).
 *
 * @param {PromqlAlertRuleInput} input
 * @returns {PromqlAlertRuleEvaluation}
 */
export function simulatePromqlAlertRule(input) {
  let isConditionMet = false;
  switch (input.operator) {
    case '>':
      isConditionMet = input.currentValue > input.threshold;
      break;
    case '>=':
      isConditionMet = input.currentValue >= input.threshold;
      break;
    case '<':
      isConditionMet = input.currentValue < input.threshold;
      break;
    case '<=':
      isConditionMet = input.currentValue <= input.threshold;
      break;
    default:
      isConditionMet = input.currentValue > input.threshold;
  }

  /** @type {AlertState} */
  let state = 'INACTIVE';
  let evaluationMessage = '';

  if (!isConditionMet) {
    state = 'INACTIVE';
    evaluationMessage = `Bedingung nicht erfüllt (${input.currentValue} ${input.operator} ${input.threshold} ist false). Alert bleibt inaktiv.`;
  } else if (input.activeDurationSec < input.forDurationSec) {
    state = 'PENDING';
    const remainingSec = input.forDurationSec - input.activeDurationSec;
    evaluationMessage = `Bedingung erfüllt (${input.currentValue} ${input.operator} ${input.threshold}), aber for-Dauer (${input.forDurationSec}s) noch nicht erreicht (aktiv seit ${input.activeDurationSec}s, noch ${remainingSec}s verbleibend). Alert ist PENDING.`;
  } else {
    state = 'FIRING';
    evaluationMessage = `Bedingung erfüllt und for-Dauer (${input.forDurationSec}s) überschritten! Alert feuert (FIRING) und benachrichtigt den Alertmanager.`;
  }

  // Template placeholders replacement like {{$value}}
  const replacePlaceholders = (/** @type {string} */ text) => {
    let result = text.replace(/\{\{\s*\$value\s*\}\}/g, String(input.currentValue));
    for (const [key, val] of Object.entries(input.labels)) {
      result = result.replace(new RegExp(`\\{\\{\\s*\\$labels\\.${key}\\s*\\}\\}`, 'g'), val);
    }
    return result;
  };

  return {
    alertName: input.alertName,
    state,
    isConditionMet,
    formattedSummary: replacePlaceholders(input.annotations.summary || input.alertName),
    formattedDescription: replacePlaceholders(input.annotations.description || ''),
    evaluationMessage,
  };
}

/** Vorkonfigurierte Prometheus Alerting-Szenarien für didaktische Demos */
export const IHK_PROMQL_EXAM_SCENARIOS = [
  {
    id: 'api_high_latency',
    alertName: 'ApiLatencyHigh',
    expr: 'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 0.5',
    threshold: 0.5,
    operator: '>',
    forDurationSec: 300, // 5m
    unit: 's',
    labels: { severity: 'warning', service: 'checkout-api', team: 'backend' },
    annotations: {
      summary: 'Hohe API-Latenz auf {{ $labels.service }}',
      description: 'P99 Latenz liegt aktuell bei {{ $value }}s (Grenzwert: 0.5s).'
    }
  },
  {
    id: 'disk_space_critical',
    alertName: 'HostDiskSpaceFillingUp',
    expr: 'node_filesystem_free_bytes / node_filesystem_size_bytes < 0.10',
    threshold: 0.10,
    operator: '<',
    forDurationSec: 600, // 10m
    unit: '%',
    labels: { severity: 'critical', instance: 'prod-db-node-01', mountpoint: '/var/lib/postgresql' },
    annotations: {
      summary: 'Kritisch geringer Festplattenspeicher auf {{ $labels.instance }}',
      description: 'Freier Speicherplatz auf {{ $labels.mountpoint }} ist unter 10% gefallen: {{ $value }}.'
    }
  }
];

