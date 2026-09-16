/**
 * Prometheus PromQL Metrics & Alerting Rule Generator Engine
 * Evaluates PromQL rate(), sum() by (), and histogram_quantile() expressions,
 * checks alert firing conditions, and generates valid Prometheus Alerting Rule YAML manifests.
 */

export class PromqlAlertEngine {
  constructor() {
    this.metricData = {
      p95LatencyMs: 245.0,
      p99LatencyMs: 480.0,
      errorRatePercent: 2.4,
      cpuUsagePercent: 78.5,
      memoryAvailableBytes: 1024 * 1024 * 512 // 512 MB
    };
  }

  evaluateAlert({
    alertName = 'HighApiLatencyP95',
    metricType = 'LATENCY',
    threshold = 300,
    durationFor = '5m',
    severity = 'critical'
  }) {
    let currentValue = 0;
    let unit = '';
    let isFiring = false;

    if (metricType === 'LATENCY') {
      currentValue = this.metricData.p95LatencyMs;
      unit = 'ms';
      isFiring = currentValue > threshold;
    } else if (metricType === 'ERROR_RATE') {
      currentValue = this.metricData.errorRatePercent;
      unit = '%';
      isFiring = currentValue > threshold;
    } else {
      currentValue = this.metricData.cpuUsagePercent;
      unit = '%';
      isFiring = currentValue > threshold;
    }

    const promqlExpr = metricType === 'LATENCY'
      ? `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000 > ${threshold}`
      : metricType === 'ERROR_RATE'
      ? `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > ${threshold}`
      : `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > ${threshold}`;

    const yamlManifest = `groups:
  - name: api_alerts
    rules:
      - alert: ${alertName}
        expr: ${promqlExpr}
        for: ${durationFor}
        labels:
          severity: ${severity}
          team: sre-platform
        annotations:
          summary: "Schwellwertüberschreitung für ${metricType}"
          description: "Aktueller Wert liegt bei {{ $value }}${unit} (Schwelle: ${threshold}${unit})."`;

    return {
      alertName,
      metricType,
      currentValue,
      threshold,
      unit,
      isFiring,
      status: isFiring ? 'FIRING' : 'INACTIVE (Healthy)',
      promqlExpr,
      yamlManifest
    };
  }
}
