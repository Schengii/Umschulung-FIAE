import { describe, it, expect } from 'vitest';
import {
  calculateErrorBudget,
  calculateCurrentBurnRate,
  evaluateBurnAlerts,
  generatePromqlBurnAlertYaml,
  simulatePromqlAlertRule,
  STANDARD_SRE_BURN_WINDOWS
} from './sreSloBurnEngine';

describe('sreSloBurnEngine', () => {
  it('correctly calculates error budget consumption and remaining budget', () => {
    const slo = {
      name: 'CheckoutService',
      targetPercent: 99.9,
      periodDays: 30,
      totalRequests: 1000000,
      failedRequests: 250
    };

    const budget = calculateErrorBudget(slo);
    expect(budget.totalAllowedFailures).toBe(1000); // 0.1% of 1M
    expect(budget.consumedFailures).toBe(250);
    expect(budget.remainingFailures).toBe(750);
    expect(budget.budgetConsumedPercent).toBe(25);
    expect(budget.remainingBudgetPercent).toBe(75);
    expect(budget.isDepleted).toBe(false);
  });

  it('calculates current burn rate multiplier accurately', () => {
    // 99.9% target -> allowed error rate = 0.001 (0.1%)
    // Actual error rate = 0.0144 (1.44%) -> Burn Rate = 14.4x
    const burnRate = calculateCurrentBurnRate(0.0144, 99.9);
    expect(burnRate).toBe(14.4);
  });

  it('fires multi-window alert only when both short and long lookback windows exceed threshold', () => {
    // Test case 1: both exceed 14.4x -> Should fire critical page
    const firingAlerts = evaluateBurnAlerts(15.2, 14.8, STANDARD_SRE_BURN_WINDOWS);
    const criticalPage = firingAlerts.find(a => a.id === 'page_critical_1h');
    expect(criticalPage.isFiring).toBe(true);

    // Test case 2: short window spiked to 20x, but long window is only 2x (transient spike) -> Should NOT fire page
    const transientAlerts = evaluateBurnAlerts(20.0, 2.0, STANDARD_SRE_BURN_WINDOWS);
    const transientPage = transientAlerts.find(a => a.id === 'page_critical_1h');
    expect(transientPage.isFiring).toBe(false);
  });

  it('generates valid Prometheus PromQL Alerting YAML syntax', () => {
    const yaml = generatePromqlBurnAlertYaml('PaymentGateway', 99.9);
    expect(yaml).toContain('paymentgateway_slo_burn_alerts');
    expect(yaml).toContain('CriticalErrorBudgetBurnPage');
    expect(yaml).toContain('HighErrorBudgetBurnPage');
    expect(yaml).toContain('sum(rate(http_requests_total{job="PaymentGateway"');
  });

  it('simulates PromQL Alert transitions (INACTIVE -> PENDING -> FIRING) with templating', () => {
    const ruleBase = {
      alertName: 'ApiLatencyHigh',
      expr: 'p99 > 0.5',
      threshold: 0.5,
      operator: /** @type {const} */ ('>'),
      forDurationSec: 300,
      labels: { service: 'checkout-api' },
      annotations: {
        summary: 'Latency on {{ $labels.service }}',
        description: 'Value is {{ $value }}s'
      }
    };

    // 1. Condition not met
    const inactive = simulatePromqlAlertRule({
      ...ruleBase,
      currentValue: 0.2,
      activeDurationSec: 100
    });
    expect(inactive.state).toBe('INACTIVE');
    expect(inactive.isConditionMet).toBe(false);

    // 2. Condition met, but activeDuration < forDuration -> PENDING
    const pending = simulatePromqlAlertRule({
      ...ruleBase,
      currentValue: 0.8,
      activeDurationSec: 120
    });
    expect(pending.state).toBe('PENDING');
    expect(pending.isConditionMet).toBe(true);
    expect(pending.formattedSummary).toBe('Latency on checkout-api');
    expect(pending.formattedDescription).toBe('Value is 0.8s');

    // 3. Condition met and activeDuration >= forDuration -> FIRING
    const firing = simulatePromqlAlertRule({
      ...ruleBase,
      currentValue: 0.8,
      activeDurationSec: 350
    });
    expect(firing.state).toBe('FIRING');
    expect(firing.evaluationMessage).toContain('Alert feuert (FIRING)');
  });
});

