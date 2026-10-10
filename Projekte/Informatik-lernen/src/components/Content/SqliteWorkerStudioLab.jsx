import React, { useState, useEffect } from 'react';
import { 
  Database, Play, Award, Check, Cpu, Zap 
} from 'lucide-react';
import { SqliteWorkerBridge } from '../../utils/sqliteWorkerBridge';
import { useStore } from '../../store/useStore';

export default function SqliteWorkerStudioLab() {
  const { awardXP } = useStore();
  const [bridge] = useState(() => new SqliteWorkerBridge());
  const [query, setQuery] = useState('SELECT c.name, c.city, o.id, o.total_amount FROM customers c JOIN orders o ON c.id = o.customer_id;');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [useWorker, setUseWorker] = useState(true);
  const [xpAwarded, setXpAwarded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    bridge.init('ecommerce').then(() => {
      if (isMounted) {
        bridge.executeQueryAsync('SELECT c.name, c.city, o.id, o.total_amount FROM customers c JOIN orders o ON c.id = o.customer_id;', true).then((r) => {
          if (isMounted) setResult(r);
        });
      }
    });

    return () => {
      isMounted = false;
      bridge.destroy();
    };
  }, [bridge]);

  const handleRunQuery = async () => {
    setLoading(true);
    const res = await bridge.executeQueryAsync(query, useWorker);
    setResult(res);
    setLoading(false);

    if (res.success && !xpAwarded) {
      setXpAwarded(true);
      awardXP(60, 'sqlite_worker_master');
    }
  };

  const handleBenchmark = async () => {
    setBenchmarkLoading(true);
    const res = await bridge.runHeavyBenchmark(500);
    setBenchmarkResult(res);
    setBenchmarkLoading(false);

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(60, 'sqlite_worker_master');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
          }}>
            <Database size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              SQLite Web Worker Sandbox (Zero-Jank Query Engine)
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Auslagerung rechenintensiver SQL-Abfragen & Benchmarks in einen Hintergrund-Thread
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpAwarded ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Check size={16} /> 60 XP erhalten!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Award size={16} /> 60 XP verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Editor & Controls */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#10b981" /> SQL Abfrage (Im Worker-Thread ausgeführt)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Worker Offloading:</span>
            <button
              onClick={() => setUseWorker(!useWorker)}
              style={{
                background: useWorker ? '#10b981' : '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {useWorker ? '⚡ Aktiviert' : 'Deaktiviert (Main Thread)'}
            </button>
          </div>
        </div>

        <textarea 
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            resize: 'vertical',
            marginBottom: '16px'
          }}
        />

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRunQuery}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#10b981',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <Play size={16} /> {loading ? 'Ausführen...' : 'Query im Worker ausführen'}
          </button>

          <button
            onClick={handleBenchmark}
            disabled={benchmarkLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <Zap size={16} /> {benchmarkLoading ? 'Benchmarking...' : '500-Rows Aggregation Benchmark'}
          </button>
        </div>
      </div>

      {/* Benchmark Summary Badge */}
      {benchmarkResult && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem'
        }}>
          <span>🚀 <strong>Benchmark beendet:</strong> {benchmarkResult.rowCount} Datensätze generiert & aggregiert</span>
          <span style={{ color: '#3b82f6', fontWeight: 700 }}>{benchmarkResult.durationMs} ms (Zero Frame Jank)</span>
        </div>
      )}

      {/* Results View */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            Ergebnis {result ? `(${result.rows?.length || 0} Zeilen in ${result.executionTimeMs} ms)` : ''}
          </h2>
          {result?.workerThread && (
            <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Thread: Dedicated Worker
            </span>
          )}
        </div>

        {result?.success ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.3)', textAlign: 'left' }}>
                  {(result.columns || []).map((c) => (
                    <th key={c} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#10b981' }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(result.rows || []).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {(result.columns || []).map((c) => (
                      <td key={c} style={{ padding: '8px 12px' }}>
                        {String(r[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : result?.error ? (
          <div style={{ color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {result.error}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Keine Daten vorhanden. Klicke auf "Query im Worker ausführen".
          </div>
        )}
      </div>
    </div>
  );
}
