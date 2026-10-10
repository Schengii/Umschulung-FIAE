import React, { useState, useMemo } from 'react';
import { Database, Filter, AlertCircle, RefreshCw, Award, CheckCircle2 } from 'lucide-react';
import { runEtlPipeline, SAMPLE_RAW_DATA } from '../../utils/dataLineageEtlEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function DataLineageEtlLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [dataInput, setDataInput] = useState(JSON.stringify(SAMPLE_RAW_DATA, null, 2));
  const [solved, setSolved] = useState(false);

  const parsedData = useMemo(() => {
    try {
      const parsed = JSON.parse(dataInput);
      return Array.isArray(parsed) ? parsed : SAMPLE_RAW_DATA;
    } catch {
      return SAMPLE_RAW_DATA;
    }
  }, [dataInput]);

  const etlResult = useMemo(() => runEtlPipeline(parsedData), [parsedData]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(50);
      } else {
        awardXP(50, 'etl_data_lineage_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> IHK FIDP / FIAE Datenanalyse
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> Data-Lineage &amp; ETL Governance
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔄 ETL Pipeline &amp; Data Lineage Schema-Drift Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Extrahiere heterogene Rohdaten (Extract), identifiziere Typ-Drifts &amp; Parsing-Fehler (Validate), bereinige Datums- &amp; Währungsformate (Transform) und lade die DTOs in das Data Warehouse Star-Schema (Load).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> ETL Pipeline Zertifizieren (+50 XP)
        </button>
      </div>

      {/* Visual Data Lineage Stages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {etlResult.lineageGraph.map((stage, idx) => (
          <div
            key={stage.stage}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Schritt {idx + 1}
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block', margin: '4px 0' }}>
              {stage.stage}
            </strong>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: idx === 1 && etlResult.anomalies.length > 0 ? 'var(--accent-rose, #ef4444)' : 'var(--accent-emerald, #10b981)' }}>
              {stage.recordCount} Datensätze
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stage.description}
            </div>
          </div>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Raw Data JSON Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
              1. Unbereinigte Quell-Rohdaten (Extract)
            </strong>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setDataInput(JSON.stringify(SAMPLE_RAW_DATA, null, 2))}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
          <textarea
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              padding: '12px',
              fontFamily: 'var(--font-code, monospace)',
              fontSize: '0.82rem',
              background: '#090d16',
              color: '#38bdf8',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #1e293b',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Right: Cleaned Target Data Warehouse */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '0.95rem', color: 'var(--accent-emerald, #10b981)' }}>
              2. Transformierte DWH-Faktentabelle (Load)
            </strong>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              <CheckCircle2 size={12} /> {etlResult.transformedCount} Zeilen geladen
            </span>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '250px' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '8px' }}>ID</th>
                  <th style={{ padding: '8px' }}>Kunde</th>
                  <th style={{ padding: '8px' }}>Netto (€)</th>
                  <th style={{ padding: '8px' }}>USt (€)</th>
                  <th style={{ padding: '8px' }}>ISO Datum</th>
                  <th style={{ padding: '8px' }}>Land</th>
                </tr>
              </thead>
              <tbody>
                {etlResult.validRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{r.id}</td>
                    <td style={{ padding: '8px' }}>{r.customer_name}</td>
                    <td style={{ padding: '8px', color: 'var(--accent-emerald, #10b981)' }}>{r.revenue_netto.toFixed(2)}</td>
                    <td style={{ padding: '8px' }}>{r.vat_amount.toFixed(2)}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{r.iso_date}</td>
                    <td style={{ padding: '8px' }}>
                      <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{r.country_code}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schema-Drift Anomalies & Quarantine Log */}
      {etlResult.anomalies.length > 0 && (
        <div style={{ marginTop: '24px', background: 'rgba(239, 68, 68, 0.08)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-rose, #ef4444)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={20} color="var(--accent-rose, #ef4444)" />
            <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>
              Schema-Drift Quarantäne-Protokoll ({etlResult.anomalies.length} abgewiesene Datensätze)
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {etlResult.anomalies.map((anom, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.82rem',
                  padding: '8px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <span className="badge badge-rose" style={{ marginRight: '8px', fontSize: '0.72rem' }}>
                    {anom.errorType}
                  </span>
                  <span>Record #{anom.recordIndex + 1} ({anom.field}): {anom.message}</span>
                </div>
                <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Rohwert: {JSON.stringify(anom.rawValue)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
