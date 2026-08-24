import React, { useState } from 'react';
import { Database, Search, Zap, CheckCircle2 } from 'lucide-react';

export default function SqlQueryOptimizerLab({ onRewardXP }) {
  const [hasIndexOnEmail, setHasIndexOnEmail] = useState(false);
  const [hasIndexOnStatus, setHasIndexOnStatus] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState('user_lookup');
  const [completedQuest, setCompletedQuest] = useState(false);

  const queries = {
    user_lookup: {
      title: 'Query 1: Suche nach E-Mail-Adresse',
      sql: "SELECT id, name, role FROM users WHERE email = 'max.mustermann@firma.de';",
      tableSize: '500.000 Datensätze (Rows)',
      unindexed: {
        planType: 'Sequential Scan (Full Table Scan)',
        scannedRows: 500000,
        costPoints: 9450,
        execTimeMs: 142.5,
        desc: 'Die Datenbank liest jeden einzelnen Plattenblock (Page) sequentiell von der Festplatte ein.'
      },
      indexed: {
        planType: 'Index Scan (B-Tree Index Seek on idx_users_email)',
        scannedRows: 1,
        costPoints: 4,
        execTimeMs: 0.8,
        desc: 'Logarithmische Suche im B-Tree (Tiefe 3). Direkter Pointer-Sprung auf den Datensatz.'
      },
      requiredIndex: 'email'
    },
    status_filter: {
      title: 'Query 2: Filter nach aktivem Status & Sortierung',
      sql: "SELECT * FROM orders WHERE status = 'SHIPPED' ORDER BY created_at DESC LIMIT 20;",
      tableSize: '1.200.000 Datensätze (Rows)',
      unindexed: {
        planType: 'Seq Scan + External Disk Sort (Sort Space Overflow)',
        scannedRows: 1200000,
        costPoints: 24800,
        execTimeMs: 380.2,
        desc: 'Voller Tabellenscan plus teures Sortieren im RAM/Temp-Speicher.'
      },
      indexed: {
        planType: 'Bitmap Index Scan on idx_orders_status (Index Only Scan)',
        scannedRows: 20,
        costPoints: 12,
        execTimeMs: 2.1,
        desc: 'Filterung und Sortierung werden direkt über den B-Tree Index abgewickelt.'
      },
      requiredIndex: 'status'
    }
  };

  const currentQueryData = queries[selectedQuery];
  const isOptimal = (selectedQuery === 'user_lookup' && hasIndexOnEmail) || (selectedQuery === 'status_filter' && hasIndexOnStatus);
  const activeStats = isOptimal ? currentQueryData.indexed : currentQueryData.unindexed;

  const handleToggleIndex = (type) => {
    if (type === 'email') setHasIndexOnEmail(!hasIndexOnEmail);
    if (type === 'status') setHasIndexOnStatus(!hasIndexOnStatus);

    if (!completedQuest && ((type === 'email' && !hasIndexOnEmail) || (type === 'status' && !hasIndexOnStatus))) {
      setCompletedQuest(true);
      if (onRewardXP) onRewardXP(40);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Database size={14} /> Relationale Datenbanken & Performance
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            ⚡ SQL Query Optimizer & EXPLAIN ANALYZE Lab
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Verstehe Abfragepläne (Execution Plans), B-Tree Indizes, Full Table Scans und I/O-Kosten.
          </p>
        </div>
      </div>

      {/* Query Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setSelectedQuery('user_lookup')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            background: selectedQuery === 'user_lookup' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: selectedQuery === 'user_lookup' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          🔍 E-Mail Suche (500k Rows)
        </button>

        <button
          onClick={() => setSelectedQuery('status_filter')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            background: selectedQuery === 'status_filter' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: selectedQuery === 'status_filter' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          📦 Bestellungen Filter & Sort (1.2 Mio Rows)
        </button>
      </div>

      {/* SQL Statement Preview */}
      <div style={{ background: '#0b0f19', padding: '16px 20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>SQL STATEMENT &amp; TABELLENGRÖSSE:</span>
          <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700 }}>{currentQueryData.tableSize}</span>
        </div>
        <code style={{ color: '#38bdf8', fontSize: '0.98rem', fontFamily: 'monospace', fontWeight: 600 }}>
          {currentQueryData.sql}
        </code>
      </div>

      {/* Index Toggle Bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Datenbank-Indizes schalten (Schema DDL)</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Erstelle oder lösche B-Tree Indizes, um den Abfrageplan in Echtzeit zu verändern.</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleToggleIndex('email')}
            className="btn btn-sm"
            style={{
              background: hasIndexOnEmail ? '#10b981' : 'var(--bg-card)',
              color: hasIndexOnEmail ? '#fff' : 'var(--text-main)',
              border: hasIndexOnEmail ? '1px solid #10b981' : '1px solid var(--border-color)',
              fontWeight: 700
            }}
          >
            {hasIndexOnEmail ? '✓ Index aktiv: idx_users_email' : '+ Index anlegen: ON users(email)'}
          </button>

          <button
            onClick={() => handleToggleIndex('status')}
            className="btn btn-sm"
            style={{
              background: hasIndexOnStatus ? '#10b981' : 'var(--bg-card)',
              color: hasIndexOnStatus ? '#fff' : 'var(--text-main)',
              border: hasIndexOnStatus ? '1px solid #10b981' : '1px solid var(--border-color)',
              fontWeight: 700
            }}
          >
            {hasIndexOnStatus ? '✓ Index aktiv: idx_orders_status' : '+ Index anlegen: ON orders(status)'}
          </button>
        </div>
      </div>

      {/* EXPLAIN Execution Plan Comparison Card */}
      <div style={{ 
        background: isOptimal ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
        border: `2px solid ${isOptimal ? '#10b981' : '#ef4444'}`, 
        borderRadius: '16px', 
        padding: '24px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: isOptimal ? '#10b981' : '#ef4444' }}>
              {isOptimal ? '🚀 HOCHGRADIG OPTIMIERT (INDEX SEEK)' : '⚠️ UNOPTIMIERT (FULL TABLE SCAN)'}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {activeStats.planType}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GESCHÄTZTE KOSTEN</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isOptimal ? '#10b981' : '#ef4444' }}>
                {activeStats.costPoints} Cost-Units
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AUSFÜHRUNGSZEIT</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isOptimal ? '#10b981' : '#ef4444' }}>
                {activeStats.execTimeMs} ms
              </div>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
          {activeStats.desc}
        </p>

        {/* Tree Flow Representation */}
        <div style={{ marginTop: '20px', background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          <div style={{ color: '#94a3b8', marginBottom: '6px' }}>EXPLAIN (ANALYZE, BUFFERS, COSTS) OUTPUT:</div>
          <div style={{ color: isOptimal ? '#34d399' : '#f87171' }}>
            -&gt; {activeStats.planType} (cost=0.00..{activeStats.costPoints} rows={activeStats.scannedRows} width=48) (actual time={activeStats.execTimeMs}ms)
          </div>
          <div style={{ color: '#64748b', paddingLeft: '16px' }}>
            Buffers: shared hit={isOptimal ? 4 : 8420} read={isOptimal ? 0 : 2100}
          </div>
          <div style={{ color: '#38bdf8', paddingLeft: '16px' }}>
            Planning Time: 0.12 ms | Execution Time: {activeStats.execTimeMs} ms
          </div>
        </div>
      </div>
    </div>
  );
}
