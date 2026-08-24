import React, { useState } from 'react';
import alasql from 'alasql';
import { Database, Play, CheckCircle2, Sparkles, HelpCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

const INITIAL_USERS = [
  { id: 1, name: 'Alice (Admin)', role: 'DevOps' },
  { id: 2, name: 'Bob', role: 'Developer' },
  { id: 3, name: 'Charlie', role: 'Designer' },
  { id: 4, name: 'Diana', role: 'Product Owner' }
];

const INITIAL_ORDERS = [
  { order_id: 101, user_id: 1, product: 'MacBook Pro M3', amount: 2499 },
  { order_id: 102, user_id: 1, product: '4K Monitor', amount: 499 },
  { order_id: 103, user_id: 2, product: 'Mechanical Keyboard', amount: 150 },
  { order_id: 104, user_id: 5, product: 'Ergonomic Desk', amount: 699 } // User 5 does not exist in users table
];

export default function SqlJoinVisualizerLab({ onRewardXP }) {
  const [joinType, setJoinType] = useState('INNER'); // 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'LEFT_ONLY'
  const [queryResult, setQueryResult] = useState([]);
  const [activeQuestIdx, setActiveQuestIdx] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  const quests = [
    {
      title: 'Quest 1: Finde alle aktiven Bestellungen mit Benutzername',
      targetJoin: 'INNER',
      hint: 'Ein INNER JOIN liefert nur Zeilen, die in beiden Tabellen vorkommen (Matching Users & Orders).'
    },
    {
      title: 'Quest 2: Finde ALLE Benutzer, egal ob sie bestellt haben oder nicht',
      targetJoin: 'LEFT',
      hint: 'Ein LEFT JOIN nimmt alle Benutzer aus der linken Tabelle und füllt fehlende Bestellungen mit NULL auf.'
    },
    {
      title: 'Quest 3: Finde verwaiste Bestellungen ohne gültigen Benutzer',
      targetJoin: 'RIGHT',
      hint: 'Ein RIGHT JOIN liefert alle Bestellungen, auch solche ohne existierende User-ID in der linken Tabelle.'
    }
  ];

  const getSqlQuery = (type) => {
    switch (type) {
      case 'INNER':
        return `SELECT u.id, u.name, o.order_id, o.product, o.amount
FROM Users u
INNER JOIN Orders o ON u.id = o.user_id;`;
      case 'LEFT':
        return `SELECT u.id, u.name, o.order_id, o.product, o.amount
FROM Users u
LEFT JOIN Orders o ON u.id = o.user_id;`;
      case 'RIGHT':
        return `SELECT u.id, u.name, o.order_id, o.product, o.amount
FROM Users u
RIGHT JOIN Orders o ON u.id = o.user_id;`;
      case 'FULL':
        return `SELECT u.id, u.name, o.order_id, o.product, o.amount
FROM Users u
OUTER JOIN Orders o ON u.id = o.user_id;`;
      case 'LEFT_ONLY':
        return `SELECT u.id, u.name, o.order_id, o.product
FROM Users u
LEFT JOIN Orders o ON u.id = o.user_id
WHERE o.order_id IS NULL;`;
      default:
        return '';
    }
  };

  const executeJoin = (type) => {
    setJoinType(type);
    try {
      // Execute in AlaSQL
      alasql('CREATE TABLE IF NOT EXISTS Users (id INT, name STRING, role STRING)');
      alasql('CREATE TABLE IF NOT EXISTS Orders (order_id INT, user_id INT, product STRING, amount INT)');
      alasql('DELETE FROM Users');
      alasql('DELETE FROM Orders');
      INITIAL_USERS.forEach(u => alasql('INSERT INTO Users VALUES (?, ?, ?)', [u.id, u.name, u.role]));
      INITIAL_ORDERS.forEach(o => alasql('INSERT INTO Orders VALUES (?, ?, ?, ?)', [o.order_id, o.user_id, o.product, o.amount]));

      let res = [];
      if (type === 'INNER') {
        res = alasql('SELECT u.id, u.name, o.order_id, o.product, o.amount FROM Users u INNER JOIN Orders o ON u.id = o.user_id');
      } else if (type === 'LEFT') {
        res = alasql('SELECT u.id, u.name, o.order_id, o.product, o.amount FROM Users u LEFT JOIN Orders o ON u.id = o.user_id');
      } else if (type === 'RIGHT') {
        res = alasql('SELECT u.id, u.name, o.order_id, o.product, o.amount FROM Users u RIGHT JOIN Orders o ON u.id = o.user_id');
      } else if (type === 'FULL') {
        res = alasql('SELECT u.id, u.name, o.order_id, o.product, o.amount FROM Users u OUTER JOIN Orders o ON u.id = o.user_id');
      } else if (type === 'LEFT_ONLY') {
        res = alasql('SELECT u.id, u.name, o.order_id, o.product, o.amount FROM Users u LEFT JOIN Orders o ON u.id = o.user_id WHERE o.order_id IS NULL');
      }
      setQueryResult(res);

      if (type === quests[activeQuestIdx].targetJoin) {
        setQuestSuccess(true);
        if (onRewardXP) onRewardXP(30);
      } else {
        setQuestSuccess(false);
      }
    } catch (e) {
      console.error('SQL Join Execution Error:', e);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} /> Relationale Datenbanken & SQL
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            📊 Visueller SQL JOIN & Venn-Diagramm Builder
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe relationale Tabellenverknüpfungen (INNER, LEFT, RIGHT, FULL OUTER) interaktiv mit In-Memory SQL.
          </p>
        </div>
      </div>

      {/* Quest Banner */}
      <div style={{ background: questSuccess ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', borderLeft: questSuccess ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: questSuccess ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: '700' }}>
              🎯 {quests[activeQuestIdx].title}
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {quests[activeQuestIdx].hint}
            </p>
          </div>
          {questSuccess && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (activeQuestIdx < quests.length - 1) {
                  setActiveQuestIdx(activeQuestIdx + 1);
                  setQuestSuccess(false);
                }
              }}
              style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
            >
              Nächste Quest &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Interactive Venn Diagram Visualizer & Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Venn Diagram Visualizer */}
        <div style={{ background: '#0f172a', padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Venn-Diagramm Visualisierung: <span style={{ color: '#38bdf8' }}>{joinType} JOIN</span>
          </h4>

          {/* SVG Venn Circles */}
          <svg width="280" height="150" viewBox="0 0 280 150">
            {/* Left Circle (Users) */}
            <circle
              cx="105"
              cy="75"
              r="60"
              fill={joinType === 'LEFT' || joinType === 'FULL' || joinType === 'LEFT_ONLY' ? '#38bdf8' : '#334155'}
              fillOpacity={joinType === 'LEFT_ONLY' ? '0.8' : '0.4'}
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Right Circle (Orders) */}
            <circle
              cx="175"
              cy="75"
              r="60"
              fill={joinType === 'RIGHT' || joinType === 'FULL' ? '#ec4899' : '#334155'}
              fillOpacity="0.4"
              stroke="#ec4899"
              strokeWidth="2"
            />
            {/* Overlap Area Highlight */}
            {(joinType === 'INNER' || joinType === 'LEFT' || joinType === 'RIGHT' || joinType === 'FULL') && (
              <path
                d="M 140,24 A 60,60 0 0,0 140,126 A 60,60 0 0,0 140,24"
                fill={joinType === 'INNER' ? '#10b981' : '#a855f7'}
                fillOpacity="0.8"
              />
            )}
            <text x="75" y="78" fill="#f8fafc" fontSize="13" fontWeight="bold">Users</text>
            <text x="180" y="78" fill="#f8fafc" fontSize="13" fontWeight="bold">Orders</text>
          </svg>
        </div>

        {/* Join Selection Buttons */}
        <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>
            Wähle den Verknüpfungstyp:
          </h4>
          {[
            { id: 'INNER', label: 'INNER JOIN (Schnittmenge)', desc: 'Nur passende Paare' },
            { id: 'LEFT', label: 'LEFT JOIN (Alle Users + Orders)', desc: 'Alle linken Datensätze' },
            { id: 'RIGHT', label: 'RIGHT JOIN (Alle Orders + Users)', desc: 'Alle rechten Datensätze' },
            { id: 'FULL', label: 'FULL OUTER JOIN (Gesamtmenge)', desc: 'Alle Zeilen beider Tabellen' },
            { id: 'LEFT_ONLY', label: 'LEFT JOIN WHERE right.id IS NULL', desc: 'Nur Users ohne Orders' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => executeJoin(btn.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: joinType === btn.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: joinType === btn.id ? '#ffffff' : 'var(--text-main)',
                border: joinType === btn.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <span>{btn.label}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{btn.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SQL Output & Live Result Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Generated SQL Statement */}
        <div style={{ background: '#0f172a', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Generiertes SQL Statement:
          </h4>
          <pre style={{ margin: 0, color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {getSqlQuery(joinType)}
          </pre>
        </div>

        {/* Live Result Grid */}
        <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
            Ergebnistabelle ({queryResult.length} Zeilen):
          </h4>
          {queryResult.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Klicke oben auf einen JOIN-Typ, um die Abfrage auszuführen.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>u.id</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>u.name</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>o.order_id</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>o.product</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>o.amount</th>
                </tr>
              </thead>
              <tbody>
                {queryResult.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 10px', color: row.id ? '#38bdf8' : '#64748b' }}>{row.id || 'NULL'}</td>
                    <td style={{ padding: '6px 10px', color: row.name ? '#f8fafc' : '#64748b' }}>{row.name || 'NULL'}</td>
                    <td style={{ padding: '6px 10px', color: row.order_id ? '#ec4899' : '#64748b' }}>{row.order_id || 'NULL'}</td>
                    <td style={{ padding: '6px 10px', color: row.product ? '#f8fafc' : '#64748b' }}>{row.product || 'NULL'}</td>
                    <td style={{ padding: '6px 10px', color: row.amount ? '#34d399' : '#64748b' }}>{row.amount ? `${row.amount} €` : 'NULL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
