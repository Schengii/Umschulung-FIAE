import React, { useState, useMemo } from 'react';
import {
  Database, Table, Award, Copy, Check, Filter, Layers, Code
} from 'lucide-react';
import { executeWindowFunctions, generateWindowFunctionSql, SAMPLE_EMPLOYEE_DATA } from '../../utils/sqlWindowFunctionsEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function SqlWindowFunctionsLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [partitionBy, setPartitionBy] = useState('department');
  const [orderBy, setOrderBy] = useState('salary');
  const [direction, setDirection] = useState('DESC');
  const [ntile, setNtile] = useState(3);
  const [copiedSql, setCopiedSql] = useState(false);
  const [solved, setSolved] = useState(false);

  const windowResult = useMemo(() => {
    return executeWindowFunctions({
      data: SAMPLE_EMPLOYEE_DATA,
      partitionBy,
      orderBy,
      direction,
      ntileBuckets: ntile
    });
  }, [partitionBy, orderBy, direction, ntile]);

  const sqlQuery = useMemo(() => {
    return generateWindowFunctionSql(partitionBy, orderBy, direction, ntile);
  }, [partitionBy, orderBy, direction, ntile]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(65);
      } else {
        awardXP(65, 'sql_window_functions_master');
      }
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="container-responsive" style={{ padding: '24px 16px', color: 'var(--text-main)' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Modern Data Engineering &amp; SQL
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> Analytical Window Functions
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            ⚡ SQL Window Functions &amp; Analytics Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '850px' }}>
            Meistere relationale Analysefunktionen nach ANSI SQL:2003: <code>ROW_NUMBER()</code>, <code>RANK()</code>, <code>DENSE_RANK()</code>, <code>NTILE()</code>, <code>LEAD() / LAG()</code> und kumulierende Summen mit <code>PARTITION BY</code>.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {solved ? 'Studio Abgeschlossen' : 'Lab Validieren (+65 XP)'}
        </button>
      </div>

      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--accent-primary)" /> Fenster-Partitionierung &amp; Sortierkriterien
        </h3>

        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
              PARTITION BY:
            </label>
            <select
              value={partitionBy}
              onChange={(e) => setPartitionBy(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="department">department (Abteilung)</option>
              <option value="none">Keine Partitionierung (Gesamte Tabelle)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
              ORDER BY:
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="salary">salary (Gehalt)</option>
              <option value="sales_volume">sales_volume (Umsatz)</option>
              <option value="hire_date">hire_date (Eintrittsdatum)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Richtung:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setDirection('DESC')}
                className={`btn ${direction === 'DESC' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
              >
                DESC (Absteigend)
              </button>
              <button
                onClick={() => setDirection('ASC')}
                className={`btn ${direction === 'ASC' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
              >
                ASC (Aufsteigend)
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
              NTILE Buckets: {ntile}
            </label>
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={ntile}
              onChange={(e) => setNtile(parseInt(e.target.value, 10))}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
        </div>
      </div>

      {/* Result Table */}
      <div className="glass-panel" style={{ padding: '22px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Table size={18} color="var(--accent-emerald)" /> Live Ausführungsergebnis ({windowResult.data.length} Datensätze)
          </h3>
          <span className="badge badge-primary">
            OVER ({partitionBy === 'department' ? 'PARTITION BY department ' : ''}ORDER BY {orderBy} {direction})
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Abteilung</th>
              <th style={{ padding: '10px' }}>Gehalt</th>
              <th style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.08)' }}>ROW_NUMBER()</th>
              <th style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.08)' }}>RANK()</th>
              <th style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)' }}>DENSE_RANK()</th>
              <th style={{ padding: '10px' }}>NTILE({ntile})</th>
              <th style={{ padding: '10px' }}>LAG()</th>
              <th style={{ padding: '10px' }}>LEAD()</th>
              <th style={{ padding: '10px', fontWeight: 'bold' }}>Running Total</th>
            </tr>
          </thead>
          <tbody>
            {windowResult.data.map((r, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.name}</td>
                <td style={{ padding: '10px' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>{r.department}</span>
                </td>
                <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {r.salary.toLocaleString('de-DE')} €
                </td>
                <td style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.04)', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  #{r.row_number}
                </td>
                <td style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.04)', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                  {r.rank}
                </td>
                <td style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.04)', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-amber)' }}>
                  {r.dense_rank}
                </td>
                <td style={{ padding: '10px', fontFamily: 'monospace' }}>
                  Bucket {r.ntile}
                </td>
                <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {r.lag_val !== null ? `${Number(r.lag_val).toLocaleString('de-DE')} €` : '—'}
                </td>
                <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {r.lead_val !== null ? `${Number(r.lead_val).toLocaleString('de-DE')} €` : '—'}
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                  {r.running_total.toLocaleString('de-DE')} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SQL Code Box */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="var(--accent-primary)" /> ANSI SQL Syntax Generator
          </h3>
          <button onClick={copySql} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {copiedSql ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedSql ? 'Kopiert!' : 'SQL Kopieren'}
          </button>
        </div>

        <pre style={{
          background: 'var(--bg-tertiary)',
          padding: '18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          fontFamily: 'monospace',
          lineHeight: 1.6,
          overflowX: 'auto',
          border: '1px solid var(--border-color)'
        }}>
          {sqlQuery}
        </pre>
      </div>
    </div>
  );
}
