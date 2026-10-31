import React, { useState, useMemo } from 'react';
import { GitCommit, Award, Network, Copy, Check } from 'lucide-react';
import { OpenTelemetryTracingSimulator } from '../../utils/opentelemetryTracingEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function OpentelemetryTracingLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [copied, setCopied] = useState(false);
  const [solved, setSolved] = useState(false);

  const otel = useMemo(() => new OpenTelemetryTracingSimulator(), []);
  const spans = useMemo(() => otel.getWaterfallSpans(), [otel]);
  const traceparent = useMemo(() => otel.generateTraceparent(), [otel]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'opentelemetry_tracing_master');
      }
    }
  };

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(`traceparent: ${traceparent}`);
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
              <Network size={14} /> Cloud Observability
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <GitCommit size={14} /> OpenTelemetry Distributed Tracing &amp; W3C
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🌐 OpenTelemetry Distributed Tracing Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche standardisierte W3C `traceparent` Header-Propagation in Microservices und analysiere verteilte Aufrufpfade im Waterfall Trace Viewer (Jaeger/Zipkin-Stil).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Trace-Analyse Bestätigen (+45 XP)
        </button>
      </div>

      {/* W3C Header Banner */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px 22px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>W3C Distributed Trace Context Header:</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'monospace', marginTop: '4px' }}>
            traceparent: {traceparent}
          </div>
        </div>

        <button
          onClick={handleCopyHeader}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.82rem' }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Kopiert!' : 'Header Kopieren'}
        </button>
      </div>

      {/* Waterfall Trace Spans View */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
          Verteilter Waterfall Trace Timeline (185 ms Gesamtdauer):
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {spans.map(span => {
            const leftPercent = (span.startOffsetMs / 185) * 100;
            const widthPercent = Math.max(8, (span.durationMs / 185) * 100);

            return (
              <div key={span.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
                <div style={{ width: '220px', flexShrink: 0 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{span.service}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{span.name}</div>
                </div>

                <div style={{ flex: 1, position: 'relative', height: '28px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: span.service.includes('db') ? '#10b981' : span.service.includes('auth') ? '#ec4899' : 'var(--accent-primary)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {span.durationMs} ms
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
