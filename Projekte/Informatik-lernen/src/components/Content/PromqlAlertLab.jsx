import React, { useState, useMemo } from 'react';
import { BellRing, Award, Activity, Copy, Check } from 'lucide-react';
import { PromqlAlertEngine } from '../../utils/promqlAlertEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PromqlAlertLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [metricType, setMetricType] = useState('LATENCY');
  const [threshold, setThreshold] = useState(200);
  const [severity, setSeverity] = useState('critical');
  const [copied, setCopied] = useState(false);
  const [solved, setSolved] = useState(false);

  const engine = useMemo(() => new PromqlAlertEngine(), []);

  const alertData = useMemo(() => {
    return engine.evaluateAlert({
      alertName: metricType === 'LATENCY' ? 'HighApiP95Latency' : metricType === 'ERROR_RATE' ? 'HighHttp5xxRate' : 'HighHostCpuUsage',
      metricType,
      threshold,
      severity
    });
  }, [engine, metricType, threshold, severity]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'promql_alert_master');
      }
    }
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(alertData.yamlManifest);
    setCopied(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => setCopied(false), 2000);
    handleClaim();
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} /> SRE Observability &amp; Metrics
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BellRing size={14} /> Prometheus PromQL &amp; Alerting Rules
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📈 Prometheus PromQL &amp; Alerting Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Schreibe PromQL-Metrikausdrücke (`histogram_quantile`, `rate`), teste Live-Schwellwerte und generiere produktionsreife Alerting Rule YAML Manifeste für Alertmanager.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Alert-Regel Bestätigen (+45 XP)
        </button>
      </div>

      {/* Metric Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setMetricType('LATENCY'); setThreshold(200); triggerHaptic('SELECTION'); }}
          className={`btn ${metricType === 'LATENCY' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. API p95 Latenz (Histogram)</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>histogram_quantile(0.95, ...)</div>
        </button>

        <button
          onClick={() => { setMetricType('ERROR_RATE'); setThreshold(1.5); triggerHaptic('SELECTION'); }}
          className={`btn ${metricType === 'ERROR_RATE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. HTTP 5xx Fehlerrate</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>sum(rate(5xx)) / sum(rate(all))</div>
        </button>

        <button
          onClick={() => { setMetricType('CPU'); setThreshold(75); triggerHaptic('SELECTION'); }}
          className={`btn ${metricType === 'CPU' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>3. Node CPU-Auslastung</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>100 - avg(rate(idle)) * 100</div>
        </button>
      </div>

      {/* Live Status Banner */}
      <div style={{ background: alertData.isFiring ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${alertData.isFiring ? '#ef4444' : '#10b981'}`, borderRadius: '12px', padding: '18px 22px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prometheus Alert State:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: alertData.isFiring ? '#ef4444' : '#10b981', marginTop: '2px' }}>
            {alertData.isFiring ? '🚨 ALERT FIRING' : '✅ STATUS: OK (INACTIVE)'}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Aktueller Wert: <strong style={{ color: 'var(--text-main)' }}>{alertData.currentValue}{alertData.unit}</strong> (Schwelle: {alertData.threshold}{alertData.unit})
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Schwellwert anpassen ({alertData.unit}):</label>
          <input
            type="range"
            min={metricType === 'LATENCY' ? 50 : 1}
            max={metricType === 'LATENCY' ? 600 : 100}
            step={metricType === 'ERROR_RATE' ? 0.5 : 5}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{ width: '180px' }}
          />

          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Severity Label:</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['critical', 'warning', 'info'].map(sev => (
              <button
                key={sev}
                onClick={() => { setSeverity(sev); triggerHaptic('SELECTION'); }}
                className={`btn ${severity === sev ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PromQL Expression & YAML Rule Output */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            PromQL Auswertungs-Ausdruck:
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {alertData.promqlExpr}
          </pre>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              Prometheus Rule Manifest (YAML):
            </span>
            <button
              onClick={handleCopyYaml}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Kopiert!' : 'YAML Kopieren'}
            </button>
          </div>

          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4', overflowX: 'auto' }}>
            {alertData.yamlManifest}
          </pre>
        </div>
      </div>
    </div>
  );
}
